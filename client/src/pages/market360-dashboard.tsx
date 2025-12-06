import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const verticals = [
  { id: "social", name: "Social Media", icon: "📱", color: "bg-pink-500" },
  { id: "seo", name: "SEO & GEO", icon: "🔍", color: "bg-green-500" },
  { id: "web", name: "Web Dev", icon: "🌐", color: "bg-blue-500" },
  { id: "sales", name: "Sales SDR", icon: "💼", color: "bg-purple-500" },
  { id: "whatsapp", name: "WhatsApp", icon: "💬", color: "bg-emerald-500" },
  { id: "linkedin", name: "LinkedIn", icon: "🔗", color: "bg-sky-600" },
  { id: "performance", name: "Performance", icon: "📊", color: "bg-orange-500" },
];

function VerticalCard({ vertical, onClick, isActive }: { vertical: typeof verticals[0]; onClick: () => void; isActive: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all ${
        isActive
          ? `${vertical.color} text-white border-transparent shadow-lg scale-105`
          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow"
      }`}
    >
      <div className="text-3xl mb-2">{vertical.icon}</div>
      <div className="font-semibold text-sm">{vertical.name}</div>
    </button>
  );
}

function AgentActivityFeed() {
  const { data: stats } = useQuery({
    queryKey: ["market360-stats"],
    queryFn: () => fetch("/api/market360/stats").then(r => r.json()),
  });

  return (
    <div className="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-lg h-64 overflow-y-auto">
      <div className="mb-2 text-gray-400 font-semibold flex items-center justify-between">
        <span>Agent Status</span>
        <span className="text-cyan-400">{stats?.activeAgents || 0} agents</span>
      </div>
      <div className="space-y-2 text-gray-300">
        <div className="p-2 bg-gray-800 rounded">
          <span className="text-yellow-400">Campaigns:</span> {stats?.totalCampaigns || 0} active
        </div>
        <div className="p-2 bg-gray-800 rounded">
          <span className="text-pink-400">Social Posts:</span> {stats?.socialPosts || 0} scheduled
        </div>
        <div className="p-2 bg-gray-800 rounded">
          <span className="text-blue-400">Leads:</span> {stats?.totalLeads || 0} captured
        </div>
        <div className="p-2 bg-gray-800 rounded">
          <span className="text-green-400">Ads:</span> {stats?.activeAds || 0} running
        </div>
        <div className="mt-4 text-gray-500 text-center text-[10px]">
          Configure AI providers to enable live agent orchestration
        </div>
      </div>
    </div>
  );
}

function CampaignManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", vertical: "social" });

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => fetch("/api/market360/campaigns").then(r => r.json()),
  });

  const createCampaign = useMutation({
    mutationFn: (data: { name: string; vertical: string }) =>
      fetch("/api/market360/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["market360-stats"] });
      setShowForm(false);
      setFormData({ name: "", vertical: "social" });
    },
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">Campaign Manager</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          {showForm ? "Cancel" : "+ New Campaign"}
        </button>
      </div>
      
      {showForm && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <input
            type="text"
            placeholder="Campaign name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded mb-2 text-sm"
          />
          <select
            value={formData.vertical}
            onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
            className="w-full px-3 py-2 border rounded mb-2 text-sm"
          >
            {verticals.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
          <button
            onClick={() => formData.name && createCampaign.mutate(formData)}
            disabled={!formData.name || createCampaign.isPending}
            className="w-full px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
          >
            {createCampaign.isPending ? "Creating..." : "Create Campaign"}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-500 text-sm">Loading campaigns...</div>
      ) : campaigns?.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {campaigns.map((c: any) => (
            <div key={c.id} className="p-2 bg-gray-50 rounded flex justify-between items-center">
              <span className="font-medium text-sm">{c.name}</span>
              <span className="text-xs text-gray-500">{c.vertical}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-sm text-center py-4">
          No campaigns yet. Create your first campaign to get started.
        </div>
      )}
    </div>
  );
}

function QuickActions() {
  const queryClient = useQueryClient();
  
  const createTestData = useMutation({
    mutationFn: async () => {
      await fetch("/api/market360/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Q4 Social Campaign", vertical: "social" }),
      });
      await fetch("/api/market360/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "SEO Optimization Drive", vertical: "seo" }),
      });
      await fetch("/api/market360/sales/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John Smith", email: "john@example.com", source: "linkedin", company: "Acme Corp" }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["market360-stats"] });
    },
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
      <div className="space-y-2">
        <button
          onClick={() => createTestData.mutate()}
          disabled={createTestData.isPending}
          className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded text-sm text-blue-700"
        >
          {createTestData.isPending ? "Creating..." : "Seed Demo Data"}
        </button>
        <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm">
          Export Analytics
        </button>
        <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm">
          View All Leads
        </button>
      </div>
    </div>
  );
}

function MetricCard({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className={`text-xs mt-1 ${positive ? "text-green-600" : "text-gray-500"}`}>
        {change}
      </div>
    </div>
  );
}

function VerticalPanel({ vertical }: { vertical: string }) {
  const { data: verticalInfo } = useQuery({
    queryKey: ["verticals"],
    queryFn: () => fetch("/api/market360/verticals").then(r => r.json())
  });

  const info = verticalInfo?.[vertical];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-bold text-lg mb-3">{info?.name || vertical} Dashboard</h3>
      <p className="text-gray-600 text-sm mb-4">{info?.description || "Loading..."}</p>
      
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Active Agents</h4>
        <div className="flex flex-wrap gap-2">
          {info?.agents?.map((agent: string) => (
            <span key={agent} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              {agent}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-2">KPIs</h4>
        <div className="flex flex-wrap gap-2">
          {info?.kpis?.map((kpi: string) => (
            <span key={kpi} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {kpi}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Market360Dashboard() {
  const [activeVertical, setActiveVertical] = useState<string | null>(null);

  const { data: apiHealth } = useQuery({
    queryKey: ["market360-health"],
    queryFn: () => fetch("/api/market360/health").then(r => r.json()),
    refetchInterval: 30000
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["market360-stats"],
    queryFn: () => fetch("/api/market360/stats").then(r => r.json()),
    refetchInterval: 10000
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Market360</h1>
            <p className="text-sm text-gray-500">Self-Driving Agency Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${apiHealth?.status === "ok" ? "bg-green-500" : "bg-red-500"}`}></span>
              {apiHealth?.status === "ok" ? "Systems Online" : "Connecting..."}
            </span>
            <span className="text-xs text-gray-400">267+ Agents Ready</span>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <MetricCard 
            label="Total Campaigns" 
            value={statsLoading ? "..." : String(stats?.totalCampaigns || 0)} 
            change={`${stats?.socialPosts || 0} posts scheduled`}
            positive={true} 
          />
          <MetricCard 
            label="Active Agents" 
            value={String(stats?.activeAgents || 43)} 
            change="Ready to deploy" 
            positive={true} 
          />
          <MetricCard 
            label="Avg ROAS" 
            value={stats?.avgRoas > 0 ? `${stats.avgRoas}x` : "N/A"} 
            change={stats?.avgRoas > 0 ? "Industry benchmark: 3.5x" : "Run ads to calculate"} 
            positive={stats?.avgRoas > 0} 
          />
          <MetricCard 
            label="Total Leads" 
            value={statsLoading ? "..." : String(stats?.totalLeads || 0)}
            change={`${stats?.activeAds || 0} ads running`}
            positive={true} 
          />
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Marketing Verticals</h2>
          <div className="grid grid-cols-7 gap-3">
            {verticals.map((v) => (
              <VerticalCard
                key={v.id}
                vertical={v}
                isActive={activeVertical === v.id}
                onClick={() => setActiveVertical(activeVertical === v.id ? null : v.id)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <CampaignManager />
            {activeVertical && (
              <div className="mt-4">
                <VerticalPanel vertical={activeVertical} />
              </div>
            )}
          </div>
          <div>
            <AgentActivityFeed />
            <div className="mt-4">
              <QuickActions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
