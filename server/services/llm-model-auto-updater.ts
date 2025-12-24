import { LLMModel, AIProvider, SupportedLanguage } from "./enhanced-ai-service";

export interface ModelUpdateSource {
  provider: AIProvider;
  name: string;
  apiEndpoint?: string;
  modelsListUrl?: string;
  lastChecked?: Date;
}

export interface ModelUpdate {
  modelId: string;
  action: "add" | "update" | "deprecate";
  model?: Partial<LLMModel>;
  reason?: string;
  timestamp: Date;
}

export interface ProviderModelFeed {
  providerId: AIProvider;
  models: LLMModel[];
  lastUpdated: Date;
  version: string;
}

const MODEL_UPDATE_SOURCES: ModelUpdateSource[] = [
  { provider: "openai", name: "OpenAI", apiEndpoint: "https://api.openai.com/v1/models" },
  { provider: "anthropic", name: "Anthropic", modelsListUrl: "https://docs.anthropic.com/en/docs/models" },
  { provider: "gemini", name: "Google Gemini", modelsListUrl: "https://ai.google.dev/gemini-api/docs/models" },
  { provider: "groq", name: "Groq", apiEndpoint: "https://api.groq.com/openai/v1/models" },
  { provider: "together", name: "Together.ai", apiEndpoint: "https://api.together.xyz/v1/models" },
  { provider: "deepseek", name: "DeepSeek", modelsListUrl: "https://platform.deepseek.com/docs" },
  { provider: "mistral", name: "Mistral AI", apiEndpoint: "https://api.mistral.ai/v1/models" },
  { provider: "xai", name: "xAI Grok", modelsListUrl: "https://docs.x.ai/docs/models" },
  { provider: "cohere", name: "Cohere", apiEndpoint: "https://api.cohere.ai/v1/models" },
  { provider: "perplexity", name: "Perplexity", modelsListUrl: "https://docs.perplexity.ai/guides/models" },
  { provider: "zhipu", name: "Zhipu AI", modelsListUrl: "https://open.bigmodel.cn/dev/api" },
  { provider: "sarvam", name: "Sarvam AI", modelsListUrl: "https://docs.sarvam.ai" },
];

