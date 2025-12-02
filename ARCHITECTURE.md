# WAI SDK v1.0 - Architecture & Organization

**Status**: Phase 1 Complete - Refactoring to Multi-Package Architecture

---

## Current State (86 Files)

### ✅ Successfully Extracted
- **Core Orchestration** (4 files) - Self-contained, production-ready
- **267+ Agents** (10 files) - Complete agent definitions  
- **23+ Providers** (17 files) - LLM provider adapters
- **18+ Wiring Services** (19 files) - Orchestration enhancements
- **Advanced Features** (8 files) - A2A, CAM, GRPO, Security

### ⚠️ Recently Added (26 files) - Requires Refactoring
- **mem0 Memory Layer** (3 files) - Has external dependencies
- **MCP Protocol** (3 files) - Needs adapter interface
- **Context Engineering** (3 files) - Mixed with server logic
- **BMAD-METHOD** (3 files) - Framework integration
- **ROMA Protocol** (4 files) - Autonomy management
- **Parlant Standards** (2 files) - Communication protocol
- **AG-UI Integration** (3 files) - Server middleware dependencies
- **Workflow/Jobs** (3 files) - Scheduler with DB dependencies
- **Database** (3 files) - Storage abstraction needed

---

## Architectural Issues Identified

### 1. **Circular Dependencies**
Many copied files reference `@shared` or `server` paths:
- `database-storage.ts` → requires Express/Drizzle setup
- `agui-orchestration-middleware.ts` → requires server context
- `workflow-scheduler-service.ts` → requires PostgreSQL job queue

### 2. **Framework Coupling**
Files expect specific frameworks:
- Express routes
- Drizzle ORM
- PostgreSQL database
- Server-specific configuration

### 3. **Missing Abstractions**
No adapter interfaces for:
- Storage (database, file system)
- Events (AG-UI, monitoring)
- Jobs (schedulers, queues)
- UI (workflow builders, dashboards)

---

## Recommended Architecture (Multi-Package)

```
@wizards-ai/wai-sdk/
├── packages/
│   ├── core/                    # Core orchestration (no deps)
│   │   ├── orchestration-core
│   │   ├── orchestration-facade
│   │   ├── routing-registry
│   │   └── request-builder
│   │
│   ├── protocols/               # Protocol adapters
│   │   ├── mcp/                 # Model Context Protocol
│   │   ├── roma/                # ROMA autonomy levels
│   │   ├── bmad/                # Behavioral framework
│   │   ├── parlant/             # Communication standards
│   │   ├── a2a/                 # Agent-to-agent
│   │   └── agui/                # AG-UI protocol
│   │
│   ├── memory/                  # Memory & persistence
│   │   ├── mem0/                # mem0 integration
│   │   ├── cam/                 # CAM monitoring
│   │   ├── storage-adapter/     # Storage abstraction
│   │   └── vector-store/        # Vector database
│   │
│   ├── agents/                  # Agent definitions
│   │   ├── catalog/             # 267+ agents
│   │   ├── coordination/        # Multi-agent
│   │   └── loaders/             # Dynamic loading
│   │
│   ├── providers/               # LLM providers
│   │   ├── openai/
│   │   ├── anthropic/
│   │   ├── google/
│   │   └── ... (20+ more)
│   │
│   ├── tools/                   # Tool ecosystem
│   │   ├── registry/            # Tool discovery
│   │   ├── executors/           # Tool execution
│   │   └── catalog/             # 80+ tools
│   │
│   ├── workflows/               # Workflow management
│   │   ├── scheduler/           # Job scheduling
│   │   ├── executor/            # Workflow execution
│   │   └── visual-builder/      # No-code builder
│   │
│   └── adapters/                # Framework adapters
│       ├── express/             # Express integration
│       ├── fastapi/             # FastAPI integration
│       ├── nestjs/              # NestJS integration
│       └── standalone/          # Framework-free
│
├── examples/                    # Working examples
└── docs/                        # Documentation
```

---

## Package Responsibilities

