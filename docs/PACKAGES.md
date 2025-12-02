# WAI SDK v1.0 Package Documentation

> **Version**: 1.0.0  
> **Last Updated**: November 25, 2025

## Package Overview

The WAI SDK v1.0 is organized into 8 modular packages following a microkernel architecture:

```
wai-sdk/packages/
├── core/          # Framework-agnostic orchestration core
├── agents/        # 267+ specialized agent definitions  
├── providers/     # 23+ LLM provider adapters
├── tools/         # 93 production-ready MCP tools
├── memory/        # mem0-style memory with pgvector
├── protocols/     # MCP, ROMA, BMAD, Parlant standards
├── workflows/     # Workflow scheduling & execution
└── adapters/      # Express, PostgreSQL, Standalone integrations
```

---

## @wai/core

**Framework-agnostic orchestration core with adapter interfaces.**

### Directory Structure

```
packages/core/
├── src/
│   ├── config/           # WAI configuration
│   │   ├── index.ts
│   │   └── wai-config.ts
│   ├── di/               # Dependency injection
│   │   ├── container.ts
│   │   └── index.ts
│   ├── interfaces/       # Core interfaces
│   │   ├── event-bus.ts
│   │   ├── job-queue.ts
│   │   ├── provider-registry.ts
│   │   ├── storage-adapter.ts
│   │   └── tool-registry.ts
│   ├── orchestration/    # Wiring services
│   │   ├── clock-provider.ts
│   │   ├── context-engineering-engine.ts
│   │   ├── error-recovery-wiring-service.ts
│   │   ├── parallel-processing-wiring-service.ts
│   │   ├── quantum-security-framework.ts
│   │   ├── quantum-security-wiring-service.ts
│   │   ├── request-builder.ts
│   │   ├── roma-autonomy-service.ts
│   │   └── standalone-api.ts
│   ├── grpo-reinforcement-trainer.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### Key Exports

| Export | Description |
|--------|-------------|
| `WAIConfig` | Main configuration class |
| `Container` | Dependency injection container |
| `IEventBus` | Event bus interface |
| `IJobQueue` | Job queue interface |
| `IProviderRegistry` | Provider registry interface |
| `IToolRegistry` | Tool registry interface |
| `IStorageAdapter` | Storage adapter interface |
| `RequestBuilder` | Orchestration request builder |
| `ROMAAutonomyService` | ROMA L1-L4 autonomy management |
| `QuantumSecurityFramework` | Post-quantum cryptography |
| `ParallelProcessingService` | Parallel task execution |
| `ErrorRecoveryService` | Error handling & fallbacks |

---

## @wai/agents

**267+ specialized agent definitions across 6 tiers.**

### Directory Structure

```
packages/agents/
├── src/
│   ├── definitions/      # Agent definitions by tier
│   │   ├── executive/
│   │   ├── development/
│   │   ├── creative/
│   │   ├── qa/
│   │   ├── devops/
│   │   └── domain/
│   └── index.ts
├── package.json
└── tsconfig.json
```

### Agent Distribution

| Tier | Count | Examples |
|------|-------|----------|
| Executive | 34 | Enterprise Orchestrator, Project Manager, Technical Lead |
| Development | 160 | Full-Stack Developer, Frontend Specialist, Backend Architect |
| Creative | 17 | Content Creator, UI Designer, Copywriter |
| QA | 7 | Test Engineer, Quality Analyst, Security Auditor |
| DevOps | 11 | Cloud Architect, CI/CD Engineer, SRE |
| Domain | 38 | FinTech Expert, Healthcare Specialist, Legal Advisor |

### Key Exports

| Export | Description |
|--------|-------------|
| `AgentDefinition` | Agent type definition |
| `AgentTier` | Tier enum (executive, development, etc.) |
| `ROMALevel` | Autonomy level (L1, L2, L3, L4) |
| `AgentRegistry` | Agent lookup and discovery |
| `AgentCapabilities` | Capability definitions |

---

## @wai/providers

**23+ LLM provider adapters with intelligent routing.**

### Directory Structure

```
packages/providers/
├── src/
│   ├── adapters/         # Provider-specific adapters
│   │   ├── anthropic/
│   │   ├── openai/
│   │   ├── google/
│   │   └── ...
│   ├── routing/          # Intelligent routing
│   └── index.ts
├── package.json
└── tsconfig.json
```

### Supported Providers

| Provider | Status | Models |
|----------|--------|--------|
| OpenAI | ✅ Active | GPT-4o, GPT-4, GPT-3.5 |
| Anthropic | ✅ Active | Claude 3.5, Claude 3 |
| Google | ✅ Active | Gemini 2.0, Gemini 1.5 |
| Perplexity | ✅ Active | Sonar Pro, Sonar |
| xAI | ✅ Active | Grok-2, Grok-1 |
| Cohere | ✅ Active | Command R+, Command R |
| DeepSeek | ✅ Active | DeepSeek-V3, Coder |
| Groq | ✅ Active | Llama 3.3, Mixtral |
| Meta | ✅ Active | Llama 3.3, Llama 3.2 |
| Mistral | ✅ Active | Large, Medium, Codestral |
| OpenRouter | ✅ Active | 200+ models |
| Moonshot | ✅ Active | Kimi K2 |
| Together AI | ✅ Active | Various |
| Replicate | ✅ Active | Image/Audio models |

### Key Exports

| Export | Description |
|--------|-------------|
| `ProviderConfig` | Provider configuration |
| `IntelligentRouter` | Cost-optimized routing |
| `ProviderAdapter` | Base adapter class |
| `ModelCatalog` | Available models |

---

## @wai/tools

**93 production-ready MCP tools across 14 categories.**

### Directory Structure

```
packages/tools/
├── src/
│   ├── tools/            # Tool implementations
│   │   ├── file-operations.ts
│   │   ├── web-requests.ts
│   │   ├── code-execution.ts
│   │   ├── json-operations.ts
│   │   ├── text-processing.ts
│   │   ├── math-calculations.ts
│   │   ├── datetime-operations.ts
│   │   ├── random-generation.ts
│   │   ├── data-validation.ts
│   │   ├── memory-*.ts
│   │   ├── data.ts
│   │   ├── visualization.ts
│   │   ├── statistics.ts
│   │   ├── business-intelligence.ts
│   │   ├── web-scraping.ts
│   │   ├── web-search.ts
│   │   ├── seo-analytics.ts
│   │   ├── communication.ts
│   │   ├── productivity.ts
│   │   ├── document.ts
│   │   ├── api-integration.ts
│   │   └── multimodal.ts
│   ├── registry/
│   │   └── tool-registry.ts
│   ├── examples/
│   │   └── usage-example.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### Tool Categories

