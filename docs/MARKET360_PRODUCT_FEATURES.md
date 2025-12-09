# Market360 - Self-Driving Agency Platform
## Product Features Document v3.0

---

## Executive Summary

**Market360** (Wizards MarketAI 360) is an enterprise-grade self-driving marketing agency platform powered by the **WAI SDK Orchestration Platform**. With 203+ autonomous agents, 34 core LLM models from 23 providers, and support for 12+ Indian languages, Market360 automates end-to-end marketing operations across 7 verticals.

### Platform Statistics
- **267 Autonomous Agents** across 7 marketing verticals (Social: 45, SEO: 38, Web: 32, Sales: 52, WhatsApp: 28, LinkedIn: 35, Performance: 37)
- **23 LLM Providers** with intelligent model routing
- **886+ AI Models** in the registry (4-tier architecture)
- **16 Multimodal Models** (9 HuggingFace, 4 OpenAI, 1 Anthropic, 2 Google)
- **12 Indian Languages** supported via Sarvam AI
- **5 Jurisdiction Regions** with compliance guardrails
- **4-Tier Model Architecture** with Smart Router
- **6-Part Agent System Prompts** for standardized behavior
- **Dual-Model Workflow** (Claude 4.5 Opus planning → Gemini 3.0 Pro execution)
- **VibeVoice Integration** (Microsoft VibeVoice-Realtime-0.5B for vibecoding)

---

## Table of Contents

