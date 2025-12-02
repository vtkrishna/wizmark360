/**
 * WAI AI Assistant Service
 * Real-time LLM integration with WAI orchestration SDK
 */

import { waiOrchestrator } from './unified-orchestration-client';
import { enhancedAIAssistantBuilder } from './enhanced-ai-assistant-builder';

export interface AIAssistantConfig {
  id?: string;
  name: string;
  description: string;
  personality: {
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
  };
  capabilities: {
    textChat: boolean;
    voiceChat: boolean;
    videoChat: boolean;
    documentAnalysis: boolean;
    webSearch: boolean;
    imageGeneration: boolean;
    codeGeneration: boolean;
    translation: boolean;
    sentiment: boolean;
    contextAwareness: boolean;
  };
  voice?: {
    enabled: boolean;
    autoDetect: boolean;
    cloned: boolean;
  };
  multiLanguage?: {
    enabled: boolean;
    autoSwitch: boolean;
    supportedLanguages?: string[];
  };
  languages: string[];
  primaryLanguage: string;
  autoDetectLanguage: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    language?: string;
    sentiment?: string;
    confidence?: number;
  };
}

export interface AssistantResponse {
  message: string;
  language: string;
  confidence: number;
  processingTime: number;
  metadata: {
    llmProvider: string;
    model: string;
    tokens: number;
    cost: number;
  };
}

export class WAIAIAssistantService {
  private activeAssistants: Map<string, AIAssistantConfig> = new Map();

  constructor() {
    // WAI orchestration is available globally as enhancedWAI
    // Enhanced AI assistant builder is available globally as enhancedAIAssistantBuilder
  }

