import { Router, Request, Response } from "express";
import { WAISDKOrchestration } from "../services/wai-sdk-orchestration";
import { EnhancedAIService, MODEL_TIERS, LLM_REGISTRY, AIProvider } from "../services/enhanced-ai-service";
import { ALL_MARKET360_AGENTS, getAgentsByVertical, getAgentsByROMALevel, Vertical, ROMALevel } from "../agents/market360-agent-catalog";
import { PROVIDER_MANIFESTS, selectOptimalModel } from "../services/llm-provider-manifest";
import { llmModelAutoUpdater } from "../services/llm-model-auto-updater";
import { LLM_REGISTRY_VERSION, LLM_REGISTRY_LAST_UPDATED } from "../services/enhanced-ai-service";
import { difyIntegration, DIFY_CAPABILITIES } from "../services/dify-integration";
import { intelligentRouter, TaskType, TaskComplexity } from "../services/intelligent-model-router";

const router = Router();
const waiOrchestration = new WAISDKOrchestration();
const enhancedAI = new EnhancedAIService();

router.get("/providers", async (req: Request, res: Response) => {
  try {
    const providers = enhancedAI.getAvailableProviders();
    const manifests = PROVIDER_MANIFESTS.map(p => ({
      id: p.id,
      name: p.name,
      tier: p.tier,
      modelCount: p.modelCount,
      capabilities: p.capabilities,
      bestFor: p.bestFor,
      available: providers.find(pr => pr.id === p.id)?.available || false
    }));
    
    res.json({
      totalProviders: manifests.length,
      activeProviders: manifests.filter(p => p.available).length,
      providers: manifests,
      tiers: MODEL_TIERS
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/models", async (req: Request, res: Response) => {
  try {
    const { provider, tier, capability } = req.query;
    
    let models = LLM_REGISTRY;
    
    if (provider) {
      models = models.filter(m => m.provider === provider);
    }
    
    if (tier) {
      const tierProviders = MODEL_TIERS[tier as keyof typeof MODEL_TIERS]?.providers || [];
      models = models.filter(m => tierProviders.includes(m.provider as AIProvider));
    }
    
    if (capability) {
      models = models.filter(m => m.capabilities.includes(capability as string));
    }
    
    res.json({
      totalModels: models.length,
      models: models.map(m => ({
        id: m.id,
        name: m.name,
        provider: m.provider,
        contextWindow: m.contextWindow,
        maxOutput: m.maxOutput,
        inputCost: m.inputCostPer1M,
        outputCost: m.outputCostPer1M,
        capabilities: m.capabilities,
        isMultilingual: m.isMultilingual,
        supportsVoice: m.supportsVoice
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/agents", async (req: Request, res: Response) => {
  try {
    const { vertical, romaLevel } = req.query;
    
    let agents = ALL_MARKET360_AGENTS;
    
    if (vertical) {
      agents = getAgentsByVertical(vertical as Vertical);
    }
    
    if (romaLevel) {
      const levelMap: Record<string, ROMALevel> = { "L0": "L0", "L1": "L1", "L2": "L2", "L3": "L3", "L4": "L4" };
      agents = getAgentsByROMALevel(levelMap[romaLevel as string] || "L2");
    }
    
    res.json({
      totalAgents: agents.length,
      agents: agents.map(a => ({
        id: a.id,
        name: a.name,
        vertical: a.vertical,
        romaLevel: a.romaLevel,
        description: a.description,
        capabilities: a.capabilities,
        tools: a.tools
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const {
      type,
      vertical,
      brandId,
      prompt,
      context,
      options = {}
    } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    
    const task = {
      id: `task_${Date.now()}`,
      type: type || "content",
      vertical: vertical || "social",
      description: prompt,
      priority: options.priority || "medium",
      requiredCapabilities: options.capabilities || ["text"],
      targetJurisdictions: options.jurisdictions || ["IN"],
      language: options.language || "en",
      context: {
        brandId,
        ...context
      },
      constraints: {
        preferredTier: options.tier || "tier1",
        maxLatency: options.maxLatency,
        maxCost: options.maxCost
      },
      enhancedOptions: {
        enablePromptEngineering: options.enhancePrompt !== false,
        enableDocumentRAG: options.useRAG || false
      }
    };
    
    const result = await waiOrchestration.executeEnhancedTask(task as any);
    
    res.json({
      taskId: result.taskId,
      content: result.response,
      agent: {
        id: result.agentId,
        name: result.agentName
      },
      model: {
        provider: result.provider,
        model: result.model,
        tier: result.tier
      },
      confidence: result.confidence,
      processingTime: result.processingTime,
      tokensUsed: result.tokensUsed,
      metadata: result.metadata
    });
  } catch (error: any) {
    console.error("Orchestration error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/multimodal", async (req: Request, res: Response) => {
  try {
    const {
      type,
      prompt,
      brandId,
      style,
      format,
      options = {}
    } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    
    const contentTypes = {
      text: async () => {
        const response = await enhancedAI.chat([
          { role: "system", content: "You are an expert marketing content creator. Generate high-quality, engaging content." },
          { role: "user", content: prompt }
        ], options.provider || "openai", options.model);
        return { type: "text", content: response.content, model: response.model };
      },
      social: async () => {
        const response = await enhancedAI.chat([
          { role: "system", content: `You are a social media expert. Create engaging ${format || 'post'} content optimized for maximum engagement. Style: ${style || 'professional'}` },
          { role: "user", content: prompt }
        ], options.provider || "openai", options.model);
        return { type: "social", content: response.content, model: response.model };
      },
      email: async () => {
        const response = await enhancedAI.chat([
          { role: "system", content: "You are an email marketing expert. Create compelling email content with subject lines, body, and CTAs." },
          { role: "user", content: prompt }
        ], options.provider || "anthropic", options.model);
        return { type: "email", content: response.content, model: response.model };
      },
      ad: async () => {
        const response = await enhancedAI.chat([
          { role: "system", content: `You are a performance marketing expert. Create high-converting ad copy for ${format || 'Google Ads'}.` },
          { role: "user", content: prompt }
        ], options.provider || "openai", options.model);
        return { type: "ad", content: response.content, model: response.model };
      },
      seo: async () => {
        const response = await enhancedAI.chat([
          { role: "system", content: "You are an SEO expert. Create SEO-optimized content with meta titles, descriptions, and keyword-rich copy." },
          { role: "user", content: prompt }
        ], options.provider || "anthropic", options.model);
        return { type: "seo", content: response.content, model: response.model };
      },
      blog: async () => {
        const response = await enhancedAI.chat([
          { role: "system", content: "You are a content marketing expert. Write engaging, informative blog posts with proper structure and SEO optimization." },
          { role: "user", content: prompt }
        ], options.provider || "anthropic", options.model);
        return { type: "blog", content: response.content, model: response.model };
      }
    };
    
    const generator = contentTypes[type as keyof typeof contentTypes] || contentTypes.text;
    const result = await generator();
    
    res.json({
      brandId,
      ...result,
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Multimodal generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/workflow", async (req: Request, res: Response) => {
  try {
    const {
      vertical,
      brandId,
      workflowType,
      input,
      options = {}
    } = req.body;
    
    const verticalAgents = getAgentsByVertical(vertical as Vertical);
    const director = verticalAgents.find(a => a.romaLevel === "L4");
    const orchestrator = verticalAgents.find(a => a.romaLevel === "L3");
    const workers = verticalAgents.filter(a => a.romaLevel === "L2" || a.romaLevel === "L1");
    
    const workflowSteps = {
      social: ["Trend Analysis", "Content Ideation", "Content Creation", "Visual Design", "Review", "Schedule", "Publish", "Monitor"],
      seo: ["Keyword Research", "Competitor Analysis", "Content Strategy", "On-Page Optimization", "Technical SEO", "Link Building", "Tracking"],
      web: ["Requirements", "Design", "Development", "Testing", "Optimization", "Deployment", "Analytics"],
      sales: ["Lead Capture", "Qualification", "Enrichment", "Scoring", "Outreach", "Follow-up", "Conversion"],
      whatsapp: ["Template Creation", "Audience Segmentation", "Campaign Setup", "Automation", "Engagement", "Analytics"],
      linkedin: ["Profile Optimization", "Content Strategy", "Network Growth", "Lead Generation", "InMail Campaigns", "Analytics"],
      performance: ["Campaign Setup", "Audience Targeting", "Creative Testing", "Bid Optimization", "Budget Management", "ROAS Tracking"]
    };
    
    const steps = workflowSteps[vertical as keyof typeof workflowSteps] || [];
    
    res.json({
      workflowId: `wf_${Date.now()}`,
      vertical,
      brandId,
      workflowType,
      steps: steps.map((step, i) => ({
        id: `step_${i + 1}`,
        name: step,
        status: i === 0 ? "in_progress" : "pending",
        agent: workers[i % workers.length]?.name || "General Agent"
      })),
      director: director ? { id: director.id, name: director.name } : null,
      orchestrator: orchestrator ? { id: orchestrator.id, name: orchestrator.name } : null,
      createdAt: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const providers = enhancedAI.getAvailableProviders();
    const activeProviders = providers.filter(p => p.available).length;
    
    const verticalCounts: Record<string, number> = {};
    ALL_MARKET360_AGENTS.forEach(a => {
      verticalCounts[a.vertical] = (verticalCounts[a.vertical] || 0) + 1;
    });
    
    const romaCounts: Record<string, number> = { L0: 0, L1: 0, L2: 0, L3: 0, L4: 0 };
    ALL_MARKET360_AGENTS.forEach(a => {
      romaCounts[a.romaLevel] = (romaCounts[a.romaLevel] || 0) + 1;
    });
    
    res.json({
      platform: "WAI SDK Orchestration",
      version: "1.0.0",
      stats: {
        totalAgents: ALL_MARKET360_AGENTS.length,
        totalProviders: PROVIDER_MANIFESTS.length,
        activeProviders,
        totalModels: LLM_REGISTRY.length,
        verticals: 7,
        agentsByVertical: verticalCounts,
        agentsByROMA: romaCounts
      },
      capabilities: [
        "Multi-provider LLM orchestration",
        "267 specialized marketing agents",
        "7 marketing verticals",
        "ROMA L0-L4 autonomy levels",
        "Multilingual content (12 Indian languages)",
        "Voice capabilities (STT/TTS)",
        "Dual-model workflows (Claude + Gemini)",
        "Smart model selection",
        "Cost optimization"
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/models/updates", async (req: Request, res: Response) => {
  try {
    const updateStatus = await llmModelAutoUpdater.checkForUpdates();
    const modelSummary = llmModelAutoUpdater.getModelSummary();
    
    res.json({
      registryVersion: LLM_REGISTRY_VERSION,
      lastUpdated: LLM_REGISTRY_LAST_UPDATED,
      ...updateStatus,
      modelSummary,
      updateSources: llmModelAutoUpdater.getUpdateSources().length,
      autoUpdateEnabled: true
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/models/flagship", async (req: Request, res: Response) => {
  try {
    const manifest = llmModelAutoUpdater.getLatestModelsManifest();
    const flagshipModels = Object.entries(manifest).map(([provider, info]) => ({
      provider,
      flagship: info.flagship,
      totalModels: info.models.length,
      lastUpdate: info.lastUpdate
    }));
    
    res.json({
      flagshipModels,
      totalProviders: flagshipModels.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/models/provider/:provider", async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const models = await llmModelAutoUpdater.fetchProviderModels(provider as any);
    const flagship = llmModelAutoUpdater.getProviderFlagship(provider as any);
    const lastUpdate = llmModelAutoUpdater.getProviderLastUpdate(provider as any);
    
    res.json({
      provider,
      flagship,
      lastUpdate,
      ...models
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/router/select-model", async (req: Request, res: Response) => {
  try {
    const { 
      taskType = "chat", 
      complexity = "moderate",
      requiresVision = false,
      requiresVoice = false,
      requiresReasoning = false,
      requiresCode = false,
      requiresMultimodal = false,
      requiresIndianLanguages = false,
      maxCostPerMillion,
      preferredProviders,
      agentRomaLevel,
      agentVertical,
      latencyPriority = "medium",
      qualityPriority = "standard"
    } = req.body;

    const decision = intelligentRouter.selectOptimalModel({
      taskType: taskType as TaskType,
      complexity: complexity as TaskComplexity,
      requiresVision,
      requiresVoice,
      requiresReasoning,
      requiresCode,
      requiresMultimodal,
      requiresIndianLanguages,
      maxCostPerMillion,
      preferredProviders,
      agentRomaLevel,
      agentVertical,
      latencyPriority,
      qualityPriority
    });

    res.json({
      success: true,
      decision: {
        primary: {
          modelId: decision.primary.model.id,
          modelName: decision.primary.model.name,
          provider: decision.primary.model.provider,
          score: decision.primary.totalScore,
          reasoning: decision.primary.reasoning,
          breakdown: decision.primary.breakdown
        },
        fallbacks: decision.fallbacks.map(f => ({
          modelId: f.model.id,
          modelName: f.model.name,
          provider: f.model.provider,
          score: f.totalScore
        })),
        estimatedCost: decision.estimatedCost,
        confidence: decision.confidence,
        strategy: decision.strategy
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/router/agent-recommendation/:agentId", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const { taskType = "chat" } = req.query;

    const decision = waiOrchestration.getModelRecommendationForAgent(
      agentId,
      taskType as TaskType
    );

    if (!decision) {
      return res.status(404).json({ error: "Agent not found" });
    }

    res.json({
      success: true,
      agentId,
      taskType,
      recommendation: {
        primary: {
          modelId: decision.primary.model.id,
          modelName: decision.primary.model.name,
          provider: decision.primary.model.provider,
          score: decision.primary.totalScore,
          reasoning: decision.primary.reasoning
        },
        fallbacks: decision.fallbacks.slice(0, 2).map(f => ({
          modelId: f.model.id,
          provider: f.model.provider
        })),
        estimatedCost: decision.estimatedCost,
        strategy: decision.strategy
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/router/cost-optimized", async (req: Request, res: Response) => {
  try {
    const { maxCost = "5", capabilities } = req.query;
    
    const capList = capabilities ? String(capabilities).split(",") : ["text"];
    const model = intelligentRouter.getCostOptimizedModel(
      parseFloat(maxCost as string),
      capList
    );

    if (!model) {
      return res.status(404).json({ 
        error: "No model found matching criteria",
        criteria: { maxCost, capabilities: capList }
      });
    }

    res.json({
      success: true,
      model: {
        id: model.id,
        name: model.name,
        provider: model.provider,
        inputCost: model.inputCostPer1M,
        outputCost: model.outputCostPer1M,
        capabilities: model.capabilities,
        contextWindow: model.contextWindow
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/router/flagship-models", async (req: Request, res: Response) => {
  try {
    const categories = [
      "premium-reasoning", "balanced-performance", "fast-quality", 
      "code-specialist", "multimodal-vision", "cost-effective-vision",
      "long-context", "ultra-fast", "indian-languages", "deep-analysis", "balanced-claude"
    ];

    const flagships = categories.map(category => {
      const model = intelligentRouter.getModelByCategory(category as any);
      return model ? {
        category,
        modelId: model.id,
        modelName: model.name,
        provider: model.provider,
        inputCost: model.inputCostPer1M,
        outputCost: model.outputCostPer1M,
        capabilities: model.capabilities.slice(0, 5)
      } : null;
    }).filter(Boolean);

    res.json({
      success: true,
      count: flagships.length,
      flagships
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/router/usage-stats", async (req: Request, res: Response) => {
  try {
    const stats = waiOrchestration.getModelUsageStats();
    
    res.json({
      success: true,
      stats,
      totalModelsTracked: Object.keys(stats).length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/dify/status", async (req: Request, res: Response) => {
  try {
    const status = difyIntegration.getStatus();
    res.json({
      ...status,
      capabilities: DIFY_CAPABILITIES,
      integration: "Dify Agentic Workflow Platform"
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/dify/workflow/run", async (req: Request, res: Response) => {
  try {
    const { inputs, responseMode = "blocking", user, files } = req.body;
    
    if (!user) {
      return res.status(400).json({ error: "User identifier is required" });
    }
    
    const result = await difyIntegration.runWorkflow({
      inputs: inputs || {},
      responseMode,
      user,
      files
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/dify/chat", async (req: Request, res: Response) => {
  try {
    const { inputs, query, responseMode = "blocking", conversationId, user, files } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    if (!user) {
      return res.status(400).json({ error: "User identifier is required" });
    }
    
    const result = await difyIntegration.sendChatMessage({
      inputs: inputs || {},
      query,
      responseMode,
      conversationId,
      user,
      files
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/dify/completion", async (req: Request, res: Response) => {
  try {
    const { inputs, responseMode = "blocking", user } = req.body;
    
    if (!user) {
      return res.status(400).json({ error: "User identifier is required" });
    }
    
    const result = await difyIntegration.createCompletion({
      inputs: inputs || {},
      responseMode,
      user
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/dify/conversations", async (req: Request, res: Response) => {
  try {
    const { user, limit = "20", last_id } = req.query;
    
    if (!user) {
      return res.status(400).json({ error: "User identifier is required" });
    }
    
    const result = await difyIntegration.getConversations(
      user as string,
      parseInt(limit as string),
      last_id as string | undefined
    );
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/dify/conversations/:conversationId/messages", async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { user, limit = "20", first_id } = req.query;
    
    if (!user) {
      return res.status(400).json({ error: "User identifier is required" });
    }
    
    const result = await difyIntegration.getConversationMessages(
      conversationId,
      user as string,
      parseInt(limit as string),
      first_id as string | undefined
    );
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/dify/conversations/:conversationId", async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { user } = req.body;
    
    if (!user) {
      return res.status(400).json({ error: "User identifier is required" });
    }
    
    const result = await difyIntegration.deleteConversation(conversationId, user);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/dify/parameters", async (req: Request, res: Response) => {
  try {
    const result = await difyIntegration.getAppParameters();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
