/**
 * GRPO (Group Relative Policy Optimization) Continuous Learning Service - WAI SDK v3.1
 * 
 * Reinforcement learning from feedback with adaptive routing.
 * Features:
 * - Policy optimization from user feedback
 * - Model/provider performance tracking
 * - Adaptive routing based on learned preferences
 * - Continuous improvement of agent behaviors
 * - A/B testing for optimization experiments
 */

export interface FeedbackEntry {
  id: string;
  operationId: string;
  agentId?: string;
  provider: string;
  model: string;
  taskType: string;
  input: string;
  output: string;
  feedbackType: 'explicit' | 'implicit';
  rating: number; // -1 to 1
  helpful: boolean;
  comments?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PolicyState {
  providerId: string;
  modelId: string;
  taskType: string;
  score: number; // Running average performance
  successRate: number;
  avgLatency: number;
  avgCost: number;
  sampleCount: number;
  confidence: number; // How confident we are in this score
  lastUpdated: Date;
}

export interface RoutingDecision {
  provider: string;
  model: string;
  confidence: number;
  reasoning: string;
  alternatives: { provider: string; model: string; score: number }[];
  experimentId?: string;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  variants: {
    id: string;
    name: string;
    config: Record<string, any>;
    weight: number;
  }[];
  metrics: {
    variantId: string;
    impressions: number;
    conversions: number;
    avgScore: number;
  }[];
  startedAt: Date;
  endedAt?: Date;
  winnerId?: string;
}

export interface LearningMetrics {
  totalFeedback: number;
  positiveFeedback: number;
  negativeFeedback: number;
  avgImprovement: number;
  modelRankings: { model: string; score: number; trend: string }[];
  taskTypePerformance: { taskType: string; bestModel: string; score: number }[];
  activeExperiments: number;
}

class GRPOLearningService {
  private feedback: Map<string, FeedbackEntry> = new Map();
  private policies: Map<string, PolicyState> = new Map();
  private experiments: Map<string, Experiment> = new Map();
  
  private readonly LEARNING_RATE = 0.1;
  private readonly DECAY_FACTOR = 0.95;
  private readonly MIN_SAMPLES_FOR_CONFIDENCE = 10;
  private readonly EXPLORATION_RATE = 0.1; // 10% exploration

  constructor() {
    console.log('🧪 GRPO Continuous Learning Service initialized');
    console.log('   Features: Policy optimization, Adaptive routing, A/B testing');
    this.initializeDefaultPolicies();
  }

