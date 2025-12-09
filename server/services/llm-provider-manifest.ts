export type AIProvider = 
  | "openai" | "anthropic" | "gemini" | "groq" | "cohere" 
  | "sarvam" | "deepseek" | "mistral" | "perplexity" | "together"
  | "openrouter" | "xai" | "replicate" | "fireworks" | "anyscale"
  | "huggingface" | "aws_bedrock" | "azure_openai" | "vertexai"
  | "ollama" | "sambanova" | "cerebras" | "ai21";

export type ModelTier = "tier1" | "tier2" | "tier3" | "tier4";
export type ModelCapability = "text" | "vision" | "code" | "reasoning" | "multimodal" | "voice" | "embedding" | "image-generation" | "search" | "rag" | "indian-languages" | "fast" | "tts" | "stt" | "translation";

export interface ProviderManifest {
  id: AIProvider;
  name: string;
  tier: ModelTier;
  modelCount: number;
  baseUrl?: string;
  requiresApiKey: boolean;
  keyEnvVar?: string;
  capabilities: ModelCapability[];
  bestFor: string[];
  models: ModelEntry[];
}

export interface ModelEntry {
  id: string;
  name: string;
  contextWindow: number;
  maxOutput: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  capabilities: ModelCapability[];
  isDefault?: boolean;
  isActive: boolean;
}

