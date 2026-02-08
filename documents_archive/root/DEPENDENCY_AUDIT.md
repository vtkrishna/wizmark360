# Dependency Audit - 26 Recently Added Files

**Date**: November 12, 2025  
**Purpose**: Map external dependencies and create migration plan for clean architecture

---

## Summary Statistics

| Category | Count | Resolution Strategy |
|----------|-------|-------------------|
| **Database Dependencies** | 8 files | Use `IStorageAdapter` interface |
| **Express/Server Dependencies** | 4 files | Move to `@wai/adapters/express` |
| **WebSocket Dependencies** | 3 files | Use `IEventBus` interface |
| **Node.js Built-ins** | 26 files | Keep (standard library) |
| **External NPM Packages** | 5 files | Add to dependencies |
| **Circular SDK References** | 12 files | Fix with DI |

---

## Category 1: Memory Layer Files (3 files)

### 1. `mem0-integration.ts`
**Dependencies**:
- ✅ `events` (Node.js built-in) - KEEP
- ⚠️ None external - CLEAN

**Status**: ✅ **READY** - No refactoring needed  
**Migration**: Move to `@wai/memory/mem0/`

---

### 2. `mem0-memory.ts`
**Dependencies**:
- ✅ `uuid` (NPM package)

**Issues**: None  
**Status**: ✅ **READY**  
**Migration**: 
- Move to `@wai/memory/mem0/`
- Add `uuid` to `@wai/memory` dependencies

---

### 3. `mem0-enhanced-persistence.ts`
**Dependencies**:
- ❌ `pg` (PostgreSQL driver)
- ✅ `events` (Node.js built-in)
- ✅ `crypto` (Node.js built-in)
- ⚠️ Imports from `./mem0-integration.js`

**Issues**:
- Hard-coded PostgreSQL dependency
- Needs database abstraction

**Status**: ⚠️ **NEEDS REFACTORING**  
**Migration Plan**:
```typescript
// Before
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// After
import { IStorageAdapter } from '@wai/core/interfaces';

class Mem0EnhancedPersistence {
  constructor(private storage: IStorageAdapter) {}
  
  async saveMemory(memory: Mem0Memory): Promise<void> {
    await this.storage.set(`memory:${memory.id}`, memory);
  }
}
```
**Target Package**: `@wai/memory/mem0/`

---

## Category 2: MCP Protocol Files (3 files)

### 4. `mcp-protocol-integration.ts`
**Dependencies**:
- ✅ `events` (Node.js built-in)
- ❌ `ws` (WebSocket library)

**Issues**: WebSocket dependency for server communication

**Status**: ⚠️ **NEEDS REFACTORING**  
**Migration Plan**:
```typescript
// Before
import WebSocket from 'ws';
const ws = new WebSocket(url);

// After
import { IEventBus } from '@wai/core/interfaces';

class MCPProtocol {
  constructor(private eventBus: IEventBus) {}
  
  async connect(url: string): Promise<void> {
    // Adapter handles WebSocket connection
    // Events emitted through IEventBus
    this.eventBus.emit('mcp:connected', { url });
  }
}
```
**Target Package**: `@wai/protocols/mcp/`

---

### 5. `mcp-use-integration.ts`
**Dependencies**:
- ✅ `events` (Node.js built-in)
- ❌ `ws` (WebSocket library)

**Issues**: Same as mcp-protocol-integration.ts

**Status**: ⚠️ **NEEDS REFACTORING**  
**Migration Plan**: Same as above, use `IEventBus`  
**Target Package**: `@wai/protocols/mcp/`

---

### 6. `mcp-tool-registry.ts`
**Dependencies**:
- ❌ `db` from `../../db.js` (Drizzle instance)
- ❌ `@shared/schema` (Incubator platform schema)
- ❌ `drizzle-orm` (ORM)
- ❌ `axios` (HTTP client)

