/**
 * Advanced WAI Features - Phase 2 Implementation
 * Self-healing, intelligent routing, and auto-execution capabilities
 */

import { EventEmitter } from 'events';
import { WAIOrchestration3, WAIRequest, WAIResponse } from './unified-orchestration-client'

// Enhanced Types for Advanced Features
export interface IntelligentRoutingConfig {
  costThreshold: number;
  qualityThreshold: number;
  latencyThreshold: number;
  fallbackChain: string[];
  loadBalancingStrategy: 'round-robin' | 'least-connections' | 'weighted' | 'adaptive';
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  timeout: number;
  retryDelay: number;
  halfOpenRetryCount: number;
}

export interface AutoExecutionWorkflow {
  id: string;
  name: string;
  description: string;
  triggers: WorkflowTrigger[];
  steps: WorkflowStep[];
  conditions: WorkflowCondition[];
  parallelExecution: boolean;
  errorHandling: ErrorHandlingStrategy;
}

export interface WorkflowTrigger {
  type: 'webhook' | 'schedule' | 'file_change' | 'threshold' | 'event' | 'manual';
  config: any;
  active: boolean;
}

export interface WorkflowStep {
  id: string;
  type: 'agent_call' | 'condition' | 'loop' | 'parallel' | 'delay' | 'transform';
  config: any;
  dependencies: string[];
  timeout: number;
}

export interface WorkflowCondition {
  id: string;
  expression: string;
  trueStep: string;
  falseStep: string;
}

export interface ErrorHandlingStrategy {
  retryCount: number;
  retryDelay: number;
  fallbackStep?: string;
  alertChannels: string[];
}

export interface ProviderMetrics {
  cost: number;
  quality: number;
  latency: number;
  successRate: number;
  requestCount: number;
  errorCount: number;
  lastUsed: Date;
}

export interface LoadBalancerState {
  activeConnections: Map<string, number>;
  providerHealth: Map<string, boolean>;
  requestQueue: WAIRequest[];
  processingStats: Map<string, ProviderMetrics>;
}

/**
 * Advanced WAI Features Implementation
 */
export class AdvancedWAIFeatures extends EventEmitter {
  private orchestration: WAIOrchestration3;
  private circuitBreakers: Map<string, CircuitBreaker>;
  private intelligentRouter: IntelligentRouter;
  private autoExecutor: AutoExecutionEngine;
  private loadBalancer: LoadBalancer;
  private errorRecovery: ErrorRecoverySystem;
  private alerting: AlertingSystem;
  private analytics: AdvancedAnalytics;

  constructor(orchestration?: WAIOrchestration3) {
    super();
    this.orchestration = orchestration || new WAIOrchestration3();
    this.initializeAdvancedFeatures();
  }

  private initializeAdvancedFeatures(): void {
    // Initialize circuit breakers for all providers
    this.circuitBreakers = new Map();
    this.initializeCircuitBreakers();

    // Initialize intelligent routing
    this.intelligentRouter = new IntelligentRouter(this.orchestration);

    // Initialize auto-execution engine
    this.autoExecutor = new AutoExecutionEngine(this.orchestration);

    // Initialize load balancer
    this.loadBalancer = new LoadBalancer();

    // Initialize error recovery system
    this.errorRecovery = new ErrorRecoverySystem();

    // Initialize alerting system
    this.alerting = new AlertingSystem();

    // Initialize advanced analytics
    this.analytics = new AdvancedAnalytics();

    console.log('Advanced WAI Features initialized');
  }

  private initializeCircuitBreakers(): void {
    const providers = [
      'openai', 'anthropic', 'gemini', 'xai', 'perplexity', 
      'groq', 'qwen', 'together', 'manus', 'deepseek', 'ollama'
    ];

    providers.forEach(provider => {
      this.circuitBreakers.set(provider, new CircuitBreaker({
        failureThreshold: 5,
        timeout: 60000,
        retryDelay: 5000,
        halfOpenRetryCount: 3
      }));
    });
  }

