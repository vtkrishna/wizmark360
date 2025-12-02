/**
 * Context-Aware LLM Selection System
 * 
 * Implements intelligent model selection based on:
 * - Conversation history analysis
 * - Project-specific model preferences
 * - Domain expertise matching
 * - Multi-modal capability requirements
 * - User satisfaction feedback loops
 * - Real-time performance optimization
 */

import { EventEmitter } from 'events';
import { openRouterGateway, type OpenRouterModel, type ContextAnalysis, type ModelSelection } from './openrouter-universal-gateway';
import { kimiK2Provider } from './kimi-k2-provider';

export interface ConversationContext {
  sessionId: string;
  userId?: string;
  projectId?: string;
  conversationHistory: ConversationMessage[];
  taskSequence: TaskContext[];
  userPreferences: UserPreferences;
  projectPreferences: ProjectPreferences;
  domainContext: DomainContext;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  modelUsed?: string;
  tokenCount?: number;
  responseTime?: number;
  userFeedback?: UserFeedback;
  taskType?: string;
  complexity?: string;
}

export interface TaskContext {
  taskId: string;
  type: 'coding' | 'creative' | 'analytical' | 'multimodal' | 'reasoning' | 'general';
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  domain: string;
  urgency: 'low' | 'medium' | 'high';
  qualityRequirement: 'basic' | 'good' | 'excellent' | 'perfect';
  expectedDuration: number; // minutes
  dependencies: string[];
  progress: number; // 0-1
  startTime: Date;
  lastActivity: Date;
}

export interface UserPreferences {
  preferredProviders: string[];
  budgetConstraint: 'free' | 'low' | 'medium' | 'high';
  qualityVsSpeed: number; // 0-1, 0=speed, 1=quality
  languagePreference: string[];
  domainExpertise: string[];
  communicationStyle: 'concise' | 'detailed' | 'academic' | 'conversational';
  feedbackHistory: UserFeedback[];
  learningPreferences: {
    adaptToSuccess: boolean;
    adaptToFailures: boolean;
    exploreNewModels: boolean;
    stickToFavorites: boolean;
  };
}

export interface ProjectPreferences {
  projectType: string;
  techStack: string[];
  qualityStandards: string[];
  budgetConstraints: Record<string, number>;
  preferredModels: string[];
  fallbackModels: string[];
  domainRequirements: string[];
  complianceRequirements: string[];
  performanceRequirements: {
    maxResponseTime: number;
    minQualityScore: number;
    maxCostPerRequest: number;
  };
}

export interface DomainContext {
  primaryDomain: string;
  subDomains: string[];
  requiredExpertise: string[];
  technicalLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  industry: string;
  specializedTerminology: string[];
  complianceRequirements: string[];
  culturalContext: string[];
}

export interface UserFeedback {
  messageId: string;
  rating: number; // 1-5
  aspects: {
    accuracy: number;
    helpfulness: number;
    clarity: number;
    completeness: number;
    relevance: number;
  };
  freeformFeedback?: string;
  timestamp: Date;
  followUpQuestions?: string[];
  taskCompleted: boolean;
  wouldUseAgain: boolean;
}

export interface SelectionCriteria {
  contextWeight: number;
  performanceWeight: number;
  costWeight: number;
  qualityWeight: number;
  speedWeight: number;
  domainWeight: number;
  userPreferenceWeight: number;
  projectPreferenceWeight: number;
}

export interface ModelPerformanceMetrics {
  modelId: string;
  successRate: number;
  averageResponseTime: number;
  averageQualityScore: number;
  costEfficiency: number;
  domainPerformance: Record<string, number>;
  userSatisfactionScore: number;
  contextAwareness: number;
  adaptabilityScore: number;
  lastUpdated: Date;
  sampleSize: number;
}

export class ContextAwareLLMSelection extends EventEmitter {
  private conversationContexts: Map<string, ConversationContext> = new Map();
  private modelPerformanceMetrics: Map<string, ModelPerformanceMetrics> = new Map();
  private domainModelMappings: Map<string, string[]> = new Map();
  private adaptiveLearningEngine: AdaptiveLearningEngine;
  
  // Selection algorithms
  private selectionStrategies = {
    contextAware: this.contextAwareStrategy.bind(this),
    performanceBased: this.performanceBasedStrategy.bind(this),
    costOptimized: this.costOptimizedStrategy.bind(this),
    qualityFocused: this.qualityFocusedStrategy.bind(this),
    domainSpecific: this.domainSpecificStrategy.bind(this),
    adaptive: this.adaptiveStrategy.bind(this),
    hybrid: this.hybridStrategy.bind(this)
  };

