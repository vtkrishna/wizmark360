import { Router, Request, Response } from "express";
import { chiefOfStaffService, ChatRequest, Vertical } from "../services/chief-of-staff-service";
import { ALL_MARKETING_AGENTS, getAgentsByCategory, getAgentById, getAgentsByTier, AGENT_COUNTS } from "../agents/marketing-agents-catalog";
import { marketingAgentsLoader, type MarketingAgent } from "../services/marketing-agents-loader";
import { 
  ALL_HIERARCHICAL_AGENTS, 
  AGENT_STATS as HIERARCHICAL_STATS,
  getAgentById as getHierarchicalAgentById,
  getAgentsByCategory as getHierarchicalAgentsByCategory,
  getAgentsByRole,
  getAgentsByTier as getHierarchicalAgentsByTier,
  getVerticalHierarchy,
  PLATFORM_AGENTS,
  BRAND_AGENTS,
  VERTICAL_AGENTS,
  AgentCategory,
  AgentRole
} from "../agents/hierarchical-agent-catalog";

const router = Router();

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message, brandId, vertical, conversationId, context, model, provider } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const providerMap: Record<string, "anthropic" | "openai" | "gemini" | "groq" | "zhipu"> = {
      "anthropic": "anthropic",
      "claude": "anthropic",
      "openai": "openai",
      "gpt": "openai",
      "gemini": "gemini",
      "google": "gemini",
      "groq": "groq",
      "llama": "groq",
      "zhipu": "zhipu",
      "glm": "zhipu"
    };

    const preferredProvider = providerMap[model?.toLowerCase()] || providerMap[provider?.toLowerCase()] || undefined;

    const chatRequest: ChatRequest = {
      message,
      brandId: brandId || 1,
      vertical: (vertical as Vertical) || "general",
      conversationId,
      context,
      preferredProvider,
      preferredModel: model
    };

    const response = await chiefOfStaffService.processChat(chatRequest);
    res.json(response);
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({ 
      error: "Failed to process chat request",
      message: error.message 
    });
  }
});

router.get("/chat/history/:conversationId", async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const history = await chiefOfStaffService.getConversationHistory(conversationId);
    res.json({ conversationId, messages: history });
  } catch (error: any) {
    console.error("Chat history error:", error);
    res.status(500).json({ error: "Failed to get chat history" });
  }
});

router.delete("/chat/history/:conversationId", async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    await chiefOfStaffService.clearConversation(conversationId);
    res.json({ success: true, message: "Conversation cleared" });
  } catch (error: any) {
    console.error("Clear conversation error:", error);
    res.status(500).json({ error: "Failed to clear conversation" });
  }
});

router.get("/agents", async (_req: Request, res: Response) => {
  try {
    const agents = chiefOfStaffService.getAvailableAgents();
    res.json({ 
      total: agents.length,
      agents 
    });
  } catch (error: any) {
    console.error("Agents API error:", error);
    res.status(500).json({ error: "Failed to get agents" });
  }
});

router.get("/agents/:vertical", async (req: Request, res: Response) => {
  try {
    const { vertical } = req.params;
    const allAgents = chiefOfStaffService.getAvailableAgents();
    const filteredAgents = allAgents.filter(a => a.vertical === vertical || a.vertical === "general");
    res.json({
      vertical,
      total: filteredAgents.length,
      agents: filteredAgents
    });
  } catch (error: any) {
    console.error("Vertical agents API error:", error);
    res.status(500).json({ error: "Failed to get vertical agents" });
  }
});

