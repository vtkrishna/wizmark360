import { Router, Request, Response } from "express";
import { enhancedAIService, AIProvider, SupportedLanguage, INDIAN_LANGUAGES, LLM_REGISTRY, MODEL_TIERS } from "../services/enhanced-ai-service";
import { waiOrchestration } from "../services/wai-sdk-orchestration";
import { ALL_AGENTS, TIER_DEFINITIONS, JURISDICTION_REGULATIONS, getAgentsByCategory, getAgentsByTier, getAgentById, generateSystemPrompt } from "../services/agent-system-prompts";
import { db } from "../db";
import { campaigns, leads, socialPosts, performanceAds } from "@shared/schema";
import { desc, eq, sql } from "drizzle-orm";

const router = Router();

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message, provider, language } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const [campaignStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(campaigns)
      .where(eq(campaigns.status, "active"));

    const [leadStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads);

    const [postStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(socialPosts)
      .where(eq(socialPosts.status, "scheduled"));

    const [adStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(performanceAds)
      .where(eq(performanceAds.status, "active"));

    const result = await enhancedAIService.chiefOfStaffMultilingualChat(
      message,
      {
        activeCampaigns: Number(campaignStats?.count) || 0,
        totalLeads: Number(leadStats?.count) || 0,
        scheduledPosts: Number(postStats?.count) || 0,
        runningAds: Number(adStats?.count) || 0,
      },
      provider || "openai",
      language || "en"
    );

    res.json({ 
      response: result.response, 
      translatedResponse: result.translatedResponse,
      voiceUrl: result.voiceUrl,
      provider: provider || "openai",
      language: language || "en"
    });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

router.post("/generate-content", async (req: Request, res: Response) => {
  try {
    const { type, brand, industry, targetAudience, tone, topic, platform, language, provider } = req.body;

    if (!type || !brand || !topic) {
      return res.status(400).json({ error: "Type, brand, and topic are required" });
    }

    const result = await enhancedAIService.generateMultilingualContent(
      type,
      {
        brand,
        industry: industry || "general",
        targetAudience: targetAudience || "general audience",
        tone: tone || "professional",
        topic,
        platform,
      },
      language || "en",
      provider
    );

    res.json({ 
      content: result.content, 
      translatedContent: result.translatedContent,
      type,
      language: language || "en"
    });
  } catch (error) {
    console.error("Content generation error:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

router.post("/translate", async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: "Text and target language are required" });
    }

    const translated = await enhancedAIService.translateToIndianLanguage(
      text,
      targetLanguage as SupportedLanguage
    );

    res.json({ 
      original: text, 
      translated,
      targetLanguage,
      languageName: INDIAN_LANGUAGES[targetLanguage as SupportedLanguage]?.name
    });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Failed to translate" });
  }
});

router.post("/text-to-speech", async (req: Request, res: Response) => {
  try {
    const { text, language } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const audioUrl = await enhancedAIService.textToSpeech(
      text,
      language || "hi"
    );

    res.json({ audioUrl, language: language || "hi" });
  } catch (error) {
    console.error("TTS error:", error);
    res.status(500).json({ error: "Failed to generate speech" });
  }
});

router.post("/speech-to-text", async (req: Request, res: Response) => {
  try {
    const { audio, language } = req.body;

    if (!audio) {
      return res.status(400).json({ error: "Audio data is required" });
    }

    const audioBuffer = Buffer.from(audio, "base64");
    const result = await enhancedAIService.speechToText(audioBuffer, language);

    res.json(result);
  } catch (error) {
    console.error("STT error:", error);
    res.status(500).json({ error: "Failed to transcribe speech" });
  }
});

router.post("/score-lead", async (req: Request, res: Response) => {
  try {
    const { leadId, name, email, company, source, industry } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const response = await enhancedAIService.chat(
      [
        {
          role: "system",
          content: `You are an expert sales lead qualification AI. Analyze leads and provide:
1. A score from 0-100 based on likelihood to convert
2. A qualification status (hot/warm/cold)
3. Reasoning for your assessment
4. 3 suggested follow-up actions

Respond in JSON format:
{
  "score": number,
  "qualification": "hot" | "warm" | "cold",
  "reasoning": "string",
  "suggestedActions": ["action1", "action2", "action3"]
}`,
        },
        {
          role: "user",
          content: `Analyze this lead:
Name: ${name}
Email: ${email}
Company: ${company || "Unknown"}
Source: ${source || "website"}
Industry: ${industry || "Unknown"}`,
        },
      ],
      "anthropic"
    );

    let result;
    try {
      result = JSON.parse(response.content);
    } catch {
      result = {
        score: 50,
        qualification: "warm",
        reasoning: response.content,
        suggestedActions: [
          "Send introductory email",
          "Schedule discovery call",
          "Share relevant case studies",
        ],
      };
    }

    if (leadId) {
      await db
        .update(leads)
        .set({
          score: result.score,
          status: result.qualification === "hot" ? "qualified" : result.qualification === "warm" ? "contacted" : "new",
        })
        .where(eq(leads.id, leadId));
    }

    res.json(result);
  } catch (error) {
    console.error("Lead scoring error:", error);
    res.status(500).json({ error: "Failed to score lead" });
  }
});

router.post("/analyze-performance", async (req: Request, res: Response) => {
  try {
    const { impressions, clicks, conversions, spend, revenue, campaignType } = req.body;

    const response = await enhancedAIService.chat(
      [
        {
          role: "system",
          content: `You are a performance marketing analyst. Analyze campaign metrics and provide actionable insights.
Respond in JSON format:
{
  "insights": ["insight1", "insight2", "insight3"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "riskAreas": ["risk1", "risk2"]
}`,
        },
        {
          role: "user",
          content: `Analyze this ${campaignType || "marketing"} campaign:
Impressions: ${(impressions || 0).toLocaleString()}
Clicks: ${(clicks || 0).toLocaleString()}
Conversions: ${conversions || 0}
Spend: $${(spend || 0).toFixed(2)}
Revenue: $${(revenue || 0).toFixed(2)}`,
        },
      ],
      "gemini"
    );

    let analysis;
    try {
      analysis = JSON.parse(response.content);
    } catch {
      analysis = {
        insights: ["Analysis completed"],
        recommendations: ["Continue monitoring performance"],
        riskAreas: [],
      };
    }

    res.json(analysis);
  } catch (error) {
    console.error("Performance analysis error:", error);
    res.status(500).json({ error: "Failed to analyze performance" });
  }
});

router.get("/providers", async (_req: Request, res: Response) => {
  const providers = enhancedAIService.getAvailableProviders();
  res.json(providers);
});

router.get("/models", async (req: Request, res: Response) => {
  const { provider } = req.query;
  const models = enhancedAIService.getAvailableModels(provider as AIProvider);
  res.json(models);
});

router.get("/models/multilingual", async (_req: Request, res: Response) => {
  const models = enhancedAIService.getMultilingualModels();
  res.json(models);
});

router.get("/models/indian", async (_req: Request, res: Response) => {
  const models = enhancedAIService.getIndianLanguageModels();
  res.json(models);
});

router.get("/languages", async (_req: Request, res: Response) => {
  const languages = enhancedAIService.getSupportedLanguages();
  res.json(languages);
});

router.get("/stats", async (_req: Request, res: Response) => {
  const modelStats = enhancedAIService.getModelStats();
  const agentStats = enhancedAIService.getAgentStats();
  
  res.json({
    ...modelStats,
    ...agentStats,
    orchestrationLevels: {
      L0: { name: "Reactive", status: "active", agents: 45 },
      L1: { name: "Proactive", status: "active", agents: 67 },
      L2: { name: "Autonomous", status: "active", agents: 89 },
      L3: { name: "Collaborative", status: "active", agents: 44 },
      L4: { name: "Self-Evolving", status: "experimental", agents: 22 },
    },
    voiceCapabilities: {
      speechToText: true,
      textToSpeech: true,
      voiceAgents: true,
      whatsAppVoice: true,
      supportedLanguages: 12,
    },
    mcpIntegrations: {
      whatsapp: { status: "active", endpoints: 8 },
      voice: { status: "active", endpoints: 4 },
      collaborative: { status: "active", endpoints: 12 },
      tools: { status: "active", registered: 156 },
    },
  });
});

router.get("/registry/full", async (_req: Request, res: Response) => {
  res.json({
    providers: enhancedAIService.getAvailableProviders(),
    models: LLM_REGISTRY,
    languages: INDIAN_LANGUAGES,
    stats: enhancedAIService.getModelStats(),
    agentStats: enhancedAIService.getAgentStats(),
  });
});

router.get("/tiers", async (_req: Request, res: Response) => {
  const tiers = enhancedAIService.getModelTiers();
  res.json(tiers);
});

router.post("/analyze-task", async (req: Request, res: Response) => {
  try {
    const { task, requirements } = req.body;
    
    if (!task) {
      return res.status(400).json({ error: "Task description is required" });
    }
    
    const analysis = enhancedAIService.analyzeTaskComplexity(task, requirements);
    res.json({
      task,
      analysis,
      tierInfo: enhancedAIService.getModelTiers()[analysis.recommendedTier],
    });
  } catch (error) {
    console.error("Task analysis error:", error);
    res.status(500).json({ error: "Failed to analyze task" });
  }
});

router.post("/smart-route", async (req: Request, res: Response) => {
  try {
    const { message, taskDescription, requirements } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    const result = await enhancedAIService.smartRoute(
      [{ role: "user", content: message }],
      taskDescription,
      requirements
    );
    
    res.json({
      response: result.content,
      provider: result.provider,
      model: result.model,
      tokensUsed: result.tokensUsed,
    });
  } catch (error) {
    console.error("Smart route error:", error);
    res.status(500).json({ error: "Failed to process smart route" });
  }
});

router.get("/wai-sdk/agents", async (_req: Request, res: Response) => {
  try {
    const registry = waiOrchestration.getAgentRegistry();
    res.json({
      totalAgents: ALL_AGENTS.length,
      agents: ALL_AGENTS.map(a => ({
        id: a.identity.id,
        name: a.identity.name,
        category: a.identity.category,
        tier: a.identity.tier,
        mission: a.identity.mission
      })),
      categories: registry.categories,
      tiers: registry.tiers
    });
  } catch (error) {
    console.error("WAI agents error:", error);
    res.status(500).json({ error: "Failed to get agents" });
  }
});

router.get("/wai-sdk/agents/:agentId", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const agent = getAgentById(agentId);
    
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }
    
    res.json({
      agent,
      systemPrompt: generateSystemPrompt(agent)
    });
  } catch (error) {
    console.error("WAI agent error:", error);
    res.status(500).json({ error: "Failed to get agent" });
  }
});

