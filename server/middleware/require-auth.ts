import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

declare global {
  namespace Express {
    interface Request {
      organizationId?: number;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const user = req.user as any;

  if ((req.session as any).organizationId) {
    req.organizationId = (req.session as any).organizationId;
  } else {
    try {
      const [dbUser] = await db.select({ organizationId: users.organizationId }).from(users).where(eq(users.id, user.id)).limit(1);
      if (dbUser?.organizationId) {
        req.organizationId = dbUser.organizationId;
        (req.session as any).organizationId = dbUser.organizationId;
      }
    } catch (error) {
      console.error('Error fetching user org:', error);
    }
  }

  next();
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  const user = req.user as any;
  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};
