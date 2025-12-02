/**
 * Circuit Breaker Pattern Implementation
 * 
 * Implements circuit breaker pattern for provider reliability:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Failure threshold exceeded, requests fail fast  
 * - HALF_OPEN: Testing recovery, limited requests allowed
 */

import { EventEmitter } from 'events';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeoutMs: number;
  monitoringIntervalMs: number;
  halfOpenMaxRequests: number;
  errorPercentageThreshold: number;
  minRequestCount: number;
}

export interface CircuitBreakerState {
  status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  successes: number;
  totalRequests: number;
  lastFailureTime?: Date;
  lastStateChangeTime: Date;
  errorPercentage: number;
  isHealthy: boolean;
}

export interface CircuitBreakerMetrics {
  providerId: string;
  state: CircuitBreakerState;
  recentRequests: Array<{
    timestamp: Date;
    success: boolean;
    duration: number;
    error?: string;
  }>;
}

export class CircuitBreaker extends EventEmitter {
  private state: CircuitBreakerState;
  private config: CircuitBreakerConfig;
  private recentRequests: Array<{
    timestamp: Date;
    success: boolean;
    duration: number;
    error?: string;
  }> = [];

  constructor(
    private providerId: string,
    config: Partial<CircuitBreakerConfig> = {}
  ) {
    super();
    
    this.config = {
      failureThreshold: 5,
      recoveryTimeoutMs: 60000, // 1 minute
      monitoringIntervalMs: 30000, // 30 seconds
      halfOpenMaxRequests: 3,
      errorPercentageThreshold: 50, // 50%
      minRequestCount: 10,
      ...config
    };

    this.state = {
      status: 'CLOSED',
      failures: 0,
      successes: 0,
      totalRequests: 0,
      lastStateChangeTime: new Date(),
      errorPercentage: 0,
      isHealthy: true
    };

    this.startMonitoring();
  }

  /**
   * Execute a request through the circuit breaker
   */
  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    const canExecute = this.canExecute();
    
