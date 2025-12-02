/**
 * Business Rules Engine for LLM Provider Selection
 * Implements task-based routing with KIMI K2 defaults for software/3D/gaming
 * Cost and quality optimization for content and general tasks
 */

export interface TaskClassification {
  type: 'software' | '3d' | 'gaming' | 'content' | 'general' | 'analysis' | 'research';
  complexity: 'low' | 'medium' | 'high' | 'critical';
  requirements: {
    cost: 'optimized' | 'balanced' | 'premium';
    quality: 'standard' | 'high' | 'highest';
    speed: 'standard' | 'fast' | 'fastest';
    multimodal?: boolean;
    coding?: boolean;
    creative?: boolean;
    reasoning?: boolean;
  };
}

export interface ProviderRule {
  taskTypes: string[];
  provider: string;
  model: string;
  priority: number;
  conditions: {
    costThreshold?: number;
    qualityThreshold?: number;
    speedThreshold?: number;
  };
}

export class BusinessRulesEngine {
  private rules: ProviderRule[] = [];
  
  constructor() {
    this.initializeRules();
  }

  private initializeRules(): void {
    this.rules = [
      // KIMI K2 - Default for software, 3D, gaming (as per business requirement)
      {
        taskTypes: ['software', '3d', 'gaming', 'spatial', 'webxr', 'unity'],
        provider: 'kimi-k2',
        model: 'kimi-k2-3d-engine',
        priority: 10,
        conditions: { qualityThreshold: 0.85, speedThreshold: 2000 }
      },

      // OpenAI GPT-4o - Premium content and complex reasoning
      {
        taskTypes: ['content', 'creative', 'reasoning', 'analysis'],
        provider: 'openai',
        model: 'gpt-4o',
        priority: 9,
        conditions: { qualityThreshold: 0.9, costThreshold: 0.00005 }
      },

      // Anthropic Claude 4.0 - Highest quality analysis and reasoning
      {
        taskTypes: ['analysis', 'reasoning', 'research', 'academic'],
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        priority: 10,
        conditions: { qualityThreshold: 0.95 }
      },

      // Google Gemini 2.5 Pro - Multimodal and cost-effective content
      {
        taskTypes: ['content', 'multimodal', 'vision', 'general'],
        provider: 'google',
        model: 'gemini-2.5-pro',
        priority: 8,
        conditions: { costThreshold: 0.00003, qualityThreshold: 0.85 }
      },

      // Groq - Speed-optimized tasks
      {
        taskTypes: ['general', 'chat', 'quick-response'],
        provider: 'groq',
        model: 'mixtral-8x7b-32768',
        priority: 7,
        conditions: { speedThreshold: 1000, costThreshold: 0.000001 }
      },

      // Together AI - Cost-optimized bulk content (higher priority for content)
      {
        taskTypes: ['content', 'bulk', 'batch', 'cost-optimized'],
        provider: 'together',
        model: 'meta-llama/Meta-Llama-3.3-70B-Instruct-Turbo',
        priority: 9,
        conditions: { costThreshold: 0.000005 }
      },

      // Perplexity - Research and real-time information
      {
        taskTypes: ['research', 'search', 'real-time', 'fact-checking'],
        provider: 'perplexity',
        model: 'llama-3.1-sonar-large-128k-online',
        priority: 9,
        conditions: { qualityThreshold: 0.88 }
      },

      // X.AI Grok - Real-time and trending topics
      {
        taskTypes: ['real-time', 'trending', 'social', 'news'],
        provider: 'xai',
        model: 'grok-2-vision-1212',
        priority: 8,
        conditions: { speedThreshold: 1500 }
      },

      // DeepSeek - Code and mathematical reasoning
      {
        taskTypes: ['code', 'math', 'engineering', 'technical'],
        provider: 'deepseek',
        model: 'deepseek-coder',
        priority: 8,
        conditions: { qualityThreshold: 0.87 }
      },

      // ElevenLabs - Voice synthesis
      {
        taskTypes: ['voice', 'audio', 'tts', 'speech'],
        provider: 'elevenlabs',
        model: 'eleven_multilingual_v2',
        priority: 10,
        conditions: { qualityThreshold: 0.9 }
      },

      // Replicate - Image and video generation
      {
        taskTypes: ['image', 'video', 'visual', 'generation'],
        provider: 'replicate',
        model: 'flux-schnell',
        priority: 9,
        conditions: { qualityThreshold: 0.85 }
      }
    ];
  }

