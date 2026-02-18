import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AppShell from "../components/layout/app-shell";
import {
  BarChart3,
  Users,
  Megaphone,
  TrendingUp,
  Bot,
  ChevronRight,
  Sparkles,
  Target,
  DollarSign,
  Calendar,
  Layers,
  FileText,
  Eye,
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  Lightbulb,
  Play,
  PieChart,
  ArrowUpRight,
  Zap,
  Video,
  Mail,
  MessageSquare,
  Globe,
  Shield,
  Award,
  LayoutGrid,
  ListChecks,
  Rocket,
  MousePointer,
  Hash,
  Image,
  Send,
  BookOpen,
  CircleDot,
} from "lucide-react";

const lifecycleTabs = [
  { id: "strategy", label: "Strategy", icon: Target },
  { id: "planning", label: "Planning", icon: Calendar },
  { id: "execution", label: "Execution", icon: Play },
  { id: "content", label: "Content", icon: FileText },
  { id: "monitoring", label: "Monitoring", icon: Eye },
  { id: "results", label: "Results", icon: BarChart3 },
] as const;

type TabId = (typeof lifecycleTabs)[number]["id"];

function kv(val: any, fallback: number | string = 0): any {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object' && 'value' in val) return val.value;
  return val;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-gray-100 text-gray-600",
  paused: "bg-yellow-100 text-yellow-700",
  completed: "bg-blue-100 text-blue-700",
  in_progress: "bg-indigo-100 text-indigo-700",
  pending: "bg-orange-100 text-orange-700",
  review: "bg-purple-100 text-purple-700",
};


function formatCurrency(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}

function DataSourceIndicator({ isLive }: { isLive: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 ml-2">
      <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-500" : "bg-yellow-400"}`} />
      <span className={`text-xs font-medium ${isLive ? "text-emerald-600 dark:text-emerald-400" : "text-yellow-600 dark:text-yellow-400"}`}>
        {isLive ? "Live" : "Estimated"}
      </span>
    </span>
  );
}