  private initializeDefaultPolicies(): void {
    const providers = [
      { id: 'openai', models: ['gpt-4o', 'gpt-4o-mini', 'o1-preview'] },
      { id: 'anthropic', models: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'] },
      { id: 'google', models: ['gemini-2.0-flash', 'gemini-1.5-pro'] },
      { id: 'groq', models: ['llama-3.1-70b-versatile', 'mixtral-8x7b-32768'] }
    ];

    const taskTypes = ['code', 'content', 'analysis', 'conversation', 'creative', 'research'];

    for (const provider of providers) {
      for (const model of provider.models) {
        for (const taskType of taskTypes) {
          const key = `${provider.id}:${model}:${taskType}`;
          this.policies.set(key, {
            providerId: provider.id,
            modelId: model,
            taskType,
            score: 0.5, // Start neutral
            successRate: 0.8,
            avgLatency: 1000,
            avgCost: 0.01,
            sampleCount: 0,
            confidence: 0,
            lastUpdated: new Date()
          });
        }
      }
    }
  }

  /**
   * Record feedback for an operation
   */
  recordFeedback(
    operationId: string,
    options: {
      agentId?: string;
      provider: string;
      model: string;
      taskType: string;
      input: string;
      output: string;
      rating: number;
      helpful: boolean;
      comments?: string;
      feedbackType?: 'explicit' | 'implicit';
      metadata?: Record<string, any>;
    }
  ): string {
    const id = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const entry: FeedbackEntry = {
      id,
      operationId,
      agentId: options.agentId,
      provider: options.provider,
      model: options.model,
      taskType: options.taskType,
      input: options.input,
      output: options.output,
      feedbackType: options.feedbackType || 'explicit',
      rating: Math.max(-1, Math.min(1, options.rating)),
      helpful: options.helpful,
      comments: options.comments,
      timestamp: new Date(),
      metadata: options.metadata
    };

    this.feedback.set(id, entry);
    this.updatePolicy(entry);

    // Update active experiments
    for (const experiment of this.experiments.values()) {
      if (experiment.status === 'active') {
        this.updateExperimentMetrics(experiment, entry);
      }
    }

    console.log(`📝 Feedback recorded: ${options.helpful ? '👍' : '👎'} for ${options.model} on ${options.taskType}`);
    return id;
  }

  /**
   * Get optimal routing decision based on learned policies
   */
  getOptimalRoute(
    taskType: string,
    options?: {
      preferredProviders?: string[];
      excludeProviders?: string[];
      maxCost?: number;
      maxLatency?: number;
      minConfidence?: number;
    }
  ): RoutingDecision {
    // Get all relevant policies
    const candidates: (PolicyState & { combinedScore: number })[] = [];

    for (const policy of this.policies.values()) {
      if (policy.taskType !== taskType) continue;
      if (options?.excludeProviders?.includes(policy.providerId)) continue;
      if (options?.maxCost && policy.avgCost > options.maxCost) continue;
      if (options?.maxLatency && policy.avgLatency > options.maxLatency) continue;
      if (options?.minConfidence && policy.confidence < options.minConfidence) continue;

      // Calculate combined score considering multiple factors
      let combinedScore = policy.score * 0.5 + policy.successRate * 0.3;
      
      // Bonus for preferred providers
      if (options?.preferredProviders?.includes(policy.providerId)) {
        combinedScore += 0.1;
      }

      // Confidence adjustment (favor higher confidence)
      combinedScore *= (0.5 + policy.confidence * 0.5);

      candidates.push({ ...policy, combinedScore });
    }

    if (candidates.length === 0) {
      // Fallback to default
      return {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        confidence: 0,
        reasoning: 'No learned policies available, using default',
        alternatives: []
      };
    }

    // Sort by combined score
    candidates.sort((a, b) => b.combinedScore - a.combinedScore);

    // Exploration vs exploitation
    const explore = Math.random() < this.EXPLORATION_RATE;
    let selectedIndex = 0;

    if (explore && candidates.length > 1) {
      // Select a random alternative for exploration
      selectedIndex = Math.floor(Math.random() * Math.min(3, candidates.length));
    }

    const selected = candidates[selectedIndex];
    const alternatives = candidates
      .filter((_, i) => i !== selectedIndex)
      .slice(0, 3)
      .map(c => ({ provider: c.providerId, model: c.modelId, score: c.combinedScore }));

    return {
      provider: selected.providerId,
      model: selected.modelId,
      confidence: selected.confidence,
      reasoning: explore 
        ? `Exploring alternative: ${selected.modelId} (score: ${selected.combinedScore.toFixed(3)})`
        : `Optimal choice: ${selected.modelId} (score: ${selected.combinedScore.toFixed(3)}, confidence: ${selected.confidence.toFixed(2)})`,
      alternatives
    };
  }

  /**
   * Create an A/B testing experiment
   */
  createExperiment(
    name: string,
    description: string,
    variants: { name: string; config: Record<string, any>; weight?: number }[]
  ): Experiment {
    const id = `exp_${Date.now()}`;

    const experiment: Experiment = {
      id,
      name,
      description,
      status: 'active',
      variants: variants.map((v, i) => ({
        id: `var_${i}`,
        name: v.name,
        config: v.config,
        weight: v.weight || 1 / variants.length
      })),
      metrics: variants.map((_, i) => ({
        variantId: `var_${i}`,
        impressions: 0,
        conversions: 0,
        avgScore: 0
      })),
      startedAt: new Date()
    };

    this.experiments.set(id, experiment);
    console.log(`🧪 Experiment created: ${name}`);
    return experiment;
  }

  /**
   * Get variant for an experiment (for A/B testing)
   */
  getExperimentVariant(experimentId: string): { variantId: string; config: Record<string, any> } | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'active') return null;

    // Weighted random selection
    const random = Math.random();
    let cumulative = 0;

    for (const variant of experiment.variants) {
      cumulative += variant.weight;
      if (random <= cumulative) {
        // Record impression
        const metrics = experiment.metrics.find(m => m.variantId === variant.id);
        if (metrics) metrics.impressions++;

        return { variantId: variant.id, config: variant.config };
      }
    }

    // Fallback to first variant
    return { variantId: experiment.variants[0].id, config: experiment.variants[0].config };
  }

  /**
   * Record experiment conversion
   */
  recordExperimentConversion(experimentId: string, variantId: string, score: number): void {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;

    const metrics = experiment.metrics.find(m => m.variantId === variantId);
    if (metrics) {
      metrics.conversions++;
      metrics.avgScore = ((metrics.avgScore * (metrics.conversions - 1)) + score) / metrics.conversions;
    }
  }

  /**
   * Conclude an experiment and determine winner
   */
  concludeExperiment(experimentId: string): Experiment | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    experiment.status = 'completed';
    experiment.endedAt = new Date();

    // Determine winner based on conversion rate and score
    let bestVariant: { id: string; score: number } | null = null;

    for (const metrics of experiment.metrics) {
      const conversionRate = metrics.impressions > 0 ? metrics.conversions / metrics.impressions : 0;
      const combinedScore = conversionRate * 0.6 + metrics.avgScore * 0.4;

      if (!bestVariant || combinedScore > bestVariant.score) {
        bestVariant = { id: metrics.variantId, score: combinedScore };
      }
    }

