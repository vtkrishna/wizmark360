/**
 * Digital Twin Framework - WAI SDK v3.1 P2
 * 
 * Real-time operational models for campaigns, customers, and marketing operations.
 * Features:
 * - Campaign digital twins with real-time simulation
 * - Customer behavior modeling
 * - Marketing operation state tracking
 * - Predictive scenario modeling
 * - Human-in-the-loop approval workflows
 * - State synchronization across systems
 */

export type TwinType = 'campaign' | 'customer' | 'operation' | 'workflow' | 'agent';

export interface DigitalTwin {
  id: string;
  type: TwinType;
  name: string;
  state: Record<string, any>;
  metadata: Record<string, any>;
  metrics: TwinMetrics;
  predictions: TwinPrediction[];
  history: TwinStateChange[];
  linkedTwins: string[];
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
  status: 'active' | 'paused' | 'archived';
}

export interface TwinMetrics {
  health: number; // 0-100
  performance: number; // 0-100
  efficiency: number; // 0-100
  confidence: number; // 0-1
  customMetrics: Record<string, number>;
}

export interface TwinPrediction {
  id: string;
  type: string;
  description: string;
  probability: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  recommendations: string[];
  createdAt: Date;
}

export interface TwinStateChange {
  id: string;
  timestamp: Date;
  changeType: 'update' | 'prediction' | 'action' | 'sync' | 'intervention';
  previousState?: Record<string, any>;
  newState: Record<string, any>;
  source: string;
  approved?: boolean;
  approvedBy?: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  twinId: string;
  variables: Record<string, any>;
  duration: number;
  results?: SimulationResult;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
}

export interface SimulationResult {
  outcomes: Record<string, any>;
  metrics: Record<string, number>;
  risks: { name: string; probability: number; impact: string }[];
  recommendations: string[];
  completedAt: Date;
}

export interface HumanApprovalRequest {
  id: string;
  twinId: string;
  type: 'action' | 'state_change' | 'prediction' | 'escalation';
  title: string;
  description: string;
  proposedAction: Record<string, any>;
  alternatives: { name: string; description: string; action: Record<string, any> }[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  deadline?: Date;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  decision?: {
    approved: boolean;
    approvedBy: string;
    comments?: string;
    decidedAt: Date;
  };
  createdAt: Date;
}

class DigitalTwinService {
  private twins: Map<string, DigitalTwin> = new Map();
  private simulations: Map<string, SimulationScenario> = new Map();
  private approvalRequests: Map<string, HumanApprovalRequest> = new Map();
  private stateSubscribers: Map<string, ((twin: DigitalTwin) => void)[]> = new Map();

  constructor() {
    console.log('🪞 Digital Twin Framework initialized');
    console.log('   Features: Campaign modeling, Customer twins, Scenario simulation');
    this.initializeSampleTwins();
  }

  private initializeSampleTwins(): void {
    // Create sample campaign digital twin
    this.createTwin({
      type: 'campaign',
      name: 'Q1 Product Launch Campaign',
      state: {
        budget: 50000,
        spent: 12500,
        reach: 125000,
        impressions: 450000,
        clicks: 8500,
        conversions: 425,
        status: 'active',
        channels: ['facebook', 'instagram', 'linkedin', 'google_ads'],
        startDate: '2026-01-15',
        endDate: '2026-03-31'
      },
      metadata: {
        targetAudience: 'B2B Tech Decision Makers',
        objective: 'Lead Generation',
        region: 'India'
      }
    });

    // Create sample customer segment twin
    this.createTwin({
      type: 'customer',
      name: 'Enterprise Tech Buyers Segment',
      state: {
        segmentSize: 15000,
        avgLTV: 25000,
        churnRisk: 0.12,
        engagementScore: 0.78,
        topInterests: ['AI', 'automation', 'analytics'],
        preferredChannels: ['email', 'linkedin', 'webinar'],
        purchaseCycle: '90 days'
      },
      metadata: {
        industry: 'Technology',
        companySize: '500-5000 employees',
        region: 'APAC'
      }
    });

    // Create marketing operation twin
    this.createTwin({
      type: 'operation',
      name: 'Content Marketing Pipeline',
      state: {
        contentInProgress: 12,
        contentPublished: 45,
        contentScheduled: 8,
        avgTimeToPublish: '3.5 days',
        teamUtilization: 0.85,
        qualityScore: 0.92,
        bottlenecks: ['review_stage']
      },
      metadata: {
        team: 'Content Team',
        tools: ['wordpress', 'canva', 'buffer']
      }
    });
  }

