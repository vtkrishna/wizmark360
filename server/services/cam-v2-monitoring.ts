/**
 * CAM 2.0 (Continuous Agent Monitoring) Service - WAI SDK v3.1
 * 
 * Real-time operation tracking, performance metrics, and cost analytics.
 * Features:
 * - Real-time operation tracking
 * - Performance metrics collection
 * - Cost analytics and budgeting
 * - Error rate monitoring
 * - Provider health status
 * - Agent utilization tracking
 * - Quality scoring
 * - Alerting and notifications
 */

export interface OperationMetric {
  id: string;
  operationType: 'llm_call' | 'agent_execution' | 'workflow_run' | 'tool_invocation' | 'memory_access';
  agentId?: string;
  workflowId?: string;
  provider?: string;
  model?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'pending' | 'success' | 'error' | 'timeout';
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  errorMessage?: string;
  qualityScore?: number;
  metadata?: Record<string, any>;
}

export interface AgentMetrics {
  agentId: string;
  agentName: string;
  totalExecutions: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  avgDuration: number;
  totalTokens: number;
  totalCost: number;
  avgQualityScore: number;
  lastExecution?: Date;
  trend: 'improving' | 'stable' | 'declining';
}

export interface ProviderMetrics {
  providerId: string;
  providerName: string;
  totalCalls: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  avgLatency: number;
  totalTokens: number;
  totalCost: number;
  healthScore: number;
  status: 'healthy' | 'degraded' | 'unavailable';
  lastCheck: Date;
}

export interface CostAnalytics {
  period: string;
  totalCost: number;
  costByProvider: Record<string, number>;
  costByAgent: Record<string, number>;
  costByModel: Record<string, number>;
  costByOperation: Record<string, number>;
  budget?: {
    limit: number;
    used: number;
    remaining: number;
    percentUsed: number;
  };
  projectedMonthlySpend: number;
  savingsFromOptimization: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  activeAgents: number;
  pendingOperations: number;
  errorRate: number;
  avgResponseTime: number;
  memoryUsage: number;
  providers: ProviderMetrics[];
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'error_spike' | 'cost_threshold' | 'latency_high' | 'provider_down' | 'quality_drop';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  data?: Record<string, any>;
}

export interface QualityMetric {
  operationId: string;
  scores: {
    accuracy: number;
    relevance: number;
    completeness: number;
    formatting: number;
    timeliness: number;
  };
  overallScore: number;
  feedback?: {
    source: 'auto' | 'human';
    helpful: boolean;
    comments?: string;
  };
}

class CAMv2MonitoringService {
  private operations: Map<string, OperationMetric> = new Map();
  private agentMetrics: Map<string, AgentMetrics> = new Map();
  private providerMetrics: Map<string, ProviderMetrics> = new Map();
  private alerts: Alert[] = [];
  private qualityMetrics: Map<string, QualityMetric> = new Map();
  
  private readonly MAX_OPERATIONS = 10000;
  private readonly ERROR_THRESHOLD = 0.1; // 10% error rate triggers alert
  private readonly LATENCY_THRESHOLD = 5000; // 5s latency threshold

  private startTime: Date = new Date();
  private costBudget: { daily: number; monthly: number } = { daily: 100, monthly: 3000 };

  constructor() {
    console.log('📊 CAM 2.0 Monitoring Service initialized');
    console.log('   Features: Real-time tracking, Cost analytics, Quality scoring');
    this.initializeProviders();
  }

  private initializeProviders(): void {
    const providers = [
      { id: 'openai', name: 'OpenAI' },
      { id: 'anthropic', name: 'Anthropic' },
      { id: 'google', name: 'Google AI' },
      { id: 'perplexity', name: 'Perplexity' },
      { id: 'groq', name: 'Groq' }
    ];

    for (const provider of providers) {
      this.providerMetrics.set(provider.id, {
        providerId: provider.id,
        providerName: provider.name,
        totalCalls: 0,
        successCount: 0,
        errorCount: 0,
        successRate: 100,
        avgLatency: 0,
        totalTokens: 0,
        totalCost: 0,
        healthScore: 100,
        status: 'healthy',
        lastCheck: new Date()
      });
    }
  }

  /**
   * Start tracking an operation
   */
  startOperation(
    type: OperationMetric['operationType'],
    options?: {
      agentId?: string;
      workflowId?: string;
      provider?: string;
      model?: string;
      metadata?: Record<string, any>;
    }
  ): string {
    const id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const operation: OperationMetric = {
      id,
      operationType: type,
      agentId: options?.agentId,
      workflowId: options?.workflowId,
      provider: options?.provider,
      model: options?.model,
      startTime: new Date(),
      status: 'pending',
      metadata: options?.metadata
    };

    this.operations.set(id, operation);
    this.pruneOldOperations();

    return id;
  }

