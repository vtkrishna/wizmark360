# Wizards Tech Global Agency Platform

## Overview
Wizards Tech Global Agency Platform is a full-stack TypeScript application (React + Express) designed as a self-driving marketing agency platform. It leverages a robust AI infrastructure with 23 LLM providers, 886 models across 4 tiers, and a comprehensive 267-agent Market360 architecture across 7 marketing verticals (Social, SEO, Web, Sales, WhatsApp, LinkedIn, Performance). The platform aims to automate and optimize marketing operations, brand management, invoicing, and payments, enabling a "self-driving" marketing agency model. It incorporates advanced AI orchestration via the WAI SDK, multilingual support for 12 Indian languages, and voice capabilities, drawing inspiration from leading enterprise marketing tools like HubSpot and Salesforce.

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

### Dual-Model Workflow Architecture (December 2024)
**NEW: Claude + Gemini Orchestration for Website/UI/UX Creation**
- **Claude 4.5 Opus** (Planning Only): High-level architecture, task decomposition, risk detection, long-term reasoning
- **Gemini 3.0 Pro** (Execution Only): Step-by-step code generation, clean implementations, UI development, strict instruction following
- **Claude Review Phase** (Optional): Bug detection, optimization suggestions, approval workflow
- **Model Selection Matrix**: Smart routing based on content type (social/blog/email/ad/research/seo) and priority (cost/quality/speed)

**API Endpoints:**
- `POST /api/market360/verticals/dual-model-workflow` - Execute Claude→Gemini workflow
- `GET /api/market360/verticals/content-model-selector` - Get recommended model for content type

### LLM Provider Configuration (December 2024)
**6 Verified Working Providers:**
- **OpenAI**: GPT-5.1, GPT-4o (Premium quality)
- **Anthropic**: Claude Sonnet 4.5, Claude Haiku 4.5 (Planning & reasoning)
- **Groq**: Llama 3.3 70B (Ultra-fast, sub-second latency)
- **OpenRouter**: Llama 3.1 8B, DeepSeek V3, Qwen 2.5 (Cost optimization: $0.055-0.28/1M tokens)
- **Together.ai**: Llama 3.2 3B-70B (Low-cost: $0.06-0.88/1M tokens)
- **Zhipu AI (GLM-4.6)**: Content creation, website coding, agent tasks ($0.60-2.20/1M tokens)

### GLM-4.6 Integration (December 2024)
**NEW: Zhipu AI GLM-4.6 for Content & Coding**
- **GLM-4.6**: 355B MoE model (32B active), 200K context, optimized for coding & content creation
- **GLM-4.6V**: Vision-language model with native tool calling for multimodal tasks
- **GLM-4-Long**: 1M context window for long document processing
- **CodeGeeX 4**: Specialized coding model for fast code generation
- **Fallback Chain**: Zhipu API → OpenRouter (z-ai/glm-4.6) → Groq fallback
- **Smart Routing**: Automatically routes content creation, website coding, blog, and article tasks to GLM-4.6

**Usage:**
```javascript
// Via Chat API
POST /api/chat
{ "message": "...", "model": "zhipu" }  // or "glm"

// Via WAI SDK Orchestration
aiService.chat(messages, "zhipu", "glm-4.6")
```

### Vertical Workflow Implementation (December 2024)
- **Social Media Vertical Service**: Full 9-step workflow with WAI SDK integration (Trend Analysis → Content Ideation → Content Creation → Visual Production → Content Review → Schedule Optimization → Publication → Engagement Monitoring → Performance Analytics)
- **Unified Vertical Workflow Service**: All 7 verticals now have complete workflow definitions with step-by-step execution and ROMA-aware agent selection
- **MCP Tool Catalog**: 156 tools registered with proper vertical distribution, ROMA level requirements, and standardized schemas
- **Sarvam Voice Integration**: STT (Saarika v2) and TTS (Bulbul v1) with 24 voices across 12 Indian languages

