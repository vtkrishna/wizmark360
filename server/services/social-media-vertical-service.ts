import { 
  generateAllAgents, 
  getAgentsByVertical, 
  getAgentById,
  type Market360Agent 
} from "../agents/market360-agent-catalog";
import { 
  getToolsByVertical, 
  getToolById,
  getMCPToolStats,
  type MCPToolDefinition 
} from "./mcp-tool-catalog";
import { db } from "../db";
import { socialPosts, campaigns } from "../../shared/market360-schema";
import { eq, desc, and, sql, gte } from "drizzle-orm";

export interface ContentIdea {
  id: string;
  title: string;
  description: string;
  platform: string;
  format: string;
  hook: string;
  targetAudience: string;
  estimatedEngagement: number;
  trendRelevance: number;
  brandFit: number;
  hashtags: string[];
  callToAction: string;
  status: "generated" | "approved" | "rejected" | "created";
  createdAt: Date;
}

export interface ContentPiece {
  id: string;
  ideaId: string;
  platform: string;
  format: string;
  content: {
    text: string;
    mediaUrls: string[];
    caption?: string;
    altText?: string;
  };
  optimizations: {
    seoKeywords: string[];
    hashtags: string[];
    bestPostingTime: string;
    audienceTargeting: string[];
  };
  status: "draft" | "review" | "approved" | "scheduled" | "published";
  qualityScore: number;
  createdAt: Date;
}

export interface ScheduledPost {
  id: string;
  contentId: string;
  platform: string;
  scheduledTime: Date;
  timezone: string;
  status: "pending" | "queued" | "published" | "failed";
  publishedAt?: Date;
  postUrl?: string;
}

export interface EngagementMetric {
  postId: string;
  platform: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  engagementRate: number;
  viralScore: number;
  sentimentScore: number;
  topComments: Array<{ text: string; sentiment: string; }>;
  audienceInsights: {
    demographics: Record<string, number>;
    peakEngagementTime: string;
    topLocations: string[];
  };
}

export interface SocialAnalytics {
  period: string;
  totalPosts: number;
  totalImpressions: number;
  totalEngagement: number;
  avgEngagementRate: number;
  topPerformingPosts: string[];
  viralVelocity: number;
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  platformBreakdown: Record<string, {
    posts: number;
    engagement: number;
    followers: number;
  }>;
  growthMetrics: {
    followerGrowth: number;
    reachGrowth: number;
    engagementGrowth: number;
  };
}

interface WorkflowStep {
  step: string;
  agentId: string;
  tools: string[];
  status: "pending" | "running" | "completed" | "failed";
  result?: any;
  duration?: number;
  startedAt?: Date;
  completedAt?: Date;
}

interface SocialWorkflowExecution {
  id: string;
  brandId: string;
  workflowType: "ideation" | "creation" | "scheduling" | "engagement" | "analytics" | "full";
  steps: WorkflowStep[];
  status: "running" | "completed" | "failed";
  startedAt: Date;
  completedAt?: Date;
  output?: any;
}

export class SocialMediaVerticalService {
  private allAgents: Market360Agent[];
  private socialAgents: Market360Agent[];
  private socialTools: MCPToolDefinition[];
  private activeWorkflows: Map<string, SocialWorkflowExecution>;
  private ideaCache: Map<string, ContentIdea[]>;
  private contentCache: Map<string, ContentPiece[]>;

  constructor() {
    this.allAgents = generateAllAgents();
    this.socialAgents = getAgentsByVertical("social");
    this.socialTools = getToolsByVertical("social");
    this.activeWorkflows = new Map();
    this.ideaCache = new Map();
    this.contentCache = new Map();
  }

