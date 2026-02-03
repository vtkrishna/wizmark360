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
- **Intelligent Model Router**: Multi-factor scoring engine for optimal model selection based on task complexity, cost, quality requirements, and agent capabilities. Flagship models include GPT-5.2, GPT-5.2-Pro, GLM-4.6V (multimodal), with robust fallback handling.
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

### Enterprise Services (Implemented)
The following production-grade enterprise services have been implemented with authentication middleware:

- **WhatsApp Business Service** (`/api/whatsapp`) - Meta WhatsApp Business API integration
  - Message templates (Hindi, Tamil, English)
  - Broadcast campaigns with metrics
  - Conversation flows with AI responses
  - Webhook verification for incoming messages
  - *Status: Awaiting WhatsApp Business API credentials*

- **CRM Integration Service** (`/api/crm`) - Bi-directional sync
  - Salesforce and HubSpot support
  - Contacts, Leads, Deals management
  - Pipeline analytics
  - Sync history tracking
  - *Status: Ready for API credentials*

- **Social Publishing Service** (`/api/social`) - Multi-platform publishing
  - Meta (Facebook/Instagram), LinkedIn, Twitter, Pinterest
  - Content calendar with scheduling
  - AI caption generation
  - Platform-specific analytics
  - *Status: Ready for OAuth integration*

- **Voice Agent Service** (`/api/voice`) - Sarvam AI integration
  - Saarika v2 STT (12 Indian languages)
  - Bulbul v1 TTS (Natural voices)
  - WhatsApp voice notes
  - Voice conversation processing
  - *Status: API key configured and ready*

- **Email Campaign Service** (`/api/email`) - Marketing automation
  - Templates with variables
  - Campaigns with audience targeting
  - Automation workflows (Welcome series, etc.)
  - AI content generation
  - *Status: Ready for SMTP/ESP integration*

- **Payment Service** (`/api/payments`) - Razorpay integration (India)
  - Invoices with GST/IGST support and HSN/SAC codes
  - Orders with signature verification
  - Subscriptions management
  - Payment links with SMS/Email notifications
  - UPI, Cards, NetBanking, Wallets support
  - Revenue analytics with payment method breakdown
  - Webhook handling for real-time updates
  - *Status: Awaiting Razorpay API credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)*

- **Client Portal Service** (`/api/portal`) - White-label portals
  - Custom branding per client
  - Reports generation
  - Content approval workflow
  - *Status: Fully functional*

- **Influencer Marketplace** (`/api/influencers`) - Discovery & campaigns
  - AI-powered influencer search
  - Campaign management
  - Deliverables tracking
  - ROI analytics
  - *Status: Fully functional*

### WAI SDK v3.1 Enterprise Services (New)

**P0 Enterprise Services:**
- **Web Search Service** (`/api/v3/web-search`) - Multi-provider real-time search
  - Perplexity AI, Google Custom Search, Bing Web Search
  - Automatic provider fallback and parallel search
  - Rate limiting and caching for optimization
  - *Status: Fully functional*

- **Document Processing Service** (`/api/v3/documents`) - Enterprise document analysis
  - 15+ format support: PDF, Word, Excel, PowerPoint, Text, Markdown, HTML, CSV, JSON, XML, Images (OCR), EPUB, RTF
  - Automatic format detection and text extraction
  - File upload with multer middleware
  - *Status: Fully functional*

- **NotebookLLM Studio** (`/api/v3/notebook`) - Interactive document Q&A
  - Document-based question answering with citations
  - Multi-document session support
  - Source attribution for answers
  - *Status: Fully functional*

- **Advanced Orchestration Patterns** (`/api/v3/orchestration`) - Multi-agent workflows
  - 6 patterns: Sequential, Concurrent, Supervisor, Adaptive Network, Handoff, Custom
  - Pre-built marketing workflow templates (content pipeline, campaign launch, competitor analysis)
  - Agent coordination with state management
  - *Status: Fully functional*

**P1 Intelligence Layer:**
- **Enhanced Mem0 Memory Service** (`/api/v3/memory`) - Cross-session memory
  - User/session/agent/workspace-level memory scopes
  - Semantic search with embeddings
  - 90% token reduction through compression
  - Memory versioning and feedback system
  - *Status: Fully functional*

- **CAM 2.0 Monitoring** (`/api/v3/monitoring`) - Real-time operations tracking
  - Operation tracking (LLM calls, agent execution, workflows)
  - Cost analytics with daily/monthly budgets
  - Quality scoring (accuracy, relevance, completeness, formatting, timeliness)
  - Provider health monitoring and alerting
  - *Status: Fully functional*

