/**
 * WAI SDK v9.0 - GRPO 2.0 Integration
 * Group Relative Policy Optimization for multi-agent coordination
 */

import { EventEmitter } from 'events';

export interface GRPOAgent {
  id: string;
  name: string;
  type: 'primary' | 'secondary' | 'specialist' | 'coordinator';
  capabilities: string[];
  performance: {
    accuracy: number;
    efficiency: number;
    consistency: number;
    collaboration: number;
  };
  policy: {
    parameters: Record<string, number>;
    strategy: string;
    adaptationRate: number;
    explorationRate: number;
  };
  state: {
    currentTask?: string;
    workload: number;
    availability: number;
    context: any;
  };
  learning: {
    experienceBuffer: GRPOExperience[];
    gradients: Record<string, number>;
    updateCount: number;
    lastUpdate: Date;
  };
}

export interface GRPOExperience {
  id: string;
  timestamp: Date;
  agentId: string;
  groupId: string;
  state: any;
  action: string;
  reward: number;
  nextState: any;
  groupPerformance: number;
  relativeRank: number;
  metadata: any;
}

export interface GRPOGroup {
  id: string;
  name: string;
  objective: string;
  agents: GRPOAgent[];
  coordinator?: string; // agent ID
  performance: {
    collective: number;
    individual: Record<string, number>;
    diversity: number;
    cohesion: number;
  };
  optimization: {
    strategy: 'competitive' | 'collaborative' | 'adaptive';
    iterations: number;
    convergenceThreshold: number;
    lastOptimization: Date;
  };
  status: 'forming' | 'optimizing' | 'converged' | 'disbanded';
  metrics: {
    totalReward: number;
    episodeCount: number;
    avgGroupPerformance: number;
    improvementRate: number;
  };
}

export interface GRPOTrainingSession {
  id: string;
  groupId: string;
  startTime: Date;
  endTime?: Date;
  objective: string;
  episodes: GRPOEpisode[];
  hyperparameters: {
    learningRate: number;
    batchSize: number;
    clipRatio: number;
    valueCoeff: number;
    entropyCoeff: number;
  };
  results: {
    totalEpisodes: number;
    avgReward: number;
    convergenceScore: number;
    improvementPercentage: number;
  };
  status: 'active' | 'completed' | 'failed' | 'paused';
}

export interface GRPOEpisode {
  id: string;
  sessionId: string;
  groupId: string;
  episodeNumber: number;
  startTime: Date;
  endTime?: Date;
  experiences: GRPOExperience[];
  groupReward: number;
  individualRewards: Record<string, number>;
  relativeRankings: Record<string, number>;
  policyUpdates: Record<string, any>;
  metadata: any;
}

