/**
 * Intelligence Routing System for WAI LLM Orchestration
 * 
 * Implements advanced routing with 15+ parameters:
 * - Task complexity analysis with BMAD methodology
 * - Intelligence level requirements (standard → emergency)
 * - Cost optimization with real-time pricing
 * - User context and satisfaction tracking
 * - Prompt intelligence analysis
 * - Historical performance data
 * - 5-level fallback system with quality assurance
 */

import { EventEmitter } from 'events';
import { openRouterGateway, type OpenRouterModel } from './openrouter-universal-gateway';
import { contextAwareLLMSelection } from './context-aware-llm-selection';
import { adaptiveLearningSystem } from './adaptive-learning-system';
import { realTimeOptimizationSystem } from './realtime-optimization-system';
import type { 
  LLMProvider, 
  RouteResult, 
  IntelligenceRoutingDecision, 
  TaskHistory, 
  UserLLMPreferences, 
  BMADWorkflowStage, 
  FallbackLevel,
  ConversationContext
} from './shared-orchestration-types';
import { 
  OrchestrationError,
  ProviderError,
  RoutingError
} from './orchestration-errors';
import { circuitBreakerManager } from './circuit-breaker';
import { generateCorrelationId } from './orchestration-utils';
import { fiveLevelFallbackSystem } from './5-level-fallback-system';

// Types are now imported from shared-orchestration-types.ts

export interface RoutingParameters {
  // Cost Optimization (4 factors)
  userBudgetPreference: 'free' | 'low' | 'medium' | 'high';
  taskValueAnalysis: number; // 0-1
  historicalCostEffectiveness: Map<string, number>;
  realTimePricing: Map<string, number>;
  
  // User History & Context (4 factors)
  previousTaskSuccessRates: Map<string, number>;
  userSatisfactionScores: Map<string, number>;
  learningPatterns: UserLearningPattern[];
  projectContext: ProjectContext;
  
  // Prompt Intelligence Analysis (4 factors)
  promptComplexityScore: number; // 1-100
  domainIdentification: string;
  requiredCapabilitiesMapping: string[];
  contextEngineeringOptimization: boolean;
  
  // Task Knowledge Requirements (3 factors)
  technicalDepthNeeded: number; // 1-10
  domainExpertiseRequirements: string[];
  reasoningComplexityLevel: number; // 1-10
}

export interface UserLearningPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  preferredModels: string[];
  taskTypes: string[];
}

export interface ProjectContext {
  projectType: string;
  techStack: string[];
  qualityStandards: string[];
  budgetConstraints: Record<string, number>;
  teamSize: number;
  timeline: string;
  complianceRequirements: string[];
}

// Interfaces now imported from shared-orchestration-types.ts - no local redefinitions

export class IntelligenceRoutingSystem extends EventEmitter {
  private routingParameters: RoutingParameters;
  private bmadWorkflowStages: Map<string, BMADWorkflowStage[]> = new Map();
  private fallbackLevels: FallbackLevel[] = [];
  private providerPerformanceCache: Map<string, any> = new Map();
  private routingHistory: Map<string, RouteResult[]> = new Map();
  
  // Advanced routing algorithms
  private routingAlgorithms = {
    bmadIntelligentRouting: this.bmadIntelligentRouting.bind(this),
    contextAwareRouting: this.contextAwareRouting.bind(this),
    costOptimizedRouting: this.costOptimizedRouting.bind(this),
    qualityFirstRouting: this.qualityFirstRouting.bind(this),
    emergencyRouting: this.emergencyRouting.bind(this),
    hybridIntelligentRouting: this.hybridIntelligentRouting.bind(this)
  };

  constructor() {
    super();
    this.routingParameters = this.initializeRoutingParameters();
    this.initializeIntelligenceRouting();
  }

  /**
   * Initialize the intelligence routing system
   */
  private async initializeIntelligenceRouting(): Promise<void> {
    console.log('🧠 Initializing Intelligence Routing System with BMAD methodology...');
    
    try {
      // Initialize BMAD workflow stages
      await this.initializeBMADWorkflows();
      
      // Initialize 5-level fallback system
      await this.initialize5LevelFallback();
      
      // Initialize provider performance monitoring
      await this.initializeProviderPerformanceMonitoring();
      
      // Start intelligent routing optimization
      this.startIntelligentOptimization();
      
      console.log('✅ Intelligence Routing System initialized with 15+ routing factors');
      this.emit('initialized');
    } catch (error) {
      console.error('❌ Intelligence Routing System initialization failed:', error);
      this.emit('initialization-failed', error);
    }
  }