  // Intelligent Routing Methods
  async routeRequest(request: WAIRequest): Promise<WAIResponse> {
    try {
      const optimalProvider = await this.intelligentRouter.selectOptimalProvider(request);
      const circuitBreaker = this.circuitBreakers.get(optimalProvider);

      if (circuitBreaker && circuitBreaker.isOpen()) {
        // Find fallback provider
        const fallbackProvider = await this.intelligentRouter.getFallbackProvider(optimalProvider);
        return this.executeWithProvider(request, fallbackProvider);
      }

      return this.executeWithProvider(request, optimalProvider);
    } catch (error) {
      return this.errorRecovery.handleError(request, error);
    }
  }

  private async executeWithProvider(request: WAIRequest, provider: string): Promise<WAIResponse> {
    const startTime = Date.now();
    
    try {
      const response = await this.orchestration.processRequest({
        ...request,
        metadata: { ...request.metadata, preferredProvider: provider }
      });

      // Update metrics
      this.analytics.recordSuccess(provider, Date.now() - startTime, response.metadata.cost);
      
      return response;
    } catch (error) {
      // Update failure metrics
      this.analytics.recordFailure(provider, Date.now() - startTime);
      
      // Trigger circuit breaker
      const circuitBreaker = this.circuitBreakers.get(provider);
      if (circuitBreaker) {
        circuitBreaker.recordFailure();
      }

      throw error;
    }
  }

  // Auto-Execution Engine Methods
  async createWorkflow(workflow: AutoExecutionWorkflow): Promise<string> {
    return this.autoExecutor.createWorkflow(workflow);
  }

  async executeWorkflow(workflowId: string, inputs: any): Promise<any> {
    return this.autoExecutor.executeWorkflow(workflowId, inputs);
  }

  async getWorkflowStatus(workflowId: string): Promise<any> {
    return this.autoExecutor.getWorkflowStatus(workflowId);
  }

  // Translation and Multilingual Support
  async translateContent(content: string, targetLanguage: string, options?: {
    sourceLanguage?: string;
    context?: string;
    formal?: boolean;
  }): Promise<string> {
    const request: WAIRequest = {
      id: `translate_${Date.now()}`,
      type: 'translation',
      operation: 'text_translation',
      payload: {
        content,
        targetLanguage,
        sourceLanguage: options?.sourceLanguage || 'auto',
        context: options?.context,
        formal: options?.formal || false
      },
      priority: 'medium'
    };

    const response = await this.routeRequest(request);
    return response.data.translatedText;
  }

  async detectLanguage(content: string): Promise<string> {
    const request: WAIRequest = {
      id: `detect_${Date.now()}`,
      type: 'translation',
      operation: 'language_detection',
      payload: { content },
      priority: 'low'
    };

    const response = await this.routeRequest(request);
    return response.data.language;
  }

  // Performance Optimization
  async optimizePerformance(): Promise<void> {
    // Load balancer optimization
    await this.loadBalancer.rebalance();

    // Cache optimization
    await this.analytics.optimizeCache();

    // Circuit breaker adjustment
    this.adjustCircuitBreakers();

    // Provider selection optimization
    await this.intelligentRouter.optimizeRouting();
  }

  private adjustCircuitBreakers(): void {
    this.circuitBreakers.forEach((breaker, provider) => {
      const metrics = this.analytics.getProviderMetrics(provider);
      if (metrics.successRate > 0.95) {
        breaker.reset();
      }
    });
  }

  // Health and Monitoring
  getHealthStatus(): any {
    return {
      circuitBreakers: Array.from(this.circuitBreakers.entries()).map(([provider, breaker]) => ({
        provider,
        state: breaker.getState(),
        failureCount: breaker.getFailureCount()
      })),
      loadBalancer: this.loadBalancer.getStats(),
      workflows: this.autoExecutor.getStats(),
      analytics: this.analytics.getSummary()
    };
  }

  // Alerting Methods
  async sendAlert(type: string, message: string, channels: string[]): Promise<void> {
    return this.alerting.sendAlert(type, message, channels);
  }

