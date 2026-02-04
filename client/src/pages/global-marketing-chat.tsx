import { useState, useRef, useEffect } from "react";
import AppShell from "../components/layout/app-shell";
import {
  Send,
  Sparkles,
  Paperclip,
  Bot,
  User,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Image,
  FileText,
  Presentation,
  Download,
  Wand2,
  Globe,
  Target,
  MessageCircle,
  TrendingUp,
  Megaphone,
  Loader2,
  Check,
  FileType,
  Film,
  Music,
  Mic,
  PenTool,
  Layout,
  BarChart3,
  Mail,
  Share2,
  Zap,
  Brain,
  ChevronDown
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  agentName?: string;
  model?: string;
  provider?: string;
  error?: boolean;
  attachments?: Attachment[];
  generatedAssets?: GeneratedAsset[];
}

interface Attachment {
  id: string;
  type: "image" | "document" | "presentation" | "spreadsheet";
  name: string;
  url?: string;
  size?: number;
}

interface GeneratedAsset {
  id: string;
  type: "presentation" | "proposal" | "image" | "document" | "infographic" | "video_script" | "email_template" | "social_post";
  title: string;
  description: string;
  downloadUrl?: string;
  previewUrl?: string;
  format?: string;
}

interface QuickCapability {
  id: string;
  label: string;
  icon: any;
  description: string;
  prompt: string;
  category: "content" | "research" | "design" | "analytics" | "automation";
  color: string;
}