  constructor() {
    super();
    this.adaptiveLearningEngine = new AdaptiveLearningEngine();
    this.initializeContextAwareSelection();
  }

  /**
   * Initialize the context-aware selection system
   */
  private async initializeContextAwareSelection(): Promise<void> {
    console.log('🧠 Initializing Context-Aware LLM Selection System...');
    
    try {
      // Initialize domain model mappings
      await this.initializeDomainMappings();
      
      // Initialize performance metrics
      await this.initializePerformanceMetrics();
      
      // Start adaptive learning
      await this.adaptiveLearningEngine.initialize();
      
      // Start performance monitoring
      this.startPerformanceMonitoring();
      
      console.log('✅ Context-Aware LLM Selection initialized successfully');
      this.emit('initialized');
    } catch (error) {
      console.error('❌ Context-aware selection initialization failed:', error);
      this.emit('initialization-failed', error);
    }
  }

  /**
   * Select optimal model based on comprehensive context analysis
   */
  async selectOptimalModel(
    request: {
      prompt: string;
      taskType?: string;
      context?: string;
      urgency?: 'low' | 'medium' | 'high';
      qualityRequirement?: 'basic' | 'good' | 'excellent' | 'perfect';
    },
    conversationContext: ConversationContext,
    selectionStrategy: keyof typeof this.selectionStrategies = 'hybrid'
  ): Promise<ModelSelection & { contextAnalysis: ContextAnalysis; reasoning: string[] }> {
    console.log('🎯 Performing context-aware model selection...');
    
    try {
      // Analyze conversation context
      const contextAnalysis = await this.analyzeConversationContext(request, conversationContext);
      
      // Get available models
      const availableModels = openRouterGateway.getAvailableModels();
      
      // Apply selection strategy
      const strategy = this.selectionStrategies[selectionStrategy];
      const selection = await strategy(availableModels, contextAnalysis, conversationContext);
      
      // Apply adaptive learning insights
      const adaptiveSelection = await this.adaptiveLearningEngine.applyAdaptiveInsights(
        selection,
        conversationContext,
        contextAnalysis
      );
      
      // Update context with selection
      await this.updateConversationContext(conversationContext.sessionId, {
        selectedModel: adaptiveSelection.selectedModel,
        selectionReasoning: adaptiveSelection.reasoning,
        contextAnalysis
      });
      
      console.log(`🎯 Selected: ${adaptiveSelection.selectedModel.name} (confidence: ${adaptiveSelection.confidence})`);
      
      return {
        ...adaptiveSelection,
        contextAnalysis,
        reasoning: [
          adaptiveSelection.reasoning,
          `Strategy: ${selectionStrategy}`,
          `Context: ${contextAnalysis.taskType} task with ${contextAnalysis.complexity} complexity`,
          `Budget: ${contextAnalysis.budgetConstraint}, Quality: ${contextAnalysis.qualityRequirement}`
        ]
      };
    } catch (error) {
      console.error('Context-aware selection failed:', error);
      throw error;
    }
  }

  /**
   * Analyze conversation context to extract selection criteria
   */
  private async analyzeConversationContext(
    request: any,
    conversationContext: ConversationContext
  ): Promise<ContextAnalysis> {
    const history = conversationContext.conversationHistory;
    const userPrefs = conversationContext.userPreferences;
    const projectPrefs = conversationContext.projectPreferences;
    
    // Analyze task type from request and history
    const taskType = this.inferTaskType(request.prompt, history);
    
    // Analyze complexity based on request and user expertise
    const complexity = this.inferComplexity(request.prompt, conversationContext.domainContext);
    
    // Estimate token requirements
    const expectedTokens = this.estimateTokenRequirements(request, history);
    
    // Determine urgency
    const urgency = request.urgency || this.inferUrgency(history);
    
    // Determine quality requirements
    const qualityRequirement = request.qualityRequirement || 
      this.inferQualityRequirement(projectPrefs, conversationContext.domainContext);
    
    // Get budget constraints
    const budgetConstraint = userPrefs.budgetConstraint || 'medium';
    
    // Extract language requirements
    const languageRequirements = this.extractLanguageRequirements(request.prompt, userPrefs);
    
    // Extract domain expertise requirements
    const domainExpertise = this.extractDomainExpertise(request, conversationContext.domainContext);

    return {
      taskType,
      complexity,
      expectedTokens,
      urgency,
      qualityRequirement,
      budgetConstraint,
      languageRequirements,
      domainExpertise
    };
  }