### @wai/core
**Purpose**: Pure orchestration logic with zero external dependencies

**Exports**:
- `WAIOrchestrationCoreV9` - Main orchestrator
- `OrchestrationFacade` - Unified API
- `UnifiedRoutingRegistry` - Plugin system
- `WAIRequestBuilder` - Type-safe requests

**Dependencies**: None (only `zod` for validation)

---

### @wai/protocols
**Purpose**: Protocol adapters with clear interfaces

**Exports**:
- `MCPServer` - Model Context Protocol server
- `ROMAManager` - ROMA autonomy level management
- `BMADFramework` - Behavioral pattern definitions
- `ParlantStandards` - Communication protocol
- `A2ACollaborationBus` - Agent-to-agent messaging
- `AGUIEventBridge` - AG-UI protocol adapter

**Dependencies**: `@wai/core`

**Abstraction**: All protocols expose registry interfaces, host apps provide implementations

---

### @wai/memory
**Purpose**: Memory and persistence layer

**Exports**:
- `Mem0Client` - mem0 integration
- `CAMMonitoring` - Performance tracking
- `StorageAdapter` - Abstract storage interface
- `VectorStore` - Semantic search

**Dependencies**: `@wai/core`

**Abstraction**: Provides `IStorageAdapter`, `IVectorStore` interfaces

---

### @wai/agents
**Purpose**: Agent definitions and coordination

**Exports**:
- `AgentCatalog` - 267+ agent definitions
- `AgentCoordinator` - Multi-agent workflows
- `AgentLoader` - Dynamic agent loading

**Dependencies**: `@wai/core`

---

### @wai/providers
**Purpose**: LLM provider adapters

**Exports**:
- 23+ provider classes
- `ProviderRegistry` - Provider discovery
- `UnifiedLLMAdapter` - Unified interface

**Dependencies**: `@wai/core`, individual SDKs (OpenAI, Anthropic, etc.)

---

### @wai/tools
**Purpose**: Tool ecosystem (80+ tools for Genspark parity)

**Exports**:
- `ToolRegistry` - Tool discovery
- `ToolExecutor` - Tool execution
- Catalog: Data analysis, web search, multimedia, APIs, etc.

**Dependencies**: `@wai/core`

---

### @wai/workflows
**Purpose**: Workflow orchestration and scheduling

**Exports**:
- `WorkflowScheduler` - Job scheduling
- `WorkflowExecutor` - Execution engine
- `VisualBuilder` - No-code workflow builder

**Dependencies**: `@wai/core`, `@wai/tools`

**Abstraction**: Provides `IJobQueue`, `IScheduler` interfaces

---

### @wai/adapters
**Purpose**: Framework-specific integrations

**Exports**:
- `ExpressAdapter` - Express.js integration
- `FastAPIAdapter` - Python FastAPI
- `NestJSAdapter` - NestJS integration
- `StandaloneAdapter` - Framework-free

**Dependencies**: All packages, framework-specific SDKs

---

## Interface Contracts

### Storage Adapter
```typescript
interface IStorageAdapter {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  query(filter: Record<string, unknown>): Promise<unknown[]>;
}
```

### Event Bus
```typescript
interface IEventBus {
  emit(event: string, data: unknown): Promise<void>;
  on(event: string, handler: (data: unknown) => void): void;
  off(event: string, handler: (data: unknown) => void): void;
}
```

### Job Queue
```typescript
interface IJobQueue {
  enqueue(job: Job): Promise<string>;
  dequeue(): Promise<Job | null>;
  getStatus(jobId: string): Promise<JobStatus>;
}
```

### Tool Registry
```typescript
interface IToolRegistry {
  register(tool: Tool): void;
  get(name: string): Tool | undefined;
  list(category?: string): Tool[];
  execute(name: string, params: unknown): Promise<unknown>;
}
```

---

## Comparison: Genspark vs WAI SDK