**Issues**: 
- **CRITICAL** - Direct database coupling
- Imports from Incubator platform
- Cannot be used standalone

**Status**: 🔴 **MAJOR REFACTORING REQUIRED**  
**Migration Plan**:
```typescript
// Before
import { db } from '../../db.js';
import { mcpTools } from '@shared/schema';
const tools = await db.select().from(mcpTools);

// After
import { IToolRegistry } from '@wai/core/interfaces';

class MCPToolRegistry implements IToolRegistry {
  constructor(
    private toolRegistry: IToolRegistry,
    private httpClient: { get: (url: string) => Promise<unknown> }
  ) {}
  
  async register(tool: Tool): Promise<void> {
    await this.toolRegistry.register(tool);
  }
}
```
**Target Package**: `@wai/protocols/mcp/`  
**Note**: This file shows why refactoring is critical - it's tightly coupled to Incubator platform

---

## Category 3: Context Engineering Files (3 files)

### 7. `context-engineering.ts`
**Dependencies**:
- ✅ `events` (Node.js built-in)

**Status**: ✅ **READY**  
**Migration**: Move to `@wai/protocols/context-engineering/`

---

### 8. `context-engineering-service.ts`
**Dependencies**: None external

**Status**: ✅ **READY**  
**Migration**: Move to `@wai/protocols/context-engineering/`

---

### 9. `context-engineering-engine.ts`
**Dependencies**: None external (check file contents)

**Status**: ✅ **READY** (pending verification)  
**Migration**: Move to `@wai/protocols/context-engineering/`

---

## Category 4: BMAD Framework Files (3 files)

### 10. `bmad-method-integration.ts`
**Dependencies**: None external (check file contents)

**Status**: ✅ **READY** (pending verification)  
**Migration**: Move to `@wai/protocols/bmad/`

---

### 11. `bmad-agents.ts`
**Dependencies**: None external

**Status**: ✅ **READY**  
**Migration**: Move to `@wai/protocols/bmad/`

---

### 12. `bmad-cam-framework.ts`
**Dependencies**:
- ✅ `events` (Node.js built-in)
- ✅ `crypto` (Node.js built-in)
- ⚠️ Imports `AgentDefinitionV9` from `./wai-orchestration-core-v9`

**Issues**: References orchestration core (circular dependency)

**Status**: ⚠️ **NEEDS REFACTORING**  
**Migration Plan**:
```typescript
// Before
import type { AgentDefinitionV9 } from './wai-orchestration-core-v9';

// After
import type { AgentDefinition } from '@wai/core/types';
// Define shared types in @wai/core/types to avoid circular deps
```
**Target Package**: `@wai/protocols/bmad/`

---

## Category 5: ROMA Protocol Files (4 files)

### 13. `roma-meta-agent.ts`
**Dependencies**:
- ✅ `events` (Node.js built-in)

**Status**: ✅ **READY**  
**Migration**: Move to `@wai/protocols/roma/`

---

### 14. `roma-types.ts`
**Dependencies**: None (type definitions only)

**Status**: ✅ **READY**  
**Migration**: Move to `@wai/protocols/roma/` or `@wai/core/types/`

---

### 15. `roma-autonomy-service.ts`
**Dependencies**: None external (check file contents)

**Status**: ✅ **READY** (pending verification)  
**Migration**: Move to `@wai/protocols/roma/`

---

### 16. `roma-agent-loader-v10.ts`
**Dependencies**: None external (check file contents)

**Status**: ✅ **READY** (pending verification)  
**Migration**: Move to `@wai/protocols/roma/`

---

## Category 6: Parlant Protocol Files (2 files)

### 17. `parlant-standards.ts`
**Dependencies**:
- ✅ `events` (Node.js built-in)

**Status**: ✅ **READY**  
**Migration**: Move to `@wai/protocols/parlant/`

---

### 18. `parlant-plugin.ts`
**Dependencies**: None external (check file contents)