| Category | Count | Tools |
|----------|-------|-------|
| Core | 10 | file-read, file-write, web-get, code-execute, etc. |
| Memory | 4 | memory-store, memory-recall, memory-update, memory-delete |
| Multimodal | 23 | image-generate, video-process, audio-transcribe, etc. |
| Data | 5 | data-aggregate, data-filter, data-transform, etc. |
| Visualization | 5 | chart-create, graph-render, dashboard-build, etc. |
| Statistics | 5 | regression, correlation, hypothesis-test, etc. |
| BI | 5 | kpi-calculate, forecast, report-generate, etc. |
| Web Scraping | 6 | dom-extract, pagination-handle, rate-limit, etc. |
| Web Search | 4 | search-engine, news-search, academic-search, etc. |
| SEO | 5 | keyword-analyze, rank-track, traffic-analyze, etc. |
| Communication | 10 | email-send, sms-send, notification-push, etc. |
| Productivity | 5 | calendar-manage, task-create, note-take, etc. |
| Document | 5 | pdf-parse, office-convert, markdown-render, etc. |
| API | 5 | rest-call, graphql-query, webhook-handle, etc. |

### Key Exports

| Export | Description |
|--------|-------------|
| `ToolRegistry` | Tool registration and execution |
| `MCPTool` | Tool type definition |
| `fileOperations` | File operation tools |
| `webRequests` | Web request tools |
| `codeExecution` | Code execution sandbox |
| `TOOL_COUNT` | Total tool count (93) |

---

## @wai/memory

**mem0-style memory with pgvector and OpenAI embeddings.**

### Directory Structure

