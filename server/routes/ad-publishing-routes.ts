/**
 * Native Ad Publishing API Routes
 * Endpoints for Meta, Google, LinkedIn Ads campaign management
 */

import { Router, Request, Response } from "express";
import { nativeAdPublishingService } from "../services/native-ad-publishing-service";

const router = Router();

router.post("/connections", async (req: Request, res: Response) => {
  try {
    const { brandId, platform, credentials } = req.body;
    
    if (!brandId || !platform || !credentials) {
      return res.status(400).json({ error: "brandId, platform, and credentials are required" });
    }

    const connection = await nativeAdPublishingService.connectAdAccount(brandId, platform, credentials);
    res.json(connection);
  } catch (error: any) {
    console.error("Ad account connection error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/campaigns", async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string;
    const platform = req.query.platform as any;
    const status = req.query.status as any;
    
    if (!brandId) {
      return res.status(400).json({ error: "brandId query parameter is required" });
    }

    try {
      const campaigns = await nativeAdPublishingService.getCampaigns(brandId, { platform, status });
      res.json({ campaigns });
    } catch (dbError: any) {
      if (dbError.message?.includes('invalid input syntax')) {
        res.json({ campaigns: [] });
      } else {
        throw dbError;
      }
    }
  } catch (error: any) {
    console.error("Get campaigns error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/campaigns", async (req: Request, res: Response) => {
  try {
    const { brandId, platform, ...campaignData } = req.body;
    
    if (!brandId || !platform) {
      return res.status(400).json({ error: "brandId and platform are required" });
    }

    const campaign = await nativeAdPublishingService.createCampaign(brandId, platform, campaignData);
    res.json(campaign);
  } catch (error: any) {
    console.error("Create campaign error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/campaigns/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const campaign = await nativeAdPublishingService.updateCampaign(id, updates);
    res.json(campaign);
  } catch (error: any) {
    console.error("Update campaign error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/campaigns/:id/publish", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const campaign = await nativeAdPublishingService.publishCampaign(id);
    res.json(campaign);
  } catch (error: any) {
    console.error("Publish campaign error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/campaigns/:id/pause", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const campaign = await nativeAdPublishingService.pauseCampaign(id);
    res.json(campaign);
  } catch (error: any) {
    console.error("Pause campaign error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/campaigns/:id/resume", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const campaign = await nativeAdPublishingService.resumeCampaign(id);
    res.json(campaign);
  } catch (error: any) {
    console.error("Resume campaign error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/campaigns/:id/performance", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const performance = await nativeAdPublishingService.syncCampaignPerformance(id);
    res.json(performance);
  } catch (error: any) {
    console.error("Sync performance error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/campaigns/:id/fatigue", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const analysis = await nativeAdPublishingService.getCreativeFatigueAnalysis(id);
    res.json(analysis);
  } catch (error: any) {
    console.error("Creative fatigue analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/audiences", async (req: Request, res: Response) => {
  try {
    const { brandId, platform, audienceData } = req.body;
    
    if (!brandId || !platform || !audienceData) {
      return res.status(400).json({ error: "brandId, platform, and audienceData are required" });
    }

    const audience = await nativeAdPublishingService.createAudience(brandId, platform, audienceData);
    res.json(audience);
  } catch (error: any) {
    console.error("Create audience error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/audiences/estimate", async (req: Request, res: Response) => {
  try {
    const { brandId, platform, targeting } = req.body;
    
    if (!brandId || !platform || !targeting) {
      return res.status(400).json({ error: "brandId, platform, and targeting are required" });
    }

    const estimate = await nativeAdPublishingService.getAudienceEstimate(brandId, platform, targeting);
    res.json(estimate);
  } catch (error: any) {
    console.error("Audience estimate error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/creatives/generate", async (req: Request, res: Response) => {
  try {
    const { brandId, ...params } = req.body;
    
    if (!brandId) {
      return res.status(400).json({ error: "brandId is required" });
    }

    const creatives = await nativeAdPublishingService.generateAICreatives(brandId, params);
    res.json({ creatives });
  } catch (error: any) {
    console.error("Generate creatives error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/guardrails", async (req: Request, res: Response) => {
  try {
    const guardrail = req.body;
    
    if (!guardrail.brandId || !guardrail.type || guardrail.threshold === undefined) {
      return res.status(400).json({ error: "brandId, type, and threshold are required" });
    }

    const result = await nativeAdPublishingService.setBudgetGuardrail(guardrail.brandId, guardrail);
    res.json(result);
  } catch (error: any) {
    console.error("Set guardrail error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/guardrails", async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string;
    
    if (!brandId) {
      return res.status(400).json({ error: "brandId query parameter is required" });
    }

    const guardrails = await nativeAdPublishingService.getBudgetGuardrails(brandId);
    res.json({ guardrails });
  } catch (error: any) {
    console.error("Get guardrails error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/alerts", async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string;
    
    if (!brandId) {
      return res.status(400).json({ error: "brandId query parameter is required" });
    }

    const alerts = await nativeAdPublishingService.getBudgetAlerts(brandId);
    res.json({ alerts });
  } catch (error: any) {
    console.error("Get alerts error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/cross-channel", async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string;
    
    if (!brandId) {
      return res.status(400).json({ error: "brandId query parameter is required" });
    }

    const performance = await nativeAdPublishingService.getCrossChannelPerformance(brandId);
    res.json(performance);
  } catch (error: any) {
    console.error("Cross-channel performance error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
