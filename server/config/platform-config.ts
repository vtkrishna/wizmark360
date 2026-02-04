/**
 * Centralized Platform Configuration
 * WAI-SDK v3.1.1 compliant - All settings externalized via environment variables
 */

export const platformConfig = {
  version: '5.0.0',
  waiSdkVersion: '3.1.1',
  
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000',
  },
  
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['*'],
    credentials: true,
  },
  
  database: {
    url: process.env.DATABASE_URL,
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
  },
  
  session: {
    secret: process.env.SESSION_SECRET || 'default-dev-secret-change-in-production',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10),
    secure: process.env.NODE_ENV === 'production',
  },
  
  agents: {
    registryPath: process.env.AGENTS_REGISTRY_PATH || './data/marketing-agents-registry.json',
    totalAgents: 267,
    verticals: 7,
    romaLevels: 5,
  },
  
  llm: {
    defaultProvider: process.env.DEFAULT_LLM_PROVIDER || 'openai',
    defaultModel: process.env.DEFAULT_LLM_MODEL || 'gpt-4o-mini',
    costOptimization: {
      enabled: process.env.COST_OPTIMIZATION_ENABLED !== 'false',
      budgetModel: process.env.BUDGET_MODEL || 'moonshot-ai/kimi-k2-instruct',
      budgetTier: 'kimi-k2',
    },
    providers: {
      openai: { apiKey: process.env.OPENAI_API_KEY },
      anthropic: { apiKey: process.env.ANTHROPIC_API_KEY },
      gemini: { apiKey: process.env.GEMINI_API_KEY },
      groq: { apiKey: process.env.GROQ_API_KEY },
      cohere: { apiKey: process.env.COHERE_API_KEY },
      sarvam: { apiKey: process.env.SARVAM_API_KEY },
      together: { apiKey: process.env.TOGETHER_API_KEY },
      openrouter: { apiKey: process.env.OPENROUTER_API_KEY },
      zhipu: { apiKey: process.env.ZHIPU_API_KEY },
    },
    tiers: {
      premium: ['claude-3-5-sonnet-20241022', 'gpt-4o', 'gemini-2.0-flash-thinking-exp'],
      standard: ['gpt-4o-mini', 'claude-3-haiku-20240307', 'gemini-1.5-flash'],
      budget: ['moonshot-ai/kimi-k2-instruct', 'meta-llama/llama-3.1-8b-instruct'],
      free: ['gemma-7b-it', 'mixtral-8x7b-32768'],
    },
  },
  
  oauth: {
    callbackUrl: process.env.CALLBACK_URL || process.env.BASE_URL || 'http://localhost:5000',
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    },
    meta: {
      appId: process.env.META_APP_ID,
      appSecret: process.env.META_APP_SECRET,
    },
  },
  
  services: {
    whatsapp: {
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    },
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET,
    },
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN,
    },
    email: {
      smtpHost: process.env.SMTP_HOST,
      smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS,
    },
  },
  
  features: {
    multiLanguage: {
      enabled: true,
      supportedLanguages: 22,
      defaultLanguage: 'en',
    },
    voiceAgents: {
      enabled: process.env.SARVAM_API_KEY ? true : false,
      sttModel: 'saarika:v2',
      ttsModel: 'bulbul:v1',
    },
    predictiveAnalytics: {
      enabled: true,
      refreshInterval: parseInt(process.env.ANALYTICS_REFRESH_INTERVAL || '300000', 10),
    },
    digitalTwins: {
      enabled: true,
      maxTwins: parseInt(process.env.MAX_DIGITAL_TWINS || '100', 10),
    },
  },
  
  security: {
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    },
    encryption: {
      algorithm: 'aes-256-gcm',
      enabled: process.env.ENCRYPTION_ENABLED !== 'false',
    },
    audit: {
      enabled: process.env.AUDIT_LOGGING !== 'false',
    },
  },
};

export function getProviderApiKey(provider: string): string | undefined {
  const providers = platformConfig.llm.providers as Record<string, { apiKey?: string }>;
  return providers[provider]?.apiKey;
}

export function isServiceConfigured(service: keyof typeof platformConfig.services): boolean {
  const svc = platformConfig.services[service] as Record<string, unknown>;
  return Object.values(svc).some(val => val !== undefined && val !== null && val !== '');
}

export function getLLMTier(model: string): 'premium' | 'standard' | 'budget' | 'free' {
  const { tiers } = platformConfig.llm;
  if (tiers.premium.includes(model)) return 'premium';
  if (tiers.standard.includes(model)) return 'standard';
  if (tiers.budget.includes(model)) return 'budget';
  return 'free';
}

export default platformConfig;
