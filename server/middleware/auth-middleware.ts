import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }
  next();
};

export const requireBrandAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }
  
  const { brandId } = req.params;
  if (brandId && brandId !== 'demo') {
    const user = req.user as any;
    if (!user?.claims?.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have access to this brand'
      });
    }
  }
  
  next();
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  next();
};
