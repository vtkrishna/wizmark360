import { db } from "../db";
import { eq, desc, and, sql, or } from "drizzle-orm";
import { WAISDKOrchestration, WAITask, WAITaskResult } from "./wai-sdk-orchestration";

const waiOrchestration = new WAISDKOrchestration();

export type MessageChannel = "instagram_dm" | "facebook_messenger" | "linkedin_dm" | "twitter_dm" | "whatsapp" | "email" | "sms";
export type ConversationStatus = "open" | "pending" | "resolved" | "closed" | "spam";
export type MessageDirection = "inbound" | "outbound";
export type Priority = "low" | "medium" | "high" | "urgent";
export type Sentiment = "positive" | "neutral" | "negative" | "mixed";

export interface InboxConnection {
  id: number;
  brandId: number;
  channel: MessageChannel;
  connectionName: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  accountId?: string;
  isActive: boolean;
  settings: {
    autoReply: boolean;
    assignmentRules: any[];
  };
  metadata: Record<string, any>;
}

export interface InboxConversation {
  id: number;
  connectionId: number;
  brandId: number;
  externalConversationId?: string;
  channel: MessageChannel;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAvatar?: string;
  contactExternalId?: string;
  subject?: string;
  status: ConversationStatus;
  priority: Priority;
  sentiment?: Sentiment;
  assigneeId?: string;
  assigneeName?: string;
  tags: string[];
  slaDeadline?: Date;
  slaBreached: boolean;
  firstResponseAt?: Date;
  lastMessageAt?: Date;
  unreadCount: number;
  messageCount: number;
  metadata: Record<string, any>;
}

export interface InboxMessage {
  id: number;
  conversationId: number;
  externalMessageId?: string;
  direction: MessageDirection;
  senderName?: string;
  senderEmail?: string;
  content: string;
  contentType: "text" | "image" | "video" | "file" | "audio";
  attachments: { url: string; type: string; name: string }[];
  isRead: boolean;
  aiSuggestion?: string;
  aiSuggestionUsed: boolean;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  metadata: Record<string, any>;
}

export interface QuickReply {
  id: number;
  brandId: number;
  title: string;
  content: string;
  category?: string;
  channels: MessageChannel[];
  usageCount: number;
  isActive: boolean;
  createdBy?: string;
}

export interface SLAConfiguration {
  id: number;
  brandId: number;
  name: string;
  channel?: MessageChannel;
  priority?: Priority;
  firstResponseTime?: number;
  resolutionTime?: number;
  businessHoursOnly: boolean;
  businessHours: {
    start: string;
    end: string;
    timezone: string;
    weekdays: number[];
  };
  isActive: boolean;
}

export interface AISuggestionResult {
  suggestion: string;
  confidence: number;
  reasoning: string;
  alternativeSuggestions: string[];
  quickReplyMatch?: number;
}