  private selectAgentForTask(taskType: string, romaLevelRequired: number): Market360Agent | undefined {
    const matchingAgents = this.socialAgents.filter(agent => {
      const romaLevelMap: Record<string, number> = { L0: 0, L1: 1, L2: 2, L3: 3, L4: 4 };
      const agentLevel = romaLevelMap[agent.romaLevel] || 0;
      return agentLevel >= romaLevelRequired;
    });

    const taskMatcher = taskType.toLowerCase().replace(/_/g, " ");
    const exactMatch = matchingAgents.find(a => 
      a.name.toLowerCase().includes(taskMatcher) || 
      a.capabilities.some(c => c.toLowerCase().includes(taskMatcher))
    );

    return exactMatch || matchingAgents[0];
  }

  async executeFullWorkflow(
    brandId: string,
    options: {
      platform: string;
      contentType: string;
      targetAudience: string;
      campaignGoals: string[];
      language?: string;
    }
  ): Promise<SocialWorkflowExecution> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const workflow: SocialWorkflowExecution = {
      id: workflowId,
      brandId,
      workflowType: "full",
      steps: [
        { step: "Trend Analysis", agentId: "social_trend_spotter", tools: ["trend_aggregator", "viral_predictor"], status: "pending" },
        { step: "Content Ideation", agentId: "social_content_ideator", tools: ["idea_generator", "topic_clustering"], status: "pending" },
        { step: "Content Creation", agentId: "social_copywriter", tools: ["caption_writer", "hashtag_optimizer"], status: "pending" },
        { step: "Visual Production", agentId: "social_visual_producer", tools: ["image_generator", "video_editor"], status: "pending" },
        { step: "Content Review", agentId: "social_reviewer", tools: ["quality_scorer", "brand_voice_checker"], status: "pending" },
        { step: "Schedule Optimization", agentId: "social_scheduler", tools: ["optimal_time_finder", "calendar_sync"], status: "pending" },
        { step: "Publication", agentId: "social_approver", tools: ["platform_publisher", "notification_sender"], status: "pending" },
        { step: "Engagement Monitoring", agentId: "social_engagement_coordinator", tools: ["metrics_collector", "sentiment_analyzer"], status: "pending" },
        { step: "Performance Analytics", agentId: "social_analytics_engine", tools: ["performance_reporter", "insight_generator"], status: "pending" }
      ],
      status: "running",
      startedAt: new Date()
    };

    this.activeWorkflows.set(workflowId, workflow);

    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        step.status = "running";
        step.startedAt = new Date();

        const result = await this.executeWorkflowStep(step, brandId, options, i > 0 ? workflow.steps[i - 1].result : null);
        
