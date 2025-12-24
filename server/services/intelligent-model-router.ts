import { LLM_REGISTRY, LLMModel, AIProvider } from "./enhanced-ai-service";
import { ROMALevel, Vertical } from "../agents/market360-agent-catalog";

export type TaskComplexity = "simple" | "moderate" | "complex" | "critical";
export type TaskType = "chat" | "code" | "reasoning" | "vision" | "content" | "translation" | "search" | "voice" | "multimodal" | "agents";

export interface RoutingContext {
  taskType: TaskType;
  complexity: TaskComplexity;
  requiresVision?: boolean;
  requiresVoice?: boolean;
  requiresReasoning?: boolean;
  requiresCode?: boolean;
  requiresMultimodal?: boolean;
  requiresIndianLanguages?: boolean;
  maxCostPerMillion?: number;
  minContextWindow?: number;
  preferredProviders?: AIProvider[];
  excludedProviders?: AIProvider[];
  agentRomaLevel?: ROMALevel;
  agentVertical?: Vertical;
  brandTier?: "starter" | "professional" | "enterprise";
  latencyPriority?: "low" | "medium" | "high";
  qualityPriority?: "standard" | "high" | "premium";
}

export interface ModelScore {
  model: LLMModel;
  totalScore: number;
  breakdown: {
    capabilityMatch: number;
    costEfficiency: number;
    qualityScore: number;
    contextFit: number;
    providerTrust: number;
  };
  reasoning: string;
}

export interface RoutingDecision {
  primary: ModelScore;
  fallbacks: ModelScore[];
  estimatedCost: { input: number; output: number };
  confidence: number;
  strategy: string;
}

const COMPLEXITY_WEIGHTS: Record<TaskComplexity, { cost: number; quality: number }> = {
  simple: { cost: 0.7, quality: 0.3 },
  moderate: { cost: 0.5, quality: 0.5 },
  complex: { cost: 0.3, quality: 0.7 },
  critical: { cost: 0.1, quality: 0.9 }
};

const ROMA_MODEL_PREFERENCES: Record<ROMALevel, { minTier: number; preferredCapabilities: string[] }> = {
  L0: { minTier: 3, preferredCapabilities: ["fast", "text"] },
  L1: { minTier: 2, preferredCapabilities: ["text", "code"] },
  L2: { minTier: 2, preferredCapabilities: ["text", "code", "reasoning"] },
  L3: { minTier: 1, preferredCapabilities: ["reasoning", "code", "agents"] },
  L4: { minTier: 1, preferredCapabilities: ["advanced-reasoning", "agents", "agentic", "deep-thinking"] }
};

const TASK_CAPABILITY_MAP: Record<TaskType, string[]> = {
  chat: ["text", "fast", "conversational"],
  code: ["code", "reasoning", "swe-bench"],
  reasoning: ["reasoning", "advanced-reasoning", "deep-thinking"],
  vision: ["vision", "multimodal", "document-understanding"],
  content: ["text", "content-creation", "content-generation"],
  translation: ["translation", "indian-languages", "multilingual"],
  search: ["search", "real-time", "rag"],
  voice: ["voice", "tts", "stt"],
  multimodal: ["multimodal", "vision", "function-calling"],
  agents: ["agents", "agentic", "function-calling", "long-running"]
};

const PROVIDER_TRUST_SCORES: Partial<Record<AIProvider, number>> = {
  openai: 0.95,
  anthropic: 0.93,
  gemini: 0.90,
  groq: 0.85,
  together: 0.82,
  deepseek: 0.80,
  mistral: 0.82,
  cohere: 0.78,
  zhipu: 0.80,
  sarvam: 0.75,
  perplexity: 0.78,
  xai: 0.80,
  openrouter: 0.75,
  replicate: 0.72,
  fireworks: 0.78,
  anyscale: 0.72,
  huggingface: 0.70,
  aws_bedrock: 0.88,
  azure_openai: 0.90,
  vertexai: 0.88,
  ollama: 0.65
};

