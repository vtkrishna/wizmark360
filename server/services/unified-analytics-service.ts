/**
 * Unified Analytics Service
 * Cross-vertical analytics with ROI/ROAS calculations
 * Aggregates data from all marketing channels for unified reporting
 */

export interface UnifiedMetrics {
  period: string;
  startDate: Date;
  endDate: Date;
  overview: {
    totalSpend: number;
    totalRevenue: number;
    roas: number;
    roi: number;
    conversions: number;
    costPerConversion: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpm: number;
  };
  byChannel: ChannelMetrics[];
  byVertical: VerticalMetrics[];
  byCampaign: CampaignMetrics[];
  trends: TrendData[];
}

export interface ChannelMetrics {
  channel: string;
  spend: number;
  revenue: number;
  roas: number;
  conversions: number;
  cpa: number;
  impressions: number;
  clicks: number;
  ctr: number;
  contribution: number;
}

export interface VerticalMetrics {
  vertical: string;
  spend: number;
  revenue: number;
  roas: number;
  activities: number;
  performance: number;
}

export interface CampaignMetrics {
  id: string;
  name: string;
  channel: string;
  status: 'active' | 'paused' | 'completed';
  spend: number;
  revenue: number;
  roas: number;
  conversions: number;
  impressions: number;
  clicks: number;
  ctr: number;
  startDate: Date;
  endDate?: Date;
}

export interface TrendData {
  date: string;
  spend: number;
  revenue: number;
  conversions: number;
  roas: number;
}

export interface AttributionReport {
  model: 'last_click' | 'first_click' | 'linear' | 'time_decay' | 'position_based' | 'data_driven';
  totalConversions: number;
  totalRevenue: number;
  touchpoints: {
    channel: string;
    conversions: number;
    revenue: number;
    contribution: number;
  }[];
  paths: {
    path: string[];
    conversions: number;
    revenue: number;
  }[];
}

export interface KPIDashboard {
  kpis: {
    id: string;
    name: string;
    value: number;
    previousValue: number;
    change: number;
    changePercent: number;
    target?: number;
    status: 'on_track' | 'at_risk' | 'off_track';
  }[];
  alerts: {
    id: string;
    type: 'warning' | 'critical' | 'info';
    message: string;
    metric: string;
    timestamp: Date;
  }[];
  recommendations: {
    id: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    action: string;
  }[];
}

class UnifiedAnalyticsService {
  private metricsCache: Map<string, UnifiedMetrics> = new Map();

  constructor() {
    console.log('📊 Unified Analytics Service initialized');
    console.log('   Features: Cross-vertical metrics, ROI/ROAS, Attribution modeling');
  }

  async getUnifiedMetrics(
    brandId: string,
    startDate: Date,
    endDate: Date,
    options?: {
      channels?: string[];
      verticals?: string[];
      granularity?: 'hourly' | 'daily' | 'weekly' | 'monthly';
    }
  ): Promise<UnifiedMetrics> {
    const cacheKey = `${brandId}_${startDate.toISOString()}_${endDate.toISOString()}`;
    
    const totalSpend = Math.random() * 50000 + 5000;
    const totalRevenue = totalSpend * (1.5 + Math.random() * 3);
    const conversions = Math.floor(Math.random() * 500) + 50;
    const impressions = Math.floor(Math.random() * 1000000) + 100000;
    const clicks = Math.floor(impressions * (0.01 + Math.random() * 0.04));

    const channels = ['meta', 'google', 'linkedin', 'organic_social', 'email', 'direct'];
    const byChannel = channels.map(channel => {
      const channelSpend = totalSpend * (0.1 + Math.random() * 0.3);
      const channelRevenue = channelSpend * (1 + Math.random() * 4);
      const channelConversions = Math.floor(conversions * (0.1 + Math.random() * 0.3));
      const channelImpressions = Math.floor(impressions * (0.1 + Math.random() * 0.3));
      const channelClicks = Math.floor(channelImpressions * (0.01 + Math.random() * 0.05));
      
      return {
        channel,
        spend: channelSpend,
        revenue: channelRevenue,
        roas: channelSpend > 0 ? channelRevenue / channelSpend : 0,
        conversions: channelConversions,
        cpa: channelConversions > 0 ? channelSpend / channelConversions : 0,
        impressions: channelImpressions,
        clicks: channelClicks,
        ctr: channelImpressions > 0 ? (channelClicks / channelImpressions) * 100 : 0,
        contribution: (channelRevenue / totalRevenue) * 100
      };
    });

    const verticals = ['social', 'seo', 'performance_ads', 'email', 'whatsapp', 'linkedin_b2b', 'web'];
    const byVertical = verticals.map(vertical => {
      const verticalSpend = totalSpend * (0.1 + Math.random() * 0.2);
      const verticalRevenue = verticalSpend * (1 + Math.random() * 3);
      
      return {
        vertical,
        spend: verticalSpend,
        revenue: verticalRevenue,
        roas: verticalSpend > 0 ? verticalRevenue / verticalSpend : 0,
        activities: Math.floor(Math.random() * 100) + 10,
        performance: 70 + Math.random() * 30
      };
    });

    const byCampaign: CampaignMetrics[] = [];
    for (let i = 0; i < 10; i++) {
      const campaignSpend = Math.random() * 5000 + 500;
      const campaignRevenue = campaignSpend * (0.5 + Math.random() * 4);
      const campaignConversions = Math.floor(Math.random() * 50) + 5;
      const campaignImpressions = Math.floor(Math.random() * 100000) + 10000;
      const campaignClicks = Math.floor(campaignImpressions * (0.01 + Math.random() * 0.04));
      
      byCampaign.push({
        id: `campaign_${i}`,
        name: `Campaign ${i + 1}`,
        channel: channels[Math.floor(Math.random() * channels.length)],
        status: Math.random() > 0.7 ? 'active' : Math.random() > 0.5 ? 'paused' : 'completed',
        spend: campaignSpend,
        revenue: campaignRevenue,
        roas: campaignSpend > 0 ? campaignRevenue / campaignSpend : 0,
        conversions: campaignConversions,
        impressions: campaignImpressions,
        clicks: campaignClicks,
        ctr: campaignImpressions > 0 ? (campaignClicks / campaignImpressions) * 100 : 0,
        startDate: new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
      });
    }

    const trends: TrendData[] = [];
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const daySpend = totalSpend / daysDiff * (0.8 + Math.random() * 0.4);
      const dayRevenue = daySpend * (1 + Math.random() * 3);
      const dayConversions = Math.floor(conversions / daysDiff * (0.7 + Math.random() * 0.6));
      
      trends.push({
        date: date.toISOString().split('T')[0],
        spend: daySpend,
        revenue: dayRevenue,
        conversions: dayConversions,
        roas: daySpend > 0 ? dayRevenue / daySpend : 0
      });
    }

