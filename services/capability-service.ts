
import fs from 'fs';
import path from 'path';

export class CapabilityService {
  private matrix: any;
  
  constructor() {
    this.loadMatrix();
  }
  
  private loadMatrix() {
    const matrixPath = path.join(__dirname, '../capabilities/capability-matrix.json');
    this.matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
  }
  
  getCapabilities() {
    return {
      totalProviders: this.matrix.totalProviders,
      totalModels: this.matrix.totalModels,
      providers: Object.keys(this.matrix.providers),
      lastUpdated: this.matrix.lastUpdated
    };
  }
  
  getRedundancyChain(type: string) {
    return this.matrix.redundancyChains[type] || this.matrix.redundancyChains['high-quality'];
  }
  
  getModelsByProvider(provider: string) {
    return this.matrix.providers[provider]?.models || [];
  }
  
  findOptimalModel(criteria: any) {
    // Intelligent model selection based on criteria
    const providers = Object.values(this.matrix.providers);
    let bestModel = null;
    let bestScore = 0;
    
    providers.forEach((provider: any) => {
      provider.models.forEach((model: any) => {
        let score = 0;
        
        // Score based on quality
        score += model.performance.qualityScore * 0.4;
        
        // Score based on latency (lower is better)
        score += (1 - (model.performance.p50Latency / 5000)) * 0.3;
        
        // Score based on cost (lower is better)
        score += (1 - (model.pricing.outputTokens / 0.02)) * 0.2;
        
        // Score based on reliability
        score += model.performance.reliability * 0.1;
        
        if (score > bestScore) {
          bestScore = score;
          bestModel = { ...model, provider: provider.name };
        }
      });
    });
    
    return bestModel;
  }
}

export const capabilityService = new CapabilityService();
