# Wizards Tech Global - Self-Driving Agency Platform

## Overview
Wizards Tech Global is a full-stack TypeScript application (React + Express) designed as an internal Enterprise Resource Planning (ERP) platform for a marketing agency. It leverages a robust AI infrastructure with 23 LLM providers, 886 models across 4 tiers, and a comprehensive 267-agent Market360 architecture across 7 marketing verticals (Social, SEO, Web, Sales, WhatsApp, LinkedIn, Performance). The platform aims to automate and optimize marketing operations, brand management, invoicing, and payments, enabling a "self-driving" marketing agency model. It incorporates advanced AI orchestration via the WAI SDK, multilingual support for 12 Indian languages, and voice capabilities, drawing inspiration from leading enterprise marketing tools like HubSpot and Salesforce.

## User Preferences
I prefer iterative development, with a focus on delivering functional components incrementally. Please ask for clarification if a task is unclear or before making significant architectural changes. I value clear, concise explanations and prefer to review major changes. Do not make changes to the `shared/schema.ts` and `shared/market360-schema.ts` files without explicit instruction.

## System Architecture

### Market360 Agent Structure (267 Agents)
The platform implements the full Market360 specification with 267 specialized agents:

**Agent Distribution by Vertical:**
- Social Media: 45 agents
- SEO/GEO: 38 agents
- Web Development: 32 agents
- Sales/SDR: 52 agents
- WhatsApp Marketing: 28 agents
- LinkedIn B2B: 35 agents
- Performance Advertising: 37 agents

**ROMA Level Distribution:**
- L0 (Reactive): 1 agent - Responds to manual triggers
- L1 (Proactive): 76 agents - Suggests actions based on patterns
- L2 (Autonomous): 162 agents - Executes approved strategies automatically
- L3 (Collaborative): 14 agents - Multi-agent coordination across verticals
- L4 (Self-Evolving): 14 agents - Learns and adapts strategies independently

**Each vertical includes:**
- Director (L4) - Strategic authority, escalation endpoint
- Orchestrator (L3) - Task routing, multi-agent coordination
- Manager (L2) - Workflow execution, tool invocation via MCP
- Specialized Workers (L1-L2) - Content creation, analytics, automation
- Reviewer (L1) - Quality verification, compliance checking
- Approver (L2) - Publication authorization, final validation
- Self-Optimizer (L4) - ML-based continuous improvement

### UI/UX Decisions
The platform features a "Market360 God Mode Dashboard" as a central command center, complemented by 7 vertical-specific dashboards, each with tailored AI tools and KPIs. A professional landing page, a 6-step brand onboarding wizard, and a Command Center with unified search (`Ctrl+K`) provide a streamlined user experience. A Content Library with multilingual support and a Visual Flow Builder for WhatsApp automation enhance content and workflow management.

### Technical Implementations
The application is built with React for the frontend and Express for the backend, utilizing a PostgreSQL database with Drizzle ORM. It operates on a unified server (Port 5000) with Vite middleware. Key features include full CRUD APIs for all verticals, sample data seeding, and real-time KPI metrics. The system implements a 4-Tier Model Architecture with a Smart Router for intelligent LLM selection based on task complexity. All 267 agents adhere to a standardized 6-part system prompt structure for consistent identity, capabilities, tools, response format, coordination, and guardrails.

### Feature Specifications
- **AI Infrastructure**: Integration with 23 LLM providers (OpenAI, Anthropic, Gemini, Groq, Together, Fireworks, Sarvam, Cohere, Perplexity, DeepSeek, Mistral, xAI, OpenRouter, Replicate, HuggingFace, AWS Bedrock, Azure OpenAI, VertexAI, Ollama, SambaNova, Cerebras, Anyscale, AI21), offering 886 models across 4 tiers.
- **Market360 Agents**: 267 agents across 7 verticals with ROMA L0-L4 autonomy levels.
- **Multilingual Support**: 12 Indian languages via Sarvam LLM for content generation, chat, and translation.
- **Voice Capabilities**: Speech-to-Text (Sarvam Saarika v2) and Text-to-Speech (Sarvam Bulbul v1) for voice agents.
- **MCP Protocol**: Model Context Protocol for tool orchestration with standardized input/output schemas.
- **ROMA Levels**: L0 (Reactive), L1 (Proactive), L2 (Autonomous), L3 (Collaborative), L4 (Self-Evolving).
- **Enterprise Marketing Features**: AI-powered workflow automation, multi-touch campaign orchestration, predictive lead scoring, real-time performance dashboards, AI content generation, and lead management tools.

### System Design Choices
- **WAI SDK Orchestration Platform**: Serves as the backbone for managing and orchestrating AI agents and models.
- **Database**: PostgreSQL with Drizzle ORM, featuring comprehensive shared schemas (`shared/schema.ts`, `shared/market360-schema.ts`, `agency-erp-schema.ts`).
- **Package Manager**: pnpm, with Node.js 18+ requirement.
- **Build System**: Vite for development and production bundling.
- **Replit-Specific Configuration**: Vite configured for Replit proxy support (`allowedHosts: true`), server binding to `0.0.0.0:5000`, and HMR for WSS on port 443.

## Recent Updates

### Vertical Workflow Implementation (December 2024)
- **Social Media Vertical Service**: Full 9-step workflow (Trend Analysis → Content Ideation → Content Creation → Visual Production → Content Review → Schedule Optimization → Publication → Engagement Monitoring → Performance Analytics)
- **Unified Vertical Workflow Service**: All 7 verticals now have complete workflow definitions with step-by-step execution and ROMA-aware agent selection
- **MCP Tool Catalog**: 156 tools registered with proper vertical distribution, ROMA level requirements, and standardized schemas
- **Sarvam Voice Integration**: STT (Saarika v2) and TTS (Bulbul v1) with 24 voices across 12 Indian languages

### API Endpoints
- `/api/voice/*` - Sarvam Voice API (STT/TTS)
- `/api/market360/social/*` - Social Media vertical endpoints
- `/api/market360/verticals/*` - Unified vertical workflow API for all 7 verticals

### Frontend Dashboards
- Updated vertical dashboards with correct agent counts per vertical
- Key agents displayed with ROMA levels (L1-L4)
- Workflow step visualization for each vertical
- KPI tracking for vertical-specific metrics

## External Dependencies

-   **LLM Providers**: OpenAI, Anthropic, Gemini, Groq, Cohere, Sarvam AI, DeepSeek, Mistral, Perplexity, Together, OpenRouter, xAI, Replicate, Fireworks, Anyscale, HuggingFace, AWS Bedrock, Azure OpenAI, VertexAI, Ollama.
-   **Database**: PostgreSQL.
-   **ORM**: Drizzle ORM.
-   **WAI SDK**: For AI orchestration and agent management.
-   **Vite**: Frontend tooling.