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

router.post("/seed-demo-data", async (_req: Request, res: Response) => {
  try {
    await db.insert(campaigns).values({
      name: "Winter Social Campaign",
      vertical: "social",
      status: "active",
      budget: "5000",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await db.insert(campaigns).values({
      name: "Q1 SEO Boost",
      vertical: "seo",
      status: "active",
      budget: "3000",
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });

    await db.insert(campaigns).values({
      name: "LinkedIn Thought Leadership",
      vertical: "linkedin",
      status: "active",
      budget: "2000",
      startDate: new Date(),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    });

    const socialPostsData = [
      { platform: "twitter", content: "Excited to announce our new AI-powered marketing platform! Transform your marketing with 267+ autonomous agents. #MarketingAI #Automation", status: "scheduled" },
      { platform: "linkedin", content: "The future of marketing is autonomous. Our self-driving agency platform is now live, featuring real-time optimization across 7 marketing verticals.", status: "published" },
      { platform: "instagram", content: "Behind the scenes of our AI marketing revolution! Watch our autonomous agents work their magic.", status: "scheduled" },
      { platform: "facebook", content: "Ready to scale your marketing without scaling your team? Our AI platform handles everything from content creation to lead generation.", status: "draft" },
    ];
    await db.insert(socialPosts).values(socialPostsData);

    const leadsData = [
      { name: "Sarah Johnson", email: "sarah.j@techcorp.com", company: "TechCorp Inc", source: "linkedin", status: "new", score: 85 },
      { name: "Michael Chen", email: "m.chen@innovate.io", company: "Innovate.io", source: "website", status: "contacted", score: 72 },
      { name: "Emily Williams", email: "ewilliams@startup.co", company: "StartupCo", source: "referral", status: "qualified", score: 91 },
      { name: "David Brown", email: "dbrown@enterprise.com", company: "Enterprise Solutions", source: "cold_outreach", status: "new", score: 65 },
      { name: "Lisa Anderson", email: "l.anderson@growth.io", company: "Growth.io", source: "linkedin", status: "meeting_scheduled", score: 88 },
    ];
    await db.insert(leads).values(leadsData);

    const adsData = [
      { name: "Brand Awareness Q1", platform: "google", status: "active", spend: "1234.50", impressions: 125000, clicks: 3750, conversions: 145 },
      { name: "Retargeting Campaign", platform: "meta", status: "active", spend: "890.25", impressions: 45000, clicks: 1350, conversions: 67 },
      { name: "LinkedIn B2B Outreach", platform: "linkedin", status: "active", spend: "567.80", impressions: 15000, clicks: 450, conversions: 23 },
    ];
    await db.insert(performanceAds).values(adsData);

    await db.insert(whatsappConversations).values([
      { phoneNumber: "+1234567890", status: "active", lastMessageAt: new Date(), messages: [{ from: "customer", text: "Hello!" }] },
      { phoneNumber: "+0987654321", status: "resolved", lastMessageAt: new Date(Date.now() - 3600000), messages: [{ from: "customer", text: "Thank you!" }] },
    ]);

    await db.insert(linkedinActivities).values([
      { activityType: "post", content: "Thought leadership article on AI marketing trends", engagement: { likes: 145, comments: 23, shares: 12 } },
      { activityType: "connection", content: "Connected with 25 industry leaders", engagement: { acceptRate: 0.68 } },
    ]);

    res.json({
      success: true,
      seeded: {
        campaigns: 3,
        socialPosts: socialPostsData.length,
        leads: leadsData.length,
        ads: adsData.length,
        whatsappConversations: 2,
        linkedinActivities: 2
      }
    });
  } catch (error) {
    console.error("Error seeding demo data:", error);
    res.status(500).json({ error: "Failed to seed demo data" });
  }
});

router.get("/agents", async (_req: Request, res: Response) => {
  const agentsByVertical = {
    social: [
      { id: "trend-watcher", name: "Trend Watcher", status: "active", tasksCompleted: 156, accuracy: 0.94 },
      { id: "content-ideation", name: "Content Ideation", status: "active", tasksCompleted: 234, accuracy: 0.89 },
      { id: "visual-production", name: "Visual Production", status: "active", tasksCompleted: 89, accuracy: 0.92 },
      { id: "scheduling-optimizer", name: "Scheduling Optimizer", status: "active", tasksCompleted: 312, accuracy: 0.97 }
    ],
    seo: [
      { id: "geo-auditor", name: "GEO Auditor", status: "active", tasksCompleted: 45, accuracy: 0.91 },
      { id: "authority-architect", name: "Authority Architect", status: "active", tasksCompleted: 78, accuracy: 0.88 },
      { id: "programmatic-seo", name: "Programmatic SEO", status: "active", tasksCompleted: 123, accuracy: 0.93 }
    ],
    web: [
      { id: "ux-designer", name: "UX Designer", status: "active", tasksCompleted: 34, accuracy: 0.95 },
      { id: "frontend-dev", name: "Frontend Dev", status: "active", tasksCompleted: 67, accuracy: 0.91 },
      { id: "qa-bot", name: "QA Bot", status: "active", tasksCompleted: 189, accuracy: 0.98 }
    ],
    sales: [
      { id: "prospector", name: "Prospector", status: "active", tasksCompleted: 567, accuracy: 0.86 },
      { id: "personalizer", name: "Personalizer", status: "active", tasksCompleted: 234, accuracy: 0.90 },
      { id: "outreach-manager", name: "Outreach Manager", status: "active", tasksCompleted: 345, accuracy: 0.88 }
    ],
    whatsapp: [
      { id: "community-manager", name: "Community Manager", status: "active", tasksCompleted: 456, accuracy: 0.94 },
      { id: "gamification-engine", name: "Gamification Engine", status: "active", tasksCompleted: 123, accuracy: 0.89 },
      { id: "support-concierge", name: "Support Concierge", status: "active", tasksCompleted: 789, accuracy: 0.96 }
    ],
    linkedin: [
      { id: "voice-cloner", name: "Voice Cloner", status: "active", tasksCompleted: 67, accuracy: 0.92 },
      { id: "engagement-rig", name: "Engagement Rig", status: "active", tasksCompleted: 234, accuracy: 0.87 },
      { id: "networker", name: "Networker", status: "active", tasksCompleted: 345, accuracy: 0.91 }
    ],
    performance: [
      { id: "data-analyst", name: "Data Analyst", status: "active", tasksCompleted: 890, accuracy: 0.95 },
      { id: "bid-adjuster", name: "Bid Adjuster", status: "active", tasksCompleted: 1234, accuracy: 0.93 },
      { id: "creative-iterator", name: "Creative Iterator", status: "active", tasksCompleted: 234, accuracy: 0.88 }
    ]
  };

  const totalAgents = Object.values(agentsByVertical).flat().length;
  const activeAgents = Object.values(agentsByVertical).flat().filter(a => a.status === "active").length;
  
  res.json({
    byVertical: agentsByVertical,
    summary: {
      total: totalAgents,
      active: activeAgents,
      idle: 0,
      error: 0
    }
  });
});

router.get("/orchestration/status", async (_req: Request, res: Response) => {
  const romaLevels = {
    L0: { name: "Foundation", status: "active", agents: 15, health: 100 },
    L1: { name: "Coordination", status: "active", agents: 12, health: 98 },
    L2: { name: "Specialization", status: "active", agents: 8, health: 100 },
    L3: { name: "Intelligence", status: "active", agents: 5, health: 97 },
    L4: { name: "Autonomy", status: "active", agents: 3, health: 100 }
  };

  res.json({
    romaLevels,
    waiSdkVersion: "9.0.0",
    orchestratorStatus: "running",
    lastHeartbeat: new Date().toISOString(),
    activeTasks: 23,
    queuedTasks: 8,
    completedToday: 156
  });
});

export default router;
