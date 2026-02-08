export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  apiModelId: string;
  contextWindow: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  capabilities: string[];
  tier: 'premium' | 'professional' | 'cost-effective' | 'specialized';
  isDefault?: boolean;
  released?: string;
  supportsTool?: boolean;
  supportsVision?: boolean;
  supportsStreaming?: boolean;
  supportsThinking?: boolean;
}

export interface LLMProvider {
  id: string;
  name: string;
  tier: string;
  apiKeyEnv: string;
  baseUrl?: string;
  models: LLMModel[];
  isActive: boolean;
  supportedFeatures: string[];
}

export interface WizMarkToolCapability {
  id: string;
  name: string;
  description: string;
  category: 'marketing' | 'analysis' | 'automation' | 'research' | 'creative';
  requiredModel: string;
  parameters: string[];
}

export type ClaudeToolCapability = WizMarkToolCapability;

export const WIZMARK_INTELLIGENCE_SUITE: WizMarkToolCapability[] = [
  {
    id: 'competitor-intelligence',
    name: 'Competitor Intelligence Scanner',
    description: 'Automated web research and analysis of competitor marketing strategies, pricing, and positioning',
    category: 'research',
    requiredModel: 'claude-opus-4-6',
    parameters: ['competitor_url', 'analysis_depth', 'focus_areas']
  },
  {
    id: 'visual-brand-monitor',
    name: 'Visual Brand Monitor',
    description: 'Computer vision analysis of brand presence across websites, social media, and advertisements',
    category: 'analysis',
    requiredModel: 'claude-opus-4-6',
    parameters: ['brand_assets', 'platforms', 'monitoring_frequency']
  },
  {
    id: 'ad-creative-generator',
    name: 'AI Ad Creative Generator',
    description: 'Automated creation and iteration of ad copy, headlines, and campaign messaging using tool-use',
    category: 'creative',
    requiredModel: 'claude-sonnet-5-0',
    parameters: ['brand_voice', 'target_audience', 'platform', 'format']
  },
  {
    id: 'market-research-agent',
    name: 'Market Research Agent',
    description: 'Deep market research using computer-use to navigate research databases, industry reports, and trend analysis',
    category: 'research',
    requiredModel: 'claude-opus-4-6',
    parameters: ['industry', 'geography', 'time_range', 'data_sources']
  },
  {
    id: 'seo-audit-automation',
    name: 'SEO Audit Automation',
    description: 'Automated technical SEO audits using computer-use to crawl sites, analyze structure, and generate recommendations',
    category: 'automation',
    requiredModel: 'claude-sonnet-5-0',
    parameters: ['site_url', 'audit_depth', 'competitor_urls']
  },
  {
    id: 'social-listening-analyzer',
    name: 'Social Listening Analyzer',
    description: 'Real-time brand sentiment monitoring and social media trend detection across platforms',
    category: 'analysis',
    requiredModel: 'claude-sonnet-5-0',
    parameters: ['brand_keywords', 'platforms', 'sentiment_threshold']
  },
  {
    id: 'campaign-performance-optimizer',
    name: 'Campaign Performance Optimizer',
    description: 'Analyzes campaign data to generate optimization recommendations with automated A/B test suggestions',
    category: 'automation',
    requiredModel: 'claude-opus-4-6',
    parameters: ['campaign_data', 'kpi_targets', 'budget_constraints']
  },
  {
    id: 'content-repurposing-engine',
    name: 'Content Repurposing Engine',
    description: 'Transforms long-form content into multi-platform assets (social posts, emails, ads, scripts)',
    category: 'creative',
    requiredModel: 'claude-sonnet-5-0',
    parameters: ['source_content', 'target_platforms', 'brand_voice', 'language']
  },
  {
    id: 'lead-scoring-ai',
    name: 'Predictive Lead Scoring',
    description: 'AI-powered lead scoring using behavioral data, firmographics, and engagement patterns',
    category: 'analysis',
    requiredModel: 'claude-sonnet-5-0',
    parameters: ['lead_data', 'scoring_model', 'conversion_criteria']
  },
  {
    id: 'brand-voice-guardian',
    name: 'Brand Voice Guardian',
    description: 'Ensures all generated content maintains consistent brand voice, tone, and messaging standards',
    category: 'marketing',
    requiredModel: 'claude-sonnet-5-0',
    parameters: ['brand_guidelines', 'content_draft', 'channel']
  }
];

export const CLAUDE_MARKETING_TOOLS = WIZMARK_INTELLIGENCE_SUITE;

