# Wizards MarketAI 360 - Product & Technical Master Plan

**Version 2.0** | Updated: January 2026

---

## Executive Summary

Wizards MarketAI 360 is a comprehensive AI-powered marketing platform enabling agencies to manage multiple brands across 7 verticals with 267 specialized agents. The platform leverages intelligent model routing across 886 models from 24 providers, delivering a self-driving marketing agency experience.

---

## Platform Architecture

### Core Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, TailwindCSS, Framer Motion |
| Backend | Express.js, Node.js, TypeScript |
| Database | PostgreSQL with Drizzle ORM |
| AI Backbone | WAI SDK Orchestration Platform |
| Authentication | Replit Auth with Session Management |
| Package Manager | pnpm |
| Build System | Vite |

### Market360 Agent Architecture

**267 Specialized Agents** distributed across 7 marketing verticals:

| Vertical | Agent Count | Key Functions |
|----------|-------------|---------------|
| Social Media Marketing | 45 | Content creation, scheduling, engagement |
| SEO/GEO Optimization | 38 | Search optimization, AI visibility tracking |
| Web Development | 35 | Landing pages, A/B testing, UX optimization |
| Sales/SDR Automation | 42 | Lead scoring, outreach, pipeline management |
| WhatsApp Marketing | 28 | Broadcast, flows, conversational commerce |
| LinkedIn B2B | 32 | Company targeting, thought leadership |
| Performance Advertising | 47 | Meta Ads, Google Ads, campaign optimization |

**ROMA Autonomy Levels:**
- **L0 (Reactive):** Responds to direct commands
- **L1 (Proactive):** Suggests improvements
- **L2 (Autonomous):** Executes within boundaries
- **L3 (Collaborative):** Works with other agents
- **L4 (Self-Evolving):** Learns and adapts

---

## AI Infrastructure

### LLM Providers (24 Integrated)

| Provider | Models | Specialization |
|----------|--------|----------------|
| OpenAI | GPT-4o, GPT-4-Turbo, o1, o3 | General, Reasoning |
| Anthropic | Claude 3.5 Sonnet, Claude 4 Opus | Analysis, Writing |
| Google | Gemini 2.0 Pro/Flash, Gemini 2.5 | Multimodal, Speed |
| Groq | Llama 3.3-70B, Mixtral | Ultra-fast inference |
| Cohere | Command R+, Embed v4 | Enterprise, Search |
| DeepSeek | DeepSeek V3, Coder | Cost-effective |
| Mistral | Large 2, Codestral | European, Code |
| xAI | Grok-2, Grok-3 | Real-time knowledge |
| Together AI | 100+ open models | Diverse selection |
| OpenRouter | 200+ models | Unified access |
| Perplexity | pplx-70b-online | Web-grounded |
| Replicate | Stable Diffusion, Flux | Image generation |
| Zhipu AI | GLM-4V (multimodal) | Chinese market |
| Sarvam AI | Saarika, Bulbul | Indian languages |
| AWS Bedrock | Claude, Titan | Enterprise |
| Azure OpenAI | GPT-4, Embeddings | Enterprise |
| VertexAI | Gemini, PaLM | Google Cloud |
| Fireworks | Fast inference | Speed |
| Anyscale | Open models | Scalability |
| HuggingFace | Community models | Research |
| Ollama | Local models | Privacy |

### 4-Tier Model Architecture

| Tier | Purpose | Example Models | Cost/1M tokens |
|------|---------|----------------|----------------|
| **Tier 1 (Flagship)** | Complex reasoning | GPT-4o, Claude 4 Opus | $15-30 |
| **Tier 2 (Performance)** | Balanced tasks | Claude 3.5 Sonnet, Gemini Pro | $3-10 |
| **Tier 3 (Efficient)** | High-volume tasks | GPT-4o-mini, Gemini Flash | $0.15-1 |
| **Tier 4 (Budget)** | Simple tasks | DeepSeek V3, Llama 3.3 | $0.01-0.10 |

### Intelligent Model Router

Multi-factor scoring engine for optimal model selection:
- Task complexity analysis
- Cost optimization (90% savings with KIMI K2)
- Quality requirements matching
- Agent capability alignment
- Latency requirements
- Automatic fallback handling

---

## Enterprise Services (Production-Ready)

### 1. WhatsApp Business Service

**Endpoint:** `/api/whatsapp`

| Feature | Description |
|---------|-------------|
| Message Templates | Pre-approved templates in Hindi, Tamil, English |
| Broadcast Campaigns | Mass messaging with metrics and delivery tracking |
| Conversation Flows | AI-powered response automation |
| Webhook Integration | Real-time incoming message handling |
| Media Support | Images, documents, audio, video |

