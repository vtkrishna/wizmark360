import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest Anthropic model is "claude-sonnet-4-20250514"
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export type AIProvider = "openai" | "anthropic" | "gemini" | "groq" | "together" | "openrouter" | "cohere" | "sarvam";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  tokensUsed?: number;
}

export class AIService {
  private defaultProvider: AIProvider = "openai";

  async chat(messages: ChatMessage[], provider?: AIProvider): Promise<AIResponse> {
    const selectedProvider = provider || this.defaultProvider;

    switch (selectedProvider) {
      case "openai":
        return this.chatWithOpenAI(messages);
      case "anthropic":
        return this.chatWithAnthropic(messages);
      case "gemini":
        return this.chatWithGemini(messages);
      default:
        return this.chatWithOpenAI(messages);
    }
  }

  private async chatWithOpenAI(messages: ChatMessage[]): Promise<AIResponse> {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_completion_tokens: 2048,
    });

    return {
      content: response.choices[0].message.content || "",
      provider: "openai",
      model: "gpt-5",
      tokensUsed: response.usage?.total_tokens,
    };
  }

  private async chatWithAnthropic(messages: ChatMessage[]): Promise<AIResponse> {
    const systemMessage = messages.find((m) => m.role === "system");
    const chatMessages = messages.filter((m) => m.role !== "system");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemMessage?.content,
      messages: chatMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const textContent = response.content.find((c) => c.type === "text");
    return {
      content: textContent?.type === "text" ? textContent.text : "",
      provider: "anthropic",
      model: "claude-sonnet-4-20250514",
      tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens,
    };
  }

  private async chatWithGemini(messages: ChatMessage[]): Promise<AIResponse> {
    const systemMessage = messages.find((m) => m.role === "system");
    const chatMessages = messages.filter((m) => m.role !== "system");
    
    const fullPrompt = systemMessage 
      ? `${systemMessage.content}\n\n${chatMessages.map((m) => `${m.role}: ${m.content}`).join("\n\n")}`
      : chatMessages.map((m) => `${m.role}: ${m.content}`).join("\n\n");

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    return {
      content: response.text || "",
      provider: "gemini",
      model: "gemini-2.5-flash",
    };
  }

  async generateMarketingContent(
    type: "social_post" | "email" | "ad_copy" | "seo_content",
    context: {
      brand: string;
      industry: string;
      targetAudience: string;
      tone: string;
      topic: string;
      platform?: string;
    }
  ): Promise<string> {
    const prompts: Record<string, string> = {
      social_post: `Create an engaging ${context.platform || "social media"} post for ${context.brand}, a ${context.industry} company.
Target audience: ${context.targetAudience}
Tone: ${context.tone}
Topic: ${context.topic}

Write a compelling post that drives engagement. Include relevant hashtags if appropriate.`,

      email: `Write a marketing email for ${context.brand}, a ${context.industry} company.
Target audience: ${context.targetAudience}
Tone: ${context.tone}
Topic: ${context.topic}

Include a compelling subject line and call-to-action.`,

      ad_copy: `Create ad copy for ${context.brand}, a ${context.industry} company.
Target audience: ${context.targetAudience}
Tone: ${context.tone}
Topic: ${context.topic}
Platform: ${context.platform || "Google Ads"}

Write headline, description, and call-to-action variations.`,

      seo_content: `Create SEO-optimized content for ${context.brand}, a ${context.industry} company.
Target audience: ${context.targetAudience}
Tone: ${context.tone}
Topic: ${context.topic}

Include meta title, meta description, and content outline with target keywords.`,
    };

    const response = await this.chat([
      {
        role: "system",
        content:
          "You are an expert marketing content strategist. Create high-converting, engaging content that drives results.",
      },
      { role: "user", content: prompts[type] },
    ]);

    return response.content;
  }

  async scoreAndQualifyLead(leadData: {
    name: string;
    email: string;
    company?: string;
    source: string;
    interactions?: string[];
    industry?: string;
  }): Promise<{
    score: number;
    qualification: "hot" | "warm" | "cold";
    reasoning: string;
    suggestedActions: string[];
  }> {
    const response = await this.chat(
      [
        {
          role: "system",
          content: `You are an expert sales lead qualification AI. Analyze leads and provide:
1. A score from 0-100 based on likelihood to convert
2. A qualification status (hot/warm/cold)
3. Reasoning for your assessment
4. 3 suggested follow-up actions

Respond in JSON format:
{
  "score": number,
  "qualification": "hot" | "warm" | "cold",
  "reasoning": "string",
  "suggestedActions": ["action1", "action2", "action3"]
}`,
        },
        {
          role: "user",
          content: `Analyze this lead:
Name: ${leadData.name}
Email: ${leadData.email}
Company: ${leadData.company || "Unknown"}
Source: ${leadData.source}
Industry: ${leadData.industry || "Unknown"}
Previous Interactions: ${leadData.interactions?.join(", ") || "None"}`,
        },
      ],
      "anthropic"
    );

    try {
      return JSON.parse(response.content);
    } catch {
      return {
        score: 50,
        qualification: "warm",
        reasoning: response.content,
        suggestedActions: [
          "Send introductory email",
          "Schedule discovery call",
          "Share relevant case studies",
        ],
      };
    }
  }

  async chiefOfStaffChat(
    userMessage: string,
    context: {
      activeCampaigns: number;
      totalLeads: number;
      scheduledPosts: number;
      runningAds: number;
    },
    provider?: AIProvider
  ): Promise<string> {
    const systemPrompt = `You are the Chief of Staff for Market360, a self-driving marketing agency platform with 267+ autonomous agents managing 7 marketing verticals:

1. Social Media - Content creation, scheduling, engagement
2. SEO & GEO - Search optimization, local presence
3. Web Development - Landing pages, optimization
4. Sales SDR - Lead qualification, outreach
5. WhatsApp - Conversational marketing
6. LinkedIn - B2B networking, thought leadership
7. Performance Ads - Paid campaigns across platforms

Current Platform Status:
- Active Campaigns: ${context.activeCampaigns}
- Total Leads: ${context.totalLeads}
- Scheduled Posts: ${context.scheduledPosts}
- Running Ads: ${context.runningAds}

You help users:
- Understand their marketing performance
- Suggest optimizations and strategies
- Execute marketing commands (create campaigns, schedule posts, etc.)
- Provide insights from the autonomous agent network

Be helpful, strategic, and proactive. Speak like a trusted marketing advisor.`;

    const response = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      provider
    );

    return response.content;
  }

  async analyzePerformance(
    metrics: {
      impressions: number;
      clicks: number;
      conversions: number;
      spend: number;
      revenue: number;
    },
    campaignType: string
  ): Promise<{
    insights: string[];
    recommendations: string[];
    riskAreas: string[];
  }> {
    const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0;
    const cvr = metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0;
    const roas = metrics.spend > 0 ? metrics.revenue / metrics.spend : 0;
    const cpa = metrics.conversions > 0 ? metrics.spend / metrics.conversions : 0;

    const response = await this.chat(
      [
        {
          role: "system",
          content: `You are a performance marketing analyst. Analyze campaign metrics and provide actionable insights.
Respond in JSON format:
{
  "insights": ["insight1", "insight2", "insight3"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "riskAreas": ["risk1", "risk2"]
}`,
        },
        {
          role: "user",
          content: `Analyze this ${campaignType} campaign:
Impressions: ${metrics.impressions.toLocaleString()}
Clicks: ${metrics.clicks.toLocaleString()}
CTR: ${ctr.toFixed(2)}%
Conversions: ${metrics.conversions}
CVR: ${cvr.toFixed(2)}%
Spend: $${metrics.spend.toFixed(2)}
Revenue: $${metrics.revenue.toFixed(2)}
ROAS: ${roas.toFixed(2)}x
CPA: $${cpa.toFixed(2)}`,
        },
      ],
      "gemini"
    );

    try {
      return JSON.parse(response.content);
    } catch {
      return {
        insights: ["Analysis completed"],
        recommendations: ["Continue monitoring performance"],
        riskAreas: [],
      };
    }
  }
}

export const aiService = new AIService();