- **GRPO Continuous Learning** (`/api/v3/learning`) - Reinforcement learning from feedback
  - Policy optimization from user feedback
  - Adaptive routing based on learned preferences
  - A/B testing experiments for model/provider selection
  - Model performance rankings per task type
  - *Status: Fully functional*

**P2 Advanced Features:**
- **Digital Twin Framework** (`/api/v3/twins`) - Real-time operational models
  - Campaign, customer, and operation digital twins
  - Predictive scenario simulation
  - Human-in-the-loop approval workflows
  - State change tracking and notifications
  - *Status: Prototype (in-memory)*

- **Multi-Modal Content Pipeline** (`/api/v3/content`) - Strategy-to-content workflow
  - Pipeline stages: strategy → text → image → video → adaptation
  - Multi-channel content adaptation (9 channels supported)
  - Brand guidelines enforcement
  - Content variations and A/B testing
  - Content approval workflow
  - *Status: Prototype (in-memory)*

### Marketing Platform Services (New - v5.0)

- **OAuth Integration Service** (`/api/platform-connections`) - Multi-platform OAuth
  - Meta, Google, LinkedIn, TikTok, Twitter, Pinterest OAuth flows
  - Token management with auto-refresh
  - Connection status monitoring
  - *Status: Ready for OAuth credentials*

- **Conversion Tracking Service** (`/api/conversions`) - Pixel & Attribution
  - Facebook Pixel, Google Tag, LinkedIn Insight, TikTok Pixel, GTM
  - 6 attribution models (Last Click, First Click, Linear, Time Decay, Position-Based, Data-Driven)
  - Server-side tracking (CAPI, Measurement Protocol)
  - *Status: Fully functional*

- **SEO Toolkit Service** (`/api/seo`) - Enterprise SEO
  - Keyword research with difficulty scores
  - Rank tracking across search engines
  - Backlink analysis and monitoring
  - Technical SEO audits with Core Web Vitals
  - AI Visibility tracking (ChatGPT, Perplexity, Gemini, Claude, Copilot)
  - *Status: Fully functional*

- **Telegram Integration Service** (`/api/telegram`) - Bot Management
  - Multi-bot management with webhooks
  - Broadcast campaigns to subscribers
  - Automation triggers and responses
  - AI-powered conversational responses
  - *Status: Ready for Bot tokens*

- **Unified Analytics Service** (`/api/unified-analytics`) - Cross-vertical Analytics
  - ROI/ROAS calculations across all channels
  - 6 attribution models for conversion analysis
  - KPI dashboards with alerts and recommendations
  - Channel comparison and performance reports
  - *Status: Fully functional*

- **Marketing Agents Registry** - 300+ Specialized Agents
  - 22-point enterprise system prompt framework
  - ROMA L0-L4 autonomy levels
  - Autonomous execution with guardrails
  - Self-learning and collaboration capabilities
  - *Status: Fully functional*

- **Vertical Workflow Engine** (`/api/vertical-workflows`) - End-to-End Automation
  - 7 complete vertical workflows (Social, SEO, Performance Ads, Sales/SDR, WhatsApp, LinkedIn, Telegram)
  - Step-by-step orchestration with dependencies
  - Parallel execution and conditional branching
  - Mock mode for development without external API keys
  - *Status: Fully functional*

- **Cross-Vertical Orchestration** (`/api/cross-vertical`) - Intelligent Campaign Orchestration
  - Multi-vertical campaign creation and execution
  - Intelligent budget allocation algorithm
  - 8 cross-vertical synergies mapped
  - AI-powered optimization recommendations
  - *Status: Fully functional*

### Feature Roadmap (Priority)
**Phase 1 (P0)**: ✅ CRM integrations (Salesforce/HubSpot bi-directional sync), ✅ Ad Platform APIs (Meta, Google), ✅ WhatsApp Business full stack, ✅ Social Publishing APIs.
**Phase 2 (P1)**: ✅ Predictive Analytics Engine, ✅ AI Visibility Tracker (GEO for ChatGPT/Perplexity), Social Listening Engine, ✅ Omnichannel Smart Inbox.
**Phase 3 (P2)**: Cross-Vertical Journey Builder, ✅ Influencer Marketplace, ✅ White-label Reporting, ✅ Client Portal.

See `project-tracker.md` for detailed feature tracking and implementation status.

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