  // Analytics and Reporting
  getAnalytics(timeRange?: { start: Date; end: Date }): any {
    return this.analytics.getReport(timeRange);
  }

  getProviderMetrics(): Map<string, ProviderMetrics> {
    return this.analytics.getAllProviderMetrics();
  }
}

/**
 * Circuit Breaker Implementation
 */
class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private lastFailureTime?: Date;
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  isOpen(): boolean {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state = 'half-open';
        return false;
      }
      return true;
    }
    return false;
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'open';
    }
  }

  recordSuccess(): void {
    this.reset();
  }

  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.lastFailureTime = undefined;
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;
    return Date.now() - this.lastFailureTime.getTime() > this.config.timeout;
  }

  getState(): string {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }
}

/**
 * Intelligent Router Implementation
 */
class IntelligentRouter {
  private orchestration: WAIOrchestration3;
  private routingConfig: IntelligentRoutingConfig;
  private providerScores: Map<string, number> = new Map();

  constructor(orchestration: WAIOrchestration3) {
    this.orchestration = orchestration;
    this.routingConfig = {
      costThreshold: 0.05,
      qualityThreshold: 0.8,
      latencyThreshold: 2000,
      fallbackChain: ['openai', 'anthropic', 'gemini', 'xai'],
      loadBalancingStrategy: 'adaptive'
    };
  }

  async selectOptimalProvider(request: WAIRequest): Promise<string> {
    const providers = this.orchestration.getProviders();
    const scores = new Map<string, number>();

    for (const provider of providers) {
      const score = await this.calculateProviderScore(provider, request);
      scores.set(provider.name, score);
    }

    // Sort by score (higher is better)
    const sortedProviders = Array.from(scores.entries())
      .sort(([,a], [,b]) => b - a);

    return sortedProviders[0][0];
  }

  private async calculateProviderScore(provider: any, request: WAIRequest): Promise<number> {
    // Cost factor (lower cost = higher score)
    const costScore = Math.max(0, 1 - (provider.cost / this.routingConfig.costThreshold));
    
    // Quality factor
    const qualityScore = provider.quality || 0.8;
    
    // Latency factor (lower latency = higher score)
    const latencyScore = Math.max(0, 1 - (provider.avgLatency / this.routingConfig.latencyThreshold));
    
    // Availability factor
    const availabilityScore = provider.available ? 1 : 0;
    
    // Request type compatibility
    const compatibilityScore = this.checkCompatibility(provider, request);

    // Weighted average
    return (
      costScore * 0.25 +
      qualityScore * 0.30 +
      latencyScore * 0.25 +
      availabilityScore * 0.15 +
      compatibilityScore * 0.05
    );
  }

  private checkCompatibility(provider: any, request: WAIRequest): number {
    // Check if provider supports the request type
    const supportedTypes = provider.supportedTypes || ['text', 'multimodal'];
    return supportedTypes.includes(request.type) ? 1 : 0.5;
  }

  async getFallbackProvider(failedProvider: string): Promise<string> {
    const fallbackChain = this.routingConfig.fallbackChain.filter(p => p !== failedProvider);
    return fallbackChain[0] || 'openai';
  }

  async optimizeRouting(): Promise<void> {
    // ML-based routing optimization would go here
    // For now, update provider scores based on recent performance
    const providers = this.orchestration.getProviders();
    
    providers.forEach(provider => {
      const recentPerformance = this.getRecentPerformance(provider.name);
      this.providerScores.set(provider.name, recentPerformance);
    });
  }

  private getRecentPerformance(provider: string): number {
    // Simplified performance calculation
    return Math.random() * 0.4 + 0.6; // 0.6-1.0 range
  }
}

/**
 * Auto-Execution Engine Implementation
 */
class AutoExecutionEngine {
  private orchestration: WAIOrchestration3;
  private workflows: Map<string, AutoExecutionWorkflow> = new Map();
  private runningWorkflows: Map<string, WorkflowExecution> = new Map();
  private triggers: Map<string, NodeJS.Timeout> = new Map();

