import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FlowBuilder } from "@/components/flow-builder";
import { ContentLibrary } from "@/components/content-library";

const verticalConfig: Record<string, { name: string; icon: string; color: string; agentCount: number; keyAgents: string[]; kpis: string[]; workflowSteps: string[] }> = {
  social: {
    name: "Social Media",
    icon: "📱",
    color: "bg-pink-500",
    agentCount: 45,
    keyAgents: ["Social Director (L4)", "Content Orchestrator (L3)", "Trend Spotter (L2)", "Copywriter (L2)", "Visual Producer (L2)", "Scheduler (L2)", "Engagement Coordinator (L2)", "Analytics Engine (L2)"],
    kpis: ["Viral Velocity", "Engagement Rate", "Sentiment Score", "Follower Growth", "Share of Voice"],
    workflowSteps: ["Trend Analysis", "Content Ideation", "Content Creation", "Visual Production", "Content Review", "Schedule Optimization", "Publication", "Engagement Monitoring", "Performance Analytics"]
  },
  seo: {
    name: "SEO & GEO",
    icon: "🔍",
    color: "bg-green-500",
    agentCount: 38,
    keyAgents: ["SEO Director (L4)", "Technical SEO Auditor (L2)", "GEO Optimizer (L3)", "Keyword Intelligence (L2)", "Content Gap Analyzer (L2)", "Backlink Strategist (L2)", "Local SEO Manager (L2)"],
    kpis: ["Share of Model", "Organic Traffic", "Domain Authority", "Keyword Rankings", "Backlink Quality"],
    workflowSteps: ["Technical SEO Audit", "Keyword Research", "Content Gap Analysis", "On-Page Optimization", "Backlink Analysis", "GEO Optimization", "Local SEO", "Rank Tracking", "SEO Reporting"]
  },
  web: {
    name: "Web Dev",
    icon: "🌐",
    color: "bg-blue-500",
    agentCount: 32,
    keyAgents: ["Web Director (L4)", "UX Researcher (L2)", "UI Generator (L3)", "Aura.build Integrator (L3)", "Performance Optimizer (L2)", "A/B Testing Manager (L2)", "QA Automation (L2)"],
    kpis: ["Page Load Speed", "Conversion Rate", "Core Web Vitals", "Bounce Rate", "Time-to-Deploy"],
    workflowSteps: ["Design Brief Analysis", "UX Research", "UI Component Generation", "Aura.build Integration", "Responsive Design", "Performance Optimization", "A/B Testing Setup", "QA Automation", "Deployment"]
  },
  sales: {
    name: "Sales SDR",
    icon: "💼",
    color: "bg-purple-500",
    agentCount: 52,
    keyAgents: ["Sales Director (L4)", "Lead Intelligence (L2)", "Prospect Researcher (L2)", "ICP Matcher (L2)", "Email Personalizer (L2)", "Sequence Builder (L2)", "Pipeline Manager (L2)"],
    kpis: ["Meeting Booked Rate", "Response Rate", "Pipeline Value", "Win Rate", "Sales Velocity"],
    workflowSteps: ["Lead Intelligence", "Prospect Research", "ICP Matching", "Email Personalization", "Sequence Building", "Meeting Booking", "CRM Sync", "Pipeline Management", "Sales Analytics"]
  },
  whatsapp: {
    name: "WhatsApp",
    icon: "💬",
    color: "bg-emerald-500",
    agentCount: 28,
    keyAgents: ["WhatsApp Director (L4)", "Flow Designer (L2)", "Template Manager (L2)", "Broadcast Coordinator (L2)", "Chatbot Trainer (L2)", "Commerce Integrator (L2)", "Community Manager (L2)"],
    kpis: ["Response Time", "Retention Rate", "Commerce Conversion", "Message Open Rate", "CSAT Score"],
    workflowSteps: ["Flow Design", "Message Templates", "Broadcast Setup", "Chatbot Configuration", "Commerce Integration", "Community Management", "Support Automation", "Analytics Dashboard"]
  },
  linkedin: {
    name: "LinkedIn B2B",
    icon: "🔗",
    color: "bg-sky-600",
    agentCount: 35,
    keyAgents: ["LinkedIn Director (L4)", "Profile Optimizer (L2)", "Content Creator (L2)", "Network Analyzer (L2)", "Connection Strategist (L2)", "InMail Specialist (L2)", "SSI Improver (L2)"],
    kpis: ["Profile Views", "Connection Rate", "SSI Score", "Content Reach", "Lead Quality"],
    workflowSteps: ["Profile Optimization", "Content Creation", "Network Analysis", "Connection Strategy", "Engagement Automation", "InMail Campaigns", "Company Page Management", "SSI Improvement", "LinkedIn Analytics"]
  },
  performance: {
    name: "Performance Ads",
    icon: "📊",
    color: "bg-orange-500",
    agentCount: 37,
    keyAgents: ["Performance Director (L4)", "Campaign Planner (L2)", "Audience Builder (L2)", "Creative Generator (L2)", "Bid Strategist (L3)", "Real-time Optimizer (L3)", "Attribution Analyst (L3)"],
    kpis: ["ROAS", "CPA", "CAC", "CTR", "Conversion Rate"],
    workflowSteps: ["Campaign Planning", "Audience Building", "Creative Generation", "Multi-Platform Setup", "Bid Strategy", "A/B Testing", "Conversion Tracking", "Real-time Optimization", "Cross-Channel Attribution", "ROAS Reporting"]
  }
};

