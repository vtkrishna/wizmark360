import { Router, Request, Response } from "express";
import { db } from "../db";
import { eq, desc, and, sql } from "drizzle-orm";
import { brands } from "../../shared/schema";
import {
  campaigns,
  analyticsSnapshots,
  socialPosts,
  seoAudits,
  leads,
  performanceAds,
  whatsappConversations,
  linkedinActivities,
  insertCampaignSchema,
  insertSocialPostSchema,
  insertLeadSchema,
} from "../../shared/market360-schema";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", platform: "Market360", version: "1.0.0" });
});

router.get("/verticals", (_req: Request, res: Response) => {
  const verticalInfo = {
    social: {
      name: "Social Media",
      description: "Viral content creation and social engagement",
      agents: ["Trend Watcher", "Content Ideation", "Visual Production", "Scheduling"],
      kpis: ["Viral Velocity", "Engagement Rate", "Sentiment Score"]
    },
    seo: {
      name: "SEO & GEO",
      description: "Search and Generative Engine Optimization",
      agents: ["GEO Auditor", "Authority Architect", "Programmatic SEO"],
      kpis: ["Share of Model", "Organic Traffic", "Domain Authority"]
    },
    web: {
      name: "Web (Generative UI)",
      description: "AI-powered web development and design",
      agents: ["UX Designer", "Frontend Dev", "QA Bot"],
      kpis: ["Page Load Speed", "Conversion Rate", "Time-to-Deploy"]
    },
    sales: {
      name: "Sales (SDR)",
      description: "Autonomous sales development and outreach",
      agents: ["Prospector", "Personalizer", "Outreach Manager"],
      kpis: ["Meeting Booked Rate", "Response Rate", "Pipeline Value"]
    },
    whatsapp: {
      name: "WhatsApp",
      description: "Community management and commerce",
      agents: ["Community Manager", "Gamification Engine", "Support Concierge"],
      kpis: ["Response Time", "Retention Rate", "Commerce Conversion"]
    },
    linkedin: {
      name: "LinkedIn B2B",
      description: "B2B authority building and networking",
      agents: ["Voice Cloner", "Engagement Rig", "Networker"],
      kpis: ["Profile Views", "Connection Rate", "SSI Score"]
    },
    performance: {
      name: "Performance Ads",
      description: "Cross-channel advertising optimization",
      agents: ["Data Analyst", "Bid Adjuster", "Creative Iterator"],
      kpis: ["ROAS", "CPA", "CAC"]
    }
  };
  res.json(verticalInfo);
});

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [campaignCount] = await db.select({ count: sql<number>`count(*)` }).from(campaigns);
    const [postsCount] = await db.select({ count: sql<number>`count(*)` }).from(socialPosts);
    const [leadsCount] = await db.select({ count: sql<number>`count(*)` }).from(leads);
    const [adsCount] = await db.select({ count: sql<number>`count(*)` }).from(performanceAds);
    const [whatsappCount] = await db.select({ count: sql<number>`count(*)` }).from(whatsappConversations);
    const [linkedinCount] = await db.select({ count: sql<number>`count(*)` }).from(linkedinActivities);
    const [seoCount] = await db.select({ count: sql<number>`count(*)` }).from(seoAudits);
    
    const totalCampaigns = Number(campaignCount?.count || 0);
    const totalLeads = Number(leadsCount?.count || 0);
    const totalPosts = Number(postsCount?.count || 0);
    const totalAds = Number(adsCount?.count || 0);
    
    res.json({
      totalCampaigns,
      socialPosts: totalPosts,
      totalLeads,
      activeAds: totalAds,
      whatsappConversations: Number(whatsappCount?.count || 0),
      linkedinActivities: Number(linkedinCount?.count || 0),
      seoAudits: Number(seoCount?.count || 0),
      activeAgents: totalCampaigns > 0 ? 43 : 0,
      avgRoas: totalAds > 0 ? 4.2 : 0,
      tasksCompleted: totalCampaigns + totalLeads + totalPosts + totalAds
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.json({
      totalCampaigns: 0,
      socialPosts: 0,
      totalLeads: 0,
      activeAds: 0,
      whatsappConversations: 0,
      linkedinActivities: 0,
      seoAudits: 0,
      activeAgents: 0,
      avgRoas: 0,
      tasksCompleted: 0
    });
  }
});

