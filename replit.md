# Wizards Tech Global - Self-Driving Agency Platform

## Overview
Wizards Tech Global is a full-stack TypeScript application (React + Express) designed as an internal Enterprise Resource Planning (ERP) platform for a marketing agency. It leverages a robust AI infrastructure with 23 LLM providers, 752 models, and 267 autonomous agents across 7 marketing verticals (Social, SEO, Web, Sales, WhatsApp, LinkedIn, Performance). The platform aims to automate and optimize marketing operations, brand management, invoicing, and payments, enabling a "self-driving" marketing agency model. It incorporates advanced AI orchestration via the WAI SDK, multilingual support for 12 Indian languages, and voice capabilities, drawing inspiration from leading enterprise marketing tools like HubSpot and Salesforce.

## User Preferences
I prefer iterative development, with a focus on delivering functional components incrementally. Please ask for clarification if a task is unclear or before making significant architectural changes. I value clear, concise explanations and prefer to review major changes. Do not make changes to the `shared/schema.ts` and `shared/market360-schema.ts` files without explicit instruction.

## System Architecture

### UI/UX Decisions
The platform features a "Market360 God Mode Dashboard" as a central command center, complemented by 7 vertical-specific dashboards, each with tailored AI tools and KPIs. A professional landing page, a 6-step brand onboarding wizard, and a Command Center with unified search (`Ctrl+K`) provide a streamlined user experience. A Content Library with multilingual support and a Visual Flow Builder for WhatsApp automation enhance content and workflow management.

### Technical Implementations
The application is built with React for the frontend and Express for the backend, utilizing a PostgreSQL database with Drizzle ORM. It operates on a unified server (Port 5000) with Vite middleware. Key features include full CRUD APIs for all verticals, sample data seeding, and real-time KPI metrics. The system implements a 4-Tier Model Architecture with a Smart Router for intelligent LLM selection based on task complexity. All 267 autonomous agents adhere to a standardized 6-part system prompt structure for consistent identity, capabilities, tools, response format, coordination, and guardrails.

### Feature Specifications
- **AI Infrastructure**: Integration with 23 LLM providers (e.g., OpenAI, Anthropic, Gemini, Groq, Sarvam), offering 752 models.
- **Autonomous Agents**: 267 agents categorized by 7 marketing verticals (e.g., Social, SEO, Sales, WhatsApp, LinkedIn).
- **Multilingual Support**: 12 Indian languages via Sarvam LLM for content generation, chat, and translation.
- **Voice Capabilities**: Speech-to-Text (Sarvam Saarika v2) and Text-to-Speech (Sarvam Bulbul v1) for voice agents.
- **MCP Protocol**: Model Context Protocol for tool orchestration, supporting 156 registered tools.
- **ROMA Levels**: Orchestration status reporting for ROMA levels L0-L4.
- **Enterprise Marketing Features**: AI-powered workflow automation, multi-touch campaign orchestration, predictive lead scoring, real-time performance dashboards, AI content generation, and lead management tools.

### System Design Choices
- **WAI SDK Orchestration Platform**: Serves as the backbone for managing and orchestrating AI agents and models.
- **Database**: PostgreSQL with Drizzle ORM, featuring comprehensive shared schemas (`shared/schema.ts`, `shared/market360-schema.ts`, `agency-erp-schema.ts`).
- **Package Manager**: pnpm, with Node.js 18+ requirement.
- **Build System**: Vite for development and production bundling.
- **Replit-Specific Configuration**: Vite configured for Replit proxy support (`allowedHosts: true`), server binding to `0.0.0.0:5000`, and HMR for WSS on port 443.

## External Dependencies

-   **LLM Providers**: OpenAI, Anthropic, Gemini, Groq, Cohere, Sarvam AI, DeepSeek, Mistral, Perplexity, Together, OpenRouter, xAI, Replicate, Fireworks, Anyscale, HuggingFace, AWS Bedrock, Azure OpenAI, VertexAI, Ollama.
-   **Database**: PostgreSQL.
-   **ORM**: Drizzle ORM.
-   **WAI SDK**: For AI orchestration and agent management.
-   **Vite**: Frontend tooling.