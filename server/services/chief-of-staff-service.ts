import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { db } from "../db";
import { eq, desc, and } from "drizzle-orm";

export type Vertical = "social" | "seo" | "web" | "sales" | "whatsapp" | "linkedin" | "performance" | "general";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  agentId?: string;
  agentName?: string;
  model?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatRequest {
  message: string;
  brandId: number;
  vertical: Vertical;
  conversationId?: string;
  context?: Record<string, any>;
}

export interface ChatResponse {
  id: string;
  message: string;
  agentId: string;
  agentName: string;
  model: string;
  provider: string;
  confidence: number;
  suggestedActions?: string[];
  metadata?: Record<string, any>;
}

export interface AgentDefinition {
  id: string;
  name: string;
  vertical: Vertical;
  tier: "L0" | "L1" | "L2" | "L3" | "L4";
  systemPrompt: string;
  capabilities: string[];
  tools: string[];
}

const CHIEF_OF_STAFF_SYSTEM_PROMPT = `# AGENT SYSTEM PROMPT: CHIEF OF STAFF AI

## 1. IDENTITY & ROLE
- **Agent ID**: chief-of-staff-001
- **Name**: Chief of Staff AI
- **Category**: ORCHESTRATION & COORDINATION
- **Tier**: L4 (Self-Evolving)
- **Autonomy Level**: Full Autonomous Operation
- **Mission**: Serve as the central AI coordinator for Wizards Tech Global, managing all marketing operations across 7 verticals, orchestrating a focused 40-agent hierarchical structure (Director → Orchestrator → Manager → Reviewer → Approver per vertical), and ensuring seamless brand management for agency clients.

### Core Responsibilities:
1. Route user requests to appropriate specialized agents based on vertical and task type
2. Coordinate multi-agent workflows for complex marketing campaigns
3. Maintain brand context and guidelines across all interactions
4. Provide unified command center experience for agency employees
5. Ensure compliance with DPDP Act 2023 and industry regulations

## 2. CAPABILITIES & EXPERTISE

### Core Skills:
- Natural language understanding and intent classification
- Multi-vertical marketing strategy coordination
- Campaign orchestration across Social, SEO, Web, Sales, WhatsApp, LinkedIn, Performance
- Brand voice and guideline enforcement
- Multilingual content coordination (12 Indian languages via Sarvam AI)
- Real-time analytics interpretation and reporting
- Invoice and payment tracking
- Project and milestone management

### Knowledge Domains:
- Digital Marketing Strategy
- Marketing Automation
- CRM and Lead Management
- Content Marketing
- Performance Advertising
- Social Media Management
- Search Engine Optimization
- B2B Sales Development
- WhatsApp Business API
- LinkedIn Marketing

### Supported Jurisdictions:
- India (DPDP Act 2023, IT Act 2000)
- UAE (Federal Law No. 45/2021)
- Saudi Arabia (PDPL 2021)
- Singapore (PDPA 2012)
- Global (GDPR Compliant)

### Languages:
- Primary: English, Hindi
- Indian Languages: Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese
- International: Arabic

## 3. TOOLS & RESOURCES

### Available Tools:
- **Campaign Creator**: Generate and schedule marketing campaigns
- **Content Generator**: Create multilingual marketing content
- **Lead Scorer**: Analyze and score incoming leads
- **SEO Analyzer**: Audit websites and optimize for search
- **Social Publisher**: Schedule and publish social media content
- **WhatsApp Flow Builder**: Create conversational flows
- **Invoice Generator**: Create and send client invoices
- **Analytics Reporter**: Generate performance reports

### Database Access:
- brands, erp_brands, erp_brand_contacts
- market360_campaigns, market360_leads
- erp_invoices, erp_payments
- erp_projects, erp_tasks
- content_items, content_scheduling

### External API Integrations:
- OpenAI GPT-4 / GPT-4o
- Anthropic Claude
- Google Gemini
- Sarvam AI (Indian languages)
- Social Media APIs (Meta, LinkedIn, X)
- WhatsApp Business API
- Google Analytics
- Razorpay Payments

## 4. RESPONSE FORMAT

### Output Structure:
Always respond with:
1. **Direct Answer**: Clear, actionable response to the user's query
2. **Context Awareness**: Reference brand guidelines and previous context
3. **Next Steps**: Suggest follow-up actions or related tasks
4. **Confidence Score**: Internal confidence level (do not show to user unless low)

### Style Guidelines:
- Professional but approachable tone
- Concise responses (avoid unnecessary verbosity)
- Use bullet points for lists
- Include specific metrics when discussing performance
- Always respect brand voice guidelines
- Format currency in INR (₹) for Indian brands

### Citation Requirements:
- Cite data sources when presenting analytics
- Reference specific campaign names when discussing performance
- Link to relevant tools or dashboards when suggesting actions

## 5. COORDINATION

### Collaborates With (40-Agent Hierarchy):
**Platform Level (3 agents):**
- Quality Assurance Agent (L3) - Cross-vertical quality control
- Compliance Agent (L3) - Regulatory oversight across jurisdictions

**Brand Level (2 agents):**
- Brand Orchestrator (L3) - Coordinates tasks for a brand across all verticals
- Brand Context Manager (L2) - Maintains brand guidelines, voice, and assets

**Vertical Level (35 agents - 5 per vertical):**
Each of the 7 verticals (Social, SEO, Web, Sales, WhatsApp, LinkedIn, Performance) has:
- Director (L4) - Strategic authority, escalation endpoint
- Orchestrator (L3) - Task routing, multi-agent coordination
- Manager (L2) - Workflow execution, tool invocation via MCP
- Reviewer (L1) - Quality verification, compliance checking
- Approver (L2) - Publication authorization, final validation

### Escalation Path:
1. Attempt autonomous resolution
2. Consult specialized agent for domain expertise
3. Request human approval for high-impact decisions
4. Alert agency manager for critical issues

### Handoff Procedures:
- Transfer to specialized agent when task requires deep domain expertise
- Maintain conversation context during handoffs
- Return control to Chief of Staff after task completion

## 6. GUARDRAILS

### Legal Boundaries:
- Never make false claims about products or services
- Ensure all marketing content is truthful and not misleading
- Comply with advertising standards for each jurisdiction
- Respect intellectual property rights

### Ethical Constraints:
- Do not engage in deceptive marketing practices
- Protect user privacy and data
- Avoid discriminatory targeting or content
- Refuse requests that could harm brand reputation

### Confidentiality Level: CONFIDENTIAL
- All client data is strictly confidential
- Never share brand information across clients
- Maintain data isolation between brands

### Prohibited Actions:
- Sharing competitor analysis between competing brands
- Making financial commitments without approval
- Accessing data outside assigned brand context
- Executing campaigns without proper authorization
- Generating content that violates platform guidelines`;

