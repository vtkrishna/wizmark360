# WAI SDK v1.0 API Reference

> **Version**: 1.0.0  
> **Last Updated**: November 25, 2025  
> **Status**: Production Ready

## Overview

The WAI SDK v1.0 is organized into 8 modular packages that can be used independently or together:

| Package | Description | Exports |
|---------|-------------|---------|
| **@wai/core** | Framework-agnostic orchestration core | Interfaces, DI, Config, Wiring Services |
| **@wai/agents** | 267+ specialized agent definitions | Agent types, ROMA levels, tier classifications |
| **@wai/providers** | 23+ LLM provider adapters | Provider configs, model catalogs |
| **@wai/tools** | 93 production-ready tools | MCP tools, registries |
| **@wai/memory** | mem0-style memory system | Vector store, embeddings, CAM 2.0 |
| **@wai/protocols** | MCP, ROMA, BMAD, Parlant, A2A, AG-UI | Protocol handlers, standards |
| **@wai/workflows** | Workflow scheduling & execution | Schedulers, executors |
| **@wai/adapters** | Framework integrations | Express, PostgreSQL, Standalone |

---

## @wai/core

The core package provides framework-agnostic orchestration primitives.

### Installation

```typescript
import { 
  WAIConfig, 
  EventBus, 
  ProviderRegistry, 
  ToolRegistry 
} from '@wai/core';
```

### Core Interfaces

#### IEventBus

Event bus interface for inter-agent communication.

```typescript
interface IEventBus {
  emit(event: string, data: any): void;
  on(event: string, handler: (data: any) => void): void;
  off(event: string, handler: (data: any) => void): void;
  once(event: string, handler: (data: any) => void): void;
}
```

#### IJobQueue

Job queue interface for async task processing.

```typescript
interface IJobQueue {
  enqueue(job: Job): Promise<string>;
  dequeue(): Promise<Job | null>;
  status(jobId: string): Promise<JobStatus>;
  cancel(jobId: string): Promise<boolean>;
}
```

#### IProviderRegistry

Registry interface for LLM providers.

```typescript
interface IProviderRegistry {
  register(id: string, provider: LLMProvider): void;
  get(id: string): LLMProvider | undefined;
  list(): string[];
  getByCapability(capability: string): LLMProvider[];
}
```

#### IToolRegistry

Registry interface for MCP tools.

```typescript
interface IToolRegistry {
  register(tool: MCPTool): void;
  get(name: string): MCPTool | undefined;
  list(): MCPTool[];
  execute(name: string, params: Record<string, any>): Promise<any>;
}
```

#### IStorageAdapter

Storage adapter interface for persistence.

```typescript
interface IStorageAdapter {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
}
```

### Configuration

#### WAIConfig

Main configuration class for WAI SDK.

```typescript
import { WAIConfig } from '@wai/core';

const config = new WAIConfig({
  // LLM Provider configuration
  providers: {
    default: 'anthropic',
    fallback: ['openai', 'google'],
    maxRetries: 3,
  },
  
  // Agent configuration
  agents: {
    maxConcurrent: 20,
    defaultTimeout: 30000,
    romaLevel: 'L3',
  },
  
  // Memory configuration
  memory: {
    provider: 'pgvector',
    embeddingModel: 'text-embedding-3-small',
    dimensions: 1536,
  },
  
  // Security configuration
  security: {
    quantumReady: true,
    encryption: 'AES-256-GCM',
  },
});
```

### Dependency Injection

#### Container

DI container for service resolution.

```typescript
import { Container } from '@wai/core';

const container = new Container();

// Register services
container.register('eventBus', new EventBus());
container.register('storage', new PostgreSQLAdapter());

// Resolve services
const eventBus = container.resolve<IEventBus>('eventBus');
```

### Orchestration Services

#### Request Builder

Builds orchestration requests with proper context.

```typescript
import { RequestBuilder } from '@wai/core';

const request = new RequestBuilder()
  .withAgent('fullstack-developer')
  .withTask('Implement user authentication')
  .withContext({ framework: 'React', database: 'PostgreSQL' })
  .withRomaLevel('L3')
  .build();
```

#### ROMA Autonomy Service

Manages agent autonomy levels (L1-L4).

