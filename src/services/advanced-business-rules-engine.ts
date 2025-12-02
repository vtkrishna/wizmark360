/**
 * Advanced Business Rules Engine with 3-Level Fallback System
 * Comprehensive LLM selection for all 13 providers with task-specific optimization
 */

export interface AdvancedProviderRule {
  taskType: string;
  contentSubtype?: string;
  primary: {
    provider: string;
    model: string;
    reasoning: string;
    benchmarks: {
      quality: number;
      speed: number;
      cost: number;
      contextLength: number;
      specialization: string[];
    };
  };
  fallback1: {
    provider: string;
    model: string;
    reasoning: string;
    benchmarks: {
      quality: number;
      speed: number;
      cost: number;
      contextLength: number;
    };
  };
  fallback2: {
    provider: string;
    model: string;
    reasoning: string;
    benchmarks: {
      quality: number;
      speed: number;
      cost: number;
      contextLength: number;
    };
  };
  conditions: {
    minQuality?: number;
    maxCost?: number;
    minSpeed?: number;
    requiresSpecialization?: string[];
  };
}

export interface AgentLLMMapping {
  agentType: string;
  primaryLLM: string;
  fallbackChain: string[];
  reasoning: string;
  taskExamples: string[];
}

export class AdvancedBusinessRulesEngine {
  private rules: AdvancedProviderRule[] = [
    // SOFTWARE DEVELOPMENT TASKS
    {
      taskType: 'software-development',
      contentSubtype: 'fullstack',
      primary: {
        provider: 'kimi-k2',
        model: 'kimi-k2-3d-engine',
        reasoning: '95% cost savings, 65.8% SWE-bench score, 3D/spatial computing expertise',
        benchmarks: {
          quality: 0.88,
          speed: 0.92,
          cost: 0.95,
          contextLength: 200000,
          specialization: ['software', '3d', 'spatial', 'webxr', 'unity']
        }
      },
      fallback1: {
        provider: 'google',
        model: 'gemini-2.5-pro',
        reasoning: 'Strong coding capabilities, multimodal support, 1M token context',
        benchmarks: {
          quality: 0.92,
          speed: 0.85,
          cost: 0.70,
          contextLength: 1000000
        }
      },
      fallback2: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        reasoning: 'Highest reasoning quality, excellent code understanding',
        benchmarks: {
          quality: 0.98,
          speed: 0.75,
          cost: 0.60,
          contextLength: 200000
        }
      },
      conditions: {
        minQuality: 0.85,
        requiresSpecialization: ['software', 'coding']
      }
    },

    // 3D/GAMING DEVELOPMENT
    {
      taskType: '3d-gaming',
      contentSubtype: 'unity-vr',
      primary: {
        provider: 'kimi-k2',
        model: 'kimi-k2-3d-engine',
        reasoning: 'Specialized 3D engine, AR/VR expertise, spatial computing',
        benchmarks: {
          quality: 0.95,
          speed: 0.90,
          cost: 0.95,
          contextLength: 200000,
          specialization: ['3d', 'vr', 'ar', 'spatial', 'unity', 'webxr']
        }
      },
      fallback1: {
        provider: 'qwen',
        model: 'qwen-2.5-72b-turbo',
        reasoning: 'Strong coding capabilities, good 3D understanding',
        benchmarks: {
          quality: 0.87,
          speed: 0.88,
          cost: 0.85,
          contextLength: 128000
        }
      },
      fallback2: {
        provider: 'google',
        model: 'gemini-2.5-pro',
        reasoning: 'Multimodal support for 3D visualization, strong reasoning',
        benchmarks: {
          quality: 0.90,
          speed: 0.82,
          cost: 0.70,
          contextLength: 1000000
        }
      },
      conditions: {
        minQuality: 0.85,
        requiresSpecialization: ['3d', 'gaming']
      }
    },

