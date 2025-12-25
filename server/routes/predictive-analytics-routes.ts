/**
 * Predictive Analytics API Routes
 * Endpoints for lead scoring, content performance prediction, campaign ROI, churn analysis
 */

import { Router, Request, Response } from "express";
import { market360PredictiveAnalytics } from "../services/market360-predictive-analytics";

const router = Router();

router.post("/lead-score", async (req: Request, res: Response) => {
  try {
    const { brandId, leadData } = req.body;
    
    if (!brandId || !leadData) {
      return res.status(400).json({ error: "brandId and leadData are required" });
    }

    const result = await market360PredictiveAnalytics.predictLeadScore(brandId, leadData);
    res.json(result);
  } catch (error: any) {
    console.error("Lead score prediction error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/content-performance", async (req: Request, res: Response) => {
  try {
    const { brandId, contentData } = req.body;
    
    if (!brandId || !contentData) {
      return res.status(400).json({ error: "brandId and contentData are required" });
    }

    const result = await market360PredictiveAnalytics.predictContentPerformance(brandId, contentData);
    res.json(result);
  } catch (error: any) {
    console.error("Content performance prediction error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/campaign-roi", async (req: Request, res: Response) => {
  try {
    const { brandId, campaignData } = req.body;
    
    if (!brandId || !campaignData) {
      return res.status(400).json({ error: "brandId and campaignData are required" });
    }

    const result = await market360PredictiveAnalytics.predictCampaignROI(brandId, campaignData);
    res.json(result);
  } catch (error: any) {
    console.error("Campaign ROI prediction error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/churn-risk", async (req: Request, res: Response) => {
  try {
    const { brandId, customerData } = req.body;
    
    if (!brandId || !customerData) {
      return res.status(400).json({ error: "brandId and customerData are required" });
    }

    const result = await market360PredictiveAnalytics.predictChurnRisk(brandId, customerData);
    res.json(result);
  } catch (error: any) {
    console.error("Churn risk prediction error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/ad-performance", async (req: Request, res: Response) => {
  try {
    const { brandId, adData } = req.body;
    
    if (!brandId || !adData) {
      return res.status(400).json({ error: "brandId and adData are required" });
    }

    const result = await market360PredictiveAnalytics.predictAdPerformance(brandId, adData);
    res.json(result);
  } catch (error: any) {
    console.error("Ad performance prediction error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/forecast", async (req: Request, res: Response) => {
  try {
    const { brandId, forecastType, options } = req.body;
    
    if (!brandId || !forecastType || !options) {
      return res.status(400).json({ error: "brandId, forecastType, and options are required" });
    }

    const result = await market360PredictiveAnalytics.generateForecast(brandId, forecastType, options);
    res.json({ forecast: result });
  } catch (error: any) {
    console.error("Forecast generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/vertical/:vertical/insights", async (req: Request, res: Response) => {
  try {
    const { vertical } = req.params;
    const brandId = req.query.brandId as string;
    
    if (!brandId) {
      return res.status(400).json({ error: "brandId query parameter is required" });
    }

    const result = await market360PredictiveAnalytics.getVerticalInsights(brandId, vertical as any);
    res.json(result);
  } catch (error: any) {
    console.error("Vertical insights error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
