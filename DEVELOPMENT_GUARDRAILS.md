# WizMark 360 — Development Guardrails

These guardrails are mandatory for all future development. Every new feature, fix, or enhancement must comply with every rule below. No exceptions.

---

## 1. Zero Mock / Zero Stub / Zero Placeholder Policy

- **No dummy data**: Never return hardcoded sample values, placeholder text, `lorem ipsum`, fake metrics, or computed/seeded random data in any production code path.
- **No stub functions**: Every function must be fully implemented. If a service dependency is not yet available, return a clear `{ value: 0, dataSource: 'awaiting_data' }` response or throw a descriptive error — never return fake results.
- **No temporary files**: Never create files like `temp-fix.ts`, `quick-hack.ts`, `test-patch.ts`, or `v2-experiment.ts`. Every file must be permanent and production-quality from the start.
- **No `TODO` shortcuts**: If something cannot be fully implemented in this pass, document it as a tracked task — do not leave `// TODO: implement later` stubs that return mock values.
- **Data transparency**: All API responses that return metrics must include `dataSource` attribution (`'database'`, `'live'`, `'platform'`, `'awaiting_data'`) so the frontend knows exactly where each value comes from.

---

## 2. Architecture-First Development

Before writing any code for a new feature, you must:

### 2.1 Understand Existing Architecture
- **Read `replit.md`** for current project state, architecture decisions, and recent changes.
- **Read `server/config/platform-config.ts`** for all centralized platform settings.
- **Read `shared/llm-config.ts`** for all LLM provider/model definitions.
- **Read `server/config/feature-flags.ts`** for feature toggle patterns.
- **Scan existing routes** in `server/routes/` to find related endpoints.
- **Scan existing services** in `server/services/` to find reusable logic.
- **Scan existing pages** in `client/src/pages/` and components in `client/src/components/` to find UI patterns.

### 2.2 Wire to Existing Features
- **Never create parallel/duplicate implementations**. If a service already handles part of your feature, extend it — do not create a new file doing the same thing.
- **Reuse existing utilities**: Use `shared/llm-config.ts` for model lookups, `server/config/platform-config.ts` for environment config, `server/services/unified-llm-service.ts` for LLM calls.
- **Follow existing route registration**: All routes are registered in `server/index.ts`. New routes must be added there, following the same pattern.
- **Follow existing page registration**: All pages are registered in `client/src/App.tsx`. New pages must be added there, following the same pattern.
- **Follow existing sidebar navigation**: Sidebar items are defined in `client/src/components/sidebar.tsx`. New pages must be added to the sidebar.

### 2.3 No Orphaned Code
- Every new backend route must have a corresponding frontend page or component that calls it.
- Every new frontend page must have a corresponding backend API that serves its data.
- Every new service must be imported and used by at least one route.
- Dead code (unused imports, unreachable functions, commented-out blocks) must be removed.

---

## 3. Configuration-Driven Development

### 3.1 Centralized Config Files
All configurable values must live in config files, never hardcoded in business logic:

| What | Config File | Example |
|------|-------------|---------|
| Server settings (port, host, environment) | `server/config/platform-config.ts` | `platformConfig.server.port` |
| LLM providers, models, costs, capabilities | `shared/llm-config.ts` | `LLM_PROVIDERS`, `FLAGSHIP_MODELS` |
| Feature toggles | `server/config/feature-flags.ts` | `FEATURE_FLAGS.UNIFIED_SESSION_MANAGEMENT` |
| OAuth credentials | `server/config/platform-config.ts` → `oauth` | `platformConfig.oauth.google.clientId` |
| External service credentials | `server/config/platform-config.ts` → `services` | `platformConfig.services.razorpay.keyId` |
| API base URL (client) | `client/src/services/config.ts` | `getAPIConfig().baseUrl` |
| WAI SDK settings | `utils/config.ts` | `DEFAULT_WAI_CONFIG` |
| Database connection | `server/config/platform-config.ts` → `database` | `platformConfig.database.url` |
| Agent registry metadata | `server/config/platform-config.ts` → `agents` | `platformConfig.agents.totalAgents` |

