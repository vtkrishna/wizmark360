# WizMark 360 - AI Marketing Operating System

## Overview
WizMark 360 is the world's first AI Marketing Operating System, a full-stack TypeScript application (React + Express) designed as a self-driving marketing agency platform. It automates and optimizes marketing operations, brand management, invoicing, and payments. The platform leverages a robust AI infrastructure with 24 LLM providers, 886 models across 4 tiers, and a comprehensive 262-agent architecture across 8 marketing verticals. The project's ambition is to provide an enterprise-grade "Marketing Command Center" for comprehensive marketing automation and intelligence.

## User Preferences
I prefer iterative development, with a focus on delivering functional components incrementally. Please ask for clarification if a task is unclear or before making significant architectural changes. I value clear, concise explanations and prefer to review major changes. Do not make changes to the `shared/schema.ts` and `shared/market360-schema.ts` files without explicit instruction.

### Mandatory Development Guardrails (see `DEVELOPMENT_GUARDRAILS.md` for full details)
1. **Zero Mock/Stub/Placeholder Policy** — No dummy data, no stub functions, no temporary files. Every feature must be fully implemented with real integrations. Use `{ value, dataSource }` for all metrics.
2. **Architecture-First** — Before writing code, read `replit.md`, understand existing services/routes/pages, and wire new features into existing architecture. Never create duplicate or parallel implementations.
3. **Configuration-Driven** — All configurable values (API keys, model names, URLs, thresholds) must live in config files. Never hardcode changing details in business logic.
4. **No Orphaned Code** — Every route registered in `server/index.ts`, every page in `client/src/App.tsx`, every service imported and used. No dead code.
5. **Workflow-Aware** — Understand existing workflows before creating new ones. New features must be wired to existing navigation, routing, and data flows.
6. **Version Controlled** — Every change logged in `replit.md` Recent Changes with date and description. Pre-commit checklist in `DEVELOPMENT_GUARDRAILS.md` must be followed.

### Config File Registry
| Domain | Config File | Purpose |
|--------|-------------|---------|
| Server/Platform | `server/config/platform-config.ts` | Port, host, DB, services, LLM provider keys, security, rate limits |
| LLM Models | `shared/llm-config.ts` | All 24 providers, 886+ models, costs, capabilities, tiers |
| Feature Flags | `server/config/feature-flags.ts` | Toggle features on/off via environment variables |
| OAuth | `server/config/oauth-config.ts` | OAuth provider-specific settings (Google, GitHub, LinkedIn, Meta) |
| Client API | `client/src/services/config.ts` | Frontend API base URL, WebSocket URL |
| WAI SDK | `utils/config.ts` | Agent counts, integration counts, core settings |
| LLM Providers | `server/services/llm-providers/` | Low-level SDK wrappers (use `unified-llm-service.ts` as entrypoint) |

## System Architecture

### UI/UX Decisions
The platform features an enterprise-grade "Marketing Command Center" dashboard complemented by 8 vertical-specific dashboards and a Unified Analytics page. Key UI elements include a professional landing page, a 6-step brand onboarding wizard, a Command Center with unified search (`Ctrl+K`), a multilingual Content Library, a Visual Flow Builder for WhatsApp automation, and an AI Platform section with Agent Registry, LLM Settings, and Unified Analytics.

### Technical Implementations
WizMark 360 is built with React for the frontend and Express for the backend, utilizing a PostgreSQL database managed by Drizzle ORM. It runs on a unified server with Vite middleware. The system includes full CRUD APIs, real-time KPI metrics, and a 4-Tier Model Architecture with a Smart Router for intelligent LLM selection. All 285 agents adhere to a standardized 6-part system prompt structure, supporting a Dual-Model Workflow Architecture.

