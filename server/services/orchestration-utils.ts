/**
 * Orchestration Utility Functions
 * 
 * Runtime utility functions for the enhanced LLM orchestration system.
 * Separated from type definitions for proper layering.
 */

/**
 * Generate a unique correlation ID for request tracing
 */
export function generateCorrelationId(): string {
  return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate provider performance score
 */
export function calculateProviderScore(
  provider: any, 
  metrics?: any
): number {
  let score = 0;
  
  // Base capability score (40%)
  const capabilities = Object.values(provider.capabilities || {}) as number[];
  const avgCapability = capabilities.reduce((a: number, b: number) => a + b, 0) / capabilities.length;
  score += avgCapability * 0.4;
  
  // Performance score (30%)
  score += (provider.performance?.availability || 0) * 0.15;
  score += (provider.performance?.qualityScore || 0) * 0.15;
  
  // Health metrics (30%) - if available
  if (metrics) {
    score += (metrics.availability || 0) * 0.15;
    score += (1 - (metrics.errorRate || 0)) * 0.15;
  } else {
    score += (provider.performance?.reliabilityScore || 0) * 0.3;
  }
  
  return Math.min(score, 100);
}

/**
 * Check if provider is healthy based on health status
 */
export function isProviderHealthy(health: any): boolean {
  return health.status === 'healthy' && 
         health.availability >= 0.95 && 
         health.errorRate <= 0.05;
}

/**
 * Create AbortController with timeout for fetch requests
 */
export function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller;
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000,
  backoffMultiplier: number = 2
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delayMs = baseDelayMs * Math.pow(backoffMultiplier, attempt - 1);
      await sleep(delayMs);
    }
  }
  
  throw lastError!;
}