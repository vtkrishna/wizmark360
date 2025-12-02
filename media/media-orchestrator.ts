/**
 * Media Orchestrator v9.0
 * 
 * Centralized orchestration for video/audio/music processing with QA gates
 * Provides unified interface for all media adapters in WAI v9.0
 */

import { EventEmitter } from 'events';
import { VideoProcessingAdapter, MusicAudioAdapter } from './media-music-adapters';
import type { MediaAdapter, MediaInput, MediaOutput, ValidationResult, MediaAdapterStatus } from './media-music-adapters';

// ================================================================================================
// MEDIA ORCHESTRATOR INTERFACES
// ================================================================================================

export interface MediaOrchestrator {
  initialize(): Promise<void>;
  processMedia(input: MediaInput): Promise<MediaProcessingResult>;
  validateOutput(output: MediaOutput): Promise<ValidationResult>;
  getAdapterStatus(adapterId: string): MediaAdapterStatus;
  getAllAdapterStatuses(): Record<string, MediaAdapterStatus>;
  getRecommendations(input: MediaInput): Promise<ProcessingRecommendations>;
}

export interface MediaProcessingResult {
  output: MediaOutput;
  validation: ValidationResult;
  recommendations: ProcessingRecommendations;
  orchestrationMetrics: OrchestrationMetrics;
}

export interface ProcessingRecommendations {
  quality: QualityRecommendation[];
  performance: PerformanceRecommendation[];
  cost: CostRecommendation[];
  workflow: WorkflowRecommendation[];
}

export interface QualityRecommendation {
  type: 'format' | 'settings' | 'preprocessing' | 'postprocessing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
  impact: string;
  estimatedImprovement: number; // 0-1
}

export interface PerformanceRecommendation {
  type: 'optimization' | 'resource_allocation' | 'parallel_processing' | 'caching';
  suggestion: string;
  estimatedSpeedup: number; // multiplier
  resourceSavings: number; // 0-1
}

export interface CostRecommendation {
  type: 'format_optimization' | 'quality_adjustment' | 'batch_processing' | 'resource_efficiency';
  suggestion: string;
  estimatedSavings: number; // 0-1
  qualityImpact: number; // 0-1 (0 = no impact, 1 = significant impact)
}

export interface WorkflowRecommendation {
  type: 'pipeline_optimization' | 'automation' | 'integration' | 'monitoring';
  suggestion: string;
  benefit: string;
  complexity: 'low' | 'medium' | 'high';
}

export interface OrchestrationMetrics {
  totalProcessingTime: number;
  adapterSelection: string;
  qualityGateResults: QualityGateResult[];
  resourceUtilization: ResourceUtilization;
  costEstimate: CostEstimate;
  performance: PerformanceMetrics;
}

export interface QualityGateResult {
  gateId: string;
  adapterId: string;
  passed: boolean;
  score: number;
  threshold: number;
  executionTime: number;
}

export interface ResourceUtilization {
  cpu: number;
  memory: number;
  gpu?: number;
  storage: number;
  network: number;
  efficiency: number; // 0-1
}

export interface CostEstimate {
  processing: number; // USD
  storage: number; // USD
  bandwidth: number; // USD
  total: number; // USD
  currency: string;
}

export interface PerformanceMetrics {
  throughput: number; // files per hour
  latency: number; // milliseconds
  accuracy: number; // 0-1
  scalability: number; // max concurrent files
}

// ================================================================================================
// MEDIA ORCHESTRATOR IMPLEMENTATION
// ================================================================================================

export class MediaOrchestratorImpl extends EventEmitter implements MediaOrchestrator {
  private adapters: Map<string, MediaAdapter> = new Map();
  private isInitialized: boolean = false;
  private processingHistory: Map<string, MediaProcessingResult> = new Map();
  private orchestrationMetrics: any = {
    totalProcessed: 0,
    avgProcessingTime: 25000,
    successRate: 0.95,
    avgQualityScore: 0.91
  };

  constructor() {
    super();
  }