**Status:** Awaiting WhatsApp Business API credentials

---

### 2. CRM Integration Service

**Endpoint:** `/api/crm`

| Feature | Description |
|---------|-------------|
| Salesforce Sync | Bi-directional contacts, leads, opportunities |
| HubSpot Sync | Contacts, deals, companies, timeline |
| Real-time Sync | Webhook-based instant updates |
| Conflict Resolution | Intelligent merge handling |
| Pipeline Analytics | Conversion rates, deal velocity |

**Supported Objects:**
- Contacts & Leads
- Accounts & Companies
- Deals & Opportunities
- Activities & Notes

**Status:** Ready for API credentials

---

### 3. Social Publishing Service

**Endpoint:** `/api/social`

| Platform | Features |
|----------|----------|
| **Meta (Facebook/Instagram)** | Posts, Stories, Reels, Carousels |
| **LinkedIn** | Company pages, Personal profiles, Articles |
| **Twitter/X** | Tweets, Threads, Media |
| **Pinterest** | Pins, Boards, Rich Pins |

**Features:**
- Content calendar with scheduling
- AI caption generation
- Platform-specific analytics
- Best time to post recommendations
- Multi-account management

**Status:** Ready for OAuth integration

---

### 4. Sarvam Voice Agent Service

**Endpoint:** `/api/voice`

| Capability | Model | Languages |
|------------|-------|-----------|
| Speech-to-Text | Saarika v2 | 12 Indian languages |
| Text-to-Speech | Bulbul v1 | Natural voices, 8 languages |

**Supported Languages:**
Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, Assamese, English

**Use Cases:**
- Voice notes processing for WhatsApp
- IVR and call center automation
- Voice-enabled chatbots
- Audio content creation

**Status:** API key configured and ready

---

### 5. Email Campaign Service

**Endpoint:** `/api/email`

| Feature | Description |
|---------|-------------|
| Template Library | Drag-and-drop templates with variables |
| Campaign Management | Audience targeting, scheduling |
| Automation Workflows | Welcome series, drip campaigns, triggers |
| AI Content | Subject lines, body copy generation |
| Analytics | Opens, clicks, conversions |

**Automation Types:**
- Welcome Series (5-email sequence)
- Lead Nurturing
- Re-engagement
- Cart Abandonment
- Post-Purchase

**Status:** Ready for SMTP/ESP integration

---

### 6. Razorpay Payment Service

**Endpoint:** `/api/payments`

| Feature | Description |
|---------|-------------|
| Orders | Create and manage payment orders |
| Invoices | GST/IGST support, HSN/SAC codes |
| Subscriptions | Monthly/yearly recurring billing |
| Payment Links | Shareable links with SMS/Email |
| Webhooks | Real-time payment updates |

**Payment Methods:**
- UPI (Google Pay, PhonePe, Paytm)
- Credit/Debit Cards
- NetBanking (50+ banks)
- Wallets (Amazon Pay, Freecharge)
- EMI Options

**Indian Compliance:**
- GST/IGST/CGST+SGST tax handling
- HSN/SAC code support
- e-Invoice generation ready
- TDS compliance

**Status:** Awaiting RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

---

### 7. Client Portal Service

**Endpoint:** `/api/portal`

| Feature | Description |
|---------|-------------|
| White-Label Branding | Custom logo, colors, domain |
| Report Generation | Automated PDF/Excel reports |
| Content Approval | Review and approve workflows |
| Real-time Dashboards | Live KPI visibility |
| Secure Access | SSO and role-based permissions |

**Portal Components:**
- Campaign overview
- Content calendar view
- Approval inbox
- Analytics dashboard
- Invoice history

**Status:** Fully functional

---

### 8. Influencer Marketplace

**Endpoint:** `/api/influencers`

| Feature | Description |
|---------|-------------|
| AI Discovery | Find influencers by niche, audience, engagement |
| Campaign Management | Briefs, contracts, deliverables |
| Deliverables Tracking | Content submission and approval |
| ROI Analytics | Cost per engagement, conversions |
| Payment Integration | Influencer payouts |

**Discovery Filters:**
- Platform (Instagram, YouTube, LinkedIn)
- Follower count
- Engagement rate
- Location/Language
- Niche categories

**Status:** Fully functional

---

## Advanced Analytics

### Predictive Analytics Engine