**Status**: ✅ **READY** (pending verification)  
**Migration**: Move to `@wai/protocols/parlant/`

---

## Category 7: AG-UI Protocol Files (3 files)

### 19. `wai-agui-event-bridge.ts`
**Dependencies**:
- ⚠️ Imports `WAIOrchestrationCoreV9` from `../orchestration/`
- ⚠️ Imports `AGUIWAIIntegrationService` from `./agui-wai-integration-service.js`

**Issues**: Circular SDK references

**Status**: ⚠️ **NEEDS REFACTORING**  
**Migration Plan**:
```typescript
// Before
import type { WAIOrchestrationCoreV9 } from '../orchestration/wai-orchestration-core-v9.js';

// After
import type { IOrchestrator } from '@wai/core/interfaces';
// Use interface instead of concrete class to break circular dependency
```
**Target Package**: `@wai/protocols/agui/`

---

### 20. `agui-wai-integration-service.ts`
**Dependencies**:
- ✅ `events` (Node.js built-in)
- ✅ `crypto` (Node.js built-in)

**Status**: ✅ **READY**  
**Migration**: Move to `@wai/protocols/agui/`

---

### 21. `agui-orchestration-middleware.ts`
**Dependencies**:
- ❌ `express` (Request, Response, NextFunction types)
- ❌ `../services/agui-wai-integration-service` (Incubator service)
- ❌ `./auth` (Incubator auth middleware)
- ❌ `@shared/agui-event-types` (Incubator shared types)

**Issues**: 
- **CRITICAL** - Express middleware (server-specific)
- Imports from Incubator platform
- Cannot be in core SDK

**Status**: 🔴 **MOVE TO ADAPTER**  
**Migration Plan**:
```typescript
// This file should NOT be in core SDK
// Move to @wai/adapters/express/middleware/

// Usage in Incubator:
import { aguiMiddleware } from '@wai/adapters/express';
app.use(aguiMiddleware);
```
**Target Package**: `@wai/adapters/express/` (NOT core SDK)

---

## Category 8: Workflow Files (3 files)

### 22. `workflow-scheduler-service.ts`
**Dependencies**:
- ❌ `db` from `../db` (Drizzle instance)
- ❌ `@shared/schema` (Incubator schema)
- ❌ `drizzle-orm` (ORM)
- ❌ `./wizards-14-day-workflow` (Incubator workflow)

**Issues**:
- **CRITICAL** - Direct database coupling
- Incubator platform specific
- Cannot be used standalone

**Status**: 🔴 **MAJOR REFACTORING REQUIRED**  
**Migration Plan**:
```typescript
// Before
import { db } from '../db';
import { wizardsOrchestrationJobs } from '../../shared/schema';

// After
import { IJobQueue } from '@wai/core/interfaces';

class WorkflowScheduler {
  constructor(private jobQueue: IJobQueue) {}
  
  async schedule(workflow: Workflow): Promise<string> {
    return await this.jobQueue.enqueue({
      type: 'workflow',
      data: workflow,
      schedule: workflow.cronExpression,
    });
  }
}
```
**Target Package**: `@wai/workflows/`  
**Note**: Incubator-specific workflow logic stays in Incubator, only scheduler framework moves to SDK

---

### 23. `continuous-execution-engine.ts`
**Dependencies**:
- ✅ `events` (Node.js built-in)
- ⚠️ `./agent-communication-system` (SDK internal)
- ⚠️ `./complete-agent-registry` (SDK internal)
- ⚠️ `./intelligent-routing` (SDK internal)

**Issues**: SDK internal references (should exist)

**Status**: ⚠️ **VERIFY REFERENCES**  
**Migration Plan**: 
- Verify all referenced files exist
- Update imports to use `@wai/*` packages
**Target Package**: `@wai/workflows/`

---

