import { useState, useEffect } from "react";
import AppShell from "../components/layout/app-shell";
import ChatWorkspace from "../components/chat/chat-workspace";
import KPICard from "../components/dashboard/kpi-card";
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
  Pause
} from "lucide-react";

interface VerticalPageProps {
  vertical: string;
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
}> = {
  social: {
    name: "Social Media",
    icon: Megaphone,
    color: "pink",
    bgGradient: "from-pink-500 to-rose-600",
    description: "Manage content, schedule posts, and engage audiences across all social platforms",
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
    ]
  },
  seo: {
    name: "SEO & GEO",
    icon: Globe,
    color: "green",
    bgGradient: "from-emerald-500 to-green-600",
    description: "Optimize search rankings, track keywords, and improve organic visibility",
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
    ]
  },
  web: {
    name: "Web Development",
    icon: Code,
    color: "blue",
    bgGradient: "from-blue-500 to-indigo-600",
    description: "Build landing pages, manage websites, and track web performance",
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
    ]
  },
  sales: {
    name: "Sales SDR",
    icon: Target,
    color: "orange",
    bgGradient: "from-orange-500 to-amber-600",
    description: "Generate leads, automate outreach, and close deals faster",
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
    ]
  },
  whatsapp: {
    name: "WhatsApp",
    icon: MessageCircle,
    color: "emerald",
    bgGradient: "from-emerald-500 to-teal-600",
    description: "Automate messaging, manage templates, and engage customers on WhatsApp",
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
    ]
  },
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "sky",
    bgGradient: "from-sky-500 to-blue-600",
    description: "Build professional presence, generate B2B leads, and grow network",
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
    ]
  },
  performance: {
    name: "Performance",
    icon: TrendingUp,
    color: "purple",
    bgGradient: "from-purple-500 to-violet-600",
    description: "Manage paid campaigns, optimize ROAS, and track advertising performance",
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
  const [activeTab, setActiveTab] = useState<"workspace" | "analytics" | "agents">("workspace");
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
          ) : activeTab === "analytics" ? (
            <div className="p-6 bg-gray-50 dark:bg-gray-900 h-full overflow-auto">
              <div className="max-w-6xl mx-auto space-y-6">
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
