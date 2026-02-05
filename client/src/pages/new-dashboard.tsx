import { useState } from "react";
import AppShell from "../components/layout/app-shell";
import ChatWorkspace from "../components/chat/chat-workspace";
import KPICard from "../components/dashboard/kpi-card";
import ActivityFeed from "../components/dashboard/activity-feed";
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
  Calendar
} from "lucide-react";

export default function NewDashboard() {
  const [currentBrand] = useState({ id: 1, name: "Acme Corp" });
  const [activeTab, setActiveTab] = useState<"chat" | "overview">("overview");

  return (
    <AppShell currentBrand={currentBrand}>
      <div className="h-full flex flex-col">
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "chat"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "overview" ? (
          <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Good morning!</h1>
                    <p className="text-blue-100 mt-1">Here's what's happening with {currentBrand.name} today.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                  >
                    <Bot className="w-5 h-5" />
                    Ask AI Assistant
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  title="Active Campaigns"
                  value="12"
                  change={8}
                  changeLabel="vs last month"
                  trend="up"
                  color="blue"
                  icon={<Megaphone className="w-5 h-5 text-white" />}
                />
                <KPICard
                  title="Total Leads"
                  value="847"
                  change={23}
                  changeLabel="this week"
                  trend="up"
                  color="green"
                  icon={<Target className="w-5 h-5 text-white" />}
                />
                <KPICard
                  title="AI Agents Active"
                  value="285"
                  change={18}
                  changeLabel="PR vertical"
                  trend="up"
                  color="purple"
                  icon={<Bot className="w-5 h-5 text-white" />}
                />
                <KPICard
                  title="Monthly Revenue"
                  value="₹4.2L"
                  change={15}
                  changeLabel="vs last month"
                  trend="up"
                  color="orange"
                  icon={<DollarSign className="w-5 h-5 text-white" />}
                />
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Feed */}
                <div className="lg:col-span-2">
                  <ActivityFeed />
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      {[
                        { label: "Create Campaign", icon: Megaphone, color: "text-pink-500" },
                        { label: "Generate Content", icon: Sparkles, color: "text-blue-500" },
                        { label: "View Analytics", icon: BarChart3, color: "text-purple-500" },
                        { label: "Schedule Post", icon: Calendar, color: "text-green-500" },
                      ].map((action) => (
                        <button
                          key={action.label}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                        >
                          <action.icon className={`w-5 h-5 ${action.color}`} />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Agent Status */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Agent Status</h3>
                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">All Systems Go</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { vertical: "Social", active: 8, total: 45 },
                        { vertical: "SEO", active: 12, total: 38 },
                        { vertical: "Sales", active: 15, total: 52 },
                        { vertical: "WhatsApp", active: 8, total: 28 },
                      ].map((v) => (
                        <div key={v.vertical} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{v.vertical}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${(v.active / v.total) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{v.active}/{v.total}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ChatWorkspace />
        )}
      </div>
    </AppShell>
  );
}