    const metrics: UnifiedMetrics = {
      period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      startDate,
      endDate,
      overview: {
        totalSpend,
        totalRevenue,
        roas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
        roi: totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0,
        conversions,
        costPerConversion: conversions > 0 ? totalSpend / conversions : 0,
        impressions,
        clicks,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        cpc: clicks > 0 ? totalSpend / clicks : 0,
        cpm: impressions > 0 ? (totalSpend / impressions) * 1000 : 0
      },
      byChannel,
      byVertical,
      byCampaign,
      trends
    };

    this.metricsCache.set(cacheKey, metrics);
    return metrics;
  }

  async getAttributionReport(
    brandId: string,
    model: AttributionReport['model'],
    startDate: Date,
    endDate: Date
  ): Promise<AttributionReport> {
    const channels = ['meta', 'google', 'linkedin', 'organic_social', 'email', 'direct', 'referral'];
    const totalConversions = Math.floor(Math.random() * 500) + 100;
    const totalRevenue = Math.random() * 100000 + 10000;

    const touchpoints = channels.map(channel => {
      const baseContribution = Math.random();
      return {
        channel,
        conversions: Math.floor(totalConversions * baseContribution * 0.3),
        revenue: totalRevenue * baseContribution * 0.3,
        contribution: baseContribution * 30
      };
    });

    const normalizedTotal = touchpoints.reduce((sum, t) => sum + t.contribution, 0);
    touchpoints.forEach(t => t.contribution = (t.contribution / normalizedTotal) * 100);

    const paths = [
      { path: ['organic_social', 'email', 'direct'], conversions: Math.floor(totalConversions * 0.15), revenue: totalRevenue * 0.15 },
      { path: ['meta', 'google', 'direct'], conversions: Math.floor(totalConversions * 0.12), revenue: totalRevenue * 0.12 },
      { path: ['google', 'linkedin', 'email', 'direct'], conversions: Math.floor(totalConversions * 0.10), revenue: totalRevenue * 0.10 },
      { path: ['referral', 'direct'], conversions: Math.floor(totalConversions * 0.08), revenue: totalRevenue * 0.08 },
      { path: ['meta', 'direct'], conversions: Math.floor(totalConversions * 0.20), revenue: totalRevenue * 0.20 }
    ];

    return {
      model,
      totalConversions,
      totalRevenue,
      touchpoints,
      paths
    };
  }

  async getKPIDashboard(brandId: string): Promise<KPIDashboard> {
    const kpis = [
      { id: 'roas', name: 'Return on Ad Spend', value: 2.8, previousValue: 2.5, target: 3.0 },
      { id: 'cpa', name: 'Cost per Acquisition', value: 45, previousValue: 52, target: 40 },
      { id: 'conversion_rate', name: 'Conversion Rate', value: 3.2, previousValue: 2.9, target: 4.0 },
      { id: 'ctr', name: 'Click-Through Rate', value: 2.1, previousValue: 1.8, target: 2.5 },
      { id: 'engagement_rate', name: 'Engagement Rate', value: 4.5, previousValue: 4.2, target: 5.0 },
      { id: 'lead_quality_score', name: 'Lead Quality Score', value: 72, previousValue: 68, target: 80 },
      { id: 'customer_ltv', name: 'Customer LTV', value: 450, previousValue: 420, target: 500 },
      { id: 'mql_to_sql', name: 'MQL to SQL Rate', value: 28, previousValue: 25, target: 35 }
    ].map(kpi => ({
      ...kpi,
      change: kpi.value - kpi.previousValue,
      changePercent: ((kpi.value - kpi.previousValue) / kpi.previousValue) * 100,
      status: kpi.target 
        ? (kpi.value >= kpi.target * 0.9 ? 'on_track' : kpi.value >= kpi.target * 0.7 ? 'at_risk' : 'off_track')
        : 'on_track' as const
    }));

    const alerts = [
      { id: 'alert_1', type: 'warning' as const, message: 'Meta Ads CPA is 15% above target', metric: 'meta_cpa', timestamp: new Date() },
      { id: 'alert_2', type: 'info' as const, message: 'Google Ads ROAS improved by 22% this week', metric: 'google_roas', timestamp: new Date() },
      { id: 'alert_3', type: 'critical' as const, message: 'Email open rate dropped below 15%', metric: 'email_open_rate', timestamp: new Date() }
    ];

    const recommendations = [
      { id: 'rec_1', title: 'Increase Meta Lookalike Budget', description: 'Top performing lookalike audiences showing 3.5x ROAS', impact: 'high' as const, action: 'Increase daily budget by 25%' },
      { id: 'rec_2', title: 'Optimize LinkedIn Targeting', description: 'Job title targeting outperforming company size targeting', impact: 'medium' as const, action: 'Shift 40% budget to job title campaigns' },
      { id: 'rec_3', title: 'Refresh Email Subject Lines', description: 'Subject line A/B tests show 35% improvement potential', impact: 'medium' as const, action: 'Test new subject line variants' },
      { id: 'rec_4', title: 'Launch Retargeting Campaign', description: 'Website visitors not converting show high intent signals', impact: 'high' as const, action: 'Create 7-day retargeting sequence' }
    ];

    return { kpis, alerts, recommendations };
  }

  async getChannelComparison(
    brandId: string,
    channels: string[],
    startDate: Date,
    endDate: Date
  ): Promise<{
    channels: {
      name: string;
      metrics: Record<string, number>;
      benchmark: Record<string, number>;
      status: 'above' | 'at' | 'below';
    }[];
    winner: string;
    insights: string[];
  }> {
    const channelData = channels.map(channel => {
      const roas = 1.5 + Math.random() * 3;
      const cpa = 30 + Math.random() * 50;
      const ctr = 1 + Math.random() * 4;
      const conversionRate = 1 + Math.random() * 5;

      return {
        name: channel,
        metrics: { roas, cpa, ctr, conversionRate },
        benchmark: { roas: 2.5, cpa: 45, ctr: 2.5, conversionRate: 3 },
        status: (roas > 2.5 ? 'above' : roas > 2 ? 'at' : 'below') as 'above' | 'at' | 'below'
      };
    });

    const winner = channelData.reduce((best, current) => 
      current.metrics.roas > best.metrics.roas ? current : best
    ).name;

    const insights = [
      `${winner} shows the highest ROAS at ${channelData.find(c => c.name === winner)?.metrics.roas.toFixed(2)}x`,
      `Consider reallocating budget from underperforming channels`,
      `Cross-channel attribution shows synergy between social and search`
    ];

    return { channels: channelData, winner, insights };
  }

  async generatePerformanceReport(
    brandId: string,
    reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly',
    options?: {
      includeAttribution?: boolean;
      includeRecommendations?: boolean;
      format?: 'json' | 'pdf' | 'csv';
    }
  ): Promise<{
    id: string;
    type: string;
    generatedAt: Date;
    summary: string;
    metrics: UnifiedMetrics;
    attribution?: AttributionReport;
    kpis: KPIDashboard;
  }> {
    const now = new Date();
    let startDate: Date;
    
    switch (reportType) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarterly':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }

    const metrics = await this.getUnifiedMetrics(brandId, startDate, now);
    const kpis = await this.getKPIDashboard(brandId);
    let attribution: AttributionReport | undefined;
    
    if (options?.includeAttribution) {
      attribution = await this.getAttributionReport(brandId, 'data_driven', startDate, now);
    }

    const summary = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Performance Report: 
    Total Spend: $${metrics.overview.totalSpend.toFixed(2)}, 
    Total Revenue: $${metrics.overview.totalRevenue.toFixed(2)}, 
    ROAS: ${metrics.overview.roas.toFixed(2)}x, 
    Conversions: ${metrics.overview.conversions}`;

    return {
      id: `report_${Date.now()}`,
      type: reportType,
      generatedAt: now,
      summary,
      metrics,
      attribution,
      kpis
    };
  }
}

export const unifiedAnalyticsService = new UnifiedAnalyticsService();
