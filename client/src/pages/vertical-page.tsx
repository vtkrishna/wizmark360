import { useState, useEffect } from "react";
import AppShell from "../components/layout/app-shell";
import ChatWorkspace from "../components/chat/chat-workspace";
import KPICard from "../components/dashboard/kpi-card";
import SEOToolkitPanel from "../components/verticals/seo-toolkit-panel";
import SocialMediaToolkitPanel from "../components/verticals/social-media-toolkit-panel";
import WhatsAppToolkitPanel from "../components/verticals/whatsapp-toolkit-panel";
import PerformanceAdsToolkitPanel from "../components/verticals/performance-ads-toolkit-panel";
import LinkedInToolkitPanel from "../components/verticals/linkedin-toolkit-panel";
import SalesSDRToolkitPanel from "../components/verticals/sales-sdr-toolkit-panel";
import WebDevToolkitPanel from "../components/verticals/webdev-toolkit-panel";
import PRToolkitPanel from "../components/verticals/pr-toolkit-panel";
import { 
  Megaphone, 
  Globe, 
  Code, 
  Target, 
  MessageCircle, 
  Linkedin, 
  TrendingUp,
  BarChart3,
  FileText,
  Users,
  Zap,
  ChevronRight,
  Sparkles,
  Bot,
  Calendar,
  Settings,
  Play,
  Pause,
  Newspaper,
  Shield
} from "lucide-react";

interface VerticalPageProps {
  vertical: string;
}

interface SpecializedFeature {
  title: string;
  description: string;
  icon: any;
  highlight?: boolean;
}

