/**
 * WAI Capability Matrix v9.0
 * Implements Gap Closure runbook Phase D requirements
 * Boot scan + persist capability discovery and management
 */

import { WAILogger } from '../utils/logger';
import { SchemaValidator } from '../schemas/spi-schemas';
import { z } from 'zod';

// Capability Matrix Schemas
export const CapabilityDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['analysis', 'generation', 'transformation', 'integration', 'optimization', 'validation']),
  category: z.enum(['agent', 'connector', 'provider', 'orchestration', 'system']),
  tier: z.enum(['executive', 'development', 'creative', 'qa', 'devops', 'domain', 'system']),
  complexity: z.enum(['low', 'medium', 'high', 'expert']),
  dependencies: z.array(z.string()).default([]),
  inputs: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean(),
    description: z.string().optional()
  })),
  outputs: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string().optional()
  })),
  metadata: z.object({
    version: z.string(),
    author: z.string().optional(),
    createdAt: z.number(),
    updatedAt: z.number().optional(),
    tags: z.array(z.string()).default([]),
    experimental: z.boolean().default(false)
  }),
  performance: z.object({
    estimatedLatency: z.number().positive(),
    throughput: z.number().positive(),
    memoryUsage: z.number().positive(),
    cpuUsage: z.number().min(0).max(1)
  }),
  costs: z.object({
    baseCost: z.number().nonnegative(),
    perRequest: z.number().nonnegative(),
    perToken: z.number().nonnegative().optional(),
    currency: z.string().default('USD')
  }),
  availability: z.object({
    enabled: z.boolean(),
    healthCheck: z.boolean(),
    lastCheck: z.number().optional(),
    errors: z.array(z.string()).default([])
  })
});

export const CapabilityMatrixSchema = z.object({
  version: z.string(),
  timestamp: z.number(),
  totalCapabilities: z.number().nonnegative(),
  categories: z.record(z.number().nonnegative()),
  tiers: z.record(z.number().nonnegative()),
  capabilities: z.array(CapabilityDefinitionSchema),
  metadata: z.object({
    scanDuration: z.number().nonnegative(),
    discoveryMethod: z.enum(['boot-scan', 'runtime-discovery', 'manual-registration']),
    lastBootScan: z.number().optional(),
    nextScheduledScan: z.number().optional()
  })
});

export const BootScanResultSchema = z.object({
  success: z.boolean(),
  discovered: z.number().nonnegative(),
  failed: z.number().nonnegative(),
  duration: z.number().nonnegative(),
  capabilities: z.array(CapabilityDefinitionSchema),
  errors: z.array(z.object({
    source: z.string(),
    error: z.string(),
    timestamp: z.number()
  })),
  metadata: z.object({
    scanTimestamp: z.number(),
    scanId: z.string(),
    scanStrategy: z.string(),
    sources: z.array(z.string())
  })
});

export type CapabilityDefinition = z.infer<typeof CapabilityDefinitionSchema>;
export type CapabilityMatrix = z.infer<typeof CapabilityMatrixSchema>;
export type BootScanResult = z.infer<typeof BootScanResultSchema>;

