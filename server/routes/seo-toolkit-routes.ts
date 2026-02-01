/**
 * SEO Toolkit API Routes
 * Endpoints for keyword research, rank tracking, backlink analysis, and AI visibility
 */

import { Router, Request, Response } from 'express';
import { seoToolkitService } from '../services/seo-toolkit-service';

const router = Router();

router.post('/projects', async (req: Request, res: Response) => {
  try {
    const { brandId, domain, name, keywords, competitors, locations } = req.body;
    const project = await seoToolkitService.createProject(brandId, domain, name, {
      keywords,
      competitors,
      locations
    });
    res.json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/projects', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const projects = seoToolkitService.getProjects(brandId);
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get projects' });
  }
});

router.get('/keywords/research', async (req: Request, res: Response) => {
  try {
    const { keyword, location, language, includeRelated, includeQuestions } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ success: false, error: 'Keyword is required' });
    }
    
    const results = await seoToolkitService.keywordResearch(keyword as string, {
      location: location as string,
      language: language as string,
      includeRelated: includeRelated === 'true',
      includeQuestions: includeQuestions === 'true'
    });
    
    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/rankings/track', async (req: Request, res: Response) => {
  try {
    const { brandId, keywords, domain, location, device } = req.body;
    
    if (!keywords || !domain) {
      return res.status(400).json({ success: false, error: 'Keywords and domain are required' });
    }
    
    const results = await seoToolkitService.trackRankings(
      brandId || 'default',
      keywords,
      domain,
      { location, device }
    );
    
    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/rankings', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const keyword = req.query.keyword as string;
    
    const rankings = seoToolkitService.getRankings(brandId, { keyword });
    res.json({ success: true, data: rankings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get rankings' });
  }
});

router.post('/backlinks/analyze', async (req: Request, res: Response) => {
  try {
    const { brandId, domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({ success: false, error: 'Domain is required' });
    }
    
    const profile = await seoToolkitService.analyzeBacklinks(brandId || 'default', domain);
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/backlinks', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const backlinks = seoToolkitService.getBacklinks(brandId);
    res.json({ success: true, data: backlinks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get backlinks' });
  }
});

router.post('/audit', async (req: Request, res: Response) => {
  try {
    const { brandId, url } = req.body;
    
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }
    
    const audit = await seoToolkitService.runTechnicalAudit(brandId || 'default', url);
    res.json({ success: true, data: audit });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/audits', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const audits = seoToolkitService.getAudits(brandId);
    res.json({ success: true, data: audits });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get audits' });
  }
});

router.post('/ai-visibility/track', async (req: Request, res: Response) => {
  try {
    const { brandId, brandName, queries, competitors } = req.body;
    
    if (!brandName || !queries) {
      return res.status(400).json({ success: false, error: 'Brand name and queries are required' });
    }
    
    const results = await seoToolkitService.trackAIVisibility(
      brandId || 'default',
      brandName,
      queries,
      competitors || []
    );
    
    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/ai-visibility', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const results = seoToolkitService.getAIVisibility(brandId);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get AI visibility data' });
  }
});

router.post('/content-gaps', async (req: Request, res: Response) => {
  try {
    const { brandId, domain, competitors } = req.body;
    
    if (!domain) {
      return res.status(400).json({ success: false, error: 'Domain is required' });
    }
    
    const gaps = await seoToolkitService.findContentGaps(
      brandId || 'default',
      domain,
      competitors || []
    );
    
    res.json({ success: true, data: gaps });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/report', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const report = await seoToolkitService.generateSEOReport(brandId);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate report' });
  }
});

export default router;