export const PROVIDER_MANIFESTS: ProviderManifest[] = [
  {
    id: "openai",
    name: "OpenAI",
    tier: "tier1",
    modelCount: 45,
    baseUrl: "https://api.openai.com/v1",
    requiresApiKey: true,
    keyEnvVar: "OPENAI_API_KEY",
    capabilities: ["text", "vision", "code", "reasoning", "multimodal", "embedding", "voice"],
    bestFor: ["Premium content", "Complex reasoning", "Code generation", "Multimodal tasks"],
    models: [
      { id: "gpt-5", name: "GPT-5", contextWindow: 128000, maxOutput: 32768, inputCostPer1M: 5, outputCostPer1M: 15, capabilities: ["text", "vision", "reasoning", "code"], isDefault: true, isActive: true },
      { id: "gpt-4o", name: "GPT-4o", contextWindow: 128000, maxOutput: 16384, inputCostPer1M: 2.5, outputCostPer1M: 10, capabilities: ["text", "vision", "multimodal"], isActive: true },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", contextWindow: 128000, maxOutput: 16384, inputCostPer1M: 0.15, outputCostPer1M: 0.6, capabilities: ["text", "vision", "fast"], isActive: true },
      { id: "o3", name: "o3 Reasoning", contextWindow: 200000, maxOutput: 100000, inputCostPer1M: 15, outputCostPer1M: 60, capabilities: ["reasoning", "code"], isActive: true },
      { id: "o3-mini", name: "o3 Mini", contextWindow: 200000, maxOutput: 100000, inputCostPer1M: 1.1, outputCostPer1M: 4.4, capabilities: ["reasoning", "code"], isActive: true },
      { id: "o1", name: "o1 Reasoning", contextWindow: 200000, maxOutput: 100000, inputCostPer1M: 15, outputCostPer1M: 60, capabilities: ["reasoning"], isActive: true },
      { id: "o1-mini", name: "o1 Mini", contextWindow: 128000, maxOutput: 65536, inputCostPer1M: 3, outputCostPer1M: 12, capabilities: ["reasoning"], isActive: true },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", contextWindow: 128000, maxOutput: 4096, inputCostPer1M: 10, outputCostPer1M: 30, capabilities: ["text", "vision"], isActive: true },
      { id: "gpt-4", name: "GPT-4", contextWindow: 8192, maxOutput: 4096, inputCostPer1M: 30, outputCostPer1M: 60, capabilities: ["text"], isActive: true },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", contextWindow: 16385, maxOutput: 4096, inputCostPer1M: 0.5, outputCostPer1M: 1.5, capabilities: ["text", "fast"], isActive: true },
      { id: "text-embedding-3-large", name: "Embedding 3 Large", contextWindow: 8191, maxOutput: 3072, inputCostPer1M: 0.13, outputCostPer1M: 0, capabilities: ["embedding"], isActive: true },
      { id: "text-embedding-3-small", name: "Embedding 3 Small", contextWindow: 8191, maxOutput: 1536, inputCostPer1M: 0.02, outputCostPer1M: 0, capabilities: ["embedding"], isActive: true },
      { id: "whisper-1", name: "Whisper", contextWindow: 0, maxOutput: 0, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ["stt", "voice"], isActive: true },
      { id: "tts-1", name: "TTS-1", contextWindow: 4096, maxOutput: 0, inputCostPer1M: 15, outputCostPer1M: 0, capabilities: ["tts", "voice"], isActive: true },
      { id: "tts-1-hd", name: "TTS-1 HD", contextWindow: 4096, maxOutput: 0, inputCostPer1M: 30, outputCostPer1M: 0, capabilities: ["tts", "voice"], isActive: true },
      { id: "dall-e-3", name: "DALL-E 3", contextWindow: 0, maxOutput: 0, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ["image-generation"], isActive: true },
    ]
  },
  {
    id: "anthropic",
    name: "Anthropic",
    tier: "tier1",
    modelCount: 12,
    baseUrl: "https://api.anthropic.com/v1",
    requiresApiKey: true,
    keyEnvVar: "ANTHROPIC_API_KEY",
    capabilities: ["text", "vision", "code", "reasoning"],
    bestFor: ["Long-form content", "Analysis", "Code generation", "Safety-focused"],
    models: [
      { id: "claude-sonnet-4-20250514", name: "Claude 4 Sonnet", contextWindow: 200000, maxOutput: 8192, inputCostPer1M: 3, outputCostPer1M: 15, capabilities: ["text", "vision", "code", "reasoning"], isDefault: true, isActive: true },
      { id: "claude-opus-4-20250514", name: "Claude 4 Opus", contextWindow: 200000, maxOutput: 8192, inputCostPer1M: 15, outputCostPer1M: 75, capabilities: ["text", "vision", "reasoning", "code"], isActive: true },
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", contextWindow: 200000, maxOutput: 8192, inputCostPer1M: 3, outputCostPer1M: 15, capabilities: ["text", "vision", "code"], isActive: true },
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus", contextWindow: 200000, maxOutput: 4096, inputCostPer1M: 15, outputCostPer1M: 75, capabilities: ["text", "vision", "reasoning"], isActive: true },
      { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", contextWindow: 200000, maxOutput: 4096, inputCostPer1M: 0.25, outputCostPer1M: 1.25, capabilities: ["text", "fast"], isActive: true },
    ]
  },
  {
    id: "gemini",
    name: "Google Gemini",
    tier: "tier1",
    modelCount: 18,
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    requiresApiKey: true,
    keyEnvVar: "GEMINI_API_KEY",
    capabilities: ["text", "vision", "multimodal", "code", "image-generation"],
    bestFor: ["Multimodal tasks", "Image generation", "Long context", "Cost-effective premium"],
    models: [
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", contextWindow: 1000000, maxOutput: 8192, inputCostPer1M: 0.075, outputCostPer1M: 0.3, capabilities: ["text", "vision", "multimodal", "fast"], isDefault: true, isActive: true },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", contextWindow: 2000000, maxOutput: 8192, inputCostPer1M: 1.25, outputCostPer1M: 5, capabilities: ["text", "vision", "reasoning"], isActive: true },
      { id: "gemini-3-pro-image", name: "Nano Banana Pro", contextWindow: 1000000, maxOutput: 8192, inputCostPer1M: 1.25, outputCostPer1M: 5, capabilities: ["text", "vision", "image-generation"], isActive: true },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", contextWindow: 1000000, maxOutput: 8192, inputCostPer1M: 0.075, outputCostPer1M: 0.3, capabilities: ["text", "vision", "multimodal"], isActive: true },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", contextWindow: 2000000, maxOutput: 8192, inputCostPer1M: 1.25, outputCostPer1M: 5, capabilities: ["text", "vision"], isActive: true },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", contextWindow: 1000000, maxOutput: 8192, inputCostPer1M: 0.075, outputCostPer1M: 0.3, capabilities: ["text", "fast"], isActive: true },
    ]
  },
  {
    id: "groq",
    name: "Groq",
    tier: "tier2",
    modelCount: 15,
    baseUrl: "https://api.groq.com/openai/v1",
    requiresApiKey: true,
    keyEnvVar: "GROQ_API_KEY",
    capabilities: ["text", "code", "fast"],
    bestFor: ["Real-time responses", "Sub-second latency", "High throughput"],
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 0.59, outputCostPer1M: 0.79, capabilities: ["text", "code", "fast"], isDefault: true, isActive: true },
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 0.05, outputCostPer1M: 0.08, capabilities: ["text", "fast"], isActive: true },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", contextWindow: 32768, maxOutput: 8192, inputCostPer1M: 0.24, outputCostPer1M: 0.24, capabilities: ["text", "code", "fast"], isActive: true },
      { id: "llama-guard-3-8b", name: "Llama Guard 3 8B", contextWindow: 8192, maxOutput: 8192, inputCostPer1M: 0.2, outputCostPer1M: 0.2, capabilities: ["text"], isActive: true },
      { id: "gemma2-9b-it", name: "Gemma 2 9B", contextWindow: 8192, maxOutput: 8192, inputCostPer1M: 0.2, outputCostPer1M: 0.2, capabilities: ["text", "fast"], isActive: true },
    ]
  },
  {
    id: "together",
    name: "Together AI",
    tier: "tier2",
    modelCount: 85,
    baseUrl: "https://api.together.xyz/v1",
    requiresApiKey: true,
    keyEnvVar: "TOGETHER_API_KEY",
    capabilities: ["text", "vision", "code", "multimodal", "embedding"],
    bestFor: ["Cost-effective speed", "Open source models", "Vision tasks", "LOW COST"],
    models: [
      // ULTRA LOW COST - Best value models
      { id: "meta-llama/Llama-3.2-3B-Instruct-Turbo", name: "Llama 3.2 3B Turbo", contextWindow: 131072, maxOutput: 8192, inputCostPer1M: 0.06, outputCostPer1M: 0.06, capabilities: ["text", "fast"], isDefault: true, isActive: true },
      { id: "meta-llama/Llama-3.1-8B-Instruct-Turbo", name: "Llama 3.1 8B Turbo", contextWindow: 131072, maxOutput: 8192, inputCostPer1M: 0.18, outputCostPer1M: 0.18, capabilities: ["text", "code", "fast"], isActive: true },
      { id: "Qwen/Qwen2.5-7B-Instruct-Turbo", name: "Qwen 2.5 7B Turbo", contextWindow: 32768, maxOutput: 8192, inputCostPer1M: 0.2, outputCostPer1M: 0.2, capabilities: ["text", "code"], isActive: true },
      { id: "mistralai/Mistral-7B-Instruct-v0.3", name: "Mistral 7B v0.3", contextWindow: 32768, maxOutput: 4096, inputCostPer1M: 0.2, outputCostPer1M: 0.2, capabilities: ["text", "fast"], isActive: true },
      // MID-TIER VALUE - Quality at low cost
      { id: "meta-llama/Llama-3.3-70B-Instruct-Turbo", name: "Llama 3.3 70B Turbo", contextWindow: 131072, maxOutput: 8192, inputCostPer1M: 0.88, outputCostPer1M: 0.88, capabilities: ["text", "code", "reasoning"], isActive: true },
      { id: "Qwen/Qwen2.5-72B-Instruct-Turbo", name: "Qwen 2.5 72B", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 0.9, outputCostPer1M: 0.9, capabilities: ["text", "code", "reasoning"], isActive: true },
      { id: "deepseek-ai/DeepSeek-V3", name: "DeepSeek V3", contextWindow: 64000, maxOutput: 8192, inputCostPer1M: 0.27, outputCostPer1M: 1.1, capabilities: ["text", "code", "reasoning"], isActive: true },
      { id: "mistralai/Mixtral-8x7B-Instruct-v0.1", name: "Mixtral 8x7B", contextWindow: 32768, maxOutput: 4096, inputCostPer1M: 0.6, outputCostPer1M: 0.6, capabilities: ["text", "code"], isActive: true },
      // VISION MODELS
      { id: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo", name: "Llama 3.2 90B Vision", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 1.2, outputCostPer1M: 1.2, capabilities: ["text", "vision", "multimodal"], isActive: true },
      { id: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo", name: "Llama 3.2 11B Vision", contextWindow: 131072, maxOutput: 8192, inputCostPer1M: 0.35, outputCostPer1M: 0.35, capabilities: ["text", "vision", "multimodal"], isActive: true },
      // PREMIUM
      { id: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo", name: "Llama 3.1 405B", contextWindow: 128000, maxOutput: 4096, inputCostPer1M: 3.5, outputCostPer1M: 3.5, capabilities: ["text", "reasoning"], isActive: true },
    ]
  },
  {
    id: "fireworks",
    name: "Fireworks AI",
    tier: "tier2",
    modelCount: 42,
    baseUrl: "https://api.fireworks.ai/inference/v1",
    requiresApiKey: true,
    keyEnvVar: "FIREWORKS_API_KEY",
    capabilities: ["text", "code", "fast"],
    bestFor: ["Function calling", "Fast inference", "JSON mode"],
    models: [
      { id: "accounts/fireworks/models/llama-v3p1-70b-instruct", name: "Llama 3.1 70B", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 0.9, outputCostPer1M: 0.9, capabilities: ["text", "code", "fast"], isDefault: true, isActive: true },
      { id: "accounts/fireworks/models/firefunction-v2", name: "FireFunction V2", contextWindow: 8192, maxOutput: 4096, inputCostPer1M: 0.9, outputCostPer1M: 0.9, capabilities: ["text", "code"], isActive: true },
      { id: "accounts/fireworks/models/mixtral-8x22b-instruct", name: "Mixtral 8x22B", contextWindow: 65536, maxOutput: 8192, inputCostPer1M: 0.9, outputCostPer1M: 0.9, capabilities: ["text", "code"], isActive: true },
    ]
  },
  {
    id: "sarvam",
    name: "Sarvam AI",
    tier: "tier3",
    modelCount: 8,
    baseUrl: "https://api.sarvam.ai",
    requiresApiKey: true,
    keyEnvVar: "SARVAM_API_KEY",
    capabilities: ["text", "indian-languages", "voice", "tts", "stt", "translation"],
    bestFor: ["12 Indian languages", "Voice agents", "Translation", "Localization"],
    models: [
      { id: "sarvam-m", name: "Sarvam M (24B)", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ["text", "indian-languages", "reasoning"], isDefault: true, isActive: true },
      { id: "sarvam-1", name: "Sarvam 1 (2B)", contextWindow: 32768, maxOutput: 4096, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ["text", "indian-languages"], isActive: true },
      { id: "sarvam-translate", name: "Sarvam Translate", contextWindow: 8192, maxOutput: 8192, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ["translation", "indian-languages"], isActive: true },
      { id: "sarvam-bulbul-v1", name: "Sarvam Bulbul v1 (TTS)", contextWindow: 4096, maxOutput: 0, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ["tts", "voice", "indian-languages"], isActive: true },
      { id: "sarvam-saarika-v2", name: "Sarvam Saarika v2 (STT)", contextWindow: 0, maxOutput: 4096, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ["stt", "voice", "indian-languages"], isActive: true },
    ]
  },
  {
    id: "cohere",
    name: "Cohere",
    tier: "tier3",
    modelCount: 12,
    baseUrl: "https://api.cohere.ai/v1",
    requiresApiKey: true,
    keyEnvVar: "COHERE_API_KEY",
    capabilities: ["text", "rag", "embedding"],
    bestFor: ["Enterprise RAG", "Semantic search", "Embeddings"],
    models: [
      { id: "command-r-plus", name: "Command R+", contextWindow: 128000, maxOutput: 4096, inputCostPer1M: 3, outputCostPer1M: 15, capabilities: ["text", "rag"], isDefault: true, isActive: true },
      { id: "command-r", name: "Command R", contextWindow: 128000, maxOutput: 4096, inputCostPer1M: 0.5, outputCostPer1M: 1.5, capabilities: ["text", "rag"], isActive: true },
      { id: "command-light", name: "Command Light", contextWindow: 4096, maxOutput: 4096, inputCostPer1M: 0.3, outputCostPer1M: 0.6, capabilities: ["text", "fast"], isActive: true },
      { id: "embed-english-v3.0", name: "Embed English V3", contextWindow: 512, maxOutput: 1024, inputCostPer1M: 0.1, outputCostPer1M: 0, capabilities: ["embedding", "rag"], isActive: true },
      { id: "embed-multilingual-v3.0", name: "Embed Multilingual V3", contextWindow: 512, maxOutput: 1024, inputCostPer1M: 0.1, outputCostPer1M: 0, capabilities: ["embedding", "rag"], isActive: true },
      { id: "rerank-english-v3.0", name: "Rerank English V3", contextWindow: 4096, maxOutput: 0, inputCostPer1M: 2, outputCostPer1M: 0, capabilities: ["rag"], isActive: true },
    ]
  },
  {
    id: "perplexity",
    name: "Perplexity",
    tier: "tier3",
    modelCount: 6,
    baseUrl: "https://api.perplexity.ai",
    requiresApiKey: true,
    keyEnvVar: "PERPLEXITY_API_KEY",
    capabilities: ["text", "search"],
    bestFor: ["Real-time search", "Current events", "Research"],
    models: [
      { id: "sonar-pro", name: "Sonar Pro", contextWindow: 200000, maxOutput: 8192, inputCostPer1M: 3, outputCostPer1M: 15, capabilities: ["text", "search"], isDefault: true, isActive: true },
      { id: "sonar", name: "Sonar", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 1, outputCostPer1M: 1, capabilities: ["text", "search"], isActive: true },
      { id: "sonar-reasoning", name: "Sonar Reasoning", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 1, outputCostPer1M: 5, capabilities: ["text", "search", "reasoning"], isActive: true },
    ]
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    tier: "tier3",
    modelCount: 8,
    baseUrl: "https://api.deepseek.com/v1",
    requiresApiKey: true,
    keyEnvVar: "DEEPSEEK_API_KEY",
    capabilities: ["text", "code", "reasoning"],
    bestFor: ["Cost-effective reasoning", "Code generation", "Long context"],
    models: [
      { id: "deepseek-v3", name: "DeepSeek V3", contextWindow: 64000, maxOutput: 8192, inputCostPer1M: 0.27, outputCostPer1M: 1.1, capabilities: ["text", "code", "reasoning"], isDefault: true, isActive: true },
      { id: "deepseek-r1", name: "DeepSeek R1", contextWindow: 64000, maxOutput: 8192, inputCostPer1M: 0.55, outputCostPer1M: 2.19, capabilities: ["text", "code", "reasoning"], isActive: true },
      { id: "deepseek-coder-v2", name: "DeepSeek Coder V2", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 0.14, outputCostPer1M: 0.28, capabilities: ["code"], isActive: true },
    ]
  },
  {
    id: "mistral",
    name: "Mistral AI",
    tier: "tier3",
    modelCount: 15,
    baseUrl: "https://api.mistral.ai/v1",
    requiresApiKey: true,
    keyEnvVar: "MISTRAL_API_KEY",
    capabilities: ["text", "code"],
    bestFor: ["European AI", "Code generation", "Function calling"],
    models: [
      { id: "mistral-large-latest", name: "Mistral Large", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 2, outputCostPer1M: 6, capabilities: ["text", "code"], isDefault: true, isActive: true },
      { id: "mistral-medium-latest", name: "Mistral Medium", contextWindow: 32000, maxOutput: 8192, inputCostPer1M: 2.7, outputCostPer1M: 8.1, capabilities: ["text", "code"], isActive: true },
      { id: "mistral-small-latest", name: "Mistral Small", contextWindow: 32000, maxOutput: 8192, inputCostPer1M: 0.2, outputCostPer1M: 0.6, capabilities: ["text", "fast"], isActive: true },
      { id: "codestral-latest", name: "Codestral", contextWindow: 32000, maxOutput: 8192, inputCostPer1M: 1, outputCostPer1M: 3, capabilities: ["code"], isActive: true },
      { id: "ministral-8b-latest", name: "Ministral 8B", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 0.1, outputCostPer1M: 0.1, capabilities: ["text", "fast"], isActive: true },
    ]
  },
  {
    id: "xai",
    name: "xAI",
    tier: "tier3",
    modelCount: 4,
    baseUrl: "https://api.x.ai/v1",
    requiresApiKey: true,
    keyEnvVar: "XAI_API_KEY",
    capabilities: ["text"],
    bestFor: ["Real-time data", "Humor", "Uncensored responses"],
    models: [
      { id: "grok-2", name: "Grok-2", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 2, outputCostPer1M: 10, capabilities: ["text"], isDefault: true, isActive: true },
      { id: "grok-2-mini", name: "Grok-2 Mini", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 0.3, outputCostPer1M: 0.5, capabilities: ["text", "fast"], isActive: true },
    ]
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    tier: "tier4",
    modelCount: 343,
    baseUrl: "https://openrouter.ai/api/v1",
    requiresApiKey: true,
    keyEnvVar: "OPENROUTER_API_KEY",
    capabilities: ["text", "vision", "code", "reasoning", "multimodal"],
    bestFor: ["Model diversity", "Fallback routing", "Cost optimization", "FREE models"],
    models: [
      // LOW COST MODELS - Verified working, best value (confirmed via API)
      { id: "meta-llama/llama-3.1-8b-instruct", name: "Llama 3.1 8B", contextWindow: 131072, maxOutput: 8192, inputCostPer1M: 0.055, outputCostPer1M: 0.055, capabilities: ["text", "code", "fast"], isDefault: true, isActive: true },
      { id: "qwen/qwen-2.5-7b-instruct", name: "Qwen 2.5 7B", contextWindow: 32768, maxOutput: 8192, inputCostPer1M: 0.055, outputCostPer1M: 0.055, capabilities: ["text", "code"], isActive: true },
      { id: "deepseek/deepseek-chat", name: "DeepSeek V3", contextWindow: 64000, maxOutput: 8192, inputCostPer1M: 0.14, outputCostPer1M: 0.28, capabilities: ["text", "code", "reasoning"], isActive: true },
      { id: "mistralai/mistral-7b-instruct", name: "Mistral 7B", contextWindow: 32768, maxOutput: 4096, inputCostPer1M: 0.06, outputCostPer1M: 0.06, capabilities: ["text", "fast"], isActive: true },
      // MID-TIER - Quality at reasonable cost
      { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", contextWindow: 131072, maxOutput: 8192, inputCostPer1M: 0.12, outputCostPer1M: 0.3, capabilities: ["text", "code", "reasoning"], isActive: true },
      { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B", contextWindow: 131072, maxOutput: 8192, inputCostPer1M: 0.35, outputCostPer1M: 0.4, capabilities: ["text", "code", "reasoning"], isActive: true },
      { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash", contextWindow: 1000000, maxOutput: 8192, inputCostPer1M: 0.1, outputCostPer1M: 0.4, capabilities: ["text", "vision", "multimodal"], isActive: true },
      // PREMIUM MODELS - via OpenRouter for fallback
      { id: "openai/gpt-4o", name: "GPT-4o via OpenRouter", contextWindow: 128000, maxOutput: 16384, inputCostPer1M: 2.5, outputCostPer1M: 10, capabilities: ["text", "vision"], isActive: true },
      { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet via OpenRouter", contextWindow: 200000, maxOutput: 8192, inputCostPer1M: 3, outputCostPer1M: 15, capabilities: ["text", "vision", "code"], isActive: true },
      { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku via OpenRouter", contextWindow: 200000, maxOutput: 4096, inputCostPer1M: 0.25, outputCostPer1M: 1.25, capabilities: ["text", "fast"], isActive: true },
    ]
  },
  {
    id: "replicate",
    name: "Replicate",
    tier: "tier4",
    modelCount: 100,
    baseUrl: "https://api.replicate.com/v1",
    requiresApiKey: true,
    keyEnvVar: "REPLICATE_API_KEY",
    capabilities: ["text", "image-generation", "multimodal"],
    bestFor: ["Open source models", "Image generation", "Custom models"],
    models: [
      { id: "meta/llama-2-70b-chat", name: "Llama 2 70B", contextWindow: 4096, maxOutput: 4096, inputCostPer1M: 0.65, outputCostPer1M: 2.75, capabilities: ["text"], isDefault: true, isActive: true },
      { id: "stability-ai/sdxl", name: "SDXL", contextWindow: 0, maxOutput: 0, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ["image-generation"], isActive: true },
      { id: "black-forest-labs/flux-1.1-pro", name: "FLUX 1.1 Pro", contextWindow: 0, maxOutput: 0, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ["image-generation"], isActive: true },
    ]
  },
  {
    id: "huggingface",
    name: "HuggingFace",
    tier: "tier4",
    modelCount: 50,
    baseUrl: "https://api-inference.huggingface.co",
    requiresApiKey: true,
    keyEnvVar: "HUGGINGFACE_API_KEY",
    capabilities: ["text", "embedding"],
    bestFor: ["Research models", "Fine-tuned models", "Specialized tasks"],
    models: [
      { id: "meta-llama/Meta-Llama-3-70B-Instruct", name: "Llama 3 70B", contextWindow: 8192, maxOutput: 4096, inputCostPer1M: 0.9, outputCostPer1M: 0.9, capabilities: ["text"], isDefault: true, isActive: true },
      { id: "mistralai/Mixtral-8x7B-Instruct-v0.1", name: "Mixtral 8x7B", contextWindow: 32768, maxOutput: 4096, inputCostPer1M: 0.5, outputCostPer1M: 0.5, capabilities: ["text"], isActive: true },
    ]
  },
  {
    id: "aws_bedrock",
    name: "AWS Bedrock",
    tier: "tier3",
    modelCount: 25,
    baseUrl: "https://bedrock-runtime.amazonaws.com",
    requiresApiKey: true,
    keyEnvVar: "AWS_ACCESS_KEY_ID",
    capabilities: ["text", "vision", "embedding"],
    bestFor: ["Enterprise", "AWS integration", "Compliance"],
    models: [
      { id: "anthropic.claude-3-5-sonnet-20241022-v2:0", name: "Claude 3.5 Sonnet Bedrock", contextWindow: 200000, maxOutput: 8192, inputCostPer1M: 3, outputCostPer1M: 15, capabilities: ["text", "vision"], isDefault: true, isActive: true },
      { id: "amazon.titan-text-premier-v1:0", name: "Titan Text Premier", contextWindow: 32000, maxOutput: 8192, inputCostPer1M: 0.5, outputCostPer1M: 1.5, capabilities: ["text"], isActive: true },
    ]
  },
  {
    id: "azure_openai",
    name: "Azure OpenAI",
    tier: "tier1",
    modelCount: 20,
    baseUrl: "https://{resource}.openai.azure.com",
    requiresApiKey: true,
    keyEnvVar: "AZURE_OPENAI_API_KEY",
    capabilities: ["text", "vision", "code", "embedding"],
    bestFor: ["Enterprise", "Compliance", "Data residency"],
    models: [
      { id: "gpt-4o", name: "GPT-4o Azure", contextWindow: 128000, maxOutput: 16384, inputCostPer1M: 2.5, outputCostPer1M: 10, capabilities: ["text", "vision"], isDefault: true, isActive: true },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo Azure", contextWindow: 128000, maxOutput: 4096, inputCostPer1M: 10, outputCostPer1M: 30, capabilities: ["text", "vision"], isActive: true },
    ]
  },
  {
    id: "vertexai",
    name: "Google Vertex AI",
    tier: "tier1",
    modelCount: 15,
    baseUrl: "https://us-central1-aiplatform.googleapis.com",
    requiresApiKey: true,
    keyEnvVar: "GOOGLE_APPLICATION_CREDENTIALS",
    capabilities: ["text", "vision", "embedding", "multimodal"],
    bestFor: ["Enterprise", "GCP integration", "Compliance"],
    models: [
      { id: "gemini-1.5-pro-002", name: "Gemini 1.5 Pro Vertex", contextWindow: 2000000, maxOutput: 8192, inputCostPer1M: 1.25, outputCostPer1M: 5, capabilities: ["text", "vision"], isDefault: true, isActive: true },
    ]
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    tier: "tier4",
    modelCount: 30,
    baseUrl: "http://localhost:11434/api",
    requiresApiKey: false,
    capabilities: ["text", "code"],
    bestFor: ["Local inference", "Privacy", "Development"],
    models: [
      { id: "llama3.2", name: "Llama 3.2", contextWindow: 128000, maxOutput: 4096, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ["text"], isDefault: true, isActive: true },
      { id: "mistral", name: "Mistral", contextWindow: 32000, maxOutput: 4096, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ["text"], isActive: true },
      { id: "codellama", name: "Code Llama", contextWindow: 16000, maxOutput: 4096, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ["code"], isActive: true },
    ]
  },
  {
    id: "sambanova",
    name: "SambaNova",
    tier: "tier2",
    modelCount: 8,
    baseUrl: "https://api.sambanova.ai/v1",
    requiresApiKey: true,
    keyEnvVar: "SAMBANOVA_API_KEY",
    capabilities: ["text", "fast"],
    bestFor: ["Ultra-fast inference", "Enterprise"],
    models: [
      { id: "Meta-Llama-3.1-405B-Instruct", name: "Llama 3.1 405B", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 5, outputCostPer1M: 15, capabilities: ["text"], isDefault: true, isActive: true },
    ]
  },
  {
    id: "cerebras",
    name: "Cerebras",
    tier: "tier2",
    modelCount: 5,
    baseUrl: "https://api.cerebras.ai/v1",
    requiresApiKey: true,
    keyEnvVar: "CEREBRAS_API_KEY",
    capabilities: ["text", "fast"],
    bestFor: ["Ultra-fast inference", "Low latency"],
    models: [
      { id: "llama3.1-70b", name: "Llama 3.1 70B Cerebras", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 0.6, outputCostPer1M: 0.6, capabilities: ["text", "fast"], isDefault: true, isActive: true },
    ]
  },
  {
    id: "anyscale",
    name: "Anyscale",
    tier: "tier2",
    modelCount: 12,
    baseUrl: "https://api.anyscale.com/v1",
    requiresApiKey: true,
    keyEnvVar: "ANYSCALE_API_KEY",
    capabilities: ["text", "code"],
    bestFor: ["Production ML", "Distributed inference"],
    models: [
      { id: "meta-llama/Llama-3.3-70B-Instruct", name: "Llama 3.3 70B Anyscale", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 0.9, outputCostPer1M: 0.9, capabilities: ["text", "code"], isDefault: true, isActive: true },
    ]
  },
  {
    id: "ai21",
    name: "AI21 Labs",
    tier: "tier3",
    modelCount: 8,
    baseUrl: "https://api.ai21.com/studio/v1",
    requiresApiKey: true,
    keyEnvVar: "AI21_API_KEY",
    capabilities: ["text", "rag"],
    bestFor: ["Enterprise text", "Summarization", "Paraphrasing"],
    models: [
      { id: "jamba-1.5-large", name: "Jamba 1.5 Large", contextWindow: 256000, maxOutput: 4096, inputCostPer1M: 2, outputCostPer1M: 8, capabilities: ["text", "rag"], isDefault: true, isActive: true },
      { id: "jamba-1.5-mini", name: "Jamba 1.5 Mini", contextWindow: 256000, maxOutput: 4096, inputCostPer1M: 0.2, outputCostPer1M: 0.4, capabilities: ["text"], isActive: true },
      { id: "j2-ultra", name: "Jurassic-2 Ultra", contextWindow: 8192, maxOutput: 8192, inputCostPer1M: 15, outputCostPer1M: 15, capabilities: ["text"], isActive: true },
    ]
  }
];

export function getTotalModelCount(): number {
  return PROVIDER_MANIFESTS.reduce((sum, p) => sum + p.modelCount, 0);
}

export function getTotalProviderCount(): number {
  return PROVIDER_MANIFESTS.length;
}

export function getProvidersByTier(tier: ModelTier): ProviderManifest[] {
  return PROVIDER_MANIFESTS.filter(p => p.tier === tier);
}

export function getProviderById(id: AIProvider): ProviderManifest | undefined {
  return PROVIDER_MANIFESTS.find(p => p.id === id);
}

export function getActiveModels(): ModelEntry[] {
  return PROVIDER_MANIFESTS.flatMap(p => p.models.filter(m => m.isActive));
}

export function getModelsByCapability(capability: ModelCapability): { provider: ProviderManifest; model: ModelEntry }[] {
  const result: { provider: ProviderManifest; model: ModelEntry }[] = [];
  for (const provider of PROVIDER_MANIFESTS) {
    for (const model of provider.models) {
      if (model.capabilities.includes(capability) && model.isActive) {
        result.push({ provider, model });
      }
    }
  }
  return result;
}

export function selectOptimalModel(
  task: { type: string; requiresSpeed?: boolean; requiresIndianLanguages?: boolean; requiresVision?: boolean; requiresReasoning?: boolean }
): { provider: ProviderManifest; model: ModelEntry } | null {
  if (task.requiresIndianLanguages) {
    const sarvam = getProviderById("sarvam");
    if (sarvam) {
      const model = sarvam.models.find(m => m.isDefault) || sarvam.models[0];
      return { provider: sarvam, model };
    }
  }

  if (task.requiresSpeed) {
    const groq = getProviderById("groq");
    if (groq) {
      const model = groq.models.find(m => m.isDefault) || groq.models[0];
      return { provider: groq, model };
    }
  }

  if (task.requiresReasoning) {
    const anthropic = getProviderById("anthropic");
    if (anthropic) {
      const model = anthropic.models.find(m => m.isDefault) || anthropic.models[0];
      return { provider: anthropic, model };
    }
  }

  if (task.requiresVision) {
    const gemini = getProviderById("gemini");
    if (gemini) {
      const model = gemini.models.find(m => m.capabilities.includes("vision")) || gemini.models[0];
      return { provider: gemini, model };
    }
  }

  const openai = getProviderById("openai");
  if (openai) {
    const model = openai.models.find(m => m.isDefault) || openai.models[0];
    return { provider: openai, model };
  }

  return null;
}

export const PROVIDER_STATS = {
  totalProviders: getTotalProviderCount(),
  totalModels: getTotalModelCount(),
  tier1Providers: getProvidersByTier("tier1").length,
  tier2Providers: getProvidersByTier("tier2").length,
  tier3Providers: getProvidersByTier("tier3").length,
  tier4Providers: getProvidersByTier("tier4").length,
  activeModels: getActiveModels().length
};