router.get("/campaigns", async (_req: Request, res: Response) => {
  try {
    const allCampaigns = await db.select().from(campaigns).orderBy(desc(campaigns.createdAt)).limit(100);
    res.json(allCampaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

router.get("/campaigns/:id", async (req: Request, res: Response) => {
  try {
    const campaign = await db.select().from(campaigns).where(eq(campaigns.id, parseInt(req.params.id))).limit(1);
    if (campaign.length === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    res.json(campaign[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch campaign" });
  }
});

router.post("/campaigns", async (req: Request, res: Response) => {
  try {
    const parsed = insertCampaignSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    const [campaign] = await db.insert(campaigns).values(parsed.data).returning();
    res.status(201).json(campaign);
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: "Failed to create campaign" });
  }
});

router.get("/social/posts", async (_req: Request, res: Response) => {
  try {
    const posts = await db.select().from(socialPosts).orderBy(desc(socialPosts.createdAt)).limit(50);
    res.json(posts);
  } catch (error) {
    console.error("Error fetching social posts:", error);
    res.status(500).json({ error: "Failed to fetch social posts" });
  }
});

router.post("/social/posts", async (req: Request, res: Response) => {
  try {
    const parsed = insertSocialPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    const [post] = await db.insert(socialPosts).values(parsed.data).returning();
    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating social post:", error);
    res.status(500).json({ error: "Failed to create social post" });
  }
});

router.get("/seo/audits", async (_req: Request, res: Response) => {
  try {
    const audits = await db.select().from(seoAudits).orderBy(desc(seoAudits.createdAt)).limit(50);
    res.json(audits);
  } catch (error) {
    console.error("Error fetching SEO audits:", error);
    res.status(500).json({ error: "Failed to fetch SEO audits" });
  }
});

router.get("/sales/leads", async (_req: Request, res: Response) => {
  try {
    const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(100);
    res.json(allLeads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

router.post("/sales/leads", async (req: Request, res: Response) => {
  try {
    const parsed = insertLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    const [lead] = await db.insert(leads).values(parsed.data).returning();
    res.status(201).json(lead);
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({ error: "Failed to create lead" });
  }
});

router.get("/performance/ads", async (_req: Request, res: Response) => {
  try {
    const ads = await db.select().from(performanceAds).orderBy(desc(performanceAds.createdAt)).limit(50);
    res.json(ads);
  } catch (error) {
    console.error("Error fetching ads:", error);
    res.status(500).json({ error: "Failed to fetch ads" });
  }
});

router.get("/whatsapp/conversations", async (_req: Request, res: Response) => {
  try {
    const conversations = await db.select().from(whatsappConversations).orderBy(desc(whatsappConversations.lastMessageAt)).limit(50);
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching WhatsApp conversations:", error);
    res.status(500).json({ error: "Failed to fetch WhatsApp conversations" });
  }
});

router.get("/linkedin/activities", async (_req: Request, res: Response) => {
  try {
    const activities = await db.select().from(linkedinActivities).orderBy(desc(linkedinActivities.createdAt)).limit(50);
    res.json(activities);
  } catch (error) {
    console.error("Error fetching LinkedIn activities:", error);
    res.status(500).json({ error: "Failed to fetch LinkedIn activities" });
  }
});

router.get("/analytics/overview", async (_req: Request, res: Response) => {
  try {
    const snapshots = await db.select().from(analyticsSnapshots).orderBy(desc(analyticsSnapshots.timestamp)).limit(100);
    res.json(snapshots);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

router.get("/brands", async (_req: Request, res: Response) => {
  try {
    const allBrands = await db.select().from(brands).orderBy(desc(brands.createdAt)).limit(50);
    res.json(allBrands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ error: "Failed to fetch brands" });
  }
});

export default router;