router.get("/marketing-agents", async (req: Request, res: Response) => {
  try {
    const includePrompt = req.query.includePrompt === 'true';
    const vertical = req.query.vertical as string;
    const tier = req.query.tier as string;
    const romaLevel = req.query.romaLevel as string;

    let agents: MarketingAgent[] = marketingAgentsLoader.getAllAgents();
    if (agents.length === 0) {
      return res.json({
        totalAgents: ALL_MARKETING_AGENTS.length,
        counts: AGENT_COUNTS,
        agents: ALL_MARKETING_AGENTS.map((a: any) => ({
          id: a.id, name: a.name, category: a.category, tier: a.tier,
          description: a.description, mission: a.mission, objectives: a.objectives,
          skills: a.skills, tools: a.tools
        }))
      });
    }

    if (vertical) agents = agents.filter((a: MarketingAgent) => a.vertical === vertical);
    if (tier) agents = agents.filter((a: MarketingAgent) => a.tier === tier);
    if (romaLevel) agents = agents.filter((a: MarketingAgent) => a.romaLevel === romaLevel);

    res.json({
      totalAgents: agents.length,
      metadata: marketingAgentsLoader.getMetadata(),
      verticalSummary: marketingAgentsLoader.getVerticalSummary(),
      tierSummary: marketingAgentsLoader.getTierSummary(),
      agents: agents.map((a: MarketingAgent) => includePrompt ? a : {
        id: a.id,
        name: a.name,
        vertical: a.vertical,
        group: a.group,
        category: a.category,
        tier: a.tier,
        romaLevel: a.romaLevel,
        description: a.description,
        capabilities: a.capabilities,
        tools: a.tools,
        preferredModels: a.preferredModels,
        status: a.status
      })
    });
  } catch (error: any) {
    console.error("Marketing agents API error:", error);
    res.status(500).json({ error: "Failed to get marketing agents" });
  }
});

router.get("/marketing-agents/category/:category", async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const validCategories = ["social", "seo", "web", "sales", "whatsapp", "linkedin", "performance", "pr"];

    const verticalMap: Record<string, string> = {
      social: "Social Media", seo: "SEO/GEO", web: "Web Development",
      sales: "Sales/SDR", whatsapp: "WhatsApp", linkedin: "LinkedIn",
      performance: "Performance Ads", pr: "PR & Communications"
    };

    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid category", validCategories });
    }

    const registryAgents = marketingAgentsLoader.getAgentsByVertical(verticalMap[category] || category);
    if (registryAgents.length > 0) {
      res.json({
        category,
        vertical: verticalMap[category],
        total: registryAgents.length,
        agents: registryAgents.map((a: MarketingAgent) => ({
          id: a.id, name: a.name, tier: a.tier, romaLevel: a.romaLevel,
          description: a.description, capabilities: a.capabilities,
          tools: a.tools, preferredModels: a.preferredModels, status: a.status
        }))
      });
    } else {
      const agents = getAgentsByCategory(category as any);
      res.json({
        category, total: agents.length,
        agents: agents.map((a: any) => ({
          id: a.id, name: a.name, tier: a.tier, description: a.description,
          mission: a.mission, skills: a.skills, tools: a.tools
        }))
      });
    }
  } catch (error: any) {
    console.error("Category agents API error:", error);
    res.status(500).json({ error: "Failed to get category agents" });
  }
});

router.get("/marketing-agents/agent/:agentId", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const registryAgent = marketingAgentsLoader.getAgent(agentId);
    if (registryAgent) {
      return res.json(registryAgent);
    }

    const agent = getAgentById(agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }
    res.json(agent);
  } catch (error: any) {
    console.error("Agent detail API error:", error);
    res.status(500).json({ error: "Failed to get agent details" });
  }
});

