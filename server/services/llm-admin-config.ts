import { AIProvider } from "./ai-service";

export type LLMTier = "free" | "budget" | "standard" | "premium";
export type QualityLevel = "draft" | "standard" | "high" | "premium";
export type BrandTier = "starter" | "professional" | "enterprise" | "vip";
export type Environment = "testing" | "development" | "production";
export type Criticality = "low" | "medium" | "high" | "critical";

export interface ModelConfig {
  provider: AIProvider;
  model: string;
  costPer1MTokens: number;
  tier: LLMTier;
  speedRating: number;
  qualityRating: number;
  available: boolean;
  backupModel?: string;
  backupProvider?: AIProvider;
}

export interface BrandLLMConfig {
  brandId: string;
  brandName: string;
  tier: BrandTier;
  enableDualModelWorkflow: boolean;
  qualityLevel: QualityLevel;
  maxCostPerRequest: number;
  preferredProviders: AIProvider[];
  allowPremiumModels: boolean;
  criticality: Criticality;
  customOverrides?: Partial<AdminLLMSettings>;
}

export interface AdminLLMSettings {
  environment: Environment;
  defaultQuality: QualityLevel;
  defaultCriticality: Criticality;
  costOptimizationEnabled: boolean;
  maxGlobalCostPerRequest: number;
  enableDualModelForAllBrands: boolean;
  fallbackChainEnabled: boolean;
  modelPriorityOrder: AIProvider[];
  testingModels: ModelConfig[];
  productionModels: ModelConfig[];
  tierConfigs: Record<BrandTier, TierConfig>;
}

export interface TierConfig {
  allowedProviders: AIProvider[];
  maxModelsPerRequest: number;
  dualModelEnabled: boolean;
  defaultQuality: QualityLevel;
  costMultiplier: number;
  priorityLevel: number;
}

const FREE_TESTING_MODELS: ModelConfig[] = [
  {
    provider: "groq",
    model: "llama-3.1-8b-instant",
    costPer1MTokens: 0.05,
    tier: "free",
    speedRating: 10,
    qualityRating: 6,
    available: true,
    backupModel: "llama-3.3-70b-versatile",
    backupProvider: "groq"
  },
  {
    provider: "together",
    model: "meta-llama/Llama-3.2-3B-Instruct-Turbo",
    costPer1MTokens: 0.06,
    tier: "free",
    speedRating: 9,
    qualityRating: 5,
    available: true,
    backupModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    backupProvider: "together"
  },
  {
    provider: "openrouter",
    model: "meta-llama/llama-3.1-8b-instruct",
    costPer1MTokens: 0.055,
    tier: "free",
    speedRating: 8,
    qualityRating: 6,
    available: true,
    backupModel: "deepseek/deepseek-chat",
    backupProvider: "openrouter"
  }
];

const PRODUCTION_MODELS: ModelConfig[] = [
  {
    provider: "anthropic",
    model: "claude-sonnet-4-5-20250925",
    costPer1MTokens: 3.0,
    tier: "premium",
    speedRating: 7,
    qualityRating: 10,
    available: true,
    backupModel: "claude-3-5-haiku-latest",
    backupProvider: "anthropic"
  },
  {
    provider: "openai",
    model: "gpt-4o",
    costPer1MTokens: 2.5,
    tier: "premium",
    speedRating: 8,
    qualityRating: 9,
    available: true,
    backupModel: "gpt-4o-mini",
    backupProvider: "openai"
  },
  {
    provider: "openrouter",
    model: "deepseek/deepseek-chat",
    costPer1MTokens: 0.14,
    tier: "standard",
    speedRating: 7,
    qualityRating: 8,
    available: true,
    backupModel: "meta-llama/llama-3.1-70b-instruct",
    backupProvider: "openrouter"
  },
  {
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    costPer1MTokens: 0.59,
    tier: "budget",
    speedRating: 10,
    qualityRating: 8,
    available: true,
    backupModel: "llama-3.1-8b-instant",
    backupProvider: "groq"
  },
  {
    provider: "together",
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    costPer1MTokens: 0.88,
    tier: "budget",
    speedRating: 9,
    qualityRating: 8,
    available: true,
    backupModel: "Qwen/Qwen2.5-72B-Instruct-Turbo",
    backupProvider: "together"
  }
];

