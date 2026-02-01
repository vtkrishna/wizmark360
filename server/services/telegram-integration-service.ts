/**
 * Telegram Bot Integration Service
 * Full Telegram Bot API integration for marketing automation
 */

export interface TelegramBot {
  id: string;
  brandId: string;
  botToken: string;
  botUsername: string;
  botName: string;
  isActive: boolean;
  webhookUrl?: string;
  config: {
    welcomeMessage?: string;
    defaultLanguage?: string;
    enableBroadcast?: boolean;
    enableAIResponses?: boolean;
  };
  stats: {
    totalSubscribers: number;
    activeSubscribers: number;
    messagesSent: number;
    messagesReceived: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TelegramSubscriber {
  id: string;
  brandId: string;
  chatId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  isActive: boolean;
  subscribedAt: Date;
  lastInteractionAt?: Date;
  tags: string[];
  metadata: Record<string, any>;
}

export interface TelegramMessage {
  id: string;
  brandId: string;
  chatId: string;
  messageId?: number;
  type: 'text' | 'photo' | 'video' | 'document' | 'voice' | 'sticker' | 'animation';
  direction: 'inbound' | 'outbound';
  content: string;
  mediaUrl?: string;
  replyToMessageId?: number;
  keyboard?: TelegramKeyboard;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: Date;
  createdAt: Date;
}

export interface TelegramKeyboard {
  type: 'inline' | 'reply';
  buttons: { text: string; callbackData?: string; url?: string }[][];
}

export interface TelegramBroadcast {
  id: string;
  brandId: string;
  name: string;
  message: string;
  mediaType?: 'photo' | 'video' | 'document';
  mediaUrl?: string;
  keyboard?: TelegramKeyboard;
  targetAudience: 'all' | 'tag' | 'segment';
  targetTags?: string[];
  scheduledAt?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  stats: {
    totalRecipients: number;
    delivered: number;
    failed: number;
  };
  createdAt: Date;
}

export interface TelegramAutomation {
  id: string;
  brandId: string;
  name: string;
  trigger: {
    type: 'command' | 'keyword' | 'message' | 'join' | 'callback';
    value?: string;
  };
  actions: {
    type: 'send_message' | 'send_media' | 'add_tag' | 'remove_tag' | 'ai_response' | 'webhook';
    config: Record<string, any>;
  }[];
  isActive: boolean;
  stats: {
    triggered: number;
    completed: number;
  };
  createdAt: Date;
}

const TELEGRAM_API_BASE = 'https://api.telegram.org';

class TelegramIntegrationService {
  private bots: Map<string, TelegramBot[]> = new Map();
  private subscribers: Map<string, TelegramSubscriber[]> = new Map();
  private messages: Map<string, TelegramMessage[]> = new Map();
  private broadcasts: Map<string, TelegramBroadcast[]> = new Map();
  private automations: Map<string, TelegramAutomation[]> = new Map();

  constructor() {
    console.log('📱 Telegram Integration Service initialized');
    console.log('   Features: Bot Management, Broadcasts, Automations, AI Responses');
  }

  async createBot(
    brandId: string,
    botToken: string,
    config?: TelegramBot['config']
  ): Promise<TelegramBot> {
    const botInfo = await this.getBotInfo(botToken);
    
    const bot: TelegramBot = {
      id: `tg_bot_${Date.now()}`,
      brandId,
      botToken,
      botUsername: botInfo.username,
      botName: botInfo.first_name,
      isActive: true,
      config: {
        welcomeMessage: config?.welcomeMessage || `Welcome to ${botInfo.first_name}! How can I help you today?`,
        defaultLanguage: config?.defaultLanguage || 'en',
        enableBroadcast: config?.enableBroadcast ?? true,
        enableAIResponses: config?.enableAIResponses ?? true
      },
      stats: {
        totalSubscribers: 0,
        activeSubscribers: 0,
        messagesSent: 0,
        messagesReceived: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existing = this.bots.get(brandId) || [];
    existing.push(bot);
    this.bots.set(brandId, existing);

    return bot;
  }

  private async getBotInfo(token: string): Promise<{ id: number; first_name: string; username: string }> {
    try {
      const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/getMe`);
      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.description || 'Invalid bot token');
      }
      
      return data.result;
    } catch (error: any) {
      throw new Error(`Failed to validate bot token: ${error.message}`);
    }
  }

  async setWebhook(brandId: string, botId: string, webhookUrl: string): Promise<boolean> {
    const bots = this.bots.get(brandId) || [];
    const bot = bots.find(b => b.id === botId);
    
    if (!bot) {
      throw new Error('Bot not found');
    }

    try {
      const response = await fetch(`${TELEGRAM_API_BASE}/bot${bot.botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query', 'chat_member']
        })
      });

      const data = await response.json();
      
      if (data.ok) {
        bot.webhookUrl = webhookUrl;
        bot.updatedAt = new Date();
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  }

  getBot(brandId: string, botId?: string): TelegramBot | undefined {
    const bots = this.bots.get(brandId) || [];
    if (botId) {
      return bots.find(b => b.id === botId);
    }
    return bots.find(b => b.isActive);
  }

  getBots(brandId: string): TelegramBot[] {
    return this.bots.get(brandId) || [];
  }

  async sendMessage(
    brandId: string,
    chatId: string,
    text: string,
    options?: {
      parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
      keyboard?: TelegramKeyboard;
      replyToMessageId?: number;
      disableNotification?: boolean;
    }
  ): Promise<TelegramMessage> {
    const bot = this.getBot(brandId);
    if (!bot) {
      throw new Error('No active bot found');
    }

    const payload: any = {
      chat_id: chatId,
      text,
      parse_mode: options?.parseMode || 'HTML',
      disable_notification: options?.disableNotification
    };

    if (options?.replyToMessageId) {
      payload.reply_to_message_id = options.replyToMessageId;
    }

    if (options?.keyboard) {
      if (options.keyboard.type === 'inline') {
        payload.reply_markup = {
          inline_keyboard: options.keyboard.buttons.map(row =>
            row.map(btn => ({
              text: btn.text,
              callback_data: btn.callbackData,
              url: btn.url
            }))
          )
        };
      } else {
        payload.reply_markup = {
          keyboard: options.keyboard.buttons.map(row =>
            row.map(btn => ({ text: btn.text }))
          ),
          resize_keyboard: true
        };
      }
    }

    try {
      const response = await fetch(`${TELEGRAM_API_BASE}/bot${bot.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      const message: TelegramMessage = {
        id: `msg_${Date.now()}`,
        brandId,
        chatId,
        messageId: data.ok ? data.result.message_id : undefined,
        type: 'text',
        direction: 'outbound',
        content: text,
        keyboard: options?.keyboard,
        status: data.ok ? 'sent' : 'failed',
        sentAt: data.ok ? new Date() : undefined,
        createdAt: new Date()
      };

      const existing = this.messages.get(brandId) || [];
      existing.push(message);
      this.messages.set(brandId, existing);

      if (data.ok) {
        bot.stats.messagesSent++;
      }

      return message;
    } catch (error) {
      throw new Error('Failed to send message');
    }
  }

  async sendPhoto(
    brandId: string,
    chatId: string,
    photoUrl: string,
    caption?: string,
    keyboard?: TelegramKeyboard
  ): Promise<TelegramMessage> {
    const bot = this.getBot(brandId);
    if (!bot) {
      throw new Error('No active bot found');
    }

    const payload: any = {
      chat_id: chatId,
      photo: photoUrl,
      caption,
      parse_mode: 'HTML'
    };

    if (keyboard) {
      payload.reply_markup = {
        inline_keyboard: keyboard.buttons.map(row =>
          row.map(btn => ({
            text: btn.text,
            callback_data: btn.callbackData,
            url: btn.url
          }))
        )
      };
    }

    try {
      const response = await fetch(`${TELEGRAM_API_BASE}/bot${bot.botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      const message: TelegramMessage = {
        id: `msg_${Date.now()}`,
        brandId,
        chatId,
        messageId: data.ok ? data.result.message_id : undefined,
        type: 'photo',
        direction: 'outbound',
        content: caption || '',
        mediaUrl: photoUrl,
        keyboard,
        status: data.ok ? 'sent' : 'failed',
        sentAt: data.ok ? new Date() : undefined,
        createdAt: new Date()
      };

      const existing = this.messages.get(brandId) || [];
      existing.push(message);
      this.messages.set(brandId, existing);

      return message;
    } catch (error) {
      throw new Error('Failed to send photo');
    }
  }

  async handleWebhookUpdate(brandId: string, update: any): Promise<void> {
    const bot = this.getBot(brandId);
    if (!bot) return;

    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id.toString();

      const subscriber = await this.getOrCreateSubscriber(brandId, {
        chatId,
        username: msg.from.username,
        firstName: msg.from.first_name,
        lastName: msg.from.last_name,
        languageCode: msg.from.language_code
      });

      const inboundMessage: TelegramMessage = {
        id: `msg_${Date.now()}`,
        brandId,
        chatId,
        messageId: msg.message_id,
        type: msg.text ? 'text' : msg.photo ? 'photo' : 'text',
        direction: 'inbound',
        content: msg.text || msg.caption || '',
        status: 'delivered',
        createdAt: new Date()
      };

      const existing = this.messages.get(brandId) || [];
      existing.push(inboundMessage);
      this.messages.set(brandId, existing);

      bot.stats.messagesReceived++;

      await this.processAutomations(brandId, msg);
    }

    if (update.callback_query) {
      const callback = update.callback_query;
      await this.processCallbackQuery(brandId, callback);
    }
  }

  private async getOrCreateSubscriber(
    brandId: string,
    data: {
      chatId: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      languageCode?: string;
    }
  ): Promise<TelegramSubscriber> {
    const subscribers = this.subscribers.get(brandId) || [];
    let subscriber = subscribers.find(s => s.chatId === data.chatId);

    if (!subscriber) {
      subscriber = {
        id: `sub_${Date.now()}`,
        brandId,
        chatId: data.chatId,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        languageCode: data.languageCode,
        isActive: true,
        subscribedAt: new Date(),
        lastInteractionAt: new Date(),
        tags: [],
        metadata: {}
      };

      subscribers.push(subscriber);
      this.subscribers.set(brandId, subscribers);

      const bot = this.getBot(brandId);
      if (bot) {
        bot.stats.totalSubscribers++;
        bot.stats.activeSubscribers++;
      }
    } else {
      subscriber.lastInteractionAt = new Date();
      subscriber.firstName = data.firstName || subscriber.firstName;
      subscriber.lastName = data.lastName || subscriber.lastName;
    }

    return subscriber;
  }

  private async processAutomations(brandId: string, message: any): Promise<void> {
    const automations = this.automations.get(brandId) || [];
    const text = message.text || '';
    const chatId = message.chat.id.toString();

    for (const automation of automations) {
      if (!automation.isActive) continue;

      let shouldTrigger = false;

      switch (automation.trigger.type) {
        case 'command':
          if (text.startsWith('/' + automation.trigger.value)) {
            shouldTrigger = true;
          }
          break;
        case 'keyword':
          if (text.toLowerCase().includes(automation.trigger.value?.toLowerCase() || '')) {
            shouldTrigger = true;
          }
          break;
        case 'message':
          shouldTrigger = true;
          break;
      }

      if (shouldTrigger) {
        automation.stats.triggered++;
        await this.executeAutomationActions(brandId, chatId, automation.actions, message);
        automation.stats.completed++;
      }
    }
  }

  private async executeAutomationActions(
    brandId: string,
    chatId: string,
    actions: TelegramAutomation['actions'],
    context: any
  ): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case 'send_message':
          await this.sendMessage(brandId, chatId, action.config.text);
          break;
        case 'send_media':
          if (action.config.mediaType === 'photo') {
            await this.sendPhoto(brandId, chatId, action.config.mediaUrl, action.config.caption);
          }
          break;
        case 'add_tag':
          const subscribers = this.subscribers.get(brandId) || [];
          const sub = subscribers.find(s => s.chatId === chatId);
          if (sub && !sub.tags.includes(action.config.tag)) {
            sub.tags.push(action.config.tag);
          }
          break;
        case 'ai_response':
          break;
      }
    }
  }

  private async processCallbackQuery(brandId: string, callback: any): Promise<void> {
    const automations = this.automations.get(brandId) || [];
    const chatId = callback.message.chat.id.toString();

    for (const automation of automations) {
      if (!automation.isActive) continue;
      
      if (automation.trigger.type === 'callback' && 
          callback.data === automation.trigger.value) {
        await this.executeAutomationActions(brandId, chatId, automation.actions, callback);
      }
    }

    const bot = this.getBot(brandId);
    if (bot) {
      await fetch(`${TELEGRAM_API_BASE}/bot${bot.botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callback.id })
      });
    }
  }

  async createBroadcast(
    brandId: string,
    data: {
      name: string;
      message: string;
      mediaType?: 'photo' | 'video' | 'document';
      mediaUrl?: string;
      keyboard?: TelegramKeyboard;
      targetAudience: 'all' | 'tag' | 'segment';
      targetTags?: string[];
      scheduledAt?: Date;
    }
  ): Promise<TelegramBroadcast> {
    const broadcast: TelegramBroadcast = {
      id: `bc_${Date.now()}`,
      brandId,
      name: data.name,
      message: data.message,
      mediaType: data.mediaType,
      mediaUrl: data.mediaUrl,
      keyboard: data.keyboard,
      targetAudience: data.targetAudience,
      targetTags: data.targetTags,
      scheduledAt: data.scheduledAt,
      status: data.scheduledAt ? 'scheduled' : 'draft',
      stats: {
        totalRecipients: 0,
        delivered: 0,
        failed: 0
      },
      createdAt: new Date()
    };

    const existing = this.broadcasts.get(brandId) || [];
    existing.push(broadcast);
    this.broadcasts.set(brandId, existing);

    return broadcast;
  }

  async sendBroadcast(brandId: string, broadcastId: string): Promise<TelegramBroadcast> {
    const broadcasts = this.broadcasts.get(brandId) || [];
    const broadcast = broadcasts.find(b => b.id === broadcastId);
    
    if (!broadcast) {
      throw new Error('Broadcast not found');
    }

    broadcast.status = 'sending';
    
    let subscribers = this.subscribers.get(brandId) || [];
    
    if (broadcast.targetAudience === 'tag' && broadcast.targetTags) {
      subscribers = subscribers.filter(s => 
        s.isActive && s.tags.some(t => broadcast.targetTags!.includes(t))
      );
    } else {
      subscribers = subscribers.filter(s => s.isActive);
    }

    broadcast.stats.totalRecipients = subscribers.length;

    for (const subscriber of subscribers) {
      try {
        if (broadcast.mediaType === 'photo' && broadcast.mediaUrl) {
          await this.sendPhoto(brandId, subscriber.chatId, broadcast.mediaUrl, broadcast.message, broadcast.keyboard);
        } else {
          await this.sendMessage(brandId, subscriber.chatId, broadcast.message, { keyboard: broadcast.keyboard });
        }
        broadcast.stats.delivered++;
      } catch {
        broadcast.stats.failed++;
      }

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    broadcast.status = 'completed';
    broadcast.sentAt = new Date();

    return broadcast;
  }

  async createAutomation(
    brandId: string,
    data: {
      name: string;
      trigger: TelegramAutomation['trigger'];
      actions: TelegramAutomation['actions'];
    }
  ): Promise<TelegramAutomation> {
    const automation: TelegramAutomation = {
      id: `auto_${Date.now()}`,
      brandId,
      name: data.name,
      trigger: data.trigger,
      actions: data.actions,
      isActive: true,
      stats: {
        triggered: 0,
        completed: 0
      },
      createdAt: new Date()
    };

    const existing = this.automations.get(brandId) || [];
    existing.push(automation);
    this.automations.set(brandId, existing);

    return automation;
  }

  getAutomations(brandId: string): TelegramAutomation[] {
    return this.automations.get(brandId) || [];
  }

  getSubscribers(brandId: string, options?: { tag?: string; active?: boolean }): TelegramSubscriber[] {
    let subscribers = this.subscribers.get(brandId) || [];
    
    if (options?.active !== undefined) {
      subscribers = subscribers.filter(s => s.isActive === options.active);
    }
    
    if (options?.tag) {
      subscribers = subscribers.filter(s => s.tags.includes(options.tag));
    }
    
    return subscribers;
  }

  getMessages(brandId: string, chatId?: string, limit = 50): TelegramMessage[] {
    let messages = this.messages.get(brandId) || [];
    
    if (chatId) {
      messages = messages.filter(m => m.chatId === chatId);
    }
    
    return messages.slice(-limit);
  }

  getBroadcasts(brandId: string): TelegramBroadcast[] {
    return this.broadcasts.get(brandId) || [];
  }
}

export const telegramIntegrationService = new TelegramIntegrationService();
