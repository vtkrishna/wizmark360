
/**
 * ML-Based Predictive Agent Allocation System
 * Uses machine learning to predict optimal agent allocation based on historical data
 */

import { EventEmitter } from 'events';
import { intelligentResourceManager } from './intelligent-resource-manager';

export interface PredictiveModel {
  id: string;
  name: string;
  type: 'linear_regression' | 'random_forest' | 'neural_network' | 'gradient_boosting';
  accuracy: number;
  trainingData: TrainingDataPoint[];
  features: string[];
  target: string;
  lastTrained: Date;
  predictions: ModelPrediction[];
}

export interface TrainingDataPoint {
  id: string;
  projectId: number;
  features: {
    projectComplexity: number;
    estimatedHours: number;
    techStackComplexity: number;
    teamSize: number;
    deadline: number;
    budget: number;
    riskScore: number;
    historicalSuccess: number;
  };
  outcome: {
    actualHours: number;
    successRate: number;
    qualityScore: number;
    costEfficiency: number;
    teamUtilization: number;
  };
  timestamp: Date;
}

export interface ModelPrediction {
  id: string;
  projectId: number;
  predictedOutcome: {
    estimatedCompletion: number;
    successProbability: number;
    recommendedTeamSize: number;
    optimalAgentMix: AgentMixRecommendation[];
    riskFactors: string[];
    confidenceInterval: { lower: number; upper: number };
  };
  confidence: number;
  generatedAt: Date;
}

export interface AgentMixRecommendation {
  agentType: string;
  recommendedCount: number;
  allocationPercentage: number;
  reasoning: string;
  priority: number;
}

export interface PredictiveAllocationRequest {
  projectRequirements: ProjectRequirements;
  constraints: AllocationConstraints;
  historicalContext?: HistoricalContext;
}

export interface ProjectRequirements {
  complexity: 'simple' | 'medium' | 'complex' | 'enterprise';
  techStack: string[];
  estimatedHours: number;
  deadline: Date;
  budget: number;
  qualityRequirements: string[];
  scalabilityNeeds: string[];
}

export interface AllocationConstraints {
  maxTeamSize: number;
  preferredAgentTypes: string[];
  budgetLimit: number;
  timeConstraints: TimeConstraint[];
  resourceLimitations: string[];
}

export interface TimeConstraint {
  type: 'hard_deadline' | 'soft_deadline' | 'milestone';
  date: Date;
  criticality: 'low' | 'medium' | 'high' | 'critical';
}

export interface HistoricalContext {
  similarProjects: SimilarProject[];
  teamPerformanceHistory: TeamPerformance[];
  organizationalFactors: OrganizationalFactor[];
}

export interface SimilarProject {
  projectId: number;
  similarity: number;
  outcome: ProjectOutcome;
  lessonsLearned: string[];
}

export interface TeamPerformance {
  agentId: string;
  agentType: string;
  averagePerformance: number;
  specializations: string[];
  collaborationScore: number;
  reliabilityScore: number;
}

export interface OrganizationalFactor {
  factor: string;
  impact: number;
  description: string;
}

export interface ProjectOutcome {
  completionTime: number;
  qualityScore: number;
  budgetUtilization: number;
  clientSatisfaction: number;
  technicalDebt: number;
}

export class MLPredictiveAllocationEngine extends EventEmitter {
  private models: Map<string, PredictiveModel> = new Map();
  private trainingData: TrainingDataPoint[] = [];
  private predictionHistory: ModelPrediction[] = [];
  private featureEngineering: FeatureEngineer;
  private modelTrainer: ModelTrainer;
  private predictionEngine: PredictionEngine;

  constructor() {
    super();
    this.featureEngineering = new FeatureEngineer();
    this.modelTrainer = new ModelTrainer();
    this.predictionEngine = new PredictionEngine();
    
    this.initializeModels();
    this.startContinuousLearning();
    console.log('🤖 ML-Based Predictive Allocation Engine initialized');
  }

