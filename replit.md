# WizMark 360 - AI Marketing Operating System

## Overview
WizMark 360 is the world's first AI Marketing Operating System, a full-stack TypeScript application (React + Express) designed as a self-driving marketing agency platform. It automates and optimizes marketing operations, brand management, invoicing, and payments. The platform leverages a robust AI infrastructure with 24 LLM providers, 886 models across 4 tiers, and a comprehensive 285-agent architecture across 8 marketing verticals, inspired by leading enterprise marketing tools.

## User Preferences
I prefer iterative development, with a focus on delivering functional components incrementally. Please ask for clarification if a task is unclear or before making significant architectural changes. I value clear, concise explanations and prefer to review major changes. Do not make changes to the `shared/schema.ts` and `shared/market360-schema.ts` files without explicit instruction.

## System Architecture

### UI/UX Decisions
The platform features an enterprise-grade "Marketing Command Center" dashboard complemented by 8 vertical-specific dashboards and a Unified Analytics page. Key UI elements include a professional landing page with enterprise messaging, a 6-step brand onboarding wizard, a Command Center with unified search (`Ctrl+K`), a multilingual Content Library, a Visual Flow Builder for WhatsApp automation, and an AI Platform section with Agent Registry (22-point system prompts), LLM Settings (24 providers), and Unified Analytics (cross-vertical ROI/ROAS).

### Technical Implementations
WizMark 360 is built with React for the frontend and Express for the backend, utilizing a PostgreSQL database managed by Drizzle ORM. It runs on a unified server (Port 5000) with Vite middleware. The system includes full CRUD APIs, sample data seeding, real-time KPI metrics, and a 4-Tier Model Architecture with a Smart Router for intelligent LLM selection. All 285 agents adhere to a standardized 6-part system prompt structure, supporting a Dual-Model Workflow Architecture (e.g., Claude for planning, Gemini for execution).

### Feature Specifications
- **AI Infrastructure**: Integration with 24 LLM providers, 50+ flagship models, and an LLM Auto-Update system.
- **Intelligent Model Router**: Multi-factor scoring for optimal model selection based on task complexity, cost, and quality.
- **Market360 Agents**: 285 specialized agents across 8 verticals (Social Media, SEO/GEO, Web Development, Sales/SDR, WhatsApp Marketing, LinkedIn B2B, Performance Advertising, PR & Communications) with ROMA (Reactive, Proactive, Autonomous, Collaborative, Self-Evolving) levels.
- **Multilingual Support**: Content generation, chat, and translation in 22 Indian languages.
- **Voice Capabilities**: Speech-to-Text (Sarvam Saarika v3) and Text-to-Speech (Sarvam Bulbul v2).
- **Centralized LLM Configuration**: All models, providers, costs, and capabilities defined in `shared/llm-config.ts` — no hardcoded model names.
- **WizMark Intelligence Suite**: 10 proprietary AI capabilities (Competitor Intelligence Scanner, Visual Brand Monitor, AI Ad Creative Generator, Market Research Agent, SEO Audit Automation, Social Listening Analyzer, Campaign Performance Optimizer, Content Repurposing Engine, Predictive Lead Scoring, Brand Voice Guardian).
- **Enterprise Marketing Features**: AI-powered workflow automation, multi-touch campaign orchestration, predictive lead scoring, real-time performance dashboards, AI content generation, and lead management.
- **Multimodal Content Pipeline**: Strategy-to-text-to-image-to-video workflow.
- **Brand-Aware Content Library**: Content management with brand context.
- **Role-Based Access Control (RBAC) & Audit Logging**: 4 user roles with resource-based permissions and action tracking.
- **Auto-Remediation**: Automated issue resolution for predictive analytics alerts.
- **Web Search Service**: Multi-provider real-time search with fallback.
- **Document Processing Service**: Analysis of 15+ document formats.
- **NotebookLLM Studio**: Interactive document Q&A with citations.
- **Advanced Orchestration Patterns**: 6 patterns for multi-agent workflows (Sequential, Concurrent, Supervisor, Adaptive Network, Handoff, Custom).
- **Enhanced Mem0 Memory Service**: Cross-session memory with semantic search and token reduction.
- **CAM 2.0 Monitoring**: Real-time operations tracking, cost analytics, and quality scoring.
- **GRPO Continuous Learning**: Reinforcement learning from user feedback and policy optimization.
- **OAuth Integration Service**: Multi-platform OAuth for Meta, Google, LinkedIn, TikTok, Twitter, Pinterest.
- **Conversion Tracking Service**: Pixel & Attribution with 6 models and server-side tracking.
- **SEO Toolkit Service**: Keyword research, rank tracking, backlink analysis, technical SEO, and AI Visibility tracking.
- **Marketing Agents Registry**: 300+ Specialized Agents with 22-point system prompts and ROMA autonomy.
- **Vertical Workflow Engine**: 7 complete vertical workflows with orchestration and mock mode.
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