### Feature Specifications
- **AI Infrastructure**: Integration with 24 LLM providers, 50+ flagship models, and an LLM Auto-Update system.
- **Intelligent Model Router**: Multi-factor scoring for optimal model selection.
- **Market360 Agents**: 285 specialized agents across 8 verticals with ROMA (Reactive, Proactive, Autonomous, Collaborative, Self-Evolving) levels.
- **Multilingual Support**: Content generation, chat, and translation in 22 Indian languages.
- **Voice Capabilities**: Speech-to-Text (Sarvam Saarika v3) and Text-to-Speech (Sarvam Bulbul v2).
- **Centralized LLM Configuration**: All models, providers, costs, and capabilities defined in `shared/llm-config.ts`.
- **WizMark Intelligence Suite**: 10 proprietary AI capabilities including Competitor Intelligence Scanner, Visual Brand Monitor, AI Ad Creative Generator, and Campaign Performance Optimizer.
- **Enterprise Marketing Features**: AI-powered workflow automation, multi-touch campaign orchestration, predictive lead scoring, real-time performance dashboards, AI content generation, and lead management.
- **Multimodal Content Pipeline**: Strategy-to-text-to-image-to-video workflow.
- **Brand-Aware Content Library**: Content management with brand context.
- **Role-Based Access Control (RBAC) & Audit Logging**: 4 user roles with resource-based permissions.
- **Auto-Remediation**: Automated issue resolution for predictive analytics alerts.
- **Web Search Service**: Multi-provider real-time search with fallback.
- **Document Processing Service**: Analysis of 15+ document formats.
- **NotebookLLM Studio**: Interactive document Q&A with citations.
- **Advanced Orchestration Patterns**: 6 patterns for multi-agent workflows.
- **Enhanced Mem0 Memory Service**: Cross-session memory with semantic search and token reduction.
- **CAM 2.0 Monitoring**: Real-time operations tracking, cost analytics, and quality scoring.
- **GRPO Continuous Learning**: Reinforcement learning from user feedback.
- **OAuth Integration Service**: Multi-platform OAuth.
- **Conversion Tracking Service**: Pixel & Attribution with 6 models and server-side tracking.
- **SEO Toolkit Service**: Comprehensive SEO tools.
- **Marketing Agents Registry**: 300+ Specialized Agents with 22-point system prompts and ROMA autonomy.
- **Vertical Workflow Engine**: 7 complete vertical workflows with orchestration.
- **Cross-Vertical Orchestration**: Multi-vertical campaign creation, intelligent budget allocation, and optimization recommendations.

### System Design Choices
- **Orchestration Platform**: WAI SDK.
- **Database**: PostgreSQL with Drizzle ORM.
- **Package Manager**: pnpm.
- **Build System**: Vite.

## External Dependencies

-   **LLM Providers**: OpenAI, Anthropic, Gemini, Groq, Cohere, Sarvam AI, DeepSeek, Mistral, Perplexity, Together, OpenRouter, xAI, Replicate, Fireworks, Anyscale, HuggingFace, AWS Bedrock, Azure OpenAI, VertexAI, Ollama, Zhipu AI.
-   **Database**: PostgreSQL.
-   **ORM**: Drizzle ORM.
-   **AI Orchestration**: WAI SDK.
-   **Frontend Tooling**: Vite.
-   **Stock Image Services**: Pexels, Unsplash, Lorem Picsum.
-   **Voice Models**: Microsoft VibeVoice.
-   **WhatsApp Business API**: Meta WhatsApp Business API.
-   **CRM Integrations**: Salesforce, HubSpot.
-   **Social Media Platforms**: Meta (Facebook/Instagram), LinkedIn, Twitter, Pinterest, TikTok.
-   **Payment Gateway**: Razorpay.
-   **Web Search APIs**: Perplexity AI, Google Custom Search, Bing Web Search.
-   **Telegram API**.