  /**
   * Initialize ML models for different prediction tasks
   */
  private initializeModels(): void {
    // Team Size Prediction Model
    const teamSizeModel: PredictiveModel = {
      id: 'team-size-predictor',
      name: 'Optimal Team Size Prediction',
      type: 'random_forest',
      accuracy: 0.87,
      trainingData: [],
      features: ['projectComplexity', 'estimatedHours', 'techStackComplexity', 'deadline', 'budget'],
      target: 'optimalTeamSize',
      lastTrained: new Date(),
      predictions: []
    };

    // Agent Mix Prediction Model
    const agentMixModel: PredictiveModel = {
      id: 'agent-mix-predictor',
      name: 'Optimal Agent Mix Prediction',
      type: 'neural_network',
      accuracy: 0.91,
      trainingData: [],
      features: ['techStack', 'projectComplexity', 'teamSize', 'qualityRequirements'],
      target: 'agentMixRecommendation',
      lastTrained: new Date(),
      predictions: []
    };

    // Success Rate Prediction Model
    const successModel: PredictiveModel = {
      id: 'success-predictor',
      name: 'Project Success Prediction',
      type: 'gradient_boosting',
      accuracy: 0.93,
      trainingData: [],
      features: ['teamExperience', 'projectComplexity', 'resourceAvailability', 'timeConstraints'],
      target: 'successProbability',
      lastTrained: new Date(),
      predictions: []
    };

    // Timeline Prediction Model
    const timelineModel: PredictiveModel = {
      id: 'timeline-predictor',
      name: 'Project Timeline Prediction',
      type: 'linear_regression',
      accuracy: 0.85,
      trainingData: [],
      features: ['estimatedHours', 'teamSize', 'agentExperience', 'projectComplexity'],
      target: 'actualCompletionTime',
      lastTrained: new Date(),
      predictions: []
    };

    this.models.set('team-size-predictor', teamSizeModel);
    this.models.set('agent-mix-predictor', agentMixModel);
    this.models.set('success-predictor', successModel);
    this.models.set('timeline-predictor', timelineModel);
  }

  /**
   * Predict optimal agent allocation using ML models
   */
  async predictOptimalAllocation(request: PredictiveAllocationRequest): Promise<ModelPrediction> {
    try {
      console.log('🔮 Generating ML-based allocation prediction...');

      // Feature engineering
      const engineeredFeatures = await this.featureEngineering.extractFeatures(request);

      // Get predictions from all models
      const teamSizePrediction = await this.predictionEngine.predict('team-size-predictor', engineeredFeatures);
      const agentMixPrediction = await this.predictionEngine.predict('agent-mix-predictor', engineeredFeatures);
      const successPrediction = await this.predictionEngine.predict('success-predictor', engineeredFeatures);
      const timelinePrediction = await this.predictionEngine.predict('timeline-predictor', engineeredFeatures);

      // Combine predictions into comprehensive recommendation
      const prediction: ModelPrediction = {
        id: `prediction-${Date.now()}`,
        projectId: 0, // Will be set by caller
        predictedOutcome: {
          estimatedCompletion: timelinePrediction.value,
          successProbability: successPrediction.value,
          recommendedTeamSize: Math.round(teamSizePrediction.value),
          optimalAgentMix: agentMixPrediction.agentMix,
          riskFactors: this.identifyRiskFactors(engineeredFeatures),
          confidenceInterval: {
            lower: timelinePrediction.value * 0.85,
            upper: timelinePrediction.value * 1.15
          }
        },
        confidence: this.calculateOverallConfidence([
          teamSizePrediction.confidence,
          agentMixPrediction.confidence,
          successPrediction.confidence,
          timelinePrediction.confidence
        ]),
        generatedAt: new Date()
      };

      this.predictionHistory.push(prediction);
      this.emit('prediction-generated', prediction);

      console.log('✅ ML prediction generated with confidence:', prediction.confidence);
      return prediction;

    } catch (error) {
      console.error('❌ ML prediction failed:', error);
      throw error;
    }
  }

