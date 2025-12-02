/**
 * Dyad Local AI Integration Service
 * Provides local AI model deployment and customization capabilities
 * for sensitive projects requiring offline AI development support
 */

import { Request, Response } from 'express';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface LocalModelConfig {
  id: string;
  name: string;
  modelPath: string;
  type: 'llm' | 'embedding' | 'vision' | 'audio';
  parameters: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
  };
  capabilities: string[];
  memoryRequirements: {
    ram: string;
    vram: string;
  };
  status: 'available' | 'loading' | 'ready' | 'error';
}

interface LocalAIRequest {
  modelId: string;
  prompt: string;
  parameters?: any;
  context?: any;
  streaming?: boolean;
}

interface LocalAIResponse {
  success: boolean;
  response?: string;
  error?: string;
  modelUsed: string;
  metadata: {
    tokensGenerated: number;
    inferenceTime: number;
    memoryUsed: string;
  };
}

class DyadLocalAIService {
  private models: Map<string, LocalModelConfig> = new Map();
  private activeModels: Map<string, any> = new Map();
  private modelsDirectory: string;

  constructor() {
    this.modelsDirectory = process.env.LOCAL_MODELS_PATH || './local_models';
    this.initializeLocalModels();
  }

  private async initializeLocalModels() {
    try {
      // Ensure models directory exists
      await fs.mkdir(this.modelsDirectory, { recursive: true });
      
      // Initialize popular local models
      await this.registerDefaultModels();
      
      console.log('🏠 Dyad Local AI Service initialized with offline model support');
    } catch (error) {
      console.error('❌ Failed to initialize Dyad Local AI Service:', error);
    }
  }

  private async registerDefaultModels() {
    // Code Llama for code generation
    this.registerModel({
      id: 'code-llama-7b',
      name: 'Code Llama 7B',
      modelPath: path.join(this.modelsDirectory, 'code-llama-7b-instruct.gguf'),
      type: 'llm',
      parameters: {
        temperature: 0.1,
        maxTokens: 4096,
        topP: 0.95,
        topK: 40
      },
      capabilities: ['code-generation', 'code-completion', 'debugging', 'refactoring'],
      memoryRequirements: {
        ram: '8GB',
        vram: '6GB'
      },
      status: 'available'
    });

    // Mistral 7B for general tasks
    this.registerModel({
      id: 'mistral-7b',
      name: 'Mistral 7B Instruct',
      modelPath: path.join(this.modelsDirectory, 'mistral-7b-instruct.gguf'),
      type: 'llm',
      parameters: {
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.9,
        topK: 50
      },
      capabilities: ['general-chat', 'analysis', 'writing', 'reasoning'],
      memoryRequirements: {
        ram: '8GB',
        vram: '6GB'
      },
      status: 'available'
    });

    // CodeT5 for code understanding
    this.registerModel({
      id: 'codet5-small',
      name: 'CodeT5 Small',
      modelPath: path.join(this.modelsDirectory, 'codet5-small.gguf'),
      type: 'llm',
      parameters: {
        temperature: 0.2,
        maxTokens: 1024,
        topP: 0.9
      },
      capabilities: ['code-understanding', 'documentation', 'code-summarization'],
      memoryRequirements: {
        ram: '4GB',
        vram: '3GB'
      },
      status: 'available'
    });

    // Local embedding model
    this.registerModel({
      id: 'all-minilm-l6-v2',
      name: 'All-MiniLM-L6-v2',
      modelPath: path.join(this.modelsDirectory, 'all-minilm-l6-v2.gguf'),
      type: 'embedding',
      parameters: {},
      capabilities: ['text-embedding', 'semantic-search', 'similarity'],
      memoryRequirements: {
        ram: '2GB',
        vram: '1GB'
      },
      status: 'available'
    });

    console.log(`🤖 Registered ${this.models.size} local AI models`);
  }

  private registerModel(config: LocalModelConfig) {
    this.models.set(config.id, config);
  }

