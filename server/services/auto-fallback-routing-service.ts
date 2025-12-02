/**
 * Auto-Fallback Routing Service
 * 
 * Intelligent provider fallback chains with budget awareness and AG-UI streaming.
 * Automatically retries failed requests with alternate providers based on quality scores.
 * 
 * Features:
 * - Multi-tier fallback chains (primary → secondary → tertiary)
 * - Budget-aware provider selection
 * - Real-time AG-UI status updates
 * - Exponential backoff with jitter
 * - Circuit breaker integration
 * - Cost tracking across retry attempts
 */

import { EventEmitter } from 'events';
import { providerQualityScoringService, ProviderExecutionResult } from './provider-quality-scoring-service';

// ================================================================================================
// TYPES
// ================================================================================================

export interface FallbackRequest {
  workflow: string;
  taskDescription?: string;
  budgetLimit?: number;
  qualityThreshold?: number;
  maxRetries?: number;
  aguiSessionId?: string;
}

export interface FallbackResult {
  success: boolean;
  providerId: string;
  providerName: string;
  attemptNumber: number;
  totalAttempts: number;
  result: any;
  cost: number;
  latencyMs: number;
  fallbackChain: Array<{
    providerId: string;
    success: boolean;
    error?: string;
    cost: number;
    latencyMs: number;
  }>;
}

export interface FallbackChainConfig {
  primaryProvider: string;
  secondaryProviders: string[];
  tertiaryProviders: string[];
  maxRetries: number;
  retryDelayMs: number;
  exponentialBackoff: boolean;
}

// ================================================================================================
// AUTO-FALLBACK ROUTING SERVICE
// ================================================================================================

export class AutoFallbackRoutingService extends EventEmitter {
  private readonly DEFAULT_MAX_RETRIES = 3;
  private readonly DEFAULT_RETRY_DELAY_MS = 1000;
  private readonly MAX_RETRY_DELAY_MS = 10000;

  constructor() {
    super();
    console.log('🔄 Auto-Fallback Routing Service initialized');
  }

