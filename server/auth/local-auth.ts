/**
 * Local Authentication (Username/Password + Google OAuth)
 * Replaces Replit authentication for broader accessibility
 */

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import type { Express, RequestHandler } from "express";
import { db } from "../db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again in 15 minutes' },
});

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "username", passwordField: "password" },
      async (username, password, done) => {
        try {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

          if (!user) {
            return done(null, false, { message: "Invalid username or password" });
          }

          if (!user.passwordHash) {
            return done(null, false, { message: "Please use social login" });
          }

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            return done(null, false, { message: "Invalid username or password" });
          }

          return done(null, {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (googleClientId && googleClientSecret) {
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 
      (process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/api/auth/google/callback`
        : 'http://localhost:5000/api/auth/google/callback');

    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: callbackUrl,
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("No email found in Google profile"));
            }

            let [existingUser] = await db
              .select()
              .from(users)
              .where(eq(users.email, email))
              .limit(1);

            if (existingUser) {
              if (!existingUser.googleId) {
                await db
                  .update(users)
                  .set({
                    googleId: profile.id,
                    avatarUrl: profile.photos?.[0]?.value,
                  })
                  .where(eq(users.id, existingUser.id));
              }
              return done(null, {
                id: existingUser.id,
                username: existingUser.username,
                email: existingUser.email,
                role: existingUser.role,
                avatarUrl: existingUser.avatarUrl || profile.photos?.[0]?.value,
              });
            }

            const [newUser] = await db
              .insert(users)
              .values({
                email,
                username: profile.displayName?.replace(/\s+/g, '_').toLowerCase() || email.split('@')[0],
                googleId: profile.id,
                avatarUrl: profile.photos?.[0]?.value,
                role: 'user',
              })
              .returning();

            return done(null, {
              id: newUser.id,
              username: newUser.username,
              email: newUser.email,
              role: newUser.role,
              avatarUrl: newUser.avatarUrl,
            });
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
    console.log("🔐 Google OAuth configured");
  } else {
    console.log("⚠️ Google OAuth not configured (missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET)");
  }

  passport.serializeUser((user: any, cb) => cb(null, user.id));
  passport.deserializeUser(async (id: string, cb) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id as any))
        .limit(1);
      
      if (!user) {
        return cb(new Error("User not found"));
      }
      
      cb(null, {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      });
    } catch (error) {
      cb(error);
    }
  });

  app.post("/api/login", authLimiter, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login error" });
        }
        return res.json({ 
          success: true, 
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
          }
        });
      });
    })(req, res, next);
  });

  app.post("/api/register", authLimiter, async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const [existingEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [newUser] = await db
        .insert(users)
        .values({
          username,
          email,
          passwordHash: hashedPassword,
          role: 'user',
        })
        .returning();

      req.logIn({ 
        id: newUser.id, 
        username: newUser.username, 
        email: newUser.email, 
        role: newUser.role,
        avatarUrl: newUser.avatarUrl,
      }, (err) => {
        if (err) {
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        return res.json({ 
          success: true, 
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
          }
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  if (googleClientId && googleClientSecret) {
    app.get("/api/auth/google", passport.authenticate("google", { 
      scope: ["profile", "email"] 
    }));

    app.get("/api/auth/google/callback",
      passport.authenticate("google", { 
        failureRedirect: "/login?error=google_auth_failed" 
      }),
      (req, res) => {
        res.redirect("/dashboard");
      }
    );
  }

  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout error" });
      }
      res.redirect("/");
    });
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout error" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    return res.status(401).json({ message: "Not authenticated" });
  });

  app.get("/api/auth/status", (req, res) => {
    res.json({
      authenticated: req.isAuthenticated(),
      user: req.isAuthenticated() ? req.user : null,
      googleOAuthEnabled: !!(googleClientId && googleClientSecret),
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export const requireRole = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = req.user as any;
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
};

export async function createAdminUser() {
  try {
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.username, "admin"))
      .limit(1);

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin1234", 10);
      await db.insert(users).values({
        username: "admin",
        email: "admin@wizardstech.com",
        passwordHash: hashedPassword,
        role: "admin",
      });
      console.log("✅ Admin user created (admin/admin1234)");
    } else {
      console.log("ℹ️ Admin user already exists");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

export function registerAuthRoutes() {
}
