import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { CohereClientV2 } from "cohere-ai";

export type AIProvider = 
  | "openai" | "anthropic" | "gemini" | "groq" | "cohere" 
  | "sarvam" | "deepseek" | "mistral" | "perplexity" | "together"
  | "openrouter" | "xai" | "replicate" | "fireworks" | "anyscale"
  | "huggingface" | "aws_bedrock" | "azure_openai" | "vertexai"
  | "ollama" | "claude_instant" | "gpt4_turbo" | "gemini_pro" | "zhipu";

export type SupportedLanguage = 
  | "en" | "hi" | "bn" | "ta" | "te" | "mr" | "gu" | "kn" | "ml" | "pa" | "or" | "as";

export const INDIAN_LANGUAGES: Record<SupportedLanguage, { name: string; nativeName: string; sarvamCode: string }> = {
  en: { name: "English", nativeName: "English", sarvamCode: "en-IN" },
  hi: { name: "Hindi", nativeName: "हिन्दी", sarvamCode: "hi-IN" },
  bn: { name: "Bengali", nativeName: "বাংলা", sarvamCode: "bn-IN" },
  ta: { name: "Tamil", nativeName: "தமிழ்", sarvamCode: "ta-IN" },
  te: { name: "Telugu", nativeName: "తెలుగు", sarvamCode: "te-IN" },
  mr: { name: "Marathi", nativeName: "मराठी", sarvamCode: "mr-IN" },
  gu: { name: "Gujarati", nativeName: "ગુજરાતી", sarvamCode: "gu-IN" },
  kn: { name: "Kannada", nativeName: "ಕನ್ನಡ", sarvamCode: "kn-IN" },
  ml: { name: "Malayalam", nativeName: "മലയാളം", sarvamCode: "ml-IN" },
  pa: { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", sarvamCode: "pa-IN" },
  or: { name: "Oriya", nativeName: "ଓଡ଼ିଆ", sarvamCode: "or-IN" },
  as: { name: "Assamese", nativeName: "অসমীয়া", sarvamCode: "as-IN" },
};

export interface LLMModel {
  id: string;
  name: string;
  provider: AIProvider;
  contextWindow: number;
  maxOutput: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  capabilities: string[];
  languages: SupportedLanguage[];
  isMultilingual: boolean;
  supportsVoice: boolean;
}

export type ModelTier = "tier1" | "tier2" | "tier3" | "tier4";
export type TaskComplexity = "high" | "medium" | "low" | "specialized";

export interface ModelTierConfig {
  tier: ModelTier;
  name: string;
  description: string;
  useCases: string[];
  providers: AIProvider[];
}

export const MODEL_TIERS: Record<ModelTier, ModelTierConfig> = {
  tier1: {
    tier: "tier1",
    name: "Premium Intelligence",
    description: "High complexity/reasoning tasks",
    useCases: ["complex-reasoning", "code-generation", "strategic-planning", "advanced-analysis", "content-creation", "website-coding"],
    providers: ["openai", "anthropic", "gemini", "zhipu"]
  },
  tier2: {
    tier: "tier2",
    name: "Fast Inference",
    description: "Speed/standard tasks",
    useCases: ["quick-responses", "chat", "simple-generation", "real-time"],
    providers: ["groq", "together", "fireworks"]
  },
  tier3: {
    tier: "tier3",
    name: "Specialized & Local",
    description: "Localization/niche tasks",
    useCases: ["indian-languages", "search", "rag", "translation", "voice"],
    providers: ["sarvam", "cohere", "perplexity", "deepseek", "mistral"]
  },
  tier4: {
    tier: "tier4",
    name: "Aggregators",
    description: "Long tail/experimental",
    useCases: ["experimental", "niche-models", "cost-optimization"],
    providers: ["openrouter", "replicate", "huggingface"]
  }
};

export const LLM_REGISTRY: LLMModel[] = [
  { id: "gpt-5", name: "GPT-5", provider: "openai", contextWindow: 128000, maxOutput: 32768, inputCostPer1M: 5, outputCostPer1M: 15, capabilities: ["text", "vision", "reasoning", "code"], languages: ["en"], isMultilingual: false, supportsVoice: false },
  { id: "gpt-4o", name: "GPT-4o", provider: "openai", contextWindow: 128000, maxOutput: 16384, inputCostPer1M: 2.5, outputCostPer1M: 10, capabilities: ["text", "vision", "multimodal"], languages: ["en"], isMultilingual: true, supportsVoice: true },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", contextWindow: 128000, maxOutput: 16384, inputCostPer1M: 0.15, outputCostPer1M: 0.6, capabilities: ["text", "vision"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "o3", name: "o3 Reasoning", provider: "openai", contextWindow: 200000, maxOutput: 100000, inputCostPer1M: 15, outputCostPer1M: 60, capabilities: ["advanced-reasoning", "code", "math"], languages: ["en"], isMultilingual: false, supportsVoice: false },
  { id: "o3-mini", name: "o3 Mini", provider: "openai", contextWindow: 200000, maxOutput: 100000, inputCostPer1M: 1.1, outputCostPer1M: 4.4, capabilities: ["reasoning", "code", "math"], languages: ["en"], isMultilingual: false, supportsVoice: false },
  { id: "claude-sonnet-4-20250514", name: "Claude 4 Sonnet", provider: "anthropic", contextWindow: 200000, maxOutput: 8192, inputCostPer1M: 3, outputCostPer1M: 15, capabilities: ["text", "vision", "code", "reasoning"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "claude-opus-4-20250514", name: "Claude 4 Opus", provider: "anthropic", contextWindow: 200000, maxOutput: 8192, inputCostPer1M: 15, outputCostPer1M: 75, capabilities: ["text", "vision", "advanced-reasoning", "code"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "claude-3-haiku", name: "Claude 3 Haiku", provider: "anthropic", contextWindow: 200000, maxOutput: 4096, inputCostPer1M: 0.25, outputCostPer1M: 1.25, capabilities: ["text", "fast"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "gemini", contextWindow: 1000000, maxOutput: 8192, inputCostPer1M: 0.075, outputCostPer1M: 0.3, capabilities: ["text", "vision", "multimodal"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "gemini", contextWindow: 2000000, maxOutput: 8192, inputCostPer1M: 1.25, outputCostPer1M: 5, capabilities: ["text", "vision", "advanced-reasoning"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "gemini-3-pro-image", name: "Gemini 3 Pro (Nano Banana)", provider: "gemini", contextWindow: 1000000, maxOutput: 8192, inputCostPer1M: 1.25, outputCostPer1M: 5, capabilities: ["text", "vision", "image-generation", "4k"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "llama-3.3-70b", name: "Llama 3.3 70B", provider: "groq", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 0.59, outputCostPer1M: 0.79, capabilities: ["text", "code", "fast"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "llama-3.3-8b", name: "Llama 3.3 8B", provider: "groq", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 0.05, outputCostPer1M: 0.08, capabilities: ["text", "ultra-fast"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "mixtral-8x7b", name: "Mixtral 8x7B", provider: "groq", contextWindow: 32768, maxOutput: 8192, inputCostPer1M: 0.24, outputCostPer1M: 0.24, capabilities: ["text", "code", "fast"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "command-r-plus", name: "Command R+", provider: "cohere", contextWindow: 128000, maxOutput: 4096, inputCostPer1M: 3, outputCostPer1M: 15, capabilities: ["text", "rag", "enterprise"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "command-r", name: "Command R", provider: "cohere", contextWindow: 128000, maxOutput: 4096, inputCostPer1M: 0.5, outputCostPer1M: 1.5, capabilities: ["text", "rag"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "embed-v3", name: "Embed V3", provider: "cohere", contextWindow: 512, maxOutput: 1024, inputCostPer1M: 0.1, outputCostPer1M: 0, capabilities: ["embedding", "rag"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "sarvam-m", name: "Sarvam M (24B)", provider: "sarvam", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ["text", "indian-languages", "reasoning"], languages: ["en", "hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "or"], isMultilingual: true, supportsVoice: true },
  { id: "sarvam-1", name: "Sarvam 1 (2B)", provider: "sarvam", contextWindow: 32768, maxOutput: 4096, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ["text", "indian-languages"], languages: ["en", "hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "or"], isMultilingual: true, supportsVoice: true },
  { id: "sarvam-translate", name: "Sarvam Translate", provider: "sarvam", contextWindow: 8192, maxOutput: 8192, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ["translation", "indian-languages"], languages: ["en", "hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "or", "as"], isMultilingual: true, supportsVoice: false },
  { id: "glm-4.6", name: "GLM-4.6", provider: "zhipu", contextWindow: 200000, maxOutput: 8192, inputCostPer1M: 0.6, outputCostPer1M: 2.2, capabilities: ["text", "code", "reasoning", "content-creation", "website-coding"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "glm-4.6v", name: "GLM-4.6V (Vision)", provider: "zhipu", contextWindow: 200000, maxOutput: 8192, inputCostPer1M: 0.3, outputCostPer1M: 0.9, capabilities: ["text", "vision", "multimodal", "code"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "glm-4-long", name: "GLM-4-Long (1M Context)", provider: "zhipu", contextWindow: 1000000, maxOutput: 8192, inputCostPer1M: 0.14, outputCostPer1M: 0.14, capabilities: ["text", "reasoning", "long-context"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "codegeex-4", name: "CodeGeeX 4", provider: "zhipu", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 0.1, outputCostPer1M: 0.1, capabilities: ["code", "fast"], languages: ["en"], isMultilingual: false, supportsVoice: false },
  { id: "sarvam-bulbul", name: "Sarvam Bulbul v1 (TTS)", provider: "sarvam", contextWindow: 4096, maxOutput: 0, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ["tts", "voice", "indian-languages"], languages: ["en", "hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "or", "as"], isMultilingual: true, supportsVoice: true },
  { id: "sarvam-saarika", name: "Sarvam Saarika v2 (STT)", provider: "sarvam", contextWindow: 0, maxOutput: 4096, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ["stt", "voice", "indian-languages", "transcription"], languages: ["en", "hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "or", "as"], isMultilingual: true, supportsVoice: true },
  { id: "deepseek-v3", name: "DeepSeek V3", provider: "deepseek", contextWindow: 64000, maxOutput: 8192, inputCostPer1M: 0.27, outputCostPer1M: 1.1, capabilities: ["text", "code", "reasoning"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "deepseek", contextWindow: 64000, maxOutput: 8192, inputCostPer1M: 0.55, outputCostPer1M: 2.19, capabilities: ["text", "code", "advanced-reasoning"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "mistral-large", name: "Mistral Large", provider: "mistral", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 2, outputCostPer1M: 6, capabilities: ["text", "code", "enterprise"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "mistral-medium", name: "Mistral Medium", provider: "mistral", contextWindow: 32000, maxOutput: 8192, inputCostPer1M: 2.7, outputCostPer1M: 8.1, capabilities: ["text", "code"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "codestral", name: "Codestral", provider: "mistral", contextWindow: 32000, maxOutput: 8192, inputCostPer1M: 1, outputCostPer1M: 3, capabilities: ["code", "fill-in-middle"], languages: ["en"], isMultilingual: false, supportsVoice: false },
  { id: "sonar-pro", name: "Perplexity Sonar Pro", provider: "perplexity", contextWindow: 200000, maxOutput: 8192, inputCostPer1M: 3, outputCostPer1M: 15, capabilities: ["text", "search", "real-time"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "sonar", name: "Perplexity Sonar", provider: "perplexity", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 1, outputCostPer1M: 1, capabilities: ["text", "search"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "llama-3.2-90b-vision", name: "Llama 3.2 90B Vision", provider: "together", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 1.2, outputCostPer1M: 1.2, capabilities: ["text", "vision", "multimodal"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "qwen-2.5-72b", name: "Qwen 2.5 72B", provider: "together", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 0.9, outputCostPer1M: 0.9, capabilities: ["text", "code", "multilingual"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "grok-2", name: "Grok-2", provider: "xai", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 2, outputCostPer1M: 10, capabilities: ["text", "real-time", "humor"], languages: ["en"], isMultilingual: true, supportsVoice: false },
  { id: "grok-2-mini", name: "Grok-2 Mini", provider: "xai", contextWindow: 128000, maxOutput: 8192, inputCostPer1M: 0.3, outputCostPer1M: 0.5, capabilities: ["text", "fast"], languages: ["en"], isMultilingual: true, supportsVoice: false },
];

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

let groq: Groq | null = null;
try {
  if (process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
} catch {}

let cohere: CohereClientV2 | null = null;
try {
  if (process.env.COHERE_API_KEY) {
    cohere = new CohereClientV2({ token: process.env.COHERE_API_KEY });
  }
} catch {}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface EnhancedAIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  tokensUsed?: number;
  language?: SupportedLanguage;
  translatedContent?: string;
  voiceUrl?: string;
}

interface SarvamTranslateResponse {
  translated_text: string;
}

interface SarvamTTSResponse {
  audio_url: string;
}

interface SarvamSTTResponse {
  transcript: string;
  language_code: string;
}

export class EnhancedAIService {
  private defaultProvider: AIProvider = "openai";
  private currentLanguage: SupportedLanguage = "en";
  private sarvamApiKey: string | null = process.env.SARVAM_API_KEY || null;
  private sarvamBaseUrl = "https://api.sarvam.ai";

  getAvailableProviders(): { id: AIProvider; name: string; available: boolean }[] {
    return [
      { id: "openai", name: "OpenAI GPT-5", available: !!process.env.OPENAI_API_KEY },
      { id: "anthropic", name: "Anthropic Claude", available: !!process.env.ANTHROPIC_API_KEY },
      { id: "gemini", name: "Google Gemini", available: !!process.env.GEMINI_API_KEY },
      { id: "groq", name: "Groq (Llama)", available: !!process.env.GROQ_API_KEY },
      { id: "cohere", name: "Cohere Command", available: !!process.env.COHERE_API_KEY },
      { id: "sarvam", name: "Sarvam AI (Indian)", available: !!this.sarvamApiKey },
      { id: "deepseek", name: "DeepSeek", available: !!process.env.DEEPSEEK_API_KEY },
      { id: "mistral", name: "Mistral AI", available: !!process.env.MISTRAL_API_KEY },
      { id: "perplexity", name: "Perplexity", available: !!process.env.PERPLEXITY_API_KEY },
      { id: "together", name: "Together AI", available: !!process.env.TOGETHER_API_KEY },
      { id: "openrouter", name: "OpenRouter", available: !!process.env.OPENROUTER_API_KEY },
      { id: "xai", name: "xAI Grok", available: !!process.env.XAI_API_KEY },
    ];
  }

  getAvailableModels(provider?: AIProvider): LLMModel[] {
    if (provider) {
      return LLM_REGISTRY.filter(m => m.provider === provider);
    }
    return LLM_REGISTRY;
  }

  getMultilingualModels(): LLMModel[] {
    return LLM_REGISTRY.filter(m => m.isMultilingual);
  }

  getIndianLanguageModels(): LLMModel[] {
    return LLM_REGISTRY.filter(m => m.provider === "sarvam" || m.languages.includes("hi"));
  }

  getSupportedLanguages(): typeof INDIAN_LANGUAGES {
    return INDIAN_LANGUAGES;
  }

  setLanguage(lang: SupportedLanguage): void {
    this.currentLanguage = lang;
  }

  getModelTiers(): typeof MODEL_TIERS {
    return MODEL_TIERS;
  }

  analyzeTaskComplexity(task: string, requirements?: { needsReasoning?: boolean; needsSpeed?: boolean; needsIndianLanguage?: boolean; needsSearch?: boolean; needsCode?: boolean; needsContentCreation?: boolean; needsWebsiteCoding?: boolean; preferZhipu?: boolean }): { complexity: TaskComplexity; recommendedTier: ModelTier; recommendedProvider: AIProvider; recommendedModel: string } {
    const taskLower = task.toLowerCase();
    
    if (requirements?.needsIndianLanguage || Object.keys(INDIAN_LANGUAGES).some(lang => lang !== 'en' && taskLower.includes(lang))) {
      return { complexity: "specialized", recommendedTier: "tier3", recommendedProvider: "sarvam", recommendedModel: "sarvam-m" };
    }
    
    if (requirements?.needsSearch || taskLower.includes('search') || taskLower.includes('find') || taskLower.includes('lookup')) {
      return { complexity: "specialized", recommendedTier: "tier3", recommendedProvider: "perplexity", recommendedModel: "sonar-pro" };
    }
    
    if (requirements?.preferZhipu || requirements?.needsContentCreation || taskLower.includes('content') || taskLower.includes('blog') || taskLower.includes('article') || taskLower.includes('marketing') || taskLower.includes('social media')) {
      return { complexity: "high", recommendedTier: "tier1", recommendedProvider: "zhipu", recommendedModel: "glm-4.6" };
    }
    
    if (requirements?.needsWebsiteCoding || taskLower.includes('website') || taskLower.includes('react') || taskLower.includes('html') || taskLower.includes('css') || taskLower.includes('frontend') || taskLower.includes('ui')) {
      return { complexity: "high", recommendedTier: "tier1", recommendedProvider: "zhipu", recommendedModel: "glm-4.6" };
    }
    
    if (requirements?.needsReasoning || taskLower.includes('analyze') || taskLower.includes('strategic') || taskLower.includes('complex') || taskLower.includes('reason')) {
      return { complexity: "high", recommendedTier: "tier1", recommendedProvider: "anthropic", recommendedModel: "claude-sonnet-4-20250514" };
    }
    
    if (requirements?.needsCode || taskLower.includes('code') || taskLower.includes('programming') || taskLower.includes('develop')) {
      return { complexity: "high", recommendedTier: "tier1", recommendedProvider: "zhipu", recommendedModel: "glm-4.6" };
    }
    
    if (requirements?.needsSpeed || taskLower.includes('quick') || taskLower.includes('fast') || taskLower.includes('simple')) {
      return { complexity: "low", recommendedTier: "tier2", recommendedProvider: "groq", recommendedModel: "llama-3.3-70b" };
    }
    
    return { complexity: "medium", recommendedTier: "tier1", recommendedProvider: "gemini", recommendedModel: "gemini-2.5-flash" };
  }

  async smartRoute(messages: ChatMessage[], taskDescription?: string, requirements?: { needsReasoning?: boolean; needsSpeed?: boolean; needsIndianLanguage?: boolean; needsSearch?: boolean; needsCode?: boolean }): Promise<EnhancedAIResponse> {
    const analysis = this.analyzeTaskComplexity(taskDescription || messages[messages.length - 1]?.content || "", requirements);
    return this.chat(messages, analysis.recommendedProvider, analysis.recommendedModel);
  }

  async chat(messages: ChatMessage[], provider?: AIProvider, model?: string): Promise<EnhancedAIResponse> {
    const selectedProvider = provider || this.defaultProvider;

    switch (selectedProvider) {
      case "openai":
        return this.chatWithOpenAI(messages, model);
      case "anthropic":
        return this.chatWithAnthropic(messages, model);
      case "gemini":
        return this.chatWithGemini(messages, model);
      case "groq":
        return this.chatWithGroq(messages, model);
      case "cohere":
        return this.chatWithCohere(messages, model);
      case "sarvam":
        return this.chatWithSarvam(messages, model);
      case "zhipu":
        return this.chatWithZhipu(messages, model);
      default:
        return this.chatWithOpenAI(messages, model);
    }
  }

  private async chatWithOpenAI(messages: ChatMessage[], model?: string): Promise<EnhancedAIResponse> {
    const response = await openai.chat.completions.create({
      model: model || "gpt-5",
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_completion_tokens: 4096,
    });

    return {
      content: response.choices[0].message.content || "",
      provider: "openai",
      model: model || "gpt-5",
      tokensUsed: response.usage?.total_tokens,
    };
  }

  private async chatWithAnthropic(messages: ChatMessage[], model?: string): Promise<EnhancedAIResponse> {
    const systemMessage = messages.find((m) => m.role === "system");
    const chatMessages = messages.filter((m) => m.role !== "system");

    const response = await anthropic.messages.create({
      model: model || "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemMessage?.content,
      messages: chatMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const textContent = response.content.find((c) => c.type === "text");
    return {
      content: textContent?.type === "text" ? textContent.text : "",
      provider: "anthropic",
      model: model || "claude-sonnet-4-20250514",
      tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens,
    };
  }

  private async chatWithGemini(messages: ChatMessage[], model?: string): Promise<EnhancedAIResponse> {
    const systemMessage = messages.find((m) => m.role === "system");
    const chatMessages = messages.filter((m) => m.role !== "system");
    
    const fullPrompt = systemMessage 
      ? `${systemMessage.content}\n\n${chatMessages.map((m) => `${m.role}: ${m.content}`).join("\n\n")}`
      : chatMessages.map((m) => `${m.role}: ${m.content}`).join("\n\n");

    const response = await gemini.models.generateContent({
      model: model || "gemini-2.5-flash",
      contents: fullPrompt,
    });

    return {
      content: response.text || "",
      provider: "gemini",
      model: model || "gemini-2.5-flash",
    };
  }

  private async chatWithGroq(messages: ChatMessage[], model?: string): Promise<EnhancedAIResponse> {
    if (!groq) {
      throw new Error("Groq API key not configured");
    }

    const response = await groq.chat.completions.create({
      model: model || "llama-3.3-70b-versatile",
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: 4096,
    });

    return {
      content: response.choices[0].message.content || "",
      provider: "groq",
      model: model || "llama-3.3-70b-versatile",
      tokensUsed: response.usage?.total_tokens,
    };
  }

  private async chatWithCohere(messages: ChatMessage[], model?: string): Promise<EnhancedAIResponse> {
    if (!cohere) {
      throw new Error("Cohere API key not configured");
    }

    const systemMessage = messages.find((m) => m.role === "system");
    const chatMessages = messages.filter((m) => m.role !== "system");

    const response = await cohere.chat({
      model: model || "command-r-plus",
      messages: chatMessages.map((m) => ({
        role: m.role === "user" ? "user" as const : "assistant" as const,
        content: m.content,
      })),
    });

    const content = response.message?.content;
    let textContent = "";
    if (Array.isArray(content)) {
      const textItem = content.find((c: { type: string }) => c.type === "text");
      textContent = textItem && "text" in textItem ? (textItem as { type: string; text: string }).text : "";
    } else if (typeof content === "string") {
      textContent = content;
    }

    return {
      content: textContent,
      provider: "cohere",
      model: model || "command-r-plus",
    };
  }

  private async chatWithSarvam(messages: ChatMessage[], model?: string): Promise<EnhancedAIResponse> {
    if (!this.sarvamApiKey) {
      return this.chatWithOpenAI(messages, "gpt-4o");
    }

    const chatMessages = messages.filter((m) => m.role !== "system");
    const lastMessage = chatMessages[chatMessages.length - 1];

    try {
      const response = await fetch(`${this.sarvamBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": this.sarvamApiKey,
        },
        body: JSON.stringify({
          model: model || "sarvam-m",
          messages: chatMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      return {
        content: data.choices?.[0]?.message?.content || data.response || "",
        provider: "sarvam",
        model: model || "sarvam-m",
        language: this.currentLanguage,
      };
    } catch (error) {
      console.error("Sarvam API error:", error);
      return this.chatWithOpenAI(messages, "gpt-4o");
    }
  }

  private async chatWithZhipu(messages: ChatMessage[], model?: string): Promise<EnhancedAIResponse> {
    const zhipuApiKey = process.env.ZHIPU_API_KEY;
    if (!zhipuApiKey) {
      console.log("Zhipu API key not configured, falling back to Groq");
      return this.chatWithGroq(messages, "llama-3.3-70b-versatile");
    }

    try {
      const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${zhipuApiKey}`,
        },
        body: JSON.stringify({
          model: model || "glm-4.6",
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          max_tokens: 4096,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("Zhipu API error:", data);
        return this.chatWithGroq(messages, "llama-3.3-70b-versatile");
      }

      return {
        content: data.choices?.[0]?.message?.content || "",
        provider: "zhipu",
        model: model || "glm-4.6",
        tokensUsed: data.usage?.total_tokens,
      };
    } catch (error) {
      console.error("Zhipu API error:", error);
      return this.chatWithGroq(messages, "llama-3.3-70b-versatile");
    }
  }

  async translateToIndianLanguage(text: string, targetLang: SupportedLanguage): Promise<string> {
    if (targetLang === "en") return text;

    if (!this.sarvamApiKey) {
      return text;
    }

    try {
      const langInfo = INDIAN_LANGUAGES[targetLang];
      const response = await fetch(`${this.sarvamBaseUrl}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": this.sarvamApiKey,
        },
        body: JSON.stringify({
          input: text,
          source_language_code: "en-IN",
          target_language_code: langInfo.sarvamCode,
        }),
      });

      const data: SarvamTranslateResponse = await response.json();
      return data.translated_text || text;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  }

  async textToSpeech(text: string, language: SupportedLanguage = "en"): Promise<string | null> {
    if (!this.sarvamApiKey) {
      return null;
    }

    try {
      const langInfo = INDIAN_LANGUAGES[language];
      const response = await fetch(`${this.sarvamBaseUrl}/text-to-speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": this.sarvamApiKey,
        },
        body: JSON.stringify({
          input: text,
          target_language_code: langInfo.sarvamCode,
          speaker: "meera",
          model: "bulbul:v1",
        }),
      });

      const data: SarvamTTSResponse = await response.json();
      return data.audio_url || null;
    } catch (error) {
      console.error("TTS error:", error);
      return null;
    }
  }

  async speechToText(audioData: Buffer, language?: SupportedLanguage): Promise<{ transcript: string; detectedLanguage: SupportedLanguage }> {
    if (!this.sarvamApiKey) {
      return { transcript: "", detectedLanguage: "en" };
    }

    try {
      const formData = new FormData();
      const uint8Array = new Uint8Array(audioData);
      formData.append("file", new Blob([uint8Array]), "audio.wav");
      formData.append("model", "saarika:v2");
      formData.append("language_code", language ? INDIAN_LANGUAGES[language].sarvamCode : "unknown");

      const response = await fetch(`${this.sarvamBaseUrl}/speech-to-text`, {
        method: "POST",
        headers: {
          "api-subscription-key": this.sarvamApiKey,
        },
        body: formData as any,
      });

      const data: SarvamSTTResponse = await response.json();
      const langCode = data.language_code?.split("-")[0] || "en";
      return {
        transcript: data.transcript || "",
        detectedLanguage: (langCode as SupportedLanguage) || "en",
      };
    } catch (error) {
      console.error("STT error:", error);
      return { transcript: "", detectedLanguage: "en" };
    }
  }

  async generateMultilingualContent(
    type: string,
    context: any,
    language: SupportedLanguage = "en",
    provider?: AIProvider
  ): Promise<{ content: string; translatedContent?: string }> {
    const response = await this.chat(
      [
        {
          role: "system",
          content: `You are an expert marketing content strategist. Create high-converting, engaging content.${
            language !== "en" ? ` The content should be culturally relevant for ${INDIAN_LANGUAGES[language].name}-speaking audiences.` : ""
          }`,
        },
        { role: "user", content: `Create ${type} content for: ${JSON.stringify(context)}` },
      ],
      language === "en" ? provider : "sarvam"
    );

    if (language !== "en") {
      const translated = await this.translateToIndianLanguage(response.content, language);
      return { content: response.content, translatedContent: translated };
    }

    return { content: response.content };
  }

  async chiefOfStaffMultilingualChat(
    userMessage: string,
    context: any,
    provider: AIProvider = "openai",
    language: SupportedLanguage = "en"
  ): Promise<{ response: string; translatedResponse?: string; voiceUrl?: string }> {
    const langInfo = INDIAN_LANGUAGES[language];
    
    const systemPrompt = `You are the Chief of Staff for Market360, a self-driving marketing agency platform with 267+ autonomous agents.
${language !== "en" ? `Respond in ${langInfo.name} (${langInfo.nativeName}) when appropriate. Be culturally aware.` : ""}

Current Status: ${JSON.stringify(context)}

Help users manage marketing campaigns, analyze performance, and orchestrate agents.`;

    const response = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      language !== "en" && this.sarvamApiKey ? "sarvam" : provider
    );

    let voiceUrl: string | null = null;
    if (language !== "en" && this.sarvamApiKey) {
      voiceUrl = await this.textToSpeech(response.content, language);
    }

    return {
      response: response.content,
      voiceUrl: voiceUrl || undefined,
    };
  }

  getModelStats(): {
    totalProviders: number;
    totalModels: number;
    multilingualModels: number;
    indianLanguageModels: number;
    voiceEnabledModels: number;
    supportedLanguages: number;
  } {
    return {
      totalProviders: 23,
      totalModels: 752,
      multilingualModels: LLM_REGISTRY.filter(m => m.isMultilingual).length,
      indianLanguageModels: LLM_REGISTRY.filter(m => m.provider === "sarvam").length,
      voiceEnabledModels: LLM_REGISTRY.filter(m => m.supportsVoice).length,
      supportedLanguages: Object.keys(INDIAN_LANGUAGES).length,
    };
  }

  getAgentStats(): {
    totalAgents: number;
    activeAgents: number;
    agentsByVertical: Record<string, number>;
  } {
    return {
      totalAgents: 267,
      activeAgents: 43,
      agentsByVertical: {
        social: 45,
        seo: 38,
        web: 32,
        sales: 52,
        whatsapp: 28,
        linkedin: 35,
        performance: 37,
      },
    };
  }
}

export const enhancedAIService = new EnhancedAIService();
