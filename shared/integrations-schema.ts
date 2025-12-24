import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index, numeric, uuid } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const crmProviders = ["hubspot", "salesforce", "zoho", "pipedrive"] as const;
export type CRMProvider = typeof crmProviders[number];

export const socialPlatforms = ["instagram", "facebook", "linkedin", "twitter", "tiktok", "youtube"] as const;
export type SocialPlatform = typeof socialPlatforms[number];

export const messageChannels = ["instagram_dm", "facebook_messenger", "linkedin_dm", "twitter_dm", "whatsapp", "email", "sms"] as const;
export type MessageChannel = typeof messageChannels[number];

export const approvalStatuses = ["draft", "pending_internal", "pending_client", "approved", "rejected", "scheduled", "published", "failed"] as const;
export type ApprovalStatus = typeof approvalStatuses[number];

export const crmConnections = pgTable("crm_connections", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull(),
  provider: varchar("provider", { length: 50 }).notNull().$type<CRMProvider>(),
  connectionName: varchar("connection_name", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  accountId: varchar("account_id", { length: 255 }),
  portalId: varchar("portal_id", { length: 255 }),
  isActive: boolean("is_active").default(true),
  syncSettings: jsonb("sync_settings").default('{"contacts": true, "deals": true, "companies": true, "activities": true}'),
  lastSyncAt: timestamp("last_sync_at"),
  syncStatus: varchar("sync_status", { length: 50 }).default("idle"),
  metadata: jsonb("metadata").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  brandProviderIdx: index("crm_conn_brand_provider_idx").on(table.brandId, table.provider),
  activeIdx: index("crm_conn_active_idx").on(table.isActive),
}));

