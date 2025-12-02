/**
 * Orchestration Error Classes
 * 
 * Runtime error classes for the enhanced LLM orchestration system.
 * These are separate from type definitions to allow proper runtime usage.
 */

export class OrchestrationError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'OrchestrationError';
  }
}

export class ProviderError extends OrchestrationError {
  constructor(
    message: string,
    public providerId: string,
    context?: Record<string, any>
  ) {
    super(message, 'PROVIDER_ERROR', { providerId, ...context });
  }
}

export class FallbackError extends OrchestrationError {
  constructor(
    message: string,
    public exhaustedLevels: number[],
    context?: Record<string, any>
  ) {
    super(message, 'FALLBACK_EXHAUSTED', { exhaustedLevels, ...context });
  }
}

export class QualityError extends OrchestrationError {
  constructor(
    message: string,
    public qualityScore: number,
    public threshold: number,
    context?: Record<string, any>
  ) {
    super(message, 'QUALITY_THRESHOLD_FAILED', { qualityScore, threshold, ...context });
  }
}

export class CircuitBreakerError extends OrchestrationError {
  constructor(
    message: string,
    public providerId: string,
    public state: 'OPEN' | 'HALF_OPEN',
    context?: Record<string, any>
  ) {
    super(message, 'CIRCUIT_BREAKER_OPEN', { providerId, state, ...context });
  }
}

export class RoutingError extends OrchestrationError {
  constructor(
    message: string,
    public routingDecision: any,
    context?: Record<string, any>
  ) {
    super(message, 'ROUTING_FAILED', { routingDecision, ...context });
  }
}