export class SmartInboxService {
  private async executeWithWAI<T>(
    task: Omit<WAITask, "id">,
    processor: (result: WAITaskResult) => T
  ): Promise<T> {
    const fullTask: WAITask = {
      ...task,
      id: `inbox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    const result = await waiOrchestration.executeTask(fullTask);
    return processor(result);
  }

  async getConnections(brandId: number): Promise<InboxConnection[]> {
    const result = await db.execute(sql`
      SELECT * FROM inbox_connections 
      WHERE brand_id = ${brandId} 
      ORDER BY created_at DESC
    `);
    return result.rows as InboxConnection[];
  }

  async getConnection(id: number): Promise<InboxConnection | null> {
    const result = await db.execute(sql`
      SELECT * FROM inbox_connections WHERE id = ${id} LIMIT 1
    `);
    return result.rows[0] as InboxConnection || null;
  }

  async createConnection(data: Omit<InboxConnection, "id">): Promise<InboxConnection> {
    const result = await db.execute(sql`
      INSERT INTO inbox_connections (
        brand_id, channel, connection_name, access_token, refresh_token,
        token_expires_at, account_id, is_active, settings, metadata
      ) VALUES (
        ${data.brandId}, ${data.channel}, ${data.connectionName},
        ${data.accessToken || null}, ${data.refreshToken || null},
        ${data.tokenExpiresAt || null}, ${data.accountId || null},
        ${data.isActive}, ${JSON.stringify(data.settings)},
        ${JSON.stringify(data.metadata)}
      )
      RETURNING *
    `);
    return result.rows[0] as InboxConnection;
  }

  async updateConnection(id: number, data: Partial<InboxConnection>): Promise<InboxConnection> {
    const result = await db.execute(sql`
      UPDATE inbox_connections SET
        connection_name = COALESCE(${data.connectionName}, connection_name),
        is_active = COALESCE(${data.isActive}, is_active),
        settings = COALESCE(${JSON.stringify(data.settings)}, settings),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `);
    return result.rows[0] as InboxConnection;
  }

  async getConversations(
    brandId: number,
    options?: {
      status?: ConversationStatus;
      channel?: MessageChannel;
      assigneeId?: string;
      priority?: Priority;
      unreadOnly?: boolean;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ conversations: InboxConversation[]; total: number }> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    
    let whereClause = `brand_id = ${brandId}`;
    if (options?.status) {
      whereClause += ` AND status = '${options.status}'`;
    }
    if (options?.channel) {
      whereClause += ` AND channel = '${options.channel}'`;
    }
    if (options?.assigneeId) {
      whereClause += ` AND assignee_id = '${options.assigneeId}'`;
    }
    if (options?.priority) {
      whereClause += ` AND priority = '${options.priority}'`;
    }
    if (options?.unreadOnly) {
      whereClause += ` AND unread_count > 0`;
    }
    if (options?.search) {
      whereClause += ` AND (contact_name ILIKE '%${options.search}%' OR contact_email ILIKE '%${options.search}%' OR subject ILIKE '%${options.search}%')`;
    }

    const countResult = await db.execute(sql`
      SELECT COUNT(*) as total FROM inbox_conversations WHERE ${sql.raw(whereClause)}
    `);
    const total = parseInt(countResult.rows[0]?.total || "0", 10);

    const result = await db.execute(sql`
      SELECT * FROM inbox_conversations 
      WHERE ${sql.raw(whereClause)}
      ORDER BY 
        CASE WHEN priority = 'urgent' THEN 1
             WHEN priority = 'high' THEN 2
             WHEN priority = 'medium' THEN 3
             ELSE 4 END,
        last_message_at DESC NULLS LAST
      LIMIT ${limit} OFFSET ${offset}
    `);
    
    return { conversations: result.rows as InboxConversation[], total };
  }

  async getConversation(id: number): Promise<InboxConversation | null> {
    const result = await db.execute(sql`
      SELECT * FROM inbox_conversations WHERE id = ${id} LIMIT 1
    `);
    return result.rows[0] as InboxConversation || null;
  }

  async createConversation(data: Omit<InboxConversation, "id">): Promise<InboxConversation> {
    const result = await db.execute(sql`
      INSERT INTO inbox_conversations (
        connection_id, brand_id, external_conversation_id, channel,
        contact_name, contact_email, contact_phone, contact_avatar,
        contact_external_id, subject, status, priority, sentiment,
        assignee_id, assignee_name, tags, sla_deadline, sla_breached,
        unread_count, message_count, metadata
      ) VALUES (
        ${data.connectionId}, ${data.brandId}, ${data.externalConversationId || null},
        ${data.channel}, ${data.contactName || null}, ${data.contactEmail || null},
        ${data.contactPhone || null}, ${data.contactAvatar || null},
        ${data.contactExternalId || null}, ${data.subject || null},
        ${data.status}, ${data.priority}, ${data.sentiment || null},
        ${data.assigneeId || null}, ${data.assigneeName || null},
        ${JSON.stringify(data.tags)}, ${data.slaDeadline || null},
        ${data.slaBreached}, ${data.unreadCount}, ${data.messageCount},
        ${JSON.stringify(data.metadata)}
      )
      RETURNING *
    `);
    return result.rows[0] as InboxConversation;
  }

  async updateConversation(id: number, data: Partial<InboxConversation>): Promise<InboxConversation> {
    const result = await db.execute(sql`
      UPDATE inbox_conversations SET
        status = COALESCE(${data.status}, status),
        priority = COALESCE(${data.priority}, priority),
        sentiment = COALESCE(${data.sentiment}, sentiment),
        assignee_id = COALESCE(${data.assigneeId}, assignee_id),
        assignee_name = COALESCE(${data.assigneeName}, assignee_name),
        tags = COALESCE(${JSON.stringify(data.tags || [])}, tags),
        unread_count = COALESCE(${data.unreadCount}, unread_count),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `);
    return result.rows[0] as InboxConversation;
  }

  async assignConversation(conversationId: number, assigneeId: string, assigneeName: string): Promise<InboxConversation> {
    return this.updateConversation(conversationId, { assigneeId, assigneeName });
  }

  async getMessages(conversationId: number, limit: number = 100, offset: number = 0): Promise<InboxMessage[]> {
    const result = await db.execute(sql`
      SELECT * FROM inbox_messages 
      WHERE conversation_id = ${conversationId}
      ORDER BY sent_at ASC
      LIMIT ${limit} OFFSET ${offset}
    `);
    return result.rows as InboxMessage[];
  }

  async getMessage(id: number): Promise<InboxMessage | null> {
    const result = await db.execute(sql`
      SELECT * FROM inbox_messages WHERE id = ${id} LIMIT 1
    `);
    return result.rows[0] as InboxMessage || null;
  }

  async createMessage(data: Omit<InboxMessage, "id">): Promise<InboxMessage> {
    const result = await db.execute(sql`
      INSERT INTO inbox_messages (
        conversation_id, external_message_id, direction, sender_name,
        sender_email, content, content_type, attachments, is_read,
        ai_suggestion, ai_suggestion_used, sent_at, delivered_at, read_at, metadata
      ) VALUES (
        ${data.conversationId}, ${data.externalMessageId || null},
        ${data.direction}, ${data.senderName || null}, ${data.senderEmail || null},
        ${data.content}, ${data.contentType}, ${JSON.stringify(data.attachments)},
        ${data.isRead}, ${data.aiSuggestion || null}, ${data.aiSuggestionUsed},
        ${data.sentAt.toISOString()}, ${data.deliveredAt?.toISOString() || null},
        ${data.readAt?.toISOString() || null}, ${JSON.stringify(data.metadata)}
      )
      RETURNING *
    `);

    if (data.direction === "inbound") {
      await db.execute(sql`
        UPDATE inbox_conversations SET
          unread_count = unread_count + 1,
          message_count = message_count + 1,
          last_message_at = NOW()
        WHERE id = ${data.conversationId}
      `);
    } else {
      await db.execute(sql`
        UPDATE inbox_conversations SET
          message_count = message_count + 1,
          last_message_at = NOW(),
          first_response_at = COALESCE(first_response_at, NOW())
        WHERE id = ${data.conversationId}
      `);
    }

    return result.rows[0] as InboxMessage;
  }

  async markMessageRead(messageId: number): Promise<void> {
    const message = await this.getMessage(messageId);
    if (message && !message.isRead) {
      await db.execute(sql`
        UPDATE inbox_messages SET is_read = true, read_at = NOW()
        WHERE id = ${messageId}
      `);
      
      await db.execute(sql`
        UPDATE inbox_conversations SET
          unread_count = GREATEST(0, unread_count - 1)
        WHERE id = ${message.conversationId}
      `);
    }
  }

  async markConversationRead(conversationId: number): Promise<void> {
    await db.execute(sql`
      UPDATE inbox_messages SET is_read = true, read_at = NOW()
      WHERE conversation_id = ${conversationId} AND is_read = false
    `);
    
    await db.execute(sql`
      UPDATE inbox_conversations SET unread_count = 0
      WHERE id = ${conversationId}
    `);
  }

  async generateAISuggestion(conversationId: number): Promise<AISuggestionResult> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const messages = await this.getMessages(conversationId, 20);
    const quickReplies = await this.getQuickReplies(conversation.brandId, conversation.channel);

    const task: Omit<WAITask, "id"> = {
      type: "support",
      vertical: "whatsapp",
      description: `Generate a helpful response suggestion for this customer conversation:
        
        Channel: ${conversation.channel}
        Contact: ${conversation.contactName} (${conversation.contactEmail || conversation.contactPhone || "Unknown"})
        Subject: ${conversation.subject || "General Inquiry"}
        Sentiment: ${conversation.sentiment || "Unknown"}
        
        Conversation History:
        ${messages.map(m => `${m.direction === "inbound" ? "Customer" : "Agent"}: ${m.content}`).join("\n")}
        
        Available Quick Replies:
        ${quickReplies.map(qr => `- ${qr.title}: ${qr.content.substring(0, 100)}...`).join("\n")}
        
        Generate a professional, empathetic response that:
        1. Addresses the customer's concern
        2. Provides helpful information
        3. Maintains brand voice
        
        Return JSON with "suggestion", "reasoning", and "alternativeSuggestions" array.`,
      priority: "high",
      requiredCapabilities: ["support", "chat"],
      targetJurisdictions: ["global"],
      language: "en",
      context: { conversation, messages, quickReplies },
    };

    return this.executeWithWAI(task, (result) => {
      try {
        const parsed = JSON.parse(result.response);
        return {
          suggestion: parsed.suggestion || result.response,
          confidence: result.confidence,
          reasoning: parsed.reasoning || "Based on conversation context",
          alternativeSuggestions: parsed.alternativeSuggestions || [],
          quickReplyMatch: this.findQuickReplyMatch(parsed.suggestion, quickReplies),
        };
      } catch {
        return {
          suggestion: result.response,
          confidence: result.confidence,
          reasoning: "AI-generated response",
          alternativeSuggestions: [],
        };
      }
    });
  }

  private findQuickReplyMatch(suggestion: string, quickReplies: QuickReply[]): number | undefined {
    for (const qr of quickReplies) {
      const similarity = this.calculateSimilarity(suggestion.toLowerCase(), qr.content.toLowerCase());
      if (similarity > 0.6) {
        return qr.id;
      }
    }
    return undefined;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w));
    return (2 * commonWords.length) / (words1.length + words2.length);
  }

  async analyzeSentiment(conversationId: number): Promise<{ sentiment: Sentiment; score: number; confidence: number }> {
    const messages = await this.getMessages(conversationId, 10);
    const inboundMessages = messages.filter(m => m.direction === "inbound");

    if (inboundMessages.length === 0) {
      return { sentiment: "neutral", score: 0.5, confidence: 0.5 };
    }

    const task: Omit<WAITask, "id"> = {
      type: "analysis",
      vertical: "social",
      description: `Analyze the sentiment of these customer messages:
        
        ${inboundMessages.map(m => m.content).join("\n---\n")}
        
        Return JSON with "sentiment" (positive/neutral/negative/mixed), "score" (0-1), and "reasoning".`,
      priority: "low",
      requiredCapabilities: ["analysis"],
      targetJurisdictions: ["global"],
      language: "en",
      context: { messages: inboundMessages },
    };

    return this.executeWithWAI(task, (result) => {
      try {
        const parsed = JSON.parse(result.response);
        const sentiment = parsed.sentiment as Sentiment || "neutral";
        
        db.execute(sql`
          UPDATE inbox_conversations SET sentiment = ${sentiment}
          WHERE id = ${conversationId}
        `);

        return {
          sentiment,
          score: parsed.score || 0.5,
          confidence: result.confidence,
        };
      } catch {
        return { sentiment: "neutral", score: 0.5, confidence: result.confidence };
      }
    });
  }

  async getQuickReplies(brandId: number, channel?: MessageChannel): Promise<QuickReply[]> {
    let query = `SELECT * FROM inbox_quick_replies WHERE brand_id = ${brandId} AND is_active = true`;
    
    if (channel) {
      query += ` AND (channels @> '["${channel}"]'::jsonb OR channels = '[]'::jsonb)`;
    }
    
    query += ` ORDER BY usage_count DESC`;

    const result = await db.execute(sql.raw(query));
    return result.rows as QuickReply[];
  }

  async createQuickReply(data: Omit<QuickReply, "id" | "usageCount">): Promise<QuickReply> {
    const result = await db.execute(sql`
      INSERT INTO inbox_quick_replies (
        brand_id, title, content, category, channels, is_active, created_by
      ) VALUES (
        ${data.brandId}, ${data.title}, ${data.content},
        ${data.category || null}, ${JSON.stringify(data.channels)},
        ${data.isActive}, ${data.createdBy || null}
      )
      RETURNING *
    `);
    return result.rows[0] as QuickReply;
  }

  async useQuickReply(quickReplyId: number): Promise<void> {
    await db.execute(sql`
      UPDATE inbox_quick_replies SET usage_count = usage_count + 1
      WHERE id = ${quickReplyId}
    `);
  }

  async getSLAConfigurations(brandId: number): Promise<SLAConfiguration[]> {
    const result = await db.execute(sql`
      SELECT * FROM sla_configurations 
      WHERE brand_id = ${brandId} AND is_active = true
      ORDER BY created_at DESC
    `);
    return result.rows as SLAConfiguration[];
  }

  async createSLAConfiguration(data: Omit<SLAConfiguration, "id">): Promise<SLAConfiguration> {
    const result = await db.execute(sql`
      INSERT INTO sla_configurations (
        brand_id, name, channel, priority, first_response_time,
        resolution_time, business_hours_only, business_hours, is_active
      ) VALUES (
        ${data.brandId}, ${data.name}, ${data.channel || null},
        ${data.priority || null}, ${data.firstResponseTime || null},
        ${data.resolutionTime || null}, ${data.businessHoursOnly},
        ${JSON.stringify(data.businessHours)}, ${data.isActive}
      )
      RETURNING *
    `);
    return result.rows[0] as SLAConfiguration;
  }

  async calculateSLADeadline(conversationId: number): Promise<Date | null> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) return null;

    const slaConfigs = await this.getSLAConfigurations(conversation.brandId);
    
    let applicableConfig = slaConfigs.find(
      c => c.channel === conversation.channel && c.priority === conversation.priority
    ) || slaConfigs.find(c => c.channel === conversation.channel)
      || slaConfigs.find(c => c.priority === conversation.priority)
      || slaConfigs[0];

    if (!applicableConfig || !applicableConfig.firstResponseTime) {
      return null;
    }

    const deadline = new Date();
    deadline.setMinutes(deadline.getMinutes() + applicableConfig.firstResponseTime);

    await db.execute(sql`
      UPDATE inbox_conversations SET sla_deadline = ${deadline.toISOString()}
      WHERE id = ${conversationId}
    `);

    return deadline;
  }

  async checkSLABreaches(brandId: number): Promise<InboxConversation[]> {
    const result = await db.execute(sql`
      UPDATE inbox_conversations SET 
        sla_breached = true
      WHERE brand_id = ${brandId}
        AND sla_deadline IS NOT NULL
        AND sla_deadline < NOW()
        AND first_response_at IS NULL
        AND sla_breached = false
      RETURNING *
    `);
    return result.rows as InboxConversation[];
  }

  async getInboxStats(brandId: number): Promise<{
    totalConversations: number;
    openConversations: number;
    unreadCount: number;
    avgResponseTime: number;
    slaBreachCount: number;
    byChannel: Record<string, number>;
    bySentiment: Record<string, number>;
  }> {
    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
        SUM(unread_count) as unread,
        SUM(CASE WHEN sla_breached = true THEN 1 ELSE 0 END) as breached,
        AVG(EXTRACT(EPOCH FROM (first_response_at - created_at)) / 60) as avg_response
      FROM inbox_conversations
      WHERE brand_id = ${brandId}
    `);

    const byChannel = await db.execute(sql`
      SELECT channel, COUNT(*) as count
      FROM inbox_conversations
      WHERE brand_id = ${brandId}
      GROUP BY channel
    `);

    const bySentiment = await db.execute(sql`
      SELECT sentiment, COUNT(*) as count
      FROM inbox_conversations
      WHERE brand_id = ${brandId} AND sentiment IS NOT NULL
      GROUP BY sentiment
    `);

    const channelCounts: Record<string, number> = {};
    for (const row of byChannel.rows) {
      channelCounts[row.channel] = parseInt(row.count, 10);
    }

    const sentimentCounts: Record<string, number> = {};
    for (const row of bySentiment.rows) {
      sentimentCounts[row.sentiment] = parseInt(row.count, 10);
    }

    return {
      totalConversations: parseInt(stats.rows[0]?.total || "0", 10),
      openConversations: parseInt(stats.rows[0]?.open_count || "0", 10),
      unreadCount: parseInt(stats.rows[0]?.unread || "0", 10),
      avgResponseTime: parseFloat(stats.rows[0]?.avg_response || "0"),
      slaBreachCount: parseInt(stats.rows[0]?.breached || "0", 10),
      byChannel: channelCounts,
      bySentiment: sentimentCounts,
    };
  }

