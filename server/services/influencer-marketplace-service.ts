/**
 * Influencer Marketplace Service
 * 
 * AI-powered influencer discovery, campaign management, and ROI tracking
 */

import { WAISDKOrchestration } from './wai-sdk-orchestration';

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  platform: 'instagram' | 'youtube' | 'linkedin' | 'twitter';
  niche: string[];
  location: string;
  language: string[];
  followers: number;
  engagementRate: number;
  avgLikes: number;
  avgComments: number;
  pricePerPost: number;
  pricePerStory: number;
  pricePerReel: number;
  verified: boolean;
  rating: number;
  completedCampaigns: number;
  profileImage?: string;
  bio?: string;
  demographics: {
    ageGroups: { range: string; percentage: number }[];
    genderSplit: { male: number; female: number; other: number };
    topCities: string[];
  };
  createdAt: Date;
}

export interface InfluencerCampaign {
  id: string;
  brandId: string;
  name: string;
  objective: 'awareness' | 'engagement' | 'conversions' | 'content';
  budget: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  influencers: {
    influencerId: string;
    status: 'invited' | 'accepted' | 'declined' | 'completed';
    deliverables: { type: string; quantity: number; pricePerUnit: number }[];
    totalCost: number;
    content: { url: string; postedAt: Date; metrics: any }[];
  }[];
  status: 'draft' | 'active' | 'completed' | 'paused';
  metrics: {
    totalReach: number;
    totalEngagement: number;
    totalContent: number;
    estimatedImpressions: number;
    roi?: number;
  };
  createdAt: Date;
}

export interface InfluencerSearchFilters {
  platform?: string;
  minFollowers?: number;
  maxFollowers?: number;
  niche?: string[];
  location?: string;
  language?: string;
  minEngagement?: number;
  maxBudget?: number;
}

export class InfluencerMarketplaceService {
  private waiSDK: WAISDKOrchestration;
  private influencers: Influencer[] = [];
  private campaigns: Map<string, InfluencerCampaign[]> = new Map();

  constructor() {
    this.waiSDK = new WAISDKOrchestration();
    this.initializeSeedData();
    console.log('🌟 Influencer Marketplace Service initialized');
  }