const verticalConfig: Record<string, {
  name: string;
  icon: any;
  color: string;
  bgGradient: string;
  description: string;
  kpis: { title: string; value: string; change: number; trend: "up" | "down" | "neutral" }[];
  agents: { name: string; status: "active" | "idle" | "working" }[];
  quickActions: { label: string; icon: any }[];
  specializedFeatures: SpecializedFeature[];
  agentCount: number;
}> = {
  social: {
    name: "Social Media",
    icon: Megaphone,
    color: "pink",
    bgGradient: "from-pink-500 to-rose-600",
    description: "Manage content, schedule posts, and engage audiences across all social platforms",
    agentCount: 45,
    kpis: [
      { title: "Posts Scheduled", value: "24", change: 12, trend: "up" },
      { title: "Engagement Rate", value: "4.8%", change: 0.5, trend: "up" },
      { title: "Followers Growth", value: "+2.3K", change: 8, trend: "up" },
      { title: "Reach This Week", value: "45K", change: -3, trend: "down" },
    ],
    agents: [
      { name: "Content Creator", status: "active" },
      { name: "Hashtag Optimizer", status: "working" },
      { name: "Engagement Responder", status: "idle" },
    ],
    quickActions: [
      { label: "Create Post", icon: FileText },
      { label: "Schedule Content", icon: Calendar },
      { label: "Generate Hashtags", icon: Sparkles },
    ],
    specializedFeatures: [
      { title: "Multi-Platform Publishing", description: "Simultaneously publish to Instagram, Facebook, Twitter, and 5+ platforms with platform-optimized formatting", icon: Globe, highlight: true },
      { title: "AI Content Calendar", description: "Smart scheduling based on audience engagement patterns and optimal posting times", icon: Calendar },
      { title: "Trend Detection Engine", description: "Real-time trending hashtag and topic identification for viral content creation", icon: TrendingUp },
      { title: "Engagement Auto-Response", description: "AI-powered comment and DM responses in 22 Indian languages", icon: MessageCircle },
      { title: "Visual Content Studio", description: "Generate branded images, carousels, and video thumbnails with AI", icon: Sparkles },
      { title: "Competitor Analysis", description: "Track competitor posts, engagement rates, and content strategies", icon: Target }
    ]
  },
  seo: {
    name: "SEO & GEO",
    icon: Globe,
    color: "green",
    bgGradient: "from-emerald-500 to-green-600",
    description: "Optimize search rankings, track keywords, and improve organic visibility",
    agentCount: 38,
    kpis: [
      { title: "Domain Authority", value: "45", change: 3, trend: "up" },
      { title: "Organic Traffic", value: "12.5K", change: 18, trend: "up" },
      { title: "Keywords Ranked", value: "156", change: 12, trend: "up" },
      { title: "Backlinks", value: "892", change: 5, trend: "up" },
    ],
    agents: [
      { name: "Keyword Researcher", status: "active" },
      { name: "Content Optimizer", status: "working" },
      { name: "Link Builder", status: "idle" },
    ],
    quickActions: [
      { label: "Run Site Audit", icon: BarChart3 },
      { label: "Research Keywords", icon: Globe },
      { label: "Optimize Content", icon: Sparkles },
    ],
    specializedFeatures: [
      { title: "GEO (Generative Engine Optimization)", description: "Optimize for AI search engines like ChatGPT, Perplexity, and Google AI Overviews", icon: Sparkles, highlight: true },
      { title: "Multilingual SEO", description: "Keyword research and content optimization in 22 Indian languages for regional markets", icon: Globe },
      { title: "Technical SEO Auditor", description: "Automated crawling, indexation analysis, and Core Web Vitals optimization", icon: Code },
      { title: "Content Gap Analysis", description: "Identify missing topics and keywords competitors rank for", icon: Target },
      { title: "Backlink Intelligence", description: "AI-powered link building opportunities and outreach automation", icon: Zap },
      { title: "SERP Feature Tracker", description: "Monitor featured snippets, local packs, and knowledge panels", icon: BarChart3 }
    ]
  },
  web: {
    name: "Web Development",
    icon: Code,
    color: "blue",
    bgGradient: "from-blue-500 to-indigo-600",
    description: "Build landing pages, manage websites, and track web performance",
    agentCount: 32,
    kpis: [
      { title: "Page Speed", value: "92", change: 5, trend: "up" },
      { title: "Conversion Rate", value: "3.2%", change: 0.4, trend: "up" },
      { title: "Active Pages", value: "48", change: 6, trend: "up" },
      { title: "Load Time", value: "1.2s", change: -8, trend: "up" },
    ],
    agents: [
      { name: "Page Builder", status: "idle" },
      { name: "UX Optimizer", status: "active" },
      { name: "Code Generator", status: "idle" },
    ],
    quickActions: [
      { label: "Create Landing Page", icon: FileText },
      { label: "Generate Code", icon: Code },
      { label: "Run Performance Test", icon: TrendingUp },
    ],
    specializedFeatures: [
      { title: "AI Landing Page Builder", description: "Generate complete, conversion-optimized landing pages from natural language descriptions", icon: Code, highlight: true },
      { title: "Dual-Model Workflow", description: "Claude for planning + Gemini for execution ensures high-quality code generation", icon: Sparkles },
      { title: "A/B Testing Engine", description: "Automated variant creation and statistical analysis for conversion optimization", icon: BarChart3 },
      { title: "Performance Optimization", description: "Real-time Core Web Vitals monitoring and automated improvement suggestions", icon: TrendingUp },
      { title: "Multilingual Site Support", description: "Auto-translate and localize websites for 12 Indian language markets", icon: Globe },
      { title: "CMS Integration", description: "Seamless integration with WordPress, Webflow, and headless CMS platforms", icon: Zap }
    ]
  },
  sales: {
    name: "Sales SDR",
    icon: Target,
    color: "orange",
    bgGradient: "from-orange-500 to-amber-600",
    description: "Generate leads, automate outreach, and close deals faster",
    agentCount: 52,
    kpis: [
      { title: "New Leads", value: "127", change: 24, trend: "up" },
      { title: "Qualified Leads", value: "43", change: 15, trend: "up" },
      { title: "Response Rate", value: "32%", change: 8, trend: "up" },
      { title: "Pipeline Value", value: "₹8.5L", change: 12, trend: "up" },
    ],
    agents: [
      { name: "Lead Scorer", status: "working" },
      { name: "Email Composer", status: "active" },
      { name: "Follow-up Agent", status: "active" },
    ],
    quickActions: [
      { label: "Score Leads", icon: Target },
      { label: "Draft Outreach", icon: FileText },
      { label: "Generate Proposal", icon: Sparkles },
    ],
    specializedFeatures: [
      { title: "Predictive Lead Scoring", description: "AI-powered scoring based on firmographics, technographics, and engagement signals", icon: Target, highlight: true },
      { title: "Multi-Touch Sequences", description: "Automated email, LinkedIn, and WhatsApp outreach with personalization at scale", icon: Zap },
      { title: "Intent Data Integration", description: "Track buying signals from website visits, content downloads, and third-party sources", icon: TrendingUp },
      { title: "AI Proposal Generator", description: "Create customized proposals and quotes based on client requirements", icon: FileText },
      { title: "CRM Auto-Sync", description: "Real-time synchronization with HubSpot, Salesforce, and Zoho CRM", icon: Users },
      { title: "Revenue Intelligence", description: "Pipeline forecasting and deal health analysis with AI recommendations", icon: BarChart3 }
    ]
  },
  whatsapp: {
    name: "WhatsApp",
    icon: MessageCircle,
    color: "emerald",
    bgGradient: "from-emerald-500 to-teal-600",
    description: "Automate messaging, manage templates, and engage customers on WhatsApp",
    agentCount: 28,
    kpis: [
      { title: "Active Chats", value: "89", change: 0, trend: "neutral" },
      { title: "Messages Sent", value: "2.4K", change: 35, trend: "up" },
      { title: "Response Time", value: "< 2min", change: -15, trend: "up" },
      { title: "Satisfaction", value: "4.7/5", change: 3, trend: "up" },
    ],
    agents: [
      { name: "Auto Responder", status: "active" },
      { name: "Template Manager", status: "idle" },
      { name: "Voice Agent", status: "working" },
    ],
    quickActions: [
      { label: "Create Template", icon: FileText },
      { label: "Build Flow", icon: Zap },
      { label: "Generate Response", icon: Sparkles },
    ],
    specializedFeatures: [
      { title: "Visual Flow Builder", description: "Drag-and-drop automation builder for complex conversational journeys", icon: Zap, highlight: true },
      { title: "Voice Message AI", description: "Sarvam-powered STT/TTS for voice messages in 22 Indian languages with 24 voices", icon: MessageCircle },
      { title: "Broadcast Campaigns", description: "Send personalized bulk messages with dynamic content and scheduling", icon: Megaphone },
      { title: "Catalog Integration", description: "Sync product catalogs and enable in-chat shopping experiences", icon: FileText },
      { title: "Payment Links", description: "Generate and send payment links within conversations for seamless checkout", icon: Target },
      { title: "Smart Routing", description: "AI-powered conversation routing to appropriate agents based on intent", icon: Users }
    ]
  },
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "sky",
    bgGradient: "from-sky-500 to-blue-600",
    description: "Build professional presence, generate B2B leads, and grow network",
    agentCount: 35,
    kpis: [
      { title: "Profile Views", value: "1.2K", change: 45, trend: "up" },
      { title: "Connection Rate", value: "28%", change: 6, trend: "up" },
      { title: "Post Impressions", value: "8.5K", change: 22, trend: "up" },
      { title: "InMail Response", value: "18%", change: 4, trend: "up" },
    ],
    agents: [
      { name: "Content Writer", status: "active" },
      { name: "Profile Optimizer", status: "idle" },
      { name: "Connection Manager", status: "working" },
    ],
    quickActions: [
      { label: "Create Post", icon: FileText },
      { label: "Optimize Profile", icon: Users },
      { label: "Draft InMail", icon: Sparkles },
    ],
    specializedFeatures: [
      { title: "Thought Leadership Engine", description: "AI-crafted long-form articles and posts that establish industry authority", icon: FileText, highlight: true },
      { title: "Smart Connection Builder", description: "Automated, personalized connection requests based on ICP and intent signals", icon: Users },
      { title: "SSI Score Optimizer", description: "Track and improve LinkedIn Social Selling Index with actionable insights", icon: TrendingUp },
      { title: "InMail Personalization", description: "Hyper-personalized outreach based on prospect's posts, job changes, and interests", icon: Sparkles },
      { title: "Employee Advocacy", description: "Coordinate company-wide LinkedIn activity for maximum brand reach", icon: Megaphone },
      { title: "B2B Lead Extraction", description: "Identify and export high-intent prospects based on engagement patterns", icon: Target }
    ]
  },
  performance: {
    name: "Performance",
    icon: TrendingUp,
    color: "purple",
    bgGradient: "from-purple-500 to-violet-600",
    description: "Manage paid campaigns, optimize ROAS, and track advertising performance",
    agentCount: 37,
    kpis: [
      { title: "Ad Spend", value: "₹1.8L", change: 12, trend: "neutral" },
      { title: "ROAS", value: "4.2x", change: 18, trend: "up" },
      { title: "CPA", value: "₹245", change: -12, trend: "up" },
      { title: "Conversions", value: "734", change: 28, trend: "up" },
    ],
    agents: [
      { name: "Ad Optimizer", status: "working" },
      { name: "Bid Manager", status: "active" },
      { name: "Creative Generator", status: "active" },
    ],
    quickActions: [
      { label: "Create Ad", icon: Megaphone },
      { label: "Optimize Campaign", icon: TrendingUp },
      { label: "Generate Copy", icon: Sparkles },
    ],
    specializedFeatures: [
      { title: "AI Bid Optimization", description: "Real-time bid adjustments across Google, Meta, and LinkedIn based on conversion probability", icon: TrendingUp, highlight: true },
      { title: "Creative Intelligence", description: "AI-generated ad creatives with automatic A/B testing and performance prediction", icon: Sparkles },
      { title: "Cross-Platform Attribution", description: "Unified reporting across all ad platforms with multi-touch attribution modeling", icon: BarChart3 },
      { title: "Audience Intelligence", description: "Lookalike audience generation and real-time audience insights", icon: Users },
      { title: "Budget Pacing", description: "Intelligent budget allocation and pacing to maximize ROI throughout campaigns", icon: Target },
      { title: "Competitor Ad Monitor", description: "Track competitor ad spend, creatives, and messaging strategies", icon: Globe }
    ]
  },
  pr: {
    name: "PR & Communications",
    icon: Newspaper,
    color: "rose",
    bgGradient: "from-rose-500 to-pink-600",
    description: "Press releases, media relations, crisis management, and brand communications",
    agentCount: 18,
    kpis: [
      { title: "Media Reach", value: "9.8M", change: 28, trend: "up" },
      { title: "Coverage", value: "45", change: 12, trend: "up" },
      { title: "Sentiment", value: "78%", change: 5, trend: "up" },
      { title: "Share of Voice", value: "24%", change: 3, trend: "up" },
    ],
    agents: [
      { name: "PR Director", status: "active" },
      { name: "Crisis Manager", status: "idle" },
      { name: "Media Relations", status: "working" },
    ],
    quickActions: [
      { label: "Draft Press Release", icon: FileText },
      { label: "Media Monitoring", icon: Globe },
      { label: "Crisis Alert", icon: Shield },
    ],
    specializedFeatures: [
      { title: "AI Press Release Generator", description: "Create AP-style press releases with AI-optimized headlines and distribution", icon: FileText, highlight: true },
      { title: "Crisis Command Center", description: "Real-time crisis detection, response management, and reputation protection", icon: Shield },
      { title: "Media Relations CRM", description: "Journalist database with relationship scoring and personalized outreach", icon: Users },
      { title: "Sentiment Analysis", description: "Real-time brand sentiment tracking across all media channels", icon: TrendingUp },
      { title: "Multilingual PR", description: "Translate and localize press content for 22 Indian languages and global markets", icon: Globe },
      { title: "Investor Relations", description: "Earnings communications, SEC compliance, and stakeholder messaging", icon: BarChart3 }
    ]
  }
};

