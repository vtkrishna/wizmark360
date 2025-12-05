import type { Request, Response, NextFunction, RequestHandler } from 'express';

export function initializeSentry(): void {
  const sentryDsn = process.env.SENTRY_DSN;
  
  if (sentryDsn) {
    console.log('🔍 Sentry DSN detected, but Sentry integration is disabled for Replit environment');
  }
}

export function sentryRequestHandler(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    next();
  };
}

export function sentryTracingHandler(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    next();
  };
}

export function sentryErrorHandler() {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    next(err);
  };
}