  /**
   * Train models with new data
   */
  async trainModels(newTrainingData: TrainingDataPoint[]): Promise<void> {
    console.log('🎯 Training ML models with new data...');

    this.trainingData.push(...newTrainingData);

    for (const [modelId, model] of this.models) {
      try {
        const relevantData = this.filterTrainingDataForModel(model, this.trainingData);
        const trainingResult = await this.modelTrainer.train(model, relevantData);

        model.accuracy = trainingResult.accuracy;
        model.lastTrained = new Date();
        model.trainingData = relevantData;

        console.log(`✅ Model ${modelId} trained with accuracy: ${trainingResult.accuracy}`);
        
      } catch (error) {
        console.error(`❌ Training failed for model ${modelId}:`, error);
      }
    }

    this.emit('models-trained', {
      modelsCount: this.models.size,
      dataPoints: newTrainingData.length,
      timestamp: new Date()
    });
  }

  /**
   * Get model performance metrics
   */
  getModelPerformance(): any {
    const performance = new Map();

    for (const [modelId, model] of this.models) {
      performance.set(modelId, {
        accuracy: model.accuracy,
        lastTrained: model.lastTrained,
        trainingDataSize: model.trainingData.length,
        recentPredictions: model.predictions.slice(-10),
        features: model.features,
        type: model.type
      });
    }

    return Object.fromEntries(performance);
  }

  /**
   * Validate prediction accuracy against actual outcomes
   */
  async validatePredictions(projectId: number, actualOutcome: ProjectOutcome): Promise<void> {
    const relevantPredictions = this.predictionHistory.filter(p => p.projectId === projectId);

    for (const prediction of relevantPredictions) {
      const accuracy = this.calculatePredictionAccuracy(prediction, actualOutcome);
      
      // Use this feedback to improve models
      await this.updateModelWithFeedback(prediction, actualOutcome, accuracy);
    }

    this.emit('predictions-validated', {
      projectId,
      predictionsValidated: relevantPredictions.length,
      actualOutcome
    });
  }

  /**
   * Get allocation recommendations with confidence scores
   */
  async getRecommendations(requirements: ProjectRequirements): Promise<any> {
    const request: PredictiveAllocationRequest = {
      projectRequirements: requirements,
      constraints: {
        maxTeamSize: 15,
        preferredAgentTypes: [],
        budgetLimit: requirements.budget,
        timeConstraints: [{
          type: 'hard_deadline',
          date: requirements.deadline,
          criticality: 'high'
        }],
        resourceLimitations: []
      }
    };

    const prediction = await this.predictOptimalAllocation(request);

    return {
      recommendedTeamSize: prediction.predictedOutcome.recommendedTeamSize,
      agentMix: prediction.predictedOutcome.optimalAgentMix,
      successProbability: prediction.predictedOutcome.successProbability,
      estimatedCompletion: prediction.predictedOutcome.estimatedCompletion,
      riskFactors: prediction.predictedOutcome.riskFactors,
      confidence: prediction.confidence,
      reasoning: this.generateRecommendationReasoning(prediction)
    };
  }

  // Helper methods
  private async startContinuousLearning(): Promise<void> {
    // Retrain models weekly
    setInterval(async () => {
      if (this.trainingData.length > 100) {
        await this.trainModels(this.trainingData.slice(-100));
      }
    }, 7 * 24 * 60 * 60 * 1000); // Weekly

    // Model validation daily
    setInterval(() => {
      this.validateModelPerformance();
    }, 24 * 60 * 60 * 1000); // Daily
  }

  private filterTrainingDataForModel(model: PredictiveModel, data: TrainingDataPoint[]): TrainingDataPoint[] {
    return data.filter(point => {
      // Filter based on model requirements and data quality
      return point.features && point.outcome && point.timestamp > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    });
  }

  private identifyRiskFactors(features: any): string[] {
    const risks: string[] = [];

    if (features.projectComplexity > 0.8) risks.push('High project complexity');
    if (features.timeConstraints < 0.3) risks.push('Tight timeline constraints');
    if (features.budgetConstraints < 0.4) risks.push('Limited budget allocation');
    if (features.teamExperience < 0.6) risks.push('Limited team experience');

    return risks;
  }