    if (bestVariant) {
      experiment.winnerId = bestVariant.id;
    }

    console.log(`🏆 Experiment concluded: ${experiment.name}, winner: ${experiment.winnerId}`);
    return experiment;
  }

  /**
   * Get learning metrics and insights
   */
  getLearningMetrics(): LearningMetrics {
    const feedbackList = Array.from(this.feedback.values());
    const positiveFeedback = feedbackList.filter(f => f.helpful).length;

    // Calculate model rankings
    const modelScores: Map<string, { total: number; count: number }> = new Map();
    for (const policy of this.policies.values()) {
      const key = policy.modelId;
      const existing = modelScores.get(key) || { total: 0, count: 0 };
      existing.total += policy.score * policy.sampleCount;
      existing.count += policy.sampleCount;
      modelScores.set(key, existing);
    }

    const modelRankings = Array.from(modelScores.entries())
      .map(([model, data]) => ({
        model,
        score: data.count > 0 ? data.total / data.count : 0,
        trend: 'stable' // Would calculate from historical data
      }))
      .sort((a, b) => b.score - a.score);

    // Calculate best model per task type
    const taskTypePerformance: { taskType: string; bestModel: string; score: number }[] = [];
    const taskTypes = new Set(Array.from(this.policies.values()).map(p => p.taskType));

    for (const taskType of taskTypes) {
      const bestPolicy = Array.from(this.policies.values())
        .filter(p => p.taskType === taskType)
        .sort((a, b) => b.score - a.score)[0];

      if (bestPolicy) {
        taskTypePerformance.push({
          taskType,
          bestModel: bestPolicy.modelId,
          score: bestPolicy.score
        });
      }
    }

    const activeExperiments = Array.from(this.experiments.values())
      .filter(e => e.status === 'active').length;

    // Calculate improvement
    const recentFeedback = feedbackList
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 100);
    const olderFeedback = feedbackList
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(100, 200);

    const recentAvg = recentFeedback.length > 0
      ? recentFeedback.reduce((sum, f) => sum + f.rating, 0) / recentFeedback.length
      : 0;
    const olderAvg = olderFeedback.length > 0
      ? olderFeedback.reduce((sum, f) => sum + f.rating, 0) / olderFeedback.length
      : 0;

    return {
      totalFeedback: feedbackList.length,
      positiveFeedback,
      negativeFeedback: feedbackList.length - positiveFeedback,
      avgImprovement: recentAvg - olderAvg,
      modelRankings,
      taskTypePerformance,
      activeExperiments
    };
  }

  /**
   * Get experiment status
   */
  getExperiment(experimentId: string): Experiment | undefined {
    return this.experiments.get(experimentId);
  }

  /**
   * List all experiments
   */
  listExperiments(status?: Experiment['status']): Experiment[] {
    const experiments = Array.from(this.experiments.values());
    return status ? experiments.filter(e => e.status === status) : experiments;
  }

  // Private helper methods

  private updatePolicy(feedback: FeedbackEntry): void {
    const key = `${feedback.provider}:${feedback.model}:${feedback.taskType}`;
    let policy = this.policies.get(key);

    if (!policy) {
      policy = {
        providerId: feedback.provider,
        modelId: feedback.model,
        taskType: feedback.taskType,
        score: 0.5,
        successRate: 0.8,
        avgLatency: 1000,
        avgCost: 0.01,
        sampleCount: 0,
        confidence: 0,
        lastUpdated: new Date()
      };
    }

    // Update score using exponential moving average
    const normalizedRating = (feedback.rating + 1) / 2; // Convert -1..1 to 0..1
    policy.score = policy.score * (1 - this.LEARNING_RATE) + normalizedRating * this.LEARNING_RATE;
    policy.sampleCount++;
    policy.confidence = Math.min(1, policy.sampleCount / this.MIN_SAMPLES_FOR_CONFIDENCE);
    policy.lastUpdated = new Date();

    this.policies.set(key, policy);
  }

  private updateExperimentMetrics(experiment: Experiment, feedback: FeedbackEntry): void {
    // Match feedback to experiment variant based on metadata
    const variantId = feedback.metadata?.experimentVariantId;
    if (!variantId) return;

    const metrics = experiment.metrics.find(m => m.variantId === variantId);
    if (metrics && feedback.helpful) {
      metrics.conversions++;
      metrics.avgScore = ((metrics.avgScore * (metrics.conversions - 1)) + feedback.rating) / metrics.conversions;
    }
  }

  getHealth(): { status: 'healthy'; feedbackCount: number; policiesCount: number; experimentsActive: number } {
    return {
      status: 'healthy',
      feedbackCount: this.feedback.size,
      policiesCount: this.policies.size,
      experimentsActive: Array.from(this.experiments.values()).filter(e => e.status === 'active').length
    };
  }
}

export const grpoLearningService = new GRPOLearningService();
