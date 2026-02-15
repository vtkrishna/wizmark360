import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

export interface LLMRequest {
  message: string;
  systemPrompt?: string;
  model?: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
  context?: { previousMessages?: Array<{ role: string; content: string }> };
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  tokensUsed?: number;
  cost?: number;
}

const PROVIDER_PRIORITY: string[] = ["openrouter", "openai", "gemini", "anthropic", "groq"];

const OPENROUTER_FREE_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemini-2.5-flash:free",
  "deepseek/deepseek-chat-v3-0324:free",
];

const MARKETING_SYSTEM_PROMPTS: Record<string, string> = {
  strategy: "You are an expert marketing strategist. Create comprehensive, data-driven marketing strategies with clear objectives, target audience analysis, channel recommendations, budget allocation, KPIs, and implementation timelines. Focus on ROI-driven approaches.",
  social: "You are a social media marketing expert. Create engaging, platform-optimized social media content with compelling copy, hashtag strategies, posting schedules, and engagement tactics. Tailor content for each platform's unique audience and format requirements.",
  seo: "You are an SEO and content optimization specialist. Create search-engine-optimized content with strategic keyword placement, meta descriptions, header structures, internal linking recommendations, and content that satisfies both user intent and search engine algorithms.",
  email: "You are an email marketing specialist. Create high-converting email campaigns with compelling subject lines, personalized content, clear CTAs, A/B testing suggestions, and segmentation strategies. Focus on deliverability and engagement metrics.",
  presentation: "You are a presentation design and content expert. Create compelling presentation outlines with persuasive narratives, data visualization suggestions, slide structures, speaker notes, and audience engagement techniques.",
  proposal: "You are a business proposal writing expert. Create professional, persuasive proposals with executive summaries, problem-solution frameworks, pricing structures, timelines, case studies, and compelling value propositions.",
  research: "You are a market research analyst. Conduct thorough market analysis with competitor landscapes, consumer insights, trend identification, SWOT analysis, market sizing, and actionable recommendations backed by data.",
  brand_guide: "You are a brand strategist and identity expert. Create comprehensive brand guidelines covering voice and tone, visual identity principles, messaging frameworks, brand architecture, and consistent communication standards across all touchpoints.",
};

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function getOpenRouterClient(): OpenAI | null {
  if (!process.env.OPENROUTER_API_KEY) return null;
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });
}

function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