export default function NewDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("strategy");
  const [, setLocation] = useLocation();

  const { data: strategiesData } = useQuery({
    queryKey: ["/api/strategy-pipeline"],
    queryFn: async () => {
      const res = await fetch("/api/strategy-pipeline");
      if (!res.ok) return { strategies: [] };
      return res.json();
    },
  });

  const { data: brandsData } = useQuery({
    queryKey: ["/api/brands"],
    queryFn: async () => {
      const res = await fetch("/api/brands");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: documentsData } = useQuery({
    queryKey: ["/api/export/list"],
    queryFn: async () => {
      const res = await fetch("/api/export/list");
      if (!res.ok) return { documents: [] };
      return res.json();
    },
  });

  const currentBrand = brandsData && Array.isArray(brandsData) && brandsData.length > 0
    ? { id: brandsData[0].id, name: brandsData[0].name }
    : { id: 0, name: "WizMark 360" };

  const { data: kpiData } = useQuery({ queryKey: ['/api/monitoring-dashboard/kpis'], queryFn: async () => { const res = await fetch('/api/monitoring-dashboard/kpis'); return res.json(); } });
  const { data: verticalData } = useQuery({ queryKey: ['/api/monitoring-dashboard/vertical-performance'], queryFn: async () => { const res = await fetch('/api/monitoring-dashboard/vertical-performance'); return res.json(); } });
  const { data: spendData } = useQuery({ queryKey: ['/api/monitoring-dashboard/spend-breakdown'], queryFn: async () => { const res = await fetch('/api/monitoring-dashboard/spend-breakdown'); return res.json(); } });
  const { data: activityData } = useQuery({ queryKey: ['/api/monitoring-dashboard/recent-activity'], queryFn: async () => { const res = await fetch('/api/monitoring-dashboard/recent-activity'); return res.json(); } });
  const { data: alertData } = useQuery({ queryKey: ['/api/monitoring-dashboard/alerts'], queryFn: async () => { const res = await fetch('/api/monitoring-dashboard/alerts'); return res.json(); } });

  const strategies = strategiesData?.strategies || [];
  const documents = documentsData?.documents || [];
  const hasStrategies = strategies.length > 0;
  const hasDocuments = documents.length > 0;
  const hasActivities = activityData?.activities && activityData.activities.length > 0;
  const hasLiveKpiData = !!kpiData?.kpis;

  const brandName =
    brandsData && Array.isArray(brandsData) && brandsData.length > 0
      ? brandsData[0].name
      : "WizMark 360";

  const totalStrategies = strategies.length;
  const activeCampaigns = strategies.reduce(
    (sum: number, s: any) => sum + (s.campaigns || 0),
    0
  );
  const activeVerticals = new Set(
    strategies.flatMap((s: any) => s.verticals || [])
  ).size;
  const totalBudget = strategies.reduce(
    (sum: number, s: any) => sum + (s.budget || 0),
    0
  );

  return (
    <AppShell currentBrand={currentBrand}>
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTMwVjBoLTEydjRoMTJ6TTI0IDI0aDEydi0yaC0xMnYyem0wIDEwaDEydi0yaC0xMnYyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm font-medium text-blue-200">Marketing Command Center</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Welcome back, {brandName}
                </h1>
                <p className="text-blue-100 mt-1.5 text-sm sm:text-base">
                  Full lifecycle marketing dashboard — strategy to results
                </p>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">{kv(kpiData?.kpis?.totalBrands, 0)} Brands</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                    <Target className="w-4 h-4" />
                    <span className="text-sm font-medium">{totalStrategies} Strategies</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                    <Megaphone className="w-4 h-4" />
                    <span className="text-sm font-medium">{kv(kpiData?.kpis?.activeCampaigns, activeCampaigns)} Campaigns</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                    <Layers className="w-4 h-4" />
                    <span className="text-sm font-medium">{activeVerticals} Verticals</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setLocation("/marketing-chat")}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all text-sm font-medium border border-white/20 hover:border-white/40 shadow-lg"
              >
                <Rocket className="w-4 h-4" />
                Create Strategy
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex overflow-x-auto px-2 pt-2 gap-1">
              {lifecycleTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === "strategy" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Brands", value: kv(kpiData?.kpis?.totalBrands, 0).toString(), icon: Users, color: "from-indigo-500 to-blue-500" },
                  { label: "Active Campaigns", value: kv(kpiData?.kpis?.activeCampaigns, activeCampaigns).toString(), icon: Megaphone, color: "from-pink-500 to-rose-500" },
                  { label: "Verticals Active", value: activeVerticals.toString(), icon: Layers, color: "from-emerald-500 to-green-500" },
                  { label: "Monthly Spend", value: formatCurrency(kv(kpiData?.kpis?.monthlySpend, totalBudget)), icon: DollarSign, color: "from-orange-500 to-amber-500" },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{kpi.label}</span>
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                        <kpi.icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Strategies</h2>
                <button
                  onClick={() => setLocation("/marketing-chat")}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Create New Strategy
                </button>
              </div>

              {hasStrategies ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {strategies.map((strategy: any) => (
                    <div
                      key={strategy.id || strategy.name}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all hover:border-indigo-200 dark:hover:border-indigo-800"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{strategy.name}</h3>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(strategy.verticals || []).map((v: string) => (
                              <span
                                key={v}
                                className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full"
                              >
                                {v}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[strategy.status] || statusColors.active}`}>
                          {(strategy.status || "active").replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <span>{formatCurrency(strategy.budget || 0)} budget</span>
                        <span>{strategy.campaigns || 0} campaigns</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${strategy.progress || 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">{strategy.progress || 0}% complete</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 shadow-sm text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No strategies yet</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Get started by creating your first marketing strategy. Our AI will help you plan across multiple verticals.
                  </p>
                  <button
                    onClick={() => setLocation("/marketing-chat")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md"
                  >
                    <Rocket className="w-4 h-4" />
                    Create Your First Strategy
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "planning" && (
            <div className="space-y-6">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Execution Plans by Vertical</h2>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 shadow-sm text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No execution plans yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Create a strategy first, then generate execution plans
                </p>
                <button
                  onClick={() => setLocation("/marketing-chat")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  Create a Strategy
                </button>
              </div>
            </div>
          )}

          {activeTab === "execution" && (
            <div className="space-y-6">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Tasks</h2>
                {hasActivities && <DataSourceIndicator isLive={true} />}
              </div>

              {hasActivities ? (
                <>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                    <div className="space-y-3">
                      {activityData.activities.slice(0, 8).map((a: any, idx: number) => {
                        const ts = new Date(a.timestamp);
                        const diffMs = Date.now() - ts.getTime();
                        const diffMin = Math.floor(diffMs / 60000);
                        const timeLabel = diffMin < 60 ? `${diffMin} min ago` : diffMin < 1440 ? `${Math.floor(diffMin / 60)} hours ago` : `${Math.floor(diffMin / 1440)} days ago`;
                        const type = a.status === "completed" ? "success" : "info";
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${type === "success" ? "bg-emerald-500" : "bg-blue-500"}`} />
                            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{a.title}</span>
                            <span className="text-xs text-gray-400 flex-shrink-0">{a.vertical}</span>
                            <span className="text-xs text-gray-400 flex-shrink-0">{timeLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 shadow-sm text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No active tasks yet</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    No active tasks yet — create a strategy and start executing
                  </p>
                  <button
                    onClick={() => setLocation("/marketing-chat")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl text-sm font-medium hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md"
                  >
                    <Rocket className="w-4 h-4" />
                    Get Started
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Content</h2>
                {hasDocuments && (
                  <button
                    onClick={() => setLocation("/content")}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    View Full Library <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {hasDocuments ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Engagement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {documents.map((doc: any, idx: number) => {
                          const item = {
                            id: idx,
                            title: doc.title || doc.name || "Untitled",
                            type: doc.type || "document",
                            status: doc.status || "published",
                            date: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-",
                            engagement: "-",
                          };
                          return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                              <td className="px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white">{item.title}</td>
                              <td className="px-5 py-3.5">
                                <span className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full capitalize">
                                  {item.type}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[item.status] || statusColors.active}`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-sm text-gray-500">{item.date}</td>
                              <td className="px-5 py-3.5 text-sm text-gray-500">{item.engagement}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 shadow-sm text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No content created yet</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Start creating marketing content with AI assistance across all your channels.
                  </p>
                  <button
                    onClick={() => setLocation("/marketing-chat")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    Create Content
                  </button>
                </div>
              )}

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Create Content", icon: Sparkles, color: "from-indigo-500 to-purple-500", path: "/marketing-chat" },
                  { label: "Open Content Library", icon: BookOpen, color: "from-emerald-500 to-green-500", path: "/content" },
                  { label: "Open Super Chat", icon: MessageSquare, color: "from-pink-500 to-rose-500", path: "/marketing-chat" },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setLocation(action.path)}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-3 text-left group"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors">
                      {action.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "monitoring" && (
            <div className="space-y-6">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Real-Time KPIs</h2>
                <DataSourceIndicator isLive={hasLiveKpiData} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {(() => {
                  const reach = kv(kpiData?.kpis?.totalReach, 0);
                  return [
                  { label: "Total Reach", value: reach >= 1000000 ? `${(reach / 1000000).toFixed(1)}M` : reach >= 1000 ? `${(reach / 1000).toFixed(0)}K` : String(reach || "—"), change: 0, icon: Eye, color: "from-blue-500 to-cyan-500" },
                  { label: "Engagement Rate", value: kv(kpiData?.kpis?.engagementRate, 0) ? `${kv(kpiData?.kpis?.engagementRate, 0)}%` : "—", change: 0, icon: MousePointer, color: "from-purple-500 to-pink-500" },
                  { label: "Conversions", value: kv(kpiData?.kpis?.conversions, 0) ? Number(kv(kpiData?.kpis?.conversions, 0)).toLocaleString() : "—", change: 0, icon: Target, color: "from-green-500 to-emerald-500" },
                  { label: "ROAS", value: kv(kpiData?.kpis?.roas, 0) ? `${kv(kpiData?.kpis?.roas, 0)}x` : "—", change: 0, icon: TrendingUp, color: "from-orange-500 to-amber-500" },
                  { label: "Cost per Lead", value: kv(kpiData?.kpis?.costPerLead, 0) ? `₹${kv(kpiData?.kpis?.costPerLead, 0)}` : "—", change: 0, icon: DollarSign, color: "from-rose-500 to-red-500" },
                  ];
                })().map((kpi) => (
                  <div
                    key={kpi.label}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                        <kpi.icon className="w-4 h-4 text-white" />
                      </div>
                      {kpi.change !== 0 && (
                      <div className={`flex items-center gap-0.5 text-xs font-medium ${kpi.change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {kpi.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                        {Math.abs(kpi.change)}%
                      </div>
                      )}
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{kpi.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Per-Vertical Performance</h2>
                <DataSourceIndicator isLive={!!verticalData?.verticals} />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vertical</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reach</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Engagement</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Conversions</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Spend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {(verticalData?.verticals || []).map((vp: any) => (
                        <tr key={vp.name || vp.vertical} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white">{vp.name || vp.vertical}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{typeof vp.reach === 'number' ? (vp.reach >= 1000000 ? `${(vp.reach / 1000000).toFixed(1)}M` : vp.reach >= 1000 ? `${(vp.reach / 1000).toFixed(0)}K` : vp.reach) : vp.reach}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{typeof vp.engagement === 'number' ? `${vp.engagement}%` : vp.engagement}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{vp.conversions}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{formatCurrency(vp.spend)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alerts & Recommendations</h2>
                <DataSourceIndicator isLive={!!alertData?.alerts} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Active Alerts</h3>
                  </div>
                  <div className="space-y-3">
                    {(alertData?.alerts?.length > 0 ? alertData.alerts : []).length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No active alerts. Connect ad platforms and social accounts to enable real-time monitoring.</p>
                      </div>
                    ) : null}
                    {(alertData?.alerts || []).map((alert: any, idx: number) => {
                      const alertType = alert.severity || alert.type;
                      return (
                      <div
                        key={alert.id || idx}
                        className={`p-3 rounded-lg border ${
                          alertType === "critical"
                            ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                            : alertType === "warning"
                            ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                            : alertType === "success"
                            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                            : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{alert.title || (alert.metric ? `Metric: ${alert.metric}` : "")}</p>
                      </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">AI Recommendations</h3>
                  </div>
                  <div className="space-y-3">
                    {(alertData?.recommendations?.length > 0 ? alertData.recommendations : []).length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">AI recommendations will appear once you have active campaigns running across verticals.</p>
                      </div>
                    ) : null}
                    {(alertData?.recommendations || []).map((rec: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 dark:border-indigo-800"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{rec.title}</h4>
                          <span className={`px-1.5 py-0.5 text-xs rounded-full ${(rec.impact || rec.priority) === "high" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                            {rec.impact || rec.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "results" && (
            <div className="space-y-6">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Campaign Performance Summary</h2>
                <DataSourceIndicator isLive={hasLiveKpiData} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Spend", value: kv(kpiData?.kpis?.monthlySpend, 0) ? formatCurrency(kv(kpiData?.kpis?.monthlySpend, 0)) : "—", icon: DollarSign, color: "from-rose-500 to-red-500" },
                  { label: "Total Revenue", value: kv(kpiData?.kpis?.monthlyRevenue, 0) ? formatCurrency(kv(kpiData?.kpis?.monthlyRevenue, 0)) : "—", icon: TrendingUp, color: "from-emerald-500 to-green-500" },
                  { label: "ROAS", value: kv(kpiData?.kpis?.roas, 0) ? `${kv(kpiData?.kpis?.roas, 0)}x` : "—", icon: Target, color: "from-indigo-500 to-blue-500" },
                  { label: "ROI", value: kv(kpiData?.kpis?.roi, 0) ? `${kv(kpiData?.kpis?.roi, 0)}%` : "—", icon: Award, color: "from-orange-500 to-amber-500" },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.label}</span>
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                        <metric.icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Conversions</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{kv(kpiData?.kpis?.conversions, 0) ? Number(kv(kpiData?.kpis?.conversions, 0)).toLocaleString() : "—"}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cost per Conversion</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{kv(kpiData?.kpis?.costPerLead, 0) ? `₹${kv(kpiData?.kpis?.costPerLead, 0)}` : "—"}</p>
                </div>
              </div>

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Content</h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="text-center py-10 text-gray-400">
                  <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">No performance data yet</p>
                  <p className="text-xs mt-1">Connect ad platforms and track conversions to see top performing content here.</p>
                </div>
              </div>

              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Spend vs Revenue</h2>
                <DataSourceIndicator isLive={!!spendData?.months} />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <div className="flex items-end gap-3 h-48">
                  {(spendData?.months || []).map((month: any) => {
                    const chartData = spendData?.months || [];
                    const maxRevenue = Math.max(...chartData.map((m: any) => m.revenue));
                    const spendHeight = (month.spend / maxRevenue) * 100;
                    const revenueHeight = (month.revenue / maxRevenue) * 100;
                    return (
                      <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                        <div className="flex items-end gap-1 w-full h-40">
                          <div
                            className="flex-1 bg-gradient-to-t from-rose-400 to-rose-300 rounded-t-sm transition-all"
                            style={{ height: `${spendHeight}%` }}
                            title={`Spend: ₹${(month.spend / 100000).toFixed(1)}L`}
                          />
                          <div
                            className="flex-1 bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-sm transition-all"
                            style={{ height: `${revenueHeight}%` }}
                            title={`Revenue: ₹${(month.revenue / 100000).toFixed(1)}L`}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{month.month}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-6 mt-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-rose-400" />
                    <span className="text-xs text-gray-500">Spend</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                    <span className="text-xs text-gray-500">Revenue</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
