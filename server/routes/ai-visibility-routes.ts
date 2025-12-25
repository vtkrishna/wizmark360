import { Router, Request, Response } from 'express';
import { aiVisibilityTrackerService } from '../services/ai-visibility-tracker-service';

const router = Router();

router.get('/platforms', async (req: Request, res: Response) => {
  try {
    const platforms = aiVisibilityTrackerService.getAvailablePlatforms();
    res.json({
      success: true,
      data: platforms,
      message: 'Available AI platforms for visibility tracking'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch platforms'
    });
  }
});

router.post('/check', async (req: Request, res: Response) => {
  try {
    const { brandId, brandName, query, platforms } = req.body;

    if (!brandId || !brandName || !query) {
      return res.status(400).json({
        success: false,
        error: 'Brand ID, brand name, and query are required'
      });
    }

    const mentions = await aiVisibilityTrackerService.checkBrandVisibility(
      brandId,
      brandName,
      query,
      platforms
    );

    res.json({
      success: true,
      data: mentions,
      message: `Found ${mentions.length} results across AI platforms`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check visibility'
    });
  }
});

router.get('/score/:brandId', async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;
    const { brandName, platform } = req.query;

    if (!brandName) {
      return res.status(400).json({
        success: false,
        error: 'Brand name is required'
      });
    }

    const scores = await aiVisibilityTrackerService.getVisibilityScore(
      brandId,
      brandName as string,
      platform as string
    );

    res.json({
      success: true,
      data: scores,
      message: 'Visibility scores calculated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate visibility scores'
    });
  }
});

router.post('/tracking-queries', async (req: Request, res: Response) => {
  try {
    const { brandId, query, category, priority, frequency } = req.body;

    if (!brandId || !query || !category) {
      return res.status(400).json({
        success: false,
        error: 'Brand ID, query, and category are required'
      });
    }

    const trackingQuery = await aiVisibilityTrackerService.addTrackingQuery(
      brandId,
      query,
      category,
      priority,
      frequency
    );

    res.json({
      success: true,
      data: trackingQuery,
      message: 'Tracking query added successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add tracking query'
    });
  }
});

router.get('/tracking-queries/:brandId', async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;
    const queries = await aiVisibilityTrackerService.getTrackingQueries(brandId);

    res.json({
      success: true,
      data: queries,
      message: `Found ${queries.length} tracking queries`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch tracking queries'
    });
  }
});

router.delete('/tracking-queries/:brandId/:queryId', async (req: Request, res: Response) => {
  try {
    const { brandId, queryId } = req.params;
    const removed = await aiVisibilityTrackerService.removeTrackingQuery(brandId, queryId);

    res.json({
      success: true,
      data: { removed },
      message: removed ? 'Query removed successfully' : 'Query not found'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to remove tracking query'
    });
  }
});

router.get('/insights/:brandId', async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;
    const { brandName } = req.query;

    if (!brandName) {
      return res.status(400).json({
        success: false,
        error: 'Brand name is required'
      });
    }

    const insights = await aiVisibilityTrackerService.generateVisibilityInsights(
      brandId,
      brandName as string
    );

    res.json({
      success: true,
      data: insights,
      message: `Generated ${insights.length} visibility insights`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate insights'
    });
  }
});

router.get('/report/:brandId', async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;
    const { brandName } = req.query;

    if (!brandName) {
      return res.status(400).json({
        success: false,
        error: 'Brand name is required'
      });
    }

    const report = await aiVisibilityTrackerService.generateVisibilityReport(
      brandId,
      brandName as string
    );

    res.json({
      success: true,
      data: report,
      message: 'Visibility report generated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate report'
    });
  }
});

router.post('/run-check/:brandId', async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;
    const { brandName } = req.body;

    if (!brandName) {
      return res.status(400).json({
        success: false,
        error: 'Brand name is required'
      });
    }

    const result = await aiVisibilityTrackerService.runScheduledCheck(brandId, brandName);

    res.json({
      success: true,
      data: result,
      message: `Checked ${result.queriesChecked} queries, found ${result.newMentions} new mentions`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to run scheduled check'
    });
  }
});

router.get('/mentions/:brandId', async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;
    const { platform, sentiment, limit } = req.query;

    const mentions = await aiVisibilityTrackerService.getBrandMentions(brandId, {
      platform: platform as string,
      sentiment: sentiment as string,
      limit: limit ? parseInt(limit as string) : undefined
    });

    res.json({
      success: true,
      data: mentions,
      message: `Found ${mentions.length} brand mentions`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch mentions'
    });
  }
});

export default router;