    if (!canExecute) {
      const error = new Error(`Circuit breaker is OPEN for provider ${this.providerId}`);
      this.emit('request-rejected', { providerId: this.providerId, reason: 'circuit-open' });
      
      if (fallback) {
        return await fallback();
      }
      throw error;
    }

    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      this.recordSuccess(duration);
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordFailure(duration, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Check if requests can be executed
   */
  private canExecute(): boolean {
    switch (this.state.status) {
      case 'CLOSED':
        return true;
        
      case 'OPEN':
        // Check if recovery timeout has passed
        if (this.state.lastFailureTime && 
            Date.now() - this.state.lastFailureTime.getTime() >= this.config.recoveryTimeoutMs) {
          this.transitionToHalfOpen();
          return true;
        }
        return false;
        
      case 'HALF_OPEN':
        // Allow limited requests in half-open state
        const recentRequests = this.getRecentRequests(this.config.monitoringIntervalMs);
        return recentRequests.length < this.config.halfOpenMaxRequests;
        
      default:
        return false;
    }
  }

  /**
   * Record successful operation
   */
  private recordSuccess(duration: number): void {
    this.state.successes++;
    this.state.totalRequests++;
    
    this.recentRequests.push({
      timestamp: new Date(),
      success: true,
      duration
    });
    
    this.cleanupOldRequests();
    this.updateMetrics();
    
    // Transition from HALF_OPEN to CLOSED if we have enough successful requests
    if (this.state.status === 'HALF_OPEN') {
      const recentRequests = this.getRecentRequests(this.config.monitoringIntervalMs);
      const recentSuccesses = recentRequests.filter(r => r.success).length;
      
      if (recentSuccesses >= this.config.halfOpenMaxRequests) {
        this.transitionToClosed();
      }
    }
    
    this.emit('success-recorded', { 
      providerId: this.providerId, 
      duration, 
      state: this.state.status 
    });
  }

  /**
   * Record failed operation
   */
  private recordFailure(duration: number, error: string): void {
    this.state.failures++;
    this.state.totalRequests++;
    this.state.lastFailureTime = new Date();
    
    this.recentRequests.push({
      timestamp: new Date(),
      success: false,
      duration,
      error
    });
    
    this.cleanupOldRequests();
    this.updateMetrics();
    
    // Check if we should transition to OPEN
    const shouldOpen = this.shouldTransitionToOpen();
    if (shouldOpen && this.state.status !== 'OPEN') {
      this.transitionToOpen();
    }
    
    this.emit('failure-recorded', { 
      providerId: this.providerId, 
      duration, 
      error, 
      state: this.state.status 
    });
  }

  /**
   * Check if circuit breaker should transition to OPEN
   */
  private shouldTransitionToOpen(): boolean {
    const recentRequests = this.getRecentRequests(this.config.monitoringIntervalMs);
    
    // Not enough requests to make a decision
    if (recentRequests.length < this.config.minRequestCount) {
      return false;
    }
    
    // Check failure count threshold
    if (this.state.failures >= this.config.failureThreshold) {
      return true;
    }
    
    // Check error percentage threshold
    if (this.state.errorPercentage >= this.config.errorPercentageThreshold) {
      return true;
    }
    
    return false;
  }

  /**
   * Transition to OPEN state
   */
  private transitionToOpen(): void {
    this.state.status = 'OPEN';
    this.state.lastStateChangeTime = new Date();
    this.state.isHealthy = false;
    
    console.warn(`🔴 Circuit breaker OPEN for provider ${this.providerId}`);
    this.emit('state-changed', { 
      providerId: this.providerId, 
      newState: 'OPEN', 
      reason: `Failures: ${this.state.failures}, Error rate: ${this.state.errorPercentage}%` 
    });
  }

  /**
   * Transition to HALF_OPEN state
   */
  private transitionToHalfOpen(): void {
    this.state.status = 'HALF_OPEN';
    this.state.lastStateChangeTime = new Date();
    
    console.log(`🟡 Circuit breaker HALF_OPEN for provider ${this.providerId} - testing recovery`);
    this.emit('state-changed', { 
      providerId: this.providerId, 
      newState: 'HALF_OPEN', 
      reason: 'Recovery timeout reached' 
    });
  }

  /**
   * Transition to CLOSED state
   */
  private transitionToClosed(): void {
    this.state.status = 'CLOSED';
    this.state.failures = 0;
    this.state.lastStateChangeTime = new Date();
    this.state.isHealthy = true;
    
    console.log(`🟢 Circuit breaker CLOSED for provider ${this.providerId} - provider recovered`);
    this.emit('state-changed', { 
      providerId: this.providerId, 
      newState: 'CLOSED', 
      reason: 'Provider recovered' 
    });
  }

  /**
   * Get recent requests within time window
   */
  private getRecentRequests(timeWindowMs: number): typeof this.recentRequests {
    const cutoffTime = Date.now() - timeWindowMs;
    return this.recentRequests.filter(req => req.timestamp.getTime() > cutoffTime);
  }

  /**
   * Update circuit breaker metrics
   */
  private updateMetrics(): void {
    const recentRequests = this.getRecentRequests(this.config.monitoringIntervalMs);
    
    if (recentRequests.length > 0) {
      const failures = recentRequests.filter(r => !r.success).length;
      this.state.errorPercentage = (failures / recentRequests.length) * 100;
    } else {
      this.state.errorPercentage = 0;
    }
  }

  /**
   * Clean up old request records
   */
  private cleanupOldRequests(): void {
    const cutoffTime = Date.now() - (this.config.monitoringIntervalMs * 2); // Keep 2x monitoring window
    this.recentRequests = this.recentRequests.filter(req => req.timestamp.getTime() > cutoffTime);
  }

  /**
   * Start monitoring loop
   */
  private startMonitoring(): void {
    setInterval(() => {
      this.updateMetrics();
      this.emit('metrics-updated', this.getMetrics());
    }, this.config.monitoringIntervalMs);
  }

  /**
   * Get current circuit breaker metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      providerId: this.providerId,
      state: { ...this.state },
      recentRequests: this.getRecentRequests(this.config.monitoringIntervalMs)
    };
  }

  /**
   * Get current state
   */
  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  /**
   * Force circuit breaker to OPEN (for testing or manual intervention)
   */
  forceOpen(reason: string = 'Manual intervention'): void {
    this.state.status = 'OPEN';
    this.state.lastStateChangeTime = new Date();
    this.state.isHealthy = false;
    
    console.warn(`🔴 Circuit breaker manually OPENED for provider ${this.providerId}: ${reason}`);
    this.emit('state-changed', { 
      providerId: this.providerId, 
      newState: 'OPEN', 
      reason 
    });
  }

  /**
   * Force circuit breaker to CLOSED (for testing or manual intervention)
   */
  forceClosed(reason: string = 'Manual intervention'): void {
    this.state.status = 'CLOSED';
    this.state.failures = 0;
    this.state.lastStateChangeTime = new Date();
    this.state.isHealthy = true;
    
    console.log(`🟢 Circuit breaker manually CLOSED for provider ${this.providerId}: ${reason}`);
    this.emit('state-changed', { 
      providerId: this.providerId, 
      newState: 'CLOSED', 
      reason 
    });
  }

  /**
   * Reset circuit breaker statistics
   */
  reset(): void {
    this.state = {
      status: 'CLOSED',
      failures: 0,
      successes: 0,
      totalRequests: 0,
      lastStateChangeTime: new Date(),
      errorPercentage: 0,
      isHealthy: true
    };
    
    this.recentRequests = [];
    
    console.log(`♻️ Circuit breaker reset for provider ${this.providerId}`);
    this.emit('reset', { providerId: this.providerId });
  }
}

/**
 * Circuit Breaker Manager for managing multiple provider circuit breakers
 */
export class CircuitBreakerManager extends EventEmitter {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private defaultConfig: CircuitBreakerConfig;

