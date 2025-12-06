import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const marketingVerticals = [
  "social",
  "seo",
  "web",
  "sales",
  "whatsapp",
  "linkedin",
  "performance"
] as const;

export type MarketingVertical = typeof marketingVerticals[number];

export const campaigns = pgTable("market360_campaigns", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id"),
  name: varchar("name", { length: 255 }).notNull(),
  vertical: varchar("vertical", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("draft"),
  budget: numeric("budget", { precision: 12, scale: 2 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  config: jsonb("config").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const analyticsSnapshots = pgTable("market360_analytics_snapshots", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  vertical: varchar("vertical", { length: 50 }).notNull(),
  metrics: jsonb("metrics").default('{}'),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const socialPosts = pgTable("market360_social_posts", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  platform: varchar("platform", { length: 50 }).notNull(),
  content: text("content"),
  mediaUrls: jsonb("media_urls").default('[]'),
  status: varchar("status", { length: 50 }).default("draft"),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  engagement: jsonb("engagement").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const seoAudits = pgTable("market360_seo_audits", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  url: varchar("url", { length: 512 }),
  scores: jsonb("scores").default('{}'),
  recommendations: jsonb("recommendations").default('[]'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("market360_leads", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  company: varchar("company", { length: 255 }),
  source: varchar("source", { length: 100 }),
  status: varchar("status", { length: 50 }).default("new"),
  score: integer("score").default(0),
  metadata: jsonb("metadata").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const performanceAds = pgTable("market360_performance_ads", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  platform: varchar("platform", { length: 50 }).notNull(),
  adId: varchar("ad_id", { length: 255 }),
  name: varchar("name", { length: 255 }),
  status: varchar("status", { length: 50 }).default("paused"),
  spend: numeric("spend", { precision: 12, scale: 2 }).default("0"),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  roas: numeric("roas", { precision: 8, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const whatsappConversations = pgTable("market360_whatsapp_conversations", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  phoneNumber: varchar("phone_number", { length: 50 }),
  status: varchar("status", { length: 50 }).default("active"),
  messages: jsonb("messages").default('[]'),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const linkedinActivities = pgTable("market360_linkedin_activities", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  profileUrl: varchar("profile_url", { length: 512 }),
  activityType: varchar("activity_type", { length: 50 }),
  content: text("content"),
  engagement: jsonb("engagement").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSocialPostSchema = createInsertSchema(socialPosts).omit({ id: true, createdAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertPerformanceAdSchema = createInsertSchema(performanceAds).omit({ id: true, createdAt: true });

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type PerformanceAd = typeof performanceAds.$inferSelect;
export type InsertPerformanceAd = z.infer<typeof insertPerformanceAdSchema>;