  /**
   * Context-aware selection strategy
   */
  private async contextAwareStrategy(
    availableModels: OpenRouterModel[],
    contextAnalysis: ContextAnalysis,
    conversationContext: ConversationContext
  ): Promise<ModelSelection> {
    const scores = availableModels.map(model => {
      let score = 0;
      
      // Task type capability matching
      const taskCapability = model.capabilities[contextAnalysis.taskType] || 0;
      score += taskCapability * 0.25;
      
      // Historical performance with this user/project
      const historicalPerformance = this.getHistoricalPerformance(
        model.id, 
        conversationContext.userId, 
        conversationContext.projectId
      );
      score += historicalPerformance * 0.20;
      
      // Domain expertise matching
      const domainMatch = this.calculateDomainMatch(model, contextAnalysis.domainExpertise);
      score += domainMatch * 0.15;
      
      // Quality vs budget optimization
      const costQualityScore = this.calculateCostQualityScore(model, contextAnalysis);
      score += costQualityScore * 0.15;
      
      // User preference alignment
      const userPrefScore = this.calculateUserPreferenceScore(model, conversationContext.userPreferences);
      score += userPrefScore * 0.10;
      
      // Project preference alignment
      const projectPrefScore = this.calculateProjectPreferenceScore(model, conversationContext.projectPreferences);
      score += projectPrefScore * 0.10;
      
      // Recent context relevance
      const contextRelevance = this.calculateContextRelevance(model, conversationContext.conversationHistory);
      score += contextRelevance * 0.05;
      
      return { model, score };
    });

    scores.sort((a, b) => b.score - a.score);
    const best = scores[0];
    
    return {
      selectedModel: best.model,
      confidence: Math.min(best.score / 100, 1),
      reasoning: 'Context-aware selection based on comprehensive analysis',
      fallbackModels: scores.slice(1, 4).map(s => s.model),
      estimatedCost: this.estimateCost(best.model, contextAnalysis.expectedTokens),
      estimatedTime: this.estimateResponseTime(best.model, contextAnalysis.expectedTokens)
    };
  }

  /**
   * Performance-based selection strategy
   */
  private async performanceBasedStrategy(
    availableModels: OpenRouterModel[],
    contextAnalysis: ContextAnalysis,
    conversationContext: ConversationContext
  ): Promise<ModelSelection> {
    const performanceScores = availableModels.map(model => {
      const metrics = this.modelPerformanceMetrics.get(model.id);
      if (!metrics) {
        return { model, score: 0.5 }; // Default score for unknown models
      }
      
      // Calculate performance score
      const score = 
        metrics.successRate * 0.3 +
        (1 - metrics.averageResponseTime / 10000) * 0.2 + // Normalize response time
        metrics.averageQualityScore * 0.25 +
        metrics.costEfficiency * 0.15 +
        metrics.userSatisfactionScore * 0.1;
      
      return { model, score };
    });

    performanceScores.sort((a, b) => b.score - a.score);
    const best = performanceScores[0];

    return {
      selectedModel: best.model,
      confidence: best.score,
      reasoning: 'Selected based on historical performance metrics',
      fallbackModels: performanceScores.slice(1, 4).map(p => p.model),
      estimatedCost: this.estimateCost(best.model, contextAnalysis.expectedTokens),
      estimatedTime: this.estimateResponseTime(best.model, contextAnalysis.expectedTokens)
    };
  }

  /**
   * Cost-optimized selection strategy
   */
  private async costOptimizedStrategy(
    availableModels: OpenRouterModel[],
    contextAnalysis: ContextAnalysis,
    conversationContext: ConversationContext
  ): Promise<ModelSelection> {
    // Filter models by budget constraint
    const budgetLimits = { free: 0, low: 0.01, medium: 0.05, high: 0.20 };
    const budget = budgetLimits[contextAnalysis.budgetConstraint] || 0.05;
    
    const affordableModels = availableModels.filter(model => {
      const estimatedCost = this.estimateCost(model, contextAnalysis.expectedTokens);
      return estimatedCost <= budget;
    });
    
    if (affordableModels.length === 0) {
      throw new Error('No models available within budget constraint');
    }
    
    // Sort by cost efficiency (quality per dollar)
    const costEfficient = affordableModels.map(model => {
      const cost = this.estimateCost(model, contextAnalysis.expectedTokens);
      const quality = this.estimateQuality(model, contextAnalysis);
      const efficiency = cost > 0 ? quality / cost : quality * 1000; // Free models get high efficiency
      
      return { model, efficiency, cost };
    }).sort((a, b) => b.efficiency - a.efficiency);
    
    const best = costEfficient[0];
    
    return {
      selectedModel: best.model,
      confidence: 0.8,
      reasoning: `Cost-optimized selection within ${contextAnalysis.budgetConstraint} budget`,
      fallbackModels: costEfficient.slice(1, 4).map(c => c.model),
      estimatedCost: best.cost,
      estimatedTime: this.estimateResponseTime(best.model, contextAnalysis.expectedTokens)
    };
  }

