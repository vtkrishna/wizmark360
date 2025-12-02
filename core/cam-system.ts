/**
 * WAI CAM System v9.0 - Circuit breakers, Anomaly detection, Monitoring  
 * Implements Runbook Prompt 6: CAM 2.0
 * Anomaly classes, retry matrix, circuit breakers, early-exit gates
 */

import { EventEmitter } from 'events';
import { WAILogger } from '../utils/logger';

export class CAMSystem extends EventEmitter {
  private logger: WAILogger;
  private initialized = false;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private anomalies: Map<string, AnomalyDetector> = new Map();
  private healthSignals: HealthSignal[] = [];
  private retryMatrix: RetryMatrix;
  private earlyExitGates: Map<string, EarlyExitGate> = new Map();

  constructor(private config: CAMSystemConfig) {
    super();
    this.logger = new WAILogger('CAMSystem');
    this.retryMatrix = new RetryMatrix();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.logger.info('🛡️ Initializing CAM System v2.0...');

      // Initialize circuit breakers
      await this.initializeCircuitBreakers();

      // Initialize anomaly detectors
      await this.initializeAnomalyDetectors();

      // Initialize early-exit gates
      await this.initializeEarlyExitGates();

      // Start health monitoring
      this.startHealthMonitoring();

      // Start anomaly detection
      this.startAnomalyDetection();

      this.initialized = true;
      this.logger.info('✅ CAM System v2.0 initialized');

    } catch (error) {
      this.logger.error('❌ CAM System initialization failed:', error);
      throw error;
    }
  }

  /**
   * Process request through CAM system
   */
  async processRequest(request: CAMRequest): Promise<CAMResult> {
    const startTime = Date.now();
    let currentRequest = request;

    try {
      // 1. Early-exit gate check
      const earlyExitResult = await this.checkEarlyExitGates(currentRequest);
      if (earlyExitResult.shouldExit) {
        return {
          success: false,
          exitReason: earlyExitResult.reason,
          action: 'early-exit',
          metadata: { 
            processingTime: Date.now() - startTime,
            exitGate: earlyExitResult.gateName 
          }
        };
      }

      // 2. Circuit breaker check
      const circuitBreakerResult = await this.checkCircuitBreakers(currentRequest);
      if (circuitBreakerResult.blocked) {
        return {
          success: false,
          exitReason: circuitBreakerResult.reason,
          action: 'circuit-break',
          metadata: { 
            processingTime: Date.now() - startTime,
            circuitBreaker: circuitBreakerResult.breakerName 
          }
        };
      }

      // 3. Anomaly detection
      const anomalyResult = await this.detectAnomalies(currentRequest);
      if (anomalyResult.isAnomalous) {
        await this.handleAnomaly(anomalyResult);
        
        if (anomalyResult.severity === 'critical') {
          return {
            success: false,
            exitReason: anomalyResult.reason,
            action: 'anomaly-block',
            metadata: { 
              processingTime: Date.now() - startTime,
              anomaly: anomalyResult.type 
            }
          };
        }
      }

      // 4. Process request normally
      const processResult = await this.executeRequest(currentRequest);

      // 5. Record health signal
      await this.recordHealthSignal({
        requestId: request.id,
        step: 'cam-processing',
        code: processResult.success ? 'success' : 'error',
        severity: processResult.success ? 'info' : 'warning',
        action: processResult.action || 'none',
        timestamp: Date.now(),
        processingTime: Date.now() - startTime
      });

      return processResult;

    } catch (error) {
      this.logger.error(`❌ CAM processing failed for request ${request.id}:`, error);

      // Record error health signal
      await this.recordHealthSignal({
        requestId: request.id,
        step: 'cam-processing',
        code: 'error',
        severity: 'error',
        action: 'retry',
        timestamp: Date.now(),
        processingTime: Date.now() - startTime,
        errorMessage: error.message
      });

      // Attempt recovery through retry matrix
      const retryResult = await this.attemptRecovery(request, error);
      return retryResult;
    }
  }

  /**
   * Record health signal
   */
  async recordHealthSignal(signal: HealthSignal): Promise<void> {
    this.healthSignals.push(signal);
    
    // Rotate signals to prevent memory buildup
    if (this.healthSignals.length > 10000) {
      this.healthSignals = this.healthSignals.slice(-5000);
    }

    this.emit('healthSignal', signal);

    // Trigger auto-rerun if needed
    if (signal.severity === 'error' && signal.action === 'retry') {
      await this.triggerAutoRerun(signal);
    }
  }

  /**
   * Get system health status
   */
  getHealthStatus(): CAMHealthStatus {
    const recentSignals = this.healthSignals.slice(-1000);
    const errorCount = recentSignals.filter(s => s.severity === 'error').length;
    const warningCount = recentSignals.filter(s => s.severity === 'warning').length;
    
    const circuitBreakerStatus = Array.from(this.circuitBreakers.values()).map(cb => ({
      name: cb.name,
      state: cb.getState(),
      failureCount: cb.getFailureCount(),
      lastFailure: cb.getLastFailureTime()
    }));

    const anomalyStatus = Array.from(this.anomalies.values()).map(ad => ({
      name: ad.name,
      detected: ad.getRecentAnomalies().length,
      lastAnomaly: ad.getLastAnomalyTime()
    }));

    return {
      healthy: errorCount < recentSignals.length * 0.05, // Less than 5% errors
      overallStatus: this.calculateOverallStatus(errorCount, warningCount, recentSignals.length),
      metrics: {
        totalSignals: this.healthSignals.length,
        recentErrors: errorCount,
        recentWarnings: warningCount,
        errorRate: recentSignals.length > 0 ? errorCount / recentSignals.length : 0
      },
      circuitBreakers: circuitBreakerStatus,
      anomalies: anomalyStatus,
      lastCheck: Date.now()
    };
  }

  /**
   * Initialize circuit breakers
   */
  private async initializeCircuitBreakers(): Promise<void> {
    const breakerConfigs = [
      { name: 'llm-provider', failureThreshold: 5, timeoutMs: 30000, recoveryTimeMs: 60000 },
      { name: 'database', failureThreshold: 3, timeoutMs: 5000, recoveryTimeMs: 30000 },
      { name: 'external-api', failureThreshold: 10, timeoutMs: 10000, recoveryTimeMs: 120000 },
      { name: 'agent-execution', failureThreshold: 8, timeoutMs: 60000, recoveryTimeMs: 180000 }
    ];

    for (const config of breakerConfigs) {
      const breaker = new CircuitBreaker(config);
      this.circuitBreakers.set(config.name, breaker);
    }

    this.logger.info(`✅ Initialized ${breakerConfigs.length} circuit breakers`);
  }

  /**
   * Initialize anomaly detectors
   */
  private async initializeAnomalyDetectors(): Promise<void> {
    const anomalyConfigs = [
      { name: 'response-time', type: 'statistical', threshold: 3.0 },
      { name: 'error-rate', type: 'threshold', threshold: 0.1 },
      { name: 'cost-spike', type: 'trend', threshold: 2.0 },
      { name: 'usage-pattern', type: 'ml-based', threshold: 0.8 }
    ];

    for (const config of anomalyConfigs) {
      const detector = new AnomalyDetector(config);
      await detector.initialize();
      this.anomalies.set(config.name, detector);
    }

    this.logger.info(`✅ Initialized ${anomalyConfigs.length} anomaly detectors`);
  }

  /**
   * Initialize early-exit gates
   */
  private async initializeEarlyExitGates(): Promise<void> {
    const gateConfigs = [
      { name: 'budget-exceeded', type: 'cost', threshold: 1000.0 },
      { name: 'queue-full', type: 'capacity', threshold: 100 },
      { name: 'maintenance-mode', type: 'operational', threshold: 1 }
    ];

    for (const config of gateConfigs) {
      const gate = new EarlyExitGate(config);
      this.earlyExitGates.set(config.name, gate);
    }

    this.logger.info(`✅ Initialized ${gateConfigs.length} early-exit gates`);
  }

  /**
   * Check early-exit gates
   */
  private async checkEarlyExitGates(request: CAMRequest): Promise<EarlyExitResult> {
    for (const [name, gate] of this.earlyExitGates) {
      const shouldExit = await gate.shouldExit(request);
      if (shouldExit.exit) {
        return {
          shouldExit: true,
          reason: shouldExit.reason,
          gateName: name
        };
      }
    }

    return { shouldExit: false };
  }

  /**
   * Check circuit breakers
   */
  private async checkCircuitBreakers(request: CAMRequest): Promise<CircuitBreakerResult> {
    const breakerName = this.determineCircuitBreaker(request);
    const breaker = this.circuitBreakers.get(breakerName);
    
    if (!breaker) {
      return { blocked: false };
    }

    const isOpen = breaker.isOpen();
    if (isOpen) {
      return {
        blocked: true,
        reason: `Circuit breaker '${breakerName}' is open`,
        breakerName
      };
    }

    return { blocked: false };
  }

  /**
   * Detect anomalies in request
   */
  private async detectAnomalies(request: CAMRequest): Promise<AnomalyDetectionResult> {
    const anomalies: DetectedAnomaly[] = [];

    for (const [name, detector] of this.anomalies) {
      try {
        const result = await detector.analyze(request);
        if (result.isAnomalous) {
          anomalies.push({
            type: name,
            severity: result.severity,
            confidence: result.confidence,
            details: result.details
          });
        }
      } catch (error) {
        this.logger.warn(`⚠️ Anomaly detection failed for ${name}:`, error);
      }
    }

    if (anomalies.length === 0) {
      return { isAnomalous: false };
    }

    // Determine overall severity
    const maxSeverity = anomalies.reduce((max, anomaly) => {
      const severityOrder = { 'info': 1, 'warning': 2, 'error': 3, 'critical': 4 };
      return severityOrder[anomaly.severity] > severityOrder[max] ? anomaly.severity : max;
    }, 'info');

    return {
      isAnomalous: true,
      severity: maxSeverity as any,
      anomalies,
      reason: `Detected ${anomalies.length} anomalies: ${anomalies.map(a => a.type).join(', ')}`
    };
  }

  /**
   * Handle detected anomaly
   */
  private async handleAnomaly(result: AnomalyDetectionResult): Promise<void> {
    if (!result.isAnomalous) return;

    this.logger.warn(`⚠️ Anomaly detected: ${result.reason}`);
    
    for (const anomaly of result.anomalies || []) {
      // Record health signal
      await this.recordHealthSignal({
        requestId: 'anomaly-detection',
        step: 'anomaly-detection',
        code: 'anomaly',
        severity: anomaly.severity === 'critical' ? 'error' : 'warning',
        action: anomaly.severity === 'critical' ? 'block' : 'monitor',
        timestamp: Date.now(),
        anomalyType: anomaly.type,
        anomalyDetails: anomaly.details
      });

      // Take corrective action based on anomaly type
      await this.takeCorrectiveAction(anomaly);
    }
  }

  /**
   * Take corrective action for anomaly
   */
  private async takeCorrectiveAction(anomaly: DetectedAnomaly): Promise<void> {
    switch (anomaly.type) {
      case 'response-time':
        if (anomaly.severity === 'critical') {
          // Trigger circuit breaker for slow services
          const breaker = this.circuitBreakers.get('llm-provider');
          if (breaker) {
            breaker.recordFailure();
          }
        }
        break;
        
      case 'error-rate':
        if (anomaly.severity === 'error' || anomaly.severity === 'critical') {
          // Enable more aggressive retry policies
          this.retryMatrix.enableAggressiveRetry();
        }
        break;
        
      case 'cost-spike':
        if (anomaly.severity === 'critical') {
          // Activate cost emergency gate
          const costGate = this.earlyExitGates.get('budget-exceeded');
          if (costGate) {
            costGate.activate();
          }
        }
        break;
    }
  }

  /**
   * Execute request with monitoring
   */
  private async executeRequest(request: CAMRequest): Promise<CAMResult> {
    // This would execute the actual request with monitoring
    // For now, simulate request processing
    
    const processingTime = 100 + Math.random() * 500;
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    const success = Math.random() > 0.1; // 90% success rate
    
    if (!success) {
      throw new Error('Simulated request failure');
    }
    
    return {
      success: true,
      action: 'completed',
      metadata: { processingTime }
    };
  }

  /**
   * Attempt recovery using retry matrix
   */
  private async attemptRecovery(request: CAMRequest, error: Error): Promise<CAMResult> {
    const retryStrategy = this.retryMatrix.getRetryStrategy(request.type, error);
    
    if (!retryStrategy.shouldRetry) {
      return {
        success: false,
        exitReason: `No retry strategy available: ${error.message}`,
        action: 'failed',
        metadata: { originalError: error.message }
      };
    }

    this.logger.info(`🔄 Attempting recovery with strategy: ${retryStrategy.strategy}`);
    
    for (let attempt = 1; attempt <= retryStrategy.maxAttempts; attempt++) {
      try {
        // Wait for backoff period
        await new Promise(resolve => setTimeout(resolve, retryStrategy.backoffMs * attempt));
        
        // Attempt request again
        const result = await this.executeRequest(request);
        
        this.logger.info(`✅ Recovery successful on attempt ${attempt}`);
        return {
          ...result,
          action: 'recovered',
          metadata: { 
            ...result.metadata, 
            recoveryAttempt: attempt,
            recoveryStrategy: retryStrategy.strategy
          }
        };
        
      } catch (retryError) {
        this.logger.warn(`⚠️ Recovery attempt ${attempt} failed:`, retryError);
        
        if (attempt === retryStrategy.maxAttempts) {
          return {
            success: false,
            exitReason: `Recovery failed after ${attempt} attempts: ${retryError.message}`,
            action: 'recovery-failed',
            metadata: { 
              originalError: error.message,
              finalError: retryError.message,
              attempts: attempt
            }
          };
        }
      }
    }

    return {
      success: false,
      exitReason: 'Unexpected recovery failure',
      action: 'recovery-failed',
      metadata: {}
    };
  }

  /**
   * Trigger auto-rerun based on health signal
   */
  private async triggerAutoRerun(signal: HealthSignal): Promise<void> {
    // Implement auto-rerun logic with capped budgets
    const budget = this.config.costManager ? 
      await this.config.costManager.getAvailableBudget(signal.requestId) : 10.0;
    
    if (budget > 1.0) { // Only retry if budget allows
      this.emit('autoRerunTriggered', {
        requestId: signal.requestId,
        reason: 'CAM health signal',
        availableBudget: budget
      });
    }
  }

  /**
   * Determine which circuit breaker to use for request
   */
  private determineCircuitBreaker(request: CAMRequest): string {
    if (request.type === 'llm-call') return 'llm-provider';
    if (request.type === 'database-query') return 'database';
    if (request.type === 'external-api') return 'external-api';
    if (request.type === 'agent-task') return 'agent-execution';
    
    return 'llm-provider'; // Default
  }

  /**
   * Calculate overall system status
   */
  private calculateOverallStatus(
    errorCount: number, 
    warningCount: number, 
    totalCount: number
  ): 'healthy' | 'degraded' | 'unhealthy' {
    if (totalCount === 0) return 'healthy';
    
    const errorRate = errorCount / totalCount;
    const warningRate = warningCount / totalCount;
    
    if (errorRate > 0.1) return 'unhealthy';
    if (errorRate > 0.05 || warningRate > 0.2) return 'degraded';
    
    return 'healthy';
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30 seconds
  }

  /**
   * Start anomaly detection
   */
  private startAnomalyDetection(): void {
    setInterval(async () => {
      await this.performAnomalyDetection();
    }, 60000); // Every minute
  }

  /**
   * Perform system health check
   */
  private performHealthCheck(): void {
    const status = this.getHealthStatus();
    this.emit('healthCheck', status);
    
    if (!status.healthy) {
      this.logger.warn('⚠️ CAM System health degraded', status);
    }
  }

  /**
   * Perform anomaly detection sweep
   */
  private async performAnomalyDetection(): Promise<void> {
    for (const detector of this.anomalies.values()) {
      try {
        await detector.performPeriodicCheck();
      } catch (error) {
        this.logger.warn(`⚠️ Periodic anomaly detection failed: ${detector.name}`, error);
      }
    }
  }

  async getHealth(): Promise<ComponentHealth> {
    const status = this.getHealthStatus();
    
    return {
      healthy: status.healthy,
      status: status.overallStatus,
      lastCheck: status.lastCheck,
      details: {
        circuitBreakers: status.circuitBreakers.length,
        anomalies: status.anomalies.length,
        errorRate: status.metrics.errorRate,
        recentErrors: status.metrics.recentErrors
      }
    };
  }

  async shutdown(): Promise<void> {
    this.logger.info('🔄 Shutting down CAM system...');
    this.initialized = false;
  }
}

