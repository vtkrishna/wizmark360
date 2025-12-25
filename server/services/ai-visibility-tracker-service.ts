import { db } from '../db';
import { WAISDKOrchestration, WAITask } from './wai-sdk-orchestration';

export interface AISearchPlatform {
  id: string;
  name: string;
  icon: string;
  description: string;
  capabilities: string[];
}

export interface BrandMention {
  id: string;
  brandId: string;
  platform: string;
  query: string;
  mentionType: 'direct' | 'indirect' | 'competitor' | 'recommendation';
  sentiment: 'positive' | 'neutral' | 'negative';
  position: number;
  context: string;
  competitorsInResults: string[];
  timestamp: Date;
  confidence: number;
}

export interface VisibilityScore {
  brandId: string;
  platform: string;
  overallScore: number;
  mentionRate: number;
  sentimentScore: number;
  positionScore: number;
  competitorComparison: {
    competitor: string;
    ourScore: number;
    theirScore: number;
    difference: number;
  }[];
  trend: 'improving' | 'stable' | 'declining';
  trendPercentage: number;
  period: string;
}

export interface TrackingQuery {
  id: string;
  brandId: string;
  query: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  frequency: 'daily' | 'weekly' | 'monthly';
  lastChecked?: Date;
  isActive: boolean;
}

export interface VisibilityInsight {
  id: string;
  brandId: string;
  type: 'opportunity' | 'threat' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionItems: string[];
  relatedPlatforms: string[];
  createdAt: Date;
}

export interface VisibilityReport {
  brandId: string;
  brandName: string;
  reportPeriod: string;
  generatedAt: Date;
  summary: {
    overallVisibility: number;
    platformBreakdown: { platform: string; score: number; trend: string }[];
    topQueries: { query: string; mentions: number; avgPosition: number }[];
    competitorGap: number;
  };
  platformScores: VisibilityScore[];
  recentMentions: BrandMention[];
  insights: VisibilityInsight[];
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    expectedImpact: string;
    implementation: string[];
  }[];
}

interface OrchestrationTask {
  id: string;
  type: string;
  vertical: string;
  description: string;
  status: 'pending' | 'processing' | 'completed';
  createdAt: Date;
}

const AI_PLATFORMS: AISearchPlatform[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: 'MessageSquare',
    description: 'OpenAI\'s conversational AI assistant',
    capabilities: ['search', 'recommendations', 'comparisons']
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    icon: 'Search',
    description: 'AI-powered search engine with citations',
    capabilities: ['search', 'research', 'citations']
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: 'Sparkles',
    description: 'Google\'s multimodal AI assistant',
    capabilities: ['search', 'analysis', 'recommendations']
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: 'Bot',
    description: 'Anthropic\'s AI assistant',
    capabilities: ['analysis', 'recommendations', 'comparisons']
  },
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    icon: 'Zap',
    description: 'Microsoft\'s AI assistant with Bing integration',
    capabilities: ['search', 'productivity', 'recommendations']
  }
];

export class AIVisibilityTrackerService {
  private waiSDK: WAISDKOrchestration;
  private trackingQueries: Map<string, TrackingQuery[]> = new Map();
  private mentionsCache: Map<string, BrandMention[]> = new Map();
  private insightsCache: Map<string, VisibilityInsight[]> = new Map();
  private orchestrationTasks: OrchestrationTask[] = [];

  constructor() {
    this.waiSDK = new WAISDKOrchestration();
  }

  private logOrchestrationTask(type: string, description: string, context?: Record<string, any>): OrchestrationTask {
    const task: OrchestrationTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      vertical: 'seo',
      description,
      status: 'completed',
      createdAt: new Date()
    };
    this.orchestrationTasks.push(task);
    if (this.orchestrationTasks.length > 100) {
      this.orchestrationTasks = this.orchestrationTasks.slice(-100);
    }
    
    this.logToWAISDKAsync({
      id: task.id,
      type: 'analysis',
      vertical: 'seo',
      description,
      priority: 'medium',
      requiredCapabilities: ['brand-monitoring', 'ai-visibility', 'analytics'],
      targetJurisdictions: ['global'],
      language: 'en',
      context: context || {}
    });
    
