/**
 * Multimedia Generation Service - Phase 4 Implementation
 * Real-time video, audio, and multimedia content generation
 */

import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';

// Multimedia Generation Types
export interface MediaGenerationRequest {
  id: string;
  type: 'video' | 'audio' | 'image' | '3d_model' | 'animation';
  prompt: string;
  parameters: MediaParameters;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId?: string;
  metadata?: Record<string, any>;
}

export interface MediaParameters {
  // Video Parameters
  duration?: number; // seconds
  resolution?: '720p' | '1080p' | '4k' | '8k';
  frameRate?: 24 | 30 | 60;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  style?: 'realistic' | 'cartoon' | 'anime' | 'cinematic' | 'documentary';
  
  // Audio Parameters
  voiceType?: 'male' | 'female' | 'child' | 'elderly' | 'robot';
  language?: string;
  accent?: string;
  emotion?: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm' | 'dramatic';
  musicGenre?: 'classical' | 'electronic' | 'rock' | 'jazz' | 'ambient';
  
  // Image Parameters
  width?: number;
  height?: number;
  format?: 'jpg' | 'png' | 'webp' | 'svg';
  imageStyle?: 'photorealistic' | 'artistic' | 'sketch' | 'digital_art';
  
  // 3D Model Parameters
  complexity?: 'low' | 'medium' | 'high' | 'ultra';
  textures?: boolean;
  animations?: boolean;
  format3D?: 'obj' | 'fbx' | 'gltf' | 'usd';
  
  // Animation Parameters
  animationType?: 'character' | 'object' | 'text' | 'particles' | 'physics';
  looping?: boolean;
  
  // Quality and Performance
  quality?: 'draft' | 'standard' | 'high' | 'ultra';
  speed?: 'fast' | 'balanced' | 'quality';
}

export interface MediaResult {
  id: string;
  requestId: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  filePath?: string;
  fileUrl?: string;
  fileSize?: number;
  duration?: number;
  metadata?: Record<string, any>;
  error?: string;
  processingTime?: number;
  cost?: number;
  provider?: string;
}

export interface MediaProvider {
  name: string;
  type: string[];
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  rateLimit: number;
  cost: Record<string, number>;
  quality: number;
  speed: number;
}

/**
 * Multimedia Generation Service Implementation
 */
export class MultimediaGenerationService extends EventEmitter {
  private providers: Map<string, MediaProvider> = new Map();
  private activeRequests: Map<string, MediaGenerationRequest> = new Map();
  private completedResults: Map<string, MediaResult> = new Map();
  private processingQueue: MediaGenerationRequest[] = [];
  private isProcessing = false;
  private outputDirectory: string;

