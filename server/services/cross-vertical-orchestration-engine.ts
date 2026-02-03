/**
 * Cross-Vertical Orchestration Engine
 * Intelligent orchestration across all 7 marketing verticals
 * Powered by WAI-SDK v3.1.1 backbone with smart routing and optimization
 */

import { verticalWorkflowEngine } from './vertical-workflow-engine';

export interface CrossVerticalCampaign {
  id: string;
  name: string;
  brandId: string;
  objective: 'awareness' | 'consideration' | 'conversion' | 'retention';
  budget: {
    total: number;
    allocation: Record<string, number>;
  };
  timeline: {
    startDate: Date;
    endDate: Date;
    phases: Array<{
      name: string;
      startDate: Date;
      endDate: Date;
      verticals: string[];
    }>;
  };
  verticalConfigs: Record<string, any>;
  status: 'draft' | 'active' | 'paused' | 'completed';
  metrics: {
    reach: number;
    engagement: number;
    conversions: number;
    revenue: number;
    roas: number;
  };
}

export interface VerticalSynergy {
  sourceVertical: string;
  targetVertical: string;
  synergyType: 'data_sharing' | 'audience_sync' | 'content_repurposing' | 'funnel_handoff';
  strength: number;
  automationLevel: 'manual' | 'semi_auto' | 'full_auto';
}

export interface IntelligentAllocation {
  vertical: string;
  recommendedBudget: number;
  predictedRoas: number;
  confidence: number;
  reasoning: string;
}

const VERTICAL_SYNERGIES: VerticalSynergy[] = [
  { sourceVertical: 'social_media', targetVertical: 'performance_ads', synergyType: 'audience_sync', strength: 0.85, automationLevel: 'full_auto' },
  { sourceVertical: 'seo_geo', targetVertical: 'social_media', synergyType: 'content_repurposing', strength: 0.75, automationLevel: 'semi_auto' },
  { sourceVertical: 'performance_ads', targetVertical: 'sales_sdr', synergyType: 'funnel_handoff', strength: 0.90, automationLevel: 'full_auto' },
  { sourceVertical: 'linkedin_b2b', targetVertical: 'sales_sdr', synergyType: 'data_sharing', strength: 0.95, automationLevel: 'full_auto' },
  { sourceVertical: 'whatsapp', targetVertical: 'sales_sdr', synergyType: 'funnel_handoff', strength: 0.88, automationLevel: 'full_auto' },
  { sourceVertical: 'social_media', targetVertical: 'linkedin_b2b', synergyType: 'content_repurposing', strength: 0.70, automationLevel: 'semi_auto' },
  { sourceVertical: 'seo_geo', targetVertical: 'performance_ads', synergyType: 'data_sharing', strength: 0.80, automationLevel: 'full_auto' },
  { sourceVertical: 'telegram', targetVertical: 'whatsapp', synergyType: 'audience_sync', strength: 0.65, automationLevel: 'semi_auto' }
];

const VERTICAL_BENCHMARKS: Record<string, { avgRoas: number; avgCpa: number; avgCtr: number }> = {
  social_media: { avgRoas: 2.5, avgCpa: 35, avgCtr: 2.1 },
  seo_geo: { avgRoas: 4.2, avgCpa: 15, avgCtr: 3.5 },
  performance_ads: { avgRoas: 3.8, avgCpa: 28, avgCtr: 2.8 },
  sales_sdr: { avgRoas: 5.5, avgCpa: 45, avgCtr: 4.2 },
  whatsapp: { avgRoas: 3.2, avgCpa: 12, avgCtr: 35.0 },
  linkedin_b2b: { avgRoas: 4.8, avgCpa: 55, avgCtr: 1.8 },
  telegram: { avgRoas: 2.8, avgCpa: 10, avgCtr: 28.0 }
};

class CrossVerticalOrchestrationEngine {
  private campaigns: Map<string, CrossVerticalCampaign> = new Map();
  private synergies: VerticalSynergy[] = VERTICAL_SYNERGIES;