### Multimodal Content Orchestration (December 2024)
**NEW: HuggingFace + VibeVoice Integration for Vibecoding**
- **Microsoft VibeVoice-Realtime-0.5B**: Real-time voice synthesis for vibecoding and content creation
- **HuggingFace Aggregator**: 9 HuggingFace models integrated (Whisper, FLUX, MusicGen, XTTS, Parler TTS, BLIP-2, ControlNet)
- **Multimodal Content**: Text, voice, audio, image, and video generation from best-in-class models
- **Smart Model Selection**: Automatic routing based on cost/quality/speed across 4 providers (HuggingFace, OpenAI, Anthropic, Google)

### LLM Admin Configuration (December 2024)
**Brand-Level LLM Settings & Model Routing**
- **Environment Modes**: Testing (free models) → Development → Production (premium models)
- **Brand Tiers**: Starter, Professional, Enterprise, VIP with auto-configured capabilities
- **Dual-Model Workflow**: Only enabled for Enterprise/VIP brands or admin-enabled brands
- **Cost Optimization**: Automatic model selection based on brand tier, payment level, and criticality
- **Backup Chains**: Production models include automatic fallback chains

### RBAC & Audit Logging (December 2024)
**NEW: Role-Based Access Control & Audit Trail**
- **4 User Roles**: Admin (full access), Manager (team management), User (content creation), Viewer (read-only)
- **Permission System**: Resource-based permissions with 6 actions (create, read, update, delete, execute, manage)
- **Role Hierarchy**: Inheritance-based with level system (Admin: 100, Manager: 75, User: 50, Viewer: 25)
- **Audit Logging**: Complete action tracking with middleware integration
- **Security Events**: Role changes, API access, agent executions, LLM requests logged

**API Endpoints:**
- `GET /api/rbac/roles` - List all roles with permissions
- `GET /api/rbac/my-permissions` - Get current user's permissions
- `POST /api/rbac/check-permission` - Check specific permission
- `GET /api/rbac/audit-logs` - View audit logs (admin only)
- `GET /api/rbac/audit-stats` - Audit statistics

### Auto-Remediation for Predictive Analytics (December 2024)
**NEW: Automated Issue Resolution**
- **6 Alert Types**: Performance, Capacity, Error Rate, Latency, Security, Default
- **Smart Actions**: Scale resources, provision capacity, circuit breakers, caching, rate limiting
- **Dry Run Mode**: Simulate remediation before execution
- **Action Summary**: Aggregated view of planned remediations

**API Endpoints:**
- `POST /api/analytics/auto-remediation` - Execute auto-remediation for alerts

### Stock Images & Content Source Options (December 2024)
**NEW: Multiple Content Source Options**
- **Content Source Selector**: 4 options (Create with AI, Select from Library, Search Stock Images, Web Search)
- **Stock Image Service**: Integration with Pexels/Unsplash APIs, fallback to Lorem Picsum
- **Stock Image Modal**: Search, preview, and download royalty-free images to content library
- **Web Search Modal**: Search for content inspiration with vertical-specific suggestions
- **Content Library Integration**: All sources integrated into Create Content flow

**API Endpoints:**
- `GET /api/stock-images/search` - Search stock images
- `POST /api/stock-images/download` - Download and save image to library
- `GET /api/stock-images/categories` - Get popular image categories
- `GET /api/stock-images/collections` - Get curated collections
- `POST /api/web-search` - Search web for content inspiration

**Components:**
- `client/src/components/content-source-selector.tsx` - Source selection UI
- `client/src/components/stock-image-modal.tsx` - Stock image browser
- `client/src/components/web-search-modal.tsx` - Web search for inspiration
- `server/services/stock-image-service.ts` - Stock image service

### API Endpoints
- `/api/voice/*` - Sarvam Voice API (STT/TTS)
- `/api/market360/social/*` - Social Media vertical endpoints
- `/api/market360/verticals/*` - Unified vertical workflow API for all 7 verticals
- `/api/market360/verticals/dual-model-workflow` - Claude + Gemini orchestration
- `/api/market360/verticals/content-model-selector` - Smart model selection
- `/api/admin/llm/*` - LLM admin settings, brand configs, model selection
- `/api/multimodal-content/*` - HuggingFace models, VibeVoice, vibecoding generation

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