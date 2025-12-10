import { useState } from "react";
import AppShell from "../components/layout/app-shell";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  DollarSign,
  Eye,
  MousePointer,
  MessageCircle,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Megaphone,
  Globe,
  Linkedin,
  Bot,
  Zap
} from "lucide-react";

interface MetricCard {
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "neutral";
  subtitle?: string;
}

interface VerticalMetric {
  name: string;
  icon: any;
  color: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: string;
  roi: number;
}

const overviewMetrics: MetricCard[] = [
  { title: "Total Impressions", value: "2.4M", change: 15.3, trend: "up", subtitle: "across all platforms" },
  { title: "Total Clicks", value: "145K", change: 8.7, trend: "up", subtitle: "CTR: 6.04%" },
  { title: "Conversions", value: "8,234", change: 23.5, trend: "up", subtitle: "CVR: 5.68%" },
  { title: "Total Spend", value: "₹12.5L", change: -5.2, trend: "down", subtitle: "Budget: ₹15L" },
  { title: "Revenue Generated", value: "₹48.2L", change: 32.1, trend: "up", subtitle: "ROAS: 3.86x" },
  { title: "Cost Per Lead", value: "₹152", change: -12.4, trend: "down", subtitle: "Target: ₹200" }
];

const verticalMetrics: VerticalMetric[] = [
  { name: "Social Media", icon: Megaphone, color: "text-pink-500", impressions: 850000, clicks: 42500, conversions: 2125, spend: "₹3.2L", roi: 3.8 },
  { name: "SEO & GEO", icon: Globe, color: "text-green-500", impressions: 620000, clicks: 31000, conversions: 1860, spend: "₹1.8L", roi: 5.2 },
  { name: "Performance Ads", icon: Target, color: "text-purple-500", impressions: 480000, clicks: 38400, conversions: 2304, spend: "₹4.5L", roi: 3.2 },
  { name: "LinkedIn B2B", icon: Linkedin, color: "text-sky-500", impressions: 180000, clicks: 14400, conversions: 864, spend: "₹2.1L", roi: 4.5 },
  { name: "WhatsApp", icon: MessageCircle, color: "text-emerald-500", impressions: 95000, clicks: 9500, conversions: 665, spend: "₹0.6L", roi: 6.8 },
  { name: "Sales SDR", icon: Users, color: "text-orange-500", impressions: 175000, clicks: 8750, conversions: 416, spend: "₹0.3L", roi: 8.2 }
];

const agentPerformance = [
  { name: "Content Creator AI", tasks: 1245, successRate: 98.2, avgTime: "2.3s", tokens: "2.4M" },
  { name: "Trend Jacker AI", tasks: 892, successRate: 94.5, avgTime: "1.8s", tokens: "1.2M" },
  { name: "Lead Qualifier AI", tasks: 3421, successRate: 96.8, avgTime: "0.8s", tokens: "890K" },
  { name: "SEO Optimizer AI", tasks: 567, successRate: 99.1, avgTime: "4.2s", tokens: "3.1M" },
  { name: "Performance Optimizer", tasks: 2134, successRate: 97.3, avgTime: "1.5s", tokens: "1.8M" }
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d");
  const [activeTab, setActiveTab] = useState<"overview" | "verticals" | "agents" | "costs">("overview");

  return (
    <AppShell currentBrand={{ id: 1, name: "Acme Corp" }}>
      <div className="h-full overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Track performance across all marketing verticals</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="custom">Custom Range</option>
              </select>
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 w-fit">
            {[
              { id: "overview", label: "Overview" },
              { id: "verticals", label: "By Vertical" },
              { id: "agents", label: "Agent Performance" },
              { id: "costs", label: "Cost Analysis" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overviewMetrics.map((metric) => (
                  <div key={metric.title} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm text-gray-500">{metric.title}</p>
                      <div className={`flex items-center gap-1 text-sm ${
                        metric.trend === "up" ? "text-green-600" : metric.trend === "down" ? "text-red-600" : "text-gray-500"
                      }`}>
                        {metric.trend === "up" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(metric.change)}%
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                    {metric.subtitle && (
                      <p className="text-xs text-gray-400 mt-1">{metric.subtitle}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Performance Trend</h3>
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Interactive chart visualization</p>
                      <p className="text-sm text-gray-400">Showing conversions over time</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Channel Distribution</h3>
                  <div className="space-y-4">
                    {verticalMetrics.slice(0, 4).map((v) => (
                      <div key={v.name} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700`}>
                          <v.icon className={`w-4 h-4 ${v.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{v.name}</span>
                            <span className="text-sm text-gray-500">{v.conversions.toLocaleString()} conversions</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(v.conversions / 2500) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "verticals" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Performance by Vertical</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vertical</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CVR</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Spend</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {verticalMetrics.map((v) => (
                      <tr key={v.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700`}>
                              <v.icon className={`w-4 h-4 ${v.color}`} />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{v.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{v.impressions.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{v.clicks.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{((v.clicks / v.impressions) * 100).toFixed(1)}%</td>
                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{v.conversions.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{((v.conversions / v.clicks) * 100).toFixed(1)}%</td>
                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{v.spend}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            v.roi >= 5 ? "bg-green-100 text-green-700" : v.roi >= 3 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                          }`}>
                            {v.roi}x
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "agents" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">267</p>
                      <p className="text-sm text-gray-500">Total Agents</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">8,259</p>
                      <p className="text-sm text-gray-500">Tasks Today</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">97.2%</p>
                      <p className="text-sm text-gray-500">Success Rate</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">9.4M</p>
                      <p className="text-sm text-gray-500">Tokens Used</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Top Performing Agents</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks Completed</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Response Time</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens Used</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {agentPerformance.map((agent) => (
                        <tr key={agent.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">{agent.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{agent.tasks.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              agent.successRate >= 98 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {agent.successRate}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{agent.avgTime}</td>
                          <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{agent.tokens}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "costs" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 mb-1">Total AI Costs</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">₹24,850</p>
                  <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                    <ArrowDownRight className="w-4 h-4" />
                    12% vs last month
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 mb-1">Cost per Task</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">₹3.01</p>
                  <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                    <ArrowDownRight className="w-4 h-4" />
                    8% vs last month
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 mb-1">Cost Savings (Smart Routing)</p>
                  <p className="text-3xl font-bold text-green-600">₹8,420</p>
                  <p className="text-sm text-gray-500 mt-1">34% saved with tier optimization</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Cost by Provider</h3>
                <div className="space-y-4">
                  {[
                    { name: "OpenAI (GPT-4o)", cost: "₹8,250", percentage: 33, color: "bg-green-500" },
                    { name: "Anthropic (Claude)", cost: "₹6,200", percentage: 25, color: "bg-orange-500" },
                    { name: "Groq (Llama 3.3)", cost: "₹4,150", percentage: 17, color: "bg-blue-500" },
                    { name: "OpenRouter", cost: "₹3,100", percentage: 12, color: "bg-purple-500" },
                    { name: "Gemini", cost: "₹2,350", percentage: 9, color: "bg-red-500" },
                    { name: "Others", cost: "₹800", percentage: 4, color: "bg-gray-500" }
                  ].map((provider) => (
                    <div key={provider.name} className="flex items-center gap-4">
                      <div className="w-40 text-sm font-medium text-gray-900 dark:text-white">{provider.name}</div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${provider.color} rounded-full`}
                            style={{ width: `${provider.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-24 text-right text-sm text-gray-900 dark:text-white">{provider.cost}</div>
                      <div className="w-12 text-right text-sm text-gray-500">{provider.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