  constructor() {
    console.log('🌐 Cross-Vertical Orchestration Engine initialized');
    console.log('   Synergies: 8 cross-vertical connections mapped');
    console.log('   Optimization: Intelligent budget allocation enabled');
  }

  async createCrossVerticalCampaign(config: {
    name: string;
    brandId: string;
    objective: CrossVerticalCampaign['objective'];
    budget: number;
    verticals: string[];
    startDate: Date;
    endDate: Date;
    verticalConfigs?: Record<string, any>;
  }): Promise<CrossVerticalCampaign> {
    const campaignId = `cv_campaign_${Date.now()}`;
    
    const allocation = await this.calculateOptimalBudgetAllocation(
      config.budget,
      config.verticals,
      config.objective
    );

    const campaign: CrossVerticalCampaign = {
      id: campaignId,
      name: config.name,
      brandId: config.brandId,
      objective: config.objective,
      budget: {
        total: config.budget,
        allocation: allocation.reduce((acc, a) => ({ ...acc, [a.vertical]: a.recommendedBudget }), {})
      },
      timeline: {
        startDate: config.startDate,
        endDate: config.endDate,
        phases: this.generateCampaignPhases(config.startDate, config.endDate, config.verticals, config.objective)
      },
      verticalConfigs: config.verticalConfigs || {},
      status: 'draft',
      metrics: { reach: 0, engagement: 0, conversions: 0, revenue: 0, roas: 0 }
    };

    this.campaigns.set(campaignId, campaign);
    return campaign;
  }

  async calculateOptimalBudgetAllocation(
    totalBudget: number,
    verticals: string[],
    objective: CrossVerticalCampaign['objective']
  ): Promise<IntelligentAllocation[]> {
    const weights = this.getObjectiveWeights(objective);
    
    return verticals.map(vertical => {
      const benchmark = VERTICAL_BENCHMARKS[vertical] || { avgRoas: 2.0, avgCpa: 30, avgCtr: 2.0 };
      const weight = weights[vertical] || 1;
      
      const baseAllocation = totalBudget / verticals.length;
      const weightedAllocation = baseAllocation * weight;
      
      const synergyBonus = this.calculateSynergyBonus(vertical, verticals);
      const finalAllocation = weightedAllocation * (1 + synergyBonus);
      
      const normalizedAllocation = (finalAllocation / verticals.reduce((sum, v) => {
        const w = weights[v] || 1;
        const s = this.calculateSynergyBonus(v, verticals);
        return sum + (baseAllocation * w * (1 + s));
      }, 0)) * totalBudget;

      return {
        vertical,
        recommendedBudget: Math.round(normalizedAllocation),
        predictedRoas: benchmark.avgRoas * (1 + synergyBonus * 0.3),
        confidence: 0.75 + Math.random() * 0.2,
        reasoning: this.generateAllocationReasoning(vertical, objective, synergyBonus)
      };
    });
  }

  private getObjectiveWeights(objective: CrossVerticalCampaign['objective']): Record<string, number> {
    const weights: Record<string, Record<string, number>> = {
      awareness: {
        social_media: 1.5,
        performance_ads: 1.3,
        linkedin_b2b: 0.8,
        seo_geo: 1.2,
        whatsapp: 0.6,
        telegram: 0.7,
        sales_sdr: 0.3
      },
      consideration: {
        social_media: 1.2,
        performance_ads: 1.4,
        linkedin_b2b: 1.3,
        seo_geo: 1.5,
        whatsapp: 1.0,
        telegram: 0.9,
        sales_sdr: 0.8
      },
      conversion: {
        social_media: 0.8,
        performance_ads: 1.6,
        linkedin_b2b: 1.4,
        seo_geo: 1.0,
        whatsapp: 1.3,
        telegram: 1.1,
        sales_sdr: 1.5
      },
      retention: {
        social_media: 1.0,
        performance_ads: 0.6,
        linkedin_b2b: 1.2,
        seo_geo: 0.8,
        whatsapp: 1.6,
        telegram: 1.4,
        sales_sdr: 1.3
      }
    };
    return weights[objective] || {};
  }

