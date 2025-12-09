import { Router, Request, Response } from "express";
import { rbacService, requirePermission, requireRole, ROLE_HIERARCHY, UserRole } from "../services/rbac-service";
import { auditLoggingService } from "../services/audit-logging-service";

const router = Router();

router.get("/roles", (req: Request, res: Response) => {
  const roles = rbacService.getRoleDefinitions();
  res.json({
    success: true,
    roles: roles.map(r => ({
      name: r.name,
      displayName: r.displayName,
      description: r.description,
      level: r.level,
      permissionCount: r.permissions.length,
    })),
  });
});

router.get("/roles/:role/permissions", (req: Request, res: Response) => {
  const { role } = req.params;
  
  if (!ROLE_HIERARCHY[role as UserRole]) {
    return res.status(404).json({
      success: false,
      error: "Role not found",
    });
  }

  const permissions = rbacService.getResourcePermissions(role as UserRole);
  res.json({
    success: true,
    role,
    permissions,
  });
});

router.get("/my-permissions", (req: Request, res: Response) => {
  const userRole = ((req as any).user?.role || "viewer") as UserRole;
  const permissions = rbacService.getResourcePermissions(userRole);
  
  res.json({
    success: true,
    role: userRole,
    roleDisplayName: ROLE_HIERARCHY[userRole]?.displayName || "Unknown",
    level: rbacService.getRoleLevel(userRole),
    permissions,
  });
});

router.post("/check-permission", (req: Request, res: Response) => {
  const { resource, action } = req.body;
  const userRole = ((req as any).user?.role || "viewer") as UserRole;
  
  if (!resource || !action) {
    return res.status(400).json({
      success: false,
      error: "Resource and action are required",
    });
  }

  const hasPermission = rbacService.hasPermission(userRole, resource, action);
  
  res.json({
    success: true,
    hasPermission,
    role: userRole,
    resource,
    action,
  });
});

router.put("/users/:userId/role", requireRole("admin", "manager"), async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body;
  const adminId = (req as any).user?.id;
  
  if (!role || !ROLE_HIERARCHY[role as UserRole]) {
    return res.status(400).json({
      success: false,
      error: "Invalid role",
      validRoles: Object.keys(ROLE_HIERARCHY),
    });
  }

  const oldRole = await rbacService.getUserRole(userId);
  const success = await rbacService.setUserRole(userId, role as UserRole, adminId);
  
  if (success) {
    await auditLoggingService.logRoleChange(userId, oldRole, role, adminId);
    res.json({
      success: true,
      message: `User role updated to ${role}`,
    });
  } else {
    res.status(403).json({
      success: false,
      error: "Cannot assign this role - insufficient permissions",
    });
  }
});

router.get("/audit-logs", requireRole("admin"), (req: Request, res: Response) => {
  const { limit = 100, eventType, userId, severity, startDate, endDate } = req.query;
  
  const logs = auditLoggingService.getRecentLogs(Number(limit), {
    eventType: eventType as any,
    userId: userId as string,
    severity: severity as any,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });

  res.json({
    success: true,
    count: logs.length,
    logs,
  });
});

router.get("/audit-stats", requireRole("admin", "manager"), (req: Request, res: Response) => {
  const stats = auditLoggingService.getStatistics();
  
  res.json({
    success: true,
    statistics: stats,
  });
});

router.get("/summary", (req: Request, res: Response) => {
  const roles = Object.values(ROLE_HIERARCHY);
  const stats = auditLoggingService.getStatistics();
  
  res.json({
    success: true,
    summary: {
      roles: {
        total: roles.length,
        list: roles.map(r => r.name),
      },
      permissions: {
        resources: [...new Set(roles.flatMap(r => r.permissions.map(p => p.resource)))],
        actions: ["create", "read", "update", "delete", "execute", "manage"],
      },
      auditLogs: {
        total: stats.total,
        recentErrors: stats.recentErrors,
        avgDuration: Math.round(stats.avgDuration),
      },
    },
  });
});

export default router;
