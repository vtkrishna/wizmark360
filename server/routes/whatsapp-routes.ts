import { Router, Request, Response } from 'express';
import { whatsAppBusinessService } from '../services/whatsapp-business-service';

const router = Router();

router.get('/status', (_req: Request, res: Response) => {
  const status = whatsAppBusinessService.getServiceStatus();
  res.json({
    success: true,
    data: status,
    message: status.configured 
      ? 'WhatsApp Business API is configured and ready'
      : 'WhatsApp Business API is awaiting credentials'
  });
});

router.get('/templates/:brandId', async (req: Request, res: Response) => {
  try {
    const templates = await whatsAppBusinessService.getTemplates(req.params.brandId);
    res.json({
      success: true,
      data: templates,
      count: templates.length,
      message: `Found ${templates.length} message templates`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

router.post('/templates/:brandId', async (req: Request, res: Response) => {
  try {
    const template = await whatsAppBusinessService.createTemplate(req.params.brandId, req.body);
    res.json({
      success: true,
      data: template,
      message: `Template "${template.name}" created successfully`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create template' });
  }
});

router.post('/send', async (req: Request, res: Response) => {
  const { to, message, brandId } = req.body;
  
  if (!to || !message || !brandId) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['to', 'message', 'brandId']
    });
  }
  
  try {
    const result = await whatsAppBusinessService.sendMessage(to, message, brandId);
    res.json({
      success: true,
      data: result,
      message: `Message sent to ${to}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get('/broadcasts/:brandId', async (req: Request, res: Response) => {
  try {
    const broadcasts = await whatsAppBusinessService.getBroadcasts(req.params.brandId);
    res.json({
      success: true,
      data: broadcasts,
      count: broadcasts.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch broadcasts' });
  }
});

router.post('/broadcasts/:brandId', async (req: Request, res: Response) => {
  try {
    const campaign = await whatsAppBusinessService.createBroadcast(req.params.brandId, req.body);
    res.json({
      success: true,
      data: campaign,
      message: `Broadcast "${campaign.name}" created`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create broadcast' });
  }
});

router.post('/broadcasts/:brandId/:campaignId/execute', async (req: Request, res: Response) => {
  try {
    const campaign = await whatsAppBusinessService.executeBroadcast(
      req.params.brandId,
      req.params.campaignId
    );
    res.json({
      success: true,
      data: campaign,
      message: `Broadcast executed: ${campaign.metrics.sent} messages sent`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute broadcast' });
  }
});

router.get('/flows/:brandId', async (req: Request, res: Response) => {
  try {
    const flows = await whatsAppBusinessService.getFlows(req.params.brandId);
    res.json({
      success: true,
      data: flows,
      count: flows.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flows' });
  }
});

router.post('/flows/:brandId', async (req: Request, res: Response) => {
  try {
    const flow = await whatsAppBusinessService.createFlow(req.params.brandId, req.body);
    res.json({
      success: true,
      data: flow,
      message: `Flow "${flow.name}" created`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create flow' });
  }
});

router.get('/conversations/:brandId', async (req: Request, res: Response) => {
  const { phoneNumber } = req.query;
  try {
    const conversations = await whatsAppBusinessService.getConversations(
      req.params.brandId,
      phoneNumber as string
    );
    res.json({
      success: true,
      data: conversations,
      count: conversations.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

router.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'] as string;
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;
  
  const result = whatsAppBusinessService.verifyWebhook(mode, token, challenge);
  
  if (result) {
    res.status(200).send(result);
  } else {
    res.status(403).json({ error: 'Webhook verification failed' });
  }
});

router.post('/webhook', (req: Request, res: Response) => {
  try {
    const result = whatsAppBusinessService.handleWebhook(req.body);
    console.log('WhatsApp Webhook:', result.type, result.data);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ success: true });
  }
});

export default router;
