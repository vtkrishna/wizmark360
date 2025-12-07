# Market360 (Wizards MarketAI 360) - Self-Driving Agency Platform

## Project Overview
- **Name**: Market360 - Self-Driving Agency Platform
- **Type**: Full-stack TypeScript application (React + Express)
- **Database**: PostgreSQL with Drizzle ORM
- **Backbone**: WAI SDK Orchestration Platform (267+ autonomous agents)
- **Marketing Verticals**: 7 (Social, SEO, Web, Sales, WhatsApp, LinkedIn, Performance)

## Current Status (Replit Environment)

### ✅ Working Features
1. **Market360 Dashboard**: God Mode interface at /market360 with live API data
2. **Landing Page**: Beautiful 7-vertical display at /
3. **API Routes**: Full CRUD endpoints for all verticals at /api/market360/*
4. **Database**: PostgreSQL with Market360 tables (campaigns, leads, ads, etc.)
5. **Chief of Staff Chat**: AI-powered marketing command interface
6. **Agent Activity Feed**: Real-time agent orchestration display
7. **KPI Metrics**: Live stats from database

### ⚠️ Technical Notes
1. **Simplified Codebase**: The GitHub import was incomplete. The App.tsx has been simplified to only use available pages (Market360, OrchestrationDashboard, NotFound).
2. **Agent Orchestration**: Full WAI SDK agent orchestration requires AI provider API keys (OpenAI, Anthropic, etc.) to be configured. The platform is ready to accept these configurations.

2. **Missing Modules Created (Stubs)**:
   - `server/monitoring/sentry.ts`
   - `wai-sdk/integrations/production-integration-manager.ts`
   - `wai-sdk/persistence/production-database.ts`
   - `wai-sdk/security/production-auth.ts`
   - `wai-sdk/packages/protocols/src/mcp/server.ts`
   - `wai-sdk/packages/tools/src/registry/tool-registry.ts`
   - `server/shared/orchestration-core.ts`

### 📝 Next Steps for User
The imported codebase appears to be incomplete or was not fully committed to the GitHub repository. To get this working, you'll need to:

1. **Option A - Simplify**: Create a minimal working version by commenting out missing imports in `server/index.ts` and starting with a basic Express + React setup

2. **Option B - Complete Import**: If you have access to the full codebase:
   - Check the original repository for all missing files
   - Import the complete `server/` directory structure
   - Ensure all modules referenced in `server/index.ts` are present

3. **Option C - Fresh Start**: Use this as a template and build incrementally:
   - Start with basic auth and database
   - Add AI provider integrations one by one
   - Build the agent orchestration layer gradually

## Configuration Files

### Package Manager
- Using **pnpm** (workspace configuration present)
- Node.js 18+ required

### Database Configuration
- Drizzle ORM with PostgreSQL driver
- Schema: `shared/schema.ts` (8300+ lines - very comprehensive)
- Note: Vector indexes temporarily disabled for drizzle-kit 0.20.x compatibility

### Build Commands
- **Development**: `npm run dev` (tsx watch mode)
- **Production Build**: `npm run build` (Vite + esbuild bundle)
- **Database**: `npm run db:push` (sync schema)

## Port Configuration
- **Frontend + Backend**: Port 5000 (unified server with Vite middleware)
- **Database**: Internal PostgreSQL (DATABASE_URL env var)

## Required Secrets (To be added via Secrets UI)
- OPENAI_API_KEY (optional)
- ANTHROPIC_API_KEY (optional)
- GEMINI_API_KEY (optional)
- Other AI provider keys as needed

## File Structure Issues
The codebase expects this structure but many files are missing:
```
server/
├── index.ts (main entry - has many missing imports)
├── routes/ (exists)
├── orchestration/ (mostly missing)
├── services/ (mostly missing)
├── integrations/ (mostly missing)
├── workers/ (missing)
├── observability/ (missing)
└── monitoring/ (created stub)
```

## Replit-Specific Configuration
- Vite configured with `allowedHosts: true` for proxy support
- Server binds to `0.0.0.0:5000` for Replit webview
- HMR configured for WSS on port 443
- Replit Vite plugins installed and configured

## Recent Changes
- 2025-12-05: Initial Replit environment setup
- 2025-12-05: Created stub files for missing modules
- 2025-12-05: Configured database with pgvector extension
- 2025-12-05: Updated package.json scripts for drizzle-kit 0.20.x
- 2025-12-05: Created minimal server entry point (server/index.minimal.ts)
- 2025-12-06: **Built Market360 Self-Driving Agency Platform**
- 2025-12-06: Created Market360 database schema (shared/market360-schema.ts)
- 2025-12-06: Created Market360 API routes (server/routes/market360.ts)
- 2025-12-06: Built God Mode Dashboard (client/src/pages/market360-dashboard.tsx)
- 2025-12-06: Integrated Market360 schema into WAI SDK backbone
- 2025-12-06: Created database tables with market360_ prefix
- 2025-12-06: Wired frontend to live API data with React Query
- 2025-12-06: Added Brand Onboarding Wizard (client/src/pages/brand-onboarding.tsx)
- 2025-12-06: Added Vertical-specific dashboards (client/src/pages/vertical-dashboard.tsx)
- 2025-12-06: Full CRUD operations for social posts, leads, and campaigns
- 2025-12-07: **Integrated all LLM providers from Replit vault**
- 2025-12-07: Created AI service layer (server/services/ai-service.ts) with OpenAI, Anthropic, Gemini
- 2025-12-07: Added AI API routes (server/routes/ai.ts) for chat, content generation, lead scoring
- 2025-12-07: Built Chief of Staff AI chat interface in God Mode dashboard
- 2025-12-07: Added AI content generator to Social Media vertical
- 2025-12-07: Added AI-powered lead scoring to Sales SDR vertical

## Known Limitations
This appears to be a partial/incomplete GitHub import. The application cannot start without the missing modules being either:
1. Properly implemented
2. Stubbed out with minimal functionality
3. Removed from the import chain in server/index.ts