const FLAGSHIP_MODELS: Record<string, { provider: AIProvider; modelId: string; bestFor: string[] }> = {
  "premium-reasoning": { provider: "openai", modelId: "gpt-5.2-pro", bestFor: ["complex", "critical"] },
  "balanced-performance": { provider: "openai", modelId: "gpt-5.2", bestFor: ["moderate", "complex"] },
  "fast-quality": { provider: "openai", modelId: "gpt-5.2-instant", bestFor: ["simple", "moderate"] },
  "code-specialist": { provider: "openai", modelId: "gpt-5.2-codex", bestFor: ["code", "agents"] },
  "multimodal-vision": { provider: "zhipu", modelId: "glm-4.6v", bestFor: ["vision", "multimodal", "content"] },
  "cost-effective-vision": { provider: "zhipu", modelId: "glm-4.6v-flash", bestFor: ["vision", "simple"] },
  "long-context": { provider: "gemini", modelId: "gemini-2.5-pro", bestFor: ["long-context", "analysis"] },
  "ultra-fast": { provider: "groq", modelId: "llama-3.3-70b", bestFor: ["real-time", "chat"] },
  "indian-languages": { provider: "sarvam", modelId: "sarvam-m", bestFor: ["translation", "indian-languages"] },
  "deep-analysis": { provider: "anthropic", modelId: "claude-opus-4.5", bestFor: ["analysis", "critical"] },
  "balanced-claude": { provider: "anthropic", modelId: "claude-sonnet-4.5", bestFor: ["moderate", "code"] }
};

export class IntelligentModelRouter {
  private registry: LLMModel[];
  private usageHistory: Map<string, { calls: number; avgLatency: number; errorRate: number }>;

  constructor() {
    this.registry = LLM_REGISTRY;
    this.usageHistory = new Map();
  }

  selectOptimalModel(context: RoutingContext): RoutingDecision {
    let candidates = this.filterCandidates(context);
    
    if (candidates.length === 0) {
      const relaxedContext = { ...context };
      delete relaxedContext.preferredProviders;
      delete relaxedContext.excludedProviders;
      delete relaxedContext.maxCostPerMillion;
      candidates = this.filterCandidates(relaxedContext);
      
      if (candidates.length === 0) {
        candidates = this.registry.slice(0, 10);
      }
    }
    
    const scoredModels = this.scoreModels(candidates, context);
    scoredModels.sort((a, b) => b.totalScore - a.totalScore);
    
    if (scoredModels.length === 0) {
      const defaultModel = this.registry.find(m => m.id === "gpt-5.2") || this.registry[0];
      const defaultScore: ModelScore = {
        model: defaultModel,
        totalScore: 0.5,
        breakdown: { capabilityMatch: 0.5, costEfficiency: 0.5, qualityScore: 0.8, contextFit: 0.5, providerTrust: 0.9 },
        reasoning: "Default fallback selection"
      };
      return {
        primary: defaultScore,
        fallbacks: [],
        estimatedCost: { input: 0.01, output: 0.02 },
        confidence: 0.5,
        strategy: "Fallback to default model"
      };
    }
    
    const primary = scoredModels[0];
    const fallbacks = scoredModels.slice(1, 4);
    
    const estimatedTokens = this.estimateTokens(context);
    const estimatedCost = {
      input: (estimatedTokens.input / 1000000) * primary.model.inputCostPer1M,
      output: (estimatedTokens.output / 1000000) * primary.model.outputCostPer1M
    };
    
    const confidence = this.calculateConfidence(primary, fallbacks, context);
    const strategy = this.determineStrategy(context, primary);
    
    return { primary, fallbacks, estimatedCost, confidence, strategy };
  }

  private filterCandidates(context: RoutingContext): LLMModel[] {
    return this.registry.filter(model => {
      if (context.excludedProviders?.includes(model.provider)) return false;
      if (context.preferredProviders?.length && !context.preferredProviders.includes(model.provider)) return false;
      if (context.maxCostPerMillion && model.inputCostPer1M > context.maxCostPerMillion) return false;
      if (context.minContextWindow && model.contextWindow < context.minContextWindow) return false;
      
      if (context.requiresVision && !model.capabilities.some(c => ["vision", "multimodal"].includes(c))) return false;
      if (context.requiresVoice && !model.supportsVoice) return false;
      if (context.requiresIndianLanguages && !model.capabilities.includes("indian-languages") && model.provider !== "sarvam") return false;
      
      return true;
    });
  }