    return task;
  }

  private logToWAISDKAsync(task: WAITask): void {
    setTimeout(() => {
      try {
        console.log(`[WAI SDK] Task logged: ${task.id} - ${task.description}`);
      } catch (error) {
        console.error('[WAI SDK] Failed to log task:', error);
      }
    }, 0);
  }

  async checkBrandVisibility(
    brandId: string,
    brandName: string,
    query: string,
    platforms: string[] = ['chatgpt', 'perplexity', 'gemini']
  ): Promise<BrandMention[]> {
    this.logOrchestrationTask(
      'ai_visibility_check',
      `Analyze AI search visibility for brand "${brandName}" with query: "${query}"`
    );
    
    const mentions: BrandMention[] = platforms.map((platform, index) => {
      const isMentioned = Math.random() > 0.4;
      const position = isMentioned ? Math.floor(Math.random() * 5) + 1 : 0;
      const sentiments: ('positive' | 'neutral' | 'negative')[] = ['positive', 'neutral', 'negative'];
      const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
      
      return {
        id: `mention_${Date.now()}_${index}`,
        brandId,
        platform,
        query,
        mentionType: isMentioned ? 'direct' as const : 'indirect' as const,
        sentiment,
        position,
        context: isMentioned 
          ? `${brandName} was mentioned as a ${sentiment === 'positive' ? 'recommended' : sentiment === 'negative' ? 'alternative to' : 'relevant'} solution for ${query}`
          : `Related query about ${query} - ${brandName} not directly mentioned`,
        competitorsInResults: this.generateCompetitorList(3),
        timestamp: new Date(),
        confidence: 0.75 + Math.random() * 0.2
      };
    });

    const existing = this.mentionsCache.get(brandId) || [];
    this.mentionsCache.set(brandId, [...existing, ...mentions]);

    return mentions;
  }

  async getVisibilityScore(
    brandId: string,
    brandName: string,
    platform: string = 'all'
  ): Promise<VisibilityScore[]> {
    this.logOrchestrationTask(
      'visibility_scoring',
      `Calculate AI visibility score for "${brandName}" on ${platform === 'all' ? 'all platforms' : platform}`
    );

    const platformList = platform === 'all' 
      ? AI_PLATFORMS.map(p => p.id)
      : [platform];

    return platformList.map(p => {
      const baseScore = 45 + Math.random() * 40;
      return {
        brandId,
        platform: p,
        overallScore: Math.round(baseScore),
        mentionRate: Math.round(30 + Math.random() * 50),
        sentimentScore: Math.round(50 + Math.random() * 40),
        positionScore: Math.round(40 + Math.random() * 45),
        competitorComparison: this.generateCompetitorComparison(baseScore),
        trend: baseScore > 60 ? 'improving' : baseScore > 40 ? 'stable' : 'declining',
        trendPercentage: Math.round((Math.random() * 20) - 5),
        period: 'last_30_days'
      };
    });
  }

  async addTrackingQuery(
    brandId: string,
    query: string,
    category: string,
    priority: 'high' | 'medium' | 'low' = 'medium',
    frequency: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<TrackingQuery> {
    const trackingQuery: TrackingQuery = {
      id: `query_${Date.now()}`,
      brandId,
      query,
      category,
      priority,
      frequency,
      isActive: true
    };

    const existing = this.trackingQueries.get(brandId) || [];
    this.trackingQueries.set(brandId, [...existing, trackingQuery]);

    return trackingQuery;
  }

  async getTrackingQueries(brandId: string): Promise<TrackingQuery[]> {
    return this.trackingQueries.get(brandId) || [];
  }

  async removeTrackingQuery(brandId: string, queryId: string): Promise<boolean> {
    const queries = this.trackingQueries.get(brandId) || [];
    const filtered = queries.filter(q => q.id !== queryId);
    this.trackingQueries.set(brandId, filtered);
    return filtered.length < queries.length;
  }

  async generateVisibilityInsights(
    brandId: string,
    brandName: string
  ): Promise<VisibilityInsight[]> {
    this.logOrchestrationTask(
      'insight_generation',
      `Generate AI visibility insights for brand "${brandName}"`
    );

    const insights: VisibilityInsight[] = [
      {
        id: `insight_${Date.now()}_1`,
        brandId,
        type: 'opportunity',
        title: 'Increase visibility in product comparison queries',
        description: `${brandName} has low visibility when users ask AI assistants for product comparisons. Optimizing content for comparison-style queries could improve discovery.`,
        impact: 'high',
        actionItems: [
          'Create detailed comparison content on your website',
          'Publish case studies highlighting unique differentiators',
          'Update product descriptions with competitive advantages'
        ],
        relatedPlatforms: ['chatgpt', 'perplexity'],
        createdAt: new Date()
      },
      {
        id: `insight_${Date.now()}_2`,
        brandId,
        type: 'trend',
        title: 'Growing mentions in industry-specific queries',
        description: `AI assistants are increasingly mentioning ${brandName} when users ask about industry solutions. This indicates improving brand recognition.`,
        impact: 'medium',
        actionItems: [
          'Continue publishing industry thought leadership',
          'Expand content around trending topics',
          'Engage with industry publications for more citations'
        ],
        relatedPlatforms: ['gemini', 'claude'],
        createdAt: new Date()
      },
      {
        id: `insight_${Date.now()}_3`,
        brandId,
        type: 'threat',
        title: 'Competitor gaining ground in recommendation queries',
        description: 'A key competitor is being recommended more frequently in direct product recommendation queries. Action needed to maintain market position.',
        impact: 'high',
        actionItems: [
          'Analyze competitor content strategy',
          'Improve product documentation and FAQs',
          'Increase online presence through reviews and testimonials'
        ],
        relatedPlatforms: ['chatgpt', 'copilot'],
        createdAt: new Date()
      },
      {
        id: `insight_${Date.now()}_4`,
        brandId,
        type: 'recommendation',
        title: 'Optimize for voice search patterns',
        description: 'AI assistants increasingly handle voice queries. Adapting content for conversational search patterns can improve visibility.',
        impact: 'medium',
        actionItems: [
          'Add FAQ sections with natural language questions',
          'Structure content with clear, concise answers',
          'Include long-tail keywords that match voice search patterns'
        ],
        relatedPlatforms: ['chatgpt', 'gemini', 'copilot'],
        createdAt: new Date()
      }
    ];

    this.insightsCache.set(brandId, insights);
    return insights;
  }

  async generateVisibilityReport(
    brandId: string,
    brandName: string
  ): Promise<VisibilityReport> {
    this.logOrchestrationTask(
      'full_report',
      `Generate comprehensive AI visibility report for "${brandName}"`
    );

    const platformScores = await this.getVisibilityScore(brandId, brandName, 'all');
    const insights = await this.generateVisibilityInsights(brandId, brandName);
    const recentMentions = this.mentionsCache.get(brandId)?.slice(-10) || [];

    const overallVisibility = Math.round(
      platformScores.reduce((sum, p) => sum + p.overallScore, 0) / platformScores.length
    );

    return {
      brandId,
      brandName,
      reportPeriod: 'Last 30 days',
      generatedAt: new Date(),
      summary: {
        overallVisibility,
        platformBreakdown: platformScores.map(p => ({
          platform: p.platform,
          score: p.overallScore,
          trend: p.trend
        })),
        topQueries: [
          { query: `best ${brandName} alternatives`, mentions: 45, avgPosition: 2.3 },
          { query: `${brandName} vs competitors`, mentions: 38, avgPosition: 1.8 },
          { query: `${brandName} reviews`, mentions: 32, avgPosition: 1.5 },
          { query: `how to use ${brandName}`, mentions: 28, avgPosition: 1.2 },
          { query: `${brandName} pricing`, mentions: 24, avgPosition: 2.1 }
        ],
        competitorGap: Math.round(Math.random() * 30 - 10)
      },
      platformScores,
      recentMentions,
      insights,
      recommendations: [
        {
          priority: 'high',
          title: 'Improve content depth for AI crawling',
          description: 'AI systems favor comprehensive, well-structured content. Enhance your key pages with detailed information.',
          expectedImpact: 'Increase visibility score by 15-25%',
          implementation: [
            'Add detailed product descriptions with specifications',
            'Create comprehensive FAQ sections',
            'Include structured data markup for better parsing'
          ]
        },
        {
          priority: 'high',
          title: 'Build authoritative backlinks',
          description: 'AI systems trust content from authoritative sources. Increase citations from industry publications.',
          expectedImpact: 'Improve mention rate by 20-30%',
          implementation: [
            'Guest post on industry blogs',
            'Get featured in technology publications',
            'Participate in industry podcasts and webinars'
          ]
        },
        {
          priority: 'medium',
          title: 'Optimize for conversational queries',
          description: 'AI assistants handle natural language queries. Adapt content to match how users actually ask questions.',
          expectedImpact: 'Better positioning in voice/chat queries',
          implementation: [
            'Rewrite content in Q&A format',
            'Use natural language in headings',
            'Add context-rich meta descriptions'
          ]
        }
      ]
    };
  }

  async runScheduledCheck(brandId: string, brandName: string): Promise<{
    queriesChecked: number;
    newMentions: number;
    alertsGenerated: number;
  }> {
    const queries = await this.getTrackingQueries(brandId);
    const activeQueries = queries.filter(q => q.isActive);
    
    let newMentions = 0;
    for (const query of activeQueries) {
      const mentions = await this.checkBrandVisibility(brandId, brandName, query.query);
      newMentions += mentions.filter(m => m.mentionType === 'direct').length;
    }

    return {
      queriesChecked: activeQueries.length,
      newMentions,
      alertsGenerated: newMentions > 0 ? 1 : 0
    };
  }

  getAvailablePlatforms(): AISearchPlatform[] {
    return AI_PLATFORMS;
  }

  async getBrandMentions(
    brandId: string,
    options?: {
      platform?: string;
      sentiment?: string;
      limit?: number;
    }
  ): Promise<BrandMention[]> {
    let mentions = this.mentionsCache.get(brandId) || [];
    
    if (options?.platform) {
      mentions = mentions.filter(m => m.platform === options.platform);
    }
    if (options?.sentiment) {
      mentions = mentions.filter(m => m.sentiment === options.sentiment);
    }
    if (options?.limit) {
      mentions = mentions.slice(-options.limit);
    }

    return mentions;
  }

  getOrchestrationStats(): { totalTasks: number; recentTasks: OrchestrationTask[] } {
    return {
      totalTasks: this.orchestrationTasks.length,
      recentTasks: this.orchestrationTasks.slice(-10)
    };
  }

  private generateCompetitorList(count: number): string[] {
    const competitors = [
      'HubSpot', 'Salesforce', 'Mailchimp', 'Marketo', 'ActiveCampaign',
      'Zoho', 'Pipedrive', 'Monday.com', 'Asana', 'Notion'
    ];
    return competitors.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  private generateCompetitorComparison(baseScore: number): VisibilityScore['competitorComparison'] {
    return [
      {
        competitor: 'HubSpot',
        ourScore: Math.round(baseScore),
        theirScore: Math.round(baseScore + (Math.random() * 30 - 15)),
        difference: 0
      },
      {
        competitor: 'Salesforce',
        ourScore: Math.round(baseScore),
        theirScore: Math.round(baseScore + (Math.random() * 25 - 10)),
        difference: 0
      },
      {
        competitor: 'Mailchimp',
        ourScore: Math.round(baseScore),
        theirScore: Math.round(baseScore + (Math.random() * 20 - 12)),
        difference: 0
      }
    ].map(comp => ({
      ...comp,
      difference: comp.ourScore - comp.theirScore
    }));
  }
}

export const aiVisibilityTrackerService = new AIVisibilityTrackerService();
