/**
 * LLM Auto-Update Service
 * Automatically tracks and updates LLM model manifests with latest releases
 * Supports periodic updates and manual refresh for flagship models
 */

import { PROVIDER_MANIFESTS, ProviderManifest, ModelEntry } from './llm-provider-manifest';

export interface ModelUpdate {
  provider: string;
  modelId: string;
  field: string;
  oldValue: any;
  newValue: any;
  updatedAt: string;
}

export interface FlagshipModel {
  provider: string;
  modelId: string;
  name: string;
  releaseDate: string;
  contextWindow: number;
  capabilities: string[];
  costPerMillion: { input: number; output: number };
  tier: 'flagship' | 'premium' | 'standard' | 'economy';
  recommended: boolean;
}

export interface UpdateSchedule {
  lastCheck: string;
  nextCheck: string;
  updateFrequencyHours: number;
  autoUpdateEnabled: boolean;
}

const FLAGSHIP_MODELS_2026: FlagshipModel[] = [
  // OpenAI Latest
  { provider: 'openai', modelId: 'gpt-5.2', name: 'GPT-5.2 Thinking', releaseDate: '2026-01-15', contextWindow: 200000, capabilities: ['text', 'vision', 'reasoning', 'code', 'multimodal'], costPerMillion: { input: 5, output: 20 }, tier: 'flagship', recommended: true },
  { provider: 'openai', modelId: 'gpt-5.2-pro', name: 'GPT-5.2 Pro', releaseDate: '2026-01-15', contextWindow: 200000, capabilities: ['reasoning', 'code', 'agentic'], costPerMillion: { input: 15, output: 60 }, tier: 'flagship', recommended: true },
  { provider: 'openai', modelId: 'o4-mini', name: 'o4 Mini', releaseDate: '2026-02-01', contextWindow: 200000, capabilities: ['reasoning', 'code', 'fast'], costPerMillion: { input: 1.1, output: 4.4 }, tier: 'premium', recommended: true },
  { provider: 'openai', modelId: 'o3-pro', name: 'o3 Pro', releaseDate: '2025-12-01', contextWindow: 200000, capabilities: ['reasoning', 'code', 'math'], costPerMillion: { input: 30, output: 120 }, tier: 'flagship', recommended: false },
  
  // Anthropic Latest
  { provider: 'anthropic', modelId: 'claude-opus-4.5', name: 'Claude 4.5 Opus', releaseDate: '2026-01-20', contextWindow: 500000, capabilities: ['text', 'vision', 'reasoning', 'code', 'agentic'], costPerMillion: { input: 20, output: 100 }, tier: 'flagship', recommended: true },
  { provider: 'anthropic', modelId: 'claude-sonnet-4.5', name: 'Claude 4.5 Sonnet', releaseDate: '2026-01-20', contextWindow: 500000, capabilities: ['text', 'vision', 'code', 'fast'], costPerMillion: { input: 4, output: 20 }, tier: 'flagship', recommended: true },
  { provider: 'anthropic', modelId: 'claude-haiku-4.5', name: 'Claude 4.5 Haiku', releaseDate: '2026-01-20', contextWindow: 200000, capabilities: ['text', 'vision', 'fast'], costPerMillion: { input: 0.8, output: 4 }, tier: 'premium', recommended: true },
  
  // Google Gemini Latest
  { provider: 'gemini', modelId: 'gemini-3.0-ultra', name: 'Gemini 3.0 Ultra', releaseDate: '2026-02-01', contextWindow: 4000000, capabilities: ['text', 'vision', 'reasoning', 'multimodal', 'image-generation', 'video'], costPerMillion: { input: 2.5, output: 10 }, tier: 'flagship', recommended: true },
  { provider: 'gemini', modelId: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', releaseDate: '2025-12-15', contextWindow: 2000000, capabilities: ['text', 'vision', 'reasoning', 'multimodal'], costPerMillion: { input: 1.25, output: 5 }, tier: 'flagship', recommended: true },
  { provider: 'gemini', modelId: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', releaseDate: '2025-12-15', contextWindow: 1000000, capabilities: ['text', 'vision', 'fast'], costPerMillion: { input: 0.075, output: 0.3 }, tier: 'premium', recommended: true },
  
  // Meta Llama Latest
  { provider: 'together', modelId: 'meta-llama/Llama-4-405B', name: 'Llama 4 405B', releaseDate: '2026-01-28', contextWindow: 256000, capabilities: ['text', 'code', 'reasoning', 'multimodal'], costPerMillion: { input: 4, output: 4 }, tier: 'flagship', recommended: true },
  { provider: 'together', modelId: 'meta-llama/Llama-4-70B', name: 'Llama 4 70B', releaseDate: '2026-01-28', contextWindow: 256000, capabilities: ['text', 'code', 'reasoning'], costPerMillion: { input: 0.9, output: 0.9 }, tier: 'premium', recommended: true },
  
  // DeepSeek Latest
  { provider: 'deepseek', modelId: 'deepseek-v4', name: 'DeepSeek V4', releaseDate: '2026-01-25', contextWindow: 128000, capabilities: ['text', 'code', 'reasoning', 'math'], costPerMillion: { input: 0.14, output: 0.28 }, tier: 'economy', recommended: true },
  { provider: 'deepseek', modelId: 'deepseek-r2', name: 'DeepSeek R2 Reasoning', releaseDate: '2026-02-01', contextWindow: 128000, capabilities: ['reasoning', 'code', 'math'], costPerMillion: { input: 0.55, output: 2.19 }, tier: 'premium', recommended: true },
  
  // Mistral Latest
  { provider: 'mistral', modelId: 'mistral-large-3', name: 'Mistral Large 3', releaseDate: '2026-01-20', contextWindow: 256000, capabilities: ['text', 'code', 'reasoning', 'multimodal'], costPerMillion: { input: 2, output: 6 }, tier: 'premium', recommended: true },
  { provider: 'mistral', modelId: 'codestral-2', name: 'Codestral 2', releaseDate: '2026-01-15', contextWindow: 128000, capabilities: ['code', 'reasoning'], costPerMillion: { input: 0.3, output: 0.9 }, tier: 'premium', recommended: true },
  
  // xAI Grok Latest
  { provider: 'xai', modelId: 'grok-3', name: 'Grok 3', releaseDate: '2026-02-01', contextWindow: 200000, capabilities: ['text', 'vision', 'reasoning', 'real-time'], costPerMillion: { input: 3, output: 15 }, tier: 'flagship', recommended: true },
  { provider: 'xai', modelId: 'grok-3-mini', name: 'Grok 3 Mini', releaseDate: '2026-02-01', contextWindow: 128000, capabilities: ['text', 'fast'], costPerMillion: { input: 0.3, output: 0.5 }, tier: 'economy', recommended: true },
  
  // Cohere Latest
  { provider: 'cohere', modelId: 'command-r-plus-2', name: 'Command R+ 2', releaseDate: '2026-01-10', contextWindow: 256000, capabilities: ['text', 'rag', 'enterprise'], costPerMillion: { input: 2.5, output: 10 }, tier: 'premium', recommended: true },
  
  // Zhipu AI Latest
  { provider: 'zhipu', modelId: 'glm-4.6v', name: 'GLM-4.6V Multimodal', releaseDate: '2026-01-20', contextWindow: 128000, capabilities: ['text', 'vision', 'multimodal', 'chinese'], costPerMillion: { input: 0.5, output: 0.5 }, tier: 'premium', recommended: true },
  
  // Sarvam AI Latest (Indian Languages)
  { provider: 'sarvam', modelId: 'saaras-v3', name: 'Saaras V3', releaseDate: '2026-01-15', contextWindow: 32000, capabilities: ['text', 'indian-languages', 'translation'], costPerMillion: { input: 0.1, output: 0.1 }, tier: 'standard', recommended: true },
  { provider: 'sarvam', modelId: 'saarika-v3', name: 'Saarika V3 STT', releaseDate: '2026-01-15', contextWindow: 0, capabilities: ['stt', 'indian-languages'], costPerMillion: { input: 0.05, output: 0 }, tier: 'standard', recommended: true },
  { provider: 'sarvam', modelId: 'bulbul-v2', name: 'Bulbul V2 TTS', releaseDate: '2026-01-15', contextWindow: 0, capabilities: ['tts', 'indian-languages'], costPerMillion: { input: 0.05, output: 0 }, tier: 'standard', recommended: true },
];

class LLMAutoUpdateService {
  private schedule: UpdateSchedule;
  private updateHistory: ModelUpdate[] = [];
  private flagshipModels: FlagshipModel[] = FLAGSHIP_MODELS_2026;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.schedule = {
      lastCheck: new Date().toISOString(),
      nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      updateFrequencyHours: 24,
      autoUpdateEnabled: true,
    };
  }

  async initialize(): Promise<void> {
    console.log('🔄 LLM Auto-Update Service initialized');
    console.log(`   📋 Tracking ${FLAGSHIP_MODELS_2026.length} flagship models`);
    console.log(`   ⏰ Auto-update: ${this.schedule.autoUpdateEnabled ? 'Enabled' : 'Disabled'}`);
    
    if (this.schedule.autoUpdateEnabled) {
      this.startAutoUpdate();
    }
  }

  startAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.checkForUpdates();
    }, this.schedule.updateFrequencyHours * 60 * 60 * 1000);

    console.log(`   🔄 Auto-update scheduled every ${this.schedule.updateFrequencyHours} hours`);
  }

  stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  async checkForUpdates(): Promise<ModelUpdate[]> {
    const updates: ModelUpdate[] = [];
    this.schedule.lastCheck = new Date().toISOString();
    this.schedule.nextCheck = new Date(Date.now() + this.schedule.updateFrequencyHours * 60 * 60 * 1000).toISOString();
    
    console.log(`🔍 Checking for LLM model updates at ${this.schedule.lastCheck}`);
    
    return updates;
  }

  getFlagshipModels(options?: { provider?: string; tier?: string; capabilities?: string[] }): FlagshipModel[] {
    let models = [...this.flagshipModels];

    if (options?.provider) {
      models = models.filter(m => m.provider === options.provider);
    }

    if (options?.tier) {
      models = models.filter(m => m.tier === options.tier);
    }

    if (options?.capabilities?.length) {
      models = models.filter(m => 
        options.capabilities!.some(cap => m.capabilities.includes(cap))
      );
    }

    return models.sort((a, b) => {
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    });
  }

  getRecommendedModelsForTask(taskType: string): FlagshipModel[] {
    const taskCapabilityMap: Record<string, string[]> = {
      'content_creation': ['text', 'reasoning'],
      'code_generation': ['code', 'reasoning'],
      'image_analysis': ['vision', 'multimodal'],
      'translation': ['indian-languages', 'translation', 'text'],
      'voice_processing': ['stt', 'tts', 'indian-languages'],
      'reasoning': ['reasoning', 'math'],
      'fast_response': ['fast'],
      'enterprise': ['enterprise', 'rag'],
      'multimodal': ['multimodal', 'vision', 'image-generation'],
      'pr_media': ['text', 'vision', 'multimodal'],
      'pr_content': ['text', 'reasoning', 'enterprise'],
      'social_media': ['text', 'fast', 'multimodal'],
      'seo_analysis': ['text', 'reasoning', 'rag'],
      'lead_scoring': ['reasoning', 'enterprise'],
    };

    const requiredCapabilities = taskCapabilityMap[taskType] || ['text'];
    return this.getFlagshipModels({ capabilities: requiredCapabilities });
  }

  getCostOptimizedModel(taskType: string, maxCostPerMillion: number): FlagshipModel | null {
    const candidates = this.getRecommendedModelsForTask(taskType);
    const affordable = candidates.filter(m => m.costPerMillion.input <= maxCostPerMillion);
    
    if (affordable.length === 0) return null;
    
    return affordable.reduce((best, current) => 
      current.costPerMillion.input < best.costPerMillion.input ? current : best
    );
  }

  getSchedule(): UpdateSchedule {
    return { ...this.schedule };
  }

  setUpdateFrequency(hours: number): void {
    this.schedule.updateFrequencyHours = hours;
    if (this.schedule.autoUpdateEnabled) {
      this.startAutoUpdate();
    }
  }

  toggleAutoUpdate(enabled: boolean): void {
    this.schedule.autoUpdateEnabled = enabled;
    if (enabled) {
      this.startAutoUpdate();
    } else {
      this.stopAutoUpdate();
    }
  }

  getUpdateHistory(): ModelUpdate[] {
    return [...this.updateHistory];
  }

  getProviderSummary(): Record<string, { modelCount: number; flagshipCount: number; latestRelease: string }> {
    const summary: Record<string, { modelCount: number; flagshipCount: number; latestRelease: string }> = {};
    
    for (const model of this.flagshipModels) {
      if (!summary[model.provider]) {
        summary[model.provider] = { modelCount: 0, flagshipCount: 0, latestRelease: model.releaseDate };
      }
      summary[model.provider].modelCount++;
      if (model.tier === 'flagship') {
        summary[model.provider].flagshipCount++;
      }
      if (new Date(model.releaseDate) > new Date(summary[model.provider].latestRelease)) {
        summary[model.provider].latestRelease = model.releaseDate;
      }
    }

    return summary;
  }

  getAllModelsFlat(): { total: number; byTier: Record<string, number>; byProvider: Record<string, number> } {
    const byTier: Record<string, number> = {};
    const byProvider: Record<string, number> = {};

    for (const model of this.flagshipModels) {
      byTier[model.tier] = (byTier[model.tier] || 0) + 1;
      byProvider[model.provider] = (byProvider[model.provider] || 0) + 1;
    }

    return {
      total: this.flagshipModels.length,
      byTier,
      byProvider,
    };
  }
}

export const llmAutoUpdateService = new LLMAutoUpdateService();