  /**
   * Quality-focused selection strategy
   */
  private async qualityFocusedStrategy(
    availableModels: OpenRouterModel[],
    contextAnalysis: ContextAnalysis,
    conversationContext: ConversationContext
  ): Promise<ModelSelection> {
    // Filter for high-quality models
    const qualityThresholds = { basic: 70, good: 80, excellent: 90, perfect: 95 };
    const threshold = qualityThresholds[contextAnalysis.qualityRequirement] || 80;
    
    const qualityModels = availableModels.filter(model => {
      const avgCapability = Object.values(model.capabilities).reduce((a, b) => a + b, 0) / 
                            Object.values(model.capabilities).length;
      return avgCapability >= threshold;
    });
    
    if (qualityModels.length === 0) {
      return this.contextAwareStrategy(availableModels, contextAnalysis, conversationContext);
    }
    
    // Select the highest quality model for the task type
    const qualityScores = qualityModels.map(model => {
      const taskCapability = model.capabilities[contextAnalysis.taskType] || 0;
      const overallQuality = Object.values(model.capabilities).reduce((a, b) => a + b, 0) / 
                            Object.values(model.capabilities).length;
      const score = taskCapability * 0.6 + overallQuality * 0.4;
      
      return { model, score };
    });
    
    qualityScores.sort((a, b) => b.score - a.score);
    const best = qualityScores[0];
    
    return {
      selectedModel: best.model,
      confidence: best.score / 100,
      reasoning: `Quality-focused selection for ${contextAnalysis.qualityRequirement} quality requirement`,
      fallbackModels: qualityScores.slice(1, 4).map(q => q.model),
      estimatedCost: this.estimateCost(best.model, contextAnalysis.expectedTokens),
      estimatedTime: this.estimateResponseTime(best.model, contextAnalysis.expectedTokens)
    };
  }

  /**
   * Domain-specific selection strategy
   */
  private async domainSpecificStrategy(
    availableModels: OpenRouterModel[],
    contextAnalysis: ContextAnalysis,
    conversationContext: ConversationContext
  ): Promise<ModelSelection> {
    const domain = conversationContext.domainContext.primaryDomain;
    const domainModels = this.domainModelMappings.get(domain) || [];
    
    // Filter models by domain expertise
    const domainExpertModels = availableModels.filter(model => {
      return domainModels.includes(model.id) || 
             contextAnalysis.domainExpertise.some(expertise => 
               model.specialties.includes(expertise)
             );
    });
    
    if (domainExpertModels.length === 0) {
      return this.contextAwareStrategy(availableModels, contextAnalysis, conversationContext);
    }
    
    return this.contextAwareStrategy(domainExpertModels, contextAnalysis, conversationContext);
  }

  /**
   * Adaptive selection strategy (learns from user feedback)
   */
  private async adaptiveStrategy(
    availableModels: OpenRouterModel[],
    contextAnalysis: ContextAnalysis,
    conversationContext: ConversationContext
  ): Promise<ModelSelection> {
    // Get adaptive insights from learning engine
    const adaptiveInsights = await this.adaptiveLearningEngine.getAdaptiveInsights(
      conversationContext,
      contextAnalysis
    );
    
    // Apply adaptive weights to selection
    const adaptiveScores = availableModels.map(model => {
      const baseScore = this.calculateBaseScore(model, contextAnalysis);
      const adaptiveBoost = adaptiveInsights.modelBoosts.get(model.id) || 0;
      const penaltyFactor = adaptiveInsights.modelPenalties.get(model.id) || 0;
      
      const adaptiveScore = baseScore + (adaptiveBoost * 0.2) - (penaltyFactor * 0.2);
      
      return { model, score: Math.max(0, adaptiveScore) };
    });
    
    adaptiveScores.sort((a, b) => b.score - a.score);
    const best = adaptiveScores[0];
    
    return {
      selectedModel: best.model,
      confidence: Math.min(best.score / 100, 1),
      reasoning: 'Adaptive selection based on learned user preferences and feedback',
      fallbackModels: adaptiveScores.slice(1, 4).map(a => a.model),
      estimatedCost: this.estimateCost(best.model, contextAnalysis.expectedTokens),
      estimatedTime: this.estimateResponseTime(best.model, contextAnalysis.expectedTokens)
    };
  }