router.get("/marketing-agents/tier/:tier", async (req: Request, res: Response) => {
  try {
    const { tier } = req.params;
    const validTiers = ["L0", "L1", "L2", "L3", "L4", "director", "manager", "specialist", "worker", "reviewer"];
    
    if (!validTiers.includes(tier)) {
      return res.status(400).json({ 
        error: "Invalid tier", 
        validTiers 
      });
    }

    const registryAgents = marketingAgentsLoader.getAgentsByTier(tier);
    if (registryAgents.length > 0) {
      return res.json({
        tier, total: registryAgents.length,
        agents: registryAgents.map((a: MarketingAgent) => ({
          id: a.id, name: a.name, tier: a.tier, romaLevel: a.romaLevel,
          vertical: a.vertical, description: a.description,
          capabilities: a.capabilities, tools: a.tools, preferredModels: a.preferredModels
        }))
      });
    }
    
    const agents = getAgentsByTier(tier as any);
    res.json({
      tier,
      total: agents.length,
      agents: agents.map((a: any) => ({
        id: a.id,
        name: a.name,
        category: a.category,
        description: a.description,
        mission: a.mission
      }))
    });
  } catch (error: any) {
    console.error("Tier agents API error:", error);
    res.status(500).json({ error: "Failed to get tier agents" });
  }
});

router.get("/marketing-agents/stats", async (_req: Request, res: Response) => {
  try {
    const tierCounts = {
      L0: getAgentsByTier("L0").length,
      L1: getAgentsByTier("L1").length,
      L2: getAgentsByTier("L2").length,
      L3: getAgentsByTier("L3").length,
      L4: getAgentsByTier("L4").length
    };
    
    res.json({
      totalAgents: ALL_MARKETING_AGENTS.length,
      categoryCounts: AGENT_COUNTS,
      tierCounts,
      romaLevels: {
        L0: { name: "Reactive", description: "Manual Trigger Required", count: tierCounts.L0 },
        L1: { name: "Proactive", description: "Pattern-Based Suggestions", count: tierCounts.L1 },
        L2: { name: "Autonomous", description: "Approved Strategy Execution", count: tierCounts.L2 },
        L3: { name: "Collaborative", description: "Multi-Agent Coordination", count: tierCounts.L3 },
        L4: { name: "Self-Evolving", description: "Full Autonomous Operation", count: tierCounts.L4 }
      }
    });
  } catch (error: any) {
    console.error("Agent stats API error:", error);
    res.status(500).json({ error: "Failed to get agent stats" });
  }
});

router.get("/hierarchical-agents", async (req: Request, res: Response) => {
  try {
    const includePrompt = req.query.includePrompt === 'true';
    res.json({
      stats: HIERARCHICAL_STATS,
      platform: PLATFORM_AGENTS.map(a => includePrompt ? a : { ...a, systemPrompt: undefined }),
      brand: BRAND_AGENTS.map(a => includePrompt ? a : { ...a, systemPrompt: undefined }),
      verticals: {
        social: getHierarchicalAgentsByCategory("social").map(a => includePrompt ? a : { ...a, systemPrompt: undefined }),
        seo: getHierarchicalAgentsByCategory("seo").map(a => includePrompt ? a : { ...a, systemPrompt: undefined }),
        web: getHierarchicalAgentsByCategory("web").map(a => includePrompt ? a : { ...a, systemPrompt: undefined }),
        sales: getHierarchicalAgentsByCategory("sales").map(a => includePrompt ? a : { ...a, systemPrompt: undefined }),
        whatsapp: getHierarchicalAgentsByCategory("whatsapp").map(a => includePrompt ? a : { ...a, systemPrompt: undefined }),
        linkedin: getHierarchicalAgentsByCategory("linkedin").map(a => includePrompt ? a : { ...a, systemPrompt: undefined }),
        performance: getHierarchicalAgentsByCategory("performance").map(a => includePrompt ? a : { ...a, systemPrompt: undefined })
      }
    });
  } catch (error: any) {
    console.error("Hierarchical agents API error:", error);
    res.status(500).json({ error: "Failed to get hierarchical agents" });
  }
});