// Supporting Classes

/**
 * Circuit Breaker implementation
 */
class CircuitBreaker {
  public readonly name: string;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private lastFailureTime = 0;
  private nextAttemptTime = 0;

  constructor(private config: CircuitBreakerConfig) {
    this.name = config.name;
  }

  isOpen(): boolean {
    if (this.state === 'open') {
      if (Date.now() >= this.nextAttemptTime) {
        this.state = 'half-open';
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'open';
      this.nextAttemptTime = Date.now() + this.config.recoveryTimeMs;
    }
  }

  getState(): string {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  getLastFailureTime(): number {
    return this.lastFailureTime;
  }
}

/**
 * Anomaly Detector implementation
 */
class AnomalyDetector {
  public readonly name: string;
  private recentAnomalies: DetectedAnomaly[] = [];
  private lastAnomalyTime = 0;

  constructor(private config: AnomalyDetectorConfig) {
    this.name = config.name;
  }

  async initialize(): Promise<void> {
    // Initialize detector based on type
  }

  async analyze(request: CAMRequest): Promise<AnomalyAnalysisResult> {
    // Simplified anomaly detection logic
    const isAnomalous = Math.random() < 0.05; // 5% chance of anomaly
    
    if (!isAnomalous) {
      return { isAnomalous: false };
    }

    const severity = Math.random() < 0.1 ? 'critical' : 
                    Math.random() < 0.3 ? 'error' : 'warning';

    return {
      isAnomalous: true,
      severity: severity as any,
      confidence: 0.8 + Math.random() * 0.2,
      details: { detectorType: this.config.type, threshold: this.config.threshold }
    };
  }

  async performPeriodicCheck(): Promise<void> {
    // Perform periodic anomaly detection
  }

  getRecentAnomalies(): DetectedAnomaly[] {
    return this.recentAnomalies.slice(-10);
  }

  getLastAnomalyTime(): number {
    return this.lastAnomalyTime;
  }
}

/**
 * Retry Matrix for recovery strategies
 */
class RetryMatrix {
  private aggressiveMode = false;

  getRetryStrategy(requestType: string, error: Error): RetryStrategy {
    const baseStrategy = {
      'llm-call': { maxAttempts: 3, backoffMs: 1000, strategy: 'exponential' },
      'database-query': { maxAttempts: 2, backoffMs: 500, strategy: 'linear' },
      'external-api': { maxAttempts: 5, backoffMs: 2000, strategy: 'exponential' },
      'agent-task': { maxAttempts: 2, backoffMs: 1500, strategy: 'linear' }
    };

    const strategy = baseStrategy[requestType] || baseStrategy['llm-call'];
    
    // Increase attempts in aggressive mode
    if (this.aggressiveMode) {
      strategy.maxAttempts *= 2;
    }

    return {
      shouldRetry: true,
      ...strategy
    };
  }

  enableAggressiveRetry(): void {
    this.aggressiveMode = true;
    setTimeout(() => {
      this.aggressiveMode = false;
    }, 300000); // 5 minutes
  }
}

/**
 * Early Exit Gate implementation
 */
class EarlyExitGate {
  public readonly name: string;
  private active = true;

  constructor(private config: EarlyExitGateConfig) {
    this.name = config.name;
  }

  async shouldExit(request: CAMRequest): Promise<{ exit: boolean; reason?: string }> {
    if (!this.active) {
      return { exit: false };
    }

    // Simplified gate logic
    if (this.config.type === 'cost' && request.estimatedCost > this.config.threshold) {
      return { exit: true, reason: `Cost ${request.estimatedCost} exceeds threshold ${this.config.threshold}` };
    }

    return { exit: false };
  }

  activate(): void {
    this.active = true;
  }

  deactivate(): void {
    this.active = false;
  }
}

// Type definitions
interface CAMSystemConfig {
  costManager?: any;
  telemetry?: any;
  policies?: any;
}

interface CAMRequest {
  id: string;
  type: string;
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high';
  metadata: Record<string, unknown>;
}

interface CAMResult {
  success: boolean;
  exitReason?: string;
  action: string;
  metadata: Record<string, unknown>;
}

interface HealthSignal {
  requestId: string;
  step: string;
  code: string;
  severity: 'info' | 'warning' | 'error';
  action: string;
  timestamp: number;
  processingTime?: number;
  errorMessage?: string;
  anomalyType?: string;
  anomalyDetails?: any;
}

interface CAMHealthStatus {
  healthy: boolean;
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  metrics: {
    totalSignals: number;
    recentErrors: number;
    recentWarnings: number;
    errorRate: number;
  };
  circuitBreakers: any[];
  anomalies: any[];
  lastCheck: number;
}

interface CircuitBreakerConfig {
  name: string;
  failureThreshold: number;
  timeoutMs: number;
  recoveryTimeMs: number;
}

interface AnomalyDetectorConfig {
  name: string;
  type: string;
  threshold: number;
}

interface EarlyExitGateConfig {
  name: string;
  type: string;
  threshold: number;
}

interface EarlyExitResult {
  shouldExit: boolean;
  reason?: string;
  gateName?: string;
}

interface CircuitBreakerResult {
  blocked: boolean;
  reason?: string;
  breakerName?: string;
}

interface AnomalyDetectionResult {
  isAnomalous: boolean;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  anomalies?: DetectedAnomaly[];
  reason?: string;
}

interface DetectedAnomaly {
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  confidence: number;
  details: any;
}

interface AnomalyAnalysisResult {
  isAnomalous: boolean;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  confidence?: number;
  details?: any;
}

interface RetryStrategy {
  shouldRetry: boolean;
  maxAttempts: number;
  backoffMs: number;
  strategy: string;
}

interface ComponentHealth {
  healthy: boolean;
  status: string;
  lastCheck: number;
  details?: Record<string, unknown>;
}