  /**
   * Hybrid selection strategy (combines multiple approaches)
   */
  private async hybridStrategy(
    availableModels: OpenRouterModel[],
    contextAnalysis: ContextAnalysis,
    conversationContext: ConversationContext
  ): Promise<ModelSelection> {
    // Get selections from multiple strategies
    const [contextAware, performance, costOptimized, quality, adaptive] = await Promise.all([
      this.contextAwareStrategy(availableModels, contextAnalysis, conversationContext),
      this.performanceBasedStrategy(availableModels, contextAnalysis, conversationContext),
      this.costOptimizedStrategy(availableModels, contextAnalysis, conversationContext),
      this.qualityFocusedStrategy(availableModels, contextAnalysis, conversationContext),
      this.adaptiveStrategy(availableModels, contextAnalysis, conversationContext)
    ]);
    
    // Weight strategies based on context
    const weights = this.calculateStrategyWeights(contextAnalysis, conversationContext);
    
    // Combine selections using weighted voting
    const modelVotes = new Map<string, { model: OpenRouterModel; totalScore: number; reasons: string[] }>();
    
    const strategies = [
      { selection: contextAware, weight: weights.contextAware, name: 'context-aware' },
      { selection: performance, weight: weights.performance, name: 'performance-based' },
      { selection: costOptimized, weight: weights.costOptimized, name: 'cost-optimized' },
      { selection: quality, weight: weights.quality, name: 'quality-focused' },
      { selection: adaptive, weight: weights.adaptive, name: 'adaptive' }
    ];
    
    strategies.forEach(({ selection, weight, name }) => {
      const modelId = selection.selectedModel.id;
      const vote = modelVotes.get(modelId) || { 
        model: selection.selectedModel, 
        totalScore: 0, 
        reasons: [] 
      };
      
      vote.totalScore += selection.confidence * weight;
      vote.reasons.push(`${name}: ${selection.reasoning}`);
      
      modelVotes.set(modelId, vote);
    });
    
    // Select the model with highest combined score
    const winner = Array.from(modelVotes.values())
      .sort((a, b) => b.totalScore - a.totalScore)[0];
    
    return {
      selectedModel: winner.model,
      confidence: Math.min(winner.totalScore, 1),
      reasoning: `Hybrid selection combining: ${winner.reasons.join('; ')}`,
      fallbackModels: Array.from(modelVotes.values())
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(1, 4)
        .map(v => v.model),
      estimatedCost: this.estimateCost(winner.model, contextAnalysis.expectedTokens),
      estimatedTime: this.estimateResponseTime(winner.model, contextAnalysis.expectedTokens)
    };
  }

  /**
   * Process user feedback to improve future selections
   */
  async processFeedback(
    sessionId: string,
    messageId: string,
    feedback: UserFeedback
  ): Promise<void> {
    try {
      const context = this.conversationContexts.get(sessionId);
      if (!context) {
        throw new Error('Session context not found');
      }
      
      // Update conversation history with feedback
      const message = context.conversationHistory.find(m => m.id === messageId);
      if (message) {
        message.userFeedback = feedback;
      }
      
      // Update user preferences based on feedback
      context.userPreferences.feedbackHistory.push(feedback);
      
      // Update model performance metrics
      if (message?.modelUsed) {
        await this.updateModelPerformanceMetrics(message.modelUsed, feedback);
      }
      
      // Feed into adaptive learning engine
      await this.adaptiveLearningEngine.processFeedback(context, messageId, feedback);
      
      // Store updated context
      this.conversationContexts.set(sessionId, context);
      
      this.emit('feedback-processed', { sessionId, messageId, feedback });
    } catch (error) {
      console.error('Failed to process feedback:', error);
      throw error;
    }
  }

  // Helper methods
  private inferTaskType(prompt: string, history: ConversationMessage[]): ContextAnalysis['taskType'] {
    const codeKeywords = ['code', 'function', 'class', 'algorithm', 'debug', 'programming'];
    const creativeKeywords = ['write', 'story', 'creative', 'poem', 'design', 'brainstorm'];
    const analyticalKeywords = ['analyze', 'compare', 'evaluate', 'assess', 'research', 'study'];
    const reasoningKeywords = ['solve', 'problem', 'logic', 'reasoning', 'deduce', 'infer'];
    
    const lowerPrompt = prompt.toLowerCase();
    
    if (codeKeywords.some(keyword => lowerPrompt.includes(keyword))) return 'coding';
    if (creativeKeywords.some(keyword => lowerPrompt.includes(keyword))) return 'creative';
    if (analyticalKeywords.some(keyword => lowerPrompt.includes(keyword))) return 'analytical';
    if (reasoningKeywords.some(keyword => lowerPrompt.includes(keyword))) return 'reasoning';
    if (lowerPrompt.includes('image') || lowerPrompt.includes('photo') || lowerPrompt.includes('visual')) return 'multimodal';
    
    return 'general';
  }

