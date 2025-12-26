import { Router, Request, Response } from 'express';
import { emailCampaignService } from '../services/email-campaign-service';
import { requireBrandAccess } from '../middleware/auth-middleware';

const router = Router();

router.use(requireBrandAccess);

router.get('/templates/:brandId', async (req: Request, res: Response) => {
  try {
    const templates = await emailCampaignService.getTemplates(req.params.brandId);
    res.json({ success: true, data: templates, count: templates.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

router.post('/templates/:brandId', async (req: Request, res: Response) => {
  try {
    const template = await emailCampaignService.createTemplate(req.params.brandId, req.body);
    res.json({ success: true, data: template, message: 'Template created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create template' });
  }
});

router.get('/campaigns/:brandId', async (req: Request, res: Response) => {
  try {
    const campaigns = await emailCampaignService.getCampaigns(req.params.brandId);
    res.json({ success: true, data: campaigns, count: campaigns.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

router.post('/campaigns/:brandId', async (req: Request, res: Response) => {
  try {
    const campaign = await emailCampaignService.createCampaign(req.params.brandId, req.body);
    res.json({ success: true, data: campaign, message: 'Campaign created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

router.post('/campaigns/:brandId/:campaignId/send', async (req: Request, res: Response) => {
  try {
    const campaign = await emailCampaignService.sendCampaign(
      req.params.brandId,
      req.params.campaignId
    );
    res.json({ success: true, data: campaign, message: 'Campaign sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send campaign' });
  }
});

router.get('/automations/:brandId', async (req: Request, res: Response) => {
  try {
    const automations = await emailCampaignService.getAutomations(req.params.brandId);
    res.json({ success: true, data: automations, count: automations.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch automations' });
  }
});

router.post('/automations/:brandId', async (req: Request, res: Response) => {
  try {
    const automation = await emailCampaignService.createAutomation(req.params.brandId, req.body);
    res.json({ success: true, data: automation, message: 'Automation created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create automation' });
  }
});

router.post('/ai/generate', async (req: Request, res: Response) => {
  const { prompt, type, language } = req.body;
  if (!prompt || !type) {
    return res.status(400).json({ error: 'Prompt and type are required' });
  }
  try {
    const content = await emailCampaignService.generateEmailContent(prompt, type, language);
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

export default router;