  private scoreModels(candidates: LLMModel[], context: RoutingContext): ModelScore[] {
    const weights = COMPLEXITY_WEIGHTS[context.complexity];
    
    return candidates.map(model => {
      const capabilityMatch = this.scoreCapabilityMatch(model, context);
      const costEfficiency = this.scoreCostEfficiency(model, context);
      const qualityScore = this.scoreQuality(model, context);
      const contextFit = this.scoreContextFit(model, context);
      const providerTrust = PROVIDER_TRUST_SCORES[model.provider] || 0.7;
      
      const totalScore = 
        (capabilityMatch * 0.35) +
        (costEfficiency * weights.cost * 0.25) +
        (qualityScore * weights.quality * 0.25) +
        (contextFit * 0.10) +
        (providerTrust * 0.05);
      
      const reasoning = this.generateReasoning(model, context, { capabilityMatch, costEfficiency, qualityScore, contextFit, providerTrust });
      
      return {
        model,
        totalScore,
        breakdown: { capabilityMatch, costEfficiency, qualityScore, contextFit, providerTrust },
        reasoning
      };
    });
  }

  private scoreCapabilityMatch(model: LLMModel, context: RoutingContext): number {
    const requiredCaps = TASK_CAPABILITY_MAP[context.taskType] || [];
    let romaPrefs: string[] = [];
    
    if (context.agentRomaLevel) {
      romaPrefs = ROMA_MODEL_PREFERENCES[context.agentRomaLevel].preferredCapabilities;
    }
    
    const allRequired = Array.from(new Set([...requiredCaps, ...romaPrefs]));
    if (allRequired.length === 0) return 0.5;
    
    const matched = allRequired.filter(cap => 
      model.capabilities.some(mc => mc.includes(cap) || cap.includes(mc))
    );
    
    return matched.length / allRequired.length;
  }

  private scoreCostEfficiency(model: LLMModel, context: RoutingContext): number {
    const maxCost = context.maxCostPerMillion || 100;
    const avgCost = (model.inputCostPer1M + model.outputCostPer1M) / 2;
    
    if (avgCost === 0) return 1.0;
    if (avgCost >= maxCost) return 0.1;
    
    return 1 - (avgCost / maxCost);
  }

  private scoreQuality(model: LLMModel, context: RoutingContext): number {
    const qualityTiers: Record<string, number> = {
      "gpt-5.2-pro": 1.0, "gpt-5.2": 0.95, "o3-pro": 0.98, "o3": 0.95,
      "claude-opus-4.5": 0.97, "claude-sonnet-4.5": 0.92,
      "gpt-5.1": 0.90, "gpt-5": 0.88, "gpt-5.2-codex": 0.93,
      "glm-4.6v": 0.85, "glm-4.6": 0.82,
      "gemini-3-pro": 0.88, "gemini-2.5-pro": 0.85,
      "gpt-4.1": 0.82, "gpt-4o": 0.80,
      "llama-4-maverick": 0.78, "llama-3.3-70b": 0.75,
      "gpt-5-mini": 0.75, "gpt-5-nano": 0.68,
      "glm-4.6v-flash": 0.72, "gpt-4o-mini": 0.70
    };
    
    const baseQuality = qualityTiers[model.id] || 0.6;
    
    if (context.qualityPriority === "premium" && baseQuality < 0.85) {
      return baseQuality * 0.7;
    }
    
    return baseQuality;
  }

  private scoreContextFit(model: LLMModel, context: RoutingContext): number {
    let score = 0.5;
    
    if (context.minContextWindow) {
      score = model.contextWindow >= context.minContextWindow ? 1.0 : 
              model.contextWindow >= context.minContextWindow * 0.5 ? 0.6 : 0.3;
    }
    
    if (context.latencyPriority === "high" && model.capabilities.includes("fast")) {
      score += 0.2;
    }
    
    if (context.agentRomaLevel) {
      const romaPrefs = ROMA_MODEL_PREFERENCES[context.agentRomaLevel];
      const hasPreferred = romaPrefs.preferredCapabilities.some(c => 
        model.capabilities.includes(c)
      );
      if (hasPreferred) score += 0.15;
    }
    
    return Math.min(score, 1.0);
  }

  private generateReasoning(model: LLMModel, context: RoutingContext, scores: ModelScore["breakdown"]): string {
    const parts: string[] = [];
    
    if (scores.capabilityMatch > 0.8) {
      parts.push(`Strong capability match for ${context.taskType} tasks`);
    }
    if (scores.costEfficiency > 0.7) {
      parts.push(`Cost-effective at $${model.inputCostPer1M}/$${model.outputCostPer1M} per 1M tokens`);
    }
    if (scores.qualityScore > 0.85) {
      parts.push("Premium quality tier");
    }
    if (model.capabilities.includes("fast")) {
      parts.push("Low-latency optimized");
    }
    
    return parts.join("; ") || "Standard selection";
  }