  private inferComplexity(prompt: string, domainContext: DomainContext): ContextAnalysis['complexity'] {
    const promptLength = prompt.length;
    const technicalLevel = domainContext.technicalLevel;
    
    if (promptLength < 100 && technicalLevel === 'beginner') return 'simple';
    if (promptLength < 300 && ['beginner', 'intermediate'].includes(technicalLevel)) return 'moderate';
    if (promptLength < 500 && ['intermediate', 'advanced'].includes(technicalLevel)) return 'complex';
    return 'expert';
  }

  private estimateTokenRequirements(request: any, history: ConversationMessage[]): number {
    const promptTokens = Math.ceil(request.prompt.length / 4);
    const contextTokens = Math.ceil((request.context || '').length / 4);
    const historyTokens = history.slice(-10).reduce((sum, msg) => 
      sum + Math.ceil(msg.content.length / 4), 0);
    
    return promptTokens + contextTokens + historyTokens + 500; // Add buffer for response
  }

  private inferUrgency(history: ConversationMessage[]): ContextAnalysis['urgency'] {
    const recentMessages = history.slice(-5);
    const urgentKeywords = ['urgent', 'asap', 'quickly', 'immediate', 'deadline'];
    
    const hasUrgentKeywords = recentMessages.some(msg => 
      urgentKeywords.some(keyword => msg.content.toLowerCase().includes(keyword))
    );
    
    return hasUrgentKeywords ? 'high' : 'medium';
  }

  private inferQualityRequirement(
    projectPrefs: ProjectPreferences, 
    domainContext: DomainContext
  ): ContextAnalysis['qualityRequirement'] {
    if (domainContext.industry === 'healthcare' || domainContext.industry === 'finance') {
      return 'perfect';
    }
    if (projectPrefs.qualityStandards.includes('enterprise')) {
      return 'excellent';
    }
    return 'good';
  }

  private extractLanguageRequirements(prompt: string, userPrefs: UserPreferences): string[] {
    // Detect language from prompt content and user preferences
    const detectedLanguages = [];
    
    if (/[\u4e00-\u9fff]/.test(prompt)) detectedLanguages.push('chinese');
    if (/[a-zA-Z]/.test(prompt)) detectedLanguages.push('english');
    
    return detectedLanguages.length > 0 ? detectedLanguages : userPrefs.languagePreference;
  }

  private extractDomainExpertise(request: any, domainContext: DomainContext): string[] {
    return [
      domainContext.primaryDomain,
      ...domainContext.subDomains,
      ...domainContext.requiredExpertise
    ];
  }

  private getHistoricalPerformance(modelId: string, userId?: string, projectId?: string): number {
    const metrics = this.modelPerformanceMetrics.get(modelId);
    return metrics ? metrics.userSatisfactionScore : 0.5;
  }

  private calculateDomainMatch(model: OpenRouterModel, domainExpertise: string[]): number {
    const matches = domainExpertise.filter(domain => 
      model.specialties.some(specialty => 
        specialty.toLowerCase().includes(domain.toLowerCase())
      )
    );
    return Math.min(matches.length / domainExpertise.length, 1) * 100;
  }

  private calculateCostQualityScore(model: OpenRouterModel, contextAnalysis: ContextAnalysis): number {
    const cost = (model.pricing.prompt + model.pricing.completion) / 2;
    const quality = Object.values(model.capabilities).reduce((a, b) => a + b, 0) / 
                   Object.values(model.capabilities).length;
    
    const budget = contextAnalysis.budgetConstraint;
    const budgetWeights = { free: 0.8, low: 0.6, medium: 0.4, high: 0.2 };
    const qualityWeights = { free: 0.2, low: 0.4, medium: 0.6, high: 0.8 };
    
    const costScore = cost === 0 ? 100 : Math.max(0, 100 - (cost * 10000));
    const qualityScore = quality;
    
    return (costScore * budgetWeights[budget]) + (qualityScore * qualityWeights[budget]);
  }

  private calculateUserPreferenceScore(model: OpenRouterModel, userPrefs: UserPreferences): number {
    let score = 50; // Base score
    
    if (userPrefs.preferredProviders.includes(model.provider)) {
      score += 30;
    }
    
    return Math.min(score, 100);
  }

