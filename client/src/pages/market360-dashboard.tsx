import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const INDIAN_LANGUAGES = {
  en: { name: "English", nativeName: "English" },
  hi: { name: "Hindi", nativeName: "हिन्दी" },
  bn: { name: "Bengali", nativeName: "বাংলা" },
  ta: { name: "Tamil", nativeName: "தமிழ்" },
  te: { name: "Telugu", nativeName: "తెలుగు" },
  mr: { name: "Marathi", nativeName: "मराठी" },
  gu: { name: "Gujarati", nativeName: "ગુજરાતી" },
  kn: { name: "Kannada", nativeName: "ಕನ್ನಡ" },
  ml: { name: "Malayalam", nativeName: "മലയാളം" },
  pa: { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  or: { name: "Oriya", nativeName: "ଓଡ଼ିଆ" },
  as: { name: "Assamese", nativeName: "অসমীয়া" },
};

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
    <div className="flex flex-col gap-1">
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
      <a 
        href={`/market360/${vertical.id}`} 
        className="text-xs text-center text-blue-600 hover:underline"
      >
        Open Dashboard
      </a>
    </div>
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

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function ChiefOfStaffChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hello! I'm your Chief of Staff AI. I can help you manage campaigns, analyze performance, generate content, and orchestrate your 267+ marketing agents across 23 LLMs and 12 Indian languages. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState<string>("openai");
  const [language, setLanguage] = useState<string>("en");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, provider, language }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      const providerLabel = provider === "openai" ? "GPT-5" : provider === "anthropic" ? "Claude" : provider === "gemini" ? "Gemini" : provider === "sarvam" ? "Sarvam" : provider === "groq" ? "Groq" : "AI";
      const langLabel = language !== "en" ? ` [${(INDIAN_LANGUAGES as any)[language]?.nativeName}]` : "";
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `[${providerLabel}${langLabel}] ${data.response}` 
      }]);
    },
    onError: () => {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    }
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    
    setMessages(prev => [...prev, { role: "user", content: input }]);
    chatMutation.mutate(input);
    setInput("");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-96">
      <div className="px-4 py-3 border-b bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="text-lg">Chief of Staff AI</span>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            </h3>
            <p className="text-xs text-indigo-100">23 LLMs | 267 Agents | 12 Languages</p>
          </div>
          <div className="flex gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs px-2 py-1 rounded bg-white/20 text-white border border-white/30 focus:outline-none"
              title="Select Language"
            >
              {Object.entries(INDIAN_LANGUAGES).map(([code, lang]) => (
                <option key={code} value={code} className="text-gray-900">
                  {lang.nativeName}
                </option>
              ))}
            </select>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="text-xs px-2 py-1 rounded bg-white/20 text-white border border-white/30 focus:outline-none"
              title="Select AI Provider"
            >
              <option value="openai" className="text-gray-900">GPT-5</option>
              <option value="anthropic" className="text-gray-900">Claude</option>
              <option value="gemini" className="text-gray-900">Gemini</option>
              <option value="groq" className="text-gray-900">Groq</option>
              <option value="sarvam" className="text-gray-900">Sarvam</option>
              <option value="cohere" className="text-gray-900">Cohere</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              msg.role === "user" 
                ? "bg-indigo-500 text-white" 
                : "bg-gray-100 text-gray-800"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about campaigns, leads, content..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            disabled={chatMutation.isPending}
          />
          <button
            onClick={handleSend}
            disabled={chatMutation.isPending || !input.trim()}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickActions() {
  const queryClient = useQueryClient();
  const [seedResult, setSeedResult] = useState<string | null>(null);
  
  const seedDemoData = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/market360/seed-demo-data", { method: "POST" });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["market360-stats"] });
      queryClient.invalidateQueries({ queryKey: ["social-posts"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["performance-ads"] });
      setSeedResult(`Seeded: ${data.seeded?.campaigns || 0} campaigns, ${data.seeded?.leads || 0} leads, ${data.seeded?.socialPosts || 0} posts`);
      setTimeout(() => setSeedResult(null), 5000);
    },
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
      <div className="space-y-2">
        <button
          onClick={() => seedDemoData.mutate()}
          disabled={seedDemoData.isPending}
          className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded text-sm text-blue-700"
        >
          {seedDemoData.isPending ? "Seeding..." : "Seed Demo Data"}
        </button>
        {seedResult && (
          <div className="px-3 py-2 bg-green-50 text-green-700 rounded text-xs">
            {seedResult}
          </div>
        )}
        <a href="/market360/sales" className="block w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm">
          View All Leads
        </a>
        <a href="/market360/performance" className="block w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm">
          Performance Dashboard
        </a>
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
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-xs">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">23 LLMs</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">752 Models</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">267 Agents</span>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">12 Languages</span>
            </div>
            <span className="flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${apiHealth?.status === "ok" ? "bg-green-500" : "bg-red-500"}`}></span>
              {apiHealth?.status === "ok" ? "Systems Online" : "Connecting..."}
            </span>
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
            <ChiefOfStaffChat />
            <div className="mt-4">
              <CampaignManager />
            </div>
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