  constructor(orchestration: WAIOrchestration3) {
    this.orchestration = orchestration;
  }

  async createWorkflow(workflow: AutoExecutionWorkflow): Promise<string> {
    this.workflows.set(workflow.id, workflow);
    
    // Set up triggers
    workflow.triggers.forEach(trigger => {
      if (trigger.active) {
        this.setupTrigger(workflow.id, trigger);
      }
    });

    return workflow.id;
  }

  private setupTrigger(workflowId: string, trigger: WorkflowTrigger): void {
    switch (trigger.type) {
      case 'schedule':
        const interval = setInterval(() => {
          this.executeWorkflow(workflowId, {});
        }, trigger.config.interval);
        this.triggers.set(`${workflowId}_${trigger.type}`, interval);
        break;
      
      case 'webhook':
        // Webhook setup would integrate with Express routes
        break;
      
      case 'threshold':
        // Monitor threshold conditions
        break;
    }
  }

  async executeWorkflow(workflowId: string, inputs: any): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const execution = new WorkflowExecution(workflowId, workflow, inputs, this.orchestration);
    this.runningWorkflows.set(execution.id, execution);

    try {
      await execution.run();
      return execution;
    } catch (error) {
      execution.setError(error);
      throw error;
    }
  }

  async getWorkflowStatus(workflowId: string): Promise<any> {
    const executions = Array.from(this.runningWorkflows.values())
      .filter(exec => exec.workflowId === workflowId);

    return {
      workflow: this.workflows.get(workflowId),
      executions: executions.map(exec => exec.getStatus())
    };
  }

  getStats(): any {
    return {
      totalWorkflows: this.workflows.size,
      runningExecutions: this.runningWorkflows.size,
      triggers: this.triggers.size
    };
  }
}

/**
 * Workflow Execution Implementation
 */
class WorkflowExecution {
  public id: string;
  public workflowId: string;
  private workflow: AutoExecutionWorkflow;
  private inputs: any;
  private orchestration: WAIOrchestration3;
  private status: 'pending' | 'running' | 'completed' | 'failed' = 'pending';
  private results: Map<string, any> = new Map();
  private error?: Error;
  private startTime: Date;
  private endTime?: Date;

  constructor(workflowId: string, workflow: AutoExecutionWorkflow, inputs: any, orchestration: WAIOrchestration3) {
    this.id = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.workflowId = workflowId;
    this.workflow = workflow;
    this.inputs = inputs;
    this.orchestration = orchestration;
    this.startTime = new Date();
  }

  async run(): Promise<void> {
    this.status = 'running';

    try {
      if (this.workflow.parallelExecution) {
        await this.runParallel();
      } else {
        await this.runSequential();
      }
      
      this.status = 'completed';
      this.endTime = new Date();
    } catch (error) {
      this.setError(error);
      throw error;
    }
  }

  private async runSequential(): Promise<void> {
    for (const step of this.workflow.steps) {
      await this.executeStep(step);
    }
  }

  private async runParallel(): Promise<void> {
    const stepPromises = this.workflow.steps.map(step => this.executeStep(step));
    await Promise.all(stepPromises);
  }

  private async executeStep(step: WorkflowStep): Promise<any> {
    switch (step.type) {
      case 'agent_call':
        return this.executeAgentCall(step);
      
      case 'condition':
        return this.executeCondition(step);
      
      case 'delay':
        return this.executeDelay(step);
      
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  private async executeAgentCall(step: WorkflowStep): Promise<any> {
    const request: WAIRequest = {
      id: `${this.id}_${step.id}`,
      type: step.config.type || 'text',
      operation: step.config.operation,
      payload: { ...step.config.payload, ...this.inputs },
      priority: 'medium'
    };

    const response = await this.orchestration.processRequest(request);
    this.results.set(step.id, response.data);
    return response.data;
  }

  private async executeCondition(step: WorkflowStep): Promise<any> {
    // Evaluate condition expression
    const result = this.evaluateExpression(step.config.expression);
    this.results.set(step.id, result);
    return result;
  }

  private async executeDelay(step: WorkflowStep): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, step.config.duration));
  }

  private evaluateExpression(expression: string): any {
    // Simple expression evaluator (would be enhanced with proper parser)
    try {
      return eval(expression);
    } catch (error) {
      return false;
    }
  }

  setError(error: Error): void {
    this.status = 'failed';
    this.error = error;
    this.endTime = new Date();
  }

  getStatus(): any {
    return {
      id: this.id,
      workflowId: this.workflowId,
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.endTime ? this.endTime.getTime() - this.startTime.getTime() : null,
      results: Object.fromEntries(this.results),
      error: this.error?.message
    };
  }
}

