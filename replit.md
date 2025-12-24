# Wizards Tech Global Agency Platform

## Overview
Wizards Tech Global Agency Platform is a full-stack TypeScript application (React + Express) designed as a self-driving marketing agency platform. It leverages a robust AI infrastructure with 23 LLM providers, 886 models across 4 tiers, and a comprehensive 267-agent Market360 architecture across 7 marketing verticals. The platform aims to automate and optimize marketing operations, brand management, invoicing, and payments, enabling a "self-driving" marketing agency model inspired by leading enterprise marketing tools.

## User Preferences
I prefer iterative development, with a focus on delivering functional components incrementally. Please ask for clarification if a task is unclear or before making significant architectural changes. I value clear, concise explanations and prefer to review major changes. Do not make changes to the `shared/schema.ts` and `shared/market360-schema.ts` files without explicit instruction.

## System Architecture

### Market360 Agent Structure
The platform implements the Market360 specification with 267 specialized agents distributed across 7 marketing verticals (Social Media, SEO/GEO, Web Development, Sales/SDR, WhatsApp Marketing, LinkedIn B2B, Performance Advertising). Agents operate across five ROMA (Reactive, Proactive, Autonomous, Collaborative, Self-Evolving) levels, with a hierarchical structure including Directors (L4), Orchestrators (L3), Managers (L2), Specialized Workers (L1-L2), Reviewers (L1), Approvers (L2), and Self-Optimizers (L4).

### UI/UX Decisions
A "Market360 God Mode Dashboard" serves as the central command center, supported by 7 vertical-specific dashboards. Key UI elements include a professional landing page, a 6-step brand onboarding wizard, a Command Center with unified search (`Ctrl+K`), a multilingual Content Library, and a Visual Flow Builder for WhatsApp automation.

### Technical Implementations
The application uses React for the frontend and Express for the backend, with a PostgreSQL database managed by Drizzle ORM. It runs on a unified server (Port 5000) with Vite middleware. Key features include full CRUD APIs, sample data seeding, real-time KPI metrics, and a 4-Tier Model Architecture with a Smart Router for intelligent LLM selection. All 267 agents adhere to a standardized 6-part system prompt structure. The platform supports a Dual-Model Workflow Architecture, leveraging Claude for planning and Gemini for execution in specific tasks.

### Feature Specifications
- **AI Infrastructure**: Integration with 24 LLM providers offering 50+ flagship models across 4 tiers. Includes LLM Auto-Update system for tracking new model releases.
- **LLM Model Auto-Updater**: Manifest-based tracking system with endpoints for checking model updates (`/api/orchestration/models/updates`), flagship models (`/api/orchestration/models/flagship`), and provider-specific models (`/api/orchestration/models/provider/:provider`).
- **Market360 Agents**: 267 agents across 7 verticals with ROMA L0-L4 autonomy levels.
- **Multilingual Support**: 12 Indian languages for content generation, chat, and translation.
- **Voice Capabilities**: Speech-to-Text (Sarvam Saarika v2) and Text-to-Speech (Sarvam Bulbul v1) for voice agents.
- **MCP Protocol**: Model Context Protocol for tool orchestration.
- **Enterprise Marketing Features**: AI-powered workflow automation, multi-touch campaign orchestration, predictive lead scoring, real-time performance dashboards, AI content generation, and lead management.
- **Multimodal Content Pipeline**: Strategy-to-text-to-image-to-video workflow orchestration.
- **Brand-Aware Content Library**: Content management with brand context via metadata.
- **LLM Provider Configuration**: Brand-level LLM settings and model routing for cost optimization and quality control.
- **Role-Based Access Control (RBAC) & Audit Logging**: 4 user roles with resource-based permissions and comprehensive action tracking.
- **Auto-Remediation**: Automated issue resolution for predictive analytics alerts.
- **Stock Images & Content Source Options**: Integration with stock image services and web search for content creation.

### System Design Choices
- **WAI SDK Orchestration Platform**: Backbone for managing AI agents and models.
- **Database**: PostgreSQL with Drizzle ORM, utilizing comprehensive shared schemas.
- **Package Manager**: pnpm.
- **Build System**: Vite.

## External Dependencies

-   **LLM Providers**: OpenAI, Anthropic, Gemini, Groq, Cohere, Sarvam AI, DeepSeek, Mistral, Perplexity, Together, OpenRouter, xAI, Replicate, Fireworks, Anyscale, HuggingFace, AWS Bedrock, Azure OpenAI, VertexAI, Ollama, Zhipu AI.
-   **Database**: PostgreSQL.
-   **ORM**: Drizzle ORM.
-   **WAI SDK**: AI orchestration and agent management.
-   **Vite**: Frontend tooling.
-   **Stock Image Services**: Pexels, Unsplash, Lorem Picsum.
-   **Voice Models**: Microsoft VibeVoice.