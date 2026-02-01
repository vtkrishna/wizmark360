/**
 * Telegram Bot Integration API Routes
 * Endpoints for bot management, messaging, broadcasts, and automations
 */

import { Router, Request, Response } from 'express';
import { telegramIntegrationService } from '../services/telegram-integration-service';

const router = Router();

router.post('/bots', async (req: Request, res: Response) => {
  try {
    const { brandId, botToken, welcomeMessage, enableBroadcast, enableAIResponses } = req.body;
    
    if (!botToken) {
      return res.status(400).json({ success: false, error: 'Bot token is required' });
    }
    
    const bot = await telegramIntegrationService.createBot(
      brandId || 'default',
      botToken,
      { welcomeMessage, enableBroadcast, enableAIResponses }
    );
    
    const safeBotInfo = {
      id: bot.id,
      botUsername: bot.botUsername,
      botName: bot.botName,
      isActive: bot.isActive,
      config: bot.config,
      stats: bot.stats,
      createdAt: bot.createdAt
    };
    
    res.json({ success: true, data: safeBotInfo });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/bots', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const bots = telegramIntegrationService.getBots(brandId);
    
    const safeBots = bots.map(bot => ({
      id: bot.id,
      botUsername: bot.botUsername,
      botName: bot.botName,
      isActive: bot.isActive,
      webhookUrl: bot.webhookUrl,
      config: bot.config,
      stats: bot.stats,
      createdAt: bot.createdAt
    }));
    
    res.json({ success: true, data: safeBots });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get bots' });
  }
});

router.post('/bots/:botId/webhook', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const { webhookUrl } = req.body;
    
    if (!webhookUrl) {
      return res.status(400).json({ success: false, error: 'Webhook URL is required' });
    }
    
    const success = await telegramIntegrationService.setWebhook(
      brandId,
      req.params.botId,
      webhookUrl
    );
    
    if (!success) {
      return res.status(400).json({ success: false, error: 'Failed to set webhook' });
    }
    
    res.json({ success: true, message: 'Webhook set successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/webhook/:brandId', async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;
    const update = req.body;
    
    await telegramIntegrationService.handleWebhookUpdate(brandId, update);
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.json({ ok: true });
  }
});

router.post('/messages/send', async (req: Request, res: Response) => {
  try {
    const { brandId, chatId, text, parseMode, keyboard, replyToMessageId, disableNotification } = req.body;
    
    if (!chatId || !text) {
      return res.status(400).json({ success: false, error: 'Chat ID and text are required' });
    }
    
    const message = await telegramIntegrationService.sendMessage(
      brandId || 'default',
      chatId,
      text,
      { parseMode, keyboard, replyToMessageId, disableNotification }
    );
    
    res.json({ success: true, data: message });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/messages/photo', async (req: Request, res: Response) => {
  try {
    const { brandId, chatId, photoUrl, caption, keyboard } = req.body;
    
    if (!chatId || !photoUrl) {
      return res.status(400).json({ success: false, error: 'Chat ID and photo URL are required' });
    }
    
    const message = await telegramIntegrationService.sendPhoto(
      brandId || 'default',
      chatId,
      photoUrl,
      caption,
      keyboard
    );
    
    res.json({ success: true, data: message });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/messages', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const chatId = req.query.chatId as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const messages = telegramIntegrationService.getMessages(brandId, chatId, limit);
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get messages' });
  }
});

router.get('/subscribers', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const tag = req.query.tag as string | undefined;
    const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
    
    const subscribers = telegramIntegrationService.getSubscribers(brandId, { tag, active });
    res.json({ success: true, data: subscribers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get subscribers' });
  }
});

router.post('/broadcasts', async (req: Request, res: Response) => {
  try {
    const { brandId, name, message, mediaType, mediaUrl, keyboard, targetAudience, targetTags, scheduledAt } = req.body;
    
    if (!name || !message) {
      return res.status(400).json({ success: false, error: 'Name and message are required' });
    }
    
    const broadcast = await telegramIntegrationService.createBroadcast(
      brandId || 'default',
      {
        name,
        message,
        mediaType,
        mediaUrl,
        keyboard,
        targetAudience: targetAudience || 'all',
        targetTags,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
      }
    );
    
    res.json({ success: true, data: broadcast });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/broadcasts', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const broadcasts = telegramIntegrationService.getBroadcasts(brandId);
    res.json({ success: true, data: broadcasts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get broadcasts' });
  }
});

router.post('/broadcasts/:broadcastId/send', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    
    const broadcast = await telegramIntegrationService.sendBroadcast(brandId, req.params.broadcastId);
    res.json({ success: true, data: broadcast });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/automations', async (req: Request, res: Response) => {
  try {
    const { brandId, name, trigger, actions } = req.body;
    
    if (!name || !trigger || !actions) {
      return res.status(400).json({ success: false, error: 'Name, trigger, and actions are required' });
    }
    
    const automation = await telegramIntegrationService.createAutomation(
      brandId || 'default',
      { name, trigger, actions }
    );
    
    res.json({ success: true, data: automation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/automations', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const automations = telegramIntegrationService.getAutomations(brandId);
    res.json({ success: true, data: automations });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get automations' });
  }
});

export default router;
