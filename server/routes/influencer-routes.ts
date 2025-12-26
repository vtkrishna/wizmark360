import { Router, Request, Response } from 'express';
import { influencerMarketplaceService } from '../services/influencer-marketplace-service';
import { requireBrandAccess } from '../middleware/auth-middleware';

const router = Router();

router.use(requireBrandAccess);

router.get('/search', async (req: Request, res: Response) => {
  const { platform, minFollowers, maxFollowers, niche, location, language, minEngagement, maxBudget } = req.query;
  try {
    const influencers = await influencerMarketplaceService.searchInfluencers({
      platform: platform as string,
      minFollowers: minFollowers ? parseInt(minFollowers as string) : undefined,
      maxFollowers: maxFollowers ? parseInt(maxFollowers as string) : undefined,
      niche: niche ? (niche as string).split(',') : undefined,
      location: location as string,
      language: language as string,
      minEngagement: minEngagement ? parseFloat(minEngagement as string) : undefined,
      maxBudget: maxBudget ? parseInt(maxBudget as string) : undefined
    });
    res.json({ success: true, data: influencers, count: influencers.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search influencers' });
  }
});

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await influencerMarketplaceService.getMarketplaceStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/influencer/:influencerId', async (req: Request, res: Response) => {
  try {
    const influencer = await influencerMarketplaceService.getInfluencerById(req.params.influencerId);
    if (influencer) {
      res.json({ success: true, data: influencer });
    } else {
      res.status(404).json({ error: 'Influencer not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch influencer' });
  }
});

router.get('/campaigns/:brandId', async (req: Request, res: Response) => {
  try {
    const campaigns = await influencerMarketplaceService.getCampaigns(req.params.brandId);
    res.json({ success: true, data: campaigns, count: campaigns.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

router.post('/campaigns/:brandId', async (req: Request, res: Response) => {
  try {
    const campaign = await influencerMarketplaceService.createCampaign(req.params.brandId, req.body);
    res.json({ success: true, data: campaign, message: 'Campaign created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

router.post('/campaigns/:brandId/:campaignId/influencer', async (req: Request, res: Response) => {
  const { influencerId, deliverables } = req.body;
  if (!influencerId || !deliverables) {
    return res.status(400).json({ error: 'Influencer ID and deliverables are required' });
  }
  try {
    const campaign = await influencerMarketplaceService.addInfluencerToCampaign(
      req.params.brandId,
      req.params.campaignId,
      influencerId,
      deliverables
    );
    if (campaign) {
      res.json({ success: true, data: campaign, message: 'Influencer added to campaign' });
    } else {
      res.status(404).json({ error: 'Campaign not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add influencer' });
  }
});

export default router;