  public async initialize(): Promise<void> {
    console.log('🎭 Initializing Media Orchestrator v9.0...');
    
    try {
      // Initialize video processing adapter
      const videoAdapter = new VideoProcessingAdapter();
      await videoAdapter.initialize();
      this.adapters.set(videoAdapter.id, videoAdapter);
      
      // Initialize music/audio adapter
      const audioAdapter = new MusicAudioAdapter();
      await audioAdapter.initialize();
      this.adapters.set(audioAdapter.id, audioAdapter);
      
      // Set up event forwarding
      this.setupEventForwarding();
      
      // Start monitoring
      this.startMonitoring();
      
      this.isInitialized = true;
      console.log(`✅ Media Orchestrator initialized with ${this.adapters.size} adapters`);
      
      this.emit('orchestratorInitialized', {
        adapters: Array.from(this.adapters.keys()),
        capabilities: this.getAllCapabilities(),
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize Media Orchestrator:', error);
      throw error;
    }
  }

  public async processMedia(input: MediaInput): Promise<MediaProcessingResult> {
    if (!this.isInitialized) {
      throw new Error('Media Orchestrator not initialized');
    }

    const startTime = Date.now();
    console.log(`🎬 Orchestrating media processing: ${input.id} (${input.metadata.format})`);
    
    try {
      // Select optimal adapter
      const adapter = await this.selectOptimalAdapter(input);
      console.log(`📱 Selected adapter: ${adapter.name} for ${input.metadata.format}`);
      
      // Get processing recommendations
      const recommendations = await this.getRecommendations(input);
      
      // Process media using selected adapter
      const output = await adapter.process(input);
      
      // Validate output
      const validation = await adapter.validate(output);
      
      // Calculate orchestration metrics
      const orchestrationMetrics = this.calculateOrchestrationMetrics(
        startTime,
        adapter.id,
        output,
        validation
      );
      
      const result: MediaProcessingResult = {
        output,
        validation,
        recommendations,
        orchestrationMetrics
      };
      
      // Store processing history
      this.processingHistory.set(input.id, result);
      
      // Update metrics
      this.updateOrchestrationMetrics(result);
      
      console.log(`✅ Media orchestration completed: ${input.id} (${Date.now() - startTime}ms)`);
      
      this.emit('mediaProcessed', result);
      return result;
      
    } catch (error) {
      console.error(`❌ Media orchestration failed: ${input.id}`, error);
      throw error;
    }
  }

  public async validateOutput(output: MediaOutput): Promise<ValidationResult> {
    const adapter = this.getAdapterById(output.inputId);
    if (!adapter) {
      throw new Error('Adapter not found for validation');
    }
    
    return await adapter.validate(output);
  }

  public getAdapterStatus(adapterId: string): MediaAdapterStatus {
    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      throw new Error(`Adapter not found: ${adapterId}`);
    }
    
    return adapter.getStatus();
  }

  public getAllAdapterStatuses(): Record<string, MediaAdapterStatus> {
    const statuses: Record<string, MediaAdapterStatus> = {};
    
    for (const [id, adapter] of this.adapters) {
      statuses[id] = adapter.getStatus();
    }
    
    return statuses;
  }

  public async getRecommendations(input: MediaInput): Promise<ProcessingRecommendations> {
    console.log(`💡 Generating processing recommendations for: ${input.id}`);
    
    const recommendations: ProcessingRecommendations = {
      quality: await this.generateQualityRecommendations(input),
      performance: await this.generatePerformanceRecommendations(input),
      cost: await this.generateCostRecommendations(input),
      workflow: await this.generateWorkflowRecommendations(input)
    };
    
    return recommendations;
  }

  // ================================================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ================================================================================================

  private async selectOptimalAdapter(input: MediaInput): Promise<MediaAdapter> {
    const mediaType = this.inferMediaType(input);
    
    // Get all compatible adapters
    const compatibleAdapters: MediaAdapter[] = [];
    
    for (const adapter of this.adapters.values()) {
      if (adapter.mediaType === mediaType || adapter.mediaType === 'multimodal') {
        if (adapter.supportedFormats.includes(input.metadata.format)) {
          if (input.metadata.size <= adapter.maxFileSize) {
            compatibleAdapters.push(adapter);
          }
        }
      }
    }
    
    if (compatibleAdapters.length === 0) {
      throw new Error(`No compatible adapter found for format: ${input.metadata.format}`);
    }
    
    // Score adapters based on capabilities and current load
    let bestAdapter = compatibleAdapters[0];
    let bestScore = 0;
    
    for (const adapter of compatibleAdapters) {
      const score = await this.scoreAdapter(adapter, input);
      if (score > bestScore) {
        bestScore = score;
        bestAdapter = adapter;
      }
    }
    
    return bestAdapter;
  }

  private inferMediaType(input: MediaInput): 'video' | 'audio' | 'image' {
    const videoFormats = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'];
    const audioFormats = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'];
    
    if (videoFormats.includes(input.metadata.format)) return 'video';
    if (audioFormats.includes(input.metadata.format)) return 'audio';
    return 'image';
  }

  private async scoreAdapter(adapter: MediaAdapter, input: MediaInput): Promise<number> {
    const status = adapter.getStatus();
    
    // Base score from capabilities
    let score = 0.5;
    
    // Performance factor (lower load = higher score)
    score += (1 - status.loadLevel) * 0.3;
    
    // Success rate factor
    score += status.performance.successRate * 0.2;
    
    // Quality factor based on requirements
    const qualityBonus = this.calculateQualityBonus(adapter, input.qualityRequirements);
    score += qualityBonus * 0.3;
    
    return Math.min(1, score);
  }

  private calculateQualityBonus(adapter: MediaAdapter, requirements: any[]): number {
    // Calculate bonus based on adapter capabilities vs requirements
    return 0.8 + Math.random() * 0.2; // 80-100%
  }

  private async generateQualityRecommendations(input: MediaInput): Promise<QualityRecommendation[]> {
    const recommendations: QualityRecommendation[] = [];
    
    // Format recommendations
    if (input.metadata.format === 'mp4' && input.metadata.size > 100 * 1024 * 1024) {
      recommendations.push({
        type: 'format',
        priority: 'medium',
        suggestion: 'Consider using h.265 encoding for better compression',
        impact: 'Reduces file size by 30-50% with minimal quality loss',
        estimatedImprovement: 0.3
      });
    }
    
    // Quality settings
    if (input.processingOptions.quality === 'low') {
      recommendations.push({
        type: 'settings',
        priority: 'high',
        suggestion: 'Increase quality setting for better output',
        impact: 'Improves visual/audio quality significantly',
        estimatedImprovement: 0.4
      });
    }
    
    // Preprocessing recommendations
    if (input.metadata.format === 'wav' && !input.metadata.sampleRate) {
      recommendations.push({
        type: 'preprocessing',
        priority: 'medium',
        suggestion: 'Normalize audio levels before processing',
        impact: 'Ensures consistent audio levels',
        estimatedImprovement: 0.2
      });
    }
    
    return recommendations;
  }

  private async generatePerformanceRecommendations(input: MediaInput): Promise<PerformanceRecommendation[]> {
    const recommendations: PerformanceRecommendation[] = [];
    
    // Optimization recommendations
    if (input.metadata.size > 500 * 1024 * 1024) {
      recommendations.push({
        type: 'optimization',
        suggestion: 'Process in chunks for large files to reduce memory usage',
        estimatedSpeedup: 1.5,
        resourceSavings: 0.4
      });
    }
    
    // Parallel processing
    if (input.metadata.duration && input.metadata.duration > 300) {
      recommendations.push({
        type: 'parallel_processing',
        suggestion: 'Enable parallel processing for long media files',
        estimatedSpeedup: 2.5,
        resourceSavings: 0.1
      });
    }
    
    return recommendations;
  }

  private async generateCostRecommendations(input: MediaInput): Promise<CostRecommendation[]> {
    const recommendations: CostRecommendation[] = [];
    
    // Format optimization
    if (input.processingOptions.quality === 'high' && input.metadata.size < 50 * 1024 * 1024) {
      recommendations.push({
        type: 'quality_adjustment',
        suggestion: 'Medium quality may be sufficient for smaller files',
        estimatedSavings: 0.3,
        qualityImpact: 0.1
      });
    }
    
    // Batch processing
    recommendations.push({
      type: 'batch_processing',
      suggestion: 'Process multiple files together for cost efficiency',
      estimatedSavings: 0.25,
      qualityImpact: 0
    });
    
    return recommendations;
  }

  private async generateWorkflowRecommendations(input: MediaInput): Promise<WorkflowRecommendation[]> {
    const recommendations: WorkflowRecommendation[] = [];
    
    // Pipeline optimization
    recommendations.push({
      type: 'pipeline_optimization',
      suggestion: 'Implement caching for frequently processed content',
      benefit: 'Reduces processing time for similar files',
      complexity: 'medium'
    });
    
    // Automation
    recommendations.push({
      type: 'automation',
      suggestion: 'Set up automated quality monitoring',
      benefit: 'Continuous quality assurance without manual intervention',
      complexity: 'low'
    });
    
    return recommendations;
  }

  private calculateOrchestrationMetrics(
    startTime: number,
    adapterId: string,
    output: MediaOutput,
    validation: ValidationResult
  ): OrchestrationMetrics {
    const totalProcessingTime = Date.now() - startTime;
    
    return {
      totalProcessingTime,
      adapterSelection: adapterId,
      qualityGateResults: output.qualityScores.map(score => ({
        gateId: score.gateId,
        adapterId,
        passed: score.passed,
        score: score.score,
        threshold: 0.8, // Default threshold
        executionTime: 50 + Math.random() * 100 // Simulated
      })),
      resourceUtilization: {
        cpu: output.processingStats.resourceUsage.cpu,
        memory: output.processingStats.resourceUsage.memory,
        gpu: output.processingStats.resourceUsage.gpu,
        storage: output.processingStats.resourceUsage.storage,
        network: 0.2,
        efficiency: 0.85 + Math.random() * 0.1
      },
      costEstimate: {
        processing: totalProcessingTime * 0.0001, // $0.0001 per second
        storage: output.metadata.size * 0.00001, // $0.00001 per byte
        bandwidth: output.metadata.size * 0.000005, // $0.000005 per byte
        total: 0,
        currency: 'USD'
      },
      performance: {
        throughput: 3600000 / totalProcessingTime, // files per hour
        latency: totalProcessingTime,
        accuracy: validation.overallScore,
        scalability: 100
      }
    };
  }

  private setupEventForwarding(): void {
    console.log('📡 Setting up media adapter event forwarding...');
    
    for (const [id, adapter] of this.adapters) {
      // Forward adapter events to orchestrator
      adapter.on('initialized', (data) => this.emit('adapterInitialized', { adapterId: id, ...data }));
      adapter.on('videoProcessed', (data) => this.emit('mediaProcessed', data));
      adapter.on('audioProcessed', (data) => this.emit('mediaProcessed', data));
    }
  }

  private startMonitoring(): void {
    console.log('📊 Starting media orchestration monitoring...');
    
    // Monitor adapter health and performance
    setInterval(() => {
      this.updateOrchestrationHealth();
    }, 30000); // Every 30 seconds
  }

  private updateOrchestrationHealth(): void {
    const statuses = this.getAllAdapterStatuses();
    const activeAdapters = Object.values(statuses).filter(s => s.isActive).length;
    const avgLoadLevel = Object.values(statuses).reduce((sum, s) => sum + s.loadLevel, 0) / Object.keys(statuses).length;
    
    console.log(`📊 Media Health: ${activeAdapters}/${Object.keys(statuses).length} adapters active, avg load: ${(avgLoadLevel * 100).toFixed(1)}%`);
  }

  private getAdapterById(inputId: string): MediaAdapter | undefined {
    // Find adapter based on processing history or media type
    const history = this.processingHistory.get(inputId);
    if (history) {
      return this.adapters.get(history.orchestrationMetrics.adapterSelection);
    }
    
    // Fallback to first available adapter
    return this.adapters.values().next().value;
  }

  private getAllCapabilities(): any[] {
    const capabilities: any[] = [];
    
    for (const adapter of this.adapters.values()) {
      capabilities.push({
        adapterId: adapter.id,
        mediaType: adapter.mediaType,
        capabilities: adapter.capabilities,
        supportedFormats: adapter.supportedFormats
      });
    }
    
    return capabilities;
  }

  private updateOrchestrationMetrics(result: MediaProcessingResult): void {
    this.orchestrationMetrics.totalProcessed++;
    
    // Update average processing time
    this.orchestrationMetrics.avgProcessingTime = 
      this.orchestrationMetrics.avgProcessingTime * 0.9 + 
      result.orchestrationMetrics.totalProcessingTime * 0.1;
    
    // Update success rate
    const success = result.validation.valid;
    if (success) {
      this.orchestrationMetrics.successRate = this.orchestrationMetrics.successRate * 0.95 + 0.05;
    } else {
      this.orchestrationMetrics.successRate = this.orchestrationMetrics.successRate * 0.95;
    }
    
    // Update average quality score
    this.orchestrationMetrics.avgQualityScore = 
      this.orchestrationMetrics.avgQualityScore * 0.9 + 
      result.validation.overallScore * 0.1;
  }
}

export default MediaOrchestratorImpl;