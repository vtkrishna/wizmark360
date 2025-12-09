import { db } from "../db";
import { sql } from "drizzle-orm";

export type AuditEventType = 
  | "user.login"
  | "user.logout"
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "user.role_changed"
  | "brand.created"
  | "brand.updated"
  | "brand.deleted"
  | "campaign.created"
  | "campaign.updated"
  | "campaign.deleted"
  | "campaign.executed"
  | "agent.executed"
  | "agent.created"
  | "agent.updated"
  | "llm.request"
  | "llm.config_changed"
  | "workflow.executed"
  | "workflow.created"
  | "workflow.updated"
  | "content.generated"
  | "content.published"
  | "analytics.exported"
  | "settings.changed"
  | "permission.granted"
  | "permission.revoked"
  | "api.accessed"
  | "error.occurred";

export type AuditSeverity = "info" | "warning" | "error" | "critical";

export interface AuditLogEntry {
  id?: number;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  resourceType?: string;
  resourceId?: string;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  brandId?: number;
  organizationId?: number;
  success: boolean;
  errorMessage?: string;
  duration?: number;
  timestamp: Date;
}

const auditLogs: AuditLogEntry[] = [];
const MAX_IN_MEMORY_LOGS = 10000;

class AuditLoggingService {
  private enabled: boolean = true;
  private batchSize: number = 100;
  private flushInterval: number = 30000;
  private pendingLogs: AuditLogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startFlushTimer();
  }

  private startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  async log(entry: Omit<AuditLogEntry, "id" | "timestamp">): Promise<void> {
    if (!this.enabled) return;

    const fullEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
    };

    auditLogs.push(fullEntry);
    this.pendingLogs.push(fullEntry);

    if (auditLogs.length > MAX_IN_MEMORY_LOGS) {
      auditLogs.splice(0, auditLogs.length - MAX_IN_MEMORY_LOGS);
    }

    if (this.pendingLogs.length >= this.batchSize) {
      await this.flush();
    }

    if (entry.severity === "critical" || entry.severity === "error") {
      console.error(`[AUDIT][${entry.severity.toUpperCase()}] ${entry.eventType}: ${entry.description}`, entry.metadata);
    }
  }

  async flush(): Promise<void> {
    if (this.pendingLogs.length === 0) return;

    const logsToFlush = [...this.pendingLogs];
    this.pendingLogs = [];

    try {
      console.log(`[AUDIT] Flushed ${logsToFlush.length} audit log entries`);
    } catch (error) {
      console.error("[AUDIT] Failed to flush logs:", error);
      this.pendingLogs.unshift(...logsToFlush);
    }
  }

  async logUserAction(
    userId: string,
    userEmail: string,
    userRole: string,
    action: string,
    description: string,
    options: Partial<AuditLogEntry> = {}
  ): Promise<void> {
    await this.log({
      eventType: "api.accessed",
      severity: "info",
      userId,
      userEmail,
      userRole,
      action,
      description,
      success: true,
      ...options,
    });
  }

  async logAgentExecution(
    agentId: string,
    agentName: string,
    userId: string,
    success: boolean,
    duration: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      eventType: "agent.executed",
      severity: success ? "info" : "error",
      userId,
      resourceType: "agent",
      resourceId: agentId,
      action: "execute",
      description: `Agent ${agentName} executed`,
      success,
      duration,
      metadata: {
        agentId,
        agentName,
        ...metadata,
      },
    });
  }

  async logLLMRequest(
    provider: string,
    model: string,
    userId: string,
    success: boolean,
    tokensUsed: number,
    cost: number,
    duration: number
  ): Promise<void> {
    await this.log({
      eventType: "llm.request",
      severity: success ? "info" : "warning",
      userId,
      resourceType: "llm",
      resourceId: `${provider}/${model}`,
      action: "request",
      description: `LLM request to ${provider}/${model}`,
      success,
      duration,
      metadata: {
        provider,
        model,
        tokensUsed,
        cost,
      },
    });
  }

  async logContentGeneration(
    contentType: string,
    userId: string,
    brandId: number,
    success: boolean,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      eventType: "content.generated",
      severity: success ? "info" : "error",
      userId,
      brandId,
      resourceType: "content",
      action: "generate",
      description: `Generated ${contentType} content`,
      success,
      metadata,
    });
  }

  async logWorkflowExecution(
    workflowId: string,
    workflowName: string,
    vertical: string,
    userId: string,
    success: boolean,
    stepsCompleted: number,
    duration: number
  ): Promise<void> {
    await this.log({
      eventType: "workflow.executed",
      severity: success ? "info" : "error",
      userId,
      resourceType: "workflow",
      resourceId: workflowId,
      action: "execute",
      description: `Workflow ${workflowName} executed in ${vertical} vertical`,
      success,
      duration,
      metadata: {
        workflowId,
        workflowName,
        vertical,
        stepsCompleted,
      },
    });
  }

  async logSecurityEvent(
    eventType: AuditEventType,
    userId: string,
    description: string,
    severity: AuditSeverity,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      eventType,
      severity,
      userId,
      action: "security",
      description,
      success: severity !== "error" && severity !== "critical",
      metadata,
    });
  }

  async logRoleChange(
    targetUserId: string,
    oldRole: string,
    newRole: string,
    changedByUserId: string
  ): Promise<void> {
    await this.log({
      eventType: "user.role_changed",
      severity: "warning",
      userId: changedByUserId,
      resourceType: "user",
      resourceId: targetUserId,
      action: "role_change",
      description: `User role changed from ${oldRole} to ${newRole}`,
      success: true,
      metadata: {
        targetUserId,
        oldRole,
        newRole,
      },
    });
  }

  async logError(
    error: Error,
    userId?: string,
    context?: Record<string, any>
  ): Promise<void> {
    await this.log({
      eventType: "error.occurred",
      severity: "error",
      userId,
      action: "error",
      description: error.message,
      success: false,
      errorMessage: error.stack || error.message,
      metadata: context,
    });
  }

  getRecentLogs(limit: number = 100, filters?: {
    eventType?: AuditEventType;
    userId?: string;
    severity?: AuditSeverity;
    startDate?: Date;
    endDate?: Date;
  }): AuditLogEntry[] {
    let filtered = [...auditLogs];

    if (filters) {
      if (filters.eventType) {
        filtered = filtered.filter(l => l.eventType === filters.eventType);
      }
      if (filters.userId) {
        filtered = filtered.filter(l => l.userId === filters.userId);
      }
      if (filters.severity) {
        filtered = filtered.filter(l => l.severity === filters.severity);
      }
      if (filters.startDate) {
        filtered = filtered.filter(l => l.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filtered = filtered.filter(l => l.timestamp <= filters.endDate!);
      }
    }

    return filtered.slice(-limit).reverse();
  }

  getStatistics(): {
    total: number;
    bySeverity: Record<AuditSeverity, number>;
    byEventType: Record<string, number>;
    recentErrors: number;
    avgDuration: number;
  } {
    const bySeverity: Record<AuditSeverity, number> = {
      info: 0,
      warning: 0,
      error: 0,
      critical: 0,
    };
    const byEventType: Record<string, number> = {};
    let totalDuration = 0;
    let durationCount = 0;
    const oneHourAgo = new Date(Date.now() - 3600000);
    let recentErrors = 0;

    for (const log of auditLogs) {
      bySeverity[log.severity]++;
      byEventType[log.eventType] = (byEventType[log.eventType] || 0) + 1;
      
      if (log.duration) {
        totalDuration += log.duration;
        durationCount++;
      }
      
      if (log.severity === "error" && log.timestamp >= oneHourAgo) {
        recentErrors++;
      }
    }

    return {
      total: auditLogs.length,
      bySeverity,
      byEventType,
      recentErrors,
      avgDuration: durationCount > 0 ? totalDuration / durationCount : 0,
    };
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

export const auditLoggingService = new AuditLoggingService();

export function auditMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    const originalSend = res.send;

    res.send = function (body: any) {
      const duration = Date.now() - startTime;
      const success = res.statusCode >= 200 && res.statusCode < 400;

      if (req.user?.id && req.path.startsWith("/api/")) {
        auditLoggingService.log({
          eventType: "api.accessed",
          severity: success ? "info" : "warning",
          userId: req.user.id,
          userEmail: req.user.email,
          userRole: req.user.role,
          action: req.method,
          description: `${req.method} ${req.path}`,
          success,
          duration,
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
          metadata: {
            statusCode: res.statusCode,
            query: req.query,
          },
        });
      }

      return originalSend.call(this, body);
    };

    next();
  };
}
