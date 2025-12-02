/**
 * Eleven LLM Providers - WAI SDK Compatibility Wrapper
 * 
 * Phase 2A Stage 0 - Deduplication Fix
 * Provides compatibility layer for services expecting elevenLLMProviders API
 * Routes all calls through OrchestrationFacade for proper WAI SDK integration
 */

import { OrchestrationFacade } from '../orchestration/orchestration-facade';
import type { WorkflowExecutionOptions } from '../orchestration/orchestration-facade';

/**
 * Legacy request interface for backward compatibility
 */
export interface LLMRequest {
  prompt: string;
  type?: 'text' | 'code' | 'analysis';
  maxTokens?: number;
  temperature?: number;
  model?: string;
  provider?: string;
}

/**
 * Legacy response interface for backward compatibility
 */
export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  tokens: number;
  cost: number;
  processingTime: number;
}

/**
 * Eleven LLM Providers Compatibility Class
 * Routes all LLM requests through WAI SDK OrchestrationFacade
 */
class ElevenLLMProviders {
  constructor() {
    console.log('✅ ElevenLLMProviders: Routing through WAI SDK OrchestrationFacade');
  }

  /**
   * Process LLM request through OrchestrationFacade
   * 
   * @param request - Legacy LLM request
   * @returns Legacy LLM response format
   */
  async processRequest(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      // Create OrchestrationFacade instance for this request
      const facade = new OrchestrationFacade({
        enableStreaming: false,
        enableMonitoring: true,
        enableRetries: true,
      });

      // Map request type to orchestration type
      const orchestrationType = this.mapRequestTypeToOrchestrationType(request.type || 'text');

      // Build workflow parameters
      const workflowParams = {
        prompt: request.prompt,
        provider: request.provider || 'auto',
        model: request.model || 'auto',
        maxTokens: request.maxTokens || 4096,
        temperature: request.temperature,
      };

      // Execution options
      const options: WorkflowExecutionOptions = {
        type: orchestrationType,
        priority: 'normal',
        parameters: workflowParams,
        costOptimization: true,
        preferredProviders: request.provider ? [request.provider] : undefined,
      };

      // Execute through OrchestrationFacade
      const result = await facade.executeWorkflow('llm-request', workflowParams, options);

      // Map result to legacy LLMResponse format
      const processingTime = Date.now() - startTime;
      
      return {
        content: result.result?.toString() || '',
        model: result.metadata?.model || request.model || 'unknown',
        provider: result.metadata?.provider || request.provider || 'unknown',
        tokens: result.metadata?.tokensUsed || 0,
        cost: result.metadata?.cost || 0,
        processingTime,
      };
    } catch (error: any) {
      console.error('❌ ElevenLLMProviders processing error:', error);
      
      // Propagate error instead of returning synthetic success
      throw new Error(`LLM processing failed: ${error.message}`);
    }
  }

  /**
   * Map legacy request type to OrchestrationFacade type
   */
  private mapRequestTypeToOrchestrationType(type: 'text' | 'code' | 'analysis'): 'creative' | 'analytical' | 'development' | 'hybrid' {
    switch (type) {
      case 'code':
        return 'development';
      case 'analysis':
        return 'analytical';
      case 'text':
      default:
        return 'hybrid';
    }
  }

  /**
   * Process request with specific provider (backward compatibility)
   */
  async processWithOpenAI(request: LLMRequest): Promise<LLMResponse> {
    return this.processRequest({ ...request, provider: 'openai' });
  }

  async processWithAnthropic(request: LLMRequest): Promise<LLMResponse> {
    return this.processRequest({ ...request, provider: 'anthropic' });
  }

  async processWithGoogle(request: LLMRequest): Promise<LLMResponse> {
    return this.processRequest({ ...request, provider: 'google' });
  }

  /**
   * Health check methods (backward compatibility)
   */
  async checkHealth(): Promise<boolean> {
    try {
      await this.processRequest({
        prompt: 'ping',
        maxTokens: 10,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get available models (backward compatibility)
   */
  getAvailableModels(): string[] {
    return [
      'gpt-4o',
      'gpt-4o-mini',
      'claude-sonnet-4-20250514',
      'claude-3-5-sonnet-20241022',
      'gemini-2.5-flash',
      'gemini-2.5-pro'
    ];
  }

  /**
   * Get provider status (backward compatibility)
   */
  getProviderStatus(): Record<string, boolean> {
    return {
      openai: true,
      anthropic: true,
      google: true,
      auto: true
    };
  }
}

// Export singleton instance for backward compatibility
export const elevenLLMProviders = new ElevenLLMProviders();