1. [Platform Architecture](#platform-architecture)
2. [WAI SDK Orchestration](#wai-sdk-orchestration)
3. [Agent System Prompt Structure](#agent-system-prompt-structure)
4. [4-Tier Model Architecture](#4-tier-model-architecture)
5. [7 Marketing Verticals](#7-marketing-verticals)
6. [Jurisdiction Compliance](#jurisdiction-compliance)
7. [Voice & Multilingual Support](#voice--multilingual-support)
8. [API Reference](#api-reference)
9. [Enterprise Features](#enterprise-features)

---

## Platform Architecture

### Core Components

```
+-------------------------------------------------------------------+
|                    MARKET360 PLATFORM                              |
+--------------------------------------------------------------------+
|  +-------------------------------------------------------------+   |
|  |              WAI SDK ORCHESTRATION LAYER                     |   |
|  |         (Single Source of Truth for All AI Tasks)           |   |
|  +-------------------------------------------------------------+   |
|                              |                                      |
|  +---------------------------+----------------------------+        |
|  |                           v                            |        |
|  |  +---------------------------------------------------+ |        |
|  |  |           4-TIER SMART MODEL ROUTER               | |        |
|  |  |  Tier 1: Premium | Tier 2: Fast | Tier 3: Local   | |        |
|  |  +---------------------------------------------------+ |        |
|  |                           |                            |        |
|  |  +---------------------------------------------------+ |        |
|  |  |         203 AUTONOMOUS AGENTS                     | |        |
|  |  |   Social | SEO | Web | Sales | WA | LI | Perf     | |        |
|  |  +---------------------------------------------------+ |        |
|  |                           |                            |        |
|  |  +---------------------------------------------------+ |        |
|  |  |         ROMA FRAMEWORK (L0-L4)                    | |        |
|  |  |  Reactive > Proactive > Autonomous > Self-Evolving| |        |
|  |  +---------------------------------------------------+ |        |
|  +--------------------------------------------------------+        |
|                                                                     |
|  +-------------------------------------------------------------+   |
|  |                  7 MARKETING VERTICALS                       |   |
|  +---------+---------+---------+---------+---------+------------+   |
|  | Social  |  SEO &  |   Web   |  Sales  |WhatsApp | LinkedIn   |   |
|  | Media   |   GEO   |   Dev   |   SDR   |  Auto   |    B2B     |   |
|  +---------+---------+---------+---------+---------+------------+   |
|  |               PERFORMANCE ADVERTISING                        |   |
|  +-------------------------------------------------------------+   |
+--------------------------------------------------------------------+
```

### Technology Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: 23 LLM providers, 34 core models
- **Voice**: Sarvam AI (STT/TTS for 12 Indian languages)
- **Image**: Nano Banana Pro (4K generation)

---

## WAI SDK Orchestration

The WAI SDK serves as the **single source of truth** for all AI tasks in Market360.

### Core Functions

1. **Task Routing**
   - Analyzes task complexity, language, and requirements
   - Routes to optimal agent and model combination
   - Enforces jurisdiction-specific guardrails

2. **Agent Selection**
   - Matches task requirements with agent capabilities
   - Considers language support and jurisdiction coverage
   - Selects appropriate ROMA autonomy level

3. **Model Selection**
   - Uses 4-tier architecture for optimal model choice
   - Considers cost, latency, and capability requirements
   - Auto-routes Indian language tasks to Sarvam AI

4. **Guardrail Enforcement**
   - Validates all outputs against legal boundaries
   - Enforces ethical constraints per jurisdiction
   - Blocks prohibited actions automatically

### Orchestration API

```typescript
// Execute any marketing task through WAI SDK
POST /api/ai/wai-sdk/execute
{
  "type": "generation",
  "vertical": "social",
  "description": "Create viral Instagram post for Diwali campaign",
  "priority": "high",
  "capabilities": ["content creation", "trend analysis"],
  "jurisdictions": ["india"],
  "language": "hi",
  "context": { "brand": "Example Corp", "theme": "festive" }
}

// Response
{
  "taskId": "task-1702030800000",
  "agentId": "social-001",
  "agentName": "Content Creator",
  "provider": "sarvam",
  "model": "sarvam-m",
  "tier": "tier3",
  "response": "दीपावली की हार्दिक शुभकामनाएं!...",
  "confidence": 0.87,
  "processingTime": 1234,
  "metadata": {
    "jurisdictionsApplied": ["india"],
    "languageUsed": "hi",
    "guardrailsChecked": ["ASCI guidelines", "Cultural sensitivity"],
    "escalationRequired": false
  }
}
```

---

## Agent System Prompt Structure

All 203 agents follow a standardized 6-part system prompt structure:

### 1. IDENTITY & ROLE
```markdown
- **Agent ID**: social-001
- **Name**: Social Content Creator
- **Category**: SOCIAL Marketing
- **Tier**: L2 (Autonomous)
- **Autonomy Level**: Approved Strategy Execution
- **Mission**: Create high-converting, brand-aligned social media content
- **Objectives**:
  - Generate platform-optimized content
  - Maintain brand voice consistency
  - Maximize engagement through trend analysis
```

### 2. CAPABILITIES & EXPERTISE
```markdown
### Skills
- Copywriting
- Visual content strategy
- Hashtag optimization
- Trend analysis

### Jurisdictions Covered
- India: DPDP Act 2023
- UAE: Federal Decree-Law No. 45/2021
- Saudi Arabia: PDPL 2021
- Singapore: PDPA 2012
- Global: GDPR Compliant

### Languages Supported
- Primary: English, Hindi, Arabic
- Indian Languages (via Sarvam AI): Bengali, Tamil, Telugu, Marathi, 
  Gujarati, Kannada, Malayalam, Punjabi, Oriya, Assamese
```

### 3. TOOLS & RESOURCES
```markdown
### Available Tools
- **ContentGenerator**: AI-powered content creation with GPT-5/Claude
- **TrendAnalyzer**: Real-time trend detection via Perplexity
- **ImageGenerator**: Nano Banana Pro 4K image generation
- **Scheduler**: Optimal posting time calculator

### Database Access
- social_posts, campaigns, analytics, brand_assets

### External API Integrations
- Meta Graph API, Twitter API v2, LinkedIn Marketing API, Google Trends
```

### 4. RESPONSE FORMAT
```json
{
  "content": "string",
  "platform": "string",
  "hashtags": ["string"],
  "mediaUrls": ["string"],
  "scheduledTime": "ISO8601",
  "confidence": 0.85,
  "alternatives": ["string"]
}
```

### 5. COORDINATION PROTOCOL
```markdown
### Collaborates With
- Social Analytics Agent
- Brand Voice Agent
- Image Generator Agent

### Escalation Path
1. Social Team Lead Agent
2. Marketing Director Agent
3. Chief of Staff AI

### Handoff Procedures
- Condition: Content requires approval for sensitive topics
  - Target: Compliance Review Agent
  - Data: content, platform, region
```

### 6. GUARDRAILS & CONSTRAINTS
```markdown
### Legal Boundaries
- No false claims or misleading information
- Comply with platform advertising policies
- Follow FTC disclosure guidelines

### Jurisdiction Limitations
- **India**: Follow ASCI guidelines, no religious/political content without approval
- **UAE**: Respect cultural sensitivities
- **Saudi Arabia**: Comply with GCAM regulations
- **Singapore**: Follow IMDA guidelines

### Prohibited Actions
- Never post without brand approval for L0/L1 tier
- Never engage in controversial political discussions
- Never share confidential business information
```

---

## 4-Tier Model Architecture

### Tier 1: Premium Intelligence
| Model | Provider | Use Cases | Cost/1M tokens |
|-------|----------|-----------|----------------|
| GPT-5 | OpenAI | Complex reasoning, code | $5 / $15 |
| Claude 4 Opus | Anthropic | Advanced analysis | $15 / $75 |
| Claude 4 Sonnet | Anthropic | Balanced tasks | $3 / $15 |
| Gemini 2.5 Pro | Google | Long context | $1.25 / $5 |
| o3 Reasoning | OpenAI | Math, logic | $15 / $60 |

### Tier 2: Fast Inference
| Model | Provider | Use Cases | Cost/1M tokens |
|-------|----------|-----------|----------------|
| Llama 3.3 70B | Groq | Quick responses | $0.59 / $0.79 |
| Llama 3.3 8B | Groq | Ultra-fast | $0.05 / $0.08 |
| Mixtral 8x7B | Groq | Code, chat | $0.24 / $0.24 |
| Qwen 2.5 72B | Together | Multilingual | $0.9 / $0.9 |

### Tier 3: Specialized & Local
| Model | Provider | Use Cases | Cost/1M tokens |
|-------|----------|-----------|----------------|
| Sarvam M (24B) | Sarvam | Indian languages | Free tier |
| Sarvam Bulbul | Sarvam | TTS (12 languages) | Free tier |
| Sarvam Saarika | Sarvam | STT (22 languages) | Free tier |
| Command R+ | Cohere | Enterprise RAG | $3 / $15 |
| Sonar Pro | Perplexity | Real-time search | $3 / $15 |
| DeepSeek V3 | DeepSeek | Cost-effective | $0.27 / $1.1 |

### Tier 4: Aggregators
| Model | Provider | Use Cases | Cost |
|-------|----------|-----------|------|
| OpenRouter | 343+ models | Long tail | Variable |
| Replicate | Image/Video | Generation | Per-use |
| HuggingFace | Open models | Experimental | Free/Paid |

### Smart Router Logic
```typescript
function selectOptimalModel(task: Task): ModelSelection {
  // 1. Check language requirements
  if (task.language !== "en" && isIndianLanguage(task.language)) {
    return { provider: "sarvam", model: "sarvam-m", tier: "tier3" };
  }

  // 2. Check latency constraints
  if (task.constraints?.maxLatency < 2000) {
    return { provider: "groq", model: "llama-3.3-70b", tier: "tier2" };
  }

  // 3. Check task complexity
  if (task.type === "analysis" || task.type === "optimization") {
    return { provider: "anthropic", model: "claude-sonnet-4", tier: "tier1" };
  }

  // 4. Default to balanced option
  return { provider: "gemini", model: "gemini-2.5-flash", tier: "tier1" };
}
```

---

## 7 Marketing Verticals

### 1. Social Media Marketing (45 Agents)

**Mission**: Create viral, brand-aligned content across all social platforms

**Key Agents**:
| Agent | Tier | Function |
|-------|------|----------|
| Content Creator | L2 | Generate platform-optimized posts |
| Trend Jacker | L3 | Capitalize on viral trends in 30 min |
| Community Manager | L2 | Moderate and engage communities |
| Viral Predictor | L4 | Predict content virality |
| Crisis Manager | L4 | Handle social media crises |

**Features**:
- Multi-platform content generation (Instagram, Facebook, Twitter/X, LinkedIn)
- Real-time trend detection and response
- AI-powered image generation (Nano Banana Pro)
- 12 Indian language support
- Sentiment analysis and moderation
- Optimal posting time scheduling

### 2. SEO & GEO (38 Agents)

**Mission**: Dominate both traditional and AI-powered search results

**Key Agents**:
| Agent | Tier | Function |
|-------|------|----------|
| Technical Auditor | L2 | Comprehensive site audits |
| GEO Optimizer | L3 | AI search citation targeting |
| Keyword Researcher | L2 | Intent-based keyword discovery |
| Penalty Recovery | L4 | Algorithm penalty recovery |
| Site Migration Expert | L4 | Traffic-preserving migrations |

**Features**:
- Technical SEO audits with auto-fix recommendations
- GEO optimization for ChatGPT, Perplexity, Gemini citations
- Core Web Vitals monitoring and optimization
- International SEO with hreflang management
- Voice search optimization

### 3. Web Development (32 Agents)

**Mission**: Build high-converting web experiences with AI

**Key Agents**:
| Agent | Tier | Function |
|-------|------|----------|
| AI Page Builder | L2 | Generate pages from prompts |
| Code Generator | L3 | Production-ready code |
| Performance Optimizer | L2 | Speed optimization |
| Security Auditor | L3 | Vulnerability detection |
| Microservices Architect | L4 | System design |

**Features**:
- Aura.build integration (1,400+ components)
- Nano Banana Pro 4K image generation
- WCAG 2.1 AA accessibility compliance
- Progressive Web App development
- Real-time collaboration features

### 4. Sales SDR Automation (24 Agents)

**Mission**: Automate lead qualification and outreach at scale

**Key Agents**:
| Agent | Tier | Function |
|-------|------|----------|
| Lead Qualifier | L2 | AI lead scoring |
| Outreach Specialist | L2 | Personalized sequences |
| Meeting Booker | L2 | Calendar integration |
| Competitive Intel | L3 | Market intelligence |
| Sales Forecaster | L3 | Revenue prediction |

**Features**:
- Multi-touch lead scoring (BANT, MEDDIC)
- Hyper-personalized email sequences
- LinkedIn Sales Navigator integration
- HubSpot/Salesforce CRM sync
- AI-powered proposal generation

### 5. WhatsApp Automation (20 Agents)

**Mission**: Provide 24/7 conversational commerce and support

**Key Agents**:
| Agent | Tier | Function |
|-------|------|----------|
| Support Agent | L2 | L1/L2 query resolution |
| Voice Agent | L3 | Voice message processing |
| Sales Closer | L2 | In-chat conversions |
| Campaign Automator | L3 | Drip marketing |
| Compliance Checker | L2 | Policy enforcement |

**Features**:
- Voice-first AI with Sarvam STT/TTS
- 12 Indian language support
- In-chat catalog and payments
- Behavior-based broadcasts
- TRAI DND compliance

### 6. LinkedIn B2B Marketing (20 Agents)

**Mission**: Build thought leadership and generate B2B leads

**Key Agents**:
| Agent | Tier | Function |
|-------|------|----------|
| Authority Builder | L2 | Thought leadership content |
| Network Expander | L2 | Strategic connections |
| DM Automator | L2 | Message sequences |
| Live Stream Host | L3 | LinkedIn Live events |
| Employee Advocacy | L2 | Team amplification |

**Features**:
- Carousel and video content creation
- Strategic engagement automation
- Company page management
- Newsletter publishing
- Event promotion

### 7. Performance Advertising (24 Agents)

**Mission**: Maximize ROAS across all paid channels

**Key Agents**:
| Agent | Tier | Function |
|-------|------|----------|
| Ads Optimizer | L3 | Cross-platform optimization |
| Creative Factory | L2 | 50+ ad variations |
| Budget Allocator | L3 | Dynamic reallocation |
| Fraud Detector | L3 | Click fraud prevention |
| Programmatic Buyer | L3 | RTB management |

**Features**:
- Real-time bid optimization (15-min cycles)
- Multi-touch attribution modeling
- Cross-platform budget fluidity
- Audience cloning and lookalikes
- Native and video ad management

---

## Jurisdiction Compliance

### India
- **DPDP Act 2023**: Personal data protection
- **IT Act 2000**: Cyber law compliance
- **ASCI Guidelines**: Advertising standards
- **TRAI Regulations**: Telecom marketing rules
- **DNC Registry**: Do Not Call compliance

### UAE
- **Federal Law No. 45/2021**: Data protection
- **TRA Regulations**: Telecommunications
- **DIFC DPL**: Financial sector data
- **Dubai Media Office**: Content guidelines
- **Cultural Sensitivity**: Islamic values respect

### Saudi Arabia
- **PDPL 2021**: Personal Data Protection Law
- **CITC Regulations**: Communications authority
- **GCAM Guidelines**: Media content
- **Vision 2030 Alignment**: National objectives
- **Arabic Priority**: Language requirements

### Singapore
- **PDPA 2012**: Personal Data Protection Act
- **Spam Control Act**: Marketing restrictions
- **ASAS Guidelines**: Advertising standards
- **IMDA Regulations**: Media content
- **Multi-language**: Support requirements

### Global
- **GDPR**: EU data protection
- **CCPA**: California privacy
- **CAN-SPAM**: Email marketing
- **Platform Policies**: Social media ToS
- **Industry Standards**: Best practices

---

## Voice & Multilingual Support

### Sarvam AI Integration

**Text-to-Speech (Bulbul v1)**
- 12 Indian languages
- Natural voice synthesis
- Regional accent support
- WhatsApp voice integration

**Speech-to-Text (Saarika v2)**
- 22 Indian languages
- High-accuracy transcription
- Real-time processing
- Noise handling

### Supported Languages

| Language | Code | TTS | STT | LLM |
|----------|------|-----|-----|-----|
| English | en | Yes | Yes | Yes |
| Hindi | hi | Yes | Yes | Yes |
| Bengali | bn | Yes | Yes | Yes |
| Tamil | ta | Yes | Yes | Yes |
| Telugu | te | Yes | Yes | Yes |
| Marathi | mr | Yes | Yes | Yes |
| Gujarati | gu | Yes | Yes | Yes |
| Kannada | kn | Yes | Yes | Yes |
| Malayalam | ml | Yes | Yes | Yes |
| Punjabi | pa | Yes | Yes | Yes |
| Oriya | or | Yes | Yes | Yes |
| Assamese | as | Yes | Yes | Yes |

---

## API Reference

### WAI SDK Orchestration

```typescript
// List all agents
GET /api/ai/wai-sdk/agents

// Get agent details with system prompt
GET /api/ai/wai-sdk/agents/{agentId}

// Get agents by category
GET /api/ai/wai-sdk/agents/category/{category}

// Get orchestration statistics
GET /api/ai/wai-sdk/stats

// Execute task through WAI SDK
POST /api/ai/wai-sdk/execute
Body: { type, vertical, description, priority, capabilities, jurisdictions, language, context }

// Generate content
POST /api/ai/wai-sdk/generate-content
Body: { vertical, contentType, context, language, jurisdiction }

// Analyze performance
POST /api/ai/wai-sdk/analyze
Body: { vertical, metrics, jurisdiction }

// Handle support query
POST /api/ai/wai-sdk/support
Body: { message, language, customerId, jurisdiction }

// Get tier configurations
GET /api/ai/wai-sdk/tiers

// Get agent system prompt
GET /api/ai/wai-sdk/system-prompt/{agentId}
```

### AI Services

```typescript
// Chat with Chief of Staff AI
POST /api/ai/chat
Body: { message, provider, language }

// Generate content
POST /api/ai/generate-content
Body: { type, context, language, provider }

// Translate to Indian languages
POST /api/ai/translate
Body: { text, targetLanguage }

// Text-to-Speech
POST /api/ai/text-to-speech
Body: { text, language }

// Speech-to-Text
POST /api/ai/speech-to-text
Body: { audioData, language }

// Smart routing
POST /api/ai/smart-route
Body: { message, taskDescription, requirements }

// Task complexity analysis
POST /api/ai/analyze-task
Body: { task, requirements }
```

---

## Enterprise Features

### RBAC (Role-Based Access Control)
- **Admin**: Full platform access, agent configuration
- **Manager**: Vertical management, campaign approval
- **User**: Task execution, content creation
- **Viewer**: Dashboard and reports only

### Analytics Dashboard
- Real-time KPI tracking per vertical
- Cross-channel attribution modeling
- Agent performance metrics
- Cost optimization insights

### Audit Logging
- All agent actions logged
- Compliance verification trails
- Data access tracking
- Change history

### Integration Capabilities
- CRM: HubSpot, Salesforce, Zoho
- Ads: Google Ads, Meta Ads, LinkedIn Ads
- Social: Meta API, Twitter/X API, LinkedIn API
- E-commerce: Shopify, WooCommerce
- Voice: WhatsApp Business API

---

## Deployment & Pricing

### Infrastructure
- **Platform**: Replit deployment
- **Database**: PostgreSQL (Neon-backed)
- **CDN**: Cloudflare
- **Compute**: Auto-scaling

### Pricing Tiers (Recommended)

| Tier | Agents | Verticals | Languages | Support |
|------|--------|-----------|-----------|---------|
| Starter | 50 | 3 | English + Hindi | Email |
| Professional | 100 | 5 | 6 languages | Priority |
| Enterprise | 203+ | 7 | 12 languages | Dedicated |

---

## Roadmap

### Q1 2025
- [ ] Full RBAC implementation
- [ ] Advanced A/B testing framework
- [ ] Predictive analytics dashboard

### Q2 2025
- [ ] 267 agents (full target)
- [ ] Additional LLM providers
- [ ] Custom agent creation

### Q3 2025
- [ ] White-label solution
- [ ] API marketplace
- [ ] Partner integrations

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 3.0 | 2025-12-08 | Added 6-part agent prompts, WAI SDK orchestration, 203 agents |
| 2.0 | 2025-12-07 | Added 4-tier model architecture, smart router |
| 1.0 | 2025-12-06 | Initial platform launch with 7 verticals |

---

*Market360 - Self-Driving Agency Platform*
*Powered by WAI SDK Orchestration with 203 Autonomous Agents*