  private initializeSeedData(): void {
    this.influencers = [
      {
        id: 'inf_1',
        name: 'Priya Mehta',
        handle: '@priyastyle',
        platform: 'instagram',
        niche: ['fashion', 'lifestyle', 'beauty'],
        location: 'Mumbai, India',
        language: ['Hindi', 'English'],
        followers: 850000,
        engagementRate: 4.2,
        avgLikes: 35000,
        avgComments: 1200,
        pricePerPost: 150000,
        pricePerStory: 50000,
        pricePerReel: 200000,
        verified: true,
        rating: 4.8,
        completedCampaigns: 45,
        bio: 'Fashion & Lifestyle Creator | Mumbai 📍 | Collaborations: dm@priyastyle.com',
        demographics: {
          ageGroups: [{ range: '18-24', percentage: 35 }, { range: '25-34', percentage: 45 }, { range: '35-44', percentage: 15 }],
          genderSplit: { male: 25, female: 72, other: 3 },
          topCities: ['Mumbai', 'Delhi', 'Bangalore']
        },
        createdAt: new Date()
      },
      {
        id: 'inf_2',
        name: 'Rahul Tech',
        handle: '@rahultech',
        platform: 'youtube',
        niche: ['technology', 'gadgets', 'reviews'],
        location: 'Bangalore, India',
        language: ['Hindi', 'English'],
        followers: 2500000,
        engagementRate: 5.8,
        avgLikes: 150000,
        avgComments: 8500,
        pricePerPost: 350000,
        pricePerStory: 75000,
        pricePerReel: 400000,
        verified: true,
        rating: 4.9,
        completedCampaigns: 120,
        bio: 'Tech Reviews | Gadgets | Unboxings | 2.5M+ Subscribers',
        demographics: {
          ageGroups: [{ range: '18-24', percentage: 40 }, { range: '25-34', percentage: 38 }, { range: '35-44', percentage: 18 }],
          genderSplit: { male: 78, female: 20, other: 2 },
          topCities: ['Bangalore', 'Hyderabad', 'Mumbai']
        },
        createdAt: new Date()
      },
      {
        id: 'inf_3',
        name: 'Anita Fitness',
        handle: '@anitafitnessjourney',
        platform: 'instagram',
        niche: ['fitness', 'health', 'nutrition'],
        location: 'Delhi, India',
        language: ['Hindi', 'English', 'Punjabi'],
        followers: 450000,
        engagementRate: 6.5,
        avgLikes: 28000,
        avgComments: 1800,
        pricePerPost: 80000,
        pricePerStory: 25000,
        pricePerReel: 120000,
        verified: true,
        rating: 4.7,
        completedCampaigns: 35,
        bio: 'Certified Fitness Trainer | Nutrition Coach | Transform Your Life 💪',
        demographics: {
          ageGroups: [{ range: '18-24', percentage: 25 }, { range: '25-34', percentage: 50 }, { range: '35-44', percentage: 20 }],
          genderSplit: { male: 35, female: 63, other: 2 },
          topCities: ['Delhi', 'Gurugram', 'Noida']
        },
        createdAt: new Date()
      },
      {
        id: 'inf_4',
        name: 'Tamil Foodie',
        handle: '@tamilfoodieofficial',
        platform: 'instagram',
        niche: ['food', 'restaurants', 'cooking'],
        location: 'Chennai, India',
        language: ['Tamil', 'English'],
        followers: 680000,
        engagementRate: 7.2,
        avgLikes: 48000,
        avgComments: 3200,
        pricePerPost: 100000,
        pricePerStory: 35000,
        pricePerReel: 150000,
        verified: true,
        rating: 4.9,
        completedCampaigns: 85,
        bio: 'Food Explorer | Restaurant Reviews | Tamil Nadu\'s #1 Food Creator 🍛',
        demographics: {
          ageGroups: [{ range: '18-24', percentage: 30 }, { range: '25-34', percentage: 40 }, { range: '35-44', percentage: 25 }],
          genderSplit: { male: 45, female: 52, other: 3 },
          topCities: ['Chennai', 'Coimbatore', 'Madurai']
        },
        createdAt: new Date()
      },
      {
        id: 'inf_5',
        name: 'Business Babu',
        handle: '@businessbabu',
        platform: 'linkedin',
        niche: ['business', 'entrepreneurship', 'startups'],
        location: 'Mumbai, India',
        language: ['Hindi', 'English'],
        followers: 320000,
        engagementRate: 8.5,
        avgLikes: 12000,
        avgComments: 850,
        pricePerPost: 75000,
        pricePerStory: 20000,
        pricePerReel: 100000,
        verified: true,
        rating: 4.8,
        completedCampaigns: 28,
        bio: 'Business Strategy | Startup Mentor | Ex-McKinsey | IIM-A Alumni',
        demographics: {
          ageGroups: [{ range: '25-34', percentage: 45 }, { range: '35-44', percentage: 35 }, { range: '45-54', percentage: 15 }],
          genderSplit: { male: 68, female: 30, other: 2 },
          topCities: ['Mumbai', 'Delhi', 'Bangalore']
        },
        createdAt: new Date()
      }
    ];

    const demoCampaigns: InfluencerCampaign[] = [
      {
        id: 'camp_inf_1',
        brandId: 'demo',
        name: 'Diwali Festival Campaign 2024',
        objective: 'awareness',
        budget: 1500000,
        currency: 'INR',
        startDate: new Date(Date.now() - 30 * 86400000),
        endDate: new Date(Date.now() + 15 * 86400000),
        influencers: [
          {
            influencerId: 'inf_1',
            status: 'completed',
            deliverables: [{ type: 'reel', quantity: 2, pricePerUnit: 200000 }],
            totalCost: 400000,
            content: [
              { url: 'https://instagram.com/reel/123', postedAt: new Date(), metrics: { views: 850000, likes: 42000 } }
            ]
          },
          {
            influencerId: 'inf_4',
            status: 'completed',
            deliverables: [{ type: 'post', quantity: 3, pricePerUnit: 100000 }],
            totalCost: 300000,
            content: []
          }
        ],
        status: 'active',
        metrics: {
          totalReach: 2850000,
          totalEngagement: 185000,
          totalContent: 5,
          estimatedImpressions: 4200000,
          roi: 3.2
        },
        createdAt: new Date(Date.now() - 45 * 86400000)
      }
    ];

    this.campaigns.set('demo', demoCampaigns);
  }