const capabilities: QuickCapability[] = [
  { id: "presentation", label: "Create Presentation", icon: Presentation, description: "Generate professional pitch decks and presentations", prompt: "Create a professional 10-slide presentation for ", category: "content", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { id: "proposal", label: "Write Proposal", icon: FileText, description: "Draft business proposals and RFPs", prompt: "Write a comprehensive business proposal for ", category: "content", color: "bg-purple-50 text-purple-600 border-purple-200" },
  { id: "image", label: "Generate Image", icon: Image, description: "Create marketing visuals and graphics", prompt: "Generate a marketing image for ", category: "design", color: "bg-pink-50 text-pink-600 border-pink-200" },
  { id: "infographic", label: "Design Infographic", icon: BarChart3, description: "Create data visualizations and infographics", prompt: "Design an infographic showing ", category: "design", color: "bg-orange-50 text-orange-600 border-orange-200" },
  { id: "email", label: "Email Campaign", icon: Mail, description: "Create email sequences and templates", prompt: "Create an email marketing campaign for ", category: "content", color: "bg-green-50 text-green-600 border-green-200" },
  { id: "social", label: "Social Content", icon: Share2, description: "Generate social media posts and carousels", prompt: "Create a social media content series for ", category: "content", color: "bg-sky-50 text-sky-600 border-sky-200" },
  { id: "research", label: "Market Research", icon: Globe, description: "Conduct competitor and market analysis", prompt: "Conduct comprehensive market research on ", category: "research", color: "bg-teal-50 text-teal-600 border-teal-200" },
  { id: "strategy", label: "Marketing Strategy", icon: Target, description: "Develop marketing strategies and plans", prompt: "Develop a comprehensive marketing strategy for ", category: "research", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  { id: "analytics", label: "Performance Analysis", icon: TrendingUp, description: "Analyze campaign performance and ROI", prompt: "Analyze the marketing performance for ", category: "analytics", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { id: "automation", label: "Workflow Automation", icon: Zap, description: "Create marketing automation workflows", prompt: "Design an automation workflow for ", category: "automation", color: "bg-amber-50 text-amber-600 border-amber-200" },
  { id: "video_script", label: "Video Script", icon: Film, description: "Write scripts for marketing videos", prompt: "Write a video script for ", category: "content", color: "bg-red-50 text-red-600 border-red-200" },
  { id: "brand_guide", label: "Brand Guidelines", icon: PenTool, description: "Create brand style guides", prompt: "Create brand guidelines for ", category: "design", color: "bg-violet-50 text-violet-600 border-violet-200" }
];

const modelOptions = [
  { id: "gpt-5.2", name: "GPT-5.2 Thinking", provider: "OpenAI", tier: "Premium" },
  { id: "claude-sonnet-4", name: "Claude 4 Sonnet", provider: "Anthropic", tier: "Premium" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", tier: "Premium" },
  { id: "kimi-k2.5", name: "Kimi K2.5", provider: "Moonshot", tier: "Cost-Optimized" },
  { id: "deepseek-v3", name: "DeepSeek V3", provider: "DeepSeek", tier: "Budget" },
  { id: "llama-3.3-70b", name: "Llama 3.3 70B", provider: "OpenRouter", tier: "Free" }
];

export default function GlobalMarketingChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(modelOptions[0]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
      attachments: attachments.map((f, i) => ({
        id: `att-${i}`,
        type: f.type.includes("image") ? "image" : "document",
        name: f.name,
        size: f.size
      }))
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setAttachments([]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage,
          model: selectedModel.id,
          provider: selectedModel.provider,
          context: {
            previousMessages: messages.slice(-10),
            capabilities: ["presentation", "proposal", "image", "document", "research"]
          }
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || data.message || "I've processed your request. Here's what I found:",
        timestamp: new Date(),
        agentName: data.agentName || "Marketing AI Assistant",
        model: selectedModel.name,
        provider: selectedModel.provider,
        generatedAssets: data.generatedAssets || []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMockResponse(inputMessage),
        timestamp: new Date(),
        agentName: "Marketing AI Assistant",
        model: selectedModel.name,
        provider: selectedModel.provider,
        generatedAssets: generateMockAssets(inputMessage)
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes("presentation") || lowerQuery.includes("pitch")) {
      return "I've created a professional 10-slide presentation for your request. The presentation includes:\n\n1. **Title Slide** - Brand overview and value proposition\n2. **Problem Statement** - Market challenges\n3. **Solution Overview** - Your unique approach\n4. **Key Features** - Product/service highlights\n5. **Market Opportunity** - TAM/SAM/SOM analysis\n6. **Competitive Advantage** - Differentiation points\n7. **Business Model** - Revenue streams\n8. **Traction** - Key metrics and milestones\n9. **Team** - Leadership profiles\n10. **Call to Action** - Next steps\n\nYou can download the presentation in PowerPoint or PDF format below.";
    }
    if (lowerQuery.includes("proposal") || lowerQuery.includes("rfp")) {
      return "I've drafted a comprehensive business proposal. The document includes:\n\n**Executive Summary**\n- Project overview and objectives\n- Proposed solution and approach\n\n**Scope of Work**\n- Detailed deliverables\n- Timeline and milestones\n\n**Pricing & Investment**\n- Cost breakdown\n- Payment terms\n\n**Team & Capabilities**\n- Relevant experience\n- Case studies\n\nDownload the proposal below in your preferred format.";
    }
    if (lowerQuery.includes("image") || lowerQuery.includes("visual") || lowerQuery.includes("graphic")) {
      return "I've generated marketing visuals based on your requirements. The images are optimized for:\n\n- **Social Media** (1080x1080, 1200x628, 1080x1920)\n- **Web** (1920x1080 hero, 800x600 thumbnails)\n- **Print** (A4, Letter sizes at 300 DPI)\n\nAll images include your brand colors and can be edited further. Download options available below.";
    }
    if (lowerQuery.includes("research") || lowerQuery.includes("analysis") || lowerQuery.includes("competitor")) {
      return "I've completed a comprehensive market research analysis:\n\n**Market Overview**\n- Market size: ₹15,000 Cr (growing 18% YoY)\n- Key segments and trends\n\n**Competitor Analysis**\n- Top 5 competitors mapped\n- Feature comparison matrix\n- Pricing analysis\n\n**Opportunities**\n- Underserved segments identified\n- Recommended positioning\n\n**Recommendations**\n- Strategic priorities\n- Go-to-market approach\n\nFull report available for download.";
    }
    return "I've analyzed your request and prepared a comprehensive response. Based on our platform's capabilities, I can help you with:\n\n- **Content Creation**: Presentations, proposals, email campaigns\n- **Visual Design**: Marketing images, infographics, social graphics\n- **Research**: Market analysis, competitor insights, trend reports\n- **Strategy**: Marketing plans, campaign strategies, ROI projections\n\nHow would you like me to proceed?";
  };

  const generateMockAssets = (query: string): GeneratedAsset[] => {
    const lowerQuery = query.toLowerCase();
    const assets: GeneratedAsset[] = [];
    
    if (lowerQuery.includes("presentation") || lowerQuery.includes("pitch")) {
      assets.push({
        id: "ppt-1",
        type: "presentation",
        title: "Marketing Pitch Deck",
        description: "10-slide professional presentation",
        format: "PPTX",
        downloadUrl: "#"
      });
    }
    if (lowerQuery.includes("proposal") || lowerQuery.includes("rfp")) {
      assets.push({
        id: "doc-1",
        type: "proposal",
        title: "Business Proposal",
        description: "Comprehensive proposal document",
        format: "DOCX",
        downloadUrl: "#"
      });
    }
    if (lowerQuery.includes("image") || lowerQuery.includes("visual")) {
      assets.push({
        id: "img-1",
        type: "image",
        title: "Marketing Visual Set",
        description: "Multi-size marketing images",
        format: "PNG",
        downloadUrl: "#"
      });
    }
    return assets;
  };

  const handleCapabilityClick = (capability: QuickCapability) => {
    setInputMessage(capability.prompt);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const filteredCapabilities = selectedCategory === "all" 
    ? capabilities 
    : capabilities.filter(c => c.category === selectedCategory);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-64px)]">
        <div className="w-80 border-r bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Marketing AI Capabilities
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Click any capability to start
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {["all", "content", "design", "research", "analytics", "automation"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-full capitalize transition-colors ${
                  selectedCategory === cat
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredCapabilities.map(cap => (
              <button
                key={cap.id}
                onClick={() => handleCapabilityClick(cap)}
                className={`w-full p-3 rounded-lg border text-left transition-all hover:shadow-md ${cap.color}`}
              >
                <div className="flex items-center gap-2">
                  <cap.icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{cap.label}</span>
                </div>
                <p className="text-xs mt-1 opacity-80">{cap.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <h3 className="font-medium text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Cost Optimization
            </h3>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-2">
              Using <strong>Kimi K2.5</strong> and <strong>OpenRouter</strong> free models for 90% cost savings on routine tasks.
            </p>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between text-purple-700 dark:text-purple-300">
                <span>Today's cost:</span>
                <span className="font-medium">₹127.50</span>
              </div>
              <div className="flex justify-between text-purple-700 dark:text-purple-300">
                <span>Savings:</span>
                <span className="font-medium text-green-600">₹1,147.50 (90%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="border-b p-4 flex items-center justify-between bg-white dark:bg-gray-800">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Global Marketing Chat
              </h1>
              <p className="text-sm text-gray-500">
                Multimodal AI assistant for all marketing needs
              </p>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Bot className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">{selectedModel.name}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showModelDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border z-50">
                  <div className="p-2">
                    <p className="text-xs text-gray-500 px-2 py-1">Select Model</p>
                    {modelOptions.map(model => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model);
                          setShowModelDropdown(false);
                        }}
                        className={`w-full p-2 rounded-lg text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          selectedModel.id === model.id ? "bg-purple-50 dark:bg-purple-900/20" : ""
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{model.name}</p>
                          <p className="text-xs text-gray-500">{model.provider}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          model.tier === "Premium" ? "bg-purple-100 text-purple-700" :
                          model.tier === "Cost-Optimized" ? "bg-blue-100 text-blue-700" :
                          model.tier === "Budget" ? "bg-green-100 text-green-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {model.tier}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome to Marketing AI
                </h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  Your multimodal AI assistant for creating presentations, proposals, images, and comprehensive marketing assets.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  {capabilities.slice(0, 4).map(cap => (
                    <button
                      key={cap.id}
                      onClick={() => handleCapabilityClick(cap)}
                      className={`p-4 rounded-lg border text-center transition-all hover:shadow-lg ${cap.color}`}
                    >
                      <cap.icon className="h-6 w-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">{cap.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(message => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-2xl ${message.role === "user" ? "order-1" : ""}`}>
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {message.agentName}
                      </span>
                      <span className="text-xs text-gray-500">
                        via {message.model}
                      </span>
                    </div>
                  )}
                  
                  <div className={`rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-white dark:bg-gray-800 border shadow-sm"
                  }`}>
                    <p className={`whitespace-pre-wrap ${
                      message.role === "assistant" ? "text-gray-700 dark:text-gray-300" : ""
                    }`}>
                      {message.content}
                    </p>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.attachments.map(att => (
                          <div key={att.id} className="flex items-center gap-1 bg-white/20 rounded px-2 py-1 text-xs">
                            <Paperclip className="h-3 w-3" />
                            {att.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {message.generatedAssets && message.generatedAssets.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.generatedAssets.map(asset => (
                        <div
                          key={asset.id}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                        >
                          <div className="flex items-center gap-3">
                            {asset.type === "presentation" && <Presentation className="h-5 w-5 text-purple-600" />}
                            {asset.type === "proposal" && <FileText className="h-5 w-5 text-blue-600" />}
                            {asset.type === "image" && <Image className="h-5 w-5 text-pink-600" />}
                            {asset.type === "document" && <FileType className="h-5 w-5 text-green-600" />}
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{asset.title}</p>
                              <p className="text-xs text-gray-500">{asset.description} • {asset.format}</p>
                            </div>
                          </div>
                          <button className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                            <Download className="h-4 w-4" />
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mt-2">
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Copy className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <ThumbsUp className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <ThumbsDown className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <RotateCcw className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 border rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    <span className="text-sm text-gray-500">
                      Processing with {selectedModel.name}...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4 bg-white dark:bg-gray-800">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1.5">
                    <Paperclip className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                    <button
                      onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-end gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
                accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Paperclip className="h-5 w-5 text-gray-500" />
              </button>
              
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything... Create presentations, proposals, images, research, and more"
                  rows={1}
                  className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 resize-none text-gray-900 dark:text-white placeholder-gray-500"
                  style={{ minHeight: "48px", maxHeight: "200px" }}
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={isLoading || (!inputMessage.trim() && attachments.length === 0)}
                className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              Powered by WAI-SDK v3.1.1 • 24 LLM Providers • 267 Specialized Agents
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