  /**
   * Execute request with automatic fallback on failure
   * @param request - Fallback request configuration
   * @param executionFn - Function to execute for each provider attempt
   */
  async executeWithFallback(
    request: FallbackRequest,
    executionFn: (providerId: string) => Promise<any>
  ): Promise<FallbackResult> {
    
    const maxRetries = request.maxRetries || this.DEFAULT_MAX_RETRIES;
    const fallbackChain: FallbackResult['fallbackChain'] = [];
    let totalCost = 0;

    // Emit AG-UI status change
    if (request.aguiSessionId) {
      this.emit('agui:status_change', {
        sessionId: request.aguiSessionId,
        status: 'in_progress',
        message: 'Initializing fallback chain'
      });
    }

    // Build fallback chain based on quality scores
    const chain = this.buildFallbackChain(
      request.budgetLimit,
      request.qualityThreshold,
      maxRetries,
      request.aguiSessionId
    );

    if (chain.length === 0) {
      throw new Error('No providers available matching criteria');
    }

    if (request.aguiSessionId) {
      this.emit('agui:thinking', {
        sessionId: request.aguiSessionId,
        step: 'Fallback chain configured',
        details: `${chain.length} providers in chain: ${chain.map(p => p.providerName).join(' → ')}`
      });
    }

    // Execute with fallback
    for (let i = 0; i < chain.length; i++) {
      const provider = chain[i];
      const attemptNumber = i + 1;
      const startTime = Date.now();

      try {
        // Emit AG-UI progress
        if (request.aguiSessionId) {
          this.emit('agui:progress', {
            sessionId: request.aguiSessionId,
            progress: attemptNumber / chain.length,
            message: `Attempting with ${provider.providerName} (${attemptNumber}/${chain.length})`
          });

          this.emit('agui:status_change', {
            sessionId: request.aguiSessionId,
            status: 'in_progress',
            message: `Executing with ${provider.providerName}`,
            metadata: {
              provider: provider.providerName,
              attemptNumber,
              totalAttempts: chain.length
            }
          });
        }

        console.log(`🔄 Attempt ${attemptNumber}/${chain.length}: Trying ${provider.providerName}`);

        // Execute request
        const result = await executionFn(provider.providerId);
        const latencyMs = Date.now() - startTime;
        const cost = provider.estimatedCost || 0;
        totalCost += cost;

        // Track successful execution
        await providerQualityScoringService.trackExecution({
          providerId: provider.providerId,
          success: true,
          latencyMs,
          cost,
          tokens: { input: 0, output: 0 } // Will be updated by caller
        }, request.aguiSessionId);

        fallbackChain.push({
          providerId: provider.providerId,
          success: true,
          cost,
          latencyMs
        });

        // Emit AG-UI success
        if (request.aguiSessionId) {
          this.emit('agui:status_change', {
            sessionId: request.aguiSessionId,
            status: 'completed',
            message: `✅ Success with ${provider.providerName} on attempt ${attemptNumber}`
          });

          this.emit('agui:message', {
            sessionId: request.aguiSessionId,
            message: `✅ Request completed successfully with ${provider.providerName} (${latencyMs}ms, $${cost.toFixed(4)})`,
            metadata: {
              provider: provider.providerName,
              attemptNumber,
              latencyMs,
              cost
            }
          });
        }

        console.log(`✅ Success with ${provider.providerName} on attempt ${attemptNumber} (${latencyMs}ms, $${cost.toFixed(4)})`);

        return {
          success: true,
          providerId: provider.providerId,
          providerName: provider.providerName,
          attemptNumber,
          totalAttempts: chain.length,
          result,
          cost: totalCost,
          latencyMs,
          fallbackChain
        };

      } catch (error) {
        const latencyMs = Date.now() - startTime;
        const cost = provider.estimatedCost || 0;
        totalCost += cost;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Track failed execution
        await providerQualityScoringService.trackExecution({
          providerId: provider.providerId,
          success: false,
          latencyMs,
          cost,
          tokens: { input: 0, output: 0 },
          errorMessage
        }, request.aguiSessionId);

        fallbackChain.push({
          providerId: provider.providerId,
          success: false,
          error: errorMessage,
          cost,
          latencyMs
        });

        // Emit AG-UI failure
        if (request.aguiSessionId) {
          this.emit('agui:status_change', {
            sessionId: request.aguiSessionId,
            status: 'in_progress',
            message: `⚠️ ${provider.providerName} failed, trying fallback`
          });

          this.emit('agui:message', {
            sessionId: request.aguiSessionId,
            message: `⚠️ ${provider.providerName} failed: ${errorMessage}`,
            metadata: {
              provider: provider.providerName,
              attemptNumber,
              error: errorMessage
            }
          });
        }

        console.warn(`⚠️ Attempt ${attemptNumber}/${chain.length} failed with ${provider.providerName}: ${errorMessage}`);

        // If not the last provider, wait before retry
        if (i < chain.length - 1) {
          const delayMs = this.calculateRetryDelay(attemptNumber);
          
          if (request.aguiSessionId) {
            this.emit('agui:thinking', {
              sessionId: request.aguiSessionId,
              step: 'Waiting before retry',
              details: `Delay: ${delayMs}ms before trying next provider`
            });
          }

          await this.sleep(delayMs);
        }
      }
    }

    // All attempts failed
    if (request.aguiSessionId) {
      this.emit('agui:status_change', {
        sessionId: request.aguiSessionId,
        status: 'failed',
        message: `❌ All ${chain.length} providers failed`
      });
    }

    console.error(`❌ All ${chain.length} providers failed`);

    throw new Error(`All ${chain.length} fallback attempts failed. Total cost: $${totalCost.toFixed(4)}`);
  }

  /**
   * Build intelligent fallback chain
   */
  private buildFallbackChain(
    budgetLimit?: number,
    qualityThreshold?: number,
    maxProviders?: number,
    aguiSessionId?: string
  ): Array<{
    providerId: string;
    providerName: string;
    weight: number;
    estimatedCost: number;
  }> {
    
    // Get routing weights from quality scoring service
    const weights = providerQualityScoringService.calculateRoutingWeights(
      qualityThreshold,
      budgetLimit,
      aguiSessionId
    );

    // Filter available providers and sort by weight
    const available = weights
      .filter(w => w.weight > 0)
      .map(w => {
        const metrics = providerQualityScoringService.getMetrics(w.providerId);
        return {
          providerId: w.providerId,
          providerName: metrics?.providerName || w.providerId,
          weight: w.weight,
          estimatedCost: metrics?.avgCost || 0
        };
      })
      .sort((a, b) => b.weight - a.weight);

    // Limit to maxProviders
    if (maxProviders) {
      return available.slice(0, maxProviders);
    }

    return available;
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  private calculateRetryDelay(attemptNumber: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s...
    const exponentialDelay = this.DEFAULT_RETRY_DELAY_MS * Math.pow(2, attemptNumber - 1);
    
    // Add jitter (±25%)
    const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
    
    const delayMs = Math.min(exponentialDelay + jitter, this.MAX_RETRY_DELAY_MS);
    
    return Math.floor(delayMs);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get fallback statistics
   */
  getFallbackStats(): {
    totalFallbacks: number;
    successfulFallbacks: number;
    failedFallbacks: number;
    avgAttempts: number;
  } {
    // This would be tracked in a real implementation
    return {
      totalFallbacks: 0,
      successfulFallbacks: 0,
      failedFallbacks: 0,
      avgAttempts: 0
    };
  }
}

// Singleton instance
export const autoFallbackRoutingService = new AutoFallbackRoutingService();
