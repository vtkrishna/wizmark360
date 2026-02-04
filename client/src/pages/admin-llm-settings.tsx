import { useState } from "react";
import AppShell from "../components/layout/app-shell";
import {
  Bot,
  Brain,
  Settings,
  Zap,
  DollarSign,
  Save,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Copy,
  RefreshCw,
  Shield,
  Cpu,
  Layers,
  Target,
  MessageSquare,
  AlertTriangle,
  Info,
  Search,
  Filter
} from "lucide-react";

interface LLMProvider {
  id: string;
  name: string;
  tier: string;
  modelCount: number;
  isActive: boolean;
  apiKeyConfigured: boolean;
  models: LLMModel[];
}

interface LLMModel {
  id: string;
  name: string;
  contextWindow: number;
  inputCost: number;
  outputCost: number;
  capabilities: string[];
  isDefault: boolean;
  isActive: boolean;
}

interface Agent {
  id: string;
  name: string;
  vertical: string;
  romaLevel: string;
  systemPrompt: string;
  model: string;
  isActive: boolean;
  taskCount: number;
}

const providers: LLMProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    tier: "Tier 1 - Premium",
    modelCount: 18,
    isActive: true,
    apiKeyConfigured: true,
    models: [
      { id: "gpt-5.2", name: "GPT-5.2 Thinking", contextWindow: 200000, inputCost: 5, outputCost: 20, capabilities: ["text", "vision", "reasoning"], isDefault: true, isActive: true },
      { id: "gpt-5.2-pro", name: "GPT-5.2 Pro", contextWindow: 200000, inputCost: 15, outputCost: 60, capabilities: ["reasoning", "code"], isDefault: false, isActive: true },
      { id: "gpt-5.2-instant", name: "GPT-5.2 Instant", contextWindow: 200000, inputCost: 2.5, outputCost: 10, capabilities: ["text", "fast"], isDefault: false, isActive: true },
      { id: "o3", name: "o3 Reasoning", contextWindow: 200000, inputCost: 15, outputCost: 60, capabilities: ["reasoning"], isDefault: false, isActive: true },
      { id: "o4-mini", name: "o4 Mini", contextWindow: 200000, inputCost: 1.1, outputCost: 4.4, capabilities: ["reasoning", "fast"], isDefault: false, isActive: true }
    ]
  },
  {
    id: "anthropic",
    name: "Anthropic",
    tier: "Tier 1 - Premium",
    modelCount: 6,
    isActive: true,
    apiKeyConfigured: true,
    models: [
      { id: "claude-sonnet-4", name: "Claude 4 Sonnet", contextWindow: 200000, inputCost: 3, outputCost: 15, capabilities: ["text", "vision", "code"], isDefault: true, isActive: true },
      { id: "claude-opus-4", name: "Claude 4 Opus", contextWindow: 200000, inputCost: 15, outputCost: 75, capabilities: ["reasoning", "code"], isDefault: false, isActive: true },
      { id: "claude-haiku-4.5", name: "Claude Haiku 4.5", contextWindow: 200000, inputCost: 0.8, outputCost: 4, capabilities: ["text", "fast"], isDefault: false, isActive: true }
    ]
  },
  {
    id: "gemini",
    name: "Google Gemini",
    tier: "Tier 1 - Premium",
    modelCount: 8,
    isActive: true,
    apiKeyConfigured: true,
    models: [
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", contextWindow: 1000000, inputCost: 0.075, outputCost: 0.3, capabilities: ["text", "vision", "fast"], isDefault: true, isActive: true },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", contextWindow: 2000000, inputCost: 1.25, outputCost: 5, capabilities: ["text", "reasoning"], isDefault: false, isActive: true }
    ]
  },
  {
    id: "kimi",
    name: "Moonshot (Kimi K2.5)",
    tier: "Tier 2 - Cost-Optimized",
    modelCount: 4,
    isActive: true,
    apiKeyConfigured: true,
    models: [
      { id: "kimi-k2.5", name: "Kimi K2.5", contextWindow: 128000, inputCost: 0.12, outputCost: 0.12, capabilities: ["text", "agentic", "multilingual"], isDefault: true, isActive: true },
      { id: "kimi-k2-instruct", name: "Kimi K2 Instruct", contextWindow: 128000, inputCost: 0.12, outputCost: 0.12, capabilities: ["text", "code"], isDefault: false, isActive: true }
    ]
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    tier: "Tier 4 - Free/Budget",
    modelCount: 343,
    isActive: true,
    apiKeyConfigured: true,
    models: [
      { id: "llama-3.3-70b", name: "Llama 3.3 70B", contextWindow: 131072, inputCost: 0.12, outputCost: 0.3, capabilities: ["text", "code"], isDefault: true, isActive: true },
      { id: "qwen-2.5-72b", name: "Qwen 2.5 72B", contextWindow: 131072, inputCost: 0.35, outputCost: 0.4, capabilities: ["text", "code"], isDefault: false, isActive: true },
      { id: "deepseek-v3", name: "DeepSeek V3", contextWindow: 64000, inputCost: 0.14, outputCost: 0.28, capabilities: ["text", "reasoning"], isDefault: false, isActive: true }
    ]
  }
];

