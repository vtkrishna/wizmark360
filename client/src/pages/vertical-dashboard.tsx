import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const verticalConfig: Record<string, { name: string; icon: string; color: string; agents: string[]; kpis: string[] }> = {
  social: {
    name: "Social Media",
    icon: "📱",
    color: "bg-pink-500",
    agents: ["Trend Watcher", "Content Ideation", "Visual Production", "Scheduling"],
    kpis: ["Viral Velocity", "Engagement Rate", "Sentiment Score"]
  },
  seo: {
    name: "SEO & GEO",
    icon: "🔍",
    color: "bg-green-500",
    agents: ["GEO Auditor", "Authority Architect", "Programmatic SEO"],
    kpis: ["Share of Model", "Organic Traffic", "Domain Authority"]
  },
  web: {
    name: "Web Dev",
    icon: "🌐",
    color: "bg-blue-500",
    agents: ["UX Designer", "Frontend Dev", "QA Bot"],
    kpis: ["Page Load Speed", "Conversion Rate", "Time-to-Deploy"]
  },
  sales: {
    name: "Sales SDR",
    icon: "💼",
    color: "bg-purple-500",
    agents: ["Prospector", "Personalizer", "Outreach Manager"],
    kpis: ["Meeting Booked Rate", "Response Rate", "Pipeline Value"]
  },
  whatsapp: {
    name: "WhatsApp",
    icon: "💬",
    color: "bg-emerald-500",
    agents: ["Community Manager", "Gamification Engine", "Support Concierge"],
    kpis: ["Response Time", "Retention Rate", "Commerce Conversion"]
  },
  linkedin: {
    name: "LinkedIn",
    icon: "🔗",
    color: "bg-sky-600",
    agents: ["Voice Cloner", "Engagement Rig", "Networker"],
    kpis: ["Profile Views", "Connection Rate", "SSI Score"]
  },
  performance: {
    name: "Performance Ads",
    icon: "📊",
    color: "bg-orange-500",
    agents: ["Data Analyst", "Bid Adjuster", "Creative Iterator"],
    kpis: ["ROAS", "CPA", "CAC"]
  }
};

function SocialDashboard() {
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState({ platform: "twitter", content: "" });

  const { data: posts, isLoading } = useQuery({
    queryKey: ["social-posts"],
    queryFn: () => fetch("/api/market360/social/posts").then(r => r.json())
  });

  const createPost = useMutation({
    mutationFn: (data: { platform: string; content: string }) =>
      fetch("/api/market360/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-posts"] });
      queryClient.invalidateQueries({ queryKey: ["market360-stats"] });
      setNewPost({ platform: "twitter", content: "" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Create Social Post</h3>
        <div className="space-y-3">
          <select
            value={newPost.platform}
            onChange={(e) => setNewPost({ ...newPost, platform: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="twitter">Twitter/X</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
          </select>
          <textarea
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            placeholder="Write your post content..."
            className="w-full p-2 border rounded"
            rows={3}
          />
          <button
            onClick={() => newPost.content && createPost.mutate(newPost)}
            disabled={!newPost.content || createPost.isPending}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
          >
            {createPost.isPending ? "Creating..." : "Schedule Post"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Scheduled Posts ({posts?.length || 0})</h3>
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : posts?.length > 0 ? (
          <div className="space-y-2">
            {posts.map((post: any) => (
              <div key={post.id} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-start">
                  <span className="text-xs px-2 py-0.5 bg-pink-100 text-pink-800 rounded">{post.platform}</span>
                  <span className="text-xs text-gray-400">{post.status}</span>
                </div>
                <p className="mt-2 text-sm text-gray-700">{post.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No posts scheduled yet.</p>
        )}
      </div>
    </div>
  );
}

function SalesDashboard() {
  const queryClient = useQueryClient();
  const [newLead, setNewLead] = useState({ name: "", email: "", company: "", source: "linkedin" });

  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: () => fetch("/api/market360/sales/leads").then(r => r.json())
  });

  const createLead = useMutation({
    mutationFn: (data: typeof newLead) =>
      fetch("/api/market360/sales/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["market360-stats"] });
      setNewLead({ name: "", email: "", company: "", source: "linkedin" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Add New Lead</h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Name"
            value={newLead.name}
            onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={newLead.email}
            onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Company"
            value={newLead.company}
            onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
            className="p-2 border rounded"
          />
          <select
            value={newLead.source}
            onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="linkedin">LinkedIn</option>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="cold_outreach">Cold Outreach</option>
          </select>
        </div>
        <button
          onClick={() => newLead.name && createLead.mutate(newLead)}
          disabled={!newLead.name || createLead.isPending}
          className="mt-3 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {createLead.isPending ? "Adding..." : "Add Lead"}
        </button>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Leads Pipeline ({leads?.length || 0})</h3>
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : leads?.length > 0 ? (
          <div className="space-y-2">
            {leads.map((lead: any) => (
              <div key={lead.id} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-xs text-gray-500">{lead.company} - {lead.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  lead.status === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>{lead.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No leads captured yet.</p>
        )}
      </div>
    </div>
  );
}

function PerformanceDashboard() {
  const { data: ads, isLoading } = useQuery({
    queryKey: ["performance-ads"],
    queryFn: () => fetch("/api/market360/performance/ads").then(r => r.json())
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Total Spend</p>
          <p className="text-2xl font-bold text-gray-900">$0</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Impressions</p>
          <p className="text-2xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Conversions</p>
          <p className="text-2xl font-bold text-gray-900">0</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Active Ads ({ads?.length || 0})</h3>
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : ads?.length > 0 ? (
          <div className="space-y-2">
            {ads.map((ad: any) => (
              <div key={ad.id} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between">
                  <span className="font-medium">{ad.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded">{ad.platform}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No ads running. Connect ad platforms to import campaigns.</p>
        )}
      </div>
    </div>
  );
}

function GenericDashboard({ vertical }: { vertical: string }) {
  const config = verticalConfig[vertical];
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6 text-center">
        <div className="text-4xl mb-3">{config?.icon}</div>
        <h3 className="text-xl font-bold text-gray-900">{config?.name} Dashboard</h3>
        <p className="text-gray-500 mt-2">This vertical is ready for agent deployment.</p>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-semibold mb-3">Available Agents</h4>
        <div className="flex flex-wrap gap-2">
          {config?.agents.map((agent) => (
            <span key={agent} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
              {agent}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-semibold mb-3">Key Performance Indicators</h4>
        <div className="grid grid-cols-3 gap-4">
          {config?.kpis.map((kpi) => (
            <div key={kpi} className="p-3 bg-gray-50 rounded text-center">
              <p className="text-sm text-gray-500">{kpi}</p>
              <p className="text-xl font-bold text-gray-900">--</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VerticalDashboard({ vertical }: { vertical: string }) {
  const config = verticalConfig[vertical];

  if (!config) {
    return <div className="p-4 text-gray-500">Unknown vertical: {vertical}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className={`${config.color} text-white px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{config.icon}</span>
            <div>
              <h1 className="text-2xl font-bold">{config.name}</h1>
              <p className="text-sm opacity-80">Market360 Vertical Dashboard</p>
            </div>
          </div>
          <a href="/market360" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition">
            Back to Dashboard
          </a>
        </div>
      </header>

      <div className="p-6">
        {vertical === "social" && <SocialDashboard />}
        {vertical === "sales" && <SalesDashboard />}
        {vertical === "performance" && <PerformanceDashboard />}
        {!["social", "sales", "performance"].includes(vertical) && <GenericDashboard vertical={vertical} />}
      </div>
    </div>
  );
}
