import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export type UserRole = "admin" | "manager" | "user" | "viewer";

export interface Permission {
  resource: string;
  actions: ("create" | "read" | "update" | "delete" | "execute" | "manage")[];
}

export interface RoleDefinition {
  name: UserRole;
  displayName: string;
  description: string;
  level: number;
  permissions: Permission[];
  inheritsFrom?: UserRole;
}

export const ROLE_HIERARCHY: Record<UserRole, RoleDefinition> = {
  admin: {
    name: "admin",
    displayName: "Administrator",
    description: "Full system access with all permissions",
    level: 100,
    permissions: [
      { resource: "*", actions: ["create", "read", "update", "delete", "execute", "manage"] },
      { resource: "users", actions: ["create", "read", "update", "delete", "manage"] },
      { resource: "brands", actions: ["create", "read", "update", "delete", "manage"] },
      { resource: "agents", actions: ["create", "read", "update", "delete", "execute", "manage"] },
      { resource: "campaigns", actions: ["create", "read", "update", "delete", "execute", "manage"] },
      { resource: "analytics", actions: ["read", "manage"] },
      { resource: "llm_config", actions: ["create", "read", "update", "delete", "manage"] },
      { resource: "audit_logs", actions: ["read", "manage"] },
      { resource: "settings", actions: ["read", "update", "manage"] },
      { resource: "verticals", actions: ["create", "read", "update", "delete", "execute", "manage"] },
      { resource: "workflows", actions: ["create", "read", "update", "delete", "execute", "manage"] },
    ],
  },
  manager: {
    name: "manager",
    displayName: "Manager",
    description: "Team and campaign management with limited admin access",
    level: 75,
    permissions: [
      { resource: "users", actions: ["read", "update"] },
      { resource: "brands", actions: ["read", "update"] },
      { resource: "agents", actions: ["read", "execute"] },
      { resource: "campaigns", actions: ["create", "read", "update", "delete", "execute"] },
      { resource: "analytics", actions: ["read"] },
      { resource: "llm_config", actions: ["read"] },
      { resource: "settings", actions: ["read"] },
      { resource: "verticals", actions: ["read", "execute"] },
      { resource: "workflows", actions: ["create", "read", "update", "execute"] },
    ],
    inheritsFrom: "user",
  },
  user: {
    name: "user",
    displayName: "User",
    description: "Standard user with content creation and execution access",
    level: 50,
    permissions: [
      { resource: "brands", actions: ["read"] },
      { resource: "agents", actions: ["read", "execute"] },
      { resource: "campaigns", actions: ["create", "read", "update", "execute"] },
      { resource: "analytics", actions: ["read"] },
      { resource: "verticals", actions: ["read", "execute"] },
      { resource: "workflows", actions: ["read", "execute"] },
    ],
    inheritsFrom: "viewer",
  },
  viewer: {
    name: "viewer",
    displayName: "Viewer",
    description: "Read-only access to dashboards and reports",
    level: 25,
    permissions: [
      { resource: "brands", actions: ["read"] },
      { resource: "campaigns", actions: ["read"] },
      { resource: "analytics", actions: ["read"] },
      { resource: "verticals", actions: ["read"] },
    ],
  },
};

export interface RBACContext {
  userId: string;
  role: UserRole;
  brandId?: number;
  organizationId?: number;
}

class RBACService {
  private getAllPermissions(role: UserRole): Permission[] {
    const roleDefinition = ROLE_HIERARCHY[role];
    if (!roleDefinition) return [];

    const permissions = [...roleDefinition.permissions];
    
    if (roleDefinition.inheritsFrom) {
      const inheritedPermissions = this.getAllPermissions(roleDefinition.inheritsFrom);
      permissions.push(...inheritedPermissions);
    }

    return permissions;
  }

  hasPermission(
    role: UserRole,
    resource: string,
    action: "create" | "read" | "update" | "delete" | "execute" | "manage"
  ): boolean {
    const permissions = this.getAllPermissions(role);
    
    return permissions.some((p) => {
      const resourceMatch = p.resource === "*" || p.resource === resource;
      const actionMatch = p.actions.includes(action) || p.actions.includes("manage");
      return resourceMatch && actionMatch;
    });
  }

  canAccessResource(context: RBACContext, resource: string, action: "create" | "read" | "update" | "delete" | "execute" | "manage"): boolean {
    return this.hasPermission(context.role, resource, action);
  }

  getRoleLevel(role: UserRole): number {
    return ROLE_HIERARCHY[role]?.level || 0;
  }

  isRoleHigherOrEqual(role1: UserRole, role2: UserRole): boolean {
    return this.getRoleLevel(role1) >= this.getRoleLevel(role2);
  }

  canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
    return this.getRoleLevel(managerRole) > this.getRoleLevel(targetRole);
  }

  async getUserRole(userId: string): Promise<UserRole> {
    try {
      const user = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
      if (user.length > 0 && user[0].role) {
        const role = user[0].role as UserRole;
        if (ROLE_HIERARCHY[role]) {
          return role;
        }
      }
      return "user";
    } catch {
      return "user";
    }
  }

  async setUserRole(userId: string, role: UserRole, adminId: string): Promise<boolean> {
    try {
      const adminRole = await this.getUserRole(adminId);
      if (!this.canManageRole(adminRole, role)) {
        return false;
      }

      await db.update(users).set({ role }).where(eq(users.id, userId));
      return true;
    } catch {
      return false;
    }
  }

  getRoleDefinitions(): RoleDefinition[] {
    return Object.values(ROLE_HIERARCHY);
  }

  getResourcePermissions(role: UserRole): Record<string, string[]> {
    const permissions = this.getAllPermissions(role);
    const result: Record<string, string[]> = {};

    for (const perm of permissions) {
      if (!result[perm.resource]) {
        result[perm.resource] = [];
      }
      result[perm.resource].push(...perm.actions);
    }

    for (const resource in result) {
      result[resource] = Array.from(new Set(result[resource]));
    }

    return result;
  }
}

export const rbacService = new RBACService();

export function requirePermission(resource: string, action: "create" | "read" | "update" | "delete" | "execute" | "manage") {
  return (req: any, res: any, next: any) => {
    const userRole = req.user?.role || "viewer";
    
    if (!rbacService.hasPermission(userRole as UserRole, resource, action)) {
      return res.status(403).json({
        success: false,
        error: "Permission denied",
        required: { resource, action },
        userRole,
      });
    }
    
    next();
  };
}

export function requireRole(...roles: UserRole[]) {
  return (req: any, res: any, next: any) => {
    const userRole = (req.user?.role || "viewer") as UserRole;
    
    if (!roles.includes(userRole) && !roles.some(r => rbacService.isRoleHigherOrEqual(userRole, r))) {
      return res.status(403).json({
        success: false,
        error: "Insufficient role",
        required: roles,
        userRole,
      });
    }
    
    next();
  };
}
