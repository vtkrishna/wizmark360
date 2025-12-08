# Market360 (Wizards MarketAI 360) - Self-Driving Agency Platform

## Project Overview
- **Name**: Market360 - Self-Driving Agency Platform
- **Type**: Full-stack TypeScript application (React + Express)
- **Database**: PostgreSQL with Drizzle ORM
- **Backbone**: WAI SDK Orchestration Platform
- **Marketing Verticals**: 7 (Social, SEO, Web, Sales, WhatsApp, LinkedIn, Performance)

## Platform Capabilities

### AI Infrastructure
- **23 LLM Providers**: OpenAI, Anthropic, Gemini, Groq, Cohere, Sarvam, DeepSeek, Mistral, Perplexity, Together, OpenRouter, xAI, Replicate, Fireworks, Anyscale, HuggingFace, AWS Bedrock, Azure OpenAI, VertexAI, Ollama, and more
- **752 Models**: From direct providers and aggregators (OpenRouter 343+, OpenAI 102+, Cohere 20+, Groq 20+)
- **267 Autonomous Agents**: Across 7 marketing verticals with ROMA L0-L4 orchestration
- **12+ Indian Languages**: Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Oriya, Assamese (via Sarvam LLM)

### Voice & MCP Capabilities
- **Speech-to-Text**: Sarvam Saarika v2 for 22 Indian languages
- **Text-to-Speech**: Sarvam Bulbul v1 for natural voice
- **Voice Agents**: Integrated with WhatsApp and collaborative tools
- **MCP Protocol**: Model Context Protocol for tool orchestration (156 registered tools)

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
3. **Chief of Staff AI Chat**: Multi-provider with language selector (12 languages)
4. **Full CRUD APIs**: All verticals have complete REST endpoints
5. **Sample Data Seeding**: One-click demo data population
6. **Agent Status Dashboard**: 43 active agents across all verticals
7. **Orchestration Status API**: ROMA levels L0-L4 status reporting
8. **KPI Metrics**: Live stats from database with real-time updates
9. **Multilingual Support**: 12 Indian languages via Sarvam LLM
10. **Voice Integration**: Text-to-Speech, Speech-to-Text, Voice agents

### ✅ API Endpoints

#### Market360 Core
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

#### AI Services
- `POST /api/ai/chat` - Chief of Staff AI chat (multi-provider, multilingual)
- `POST /api/ai/generate-content` - AI content generation with language support
- `POST /api/ai/translate` - Translate to Indian languages (Sarvam)
- `POST /api/ai/text-to-speech` - Generate voice (Sarvam TTS)
- `POST /api/ai/speech-to-text` - Transcribe audio (Sarvam STT)
- `POST /api/ai/score-lead` - AI lead scoring
- `POST /api/ai/analyze-performance` - Performance analysis
- `GET /api/ai/providers` - Available AI providers (23)
- `GET /api/ai/models` - Available models (752)
- `GET /api/ai/models/multilingual` - Multilingual models
- `GET /api/ai/models/indian` - Indian language models
- `GET /api/ai/languages` - Supported languages (12)
- `GET /api/ai/stats` - Full AI infrastructure stats
- `GET /api/ai/registry/full` - Complete registry with all providers, models, languages

## Enterprise Marketing Features (Inspired by HubSpot, Salesforce, Marketo)

### Automation
- AI-powered workflow triggers
- Multi-touch campaign orchestration
- Predictive lead scoring
- Automated A/B testing

### Analytics
- Multi-touch revenue attribution
- Real-time performance dashboards
- Customer journey analytics
- ROAS/CPA optimization

### Content
- AI content generation (23 LLMs)
- Multilingual content (12 languages)
- Platform-specific optimization
- Brand voice consistency

### Lead Management
- Automated lead qualification
- Engagement scoring
- Sales alignment tools
- Account-based marketing

## Configuration Files

