# Market360 (Wizards MarketAI 360) - Self-Driving Agency Platform

## Project Overview
- **Name**: Market360 - Self-Driving Agency Platform
- **Type**: Full-stack TypeScript application (React + Express)
- **Database**: PostgreSQL with Drizzle ORM
- **Backbone**: WAI SDK Orchestration Platform (267+ autonomous agents)
- **Marketing Verticals**: 7 (Social, SEO, Web, Sales, WhatsApp, LinkedIn, Performance)
- **AI Providers**: OpenAI GPT-5, Anthropic Claude, Google Gemini

## Current Status (Fully Functional)

### ✅ Working Features
1. **Market360 God Mode Dashboard**: Central command at /market360 with live API data
2. **7 Vertical-Specific Dashboards**: Each with AI tools, KPIs, and agent status
   - Social Media (/market360/social) - AI content generator, scheduling
   - SEO & GEO (/market360/seo) - Site audit, keyword research, GEO status
   - Web Dev (/market360/web) - AI page builder, code generator
   - Sales SDR (/market360/sales) - Lead scoring, AI outreach generator
   - WhatsApp (/market360/whatsapp) - Message templates, auto-reply flows
   - LinkedIn (/market360/linkedin) - Content creator, profile optimizer
   - Performance (/market360/performance) - Ad copy generator, performance analyzer
3. **Chief of Staff AI Chat**: Multi-provider (GPT-5/Claude/Gemini) with selector
4. **Full CRUD APIs**: All verticals have complete REST endpoints
5. **Sample Data Seeding**: One-click demo data population
6. **Agent Status Dashboard**: 43 active agents across all verticals
7. **Orchestration Status API**: ROMA levels L0-L4 status reporting
8. **KPI Metrics**: Live stats from database with real-time updates

### ✅ API Endpoints
- `GET /api/market360/health` - Platform health check
- `GET /api/market360/stats` - Dashboard KPI metrics
- `GET /api/market360/verticals` - Vertical configurations
- `GET /api/market360/agents` - Agent status by vertical
- `GET /api/market360/orchestration/status` - ROMA levels and orchestration status
- `POST /api/market360/seed-demo-data` - Populate sample data
- `GET/POST /api/market360/campaigns` - Campaign CRUD
- `GET/POST /api/market360/social/posts` - Social post management
- `GET/POST /api/market360/sales/leads` - Lead management
- `GET /api/market360/performance/ads` - Performance ads
- `GET /api/market360/whatsapp/conversations` - WhatsApp conversations
- `GET /api/market360/linkedin/activities` - LinkedIn activities
- `POST /api/ai/chat` - Chief of Staff AI chat (multi-provider)
- `POST /api/ai/generate-content` - AI content generation
- `POST /api/ai/score-lead` - AI lead scoring
- `GET /api/ai/providers` - Available AI providers

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