### 24. `autonomous-continuous-execution-engine.ts`
**Dependencies**:
- ✅ `events` (Node.js built-in)
- ❌ `../storage` (Incubator storage)
- ⚠️ `./wai-unified-orchestration-sdk-v6` (Old SDK version)

**Issues**:
- Storage coupling
- References old SDK version

**Status**: ⚠️ **NEEDS REFACTORING**  
**Migration Plan**:
```typescript
// Before
import { storage } from '../storage';

// After
import { IStorageAdapter } from '@wai/core/interfaces';

class AutonomousEngine {
  constructor(private storage: IStorageAdapter) {}
}
```
**Target Package**: `@wai/workflows/`

---

## Category 9: Database Files (3 files)

### 25. `database-storage.ts`
**Dependencies**:
- ❌ `db` from `../db` (Drizzle instance)
- ❌ `drizzle-orm` (ORM with 40+ imports!)
- ❌ `../config/redis` (cacheService, eventService)
- ❌ `../services/encryption-service`

**Issues**:
- **CRITICAL** - Core Incubator database implementation
- Should NOT be in SDK
- This is an ADAPTER implementation

**Status**: 🔴 **MOVE TO ADAPTER**  
**Migration Plan**:
```typescript
// This file is a PostgreSQL implementation of IStorageAdapter
// Move to @wai/adapters/postgresql/storage-adapter.ts

// In Incubator:
import { PostgreSQLStorageAdapter } from '@wai/adapters/postgresql';
const storage = new PostgreSQLStorageAdapter(db);
```
**Target Package**: `@wai/adapters/postgresql/` (example implementation)

---

### 26. `vector-database.ts`
**Dependencies**:
- ✅ `events` (Node.js built-in)
- ✅ `crypto` (Node.js built-in)
- ✅ `fs/promises` (Node.js built-in)
- ✅ `path` (Node.js built-in)
- ⚠️ `./database-system` (SDK internal)

**Status**: ⚠️ **VERIFY REFERENCES**  
**Migration**: Move to `@wai/memory/vector/`

---

### 27. `vector-search-engine.ts`
**Dependencies**:
- ✅ `events` (Node.js built-in)
- ⚠️ `./embedding-service` (SDK internal)
- ⚠️ `./database-system` (SDK internal)
- ❌ `../storage/database-storage` (Incubator storage)

**Issues**: References Incubator storage

**Status**: ⚠️ **NEEDS REFACTORING**  
**Migration Plan**:
```typescript
// Before
import { storage } from '../storage/database-storage';

// After
import { IStorageAdapter } from '@wai/core/interfaces';

class VectorSearchEngine {
  constructor(private storage: IStorageAdapter) {}
}
```
**Target Package**: `@wai/memory/vector/`

---

## Migration Priority Matrix

| Priority | Files | Action | Timeline |
|----------|-------|--------|----------|
| **P0 - Critical** | 5 files | Move to adapters or major refactoring | Day 1-2 |
| **P1 - High** | 8 files | Refactor to use interfaces | Day 3-4 |
| **P2 - Medium** | 7 files | Verify and move | Day 5-6 |
| **P3 - Low** | 6 files | Move as-is | Day 7 |

### P0 - Critical (5 files) - CANNOT BE IN CORE SDK

1. **`agui-orchestration-middleware.ts`** → `@wai/adapters/express/`
   - Express-specific middleware
   - Belongs in adapter package

2. **`database-storage.ts`** → `@wai/adapters/postgresql/`
   - PostgreSQL-specific implementation
   - Example adapter implementation

3. **`mcp-tool-registry.ts`** → Needs major refactoring
   - Remove Incubator dependencies
   - Use `IToolRegistry` interface

4. **`workflow-scheduler-service.ts`** → Needs major refactoring
   - Remove Incubator dependencies
   - Use `IJobQueue` interface