const DEFAULT_TIER_CONFIGS: Record<BrandTier, TierConfig> = {
  starter: {
    allowedProviders: ["groq", "together", "openrouter"],
    maxModelsPerRequest: 1,
    dualModelEnabled: false,
    defaultQuality: "draft",
    costMultiplier: 0.5,
    priorityLevel: 1
  },
  professional: {
    allowedProviders: ["groq", "together", "openrouter", "openai"],
    maxModelsPerRequest: 2,
    dualModelEnabled: false,
    defaultQuality: "standard",
    costMultiplier: 1.0,
    priorityLevel: 2
  },
  enterprise: {
    allowedProviders: ["groq", "together", "openrouter", "openai", "anthropic"],
    maxModelsPerRequest: 3,
    dualModelEnabled: true,
    defaultQuality: "high",
    costMultiplier: 2.0,
    priorityLevel: 3
  },
  vip: {
    allowedProviders: ["openai", "anthropic", "gemini", "groq", "together", "openrouter"],
    maxModelsPerRequest: 5,
    dualModelEnabled: true,
    defaultQuality: "premium",
    costMultiplier: 5.0,
    priorityLevel: 4
  }
};

class LLMAdminConfigService {
  private settings: AdminLLMSettings;
  private brandConfigs: Map<string, BrandLLMConfig> = new Map();

  constructor() {
    this.settings = this.getDefaultSettings();
  }

  private getDefaultSettings(): AdminLLMSettings {
    const isProduction = process.env.NODE_ENV === "production";
    
    return {
      environment: isProduction ? "production" : "testing",
      defaultQuality: "standard",
      defaultCriticality: "medium",
      costOptimizationEnabled: true,
      maxGlobalCostPerRequest: 0.10,
      enableDualModelForAllBrands: false,
      fallbackChainEnabled: true,
      modelPriorityOrder: ["groq", "together", "openrouter", "openai", "anthropic", "gemini"],
      testingModels: FREE_TESTING_MODELS,
      productionModels: PRODUCTION_MODELS,
      tierConfigs: DEFAULT_TIER_CONFIGS
    };
  }

  getSettings(): AdminLLMSettings {
    return { ...this.settings };
  }

  updateSettings(updates: Partial<AdminLLMSettings>): AdminLLMSettings {
    this.settings = { ...this.settings, ...updates };
    return this.settings;
  }

  setEnvironment(env: Environment): void {
    this.settings.environment = env;
  }

  registerBrand(config: BrandLLMConfig): void {
    this.brandConfigs.set(config.brandId, config);
  }

  getBrandConfig(brandId: string): BrandLLMConfig | undefined {
    return this.brandConfigs.get(brandId);
  }

  updateBrandConfig(brandId: string, updates: Partial<BrandLLMConfig>): BrandLLMConfig | null {
    const existing = this.brandConfigs.get(brandId);
    if (!existing) return null;
    
    const updated = { ...existing, ...updates };
    this.brandConfigs.set(brandId, updated);
    return updated;
  }

  getAllBrandConfigs(): BrandLLMConfig[] {
    return Array.from(this.brandConfigs.values());
  }

  selectModelForTask(params: {
    brandId?: string;
    contentType: "social" | "blog" | "email" | "ad" | "research" | "seo" | "website" | "ui_ux";
    priority: "cost" | "quality" | "speed" | "balanced";
    criticality?: Criticality;
    forceProduction?: boolean;
  }): {
    provider: AIProvider;
    model: string;
    backup?: { provider: AIProvider; model: string };
    dualModelEnabled: boolean;
    estimatedCost: number;
    reason: string;
  } {
    const { brandId, contentType, priority, criticality, forceProduction } = params;
    
    const brandConfig = brandId ? this.brandConfigs.get(brandId) : undefined;
    const tierConfig = brandConfig ? this.settings.tierConfigs[brandConfig.tier] : undefined;
    
    const isTestingMode = this.settings.environment === "testing" && !forceProduction;
    const models = isTestingMode ? this.settings.testingModels : this.settings.productionModels;
    
    const allowedProviders = tierConfig?.allowedProviders || this.settings.modelPriorityOrder;
    const qualityLevel = brandConfig?.qualityLevel || tierConfig?.defaultQuality || this.settings.defaultQuality;
    const taskCriticality = criticality || brandConfig?.criticality || this.settings.defaultCriticality;
    
    const dualModelEnabled = 
      (brandConfig?.enableDualModelWorkflow ?? false) ||
      (tierConfig?.dualModelEnabled ?? false) ||
      (this.settings.enableDualModelForAllBrands && ["website", "ui_ux"].includes(contentType));

    const availableModels = models.filter(m => 
      m.available && 
      allowedProviders.includes(m.provider)
    );

    if (availableModels.length === 0) {
      return {
        provider: "groq",
        model: "llama-3.1-8b-instant",
        dualModelEnabled: false,
        estimatedCost: 0.05,
        reason: "Fallback to default free model - no configured models available"
      };
    }

    let selectedModel: ModelConfig;
    let reason: string;

    if (taskCriticality === "critical" || qualityLevel === "premium") {
      selectedModel = availableModels.reduce((best, m) => 
        m.qualityRating > best.qualityRating ? m : best
      );
      reason = `Critical task/Premium brand: Selected highest quality model (${selectedModel.qualityRating}/10)`;
    } else if (priority === "cost" || this.settings.costOptimizationEnabled) {
      selectedModel = availableModels.reduce((best, m) => 
        m.costPer1MTokens < best.costPer1MTokens ? m : best
      );
      reason = `Cost optimization: Selected cheapest model ($${selectedModel.costPer1MTokens}/1M tokens)`;
    } else if (priority === "speed") {
      selectedModel = availableModels.reduce((best, m) => 
        m.speedRating > best.speedRating ? m : best
      );
      reason = `Speed priority: Selected fastest model (${selectedModel.speedRating}/10 speed)`;
    } else if (priority === "quality") {
      selectedModel = availableModels.reduce((best, m) => 
        m.qualityRating > best.qualityRating ? m : best
      );
      reason = `Quality priority: Selected highest quality model (${selectedModel.qualityRating}/10)`;
    } else {
      const scored = availableModels.map(m => ({
        model: m,
        score: (m.qualityRating * 0.4) + (m.speedRating * 0.3) + ((10 - Math.min(m.costPer1MTokens, 10)) * 0.3)
      }));
      selectedModel = scored.reduce((best, s) => s.score > best.score ? s : best).model;
      reason = `Balanced selection: Quality(40%) + Speed(30%) + Cost(30%)`;
    }

    const backup = selectedModel.backupModel && selectedModel.backupProvider ? {
      provider: selectedModel.backupProvider,
      model: selectedModel.backupModel
    } : undefined;

    return {
      provider: selectedModel.provider,
      model: selectedModel.model,
      backup,
      dualModelEnabled,
      estimatedCost: selectedModel.costPer1MTokens,
      reason: `${reason}. Environment: ${this.settings.environment}. Brand tier: ${brandConfig?.tier || "default"}`
    };
  }

