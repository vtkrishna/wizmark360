/**
 * WAI SPI JSON Schemas v9.0
 * Implements Gap Closure runbook Phase B requirements
 * Complete JSON schemas for all SPI contracts with validation
 */

import { z } from 'zod';

/**
 * Agent SPI Schemas
 */
export const AgentCapabilitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['analysis', 'generation', 'transformation', 'integration', 'optimization']),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
  complexity: z.enum(['low', 'medium', 'high']),
  estimatedTime: z.number().positive(),
  dependencies: z.array(z.string()).default([])
});

export const AgentCostsSchema = z.object({
  baseCost: z.number().nonnegative(),
  perRequest: z.number().nonnegative(),
  perToken: z.number().nonnegative().optional(),
  perMinute: z.number().nonnegative().optional(),
  currency: z.string().default('USD')
});

export const AgentManifestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string().min(1),
  tier: z.enum(['executive', 'development', 'creative', 'qa', 'devops', 'domain']),
  specialization: z.string().optional(),
  capabilities: z.array(AgentCapabilitySchema).min(1),
  readinessState: z.enum(['alpha', 'beta', 'ga']).default('alpha'),
  costs: AgentCostsSchema,
  requirements: z.object({
    memory: z.number().positive(),
    cpu: z.number().positive(),
    storage: z.number().positive().optional(),
    network: z.boolean().default(false)
  }),
  metadata: z.record(z.any()).default({})
});

export const AgentExecutionRequestSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  payload: z.any(),
  context: z.record(z.any()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  timeout: z.number().positive().optional(),
  retries: z.number().nonnegative().default(0)
});

export const AgentExecutionResponseSchema = z.object({
  success: z.boolean(),
  output: z.any(),
  metrics: z.object({
    executionTime: z.number().nonnegative(),
    tokensUsed: z.number().nonnegative().optional(),
    cost: z.number().nonnegative().optional(),
    quality: z.number().min(0).max(1).optional()
  }),
  error: z.string().optional(),
  warnings: z.array(z.string()).default([])
});

export const AgentHealthStatusSchema = z.object({
  healthy: z.boolean(),
  status: z.enum(['active', 'inactive', 'degraded', 'error']),
  lastCheck: z.number().positive(),
  errors: z.array(z.string()).default([]),
  metrics: z.object({
    uptime: z.number().nonnegative().optional(),
    requestCount: z.number().nonnegative().optional(),
    errorRate: z.number().min(0).max(1).optional(),
    avgResponseTime: z.number().nonnegative().optional()
  }).optional()
});

/**
 * MCP Connector SPI Schemas
 */
export const ConnectorConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['oauth', 'webhook', 'storage', 'database', 'api', 'generic']),
  version: z.string().default('1.0.0'),
  protocols: z.array(z.string()).min(1),
  endpoints: z.array(z.string()).optional(),
  authentication: z.object({
    type: z.enum(['none', 'api-key', 'oauth', 'basic', 'bearer']),
    config: z.record(z.any())
  }).optional(),
  settings: z.record(z.any()).default({})
});

export const OAuthProfileSchema = z.object({
  provider: z.string().min(1),
  clientId: z.string().min(1),
  scopes: z.array(z.string()),
  redirectUri: z.string().url(),
  authUrl: z.string().url().optional(),
  tokenUrl: z.string().url().optional()
});

export const ConnectorConnectionRequestSchema = z.object({
  credentials: z.record(z.any()).optional(),
  settings: z.record(z.any()).default({}),
  timeout: z.number().positive().optional()
});

export const ConnectorConnectionResponseSchema = z.object({
  connected: z.boolean(),
  sessionId: z.string(),
  metadata: z.record(z.any()).default({}),
  error: z.string().optional()
});

export const ConnectorUploadRequestSchema = z.object({
  filename: z.string().min(1),
  data: z.any(), // Buffer or string
  contentType: z.string().optional(),
  metadata: z.record(z.any()).default({})
});

export const ConnectorUploadResponseSchema = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  metadata: z.record(z.any()).default({})
});

export const ConnectorDownloadRequestSchema = z.object({
  id: z.string().min(1),
  options: z.record(z.any()).default({})
});

export const ConnectorDownloadResponseSchema = z.object({
  data: z.any(), // Buffer
  contentType: z.string(),
  metadata: z.record(z.any()).default({})
});

export const ConnectorHealthCheckResponseSchema = z.object({
  connected: z.boolean(),
  healthy: z.boolean(),
  latency: z.number().nonnegative(),
  lastCheck: z.number().positive(),
  errors: z.array(z.string()).default([])
});

export const ConnectorMetricsResponseSchema = z.object({
  requests: z.number().nonnegative(),
  successRate: z.number().min(0).max(1),
  avgLatency: z.number().nonnegative(),
  dataTransferred: z.number().nonnegative(),
  errors: z.array(z.string()).default([])
});

