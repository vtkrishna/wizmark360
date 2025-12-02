# WAI SDK v1.0 - Package Files Reference

**Complete list of files included in the standalone WAI SDK Orchestration package**

---

## 📦 Core Source Files

### Services (src/services/)

**Primary Services:**
- `real-llm-service.ts` (2,014 lines)
  - 23+ LLM provider integration
  - 752+ model support
  - Intelligent routing & 5-level fallback
  - Cost optimization & performance tracking
  - Source: `server/services/real-llm-service.ts`

- `wizards-orchestration-service.ts` (700+ lines)
  - Main orchestration engine
  - Agent bundle management (267+ agents)
  - Studio workflow execution
  - AG-UI integration
  - Source: `server/services/wizards-orchestration-service.ts`

- `agui-wai-integration-service.ts` (776 lines)
  - Real-time SSE/WebSocket streaming
  - 16+ AG-UI event types
  - Session management
  - Human-in-the-loop approvals
  - Source: `server/services/agui-wai-integration-service.ts`

- `shared-agui-service.ts` (27 lines)
  - Singleton AG-UI instance
  - Ensures session consistency
  - Source: `server/services/shared-agui-service.ts`

### Orchestration Core (src/orchestration/)

- `wai-orchestration-core-v9.ts` (4,767 lines)
  - Complete orchestration implementation
  - 267+ agent definitions
  - ROMA standards (L1-L4 autonomy)
  - Dual-clock architecture
  - Fail-fast error handling
  - Source: `server/orchestration/wai-orchestration-core-v9.ts`

### Type Definitions (src/types/)

- `orchestration.types.ts`
  - OrchestrationRequest interface
  - OrchestrationResult interface
  - Agent & provider types
  - Workflow types
  - Source: `shared/wizards-incubator-types.ts`

- `agui-event.types.ts`
  - AG-UI event interfaces
  - Session types
  - Streaming configuration
  - Source: `shared/agui-event-types.ts`

### Utilities (src/utils/)

- `wai-request-builder.ts`
  - Fluent API for building requests
  - Type-safe request construction
  - AG-UI session integration
  - Source: `server/builders/wai-request-builder.ts`

- `clock-provider.ts`
  - Deterministic time provider
  - Testing support
  - Seed-based clock
  - Source: `server/services/clock-provider.ts`

### Routes (src/routes/)

- `orchestration.routes.ts`
  - POST /api/wai/execute
  - GET /api/wai/status/:jobId
  - GET /api/wai/health
  - GET /api/wai/agents
  - GET /api/wai/providers

- `agui-streaming.routes.ts`
  - GET /api/agui/stream/:sessionId (SSE)
  - POST /api/agui/session
  - POST /api/agui/interrupt/:sessionId/respond
  - GET /api/agui/health

### Main Export (src/)

- `index.ts`
  - Main package export
  - WAIOrchestration class
  - AGUIService class
  - Router factories
  - Type exports

---

## 📚 Documentation Files

### Main Documentation
- `README.md` - Complete usage guide (500+ lines)
- `INTEGRATION_GUIDE.md` - Step-by-step integration (600+ lines)
- `WAI_SDK_DOWNLOAD_GUIDE.md` - Download instructions (400+ lines)

### API Documentation (docs/)
- `API_REFERENCE.md` - Detailed API documentation
- `EXAMPLES.md` - Code examples with explanations
- `TROUBLESHOOTING.md` - Common issues and solutions
- `ARCHITECTURE.md` - System architecture diagrams

---

## 🔧 Configuration Files

### Package Configuration
- `package.json`
  - Dependencies (20+ packages)
  - Scripts (dev, build, test, lint)
  - Metadata (name, version, license)

- `tsconfig.json`
  - TypeScript configuration
  - Path mappings
  - Compiler options

- `.env.example`
  - Environment variable template
  - API key placeholders
  - Configuration options

### Build Configuration
- `.gitignore` - Git ignore patterns
- `.npmignore` - NPM publish ignore patterns
- `.prettierrc` - Code formatting rules
- `.eslintrc.json` - Linting rules

---

## 📖 Example Files (examples/)

### Basic Examples
- `basic.ts` - Simple orchestration
- `express-server.ts` - Express.js integration
- `standalone-service.ts` - Microservice setup

### Advanced Examples
- `agui-streaming.ts` - Real-time streaming
- `multi-agent.ts` - Multi-agent workflows
- `cost-optimization.ts` - Budget-aware execution
- `custom-providers.ts` - Custom provider setup
- `testing.ts` - Testing with WAI SDK

### Integration Examples
- `nextjs-integration.ts` - Next.js app integration
- `fastify-integration.ts` - Fastify integration
- `nestjs-integration.ts` - NestJS integration
- `worker-threads.ts` - Background job processing

---

## 🗂️ Data Files (config/)

### Agent Manifests
- `agent-manifests_*.json`
  - 267+ agent definitions
  - ROMA workflows
  - Agent capabilities
  - Specializations

### Provider Configurations
- `provider-configs.json`
  - 23+ provider definitions
  - Model mappings
  - Cost tables
  - Rate limits

---

## 📊 File Size Summary