  private calculateSynergyBonus(vertical: string, activeVerticals: string[]): number {
    const relevantSynergies = this.synergies.filter(
      s => (s.sourceVertical === vertical || s.targetVertical === vertical) &&
           activeVerticals.includes(s.sourceVertical) &&
           activeVerticals.includes(s.targetVertical)
    );
    
    if (relevantSynergies.length === 0) return 0;
    
    const avgStrength = relevantSynergies.reduce((sum, s) => sum + s.strength, 0) / relevantSynergies.length;
    return avgStrength * 0.15;
  }

  private generateAllocationReasoning(vertical: string, objective: string, synergyBonus: number): string {
    const benchmark = VERTICAL_BENCHMARKS[vertical];
    const reasons: string[] = [];
    
    if (benchmark) {
      if (benchmark.avgRoas > 3.5) {
        reasons.push(`High historical ROAS (${benchmark.avgRoas.toFixed(1)}x)`);
      }
      if (benchmark.avgCpa < 25) {
        reasons.push(`Low cost per acquisition ($${benchmark.avgCpa})`);
      }
    }
    
    if (synergyBonus > 0.1) {
      reasons.push(`Strong synergy with other active verticals (+${(synergyBonus * 100).toFixed(0)}%)`);
    }
    
    reasons.push(`Aligned with ${objective} objective`);
    
    return reasons.join('. ');
  }

  private generateCampaignPhases(
    startDate: Date,
    endDate: Date,
    verticals: string[],
    objective: CrossVerticalCampaign['objective']
  ): CrossVerticalCampaign['timeline']['phases'] {
    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (duration <= 14) {
      return [{
        name: 'Full Campaign',
        startDate,
        endDate,
        verticals
      }];
    }

    const phaseDuration = duration / 3;
    
    return [
      {
        name: 'Launch Phase',
        startDate,
        endDate: new Date(startDate.getTime() + phaseDuration * 24 * 60 * 60 * 1000),
        verticals: objective === 'awareness' 
          ? verticals.filter(v => ['social_media', 'performance_ads'].includes(v))
          : verticals
      },
      {
        name: 'Optimization Phase',
        startDate: new Date(startDate.getTime() + phaseDuration * 24 * 60 * 60 * 1000),
        endDate: new Date(startDate.getTime() + phaseDuration * 2 * 24 * 60 * 60 * 1000),
        verticals
      },
      {
        name: 'Scale Phase',
        startDate: new Date(startDate.getTime() + phaseDuration * 2 * 24 * 60 * 60 * 1000),
        endDate,
        verticals
      }
    ];
  }

  async executeCrossVerticalCampaign(campaignId: string): Promise<{
    success: boolean;
    executions: Array<{ vertical: string; workflowId: string; executionId: string; status: string }>;
  }> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    campaign.status = 'active';
    const executions: Array<{ vertical: string; workflowId: string; executionId: string; status: string }> = [];

    const verticals = Object.keys(campaign.budget.allocation);
    
    for (const vertical of verticals) {
      const workflow = this.getWorkflowForVertical(vertical);
      if (workflow) {
        const execution = await verticalWorkflowEngine.executeWorkflow(
          workflow.id,
          {
            brandId: campaign.brandId,
            budget: campaign.budget.allocation[vertical],
            objective: campaign.objective,
            ...campaign.verticalConfigs[vertical]
          },
          { mockExternalApis: true }
        );

        executions.push({
          vertical,
          workflowId: workflow.id,
          executionId: execution.id,
          status: execution.status
        });
      }
    }

    campaign.metrics = this.simulateCampaignMetrics(campaign);
    