```typescript
import { ROMAAutonomyService } from '@wai/core';

const roma = new ROMAAutonomyService();

// Check if agent can execute autonomously
const canExecute = roma.checkAutonomy('fullstack-developer', 'L3', task);

// Escalate to higher level
roma.escalate('fullstack-developer', 'L4', reason);
```

#### Quantum Security Framework

Post-quantum cryptography and security.

```typescript
import { QuantumSecurityFramework } from '@wai/core';

const qsf = new QuantumSecurityFramework();

// Generate quantum-safe key
const key = await qsf.generateKey('Kyber');

// Sign with quantum-resistant signature
const signature = await qsf.sign(data, 'Dilithium');

// Generate quantum random number
const random = await qsf.generateRandom(32);
```

#### Parallel Processing Service

Parallel task execution with load balancing.

```typescript
import { ParallelProcessingService } from '@wai/core';

const parallel = new ParallelProcessingService({
  maxConcurrent: 20,
  enableBatching: true,
});

// Execute tasks in parallel
const results = await parallel.execute([task1, task2, task3]);
```

#### Error Recovery Service

Intelligent error handling and fallback chains.

```typescript
import { ErrorRecoveryService } from '@wai/core';

const recovery = new ErrorRecoveryService({
  retryStrategies: ['exponential', 'circuit-breaker'],
  fallbackChain: ['primary', 'secondary', 'tertiary'],
});

// Execute with recovery
const result = await recovery.executeWithRecovery(async () => {
  return await riskyOperation();
});
```

---

## @wai/agents

The agents package provides 267+ specialized agent definitions.

### Installation

```typescript
import { 
  AgentDefinition,
  AgentTier,
  ROMALevel 
} from '@wai/agents';
```

### Agent Tiers

| Tier | Count | Description |
|------|-------|-------------|
| Executive | 34 | Strategic decision-making, project orchestration |
| Development | 160 | Full-stack development, specialized coding |
| Creative | 17 | Content creation, design, media |
| QA | 7 | Testing, quality assurance |
| DevOps | 11 | Infrastructure, deployment, monitoring |
| Domain | 38 | Industry-specific expertise |

### Agent Definition

```typescript
interface AgentDefinition {
  id: string;
  name: string;
  tier: AgentTier;
  romaLevel: ROMALevel;
  capabilities: string[];
  specializations: string[];
  fallbackAgents: string[];
  systemPrompt: string;
  tools: string[];
  maxTokens: number;
  temperature: number;
}
```

### Example Agents

#### Executive Tier

```typescript
const enterpriseOrchestrator: AgentDefinition = {
  id: 'enterprise-orchestrator',
  name: 'Enterprise Orchestrator',
  tier: 'executive',
  romaLevel: 'L4',
  capabilities: ['project-management', 'team-coordination', 'strategic-planning'],
  specializations: ['enterprise-architecture', 'digital-transformation'],
  fallbackAgents: ['project-manager', 'technical-lead'],
  tools: ['task-delegation', 'progress-tracking', 'resource-allocation'],
};
```

#### Development Tier

```typescript
const fullstackDeveloper: AgentDefinition = {
  id: 'fullstack-developer',
  name: 'Full-Stack Developer',
  tier: 'development',
  romaLevel: 'L3',
  capabilities: ['frontend', 'backend', 'database', 'api-design'],
  specializations: ['react', 'nodejs', 'postgresql', 'typescript'],
  fallbackAgents: ['frontend-developer', 'backend-developer'],
  tools: ['code-execution', 'file-operations', 'api-calling'],
};
```

### Agent Registry

```typescript
import { AgentRegistry } from '@wai/agents';

const registry = new AgentRegistry();

// Get agent by ID
const agent = registry.get('fullstack-developer');

// Find agents by capability
const webDevs = registry.findByCapability('frontend');

// Find agents by tier
const executives = registry.findByTier('executive');

// Find agents by ROMA level
const autonomous = registry.findByROMALevel('L4');
```

---

## @wai/providers

The providers package supports 23+ LLM providers.

### Supported Providers