/**
 * Load Balancer Implementation
 */
class LoadBalancer {
  private state: LoadBalancerState;

  constructor() {
    this.state = {
      activeConnections: new Map(),
      providerHealth: new Map(),
      requestQueue: [],
      processingStats: new Map()
    };
  }

  async rebalance(): Promise<void> {
    // Implement load balancing logic
    const providers = Array.from(this.state.activeConnections.keys());
    
    providers.forEach(provider => {
      const connections = this.state.activeConnections.get(provider) || 0;
      const health = this.state.providerHealth.get(provider) || false;
      
      if (!health && connections > 0) {
        // Redirect traffic from unhealthy provider
        this.redistributeLoad(provider);
      }
    });
  }

  private redistributeLoad(unhealthyProvider: string): void {
    const healthyProviders = Array.from(this.state.providerHealth.entries())
      .filter(([, health]) => health)
      .map(([provider]) => provider);

    if (healthyProviders.length > 0) {
      // Redistribute connections
      const connections = this.state.activeConnections.get(unhealthyProvider) || 0;
      const perProvider = Math.ceil(connections / healthyProviders.length);
      
      healthyProviders.forEach(provider => {
        const current = this.state.activeConnections.get(provider) || 0;
        this.state.activeConnections.set(provider, current + perProvider);
      });
      
      this.state.activeConnections.set(unhealthyProvider, 0);
    }
  }

  getStats(): any {
    return {
      activeConnections: Object.fromEntries(this.state.activeConnections),
      providerHealth: Object.fromEntries(this.state.providerHealth),
      queueLength: this.state.requestQueue.length
    };
  }
}

/**
 * Error Recovery System
 */
class ErrorRecoverySystem {
  private errorPatterns: Map<string, number> = new Map();
  private recoveryStrategies: Map<string, Function> = new Map();

  constructor() {
    this.initializeRecoveryStrategies();
  }

  private initializeRecoveryStrategies(): void {
    this.recoveryStrategies.set('rate_limit', this.handleRateLimit.bind(this));
    this.recoveryStrategies.set('timeout', this.handleTimeout.bind(this));
    this.recoveryStrategies.set('auth_error', this.handleAuthError.bind(this));
    this.recoveryStrategies.set('service_unavailable', this.handleServiceUnavailable.bind(this));
  }

  async handleError(request: WAIRequest, error: any): Promise<WAIResponse> {
    const errorType = this.classifyError(error);
    const strategy = this.recoveryStrategies.get(errorType);

    if (strategy) {
      return strategy(request, error);
    }

    // Default error response
    return {
      success: false,
      data: null,
      metadata: {
        requestId: request.id,
        processingTime: 0,
        cost: 0,
        provider: 'error_recovery',
        timestamp: new Date()
      },
      error: error.message
    };
  }

  private classifyError(error: any): string {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('rate limit')) return 'rate_limit';
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('unauthorized') || message.includes('auth')) return 'auth_error';
    if (message.includes('service unavailable')) return 'service_unavailable';
    
    return 'unknown';
  }

  private async handleRateLimit(request: WAIRequest, error: any): Promise<WAIResponse> {
    // Wait and retry with different provider
    await new Promise(resolve => setTimeout(resolve, 1000));
    throw new Error('Rate limit - retry with fallback provider');
  }

  private async handleTimeout(request: WAIRequest, error: any): Promise<WAIResponse> {
    // Retry with shorter timeout
    throw new Error('Timeout - retry with fallback provider');
  }

  private async handleAuthError(request: WAIRequest, error: any): Promise<WAIResponse> {
    // Switch to different provider
    throw new Error('Auth error - switch provider');
  }

  private async handleServiceUnavailable(request: WAIRequest, error: any): Promise<WAIResponse> {
    // Use fallback provider immediately
    throw new Error('Service unavailable - use fallback');
  }
}