  /**
   * Classify task and select optimal provider based on business rules
   */
  selectProvider(prompt: string, taskHint?: string, requirements?: any): {
    provider: string;
    model: string;
    reasoning: string;
    confidence: number;
  } {
    const classification = this.classifyTask(prompt, taskHint);
    const matchingRules = this.getMatchingRules(classification);
    
    if (matchingRules.length === 0) {
      // Fallback to default rules
      return this.getDefaultProvider(classification);
    }

    // Sort by priority and select best match
    const bestRule = matchingRules.sort((a, b) => b.priority - a.priority)[0];
    
    return {
      provider: bestRule.provider,
      model: bestRule.model,
      reasoning: this.generateReasoning(classification, bestRule),
      confidence: this.calculateConfidence(classification, bestRule)
    };
  }

  private classifyTask(prompt: string, taskHint?: string): TaskClassification {
    const lowerPrompt = prompt.toLowerCase();
    
    // Check for software development keywords
    if (this.containsKeywords(lowerPrompt, ['app', 'website', 'software', 'development', 'code', 'react', 'node', 'api', 'backend', 'frontend', 'fullstack'])) {
      return {
        type: 'software',
        complexity: this.assessComplexity(lowerPrompt),
        requirements: {
          cost: 'balanced',
          quality: 'high',
          speed: 'standard',
          coding: true
        }
      };
    }

    // Check for 3D/gaming keywords
    if (this.containsKeywords(lowerPrompt, ['3d', 'game', 'unity', 'avatar', 'vr', 'ar', 'xr', 'spatial', 'immersive', 'webgl', 'three.js'])) {
      return {
        type: 'gaming',
        complexity: this.assessComplexity(lowerPrompt),
        requirements: {
          cost: 'balanced',
          quality: 'highest',
          speed: 'standard',
          multimodal: true
        }
      };
    }

    // Check for content creation
    if (this.containsKeywords(lowerPrompt, ['content', 'blog', 'article', 'write', 'creative', 'story', 'copy', 'marketing']) && 
        !this.containsKeywords(lowerPrompt, ['app', 'software', '3d', 'game', 'unity', 'vr', 'ar'])) {
      return {
        type: 'content',
        complexity: this.assessComplexity(lowerPrompt),
        requirements: {
          cost: 'optimized',
          quality: 'high',
          speed: 'standard',
          creative: true
        }
      };
    }

    // Check for analysis/research
    if (this.containsKeywords(lowerPrompt, ['analyze', 'research', 'study', 'investigate', 'data', 'insights', 'report'])) {
      return {
        type: 'analysis',
        complexity: this.assessComplexity(lowerPrompt),
        requirements: {
          cost: 'balanced',
          quality: 'highest',
          speed: 'standard',
          reasoning: true
        }
      };
    }

    // Default to general
    return {
      type: 'general',
      complexity: 'medium',
      requirements: {
        cost: 'balanced',
        quality: 'high',
        speed: 'standard'
      }
    };
  }

  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private assessComplexity(prompt: string): 'low' | 'medium' | 'high' | 'critical' {
    const complexityIndicators = {
      high: ['enterprise', 'scalable', 'production', 'complex', 'advanced', 'sophisticated'],
      medium: ['standard', 'basic', 'simple', 'straightforward'],
      low: ['quick', 'simple', 'basic', 'minimal']
    };

    const lowerPrompt = prompt.toLowerCase();
    
    if (this.containsKeywords(lowerPrompt, complexityIndicators.high)) {
      return 'high';
    } else if (this.containsKeywords(lowerPrompt, complexityIndicators.low)) {
      return 'low';
    }
    
    return 'medium';
  }

  private getMatchingRules(classification: TaskClassification): ProviderRule[] {
    const matchingRules = this.rules.filter(rule => 
      rule.taskTypes.includes(classification.type) ||
      rule.taskTypes.includes('general')
    );
    
    // Ensure KIMI K2 is not used for content tasks unless they're software/3D related
    if (classification.type === 'content') {
      return matchingRules.filter(rule => 
        rule.provider !== 'kimi-k2' || rule.taskTypes.includes('software') || rule.taskTypes.includes('3d')
      );
    }
    
    return matchingRules;
  }

