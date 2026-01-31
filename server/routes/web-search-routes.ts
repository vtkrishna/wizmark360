/**
 * Web Search API Routes - WAI SDK v3.1
 * 
 * Multi-provider real-time web search endpoints for Market360 agents.
 */

import { Router, Request, Response } from 'express';
import { webSearchService, type SearchQuery } from '../services/web-search-service';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * POST /api/v3/web-search/search
 * Execute multi-provider web search
 */
router.post('/search', authenticateToken, async (req: Request, res: Response) => {
  try {
    const query: SearchQuery = {
      query: req.body.query,
      providers: req.body.providers || ['perplexity'],
      maxResults: req.body.maxResults || 10,
      searchType: req.body.searchType || 'general',
      language: req.body.language,
      region: req.body.region,
      dateRange: req.body.dateRange,
      includeDomains: req.body.includeDomains,
      excludeDomains: req.body.excludeDomains,
      safeSearch: req.body.safeSearch !== false
    };

    if (!query.query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const results = await webSearchService.search(query);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Web search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v3/web-search/research
 * Deep topic research for content creation
 */
router.post('/research', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { topic, depth = 'standard' } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    const research = await webSearchService.researchTopic(topic, depth);

    res.json({
      success: true,
      data: research
    });
  } catch (error) {
    console.error('Research error:', error);
    res.status(500).json({
      success: false,
      error: 'Research failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v3/web-search/competitors
 * Monitor competitor mentions and market intelligence
 */
router.post('/competitors', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { brandName, competitors, topics } = req.body;

    if (!brandName || !competitors?.length || !topics?.length) {
      return res.status(400).json({
        success: false,
        error: 'brandName, competitors array, and topics array are required'
      });
    }

    const intelligence = await webSearchService.monitorCompetitors(brandName, competitors, topics);

    res.json({
      success: true,
      data: intelligence
    });
  } catch (error) {
    console.error('Competitor monitoring error:', error);
    res.status(500).json({
      success: false,
      error: 'Competitor monitoring failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v3/web-search/trends
 * Get industry trends
 */
router.get('/trends', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { industry, region } = req.query;

    if (!industry) {
      return res.status(400).json({
        success: false,
        error: 'Industry parameter is required'
      });
    }

    const trends = await webSearchService.getTrends(
      industry as string,
      region as string | undefined
    );

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trends',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v3/web-search/health
 * Get service health status
 */
router.get('/health', async (_req: Request, res: Response) => {
  const health = webSearchService.getHealth();

  res.json({
    success: true,
    data: health
  });
});

/**
 * POST /api/v3/web-search/clear-cache
 * Clear search cache
 */
router.post('/clear-cache', authenticateToken, async (_req: Request, res: Response) => {
  webSearchService.clearCache();

  res.json({
    success: true,
    message: 'Search cache cleared'
  });
});

export default router;
