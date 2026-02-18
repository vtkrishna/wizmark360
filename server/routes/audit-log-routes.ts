import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../auth/local-auth';

const router = Router();

router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    if (!['admin', 'manager'].includes(user.role)) {
      return res.status(403).json({ error: 'Only admins and managers can view audit logs' });
    }

    const { page = '1', limit = '50', action, userId, startDate, endDate } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);

    const { auditLoggingService } = await import('../services/audit-logging-service');

    let logs = auditLoggingService.getRecentLogs ? auditLoggingService.getRecentLogs(500) : [];

    if (action) {
      logs = logs.filter((log: any) => log.action?.includes(action as string));
    }
    if (userId) {
      logs = logs.filter((log: any) => log.userId === userId);
    }
    if (startDate) {
      const start = new Date(startDate as string);
      logs = logs.filter((log: any) => new Date(log.timestamp) >= start);
    }
    if (endDate) {
      const end = new Date(endDate as string);
      logs = logs.filter((log: any) => new Date(log.timestamp) <= end);
    }

    const total = logs.length;
    const offset = (pageNum - 1) * limitNum;
    const paginatedLogs = logs.slice(offset, offset + limitNum);

    res.json({
      logs: paginatedLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
