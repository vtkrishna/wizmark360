/**
 * Shared Orchestration Types for WAI LLM System
 * 
 * Unified interfaces and types to ensure consistency across all
 * orchestration components and prevent contract mismatches.
 */

export interface LLMProvider {
  id: string;
  name: string;
  model: string;
  capabilities: {
    coding: number;
    creative: number;
    analytical: number;
    multimodal: number;
    reasoning: number;
    languages: number;
  };
  pricing: {
    prompt: number;
    completion: number;
  };
  performance: {
    availability: number;
    responseTime: number;
    qualityScore: number;
    reliabilityScore: number;
  };
  specialties: string[];
  region: string[];
  tier: 'free' | 'standard' | 'premium' | 'enterprise';
}

export interface FallbackCondition {
  type: 'provider_failure' | 'quality_degradation' | 'timeout' | 'rate_limit' | 'cost_limit' | 'health_check_failure';
  threshold?: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoActivate: boolean;
}

export interface EmergencyProtocol {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: EmergencyAction[];
  escalationLevel: number;
  notificationRequired: boolean;
}

export interface EmergencyAction {
  type: 'switch_provider' | 'reduce_quality' | 'increase_timeout' | 'notify_admin' | 'enable_local_models';
  parameters: Record<string, any>;
  executionOrder: number;
  isReversible: boolean;
}

export interface FallbackLevel {
  level: 1 | 2 | 3 | 4 | 5;
  name: string;
  description: string;
  providers: LLMProvider[];
  activationConditions: FallbackCondition[];
  qualityThreshold: number;
  maxRetries: number;
  timeoutMs: number;
  healthCheckIntervalMs: number;
  costLimit?: number;
  emergencyProtocols: EmergencyProtocol[];
}

export interface RouteResult {
  selectedProvider: LLMProvider;
  routingDecision: IntelligenceRoutingDecision;
  confidence: number;
  reasoning: string[];
  fallbackChain: LLMProvider[];
  estimatedCost: number;
  estimatedQuality: number;
  estimatedResponseTime: number;
  bmadRecommendations?: BMADWorkflowStage[];
  correlationId: string; // For tracing
  timestamp: Date;
}

export interface IntelligenceRoutingDecision {
  taskComplexity: 'simple' | 'moderate' | 'complex' | 'expert' | 'research-grade';
  intelligenceLevel: 'standard' | 'professional' | 'expert' | 'premium' | 'emergency';
  costBudget: 'minimize' | 'balanced' | 'quality' | 'premium';
  userContext: {
    plan: 'free' | 'pro' | 'enterprise' | 'unlimited';
    history: TaskHistory[];
    preferences: UserLLMPreferences;
    satisfactionScore: number;
  };
  promptAnalysis: {
    complexity: number;
    domain: string;
    requiredCapabilities: string[];
    contextLength: number;
    multimodal: boolean;
  };
  fallbackChain: LLMProvider[];
}

export interface TaskHistory {
  taskId: string;
  taskType: string;
  complexity: string;
  modelUsed: string;
  successRate: number;
  satisfactionScore: number;
  costEffectiveness: number;
  completionTime: number;
  timestamp: Date;
  outcome: 'success' | 'partial' | 'failure';
  userFeedback?: string;
}

export interface UserLLMPreferences {
  preferredProviders: string[];
  preferredModels: string[];
  qualityVsSpeed: number; // 0-1, 0=speed, 1=quality
  costSensitivity: number; // 0-1, 0=cost-insensitive, 1=very cost-sensitive
  domainExpertise: string[];
  communicationStyle: 'technical' | 'business' | 'casual' | 'academic';
  riskTolerance: 'low' | 'medium' | 'high';
  experimentalFeatures: boolean;
}

export interface BMADWorkflowStage {
  stage: 'analysis' | 'architecture' | 'development' | 'quality' | 'deployment';
  requiredCapabilities: string[];
  qualityGates: string[];
  deliverables: string[];
  estimatedComplexity: number;
  requiredIntelligenceLevel: IntelligenceRoutingDecision['intelligenceLevel'];
}

export interface ConversationContext {
  sessionId: string;
  userId?: string;
  projectId?: string;
  conversationHistory: ConversationMessage[];
  taskSequence: TaskContext[];
  userPreferences: UserLLMPreferences;
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

export interface ContextAnalysis {
  taskType: 'coding' | 'creative' | 'analytical' | 'multimodal' | 'reasoning' | 'general';
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  expectedTokens: number;
  urgency: 'low' | 'medium' | 'high';
  qualityRequirement: 'basic' | 'good' | 'excellent' | 'perfect';
  budgetConstraint: 'free' | 'low' | 'medium' | 'high';
  languageRequirements: string[];
  domainExpertise: string[];
}

export interface ModelSelection {
  selectedModel: LLMProvider;
  confidence: number;
  reasoning: string;
  fallbackModels: LLMProvider[];
  estimatedCost: number;
  estimatedTime: number;
}

export interface ProviderHealthStatus {
  providerId: string;
  status: 'healthy' | 'degraded' | 'failing' | 'offline';
  availability: number;
  averageResponseTime: number;
  errorRate: number;
  qualityScore: number;
  lastHealthCheck: Date;
  consecutiveFailures: number;
  recoveryTime?: Date;
  issues: string[];
}

export interface QualityAssessment {
  score: number;
  metrics: {
    coherence: number;
    relevance: number;
    accuracy: number;
    completeness: number;
    safety: number;
  };
  passesThreshold: boolean;
  assessmentTime: number;
  assessmentMethod: 'llm_evaluator' | 'rule_based' | 'user_feedback' | 'hybrid';
}

export interface FallbackExecution {
  id: string;
  sessionId: string;
  originalProvider: LLMProvider;
  originalRequest: any;
  fallbackSequence: Array<{
    level: number;
    provider: LLMProvider;
    attempt: number;
    result: 'success' | 'failure' | 'timeout' | 'quality_fail';
    responseTime: number;
    qualityScore?: number;
    errorMessage?: string;
    timestamp: Date;
  }>;
  finalResult: {
    success: boolean;
    provider: LLMProvider;
    totalTime: number;
    fallbackLevel: number;
    qualityScore: number;
    cost: number;
  };
  startTime: Date;
  endTime: Date;
  totalExecutionTime: number;
  correlationId: string;
}

// Configuration interfaces
export interface OrchestrationConfig {
  enableRealTimeOptimization: boolean;
  enableQualityAssurance: boolean;
  enableAdaptiveLearning: boolean;
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold: number;
  circuitBreakerTimeoutMs: number;
  maxConcurrentRequests: number;
  defaultTimeoutMs: number;
  retryConfig: {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
  };
}

// Error types moved to orchestration-errors.ts for runtime usage

// Utility functions moved to orchestration-utils.ts for proper layering