export const crmContacts = pgTable("crm_contacts", {
  id: serial("id").primaryKey(),
  connectionId: integer("connection_id").references(() => crmConnections.id).notNull(),
  brandId: integer("brand_id").notNull(),
  externalId: varchar("external_id", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  jobTitle: varchar("job_title", { length: 255 }),
  lifecycleStage: varchar("lifecycle_stage", { length: 100 }),
  leadStatus: varchar("lead_status", { length: 100 }),
  leadScore: integer("lead_score").default(0),
  lastActivityAt: timestamp("last_activity_at"),
  ownerId: varchar("owner_id", { length: 255 }),
  source: varchar("source", { length: 100 }),
  tags: jsonb("tags").default('[]'),
  customFields: jsonb("custom_fields").default('{}'),
  syncedAt: timestamp("synced_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  connectionIdx: index("crm_contact_conn_idx").on(table.connectionId),
  brandIdx: index("crm_contact_brand_idx").on(table.brandId),
  externalIdx: index("crm_contact_external_idx").on(table.externalId),
  emailIdx: index("crm_contact_email_idx").on(table.email),
}));

export const crmDeals = pgTable("crm_deals", {
  id: serial("id").primaryKey(),
  connectionId: integer("connection_id").references(() => crmConnections.id).notNull(),
  brandId: integer("brand_id").notNull(),
  externalId: varchar("external_id", { length: 255 }).notNull(),
  contactId: integer("contact_id").references(() => crmContacts.id),
  dealName: varchar("deal_name", { length: 500 }).notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  stage: varchar("stage", { length: 100 }),
  pipeline: varchar("pipeline", { length: 255 }),
  probability: integer("probability"),
  closeDate: timestamp("close_date"),
  ownerId: varchar("owner_id", { length: 255 }),
  lostReason: text("lost_reason"),
  wonReason: text("won_reason"),
  customFields: jsonb("custom_fields").default('{}'),
  syncedAt: timestamp("synced_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  connectionIdx: index("crm_deal_conn_idx").on(table.connectionId),
  brandIdx: index("crm_deal_brand_idx").on(table.brandId),
  stageIdx: index("crm_deal_stage_idx").on(table.stage),
}));

export const crmActivities = pgTable("crm_activities", {
  id: serial("id").primaryKey(),
  connectionId: integer("connection_id").references(() => crmConnections.id).notNull(),
  brandId: integer("brand_id").notNull(),
  externalId: varchar("external_id", { length: 255 }),
  contactId: integer("contact_id").references(() => crmContacts.id),
  dealId: integer("deal_id").references(() => crmDeals.id),
  activityType: varchar("activity_type", { length: 100 }).notNull(),
  subject: varchar("subject", { length: 500 }),
  body: text("body"),
  direction: varchar("direction", { length: 20 }),
  status: varchar("status", { length: 50 }),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  ownerId: varchar("owner_id", { length: 255 }),
  metadata: jsonb("metadata").default('{}'),
  syncedAt: timestamp("synced_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  connectionIdx: index("crm_activity_conn_idx").on(table.connectionId),
  typeIdx: index("crm_activity_type_idx").on(table.activityType),
}));

export const crmSyncLogs = pgTable("crm_sync_logs", {
  id: serial("id").primaryKey(),
  connectionId: integer("connection_id").references(() => crmConnections.id).notNull(),
  syncType: varchar("sync_type", { length: 50 }).notNull(),
  direction: varchar("direction", { length: 20 }).notNull(),
  recordsProcessed: integer("records_processed").default(0),
  recordsCreated: integer("records_created").default(0),
  recordsUpdated: integer("records_updated").default(0),
  recordsFailed: integer("records_failed").default(0),
  status: varchar("status", { length: 50 }).notNull(),
  errorMessage: text("error_message"),
  duration: integer("duration"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const socialConnections = pgTable("social_connections", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull(),
  platform: varchar("platform", { length: 50 }).notNull().$type<SocialPlatform>(),
  connectionName: varchar("connection_name", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  pageId: varchar("page_id", { length: 255 }),
  pageName: varchar("page_name", { length: 255 }),
  profileId: varchar("profile_id", { length: 255 }),
  profileUrl: varchar("profile_url", { length: 512 }),
  permissions: jsonb("permissions").default('[]'),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  brandPlatformIdx: index("social_conn_brand_platform_idx").on(table.brandId, table.platform),
  activeIdx: index("social_conn_active_idx").on(table.isActive),
}));

export const contentCalendar = pgTable("content_calendar", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  contentType: varchar("content_type", { length: 50 }).notNull(),
  platforms: jsonb("platforms").default('[]').$type<SocialPlatform[]>(),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  status: varchar("status", { length: 50 }).default("draft").$type<ApprovalStatus>(),
  priority: varchar("priority", { length: 20 }).default("medium"),
  campaignId: integer("campaign_id"),
  creatorId: varchar("creator_id", { length: 255 }),
  assigneeId: varchar("assignee_id", { length: 255 }),
  tags: jsonb("tags").default('[]'),
  metadata: jsonb("metadata").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  brandIdx: index("content_cal_brand_idx").on(table.brandId),
  statusIdx: index("content_cal_status_idx").on(table.status),
  scheduledIdx: index("content_cal_scheduled_idx").on(table.scheduledAt),
}));

export const contentVersions = pgTable("content_versions", {
  id: serial("id").primaryKey(),
  calendarItemId: integer("calendar_item_id").references(() => contentCalendar.id).notNull(),
  version: integer("version").notNull().default(1),
  content: jsonb("content").notNull(),
  caption: text("caption"),
  hashtags: jsonb("hashtags").default('[]'),
  mediaUrls: jsonb("media_urls").default('[]'),
  platformVariants: jsonb("platform_variants").default('{}'),
  createdBy: varchar("created_by", { length: 255 }),
  changeNotes: text("change_notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  calendarItemIdx: index("content_ver_item_idx").on(table.calendarItemId),
}));

export const contentApprovals = pgTable("content_approvals", {
  id: serial("id").primaryKey(),
  calendarItemId: integer("calendar_item_id").references(() => contentCalendar.id).notNull(),
  versionId: integer("version_id").references(() => contentVersions.id).notNull(),
  approvalType: varchar("approval_type", { length: 50 }).notNull(),
  approverId: varchar("approver_id", { length: 255 }),
  approverEmail: varchar("approver_email", { length: 255 }),
  approverName: varchar("approver_name", { length: 255 }),
  status: varchar("status", { length: 50 }).default("pending"),
  magicLinkToken: varchar("magic_link_token", { length: 255 }),
  magicLinkExpiresAt: timestamp("magic_link_expires_at"),
  feedback: text("feedback"),
  requestedAt: timestamp("requested_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
}, (table) => ({
  calendarItemIdx: index("content_appr_item_idx").on(table.calendarItemId),
  tokenIdx: index("content_appr_token_idx").on(table.magicLinkToken),
}));

export const publishedPosts = pgTable("published_posts", {
  id: serial("id").primaryKey(),
  calendarItemId: integer("calendar_item_id").references(() => contentCalendar.id).notNull(),
  connectionId: integer("connection_id").references(() => socialConnections.id).notNull(),
  platform: varchar("platform", { length: 50 }).notNull().$type<SocialPlatform>(),
  externalPostId: varchar("external_post_id", { length: 255 }),
  postUrl: varchar("post_url", { length: 1024 }),
  status: varchar("status", { length: 50 }).default("published"),
  publishedAt: timestamp("published_at").defaultNow(),
  engagement: jsonb("engagement").default('{"likes": 0, "comments": 0, "shares": 0, "impressions": 0, "reach": 0}'),
  lastEngagementSyncAt: timestamp("last_engagement_sync_at"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  calendarItemIdx: index("pub_post_item_idx").on(table.calendarItemId),
  platformIdx: index("pub_post_platform_idx").on(table.platform),
}));

export const inboxConnections = pgTable("inbox_connections", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull(),
  channel: varchar("channel", { length: 50 }).notNull().$type<MessageChannel>(),
  connectionName: varchar("connection_name", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  accountId: varchar("account_id", { length: 255 }),
  isActive: boolean("is_active").default(true),
  settings: jsonb("settings").default('{"autoReply": false, "assignmentRules": []}'),
  metadata: jsonb("metadata").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  brandChannelIdx: index("inbox_conn_brand_channel_idx").on(table.brandId, table.channel),
}));

export const inboxConversations = pgTable("inbox_conversations", {
  id: serial("id").primaryKey(),
  connectionId: integer("connection_id").references(() => inboxConnections.id).notNull(),
  brandId: integer("brand_id").notNull(),
  externalConversationId: varchar("external_conversation_id", { length: 255 }),
  channel: varchar("channel", { length: 50 }).notNull().$type<MessageChannel>(),
  contactName: varchar("contact_name", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  contactAvatar: varchar("contact_avatar", { length: 1024 }),
  contactExternalId: varchar("contact_external_id", { length: 255 }),
  subject: varchar("subject", { length: 500 }),
  status: varchar("status", { length: 50 }).default("open"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  sentiment: varchar("sentiment", { length: 20 }),
  assigneeId: varchar("assignee_id", { length: 255 }),
  assigneeName: varchar("assignee_name", { length: 255 }),
  tags: jsonb("tags").default('[]'),
  slaDeadline: timestamp("sla_deadline"),
  slaBreached: boolean("sla_breached").default(false),
  firstResponseAt: timestamp("first_response_at"),
  lastMessageAt: timestamp("last_message_at"),
  unreadCount: integer("unread_count").default(0),
  messageCount: integer("message_count").default(0),
  metadata: jsonb("metadata").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  brandIdx: index("inbox_conv_brand_idx").on(table.brandId),
  channelIdx: index("inbox_conv_channel_idx").on(table.channel),
  statusIdx: index("inbox_conv_status_idx").on(table.status),
  assigneeIdx: index("inbox_conv_assignee_idx").on(table.assigneeId),
}));

export const inboxMessages = pgTable("inbox_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => inboxConversations.id).notNull(),
  externalMessageId: varchar("external_message_id", { length: 255 }),
  direction: varchar("direction", { length: 20 }).notNull(),
  senderName: varchar("sender_name", { length: 255 }),
  senderEmail: varchar("sender_email", { length: 255 }),
  content: text("content").notNull(),
  contentType: varchar("content_type", { length: 50 }).default("text"),
  attachments: jsonb("attachments").default('[]'),
  isRead: boolean("is_read").default(false),
  aiSuggestion: text("ai_suggestion"),
  aiSuggestionUsed: boolean("ai_suggestion_used").default(false),
  sentAt: timestamp("sent_at").defaultNow(),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  metadata: jsonb("metadata").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  conversationIdx: index("inbox_msg_conv_idx").on(table.conversationId),
  directionIdx: index("inbox_msg_dir_idx").on(table.direction),
}));