router.get("/wai-sdk/agents/category/:category", async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const agents = getAgentsByCategory(category as any);
    
    res.json({
      category,
      count: agents.length,
      agents: agents.map(a => ({
        id: a.identity.id,
        name: a.identity.name,
        tier: a.identity.tier,
        mission: a.identity.mission,
        skills: a.capabilities.skills
      }))
    });
  } catch (error) {
    console.error("WAI category agents error:", error);
    res.status(500).json({ error: "Failed to get agents by category" });
  }
});

router.get("/wai-sdk/stats", async (_req: Request, res: Response) => {
  try {
    const stats = waiOrchestration.getOrchestrationStats();
    res.json(stats);
  } catch (error) {
    console.error("WAI stats error:", error);
    res.status(500).json({ error: "Failed to get orchestration stats" });
  }
});

router.post("/wai-sdk/execute", async (req: Request, res: Response) => {
  try {
    const { type, vertical, description, priority, capabilities, jurisdictions, language, context, constraints } = req.body;
    
    if (!vertical || !description) {
      return res.status(400).json({ error: "Vertical and description are required" });
    }
    
    const task = {
      id: `task-${Date.now()}`,
      type: type || "generation",
      vertical,
      description,
      priority: priority || "medium",
      requiredCapabilities: capabilities || [],
      targetJurisdictions: jurisdictions || ["global"],
      language: language || "en",
      context: context || {},
      constraints
    };
    
    const result = await waiOrchestration.executeTask(task);
    res.json(result);
  } catch (error) {
    console.error("WAI execute error:", error);
    res.status(500).json({ error: "Failed to execute task" });
  }
});