### 3.2 What Must Never Be Hardcoded
- **API keys and secrets** — Always use `process.env.VARIABLE_NAME` via centralized config files (`platform-config.ts` or domain-specific config like `oauth-config.ts`).
- **Model names** — Always reference `shared/llm-config.ts`. Never write `'gpt-4o'` directly in service code.
- **API URLs and endpoints** — Always derive from config or environment variables.
- **Port numbers** — Always use `platformConfig.server.port`.
- **Feature-specific thresholds** (rate limits, timeouts, max retries) — Always use config constants.
- **Provider-specific logic** — Route through the unified LLM service, not direct API calls scattered in business logic.

### 3.3 Adding New Configuration
When a new feature needs configurable values:
1. Add the config to the appropriate section of `server/config/platform-config.ts`.
2. Use environment variables for anything that changes between environments.
3. Provide sensible defaults for development.
4. Document the new config key in this guardrails document and in `replit.md`.

---

## 4. File and Code Organization

### 4.1 Directory Structure Rules
```
server/
  config/         — All configuration (platform, features, oauth, etc.)
  routes/         — Express route handlers (one file per feature domain)
  services/       — Business logic services (one file per service domain)
  middleware/     — Express middleware
  storage.ts      — Database storage interface
shared/
  schema.ts       — Drizzle ORM schema (DO NOT MODIFY without explicit instruction)
  market360-schema.ts — Market360 schema (DO NOT MODIFY without explicit instruction)
  llm-config.ts   — LLM providers, models, capabilities
client/
  src/
    pages/        — Top-level page components (one file per page)
    components/   — Reusable UI components
    hooks/        — Custom React hooks
    lib/          — Utility functions
    services/     — API client services
```

### 4.2 Naming Conventions
- **Route files**: `{feature-domain}-routes.ts` (e.g., `marketing-chat-routes.ts`)
- **Service files**: `{feature-domain}-service.ts` (e.g., `unified-llm-service.ts`)
- **Page files**: `{page-name}.tsx` using kebab-case (e.g., `content-calendar.tsx`)
- **Component files**: `{ComponentName}.tsx` using PascalCase (e.g., `Sidebar.tsx`)
- **Config files**: `{domain}-config.ts` (e.g., `platform-config.ts`)

### 4.3 No Duplicate Files
Before creating any new file, search for existing files that handle the same domain:
- `grep` for the feature name across `server/routes/`, `server/services/`, and `client/src/`
- If a related file exists, extend it instead of creating a new one
- If the existing file is too large (>500 lines), refactor by extracting into well-named sub-modules — not by creating a parallel file

---

## 5. Database Safety

- **Never modify `shared/schema.ts` or `shared/market360-schema.ts`** without explicit instruction.
- **Never change primary key column types** — this breaks existing data.
- **Use Drizzle ORM** for all database operations. No raw SQL in business logic.
- **Use `npm run db:push`** for schema synchronization. Never write manual SQL migrations.
- **Separate queries for separate tables** — If one table doesn't exist, other queries must still succeed (use individual try/catch blocks per table).
- **Never execute destructive SQL** (DROP, DELETE, UPDATE) without explicit user approval.

---

## 6. API Design Standards

### 6.1 Response Format
All API responses must follow this structure:
```typescript
// Success
{ success: true, data: { ... }, metadata: { dataSource: 'database' | 'live' | 'awaiting_data', generatedAt: ISO_timestamp } }

// Error
{ success: false, error: { message: string, code: string } }
```

### 6.2 KPI / Metric Responses
All numeric metrics must return `{ value: number, dataSource: string }` objects:
```typescript
{ totalBrands: { value: 5, dataSource: 'database' } }
```
Never return raw numbers without source attribution.

### 6.3 Error Handling
- Every route handler must have a top-level try/catch.
- Return meaningful error messages — never expose stack traces to the client.
- Use graceful degradation: if an optional dependency fails, the main response must still succeed with partial data.
- Database queries for tables that may not exist must be individually wrapped in try/catch.

---

## 7. Frontend Standards

