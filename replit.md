# WizMark 360 - AI Marketing Operating System

## Overview
WizMark 360 is the world's first AI Marketing Operating System, a full-stack TypeScript application (React + Express) designed as a self-driving marketing agency platform. It automates and optimizes marketing operations, brand management, invoicing, and payments. The platform leverages a robust AI infrastructure with 24 LLM providers, 886 models across 4 tiers, and a comprehensive 262-agent architecture across 8 marketing verticals. The project's ambition is to provide an enterprise-grade "Marketing Command Center" for comprehensive marketing automation and intelligence.

## User Preferences
I prefer iterative development, with a focus on delivering functional components incrementally. Please ask for clarification if a task is unclear or before making significant architectural changes. I value clear, concise explanations and prefer to review major changes. Do not make changes to the `shared/schema.ts` and `shared/market360-schema.ts` files without explicit instruction.

### Agent Skills & Persona
The project includes 15 specialized agent skills in `.local/skills/`. When the user triggers `/vamsi` or says "Vamsi, help me", activate the **Vamsi - The Starseed** superagent persona (`.local/skills/vamsi-superagent/SKILL.md`) which provides 360-degree analysis across all 13 domains (CTO Architecture, CPO Strategy, Fullstack Engineering, DevOps, Cloud, AI/LLM, Security/Compliance, Data Management, Debugging, Marketing, Investor Relations, Financial Planning, Advanced Reasoning). All skills are loaded from `.local/skills/` and can be activated with their respective trigger commands (`/cto`, `/cpo`, `/dev`, `/ai`, `/db`, `/debug`, `/sdlc`, `/prompt`, `/think`, `/research`, `/product`, `/reverse`, `/cicd`, `/vibe`, `/vamsi`).

### Mandatory Development Guardrails
1. **Zero Mock/Stub/Placeholder Policy** — No dummy data, no stub functions, no temporary files. Every feature must be fully implemented with real integrations. Use `{ value, dataSource }` for all metrics.
2. **Architecture-First** — Before writing code, read `replit.md`, understand existing services/routes/pages, and wire new features into existing architecture. Never create duplicate or parallel implementations.
3. **Configuration-Driven** — All configurable values (API keys, model names, URLs, thresholds) must live in config files. Never hardcode changing details in business logic.
4. **No Orphaned Code** — Every route registered in `server/index.ts`, every page in `client/src/App.tsx`, every service imported and used. No dead code.
5. **Workflow-Aware** — Understand existing workflows before creating new ones. New features must be wired to existing navigation, routing, and data flows.
6. **Version Controlled** — Every change logged in `replit.md` Recent Changes with date and description. Pre-commit checklist in `DEVELOPMENT_GUARDRAILS.md` must be followed.
7. **Single Source of Truth for LLM Models** — `shared/llm-config.ts` is the **sole authoritative source** for all LLM model names, IDs, providers, costs, capabilities, and tiers. Before writing or updating any code that references LLM models, **always read `shared/llm-config.ts` first** to get correct model IDs. Never hardcode model names/IDs in service files, agent configs, or route handlers — always import from or reference `shared/llm-config.ts`. Any model addition, removal, or update must be done in `shared/llm-config.ts` first, then propagated to dependent files.

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