## Document Structure

### Active Documents
- **`replit.md`** (this file) — Core tracking document for project status, changelog, architecture decisions, feature development, and user preferences. Single source of truth.
- **`README.md`** — Public-facing project overview.
- **`docs/WizMark-360-Product-Note.md`** — Product-focused marketing document (1,553 lines) covering features, workflows, verticals, WizMark Intelligence Suite, competitive positioning, and use cases. Written for marketing teams and business decision-makers.
- **`docs/WizMark-360-User-Guide.md`** — End-to-end user guide (1,571 lines) covering onboarding, vertical-by-vertical usage, 10 AI tools, content library, analytics, team management, integrations, and FAQ.
- **`docs/WizMark-360-Investor-Presentation.md`** — Series A investor presentation (1,000+ lines) covering market opportunity, technology MOAT, revenue model, go-to-market strategy, and investment thesis.
- **`docs/project-tracker.md`** — Complete project changelog, feature status matrix, vertical development status, infrastructure status, and roadmap (Phases 1–7).
- **`docs/requirements.md`** — Enterprise production requirements: 43 API keys across 6 categories, infrastructure specs for 10K users, security/compliance checklists (SOC2, GDPR, DPDP Act), and pre-launch checklist.
- **`docs/deployment.md`** — Global production deployment plan: AWS/GCP/Azure architectures, multi-region setup, auto-scaling, CI/CD pipeline, disaster recovery, cost estimates ($6K–$13.5K/month), and post-launch operations.
- **`packages/memory/README.md`**, **`packages/tools/README.md`** — Package-specific READMEs (kept in place for developer reference).

### Archived Documents
- **`documents_archive/`** — All legacy and superseded documentation, organized by original location:
  - `documents_archive/root/` — 34 files from the root directory (phase plans, status reports, audits, old feature docs)
  - `documents_archive/docs/` — 13 files from the old docs/ folder (old product features, PDFs, guides, master plan)
  - `documents_archive/server/` — 4 files (migration guides, setup docs)
  - `documents_archive/packages/` — 4 files (test results, benchmarks)
  - `documents_archive/system-prompts/` — 1 file (prompt patterns extraction)

## Recent Changes
- **Feb 8, 2026**: Complete documentation overhaul — created 5 new comprehensive documents:
  - Rewrote `WizMark-360-Product-Note.md` (1,553 lines) as product-focused document with workflows, use cases, and competitive analysis
  - Created `WizMark-360-User-Guide.md` (1,571 lines) — end-to-end user guide with vertical-by-vertical usage, onboarding, and FAQ
  - Created `project-tracker.md` — complete changelog with Phases 1–4 and feature status matrix
  - Created `requirements.md` — enterprise production requirements (43 API keys, infrastructure specs, compliance)
  - Created `deployment.md` — global deployment plan for 10K users (AWS/GCP/Azure, $6K–$13.5K/month)
- **Feb 8, 2026**: Rebranded "Claude Marketing Tools" → "WizMark Intelligence Suite" across `shared/llm-config.ts`, frontend components, and all documentation. Added backward-compatible export alias.
- **Feb 8, 2026**: Document cleanup — moved 56 old/superseded documents to `documents_archive/`, keeping only active documents in `docs/`.
- **Feb 8, 2026**: Created WizMark-360-Investor-Presentation.md (1,000+ lines) with architect-reviewed accuracy fixes.