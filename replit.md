# WizMark 360 - AI Marketing Operating System

## Overview
WizMark 360 is the world's first AI Marketing Operating System, a full-stack TypeScript application (React + Express) designed as a self-driving marketing agency platform. It automates and optimizes marketing operations, brand management, invoicing, and payments. The platform leverages a robust AI infrastructure with 24 LLM providers, 886 models across 4 tiers, and a comprehensive 262-agent architecture across 8 marketing verticals. The project's ambition is to provide an enterprise-grade "Marketing Command Center" for comprehensive marketing automation and intelligence, offering an enterprise-grade solution for marketing intelligence and operations.

## User Preferences
I prefer iterative development, with a focus on delivering functional components incrementally. Please ask for clarification if a task is unclear or before making significant architectural changes. I value clear, concise explanations and prefer to review major changes. Do not make changes to the `shared/schema.ts` and `shared/market360-schema.ts` files without explicit instruction.

### Mandatory Development Guardrails
1. **Zero Mock/Stub/Placeholder Policy** — No dummy data, no stub functions, no temporary files. Every feature must be fully implemented with real integrations. Use `{ value, dataSource }` for all metrics.
2. **Architecture-First** — Before writing code, read `replit.md`, understand existing services/routes/pages, and wire new features into existing architecture. Never create duplicate or parallel implementations.
3. **Configuration-Driven** — All configurable values (API keys, model names, URLs, thresholds) must live in config files. Never hardcode changing details in business logic.
4. **No Orphaned Code** — Every route registered in `server/index.ts`, every page in `client/src/App.tsx`, every service imported and used. No dead code.
5. **Workflow-Aware** — Understand existing workflows before creating new ones. New features must be wired to existing navigation, routing, and data flows.
6. **Version Controlled** — Every change logged in `replit.md` Recent Changes with date and description. Pre-commit checklist in `DEVELOPMENT_GUARDRAILS.md` must be followed.
7. **Single Source of Truth for LLM Models** — `shared/llm-config.ts` is the **sole authoritative source** for all LLM model names, IDs, providers, costs, capabilities, and tiers. Before writing or updating any code that references LLM models, **always read `shared/llm-config.ts` first** to get correct model IDs. Never hardcode model names/IDs in service files, agent configs, or route handlers — always import from or reference `shared/llm-config.ts`. Any model addition, removal, or update must be done in `shared/llm-config.ts` first, then propagated to dependent files.

## System Architecture

### UI/UX Decisions
The platform features an enterprise-grade "Marketing Command Center" dashboard complemented by 8 vertical-specific dashboards and a Unified Analytics page. Key UI elements include a professional landing page, a 6-step brand onboarding wizard, a Command Center with unified search (`Ctrl+K`), a multilingual Content Library, a Visual Flow Builder for WhatsApp automation, and an AI Platform section with Agent Registry, LLM Settings, and Unified Analytics.

### Technical Implementations
WizMark 360 is built with React for the frontend and Express for the backend, utilizing a PostgreSQL database managed by Drizzle ORM. It runs on a unified server with Vite middleware. The system includes full CRUD APIs, real-time KPI metrics, and a 4-Tier Model Architecture with a Smart Router for intelligent LLM selection. All 285 agents adhere to a standardized 6-part system prompt structure, supporting a Dual-Model Workflow Architecture.

### Feature Specifications
-   **AI Infrastructure**: Integration with 24 LLM providers, 50+ flagship models, and an LLM Auto-Update system. Intelligent Model Router for optimal model selection.
-   **Market360 Agents**: 285 specialized agents across 8 verticals with ROMA (Reactive, Proactive, Autonomous, Collaborative, Self-Evolving) levels and 6 orchestration patterns.
-   **Multilingual & Multimodal**: Content generation, chat, and translation in 22 Indian languages, with voice capabilities (Speech-to-Text, Text-to-Speech), and a Strategy-to-text-to-image-to-video workflow.
-   **WizMark Intelligence Suite**: 10 proprietary AI capabilities including Competitor Intelligence Scanner, Visual Brand Monitor, AI Ad Creative Generator, and Campaign Performance Optimizer.
-   **Enterprise Marketing Features**: AI-powered workflow automation, multi-touch campaign orchestration, predictive lead scoring, real-time performance dashboards, AI content generation, and lead management.
-   **Brand-Aware Content Library**: Content management with brand context.
-   **Role-Based Access Control (RBAC) & Audit Logging**: 4 user roles with resource-based permissions.
-   **Auto-Remediation**: Automated issue resolution for predictive analytics alerts.
-   **Web Search Service**: Multi-provider real-time search with fallback.
-   **Document Processing & Q&A**: Analysis of 15+ document formats and interactive document Q&A with citations via NotebookLLM Studio.
-   **Enhanced Mem0 Memory Service**: Cross-session memory with semantic search and token reduction.
-   **Monitoring & Learning**: CAM 2.0 for real-time operations, cost analytics, and quality scoring; GRPO Continuous Learning for reinforcement learning.
-   **Integration Services**: OAuth Integration Service, Conversion Tracking Service (Pixel & Attribution), SEO Toolkit Service, and Replit Object Storage Integration for file uploads.
-   **Agent Management**: Centralized LLM Configuration (`shared/llm-config.ts`) and a Marketing Agents Registry with 300+ Specialized Agents.
-   **Workflow Engines**: Vertical Workflow Engine with 7 complete vertical workflows and Cross-Vertical Orchestration for multi-vertical campaigns.

### System Design Choices
-   **Orchestration Platform**: WAI SDK.
-   **Database**: PostgreSQL with Drizzle ORM.
-   **Package Manager**: pnpm.
-   **Build System**: Vite.
-   **Deployment**: Replit autoscale deployment with `npm run build` + `node dist/index.js`.

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
-   **Messaging API**: Telegram API.