router.get("/hierarchical-agents/stats", async (_req: Request, res: Response) => {
  try {
    res.json({
      ...HIERARCHICAL_STATS,
      hierarchy: {
        platform: {
          chiefOfStaff: 1,
          qualityAssurance: 1,
          compliance: 1
        },
        brand: {
          brandOrchestrator: 1,
          brandContextManager: 1
        },
        perVertical: {
          director: 1,
          orchestrator: 1,
          manager: 1,
          reviewer: 1,
          approver: 1
        }
      },
      romaLevels: {
        L1: { name: "Proactive", description: "Pattern-Based Suggestions", count: HIERARCHICAL_STATS.byTier.L1 },
        L2: { name: "Autonomous", description: "Approved Strategy Execution", count: HIERARCHICAL_STATS.byTier.L2 },
        L3: { name: "Collaborative", description: "Multi-Agent Coordination", count: HIERARCHICAL_STATS.byTier.L3 },
        L4: { name: "Self-Evolving", description: "Full Autonomous Operation", count: HIERARCHICAL_STATS.byTier.L4 }
      }
    });
  } catch (error: any) {
    console.error("Hierarchical stats API error:", error);
    res.status(500).json({ error: "Failed to get hierarchical stats" });
  }
});

router.get("/hierarchical-agents/vertical/:vertical", async (req: Request, res: Response) => {
  try {
    const { vertical } = req.params;
    const validVerticals = ["social", "seo", "web", "sales", "whatsapp", "linkedin", "performance"];
    
    if (!validVerticals.includes(vertical)) {
      return res.status(400).json({ error: "Invalid vertical", validVerticals });
    }
    
    const hierarchy = getVerticalHierarchy(vertical as AgentCategory);
    res.json({
      vertical,
      hierarchy: {
        director: {
          id: hierarchy.director.id,
          name: hierarchy.director.name,
          tier: hierarchy.director.tier,
          mission: hierarchy.director.mission
        },
        orchestrator: {
          id: hierarchy.orchestrator.id,
          name: hierarchy.orchestrator.name,
          tier: hierarchy.orchestrator.tier,
          mission: hierarchy.orchestrator.mission
        },
        manager: {
          id: hierarchy.manager.id,
          name: hierarchy.manager.name,
          tier: hierarchy.manager.tier,
          mission: hierarchy.manager.mission
        },
        reviewer: {
          id: hierarchy.reviewer.id,
          name: hierarchy.reviewer.name,
          tier: hierarchy.reviewer.tier,
          mission: hierarchy.reviewer.mission
        },
        approver: {
          id: hierarchy.approver.id,
          name: hierarchy.approver.name,
          tier: hierarchy.approver.tier,
          mission: hierarchy.approver.mission
        }
      },
      workflowPath: [
        "Task arrives at Orchestrator",
        "Orchestrator routes to Manager for execution",
        "Manager creates content/campaign",
        "Reviewer validates quality and compliance",
        "Approver authorizes publication/launch",
        "Director handles escalations and strategy"
      ]
    });
  } catch (error: any) {
    console.error("Vertical hierarchy API error:", error);
    res.status(500).json({ error: "Failed to get vertical hierarchy" });
  }
});

router.get("/hierarchical-agents/agent/:agentId", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const agent = getHierarchicalAgentById(agentId);
    
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }
    
    res.json(agent);
  } catch (error: any) {
    console.error("Hierarchical agent detail API error:", error);
    res.status(500).json({ error: "Failed to get agent details" });
  }
});

router.get("/hierarchical-agents/role/:role", async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const validRoles = ["director", "orchestrator", "manager", "reviewer", "approver", 
                        "chief_of_staff", "quality_assurance", "compliance", 
                        "brand_orchestrator", "brand_context_manager"];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role", validRoles });
    }
    
    const agents = getAgentsByRole(role as any);
    res.json({
      role,
      total: agents.length,
      agents: agents.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        tier: a.tier,
        mission: a.mission
      }))
    });
  } catch (error: any) {
    console.error("Role agents API error:", error);
    res.status(500).json({ error: "Failed to get role agents" });
  }
});

export default router;