  private calculateProjectPreferenceScore(model: OpenRouterModel, projectPrefs: ProjectPreferences): number {
    let score = 50; // Base score
    
    if (projectPrefs.preferredModels.includes(model.id)) {
      score += 40;
    } else if (projectPrefs.fallbackModels.includes(model.id)) {
      score += 20;
    }
    
    return Math.min(score, 100);
  }

  private calculateContextRelevance(model: OpenRouterModel, history: ConversationMessage[]): number {
    // Analyze if this model has been successful in recent similar conversations
    const recentSuccessfulUses = history
      .filter(msg => msg.modelUsed === model.id && msg.userFeedback?.rating && msg.userFeedback.rating >= 4)
      .length;
    
    return Math.min(recentSuccessfulUses * 20, 100);
  }

  private calculateBaseScore(model: OpenRouterModel, contextAnalysis: ContextAnalysis): number {
    const taskCapability = model.capabilities[contextAnalysis.taskType] || 0;
    const overallQuality = Object.values(model.capabilities).reduce((a, b) => a + b, 0) / 
                          Object.values(model.capabilities).length;
    
    return (taskCapability * 0.6) + (overallQuality * 0.4);
  }

  private calculateStrategyWeights(
    contextAnalysis: ContextAnalysis, 
    conversationContext: ConversationContext
  ): Record<string, number> {
    const baseWeights = {
      contextAware: 0.3,
      performance: 0.2,
      costOptimized: 0.2,
      quality: 0.15,
      adaptive: 0.15
    };
    
    // Adjust weights based on context
    if (contextAnalysis.budgetConstraint === 'free' || contextAnalysis.budgetConstraint === 'low') {
      baseWeights.costOptimized *= 2;
      baseWeights.quality *= 0.5;
    }
    
    if (contextAnalysis.qualityRequirement === 'excellent' || contextAnalysis.qualityRequirement === 'perfect') {
      baseWeights.quality *= 2;
      baseWeights.costOptimized *= 0.5;
    }
    
    if (conversationContext.userPreferences.feedbackHistory.length > 10) {
      baseWeights.adaptive *= 1.5;
    }
    
    // Normalize weights
    const totalWeight = Object.values(baseWeights).reduce((a, b) => a + b, 0);
    Object.keys(baseWeights).forEach(key => {
      baseWeights[key] /= totalWeight;
    });
    
    return baseWeights;
  }

  private estimateCost(model: OpenRouterModel, tokens: number): number {
    const promptTokens = Math.ceil(tokens * 0.7);
    const completionTokens = Math.ceil(tokens * 0.3);
    return (promptTokens * model.pricing.prompt) + (completionTokens * model.pricing.completion);
  }

  private estimateResponseTime(model: OpenRouterModel, tokens: number): number {
    const baseTime = 1000; // 1 second base
    const tokenTime = tokens * 10; // 10ms per token
    return baseTime + tokenTime;
  }

  private estimateQuality(model: OpenRouterModel, contextAnalysis: ContextAnalysis): number {
    const taskCapability = model.capabilities[contextAnalysis.taskType] || 0;
    const overallQuality = Object.values(model.capabilities).reduce((a, b) => a + b, 0) / 
                          Object.values(model.capabilities).length;
    
    return (taskCapability * 0.6) + (overallQuality * 0.4);
  }

  private async initializeDomainMappings(): Promise<void> {
    // Initialize domain-specific model mappings
    this.domainModelMappings.set('software-development', [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4o',
      'meta-llama/llama-3.2-90b-instruct'
    ]);
    
    this.domainModelMappings.set('creative-writing', [
      'anthropic/claude-3.5-sonnet',
      'moonshot/kimi-k2-instruct',
      'openai/gpt-4o'
    ]);
    
    this.domainModelMappings.set('data-analysis', [
      'anthropic/claude-3.5-sonnet',
      'cohere/command-r-plus',
      'openai/gpt-4o'
    ]);
    
    this.domainModelMappings.set('multilingual', [
      'google/gemini-2.5-flash',
      'moonshot/kimi-k2-instruct',
      'anthropic/claude-3.5-sonnet'
    ]);
  }

  private async initializePerformanceMetrics(): Promise<void> {
    // Initialize with default performance metrics
    const defaultMetrics: Omit<ModelPerformanceMetrics, 'modelId'> = {
      successRate: 0.95,
      averageResponseTime: 2000,
      averageQualityScore: 0.85,
      costEfficiency: 0.80,
      domainPerformance: {},
      userSatisfactionScore: 0.85,
      contextAwareness: 0.80,
      adaptabilityScore: 0.75,
      lastUpdated: new Date(),
      sampleSize: 0
    };
    
    const models = openRouterGateway.getAvailableModels();
    models.forEach(model => {
      this.modelPerformanceMetrics.set(model.id, {
        modelId: model.id,
        ...defaultMetrics
      });
    });
  }