| Feature | Genspark | WAI SDK (Current) | WAI SDK (Target) |
|---------|----------|-------------------|------------------|
| **LLM Models** | 9 | 23+ | 25+ |
| **Agents** | N/A | 267+ | 300+ |
| **Tools** | 80+ | ~20 | 80+ |
| **Protocols** | MCP | ROMA, A2A, BMAD, Parlant | +MCP, OpenSpec |
| **Memory** | Context caching | CAM monitoring | +mem0, persistent |
| **Multi-modal** | Yes (voice, video, images) | Partial | Full support |
| **Visual Builder** | No | No | Yes (Sim Studio-like) |
| **No-code** | Yes | No | Yes |
| **Voice Calling** | Yes | No | Target v1.2 |
| **API Integrations** | Direct APIs | Provider SDKs | Direct + SDKs |
| **Benchmarks** | 87.8% GAIA | Not measured | Benchmarking suite |

---

## Missing for Genspark Parity

### Immediate Gaps
1. **Tool Ecosystem**: Need 60+ more tools
   - Data analysis (spreadsheets, charts, dashboards)
   - Web scraping (Firecrawl, Exa, Browser Use)
   - Multimedia (video, image, audio generation)
   - Communication (phone calls, SMS, email)
   - Productivity (calendar, scheduling, documents)

2. **MCP Protocol Server**: Full implementation
   - Tool/resource server
   - Prompt server
   - Context maintenance

3. **Visual Workflow Builder**: No-code interface
   - Drag-and-drop canvas (React Flow)
   - Node-based workflow design
   - Real-time execution preview

4. **Multi-modal Pipeline**: Voice, video, images
   - Voice: ElevenLabs, OpenAI Realtime API
   - Video: Runway, Luma, Pika
   - Images: DALL-E, Midjourney, Stable Diffusion

5. **Orchestration Scheduler**: Production job queue
   - PostgreSQL-backed job queue
   - Retry logic with exponential backoff
   - Parallel execution

6. **Deployment Tooling**: Cloud-ready
   - Docker/Kubernetes configs
   - AWS/GCP/Azure templates
   - Auto-scaling configuration

---

## Refactoring Plan

### Phase 1: Dependency Audit ✅ (Current)
- [x] Identify all copied files
- [x] Map external dependencies
- [x] Architect review complete

### Phase 2: Interface Extraction
- [ ] Create adapter interfaces
- [ ] Extract server-specific logic
- [ ] Implement dependency injection

### Phase 3: Multi-Package Structure
- [ ] Set up workspace (pnpm/yarn/npm workspaces)
- [ ] Split into 8 packages
- [ ] Define inter-package dependencies

### Phase 4: Tool Ecosystem
- [ ] Build tool registry
- [ ] Implement 80+ tools
- [ ] Create tool discovery system

### Phase 5: Protocols & Frameworks
- [ ] Complete MCP server implementation
- [ ] Enhance mem0 integration
- [ ] Add BMAD behavioral framework
- [ ] Integrate Parlant standards

### Phase 6: Visual Builder
- [ ] React Flow-based canvas
- [ ] Node definitions for agents/tools
- [ ] Execution engine

### Phase 7: Multi-modal
- [ ] Voice pipeline (ElevenLabs)
- [ ] Video generation (multiple providers)
- [ ] Image generation (DALL-E, Stable Diffusion)

### Phase 8: Production Hardening
- [ ] Comprehensive benchmarking
- [ ] Performance optimization
- [ ] Deployment templates
- [ ] Documentation complete

---

## Current Recommendations

1. **Keep Core Clean**: Don't add more files to `src/` until refactoring
2. **Document Dependencies**: For each of the 26 new files, list what they need
3. **Create Adapter Specs**: Define interfaces before implementations
4. **Build Tool Registry First**: Foundation for 80+ tools
5. **Defer UI Components**: Visual builder is separate package

---

## Next Steps

1. Complete dependency audit of 26 new files
2. Create comprehensive feature comparison document
3. Build version history and changelog
4. Design tool registry architecture
5. Prototype MCP server implementation

---

**Status**: Ready for Phase 2 - Interface Extraction