interface MarketingAgent {
  id: string;
  name: string;
  tier: string;
  description: string;
  mission: string;
  skills: string[];
  tools: string[];
}

export default function VerticalPage({ vertical }: VerticalPageProps) {
  const [activeTab, setActiveTab] = useState<"workspace" | "tools" | "analytics" | "agents">("workspace");
  const [marketingAgents, setMarketingAgents] = useState<MarketingAgent[]>([]);
  const [agentStats, setAgentStats] = useState<any>(null);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const config = verticalConfig[vertical] || verticalConfig.social;
  const Icon = config.icon;

  useEffect(() => {
    if (activeTab === "agents") {
      fetchMarketingAgents();
    }
  }, [activeTab, vertical]);

  const fetchMarketingAgents = async () => {
    setLoadingAgents(true);
    try {
      const response = await fetch(`/api/marketing-agents/category/${vertical}`);
      if (response.ok) {
        const data = await response.json();
        setMarketingAgents(data.agents || []);
      }
      const statsResponse = await fetch('/api/marketing-agents/stats');
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setAgentStats(stats);
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    } finally {
      setLoadingAgents(false);
    }
  };

  const tierColors: Record<string, string> = {
    L0: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    L1: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    L2: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    L3: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    L4: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
  };

  const tierLabels: Record<string, string> = {
    L0: "Reactive",
    L1: "Proactive",
    L2: "Autonomous",
    L3: "Collaborative",
    L4: "Self-Evolving"
  };

  return (
    <AppShell>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.bgGradient} px-6 py-5`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{config.name}</h1>
              <p className="text-white/80 text-sm">{config.description}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex gap-6">
            {[
              { id: "workspace", label: "AI Workspace", icon: Sparkles },
              { id: "tools", label: "Tools", icon: Settings },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
              { id: "agents", label: "Agents", icon: Bot },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "workspace" ? (
            <ChatWorkspace vertical={vertical} brandId={1} />
          ) : activeTab === "tools" ? (
            <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
              {vertical === "seo" && <SEOToolkitPanel brandId={1} />}
              {vertical === "social" && <SocialMediaToolkitPanel brandId={1} />}
              {vertical === "whatsapp" && <WhatsAppToolkitPanel brandId={1} />}
              {vertical === "performance" && <PerformanceAdsToolkitPanel brandId={1} />}
              {vertical === "linkedin" && <LinkedInToolkitPanel brandId={1} />}
              {vertical === "sales" && <SalesSDRToolkitPanel brandId={1} />}
              {vertical === "web" && <WebDevToolkitPanel brandId={1} />}
              {vertical === "pr" && <PRToolkitPanel brandId={1} />}
            </div>
          ) : activeTab === "analytics" ? (
            <div className="p-6 bg-gray-50 dark:bg-gray-900 h-full overflow-auto">
              <div className="max-w-6xl mx-auto space-y-6">
                {/* Agent Count Banner */}
                <div className={`bg-gradient-to-r ${config.bgGradient} rounded-xl p-5 text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="text-4xl font-bold">{config.agentCount}</div>
                        <div>
                          <p className="font-medium">AI Agents</p>
                          <p className="text-white/80 text-sm">Specialized for {config.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">L1-L4 ROMA Levels</span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">24/7 Autonomous</span>
                    </div>
                  </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {config.kpis.map((kpi, i) => (
                    <KPICard
                      key={i}
                      title={kpi.title}
                      value={kpi.value}
                      change={kpi.change}
                      trend={kpi.trend}
                      color={["blue", "green", "purple", "orange"][i % 4] as any}
                    />
                  ))}
                </div>

                {/* Specialized Features - Prominent Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.bgGradient} flex items-center justify-center`}>
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Specialized {config.name} Features</h3>
                        <p className="text-sm text-gray-500">Enterprise-grade capabilities powered by AI</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {config.specializedFeatures.map((feature, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                            feature.highlight
                              ? `border-2 border-${config.color}-300 bg-gradient-to-br from-${config.color}-50 to-white dark:from-${config.color}-900/20 dark:to-gray-800`
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              feature.highlight 
                                ? `bg-gradient-to-br ${config.bgGradient}` 
                                : "bg-gray-100 dark:bg-gray-700"
                            }`}>
                              <feature.icon className={`w-5 h-5 ${feature.highlight ? "text-white" : "text-gray-600 dark:text-gray-300"}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{feature.title}</h4>
                                {feature.highlight && (
                                  <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-gradient-to-r ${config.bgGradient} text-white`}>
                                    Key
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{feature.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {config.quickActions.map((action, i) => (
                      <button
                        key={i}
                        className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.bgGradient} flex items-center justify-center`}>
                          <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{action.label}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-gray-50 dark:bg-gray-900 h-full overflow-auto">
              <div className="max-w-6xl mx-auto space-y-6">
                {agentStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">{agentStats.totalAgents}</div>
                      <div className="text-sm text-gray-500">Total Agents</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <div className="text-3xl font-bold text-emerald-600">{marketingAgents.length}</div>
                      <div className="text-sm text-gray-500">{config.name} Agents</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <div className="text-3xl font-bold text-blue-600">{agentStats.tierCounts?.L2 || 0}</div>
                      <div className="text-sm text-gray-500">Autonomous (L2)</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <div className="text-3xl font-bold text-purple-600">{agentStats.tierCounts?.L3 || 0}</div>
                      <div className="text-sm text-gray-500">Collaborative (L3)</div>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{config.name} Marketing Agents</h3>
                      <p className="text-sm text-gray-500 mt-1">{marketingAgents.length} AI agents specialized for {config.name.toLowerCase()} marketing</p>
                    </div>
                    <div className="flex gap-2">
                      {Object.entries(tierLabels).map(([tier, label]) => (
                        <span key={tier} className={`px-2 py-1 text-xs font-medium rounded-full ${tierColors[tier]}`}>
                          {tier}: {label}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {loadingAgents ? (
                    <div className="px-5 py-12 text-center">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-gray-500">Loading agents...</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[500px] overflow-auto">
                      {marketingAgents.map((agent) => (
                        <div key={agent.id} className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.bgGradient} flex items-center justify-center flex-shrink-0`}>
                                <Bot className="w-5 h-5 text-white" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900 dark:text-white">{agent.name}</p>
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${tierColors[agent.tier]}`}>
                                    {agent.tier}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-0.5">{agent.mission}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {agent.skills.slice(0, 3).map((skill, i) => (
                                    <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-xs text-gray-500">Ready</span>
                              </div>
                              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <Play className="w-4 h-4 text-gray-500" />
                              </button>
                              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <Settings className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