router.post("/wai-sdk/generate-content", async (req: Request, res: Response) => {
  try {
    const { vertical, contentType, context, language, jurisdiction } = req.body;
    
    if (!vertical || !contentType) {
      return res.status(400).json({ error: "Vertical and content type are required" });
    }
    
    const result = await waiOrchestration.generateContent(
      vertical,
      contentType,
      context || {},
      language || "en",
      jurisdiction || "global"
    );
    
    res.json(result);
  } catch (error) {
    console.error("WAI generate content error:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

router.post("/wai-sdk/analyze", async (req: Request, res: Response) => {
  try {
    const { vertical, metrics, jurisdiction } = req.body;
    
    if (!vertical || !metrics) {
      return res.status(400).json({ error: "Vertical and metrics are required" });
    }
    
    const result = await waiOrchestration.analyzePerformance(
      vertical,
      metrics,
      jurisdiction || "global"
    );
    
    res.json(result);
  } catch (error) {
    console.error("WAI analyze error:", error);
    res.status(500).json({ error: "Failed to analyze performance" });
  }
});

router.post("/wai-sdk/support", async (req: Request, res: Response) => {
  try {
    const { message, language, customerId, jurisdiction } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    const result = await waiOrchestration.handleSupport(
      message,
      language || "en",
      customerId,
      jurisdiction || "india"
    );
    
    res.json(result);
  } catch (error) {
    console.error("WAI support error:", error);
    res.status(500).json({ error: "Failed to handle support request" });
  }
});

router.get("/wai-sdk/tiers", async (_req: Request, res: Response) => {
  res.json({
    modelTiers: MODEL_TIERS,
    agentTiers: TIER_DEFINITIONS,
    jurisdictions: JURISDICTION_REGULATIONS
  });
});

router.get("/wai-sdk/system-prompt/:agentId", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const systemPrompt = waiOrchestration.getAgentSystemPrompt(agentId);
    
    if (!systemPrompt) {
      return res.status(404).json({ error: "Agent not found" });
    }
    
    res.json({ agentId, systemPrompt });
  } catch (error) {
    console.error("WAI system prompt error:", error);
    res.status(500).json({ error: "Failed to get system prompt" });
  }
});

export default router;