  private async updateModelPerformanceMetrics(modelId: string, feedback: UserFeedback): Promise<void> {
    const metrics = this.modelPerformanceMetrics.get(modelId);
    if (!metrics) return;
    
    // Update metrics based on feedback
    const alpha = 0.1; // Learning rate
    
    metrics.userSatisfactionScore = 
      (metrics.userSatisfactionScore * (1 - alpha)) + (feedback.rating / 5 * alpha);
    
    metrics.averageQualityScore = 
      (metrics.averageQualityScore * (1 - alpha)) + 
      (Object.values(feedback.aspects).reduce((a, b) => a + b, 0) / 25 * alpha); // Normalize to 0-1
    
    metrics.sampleSize += 1;
    metrics.lastUpdated = new Date();
    
    this.modelPerformanceMetrics.set(modelId, metrics);
  }

  private async updateConversationContext(sessionId: string, update: any): Promise<void> {
    const context = this.conversationContexts.get(sessionId);
    if (context) {
      Object.assign(context, update);
      this.conversationContexts.set(sessionId, context);
    }
  }

  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this.emit('performance-metrics-updated', {
        timestamp: new Date(),
        metrics: Array.from(this.modelPerformanceMetrics.values())
      });
    }, 60000); // Update every minute
  }

  /**
   * Get conversation context
   */
  getConversationContext(sessionId: string): ConversationContext | undefined {
    return this.conversationContexts.get(sessionId);
  }

  /**
   * Create new conversation context
   */
  createConversationContext(sessionId: string, initialContext: Partial<ConversationContext>): ConversationContext {
    const context: ConversationContext = {
      sessionId,
      conversationHistory: [],
      taskSequence: [],
      userPreferences: {
        preferredProviders: [],
        budgetConstraint: 'medium',
        qualityVsSpeed: 0.7,
        languagePreference: ['english'],
        domainExpertise: [],
        communicationStyle: 'conversational',
        feedbackHistory: [],
        learningPreferences: {
          adaptToSuccess: true,
          adaptToFailures: true,
          exploreNewModels: true,
          stickToFavorites: false
        }
      },
      projectPreferences: {
        projectType: 'general',
        techStack: [],
        qualityStandards: [],
        budgetConstraints: {},
        preferredModels: [],
        fallbackModels: [],
        domainRequirements: [],
        complianceRequirements: [],
        performanceRequirements: {
          maxResponseTime: 10000,
          minQualityScore: 0.8,
          maxCostPerRequest: 0.05
        }
      },
      domainContext: {
        primaryDomain: 'general',
        subDomains: [],
        requiredExpertise: [],
        technicalLevel: 'intermediate',
        industry: 'technology',
        specializedTerminology: [],
        complianceRequirements: [],
        culturalContext: []
      },
      ...initialContext
    };
    
    this.conversationContexts.set(sessionId, context);
    return context;
  }

  /**
   * Get model performance metrics
   */
  getModelPerformanceMetrics(): ModelPerformanceMetrics[] {
    return Array.from(this.modelPerformanceMetrics.values());
  }
}

/**
 * Adaptive Learning Engine for continuous improvement
 */
class AdaptiveLearningEngine extends EventEmitter {
  private userPatterns: Map<string, any> = new Map();
  private modelSuccessPatterns: Map<string, any> = new Map();
  private contextPatterns: Map<string, any> = new Map();
  
  async initialize(): Promise<void> {
    console.log('🧠 Initializing Adaptive Learning Engine...');
    // Initialize learning patterns
    this.emit('initialized');
  }
  
  async applyAdaptiveInsights(
    selection: ModelSelection,
    conversationContext: ConversationContext,
    contextAnalysis: ContextAnalysis
  ): Promise<ModelSelection> {
    // Apply learned insights to improve selection
    return selection;
  }
  
  async getAdaptiveInsights(
    conversationContext: ConversationContext,
    contextAnalysis: ContextAnalysis
  ): Promise<{ modelBoosts: Map<string, number>; modelPenalties: Map<string, number> }> {
    return {
      modelBoosts: new Map(),
      modelPenalties: new Map()
    };
  }
  
  async processFeedback(
    context: ConversationContext,
    messageId: string,
    feedback: UserFeedback
  ): Promise<void> {
    // Process feedback to improve future selections
    this.emit('feedback-learned', { messageId, feedback });
  }
}

// Export singleton instance
export const contextAwareLLMSelection = new ContextAwareLLMSelection();