### Package Manager
- Using **pnpm** (workspace configuration present)
- Node.js 18+ required

### Database Configuration
- Drizzle ORM with PostgreSQL driver
- Schema: `shared/schema.ts` (comprehensive)
- Market360 Schema: `shared/market360-schema.ts`

### Build Commands
- **Development**: `npm run dev` (tsx watch mode)
- **Production Build**: `npm run build` (Vite + esbuild bundle)
- **Database**: `npm run db:push` (sync schema)

## Port Configuration
- **Frontend + Backend**: Port 5000 (unified server with Vite middleware)
- **Database**: Internal PostgreSQL (DATABASE_URL env var)

## Environment Variables

### Required (in Replit Secrets)
- `OPENAI_API_KEY` - OpenAI GPT-5 access
- `ANTHROPIC_API_KEY` - Claude access
- `GEMINI_API_KEY` - Gemini access

### Optional (for extended features)
- `SARVAM_API_KEY` - Indian language support (12 languages)
- `GROQ_API_KEY` - Fast inference (Llama)
- `COHERE_API_KEY` - Enterprise RAG
- `DEEPSEEK_API_KEY` - Cost-effective reasoning
- `MISTRAL_API_KEY` - European AI
- `PERPLEXITY_API_KEY` - Real-time search
- `TOGETHER_API_KEY` - Open models
- `OPENROUTER_API_KEY` - 343+ model aggregator
- `XAI_API_KEY` - Grok access

## Key Files

### Frontend
- `client/src/pages/market360-dashboard.tsx` - God Mode Dashboard
- `client/src/pages/vertical-dashboard.tsx` - 7 Vertical Dashboards
- `client/src/pages/brand-onboarding.tsx` - Brand Onboarding Wizard

### Backend
- `server/routes/market360.ts` - Market360 API routes
- `server/routes/ai.ts` - AI API routes with multilingual support
- `server/services/enhanced-ai-service.ts` - 23 LLM providers + Sarvam
- `server/services/ai-service.ts` - Core AI service
- `server/services/mcp-protocol-integration.ts` - MCP capabilities

### Schema
- `shared/schema.ts` - Main database schema
- `shared/market360-schema.ts` - Market360 tables

## Replit-Specific Configuration
- Vite configured with `allowedHosts: true` for proxy support
- Server binds to `0.0.0.0:5000` for Replit webview
- HMR configured for WSS on port 443
- Replit Vite plugins installed and configured

## 4-Tier Model Architecture (Smart Router)

### Tier 1: Premium Intelligence
- **Purpose**: High complexity/reasoning tasks
- **Models**: GPT-5, Claude 4 Opus/Sonnet, Gemini 2.5 Pro, o3 Reasoning
- **Use Cases**: Strategic planning, complex analysis, code generation

### Tier 2: Fast Inference
- **Purpose**: Speed/standard tasks
- **Models**: Groq Llama 3.3, Together AI, Fireworks
- **Use Cases**: Quick responses, chat, simple generation

### Tier 3: Specialized & Local
- **Purpose**: Localization/niche tasks
- **Models**: Sarvam AI (12 Indian languages), Cohere, Perplexity, DeepSeek, Mistral
- **Use Cases**: Indian language content, search, RAG, translation

### Tier 4: Aggregators
- **Purpose**: Long tail/experimental
- **Models**: OpenRouter 343+, Replicate, HuggingFace
- **Use Cases**: Experimental models, cost optimization

### Smart Router API Endpoints
- `GET /api/ai/tiers` - Get all model tier configurations
- `POST /api/ai/analyze-task` - Analyze task complexity and get recommended tier/model
- `POST /api/ai/smart-route` - Auto-route request to best-fit model based on task