### Source Code
| Category | Files | Lines | Size |
|----------|-------|-------|------|
| Core Services | 4 | ~3,500 | ~180KB |
| Orchestration Core | 1 | ~4,700 | ~250KB |
| Types | 2 | ~800 | ~40KB |
| Utilities | 2 | ~500 | ~25KB |
| Routes | 2 | ~300 | ~15KB |
| Main Export | 1 | ~200 | ~10KB |
| **Total Source** | **12** | **~10,000** | **~520KB** |

### Documentation
| File | Lines | Size |
|------|-------|------|
| README.md | ~500 | ~50KB |
| INTEGRATION_GUIDE.md | ~600 | ~60KB |
| WAI_SDK_DOWNLOAD_GUIDE.md | ~400 | ~40KB |
| API_REFERENCE.md | ~800 | ~80KB |
| EXAMPLES.md | ~400 | ~40KB |
| **Total Docs** | **~2,700** | **~270KB** |

### Examples
| File | Lines | Size |
|------|-------|------|
| 8 Example Files | ~1,200 | ~60KB |

### Configuration
| File | Lines | Size |
|------|-------|------|
| package.json | ~80 | ~4KB |
| tsconfig.json | ~30 | ~1KB |
| .env.example | ~50 | ~2KB |
| **Total Config** | **~160** | **~7KB** |

### **Grand Total**
- **Files**: ~30
- **Lines of Code**: ~14,000
- **Source Size**: ~860KB
- **With node_modules**: ~150MB (typical)

---

## 🔗 File Dependencies

### Core Dependency Chain

```
index.ts (main export)
├── services/
│   ├── real-llm-service.ts
│   │   └── (OpenAI, Anthropic, Google SDKs)
│   │
│   ├── wizards-orchestration-service.ts
│   │   ├── real-llm-service.ts
│   │   ├── wai-orchestration-core-v9.ts
│   │   ├── agui-wai-integration-service.ts
│   │   └── wai-request-builder.ts
│   │
│   ├── agui-wai-integration-service.ts
│   │   └── types/agui-event.types.ts
│   │
│   └── shared-agui-service.ts
│       └── agui-wai-integration-service.ts
│
├── orchestration/
│   └── wai-orchestration-core-v9.ts
│       └── real-llm-service.ts
│
├── types/
│   ├── orchestration.types.ts
│   └── agui-event.types.ts
│
├── utils/
│   ├── wai-request-builder.ts
│   │   ├── types/orchestration.types.ts
│   │   └── agui-wai-integration-service.ts
│   │
│   └── clock-provider.ts
│
└── routes/
    ├── orchestration.routes.ts
    │   └── services/wizards-orchestration-service.ts
    │
    └── agui-streaming.routes.ts
        └── services/shared-agui-service.ts
```

---

## ✅ Files Checklist

### Core Files (Required)
- [ ] src/services/real-llm-service.ts
- [ ] src/services/wizards-orchestration-service.ts
- [ ] src/services/agui-wai-integration-service.ts
- [ ] src/services/shared-agui-service.ts
- [ ] src/orchestration/wai-orchestration-core-v9.ts
- [ ] src/types/orchestration.types.ts
- [ ] src/types/agui-event.types.ts
- [ ] src/utils/wai-request-builder.ts
- [ ] src/utils/clock-provider.ts
- [ ] src/index.ts

### Routes (Optional but Recommended)
- [ ] src/routes/orchestration.routes.ts
- [ ] src/routes/agui-streaming.routes.ts

### Configuration (Required)
- [ ] package.json
- [ ] tsconfig.json
- [ ] .env.example

### Documentation (Highly Recommended)
- [ ] README.md
- [ ] INTEGRATION_GUIDE.md
- [ ] WAI_SDK_DOWNLOAD_GUIDE.md

### Examples (Recommended for Learning)
- [ ] examples/basic.ts
- [ ] examples/express-server.ts
- [ ] examples/agui-streaming.ts

---

## 📋 Files to Copy from Wizards Platform

If building from the Wizards Incubator Platform, copy these files:

```bash
# Core Services
cp server/services/real-llm-service.ts wai-sdk-orchestration/src/services/
cp server/services/wizards-orchestration-service.ts wai-sdk-orchestration/src/services/
cp server/services/agui-wai-integration-service.ts wai-sdk-orchestration/src/services/
cp server/services/shared-agui-service.ts wai-sdk-orchestration/src/services/

# Orchestration Core
cp server/orchestration/wai-orchestration-core-v9.ts wai-sdk-orchestration/src/orchestration/

# Type Definitions
cp shared/wizards-incubator-types.ts wai-sdk-orchestration/src/types/orchestration.types.ts
cp shared/agui-event-types.ts wai-sdk-orchestration/src/types/

# Utilities
cp server/builders/wai-request-builder.ts wai-sdk-orchestration/src/utils/
cp server/services/clock-provider.ts wai-sdk-orchestration/src/utils/

# Agent Manifests (optional)
cp agent-manifests_*.json wai-sdk-orchestration/config/
```

---

## 🚀 Building the Package

After all files are in place:

```bash
cd wai-sdk-orchestration

# Install dependencies
npm install

# Build TypeScript
npm run build

# Verify build
ls -la dist/

# Test
npx tsx examples/basic.ts
```

---

**Package Ready!** All files documented and ready for use. 🎉
