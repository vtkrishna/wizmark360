import { useState, useRef, useEffect } from "react";
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
  Globe,
  Target,
  MessageCircle,
  TrendingUp,
  Megaphone,
  AlertCircle,
  Loader2
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
}

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  prompt: string;
  color: string;
  vertical: string;
}

interface ChatWorkspaceProps {
  vertical?: string;
  brandId?: number;
  brandContext?: Record<string, any>;
}

const quickActions: QuickAction[] = [
  { id: "social", label: "Create social post", icon: Megaphone, prompt: "Create an engaging Instagram post for our upcoming Diwali sale campaign with relevant hashtags", color: "bg-pink-50 text-pink-600 border-pink-200", vertical: "social" },
  { id: "seo", label: "SEO analysis", icon: Globe, prompt: "Analyze our website's SEO performance and suggest improvements for ranking higher on Google", color: "bg-green-50 text-green-600 border-green-200", vertical: "seo" },
  { id: "leads", label: "Score leads", icon: Target, prompt: "Score and prioritize my latest leads from the LinkedIn campaign based on engagement and profile data", color: "bg-orange-50 text-orange-600 border-orange-200", vertical: "sales" },
  { id: "whatsapp", label: "WhatsApp template", icon: MessageCircle, prompt: "Create a WhatsApp Business message template for order confirmation with tracking details", color: "bg-emerald-50 text-emerald-600 border-emerald-200", vertical: "whatsapp" },
  { id: "analytics", label: "Performance report", icon: TrendingUp, prompt: "Generate a weekly performance report for all our marketing campaigns with key metrics and insights", color: "bg-purple-50 text-purple-600 border-purple-200", vertical: "performance" },
];

export default function ChatWorkspace({ vertical = "general", brandId = 1, brandContext }: ChatWorkspaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your Chief of Staff AI. I can help you manage campaigns, generate content, analyze performance, and orchestrate your 267 marketing agents across 7 verticals.\n\nWhat would you like to work on today?",
      timestamp: new Date(),
      agentName: "Chief of Staff",
      model: "GPT-4"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: currentInput,
          brandId,
          vertical,
          conversationId,
          context: brandContext
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!conversationId && data.metadata?.conversationId) {
        setConversationId(data.metadata.conversationId);
      }

      const assistantMessage: Message = {
        id: data.id || (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        agentName: data.agentName || "Chief of Staff",
        model: data.model || "AI",
        provider: data.provider
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I apologize, but I encountered an issue processing your request. ${error.message || "Please try again."}`,
        timestamp: new Date(),
        agentName: "System",
        error: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    setInput(action.prompt);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const regenerateResponse = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex <= 0) return;

    const previousUserMessage = messages.slice(0, messageIndex).reverse().find(m => m.role === "user");
    if (previousUserMessage) {
      setMessages(prev => prev.filter(m => m.id !== messageId));
      setInput(previousUserMessage.content);
      setTimeout(() => sendMessage(), 100);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-4 ${message.role === "user" ? "justify-end" : ""}`}>
              {message.role === "assistant" && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.error 
                    ? "bg-red-100" 
                    : "bg-gradient-to-br from-blue-500 to-purple-600"
                }`}>
                  {message.error ? (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
              )}
              
              <div className={`flex-1 max-w-2xl ${message.role === "user" ? "flex justify-end" : ""}`}>
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{message.agentName}</span>
                    {message.model && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                        {message.model}
                      </span>
                    )}
                    {message.provider && (
                      <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        {message.provider}
                      </span>
                    )}
                  </div>
                )}
                
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === "user" 
                    ? "bg-blue-600 text-white" 
                    : message.error
                      ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                </div>

                {message.role === "assistant" && !message.error && (
                  <div className="flex items-center gap-1 mt-2">
                    <button 
                      onClick={() => copyToClipboard(message.content)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Good response">
                      <ThumbsUp className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Poor response">
                      <ThumbsDown className="w-4 h-4 text-gray-400" />
                    </button>
                    <button 
                      onClick={() => regenerateResponse(message.id)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Regenerate response"
                    >
                      <RotateCcw className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                )}
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-sm text-gray-500">Processing with AI agents...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {messages.length <= 1 && (
        <div className="max-w-3xl mx-auto px-4 pb-4">
          <p className="text-sm text-gray-500 mb-3">Quick actions</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors hover:shadow-sm ${action.color}`}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Paperclip className="w-5 h-5 text-gray-400" />
            </button>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask anything or describe what you need..."
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm py-2 disabled:opacity-50"
              style={{ minHeight: "24px", maxHeight: "120px" }}
            />

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">AI</span>
              </button>

              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          
          <p className="text-xs text-gray-400 text-center mt-2">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