  async searchInfluencers(filters: InfluencerSearchFilters): Promise<Influencer[]> {
    let results = [...this.influencers];

    if (filters.platform) {
      results = results.filter(i => i.platform === filters.platform);
    }
    if (filters.minFollowers) {
      results = results.filter(i => i.followers >= filters.minFollowers!);
    }
    if (filters.maxFollowers) {
      results = results.filter(i => i.followers <= filters.maxFollowers!);
    }
    if (filters.niche?.length) {
      results = results.filter(i => i.niche.some(n => filters.niche!.includes(n)));
    }
    if (filters.location) {
      results = results.filter(i => i.location.toLowerCase().includes(filters.location!.toLowerCase()));
    }
    if (filters.language) {
      results = results.filter(i => i.language.some(l => l.toLowerCase() === filters.language!.toLowerCase()));
    }
    if (filters.minEngagement) {
      results = results.filter(i => i.engagementRate >= filters.minEngagement!);
    }
    if (filters.maxBudget) {
      results = results.filter(i => i.pricePerPost <= filters.maxBudget!);
    }

    return results;
  }

  async getInfluencerById(influencerId: string): Promise<Influencer | null> {
    return this.influencers.find(i => i.id === influencerId) || null;
  }

  async getCampaigns(brandId: string): Promise<InfluencerCampaign[]> {
    return this.campaigns.get(brandId) || this.campaigns.get('demo') || [];
  }

  async createCampaign(brandId: string, campaign: Partial<InfluencerCampaign>): Promise<InfluencerCampaign> {
    const newCampaign: InfluencerCampaign = {
      id: `camp_inf_${Date.now()}`,
      brandId,
      name: campaign.name || 'New Campaign',
      objective: campaign.objective || 'awareness',
      budget: campaign.budget || 0,
      currency: campaign.currency || 'INR',
      startDate: campaign.startDate || new Date(),
      endDate: campaign.endDate || new Date(Date.now() + 30 * 86400000),
      influencers: [],
      status: 'draft',
      metrics: {
        totalReach: 0,
        totalEngagement: 0,
        totalContent: 0,
        estimatedImpressions: 0
      },
      createdAt: new Date()
    };

    const existing = this.campaigns.get(brandId) || [];
    existing.push(newCampaign);
    this.campaigns.set(brandId, existing);

    this.logToWAISDK('influencer_campaign_created', `Created campaign: ${newCampaign.name}`);

    return newCampaign;
  }

  async addInfluencerToCampaign(
    brandId: string,
    campaignId: string,
    influencerId: string,
    deliverables: { type: string; quantity: number; pricePerUnit: number }[]
  ): Promise<InfluencerCampaign | null> {
    const campaigns = this.campaigns.get(brandId) || [];
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) return null;

    const totalCost = deliverables.reduce((sum, d) => sum + d.quantity * d.pricePerUnit, 0);

    campaign.influencers.push({
      influencerId,
      status: 'invited',
      deliverables,
      totalCost,
      content: []
    });

    const influencer = await this.getInfluencerById(influencerId);
    if (influencer) {
      campaign.metrics.estimatedImpressions += influencer.followers * 1.5;
      campaign.metrics.totalReach += influencer.followers;
    }

    this.logToWAISDK('influencer_added', `Added influencer to campaign: ${campaign.name}`);

    return campaign;
  }

  async getMarketplaceStats(): Promise<{
    totalInfluencers: number;
    totalReach: number;
    avgEngagement: number;
    topNiches: string[];
    platformDistribution: { platform: string; count: number }[];
  }> {
    const niches = new Map<string, number>();
    const platforms = new Map<string, number>();
    
    this.influencers.forEach(inf => {
      inf.niche.forEach(n => niches.set(n, (niches.get(n) || 0) + 1));
      platforms.set(inf.platform, (platforms.get(inf.platform) || 0) + 1);
    });

    return {
      totalInfluencers: this.influencers.length,
      totalReach: this.influencers.reduce((sum, i) => sum + i.followers, 0),
      avgEngagement: this.influencers.reduce((sum, i) => sum + i.engagementRate, 0) / this.influencers.length,
      topNiches: Array.from(niches.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n]) => n),
      platformDistribution: Array.from(platforms.entries()).map(([platform, count]) => ({ platform, count }))
    };
  }

  private logToWAISDK(type: string, description: string): void {
    setTimeout(() => {
      console.log(`[WAI SDK] Influencer: ${type} - ${description}`);
    }, 0);
  }
}

export const influencerMarketplaceService = new InfluencerMarketplaceService();