function AIToolPanel({ 
  title, 
  placeholder, 
  buttonText, 
  onGenerate, 
  isLoading, 
  result 
}: { 
  title: string; 
  placeholder: string; 
  buttonText: string; 
  onGenerate: (prompt: string) => void; 
  isLoading: boolean; 
  result?: string;
}) {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
      <h4 className="text-sm font-medium text-purple-800 mb-3">{title}</h4>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          className="flex-1 p-2 border rounded text-sm"
        />
        <button
          onClick={() => prompt && onGenerate(prompt)}
          disabled={!prompt || isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? "Generating..." : buttonText}
        </button>
      </div>
      {result && (
        <div className="p-3 bg-white rounded border text-sm text-gray-700 whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
}

function SocialDashboard() {
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState({ platform: "twitter", content: "" });
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");

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

  const generateContent = useMutation({
    mutationFn: async (topic: string) => {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "social_post",
          brand: "Your Brand",
          industry: "technology",
          targetAudience: "professionals",
          tone: "engaging",
          topic,
          platform: newPost.platform
        }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setNewPost({ ...newPost, content: data.content });
      setGeneratedContent(data.content);
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Posts Scheduled</p>
          <p className="text-2xl font-bold text-pink-600">{posts?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Engagement Rate</p>
          <p className="text-2xl font-bold text-pink-600">4.2%</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Viral Velocity</p>
          <p className="text-2xl font-bold text-pink-600">1.8x</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Create Social Post</h3>
          <button
            onClick={() => setShowAiGenerator(!showAiGenerator)}
            className="text-sm px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:opacity-90"
          >
            {showAiGenerator ? "Manual Mode" : "AI Generate"}
          </button>
        </div>
        
        {showAiGenerator && (
          <AIToolPanel
            title="AI Content Generator - Powered by GPT-5"
            placeholder="Describe what you want to post about..."
            buttonText="Generate"
            onGenerate={(prompt) => generateContent.mutate(prompt)}
            isLoading={generateContent.isPending}
            result={generatedContent}
          />
        )}
        
        <div className="space-y-3 mt-4">
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
            rows={4}
          />
          <button
            onClick={() => newPost.content && createPost.mutate(newPost)}
            disabled={!newPost.content || createPost.isPending}
            className="w-full px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
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

function SEODashboard() {
  const [showAudit, setShowAudit] = useState(false);
  const [auditResult, setAuditResult] = useState("");
  const [showKeywordTool, setShowKeywordTool] = useState(false);
  const [keywordResult, setKeywordResult] = useState("");

  const runAudit = useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "seo_content",
          brand: "Website Audit",
          industry: "SEO",
          targetAudience: "marketers",
          tone: "professional",
          topic: `Perform an SEO audit analysis for: ${url}. Provide recommendations for improving search rankings, including technical SEO, content optimization, and backlink opportunities.`,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => setAuditResult(data.content),
  });

  const generateKeywords = useMutation({
    mutationFn: async (topic: string) => {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "seo_content",
          brand: "Keyword Research",
          industry: "SEO",
          targetAudience: "marketers",
          tone: "analytical",
          topic: `Generate a comprehensive keyword strategy for: ${topic}. Include primary keywords, long-tail variations, LSI keywords, and search intent analysis.`,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => setKeywordResult(data.content),
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Domain Authority</p>
          <p className="text-2xl font-bold text-green-600">45</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Organic Traffic</p>
          <p className="text-2xl font-bold text-green-600">12.5K</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Share of Model</p>
          <p className="text-2xl font-bold text-green-600">8.2%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">AI SEO Tools</h3>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowAudit(!showAudit); setShowKeywordTool(false); }}
              className={`text-sm px-3 py-1 rounded-full ${showAudit ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
            >
              Site Audit
            </button>
            <button
              onClick={() => { setShowKeywordTool(!showKeywordTool); setShowAudit(false); }}
              className={`text-sm px-3 py-1 rounded-full ${showKeywordTool ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
            >
              Keyword Research
            </button>
          </div>
        </div>

        {showAudit && (
          <AIToolPanel
            title="AI Site Audit - Powered by Gemini"
            placeholder="Enter website URL to audit..."
            buttonText="Run Audit"
            onGenerate={(prompt) => runAudit.mutate(prompt)}
            isLoading={runAudit.isPending}
            result={auditResult}
          />
        )}

        {showKeywordTool && (
          <AIToolPanel
            title="AI Keyword Research - Powered by GPT-5"
            placeholder="Enter topic or seed keyword..."
            buttonText="Research"
            onGenerate={(prompt) => generateKeywords.mutate(prompt)}
            isLoading={generateKeywords.isPending}
            result={keywordResult}
          />
        )}
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">GEO Optimization Status</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
            <span>ChatGPT Coverage</span>
            <span className="text-green-600 font-medium">Active</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
            <span>Perplexity Indexing</span>
            <span className="text-green-600 font-medium">Indexed</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
            <span>Claude Visibility</span>
            <span className="text-yellow-600 font-medium">Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WebDevDashboard() {
  const [showPageBuilder, setShowPageBuilder] = useState(false);
  const [pageResult, setPageResult] = useState("");
  const [showCodeGen, setShowCodeGen] = useState(false);
  const [codeResult, setCodeResult] = useState("");

  const generatePage = useMutation({
    mutationFn: async (description: string) => {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "seo_content",
          brand: "Web Development",
          industry: "technology",
          targetAudience: "developers",
          tone: "technical",
          topic: `Generate HTML/CSS code for a landing page: ${description}. Include modern design, responsive layout, and conversion-optimized elements.`,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => setPageResult(data.content),
  });

  const generateCode = useMutation({
    mutationFn: async (requirements: string) => {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "seo_content",
          brand: "Code Generation",
          industry: "technology",
          targetAudience: "developers",
          tone: "technical",
          topic: `Generate React component code: ${requirements}. Include TypeScript types, proper state management, and modern best practices.`,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => setCodeResult(data.content),
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Page Load Speed</p>
          <p className="text-2xl font-bold text-blue-600">1.2s</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Conversion Rate</p>
          <p className="text-2xl font-bold text-blue-600">3.8%</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Pages Deployed</p>
          <p className="text-2xl font-bold text-blue-600">12</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">AI Development Tools</h3>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowPageBuilder(!showPageBuilder); setShowCodeGen(false); }}
              className={`text-sm px-3 py-1 rounded-full ${showPageBuilder ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              Page Builder
            </button>
            <button
              onClick={() => { setShowCodeGen(!showCodeGen); setShowPageBuilder(false); }}
              className={`text-sm px-3 py-1 rounded-full ${showCodeGen ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              Code Generator
            </button>
          </div>
        </div>

        {showPageBuilder && (
          <AIToolPanel
            title="AI Page Builder - Powered by Claude"
            placeholder="Describe the landing page you need..."
            buttonText="Generate Page"
            onGenerate={(prompt) => generatePage.mutate(prompt)}
            isLoading={generatePage.isPending}
            result={pageResult}
          />
        )}

        {showCodeGen && (
          <AIToolPanel
            title="AI Code Generator - Powered by GPT-5"
            placeholder="Describe the component or feature..."
            buttonText="Generate Code"
            onGenerate={(prompt) => generateCode.mutate(prompt)}
            isLoading={generateCode.isPending}
            result={codeResult}
          />
        )}
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Recent Deployments</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Homepage Redesign</p>
              <p className="text-xs text-gray-500">Deployed 2 hours ago</p>
            </div>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Live</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Product Landing Page</p>
              <p className="text-xs text-gray-500">Deployed yesterday</p>
            </div>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SalesDashboard() {
  const queryClient = useQueryClient();
  const [newLead, setNewLead] = useState({ name: "", email: "", company: "", source: "linkedin" });
  const [scoringLead, setScoringLead] = useState<number | null>(null);
  const [leadScores, setLeadScores] = useState<Record<number, any>>({});
  const [showOutreach, setShowOutreach] = useState(false);
  const [outreachResult, setOutreachResult] = useState("");

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

  const scoreLead = useMutation({
    mutationFn: async (lead: any) => {
      setScoringLead(lead.id);
      const res = await fetch("/api/ai/score-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          name: lead.name,
          email: lead.email,
          company: lead.company,
          source: lead.source,
        }),
      });
      return res.json();
    },
    onSuccess: (data, lead) => {
      setLeadScores(prev => ({ ...prev, [lead.id]: data }));
      setScoringLead(null);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: () => setScoringLead(null)
  });

  const generateOutreach = useMutation({
    mutationFn: async (context: string) => {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "email",
          brand: "Sales Team",
          industry: "B2B",
          targetAudience: "decision makers",
          tone: "professional",
          topic: `Generate a personalized sales outreach email: ${context}`,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => setOutreachResult(data.content),
  });

  const getQualificationColor = (qual: string) => {
    switch (qual) {
      case "hot": return "bg-red-100 text-red-800";
      case "warm": return "bg-yellow-100 text-yellow-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Total Leads</p>
          <p className="text-2xl font-bold text-purple-600">{leads?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Pipeline Value</p>
          <p className="text-2xl font-bold text-purple-600">$45K</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Meeting Rate</p>
          <p className="text-2xl font-bold text-purple-600">18%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">AI Outreach Generator</h3>
          <button
            onClick={() => setShowOutreach(!showOutreach)}
            className={`text-sm px-3 py-1 rounded-full ${showOutreach ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}
          >
            {showOutreach ? "Close" : "Open"}
          </button>
        </div>
        
        {showOutreach && (
          <AIToolPanel
            title="AI Personalized Outreach - Powered by Claude"
            placeholder="Describe the prospect and context..."
            buttonText="Generate Email"
            onGenerate={(prompt) => generateOutreach.mutate(prompt)}
            isLoading={generateOutreach.isPending}
            result={outreachResult}
          />
        )}
      </div>

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
          className="mt-3 w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {createLead.isPending ? "Adding..." : "Add Lead"}
        </button>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Leads Pipeline ({leads?.length || 0})</h3>
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : leads?.length > 0 ? (
          <div className="space-y-3">
            {leads.map((lead: any) => (
              <div key={lead.id} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.company} - {lead.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {leadScores[lead.id] ? (
                      <span className={`text-xs px-2 py-0.5 rounded ${getQualificationColor(leadScores[lead.id].qualification)}`}>
                        {leadScores[lead.id].qualification.toUpperCase()} ({leadScores[lead.id].score}/100)
                      </span>
                    ) : (
                      <button
                        onClick={() => scoreLead.mutate(lead)}
                        disabled={scoringLead === lead.id}
                        className="text-xs px-2 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded hover:opacity-90 disabled:opacity-50"
                      >
                        {scoringLead === lead.id ? "Scoring..." : "AI Score"}
                      </button>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>{lead.status}</span>
                  </div>
                </div>
                {leadScores[lead.id] && (
                  <div className="mt-2 p-2 bg-white rounded border text-xs">
                    <p className="text-gray-600 mb-1">{leadScores[lead.id].reasoning}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {leadScores[lead.id].suggestedActions?.map((action: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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

function WhatsAppDashboard() {
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateResult, setTemplateResult] = useState("");
  const [showAutoReply, setShowAutoReply] = useState(false);
  const [autoReplyResult, setAutoReplyResult] = useState("");

  const generateTemplate = useMutation({
    mutationFn: async (context: string) => {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "social_post",
          brand: "WhatsApp Business",
          industry: "conversational commerce",
          targetAudience: "customers",
          tone: "friendly",
          topic: `Create a WhatsApp business message template: ${context}. Include quick reply buttons and call-to-action.`,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => setTemplateResult(data.content),
  });

  const generateAutoReply = useMutation({
    mutationFn: async (scenario: string) => {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "social_post",
          brand: "Customer Support",
          industry: "customer service",
          targetAudience: "customers",
          tone: "helpful",
          topic: `Generate automated WhatsApp reply flows for: ${scenario}. Include greeting, FAQs, and handoff to human.`,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => setAutoReplyResult(data.content),
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Response Time</p>
          <p className="text-2xl font-bold text-emerald-600">&lt;30s</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Retention Rate</p>
          <p className="text-2xl font-bold text-emerald-600">78%</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Commerce Conversion</p>
          <p className="text-2xl font-bold text-emerald-600">12%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">AI WhatsApp Tools</h3>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowTemplates(!showTemplates); setShowAutoReply(false); }}
              className={`text-sm px-3 py-1 rounded-full ${showTemplates ? 'bg-emerald-500 text-white' : 'bg-gray-100'}`}
            >
              Message Templates
            </button>
            <button
              onClick={() => { setShowAutoReply(!showAutoReply); setShowTemplates(false); }}
              className={`text-sm px-3 py-1 rounded-full ${showAutoReply ? 'bg-emerald-500 text-white' : 'bg-gray-100'}`}
            >
              Auto-Reply Flows
            </button>
          </div>
        </div>

        {showTemplates && (
          <AIToolPanel
            title="AI Template Generator - Powered by GPT-5"
            placeholder="Describe the message purpose (e.g., order confirmation, promotion)..."
            buttonText="Generate Template"
            onGenerate={(prompt) => generateTemplate.mutate(prompt)}
            isLoading={generateTemplate.isPending}
            result={templateResult}
          />
        )}

        {showAutoReply && (
          <AIToolPanel
            title="AI Auto-Reply Builder - Powered by Claude"
            placeholder="Describe the support scenario..."
            buttonText="Build Flow"
            onGenerate={(prompt) => generateAutoReply.mutate(prompt)}
            isLoading={generateAutoReply.isPending}
            result={autoReplyResult}
          />
        )}
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Active Conversations</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-emerald-50 rounded">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">J</div>
              <div>
                <p className="font-medium">John Smith</p>
                <p className="text-xs text-gray-500">Inquiry about pricing</p>
              </div>
            </div>
            <span className="text-xs text-emerald-600">Active</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white">M</div>
              <div>
                <p className="font-medium">Maria Garcia</p>
                <p className="text-xs text-gray-500">Order tracking</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">Resolved</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Automation Flows</h3>
        <FlowBuilder vertical="whatsapp" />
      </div>
    </div>
  );
}

function LinkedInDashboard() {
  const [showContentGen, setShowContentGen] = useState(false);
  const [contentResult, setContentResult] = useState("");
  const [showProfileOpt, setShowProfileOpt] = useState(false);
  const [profileResult, setProfileResult] = useState("");

  const generateContent = useMutation({
    mutationFn: async (topic: string) => {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "social_post",
          brand: "Thought Leader",
          industry: "B2B",
          targetAudience: "professionals",
          tone: "authoritative",
          topic: `Create a LinkedIn post about: ${topic}. Include hook, insights, and call-to-action for engagement.`,
          platform: "linkedin"
        }),
      });
      return res.json();
    },
    onSuccess: (data) => setContentResult(data.content),
  });

  const optimizeProfile = useMutation({
    mutationFn: async (role: string) => {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "seo_content",
          brand: "Personal Brand",
          industry: "professional",
          targetAudience: "recruiters and clients",
          tone: "professional",
          topic: `Optimize LinkedIn profile for: ${role}. Include headline, summary, and keyword suggestions for discoverability.`,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => setProfileResult(data.content),
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Profile Views</p>
          <p className="text-2xl font-bold text-sky-600">1,234</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Connection Rate</p>
          <p className="text-2xl font-bold text-sky-600">42%</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">SSI Score</p>
          <p className="text-2xl font-bold text-sky-600">72</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">AI LinkedIn Tools</h3>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowContentGen(!showContentGen); setShowProfileOpt(false); }}
              className={`text-sm px-3 py-1 rounded-full ${showContentGen ? 'bg-sky-500 text-white' : 'bg-gray-100'}`}
            >
              Content Creator
            </button>
            <button
              onClick={() => { setShowProfileOpt(!showProfileOpt); setShowContentGen(false); }}
              className={`text-sm px-3 py-1 rounded-full ${showProfileOpt ? 'bg-sky-500 text-white' : 'bg-gray-100'}`}
            >
              Profile Optimizer
            </button>
          </div>
        </div>

        {showContentGen && (
          <AIToolPanel
            title="AI Content Creator - Powered by GPT-5"
            placeholder="What topic do you want to write about?"
            buttonText="Generate Post"
            onGenerate={(prompt) => generateContent.mutate(prompt)}
            isLoading={generateContent.isPending}
            result={contentResult}
          />
        )}

        {showProfileOpt && (
          <AIToolPanel
            title="AI Profile Optimizer - Powered by Claude"
            placeholder="Enter your target role or industry..."
            buttonText="Optimize"
            onGenerate={(prompt) => optimizeProfile.mutate(prompt)}
            isLoading={optimizeProfile.isPending}
            result={profileResult}
          />
        )}
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Engagement Schedule</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-sky-50 rounded">
            <div>
              <p className="font-medium">Thought Leadership Post</p>
              <p className="text-xs text-gray-500">Tomorrow 9:00 AM</p>
            </div>
            <span className="text-xs px-2 py-1 bg-sky-100 text-sky-700 rounded">Scheduled</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Industry Insights</p>
              <p className="text-xs text-gray-500">Friday 2:00 PM</p>
            </div>
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">Draft</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PerformanceDashboard() {
  const [showAdCopy, setShowAdCopy] = useState(false);
  const [adCopyResult, setAdCopyResult] = useState("");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");

  const { data: ads, isLoading } = useQuery({
    queryKey: ["performance-ads"],
    queryFn: () => fetch("/api/market360/performance/ads").then(r => r.json())
  });

  const generateAdCopy = useMutation({
    mutationFn: async (product: string) => {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ad_copy",
          brand: "Performance Marketing",
          industry: "advertising",
          targetAudience: "potential customers",
          tone: "persuasive",
          topic: `Create high-converting ad copy for: ${product}. Include headline, description, and call-to-action variants.`,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => setAdCopyResult(data.content),
  });

  const analyzePerformance = useMutation({
    mutationFn: async (metrics: string) => {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "seo_content",
          brand: "Performance Analysis",
          industry: "advertising",
          targetAudience: "marketers",
          tone: "analytical",
          topic: `Analyze ad performance and provide optimization recommendations: ${metrics}`,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => setAnalysisResult(data.content),
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Total Spend</p>
          <p className="text-2xl font-bold text-orange-600">$12,450</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">ROAS</p>
          <p className="text-2xl font-bold text-green-600">3.2x</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">CPA</p>
          <p className="text-2xl font-bold text-orange-600">$24.50</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-gray-500 text-sm">Conversions</p>
          <p className="text-2xl font-bold text-orange-600">508</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">AI Performance Tools</h3>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowAdCopy(!showAdCopy); setShowAnalysis(false); }}
              className={`text-sm px-3 py-1 rounded-full ${showAdCopy ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}
            >
              Ad Copy Generator
            </button>
            <button
              onClick={() => { setShowAnalysis(!showAnalysis); setShowAdCopy(false); }}
              className={`text-sm px-3 py-1 rounded-full ${showAnalysis ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}
            >
              Performance Analyzer
            </button>
          </div>
        </div>

        {showAdCopy && (
          <AIToolPanel
            title="AI Ad Copy Generator - Powered by GPT-5"
            placeholder="Describe your product or service..."
            buttonText="Generate Ads"
            onGenerate={(prompt) => generateAdCopy.mutate(prompt)}
            isLoading={generateAdCopy.isPending}
            result={adCopyResult}
          />
        )}

        {showAnalysis && (
          <AIToolPanel
            title="AI Performance Analyzer - Powered by Gemini"
            placeholder="Paste your campaign metrics or describe performance..."
            buttonText="Analyze"
            onGenerate={(prompt) => analyzePerformance.mutate(prompt)}
            isLoading={analyzePerformance.isPending}
            result={analysisResult}
          />
        )}
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Active Campaigns ({ads?.length || 0})</h3>
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : ads?.length > 0 ? (
          <div className="space-y-2">
            {ads.map((ad: any) => (
              <div key={ad.id} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{ad.name}</span>
                    <span className="ml-2 text-xs text-gray-500">{ad.platform}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded">{ad.status}</span>
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

export default function VerticalDashboard({ vertical }: { vertical: string }) {
  const config = verticalConfig[vertical];

  if (!config) {
    return <div className="p-4 text-gray-500">Unknown vertical: {vertical}</div>;
  }

  const renderDashboard = () => {
    switch (vertical) {
      case "social": return <SocialDashboard />;
      case "seo": return <SEODashboard />;
      case "web": return <WebDevDashboard />;
      case "sales": return <SalesDashboard />;
      case "whatsapp": return <WhatsAppDashboard />;
      case "linkedin": return <LinkedInDashboard />;
      case "performance": return <PerformanceDashboard />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className={`${config.color} text-white px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{config.icon}</span>
            <div>
              <h1 className="text-2xl font-bold">{config.name}</h1>
              <p className="text-sm opacity-80">Wizards Tech Vertical Dashboard</p>
            </div>
          </div>
          <a href="/market360" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition">
            Back to God Mode
          </a>
        </div>
      </header>

      <div className="p-6">
        <div className="mb-6 p-4 bg-white rounded-lg border">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Active Agents</h3>
            <span className="text-sm text-gray-500">{config.agentCount} agents total</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {config.keyAgents.map((agent: string) => (
              <span key={agent} className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-full text-sm border border-indigo-100">
                {agent}
              </span>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Workflow Steps</h4>
            <div className="flex flex-wrap gap-1">
              {config.workflowSteps.map((step: string, index: number) => (
                <span key={step} className="inline-flex items-center text-xs text-gray-600">
                  {index > 0 && <span className="mx-1 text-gray-400">→</span>}
                  {step}
                </span>
              ))}
            </div>
          </div>
        </div>

        {renderDashboard()}
      </div>
    </div>
  );
}