### WAI SDK Orchestration API Endpoints
- `GET /api/ai/wai-sdk/agents` - List all 203 agents with metadata
- `GET /api/ai/wai-sdk/agents/:agentId` - Get agent details with full system prompt
- `GET /api/ai/wai-sdk/agents/category/:category` - Get agents by vertical
- `GET /api/ai/wai-sdk/stats` - Orchestration statistics
- `POST /api/ai/wai-sdk/execute` - Execute task through orchestration layer
- `POST /api/ai/wai-sdk/generate-content` - Generate content via agents
- `POST /api/ai/wai-sdk/analyze` - Analyze performance via agents
- `POST /api/ai/wai-sdk/support` - Handle support via WhatsApp agents
- `GET /api/ai/wai-sdk/tiers` - Get model and agent tier configurations
- `GET /api/ai/wai-sdk/system-prompt/:agentId` - Get full system prompt

## Agent System Prompt Structure (6-Part Format)

All 203 agents follow standardized system prompts with:
1. **IDENTITY & ROLE**: Agent ID, name, category, tier, mission, objectives
2. **CAPABILITIES & EXPERTISE**: Skills, jurisdictions, languages (12 Indian languages)
3. **TOOLS & RESOURCES**: Available tools, database access, external APIs
4. **RESPONSE FORMAT**: Structured output schemas with confidence scoring
5. **COORDINATION PROTOCOL**: Collaboration, escalation paths, handoff procedures
6. **GUARDRAILS & CONSTRAINTS**: Legal boundaries, ethical constraints, jurisdiction limits

## Recent Changes
- 2025-12-08: **Implemented 6-part agent system prompt structure for all 203 agents**
- 2025-12-08: **Created WAI-SDK orchestration layer as single source of truth**
- 2025-12-08: **Added full agent registry with 203 agents across 7 verticals**
- 2025-12-08: Added jurisdiction-aware guardrails (India, UAE, Saudi, Singapore, Global)
- 2025-12-08: Implemented 4-Tier Model Architecture with Smart Router
- 2025-12-08: Added 34 core models to LLM registry (from 17 to 34)
- 2025-12-08: Created task complexity analyzer for intelligent model selection
- 2025-12-08: Added Smart Route API endpoints for auto-routing
- 2025-12-08: Fixed TypeScript errors in enhanced-ai-service.ts
- 2025-12-08: Created comprehensive project-tracker.md with gap analysis
- 2025-12-07: **Enhanced platform with 23 LLMs, 752 models, 267 agents**
- 2025-12-07: Added Sarvam AI integration for 12 Indian languages
- 2025-12-07: Created enhanced-ai-service.ts with full provider registry
- 2025-12-07: Added multilingual chat with language selector
- 2025-12-07: Integrated voice capabilities (TTS, STT)
- 2025-12-07: Added MCP protocol integration for tool orchestration
- 2025-12-07: Updated dashboard header with platform stats
- 2025-12-07: Added 6 AI provider options to Chief of Staff chat
- 2025-12-06: Built Market360 Self-Driving Agency Platform
- 2025-12-06: Created 7 vertical-specific dashboards with AI tools
- 2025-12-06: Integrated all LLM providers from Replit vault

## Global Marketing Tool Features (Research-Driven)

Based on HubSpot, Salesforce Marketing Cloud, and Adobe Marketo:

### Already Implemented
- AI-powered content generation
- Multi-provider LLM routing
- Lead scoring and qualification
- Performance analytics
- Campaign management
- Social media scheduling
- WhatsApp automation
- LinkedIn B2B tools

### Recommended Enhancements
1. **Predictive Analytics**: Churn risk scoring, engagement forecasting
2. **Journey Builder**: Visual multi-step customer journey mapping
3. **A/B Testing**: Automated testing with AI optimization
4. **Attribution Modeling**: Multi-touch revenue attribution
5. **Account-Based Marketing**: Coordinate campaigns for buying committees
6. **Conversational Marketing**: AI chatbots with lead capture
7. **Website Personalization**: Dynamic content based on visitor behavior
