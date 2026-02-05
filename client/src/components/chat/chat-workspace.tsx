import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  Paperclip, 
  Bot,
  User,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Globe,
  Target,
  MessageCircle,
  TrendingUp,
  Megaphone,
  AlertCircle,
  Loader2
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  agentName?: string;
  model?: string;
  provider?: string;
  error?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  prompt: string;
  color: string;
  vertical: string;
}

interface ChatWorkspaceProps {
  vertical?: string;
  brandId?: number;
  brandContext?: Record<string, any>;
}

const verticalPrompts: Record<string, QuickAction[]> = {
  social: [
    { id: "social-1", label: "Content Calendar Strategy", icon: Megaphone, prompt: "Design a comprehensive 30-day content calendar for our brand across Instagram, Facebook, and Twitter. Include content themes, optimal posting times based on our audience analytics, and a mix of educational, promotional, and engagement posts.", color: "bg-pink-50 text-pink-600 border-pink-200", vertical: "social" },
    { id: "social-2", label: "Viral Post Creation", icon: Sparkles, prompt: "Create 5 high-engagement social media posts for our upcoming product launch. Include attention-grabbing hooks, compelling visuals concepts, strategic hashtags, and call-to-actions optimized for each platform.", color: "bg-pink-50 text-pink-600 border-pink-200", vertical: "social" },
    { id: "social-3", label: "Competitor Analysis", icon: Target, prompt: "Analyze the top 3 competitors in our industry on social media. Compare their content strategy, engagement rates, posting frequency, and identify gaps we can exploit to gain market share.", color: "bg-pink-50 text-pink-600 border-pink-200", vertical: "social" },
    { id: "social-4", label: "Multilingual Campaign", icon: Globe, prompt: "Create a festival marketing campaign in Hindi and Tamil for Diwali. Include localized messaging, culturally relevant hashtags, and platform-specific content for Instagram and WhatsApp.", color: "bg-pink-50 text-pink-600 border-pink-200", vertical: "social" },
    { id: "social-5", label: "Engagement Strategy", icon: MessageCircle, prompt: "Develop an engagement strategy to increase our comment rate by 50%. Include response templates, community management guidelines, and UGC campaign ideas.", color: "bg-pink-50 text-pink-600 border-pink-200", vertical: "social" }
  ],
  seo: [
    { id: "seo-1", label: "Technical SEO Audit", icon: Globe, prompt: "Conduct a comprehensive technical SEO audit of our website. Analyze Core Web Vitals, crawlability issues, indexation status, mobile optimization, and provide prioritized recommendations with estimated impact.", color: "bg-green-50 text-green-600 border-green-200", vertical: "seo" },
    { id: "seo-2", label: "Keyword Research", icon: Target, prompt: "Perform in-depth keyword research for our SaaS product targeting Indian SMBs. Include search volume, keyword difficulty, intent classification, and create topic clusters with pillar and cluster content recommendations.", color: "bg-green-50 text-green-600 border-green-200", vertical: "seo" },
    { id: "seo-3", label: "GEO Optimization", icon: Sparkles, prompt: "Optimize our content for Generative Engine Optimization (GEO). Analyze how our brand appears in AI search responses from ChatGPT, Perplexity, and Google AI Overviews, and provide strategies to improve AI citation rate.", color: "bg-green-50 text-green-600 border-green-200", vertical: "seo" },
    { id: "seo-4", label: "Content Gap Analysis", icon: TrendingUp, prompt: "Identify content gaps by comparing our organic rankings with top 5 competitors. List high-opportunity keywords we're missing, suggested content types, and projected traffic potential.", color: "bg-green-50 text-green-600 border-green-200", vertical: "seo" },
    { id: "seo-5", label: "Local SEO Strategy", icon: Globe, prompt: "Develop a local SEO strategy for our business targeting 10 major Indian cities. Include Google Business Profile optimization, local citation building, and location-specific content recommendations.", color: "bg-green-50 text-green-600 border-green-200", vertical: "seo" }
  ],
  web: [
    { id: "web-1", label: "Landing Page Design", icon: Sparkles, prompt: "Design a high-converting landing page for our SaaS product launch. Include wireframe structure, headline copy options, feature sections, trust signals, and A/B testing variants for the CTA.", color: "bg-blue-50 text-blue-600 border-blue-200", vertical: "web" },
    { id: "web-2", label: "Performance Optimization", icon: TrendingUp, prompt: "Analyze our website performance and create an optimization roadmap. Focus on reducing load time below 2 seconds, improving Core Web Vitals scores, and implementing lazy loading and caching strategies.", color: "bg-blue-50 text-blue-600 border-blue-200", vertical: "web" },
    { id: "web-3", label: "Conversion Rate Optimization", icon: Target, prompt: "Review our current website conversion funnel and identify drop-off points. Provide A/B testing hypotheses, UX improvement recommendations, and implement tracking for key micro-conversions.", color: "bg-blue-50 text-blue-600 border-blue-200", vertical: "web" },
    { id: "web-4", label: "Multilingual Website", icon: Globe, prompt: "Plan a multilingual website expansion to support Hindi, Tamil, and Telugu. Include URL structure recommendations, hreflang implementation, content localization strategy, and RTL considerations.", color: "bg-blue-50 text-blue-600 border-blue-200", vertical: "web" },
    { id: "web-5", label: "E-commerce Features", icon: Megaphone, prompt: "Add e-commerce capabilities to our website. Design the product catalog structure, cart functionality, checkout flow, and payment gateway integration with Razorpay and UPI support.", color: "bg-blue-50 text-blue-600 border-blue-200", vertical: "web" }
  ],
  sales: [
    { id: "sales-1", label: "Lead Scoring Model", icon: Target, prompt: "Create a comprehensive lead scoring model for our B2B SaaS business. Define scoring criteria based on firmographics, technographics, behavioral signals, and engagement data. Set MQL/SQL thresholds and routing rules.", color: "bg-orange-50 text-orange-600 border-orange-200", vertical: "sales" },
    { id: "sales-2", label: "Outreach Sequence", icon: MessageCircle, prompt: "Design a multi-touch outreach sequence for enterprise prospects. Include personalized email templates, LinkedIn connection messages, follow-up cadence, and objection handling responses for common sales blockers.", color: "bg-orange-50 text-orange-600 border-orange-200", vertical: "sales" },
    { id: "sales-3", label: "Sales Proposal", icon: Sparkles, prompt: "Generate a professional sales proposal for an enterprise client. Include executive summary, solution overview, implementation timeline, pricing options with ROI calculations, and case studies from similar industries.", color: "bg-orange-50 text-orange-600 border-orange-200", vertical: "sales" },
    { id: "sales-4", label: "Pipeline Analysis", icon: TrendingUp, prompt: "Analyze our current sales pipeline and identify bottlenecks. Calculate stage conversion rates, average deal velocity, and provide recommendations to improve win rates and shorten sales cycles.", color: "bg-orange-50 text-orange-600 border-orange-200", vertical: "sales" },
    { id: "sales-5", label: "Competitive Battle Card", icon: Globe, prompt: "Create a competitive battle card for our top 3 competitors. Include feature comparisons, pricing analysis, common objections and rebuttals, and unique selling propositions we can leverage in sales conversations.", color: "bg-orange-50 text-orange-600 border-orange-200", vertical: "sales" }
  ],
  whatsapp: [
    { id: "whatsapp-1", label: "Conversation Flow", icon: MessageCircle, prompt: "Design an intelligent WhatsApp conversation flow for customer support. Include welcome message, FAQ automation, order status queries, complaint handling, and human handoff triggers. Support Hindi and English.", color: "bg-emerald-50 text-emerald-600 border-emerald-200", vertical: "whatsapp" },
    { id: "whatsapp-2", label: "Broadcast Campaign", icon: Megaphone, prompt: "Create a WhatsApp broadcast campaign for our festive sale. Include personalized message templates, product catalog integration, discount code delivery, and follow-up sequences based on customer engagement.", color: "bg-emerald-50 text-emerald-600 border-emerald-200", vertical: "whatsapp" },
    { id: "whatsapp-3", label: "Voice Message Templates", icon: Sparkles, prompt: "Generate voice message templates in Hindi and Tamil for customer onboarding. Include welcome message, product tutorial guidance, and support contact information using natural conversational tone.", color: "bg-emerald-50 text-emerald-600 border-emerald-200", vertical: "whatsapp" },
    { id: "whatsapp-4", label: "Payment Collection", icon: Target, prompt: "Design a WhatsApp automation for payment reminders and collection. Include polite reminder sequences, payment link generation, receipt confirmation, and escalation paths for overdue accounts.", color: "bg-emerald-50 text-emerald-600 border-emerald-200", vertical: "whatsapp" },
    { id: "whatsapp-5", label: "Lead Qualification Bot", icon: TrendingUp, prompt: "Build a WhatsApp lead qualification bot that captures prospect information, assesses their needs, qualifies based on BANT criteria, and routes hot leads to sales reps with conversation context.", color: "bg-emerald-50 text-emerald-600 border-emerald-200", vertical: "whatsapp" }
  ],
  linkedin: [
    { id: "linkedin-1", label: "Thought Leadership", icon: Sparkles, prompt: "Create a thought leadership content series for LinkedIn. Develop 10 long-form article topics, outline structure, engaging hooks, and a publishing schedule that establishes our CEO as an industry authority.", color: "bg-sky-50 text-sky-600 border-sky-200", vertical: "linkedin" },
    { id: "linkedin-2", label: "Lead Generation", icon: Target, prompt: "Design a LinkedIn lead generation campaign targeting IT decision-makers in India. Include ICP definition, connection request templates, engagement strategy, and InMail sequences with personalization tokens.", color: "bg-sky-50 text-sky-600 border-sky-200", vertical: "linkedin" },
    { id: "linkedin-3", label: "Company Page Optimization", icon: TrendingUp, prompt: "Audit and optimize our LinkedIn company page for maximum visibility. Include headline updates, About section rewrite, showcase pages strategy, and employee advocacy program to amplify reach.", color: "bg-sky-50 text-sky-600 border-sky-200", vertical: "linkedin" },
    { id: "linkedin-4", label: "Event Promotion", icon: Megaphone, prompt: "Create a LinkedIn promotion strategy for our upcoming webinar. Include teaser posts, speaker spotlight content, LinkedIn Events integration, and post-event content repurposing plan.", color: "bg-sky-50 text-sky-600 border-sky-200", vertical: "linkedin" },
    { id: "linkedin-5", label: "SSI Improvement Plan", icon: Globe, prompt: "Analyze my current LinkedIn SSI score and create an action plan to reach 80+. Include daily activities for each SSI pillar, content creation schedule, and networking targets for the next 90 days.", color: "bg-sky-50 text-sky-600 border-sky-200", vertical: "linkedin" }
  ],
  performance: [
    { id: "perf-1", label: "Campaign Strategy", icon: TrendingUp, prompt: "Develop a comprehensive paid media strategy across Google Ads, Meta, and LinkedIn. Include budget allocation by platform, audience targeting strategy, creative guidelines, and ROAS targets by funnel stage.", color: "bg-purple-50 text-purple-600 border-purple-200", vertical: "performance" },
    { id: "perf-2", label: "Creative Testing", icon: Sparkles, prompt: "Design an A/B testing framework for our ad creatives. Create 5 headline variations, 3 visual concepts, and 4 CTA options. Include statistical significance requirements and success metrics.", color: "bg-purple-50 text-purple-600 border-purple-200", vertical: "performance" },
    { id: "perf-3", label: "Audience Strategy", icon: Target, prompt: "Build advanced audience segments for our remarketing campaigns. Include website visitor segments, lookalike audience strategies, customer list targeting, and exclusion rules to optimize ad spend.", color: "bg-purple-50 text-purple-600 border-purple-200", vertical: "performance" },
    { id: "perf-4", label: "Attribution Analysis", icon: Globe, prompt: "Analyze our multi-touch attribution data and recommend improvements. Compare last-click vs data-driven attribution, identify undervalued touchpoints, and suggest budget reallocation opportunities.", color: "bg-purple-50 text-purple-600 border-purple-200", vertical: "performance" },
    { id: "perf-5", label: "Budget Optimization", icon: Megaphone, prompt: "Optimize our monthly ad spend of Rs 5 Lakhs across platforms. Analyze current performance by channel, identify waste, and create a reallocation plan to improve overall ROAS by 30%.", color: "bg-purple-50 text-purple-600 border-purple-200", vertical: "performance" }
  ],
  pr: [
    { id: "pr-1", label: "Press Release", icon: Megaphone, prompt: "Draft a compelling press release for our product launch. Include headline options, key messaging, executive quotes, boilerplate, and distribution strategy for tier-1 media outlets in India.", color: "bg-indigo-50 text-indigo-600 border-indigo-200", vertical: "pr" },
    { id: "pr-2", label: "Media Outreach", icon: MessageCircle, prompt: "Create a media outreach campaign targeting top tech journalists and publications. Include personalized pitch templates, follow-up sequences, and exclusive story angles for different publications.", color: "bg-indigo-50 text-indigo-600 border-indigo-200", vertical: "pr" },
    { id: "pr-3", label: "Crisis Management", icon: Globe, prompt: "Develop a crisis communication playbook for potential PR scenarios. Include response templates, stakeholder communication plans, social media monitoring protocols, and escalation procedures.", color: "bg-indigo-50 text-indigo-600 border-indigo-200", vertical: "pr" },
    { id: "pr-4", label: "Thought Leadership", icon: Sparkles, prompt: "Build a thought leadership program for our CEO. Include speaking opportunities, byline article topics, podcast pitches, and awards/recognition submissions for the next 6 months.", color: "bg-indigo-50 text-indigo-600 border-indigo-200", vertical: "pr" },
    { id: "pr-5", label: "Brand Reputation", icon: TrendingUp, prompt: "Conduct a brand reputation audit. Analyze media sentiment, online reviews, social mentions, and provide recommendations to improve brand perception and share of voice.", color: "bg-indigo-50 text-indigo-600 border-indigo-200", vertical: "pr" }
  ],
  general: [
    { id: "gen-1", label: "Campaign Planning", icon: Megaphone, prompt: "Create a comprehensive marketing campaign plan for our upcoming product launch. Include multi-channel strategy across social, email, paid ads, and PR with timeline, budget allocation, and KPIs.", color: "bg-blue-50 text-blue-600 border-blue-200", vertical: "general" },
    { id: "gen-2", label: "Performance Report", icon: TrendingUp, prompt: "Generate a comprehensive weekly marketing performance report. Include metrics from all active campaigns, channel comparison, trend analysis, and data-driven recommendations for optimization.", color: "bg-purple-50 text-purple-600 border-purple-200", vertical: "general" },
    { id: "gen-3", label: "Content Strategy", icon: Sparkles, prompt: "Develop a quarterly content strategy aligned with our business goals. Include content pillars, format mix, distribution channels, resource requirements, and success metrics.", color: "bg-green-50 text-green-600 border-green-200", vertical: "general" },
    { id: "gen-4", label: "Brand Voice Guide", icon: MessageCircle, prompt: "Create a brand voice and tone guide for all our marketing communications. Include personality attributes, do's and don'ts, example messaging for different channels, and multilingual considerations.", color: "bg-orange-50 text-orange-600 border-orange-200", vertical: "general" },
    { id: "gen-5", label: "Market Analysis", icon: Globe, prompt: "Conduct a market analysis for our expansion into South Indian markets. Include market size, competitive landscape, cultural considerations, and go-to-market strategy recommendations.", color: "bg-sky-50 text-sky-600 border-sky-200", vertical: "general" }
  ]
};

