import { Router, Request, Response } from 'express';
import { socialPublishingFullService } from '../services/social-publishing-full-service';
import { requireBrandAccess } from '../middleware/auth-middleware';

const router = Router();

router.use(requireBrandAccess);

router.get('/accounts/:brandId', async (req: Request, res: Response) => {
  try {
    const accounts = await socialPublishingFullService.getConnectedAccounts(req.params.brandId);
    res.json({ success: true, data: accounts, count: accounts.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

router.post('/accounts/:brandId/connect', async (req: Request, res: Response) => {
  const { platform, authCode } = req.body;
  if (!platform) {
    return res.status(400).json({ error: 'Platform is required' });
  }
  try {
    const account = await socialPublishingFullService.connectAccount(
      req.params.brandId,
      platform,
      authCode || ''
    );
    res.json({ success: true, data: account, message: `${platform} connected` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect account' });
  }
});

router.post('/accounts/:brandId/:accountId/disconnect', async (req: Request, res: Response) => {
  try {
    const success = await socialPublishingFullService.disconnectAccount(
      req.params.brandId,
      req.params.accountId
    );
    res.json({ success, message: success ? 'Account disconnected' : 'Account not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});

router.get('/posts/:brandId', async (req: Request, res: Response) => {
  const { status, platform } = req.query;
  try {
    const posts = await socialPublishingFullService.getPosts(req.params.brandId, {
      status: status as string,
      platform: platform as string
    });
    res.json({ success: true, data: posts, count: posts.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.post('/posts/:brandId', async (req: Request, res: Response) => {
  try {
    const post = await socialPublishingFullService.createPost(req.params.brandId, req.body);
    res.json({ success: true, data: post, message: 'Post created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.post('/posts/:brandId/:postId/publish', async (req: Request, res: Response) => {
  try {
    const post = await socialPublishingFullService.publishPost(
      req.params.brandId,
      req.params.postId
    );
    res.json({ success: true, data: post, message: 'Post published' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish post' });
  }
});

router.get('/calendar/:brandId', async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  try {
    const calendar = await socialPublishingFullService.getCalendar(
      req.params.brandId,
      new Date(startDate as string || Date.now() - 30 * 86400000),
      new Date(endDate as string || Date.now() + 30 * 86400000)
    );
    res.json({ success: true, data: calendar });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

router.get('/analytics/:brandId/:platform', async (req: Request, res: Response) => {
  const { period } = req.query;
  try {
    const analytics = await socialPublishingFullService.getAnalytics(
      req.params.brandId,
      req.params.platform,
      period as string
    );
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.post('/ai/caption', async (req: Request, res: Response) => {
  const { prompt, platform, language } = req.body;
  if (!prompt || !platform) {
    return res.status(400).json({ error: 'Prompt and platform are required' });
  }
  try {
    const result = await socialPublishingFullService.generateAICaption(prompt, platform, language);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate caption' });
  }
});

export default router;