  /**
   * Complete an operation with results
   */
  completeOperation(
    operationId: string,
    result: {
      success: boolean;
      inputTokens?: number;
      outputTokens?: number;
      cost?: number;
      errorMessage?: string;
      qualityScore?: number;
    }
  ): void {
    const operation = this.operations.get(operationId);
    if (!operation) return;

    operation.endTime = new Date();
    operation.duration = operation.endTime.getTime() - operation.startTime.getTime();
    operation.status = result.success ? 'success' : 'error';
    operation.inputTokens = result.inputTokens;
    operation.outputTokens = result.outputTokens;
    operation.cost = result.cost;
    operation.errorMessage = result.errorMessage;
    operation.qualityScore = result.qualityScore;

    // Update agent metrics
    if (operation.agentId) {
      this.updateAgentMetrics(operation);
    }

    // Update provider metrics
    if (operation.provider) {
      this.updateProviderMetrics(operation);
    }

    // Check for alerts
    this.checkAlertConditions(operation);
  }

  /**
   * Get real-time system health
   */
  getSystemHealth(): SystemHealth {
    const operations = Array.from(this.operations.values());
    const recentOps = operations.filter(op => 
      op.endTime && (Date.now() - op.endTime.getTime()) < 3600000 // Last hour
    );

    const errors = recentOps.filter(op => op.status === 'error').length;
    const errorRate = recentOps.length > 0 ? errors / recentOps.length : 0;
    const avgResponseTime = recentOps.length > 0
      ? recentOps.reduce((sum, op) => sum + (op.duration || 0), 0) / recentOps.length
      : 0;

    const providers = Array.from(this.providerMetrics.values());
    const healthyProviders = providers.filter(p => p.status === 'healthy').length;

    let status: SystemHealth['status'] = 'healthy';
    if (errorRate > 0.2 || healthyProviders < providers.length / 2) {
      status = 'critical';
    } else if (errorRate > 0.1 || healthyProviders < providers.length * 0.8) {
      status = 'degraded';
    }

    return {
      status,
      uptime: Date.now() - this.startTime.getTime(),
      activeAgents: this.agentMetrics.size,
      pendingOperations: operations.filter(op => op.status === 'pending').length,
      errorRate,
      avgResponseTime,
      memoryUsage: process.memoryUsage().heapUsed / (1024 * 1024),
      providers,
      alerts: this.alerts.filter(a => !a.acknowledged).slice(-10)
    };
  }

  /**
   * Get cost analytics for a period
   */
  getCostAnalytics(period: 'day' | 'week' | 'month' = 'day'): CostAnalytics {
    const now = Date.now();
    const periodMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    }[period];

    const periodStart = now - periodMs;
    const operations = Array.from(this.operations.values())
      .filter(op => op.startTime.getTime() >= periodStart && op.cost);

    const totalCost = operations.reduce((sum, op) => sum + (op.cost || 0), 0);

    const costByProvider: Record<string, number> = {};
    const costByAgent: Record<string, number> = {};
    const costByModel: Record<string, number> = {};
    const costByOperation: Record<string, number> = {};

    for (const op of operations) {
      if (op.provider) {
        costByProvider[op.provider] = (costByProvider[op.provider] || 0) + (op.cost || 0);
      }
      if (op.agentId) {
        costByAgent[op.agentId] = (costByAgent[op.agentId] || 0) + (op.cost || 0);
      }
      if (op.model) {
        costByModel[op.model] = (costByModel[op.model] || 0) + (op.cost || 0);
      }
      costByOperation[op.operationType] = (costByOperation[op.operationType] || 0) + (op.cost || 0);
    }

    const budgetLimit = period === 'day' ? this.costBudget.daily : this.costBudget.monthly;
    const daysInPeriod = periodMs / (24 * 60 * 60 * 1000);
    const dailyCost = totalCost / daysInPeriod;
    const projectedMonthlySpend = dailyCost * 30;