const sampleAgents: Agent[] = [
  { id: "sm-001", name: "Content Strategist", vertical: "Social Media", romaLevel: "L2", systemPrompt: "You are an expert social media content strategist...", model: "claude-sonnet-4", isActive: true, taskCount: 1250 },
  { id: "sm-002", name: "Viral Content Creator", vertical: "Social Media", romaLevel: "L1", systemPrompt: "You are a creative content specialist...", model: "gpt-5.2", isActive: true, taskCount: 890 },
  { id: "seo-001", name: "SEO Director", vertical: "SEO/GEO", romaLevel: "L4", systemPrompt: "You are an SEO director overseeing all optimization...", model: "claude-opus-4", isActive: true, taskCount: 456 },
  { id: "seo-002", name: "Keyword Researcher", vertical: "SEO/GEO", romaLevel: "L1", systemPrompt: "You are a keyword research specialist...", model: "gemini-2.5-flash", isActive: true, taskCount: 2100 },
  { id: "ads-001", name: "Performance Director", vertical: "Performance Ads", romaLevel: "L4", systemPrompt: "You are a performance advertising director...", model: "gpt-5.2-pro", isActive: true, taskCount: 678 },
  { id: "sales-001", name: "Lead Scoring Expert", vertical: "Sales/SDR", romaLevel: "L2", systemPrompt: "You are a lead scoring and qualification expert...", model: "claude-sonnet-4", isActive: true, taskCount: 1890 },
  { id: "wa-001", name: "WhatsApp Automation", vertical: "WhatsApp", romaLevel: "L3", systemPrompt: "You are a WhatsApp automation specialist...", model: "kimi-k2.5", isActive: true, taskCount: 3400 },
  { id: "li-001", name: "LinkedIn Strategist", vertical: "LinkedIn B2B", romaLevel: "L2", systemPrompt: "You are a LinkedIn B2B marketing strategist...", model: "claude-sonnet-4", isActive: true, taskCount: 567 }
];