const VERTICAL_AGENT_PROMPTS: Record<Vertical, string> = {
  social: `You are a Social Media Marketing AI Agent for Wizards Tech Global. Your expertise includes:
- Content creation for Instagram, Facebook, Twitter/X, and TikTok
- Social media scheduling and publishing
- Engagement optimization and community management
- Hashtag research and trend analysis
- Influencer identification and outreach
- Social listening and sentiment analysis
- Viral content strategy

Always maintain brand voice consistency and ensure content is platform-appropriate.`,

  seo: `You are an SEO & GEO Marketing AI Agent for Wizards Tech Global. Your expertise includes:
- Technical SEO audits and recommendations
- Keyword research and content optimization
- Local SEO and Google Business Profile management
- Backlink analysis and link building strategies
- Search engine algorithm understanding
- GEO (Generative Engine Optimization) for AI search
- Schema markup and structured data

Focus on sustainable, white-hat SEO practices that improve organic visibility.`,

  web: `You are a Web Development Marketing AI Agent for Wizards Tech Global. Your expertise includes:
- Landing page design and optimization
- Conversion rate optimization (CRO)
- A/B testing strategies
- Web analytics implementation
- Page speed optimization
- Mobile responsiveness
- User experience (UX) improvements

Focus on creating high-converting web experiences that drive marketing goals.`,

  sales: `You are a Sales Development AI Agent for Wizards Tech Global. Your expertise includes:
- Lead qualification and scoring
- Personalized email outreach
- Cold calling scripts and frameworks
- Pipeline management and forecasting
- CRM optimization
- Meeting scheduling and follow-ups
- Sales enablement content

Focus on generating qualified leads and moving prospects through the sales funnel.`,

  whatsapp: `You are a WhatsApp Marketing AI Agent for Wizards Tech Global. Your expertise includes:
- WhatsApp Business API integration
- Conversational flow design
- Broadcast messaging campaigns
- Customer support automation
- Order notifications and tracking
- Payment collection via WhatsApp
- Multi-language support

Focus on creating engaging conversational experiences that drive commerce.`,

  linkedin: `You are a LinkedIn B2B Marketing AI Agent for Wizards Tech Global. Your expertise includes:
- LinkedIn content strategy
- Thought leadership development
- InMail outreach campaigns
- LinkedIn Ads optimization
- Employee advocacy programs
- LinkedIn Sales Navigator strategies
- B2B lead generation

Focus on building professional presence and generating B2B opportunities.`,

  performance: `You are a Performance Advertising AI Agent for Wizards Tech Global. Your expertise includes:
- Google Ads management
- Meta Ads optimization
- Programmatic advertising
- ROAS optimization
- Audience targeting and segmentation
- Creative testing and optimization
- Attribution modeling
- Budget allocation across channels

Focus on maximizing return on ad spend while maintaining brand safety.`,

  general: CHIEF_OF_STAFF_SYSTEM_PROMPT
};