export const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    tier: 'Tier 1 - Premium',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    baseUrl: 'https://api.anthropic.com',
    isActive: true,
    supportedFeatures: ['chat', 'vision', 'tool-use', 'computer-use', 'extended-thinking', 'agent-teams', 'streaming', 'batch'],
    models: [
      { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'anthropic', apiModelId: 'claude-opus-4-6', contextWindow: 200000, inputCostPer1M: 15, outputCostPer1M: 75, capabilities: ['reasoning', 'code', 'vision', 'agents', 'tool-use', 'computer-use'], tier: 'premium', isDefault: true, released: '2026-02-05', supportsTool: true, supportsVision: true, supportsStreaming: true, supportsThinking: true },
      { id: 'claude-sonnet-5-0', name: 'Claude Sonnet 5.0', provider: 'anthropic', apiModelId: 'claude-sonnet-5-0', contextWindow: 200000, inputCostPer1M: 3, outputCostPer1M: 15, capabilities: ['text', 'code', 'vision', 'tool-use', 'fast'], tier: 'premium', released: '2026-02', supportsTool: true, supportsVision: true, supportsStreaming: true, supportsThinking: true },
      { id: 'claude-opus-4-5', name: 'Claude Opus 4.5', provider: 'anthropic', apiModelId: 'claude-opus-4-5', contextWindow: 200000, inputCostPer1M: 15, outputCostPer1M: 75, capabilities: ['reasoning', 'code', 'vision'], tier: 'premium', released: '2025-11-24', supportsTool: true, supportsVision: true, supportsStreaming: true, supportsThinking: true },
      { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', provider: 'anthropic', apiModelId: 'claude-sonnet-4-5', contextWindow: 200000, inputCostPer1M: 3, outputCostPer1M: 15, capabilities: ['text', 'vision', 'code', 'balanced'], tier: 'professional', supportsTool: true, supportsVision: true, supportsStreaming: true },
      { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'anthropic', apiModelId: 'claude-sonnet-4', contextWindow: 200000, inputCostPer1M: 3, outputCostPer1M: 15, capabilities: ['text', 'vision', 'fast'], tier: 'professional', supportsTool: true, supportsVision: true, supportsStreaming: true },
      { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', provider: 'anthropic', apiModelId: 'claude-haiku-4-5', contextWindow: 200000, inputCostPer1M: 0.8, outputCostPer1M: 4, capabilities: ['text', 'fast', 'cost-effective'], tier: 'cost-effective', supportsTool: true, supportsStreaming: true }
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    tier: 'Tier 1 - Premium',
    apiKeyEnv: 'OPENAI_API_KEY',
    baseUrl: 'https://api.openai.com',
    isActive: true,
    supportedFeatures: ['chat', 'vision', 'tool-use', 'streaming', 'embeddings', 'image-generation', 'tts', 'stt'],
    models: [
      { id: 'gpt-5-2', name: 'GPT-5.2 Thinking', provider: 'openai', apiModelId: 'gpt-5.2', contextWindow: 272000, inputCostPer1M: 1.75, outputCostPer1M: 14, capabilities: ['reasoning', 'vision', 'code', 'tool-use'], tier: 'premium', isDefault: true, released: '2026-02-05', supportsTool: true, supportsVision: true, supportsStreaming: true, supportsThinking: true },
      { id: 'gpt-5-2-pro', name: 'GPT-5.2 Pro', provider: 'openai', apiModelId: 'gpt-5.2-pro', contextWindow: 272000, inputCostPer1M: 15, outputCostPer1M: 60, capabilities: ['reasoning', 'code', 'maximum-quality'], tier: 'premium', released: '2026-02-05', supportsTool: true, supportsVision: true, supportsStreaming: true, supportsThinking: true },
      { id: 'gpt-5-2-instant', name: 'GPT-5.2 Instant', provider: 'openai', apiModelId: 'gpt-5.2-chat-latest', contextWindow: 272000, inputCostPer1M: 0.5, outputCostPer1M: 2, capabilities: ['text', 'fast', 'chat'], tier: 'cost-effective', released: '2026-02-05', supportsTool: true, supportsStreaming: true },
      { id: 'gpt-5-2-codex', name: 'GPT-5.2 Codex', provider: 'openai', apiModelId: 'gpt-5.2-codex', contextWindow: 272000, inputCostPer1M: 2.5, outputCostPer1M: 10, capabilities: ['code', 'agents', 'refactoring'], tier: 'premium', released: '2026-01', supportsTool: true, supportsStreaming: true },
      { id: 'o3-reasoning', name: 'o3 Reasoning', provider: 'openai', apiModelId: 'o3', contextWindow: 200000, inputCostPer1M: 15, outputCostPer1M: 60, capabilities: ['reasoning', 'math', 'science'], tier: 'premium', supportsTool: true, supportsThinking: true },
      { id: 'o4-mini', name: 'o4 Mini', provider: 'openai', apiModelId: 'o4-mini', contextWindow: 200000, inputCostPer1M: 1.1, outputCostPer1M: 4.4, capabilities: ['reasoning', 'fast', 'cost-effective'], tier: 'cost-effective', supportsTool: true, supportsThinking: true },
      { id: 'gpt-4-1', name: 'GPT-4.1', provider: 'openai', apiModelId: 'gpt-4.1', contextWindow: 128000, inputCostPer1M: 2, outputCostPer1M: 8, capabilities: ['code', 'web-dev', 'text'], tier: 'professional', supportsTool: true, supportsVision: true, supportsStreaming: true }
    ]
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    tier: 'Tier 1 - Premium',
    apiKeyEnv: 'GEMINI_API_KEY',
    baseUrl: 'https://generativelanguage.googleapis.com',
    isActive: true,
    supportedFeatures: ['chat', 'vision', 'grounding', 'code-execution', 'streaming', 'multimodal', 'thinking'],
    models: [
      { id: 'gemini-3-pro', name: 'Gemini 3 Pro', provider: 'gemini', apiModelId: 'gemini-3-pro', contextWindow: 2000000, inputCostPer1M: 2, outputCostPer1M: 10, capabilities: ['reasoning', 'multimodal', 'phd-level'], tier: 'premium', released: '2026-01', supportsTool: true, supportsVision: true, supportsStreaming: true, supportsThinking: true },
      { id: 'gemini-3-flash', name: 'Gemini 3 Flash', provider: 'gemini', apiModelId: 'gemini-3-flash', contextWindow: 1000000, inputCostPer1M: 0.15, outputCostPer1M: 0.6, capabilities: ['text', 'fast', 'multimodal'], tier: 'cost-effective', released: '2026-01', supportsTool: true, supportsVision: true, supportsStreaming: true, supportsThinking: true },
      { id: 'gemini-2-5-pro', name: 'Gemini 2.5 Pro', provider: 'gemini', apiModelId: 'gemini-2.5-pro', contextWindow: 1000000, inputCostPer1M: 1.25, outputCostPer1M: 5, capabilities: ['text', 'reasoning', 'code'], tier: 'professional', supportsTool: true, supportsVision: true, supportsStreaming: true, supportsThinking: true },
      { id: 'gemini-2-5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini', apiModelId: 'gemini-2.5-flash', contextWindow: 1000000, inputCostPer1M: 0.075, outputCostPer1M: 0.3, capabilities: ['text', 'vision', 'fast', 'cost-effective'], tier: 'cost-effective', isDefault: true, supportsTool: true, supportsVision: true, supportsStreaming: true },
      { id: 'gemini-2-5-flash-lite', name: 'Gemini 2.5 Flash-Lite', provider: 'gemini', apiModelId: 'gemini-2.5-flash-lite-preview', contextWindow: 1000000, inputCostPer1M: 0.02, outputCostPer1M: 0.1, capabilities: ['text', 'classification', 'translation', 'bulk'], tier: 'cost-effective', supportsStreaming: true }
    ]
  },
  {
    id: 'groq',
    name: 'Groq',
    tier: 'Tier 2 - Professional',
    apiKeyEnv: 'GROQ_API_KEY',
    baseUrl: 'https://api.groq.com',
    isActive: true,
    supportedFeatures: ['chat', 'streaming', 'ultra-fast-inference'],
    models: [
      { id: 'llama-4-maverick', name: 'Llama 4 Maverick', provider: 'groq', apiModelId: 'meta-llama/llama-4-maverick-17b-128e-instruct', contextWindow: 131072, inputCostPer1M: 0.2, outputCostPer1M: 0.6, capabilities: ['text', 'ultra-fast', 'multilingual'], tier: 'cost-effective', isDefault: true, supportsTool: true, supportsStreaming: true },
      { id: 'llama-4-scout', name: 'Llama 4 Scout', provider: 'groq', apiModelId: 'meta-llama/llama-4-scout-17b-16e-instruct', contextWindow: 131072, inputCostPer1M: 0.11, outputCostPer1M: 0.34, capabilities: ['text', 'fast', 'chat'], tier: 'cost-effective', supportsStreaming: true },
      { id: 'deepseek-r1-groq', name: 'DeepSeek R1 (Groq)', provider: 'groq', apiModelId: 'deepseek-r1-distill-llama-70b', contextWindow: 131072, inputCostPer1M: 0.75, outputCostPer1M: 0.99, capabilities: ['reasoning', 'math', 'code'], tier: 'professional', supportsStreaming: true, supportsThinking: true }
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    tier: 'Tier 2 - Professional',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    baseUrl: 'https://api.deepseek.com',
    isActive: true,
    supportedFeatures: ['chat', 'code', 'reasoning', 'streaming'],
    models: [
      { id: 'deepseek-r2', name: 'DeepSeek R2', provider: 'deepseek', apiModelId: 'deepseek-r2', contextWindow: 128000, inputCostPer1M: 0.55, outputCostPer1M: 2.19, capabilities: ['reasoning', 'code', 'math'], tier: 'cost-effective', isDefault: true, released: '2026-01', supportsTool: true, supportsStreaming: true, supportsThinking: true },
      { id: 'deepseek-v4', name: 'DeepSeek V4', provider: 'deepseek', apiModelId: 'deepseek-chat-v4', contextWindow: 128000, inputCostPer1M: 0.27, outputCostPer1M: 1.1, capabilities: ['text', 'code', 'fast'], tier: 'cost-effective', supportsTool: true, supportsStreaming: true }
    ]
  },
  {
    id: 'cohere',
    name: 'Cohere',
    tier: 'Tier 2 - Professional',
    apiKeyEnv: 'COHERE_API_KEY',
    baseUrl: 'https://api.cohere.ai',
    isActive: true,
    supportedFeatures: ['chat', 'embeddings', 'rerank', 'rag', 'streaming'],
    models: [
      { id: 'command-r-plus-2', name: 'Command R+ v2', provider: 'cohere', apiModelId: 'command-r-plus-v2', contextWindow: 128000, inputCostPer1M: 2.5, outputCostPer1M: 10, capabilities: ['text', 'rag', 'tool-use', 'multilingual'], tier: 'professional', isDefault: true, supportsTool: true, supportsStreaming: true },
      { id: 'command-r-2', name: 'Command R v2', provider: 'cohere', apiModelId: 'command-r-v2', contextWindow: 128000, inputCostPer1M: 0.15, outputCostPer1M: 0.6, capabilities: ['text', 'fast', 'rag'], tier: 'cost-effective', supportsStreaming: true },
      { id: 'embed-v4', name: 'Embed v4', provider: 'cohere', apiModelId: 'embed-english-v4.0', contextWindow: 512, inputCostPer1M: 0.1, outputCostPer1M: 0, capabilities: ['embeddings', 'search'], tier: 'specialized' },
      { id: 'rerank-v4', name: 'Rerank v4', provider: 'cohere', apiModelId: 'rerank-v4.0', contextWindow: 4096, inputCostPer1M: 2, outputCostPer1M: 0, capabilities: ['rerank', 'search-quality'], tier: 'specialized' }
    ]
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    tier: 'Tier 2 - Professional',
    apiKeyEnv: 'MISTRAL_API_KEY',
    baseUrl: 'https://api.mistral.ai',
    isActive: true,
    supportedFeatures: ['chat', 'code', 'streaming', 'function-calling'],
    models: [
      { id: 'mistral-large-3', name: 'Mistral Large 3', provider: 'mistral', apiModelId: 'mistral-large-3', contextWindow: 128000, inputCostPer1M: 2, outputCostPer1M: 6, capabilities: ['reasoning', 'code', 'multilingual'], tier: 'professional', isDefault: true, released: '2026-01', supportsTool: true, supportsStreaming: true },
      { id: 'codestral-2', name: 'Codestral 2', provider: 'mistral', apiModelId: 'codestral-2', contextWindow: 256000, inputCostPer1M: 0.3, outputCostPer1M: 0.9, capabilities: ['code', 'fill-in-middle', 'fast'], tier: 'cost-effective', released: '2026-01', supportsStreaming: true },
      { id: 'mistral-small-3', name: 'Mistral Small 3', provider: 'mistral', apiModelId: 'mistral-small-3', contextWindow: 128000, inputCostPer1M: 0.1, outputCostPer1M: 0.3, capabilities: ['text', 'fast', 'on-device'], tier: 'cost-effective', supportsStreaming: true }
    ]
  },
  {
    id: 'together',
    name: 'Together AI',
    tier: 'Tier 3 - Cost-Effective',
    apiKeyEnv: 'TOGETHER_API_KEY',
    baseUrl: 'https://api.together.xyz',
    isActive: true,
    supportedFeatures: ['chat', 'streaming', 'open-source-models'],
    models: [
      { id: 'llama-4-405b', name: 'Llama 4 405B', provider: 'together', apiModelId: 'meta-llama/Llama-4-405B-Instruct', contextWindow: 131072, inputCostPer1M: 0.8, outputCostPer1M: 0.8, capabilities: ['text', 'reasoning', 'multilingual'], tier: 'professional', isDefault: true, supportsTool: true, supportsStreaming: true },
      { id: 'qwen-3-235b', name: 'Qwen 3 235B', provider: 'together', apiModelId: 'Qwen/Qwen3-235B-A22B', contextWindow: 131072, inputCostPer1M: 0.2, outputCostPer1M: 0.6, capabilities: ['text', 'code', 'multilingual'], tier: 'cost-effective', supportsStreaming: true },
      { id: 'deepseek-r1-together', name: 'DeepSeek R1', provider: 'together', apiModelId: 'deepseek-ai/DeepSeek-R1', contextWindow: 131072, inputCostPer1M: 0.55, outputCostPer1M: 2.19, capabilities: ['reasoning', 'math'], tier: 'cost-effective', supportsStreaming: true, supportsThinking: true }
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    tier: 'Tier 3 - Cost-Effective',
    apiKeyEnv: 'OPENROUTER_API_KEY',
    baseUrl: 'https://openrouter.ai/api',
    isActive: true,
    supportedFeatures: ['chat', 'streaming', 'model-routing', 'free-models'],
    models: [
      { id: 'or-auto', name: 'Auto Router', provider: 'openrouter', apiModelId: 'openrouter/auto', contextWindow: 128000, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ['auto-routing', 'fallback'], tier: 'cost-effective', isDefault: true, supportsStreaming: true },
      { id: 'or-kimi-k2-5', name: 'Kimi K2.5', provider: 'openrouter', apiModelId: 'moonshotai/kimi-k2.5', contextWindow: 131072, inputCostPer1M: 0.14, outputCostPer1M: 0.55, capabilities: ['text', 'code', 'cost-effective'], tier: 'cost-effective', supportsStreaming: true },
      { id: 'or-llama-4-free', name: 'Llama 4 (Free)', provider: 'openrouter', apiModelId: 'meta-llama/llama-4-maverick:free', contextWindow: 131072, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ['text', 'free', 'bulk'], tier: 'cost-effective', supportsStreaming: true }
    ]
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    tier: 'Tier 2 - Professional',
    apiKeyEnv: 'PERPLEXITY_API_KEY',
    baseUrl: 'https://api.perplexity.ai',
    isActive: true,
    supportedFeatures: ['chat', 'web-search', 'citations', 'streaming'],
    models: [
      { id: 'sonar-pro', name: 'Sonar Pro', provider: 'perplexity', apiModelId: 'sonar-pro', contextWindow: 200000, inputCostPer1M: 3, outputCostPer1M: 15, capabilities: ['search', 'citations', 'reasoning'], tier: 'professional', isDefault: true, supportsStreaming: true },
      { id: 'sonar', name: 'Sonar', provider: 'perplexity', apiModelId: 'sonar', contextWindow: 128000, inputCostPer1M: 1, outputCostPer1M: 1, capabilities: ['search', 'citations', 'fast'], tier: 'cost-effective', supportsStreaming: true }
    ]
  },
  {
    id: 'xai',
    name: 'xAI',
    tier: 'Tier 2 - Professional',
    apiKeyEnv: 'XAI_API_KEY',
    baseUrl: 'https://api.x.ai',
    isActive: true,
    supportedFeatures: ['chat', 'streaming', 'real-time-data'],
    models: [
      { id: 'grok-3', name: 'Grok 3', provider: 'xai', apiModelId: 'grok-3', contextWindow: 131072, inputCostPer1M: 3, outputCostPer1M: 15, capabilities: ['reasoning', 'real-time', 'humor'], tier: 'professional', isDefault: true, supportsTool: true, supportsStreaming: true },
      { id: 'grok-3-mini', name: 'Grok 3 Mini', provider: 'xai', apiModelId: 'grok-3-mini', contextWindow: 131072, inputCostPer1M: 0.3, outputCostPer1M: 0.5, capabilities: ['text', 'fast', 'cost-effective'], tier: 'cost-effective', supportsStreaming: true }
    ]
  },
  {
    id: 'sarvam',
    name: 'Sarvam AI',
    tier: 'Tier 4 - Specialized',
    apiKeyEnv: 'SARVAM_API_KEY',
    baseUrl: 'https://api.sarvam.ai',
    isActive: true,
    supportedFeatures: ['chat', 'translation', 'stt', 'tts', 'indian-languages'],
    models: [
      { id: 'saaras-v3', name: 'Saaras v3', provider: 'sarvam', apiModelId: 'saaras-v3', contextWindow: 32000, inputCostPer1M: 0.5, outputCostPer1M: 1.5, capabilities: ['indian-languages', 'translation', 'chat'], tier: 'specialized', isDefault: true, supportsStreaming: true },
      { id: 'saarika-v3', name: 'Saarika v3 (STT)', provider: 'sarvam', apiModelId: 'saarika-v3', contextWindow: 0, inputCostPer1M: 0.8, outputCostPer1M: 0, capabilities: ['speech-to-text', 'indian-languages'], tier: 'specialized' },
      { id: 'bulbul-v2', name: 'Bulbul v2 (TTS)', provider: 'sarvam', apiModelId: 'bulbul-v2', contextWindow: 0, inputCostPer1M: 0, outputCostPer1M: 1.2, capabilities: ['text-to-speech', 'indian-languages'], tier: 'specialized' }
    ]
  },
  {
    id: 'zhipu',
    name: 'Zhipu AI',
    tier: 'Tier 3 - Cost-Effective',
    apiKeyEnv: 'ZHIPU_API_KEY',
    baseUrl: 'https://open.bigmodel.cn/api',
    isActive: true,
    supportedFeatures: ['chat', 'streaming', 'chinese-optimization'],
    models: [
      { id: 'glm-5', name: 'GLM-5', provider: 'zhipu', apiModelId: 'glm-5', contextWindow: 128000, inputCostPer1M: 0.5, outputCostPer1M: 0.5, capabilities: ['text', 'chinese', 'multilingual'], tier: 'cost-effective', isDefault: true, supportsStreaming: true },
      { id: 'glm-5-plus', name: 'GLM-5 Plus', provider: 'zhipu', apiModelId: 'glm-5-plus', contextWindow: 128000, inputCostPer1M: 1, outputCostPer1M: 1, capabilities: ['reasoning', 'chinese', 'code'], tier: 'professional', supportsStreaming: true }
    ]
  },
  {
    id: 'replicate',
    name: 'Replicate',
    tier: 'Tier 3 - Cost-Effective',
    apiKeyEnv: 'REPLICATE_API_KEY',
    baseUrl: 'https://api.replicate.com',
    isActive: true,
    supportedFeatures: ['image-generation', 'video-generation', 'audio', 'streaming'],
    models: [
      { id: 'flux-1-1-pro', name: 'FLUX 1.1 Pro', provider: 'replicate', apiModelId: 'black-forest-labs/flux-1.1-pro', contextWindow: 0, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ['image-generation', 'high-quality'], tier: 'specialized' },
      { id: 'sdxl-turbo', name: 'SDXL Turbo', provider: 'replicate', apiModelId: 'stability-ai/sdxl-turbo', contextWindow: 0, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ['image-generation', 'fast'], tier: 'cost-effective' }
    ]
  },
  {
    id: 'fireworks',
    name: 'Fireworks AI',
    tier: 'Tier 3 - Cost-Effective',
    apiKeyEnv: 'FIREWORKS_API_KEY',
    baseUrl: 'https://api.fireworks.ai',
    isActive: true,
    supportedFeatures: ['chat', 'streaming', 'fast-inference'],
    models: [
      { id: 'fw-llama-4-70b', name: 'Llama 4 70B (Fireworks)', provider: 'fireworks', apiModelId: 'accounts/fireworks/models/llama-4-70b-instruct', contextWindow: 131072, inputCostPer1M: 0.2, outputCostPer1M: 0.2, capabilities: ['text', 'fast', 'cost-effective'], tier: 'cost-effective', isDefault: true, supportsStreaming: true }
    ]
  },
  {
    id: 'huggingface',
    name: 'HuggingFace',
    tier: 'Tier 3 - Cost-Effective',
    apiKeyEnv: 'HUGGINGFACE_API_KEY',
    baseUrl: 'https://api-inference.huggingface.co',
    isActive: true,
    supportedFeatures: ['chat', 'embeddings', 'open-source'],
    models: [
      { id: 'hf-qwen-3-72b', name: 'Qwen 3 72B', provider: 'huggingface', apiModelId: 'Qwen/Qwen3-72B', contextWindow: 131072, inputCostPer1M: 0.1, outputCostPer1M: 0.1, capabilities: ['text', 'code', 'open-source'], tier: 'cost-effective', isDefault: true, supportsStreaming: true }
    ]
  },
  {
    id: 'aws-bedrock',
    name: 'AWS Bedrock',
    tier: 'Tier 1 - Premium',
    apiKeyEnv: 'AWS_ACCESS_KEY_ID',
    isActive: true,
    supportedFeatures: ['chat', 'embeddings', 'enterprise', 'guardrails'],
    models: [
      { id: 'bedrock-claude-opus-4-6', name: 'Claude Opus 4.6 (Bedrock)', provider: 'aws-bedrock', apiModelId: 'anthropic.claude-opus-4-6-v1', contextWindow: 200000, inputCostPer1M: 15, outputCostPer1M: 75, capabilities: ['reasoning', 'enterprise', 'guardrails'], tier: 'premium', isDefault: true, supportsTool: true, supportsVision: true, supportsStreaming: true }
    ]
  },
  {
    id: 'azure-openai',
    name: 'Azure OpenAI',
    tier: 'Tier 1 - Premium',
    apiKeyEnv: 'AZURE_OPENAI_API_KEY',
    isActive: true,
    supportedFeatures: ['chat', 'embeddings', 'enterprise', 'content-safety'],
    models: [
      { id: 'azure-gpt-5-2', name: 'GPT-5.2 (Azure)', provider: 'azure-openai', apiModelId: 'gpt-5.2', contextWindow: 272000, inputCostPer1M: 1.75, outputCostPer1M: 14, capabilities: ['reasoning', 'enterprise', 'compliance'], tier: 'premium', isDefault: true, supportsTool: true, supportsVision: true, supportsStreaming: true }
    ]
  },
  {
    id: 'vertex-ai',
    name: 'Google Vertex AI',
    tier: 'Tier 1 - Premium',
    apiKeyEnv: 'GOOGLE_CLOUD_API_KEY',
    isActive: true,
    supportedFeatures: ['chat', 'embeddings', 'enterprise', 'grounding'],
    models: [
      { id: 'vertex-gemini-3-pro', name: 'Gemini 3 Pro (Vertex)', provider: 'vertex-ai', apiModelId: 'gemini-3-pro', contextWindow: 2000000, inputCostPer1M: 2, outputCostPer1M: 10, capabilities: ['reasoning', 'enterprise', 'grounding'], tier: 'premium', isDefault: true, supportsTool: true, supportsVision: true, supportsStreaming: true, supportsThinking: true }
    ]
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    tier: 'Tier 4 - Specialized',
    apiKeyEnv: '',
    baseUrl: 'http://localhost:11434',
    isActive: false,
    supportedFeatures: ['chat', 'local', 'privacy'],
    models: [
      { id: 'ollama-llama-4', name: 'Llama 4 (Local)', provider: 'ollama', apiModelId: 'llama4', contextWindow: 131072, inputCostPer1M: 0, outputCostPer1M: 0, capabilities: ['text', 'local', 'privacy'], tier: 'specialized', isDefault: true, supportsStreaming: true }
    ]
  },
  {
    id: 'moonshot',
    name: 'Moonshot AI (Kimi)',
    tier: 'Tier 3 - Cost-Effective',
    apiKeyEnv: 'MOONSHOT_API_KEY',
    baseUrl: 'https://api.moonshot.cn',
    isActive: true,
    supportedFeatures: ['chat', 'long-context', 'streaming'],
    models: [
      { id: 'kimi-k2-5', name: 'Kimi K2.5', provider: 'moonshot', apiModelId: 'kimi-k2.5', contextWindow: 131072, inputCostPer1M: 0.14, outputCostPer1M: 0.55, capabilities: ['text', 'code', 'long-context', 'cost-effective'], tier: 'cost-effective', isDefault: true, supportsStreaming: true }
    ]
  },
  {
    id: 'anyscale',
    name: 'Anyscale',
    tier: 'Tier 3 - Cost-Effective',
    apiKeyEnv: 'ANYSCALE_API_KEY',
    baseUrl: 'https://api.endpoints.anyscale.com',
    isActive: true,
    supportedFeatures: ['chat', 'streaming', 'fine-tuning'],
    models: [
      { id: 'anyscale-llama-4-70b', name: 'Llama 4 70B (Anyscale)', provider: 'anyscale', apiModelId: 'meta-llama/Llama-4-70b-chat-hf', contextWindow: 131072, inputCostPer1M: 0.15, outputCostPer1M: 0.15, capabilities: ['text', 'fast', 'fine-tunable'], tier: 'cost-effective', isDefault: true, supportsStreaming: true }
    ]
  },
  {
    id: 'sambanova',
    name: 'SambaNova',
    tier: 'Tier 3 - Cost-Effective',
    apiKeyEnv: 'SAMBANOVA_API_KEY',
    baseUrl: 'https://api.sambanova.ai',
    isActive: true,
    supportedFeatures: ['chat', 'streaming', 'ultra-fast'],
    models: [
      { id: 'samba-llama-4-405b', name: 'Llama 4 405B (SambaNova)', provider: 'sambanova', apiModelId: 'Meta-Llama-4-405B-Instruct', contextWindow: 131072, inputCostPer1M: 0.1, outputCostPer1M: 0.1, capabilities: ['text', 'ultra-fast', 'bulk'], tier: 'cost-effective', isDefault: true, supportsStreaming: true }
    ]
  },
  {
    id: 'cerebras',
    name: 'Cerebras',
    tier: 'Tier 3 - Cost-Effective',
    apiKeyEnv: 'CEREBRAS_API_KEY',
    baseUrl: 'https://api.cerebras.ai',
    isActive: true,
    supportedFeatures: ['chat', 'streaming', 'fastest-inference'],
    models: [
      { id: 'cerebras-llama-4-70b', name: 'Llama 4 70B (Cerebras)', provider: 'cerebras', apiModelId: 'llama-4-70b', contextWindow: 131072, inputCostPer1M: 0.1, outputCostPer1M: 0.1, capabilities: ['text', 'fastest-inference', 'bulk'], tier: 'cost-effective', isDefault: true, supportsStreaming: true }
    ]
  }
];

export const MODEL_ROUTING = {
  complexReasoning: { primary: 'claude-opus-4-6', fallback: 'gpt-5-2-pro', budget: 'gemini-3-pro' },
  contentGeneration: { primary: 'claude-sonnet-5-0', fallback: 'gpt-5-2', budget: 'gemini-2-5-flash' },
  quickResponses: { primary: 'gemini-3-flash', fallback: 'gpt-5-2-instant', budget: 'kimi-k2-5' },
  bulkProcessing: { primary: 'kimi-k2-5', fallback: 'or-llama-4-free', budget: 'gemini-2-5-flash-lite' },
  indianLanguages: { primary: 'saaras-v3', fallback: 'gemini-2-5-flash', budget: 'kimi-k2-5' },
  codeGeneration: { primary: 'gpt-5-2-codex', fallback: 'claude-sonnet-5-0', budget: 'codestral-2' },
  searchResearch: { primary: 'sonar-pro', fallback: 'grok-3', budget: 'sonar' },
  visualAnalysis: { primary: 'claude-opus-4-6', fallback: 'gpt-5-2', budget: 'gemini-2-5-flash' },
  seoOptimization: { primary: 'claude-sonnet-5-0', fallback: 'gpt-5-2', budget: 'deepseek-r2' },
  socialMedia: { primary: 'claude-sonnet-5-0', fallback: 'gpt-5-2-instant', budget: 'gemini-3-flash' },
  adCopywriting: { primary: 'claude-opus-4-6', fallback: 'gpt-5-2', budget: 'claude-sonnet-5-0' },
  leadScoring: { primary: 'gpt-5-2', fallback: 'claude-sonnet-5-0', budget: 'deepseek-r2' },
  crisisManagement: { primary: 'claude-opus-4-6', fallback: 'gpt-5-2-pro', budget: 'claude-sonnet-5-0' },
  whatsappAutomation: { primary: 'gemini-3-flash', fallback: 'gpt-5-2-instant', budget: 'kimi-k2-5' },
  emailCampaigns: { primary: 'claude-sonnet-5-0', fallback: 'gpt-5-2', budget: 'gemini-2-5-flash' },
  reportGeneration: { primary: 'claude-opus-4-6', fallback: 'gpt-5-2', budget: 'gemini-2-5-pro' },
  translation: { primary: 'saaras-v3', fallback: 'gemini-2-5-flash', budget: 'command-r-2' },
  brandAnalysis: { primary: 'claude-opus-4-6', fallback: 'gpt-5-2', budget: 'claude-sonnet-5-0' }
};

export const AGENT_MODEL_DEFAULTS = {
  tier1_critical: { primary: 'claude-opus-4-6', fallback: 'gpt-5-2-pro' },
  tier2_standard: { primary: 'claude-sonnet-5-0', fallback: 'gpt-5-2' },
  tier3_routine: { primary: 'gemini-3-flash', fallback: 'gpt-5-2-instant' },
  tier4_bulk: { primary: 'kimi-k2-5', fallback: 'or-llama-4-free' }
};

export const VERTICAL_MODEL_ASSIGNMENTS: Record<string, { primary: string; fallback: string; routine: string }> = {
  social: { primary: 'claude-sonnet-5-0', fallback: 'gpt-5-2', routine: 'gemini-3-flash' },
  seo: { primary: 'claude-sonnet-5-0', fallback: 'gpt-5-2', routine: 'deepseek-r2' },
  web: { primary: 'gpt-5-2-codex', fallback: 'claude-sonnet-5-0', routine: 'codestral-2' },
  sales: { primary: 'claude-opus-4-6', fallback: 'gpt-5-2', routine: 'gemini-3-flash' },
  whatsapp: { primary: 'gemini-3-flash', fallback: 'gpt-5-2-instant', routine: 'kimi-k2-5' },
  linkedin: { primary: 'claude-sonnet-5-0', fallback: 'gpt-5-2', routine: 'gemini-3-flash' },
  performance: { primary: 'claude-opus-4-6', fallback: 'gpt-5-2', routine: 'deepseek-r2' },
  pr: { primary: 'claude-opus-4-6', fallback: 'gpt-5-2-pro', routine: 'claude-sonnet-5-0' }
};

export function getProviderById(id: string): LLMProvider | undefined {
  return LLM_PROVIDERS.find(p => p.id === id);
}

export function getModelById(modelId: string): LLMModel | undefined {
  for (const provider of LLM_PROVIDERS) {
    const model = provider.models.find(m => m.id === modelId);
    if (model) return model;
  }
  return undefined;
}

export function getModelsByCapability(capability: string): LLMModel[] {
  const models: LLMModel[] = [];
  for (const provider of LLM_PROVIDERS) {
    for (const model of provider.models) {
      if (model.capabilities.includes(capability)) {
        models.push(model);
      }
    }
  }
  return models;
}

export function getModelsByTier(tier: LLMModel['tier']): LLMModel[] {
  const models: LLMModel[] = [];
  for (const provider of LLM_PROVIDERS) {
    for (const model of provider.models) {
      if (model.tier === tier) models.push(model);
    }
  }
  return models;
}

export function getAllModels(): LLMModel[] {
  return LLM_PROVIDERS.flatMap(p => p.models);
}

export function getActiveProviders(): LLMProvider[] {
  return LLM_PROVIDERS.filter(p => p.isActive);
}

export function getTotalModelCount(): number {
  return LLM_PROVIDERS.reduce((sum, p) => sum + p.models.length, 0);
}

export function getModelForTask(taskType: keyof typeof MODEL_ROUTING, costPriority: 'quality' | 'balanced' | 'budget' = 'balanced'): string {
  const routing = MODEL_ROUTING[taskType];
  if (!routing) return AGENT_MODEL_DEFAULTS.tier2_standard.primary;
  
  switch (costPriority) {
    case 'quality': return routing.primary;
    case 'budget': return routing.budget;
    default: return routing.fallback;
  }
}

export function getVerticalModels(verticalId: string): { primary: string; fallback: string; routine: string } {
  return VERTICAL_MODEL_ASSIGNMENTS[verticalId] || VERTICAL_MODEL_ASSIGNMENTS.social;
}

export const PLATFORM_STATS = {
  totalProviders: LLM_PROVIDERS.length,
  totalModels: 886,
  totalAgents: 285,
  totalVerticals: 8,
  totalLanguages: 22,
  waiSdkVersion: 'v3.2.0',
  platformVersion: '3.2.0',
  lastUpdated: '2026-02-07'
};

export const TWENTY_TWO_POINT_AGENT_FRAMEWORK = [
  'Autonomous Execution',
  'Guardrails & Safety',
  'Self-Learning (GRPO)',
  'Capability Awareness',
  'Multi-Agent Collaboration',
  'Parallel Execution',
  'Swarm Coordination',
  'LLM Intelligence Routing',
  'Context Engineering',
  'Multimodal Processing',
  'Hierarchical Orchestration',
  'Multi-Language Support',
  'Behavioral Intelligence',
  'Cost Optimization',
  'Persistent Memory (Mem0)',
  'Tool Use & MCP',
  'Error Recovery & Retry',
  'Real-time Monitoring (CAM)',
  'Security & RBAC',
  'Audit Logging',
  'Version Control & Rollback',
  'Continuous Learning'
];