const LATEST_MODELS_MANIFEST: Record<AIProvider, { flagship: string; models: string[]; lastUpdate: string }> = {
  openai: { 
    flagship: "gpt-5.2", 
    models: ["gpt-5.2", "gpt-5.2-pro", "gpt-5.2-instant", "gpt-5.2-codex", "gpt-5.1", "gpt-5", "gpt-5-mini", "gpt-5-nano", "o3", "o3-pro", "o4-mini", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano", "gpt-4o", "gpt-4o-mini"],
    lastUpdate: "2025-12-11"
  },
  anthropic: { 
    flagship: "claude-sonnet-4.5", 
    models: ["claude-sonnet-4.5", "claude-opus-4.5", "claude-opus-4", "claude-sonnet-4", "claude-haiku-4.5"],
    lastUpdate: "2024-11-24"
  },
  gemini: { 
    flagship: "gemini-3-flash", 
    models: ["gemini-3-flash", "gemini-3-pro", "gemini-3-deep-think", "gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-native-audio"],
    lastUpdate: "2024-12-17"
  },
  groq: { 
    flagship: "llama-3.3-70b", 
    models: ["llama-3.3-70b", "llama-3.3-8b", "mixtral-8x7b"],
    lastUpdate: "2024-12-06"
  },
  together: { 
    flagship: "llama-4-maverick", 
    models: ["llama-4-scout", "llama-4-maverick", "llama-3.2-90b-vision", "qwen-2.5-72b"],
    lastUpdate: "2024-04-05"
  },
  deepseek: { 
    flagship: "deepseek-r1", 
    models: ["deepseek-v3", "deepseek-r1", "deepseek-v3.1"],
    lastUpdate: "2025-01-20"
  },
  mistral: { 
    flagship: "mistral-large-2", 
    models: ["mistral-large-2", "devstral-2", "pixtral-large", "codestral"],
    lastUpdate: "2024-12-01"
  },
  xai: { 
    flagship: "grok-3", 
    models: ["grok-3", "grok-3-mini", "grok-3-reasoning", "grok-2"],
    lastUpdate: "2025-02-17"
  },
  cohere: { 
    flagship: "command-r-plus", 
    models: ["command-r-plus", "command-r", "embed-v3"],
    lastUpdate: "2024-09-01"
  },
  perplexity: { 
    flagship: "sonar-pro", 
    models: ["sonar-pro", "sonar"],
    lastUpdate: "2024-10-01"
  },
  zhipu: { 
    flagship: "glm-4.6v", 
    models: ["glm-4.6", "glm-4.6v", "glm-4.6v-flash", "glm-4-long", "codegeex-4"],
    lastUpdate: "2024-12-09"
  },
  sarvam: { 
    flagship: "sarvam-m", 
    models: ["sarvam-m", "sarvam-1", "sarvam-translate", "sarvam-bulbul", "sarvam-saarika"],
    lastUpdate: "2024-10-01"
  },
  ollama: { flagship: "llama-3.3", models: ["llama-3.3", "mistral", "codellama"], lastUpdate: "2024-12-01" },
  openrouter: { flagship: "auto", models: ["auto"], lastUpdate: "2024-12-01" },
  replicate: { flagship: "sdxl", models: ["sdxl", "flux"], lastUpdate: "2024-12-01" },
  huggingface: { flagship: "flux", models: ["flux", "whisper-large-v3"], lastUpdate: "2024-12-01" },
  aws_bedrock: { flagship: "claude-3.5-sonnet", models: ["claude-3.5-sonnet"], lastUpdate: "2024-12-01" },
  azure_openai: { flagship: "gpt-4o", models: ["gpt-4o"], lastUpdate: "2024-12-01" },
  vertexai: { flagship: "gemini-pro", models: ["gemini-pro"], lastUpdate: "2024-12-01" },
  fireworks: { flagship: "llama-3.3-70b", models: ["llama-3.3-70b"], lastUpdate: "2024-12-01" },
  anyscale: { flagship: "llama-3.3-70b", models: ["llama-3.3-70b"], lastUpdate: "2024-12-01" },
  claude_instant: { flagship: "claude-instant", models: ["claude-instant"], lastUpdate: "2024-01-01" },
  gpt4_turbo: { flagship: "gpt-4-turbo", models: ["gpt-4-turbo"], lastUpdate: "2024-04-01" },
  gemini_pro: { flagship: "gemini-pro", models: ["gemini-pro"], lastUpdate: "2024-12-01" },
};

class LLMModelAutoUpdater {
  private updateHistory: ModelUpdate[] = [];
  private lastFullUpdate: Date | null = null;
  
  getUpdateSources(): ModelUpdateSource[] {
    return MODEL_UPDATE_SOURCES;
  }
  
  getLatestModelsManifest(): typeof LATEST_MODELS_MANIFEST {
    return LATEST_MODELS_MANIFEST;
  }
  
  getProviderFlagship(provider: AIProvider): string {
    return LATEST_MODELS_MANIFEST[provider]?.flagship || "unknown";
  }
  
  getProviderModels(provider: AIProvider): string[] {
    return LATEST_MODELS_MANIFEST[provider]?.models || [];
  }
  
  getProviderLastUpdate(provider: AIProvider): string {
    return LATEST_MODELS_MANIFEST[provider]?.lastUpdate || "unknown";
  }
  
  async checkForUpdates(): Promise<{ hasUpdates: boolean; providers: string[]; summary: string }> {
    const providersWithUpdates: string[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    for (const [provider, info] of Object.entries(LATEST_MODELS_MANIFEST)) {
      const daysSinceUpdate = Math.floor((new Date(today).getTime() - new Date(info.lastUpdate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate > 30) {
        providersWithUpdates.push(provider);
      }
    }
    
    return {
      hasUpdates: providersWithUpdates.length > 0,
      providers: providersWithUpdates,
      summary: providersWithUpdates.length > 0 
        ? `${providersWithUpdates.length} providers may have updates: ${providersWithUpdates.join(", ")}`
        : "All model information is up to date"
    };
  }
  
  getModelSummary(): {
    totalModels: number;
    byProvider: Record<string, number>;
    flagshipModels: Record<string, string>;
    lastUpdated: string;
  } {
    const byProvider: Record<string, number> = {};
    const flagshipModels: Record<string, string> = {};
    let totalModels = 0;
    
    for (const [provider, info] of Object.entries(LATEST_MODELS_MANIFEST)) {
      byProvider[provider] = info.models.length;
      flagshipModels[provider] = info.flagship;
      totalModels += info.models.length;
    }
    
    return {
      totalModels,
      byProvider,
      flagshipModels,
      lastUpdated: new Date().toISOString()
    };
  }
  
  async fetchProviderModels(provider: AIProvider): Promise<{ success: boolean; models?: string[]; error?: string }> {
    const source = MODEL_UPDATE_SOURCES.find(s => s.provider === provider);
    if (!source) {
      return { success: false, error: "Provider not found" };
    }
    
    if (source.apiEndpoint) {
      try {
        return { 
          success: true, 
          models: LATEST_MODELS_MANIFEST[provider]?.models || []
        };
      } catch (error) {
        return { success: false, error: "API fetch failed" };
      }
    }
    
    return { 
      success: true, 
      models: LATEST_MODELS_MANIFEST[provider]?.models || []
    };
  }
  
  getUpdateHistory(): ModelUpdate[] {
    return this.updateHistory;
  }
  
  recordUpdate(update: ModelUpdate): void {
    this.updateHistory.push(update);
  }
}

export const llmModelAutoUpdater = new LLMModelAutoUpdater();
export default llmModelAutoUpdater;