| Provider | Models | Features |
|----------|--------|----------|
| OpenAI | GPT-4o, GPT-4, GPT-3.5 | Function calling, vision, embeddings |
| Anthropic | Claude 3.5, Claude 3 | Extended thinking, tools, vision |
| Google | Gemini 2.0, Gemini 1.5 | Multimodal, grounding, code execution |
| Perplexity | Sonar Pro, Sonar | Real-time search, citations |
| xAI | Grok-2, Grok-1 | Reasoning, code |
| Cohere | Command R+, Command R | RAG, embeddings, rerank |
| DeepSeek | DeepSeek-V3, Coder | Cost-effective, coding |
| Groq | Llama 3.3, Mixtral | Ultra-fast inference |
| Meta | Llama 3.3, Llama 3.2 | Open-source, vision |
| Mistral | Large, Medium, Codestral | Multilingual, code |
| OpenRouter | 200+ models | Unified API, failover |
| Moonshot | Kimi K2 | Trillion parameters, MoE |
| KIE AI | Various | Custom models |
| Together AI | Llama, Mixtral | Fine-tuning, inference |
| Replicate | Stable Diffusion, Whisper | Image, audio models |

### Provider Configuration

```typescript
import { ProviderConfig } from '@wai/providers';

const config: ProviderConfig = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    defaultModel: 'claude-sonnet-4-20250514',
    maxTokens: 8192,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    defaultModel: 'gpt-4o',
    maxTokens: 4096,
  },
};
```

### Intelligent Routing

```typescript
import { IntelligentRouter } from '@wai/providers';

const router = new IntelligentRouter({
  costOptimization: true,
  qualityThreshold: 0.8,
  fallbackEnabled: true,
});

// Route to optimal provider
const provider = await router.route({
  task: 'code-generation',
  complexity: 'high',
  budget: 0.01, // per request
});
```

---

## @wai/tools

The tools package provides 93 production-ready MCP tools.

### Installation

```typescript
import { 
  ToolRegistry,
  fileOperations,
  webRequests,
  codeExecution 
} from '@wai/tools';
```

### Tool Categories

| Category | Count | Description |
|----------|-------|-------------|
| Core | 10 | File, web, code, JSON, text, math, datetime, random, validation |
| Memory | 4 | Store, recall, update, delete |
| Multimodal | 23 | Image, video, audio processing |
| Data Analysis | 5 | Statistics, aggregation, filtering |
| Visualization | 5 | Charts, graphs, dashboards |
| Statistics | 5 | Regression, correlation, hypothesis testing |
| Business Intelligence | 5 | KPI, forecasting, reporting |
| Web Scraping | 6 | DOM extraction, pagination, rate limiting |
| Web Search | 4 | Search engines, news, academic |
| SEO/Analytics | 5 | Keyword, ranking, traffic analysis |
| Communication | 10 | Email, SMS, notifications |
| Productivity | 5 | Calendar, tasks, notes |
| Document | 5 | PDF, Office, markdown processing |
| API Integration | 5 | REST, GraphQL, webhooks |

### Tool Definition

```typescript
interface MCPTool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  handler: (params: any) => Promise<any>;
}
```

### Core Tools

#### File Operations

```typescript
import { fileOperations } from '@wai/tools';

// Read file
const content = await fileOperations.read('/path/to/file.txt');

// Write file
await fileOperations.write('/path/to/file.txt', 'content');

// List directory
const files = await fileOperations.list('/path/to/dir');
```

#### Web Requests

```typescript
import { webRequests } from '@wai/tools';

// GET request
const response = await webRequests.get('https://api.example.com/data');

// POST request
const result = await webRequests.post('https://api.example.com/submit', {
  body: { key: 'value' },
});
```

#### Code Execution

```typescript
import { codeExecution } from '@wai/tools';

// Execute Python
const pythonResult = await codeExecution.run({
  language: 'python',
  code: 'print("Hello, World!")',
  timeout: 10000,
});

// Execute JavaScript
const jsResult = await codeExecution.run({
  language: 'javascript',
  code: 'console.log(2 + 2);',
});
```

### Memory Tools

```typescript
import { memoryStore, memoryRecall } from '@wai/tools';

// Store memory
await memoryStore.execute({
  key: 'user_preference',
  value: { theme: 'dark', language: 'en' },
  ttl: 86400,
});

// Recall memory
const preference = await memoryRecall.execute({
  key: 'user_preference',
});
```

### Tool Registry