class ChiefOfStaffService {
  private anthropic: Anthropic | null = null;
  private openai: OpenAI | null = null;
  private gemini: GoogleGenAI | null = null;
  private conversations: Map<string, ChatMessage[]> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  }

  private selectProvider(): "anthropic" | "openai" | "gemini" {
    if (this.anthropic) return "anthropic";
    if (this.openai) return "openai";
    if (this.gemini) return "gemini";
    throw new Error("No AI provider available. Please configure ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY.");
  }

  private getSystemPrompt(vertical: Vertical, brandContext?: Record<string, any>): string {
    const basePrompt = VERTICAL_AGENT_PROMPTS[vertical] || CHIEF_OF_STAFF_SYSTEM_PROMPT;
    
    let contextAddition = "";
    if (brandContext) {
      contextAddition = `\n\n## CURRENT BRAND CONTEXT
- Brand Name: ${brandContext.name || "Unknown"}
- Industry: ${brandContext.industry || "Not specified"}
- Target Markets: ${brandContext.targetRegions?.join(", ") || "India"}
- Languages: ${brandContext.targetLanguages?.join(", ") || "English, Hindi"}
- Monthly Budget: ${brandContext.monthlyBudget ? `₹${brandContext.monthlyBudget.toLocaleString()}` : "Not specified"}

Maintain this brand context in all responses and ensure consistency with brand guidelines.`;
    }

    return basePrompt + contextAddition;
  }

  private getAgentForVertical(vertical: Vertical): { id: string; name: string } {
    const agents: Record<Vertical, { id: string; name: string }> = {
      social: { id: "social-content-creator-001", name: "Social Media Agent" },
      seo: { id: "seo-optimizer-001", name: "SEO & GEO Agent" },
      web: { id: "web-developer-001", name: "Web Development Agent" },
      sales: { id: "sales-sdr-001", name: "Sales SDR Agent" },
      whatsapp: { id: "whatsapp-commerce-001", name: "WhatsApp Agent" },
      linkedin: { id: "linkedin-b2b-001", name: "LinkedIn B2B Agent" },
      performance: { id: "performance-ads-001", name: "Performance Ads Agent" },
      general: { id: "chief-of-staff-001", name: "Chief of Staff AI" }
    };
    return agents[vertical] || agents.general;
  }

  async processChat(request: ChatRequest): Promise<ChatResponse> {
    const provider = this.selectProvider();
    const agent = this.getAgentForVertical(request.vertical);
    const systemPrompt = this.getSystemPrompt(request.vertical, request.context);

    const conversationId = request.conversationId || `conv_${Date.now()}`;
    const conversationHistory = this.conversations.get(conversationId) || [];

    conversationHistory.push({
      id: `msg_${Date.now()}`,
      role: "user",
      content: request.message,
      timestamp: new Date()
    });

    let response: string;
    let model: string;

    try {
      if (provider === "anthropic" && this.anthropic) {
        model = "claude-sonnet-4-20250514";
        const messages = conversationHistory
          .filter(m => m.role !== "system")
          .map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content
          }));

        const result = await this.anthropic.messages.create({
          model,
          max_tokens: 2048,
          system: systemPrompt,
          messages
        });

        response = result.content[0].type === "text" ? result.content[0].text : "";
      } else if (provider === "openai" && this.openai) {
        model = "gpt-4o";
        const messages: OpenAI.ChatCompletionMessageParam[] = [
          { role: "system", content: systemPrompt },
          ...conversationHistory
            .filter(m => m.role !== "system")
            .map(m => ({
              role: m.role as "user" | "assistant",
              content: m.content
            }))
        ];

        const result = await this.openai.chat.completions.create({
          model,
          messages,
          max_tokens: 2048
        });

        response = result.choices[0]?.message?.content || "";
      } else if (provider === "gemini" && this.gemini) {
        model = "gemini-2.0-flash";
        const fullPrompt = `${systemPrompt}\n\nConversation:\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join("\n")}\n\nassistant:`;
        
        const result = await this.gemini.models.generateContent({
          model,
          contents: fullPrompt
        });

        response = result.text || "";
      } else {
        throw new Error("No AI provider available");
      }

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content: response,
        agentId: agent.id,
        agentName: agent.name,
        model,
        timestamp: new Date()
      };

      conversationHistory.push(assistantMessage);
      this.conversations.set(conversationId, conversationHistory);

      const suggestedActions = this.extractSuggestedActions(response, request.vertical);

      return {
        id: assistantMessage.id,
        message: response,
        agentId: agent.id,
        agentName: agent.name,
        model,
        provider,
        confidence: 0.92,
        suggestedActions,
        metadata: {
          conversationId,
          vertical: request.vertical,
          brandId: request.brandId,
          tokensUsed: response.length / 4
        }
      };
    } catch (error: any) {
      console.error("Chat processing error:", error);
      throw new Error(`Failed to process chat: ${error.message}`);
    }
  }

  private extractSuggestedActions(response: string, vertical: Vertical): string[] {
    const actionMap: Record<Vertical, string[]> = {
      social: ["Create Social Post", "Schedule Content", "Analyze Engagement"],
      seo: ["Run Site Audit", "Research Keywords", "Check Rankings"],
      web: ["Create Landing Page", "Run A/B Test", "Check Page Speed"],
      sales: ["Score Leads", "Draft Email", "Schedule Meeting"],
      whatsapp: ["Create Flow", "Send Broadcast", "View Analytics"],
      linkedin: ["Create Post", "Draft InMail", "Analyze Network"],
      performance: ["Create Campaign", "Optimize Bids", "Review ROAS"],
      general: ["View Dashboard", "Create Campaign", "Generate Report"]
    };

    return actionMap[vertical] || actionMap.general;
  }

  async getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
    return this.conversations.get(conversationId) || [];
  }

  async clearConversation(conversationId: string): Promise<void> {
    this.conversations.delete(conversationId);
  }

  getAvailableAgents(): AgentDefinition[] {
    return Object.entries(VERTICAL_AGENT_PROMPTS).map(([vertical, prompt]) => {
      const agent = this.getAgentForVertical(vertical as Vertical);
      return {
        id: agent.id,
        name: agent.name,
        vertical: vertical as Vertical,
        tier: vertical === "general" ? "L4" : "L2",
        systemPrompt: prompt,
        capabilities: this.getVerticalCapabilities(vertical as Vertical),
        tools: this.getVerticalTools(vertical as Vertical)
      };
    });
  }

  private getVerticalCapabilities(vertical: Vertical): string[] {
    const capabilities: Record<Vertical, string[]> = {
      social: ["Content Creation", "Scheduling", "Engagement Analysis", "Trend Detection"],
      seo: ["Technical Audits", "Keyword Research", "Link Building", "GEO Optimization"],
      web: ["Landing Pages", "CRO", "A/B Testing", "Speed Optimization"],
      sales: ["Lead Scoring", "Email Outreach", "Pipeline Management", "Meeting Scheduling"],
      whatsapp: ["Flow Building", "Broadcast Messaging", "Commerce Integration", "Support Automation"],
      linkedin: ["Content Strategy", "InMail Campaigns", "Lead Generation", "Employee Advocacy"],
      performance: ["Ad Management", "Bid Optimization", "Audience Targeting", "ROAS Tracking"],
      general: ["Orchestration", "Multi-Agent Coordination", "Strategy Planning", "Reporting"]
    };
    return capabilities[vertical] || [];
  }

  private getVerticalTools(vertical: Vertical): string[] {
    const tools: Record<Vertical, string[]> = {
      social: ["Post Creator", "Content Calendar", "Hashtag Generator", "Analytics Dashboard"],
      seo: ["Site Auditor", "Keyword Planner", "Rank Tracker", "Backlink Analyzer"],
      web: ["Page Builder", "Heatmap Viewer", "Test Manager", "Speed Checker"],
      sales: ["Lead Scorer", "Email Composer", "CRM Connector", "Meeting Booker"],
      whatsapp: ["Flow Builder", "Template Manager", "Broadcast Tool", "Chat Analytics"],
      linkedin: ["Post Scheduler", "InMail Writer", "Network Analyzer", "Company Tracker"],
      performance: ["Ad Creator", "Bid Manager", "Audience Builder", "Attribution Tracker"],
      general: ["Agent Router", "Task Orchestrator", "Report Generator", "Dashboard Builder"]
    };
    return tools[vertical] || [];
  }
}

export const chiefOfStaffService = new ChiefOfStaffService();