### 7.1 Empty States
When no data exists, show helpful empty state messages that guide the user to take action:
```
"No strategies created yet. Click 'Create Strategy' to get started."
"Connect your ad platforms to enable real-time performance monitoring."
```
Never show blank screens, loading spinners that never resolve, or placeholder data.

### 7.2 Data Source Indicators
Use visual indicators (badges, icons, tooltips) to show whether displayed data is:
- **Live** — From real-time database or API
- **Estimated** — Computed from available data
- **Awaiting Data** — No real data yet, showing zeros

### 7.3 Component Reuse
- Check `client/src/components/` before creating new UI components.
- Use the existing design system (Tailwind + shadcn/ui patterns).
- Share common UI patterns (cards, tables, charts, modals) across pages.

---

## 8. LLM Integration Standards

- **All LLM calls from routes and business logic** must go through `server/services/unified-llm-service.ts` — the approved entrypoint for all AI generation.
- **Provider implementations** live in `server/services/llm-providers/` — these are the low-level SDK wrappers. Route handlers and page components must never import these directly; they must use the unified service which manages provider selection and fallback.
- **Never import OpenAI/Anthropic/Gemini SDKs directly** in route files, page components, or business logic services.
- **Model selection** must use the config from `shared/llm-config.ts` and `server/config/platform-config.ts`.
- **Cost tracking**: Every LLM call must log token usage and cost for monitoring.
- **Fallback chain**: If the primary provider fails, fall back through the configured providers (OpenAI → OpenRouter → Gemini → Groq).
- **No hardcoded model names** in any file except `shared/llm-config.ts` and `server/config/platform-config.ts`.

---

## 9. Workflow and Context Preservation

### 9.1 Before Any Change
1. Read `replit.md` for current state.
2. Understand the feature's relationship to existing features.
3. Identify all files that need to change (backend route, service, frontend page, config, sidebar navigation).

### 9.2 After Every Change
1. Update `replit.md` with what changed, when, and why.
2. Restart the application workflow and verify it runs without errors.
3. Verify the new feature is accessible from the UI (sidebar, navigation, or direct URL).
4. Verify all existing features still work (no regressions).

### 9.3 Version Tracking
- Every significant change must be logged in the `Recent Changes` section of `replit.md` with a date and description.
- Feature additions must update the `Feature Specifications` section of `replit.md`.

---

## 10. Prohibited Practices

| Practice | Why It's Banned |
|----------|----------------|
| `Math.random()` or `seededRandom()` for data | Creates fake metrics that mislead users |
| `const sampleData = [...]` in production paths | Placeholder data pollutes real dashboards |
| Creating `*-v2.ts`, `*-new.ts`, `*-temp.ts` files | Creates confusion and duplicate logic |
| Direct `process.env.X` reads in business logic | Must go through `platform-config.ts` |
| Hardcoded model names like `'gpt-4o'` in services | Must reference `llm-config.ts` |
| Raw SQL strings in route handlers | Must use Drizzle ORM |
| `console.log` for production logging | Use structured logging with levels |
| Importing LLM SDKs directly in routes | Must use `unified-llm-service.ts` |
| Creating routes without registering in `server/index.ts` | Orphaned routes are invisible |
| Creating pages without adding to `client/src/App.tsx` | Orphaned pages are unreachable |
| Modifying `shared/schema.ts` without permission | Database schema is protected |
| Returning raw numbers for metrics | Must use `{ value, dataSource }` format |

---

## 11. Pre-Commit Checklist

Before considering any feature complete:

- [ ] No hardcoded values — all configurable items in config files
- [ ] No mock/placeholder data in any code path
- [ ] All new routes registered in `server/index.ts`
- [ ] All new pages registered in `client/src/App.tsx` and sidebar
- [ ] All new config keys documented in `replit.md`
- [ ] All API responses follow the standard format with `dataSource`
- [ ] Empty states provide user guidance (not blank screens)
- [ ] Error handling with graceful degradation
- [ ] No duplicate files or parallel implementations
- [ ] `replit.md` updated with changes
- [ ] Application restarts and runs without errors
- [ ] Existing features verified (no regressions)