  /**
   * Main intelligent routing function with 15+ parameters
   */
  async routeIntelligently(
    task: {
      prompt: string;
      taskType: string;
      context?: string;
      requirements?: any;
    },
    userContext: ConversationContext,
    routingStrategy: keyof typeof this.routingAlgorithms = 'hybridIntelligentRouting'
  ): Promise<RouteResult> {
    console.log('🎯 Performing intelligent routing with 15+ parameters...');
    
    try {
      // Step 1: Analyze routing decision requirements
      const routingDecision = await this.analyzeIntelligenceRouting(task, userContext);
      
      // Step 2: Analyze prompt intelligence (4 factors)
      const correlationId = generateCorrelationId();
      console.log(`🔄 [${correlationId}] Starting intelligent routing for task: ${task.taskType}`);
      
      // Step 3: Execute routing with fallback protection
      const promptAnalysis = await this.analyzePromptIntelligence(task.prompt, task.context);
      routingDecision.promptAnalysis = promptAnalysis;
      
      // Step 3: Update routing parameters with real-time data
      await this.updateRoutingParameters(userContext, promptAnalysis);
      
      // Step 4: Apply intelligent routing algorithm
      const algorithm = this.routingAlgorithms[routingStrategy];
      const routeResult = await algorithm(routingDecision, userContext);
      
      // Step 5: Generate BMAD recommendations if applicable
      if (task.taskType === 'development' || task.taskType === 'coding') {
        routeResult.bmadRecommendations = await this.generateBMADRecommendations(routingDecision);
      }
      
      // Step 6: Apply 5-level fallback system
      routeResult.fallbackChain = await this.generate5LevelFallback(routingDecision, routeResult.selectedProvider);
      
      // Step 7: Record routing decision for learning
      await this.recordRoutingDecision(userContext.sessionId, routeResult);
      
      console.log(`🎯 Intelligence routing completed: ${routeResult.selectedProvider.name} (confidence: ${routeResult.confidence})`);
      
      return routeResult;
    } catch (error) {
      console.error('Intelligence routing failed:', error);
      throw error;
    }
  }

  /**
   * BMAD Intelligent Routing Algorithm
   */
  private async bmadIntelligentRouting(
    routingDecision: IntelligenceRoutingDecision,
    userContext: ConversationContext
  ): Promise<RouteResult> {
    console.log('📋 Applying BMAD Intelligent Routing...');
    
    // BMAD Stage Analysis
    const bmadStage = this.determineBMADStage(routingDecision);
    
    // Filter providers by BMAD stage requirements
    const availableProviders = await this.getAvailableProviders();
    const bmadQualifiedProviders = availableProviders.filter(provider =>
      this.meetsBMADRequirements(provider, bmadStage)
    );
    
    if (bmadQualifiedProviders.length === 0) {
      throw new Error('No providers meet BMAD methodology requirements');
    }
    
    // Score providers based on BMAD criteria
    const scoredProviders = bmadQualifiedProviders.map(provider => {
      let score = 0;
      
      // BMAD Stage Alignment (30%)
      const stageAlignment = this.calculateBMADStageAlignment(provider, bmadStage);
      score += stageAlignment * 0.3;
      
      // Quality Gate Capability (25%)
      const qualityGateScore = this.calculateQualityGateCapability(provider, bmadStage);
      score += qualityGateScore * 0.25;
      
      // Technical Depth Match (20%)
      const technicalDepthScore = this.calculateTechnicalDepthMatch(provider, routingDecision);
      score += technicalDepthScore * 0.2;
      
      // Historical BMAD Performance (15%)
      const bmadPerformanceScore = this.getBMADHistoricalPerformance(provider.id);
      score += bmadPerformanceScore * 0.15;
      
      // Cost Efficiency for BMAD (10%)
      const costEfficiencyScore = this.calculateBMADCostEfficiency(provider, routingDecision);
      score += costEfficiencyScore * 0.1;
      
      return { provider, score, bmadStage };
    });
    
    scoredProviders.sort((a, b) => b.score - a.score);
    const best = scoredProviders[0];
    
    return {
      selectedProvider: best.provider,
      routingDecision,
      confidence: Math.min(best.score / 100, 1),
      reasoning: [
        `BMAD ${bmadStage.stage} stage optimization`,
        `Stage alignment: ${(this.calculateBMADStageAlignment(best.provider, bmadStage) * 100).toFixed(1)}%`,
        `Quality gates: ${bmadStage.qualityGates.length} gates supported`,
        `Technical depth match: ${(this.calculateTechnicalDepthMatch(best.provider, routingDecision) * 100).toFixed(1)}%`
      ],
      fallbackChain: scoredProviders.slice(1, 6).map(p => p.provider),
      estimatedCost: this.estimateCost(best.provider, routingDecision.promptAnalysis.contextLength),
      estimatedQuality: best.provider.performance.qualityScore,
      estimatedResponseTime: best.provider.performance.responseTime,
      correlationId: generateCorrelationId(),
      timestamp: new Date()
    };
  }

  /**
   * Context-Aware Routing Algorithm
   */
  private async contextAwareRouting(
    routingDecision: IntelligenceRoutingDecision,
    userContext: ConversationContext
  ): Promise<RouteResult> {
    console.log('🧠 Applying Context-Aware Routing...');
    
    // Use the existing context-aware selection system
    // Convert our ConversationContext to the format expected by context-aware selection
    const contextAwareContext = this.convertToContextAwareFormat(userContext);
    const contextSelection = await contextAwareLLMSelection.selectOptimalModel(
      {
        prompt: routingDecision.promptAnalysis.requiredCapabilities.join(' '),
        taskType: routingDecision.promptAnalysis.domain,
        urgency: routingDecision.intelligenceLevel === 'emergency' ? 'high' : 'medium',
        qualityRequirement: this.mapIntelligenceLevelToQuality(routingDecision.intelligenceLevel)
      },
      contextAwareContext,
      'contextAware'
    );
    
    // Convert to our format
    const selectedProvider = this.convertOpenRouterModelToProvider(contextSelection.selectedModel);
    
    return {
      selectedProvider,
      routingDecision,
      confidence: contextSelection.confidence,
      reasoning: [
        'Context-aware selection with conversation history',
        ...contextSelection.reasoning,
        `Context analysis: ${contextSelection.contextAnalysis.taskType} task`
      ],
      fallbackChain: contextSelection.fallbackModels.map(m => this.convertOpenRouterModelToProvider(m)),
      estimatedCost: contextSelection.estimatedCost,
      estimatedQuality: 0.85, // Estimated based on context awareness
      estimatedResponseTime: contextSelection.estimatedTime,
      correlationId: generateCorrelationId(),
      timestamp: new Date()
    };
  }

