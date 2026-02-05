# WizMark 360 - AI Marketing Operating System

## Overview
WizMark 360 is the world's first AI Marketing Operating System, a full-stack TypeScript application (React + Express) designed as a self-driving marketing agency platform. It automates and optimizes marketing operations, brand management, invoicing, and payments. The platform leverages a robust AI infrastructure with 24 LLM providers, 886 models across 4 tiers, and a comprehensive 285-agent architecture across 8 marketing verticals, inspired by leading enterprise marketing tools.

## User Preferences
I prefer iterative development, with a focus on delivering functional components incrementally. Please ask for clarification if a task is unclear or before making significant architectural changes. I value clear, concise explanations and prefer to review major changes. Do not make changes to the `shared/schema.ts` and `shared/market360-schema.ts` files without explicit instruction.

## System Architecture

### UI/UX Decisions
The platform features a "Market360 God Mode Dashboard" as its central command center, complemented by 7 vertical-specific dashboards. Key UI elements include a professional landing page, a 6-step brand onboarding wizard, a Command Center with unified search (`Ctrl+K`), a multilingual Content Library, and a Visual Flow Builder for WhatsApp automation.

### Technical Implementations
WizMark 360 is built with React for the frontend and Express for the backend, utilizing a PostgreSQL database managed by Drizzle ORM. It runs on a unified server (Port 5000) with Vite middleware. The system includes full CRUD APIs, sample data seeding, real-time KPI metrics, and a 4-Tier Model Architecture with a Smart Router for intelligent LLM selection. All 285 agents adhere to a standardized 6-part system prompt structure, supporting a Dual-Model Workflow Architecture (e.g., Claude for planning, Gemini for execution).

### Feature Specifications
- **AI Infrastructure**: Integration with 24 LLM providers, 50+ flagship models, and an LLM Auto-Update system.
- **Intelligent Model Router**: Multi-factor scoring for optimal model selection based on task complexity, cost, and quality.
- **Market360 Agents**: 285 specialized agents across 8 verticals (Social Media, SEO/GEO, Web Development, Sales/SDR, WhatsApp Marketing, LinkedIn B2B, Performance Advertising, PR & Communications) with ROMA (Reactive, Proactive, Autonomous, Collaborative, Self-Evolving) levels.
- **Multilingual Support**: Content generation, chat, and translation in 12 Indian languages.
- **Voice Capabilities**: Speech-to-Text (Sarvam Saarika v2) and Text-to-Speech (Sarvam Bulbul v1).
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