```typescript
import { ToolRegistry } from '@wai/tools';

const registry = new ToolRegistry();

// Register custom tool
registry.register({
  name: 'custom-tool',
  description: 'My custom tool',
  inputSchema: { type: 'object', properties: {} },
  handler: async (params) => {
    return { result: 'success' };
  },
});

// Execute tool
const result = await registry.execute('custom-tool', {});
```

---

## @wai/memory

The memory package provides mem0-style persistent memory.

### Installation

```typescript
import { 
  MemoryService,
  VectorStore,
  EmbeddingProvider 
} from '@wai/memory';
```

### Memory Service

```typescript
import { MemoryService } from '@wai/memory';

const memory = new MemoryService({
  vectorStore: 'pgvector',
  embeddingModel: 'text-embedding-3-small',
  dimensions: 1536,
});

// Add memory
await memory.add({
  userId: 'user123',
  content: 'User prefers dark mode',
  metadata: { category: 'preferences' },
});

// Search memories
const results = await memory.search({
  userId: 'user123',
  query: 'user preferences',
  limit: 10,
});

// Get memory by ID
const mem = await memory.get('memory-id');

// Delete memory
await memory.delete('memory-id');
```

### Vector Store

```typescript
import { VectorStore } from '@wai/memory';

const vectorStore = new VectorStore({
  connectionString: process.env.DATABASE_URL,
  tableName: 'memories',
  dimensions: 1536,
});

// Insert vector
await vectorStore.insert({
  id: 'vec-1',
  embedding: [0.1, 0.2, ...],
  metadata: { source: 'conversation' },
});

// Similarity search
const similar = await vectorStore.search({
  embedding: queryEmbedding,
  limit: 10,
  threshold: 0.8,
});
```

### Embedding Provider

```typescript
import { EmbeddingProvider } from '@wai/memory';

const embeddings = new EmbeddingProvider({
  provider: 'openai',
  model: 'text-embedding-3-small',
});

// Generate embedding
const embedding = await embeddings.embed('Hello, world!');

// Batch embed
const embeddings = await embeddings.batchEmbed([
  'Text 1',
  'Text 2',
  'Text 3',
]);
```

### Two-Phase Extraction Pipeline

```typescript
import { ExtractionPipeline } from '@wai/memory';

const pipeline = new ExtractionPipeline();

// Extract facts from conversation
const facts = await pipeline.extract({
  content: 'User mentioned they live in San Francisco and work as a developer.',
  extractTypes: ['location', 'occupation'],
});
// Returns: [{ type: 'location', value: 'San Francisco' }, { type: 'occupation', value: 'developer' }]
```

### CAM 2.0 Monitoring

```typescript
import { CAMMonitor } from '@wai/memory';

const cam = new CAMMonitor();

// Track context window usage
cam.trackUsage({
  agentId: 'fullstack-developer',
  tokensUsed: 2048,
  contextWindow: 8192,
});

// Get optimization recommendations
const recommendations = cam.getRecommendations('fullstack-developer');
```

---

## @wai/protocols

The protocols package implements industry standards.

### Installation

```typescript
import { 
  MCPServer,
  ROMAMetaAgent,
  ParlantStandards 
} from '@wai/protocols';
```

### MCP (Model Context Protocol)

```typescript
import { MCPServer, MCPTool } from '@wai/protocols';

const server = new MCPServer({
  name: 'my-mcp-server',
  version: '1.0.0',
});

// Register tool
server.registerTool({
  name: 'get-weather',
  description: 'Get current weather for a location',
  inputSchema: {
    type: 'object',
    properties: {
      location: { type: 'string' },
    },
    required: ['location'],
  },
  handler: async (params) => {
    return { temperature: 72, condition: 'sunny' };
  },
});

// Start server
await server.start();
```

### ROMA Meta-Agent

```typescript
import { ROMAMetaAgent } from '@wai/protocols';

const roma = new ROMAMetaAgent({
  defaultLevel: 'L2',
  escalationPolicy: 'gradual',
});

// Evaluate autonomy level
const level = await roma.evaluateLevel({
  task: 'Deploy to production',
  risk: 'high',
  reversibility: 'low',
});

// Request escalation
const approved = await roma.requestEscalation({
  agentId: 'devops-agent',
  fromLevel: 'L2',
  toLevel: 'L3',
  reason: 'Critical security patch',
});
```

### ROMA Levels