  async autoAssignConversation(conversationId: number): Promise<InboxConversation | null> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation || conversation.assigneeId) return conversation;

    const connection = await this.getConnection(conversation.connectionId);
    if (!connection) return conversation;

    const rules = connection.settings.assignmentRules || [];
    
    for (const rule of rules) {
      if (this.matchesRule(conversation, rule)) {
        return this.assignConversation(
          conversationId,
          rule.assignTo,
          rule.assignToName || "Auto-assigned"
        );
      }
    }

    return conversation;
  }

  private matchesRule(conversation: InboxConversation, rule: any): boolean {
    if (!rule.conditions) return false;

    for (const condition of rule.conditions) {
      const value = (conversation as any)[condition.field];
      
      switch (condition.operator) {
        case "equals":
          if (value !== condition.value) return false;
          break;
        case "contains":
          if (!String(value).toLowerCase().includes(String(condition.value).toLowerCase())) return false;
          break;
        case "in":
          if (!condition.value.includes(value)) return false;
          break;
      }
    }

    return true;
  }

  async sendReply(
    conversationId: number,
    content: string,
    options?: {
      useAISuggestion?: boolean;
      quickReplyId?: number;
      senderId?: string;
      senderName?: string;
    }
  ): Promise<InboxMessage> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (options?.quickReplyId) {
      await this.useQuickReply(options.quickReplyId);
    }

    const message = await this.createMessage({
      conversationId,
      direction: "outbound",
      senderName: options?.senderName || "Agent",
      senderEmail: options?.senderId,
      content,
      contentType: "text",
      attachments: [],
      isRead: true,
      aiSuggestionUsed: options?.useAISuggestion || false,
      sentAt: new Date(),
      metadata: {},
    });

    return message;
  }
}

export const smartInboxService = new SmartInboxService();