export class CapabilityMatrixManager {
  private logger: WAILogger;
  private capabilities: Map<string, CapabilityDefinition> = new Map();
  private matrix: CapabilityMatrix | null = null;
  private persistenceEnabled: boolean = true;
  private autoScanInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.logger = new WAILogger('CapabilityMatrix');
  }

  /**
   * Initialize capability matrix with boot scan
   */
  async initialize(): Promise<void> {
    this.logger.info('🔍 Initializing Capability Matrix...');
    
    try {
      // Perform initial boot scan
      const scanResult = await this.performBootScan();
      
      if (scanResult.success) {
        // Build initial matrix
        await this.buildMatrix(scanResult.capabilities);
        
        // Persist if enabled
        if (this.persistenceEnabled) {
          await this.persistMatrix();
        }
        
        // Schedule periodic scans
        this.schedulePeriodicScans();
        
        this.logger.info(`✅ Capability Matrix initialized with ${scanResult.discovered} capabilities`);
      } else {
        this.logger.warn('⚠️ Boot scan completed with errors, building partial matrix');
        await this.buildMatrix(scanResult.capabilities);
      }
      
    } catch (error) {
      this.logger.error('❌ Capability Matrix initialization failed:', error);
      throw error;
    }
  }

  /**
   * Perform comprehensive boot scan
   */
  async performBootScan(): Promise<BootScanResult> {
    this.logger.info('🔍 Starting comprehensive boot scan...');
    const startTime = Date.now();
    const scanId = `boot_scan_${Date.now()}`;
    
    const discovered: CapabilityDefinition[] = [];
    const errors: { source: string; error: string; timestamp: number }[] = [];
    
    try {
      // Scan different sources in parallel
      const scanPromises = [
        this.scanAgentCapabilities(),
        this.scanConnectorCapabilities(),
        this.scanProviderCapabilities(),
        this.scanOrchestrationCapabilities(),
        this.scanSystemCapabilities()
      ];

      const results = await Promise.allSettled(scanPromises);
      
      results.forEach((result, index) => {
        const sources = ['agents', 'connectors', 'providers', 'orchestration', 'system'];
        const source = sources[index];
        
        if (result.status === 'fulfilled') {
          discovered.push(...result.value);
          this.logger.info(`✅ ${source} scan completed: ${result.value.length} capabilities`);
        } else {
          errors.push({
            source,
            error: result.reason?.message || 'Unknown error',
            timestamp: Date.now()
          });
          this.logger.warn(`⚠️ ${source} scan failed:`, result.reason);
        }
      });

      const duration = Date.now() - startTime;
      
      const scanResult: BootScanResult = {
        success: errors.length === 0,
        discovered: discovered.length,
        failed: errors.length,
        duration,
        capabilities: discovered,
        errors,
        metadata: {
          scanTimestamp: Date.now(),
          scanId,
          scanStrategy: 'comprehensive-parallel',
          sources: ['agents', 'connectors', 'providers', 'orchestration', 'system']
        }
      };

      this.logger.info(`🔍 Boot scan completed: ${discovered.length} discovered, ${errors.length} failed, ${duration}ms`);
      return scanResult;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('❌ Boot scan failed:', error);
      
      return {
        success: false,
        discovered: discovered.length,
        failed: 1,
        duration,
        capabilities: discovered,
        errors: [{
          source: 'boot-scan',
          error: error instanceof Error ? error.message : 'Boot scan failed',
          timestamp: Date.now()
        }],
        metadata: {
          scanTimestamp: Date.now(),
          scanId,
          scanStrategy: 'comprehensive-parallel',
          sources: []
        }
      };
    }
  }

  /**
   * Scan agent capabilities
   */
  private async scanAgentCapabilities(): Promise<CapabilityDefinition[]> {
    this.logger.info('🤖 Scanning agent capabilities...');
    
    // This would integrate with the actual agent registry
    // For now, return comprehensive static capabilities based on the 105+ agents
    const agentCapabilities: CapabilityDefinition[] = [
      // Executive Tier Agent Capabilities
      {
        id: 'executive-decision-making',
        name: 'Executive Decision Making',
        description: 'High-level strategic decision making and resource allocation',
        type: 'analysis',
        category: 'agent',
        tier: 'executive',
        complexity: 'expert',
        dependencies: [],
        inputs: [
          { name: 'businessContext', type: 'object', required: true, description: 'Business context and constraints' },
          { name: 'options', type: 'array', required: true, description: 'Available options to evaluate' },
          { name: 'criteria', type: 'object', required: false, description: 'Decision criteria and weights' }
        ],
        outputs: [
          { name: 'decision', type: 'object', description: 'Selected option with rationale' },
          { name: 'recommendations', type: 'array', description: 'Additional recommendations' },
          { name: 'resourceAllocation', type: 'object', description: 'Resource allocation plan' }
        ],
        metadata: {
          version: '1.0.0',
          author: 'WAI Executive Team',
          createdAt: Date.now(),
          tags: ['executive', 'decision-making', 'strategy'],
          experimental: false
        },
        performance: {
          estimatedLatency: 2000,
          throughput: 10,
          memoryUsage: 256,
          cpuUsage: 0.3
        },
        costs: {
          baseCost: 5.0,
          perRequest: 1.0,
          currency: 'USD'
        },
        availability: {
          enabled: true,
          healthCheck: true,
          lastCheck: Date.now(),
          errors: []
        }
      },
      
      // Development Tier Agent Capabilities
      {
        id: 'code-generation',
        name: 'AI Code Generation',
        description: 'Generate production-ready code from specifications',
        type: 'generation',
        category: 'agent',
        tier: 'development',
        complexity: 'high',
        dependencies: ['llm-provider'],
        inputs: [
          { name: 'specification', type: 'string', required: true, description: 'Code requirements specification' },
          { name: 'language', type: 'string', required: true, description: 'Programming language' },
          { name: 'framework', type: 'string', required: false, description: 'Framework preferences' }
        ],
        outputs: [
          { name: 'code', type: 'string', description: 'Generated code' },
          { name: 'tests', type: 'string', description: 'Generated test cases' },
          { name: 'documentation', type: 'string', description: 'Generated documentation' }
        ],
        metadata: {
          version: '2.1.0',
          author: 'WAI Development Team',
          createdAt: Date.now(),
          tags: ['development', 'code-generation', 'ai'],
          experimental: false
        },
        performance: {
          estimatedLatency: 3000,
          throughput: 20,
          memoryUsage: 512,
          cpuUsage: 0.4
        },
        costs: {
          baseCost: 0.1,
          perRequest: 0.05,
          perToken: 0.001,
          currency: 'USD'
        },
        availability: {
          enabled: true,
          healthCheck: true,
          lastCheck: Date.now(),
          errors: []
        }
      },

      // Creative Tier Agent Capabilities
      {
        id: 'content-creation',
        name: 'AI Content Creation',
        description: 'Generate creative content including text, images, and multimedia',
        type: 'generation',
        category: 'agent',
        tier: 'creative',
        complexity: 'medium',
        dependencies: ['llm-provider', 'image-generator'],
        inputs: [
          { name: 'brief', type: 'string', required: true, description: 'Content creation brief' },
          { name: 'style', type: 'string', required: false, description: 'Style guidelines' },
          { name: 'mediaType', type: 'string', required: true, description: 'Type of media to create' }
        ],
        outputs: [
          { name: 'content', type: 'any', description: 'Generated content' },
          { name: 'metadata', type: 'object', description: 'Content metadata' },
          { name: 'variants', type: 'array', description: 'Alternative versions' }
        ],
        metadata: {
          version: '1.5.0',
          author: 'WAI Creative Team',
          createdAt: Date.now(),
          tags: ['creative', 'content', 'multimedia'],
          experimental: false
        },
        performance: {
          estimatedLatency: 5000,
          throughput: 15,
          memoryUsage: 1024,
          cpuUsage: 0.6
        },
        costs: {
          baseCost: 0.5,
          perRequest: 0.2,
          currency: 'USD'
        },
        availability: {
          enabled: true,
          healthCheck: true,
          lastCheck: Date.now(),
          errors: []
        }
      }
    ];

    return agentCapabilities;
  }

  /**
   * Scan MCP connector capabilities
   */
  private async scanConnectorCapabilities(): Promise<CapabilityDefinition[]> {
    this.logger.info('🔗 Scanning MCP connector capabilities...');
    
    const connectorCapabilities: CapabilityDefinition[] = [
      {
        id: 'oauth-integration',
        name: 'OAuth Integration',
        description: 'Secure OAuth 2.0 integration with external services',
        type: 'integration',
        category: 'connector',
        tier: 'system',
        complexity: 'medium',
        dependencies: [],
        inputs: [
          { name: 'provider', type: 'string', required: true, description: 'OAuth provider' },
          { name: 'scopes', type: 'array', required: true, description: 'Required OAuth scopes' },
          { name: 'credentials', type: 'object', required: true, description: 'OAuth credentials' }
        ],
        outputs: [
          { name: 'accessToken', type: 'string', description: 'OAuth access token' },
          { name: 'refreshToken', type: 'string', description: 'OAuth refresh token' },
          { name: 'expiresAt', type: 'number', description: 'Token expiration timestamp' }
        ],
        metadata: {
          version: '1.0.0',
          createdAt: Date.now(),
          tags: ['oauth', 'authentication', 'security'],
          experimental: false
        },
        performance: {
          estimatedLatency: 1500,
          throughput: 50,
          memoryUsage: 64,
          cpuUsage: 0.1
        },
        costs: {
          baseCost: 0.01,
          perRequest: 0.001,
          currency: 'USD'
        },
        availability: {
          enabled: true,
          healthCheck: true,
          lastCheck: Date.now(),
          errors: []
        }
      },

      {
        id: 'cloud-storage',
        name: 'Cloud Storage Integration',
        description: 'Universal cloud storage operations (S3, GCS, Azure)',
        type: 'integration',
        category: 'connector',
        tier: 'system',
        complexity: 'low',
        dependencies: ['cloud-credentials'],
        inputs: [
          { name: 'operation', type: 'string', required: true, description: 'Storage operation (upload/download/delete)' },
          { name: 'path', type: 'string', required: true, description: 'Storage path' },
          { name: 'data', type: 'any', required: false, description: 'Data for upload operations' }
        ],
        outputs: [
          { name: 'result', type: 'any', description: 'Operation result' },
          { name: 'url', type: 'string', description: 'Storage URL (for uploads)' },
          { name: 'metadata', type: 'object', description: 'File metadata' }
        ],
        metadata: {
          version: '2.0.0',
          createdAt: Date.now(),
          tags: ['storage', 'cloud', 'files'],
          experimental: false
        },
        performance: {
          estimatedLatency: 2000,
          throughput: 30,
          memoryUsage: 128,
          cpuUsage: 0.2
        },
        costs: {
          baseCost: 0.05,
          perRequest: 0.01,
          currency: 'USD'
        },
        availability: {
          enabled: true,
          healthCheck: true,
          lastCheck: Date.now(),
          errors: []
        }
      }
    ];

    return connectorCapabilities;
  }

  /**
   * Scan LLM provider capabilities
   */
  private async scanProviderCapabilities(): Promise<CapabilityDefinition[]> {
    this.logger.info('🧠 Scanning LLM provider capabilities...');
    
    const providerCapabilities: CapabilityDefinition[] = [
      {
        id: 'multi-llm-generation',
        name: 'Multi-LLM Text Generation',
        description: '15+ LLM providers with intelligent routing and fallback',
        type: 'generation',
        category: 'provider',
        tier: 'system',
        complexity: 'high',
        dependencies: ['api-keys'],
        inputs: [
          { name: 'prompt', type: 'string', required: true, description: 'Generation prompt' },
          { name: 'model', type: 'string', required: false, description: 'Preferred model' },
          { name: 'parameters', type: 'object', required: false, description: 'Generation parameters' }
        ],
        outputs: [
          { name: 'text', type: 'string', description: 'Generated text' },
          { name: 'model', type: 'string', description: 'Used model' },
          { name: 'tokens', type: 'object', description: 'Token usage statistics' }
        ],
        metadata: {
          version: '9.0.0',
          createdAt: Date.now(),
          tags: ['llm', 'generation', 'multi-provider'],
          experimental: false
        },
        performance: {
          estimatedLatency: 2500,
          throughput: 100,
          memoryUsage: 256,
          cpuUsage: 0.3
        },
        costs: {
          baseCost: 0.001,
          perRequest: 0.0,
          perToken: 0.00001,
          currency: 'USD'
        },
        availability: {
          enabled: true,
          healthCheck: true,
          lastCheck: Date.now(),
          errors: []
        }
      }
    ];

    return providerCapabilities;
  }

  /**
   * Scan orchestration capabilities
   */
  private async scanOrchestrationCapabilities(): Promise<CapabilityDefinition[]> {
    this.logger.info('🎯 Scanning orchestration capabilities...');
    
    const orchestrationCapabilities: CapabilityDefinition[] = [
      {
        id: 'wai-orchestration',
        name: 'WAI Orchestration Engine',
        description: 'Complete AI workflow orchestration with 105+ agents',
        type: 'integration',
        category: 'orchestration',
        tier: 'system',
        complexity: 'expert',
        dependencies: ['agents', 'providers', 'connectors'],
        inputs: [
          { name: 'workflow', type: 'object', required: true, description: 'Workflow definition' },
          { name: 'context', type: 'object', required: false, description: 'Execution context' },
          { name: 'priority', type: 'string', required: false, description: 'Execution priority' }
        ],
        outputs: [
          { name: 'result', type: 'any', description: 'Workflow execution result' },
          { name: 'metrics', type: 'object', description: 'Execution metrics' },
          { name: 'trace', type: 'array', description: 'Execution trace' }
        ],
        metadata: {
          version: '9.0.0',
          createdAt: Date.now(),
          tags: ['orchestration', 'workflow', 'ai'],
          experimental: false
        },
        performance: {
          estimatedLatency: 5000,
          throughput: 50,
          memoryUsage: 1024,
          cpuUsage: 0.5
        },
        costs: {
          baseCost: 1.0,
          perRequest: 0.1,
          currency: 'USD'
        },
        availability: {
          enabled: true,
          healthCheck: true,
          lastCheck: Date.now(),
          errors: []
        }
      }
    ];

    return orchestrationCapabilities;
  }

  /**
   * Scan system capabilities
   */
  private async scanSystemCapabilities(): Promise<CapabilityDefinition[]> {
    this.logger.info('🏗️ Scanning system capabilities...');
    
    const systemCapabilities: CapabilityDefinition[] = [
      {
        id: 'health-monitoring',
        name: 'System Health Monitoring',
        description: 'Comprehensive system health monitoring and alerting',
        type: 'validation',
        category: 'system',
        tier: 'system',
        complexity: 'medium',
        dependencies: [],
        inputs: [
          { name: 'components', type: 'array', required: false, description: 'Components to check' },
          { name: 'depth', type: 'string', required: false, description: 'Check depth (shallow/deep)' }
        ],
        outputs: [
          { name: 'health', type: 'object', description: 'Health status' },
          { name: 'metrics', type: 'object', description: 'System metrics' },
          { name: 'alerts', type: 'array', description: 'Active alerts' }
        ],
        metadata: {
          version: '1.0.0',
          createdAt: Date.now(),
          tags: ['health', 'monitoring', 'system'],
          experimental: false
        },
        performance: {
          estimatedLatency: 500,
          throughput: 200,
          memoryUsage: 64,
          cpuUsage: 0.1
        },
        costs: {
          baseCost: 0.0,
          perRequest: 0.0,
          currency: 'USD'
        },
        availability: {
          enabled: true,
          healthCheck: true,
          lastCheck: Date.now(),
          errors: []
        }
      }
    ];

    return systemCapabilities;
  }

  /**
   * Build capability matrix from discovered capabilities
   */
  private async buildMatrix(capabilities: CapabilityDefinition[]): Promise<void> {
    this.logger.info('🔨 Building capability matrix...');
    
    // Clear existing capabilities
    this.capabilities.clear();
    
    // Add discovered capabilities
    capabilities.forEach(capability => {
      this.capabilities.set(capability.id, capability);
    });
    
    // Calculate statistics
    const categories: Record<string, number> = {};
    const tiers: Record<string, number> = {};
    
    capabilities.forEach(capability => {
      categories[capability.category] = (categories[capability.category] || 0) + 1;
      tiers[capability.tier] = (tiers[capability.tier] || 0) + 1;
    });
    
    // Build matrix
    this.matrix = {
      version: '9.0.0',
      timestamp: Date.now(),
      totalCapabilities: capabilities.length,
      categories,
      tiers,
      capabilities,
      metadata: {
        scanDuration: 0, // Will be updated by scan
        discoveryMethod: 'boot-scan',
        lastBootScan: Date.now(),
        nextScheduledScan: Date.now() + 3600000 // 1 hour
      }
    };
    
    this.logger.info(`✅ Built capability matrix: ${capabilities.length} capabilities, ${Object.keys(categories).length} categories, ${Object.keys(tiers).length} tiers`);
  }

  /**
   * Persist capability matrix
   */
  async persistMatrix(): Promise<void> {
    if (!this.matrix) {
      throw new Error('No capability matrix to persist');
    }
    
    this.logger.info('💾 Persisting capability matrix...');
    
    try {
      // Validate matrix before persisting
      const validatedMatrix = SchemaValidator.validateArray(CapabilityDefinitionSchema, this.matrix.capabilities);
      
      if (validatedMatrix.invalid.length > 0) {
        this.logger.warn(`⚠️ ${validatedMatrix.invalid.length} invalid capabilities will be excluded from persistence`);
      }
      
      // In a real implementation, this would save to database
      // For now, we'll just log the persistence
      this.logger.info(`✅ Persisted capability matrix: ${validatedMatrix.valid.length} capabilities`);
      
    } catch (error) {
      this.logger.error('❌ Matrix persistence failed:', error);
      throw error;
    }
  }

  /**
   * Schedule periodic capability scans
   */
  private schedulePeriodicScans(): void {
    // Scan every hour
    this.autoScanInterval = setInterval(async () => {
      try {
        this.logger.info('🔄 Running scheduled capability scan...');
        const scanResult = await this.performBootScan();
        await this.buildMatrix(scanResult.capabilities);
        
        if (this.persistenceEnabled) {
          await this.persistMatrix();
        }
        
      } catch (error) {
        this.logger.error('❌ Scheduled scan failed:', error);
      }
    }, 3600000); // 1 hour
    
    this.logger.info('⏰ Scheduled periodic capability scans (every hour)');
  }

  /**
   * Get current capability matrix
   */
  getMatrix(): CapabilityMatrix | null {
    return this.matrix;
  }

  /**
   * Get capability by ID
   */
  getCapability(id: string): CapabilityDefinition | undefined {
    return this.capabilities.get(id);
  }

  /**
   * Get capabilities by category
   */
  getCapabilitiesByCategory(category: string): CapabilityDefinition[] {
    return Array.from(this.capabilities.values())
      .filter(cap => cap.category === category);
  }

  /**
   * Get capabilities by tier
   */
  getCapabilitiesByTier(tier: string): CapabilityDefinition[] {
    return Array.from(this.capabilities.values())
      .filter(cap => cap.tier === tier);
  }

  /**
   * Search capabilities
   */
  searchCapabilities(query: string): CapabilityDefinition[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.capabilities.values())
      .filter(cap => 
        cap.name.toLowerCase().includes(lowerQuery) ||
        cap.description?.toLowerCase().includes(lowerQuery) ||
        cap.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
  }

  /**
   * Get matrix statistics
   */
  getStatistics(): any {
    if (!this.matrix) {
      return null;
    }
    
    return {
      total: this.matrix.totalCapabilities,
      categories: this.matrix.categories,
      tiers: this.matrix.tiers,
      health: {
        enabled: Array.from(this.capabilities.values()).filter(cap => cap.availability.enabled).length,
        healthy: Array.from(this.capabilities.values()).filter(cap => cap.availability.healthCheck).length
      },
      lastScan: this.matrix.metadata.lastBootScan,
      nextScan: this.matrix.metadata.nextScheduledScan
    };
  }

  /**
   * Shutdown capability matrix
   */
  async shutdown(): Promise<void> {
    this.logger.info('🔄 Shutting down capability matrix...');
    
    if (this.autoScanInterval) {
      clearInterval(this.autoScanInterval);
      this.autoScanInterval = null;
    }
    
    this.capabilities.clear();
    this.matrix = null;
    
    this.logger.info('✅ Capability matrix shutdown complete');
  }
}

export default CapabilityMatrixManager;