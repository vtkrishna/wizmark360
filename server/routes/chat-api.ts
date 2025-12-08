import { Router, Request, Response } from "express";
import { chiefOfStaffService, ChatRequest, Vertical } from "../services/chief-of-staff-service";

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

export default router;