function getGroqClient(): Groq | null {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export function getAvailableProviders(): string[] {
  const providers: string[] = [];
  if (process.env.OPENROUTER_API_KEY) providers.push("openrouter");
  if (process.env.OPENAI_API_KEY) providers.push("openai");
  if (process.env.GEMINI_API_KEY) providers.push("gemini");
  if (process.env.ANTHROPIC_API_KEY) providers.push("anthropic");
  if (process.env.GROQ_API_KEY) providers.push("groq");
  return providers;
}

function detectBestProvider(): string | null {
  for (const provider of PROVIDER_PRIORITY) {
    switch (provider) {
      case "openrouter":
        if (process.env.OPENROUTER_API_KEY) return "openrouter";
        break;
      case "openai":
        if (process.env.OPENAI_API_KEY) return "openai";
        break;
      case "gemini":
        if (process.env.GEMINI_API_KEY) return "gemini";
        break;
      case "anthropic":
        if (process.env.ANTHROPIC_API_KEY) return "anthropic";
        break;
      case "groq":
        if (process.env.GROQ_API_KEY) return "groq";
        break;
    }
  }
  return null;
}

function buildMessages(request: LLMRequest): Array<{ role: string; content: string }> {
  const messages: Array<{ role: string; content: string }> = [];
  if (request.systemPrompt) {
    messages.push({ role: "system", content: request.systemPrompt });
  }
  if (request.context?.previousMessages) {
    for (const msg of request.context.previousMessages) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }
  messages.push({ role: "user", content: request.message });
  return messages;
}

async function callOpenAI(request: LLMRequest): Promise<LLMResponse> {
  const client = getOpenAIClient();
  if (!client) throw new Error("OpenAI API key not configured");

  const model = request.model || "gpt-4o-mini";
  const messages = buildMessages(request);

  // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
  const isGpt5 = model.startsWith("gpt-5");

  const params: any = {
    model,
    messages: messages.map((m) => ({ role: m.role as any, content: m.content })),
    max_tokens: request.maxTokens || 2048,
  };

  if (!isGpt5 && request.temperature !== undefined) {
    params.temperature = request.temperature;
  }

  const response = await client.chat.completions.create(params);

  return {
    content: response.choices[0]?.message?.content || "",
    model,
    provider: "openai",
    tokensUsed: response.usage?.total_tokens,
    cost: estimateCost("openai", model, response.usage?.total_tokens || 0),
  };
}

async function callOpenRouter(request: LLMRequest): Promise<LLMResponse> {
  const client = getOpenRouterClient();
  if (!client) throw new Error("OpenRouter API key not configured");

  const model = request.model || OPENROUTER_FREE_MODELS[0];
  const messages = buildMessages(request);

  const params: any = {
    model,
    messages: messages.map((m) => ({ role: m.role as any, content: m.content })),
    max_tokens: request.maxTokens || 2048,
  };

  if (request.temperature !== undefined) {
    params.temperature = request.temperature;
  }

  const response = await client.chat.completions.create(params);

  return {
    content: response.choices[0]?.message?.content || "",
    model,
    provider: "openrouter",
    tokensUsed: response.usage?.total_tokens,
    cost: model.includes(":free") ? 0 : estimateCost("openrouter", model, response.usage?.total_tokens || 0),
  };
}

async function callAnthropic(request: LLMRequest): Promise<LLMResponse> {
  const client = getAnthropicClient();
  if (!client) throw new Error("Anthropic API key not configured");

  const model = request.model || "claude-sonnet-4-20250514";
  const messages = buildMessages(request);

  const systemMessage = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const params: any = {
    model,
    max_tokens: request.maxTokens || 2048,
    messages: chatMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  };

  if (systemMessage) {
    params.system = systemMessage.content;
  }

  if (request.temperature !== undefined) {
    params.temperature = request.temperature;
  }

  const response = await client.messages.create(params);
  const textContent = response.content.find((c: any) => c.type === "text");
  const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

  return {
    content: textContent?.type === "text" ? textContent.text : "",
    model,
    provider: "anthropic",
    tokensUsed,
    cost: estimateCost("anthropic", model, tokensUsed),
  };
}

async function callGemini(request: LLMRequest): Promise<LLMResponse> {
  const client = getGeminiClient();
  if (!client) throw new Error("Gemini API key not configured");

  const model = request.model || "gemini-2.5-flash";
  const messages = buildMessages(request);

  const systemMessage = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const fullPrompt = systemMessage
    ? `${systemMessage.content}\n\n${chatMessages.map((m) => `${m.role}: ${m.content}`).join("\n\n")}`
    : chatMessages.map((m) => `${m.role}: ${m.content}`).join("\n\n");

  const config: any = {};
  if (request.maxTokens) {
    config.maxOutputTokens = request.maxTokens;
  }
  if (request.temperature !== undefined) {
    config.temperature = request.temperature;
  }

  const response = await client.models.generateContent({
    model,
    contents: fullPrompt,
    config: Object.keys(config).length > 0 ? config : undefined,
  });

  return {
    content: response.text || "",
    model,
    provider: "gemini",
    tokensUsed: undefined,
    cost: undefined,
  };
}

async function callGroq(request: LLMRequest): Promise<LLMResponse> {
  const client = getGroqClient();
  if (!client) throw new Error("Groq API key not configured");

  const model = request.model || "llama-3.3-70b-versatile";
  const messages = buildMessages(request);

  const params: any = {
    model,
    messages: messages.map((m) => ({ role: m.role as any, content: m.content })),
    max_tokens: request.maxTokens || 2048,
  };

  if (request.temperature !== undefined) {
    params.temperature = request.temperature;
  }

  const response = await client.chat.completions.create(params);

  return {
    content: response.choices[0]?.message?.content || "",
    model,
    provider: "groq",
    tokensUsed: response.usage?.total_tokens,
    cost: estimateCost("groq", model, response.usage?.total_tokens || 0),
  };
}

function estimateCost(provider: string, model: string, tokens: number): number {
  const costPer1kTokens: Record<string, Record<string, number>> = {
    openai: {
      "gpt-4o-mini": 0.00015,
      "gpt-4o": 0.005,
      "gpt-5": 0.01,
    },
    anthropic: {
      "claude-sonnet-4-20250514": 0.003,
      "claude-3-5-sonnet-20241022": 0.003,
    },
    groq: {
      "llama-3.3-70b-versatile": 0.00059,
      "llama-3.1-8b-instant": 0.00005,
    },
    openrouter: {},
  };

  const providerCosts = costPer1kTokens[provider];
  if (!providerCosts) return 0;
  const rate = providerCosts[model] || 0;
  return (tokens / 1000) * rate;
}

const providerCallers: Record<string, (request: LLMRequest) => Promise<LLMResponse>> = {
  openai: callOpenAI,
  openrouter: callOpenRouter,
  anthropic: callAnthropic,
  gemini: callGemini,
  groq: callGroq,
};

export async function generateResponse(request: LLMRequest): Promise<LLMResponse> {
  if (request.provider) {
    const caller = providerCallers[request.provider];
    if (!caller) throw new Error(`Unknown provider: ${request.provider}`);
    return caller(request);
  }

  const available = getAvailableProviders();
  if (available.length === 0) {
    throw new Error("No LLM providers configured. Please set at least one API key.");
  }

  const priority = request.provider
    ? [request.provider]
    : PROVIDER_PRIORITY.filter((p) => available.includes(p));

  let lastError: Error | null = null;

  for (const provider of priority) {
    try {
      const caller = providerCallers[provider];
      if (!caller) continue;
      return await caller({ ...request, provider });
    } catch (error) {
      lastError = error as Error;
      console.error(`Provider ${provider} failed: ${(error as Error).message}`);
      continue;
    }
  }

  throw lastError || new Error("All LLM providers failed");
}

export async function generateMarketingContent(
  prompt: string,
  type: string,
  brandContext?: any
): Promise<LLMResponse> {
  const systemPrompt = MARKETING_SYSTEM_PROMPTS[type] || MARKETING_SYSTEM_PROMPTS.strategy;

  let enhancedSystemPrompt = systemPrompt;
  if (brandContext) {
    enhancedSystemPrompt += `\n\nBrand Context:\n`;
    if (brandContext.name) enhancedSystemPrompt += `Brand Name: ${brandContext.name}\n`;
    if (brandContext.industry) enhancedSystemPrompt += `Industry: ${brandContext.industry}\n`;
    if (brandContext.targetAudience) enhancedSystemPrompt += `Target Audience: ${brandContext.targetAudience}\n`;
    if (brandContext.tone) enhancedSystemPrompt += `Brand Tone: ${brandContext.tone}\n`;
    if (brandContext.values) enhancedSystemPrompt += `Brand Values: ${brandContext.values}\n`;
    if (brandContext.competitors) enhancedSystemPrompt += `Key Competitors: ${brandContext.competitors}\n`;
    if (brandContext.usp) enhancedSystemPrompt += `Unique Selling Proposition: ${brandContext.usp}\n`;
  }

  return generateResponse({
    message: prompt,
    systemPrompt: enhancedSystemPrompt,
  });
}

const unifiedLLMService = {
  generateResponse,
  generateMarketingContent,
  getAvailableProviders,
};

export default unifiedLLMService;
