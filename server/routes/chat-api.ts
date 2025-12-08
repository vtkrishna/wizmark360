import { Router, Request, Response } from "express";
import { chiefOfStaffService, ChatRequest, Vertical } from "../services/chief-of-staff-service";
import { ALL_MARKETING_AGENTS, getAgentsByCategory, getAgentById, getAgentsByTier, AGENT_COUNTS } from "../agents/marketing-agents-catalog";

const router = Router();

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message, brandId, vertical, conversationId, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const chatRequest: ChatRequest = {
      message,
      brandId: brandId || 1,
      vertical: (vertical as Vertical) || "general",
      conversationId,
      context
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
    res.json({
      totalAgents: ALL_MARKETING_AGENTS.length,
      counts: AGENT_COUNTS,
      agents: ALL_MARKETING_AGENTS.map(a => includePrompt ? a : {
        id: a.id,
        name: a.name,
        category: a.category,
        tier: a.tier,
        description: a.description,
        mission: a.mission,
        objectives: a.objectives,
        skills: a.skills,
        tools: a.tools
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
    const validCategories = ["social", "seo", "web", "sales", "whatsapp", "linkedin", "performance"];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        error: "Invalid category", 
        validCategories 
      });
    }
    
    const agents = getAgentsByCategory(category as any);
    res.json({
      category,
      total: agents.length,
      agents: agents.map(a => ({
        id: a.id,
        name: a.name,
        tier: a.tier,
        description: a.description,
        mission: a.mission,
        skills: a.skills,
        tools: a.tools
      }))
    });
  } catch (error: any) {
    console.error("Category agents API error:", error);
    res.status(500).json({ error: "Failed to get category agents" });
  }
});

router.get("/marketing-agents/agent/:agentId", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
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
    const validTiers = ["L0", "L1", "L2", "L3", "L4"];
    
    if (!validTiers.includes(tier)) {
      return res.status(400).json({ 
        error: "Invalid tier", 
        validTiers 
      });
    }
    
    const agents = getAgentsByTier(tier as any);
    res.json({
      tier,
      total: agents.length,
      agents: agents.map(a => ({
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

export default router;