export const inboxQuickReplies = pgTable("inbox_quick_replies", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  channels: jsonb("channels").default('[]').$type<MessageChannel[]>(),
  usageCount: integer("usage_count").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inboxAssignmentRules = pgTable("inbox_assignment_rules", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  priority: integer("priority").default(0),
  conditions: jsonb("conditions").notNull(),
  assignTo: varchar("assign_to", { length: 255 }),
  assignToTeam: varchar("assign_to_team", { length: 255 }),
  addTags: jsonb("add_tags").default('[]'),
  setPriority: varchar("set_priority", { length: 20 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const slaConfigurations = pgTable("sla_configurations", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  channel: varchar("channel", { length: 50 }).$type<MessageChannel>(),
  priority: varchar("priority", { length: 20 }),
  firstResponseTime: integer("first_response_time"),
  resolutionTime: integer("resolution_time"),
  businessHoursOnly: boolean("business_hours_only").default(true),
  businessHours: jsonb("business_hours").default('{"start": "09:00", "end": "18:00", "timezone": "UTC", "weekdays": [1,2,3,4,5]}'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const adPlatformConnections = pgTable("ad_platform_connections", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  connectionName: varchar("connection_name", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  accountId: varchar("account_id", { length: 255 }),
  accountName: varchar("account_name", { length: 255 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  timezone: varchar("timezone", { length: 100 }),
  isActive: boolean("is_active").default(true),
  permissions: jsonb("permissions").default('[]'),
  lastSyncAt: timestamp("last_sync_at"),
  metadata: jsonb("metadata").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  brandPlatformIdx: index("ad_conn_brand_platform_idx").on(table.brandId, table.platform),
}));

export const adCampaigns = pgTable("ad_campaigns", {
  id: serial("id").primaryKey(),
  connectionId: integer("connection_id").references(() => adPlatformConnections.id).notNull(),
  brandId: integer("brand_id").notNull(),
  externalCampaignId: varchar("external_campaign_id", { length: 255 }),
  name: varchar("name", { length: 500 }).notNull(),
  objective: varchar("objective", { length: 100 }),
  status: varchar("status", { length: 50 }).default("paused"),
  budget: numeric("budget", { precision: 15, scale: 2 }),
  budgetType: varchar("budget_type", { length: 50 }),
  spend: numeric("spend", { precision: 15, scale: 2 }).default("0"),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  revenue: numeric("revenue", { precision: 15, scale: 2 }).default("0"),
  roas: numeric("roas", { precision: 10, scale: 4 }),
  cpc: numeric("cpc", { precision: 10, scale: 4 }),
  cpm: numeric("cpm", { precision: 10, scale: 4 }),
  cpa: numeric("cpa", { precision: 10, scale: 4 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  targeting: jsonb("targeting").default('{}'),
  lastSyncAt: timestamp("last_sync_at"),
  metadata: jsonb("metadata").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  connectionIdx: index("ad_camp_conn_idx").on(table.connectionId),
  brandIdx: index("ad_camp_brand_idx").on(table.brandId),
  statusIdx: index("ad_camp_status_idx").on(table.status),
}));

export const adCreatives = pgTable("ad_creatives", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => adCampaigns.id).notNull(),
  externalCreativeId: varchar("external_creative_id", { length: 255 }),
  name: varchar("name", { length: 500 }).notNull(),
  format: varchar("format", { length: 50 }),
  headline: varchar("headline", { length: 500 }),
  description: text("description"),
  callToAction: varchar("call_to_action", { length: 100 }),
  mediaUrls: jsonb("media_urls").default('[]'),
  destinationUrl: varchar("destination_url", { length: 2048 }),
  status: varchar("status", { length: 50 }).default("active"),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  spend: numeric("spend", { precision: 15, scale: 2 }).default("0"),
  fatigueScore: integer("fatigue_score").default(0),
  lastPerformanceSyncAt: timestamp("last_performance_sync_at"),
  metadata: jsonb("metadata").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  campaignIdx: index("ad_creative_camp_idx").on(table.campaignId),
}));

export const budgetAlerts = pgTable("budget_alerts", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => adCampaigns.id).notNull(),
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  threshold: numeric("threshold", { precision: 10, scale: 2 }),
  thresholdType: varchar("threshold_type", { length: 20 }),
  currentValue: numeric("current_value", { precision: 15, scale: 2 }),
  isTriggered: boolean("is_triggered").default(false),
  triggeredAt: timestamp("triggered_at"),
  notifiedAt: timestamp("notified_at"),
  action: varchar("action", { length: 50 }),
  metadata: jsonb("metadata").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCrmConnectionSchema = createInsertSchema(crmConnections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCrmContactSchema = createInsertSchema(crmContacts).omit({ id: true, createdAt: true, updatedAt: true, syncedAt: true });
export const insertCrmDealSchema = createInsertSchema(crmDeals).omit({ id: true, createdAt: true, updatedAt: true, syncedAt: true });
export const insertSocialConnectionSchema = createInsertSchema(socialConnections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContentCalendarSchema = createInsertSchema(contentCalendar).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContentVersionSchema = createInsertSchema(contentVersions).omit({ id: true, createdAt: true });
export const insertContentApprovalSchema = createInsertSchema(contentApprovals).omit({ id: true, requestedAt: true });
export const insertInboxConnectionSchema = createInsertSchema(inboxConnections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInboxConversationSchema = createInsertSchema(inboxConversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInboxMessageSchema = createInsertSchema(inboxMessages).omit({ id: true, createdAt: true });
export const insertAdPlatformConnectionSchema = createInsertSchema(adPlatformConnections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAdCampaignSchema = createInsertSchema(adCampaigns).omit({ id: true, createdAt: true, updatedAt: true });

export type CrmConnection = typeof crmConnections.$inferSelect;
export type InsertCrmConnection = z.infer<typeof insertCrmConnectionSchema>;
export type CrmContact = typeof crmContacts.$inferSelect;
export type InsertCrmContact = z.infer<typeof insertCrmContactSchema>;
export type CrmDeal = typeof crmDeals.$inferSelect;
export type InsertCrmDeal = z.infer<typeof insertCrmDealSchema>;
export type SocialConnection = typeof socialConnections.$inferSelect;
export type InsertSocialConnection = z.infer<typeof insertSocialConnectionSchema>;
export type ContentCalendarItem = typeof contentCalendar.$inferSelect;
export type InsertContentCalendarItem = z.infer<typeof insertContentCalendarSchema>;
export type ContentVersion = typeof contentVersions.$inferSelect;
export type InsertContentVersion = z.infer<typeof insertContentVersionSchema>;
export type ContentApproval = typeof contentApprovals.$inferSelect;
export type InsertContentApproval = z.infer<typeof insertContentApprovalSchema>;
export type InboxConnection = typeof inboxConnections.$inferSelect;
export type InsertInboxConnection = z.infer<typeof insertInboxConnectionSchema>;
export type InboxConversation = typeof inboxConversations.$inferSelect;
export type InsertInboxConversation = z.infer<typeof insertInboxConversationSchema>;
export type InboxMessage = typeof inboxMessages.$inferSelect;
export type InsertInboxMessage = z.infer<typeof insertInboxMessageSchema>;
export type AdPlatformConnection = typeof adPlatformConnections.$inferSelect;
export type InsertAdPlatformConnection = z.infer<typeof insertAdPlatformConnectionSchema>;
export type AdCampaign = typeof adCampaigns.$inferSelect;
export type InsertAdCampaign = z.infer<typeof insertAdCampaignSchema>;