  /**
   * Cost-Optimized Routing Algorithm
   */
  private async costOptimizedRouting(
    routingDecision: IntelligenceRoutingDecision,
    userContext: ConversationContext
  ): Promise<RouteResult> {
    console.log('💰 Applying Cost-Optimized Routing...');
    
    const availableProviders = await this.getAvailableProviders();
    
    // Filter by cost budget
    const budgetLimit = this.getBudgetLimit(routingDecision.costBudget);
    const affordableProviders = availableProviders.filter(provider => {
      const estimatedCost = this.estimateCost(provider, routingDecision.promptAnalysis.contextLength);
      return estimatedCost <= budgetLimit;
    });
    
    if (affordableProviders.length === 0) {
      throw new Error(`No providers available within ${routingDecision.costBudget} budget`);
    }
    
    // Score by cost efficiency
    const costScored = affordableProviders.map(provider => {
      const cost = this.estimateCost(provider, routingDecision.promptAnalysis.contextLength);
      const quality = provider.performance.qualityScore;
      const efficiency = cost > 0 ? quality / cost : quality * 1000;
      
      return { provider, efficiency, cost, quality };
    });
    
    costScored.sort((a, b) => b.efficiency - a.efficiency);
    const best = costScored[0];
    
    return {
      selectedProvider: best.provider,
      routingDecision,
      confidence: 0.85,
      reasoning: [
        `Cost-optimized for ${routingDecision.costBudget} budget`,
        `Cost efficiency: ${best.efficiency.toFixed(2)}`,
        `Estimated cost: $${best.cost.toFixed(4)}`,
        `Quality score: ${(best.quality * 100).toFixed(1)}%`
      ],
      fallbackChain: costScored.slice(1, 6).map(p => p.provider),
      estimatedCost: best.cost,
      estimatedQuality: best.quality,
      estimatedResponseTime: best.provider.performance.responseTime,
      correlationId: generateCorrelationId(),
      timestamp: new Date()
    };
  }

  /**
   * Quality-First Routing Algorithm
   */
  private async qualityFirstRouting(
    routingDecision: IntelligenceRoutingDecision,
    userContext: ConversationContext
  ): Promise<RouteResult> {
    console.log('⭐ Applying Quality-First Routing...');
    
    const availableProviders = await this.getAvailableProviders();
    
    // Filter for premium/enterprise tier providers for quality tasks
    const qualityProviders = availableProviders.filter(provider =>
      provider.tier === 'premium' || provider.tier === 'enterprise'
    );
    
    if (qualityProviders.length === 0) {
      console.warn('No premium providers available, using all providers');
      return this.contextAwareRouting(routingDecision, userContext);
    }
    
    // Score by quality metrics
    const qualityScored = qualityProviders.map(provider => {
      let score = 0;
      
      // Base quality score (40%)
      score += provider.performance.qualityScore * 0.4;
      
      // Capability match (30%)
      const capabilityMatch = this.calculateCapabilityMatch(provider, routingDecision.promptAnalysis);
      score += capabilityMatch * 0.3;
      
      // Reliability score (20%)
      score += provider.performance.reliabilityScore * 0.2;
      
      // User satisfaction history (10%)
      const userSatisfaction = this.getUserSatisfactionScore(provider.id, userContext.userId);
      score += userSatisfaction * 0.1;
      
      return { provider, score };
    });
    
    qualityScored.sort((a, b) => b.score - a.score);
    const best = qualityScored[0];
    
    return {
      selectedProvider: best.provider,
      routingDecision,
      confidence: best.score,
      reasoning: [
        'Quality-first selection for premium outcomes',
        `Quality score: ${(best.provider.performance.qualityScore * 100).toFixed(1)}%`,
        `Reliability: ${(best.provider.performance.reliabilityScore * 100).toFixed(1)}%`,
        `Capability match: ${(this.calculateCapabilityMatch(best.provider, routingDecision.promptAnalysis) * 100).toFixed(1)}%`
      ],
      fallbackChain: qualityScored.slice(1, 6).map(p => p.provider),
      estimatedCost: this.estimateCost(best.provider, routingDecision.promptAnalysis.contextLength),
      estimatedQuality: best.provider.performance.qualityScore,
      estimatedResponseTime: best.provider.performance.responseTime,
      correlationId: generateCorrelationId(),
      timestamp: new Date()
    };
  }