/**
 * WAI Orchestration Schemas
 */
export const WAIConfigSchema = z.object({
  llmProviders: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.string().min(1),
    enabled: z.boolean().default(true),
    config: z.record(z.any())
  })).min(1),
  agents: z.object({
    maxConcurrent: z.number().positive().default(10),
    defaultTimeout: z.number().positive().default(30000),
    retryAttempts: z.number().nonnegative().default(3)
  }),
  mcp: z.object({
    enabled: z.boolean().default(true),
    maxConnectors: z.number().positive().default(50),
    healthCheckInterval: z.number().positive().default(30000)
  }),
  optimization: z.object({
    enabled: z.boolean().default(true),
    costOptimization: z.boolean().default(true),
    performanceOptimization: z.boolean().default(true)
  }),
  observability: z.object({
    enabled: z.boolean().default(true),
    metricsInterval: z.number().positive().default(1000),
    loggingLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info')
  })
});

export const WAIRequestSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['agent-execution', 'mcp-operation', 'llm-generation', 'orchestration']),
  payload: z.any(),
  context: z.record(z.any()).default({}),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  timeout: z.number().positive().optional(),
  metadata: z.record(z.any()).default({})
});

export const WAIResponseSchema = z.object({
  id: z.string().min(1),
  success: z.boolean(),
  data: z.any(),
  error: z.string().optional(),
  warnings: z.array(z.string()).default([]),
  metadata: z.object({
    executionTime: z.number().nonnegative(),
    cost: z.number().nonnegative().optional(),
    agentsUsed: z.array(z.string()).default([]),
    providersUsed: z.array(z.string()).default([])
  })
});

export const WAIHealthStatusSchema = z.object({
  overall: z.enum(['healthy', 'degraded', 'error']),
  components: z.record(z.object({
    status: z.enum(['healthy', 'degraded', 'error']),
    lastCheck: z.number().positive(),
    details: z.record(z.any()).optional()
  })),
  metrics: z.object({
    totalRequests: z.number().nonnegative(),
    successRate: z.number().min(0).max(1),
    avgResponseTime: z.number().nonnegative(),
    uptime: z.number().nonnegative()
  }),
  timestamp: z.number().positive()
});

/**
 * Registry Schemas
 */
export const RegistrationRequestSchema = z.object({
  type: z.enum(['agent', 'connector', 'provider']),
  manifest: z.any(), // Will be validated against specific manifest schema
  metadata: z.record(z.any()).default({})
});

export const RegistrationResultSchema = z.object({
  success: z.boolean(),
  id: z.string(),
  message: z.string().optional(),
  errors: z.array(z.string()).default([]),
  registeredAt: z.number().positive().optional()
});

export const ConformanceTestResultSchema = z.object({
  passed: z.boolean(),
  score: z.number().min(0).max(1),
  tests: z.array(z.object({
    name: z.string().min(1),
    passed: z.boolean(),
    message: z.string().optional(),
    duration: z.number().nonnegative().optional()
  })),
  failures: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([])
});

/**
 * BMAD (Business Model Analysis and Design) Schemas
 */
export const BMADRequestSchema = z.object({
  type: z.enum(['analysis', 'design', 'optimization', 'validation']),
  businessContext: z.object({
    industry: z.string().min(1),
    targetMarket: z.string().min(1),
    objectives: z.array(z.string()).min(1),
    constraints: z.array(z.string()).default([])
  }),
  requirements: z.array(z.string()).min(1),
  parameters: z.record(z.any()).default({})
});

export const BMADResponseSchema = z.object({
  analysis: z.object({
    feasibility: z.number().min(0).max(1),
    marketFit: z.number().min(0).max(1),
    riskAssessment: z.object({
      technical: z.number().min(0).max(1),
      market: z.number().min(0).max(1),
      financial: z.number().min(0).max(1)
    }),
    recommendations: z.array(z.string())
  }),
  design: z.object({
    architecture: z.record(z.any()),
    components: z.array(z.string()),
    workflows: z.array(z.record(z.any())),
    integrations: z.array(z.string())
  }),
  optimization: z.object({
    performanceMetrics: z.record(z.number()),
    costOptimizations: z.array(z.string()),
    resourceAllocation: z.record(z.number())
  })
});

/**
 * GRPO (Generalized Reinforcement Policy Optimization) Schemas
 */
export const GRPOTrainingRequestSchema = z.object({
  agentId: z.string().min(1),
  trainingData: z.array(z.object({
    input: z.any(),
    expectedOutput: z.any(),
    feedback: z.number().min(-1).max(1).optional()
  })),
  parameters: z.object({
    learningRate: z.number().positive().default(0.001),
    batchSize: z.number().positive().default(32),
    epochs: z.number().positive().default(100),
    validationSplit: z.number().min(0).max(1).default(0.2)
  })
});