  /**
   * Create AI assistant with WAI orchestration
   */
  async createAssistant(config: AIAssistantConfig): Promise<string> {
    try {
      const assistantId = `assistant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Configure system prompt based on personality
      const systemPrompt = this.generateSystemPrompt(config);
      
      // Register with WAI orchestration
      await waiOrchestrator.createAgent({
        name: config.name,
        type: 'ai-assistant',
        role: 'assistant',
        capabilities: Object.keys(config.capabilities).filter(cap => config.capabilities[cap as keyof typeof config.capabilities]),
        systemPrompt,
        metadata: {
          personality: config.personality,
          languages: config.languages,
          primaryLanguage: config.primaryLanguage
        }
      });

      // Store assistant configuration
      this.activeAssistants.set(assistantId, { ...config, id: assistantId });

      // Initialize knowledge base if document analysis is enabled
      if (config.capabilities.documentAnalysis) {
        await this.initializeKnowledgeBase(assistantId);
      }

      return assistantId;
    } catch (error) {
      console.error('Error creating AI assistant:', error);
      throw new Error('Failed to create AI assistant');
    }
  }

  /**
   * Process message with real-time LLM
   */
  async processMessage(
    assistantId: string, 
    message: string, 
    history: ChatMessage[] = []
  ): Promise<AssistantResponse> {
    try {
      const assistant = this.activeAssistants.get(assistantId);
      if (!assistant) {
        throw new Error('Assistant not found');
      }

      const startTime = Date.now();

      // Detect language if auto-detection is enabled
      let detectedLanguage = assistant.primaryLanguage;
      if (assistant.autoDetectLanguage && assistant.voice?.autoDetect) {
        detectedLanguage = await this.detectLanguage(message);
      }

      // Prepare context with conversation history
      const context = this.prepareContext(assistant, history, message);

      // Route request through WAI orchestration for optimal LLM selection
      const response = await this.waiOrchestration.processRequest({
        agentId: assistantId,
        input: message,
        context,
        requirements: {
          language: detectedLanguage,
          capabilities: assistant.capabilities,
          personality: assistant.personality.communicationStyle
        }
      });

      const processingTime = Date.now() - startTime;

      // Analyze sentiment if enabled
      let sentiment = undefined;
      if (assistant.capabilities.sentiment) {
        sentiment = await this.analyzeSentiment(message);
      }

      return {
        message: response.output,
        language: detectedLanguage,
        confidence: response.confidence || 0.95,
        processingTime,
        metadata: {
          llmProvider: response.provider || 'openai',
          model: response.model || 'gpt-4o',
          tokens: response.tokens || 0,
          cost: response.cost || 0
        }
      };
    } catch (error) {
      console.error('Error processing message:', error);
      throw new Error('Failed to process message');
    }
  }

  /**
   * Test assistant functionality
   */
  async testAssistant(assistantId: string, testMessage: string): Promise<AssistantResponse> {
    return this.processMessage(assistantId, testMessage, []);
  }

  /**
   * Update assistant configuration
   */
  async updateAssistant(assistantId: string, updates: Partial<AIAssistantConfig>): Promise<void> {
    const assistant = this.activeAssistants.get(assistantId);
    if (!assistant) {
      throw new Error('Assistant not found');
    }

    const updatedAssistant = { ...assistant, ...updates };
    this.activeAssistants.set(assistantId, updatedAssistant);

    // Update WAI orchestration registration
    await this.waiOrchestration.updateAgent(assistantId, {
      capabilities: Object.keys(updatedAssistant.capabilities).filter(cap => 
        updatedAssistant.capabilities[cap as keyof typeof updatedAssistant.capabilities]
      ),
      systemPrompt: this.generateSystemPrompt(updatedAssistant),
      metadata: {
        personality: updatedAssistant.personality,
        languages: updatedAssistant.languages,
        primaryLanguage: updatedAssistant.primaryLanguage
      }
    });
  }

  /**
   * Get assistant analytics
   */
  async getAssistantAnalytics(assistantId: string) {
    return this.waiOrchestration.getAgentAnalytics(assistantId);
  }

  /**
   * List all assistants
   */
  async listAssistants(): Promise<AIAssistantConfig[]> {
    return Array.from(this.activeAssistants.values());
  }

  /**
   * Delete assistant
   */
  async deleteAssistant(assistantId: string): Promise<void> {
    await this.waiOrchestration.removeAgent(assistantId);
    this.activeAssistants.delete(assistantId);
  }

  /**
   * Clone voice for assistant
   */
  async cloneVoice(assistantId: string, audioFile: Buffer, voiceName: string): Promise<string> {
    try {
      // Integration with ElevenLabs or similar voice cloning service
      const voiceId = await this.aiAssistantBuilder.cloneVoice(audioFile, voiceName);
      
      // Update assistant configuration
      const assistant = this.activeAssistants.get(assistantId);
      if (assistant && assistant.voice) {
        assistant.voice.cloned = true;
        this.activeAssistants.set(assistantId, assistant);
      }

      return voiceId;
    } catch (error) {
      console.error('Error cloning voice:', error);
      throw new Error('Failed to clone voice');
    }
  }

  /**
   * Generate embedding code for website integration
   */
  generateEmbedCode(assistantId: string, customization: any = {}): string {
    const assistant = this.activeAssistants.get(assistantId);
    if (!assistant) {
      throw new Error('Assistant not found');
    }

    return `
<!-- WAI AI Assistant Embed -->
<div id="wai-assistant-${assistantId}"></div>
<script>
(function() {
  const script = document.createElement('script');
  script.src = '${process.env.BASE_URL || 'http://localhost:5000'}/embed/assistant.js';
  script.async = true;
  script.onload = function() {
    WAIAssistant.init({
      assistantId: '${assistantId}',
      container: '#wai-assistant-${assistantId}',
      apiEndpoint: '${process.env.BASE_URL || 'http://localhost:5000'}/api/assistant',
      theme: ${JSON.stringify(customization.theme || 'light')},
      position: '${customization.position || 'bottom-right'}',
      primaryColor: '${customization.primaryColor || '#3b82f6'}',
      voiceEnabled: ${assistant.voice?.enabled || false},
      languages: ${JSON.stringify(assistant.languages)},
      autoDetectLanguage: ${assistant.autoDetectLanguage}
    });
  };
  document.head.appendChild(script);
})();
</script>`;
  }

  // Private helper methods

  private generateSystemPrompt(config: AIAssistantConfig): string {
    return `You are ${config.name}, an AI assistant with the following characteristics:

Personality:
- Traits: ${config.personality.traits.join(', ')}
- Communication Style: ${config.personality.communicationStyle}
- Temperament: ${config.personality.temperament}
- Expertise: ${config.personality.expertise.join(', ')}
- Cultural Context: ${config.personality.culturalContext}

Response Patterns:
- Greeting: "${config.personality.responsePatterns.greeting}"
- Farewell: "${config.personality.responsePatterns.farewell}"
- Uncertainty: "${config.personality.responsePatterns.uncertainty}"
- Error: "${config.personality.responsePatterns.error}"

Capabilities: ${Object.keys(config.capabilities).filter(cap => 
  config.capabilities[cap as keyof typeof config.capabilities]
).join(', ')}

Languages: ${config.languages.join(', ')} (Primary: ${config.primaryLanguage})

Always respond according to your personality and capabilities. If asked about something outside your expertise, politely redirect or admit uncertainty using your configured uncertainty response.`;
  }

  private prepareContext(assistant: AIAssistantConfig, history: ChatMessage[], currentMessage: string): string {
    let context = `Assistant: ${assistant.name}\nDescription: ${assistant.description}\n\n`;
    
    if (history.length > 0) {
      context += "Conversation History:\n";
      history.slice(-10).forEach(msg => {
        context += `${msg.role}: ${msg.content}\n`;
      });
      context += "\n";
    }
    
    context += `Current Message: ${currentMessage}`;
    return context;
  }

  private async detectLanguage(text: string): Promise<string> {
    try {
      // Use WAI orchestration for language detection
      const result = await this.waiOrchestration.processRequest({
        agentId: 'language-detector',
        input: text,
        context: 'Detect the language of this text and return the ISO language code.',
        requirements: { task: 'language-detection' }
      });
      
      return result.output || 'en';
    } catch (error) {
      console.error('Language detection failed:', error);
      return 'en'; // Default to English
    }
  }

  private async analyzeSentiment(text: string): Promise<string> {
    try {
      const result = await this.waiOrchestration.processRequest({
        agentId: 'sentiment-analyzer',
        input: text,
        context: 'Analyze the sentiment of this text and return positive, negative, or neutral.',
        requirements: { task: 'sentiment-analysis' }
      });
      
      return result.output || 'neutral';
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return 'neutral';
    }
  }

  private async initializeKnowledgeBase(assistantId: string): Promise<void> {
    // Initialize vector store and knowledge base for document analysis
    await this.waiOrchestration.initializeKnowledgeBase(assistantId);
  }

  /**
   * Translate text between languages
   */
  async translateText(text: string, fromLanguage: string, toLanguage: string): Promise<any> {
    try {
      // Use enhanced WAI orchestration for translation
      const response = await waiOrchestrator.processMessage({
        message: `Translate the following text from ${fromLanguage} to ${toLanguage}: "${text}"`,
        context: {
          task: 'translation',
          sourceLanguage: fromLanguage,
          targetLanguage: toLanguage,
          preserveFormatting: true
        }
      });

      return {
        text: response.content,
        confidence: response.confidence || 0.95,
        detectedLanguage: fromLanguage,
        processingTime: response.processingTime
      };
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Translation failed');
    }
  }

  /**
   * Generate voice from text
   */
  async generateVoice(text: string, language: string, voiceProfile?: any): Promise<any> {
    try {
      // Use enhanced WAI orchestration for voice generation
      const response = await waiOrchestrator.processMessage({
        message: `Generate voice sample for: "${text}"`,
        context: {
          task: 'voice-generation',
          language: language,
          voiceProfile: voiceProfile,
          outputFormat: 'mp3'
        }
      });

      // Simulate voice generation - in production this would use actual TTS services
      const audioUrl = `/api/audio/generated/${Date.now()}.mp3`;
      
      return {
        audioUrl,
        duration: Math.round(text.length * 0.1), // Estimated duration
        voiceProfile: voiceProfile || { name: 'Default', language },
        processingTime: response.processingTime
      };
    } catch (error) {
      console.error('Voice generation error:', error);
      throw new Error('Voice generation failed');
    }
  }
}

export const waiAIAssistantService = new WAIAIAssistantService();