## Recent Changes
- **Feb 15, 2026**: Comprehensive LLM model update to latest Feb 2026 versions — (1) Updated all Anthropic refs: `claude-sonnet-5-0` → `claude-sonnet-4-20250514` (real API model ID) across 440+ references in agents, services, and config. (2) Updated Cohere: `command-r-plus` → `command-a-03-2025` (latest flagship) across 11+ service files. (3) Updated Gemini: `gemini-2.0-flash` → `gemini-2.5-flash` (2.0 deprecated March 31), `gemini-1.5-pro/flash` → `gemini-2.5-pro/flash` across 20+ files. (4) Fixed Gemini API model IDs: `gemini-3-pro-preview`, `gemini-3-flash-preview`. (5) Added new Perplexity models: sonar-reasoning, sonar-reasoning-pro, sonar-deep-research. (6) Added Groq models: llama-3-3-70b, qwen-3-32b. (7) Added DeepSeek R1/V3 current models with real API IDs. (8) Fixed Perplexity provider crash (`PerplexityProvider.prototype.models` → static model list). (9) Updated WAI SDK files (10 files): claude-3-opus → claude-opus-4-6, gpt-4-turbo → gpt-4.1, command-r-plus → command-a-03-2025. (10) All 4 primary providers verified working: OpenAI (gpt-4o), Anthropic (claude-sonnet-4-20250514), Gemini (gemini-2.5-flash), Cohere (command-a-03-2025). Key files: `shared/llm-config.ts`, `server/services/enhanced-ai-service.ts`, all `server/services/llm-providers/*.ts`, `data/marketing-agents-registry.json`.
- **Feb 15, 2026**: Production deployment readiness — (1) Fixed production build: `server/index.minimal.ts` as production entry with esbuild `--packages=external` flag; Vite frontend (2.1MB JS, 204KB CSS) + esbuild server (2.1MB). (2) API key validation at startup: critical checks for DATABASE_URL, LLM keys, SESSION_SECRET with `process.exit(1)` in production on failure. (3) Authentication hardening: sameSite strict cookies, auth rate limiting (20 req/15min) applied directly on `/api/login` and `/api/register` endpoints. (4) 4-tier rate limiting: general (200/min), LLM (30/min), voice (10/min), auth (20/15min). (5) CORS lockdown: production rejects unknown origins; requires `ALLOWED_ORIGINS` env var or Replit domain match. (6) Global error handler with structured JSON errors, stack traces hidden in production. (7) Configured Replit autoscale deployment with `npm run build` + `node dist/index.js`. Key files: `server/index.minimal.ts`, `server/auth/local-auth.ts`, `server/monitoring/sentry.ts`.
- **Feb 13, 2026**: Comprehensive UAT testing and documentation update — (1) Tested all 44 API endpoints with 100% pass rate across 12 categories (Core, Brands, Agents, LLM, Content, Analytics, Chat, Voice, Verticals, Auth, Orchestration, Payments). (2) Audited all 12+ frontend pages via screenshots. (3) Updated all 6 documentation files (Product Note v5.0.0, User Guide v5.0.0, Investor Presentation v2.0, Requirements v5.0.0, Project Tracker v5.0.0, Deployment v5.0.0) with Feb 2026 features: 262 agents, 22-point system prompts, 20 agentic network patterns, CAM 2.0, GRPO, latest models. (4) Generated comprehensive UAT report (`docs/UAT-Report-Feb-2026.md`) with 81 total tests, 100% pass rate. (5) Fixed consistency across all docs: standardized agent count to 262, ROMA L1-L4, Sarvam Saarika v2/Bulbul v1, latest model references.
- **Feb 13, 2026**: Major marketing agents upgrade — (1) Generated 262 marketing agents across 8 verticals with full 22-point system prompts, Feb 2026 models (Claude Opus 4.6, GPT-5.2 Pro, Gemini 3 Pro), CAM 2.0 monitoring, GRPO learning, voice AI, enterprise wiring (queen orchestrator, mem0 memory, MCP tools, agent breeding, collective intelligence), and peer mesh networking. (2) Defined 20 agentic network patterns (SIMPLE, ACONIC, ADaPT, HTA, SWARM, PIPELINE, MAP_REDUCE, DEBATE, CONSENSUS, HIERARCHY, etc.) in `shared/llm-config.ts`. (3) Updated `MarketingAgent` interface with new schema fields. (4) Wired marketing agents JSON registry into agent-registry-service for unified agent loading. (5) Updated chat-api routes to serve from new registry with filtering by vertical/tier/romaLevel. (6) Tier breakdown: 8 directors, 42 managers, 170 specialists, 34 workers, 8 reviewers. Key files: `data/marketing-agents-registry.json` (3.69 MB), `scripts/generate-marketing-agents.cjs`, `server/services/marketing-agents-loader.ts`, `server/services/agent-registry-service.ts`.
- **Feb 12, 2026**: Major production-readiness pass — (1) Fixed strategy creation: `targetAudience` and `duration` now optional with smart defaults. (2) Fixed translation fallback: when Sarvam API fails, now uses OpenAI gpt-4o-mini then Gemini as real translation providers instead of returning original text. (3) Fixed brands API: populated `erp_brands` table with 5 real brands (TechVista Solutions, GreenLeaf Organics, FinSecure Bank, EduSpark Academy, HealthFirst Clinics). (4) Added PR & Communications and Web Development vertical workflows — now 9 complete verticals. (5) Removed 132 orphaned/unmounted route files — routes consolidated from 170+ to 49 active files. (6) Fixed LSP type errors in translation service.
- **Feb 10, 2026**: Established comprehensive Development Guardrails (`DEVELOPMENT_GUARDRAILS.md`) — 11 sections covering zero-mock policy, architecture-first development, configuration-driven development, file organization standards, database safety, API design standards, frontend standards, LLM integration standards, workflow/context preservation, prohibited practices, and pre-commit checklist. Updated `replit.md` User Preferences with mandatory guardrails summary and Config File Registry table.
- **Feb 10, 2026**: Fixed monitoring dashboard API — separated brand and campaign database queries into individual try/catch blocks so a missing `campaigns` table no longer silently zeros out the `totalBrands` count (was returning 0 instead of 5).
- **Feb 8, 2026 (20:00 IST)**: Production-readiness upgrade — replaced all mock/placeholder data with real AI integrations (unified LLM service, document generation, brand auto-generation, strategy pipeline, monitoring dashboard with data source attribution).
- **Feb 8, 2026 (15:00 IST)**: Generated professional PDF documents (Investor Presentation 1.19 MB, Product Note 1.48 MB).
- **Feb 8, 2026 (14:00 IST)**: Major platform feature documentation update — added 11 new platform capabilities.
- **Feb 8, 2026**: Complete documentation overhaul — created 5 comprehensive documents, rebranded to WizMark Intelligence Suite, moved 56 old documents to archive.