/**
 * Alerting System
 */
class AlertingSystem {
  private channels: Map<string, Function> = new Map();

  constructor() {
    this.initializeChannels();
  }

  private initializeChannels(): void {
    this.channels.set('console', this.sendConsoleAlert.bind(this));
    this.channels.set('slack', this.sendSlackAlert.bind(this));
    this.channels.set('email', this.sendEmailAlert.bind(this));
    this.channels.set('webhook', this.sendWebhookAlert.bind(this));
  }

  async sendAlert(type: string, message: string, channels: string[]): Promise<void> {
    const promises = channels.map(channel => {
      const handler = this.channels.get(channel);
      return handler ? handler(type, message) : Promise.resolve();
    });

    await Promise.all(promises);
  }

  private async sendConsoleAlert(type: string, message: string): Promise<void> {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  private async sendSlackAlert(type: string, message: string): Promise<void> {
    // Slack integration would go here
    console.log(`[SLACK] ${type}: ${message}`);
  }

  private async sendEmailAlert(type: string, message: string): Promise<void> {
    // Email integration would go here
    console.log(`[EMAIL] ${type}: ${message}`);
  }

  private async sendWebhookAlert(type: string, message: string): Promise<void> {
    // Webhook integration would go here
    console.log(`[WEBHOOK] ${type}: ${message}`);
  }
}

/**
 * Advanced Analytics
 */
class AdvancedAnalytics {
  private providerMetrics: Map<string, ProviderMetrics> = new Map();
  private requestHistory: any[] = [];
  private cacheStats = { hits: 0, misses: 0 };

  recordSuccess(provider: string, latency: number, cost: number): void {
    const metrics = this.providerMetrics.get(provider) || {
      cost: 0,
      quality: 0.8,
      latency: 0,
      successRate: 1,
      requestCount: 0,
      errorCount: 0,
      lastUsed: new Date()
    };

    metrics.requestCount++;
    metrics.latency = (metrics.latency + latency) / 2; // Moving average
    metrics.cost = (metrics.cost + cost) / 2; // Moving average
    metrics.successRate = metrics.requestCount / (metrics.requestCount + metrics.errorCount);
    metrics.lastUsed = new Date();

    this.providerMetrics.set(provider, metrics);
  }

  recordFailure(provider: string, latency: number): void {
    const metrics = this.providerMetrics.get(provider) || {
      cost: 0,
      quality: 0.8,
      latency: 0,
      successRate: 1,
      requestCount: 0,
      errorCount: 0,
      lastUsed: new Date()
    };

    metrics.errorCount++;
    metrics.successRate = metrics.requestCount / (metrics.requestCount + metrics.errorCount);
    metrics.lastUsed = new Date();

    this.providerMetrics.set(provider, metrics);
  }

  getProviderMetrics(provider: string): ProviderMetrics | undefined {
    return this.providerMetrics.get(provider);
  }

  getAllProviderMetrics(): Map<string, ProviderMetrics> {
    return new Map(this.providerMetrics);
  }

  async optimizeCache(): Promise<void> {
    // Cache optimization logic
    const hitRate = this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses);
    if (hitRate < 0.7) {
      // Improve cache strategy
    }
  }

  getSummary(): any {
    return {
      totalProviders: this.providerMetrics.size,
      requestHistory: this.requestHistory.length,
      cacheHitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0
    };
  }

  getReport(timeRange?: { start: Date; end: Date }): any {
    return {
      providers: Object.fromEntries(this.providerMetrics),
      cache: this.cacheStats,
      summary: this.getSummary()
    };
  }
}

export { AdvancedWAIFeatures };