/**
 * Cross-Vertical Orchestration API Routes
 * Intelligent campaign orchestration across all marketing verticals
 */

import { Router, Request, Response } from 'express';
import { crossVerticalOrchestrationEngine } from '../services/cross-vertical-orchestration-engine';

const router = Router();

router.post('/campaigns', async (req: Request, res: Response) => {
  try {
    const { name, brandId, objective, budget, verticals, startDate, endDate, verticalConfigs } = req.body;
    
    const campaign = await crossVerticalOrchestrationEngine.createCrossVerticalCampaign({
      name,
      brandId: brandId || 'default',
      objective: objective || 'conversion',
      budget: budget || 10000,
      verticals: verticals || ['social_media', 'performance_ads', 'seo_geo'],
      startDate: new Date(startDate || Date.now()),
      endDate: new Date(endDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
      verticalConfigs
    });

    res.json({ success: true, data: campaign });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/campaigns', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string | undefined;
    const campaigns = crossVerticalOrchestrationEngine.listCampaigns(brandId);
    res.json({ success: true, data: campaigns });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/campaigns/:campaignId', async (req: Request, res: Response) => {
  try {
    const campaign = crossVerticalOrchestrationEngine.getCampaign(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    res.json({ success: true, data: campaign });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/campaigns/:campaignId/execute', async (req: Request, res: Response) => {
  try {
    const result = await crossVerticalOrchestrationEngine.executeCrossVerticalCampaign(req.params.campaignId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/campaigns/:campaignId/optimize', async (req: Request, res: Response) => {
  try {
    const recommendations = await crossVerticalOrchestrationEngine.optimizeCampaign(req.params.campaignId);
    res.json({ success: true, data: recommendations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/budget-allocation', async (req: Request, res: Response) => {
  try {
    const { totalBudget, verticals, objective } = req.body;
    
    const allocation = await crossVerticalOrchestrationEngine.calculateOptimalBudgetAllocation(
      totalBudget || 10000,
      verticals || ['social_media', 'performance_ads', 'seo_geo'],
      objective || 'conversion'
    );

    res.json({ success: true, data: allocation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/synergies', async (req: Request, res: Response) => {
  try {
    const verticals = req.query.verticals 
      ? (req.query.verticals as string).split(',')
      : ['social_media', 'performance_ads', 'seo_geo', 'sales_sdr', 'whatsapp', 'linkedin_b2b', 'telegram'];
    
    const synergies = await crossVerticalOrchestrationEngine.getVerticalSynergies(verticals);
    res.json({ success: true, data: synergies });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/benchmarks', async (req: Request, res: Response) => {
  try {
    const benchmarks = await crossVerticalOrchestrationEngine.getVerticalBenchmarks();
    res.json({ success: true, data: benchmarks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
