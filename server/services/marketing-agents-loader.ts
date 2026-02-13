/**
 * Marketing Agents Loader Service
 * Loads marketing agents from JSON file and database at runtime
 * WAI-SDK v3.1.1 compliant
 */

import fs from 'fs';
import path from 'path';

export interface MarketingAgent {
  id: string;
  name: string;
  version: string;
  tier: string;
  romaLevel: string;
  category: string;
  group: string;
  vertical: string;
  description: string;
  systemPrompt: string;
  capabilities: string[];
  tools: string[];
  protocols: string[];
  preferredModels: string[];
  fallbackModels: string[];
  operationModes?: {
    autonomous?: boolean;
    supervised?: boolean;
    collaborative?: boolean;
    swarm?: boolean;
    hierarchical?: boolean;
  };
  securityLevel?: string;
  reportsTo?: string[];
  manages?: string[];
  collaboratesWith?: string[];
  supportedLanguages?: string[];
  guardrails?: Record<string, boolean>;
  costOptimization?: {
    maxCostPerTask?: number;
    preferCheaperModels?: boolean;
    routineModel?: string;
    complexModel?: string;
  };
  cam2Monitoring?: {
    enabled: boolean;
    version: string;
    metrics: Record<string, boolean>;
    alertThresholds: { latencyMs: number; errorRatePercent: number; qualityScoreMin: number };
    realTimeStreaming: boolean;
    dashboardEndpoint: string;
    historyRetentionDays: number;
  };
  grpoConfig?: {
    enabled: boolean;
    version: string;
    continuousLearning: Record<string, boolean>;
    policyOptimization: Record<string, boolean>;
    trainingDataSources: string[];
    updateFrequency: string;
  };
  voiceAIConfig?: {
    enabled: boolean;
    twoWayStreaming: boolean;
    inputProviders: string[];
    outputProviders: string[];
    realtimeProtocol: string;
    streamingEndpoint: string;
    supportedLanguages: string[];
    features: Record<string, boolean>;
    latencyTargetMs: number;
  };
  enterpriseWiring?: {
    queenOrchestrator: { connected: boolean; taskDecomposition: boolean; algorithms: string[] };
    memoryIntegration: Record<string, boolean>;
    toolsIntegration: { mcpToolsAccess: boolean; toolCount: number; customToolsEnabled: boolean };
    orchestrationEngine: Record<string, boolean>;
    agentBreeding: { canSpawnSubagents: boolean; maxSubagents: number };
    humanInLoop: Record<string, boolean>;
    collectiveIntelligence: Record<string, boolean>;
  };
  peerMeshConfig?: {
    enabled: boolean;
    discoveryProtocol: string;
    meshTopology: string;
    loadBalancing: boolean;
    failover: boolean;
    maxPeers: number;
  };
  metrics?: Record<string, boolean>;
  status: string;
}

export interface AgentRegistry {
  metadata: {
    version: string;
    name: string;
    description: string;
    totalAgents: number;
    verticals: number;
    generatedAt: string;
    marketingVerticals: string[];
    supportedLanguages: number;
    romaCompliant: boolean;
    waiSdkVersion: string;
    costOptimizationEnabled: boolean;
  };
  tierSummary: Record<string, number>;
  verticalSummary: Array<{
    id: number;
    name: string;
    agentCount: number;
    romaLevels: string[];
  }>;
  agents: MarketingAgent[];
  configuration: {
    defaultModel: string;
    premiumModel: string;
    reasoningModel: string;
    costEffectiveModel?: string;
    maxConcurrentAgents: number;
    costOptimization: {
      enabled: boolean;
      routineTaskModel: string;
      complexTaskModel: string;
      routineTaskMaxCost: number;
      complexTaskMaxCost: number;
    };
    fallbackChain?: Array<{
      tier: number;
      models: string[];
    }>;
    guardrails?: Record<string, boolean>;
  };
}