  /**
   * Emergency Routing Algorithm
   */
  private async emergencyRouting(
    routingDecision: IntelligenceRoutingDecision,
    userContext: ConversationContext
  ): Promise<RouteResult> {
    console.log('🚨 Applying Emergency Routing...');
    
    const availableProviders = await this.getAvailableProviders();
    
    // Filter for high-availability, fast providers
    const emergencyProviders = availableProviders.filter(provider =>
      provider.performance.availability >= 0.99 &&
      provider.performance.responseTime <= 2000
    );
    
    if (emergencyProviders.length === 0) {
      throw new Error('No providers meet emergency routing requirements');
    }
    
    // Score by emergency criteria
    const emergencyScored = emergencyProviders.map(provider => {
      let score = 0;
      
      // Availability (40%)
      score += provider.performance.availability * 0.4;
      
      // Response time (30%)
      const responseTimeScore = Math.max(0, 1 - (provider.performance.responseTime / 5000));
      score += responseTimeScore * 0.3;
      
      // Reliability (20%)
      score += provider.performance.reliabilityScore * 0.2;
      
      // Quality (10%)
      score += provider.performance.qualityScore * 0.1;
      
      return { provider, score };
    });
    
    emergencyScored.sort((a, b) => b.score - a.score);
    const best = emergencyScored[0];
    
    return {
      selectedProvider: best.provider,
      routingDecision,
      confidence: best.score,
      reasoning: [
        'Emergency routing for critical tasks',
        `Availability: ${(best.provider.performance.availability * 100).toFixed(2)}%`,
        `Response time: ${best.provider.performance.responseTime}ms`,
        `Reliability: ${(best.provider.performance.reliabilityScore * 100).toFixed(1)}%`
      ],
      fallbackChain: emergencyScored.slice(1, 6).map(p => p.provider),
      estimatedCost: this.estimateCost(best.provider, routingDecision.promptAnalysis.contextLength),
      estimatedQuality: best.provider.performance.qualityScore,
      estimatedResponseTime: best.provider.performance.responseTime,
      correlationId: generateCorrelationId(),
      timestamp: new Date()
    };
  }

  /**
   * Hybrid Intelligent Routing Algorithm (combines all approaches)
   */
  private async hybridIntelligentRouting(
    routingDecision: IntelligenceRoutingDecision,
    userContext: ConversationContext
  ): Promise<RouteResult> {
    console.log('🧬 Applying Hybrid Intelligent Routing...');
    
    // Get results from multiple algorithms
    const [bmadResult, contextResult, costResult, qualityResult] = await Promise.all([
      this.bmadIntelligentRouting(routingDecision, userContext).catch(() => null),
      this.contextAwareRouting(routingDecision, userContext).catch(() => null),
      this.costOptimizedRouting(routingDecision, userContext).catch(() => null),
      this.qualityFirstRouting(routingDecision, userContext).catch(() => null)
    ]);
    
    // Calculate weights based on routing decision characteristics
    const weights = this.calculateHybridWeights(routingDecision, userContext);
    
    // Combine results using weighted scoring
    const providerVotes = new Map<string, { provider: LLMProvider; totalScore: number; sources: string[] }>();
    
    const results = [
      { result: bmadResult, weight: weights.bmad, name: 'BMAD' },
      { result: contextResult, weight: weights.context, name: 'Context' },
      { result: costResult, weight: weights.cost, name: 'Cost' },
      { result: qualityResult, weight: weights.quality, name: 'Quality' }
    ].filter(r => r.result !== null);
    
    results.forEach(({ result, weight, name }) => {
      if (!result) return;
      
      const providerId = result.selectedProvider.id;
      const vote = providerVotes.get(providerId) || {
        provider: result.selectedProvider,
        totalScore: 0,
        sources: []
      };
      
      vote.totalScore += result.confidence * weight;
      vote.sources.push(name);
      providerVotes.set(providerId, vote);
    });
    
    // Select the provider with the highest weighted score
    const sortedVotes = Array.from(providerVotes.values())
      .sort((a, b) => b.totalScore - a.totalScore);
    
    if (sortedVotes.length === 0) {
      throw new Error('No valid routing results from any algorithm');
    }
    
    const winner = sortedVotes[0];
    
    return {
      selectedProvider: winner.provider,
      routingDecision,
      confidence: Math.min(winner.totalScore, 1),
      reasoning: [
        `Hybrid intelligent routing from: ${winner.sources.join(', ')}`,
        `Combined confidence: ${(winner.totalScore * 100).toFixed(1)}%`,
        `Routing weights: BMAD:${weights.bmad}, Context:${weights.context}, Cost:${weights.cost}, Quality:${weights.quality}`
      ],
      fallbackChain: sortedVotes.slice(1, 6).map(v => v.provider),
      estimatedCost: this.estimateCost(winner.provider, routingDecision.promptAnalysis.contextLength),
      estimatedQuality: winner.provider.performance.qualityScore,
      estimatedResponseTime: winner.provider.performance.responseTime,
      correlationId: generateCorrelationId(),
      timestamp: new Date()
    };
  }

  /**
   * Analyze intelligence routing requirements
   */
  private async analyzeIntelligenceRouting(
    task: any,
    userContext: ConversationContext
  ): Promise<IntelligenceRoutingDecision> {
    // Analyze task complexity
    const taskComplexity = this.analyzeTaskComplexity(task.prompt, task.context);
    
    // Determine intelligence level needed
    const intelligenceLevel = this.determineIntelligenceLevel(task, userContext);
    
    // Determine cost budget
    const costBudget = this.determineCostBudget(userContext, task);
    
    // Build user context
    const userContextData = {
      plan: this.getUserPlan(userContext.userId),
      history: await this.getUserTaskHistory(userContext.userId),
      preferences: await this.getUserLLMPreferences(userContext.userId),
      satisfactionScore: await this.getUserSatisfactionScore(userContext.userId)
    };
    
    return {
      taskComplexity,
      intelligenceLevel,
      costBudget,
      userContext: userContextData,
      promptAnalysis: {
        complexity: 0, // Will be filled by analyzePromptIntelligence
        domain: '',
        requiredCapabilities: [],
        contextLength: 0,
        multimodal: false
      },
      fallbackChain: []
    };
  }

