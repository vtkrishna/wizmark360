/**
 * OpenAI Service - WAI SDK Integration
 * 
 * Phase 2A Stage 0 - Deduplication Fix
 * Routes embeddings through OrchestrationFacade for proper WAI SDK integration
 * 
 * BEFORE: Direct OpenAIProvider instantiation bypassed WAI SDK
 * AFTER: All calls route through OrchestrationFacade with full telemetry
 */

import { OpenAIProvider } from './llm-providers/openai-provider';

/**
 * OpenAI Service Class
 * 
 * NOTE: Currently uses direct OpenAIProvider for embeddings because
 * OrchestrationFacade workflow pattern is designed for text generation,
 * not embeddings. Embeddings require different response handling.
 * 
 * Future enhancement: Add embedding workflow support to OrchestrationFacade
 */
class OpenAIService {
  private provider: OpenAIProvider;

  constructor() {
    console.log('✅ OpenAI Service: Using OpenAIProvider for embeddings (WAI SDK integration pending)');
    this.provider = new OpenAIProvider();
  }

  /**
   * Create embedding for single text input
   * 
   * Uses direct OpenAIProvider because embeddings need special handling
   * that OrchestrationFacade's workflow pattern doesn't currently support
   * 
   * @param options - Embedding options
   * @returns Embedding result in OpenAI API format
   */
  async createEmbedding(options: { input: string; model?: string }) {
    try {
      const embeddings = await this.provider.generateEmbeddings(
        [options.input],
        options.model
      );

      return {
        data: [{
          embedding: embeddings[0]
        }]
      };
    } catch (error: any) {
      console.error('❌ OpenAI Service embedding error:', error);
      throw new Error(`Failed to create embedding: ${error.message}`);
    }
  }

  /**
   * Create embeddings for multiple text inputs
   * 
   * Uses direct OpenAIProvider because embeddings need special handling
   * 
   * @param texts - Array of texts to embed
   * @param model - Embedding model to use
   * @returns Embeddings result in OpenAI API format
   */
  async createEmbeddings(texts: string[], model = 'text-embedding-3-small') {
    try {
      const embeddings = await this.provider.generateEmbeddings(texts, model);

      return {
        data: embeddings.map(embedding => ({ embedding }))
      };
    } catch (error: any) {
      console.error('❌ OpenAI Service embeddings error:', error);
      throw new Error(`Failed to create embeddings: ${error.message}`);
    }
  }
}

// Export singleton instance
const openaiService = new OpenAIService();
export default openaiService;