export class GRPOManager extends EventEmitter {
  private groups: Map<string, GRPOGroup> = new Map();
  private agents: Map<string, GRPOAgent> = new Map();
  private trainingSessions: Map<string, GRPOTrainingSession> = new Map();
  private experienceBuffer: GRPOExperience[] = [];
  private optimizationTimer: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.startOptimizationLoop();
    console.log('🎯 GRPO 2.0 Manager initialized');
  }

  /**
   * Create a new GRPO agent group
   */
  async createGroup(
    name: string,
    objective: string,
    agentSpecs: Array<{
      name: string;
      type: GRPOAgent['type'];
      capabilities: string[];
      initialPolicy?: Partial<GRPOAgent['policy']>;
    }>,
    strategy: GRPOGroup['optimization']['strategy'] = 'adaptive'
  ): Promise<string> {
    const groupId = `grpo_group_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Create agents for the group
    const agents: GRPOAgent[] = agentSpecs.map((spec, index) => ({
      id: `grpo_agent_${groupId}_${index}`,
      name: spec.name,
      type: spec.type,
      capabilities: spec.capabilities,
      performance: {
        accuracy: 0.5,
        efficiency: 0.5,
        consistency: 0.5,
        collaboration: 0.5
      },
      policy: {
        parameters: this.initializePolicyParameters(),
        strategy: spec.initialPolicy?.strategy || 'balanced',
        adaptationRate: spec.initialPolicy?.adaptationRate || 0.1,
        explorationRate: spec.initialPolicy?.explorationRate || 0.2
      },
      state: {
        workload: 0,
        availability: 1.0,
        context: {}
      },
      learning: {
        experienceBuffer: [],
        gradients: {},
        updateCount: 0,
        lastUpdate: new Date()
      }
    }));

    // Select coordinator (highest capability agent)
    const coordinator = agents.reduce((best, agent) => 
      agent.capabilities.length > best.capabilities.length ? agent : best
    );

    const group: GRPOGroup = {
      id: groupId,
      name,
      objective,
      agents,
      coordinator: coordinator.id,
      performance: {
        collective: 0.5,
        individual: agents.reduce((acc, agent) => {
          acc[agent.id] = 0.5;
          return acc;
        }, {} as Record<string, number>),
        diversity: this.calculateDiversity(agents),
        cohesion: 0.5
      },
      optimization: {
        strategy,
        iterations: 0,
        convergenceThreshold: 0.95,
        lastOptimization: new Date()
      },
      status: 'forming',
      metrics: {
        totalReward: 0,
        episodeCount: 0,
        avgGroupPerformance: 0.5,
        improvementRate: 0
      }
    };

    // Register group and agents
    this.groups.set(groupId, group);
    agents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });

    this.emit('group-created', { groupId, group });
    
    console.log(`🎯 GRPO group created: ${groupId} with ${agents.length} agents`);
    return groupId;
  }

  /**
   * Start a training session for a group
   */
  async startTrainingSession(
    groupId: string,
    objective: string,
    hyperparameters?: Partial<GRPOTrainingSession['hyperparameters']>
  ): Promise<string> {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} not found`);
    }

    const sessionId = `grpo_session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const session: GRPOTrainingSession = {
      id: sessionId,
      groupId,
      startTime: new Date(),
      objective,
      episodes: [],
      hyperparameters: {
        learningRate: 0.001,
        batchSize: 32,
        clipRatio: 0.2,
        valueCoeff: 0.5,
        entropyCoeff: 0.01,
        ...hyperparameters
      },
      results: {
        totalEpisodes: 0,
        avgReward: 0,
        convergenceScore: 0,
        improvementPercentage: 0
      },
      status: 'active'
    };

    this.trainingSessions.set(sessionId, session);
    group.status = 'optimizing';

    this.emit('training-started', { sessionId, session });
    
    console.log(`🎯 GRPO training session started: ${sessionId} for group ${groupId}`);
    return sessionId;
  }

  /**
   * Execute a training episode
   */
  async executeEpisode(
    sessionId: string,
    task: any,
    environment: any
  ): Promise<string> {
    const session = this.trainingSessions.get(sessionId);
    if (!session || session.status !== 'active') {
      throw new Error(`Training session ${sessionId} not found or not active`);
    }

    const group = this.groups.get(session.groupId);
    if (!group) {
      throw new Error(`Group ${session.groupId} not found`);
    }

    const episodeId = `grpo_episode_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const episodeNumber = session.episodes.length + 1;

    const episode: GRPOEpisode = {
      id: episodeId,
      sessionId,
      groupId: session.groupId,
      episodeNumber,
      startTime: new Date(),
      experiences: [],
      groupReward: 0,
      individualRewards: {},
      relativeRankings: {},
      policyUpdates: {},
      metadata: { task, environment }
    };

    // Execute episode with all agents
    const experiences = await this.runEpisodeSimulation(group, task, environment);
    episode.experiences = experiences;

    // Calculate rewards and rankings
    const { groupReward, individualRewards, relativeRankings } = 
      await this.calculateRewards(experiences, group);

    episode.groupReward = groupReward;
    episode.individualRewards = individualRewards;
    episode.relativeRankings = relativeRankings;
    episode.endTime = new Date();

    // Perform GRPO policy updates
    const policyUpdates = await this.performGRPOUpdate(group, episode, session.hyperparameters);
    episode.policyUpdates = policyUpdates;

    // Add episode to session
    session.episodes.push(episode);
    session.results.totalEpisodes++;

    // Update group metrics
    group.metrics.episodeCount++;
    group.metrics.totalReward += groupReward;
    group.metrics.avgGroupPerformance = group.metrics.totalReward / group.metrics.episodeCount;

    // Store experiences in buffer
    this.experienceBuffer.push(...experiences);
    
    // Keep buffer size manageable
    if (this.experienceBuffer.length > 10000) {
      this.experienceBuffer = this.experienceBuffer.slice(-5000);
    }

    this.emit('episode-completed', { episodeId, episode });
    
    console.log(`🎯 GRPO episode completed: ${episodeId} (reward: ${groupReward.toFixed(3)})`);
    return episodeId;
  }

  /**
   * Perform Group Relative Policy Optimization update
   */
  private async performGRPOUpdate(
    group: GRPOGroup,
    episode: GRPOEpisode,
    hyperparameters: GRPOTrainingSession['hyperparameters']
  ): Promise<Record<string, any>> {
    const policyUpdates: Record<string, any> = {};

    // Calculate relative advantages for each agent
    const relativeAdvantages = this.calculateRelativeAdvantages(episode);

    for (const agent of group.agents) {
      const agentExperiences = episode.experiences.filter(exp => exp.agentId === agent.id);
      if (agentExperiences.length === 0) continue;

      const relativeAdvantage = relativeAdvantages[agent.id] || 0;
      const agentReward = episode.individualRewards[agent.id] || 0;
      const relativeRank = episode.relativeRankings[agent.id] || 0.5;

      // GRPO-specific policy gradient calculation
      const gradients = this.calculateGRPOGradients(
        agent,
        agentExperiences,
        agentReward,
        relativeAdvantage,
        relativeRank,
        hyperparameters
      );

      // Update agent policy
      const oldPolicy = { ...agent.policy.parameters };
      this.updateAgentPolicy(agent, gradients, hyperparameters.learningRate);

      policyUpdates[agent.id] = {
        oldPolicy,
        newPolicy: { ...agent.policy.parameters },
        gradients,
        relativeAdvantage,
        relativeRank
      };

      // Update agent learning metrics
      agent.learning.gradients = gradients;
      agent.learning.updateCount++;
      agent.learning.lastUpdate = new Date();
    }

    // Update group cohesion and diversity
    group.performance.cohesion = this.calculateCohesion(group);
    group.performance.diversity = this.calculateDiversity(group.agents);

    this.emit('policy-updated', { groupId: group.id, policyUpdates });

    return policyUpdates;
  }

  /**
   * Calculate relative advantages for GRPO
   */
  private calculateRelativeAdvantages(episode: GRPOEpisode): Record<string, number> {
    const agentRewards = episode.individualRewards;
    const agentIds = Object.keys(agentRewards);
    
    if (agentIds.length === 0) return {};

    const avgReward = Object.values(agentRewards).reduce((sum, reward) => sum + reward, 0) / agentIds.length;
    const relativeAdvantages: Record<string, number> = {};

    agentIds.forEach(agentId => {
      const reward = agentRewards[agentId];
      const rank = episode.relativeRankings[agentId] || 0.5;
      
      // Relative advantage combines absolute performance and relative ranking
      relativeAdvantages[agentId] = (reward - avgReward) * 0.7 + (rank - 0.5) * 0.3;
    });

    return relativeAdvantages;
  }

  /**
   * Calculate GRPO-specific policy gradients
   */
  private calculateGRPOGradients(
    agent: GRPOAgent,
    experiences: GRPOExperience[],
    reward: number,
    relativeAdvantage: number,
    relativeRank: number,
    hyperparameters: GRPOTrainingSession['hyperparameters']
  ): Record<string, number> {
    const gradients: Record<string, number> = {};

    // Policy gradient with relative ranking
    const advantageWeight = Math.tanh(relativeAdvantage); // Bounded advantage
    const rankWeight = (relativeRank - 0.5) * 2; // Convert to [-1, 1]

    // Update policy parameters based on GRPO principles
    Object.keys(agent.policy.parameters).forEach(param => {
      const currentValue = agent.policy.parameters[param];
      
      // Gradient calculation incorporating relative performance
      let gradient = 0;
      
      // Reward-based gradient
      gradient += reward * advantageWeight * 0.4;
      
      // Rank-based gradient (competitive aspect)
      gradient += rankWeight * 0.3;
      
      // Exploration gradient
      const exploration = (Math.random() - 0.5) * agent.policy.explorationRate;
      gradient += exploration * 0.2;
      
      // Regularization
      gradient -= currentValue * 0.1;

      gradients[param] = gradient;
    });

    return gradients;
  }

  /**
   * Update agent policy parameters
   */
  private updateAgentPolicy(
    agent: GRPOAgent,
    gradients: Record<string, number>,
    learningRate: number
  ): void {
    Object.keys(gradients).forEach(param => {
      const gradient = gradients[param];
      const currentValue = agent.policy.parameters[param];
      
      // Apply gradient with learning rate and clipping
      const update = gradient * learningRate * agent.policy.adaptationRate;
      const clippedUpdate = Math.max(-0.1, Math.min(0.1, update));
      
      agent.policy.parameters[param] = Math.max(0, Math.min(1, currentValue + clippedUpdate));
    });

    // Decay exploration rate over time
    agent.policy.explorationRate *= 0.995;
    agent.policy.explorationRate = Math.max(0.01, agent.policy.explorationRate);
  }

  /**
   * Simulate episode execution
   */
  private async runEpisodeSimulation(
    group: GRPOGroup,
    task: any,
    environment: any
  ): Promise<GRPOExperience[]> {
    const experiences: GRPOExperience[] = [];
    const steps = 10; // Number of steps in episode

    for (let step = 0; step < steps; step++) {
      for (const agent of group.agents) {
        const state = this.getAgentState(agent, environment, step);
        const action = this.selectAction(agent, state);
        const stepReward = this.calculateStepReward(agent, action, state, task);
        const nextState = this.getNextState(state, action, environment);
        const groupPerformance = this.evaluateGroupPerformance(group, step);

        const experience: GRPOExperience = {
          id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          timestamp: new Date(),
          agentId: agent.id,
          groupId: group.id,
          state,
          action,
          reward: stepReward,
          nextState,
          groupPerformance,
          relativeRank: this.calculateRelativeRank(agent, group, stepReward),
          metadata: { step, task, environment }
        };

        experiences.push(experience);
        agent.learning.experienceBuffer.push(experience);

        // Keep agent buffer manageable
        if (agent.learning.experienceBuffer.length > 1000) {
          agent.learning.experienceBuffer = agent.learning.experienceBuffer.slice(-500);
        }
      }
    }

    return experiences;
  }

  /**
   * Calculate rewards for the episode
   */
  private async calculateRewards(
    experiences: GRPOExperience[],
    group: GRPOGroup
  ): Promise<{
    groupReward: number;
    individualRewards: Record<string, number>;
    relativeRankings: Record<string, number>;
  }> {
    const individualRewards: Record<string, number> = {};
    const agentContributions: Record<string, number> = {};

    // Calculate individual rewards
    group.agents.forEach(agent => {
      const agentExperiences = experiences.filter(exp => exp.agentId === agent.id);
      const totalReward = agentExperiences.reduce((sum, exp) => sum + exp.reward, 0);
      individualRewards[agent.id] = agentExperiences.length > 0 ? totalReward / agentExperiences.length : 0;
      agentContributions[agent.id] = totalReward;
    });

    // Calculate group reward (weighted by collaboration)
    const totalContribution = Object.values(agentContributions).reduce((sum, contrib) => sum + contrib, 0);
    const collaborationBonus = group.performance.cohesion * 0.2;
    const groupReward = (totalContribution / group.agents.length) * (1 + collaborationBonus);

    // Calculate relative rankings
    const sortedAgents = Object.entries(individualRewards)
      .sort(([, a], [, b]) => b - a)
      .map(([agentId]) => agentId);

    const relativeRankings: Record<string, number> = {};
    sortedAgents.forEach((agentId, index) => {
      relativeRankings[agentId] = 1 - (index / (sortedAgents.length - 1));
    });

    return { groupReward, individualRewards, relativeRankings };
  }

  // Helper methods
  private initializePolicyParameters(): Record<string, number> {
    return {
      aggression: 0.5,
      cooperation: 0.5,
      exploration: 0.2,
      efficiency: 0.5,
      quality: 0.5,
      speed: 0.5,
      creativity: 0.3,
      consistency: 0.7
    };
  }

  private calculateDiversity(agents: GRPOAgent[]): number {
    if (agents.length < 2) return 1;

    let diversitySum = 0;
    let comparisons = 0;

    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const agent1 = agents[i];
        const agent2 = agents[j];

        // Calculate capability diversity
        const allCapabilities = new Set([...agent1.capabilities, ...agent2.capabilities]);
        const commonCapabilities = agent1.capabilities.filter(cap => agent2.capabilities.includes(cap));
        const capabilityDiversity = 1 - (commonCapabilities.length / allCapabilities.size);

        // Calculate policy diversity
        const policyDiversity = this.calculatePolicyDiversity(agent1.policy, agent2.policy);

        diversitySum += (capabilityDiversity + policyDiversity) / 2;
        comparisons++;
      }
    }

    return comparisons > 0 ? diversitySum / comparisons : 1;
  }

  private calculatePolicyDiversity(policy1: GRPOAgent['policy'], policy2: GRPOAgent['policy']): number {
    const params1 = Object.values(policy1.parameters);
    const params2 = Object.values(policy2.parameters);
    
    if (params1.length !== params2.length) return 1;

    const distance = Math.sqrt(
      params1.reduce((sum, val, index) => sum + Math.pow(val - params2[index], 2), 0)
    );

    return Math.min(1, distance / Math.sqrt(params1.length));
  }

  private calculateCohesion(group: GRPOGroup): number {
    if (group.agents.length < 2) return 1;

    // Calculate policy alignment
    const avgPolicy: Record<string, number> = {};
    const paramKeys = Object.keys(group.agents[0].policy.parameters);

    paramKeys.forEach(key => {
      avgPolicy[key] = group.agents.reduce((sum, agent) => 
        sum + agent.policy.parameters[key], 0) / group.agents.length;
    });

    let cohesionSum = 0;
    group.agents.forEach(agent => {
      let agentCohesion = 0;
      paramKeys.forEach(key => {
        const diff = Math.abs(agent.policy.parameters[key] - avgPolicy[key]);
        agentCohesion += 1 - diff;
      });
      cohesionSum += agentCohesion / paramKeys.length;
    });

    return cohesionSum / group.agents.length;
  }

  private getAgentState(agent: GRPOAgent, environment: any, step: number): any {
    return {
      agentId: agent.id,
      step,
      workload: agent.state.workload,
      availability: agent.state.availability,
      performance: agent.performance,
      environment,
      policy: agent.policy.parameters
    };
  }

  private selectAction(agent: GRPOAgent, state: any): string {
    // Policy-based action selection with exploration
    const actions = ['focus', 'collaborate', 'explore', 'optimize', 'delegate'];
    
    if (Math.random() < agent.policy.explorationRate) {
      // Exploration: random action
      return actions[Math.floor(Math.random() * actions.length)];
    } else {
      // Exploitation: policy-based selection
      const actionScores: Record<string, number> = {};
      
      actions.forEach(action => {
        let score = 0;
        
        switch (action) {
          case 'focus':
            score = agent.policy.parameters.efficiency * 0.8 + agent.policy.parameters.quality * 0.2;
            break;
          case 'collaborate':
            score = agent.policy.parameters.cooperation * 0.9 + agent.policy.parameters.aggression * 0.1;
            break;
          case 'explore':
            score = agent.policy.parameters.exploration * 0.8 + agent.policy.parameters.creativity * 0.2;
            break;
          case 'optimize':
            score = agent.policy.parameters.efficiency * 0.6 + agent.policy.parameters.consistency * 0.4;
            break;
          case 'delegate':
            score = agent.policy.parameters.cooperation * 0.5 + (1 - agent.policy.parameters.aggression) * 0.5;
            break;
        }
        
        actionScores[action] = score;
      });

      // Select action with highest score (with some randomness)
      const sortedActions = Object.entries(actionScores)
        .sort(([, a], [, b]) => b - a);
      
      // Weighted selection favoring higher scores
      const weights = sortedActions.map((_, index) => Math.exp(-index * 0.5));
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      const random = Math.random() * totalWeight;
      
      let cumulative = 0;
      for (let i = 0; i < sortedActions.length; i++) {
        cumulative += weights[i];
        if (random <= cumulative) {
          return sortedActions[i][0];
        }
      }
      
      return sortedActions[0][0];
    }
  }

  private calculateStepReward(agent: GRPOAgent, action: string, state: any, task: any): number {
    let reward = 0.1; // Base reward

    // Action-specific rewards
    switch (action) {
      case 'focus':
        reward += agent.performance.efficiency * 0.3;
        break;
      case 'collaborate':
        reward += agent.performance.collaboration * 0.4;
        break;
      case 'explore':
        reward += agent.performance.accuracy * 0.2 + 0.1;
        break;
      case 'optimize':
        reward += agent.performance.consistency * 0.3;
        break;
      case 'delegate':
        reward += (agent.performance.collaboration + agent.performance.efficiency) * 0.2;
        break;
    }

    // Task alignment bonus
    if (task?.priority === 'efficiency' && (action === 'focus' || action === 'optimize')) {
      reward += 0.2;
    }
    if (task?.priority === 'collaboration' && (action === 'collaborate' || action === 'delegate')) {
      reward += 0.2;
    }

    // Performance-based modulation
    reward *= (agent.performance.accuracy + agent.performance.efficiency) / 2;

    return Math.max(0, Math.min(1, reward));
  }

  private getNextState(state: any, action: string, environment: any): any {
    // Simple state transition
    const nextState = { ...state };
    
    switch (action) {
      case 'focus':
        nextState.workload += 0.1;
        break;
      case 'collaborate':
        nextState.workload += 0.05;
        break;
      case 'explore':
        nextState.workload += 0.02;
        break;
      case 'optimize':
        nextState.workload -= 0.05;
        break;
      case 'delegate':
        nextState.workload -= 0.1;
        break;
    }

    nextState.workload = Math.max(0, Math.min(1, nextState.workload));
    nextState.availability = 1 - nextState.workload;

    return nextState;
  }

  private evaluateGroupPerformance(group: GRPOGroup, step: number): number {
    const avgPerformance = group.agents.reduce((sum, agent) => {
      const agentScore = (agent.performance.accuracy + agent.performance.efficiency + 
                         agent.performance.consistency + agent.performance.collaboration) / 4;
      return sum + agentScore;
    }, 0) / group.agents.length;

    const cohesionBonus = group.performance.cohesion * 0.2;
    const diversityBonus = group.performance.diversity * 0.1;

    return Math.min(1, avgPerformance + cohesionBonus + diversityBonus);
  }

  private calculateRelativeRank(agent: GRPOAgent, group: GRPOGroup, stepReward: number): number {
    // Calculate agent's performance relative to group
    const agentScore = stepReward;
    const groupScores = group.agents.map(a => {
      const avgPerf = (a.performance.accuracy + a.performance.efficiency + 
                      a.performance.consistency + a.performance.collaboration) / 4;
      return avgPerf;
    });

    groupScores.sort((a, b) => b - a);
    const rank = groupScores.findIndex(score => agentScore >= score);
    
    return rank >= 0 ? 1 - (rank / (groupScores.length - 1)) : 0;
  }

  private startOptimizationLoop(): void {
    // Run optimization every 30 seconds
    this.optimizationTimer = setInterval(() => {
      this.runOptimizationCycle();
    }, 30000);
  }

  private async runOptimizationCycle(): Promise<void> {
    for (const [groupId, group] of this.groups) {
      if (group.status === 'optimizing') {
        await this.optimizeGroup(group);
      }
    }
  }

  private async optimizeGroup(group: GRPOGroup): Promise<void> {
    // Check convergence
    const convergenceScore = this.calculateConvergenceScore(group);
    
    if (convergenceScore >= group.optimization.convergenceThreshold) {
      group.status = 'converged';
      this.emit('group-converged', { groupId: group.id, convergenceScore });
      console.log(`🎯 GRPO group converged: ${group.id} (score: ${convergenceScore.toFixed(3)})`);
    }

    // Update optimization metrics
    group.optimization.iterations++;
    group.optimization.lastOptimization = new Date();

    // Calculate improvement rate
    if (group.metrics.episodeCount > 10) {
      const recentEpisodes = Math.min(10, group.metrics.episodeCount);
      const recentAvg = group.metrics.totalReward / group.metrics.episodeCount;
      const previousAvg = (group.metrics.totalReward * 0.8) / (group.metrics.episodeCount * 0.8);
      group.metrics.improvementRate = (recentAvg - previousAvg) / previousAvg;
    }
  }

  private calculateConvergenceScore(group: GRPOGroup): number {
    if (group.metrics.episodeCount < 5) return 0;

    // Convergence based on policy stability and performance consistency
    let stabilityScore = group.performance.cohesion; // Policy alignment
    let performanceScore = group.metrics.avgGroupPerformance;
    let improvementScore = Math.max(0, 1 - Math.abs(group.metrics.improvementRate));

    return (stabilityScore * 0.4 + performanceScore * 0.4 + improvementScore * 0.2);
  }

  // Public API methods
  getGroup(groupId: string): GRPOGroup | undefined {
    return this.groups.get(groupId);
  }

  getAgent(agentId: string): GRPOAgent | undefined {
    return this.agents.get(agentId);
  }

  getTrainingSession(sessionId: string): GRPOTrainingSession | undefined {
    return this.trainingSessions.get(sessionId);
  }

  getAllGroups(): GRPOGroup[] {
    return Array.from(this.groups.values());
  }

  getActiveGroups(): GRPOGroup[] {
    return Array.from(this.groups.values()).filter(g => g.status === 'optimizing');
  }

  getGRPOStats(): {
    totalGroups: number;
    activeGroups: number;
    convergedGroups: number;
    totalAgents: number;
    avgGroupPerformance: number;
    avgConvergenceScore: number;
  } {
    const groups = Array.from(this.groups.values());
    const activeGroups = groups.filter(g => g.status === 'optimizing').length;
    const convergedGroups = groups.filter(g => g.status === 'converged').length;
    const totalAgents = Array.from(this.agents.values()).length;

    const avgGroupPerformance = groups.length > 0 
      ? groups.reduce((sum, g) => sum + g.metrics.avgGroupPerformance, 0) / groups.length 
      : 0;

    const avgConvergenceScore = groups.length > 0
      ? groups.reduce((sum, g) => sum + this.calculateConvergenceScore(g), 0) / groups.length
      : 0;

    return {
      totalGroups: groups.length,
      activeGroups,
      convergedGroups,
      totalAgents,
      avgGroupPerformance,
      avgConvergenceScore
    };
  }

  async cleanup(): Promise<void> {
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
      this.optimizationTimer = null;
    }
  }
}

// Export singleton instance
export const grpoManager = new GRPOManager();