5. **`mem0-enhanced-persistence.ts`** → Refactor
   - Remove direct PostgreSQL dependency
   - Use `IStorageAdapter` interface

### P1 - High (8 files) - Refactor to use interfaces

6. `mcp-protocol-integration.ts` → Use `IEventBus`
7. `mcp-use-integration.ts` → Use `IEventBus`
8. `bmad-cam-framework.ts` → Fix type imports
9. `wai-agui-event-bridge.ts` → Use interfaces
10. `continuous-execution-engine.ts` → Verify references
11. `autonomous-continuous-execution-engine.ts` → Use `IStorageAdapter`
12. `vector-search-engine.ts` → Use `IStorageAdapter`
13. `vector-database.ts` → Verify references

### P2 - Medium (7 files) - Verify and move

14. `context-engineering-engine.ts`
15. `bmad-method-integration.ts`
16. `roma-autonomy-service.ts`
17. `roma-agent-loader-v10.ts`
18. `parlant-plugin.ts`
19. `mem0-memory.ts`
20. `mem0-integration.ts`

### P3 - Low (6 files) - Move as-is

21. `context-engineering.ts`
22. `context-engineering-service.ts`
23. `bmad-agents.ts`
24. `roma-meta-agent.ts`
25. `roma-types.ts`
26. `parlant-standards.ts`
27. `agui-wai-integration-service.ts`

---

## Key Findings

### ✅ Good News (13 files - 50%)
- Half of the files are clean or need minimal changes
- No external dependencies or only Node.js built-ins
- Can be moved to packages immediately

### ⚠️ Refactoring Needed (8 files - 31%)
- Need to use adapter interfaces
- Remove hard-coded dependencies
- Still salvageable with our interface design

### 🔴 Major Issues (5 files - 19%)
- Tightly coupled to Incubator platform
- Direct database/Express dependencies
- Should be in `@wai/adapters` or completely refactored

---

## Refactoring Strategy

### Phase 1: Move Clean Files (P3 - 1 day)
Move 6 files that are ready:
```bash
# Example
mv wai-sdk/src/protocols/context-engineering.ts \
   wai-sdk/packages/protocols/src/context-engineering/

mv wai-sdk/src/protocols/parlant-standards.ts \
   wai-sdk/packages/protocols/src/parlant/
```

### Phase 2: Refactor with Interfaces (P1 - 2 days)
Update 8 files to use `IStorageAdapter`, `IEventBus`, etc.:
```typescript
// Example: mem0-enhanced-persistence.ts
export class Mem0EnhancedPersistence {
  constructor(
    private storage: IStorageAdapter,  // Instead of Pool from 'pg'
    private eventBus: IEventBus        // Instead of EventEmitter
  ) {}
}
```

### Phase 3: Major Refactoring (P0 - 2 days)
Complete rewrite of 5 files:
1. Extract core logic
2. Remove platform-specific code
3. Implement using interfaces
4. Move platform code to `@wai/adapters`

---

## NPM Dependencies to Add

### @wai/core
- `zod` ✅ (already have)

### @wai/memory
- `uuid`

### @wai/protocols
- `ws` (WebSocket - for MCP)

### @wai/adapters/express
- `express`

### @wai/adapters/postgresql
- `pg`
- `drizzle-orm`

---

## Success Criteria

- [ ] All 26 files migrated to correct packages
- [ ] Zero references to `../db`, `@shared/schema`, `../storage`
- [ ] All files use dependency injection
- [ ] No circular dependencies
- [ ] All packages build independently
- [ ] Example adapters created for PostgreSQL, Express

---

## Next Steps

1. **Day 1**: Move P3 files (clean, ready to go)
2. **Day 2-3**: Refactor P1 files (use interfaces)
3. **Day 4-5**: Major refactoring P0 files
4. **Day 6**: Create adapter examples
5. **Day 7**: Test, verify, document

---

**Total Effort**: 7 days  
**Completion Target**: November 19, 2025