        step.result = result;
        step.status = "completed";
        step.completedAt = new Date();
        step.duration = step.completedAt.getTime() - step.startedAt.getTime();
      }

      workflow.status = "completed";
      workflow.completedAt = new Date();
      workflow.output = {
        ideas: workflow.steps[1].result,
        content: workflow.steps[2].result,
        schedule: workflow.steps[5].result,
        analytics: workflow.steps[8].result
      };
    } catch (error) {
      workflow.status = "failed";
      workflow.completedAt = new Date();
      console.error(`Workflow ${workflowId} failed:`, error);
    }

    return workflow;
  }

  private async executeWorkflowStep(
    step: WorkflowStep,
    brandId: string,
    options: any,
    previousResult: any
  ): Promise<any> {
    const agent = this.selectAgentForTask(step.step.toLowerCase().replace(/\s+/g, "_"), 2);

    const toolIds = step.tools.map(toolName => `social-${toolName}`);

    const stepResults = {
      agentUsed: agent?.id || step.agentId,
      toolsExecuted: step.tools,
      generatedAt: new Date().toISOString()
    };

    switch (step.step) {
      case "Trend Analysis":
        return this.executeTrendAnalysis(brandId, options);
      case "Content Ideation":
        return this.executeIdeation(brandId, options, previousResult);
      case "Content Creation":
        return this.executeContentCreation(brandId, options, previousResult);
      case "Visual Production":
        return this.executeVisualProduction(brandId, options, previousResult);
      case "Content Review":
        return this.executeContentReview(brandId, previousResult);
      case "Schedule Optimization":
        return this.executeScheduleOptimization(brandId, options, previousResult);
      case "Publication":
        return this.executePublication(brandId, previousResult);
      case "Engagement Monitoring":
        return this.executeEngagementMonitoring(brandId);
      case "Performance Analytics":
        return this.executeAnalytics(brandId, options);
      default:
        return stepResults;
    }
  }

  async executeTrendAnalysis(
    brandId: string,
    options: { platform: string; contentType: string; targetAudience: string }
  ): Promise<{
    trends: Array<{ topic: string; score: number; growth: string; relevance: number }>;
    viralPatterns: Array<{ pattern: string; examples: string[]; successRate: number }>;
    competitorAnalysis: Array<{ competitor: string; topContent: string[]; engagement: number }>;
  }> {
    const agent = this.selectAgentForTask("trend_analysis", 2);

    const platformTrends: Record<string, Array<{ topic: string; score: number; growth: string; relevance: number }>> = {
      instagram: [
        { topic: "#ReelsAesthetics", score: 92, growth: "+45%", relevance: 0.89 },
        { topic: "Behind-the-scenes content", score: 88, growth: "+32%", relevance: 0.91 },
        { topic: "User-generated testimonials", score: 85, growth: "+28%", relevance: 0.87 },
        { topic: "Carousel infographics", score: 82, growth: "+25%", relevance: 0.84 }
      ],
      twitter: [
        { topic: "Thread storytelling", score: 90, growth: "+38%", relevance: 0.88 },
        { topic: "Community polls", score: 86, growth: "+30%", relevance: 0.85 },
        { topic: "Quote tweets with insights", score: 83, growth: "+22%", relevance: 0.82 }
      ],
      linkedin: [
        { topic: "Thought leadership posts", score: 94, growth: "+42%", relevance: 0.93 },
        { topic: "Industry insights carousels", score: 89, growth: "+35%", relevance: 0.90 },
        { topic: "Employee spotlight stories", score: 84, growth: "+27%", relevance: 0.86 }
      ],
      youtube: [
        { topic: "Short-form vertical video", score: 96, growth: "+55%", relevance: 0.94 },
        { topic: "How-to tutorials", score: 88, growth: "+30%", relevance: 0.89 },
        { topic: "Podcast clips", score: 85, growth: "+28%", relevance: 0.85 }
      ],
      facebook: [
        { topic: "Community group engagement", score: 87, growth: "+25%", relevance: 0.86 },
        { topic: "Live video sessions", score: 84, growth: "+20%", relevance: 0.83 },
        { topic: "Interactive stories", score: 80, growth: "+18%", relevance: 0.80 }
      ]
    };

    const trends = platformTrends[options.platform.toLowerCase()] || platformTrends.instagram;

    return {
      trends,
      viralPatterns: [
        { pattern: "Hook + Value + CTA", examples: ["Day in the life...", "5 things you didn't know..."], successRate: 0.78 },
        { pattern: "Problem-Agitation-Solution", examples: ["Struggling with X? Here's the fix..."], successRate: 0.72 },
        { pattern: "Transformation showcase", examples: ["Before/After reveals", "Journey documentaries"], successRate: 0.85 }
      ],
      competitorAnalysis: [
        { competitor: "Industry Leader A", topContent: ["Product launches", "Customer stories"], engagement: 4.2 },
        { competitor: "Industry Leader B", topContent: ["Educational content", "Trends analysis"], engagement: 3.8 },
        { competitor: "Rising Star C", topContent: ["Memes", "Relatable content"], engagement: 5.1 }
      ]
    };
  }

  async executeIdeation(
    brandId: string,
    options: { platform: string; contentType: string; targetAudience: string; campaignGoals: string[] },
    trendData: any
  ): Promise<ContentIdea[]> {
    const agent = this.selectAgentForTask("content_ideation", 2);

    const ideas: ContentIdea[] = [];
    const ideaCount = 5;

    const hooks = [
      "Stop scrolling! You need to see this...",
      "The secret that changed everything for our customers...",
      "Here's what nobody tells you about...",
      "POV: When you finally discover...",
      "Warning: This will change how you think about..."
    ];

    const formats: Record<string, string[]> = {
      instagram: ["Reel", "Carousel", "Story", "Static Post", "Live"],
      twitter: ["Thread", "Poll", "Quote Tweet", "Media Tweet", "Space"],
      linkedin: ["Article", "Carousel", "Document", "Poll", "Video"],
      youtube: ["Short", "Tutorial", "Vlog", "Interview", "Review"],
      facebook: ["Reel", "Story", "Live", "Event", "Group Post"]
    };

    const platformFormats = formats[options.platform.toLowerCase()] || formats.instagram;

    for (let i = 0; i < ideaCount; i++) {
      const format = platformFormats[i % platformFormats.length];
      const topTrend = trendData?.trends?.[i % (trendData?.trends?.length || 1)];

      ideas.push({
        id: `idea_${Date.now()}_${i}`,
        title: `${options.contentType} Content: ${topTrend?.topic || "Brand Story"} Edition`,
        description: `Create ${format.toLowerCase()} content leveraging ${topTrend?.topic || "trending format"} to engage ${options.targetAudience}`,
        platform: options.platform,
        format,
        hook: hooks[i % hooks.length],
        targetAudience: options.targetAudience,
        estimatedEngagement: Math.floor(Math.random() * 5000) + 1000,
        trendRelevance: topTrend?.relevance || 0.85,
        brandFit: 0.8 + Math.random() * 0.2,
        hashtags: this.generateHashtags(options.platform, topTrend?.topic || ""),
        callToAction: this.generateCTA(options.campaignGoals[0] || "awareness"),
        status: "generated",
        createdAt: new Date()
      });
    }

    const cached = this.ideaCache.get(brandId) || [];
    this.ideaCache.set(brandId, [...cached, ...ideas]);

    return ideas;
  }

  private generateHashtags(platform: string, topic: string): string[] {
    const baseHashtags = ["#marketing", "#brand", "#growth", "#business"];
    const topicHashtag = topic ? [`#${topic.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`] : [];
    
    const platformHashtags: Record<string, string[]> = {
      instagram: ["#instagood", "#instadaily", "#reels", "#explore"],
      twitter: ["#trending", "#viral", "#mustread"],
      linkedin: ["#leadership", "#innovation", "#b2b", "#networking"],
      youtube: ["#subscribe", "#tutorial", "#howto"],
      facebook: ["#community", "#share", "#connect"]
    };

    return [...topicHashtag, ...baseHashtags, ...(platformHashtags[platform.toLowerCase()] || [])].slice(0, 10);
  }

  private generateCTA(goal: string): string {
    const ctas: Record<string, string[]> = {
      awareness: ["Learn more in bio", "Share with someone who needs this", "Save for later"],
      engagement: ["Drop a comment below!", "Tag a friend who needs this", "What do you think? 👇"],
      conversion: ["Link in bio to get started", "DM us 'READY' to learn more", "Tap to shop now"],
      traffic: ["Full article in bio", "Click the link to read more", "Swipe up for details"],
      leads: ["DM us for a free consultation", "Comment 'INFO' for details", "Book your call today"]
    };

    const goalCTAs = ctas[goal.toLowerCase()] || ctas.awareness;
    return goalCTAs[Math.floor(Math.random() * goalCTAs.length)];
  }

  async executeContentCreation(
    brandId: string,
    options: { platform: string; language?: string },
    ideas: ContentIdea[]
  ): Promise<ContentPiece[]> {
    const agent = this.selectAgentForTask("content_creation", 2);

    const contents: ContentPiece[] = [];

    for (const idea of ideas.slice(0, 3)) {
      const content: ContentPiece = {
        id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ideaId: idea.id,
        platform: idea.platform,
        format: idea.format,
        content: {
          text: this.generateContentText(idea),
          mediaUrls: [],
          caption: this.generateCaption(idea),
          altText: `${idea.title} - ${idea.format} content for ${idea.platform}`
        },
        optimizations: {
          seoKeywords: idea.hashtags.map(h => h.replace("#", "")),
          hashtags: idea.hashtags,
          bestPostingTime: this.getBestPostingTime(idea.platform),
          audienceTargeting: [idea.targetAudience, "engaged followers", "industry professionals"]
        },
        status: "draft",
        qualityScore: 0.75 + Math.random() * 0.2,
        createdAt: new Date()
      };

      contents.push(content);
    }

    const cached = this.contentCache.get(brandId) || [];
    this.contentCache.set(brandId, [...cached, ...contents]);

    return contents;
  }

  private generateContentText(idea: ContentIdea): string {
    return `${idea.hook}

${idea.description}

${idea.callToAction}

${idea.hashtags.slice(0, 5).join(" ")}`;
  }

  private generateCaption(idea: ContentIdea): string {
    return `${idea.hook}

${idea.description}

👉 ${idea.callToAction}

${idea.hashtags.join(" ")}`;
  }

  private getBestPostingTime(platform: string): string {
    const bestTimes: Record<string, string> = {
      instagram: "9:00 AM - 11:00 AM, 7:00 PM - 9:00 PM",
      twitter: "8:00 AM - 10:00 AM, 12:00 PM - 1:00 PM",
      linkedin: "7:00 AM - 8:00 AM, 5:00 PM - 6:00 PM",
      youtube: "2:00 PM - 4:00 PM, 9:00 PM - 11:00 PM",
      facebook: "1:00 PM - 4:00 PM, 8:00 PM - 9:00 PM"
    };

    return bestTimes[platform.toLowerCase()] || bestTimes.instagram;
  }

  async executeVisualProduction(
    brandId: string,
    options: { platform: string },
    contents: ContentPiece[]
  ): Promise<ContentPiece[]> {
    const agent = this.selectAgentForTask("visual_production", 2);

    return contents.map(content => ({
      ...content,
      content: {
        ...content.content,
        mediaUrls: [
          `/generated/social/${brandId}/${content.id}/visual_1.png`,
          `/generated/social/${brandId}/${content.id}/visual_2.png`
        ]
      },
      status: "review" as const
    }));
  }

  async executeContentReview(
    brandId: string,
    contents: ContentPiece[]
  ): Promise<ContentPiece[]> {
    const agent = this.selectAgentForTask("content_review", 1);

    return contents.map(content => {
      const brandVoiceScore = 0.8 + Math.random() * 0.2;
      const complianceScore = 0.85 + Math.random() * 0.15;
      const engagementPrediction = 0.7 + Math.random() * 0.3;

      return {
        ...content,
        qualityScore: (brandVoiceScore + complianceScore + engagementPrediction) / 3,
        status: brandVoiceScore > 0.75 ? "approved" as const : "draft" as const
      };
    });
  }

  async executeScheduleOptimization(
    brandId: string,
    options: { platform: string },
    contents: ContentPiece[]
  ): Promise<ScheduledPost[]> {
    const agent = this.selectAgentForTask("scheduling", 2);

    const scheduledPosts: ScheduledPost[] = [];
    const now = new Date();

    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];
      if (content.status !== "approved") continue;

      const scheduledTime = new Date(now);
      scheduledTime.setDate(scheduledTime.getDate() + i + 1);
      scheduledTime.setHours(10, 0, 0, 0);

      scheduledPosts.push({
        id: `schedule_${Date.now()}_${i}`,
        contentId: content.id,
        platform: content.platform,
        scheduledTime,
        timezone: "Asia/Kolkata",
        status: "pending"
      });
    }

    return scheduledPosts;
  }

  async executePublication(
    brandId: string,
    scheduledPosts: ScheduledPost[]
  ): Promise<ScheduledPost[]> {
    const agent = this.selectAgentForTask("publication", 2);

    return scheduledPosts.map(post => ({
      ...post,
      status: "queued" as const
    }));
  }

  async executeEngagementMonitoring(brandId: string): Promise<EngagementMetric[]> {
    const agent = this.selectAgentForTask("engagement_monitoring", 2);

    const metrics: EngagementMetric[] = [];

    const samplePosts = await db.select().from(socialPosts)
      .orderBy(desc(socialPosts.createdAt))
      .limit(10);

    for (const post of samplePosts) {
      const impressions = Math.floor(Math.random() * 50000) + 5000;
      const engagement = Math.floor(impressions * (0.02 + Math.random() * 0.08));

      metrics.push({
        postId: post.id.toString(),
        platform: post.platform || "instagram",
        impressions,
        reach: Math.floor(impressions * 0.7),
        likes: Math.floor(engagement * 0.6),
        comments: Math.floor(engagement * 0.15),
        shares: Math.floor(engagement * 0.15),
        saves: Math.floor(engagement * 0.1),
        clicks: Math.floor(engagement * 0.2),
        engagementRate: (engagement / impressions) * 100,
        viralScore: Math.random() * 100,
        sentimentScore: 0.6 + Math.random() * 0.4,
        topComments: [
          { text: "This is exactly what I needed!", sentiment: "positive" },
          { text: "Great content as always!", sentiment: "positive" },
          { text: "Can you share more about this?", sentiment: "neutral" }
        ],
        audienceInsights: {
          demographics: { "18-24": 25, "25-34": 40, "35-44": 20, "45-54": 10, "55+": 5 },
          peakEngagementTime: "9:00 PM",
          topLocations: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai"]
        }
      });
    }

    return metrics;
  }

  async executeAnalytics(
    brandId: string,
    options: { platform: string }
  ): Promise<SocialAnalytics> {
    const agent = this.selectAgentForTask("analytics", 2);

    const postCount = await db.select({ count: sql<number>`count(*)` })
      .from(socialPosts);

    const totalPosts = Number(postCount[0]?.count || 0);

    return {
      period: "Last 30 Days",
      totalPosts,
      totalImpressions: totalPosts * 15000,
      totalEngagement: totalPosts * 750,
      avgEngagementRate: 4.2 + Math.random() * 2,
      topPerformingPosts: ["post_1", "post_2", "post_3"],
      viralVelocity: 78 + Math.floor(Math.random() * 20),
      sentimentDistribution: {
        positive: 65 + Math.floor(Math.random() * 15),
        neutral: 20 + Math.floor(Math.random() * 10),
        negative: 5 + Math.floor(Math.random() * 5)
      },
      platformBreakdown: {
        instagram: { posts: Math.floor(totalPosts * 0.4), engagement: 4500, followers: 15000 },
        twitter: { posts: Math.floor(totalPosts * 0.25), engagement: 2800, followers: 8500 },
        linkedin: { posts: Math.floor(totalPosts * 0.2), engagement: 1800, followers: 5200 },
        facebook: { posts: Math.floor(totalPosts * 0.15), engagement: 1200, followers: 12000 }
      },
      growthMetrics: {
        followerGrowth: 8.5 + Math.random() * 5,
        reachGrowth: 12.3 + Math.random() * 8,
        engagementGrowth: 15.7 + Math.random() * 10
      }
    };
  }

  getWorkflowStatus(workflowId: string): SocialWorkflowExecution | undefined {
    return this.activeWorkflows.get(workflowId);
  }

  getCachedIdeas(brandId: string): ContentIdea[] {
    return this.ideaCache.get(brandId) || [];
  }

  getCachedContent(brandId: string): ContentPiece[] {
    return this.contentCache.get(brandId) || [];
  }

  getStats(): {
    activeWorkflows: number;
    cachedIdeas: number;
    cachedContent: number;
    verticalAgents: number;
  } {
    let totalIdeas = 0;
    let totalContent = 0;
    this.ideaCache.forEach(ideas => totalIdeas += ideas.length);
    this.contentCache.forEach(contents => totalContent += contents.length);

    const socialAgentCount = this.socialAgents.length;

    return {
      activeWorkflows: this.activeWorkflows.size,
      cachedIdeas: totalIdeas,
      cachedContent: totalContent,
      verticalAgents: socialAgentCount
    };
  }
}

export const socialMediaVerticalService = new SocialMediaVerticalService();