export const GRPOTrainingResponseSchema = z.object({
  trainingId: z.string().min(1),
  status: z.enum(['started', 'in-progress', 'completed', 'failed']),
  metrics: z.object({
    accuracy: z.number().min(0).max(1).optional(),
    loss: z.number().nonnegative().optional(),
    epochsCompleted: z.number().nonnegative(),
    timeElapsed: z.number().nonnegative()
  }),
  policyUpdates: z.array(z.record(z.any())).default([]),
  error: z.string().optional()
});

export const PolicyUpdateSchema = z.object({
  policyId: z.string().min(1),
  version: z.string().min(1),
  updates: z.record(z.any()),
  validatedAt: z.number().positive(),
  appliedAt: z.number().positive().optional()
});

/**
 * Type exports from schemas
 */
export type AgentCapability = z.infer<typeof AgentCapabilitySchema>;
export type AgentCosts = z.infer<typeof AgentCostsSchema>;
export type AgentManifest = z.infer<typeof AgentManifestSchema>;
export type AgentExecutionRequest = z.infer<typeof AgentExecutionRequestSchema>;
export type AgentExecutionResponse = z.infer<typeof AgentExecutionResponseSchema>;
export type AgentHealthStatus = z.infer<typeof AgentHealthStatusSchema>;

export type ConnectorConfig = z.infer<typeof ConnectorConfigSchema>;
export type OAuthProfile = z.infer<typeof OAuthProfileSchema>;
export type ConnectorConnectionRequest = z.infer<typeof ConnectorConnectionRequestSchema>;
export type ConnectorConnectionResponse = z.infer<typeof ConnectorConnectionResponseSchema>;
export type ConnectorUploadRequest = z.infer<typeof ConnectorUploadRequestSchema>;
export type ConnectorUploadResponse = z.infer<typeof ConnectorUploadResponseSchema>;
export type ConnectorDownloadRequest = z.infer<typeof ConnectorDownloadRequestSchema>;
export type ConnectorDownloadResponse = z.infer<typeof ConnectorDownloadResponseSchema>;
export type ConnectorHealthCheckResponse = z.infer<typeof ConnectorHealthCheckResponseSchema>;
export type ConnectorMetricsResponse = z.infer<typeof ConnectorMetricsResponseSchema>;

export type WAIConfig = z.infer<typeof WAIConfigSchema>;
export type WAIRequest = z.infer<typeof WAIRequestSchema>;
export type WAIResponse = z.infer<typeof WAIResponseSchema>;
export type WAIHealthStatus = z.infer<typeof WAIHealthStatusSchema>;

export type RegistrationRequest = z.infer<typeof RegistrationRequestSchema>;
export type RegistrationResult = z.infer<typeof RegistrationResultSchema>;
export type ConformanceTestResult = z.infer<typeof ConformanceTestResultSchema>;

export type BMADRequest = z.infer<typeof BMADRequestSchema>;
export type BMADResponse = z.infer<typeof BMADResponseSchema>;

export type GRPOTrainingRequest = z.infer<typeof GRPOTrainingRequestSchema>;
export type GRPOTrainingResponse = z.infer<typeof GRPOTrainingResponseSchema>;
export type PolicyUpdate = z.infer<typeof PolicyUpdateSchema>;

/**
 * Schema validation utilities
 */
export class SchemaValidator {
  static validateAgentManifest(data: unknown): AgentManifest {
    return AgentManifestSchema.parse(data);
  }

  static validateConnectorConfig(data: unknown): ConnectorConfig {
    return ConnectorConfigSchema.parse(data);
  }

  static validateWAIRequest(data: unknown): WAIRequest {
    return WAIRequestSchema.parse(data);
  }

  static validateBMADRequest(data: unknown): BMADRequest {
    return BMADRequestSchema.parse(data);
  }

  static validateGRPOTrainingRequest(data: unknown): GRPOTrainingRequest {
    return GRPOTrainingRequestSchema.parse(data);
  }

  // Safe validation that returns validation result instead of throwing
  static safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; error?: string } {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Unknown validation error' };
    }
  }

  // Batch validation for arrays
  static validateArray<T>(schema: z.ZodSchema<T>, data: unknown[]): { valid: T[]; invalid: { index: number; error: string }[] } {
    const valid: T[] = [];
    const invalid: { index: number; error: string }[] = [];

    data.forEach((item, index) => {
      const result = this.safeValidate(schema, item);
      if (result.success && result.data) {
        valid.push(result.data);
      } else {
        invalid.push({ index, error: result.error || 'Validation failed' });
      }
    });

    return { valid, invalid };
  }
}