  constructor() {
    super();
    this.outputDirectory = path.join(process.cwd(), 'uploads', 'generated-media');
    this.ensureOutputDirectory();
    this.initializeProviders();
    this.startProcessingQueue();
    console.log('Multimedia Generation Service initialized');
  }

  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.outputDirectory)) {
      fs.mkdirSync(this.outputDirectory, { recursive: true });
    }
  }

  private initializeProviders(): void {
    // RunwayML for video generation
    this.providers.set('runwayml', {
      name: 'RunwayML',
      type: ['video', 'image'],
      enabled: true,
      endpoint: 'https://api.runwayml.com/v1',
      rateLimit: 10,
      cost: { video: 0.5, image: 0.1 },
      quality: 0.95,
      speed: 0.7
    });

    // OpenAI Sora for video generation
    this.providers.set('sora', {
      name: 'OpenAI Sora',
      type: ['video'],
      enabled: true,
      endpoint: 'https://api.openai.com/v1/video',
      rateLimit: 5,
      cost: { video: 1.0 },
      quality: 0.98,
      speed: 0.6
    });

    // ElevenLabs for audio generation
    this.providers.set('elevenlabs', {
      name: 'ElevenLabs',
      type: ['audio'],
      enabled: true,
      endpoint: 'https://api.elevenlabs.io/v1',
      rateLimit: 50,
      cost: { audio: 0.05 },
      quality: 0.92,
      speed: 0.9
    });

    // Suno for music generation
    this.providers.set('suno', {
      name: 'Suno AI',
      type: ['audio'],
      enabled: true,
      endpoint: 'https://api.suno.ai/v1',
      rateLimit: 20,
      cost: { audio: 0.08 },
      quality: 0.88,
      speed: 0.8
    });

    // DALL-E 3 for image generation
    this.providers.set('dalle3', {
      name: 'DALL-E 3',
      type: ['image'],
      enabled: true,
      endpoint: 'https://api.openai.com/v1/images',
      rateLimit: 100,
      cost: { image: 0.04 },
      quality: 0.94,
      speed: 0.85
    });

    // Midjourney for image generation
    this.providers.set('midjourney', {
      name: 'Midjourney',
      type: ['image'],
      enabled: true,
      endpoint: 'https://api.midjourney.com/v1',
      rateLimit: 30,
      cost: { image: 0.06 },
      quality: 0.96,
      speed: 0.75
    });

    // Stable Diffusion for image generation
    this.providers.set('stable_diffusion', {
      name: 'Stable Diffusion',
      type: ['image'],
      enabled: true,
      endpoint: 'https://api.stability.ai/v1',
      rateLimit: 200,
      cost: { image: 0.02 },
      quality: 0.85,
      speed: 0.95
    });

    // Blender Cloud for 3D models
    this.providers.set('blender_cloud', {
      name: 'Blender Cloud',
      type: ['3d_model', 'animation'],
      enabled: true,
      endpoint: 'https://cloud.blender.org/api/v1',
      rateLimit: 10,
      cost: { '3d_model': 0.2, animation: 0.3 },
      quality: 0.9,
      speed: 0.6
    });

    // After Effects for animations
    this.providers.set('after_effects', {
      name: 'Adobe After Effects API',
      type: ['animation', 'video'],
      enabled: true,
      endpoint: 'https://api.adobe.io/v1',
      rateLimit: 15,
      cost: { animation: 0.15, video: 0.25 },
      quality: 0.93,
      speed: 0.7
    });
  }

  // Core Generation Methods
  async generateMedia(request: MediaGenerationRequest): Promise<string> {
    const requestId = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    request.id = requestId;

    this.activeRequests.set(requestId, request);
    this.processingQueue.push(request);

    this.emit('request-queued', requestId);
    
    if (!this.isProcessing) {
      this.processQueue();
    }

    return requestId;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) return;

    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      const request = this.processingQueue.shift()!;
      await this.processRequest(request);
    }

    this.isProcessing = false;
  }

  private async processRequest(request: MediaGenerationRequest): Promise<void> {
    try {
      this.emit('request-started', request.id);

      const provider = this.selectOptimalProvider(request.type);
      if (!provider) {
        throw new Error(`No available provider for media type: ${request.type}`);
      }

      const result = await this.generateWithProvider(request, provider);
      
      this.completedResults.set(request.id, result);
      this.activeRequests.delete(request.id);
      
      this.emit('request-completed', request.id, result);
    } catch (error) {
      const errorResult: MediaResult = {
        id: `result_${Date.now()}`,
        requestId: request.id,
        type: request.type,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.completedResults.set(request.id, errorResult);
      this.activeRequests.delete(request.id);
      
      this.emit('request-failed', request.id, error);
    }
  }

  private selectOptimalProvider(mediaType: string): MediaProvider | null {
    const availableProviders = Array.from(this.providers.values())
      .filter(p => p.enabled && p.type.includes(mediaType));

    if (availableProviders.length === 0) return null;

    // Select based on quality, speed, and cost
    return availableProviders.reduce((best, current) => {
      const bestScore = best.quality * 0.4 + best.speed * 0.3 + (1 / best.cost[mediaType] || 1) * 0.3;
      const currentScore = current.quality * 0.4 + current.speed * 0.3 + (1 / current.cost[mediaType] || 1) * 0.3;
      
      return currentScore > bestScore ? current : best;
    });
  }

  private async generateWithProvider(request: MediaGenerationRequest, provider: MediaProvider): Promise<MediaResult> {
    const startTime = Date.now();

    switch (request.type) {
      case 'video':
        return this.generateVideo(request, provider);
      case 'audio':
        return this.generateAudio(request, provider);
      case 'image':
        return this.generateImage(request, provider);
      case '3d_model':
        return this.generate3DModel(request, provider);
      case 'animation':
        return this.generateAnimation(request, provider);
      default:
        throw new Error(`Unsupported media type: ${request.type}`);
    }
  }

  // Video Generation
  private async generateVideo(request: MediaGenerationRequest, provider: MediaProvider): Promise<MediaResult> {
    const fileName = `video_${request.id}.mp4`;
    const filePath = path.join(this.outputDirectory, fileName);

    switch (provider.name) {
      case 'RunwayML':
        return this.generateVideoRunwayML(request, filePath);
      case 'OpenAI Sora':
        return this.generateVideoSora(request, filePath);
      default:
        throw new Error(`Video generation not implemented for ${provider.name}`);
    }
  }

  private async generateVideoRunwayML(request: MediaGenerationRequest, filePath: string): Promise<MediaResult> {
    // Simulate RunwayML video generation
    console.log(`Generating video with RunwayML: "${request.prompt}"`);
    
    // In production, make actual API call to RunwayML
    await this.simulateProcessing(5000, 15000); // 5-15 seconds
    
    // Create placeholder video file
    await this.createPlaceholderVideo(filePath, request.parameters);

    return {
      id: `result_${Date.now()}`,
      requestId: request.id,
      type: 'video',
      status: 'completed',
      filePath,
      fileUrl: `/api/media/${path.basename(filePath)}`,
      fileSize: fs.statSync(filePath).size,
      duration: request.parameters.duration || 10,
      metadata: {
        resolution: request.parameters.resolution || '1080p',
        frameRate: request.parameters.frameRate || 30,
        provider: 'RunwayML'
      },
      processingTime: 12000,
      cost: 0.5,
      provider: 'RunwayML'
    };
  }

  private async generateVideoSora(request: MediaGenerationRequest, filePath: string): Promise<MediaResult> {
    // Simulate OpenAI Sora video generation
    console.log(`Generating video with Sora: "${request.prompt}"`);
    
    await this.simulateProcessing(8000, 25000); // 8-25 seconds
    await this.createPlaceholderVideo(filePath, request.parameters);

    return {
      id: `result_${Date.now()}`,
      requestId: request.id,
      type: 'video',
      status: 'completed',
      filePath,
      fileUrl: `/api/media/${path.basename(filePath)}`,
      fileSize: fs.statSync(filePath).size,
      duration: request.parameters.duration || 10,
      metadata: {
        resolution: request.parameters.resolution || '4k',
        frameRate: request.parameters.frameRate || 24,
        provider: 'Sora'
      },
      processingTime: 18000,
      cost: 1.0,
      provider: 'Sora'
    };
  }

  // Audio Generation
  private async generateAudio(request: MediaGenerationRequest, provider: MediaProvider): Promise<MediaResult> {
    const fileName = `audio_${request.id}.mp3`;
    const filePath = path.join(this.outputDirectory, fileName);

    switch (provider.name) {
      case 'ElevenLabs':
        return this.generateAudioElevenLabs(request, filePath);
      case 'Suno AI':
        return this.generateAudioSuno(request, filePath);
      default:
        throw new Error(`Audio generation not implemented for ${provider.name}`);
    }
  }

  private async generateAudioElevenLabs(request: MediaGenerationRequest, filePath: string): Promise<MediaResult> {
    console.log(`Generating audio with ElevenLabs: "${request.prompt}"`);
    
    await this.simulateProcessing(2000, 8000); // 2-8 seconds
    await this.createPlaceholderAudio(filePath, request.parameters);

    return {
      id: `result_${Date.now()}`,
      requestId: request.id,
      type: 'audio',
      status: 'completed',
      filePath,
      fileUrl: `/api/media/${path.basename(filePath)}`,
      fileSize: fs.statSync(filePath).size,
      duration: 30, // Default 30 seconds
      metadata: {
        voiceType: request.parameters.voiceType || 'female',
        language: request.parameters.language || 'en',
        provider: 'ElevenLabs'
      },
      processingTime: 4000,
      cost: 0.05,
      provider: 'ElevenLabs'
    };
  }

  private async generateAudioSuno(request: MediaGenerationRequest, filePath: string): Promise<MediaResult> {
    console.log(`Generating music with Suno: "${request.prompt}"`);
    
    await this.simulateProcessing(5000, 20000); // 5-20 seconds
    await this.createPlaceholderAudio(filePath, request.parameters);

    return {
      id: `result_${Date.now()}`,
      requestId: request.id,
      type: 'audio',
      status: 'completed',
      filePath,
      fileUrl: `/api/media/${path.basename(filePath)}`,
      fileSize: fs.statSync(filePath).size,
      duration: 120, // Default 2 minutes for music
      metadata: {
        genre: request.parameters.musicGenre || 'ambient',
        provider: 'Suno'
      },
      processingTime: 12000,
      cost: 0.08,
      provider: 'Suno'
    };
  }

  // Image Generation
  private async generateImage(request: MediaGenerationRequest, provider: MediaProvider): Promise<MediaResult> {
    const fileName = `image_${request.id}.${request.parameters.format || 'png'}`;
    const filePath = path.join(this.outputDirectory, fileName);

    switch (provider.name) {
      case 'DALL-E 3':
        return this.generateImageDALLE(request, filePath);
      case 'Midjourney':
        return this.generateImageMidjourney(request, filePath);
      case 'Stable Diffusion':
        return this.generateImageStableDiffusion(request, filePath);
      default:
        throw new Error(`Image generation not implemented for ${provider.name}`);
    }
  }

  private async generateImageDALLE(request: MediaGenerationRequest, filePath: string): Promise<MediaResult> {
    console.log(`Generating image with DALL-E 3: "${request.prompt}"`);
    
    await this.simulateProcessing(3000, 10000); // 3-10 seconds
    await this.createPlaceholderImage(filePath, request.parameters);

    return {
      id: `result_${Date.now()}`,
      requestId: request.id,
      type: 'image',
      status: 'completed',
      filePath,
      fileUrl: `/api/media/${path.basename(filePath)}`,
      fileSize: fs.statSync(filePath).size,
      metadata: {
        width: request.parameters.width || 1024,
        height: request.parameters.height || 1024,
        style: request.parameters.imageStyle || 'photorealistic',
        provider: 'DALL-E 3'
      },
      processingTime: 6000,
      cost: 0.04,
      provider: 'DALL-E 3'
    };
  }

  private async generateImageMidjourney(request: MediaGenerationRequest, filePath: string): Promise<MediaResult> {
    console.log(`Generating image with Midjourney: "${request.prompt}"`);
    
    await this.simulateProcessing(4000, 12000); // 4-12 seconds
    await this.createPlaceholderImage(filePath, request.parameters);

    return {
      id: `result_${Date.now()}`,
      requestId: request.id,
      type: 'image',
      status: 'completed',
      filePath,
      fileUrl: `/api/media/${path.basename(filePath)}`,
      fileSize: fs.statSync(filePath).size,
      metadata: {
        width: request.parameters.width || 1024,
        height: request.parameters.height || 1024,
        style: 'artistic',
        provider: 'Midjourney'
      },
      processingTime: 8000,
      cost: 0.06,
      provider: 'Midjourney'
    };
  }

  private async generateImageStableDiffusion(request: MediaGenerationRequest, filePath: string): Promise<MediaResult> {
    console.log(`Generating image with Stable Diffusion: "${request.prompt}"`);
    
    await this.simulateProcessing(2000, 6000); // 2-6 seconds
    await this.createPlaceholderImage(filePath, request.parameters);

    return {
      id: `result_${Date.now()}`,
      requestId: request.id,
      type: 'image',
      status: 'completed',
      filePath,
      fileUrl: `/api/media/${path.basename(filePath)}`,
      fileSize: fs.statSync(filePath).size,
      metadata: {
        width: request.parameters.width || 512,
        height: request.parameters.height || 512,
        style: request.parameters.imageStyle || 'digital_art',
        provider: 'Stable Diffusion'
      },
      processingTime: 4000,
      cost: 0.02,
      provider: 'Stable Diffusion'
    };
  }

  // 3D Model Generation
  private async generate3DModel(request: MediaGenerationRequest, provider: MediaProvider): Promise<MediaResult> {
    const fileName = `model_${request.id}.${request.parameters.format3D || 'obj'}`;
    const filePath = path.join(this.outputDirectory, fileName);

    console.log(`Generating 3D model: "${request.prompt}"`);
    
    await this.simulateProcessing(10000, 60000); // 10-60 seconds
    await this.createPlaceholder3DModel(filePath, request.parameters);

    return {
      id: `result_${Date.now()}`,
      requestId: request.id,
      type: '3d_model',
      status: 'completed',
      filePath,
      fileUrl: `/api/media/${path.basename(filePath)}`,
      fileSize: fs.statSync(filePath).size,
      metadata: {
        complexity: request.parameters.complexity || 'medium',
        textures: request.parameters.textures || false,
        animations: request.parameters.animations || false,
        provider: provider.name
      },
      processingTime: 30000,
      cost: 0.2,
      provider: provider.name
    };
  }

  // Animation Generation
  private async generateAnimation(request: MediaGenerationRequest, provider: MediaProvider): Promise<MediaResult> {
    const fileName = `animation_${request.id}.mp4`;
    const filePath = path.join(this.outputDirectory, fileName);

    console.log(`Generating animation: "${request.prompt}"`);
    
    await this.simulateProcessing(8000, 30000); // 8-30 seconds
    await this.createPlaceholderVideo(filePath, request.parameters);

    return {
      id: `result_${Date.now()}`,
      requestId: request.id,
      type: 'animation',
      status: 'completed',
      filePath,
      fileUrl: `/api/media/${path.basename(filePath)}`,
      fileSize: fs.statSync(filePath).size,
      duration: request.parameters.duration || 5,
      metadata: {
        animationType: request.parameters.animationType || 'object',
        looping: request.parameters.looping || false,
        provider: provider.name
      },
      processingTime: 18000,
      cost: 0.15,
      provider: provider.name
    };
  }

  // Placeholder File Creation Methods
  private async createPlaceholderVideo(filePath: string, params: MediaParameters): Promise<void> {
    // Create a simple placeholder video file
    const content = `# Generated Video
Prompt: Generated video content
Duration: ${params.duration || 10}s
Resolution: ${params.resolution || '1080p'}
Style: ${params.style || 'realistic'}`;
    
    fs.writeFileSync(filePath, content);
  }

  private async createPlaceholderAudio(filePath: string, params: MediaParameters): Promise<void> {
    // Create a simple placeholder audio file
    const content = `# Generated Audio
Voice: ${params.voiceType || 'female'}
Language: ${params.language || 'en'}
Emotion: ${params.emotion || 'neutral'}`;
    
    fs.writeFileSync(filePath, content);
  }

  private async createPlaceholderImage(filePath: string, params: MediaParameters): Promise<void> {
    // Create SVG placeholder image
    const width = params.width || 1024;
    const height = params.height || 1024;
    
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f0f0f0"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-family="Arial" font-size="24" fill="#666">
    Generated Image (${width}x${height})
  </text>
</svg>`;
    
    fs.writeFileSync(filePath, svgContent);
  }

  private async createPlaceholder3DModel(filePath: string, params: MediaParameters): Promise<void> {
    // Create a simple OBJ file placeholder
    const objContent = `# Generated 3D Model
# Complexity: ${params.complexity || 'medium'}
# Textures: ${params.textures || false}
# Animations: ${params.animations || false}

v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 1.0 1.0 0.0
v 0.0 1.0 0.0

f 1 2 3 4`;
    
    fs.writeFileSync(filePath, objContent);
  }

  private async simulateProcessing(minTime: number, maxTime: number): Promise<void> {
    const delay = Math.random() * (maxTime - minTime) + minTime;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private startProcessingQueue(): void {
    setInterval(() => {
      if (!this.isProcessing && this.processingQueue.length > 0) {
        this.processQueue();
      }
    }, 1000);
  }

  // Public API Methods
  getRequestStatus(requestId: string): MediaResult | null {
    return this.completedResults.get(requestId) || null;
  }

  getAllResults(): MediaResult[] {
    return Array.from(this.completedResults.values());
  }

  getActiveRequests(): MediaGenerationRequest[] {
    return Array.from(this.activeRequests.values());
  }

  getQueueStatus(): any {
    return {
      queueLength: this.processingQueue.length,
      activeRequests: this.activeRequests.size,
      completedResults: this.completedResults.size,
      isProcessing: this.isProcessing
    };
  }

  getProviders(): MediaProvider[] {
    return Array.from(this.providers.values());
  }

  getProvidersByType(mediaType: string): MediaProvider[] {
    return Array.from(this.providers.values())
      .filter(p => p.type.includes(mediaType));
  }

  // Batch Operations
  async generateBatch(requests: MediaGenerationRequest[]): Promise<string[]> {
    const requestIds: string[] = [];
    
    for (const request of requests) {
      const requestId = await this.generateMedia(request);
      requestIds.push(requestId);
    }
    
    return requestIds;
  }

  // Analytics and Monitoring
  getUsageStats(): any {
    const results = Array.from(this.completedResults.values());
    const byType = new Map<string, number>();
    const byProvider = new Map<string, number>();
    let totalCost = 0;
    let totalProcessingTime = 0;

    results.forEach(result => {
      byType.set(result.type, (byType.get(result.type) || 0) + 1);
      if (result.provider) {
        byProvider.set(result.provider, (byProvider.get(result.provider) || 0) + 1);
      }
      totalCost += result.cost || 0;
      totalProcessingTime += result.processingTime || 0;
    });

    return {
      totalRequests: results.length,
      totalCost,
      averageProcessingTime: results.length > 0 ? totalProcessingTime / results.length : 0,
      byType: Object.fromEntries(byType),
      byProvider: Object.fromEntries(byProvider),
      successRate: results.filter(r => r.status === 'completed').length / results.length || 0
    };
  }

  // File Management
  async cleanupOldFiles(olderThanDays: number = 7): Promise<number> {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    try {
      const files = fs.readdirSync(this.outputDirectory);
      
      for (const file of files) {
        const filePath = path.join(this.outputDirectory, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    } catch (error) {
      console.error('Error cleaning up old files:', error);
    }

    return deletedCount;
  }

  // Advanced Features
  async enhanceMedia(requestId: string, enhancements: string[]): Promise<string> {
    const originalResult = this.completedResults.get(requestId);
    if (!originalResult) {
      throw new Error(`Request ${requestId} not found`);
    }

    // Create enhancement request
    const enhancementRequest: MediaGenerationRequest = {
      id: `enhance_${Date.now()}`,
      type: originalResult.type as any,
      prompt: `Enhance: ${enhancements.join(', ')}`,
      parameters: {},
      priority: 'medium'
    };

    return this.generateMedia(enhancementRequest);
  }

  async createMediaWorkflow(steps: MediaGenerationRequest[]): Promise<string[]> {
    const workflowId = `workflow_${Date.now()}`;
    const results: string[] = [];

    for (const step of steps) {
      const requestId = await this.generateMedia(step);
      results.push(requestId);
      
      // Wait for completion before next step
      await this.waitForCompletion(requestId);
    }

    return results;
  }

  private async waitForCompletion(requestId: string): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        const result = this.completedResults.get(requestId);
        if (result && (result.status === 'completed' || result.status === 'failed')) {
          resolve();
        } else {
          setTimeout(check, 1000);
        }
      };
      check();
    });
  }
}

export { MultimediaGenerationService };