  private estimateTokens(context: RoutingContext): { input: number; output: number } {
    const tokenEstimates: Record<TaskComplexity, { input: number; output: number }> = {
      simple: { input: 500, output: 300 },
      moderate: { input: 2000, output: 1000 },
      complex: { input: 8000, output: 4000 },
      critical: { input: 20000, output: 10000 }
    };
    
    return tokenEstimates[context.complexity];
  }

  private calculateConfidence(primary: ModelScore, fallbacks: ModelScore[], context: RoutingContext): number {
    let confidence = primary.totalScore;
    
    if (fallbacks.length > 0) {
      const scoreDiff = primary.totalScore - fallbacks[0].totalScore;
      if (scoreDiff > 0.2) confidence += 0.1;
    }
    
    if (primary.breakdown.capabilityMatch > 0.8) confidence += 0.05;
    
    return Math.min(confidence, 1.0);
  }

  private determineStrategy(context: RoutingContext, primary: ModelScore): string {
    if (context.complexity === "critical") {
      return "Premium-first with quality validation";
    }
    if (context.latencyPriority === "high") {
      return "Speed-optimized with fast fallback";
    }
    if (context.maxCostPerMillion && context.maxCostPerMillion < 1) {
      return "Cost-constrained with tier-2 preference";
    }
    if (context.requiresMultimodal || context.requiresVision) {
      return "Multimodal-capable with GLM-4.6V consideration";
    }
    return "Balanced cost-quality optimization";
  }

  getRecommendedModelForAgent(
    agentRomaLevel: ROMALevel,
    agentVertical: Vertical,
    taskType: TaskType
  ): RoutingDecision {
    const complexityMap: Record<ROMALevel, TaskComplexity> = {
      L0: "simple",
      L1: "moderate",
      L2: "moderate",
      L3: "complex",
      L4: "critical"
    };
    
    const verticalPrefs: Record<Vertical, { providers: AIProvider[]; capabilities: string[] }> = {
      social: { providers: ["openai", "anthropic"], capabilities: ["content-creation", "multimodal"] },
      seo: { providers: ["openai", "gemini"], capabilities: ["text", "search", "rag"] },
      web: { providers: ["openai", "anthropic"], capabilities: ["code", "reasoning"] },
      sales: { providers: ["openai", "groq"], capabilities: ["fast", "conversational"] },
      whatsapp: { providers: ["groq", "openai"], capabilities: ["fast", "text", "indian-languages"] },
      linkedin: { providers: ["openai", "anthropic"], capabilities: ["text", "content-creation"] },
      performance: { providers: ["openai", "gemini"], capabilities: ["reasoning", "code", "agents"] }
    };
    
    const prefs = verticalPrefs[agentVertical];
    
    return this.selectOptimalModel({
      taskType,
      complexity: complexityMap[agentRomaLevel],
      preferredProviders: prefs.providers,
      agentRomaLevel,
      agentVertical,
      qualityPriority: agentRomaLevel === "L4" ? "premium" : agentRomaLevel === "L3" ? "high" : "standard"
    });
  }

  getModelByCategory(category: keyof typeof FLAGSHIP_MODELS): LLMModel | null {
    const flagship = FLAGSHIP_MODELS[category];
    if (!flagship) return null;
    
    return this.registry.find(m => m.id === flagship.modelId) || null;
  }

  getCostOptimizedModel(maxCostPerMillion: number, requiredCapabilities: string[]): LLMModel | null {
    const candidates = this.registry
      .filter(m => m.inputCostPer1M <= maxCostPerMillion)
      .filter(m => requiredCapabilities.every(c => m.capabilities.includes(c)))
      .sort((a, b) => {
        const aQuality = this.scoreQuality(a, { taskType: "chat", complexity: "moderate" });
        const bQuality = this.scoreQuality(b, { taskType: "chat", complexity: "moderate" });
        return bQuality - aQuality;
      });
    
    return candidates[0] || null;
  }

  recordUsage(modelId: string, latencyMs: number, success: boolean): void {
    const current = this.usageHistory.get(modelId) || { calls: 0, avgLatency: 0, errorRate: 0 };
    
    current.calls++;
    current.avgLatency = (current.avgLatency * (current.calls - 1) + latencyMs) / current.calls;
    current.errorRate = (current.errorRate * (current.calls - 1) + (success ? 0 : 1)) / current.calls;
    
    this.usageHistory.set(modelId, current);
  }

  getUsageStats(): Record<string, { calls: number; avgLatency: number; errorRate: number }> {
    return Object.fromEntries(this.usageHistory);
  }
}

export const intelligentRouter = new IntelligentModelRouter();