  /**
   * Create a new digital twin
   */
  createTwin(options: {
    type: TwinType;
    name: string;
    state: Record<string, any>;
    metadata?: Record<string, any>;
  }): DigitalTwin {
    const id = `twin_${options.type}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const twin: DigitalTwin = {
      id,
      type: options.type,
      name: options.name,
      state: options.state,
      metadata: options.metadata || {},
      metrics: this.calculateMetrics(options.state, options.type),
      predictions: [],
      history: [{
        id: `change_${Date.now()}`,
        timestamp: new Date(),
        changeType: 'update',
        newState: options.state,
        source: 'system_init'
      }],
      linkedTwins: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };

    // Generate initial predictions
    twin.predictions = this.generatePredictions(twin);

    this.twins.set(id, twin);
    console.log(`🪞 Digital Twin created: ${options.name} [${options.type}]`);
    return twin;
  }

  /**
   * Get a digital twin by ID
   */
  getTwin(twinId: string): DigitalTwin | undefined {
    return this.twins.get(twinId);
  }

  /**
   * List all digital twins
   */
  listTwins(options?: {
    type?: TwinType;
    status?: DigitalTwin['status'];
    limit?: number;
  }): DigitalTwin[] {
    let twins = Array.from(this.twins.values());

    if (options?.type) {
      twins = twins.filter(t => t.type === options.type);
    }
    if (options?.status) {
      twins = twins.filter(t => t.status === options.status);
    }

    twins.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return twins.slice(0, options?.limit || 50);
  }

  /**
   * Update twin state
   */
  updateState(
    twinId: string,
    stateUpdate: Record<string, any>,
    source: string = 'api',
    requiresApproval: boolean = false
  ): DigitalTwin | HumanApprovalRequest {
    const twin = this.twins.get(twinId);
    if (!twin) throw new Error(`Twin not found: ${twinId}`);

    if (requiresApproval) {
      return this.createApprovalRequest(twinId, {
        type: 'state_change',
        title: `State Update for ${twin.name}`,
        description: `Proposed changes to ${Object.keys(stateUpdate).join(', ')}`,
        proposedAction: stateUpdate,
        urgency: 'medium'
      });
    }

    const previousState = { ...twin.state };
    twin.state = { ...twin.state, ...stateUpdate };
    twin.updatedAt = new Date();
    twin.metrics = this.calculateMetrics(twin.state, twin.type);

    // Record state change
    twin.history.push({
      id: `change_${Date.now()}`,
      timestamp: new Date(),
      changeType: 'update',
      previousState,
      newState: twin.state,
      source
    });

    // Re-generate predictions
    twin.predictions = this.generatePredictions(twin);

    // Notify subscribers
    this.notifySubscribers(twin);

    return twin;
  }

  /**
   * Run simulation scenario
   */
  async runSimulation(
    twinId: string,
    scenario: {
      name: string;
      description: string;
      variables: Record<string, any>;
      duration: number;
    }
  ): Promise<SimulationScenario> {
    const twin = this.twins.get(twinId);
    if (!twin) throw new Error(`Twin not found: ${twinId}`);

    const simulation: SimulationScenario = {
      id: `sim_${Date.now()}`,
      name: scenario.name,
      description: scenario.description,
      twinId,
      variables: scenario.variables,
      duration: scenario.duration,
      status: 'running',
      createdAt: new Date()
    };

    this.simulations.set(simulation.id, simulation);

    // Simulate async processing
    simulation.results = await this.executeSimulation(twin, scenario);
    simulation.status = 'completed';

    return simulation;
  }

  /**
   * Create human-in-the-loop approval request
   */
  createApprovalRequest(
    twinId: string,
    request: {
      type: HumanApprovalRequest['type'];
      title: string;
      description: string;
      proposedAction: Record<string, any>;
      alternatives?: HumanApprovalRequest['alternatives'];
      urgency?: HumanApprovalRequest['urgency'];
      deadline?: Date;
    }
  ): HumanApprovalRequest {
    const approval: HumanApprovalRequest = {
      id: `approval_${Date.now()}`,
      twinId,
      type: request.type,
      title: request.title,
      description: request.description,
      proposedAction: request.proposedAction,
      alternatives: request.alternatives || [],
      urgency: request.urgency || 'medium',
      deadline: request.deadline,
      status: 'pending',
      createdAt: new Date()
    };

    this.approvalRequests.set(approval.id, approval);
    console.log(`📋 Approval request created: ${request.title}`);
    return approval;
  }

  /**
   * Process approval decision
   */
  processApproval(
    approvalId: string,
    decision: {
      approved: boolean;
      approvedBy: string;
      comments?: string;
    }
  ): HumanApprovalRequest {
    const approval = this.approvalRequests.get(approvalId);
    if (!approval) throw new Error(`Approval request not found: ${approvalId}`);

    approval.status = decision.approved ? 'approved' : 'rejected';
    approval.decision = {
      ...decision,
      decidedAt: new Date()
    };

    // If approved, apply the action
    if (decision.approved && approval.type === 'state_change') {
      const twin = this.twins.get(approval.twinId);
      if (twin) {
        this.updateState(approval.twinId, approval.proposedAction, `approval:${approvalId}`);
      }
    }

    return approval;
  }

  /**
   * Get pending approvals
   */
  getPendingApprovals(twinId?: string): HumanApprovalRequest[] {
    let approvals = Array.from(this.approvalRequests.values())
      .filter(a => a.status === 'pending');

    if (twinId) {
      approvals = approvals.filter(a => a.twinId === twinId);
    }

    return approvals.sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }

  /**
   * Link two twins together
   */
  linkTwins(twinId1: string, twinId2: string): void {
    const twin1 = this.twins.get(twinId1);
    const twin2 = this.twins.get(twinId2);

    if (!twin1 || !twin2) {
      throw new Error('One or both twins not found');
    }

    if (!twin1.linkedTwins.includes(twinId2)) {
      twin1.linkedTwins.push(twinId2);
    }
    if (!twin2.linkedTwins.includes(twinId1)) {
      twin2.linkedTwins.push(twinId1);
    }
  }

  /**
   * Subscribe to twin state changes
   */
  subscribe(twinId: string, callback: (twin: DigitalTwin) => void): () => void {
    const subscribers = this.stateSubscribers.get(twinId) || [];
    subscribers.push(callback);
    this.stateSubscribers.set(twinId, subscribers);

    // Return unsubscribe function
    return () => {
      const subs = this.stateSubscribers.get(twinId) || [];
      const index = subs.indexOf(callback);
      if (index > -1) subs.splice(index, 1);
    };
  }

  /**
   * Get twin predictions
   */
  getPredictions(twinId: string): TwinPrediction[] {
    const twin = this.twins.get(twinId);
    return twin?.predictions || [];
  }

  /**
   * Get twin history
   */
  getHistory(twinId: string, limit: number = 50): TwinStateChange[] {
    const twin = this.twins.get(twinId);
    if (!twin) return [];
    return twin.history.slice(-limit);
  }

  /**
   * Get simulation results
   */
  getSimulation(simulationId: string): SimulationScenario | undefined {
    return this.simulations.get(simulationId);
  }

  /**
   * List simulations
   */
  listSimulations(twinId?: string): SimulationScenario[] {
    let sims = Array.from(this.simulations.values());
    if (twinId) {
      sims = sims.filter(s => s.twinId === twinId);
    }
    return sims.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Private helper methods

  private calculateMetrics(state: Record<string, any>, type: TwinType): TwinMetrics {
    const metrics: TwinMetrics = {
      health: 85,
      performance: 75,
      efficiency: 80,
      confidence: 0.85,
      customMetrics: {}
    };

    switch (type) {
      case 'campaign':
        if (state.budget && state.spent) {
          metrics.efficiency = ((state.conversions || 0) / (state.clicks || 1)) * 100;
          metrics.customMetrics.budgetUtilization = (state.spent / state.budget) * 100;
          metrics.customMetrics.ctr = ((state.clicks || 0) / (state.impressions || 1)) * 100;
          metrics.customMetrics.conversionRate = ((state.conversions || 0) / (state.clicks || 1)) * 100;
        }
        break;

      case 'customer':
        metrics.health = (1 - (state.churnRisk || 0.15)) * 100;
        metrics.performance = (state.engagementScore || 0.7) * 100;
        metrics.customMetrics.ltv = state.avgLTV || 0;
        metrics.customMetrics.segmentSize = state.segmentSize || 0;
        break;

      case 'operation':
        metrics.efficiency = (1 - (state.teamUtilization || 0.8)) > 0.5 ? 70 : 90;
        metrics.performance = (state.qualityScore || 0.8) * 100;
        metrics.customMetrics.contentVelocity = (state.contentPublished || 0) / 30; // per day
        break;
    }

    return metrics;
  }

  private generatePredictions(twin: DigitalTwin): TwinPrediction[] {
    const predictions: TwinPrediction[] = [];

    switch (twin.type) {
      case 'campaign':
        if (twin.state.spent / twin.state.budget > 0.8) {
          predictions.push({
            id: `pred_${Date.now()}_1`,
            type: 'budget_exhaustion',
            description: 'Campaign budget will be exhausted before end date',
            probability: 0.75,
            impact: 'high',
            timeframe: '7 days',
            recommendations: [
              'Consider increasing budget by 25%',
              'Optimize underperforming channels',
              'Pause low-ROI audiences'
            ],
            createdAt: new Date()
          });
        }
        break;

      case 'customer':
        if (twin.state.churnRisk > 0.1) {
          predictions.push({
            id: `pred_${Date.now()}_1`,
            type: 'churn_risk',
            description: 'Elevated churn risk detected in segment',
            probability: twin.state.churnRisk,
            impact: 'critical',
            timeframe: '30 days',
            recommendations: [
              'Launch re-engagement campaign',
              'Offer personalized incentives',
              'Schedule account health calls'
            ],
            createdAt: new Date()
          });
        }
        break;

      case 'operation':
        if (twin.state.teamUtilization > 0.9) {
          predictions.push({
            id: `pred_${Date.now()}_1`,
            type: 'capacity_risk',
            description: 'Team approaching maximum capacity',
            probability: 0.85,
            impact: 'medium',
            timeframe: '14 days',
            recommendations: [
              'Prioritize high-impact content',
              'Defer non-essential projects',
              'Consider temporary resource augmentation'
            ],
            createdAt: new Date()
          });
        }
        break;
    }

    return predictions;
  }

  private async executeSimulation(
    twin: DigitalTwin,
    scenario: { variables: Record<string, any>; duration: number }
  ): Promise<SimulationResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));

    // Apply scenario variables to calculate outcomes
    const outcomes: Record<string, any> = {};
    const risks: SimulationResult['risks'] = [];

    switch (twin.type) {
      case 'campaign':
        const budgetChange = scenario.variables.budgetChange || 0;
        const newBudget = (twin.state.budget || 50000) * (1 + budgetChange / 100);
        
        outcomes.projectedReach = (twin.state.reach || 100000) * (1 + budgetChange / 100);
        outcomes.projectedConversions = (twin.state.conversions || 100) * (1 + budgetChange / 100 * 0.8);
        outcomes.projectedCPA = newBudget / outcomes.projectedConversions;
        
        if (budgetChange > 50) {
          risks.push({
            name: 'Audience Saturation',
            probability: 0.4,
            impact: 'medium'
          });
        }
        break;

      case 'customer':
        const interventionRate = scenario.variables.interventionRate || 0;
        
        outcomes.projectedChurnReduction = (twin.state.churnRisk || 0.15) * interventionRate;
        outcomes.projectedRetention = (1 - twin.state.churnRisk + outcomes.projectedChurnReduction) * 100;
        outcomes.projectedLTVIncrease = outcomes.projectedRetention * 0.02 * (twin.state.avgLTV || 25000);
        break;
    }

    return {
      outcomes,
      metrics: {
        confidenceLevel: 0.78,
        dataQuality: 0.85,
        scenarioRealism: 0.72
      },
      risks,
      recommendations: [
        'Consider phased implementation to reduce risk',
        'Monitor key metrics closely during transition',
        'Prepare rollback plan if targets not met'
      ],
      completedAt: new Date()
    };
  }

  private notifySubscribers(twin: DigitalTwin): void {
    const subscribers = this.stateSubscribers.get(twin.id) || [];
    for (const callback of subscribers) {
      try {
        callback(twin);
      } catch (error) {
        console.error('Subscriber notification error:', error);
      }
    }
  }

  getHealth(): { status: 'healthy'; twinCount: number; activeSimulations: number; pendingApprovals: number } {
    return {
      status: 'healthy',
      twinCount: this.twins.size,
      activeSimulations: Array.from(this.simulations.values()).filter(s => s.status === 'running').length,
      pendingApprovals: Array.from(this.approvalRequests.values()).filter(a => a.status === 'pending').length
    };
  }
}

export const digitalTwinService = new DigitalTwinService();
