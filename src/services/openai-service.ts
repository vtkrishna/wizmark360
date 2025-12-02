/**
 * OpenAI Service - Simple wrapper for embeddings
 * Wraps the existing OpenAI provider for easy integration
 */

import { OpenAIProvider } from './llm-providers/openai-provider.js';

class OpenAIService {
  private provider: OpenAIProvider;

  constructor() {
    this.provider = new OpenAIProvider();
  }

  /**
   * Create embedding for single text input
   */
  async createEmbedding(options: { input: string; model?: string }) {
    const embeddings = await this.provider.generateEmbeddings([options.input], options.model);
    return {
      data: [{
        embedding: embeddings[0]
      }]
    };
  }

  /**
   * Create embeddings for multiple text inputs
   */
  async createEmbeddings(texts: string[], model = 'text-embedding-3-small') {
    const embeddings = await this.provider.generateEmbeddings(texts, model);
    return {
      data: embeddings.map(embedding => ({ embedding }))
    };
  }
}

// Export singleton instance
const openaiService = new OpenAIService();
export default openaiService;