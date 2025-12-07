import { Router, Request, Response } from "express";
import { aiService, AIProvider } from "../services/ai-service";
import { db } from "../db";
import { campaigns, leads, socialPosts, performanceAds } from "@shared/schema";
import { desc, eq, sql } from "drizzle-orm";

const router = Router();

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message, provider } = req.body;

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

    const response = await aiService.chiefOfStaffChat(
      message,
      {
        activeCampaigns: Number(campaignStats?.count) || 0,
        totalLeads: Number(leadStats?.count) || 0,
        scheduledPosts: Number(postStats?.count) || 0,
        runningAds: Number(adStats?.count) || 0,
      },
      provider
    );

    res.json({ response, provider: provider || "openai" });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

router.post("/generate-content", async (req: Request, res: Response) => {
  try {
    const { type, brand, industry, targetAudience, tone, topic, platform } = req.body;

    if (!type || !brand || !topic) {
      return res.status(400).json({ error: "Type, brand, and topic are required" });
    }

    const content = await aiService.generateMarketingContent(type, {
      brand,
      industry: industry || "general",
      targetAudience: targetAudience || "general audience",
      tone: tone || "professional",
      topic,
      platform,
    });

    res.json({ content, type });
  } catch (error) {
    console.error("Content generation error:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

router.post("/score-lead", async (req: Request, res: Response) => {
  try {
    const { leadId, name, email, company, source, industry } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const result = await aiService.scoreAndQualifyLead({
      name,
      email,
      company,
      source: source || "website",
      industry,
    });

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

    const analysis = await aiService.analyzePerformance(
      {
        impressions: impressions || 0,
        clicks: clicks || 0,
        conversions: conversions || 0,
        spend: spend || 0,
        revenue: revenue || 0,
      },
      campaignType || "marketing"
    );

    res.json(analysis);
  } catch (error) {
    console.error("Performance analysis error:", error);
    res.status(500).json({ error: "Failed to analyze performance" });
  }
});

router.get("/providers", async (_req: Request, res: Response) => {
  const providers: { id: AIProvider; name: string; available: boolean }[] = [
    {
      id: "openai",
      name: "OpenAI GPT-5",
      available: !!process.env.OPENAI_API_KEY,
    },
    {
      id: "anthropic",
      name: "Anthropic Claude",
      available: !!process.env.ANTHROPIC_API_KEY,
    },
    {
      id: "gemini",
      name: "Google Gemini",
      available: !!process.env.GEMINI_API_KEY,
    },
  ];

  res.json(providers);
});

export default router;