  constructor(defaultConfig: Partial<CircuitBreakerConfig> = {}) {
    super();
    
    this.defaultConfig = {
      failureThreshold: 5,
      recoveryTimeoutMs: 60000,
      monitoringIntervalMs: 30000,
      halfOpenMaxRequests: 3,
      errorPercentageThreshold: 50,
      minRequestCount: 10,
      ...defaultConfig
    };
  }

  /**
   * Get or create circuit breaker for provider
   */
  getCircuitBreaker(providerId: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    let circuitBreaker = this.circuitBreakers.get(providerId);
    
    if (!circuitBreaker) {
      circuitBreaker = new CircuitBreaker(providerId, { ...this.defaultConfig, ...config });
      
      // Forward circuit breaker events
      circuitBreaker.on('state-changed', (data) => this.emit('state-changed', data));
      circuitBreaker.on('success-recorded', (data) => this.emit('success-recorded', data));
      circuitBreaker.on('failure-recorded', (data) => this.emit('failure-recorded', data));
      circuitBreaker.on('request-rejected', (data) => this.emit('request-rejected', data));
      
      this.circuitBreakers.set(providerId, circuitBreaker);
      
      console.log(`🔧 Created circuit breaker for provider ${providerId}`);
    }
    
    return circuitBreaker;
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async execute<T>(
    providerId: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker(providerId);
    return circuitBreaker.execute(operation, fallback);
  }

  /**
   * Get all circuit breaker metrics
   */
  getAllMetrics(): CircuitBreakerMetrics[] {
    return Array.from(this.circuitBreakers.values()).map(cb => cb.getMetrics());
  }

  /**
   * Get healthy providers (circuit breakers in CLOSED state)
   */
  getHealthyProviders(): string[] {
    return Array.from(this.circuitBreakers.entries())
      .filter(([, cb]) => cb.getState().status === 'CLOSED')
      .map(([providerId]) => providerId);
  }

  /**
   * Get unhealthy providers (circuit breakers in OPEN state)
   */
  getUnhealthyProviders(): string[] {
    return Array.from(this.circuitBreakers.entries())
      .filter(([, cb]) => cb.getState().status === 'OPEN')
      .map(([providerId]) => providerId);
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const circuitBreaker of this.circuitBreakers.values()) {
      circuitBreaker.reset();
    }
    
    console.log('♻️ All circuit breakers reset');
    this.emit('all-reset');
  }

  /**
   * Reset specific circuit breaker
   */
  reset(providerId: string): void {
    const circuitBreaker = this.circuitBreakers.get(providerId);
    if (circuitBreaker) {
      circuitBreaker.reset();
    }
  }

  /**
   * Force all circuit breakers to CLOSED (emergency recovery)
   */
  forceAllClosed(reason: string = 'Emergency recovery'): void {
    for (const circuitBreaker of this.circuitBreakers.values()) {
      circuitBreaker.forceClosed(reason);
    }
    
    console.log(`🟢 All circuit breakers forced CLOSED: ${reason}`);
    this.emit('all-forced-closed', { reason });
  }
}

// Export singleton instance
export const circuitBreakerManager = new CircuitBreakerManager();