    // VOICE SYNTHESIS & AUDIO
    {
      taskType: 'voice-synthesis',
      contentSubtype: 'voice-clone',
      primary: {
        provider: 'elevenlabs',
        model: 'eleven_multilingual_v2',
        reasoning: 'Industry leader in voice synthesis, voice cloning, 29 languages',
        benchmarks: {
          quality: 0.98,
          speed: 0.90,
          cost: 0.60,
          contextLength: 5000,
          specialization: ['voice', 'audio', 'speech', 'clone', 'multilingual']
        }
      },
      fallback1: {
        provider: 'openai',
        model: 'tts-1-hd',
        reasoning: 'High-quality voice synthesis, multiple voices',
        benchmarks: {
          quality: 0.85,
          speed: 0.88,
          cost: 0.75,
          contextLength: 4096
        }
      },
      fallback2: {
        provider: 'google',
        model: 'gemini-2.5-pro',
        reasoning: 'Text-to-speech integration, multilingual support',
        benchmarks: {
          quality: 0.80,
          speed: 0.85,
          cost: 0.70,
          contextLength: 1000000
        }
      },
      conditions: {
        minQuality: 0.80,
        requiresSpecialization: ['voice', 'audio']
      }
    },

    // VIDEO GENERATION & PRESENTATIONS
    {
      taskType: 'video-generation',
      contentSubtype: 'hd-video',
      primary: {
        provider: 'google',
        model: 'gemini-veo-3',
        reasoning: 'Gemini Veo 3 for HD video generation, presentation creation',
        benchmarks: {
          quality: 0.95,
          speed: 0.70,
          cost: 0.60,
          contextLength: 1000000,
          specialization: ['video', 'presentations', 'visual', 'hd']
        }
      },
      fallback1: {
        provider: 'replicate',
        model: 'runway-ml-gen2',
        reasoning: 'Professional video generation, creative capabilities',
        benchmarks: {
          quality: 0.90,
          speed: 0.65,
          cost: 0.50,
          contextLength: 8192
        }
      },
      fallback2: {
        provider: 'kimi-k2',
        model: 'kimi-k2-3d-engine',
        reasoning: '3D video rendering, spatial video creation',
        benchmarks: {
          quality: 0.88,
          speed: 0.80,
          cost: 0.95,
          contextLength: 200000
        }
      },
      conditions: {
        minQuality: 0.85,
        requiresSpecialization: ['video', 'visual']
      }
    },