    return {
      period,
      totalCost,
      costByProvider,
      costByAgent,
      costByModel,
      costByOperation,
      budget: {
        limit: budgetLimit,
        used: totalCost,
        remaining: Math.max(0, budgetLimit - totalCost),
        percentUsed: (totalCost / budgetLimit) * 100
      },
      projectedMonthlySpend,
      savingsFromOptimization: projectedMonthlySpend * 0.15 // Estimated 15% savings potential
    };
  }

  /**
   * Get agent performance metrics
   */
  getAgentMetrics(agentId?: string): AgentMetrics[] {
    if (agentId) {
      const metrics = this.agentMetrics.get(agentId);
      return metrics ? [metrics] : [];
    }
    return Array.from(this.agentMetrics.values())
      .sort((a, b) => b.totalExecutions - a.totalExecutions);
  }

  /**
   * Get provider health metrics
   */
  getProviderMetrics(providerId?: string): ProviderMetrics[] {
    if (providerId) {
      const metrics = this.providerMetrics.get(providerId);
      return metrics ? [metrics] : [];
    }
    return Array.from(this.providerMetrics.values())
      .sort((a, b) => b.healthScore - a.healthScore);
  }

  /**
   * Record quality metric for an operation
   */
  recordQualityMetric(
    operationId: string,
    scores: QualityMetric['scores'],
    feedback?: QualityMetric['feedback']
  ): void {
    const overallScore = 
      (scores.accuracy * 0.3 + 
       scores.relevance * 0.25 + 
       scores.completeness * 0.2 + 
       scores.formatting * 0.15 + 
       scores.timeliness * 0.1);

    this.qualityMetrics.set(operationId, {
      operationId,
      scores,
      overallScore,
      feedback
    });

    // Update operation quality score
    const operation = this.operations.get(operationId);
    if (operation) {
      operation.qualityScore = overallScore;
    }
  }

  /**
   * Get quality trends
   */
  getQualityTrends(period: 'day' | 'week' | 'month' = 'week'): {
    avgOverall: number;
    byCategory: Record<string, number>;
    trend: 'improving' | 'stable' | 'declining';
    samples: number;
  } {
    const metrics = Array.from(this.qualityMetrics.values());
    if (metrics.length === 0) {
      return { avgOverall: 0, byCategory: {}, trend: 'stable', samples: 0 };
    }

    const avgOverall = metrics.reduce((sum, m) => sum + m.overallScore, 0) / metrics.length;
    const byCategory: Record<string, number> = {
      accuracy: metrics.reduce((sum, m) => sum + m.scores.accuracy, 0) / metrics.length,
      relevance: metrics.reduce((sum, m) => sum + m.scores.relevance, 0) / metrics.length,
      completeness: metrics.reduce((sum, m) => sum + m.scores.completeness, 0) / metrics.length,
      formatting: metrics.reduce((sum, m) => sum + m.scores.formatting, 0) / metrics.length,
      timeliness: metrics.reduce((sum, m) => sum + m.scores.timeliness, 0) / metrics.length
    };

    // Determine trend (simplified)
    const recentMetrics = metrics.slice(-10);
    const olderMetrics = metrics.slice(-20, -10);
    
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentMetrics.length > 0 && olderMetrics.length > 0) {
      const recentAvg = recentMetrics.reduce((sum, m) => sum + m.overallScore, 0) / recentMetrics.length;
      const olderAvg = olderMetrics.reduce((sum, m) => sum + m.overallScore, 0) / olderMetrics.length;
      
      if (recentAvg > olderAvg * 1.05) trend = 'improving';
      else if (recentAvg < olderAvg * 0.95) trend = 'declining';
    }

    return { avgOverall, byCategory, trend, samples: metrics.length };
  }

  /**
   * Get recent alerts
   */
  getAlerts(options?: { 
    severity?: Alert['severity']; 
    acknowledged?: boolean;
    limit?: number 
  }): Alert[] {
    let filtered = this.alerts;

    if (options?.severity) {
      filtered = filtered.filter(a => a.severity === options.severity);
    }
    if (options?.acknowledged !== undefined) {
      filtered = filtered.filter(a => a.acknowledged === options.acknowledged);
    }

    return filtered.slice(-(options?.limit || 50));
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Set cost budget
   */
  setCostBudget(daily: number, monthly: number): void {
    this.costBudget = { daily, monthly };
  }

  // Private helper methods

  private updateAgentMetrics(operation: OperationMetric): void {
    const agentId = operation.agentId!;
    let metrics = this.agentMetrics.get(agentId);

    if (!metrics) {
      metrics = {
        agentId,
        agentName: `Agent ${agentId}`,
        totalExecutions: 0,
        successCount: 0,
        errorCount: 0,
        successRate: 100,
        avgDuration: 0,
        totalTokens: 0,
        totalCost: 0,
        avgQualityScore: 0,
        trend: 'stable'
      };
    }

    metrics.totalExecutions++;
    if (operation.status === 'success') {
      metrics.successCount++;
    } else if (operation.status === 'error') {
      metrics.errorCount++;
    }
    metrics.successRate = (metrics.successCount / metrics.totalExecutions) * 100;
    metrics.avgDuration = (metrics.avgDuration * (metrics.totalExecutions - 1) + (operation.duration || 0)) / metrics.totalExecutions;
    metrics.totalTokens += (operation.inputTokens || 0) + (operation.outputTokens || 0);
    metrics.totalCost += operation.cost || 0;
    metrics.lastExecution = operation.endTime;

    if (operation.qualityScore) {
      const oldTotal = metrics.avgQualityScore * (metrics.totalExecutions - 1);
      metrics.avgQualityScore = (oldTotal + operation.qualityScore) / metrics.totalExecutions;
    }

    this.agentMetrics.set(agentId, metrics);
  }

  private updateProviderMetrics(operation: OperationMetric): void {
    const providerId = operation.provider!;
    const metrics = this.providerMetrics.get(providerId);
    if (!metrics) return;

    metrics.totalCalls++;
    if (operation.status === 'success') {
      metrics.successCount++;
    } else if (operation.status === 'error') {
      metrics.errorCount++;
    }
    metrics.successRate = (metrics.successCount / metrics.totalCalls) * 100;
    metrics.avgLatency = (metrics.avgLatency * (metrics.totalCalls - 1) + (operation.duration || 0)) / metrics.totalCalls;
    metrics.totalTokens += (operation.inputTokens || 0) + (operation.outputTokens || 0);
    metrics.totalCost += operation.cost || 0;
    metrics.lastCheck = new Date();

    // Update health score based on success rate and latency
    const latencyScore = Math.max(0, 100 - (metrics.avgLatency / 100));
    metrics.healthScore = (metrics.successRate * 0.7 + latencyScore * 0.3);

    if (metrics.healthScore >= 90) {
      metrics.status = 'healthy';
    } else if (metrics.healthScore >= 70) {
      metrics.status = 'degraded';
    } else {
      metrics.status = 'unavailable';
    }
  }

  private checkAlertConditions(operation: OperationMetric): void {
    // Check error rate
    const recentOps = Array.from(this.operations.values())
      .filter(op => op.endTime && (Date.now() - op.endTime.getTime()) < 300000); // Last 5 min
    const recentErrors = recentOps.filter(op => op.status === 'error').length;
    const errorRate = recentOps.length > 10 ? recentErrors / recentOps.length : 0;

    if (errorRate > this.ERROR_THRESHOLD) {
      this.createAlert('error_spike', 'warning', 
        `Error rate spike detected: ${(errorRate * 100).toFixed(1)}% in last 5 minutes`,
        { errorRate, threshold: this.ERROR_THRESHOLD }
      );
    }

    // Check latency
    if (operation.duration && operation.duration > this.LATENCY_THRESHOLD) {
      this.createAlert('latency_high', 'info',
        `High latency detected: ${operation.duration}ms for ${operation.operationType}`,
        { duration: operation.duration, operationId: operation.id }
      );
    }

    // Check cost budget
    const dailyCost = this.getCostAnalytics('day').totalCost;
    if (dailyCost > this.costBudget.daily * 0.8) {
      this.createAlert('cost_threshold', 'warning',
        `Daily cost approaching limit: $${dailyCost.toFixed(2)} of $${this.costBudget.daily} budget`,
        { currentCost: dailyCost, budget: this.costBudget.daily }
      );
    }
  }

  private createAlert(
    type: Alert['type'],
    severity: Alert['severity'],
    message: string,
    data?: Record<string, any>
  ): void {
    // Avoid duplicate alerts
    const recentSimilar = this.alerts.find(a => 
      a.type === type && 
      !a.acknowledged && 
      (Date.now() - a.timestamp.getTime()) < 300000 // Within 5 min
    );

    if (!recentSimilar) {
      this.alerts.push({
        id: `alert_${Date.now()}`,
        type,
        severity,
        message,
        timestamp: new Date(),
        acknowledged: false,
        data
      });
    }
  }

  private pruneOldOperations(): void {
    if (this.operations.size > this.MAX_OPERATIONS) {
      const sorted = Array.from(this.operations.entries())
        .sort((a, b) => a[1].startTime.getTime() - b[1].startTime.getTime());
      
      const toDelete = sorted.slice(0, this.operations.size - this.MAX_OPERATIONS);
      for (const [id] of toDelete) {
        this.operations.delete(id);
      }
    }
  }

  getHealth(): { status: 'healthy'; operationsTracked: number; alertsActive: number } {
    return {
      status: 'healthy',
      operationsTracked: this.operations.size,
      alertsActive: this.alerts.filter(a => !a.acknowledged).length
    };
  }
}

export const camV2MonitoringService = new CAMv2MonitoringService();