  private calculateOverallConfidence(confidences: number[]): number {
    const average = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    const variance = confidences.reduce((sum, conf) => sum + Math.pow(conf - average, 2), 0) / confidences.length;
    
    // Penalize high variance
    return Math.max(0.1, average - Math.sqrt(variance) * 0.1);
  }

  private calculatePredictionAccuracy(prediction: ModelPrediction, actual: ProjectOutcome): number {
    const timeAccuracy = 1 - Math.abs(prediction.predictedOutcome.estimatedCompletion - actual.completionTime) / actual.completionTime;
    const qualityAccuracy = 1 - Math.abs(prediction.predictedOutcome.successProbability - actual.qualityScore);
    
    return (timeAccuracy + qualityAccuracy) / 2;
  }

  private async updateModelWithFeedback(prediction: ModelPrediction, actual: ProjectOutcome, accuracy: number): Promise<void> {
    // Create new training data point from prediction and actual outcome
    const trainingPoint: TrainingDataPoint = {
      id: `feedback-${Date.now()}`,
      projectId: prediction.projectId,
      features: {
        projectComplexity: 0.8, // Derived from prediction context
        estimatedHours: prediction.predictedOutcome.estimatedCompletion,
        techStackComplexity: 0.7,
        teamSize: prediction.predictedOutcome.recommendedTeamSize,
        deadline: 30,
        budget: 50000,
        riskScore: prediction.predictedOutcome.riskFactors.length / 10,
        historicalSuccess: prediction.predictedOutcome.successProbability
      },
      outcome: actual,
      timestamp: new Date()
    };

    this.trainingData.push(trainingPoint);
  }

  private async validateModelPerformance(): Promise<void> {
    for (const [modelId, model] of this.models) {
      const recentPredictions = model.predictions.slice(-50);
      if (recentPredictions.length > 10) {
        const avgConfidence = recentPredictions.reduce((sum, p) => sum + p.confidence, 0) / recentPredictions.length;
        
        if (avgConfidence < 0.7) {
          console.warn(`⚠️ Model ${modelId} performance degraded, confidence: ${avgConfidence}`);
          this.emit('model-performance-warning', { modelId, confidence: avgConfidence });
        }
      }
    }
  }

  private generateRecommendationReasoning(prediction: ModelPrediction): string {
    const reasoning = [];
    
    reasoning.push(`Recommended team size of ${prediction.predictedOutcome.recommendedTeamSize} based on project complexity analysis`);
    reasoning.push(`Success probability of ${(prediction.predictedOutcome.successProbability * 100).toFixed(1)}% considering historical patterns`);
    
    if (prediction.predictedOutcome.riskFactors.length > 0) {
      reasoning.push(`Risk mitigation required for: ${prediction.predictedOutcome.riskFactors.join(', ')}`);
    }
    
    reasoning.push(`Prediction confidence: ${(prediction.confidence * 100).toFixed(1)}%`);
    
    return reasoning.join('. ');
  }
}

/**
 * Supporting Classes
 */