```
packages/memory/
├── src/
│   ├── core/
│   │   ├── types.ts
│   │   ├── embedding-provider.ts
│   │   ├── vector-store.ts
│   │   ├── memory-storage.ts
│   │   ├── memory-service.ts
│   │   └── extraction-pipeline.ts
│   ├── cam/
│   │   └── cam-monitor.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### Features

| Feature | Description |
|---------|-------------|
| Vector Store | pgvector-based similarity search |
| Embeddings | OpenAI text-embedding-3-small |
| Extraction | Two-phase fact extraction pipeline |
| CAM 2.0 | Context window monitoring |

### Key Exports

| Export | Description |
|--------|-------------|
| `MemoryService` | Main memory API |
| `VectorStore` | Vector database operations |
| `EmbeddingProvider` | Embedding generation |
| `ExtractionPipeline` | Fact extraction |
| `CAMMonitor` | Context monitoring |

---

## @wai/protocols

**MCP, ROMA, BMAD, Parlant, A2A, AG-UI, Context Engineering.**

### Directory Structure

```
packages/protocols/
├── src/
│   ├── mcp/              # Model Context Protocol
│   │   ├── server.ts
│   │   ├── client.ts
│   │   └── tools.ts
│   ├── roma/             # ROMA Meta-Agent
│   │   ├── meta-agent.ts
│   │   └── types.ts
│   ├── parlant/          # Communication standards
│   │   └── parlant-standards.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### Protocol Support

| Protocol | Status | Description |
|----------|--------|-------------|
| MCP | ✅ Full | Model Context Protocol for tools |
| ROMA | ✅ Full | L1-L4 autonomy management |
| Parlant | ✅ Full | Agent communication standards |
| BMAD | 🔧 Incubator | Behavioral modeling |
| A2A | 🔧 Incubator | Agent-to-agent collaboration |
| AG-UI | 🔧 Incubator | Agent-UI streaming |
| Context Eng | 🔧 Incubator | Advanced context management |

### Key Exports

| Export | Description |
|--------|-------------|
| `MCPServer` | MCP server implementation |
| `MCPClient` | MCP client implementation |
| `ROMAMetaAgent` | ROMA autonomy management |
| `ParlantStandards` | Communication formatting |

---

## @wai/workflows

**Workflow scheduling and execution.**

### Directory Structure

```
packages/workflows/
├── src/
│   ├── scheduler.ts      # Cron-based scheduling
│   ├── executor.ts       # Workflow execution
│   └── index.ts
├── package.json
└── tsconfig.json
```

### Features

| Feature | Description |
|---------|-------------|
| Cron Scheduling | Time-based workflow triggers |
| Step Execution | Sequential/parallel step execution |
| Error Handling | Retry strategies and fallbacks |
| Monitoring | Execution tracking and metrics |

### Key Exports

| Export | Description |
|--------|-------------|
| `WorkflowScheduler` | Cron-based scheduling |
| `WorkflowExecutor` | Workflow execution engine |
| `WAI_WORKFLOWS_VERSION` | Package version |

---

## @wai/adapters

**Express, PostgreSQL, and Standalone integrations.**

### Directory Structure

```
packages/adapters/
├── src/
│   ├── express.ts        # Express.js adapter
│   ├── postgresql.ts     # PostgreSQL adapter
│   ├── standalone.ts     # Standalone adapter
│   └── index.ts
├── package.json
└── tsconfig.json
```

### Adapters

| Adapter | Description |
|---------|-------------|
| Express | Mount WAI SDK routes on Express app |
| PostgreSQL | Use PostgreSQL for storage |
| Standalone | Run WAI SDK without web framework |

### Key Exports

| Export | Description |
|--------|-------------|
| `ExpressAdapter` | Express.js integration |
| `PostgreSQLAdapter` | PostgreSQL storage |
| `StandaloneAdapter` | Standalone execution |
| `WAI_ADAPTERS_VERSION` | Package version |

---

## Package Dependencies

```
@wai/core (no dependencies)
    ↓
@wai/agents (depends on core)
@wai/providers (depends on core)
@wai/tools (depends on core)
@wai/memory (depends on core)
@wai/protocols (depends on core)
    ↓
@wai/workflows (depends on core, protocols)
@wai/adapters (depends on core, providers)
```

## Build & Development

### Building All Packages

```bash
cd wai-sdk
pnpm install
pnpm build
```

### Building Individual Package

```bash
cd wai-sdk/packages/core
pnpm build
```

### Development Mode

```bash
cd wai-sdk
pnpm dev
```

---

## Version History

All packages share the same version number (1.0.0) for simplicity.

---

**WAI SDK v1.0 - Production Ready**