    return { success: true, executions };
  }

  private getWorkflowForVertical(vertical: string): { id: string; name: string } | null {
    const workflowMapping: Record<string, string> = {
      social_media: 'social-content-pipeline',
      seo_geo: 'seo-optimization-pipeline',
      performance_ads: 'performance-ads-pipeline',
      sales_sdr: 'sales-sdr-pipeline',
      whatsapp: 'whatsapp-marketing-pipeline',
      linkedin_b2b: 'linkedin-b2b-pipeline',
      telegram: 'telegram-marketing-pipeline'
    };

    const workflowId = workflowMapping[vertical];
    if (!workflowId) return null;

    const workflow = verticalWorkflowEngine.getWorkflow(workflowId);
    return workflow ? { id: workflow.id, name: workflow.name } : null;
  }

  private simulateCampaignMetrics(campaign: CrossVerticalCampaign): CrossVerticalCampaign['metrics'] {
    const totalBudget = campaign.budget.total;
    const multiplier = campaign.objective === 'conversion' ? 1.2 : 
                       campaign.objective === 'awareness' ? 0.8 : 1.0;

    return {
      reach: Math.floor(totalBudget * 50 * multiplier),
      engagement: Math.floor(totalBudget * 5 * multiplier),
      conversions: Math.floor(totalBudget * 0.02 * multiplier),
      revenue: Math.floor(totalBudget * 3.5 * multiplier),
      roas: 3.5 * multiplier
    };
  }

  async getVerticalSynergies(verticals: string[]): Promise<VerticalSynergy[]> {
    return this.synergies.filter(
      s => verticals.includes(s.sourceVertical) && verticals.includes(s.targetVertical)
    );
  }

  async getVerticalBenchmarks(): Promise<typeof VERTICAL_BENCHMARKS> {
    return VERTICAL_BENCHMARKS;
  }

  getCampaign(campaignId: string): CrossVerticalCampaign | undefined {
    return this.campaigns.get(campaignId);
  }

  listCampaigns(brandId?: string): CrossVerticalCampaign[] {
    const campaigns = Array.from(this.campaigns.values());
    if (brandId) {
      return campaigns.filter(c => c.brandId === brandId);
    }
    return campaigns;
  }

  async optimizeCampaign(campaignId: string): Promise<{
    recommendations: Array<{
      type: 'budget_shift' | 'creative_refresh' | 'audience_expansion' | 'vertical_pause';
      vertical: string;
      action: string;
      impact: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  }> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const recommendations = [];
    const verticals = Object.keys(campaign.budget.allocation);

    for (const vertical of verticals) {
      const benchmark = VERTICAL_BENCHMARKS[vertical];
      const allocation = campaign.budget.allocation[vertical];
      
      if (benchmark && benchmark.avgRoas > 4) {
        recommendations.push({
          type: 'budget_shift' as const,
          vertical,
          action: `Increase budget allocation to ${vertical.replace('_', ' ')}`,
          impact: `Expected +${((benchmark.avgRoas - 3) * 10).toFixed(0)}% ROI improvement`,
          priority: 'high' as const
        });
      }

      if (benchmark && benchmark.avgCtr < 2) {
        recommendations.push({
          type: 'creative_refresh' as const,
          vertical,
          action: `Refresh creatives for ${vertical.replace('_', ' ')}`,
          impact: 'Expected +15-25% CTR improvement',
          priority: 'medium' as const
        });
      }
    }

    const synergies = await this.getVerticalSynergies(verticals);
    for (const synergy of synergies) {
      if (synergy.strength > 0.8 && synergy.automationLevel !== 'full_auto') {
        recommendations.push({
          type: 'audience_expansion' as const,
          vertical: synergy.targetVertical,
          action: `Enable auto-sync from ${synergy.sourceVertical} to ${synergy.targetVertical}`,
          impact: `Leverage ${(synergy.strength * 100).toFixed(0)}% synergy strength`,
          priority: 'high' as const
        });
      }
    }

    return { recommendations };
  }
}

export const crossVerticalOrchestrationEngine = new CrossVerticalOrchestrationEngine();