  private getDefaultProvider(classification: TaskClassification): {
    provider: string;
    model: string;
    reasoning: string;
    confidence: number;
  } {
    // Default fallback based on task type
    switch (classification.type) {
      case 'software':
      case '3d':
      case 'gaming':
        return {
          provider: 'kimi-k2',
          model: 'kimi-k2-3d-engine',
          reasoning: 'Default KIMI K2 for software/3D/gaming tasks',
          confidence: 0.85
        };
      case 'content':
        return {
          provider: 'together',
          model: 'meta-llama/Meta-Llama-3.3-70B-Instruct-Turbo',
          reasoning: 'Cost-optimized content generation',
          confidence: 0.8
        };
      default:
        return {
          provider: 'openai',
          model: 'gpt-4o',
          reasoning: 'General purpose high-quality provider',
          confidence: 0.75
        };
    }
  }

  private generateReasoning(classification: TaskClassification, rule: ProviderRule): string {
    return `Selected ${rule.provider} for ${classification.type} task based on ${rule.taskTypes.join(', ')} specialization with priority ${rule.priority}`;
  }

  private calculateConfidence(classification: TaskClassification, rule: ProviderRule): number {
    let confidence = 0.7;
    
    // Boost confidence for direct task type matches
    if (rule.taskTypes.includes(classification.type)) {
      confidence += 0.2;
    }
    
    // Boost for high priority rules
    if (rule.priority >= 9) {
      confidence += 0.1;
    }
    
    return Math.min(0.99, confidence);
  }

  /**
   * Get all available providers with their capabilities
   */
  getAllProviders(): Array<{
    id: string;
    name: string;
    capabilities: string[];
    costLevel: 'low' | 'medium' | 'high';
    qualityLevel: 'standard' | 'high' | 'highest';
  }> {
    return [
      { id: 'kimi-k2', name: 'KIMI K2', capabilities: ['software', '3d', 'gaming', 'spatial'], costLevel: 'medium', qualityLevel: 'highest' },
      { id: 'openai', name: 'OpenAI GPT-4o', capabilities: ['general', 'content', 'reasoning'], costLevel: 'high', qualityLevel: 'highest' },
      { id: 'anthropic', name: 'Claude 4.0', capabilities: ['analysis', 'reasoning', 'research'], costLevel: 'medium', qualityLevel: 'highest' },
      { id: 'google', name: 'Gemini 2.5 Pro', capabilities: ['multimodal', 'content', 'general'], costLevel: 'low', qualityLevel: 'high' },
      { id: 'xai', name: 'Grok-2', capabilities: ['real-time', 'trending', 'social'], costLevel: 'medium', qualityLevel: 'high' },
      { id: 'perplexity', name: 'Perplexity Sonar', capabilities: ['research', 'search', 'real-time'], costLevel: 'medium', qualityLevel: 'high' },
      { id: 'groq', name: 'Groq Mixtral', capabilities: ['speed', 'general'], costLevel: 'low', qualityLevel: 'standard' },
      { id: 'together', name: 'Together AI', capabilities: ['cost-optimized', 'bulk'], costLevel: 'low', qualityLevel: 'standard' },
      { id: 'deepseek', name: 'DeepSeek', capabilities: ['code', 'math', 'technical'], costLevel: 'low', qualityLevel: 'high' },
      { id: 'elevenlabs', name: 'ElevenLabs', capabilities: ['voice', 'audio', 'tts'], costLevel: 'medium', qualityLevel: 'highest' },
      { id: 'replicate', name: 'Replicate', capabilities: ['image', 'video', 'visual'], costLevel: 'medium', qualityLevel: 'high' },
      { id: 'qwen', name: 'Alibaba Qwen', capabilities: ['multilingual', 'reasoning'], costLevel: 'low', qualityLevel: 'high' },
      { id: 'ollama', name: 'Ollama Local', capabilities: ['privacy', 'local'], costLevel: 'low', qualityLevel: 'standard' }
    ];
  }
}

export const businessRulesEngine = new BusinessRulesEngine();