const getQuickActions = (vertical: string): QuickAction[] => {
  return verticalPrompts[vertical] || verticalPrompts.general;
};

export default function ChatWorkspace({ vertical = "general", brandId = 1, brandContext }: ChatWorkspaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your Chief of Staff AI. I can help you manage campaigns, generate content, analyze performance, and orchestrate your 285 marketing agents across 8 verticals.\n\nWhat would you like to work on today?",
      timestamp: new Date(),
      agentName: "Chief of Staff",
      model: "GPT-4"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: currentInput,
          brandId,
          vertical,
          conversationId,
          context: brandContext
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!conversationId && data.metadata?.conversationId) {
        setConversationId(data.metadata.conversationId);
      }

      const assistantMessage: Message = {
        id: data.id || (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        agentName: data.agentName || "Chief of Staff",
        model: data.model || "AI",
        provider: data.provider
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I apologize, but I encountered an issue processing your request. ${error.message || "Please try again."}`,
        timestamp: new Date(),
        agentName: "System",
        error: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    setInput(action.prompt);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const regenerateResponse = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex <= 0) return;

    const previousUserMessage = messages.slice(0, messageIndex).reverse().find(m => m.role === "user");
    if (previousUserMessage) {
      setMessages(prev => prev.filter(m => m.id !== messageId));
      setInput(previousUserMessage.content);
      setTimeout(() => sendMessage(), 100);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-4 ${message.role === "user" ? "justify-end" : ""}`}>
              {message.role === "assistant" && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.error 
                    ? "bg-red-100" 
                    : "bg-gradient-to-br from-blue-500 to-purple-600"
                }`}>
                  {message.error ? (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
              )}
              
              <div className={`flex-1 max-w-2xl ${message.role === "user" ? "flex justify-end" : ""}`}>
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{message.agentName}</span>
                    {message.model && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                        {message.model}
                      </span>
                    )}
                    {message.provider && (
                      <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        {message.provider}
                      </span>
                    )}
                  </div>
                )}
                
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === "user" 
                    ? "bg-blue-600 text-white" 
                    : message.error
                      ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                </div>

                {message.role === "assistant" && !message.error && (
                  <div className="flex items-center gap-1 mt-2">
                    <button 
                      onClick={() => copyToClipboard(message.content)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Good response">
                      <ThumbsUp className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Poor response">
                      <ThumbsDown className="w-4 h-4 text-gray-400" />
                    </button>
                    <button 
                      onClick={() => regenerateResponse(message.id)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Regenerate response"
                    >
                      <RotateCcw className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                )}
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-sm text-gray-500">Processing with AI agents...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {messages.length <= 1 && (
        <div className="max-w-3xl mx-auto px-4 pb-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Suggested prompts for {vertical === "general" ? "marketing" : vertical}</p>
          <div className="flex flex-wrap gap-2">
            {getQuickActions(vertical).slice(0, 5).map((action: QuickAction) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors hover:shadow-sm ${action.color}`}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Paperclip className="w-5 h-5 text-gray-400" />
            </button>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask anything or describe what you need..."
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm py-2 disabled:opacity-50"
              style={{ minHeight: "24px", maxHeight: "120px" }}
            />

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">AI</span>
              </button>

              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          
          <p className="text-xs text-gray-400 text-center mt-2">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