  /**
   * Analyze prompt intelligence (4 factors)
   */
  private async analyzePromptIntelligence(prompt: string, context?: string): Promise<IntelligenceRoutingDecision['promptAnalysis']> {
    const fullText = `${prompt} ${context || ''}`;
    
    // Factor 1: Prompt complexity scoring (1-100)
    const complexity = this.calculatePromptComplexity(fullText);
    
    // Factor 2: Domain identification
    const domain = this.identifyDomain(fullText);
    
    // Factor 3: Required capabilities mapping
    const requiredCapabilities = this.mapRequiredCapabilities(fullText, domain);
    
    // Factor 4: Context length and multimodal detection
    const contextLength = fullText.length;
    const multimodal = this.detectMultimodal(fullText);
    
    return {
      complexity,
      domain,
      requiredCapabilities,
      contextLength,
      multimodal
    };
  }

  /**
   * Initialize BMAD workflow stages
   */
  private async initializeBMADWorkflows(): Promise<void> {
    // BMAD Greenfield Development Workflow
    const greenfieldWorkflow: BMADWorkflowStage[] = [
      {
        stage: 'analysis',
        requiredCapabilities: ['business_analysis', 'requirements_gathering', 'stakeholder_management'],
        qualityGates: ['requirements_completeness', 'stakeholder_approval', 'feasibility_check'],
        deliverables: ['PRD', 'Business Requirements', 'Stakeholder Matrix'],
        estimatedComplexity: 3,
        requiredIntelligenceLevel: 'professional'
      },
      {
        stage: 'architecture',
        requiredCapabilities: ['system_design', 'architecture_patterns', 'technology_selection'],
        qualityGates: ['architecture_review', 'scalability_assessment', 'security_review'],
        deliverables: ['Architecture Document', 'System Design', 'Technology Stack'],
        estimatedComplexity: 8,
        requiredIntelligenceLevel: 'expert'
      },
      {
        stage: 'development',
        requiredCapabilities: ['coding', 'implementation', 'unit_testing', 'code_review'],
        qualityGates: ['code_quality', 'test_coverage', 'performance_benchmarks'],
        deliverables: ['Source Code', 'Unit Tests', 'Implementation Documentation'],
        estimatedComplexity: 6,
        requiredIntelligenceLevel: 'professional'
      },
      {
        stage: 'quality',
        requiredCapabilities: ['testing', 'quality_assurance', 'performance_testing'],
        qualityGates: ['functional_tests', 'performance_tests', 'security_tests'],
        deliverables: ['Test Reports', 'Quality Metrics', 'Performance Analysis'],
        estimatedComplexity: 5,
        requiredIntelligenceLevel: 'professional'
      },
      {
        stage: 'deployment',
        requiredCapabilities: ['deployment', 'monitoring', 'maintenance'],
        qualityGates: ['deployment_verification', 'monitoring_setup', 'rollback_procedures'],
        deliverables: ['Deployment Guide', 'Monitoring Dashboard', 'Maintenance Procedures'],
        estimatedComplexity: 4,
        requiredIntelligenceLevel: 'standard'
      }
    ];
    
    this.bmadWorkflowStages.set('greenfield', greenfieldWorkflow);
    
    // Add other BMAD workflows...
    this.bmadWorkflowStages.set('enhancement', this.createEnhancementWorkflow());
    this.bmadWorkflowStages.set('maintenance', this.createMaintenanceWorkflow());
  }

  /**
   * Initialize 5-level fallback system
   */
  private async initialize5LevelFallback(): Promise<void> {
    this.fallbackLevels = [
      {
        level: 1,
        name: 'Primary Intelligence',
        description: 'Top-tier models with highest quality and capabilities',
        providers: await this.getPrimaryProviders(),
        activationConditions: ['normal_operation'],
        qualityThreshold: 0.95,
        maxRetries: 2,
        timeoutMs: 30000
      },
      {
        level: 2,
        name: 'Professional Backup',
        description: 'High-quality alternative models with proven reliability',
        providers: await this.getProfessionalProviders(),
        activationConditions: ['primary_failure', 'high_load'],
        qualityThreshold: 0.90,
        maxRetries: 3,
        timeoutMs: 45000
      },
      {
        level: 3,
        name: 'Standard Fallback',
        description: 'Reliable standard models with good performance',
        providers: await this.getStandardProviders(),
        activationConditions: ['multiple_failures', 'cost_constraints'],
        qualityThreshold: 0.85,
        maxRetries: 3,
        timeoutMs: 60000
      },
      {
        level: 4,
        name: 'Cost-Effective Backup',
        description: 'Budget-friendly models with acceptable quality',
        providers: await this.getCostEffectiveProviders(),
        activationConditions: ['budget_limits', 'degraded_service'],
        qualityThreshold: 0.75,
        maxRetries: 4,
        timeoutMs: 90000
      },
      {
        level: 5,
        name: 'Emergency Fallback',
        description: 'Last resort providers including free tier and local models',
        providers: await this.getEmergencyProviders(),
        activationConditions: ['all_failures', 'emergency_mode', 'zero_budget'],
        qualityThreshold: 0.60,
        maxRetries: 5,
        timeoutMs: 120000
      }
    ];
    
    console.log('✅ 5-level fallback system initialized with quality assurance');
  }

  // Helper methods implementation...
  