class MarketingAgentsLoaderService {
  private registry: AgentRegistry | null = null;
  private agents: Map<string, MarketingAgent> = new Map();
  private isInitialized = false;
  private jsonFilePath: string;

  constructor() {
    this.jsonFilePath = path.join(process.cwd(), 'data', 'marketing-agents-registry.json');
  }

  /**
   * Initialize the agents loader - load from JSON file
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load from JSON file
      await this.loadFromJson();
      
      this.isInitialized = true;
      console.log(`📊 Marketing Agents Loader initialized`);
      console.log(`   Loaded ${this.agents.size} agents from registry`);
      console.log(`   WAI-SDK Version: ${this.registry?.metadata.waiSdkVersion}`);
    } catch (error) {
      console.error('Failed to initialize Marketing Agents Loader:', error);
      // Don't throw - allow server to continue
    }
  }

  /**
   * Load agents from JSON file
   */
  private async loadFromJson(): Promise<void> {
    try {
      if (!fs.existsSync(this.jsonFilePath)) {
        console.warn(`Marketing agents registry not found at ${this.jsonFilePath}`);
        return;
      }

      const jsonContent = fs.readFileSync(this.jsonFilePath, 'utf-8');
      this.registry = JSON.parse(jsonContent) as AgentRegistry;

      // Populate agents map
      for (const agent of this.registry.agents) {
        this.agents.set(agent.id, agent);
      }

      console.log(`   Loaded ${this.registry.agents.length} agents from JSON`);
    } catch (error) {
      console.error('Error loading agents from JSON:', error);
      throw error;
    }
  }

  /**
   * Get all agents
   */
  getAllAgents(): MarketingAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): MarketingAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get agents by vertical
   */
  getAgentsByVertical(vertical: string): MarketingAgent[] {
    return this.getAllAgents().filter(a => a.vertical === vertical);
  }

  /**
   * Get agents by tier
   */
  getAgentsByTier(tier: string): MarketingAgent[] {
    return this.getAllAgents().filter(a => a.tier === tier);
  }

  /**
   * Get agents by ROMA level
   */
  getAgentsByRomaLevel(level: string): MarketingAgent[] {
    return this.getAllAgents().filter(a => a.romaLevel === level);
  }

  /**
   * Get registry metadata
   */
  getMetadata(): AgentRegistry['metadata'] | null {
    return this.registry?.metadata || null;
  }

  /**
   * Get configuration
   */
  getConfiguration(): AgentRegistry['configuration'] | null {
    return this.registry?.configuration || null;
  }

  /**
   * Get vertical summary
   */
  getVerticalSummary(): AgentRegistry['verticalSummary'] | null {
    return this.registry?.verticalSummary || null;
  }

  /**
   * Get tier summary
   */
  getTierSummary(): AgentRegistry['tierSummary'] | null {
    return this.registry?.tierSummary || null;
  }

  /**
   * Get optimal model for a task based on configuration
   */
  getOptimalModel(taskComplexity: 'routine' | 'complex' | 'reasoning'): string {
    const config = this.getConfiguration();
    if (!config) return 'kimi-k2.5';

    switch (taskComplexity) {
      case 'routine':
        return config.costOptimization.routineTaskModel;
      case 'complex':
        return config.costOptimization.complexTaskModel;
      case 'reasoning':
        return config.reasoningModel;
      default:
        return config.defaultModel;
    }
  }

  /**
   * Get fallback models for a given tier
   */
  getFallbackModels(tier: number): string[] {
    const config = this.getConfiguration();
    if (!config) return ['kimi-k2.5'];

    const fallback = config.fallbackChain?.find(f => f.tier === tier);
    return fallback?.models || ['gemini-3-flash'];
  }

  /**
   * Reload agents from JSON file
   */
  async reload(): Promise<void> {
    this.isInitialized = false;
    this.agents.clear();
    this.registry = null;
    await this.initialize();
  }
}

// Export singleton instance
export const marketingAgentsLoader = new MarketingAgentsLoaderService();

// Auto-initialize on import
marketingAgentsLoader.initialize().catch(console.error);