export default function AdminLLMSettings() {
  const [activeTab, setActiveTab] = useState<"providers" | "agents" | "routing">("providers");
  const [expandedProvider, setExpandedProvider] = useState<string | null>("openai");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [agents, setAgents] = useState(sampleAgents);
  const [showAddAgent, setShowAddAgent] = useState(false);

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.vertical.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const verticals = ["All", "Social Media", "SEO/GEO", "Performance Ads", "Sales/SDR", "WhatsApp", "LinkedIn B2B", "Telegram"];
  const [selectedVertical, setSelectedVertical] = useState("All");

  const displayedAgents = selectedVertical === "All" 
    ? filteredAgents 
    : filteredAgents.filter(a => a.vertical === selectedVertical);

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-purple-600" />
            Admin: LLM & Agent Configuration
          </h1>
          <p className="text-gray-500 mt-1">
            Configure AI models, system prompts, and agent behaviors
          </p>
        </div>

        <div className="flex gap-2 mb-6 border-b">
          {[
            { id: "providers", label: "LLM Providers", icon: Cpu },
            { id: "agents", label: "Marketing Agents", icon: Bot },
            { id: "routing", label: "Intelligent Routing", icon: Zap }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "text-purple-600 border-purple-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "providers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm">
                  <Check className="h-4 w-4" />
                  24 Providers Configured
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">
                  <Layers className="h-4 w-4" />
                  886+ Models Available
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <Plus className="h-4 w-4" />
                Add Provider
              </button>
            </div>

            {providers.map(provider => (
              <div key={provider.id} className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  onClick={() => setExpandedProvider(expandedProvider === provider.id ? null : provider.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      provider.tier.includes("Premium") ? "bg-purple-100" :
                      provider.tier.includes("Cost") ? "bg-blue-100" :
                      "bg-green-100"
                    }`}>
                      <Brain className={`h-5 w-5 ${
                        provider.tier.includes("Premium") ? "text-purple-600" :
                        provider.tier.includes("Cost") ? "text-blue-600" :
                        "text-green-600"
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{provider.name}</h3>
                      <p className="text-sm text-gray-500">{provider.tier} • {provider.modelCount} models</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {provider.apiKeyConfigured ? (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <Check className="h-4 w-4" />
                        API Key Configured
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-amber-600">
                        <AlertTriangle className="h-4 w-4" />
                        Needs API Key
                      </span>
                    )}
                    {expandedProvider === provider.id ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {expandedProvider === provider.id && (
                  <div className="border-t p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500">
                          <th className="pb-2 font-medium">Model</th>
                          <th className="pb-2 font-medium">Context</th>
                          <th className="pb-2 font-medium">Input Cost</th>
                          <th className="pb-2 font-medium">Output Cost</th>
                          <th className="pb-2 font-medium">Capabilities</th>
                          <th className="pb-2 font-medium">Status</th>
                          <th className="pb-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {provider.models.map(model => (
                          <tr key={model.id} className="border-t">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-white">{model.name}</span>
                                {model.isDefault && (
                                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">Default</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 text-gray-600 dark:text-gray-400">
                              {(model.contextWindow / 1000).toFixed(0)}K
                            </td>
                            <td className="py-3 text-gray-600 dark:text-gray-400">
                              ${model.inputCost}/1M
                            </td>
                            <td className="py-3 text-gray-600 dark:text-gray-400">
                              ${model.outputCost}/1M
                            </td>
                            <td className="py-3">
                              <div className="flex gap-1 flex-wrap">
                                {model.capabilities.slice(0, 3).map(cap => (
                                  <span key={cap} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                                    {cap}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                model.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                              }`}>
                                {model.isActive ? "Active" : "Disabled"}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                  <Edit2 className="h-4 w-4 text-gray-400" />
                                </button>
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                  <Target className="h-4 w-4 text-gray-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4 mt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">Cost Optimization Strategy</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    The platform uses <strong>Kimi K2.5</strong> and <strong>OpenRouter free models</strong> for routine tasks, achieving 90% cost reduction.
                    Premium models (GPT-5.2, Claude 4) are used only for complex reasoning and high-stakes content.
                  </p>
                  <div className="flex gap-4 mt-3">
                    <div className="text-sm">
                      <span className="text-blue-600 font-medium">Avg. Cost/Request:</span>
                      <span className="ml-1 text-blue-800 dark:text-blue-200">₹0.08</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-blue-600 font-medium">Monthly Savings:</span>
                      <span className="ml-1 text-green-600 font-medium">₹45,000+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "agents" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedVertical}
                  onChange={(e) => setSelectedVertical(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {verticals.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowAddAgent(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
                Add Agent
              </button>
            </div>

            <div className="grid gap-4">
              {displayedAgents.map(agent => (
                <div key={agent.id} className="bg-white dark:bg-gray-800 rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {agent.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                            ROMA {agent.romaLevel}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            agent.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          }`}>
                            {agent.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {agent.vertical} • Model: {agent.model} • {agent.taskCount.toLocaleString()} tasks completed
                        </p>
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-xs text-gray-600 dark:text-gray-400 font-mono">
                          {agent.systemPrompt.substring(0, 100)}...
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Edit2 className="h-4 w-4 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Copy className="h-4 w-4 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
              <h3 className="font-medium text-purple-900 dark:text-purple-100 flex items-center gap-2">
                <Bot className="h-5 w-5" />
                22-Point Enterprise Agent Framework
              </h3>
              <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
                {[
                  "Autonomous Execution", "Guardrails", "Self-Learning", "Capability Awareness",
                  "Collaboration", "Parallel Execution", "Swarm Coordination", "LLM Intelligence",
                  "Context Engineering", "Multimodal Processing", "Hierarchy", "Multi-Language",
                  "Behavioral Intelligence", "Cost Optimization", "Memory", "Tools",
                  "Error Recovery", "Monitoring", "Security", "Audit Logging",
                  "Version Control", "Continuous Learning"
                ].map(feature => (
                  <div key={feature} className="flex items-center gap-1 text-purple-700 dark:text-purple-300">
                    <Check className="h-3 w-3" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "routing" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-amber-500" />
                Intelligent Model Router Configuration
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Task-Based Routing</h3>
                  <div className="space-y-2">
                    {[
                      { task: "Complex Reasoning", model: "gpt-5.2-pro / claude-opus-4", priority: "Quality" },
                      { task: "Content Generation", model: "claude-sonnet-4 / gpt-5.2", priority: "Balanced" },
                      { task: "Quick Responses", model: "gemini-2.5-flash / kimi-k2.5", priority: "Speed" },
                      { task: "Bulk Processing", model: "kimi-k2.5 / openrouter-llama", priority: "Cost" },
                      { task: "Indian Languages", model: "sarvam-m / kimi-k2.5", priority: "Specialized" },
                      { task: "Code Generation", model: "claude-sonnet-4 / gpt-5.2-codex", priority: "Quality" }
                    ].map(route => (
                      <div key={route.task} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{route.task}</p>
                          <p className="text-xs text-gray-500">{route.model}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          route.priority === "Quality" ? "bg-purple-100 text-purple-700" :
                          route.priority === "Speed" ? "bg-blue-100 text-blue-700" :
                          route.priority === "Cost" ? "bg-green-100 text-green-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {route.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Fallback Chain</h3>
                  <div className="space-y-2">
                    {[
                      { level: 1, action: "Primary Model", desc: "Use assigned model for task" },
                      { level: 2, action: "Same-Tier Fallback", desc: "Switch to equivalent model in same tier" },
                      { level: 3, action: "Cross-Tier Fallback", desc: "Use best available in lower tier" },
                      { level: 4, action: "OpenRouter Gateway", desc: "Route through OpenRouter for reliability" },
                      { level: 5, action: "Queue & Retry", desc: "Queue request and retry with exponential backoff" }
                    ].map(level => (
                      <div key={level.level} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 font-bold text-sm">
                          {level.level}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{level.action}</p>
                          <p className="text-xs text-gray-500">{level.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Routing Accuracy</span>
                  <span className="text-lg font-bold text-green-600">98.7%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: "98.7%" }}></div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Cost Efficiency</span>
                  <span className="text-lg font-bold text-blue-600">90%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "90%" }}></div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Fallback Rate</span>
                  <span className="text-lg font-bold text-amber-600">2.1%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "2.1%" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