  async loadModel(modelId: string): Promise<boolean> {
    try {
      const model = this.models.get(modelId);
      if (!model) {
        throw new Error(`Model ${modelId} not found`);
      }

      // Check if model is already loaded
      if (this.activeModels.has(modelId)) {
        return true;
      }

      // Update status to loading
      model.status = 'loading';

      // Check if model file exists
      try {
        await fs.access(model.modelPath);
      } catch {
        // Model file doesn't exist, provide download instructions
        console.log(`📥 Model ${modelId} not found locally. Please download it first.`);
        model.status = 'error';
        return false;
      }

      // Load model using llama.cpp or similar
      const modelProcess = await this.startModelServer(model);
      this.activeModels.set(modelId, modelProcess);
      
      model.status = 'ready';
      console.log(`✅ Local model ${modelId} loaded successfully`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to load model ${modelId}:`, error);
      const model = this.models.get(modelId);
      if (model) {
        model.status = 'error';
      }
      return false;
    }
  }

  private async startModelServer(model: LocalModelConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      // Use llama.cpp server for GGUF models
      const serverProcess = spawn('llama-server', [
        '-m', model.modelPath,
        '--port', '8080',
        '--host', '127.0.0.1',
        '-c', model.parameters.maxTokens?.toString() || '2048',
        '--temp', model.parameters.temperature?.toString() || '0.7'
      ]);

      serverProcess.stdout.on('data', (data) => {
        console.log(`Model ${model.id} output:`, data.toString());
        if (data.toString().includes('HTTP server listening')) {
          resolve(serverProcess);
        }
      });

      serverProcess.stderr.on('data', (data) => {
        console.error(`Model ${model.id} error:`, data.toString());
      });

      serverProcess.on('error', (error) => {
        reject(error);
      });

      setTimeout(() => {
        reject(new Error('Model server startup timeout'));
      }, 30000);
    });
  }

  async generateResponse(request: LocalAIRequest): Promise<LocalAIResponse> {
    const startTime = Date.now();
    
    try {
      const model = this.models.get(request.modelId);
      if (!model) {
        return {
          success: false,
          error: `Model ${request.modelId} not found`,
          modelUsed: request.modelId,
          metadata: {
            tokensGenerated: 0,
            inferenceTime: 0,
            memoryUsed: '0MB'
          }
        };
      }

      // Ensure model is loaded
      if (!this.activeModels.has(request.modelId)) {
        const loaded = await this.loadModel(request.modelId);
        if (!loaded) {
          return {
            success: false,
            error: `Failed to load model ${request.modelId}`,
            modelUsed: request.modelId,
            metadata: {
              tokensGenerated: 0,
              inferenceTime: 0,
              memoryUsed: '0MB'
            }
          };
        }
      }

      // Generate response using local model
      const response = await this.callLocalModel(model, request);
      
      return {
        success: true,
        response: response.text,
        modelUsed: request.modelId,
        metadata: {
          tokensGenerated: response.tokensGenerated,
          inferenceTime: Date.now() - startTime,
          memoryUsed: response.memoryUsed
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        modelUsed: request.modelId,
        metadata: {
          tokensGenerated: 0,
          inferenceTime: Date.now() - startTime,
          memoryUsed: '0MB'
        }
      };
    }
  }

  private async callLocalModel(model: LocalModelConfig, request: LocalAIRequest): Promise<any> {
    // Call local model API (llama.cpp server)
    const response = await fetch('http://127.0.0.1:8080/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        n_predict: model.parameters.maxTokens || 2048,
        temperature: request.parameters?.temperature || model.parameters.temperature || 0.7,
        top_p: request.parameters?.topP || model.parameters.topP || 0.9,
        top_k: request.parameters?.topK || model.parameters.topK || 50,
        stream: request.streaming || false
      })
    });

    if (!response.ok) {
      throw new Error(`Local model API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      text: result.content || '',
      tokensGenerated: result.tokens_predicted || 0,
      memoryUsed: '256MB' // Estimate
    };
  }

  async downloadModel(modelId: string): Promise<boolean> {
    try {
      const model = this.models.get(modelId);
      if (!model) {
        throw new Error(`Model ${modelId} not found`);
      }

      console.log(`📥 Starting download for model ${modelId}...`);
      
      // Download model from HuggingFace or other sources
      const downloadUrl = this.getModelDownloadUrl(modelId);
      if (!downloadUrl) {
        throw new Error(`No download URL available for model ${modelId}`);
      }

      // Use curl or wget to download
      await execAsync(`curl -L "${downloadUrl}" -o "${model.modelPath}"`);
      
      console.log(`✅ Model ${modelId} downloaded successfully`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to download model ${modelId}:`, error);
      return false;
    }
  }

  private getModelDownloadUrl(modelId: string): string | null {
    const downloadUrls: Record<string, string> = {
      'code-llama-7b': 'https://huggingface.co/TheBloke/CodeLlama-7B-Instruct-GGUF/resolve/main/codellama-7b-instruct.q4_k_m.gguf',
      'mistral-7b': 'https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF/resolve/main/mistral-7b-instruct-v0.1.q4_k_m.gguf',
      'codet5-small': 'https://huggingface.co/microsoft/CodeT5-small/resolve/main/pytorch_model.bin',
      'all-minilm-l6-v2': 'https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/pytorch_model.bin'
    };
    
    return downloadUrls[modelId] || null;
  }

  getAvailableModels() {
    return Array.from(this.models.values()).map(model => ({
      id: model.id,
      name: model.name,
      type: model.type,
      capabilities: model.capabilities,
      memoryRequirements: model.memoryRequirements,
      status: model.status
    }));
  }

  getModelStatus(modelId: string) {
    const model = this.models.get(modelId);
    return model ? {
      id: model.id,
      status: model.status,
      isLoaded: this.activeModels.has(modelId)
    } : null;
  }

  async unloadModel(modelId: string): Promise<boolean> {
    try {
      const modelProcess = this.activeModels.get(modelId);
      if (modelProcess) {
        modelProcess.kill();
        this.activeModels.delete(modelId);
        
        const model = this.models.get(modelId);
        if (model) {
          model.status = 'available';
        }
        
        console.log(`🔄 Model ${modelId} unloaded`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Failed to unload model ${modelId}:`, error);
      return false;
    }
  }
}

// Export the service
export const dyadLocalAI = new DyadLocalAIService();

// Express routes for Dyad Local AI
export function registerDyadLocalAIRoutes(app: any) {
  
  // Generate response using local model
  app.post('/api/dyad-local-ai/generate', async (req: Request, res: Response) => {
    try {
      const request: LocalAIRequest = req.body;
      const result = await dyadLocalAI.generateResponse(request);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get available models
  app.get('/api/dyad-local-ai/models', async (req: Request, res: Response) => {
    try {
      const models = dyadLocalAI.getAvailableModels();
      res.json({
        success: true,
        models,
        totalCount: models.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Load model
  app.post('/api/dyad-local-ai/models/:modelId/load', async (req: Request, res: Response) => {
    try {
      const { modelId } = req.params;
      const success = await dyadLocalAI.loadModel(modelId);
      res.json({
        success,
        message: success ? `Model ${modelId} loaded successfully` : `Failed to load model ${modelId}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Unload model
  app.post('/api/dyad-local-ai/models/:modelId/unload', async (req: Request, res: Response) => {
    try {
      const { modelId } = req.params;
      const success = await dyadLocalAI.unloadModel(modelId);
      res.json({
        success,
        message: success ? `Model ${modelId} unloaded successfully` : `Failed to unload model ${modelId}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Download model
  app.post('/api/dyad-local-ai/models/:modelId/download', async (req: Request, res: Response) => {
    try {
      const { modelId } = req.params;
      const success = await dyadLocalAI.downloadModel(modelId);
      res.json({
        success,
        message: success ? `Model ${modelId} downloaded successfully` : `Failed to download model ${modelId}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get model status
  app.get('/api/dyad-local-ai/models/:modelId/status', async (req: Request, res: Response) => {
    try {
      const { modelId } = req.params;
      const status = dyadLocalAI.getModelStatus(modelId);
      if (status) {
        res.json({
          success: true,
          status
        });
      } else {
        res.status(404).json({
          success: false,
          error: `Model ${modelId} not found`
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  console.log('🏠 Dyad Local AI routes registered');
}