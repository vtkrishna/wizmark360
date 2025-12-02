/**
 * AI Assistant Creation Service - COMPATIBILITY WRAPPER
 * 
 * This service delegates to the main AI Assistant Builder for consolidated functionality
 * while maintaining the specialized features for Indian languages and 3D avatars.
 */

import { AIAssistantBuilder } from './ai-assistant-builder';
import { EventEmitter } from 'events';

export interface IndianLanguage {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  voiceSupport: boolean;
  textSupport: boolean;
  rtlSupport: boolean;
}

export interface VoiceProfile {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  accent: string;
  sample?: string;
  isCloned?: boolean;
  originalSpeaker?: string;
}

export interface Avatar3D {
  id: string;
  name: string;
  type: 'realistic' | 'cartoon' | 'professional' | 'casual';
  gender: 'male' | 'female' | 'neutral';
  ethnicity: string;
  customizations: {
    hair: string;
    clothing: string;
    accessories: string[];
  };
  animations: string[];
}

export interface AssistantPersonality {
  traits: string[];
  communicationStyle: 'formal' | 'casual' | 'friendly' | 'professional' | 'empathetic';
  expertise: string[];
  temperament: 'calm' | 'energetic' | 'balanced' | 'enthusiastic';
  culturalContext: string;
  responsePatterns: {
    greeting: string;
    farewell: string;
    uncertainty: string;
    error: string;
  };
}

export interface AIAssistant {
  id: string;
  name: string;
  description: string;
  personality: AssistantPersonality;
  languages: IndianLanguage[];
  voiceProfile?: VoiceProfile;
  avatar?: Avatar3D;
  status: 'active' | 'inactive' | 'training';
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

// Compatibility wrapper class
export class AIAssistantCreationService extends EventEmitter {
  private builderService: AIAssistantBuilder;

  constructor() {
    super();
    this.builderService = new AIAssistantBuilder();
  }

  async createAssistantWithLanguageSupport(config: any) {
    // Delegate to comprehensive builder with language features
    return await this.builderService.createAssistant({
      ...config,
      capabilities: {
        ...config.capabilities,
        multiLanguage: true,
        voiceCloning: true,
        avatar3D: true
      }
    });
  }
}

// Export singleton instance for backward compatibility
export const aiAssistantCreationService = new AIAssistantCreationService();