/**
 * Enterprise Authentication System
 * Supports Google OAuth and Email/Password authentication
 */

import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage-enhanced';
import type { User, InsertUser } from '@shared/schema';

// JWT Configuration - SECURITY: Require JWT_SECRET from environment
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required for production security. Set JWT_SECRET before starting the server.');
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Google OAuth Configuration (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists with Google ID
    let user = await storage.getUserByGoogleId(profile.id);
    
    if (user) {
      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });
      return done(null, user);
    }

    // Check if user exists with same email
    const email = profile.emails?.[0]?.value;
    if (email) {
      user = await storage.getUserByEmail(email);
      if (user) {
        // Link Google account to existing user
        await storage.updateUser(user.id, { 
          googleId: profile.id,
          profileImage: profile.photos?.[0]?.value,
          lastLogin: new Date()
        });
        return done(null, user);
      }
    }

    // Create new user
    const newUser: InsertUser = {
      email: email || '',
      googleId: profile.id,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      profileImage: profile.photos?.[0]?.value,
      emailVerified: true,
      lastLogin: new Date(),
      role: 'developer',
      permissions: ["project.create", "project.read", "project.write"],
      preferences: {}
    };

    const createdUser = await storage.createUser(newUser);
    return done(null, createdUser);
  } catch (error) {
    return done(error as Error, undefined);
  }
  }));
} else {
  console.warn('Google OAuth not configured - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not provided');
}

// Passport serialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// JWT Helper Functions
export const generateToken = (user: User): string => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role,
      permissions: user.permissions 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ success: false, error: 'Invalid token' });
  }

  try {
    const user = await storage.getUser(decoded.id);
    if (!user || !user.isActive) {
      return res.status(403).json({ success: false, error: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Authentication error' });
  }
};

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const permissions = user.permissions as string[];
    if (!permissions.includes(permission) && user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (user.role !== role && user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Insufficient role' });
    }

    next();
  };
};

// Password Utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Email/Password Registration
export const registerUser = async (userData: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}): Promise<{ user: User; token: string }> => {
  // Check if user already exists
  const existingUser = await storage.getUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Create user
  const newUser: InsertUser = {
    email: userData.email,
    password: hashedPassword,
    firstName: userData.firstName,
    lastName: userData.lastName,
    username: userData.username,
    role: 'developer',
    permissions: ["project.create", "project.read", "project.write"],
    preferences: {},
    emailVerified: false,
    verificationToken: generateVerificationToken()
  };

  const user = await storage.createUser(newUser);
  const token = generateToken(user);

  return { user, token };
};

// Email/Password Login
export const loginUser = async (emailOrUsername: string, password: string): Promise<{ user: User; token: string }> => {
  // SECURITY: All authentication must go through database validation
  // No backdoors or test credentials allowed

  // Try to find user by email first, then by username if no email match
  let user = await storage.getUserByEmail(emailOrUsername);
  if (!user) {
    user = await storage.getUserByUsername(emailOrUsername);
  }
  
  if (!user) {
    throw new Error('Invalid username or password');
  }

  if (!user.password) {
    throw new Error('Please login with Google or reset your password');
  }

  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }

  // Update last login
  await storage.updateUser(user.id, { lastLogin: new Date() });

  const token = generateToken(user);
  return { user, token };
};

// Verification Token
const generateVerificationToken = (): string => {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
};

export { passport };