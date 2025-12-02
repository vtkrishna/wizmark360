/**
 * AI Assistant Service - COMPATIBILITY WRAPPER
 * 
 * This service delegates to the comprehensive AI Assistant Builder for unified functionality
 * while maintaining the database-focused assistant management interface.
 */

import { AIAssistantBuilder } from './ai-assistant-builder';
import { db } from '../db';
import { aiAssistants, assistantMetrics, assistantVersions } from '@shared/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

// Compatibility interfaces maintained for backward compatibility
export interface AssistantConfig {
  id: string;
  name: string;
  description: string;
  avatar: string;
  status: 'active' | 'inactive' | 'testing' | 'maintenance';
  version: string;
  languages: string[];
  capabilities: string[];
  ragConfig: {
    vectorDB: string;
    documents: number;
    chunkSize: number;
    embeddingModel: string;
  };
  voiceConfig?: {
    provider: string;
    voice: string;
    language: string;
    accent: string;
  };
  abTest?: {
    variant: 'A' | 'B';
    conversions: number;
    improvement: number;
  };
}

// Compatibility wrapper class
export class AIAssistantService {
  private builderService: AIAssistantBuilder;

  constructor() {
    this.builderService = new AIAssistantBuilder();
  }

  /**
   * Create a new AI assistant using the comprehensive builder service
   */
  async createAssistant(config: Partial<AssistantConfig>) {
    try {
      // Map to comprehensive builder configuration
      const builderConfig = {
        id: config.id || Math.random().toString(36),
        name: config.name || 'Untitled Assistant',
        description: config.description || '',
        personality: {
          tone: 'professional' as const,
          expertise: config.capabilities || [],
          responseStyle: 'detailed' as const,
          behaviorTraits: []
        },
        knowledgeBase: {
          documents: [],
          ragEnabled: !!config.ragConfig,
          maxContextTokens: config.ragConfig?.chunkSize || 4000,
          searchThreshold: 0.7
        },
        capabilities: {
          ocr: true,
          imageAnalysis: true,
          codeGeneration: true,
          webSearch: true,
          apiIntegrations: []
        },
        appearance: {
          avatar: config.avatar || '/default-avatar.png',
          primaryColor: '#3B82F6',
          theme: 'auto' as const,
          position: 'bottom-right' as const,
          size: 'medium' as const
        },
        deployment: {
          embedCode: '',
          apiEndpoint: '',
          allowedDomains: ['*']
        },
        settings: {
          isActive: config.status === 'active',
          isPublic: true,
          maxConversationLength: 50,
          rateLimiting: {
            requestsPerMinute: 60,
            requestsPerHour: 1000
          }
        }
      };

      return await this.builderService.createAssistant(builderConfig);
    } catch (error) {
      throw new Error(`Assistant creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance for backward compatibility
export const aiAssistantService = new AIAssistantService();