| Capability | Description |
|------------|-------------|
| Trend Forecasting | ML-powered trend prediction |
| Anomaly Detection | Automatic alert on unusual patterns |
| Lead Scoring | Predictive conversion probability |
| Churn Prediction | At-risk customer identification |
| Budget Optimization | AI-recommended spend allocation |

### AI Visibility Tracker (GEO)

Track brand mentions and rankings on:
- ChatGPT conversations
- Perplexity AI
- Google SGE/AI Overviews
- Claude responses
- Other AI assistants

### Native Ad Publishing

| Platform | Features |
|----------|----------|
| Google Ads | Search, Display, YouTube campaigns |
| Meta Ads | Facebook, Instagram, Audience Network |
| LinkedIn Ads | Sponsored content, InMail, Lead Gen |

---

## Multilingual Support

### 22 Indian Languages + English

**Full Support (Voice + Text):**
Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati

**Text Support:**
Punjabi, Odia, Assamese, Urdu, Sanskrit, Konkani, Manipuri, Nepali, Bodo, Dogri, Maithili, Santali, Sindhi, Kashmiri

### Translation Service

- Real-time content translation
- Brand voice preservation
- Cultural localization
- SEO-optimized translations

---

## Security & Compliance

### Authentication & Authorization

| Feature | Implementation |
|---------|----------------|
| SSO | Replit Auth integration |
| Session Management | Secure cookies, auto-expiry |
| RBAC | 4 user roles with granular permissions |
| API Security | Rate limiting, helmet.js |

### User Roles

| Role | Capabilities |
|------|--------------|
| **Super Admin** | Full platform access, billing, users |
| **Admin** | Brand management, all features |
| **Editor** | Content creation, publishing |
| **Viewer** | Read-only dashboards |

### Audit Logging

All actions tracked:
- User activity
- Content changes
- API calls
- Payment transactions
- Authentication events

---

## API Reference

### Base URL

```
https://[your-domain]/api
```

### Authentication

All enterprise endpoints require authentication via session cookie.

### Endpoint Categories

| Category | Base Path | Description |
|----------|-----------|-------------|
| Health | `/api/health` | System status |
| Auth | `/api/auth` | Login, logout, user |
| Brands | `/api/brands` | Brand management |
| Agents | `/api/agents` | Market360 agents |
| Orchestration | `/api/orchestration` | AI model routing |
| WhatsApp | `/api/whatsapp` | WhatsApp Business |
| CRM | `/api/crm` | CRM integrations |
| Social | `/api/social` | Social publishing |
| Voice | `/api/voice` | Voice AI |
| Email | `/api/email` | Email campaigns |
| Payments | `/api/payments` | Razorpay billing |
| Portal | `/api/portal` | Client portals |
| Influencers | `/api/influencers` | Influencer marketplace |
| Analytics | `/api/predictive` | Predictive analytics |
| Ads | `/api/ads` | Ad publishing |

---

## Deployment

### Development

```bash
npm run dev
```

### Production

- **Autoscale deployment** for stateless operation
- PostgreSQL database with automatic backups
- Environment-based configuration
- Health monitoring enabled

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection | Yes |
| SESSION_SECRET | Session encryption | Yes |
| RAZORPAY_KEY_ID | Razorpay public key | For payments |
| RAZORPAY_KEY_SECRET | Razorpay secret key | For payments |
| SARVAM_API_KEY | Sarvam AI key | For voice |
| OPENAI_API_KEY | OpenAI access | For AI |
| ANTHROPIC_API_KEY | Claude access | For AI |
| GEMINI_API_KEY | Gemini access | For AI |

---

## Roadmap

### Phase 1 (Completed)
- [x] CRM Integrations (Salesforce/HubSpot)
- [x] Ad Platform APIs (Meta, Google)
- [x] WhatsApp Business full stack
- [x] Social Publishing APIs
- [x] Razorpay Payment Integration

### Phase 2 (Completed)
- [x] Predictive Analytics Engine
- [x] AI Visibility Tracker (GEO)
- [x] Omnichannel Smart Inbox
- [x] Sarvam Voice Integration

### Phase 3 (Completed)
- [x] Influencer Marketplace
- [x] White-label Reporting
- [x] Client Portal

### Phase 4 (Planned)
- [ ] Cross-Vertical Journey Builder
- [ ] Social Listening Engine
- [ ] Advanced A/B Testing
- [ ] Custom Agent Builder

---

## Support

For API credentials and integration support:
- WhatsApp Business API: Meta Business Suite
- Razorpay: dashboard.razorpay.com
- Salesforce/HubSpot: Contact respective providers

---

**Document Version:** 2.0  
**Last Updated:** January 2026  
**Platform Version:** WAI SDK v7.0+

