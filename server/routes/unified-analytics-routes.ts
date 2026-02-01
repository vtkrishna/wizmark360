/**
 * Unified Analytics API Routes
 * Cross-vertical analytics with ROI/ROAS calculations
 */

import { Router, Request, Response } from 'express';
import { unifiedAnalyticsService } from '../services/unified-analytics-service';

const router = Router();

router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const startDate = new Date(req.query.startDate as string || Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(req.query.endDate as string || Date.now());
    const channels = req.query.channels ? (req.query.channels as string).split(',') : undefined;
    const verticals = req.query.verticals ? (req.query.verticals as string).split(',') : undefined;
    const granularity = req.query.granularity as 'hourly' | 'daily' | 'weekly' | 'monthly' | undefined;

    const metrics = await unifiedAnalyticsService.getUnifiedMetrics(
      brandId,
      startDate,
      endDate,
      { channels, verticals, granularity }
    );

    res.json({ success: true, data: metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/attribution', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const model = req.query.model as 'last_click' | 'first_click' | 'linear' | 'time_decay' | 'position_based' | 'data_driven' || 'last_click';
    const startDate = new Date(req.query.startDate as string || Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(req.query.endDate as string || Date.now());

    const report = await unifiedAnalyticsService.getAttributionReport(
      brandId,
      model,
      startDate,
      endDate
    );

    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/kpis', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const dashboard = await unifiedAnalyticsService.getKPIDashboard(brandId);
    res.json({ success: true, data: dashboard });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/channel-comparison', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const channels = (req.query.channels as string || 'meta,google,linkedin').split(',');
    const startDate = new Date(req.query.startDate as string || Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(req.query.endDate as string || Date.now());

    const comparison = await unifiedAnalyticsService.getChannelComparison(
      brandId,
      channels,
      startDate,
      endDate
    );

    res.json({ success: true, data: comparison });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/reports/:type', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const reportType = req.params.type as 'daily' | 'weekly' | 'monthly' | 'quarterly';
    const includeAttribution = req.query.attribution === 'true';
    const includeRecommendations = req.query.recommendations === 'true';

    const report = await unifiedAnalyticsService.generatePerformanceReport(
      brandId,
      reportType,
      { includeAttribution, includeRecommendations }
    );

    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