    // WEBSITE CREATION & DESIGN
    {
      taskType: 'website-creation',
      contentSubtype: 'design-development',
      primary: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        reasoning: 'Superior reasoning for UX/UI design, code architecture',
        benchmarks: {
          quality: 0.98,
          speed: 0.75,
          cost: 0.60,
          contextLength: 200000,
          specialization: ['web', 'design', 'ux', 'ui', 'frontend']
        }
      },
      fallback1: {
        provider: 'kimi-k2',
        model: 'kimi-k2-3d-engine',
        reasoning: 'Cost-effective development, 3D web experiences',
        benchmarks: {
          quality: 0.88,
          speed: 0.92,
          cost: 0.95,
          contextLength: 200000
        }
      },
      fallback2: {
        provider: 'google',
        model: 'gemini-2.5-pro',
        reasoning: 'Multimodal design understanding, responsive layouts',
        benchmarks: {
          quality: 0.90,
          speed: 0.85,
          cost: 0.70,
          contextLength: 1000000
        }
      },
      conditions: {
        minQuality: 0.85,
        requiresSpecialization: ['web', 'design']
      }
    },

    // CREATIVE CONTENT (BLOGS, MARKETING, AD COPY)
    {
      taskType: 'creative-content',
      contentSubtype: 'marketing-copy',
      primary: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        reasoning: 'Superior creative writing, nuanced understanding, brand voice',
        benchmarks: {
          quality: 0.98,
          speed: 0.75,
          cost: 0.60,
          contextLength: 200000,
          specialization: ['creative', 'writing', 'marketing', 'branding']
        }
      },
      fallback1: {
        provider: 'openai',
        model: 'gpt-4o',
        reasoning: 'Excellent creative capabilities, brand consistency',
        benchmarks: {
          quality: 0.95,
          speed: 0.80,
          cost: 0.65,
          contextLength: 128000
        }
      },
      fallback2: {
        provider: 'together',
        model: 'meta-llama-3.3-70b-instruct-turbo',
        reasoning: 'Cost-effective bulk content generation',
        benchmarks: {
          quality: 0.82,
          speed: 0.90,
          cost: 0.90,
          contextLength: 32768
        }
      },
      conditions: {
        minQuality: 0.80,
        maxCost: 0.000005,
        requiresSpecialization: ['creative', 'writing']
      }
    },

    // DATA ANALYSIS & INSIGHTS
    {
      taskType: 'data-analysis',
      contentSubtype: 'business-insights',
      primary: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        reasoning: 'Highest reasoning quality, complex data interpretation',
        benchmarks: {
          quality: 0.98,
          speed: 0.75,
          cost: 0.60,
          contextLength: 200000,
          specialization: ['analysis', 'reasoning', 'insights', 'data']
        }
      },
      fallback1: {
        provider: 'perplexity',
        model: 'llama-3.1-sonar-large-128k-online',
        reasoning: 'Real-time data access, research capabilities',
        benchmarks: {
          quality: 0.90,
          speed: 0.70,
          cost: 0.75,
          contextLength: 128000
        }
      },
      fallback2: {
        provider: 'deepseek',
        model: 'deepseek-coder',
        reasoning: 'Strong reasoning, data processing capabilities',
        benchmarks: {
          quality: 0.87,
          speed: 0.82,
          cost: 0.85,
          contextLength: 64000
        }
      },
      conditions: {
        minQuality: 0.85,
        requiresSpecialization: ['analysis', 'reasoning']
      }
    },

    // RESEARCH & ACADEMIC
    {
      taskType: 'research',
      contentSubtype: 'academic-scientific',
      primary: {
        provider: 'perplexity',
        model: 'llama-3.1-sonar-large-128k-online',
        reasoning: 'Real-time search, academic sources, citation capability',
        benchmarks: {
          quality: 0.90,
          speed: 0.70,
          cost: 0.75,
          contextLength: 128000,
          specialization: ['research', 'academic', 'citations', 'real-time']
        }
      },
      fallback1: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        reasoning: 'Deep reasoning, academic writing quality',
        benchmarks: {
          quality: 0.98,
          speed: 0.75,
          cost: 0.60,
          contextLength: 200000
        }
      },
      fallback2: {
        provider: 'google',
        model: 'gemini-2.5-pro',
        reasoning: 'Multimodal research, large context window',
        benchmarks: {
          quality: 0.92,
          speed: 0.85,
          cost: 0.70,
          contextLength: 1000000
        }
      },
      conditions: {
        minQuality: 0.85,
        requiresSpecialization: ['research', 'academic']
      }
    },

    // IMAGE GENERATION & VISUAL DESIGN
    {
      taskType: 'image-generation',
      contentSubtype: 'professional-design',
      primary: {
        provider: 'replicate',
        model: 'flux-schnell',
        reasoning: 'State-of-the-art image generation, professional quality',
        benchmarks: {
          quality: 0.95,
          speed: 0.80,
          cost: 0.70,
          contextLength: 8192,
          specialization: ['images', 'visual', 'design', 'art']
        }
      },
      fallback1: {
        provider: 'openai',
        model: 'dall-e-3',
        reasoning: 'High-quality image generation, prompt adherence',
        benchmarks: {
          quality: 0.90,
          speed: 0.75,
          cost: 0.60,
          contextLength: 4096
        }
      },
      fallback2: {
        provider: 'google',
        model: 'gemini-2.5-pro-vision',
        reasoning: 'Integrated text-to-image, multimodal understanding',
        benchmarks: {
          quality: 0.85,
          speed: 0.82,
          cost: 0.70,
          contextLength: 1000000
        }
      },
      conditions: {
        minQuality: 0.80,
        requiresSpecialization: ['images', 'visual']
      }
    },

    // SPEED-CRITICAL TASKS
    {
      taskType: 'speed-critical',
      contentSubtype: 'real-time',
      primary: {
        provider: 'groq',
        model: 'mixtral-8x7b-32768',
        reasoning: 'Ultra-fast inference, <500ms response time',
        benchmarks: {
          quality: 0.85,
          speed: 0.98,
          cost: 0.90,
          contextLength: 32768,
          specialization: ['speed', 'real-time', 'inference']
        }
      },
      fallback1: {
        provider: 'together',
        model: 'meta-llama-3.3-70b-instruct-turbo',
        reasoning: 'Fast inference, cost-effective',
        benchmarks: {
          quality: 0.82,
          speed: 0.90,
          cost: 0.90,
          contextLength: 32768
        }
      },
      fallback2: {
        provider: 'deepseek',
        model: 'deepseek-coder',
        reasoning: 'Balanced speed and quality',
        benchmarks: {
          quality: 0.87,
          speed: 0.82,
          cost: 0.85,
          contextLength: 64000
        }
      },
      conditions: {
        minSpeed: 0.80,
        maxCost: 0.000001
      }
    },

    // MULTILINGUAL TASKS
    {
      taskType: 'multilingual',
      contentSubtype: 'global-content',
      primary: {
        provider: 'google',
        model: 'gemini-2.5-pro',
        reasoning: '100+ languages, cultural context, localization',
        benchmarks: {
          quality: 0.92,
          speed: 0.85,
          cost: 0.70,
          contextLength: 1000000,
          specialization: ['multilingual', 'cultural', 'localization']
        }
      },
      fallback1: {
        provider: 'kimi-k2',
        model: 'kimi-k2-3d-engine',
        reasoning: '47.3% multilingual coding benchmark, cost-effective',
        benchmarks: {
          quality: 0.88,
          speed: 0.92,
          cost: 0.95,
          contextLength: 200000
        }
      },
      fallback2: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        reasoning: 'High-quality translation, cultural nuance',
        benchmarks: {
          quality: 0.98,
          speed: 0.75,
          cost: 0.60,
          contextLength: 200000
        }
      },
      conditions: {
        minQuality: 0.85,
        requiresSpecialization: ['multilingual']
      }
    },

    // LOCAL/PRIVACY TASKS
    {
      taskType: 'local-privacy',
      contentSubtype: 'sensitive-data',
      primary: {
        provider: 'ollama',
        model: 'llama3.2',
        reasoning: 'Local processing, zero data transmission, privacy-first',
        benchmarks: {
          quality: 0.80,
          speed: 0.70,
          cost: 1.0,
          contextLength: 128000,
          specialization: ['privacy', 'local', 'offline', 'secure']
        }
      },
      fallback1: {
        provider: 'together',
        model: 'meta-llama-3.3-70b-instruct-turbo',
        reasoning: 'Privacy-conscious provider, competitive pricing',
        benchmarks: {
          quality: 0.82,
          speed: 0.90,
          cost: 0.90,
          contextLength: 32768
        }
      },
      fallback2: {
        provider: 'groq',
        model: 'mixtral-8x7b-32768',
        reasoning: 'Fast local-like experience, data security',
        benchmarks: {
          quality: 0.85,
          speed: 0.98,
          cost: 0.90,
          contextLength: 32768
        }
      },
      conditions: {
        requiresSpecialization: ['privacy', 'local']
      }
    }
  ];

  // Agent to LLM Mapping with Hierarchy
  private agentLLMMapping: AgentLLMMapping[] = [
    {
      agentType: 'fullstack-developer',
      primaryLLM: 'kimi-k2',
      fallbackChain: ['google', 'anthropic', 'deepseek'],
      reasoning: 'KIMI K2 for cost-effective fullstack development with 3D capabilities',
      taskExamples: ['React apps', 'Node.js backends', 'Database integration', '3D web experiences']
    },
    {
      agentType: 'frontend-developer',
      primaryLLM: 'anthropic',
      fallbackChain: ['kimi-k2', 'google', 'openai'],
      reasoning: 'Claude for superior UI/UX reasoning and modern frontend patterns',
      taskExamples: ['React components', 'CSS animations', 'Responsive design', 'User interfaces']
    },
    {
      agentType: 'backend-developer',
      primaryLLM: 'kimi-k2',
      fallbackChain: ['deepseek', 'google', 'together'],
      reasoning: 'KIMI K2 for cost-effective backend development and API design',
      taskExamples: ['REST APIs', 'Database design', 'Server architecture', 'Microservices']
    },
    {
      agentType: 'ai-assistant-creator',
      primaryLLM: 'anthropic',
      fallbackChain: ['openai', 'google', 'perplexity'],
      reasoning: 'Claude for nuanced conversation design and personality development',
      taskExamples: ['Chatbot personalities', 'Conversation flows', 'RAG systems', 'Knowledge bases']
    },
    {
      agentType: 'content-creator',
      primaryLLM: 'anthropic',
      fallbackChain: ['openai', 'together', 'google'],
      reasoning: 'Claude for superior creative writing and brand voice consistency',
      taskExamples: ['Blog posts', 'Marketing copy', 'Creative content', 'Brand messaging']
    },
    {
      agentType: 'video-creator',
      primaryLLM: 'google',
      fallbackChain: ['replicate', 'kimi-k2', 'openai'],
      reasoning: 'Gemini Veo 3 for HD video generation and presentation creation',
      taskExamples: ['Video scripts', 'Presentations', 'Video editing', 'Visual storytelling']
    },
    {
      agentType: 'voice-synthesis-specialist',
      primaryLLM: 'elevenlabs',
      fallbackChain: ['openai', 'google', 'anthropic'],
      reasoning: 'ElevenLabs for industry-leading voice synthesis and cloning',
      taskExamples: ['Voice generation', 'Audio content', 'Podcasts', 'Voice cloning']
    },
    {
      agentType: 'data-analyst',
      primaryLLM: 'anthropic',
      fallbackChain: ['perplexity', 'deepseek', 'google'],
      reasoning: 'Claude for complex data interpretation and business insights',
      taskExamples: ['Data analysis', 'Business insights', 'Report generation', 'Trend analysis']
    },
    {
      agentType: 'researcher',
      primaryLLM: 'perplexity',
      fallbackChain: ['anthropic', 'google', 'xai'],
      reasoning: 'Perplexity for real-time research with source citations',
      taskExamples: ['Market research', 'Academic research', 'Fact checking', 'Literature reviews']
    },
    {
      agentType: '3d-game-developer',
      primaryLLM: 'kimi-k2',
      fallbackChain: ['google', 'qwen', 'anthropic'],
      reasoning: 'KIMI K2 specialized 3D engine for Unity, VR, and spatial computing',
      taskExamples: ['Unity games', 'VR experiences', '3D modeling', 'WebXR applications']
    }
  ];

  selectOptimalProvider(prompt: string, taskType?: string): {
    provider: string;
    model: string;
    reasoning: string;
    confidence: number;
    fallbackChain: { provider: string; model: string; reasoning: string }[];
    agentMapping?: AgentLLMMapping;
  } {
    // Analyze prompt to determine task type and content subtype
    const analysis = this.analyzePrompt(prompt, taskType);
    
    // Find matching rule
    const rule = this.findBestRule(analysis);
    
    if (!rule) {
      return this.getDefaultSelection(analysis);
    }

    // Find agent mapping if applicable
    const agentMapping = this.agentLLMMapping.find(mapping => 
      mapping.taskExamples.some(example => 
        prompt.toLowerCase().includes(example.toLowerCase().split(' ')[0])
      )
    );

    return {
      provider: rule.primary.provider,
      model: rule.primary.model,
      reasoning: rule.primary.reasoning,
      confidence: this.calculateConfidence(rule, analysis),
      fallbackChain: [
        {
          provider: rule.fallback1.provider,
          model: rule.fallback1.model,
          reasoning: rule.fallback1.reasoning
        },
        {
          provider: rule.fallback2.provider,
          model: rule.fallback2.model,
          reasoning: rule.fallback2.reasoning
        }
      ],
      agentMapping
    };
  }

  private analyzePrompt(prompt: string, taskType?: string): {
    taskType: string;
    contentSubtype?: string;
    keywords: string[];
    complexity: 'low' | 'medium' | 'high';
    requirements: string[];
  } {
    const lowerPrompt = prompt.toLowerCase();
    const keywords = lowerPrompt.split(' ').filter(word => word.length > 3);

    // Determine task type if not provided
    if (!taskType) {
      if (this.containsKeywords(lowerPrompt, ['3d', 'unity', 'vr', 'ar', 'game', 'spatial'])) {
        taskType = '3d-gaming';
      } else if (this.containsKeywords(lowerPrompt, ['app', 'software', 'code', 'develop', 'build'])) {
        taskType = 'software-development';
      } else if (this.containsKeywords(lowerPrompt, ['voice', 'audio', 'speech', 'synthesize'])) {
        taskType = 'voice-synthesis';
      } else if (this.containsKeywords(lowerPrompt, ['video', 'presentation', 'visual'])) {
        taskType = 'video-generation';
      } else if (this.containsKeywords(lowerPrompt, ['website', 'web', 'design', 'ui', 'ux'])) {
        taskType = 'website-creation';
      } else if (this.containsKeywords(lowerPrompt, ['blog', 'content', 'marketing', 'copy', 'creative'])) {
        taskType = 'creative-content';
      } else if (this.containsKeywords(lowerPrompt, ['analyze', 'data', 'insights', 'research'])) {
        taskType = 'data-analysis';
      } else if (this.containsKeywords(lowerPrompt, ['research', 'academic', 'study'])) {
        taskType = 'research';
      } else if (this.containsKeywords(lowerPrompt, ['image', 'picture', 'visual', 'design'])) {
        taskType = 'image-generation';
      } else if (this.containsKeywords(lowerPrompt, ['fast', 'quick', 'real-time', 'urgent'])) {
        taskType = 'speed-critical';
      } else if (this.containsKeywords(lowerPrompt, ['translate', 'language', 'multilingual'])) {
        taskType = 'multilingual';
      } else if (this.containsKeywords(lowerPrompt, ['private', 'local', 'secure', 'confidential'])) {
        taskType = 'local-privacy';
      } else {
        taskType = 'creative-content'; // Default
      }
    }

    return {
      taskType,
      keywords,
      complexity: this.assessComplexity(lowerPrompt),
      requirements: this.extractRequirements(lowerPrompt)
    };
  }

  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private findBestRule(analysis: { taskType: string; [key: string]: any }): AdvancedProviderRule | null {
    return this.rules.find(rule => rule.taskType === analysis.taskType) || null;
  }

  private assessComplexity(prompt: string): 'low' | 'medium' | 'high' {
    const complexityIndicators = [
      'complex', 'advanced', 'enterprise', 'scalable', 'production',
      'integration', 'architecture', 'optimization', 'machine learning'
    ];
    
    const matches = complexityIndicators.filter(indicator => 
      prompt.toLowerCase().includes(indicator)
    ).length;
    
    if (matches >= 3) return 'high';
    if (matches >= 1) return 'medium';
    return 'low';
  }

  private extractRequirements(prompt: string): string[] {
    const requirements: string[] = [];
    
    if (prompt.includes('fast') || prompt.includes('quick')) requirements.push('speed');
    if (prompt.includes('cheap') || prompt.includes('budget')) requirements.push('cost');
    if (prompt.includes('quality') || prompt.includes('best')) requirements.push('quality');
    if (prompt.includes('secure') || prompt.includes('private')) requirements.push('privacy');
    
    return requirements;
  }

  private calculateConfidence(rule: AdvancedProviderRule, analysis: any): number {
    let confidence = 0.85; // Base confidence
    
    // Increase confidence if task type matches exactly
    if (rule.taskType === analysis.taskType) confidence += 0.10;
    
    // Increase confidence if requirements match
    if (rule.conditions.requiresSpecialization) {
      const specializations = rule.primary.benchmarks.specialization || [];
      const matchingSpecs = specializations.filter(spec => 
        analysis.keywords.includes(spec)
      ).length;
      confidence += (matchingSpecs / specializations.length) * 0.05;
    }
    
    return Math.min(0.99, confidence);
  }

  private getDefaultSelection(analysis: any) {
    return {
      provider: 'anthropic',
      model: 'claude-sonnet-4-20250514',
      reasoning: 'Default high-quality provider for general tasks',
      confidence: 0.70,
      fallbackChain: [
        { provider: 'openai', model: 'gpt-4o', reasoning: 'Reliable general-purpose alternative' },
        { provider: 'google', model: 'gemini-2.5-pro', reasoning: 'Large context window for complex tasks' }
      ]
    };
  }

  getAllRules(): AdvancedProviderRule[] {
    return this.rules;
  }

  getAgentMappings(): AgentLLMMapping[] {
    return this.agentLLMMapping;
  }

  // Get optimal LLM for specific agent type
  getLLMForAgent(agentType: string): AgentLLMMapping | null {
    return this.agentLLMMapping.find(mapping => mapping.agentType === agentType) || null;
  }
}

export const advancedBusinessRulesEngine = new AdvancedBusinessRulesEngine();