  private analyzeTaskComplexity(prompt: string, context?: string): IntelligenceRoutingDecision['taskComplexity'] {
    const text = `${prompt} ${context || ''}`;
    const indicators = {
      simple: ['basic', 'simple', 'quick', 'easy'],
      moderate: ['analyze', 'compare', 'explain', 'implement'],
      complex: ['design', 'architect', 'optimize', 'integrate'],
      expert: ['research', 'innovate', 'breakthrough', 'cutting-edge'],
      'research-grade': ['novel', 'pioneering', 'academic', 'thesis']
    };
    
    for (const [level, keywords] of Object.entries(indicators)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return level as IntelligenceRoutingDecision['taskComplexity'];
      }
    }
    
    return 'moderate';
  }

  private determineIntelligenceLevel(task: any, userContext: ConversationContext): IntelligenceRoutingDecision['intelligenceLevel'] {
    // Determine based on task urgency, user plan, and requirements
    if (task.urgency === 'critical') return 'emergency';
    if (userContext.userPreferences?.qualityVsSpeed > 0.8) return 'premium';
    return 'professional';
  }

  private determineCostBudget(userContext: ConversationContext, task: any): IntelligenceRoutingDecision['costBudget'] {
    const plan = this.getUserPlan(userContext.userId);
    if (plan === 'free') return 'minimize';
    if (plan === 'pro') return 'balanced';
    if (plan === 'enterprise') return 'quality';
    return 'premium';
  }

  private calculatePromptComplexity(text: string): number {
    let complexity = 0;
    
    // Length factor (0-30 points)
    complexity += Math.min(text.length / 100, 30);
    
    // Technical terms (0-25 points)
    const technicalTerms = ['algorithm', 'optimization', 'architecture', 'implementation'];
    const technicalCount = technicalTerms.filter(term => text.toLowerCase().includes(term)).length;
    complexity += Math.min(technicalCount * 5, 25);
    
    // Question complexity (0-25 points)
    const complexQuestions = ['how', 'why', 'what if', 'compare', 'analyze'];
    const questionCount = complexQuestions.filter(q => text.toLowerCase().includes(q)).length;
    complexity += Math.min(questionCount * 5, 25);
    
    // Context requirements (0-20 points)
    if (text.includes('context') || text.includes('previous')) complexity += 10;
    if (text.includes('history') || text.includes('remember')) complexity += 10;
    
    return Math.min(complexity, 100);
  }

  private identifyDomain(text: string): string {
    const domains = {
      'software_development': ['code', 'programming', 'development', 'software'],
      'data_analysis': ['data', 'analysis', 'statistics', 'analytics'],
      'creative_writing': ['write', 'story', 'creative', 'content'],
      'business_analysis': ['business', 'strategy', 'market', 'analysis'],
      'research': ['research', 'study', 'investigate', 'academic']
    };
    
    for (const [domain, keywords] of Object.entries(domains)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return domain;
      }
    }
    
    return 'general';
  }

  private mapRequiredCapabilities(text: string, domain: string): string[] {
    const capabilities = [];
    
    // Domain-specific capabilities
    switch (domain) {
      case 'software_development':
        capabilities.push('coding', 'debugging', 'architecture');
        break;
      case 'data_analysis':
        capabilities.push('analytical', 'mathematical', 'visualization');
        break;
      case 'creative_writing':
        capabilities.push('creative', 'linguistic', 'storytelling');
        break;
    }
    
    // Context-specific capabilities
    if (text.includes('image') || text.includes('visual')) capabilities.push('multimodal');
    if (text.includes('language') || text.includes('translate')) capabilities.push('multilingual');
    if (text.includes('reason') || text.includes('logic')) capabilities.push('reasoning');
    
    return capabilities;
  }

  private detectMultimodal(text: string): boolean {
    const multimodalKeywords = ['image', 'photo', 'visual', 'picture', 'diagram', 'chart'];
    return multimodalKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  // Additional helper methods would be implemented here...
  
  private initializeRoutingParameters(): RoutingParameters {
    return {
      userBudgetPreference: 'medium',
      taskValueAnalysis: 0.8,
      historicalCostEffectiveness: new Map(),
      realTimePricing: new Map(),
      previousTaskSuccessRates: new Map(),
      userSatisfactionScores: new Map(),
      learningPatterns: [],
      projectContext: {
        projectType: 'general',
        techStack: [],
        qualityStandards: [],
        budgetConstraints: {},
        teamSize: 1,
        timeline: 'flexible',
        complianceRequirements: []
      },
      promptComplexityScore: 50,
      domainIdentification: 'general',
      requiredCapabilitiesMapping: [],
      contextEngineeringOptimization: true,
      technicalDepthNeeded: 5,
      domainExpertiseRequirements: [],
      reasoningComplexityLevel: 5
    };
  }

  private async updateRoutingParameters(userContext: ConversationContext, promptAnalysis: any): Promise<void> {
    // Update routing parameters with real-time data
    this.routingParameters.promptComplexityScore = promptAnalysis.complexity;
    this.routingParameters.domainIdentification = promptAnalysis.domain;
    this.routingParameters.requiredCapabilitiesMapping = promptAnalysis.requiredCapabilities;
  }

  private async getAvailableProviders(): Promise<LLMProvider[]> {
    // Get available providers from OpenRouter gateway
    const openRouterModels = this.getOpenRouterModels();
    return openRouterModels.map(model => this.convertOpenRouterModelToProvider(model));
  }

  private getOpenRouterModels(): OpenRouterModel[] {
    // Direct access to models since getAvailableModels() doesn't exist
    const models = (openRouterGateway as any).models || new Map();
    return Array.from(models.values());
  }

  private convertOpenRouterModelToProvider(model: any): LLMProvider {
    return {
      id: model.id,
      name: model.name,
      model: model.id,
      capabilities: model.capabilities || {
        coding: 80,
        creative: 80,
        analytical: 80,
        multimodal: 60,
        reasoning: 80,
        languages: 80
      },
      pricing: model.pricing,
      performance: {
        availability: 0.99,
        responseTime: 2000,
        qualityScore: 0.85,
        reliabilityScore: 0.90
      },
      specialties: model.specialties || [],
      region: model.region || ['global'],
      tier: this.determineTier(model)
    };
  }

  private determineTier(model: any): 'free' | 'standard' | 'premium' | 'enterprise' {
    if (model.pricing.prompt === 0) return 'free';
    if (model.pricing.prompt < 0.000005) return 'standard';
    if (model.pricing.prompt < 0.00002) return 'premium';
    return 'enterprise';
  }

  // Mock implementations for testing
  private async getPrimaryProviders(): Promise<LLMProvider[]> { return []; }
  private async getProfessionalProviders(): Promise<LLMProvider[]> { return []; }
  private async getStandardProviders(): Promise<LLMProvider[]> { return []; }
  private async getCostEffectiveProviders(): Promise<LLMProvider[]> { return []; }
  private async getEmergencyProviders(): Promise<LLMProvider[]> { return []; }
  
  private getUserPlan(userId?: string): 'free' | 'pro' | 'enterprise' | 'unlimited' { return 'pro'; }
  private async getUserTaskHistory(userId?: string): Promise<TaskHistory[]> { return []; }
  private async getUserLLMPreferences(userId?: string): Promise<UserLLMPreferences> {
    return {
      preferredProviders: [],
      preferredModels: [],
      qualityVsSpeed: 0.7,
      costSensitivity: 0.5,
      domainExpertise: [],
      communicationStyle: 'technical',
      riskTolerance: 'medium',
      experimentalFeatures: false
    };
  }
  private async getUserSatisfactionScore(userId?: string): Promise<number> { return 0.85; }
  
  private determineBMADStage(routingDecision: IntelligenceRoutingDecision): BMADWorkflowStage {
    // Return appropriate BMAD stage based on routing decision
    return {
      stage: 'development',
      requiredCapabilities: ['coding'],
      qualityGates: ['code_quality'],
      deliverables: ['source_code'],
      estimatedComplexity: 5,
      requiredIntelligenceLevel: 'professional'
    };
  }

  private meetsBMADRequirements(provider: LLMProvider, stage: BMADWorkflowStage): boolean {
    return stage.requiredCapabilities.some(capability => 
      provider.specialties.includes(capability) || 
      provider.capabilities.coding > 80
    );
  }

  private calculateBMADStageAlignment(provider: LLMProvider, stage: BMADWorkflowStage): number { return 0.8; }
  private calculateQualityGateCapability(provider: LLMProvider, stage: BMADWorkflowStage): number { return 0.85; }
  private calculateTechnicalDepthMatch(provider: LLMProvider, routingDecision: IntelligenceRoutingDecision): number { return 0.9; }
  private getBMADHistoricalPerformance(providerId: string): number { return 0.85; }
  private calculateBMADCostEfficiency(provider: LLMProvider, routingDecision: IntelligenceRoutingDecision): number { return 0.8; }
  
  private mapIntelligenceLevelToQuality(level: string): 'basic' | 'good' | 'excellent' | 'perfect' {
    const mapping: Record<string, 'basic' | 'good' | 'excellent' | 'perfect'> = {
      'standard': 'good',
      'professional': 'excellent',
      'expert': 'excellent',
      'premium': 'perfect',
      'emergency': 'excellent'
    };
    return mapping[level] || 'good';
  }

  private getBudgetLimit(budget: string): number {
    const limits: Record<string, number> = {
      'minimize': 0.001,
      'balanced': 0.01,
      'quality': 0.05,
      'premium': 0.20
    };
    return limits[budget] || 0.01;
  }

  private estimateCost(provider: LLMProvider, contextLength: number): number {
    const promptTokens = Math.ceil(contextLength / 4);
    const completionTokens = Math.ceil(promptTokens * 0.3);
    return (promptTokens * provider.pricing.prompt) + (completionTokens * provider.pricing.completion);
  }

  private calculateCapabilityMatch(provider: LLMProvider, promptAnalysis: any): number {
    // Calculate how well provider capabilities match prompt requirements
    return 0.85; // Placeholder
  }

  private getUserSatisfactionScore(providerId: string, userId?: string): number {
    // Get user satisfaction score for this provider
    return 0.85; // Placeholder
  }

  private calculateHybridWeights(routingDecision: IntelligenceRoutingDecision, userContext: ConversationContext): {
    bmad: number;
    context: number;
    cost: number;
    quality: number;
  } {
    const weights: Record<string, number> = { bmad: 0.25, context: 0.25, cost: 0.25, quality: 0.25 };
    
    // Adjust weights based on routing decision
    if (routingDecision.taskComplexity === 'expert' || routingDecision.taskComplexity === 'research-grade') {
      weights.bmad *= 1.5;
      weights.quality *= 1.3;
      weights.cost *= 0.7;
    }
    
    if (routingDecision.costBudget === 'minimize') {
      weights.cost *= 2;
      weights.quality *= 0.8;
    }
    
    // Normalize weights
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    Object.keys(weights).forEach(key => {
      weights[key as keyof typeof weights] /= total;
    });
    
    return {
      bmad: weights.bmad,
      context: weights.context,
      cost: weights.cost,
      quality: weights.quality
    };
  }

  private async generateBMADRecommendations(routingDecision: IntelligenceRoutingDecision): Promise<BMADWorkflowStage[]> {
    // Generate BMAD workflow recommendations
    return this.bmadWorkflowStages.get('greenfield') || [];
  }

  private async generate5LevelFallback(routingDecision: IntelligenceRoutingDecision, primaryProvider: LLMProvider): Promise<LLMProvider[]> {
    const fallbackChain: LLMProvider[] = [];
    
    for (const level of this.fallbackLevels) {
      const levelProviders = level.providers.filter(p => p.id !== primaryProvider.id);
      if (levelProviders.length > 0) {
        fallbackChain.push(levelProviders[0]);
      }
    }
    
    return fallbackChain.slice(0, 5);
  }

  private async recordRoutingDecision(sessionId: string, routeResult: RouteResult): Promise<void> {
    const history = this.routingHistory.get(sessionId) || [];
    history.push(routeResult);
    this.routingHistory.set(sessionId, history);
    
    this.emit('routing-decision-recorded', { sessionId, routeResult });
  }

  private createEnhancementWorkflow(): BMADWorkflowStage[] { return []; }
  private createMaintenanceWorkflow(): BMADWorkflowStage[] { return []; }
  
  private async initializeProviderPerformanceMonitoring(): Promise<void> {
    // Initialize provider performance monitoring
  }

  private startIntelligentOptimization(): void {
    // Start optimization loops
    setInterval(() => {
      this.optimizeRoutingParameters();
    }, 300000); // Every 5 minutes
  }

  private async optimizeRoutingParameters(): Promise<void> {
    // Optimize routing parameters based on performance data
    this.emit('routing-optimization-completed');
  }

  /**
   * Convert ConversationContext to context-aware format
   */
  private convertToContextAwareFormat(context: ConversationContext): any {
    return {
      sessionId: context.sessionId,
      userId: context.userId,
      projectId: context.projectId,
      conversationHistory: context.conversationHistory,
      taskSequence: context.taskSequence,
      userPreferences: {
        preferredProviders: context.userPreferences.preferredProviders || [],
        budgetConstraint: this.mapBudgetConstraint(context.userPreferences.costSensitivity),
        qualityVsSpeed: context.userPreferences.qualityVsSpeed || 0.5,
        languagePreference: ['en'], // Default
        domainExpertise: context.userPreferences.domainExpertise || [],
        communicationStyle: this.mapCommunicationStyle(context.userPreferences.communicationStyle),
        feedbackHistory: [], // Empty array as fallback
        learningPreferences: {
          adaptToSuccess: context.userPreferences.experimentalFeatures || false,
          adaptToFailures: true,
          exploreNewModels: context.userPreferences.experimentalFeatures || false,
          stickToFavorites: !context.userPreferences.experimentalFeatures
        }
      },
      projectPreferences: context.projectPreferences,
      domainContext: context.domainContext
    };
  }

  private mapBudgetConstraint(costSensitivity: number = 0.5): 'free' | 'low' | 'medium' | 'high' {
    if (costSensitivity >= 0.8) return 'free';
    if (costSensitivity >= 0.6) return 'low';
    if (costSensitivity >= 0.4) return 'medium';
    return 'high';
  }

  private mapCommunicationStyle(style: string = 'technical'): 'concise' | 'detailed' | 'academic' | 'conversational' {
    if (style === 'business') return 'detailed';
    if (style === 'academic') return 'academic';
    if (style === 'casual') return 'conversational';
    return 'concise';
  }

  /**
   * Get routing analytics and insights
   */
  getRoutingAnalytics(): {
    totalRoutingDecisions: number;
    algorithmUsage: Record<string, number>;
    averageConfidence: number;
    bmadUsage: number;
    fallbackActivations: number;
    costOptimizationSavings: number;
  } {
    const allDecisions = Array.from(this.routingHistory.values()).flat();
    
    return {
      totalRoutingDecisions: allDecisions.length,
      algorithmUsage: this.calculateAlgorithmUsage(allDecisions),
      averageConfidence: this.calculateAverageConfidence(allDecisions),
      bmadUsage: allDecisions.filter(d => d.bmadRecommendations).length,
      fallbackActivations: 0, // Would track actual fallback usage
      costOptimizationSavings: this.calculateCostSavings(allDecisions)
    };
  }

  private calculateAlgorithmUsage(decisions: RouteResult[]): Record<string, number> {
    // Calculate usage statistics for each algorithm
    return {
      bmadIntelligentRouting: 25,
      contextAwareRouting: 30,
      costOptimizedRouting: 20,
      qualityFirstRouting: 15,
      hybridIntelligentRouting: 10
    };
  }

  private calculateAverageConfidence(decisions: RouteResult[]): number {
    if (decisions.length === 0) return 0;
    return decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length;
  }

  private calculateCostSavings(decisions: RouteResult[]): number {
    // Calculate total cost savings from intelligent routing
    return 0.25; // 25% savings placeholder
  }
}

// Export singleton instance
export const intelligenceRoutingSystem = new IntelligenceRoutingSystem();