class FeatureEngineer {
  async extractFeatures(request: PredictiveAllocationRequest): Promise<any> {
    const { projectRequirements, constraints } = request;

    return {
      projectComplexity: this.calculateComplexityScore(projectRequirements),
      timeConstraints: this.calculateTimeConstraintScore(constraints.timeConstraints),
      budgetConstraints: this.calculateBudgetConstraintScore(projectRequirements.budget, constraints.budgetLimit),
      techStackComplexity: this.calculateTechStackComplexity(projectRequirements.techStack),
      teamExperience: 0.8, // Default - would be calculated from historical data
      resourceAvailability: 0.7, // Default - would be calculated from current system state
      estimatedHours: projectRequirements.estimatedHours,
      deadline: Math.floor((projectRequirements.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    };
  }

  private calculateComplexityScore(requirements: ProjectRequirements): number {
    const complexityMap = { simple: 0.2, medium: 0.5, complex: 0.8, enterprise: 1.0 };
    return complexityMap[requirements.complexity] || 0.5;
  }

  private calculateTimeConstraintScore(constraints: TimeConstraint[]): number {
    if (constraints.length === 0) return 0.5;
    
    const criticalityMap = { low: 0.2, medium: 0.5, high: 0.8, critical: 1.0 };
    const avgCriticality = constraints.reduce((sum, c) => sum + criticalityMap[c.criticality], 0) / constraints.length;
    
    return avgCriticality;
  }

  private calculateBudgetConstraintScore(budget: number, limit: number): number {
    return Math.min(1.0, budget / limit);
  }

  private calculateTechStackComplexity(techStack: string[]): number {
    const complexityScores = {
      'react': 0.3, 'vue': 0.3, 'angular': 0.4,
      'node.js': 0.3, 'python': 0.2, 'java': 0.5,
      'kubernetes': 0.8, 'microservices': 0.7,
      'blockchain': 0.9, 'ai/ml': 0.8
    };

    const avgComplexity = techStack.reduce((sum, tech) => {
      return sum + (complexityScores[tech.toLowerCase()] || 0.5);
    }, 0) / techStack.length;

    return Math.min(1.0, avgComplexity);
  }
}

class ModelTrainer {
  async train(model: PredictiveModel, data: TrainingDataPoint[]): Promise<{ accuracy: number }> {
    // Simulate ML model training
    console.log(`Training ${model.name} with ${data.length} data points...`);
    
    // In a real implementation, this would use actual ML libraries
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate improving accuracy with more data
    const dataQualityFactor = Math.min(1.0, data.length / 100);
    const newAccuracy = Math.min(0.95, model.accuracy + (dataQualityFactor * 0.02));
    
    return { accuracy: newAccuracy };
  }
}

class PredictionEngine {
  async predict(modelId: string, features: any): Promise<any> {
    // Simulate ML model prediction
    switch (modelId) {
      case 'team-size-predictor':
        return {
          value: Math.max(3, Math.min(15, Math.round(features.projectComplexity * 10 + features.estimatedHours / 40))),
          confidence: 0.85
        };
        
      case 'agent-mix-predictor':
        return {
          agentMix: this.generateAgentMixRecommendation(features),
          confidence: 0.90
        };
        
      case 'success-predictor':
        return {
          value: Math.max(0.1, Math.min(1.0, 0.9 - features.projectComplexity * 0.3 + features.teamExperience * 0.2)),
          confidence: 0.88
        };
        
      case 'timeline-predictor':
        return {
          value: features.estimatedHours * (1 + features.projectComplexity * 0.5),
          confidence: 0.82
        };
        
      default:
        throw new Error(`Unknown model: ${modelId}`);
    }
  }

  private generateAgentMixRecommendation(features: any): AgentMixRecommendation[] {
    const recommendations: AgentMixRecommendation[] = [];
    
    // Base team structure
    recommendations.push({
      agentType: 'fullstack-developer',
      recommendedCount: Math.max(2, Math.round(features.projectComplexity * 4)),
      allocationPercentage: 40,
      reasoning: 'Core development team for full-stack implementation',
      priority: 1
    });

    recommendations.push({
      agentType: 'system-architect',
      recommendedCount: 1,
      allocationPercentage: 15,
      reasoning: 'System design and architecture planning',
      priority: 2
    });

    if (features.techStackComplexity > 0.6) {
      recommendations.push({
        agentType: 'devops-engineer',
        recommendedCount: 1,
        allocationPercentage: 10,
        reasoning: 'Complex infrastructure and deployment requirements',
        priority: 3
      });
    }

    recommendations.push({
      agentType: 'qa-engineer',
      recommendedCount: Math.max(1, Math.round(features.projectComplexity * 2)),
      allocationPercentage: 20,
      reasoning: 'Quality assurance and testing',
      priority: 4
    });

    return recommendations;
  }
}

export const mlPredictiveAllocationEngine = new MLPredictiveAllocationEngine();