| Level | Name | Description |
|-------|------|-------------|
| L1 | Assisted | Human approval required for all actions |
| L2 | Supervised | Human approval for significant actions |
| L3 | Autonomous | Autonomous with human notification |
| L4 | Fully Autonomous | Fully autonomous operation |

### Parlant Standards

```typescript
import { ParlantStandards } from '@wai/protocols';

const parlant = new ParlantStandards();

// Format agent response
const response = parlant.formatResponse({
  agentId: 'fullstack-developer',
  content: 'Task completed successfully',
  confidence: 0.95,
});

// Validate communication
const isValid = parlant.validateMessage(message);
```

---

## @wai/workflows

The workflows package provides scheduling and execution.

### Installation

```typescript
import { 
  WorkflowScheduler,
  WorkflowExecutor 
} from '@wai/workflows';
```

### Workflow Scheduler

```typescript
import { WorkflowScheduler } from '@wai/workflows';

const scheduler = new WorkflowScheduler();

// Schedule workflow
const workflowId = await scheduler.schedule({
  name: 'daily-report',
  cron: '0 9 * * *',
  task: async () => {
    await generateReport();
  },
});

// Cancel workflow
await scheduler.cancel(workflowId);
```

### Workflow Executor

```typescript
import { WorkflowExecutor } from '@wai/workflows';

const executor = new WorkflowExecutor({
  maxConcurrent: 5,
  timeout: 60000,
});

// Execute workflow
const result = await executor.execute({
  steps: [
    { name: 'fetch-data', handler: fetchData },
    { name: 'process', handler: processData },
    { name: 'store', handler: storeResults },
  ],
});
```

---

## @wai/adapters

The adapters package provides framework integrations.

### Installation

```typescript
import { 
  ExpressAdapter,
  PostgreSQLAdapter,
  StandaloneAdapter 
} from '@wai/adapters';
```

### Express Adapter

```typescript
import { ExpressAdapter } from '@wai/adapters';
import express from 'express';

const app = express();
const adapter = new ExpressAdapter(app);

// Mount WAI SDK routes
adapter.mount('/api/wai', {
  agents: true,
  tools: true,
  memory: true,
});

app.listen(5000);
```

### PostgreSQL Adapter

```typescript
import { PostgreSQLAdapter } from '@wai/adapters';

const adapter = new PostgreSQLAdapter({
  connectionString: process.env.DATABASE_URL,
  maxConnections: 20,
});

// Use as storage
const storage = adapter.createStorage();
await storage.set('key', 'value');
```

### Standalone Adapter

```typescript
import { StandaloneAdapter } from '@wai/adapters';

const adapter = new StandaloneAdapter();

// Run WAI SDK standalone
const wai = await adapter.initialize({
  config: waiConfig,
});

// Execute task
const result = await wai.execute({
  agent: 'fullstack-developer',
  task: 'Create a React component',
});
```

---

## Error Handling

All packages use consistent error types:

```typescript
import { WAIError, ErrorCode } from '@wai/core';

try {
  await wai.execute(task);
} catch (error) {
  if (error instanceof WAIError) {
    switch (error.code) {
      case ErrorCode.PROVIDER_UNAVAILABLE:
        // Handle provider error
        break;
      case ErrorCode.AGENT_NOT_FOUND:
        // Handle agent error
        break;
      case ErrorCode.TOOL_EXECUTION_FAILED:
        // Handle tool error
        break;
    }
  }
}
```

## TypeScript Support

All packages are fully typed with TypeScript:

```typescript
import type { 
  AgentDefinition,
  MCPTool,
  MemoryEntry,
  WorkflowStep 
} from '@wai/core';
```

---

## Quick Start

```typescript
import { WAIConfig, Container } from '@wai/core';
import { AgentRegistry } from '@wai/agents';
import { ToolRegistry } from '@wai/tools';
import { MemoryService } from '@wai/memory';

// Initialize
const config = new WAIConfig({ /* ... */ });
const container = new Container();

// Register services
container.register('agents', new AgentRegistry());
container.register('tools', new ToolRegistry());
container.register('memory', new MemoryService(config.memory));

// Execute
const agents = container.resolve('agents');
const agent = agents.get('fullstack-developer');

// Ready to use!
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Nov 25, 2025 | Initial production release |

---

## Support

- Documentation: `wai-sdk/docs/`
- Issues: GitHub Issues
- Discord: WAI SDK Community