  getTestingTemplate(): { models: ModelConfig[]; description: string } {
    return {
      models: FREE_TESTING_MODELS,
      description: "Free/low-cost models for testing and development. All models under $0.10/1M tokens."
    };
  }

  getProductionTemplate(): { models: ModelConfig[]; description: string } {
    return {
      models: PRODUCTION_MODELS,
      description: "Production-grade models with quality guarantees and backup chains."
    };
  }

  getModelsByTier(tier: LLMTier): ModelConfig[] {
    const allModels = [...this.settings.testingModels, ...this.settings.productionModels];
    return allModels.filter(m => m.tier === tier);
  }

  getConfigSummary(): {
    environment: Environment;
    totalModels: number;
    testingModels: number;
    productionModels: number;
    registeredBrands: number;
    dualModelBrands: number;
    tierDistribution: Record<BrandTier, number>;
  } {
    const brands = this.getAllBrandConfigs();
    const tierDistribution: Record<BrandTier, number> = {
      starter: 0,
      professional: 0,
      enterprise: 0,
      vip: 0
    };
    
    brands.forEach(b => tierDistribution[b.tier]++);

    return {
      environment: this.settings.environment,
      totalModels: this.settings.testingModels.length + this.settings.productionModels.length,
      testingModels: this.settings.testingModels.length,
      productionModels: this.settings.productionModels.length,
      registeredBrands: brands.length,
      dualModelBrands: brands.filter(b => b.enableDualModelWorkflow).length,
      tierDistribution
    };
  }
}

export const llmAdminConfig = new LLMAdminConfigService();

llmAdminConfig.registerBrand({
  brandId: "demo-starter",
  brandName: "Demo Starter Brand",
  tier: "starter",
  enableDualModelWorkflow: false,
  qualityLevel: "draft",
  maxCostPerRequest: 0.05,
  preferredProviders: ["groq", "together"],
  allowPremiumModels: false,
  criticality: "low"
});

llmAdminConfig.registerBrand({
  brandId: "demo-enterprise",
  brandName: "Demo Enterprise Brand",
  tier: "enterprise",
  enableDualModelWorkflow: true,
  qualityLevel: "high",
  maxCostPerRequest: 1.0,
  preferredProviders: ["anthropic", "openai", "groq"],
  allowPremiumModels: true,
  criticality: "high"
});

llmAdminConfig.registerBrand({
  brandId: "demo-vip",
  brandName: "Demo VIP Brand",
  tier: "vip",
  enableDualModelWorkflow: true,
  qualityLevel: "premium",
  maxCostPerRequest: 5.0,
  preferredProviders: ["anthropic", "openai", "gemini"],
  allowPremiumModels: true,
  criticality: "critical"
});
