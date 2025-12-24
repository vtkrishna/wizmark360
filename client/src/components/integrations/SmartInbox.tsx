import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Mail,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Send,
  Sparkles,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Phone,
  Search,
  Filter,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Tag,
  UserPlus,
  Archive,
} from "lucide-react";

interface InboxConversation {
  id: number;
  channel: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  subject?: string;
  status: string;
  priority: string;
  sentiment?: string;
  assigneeName?: string;
  unreadCount: number;
  messageCount: number;
  lastMessageAt?: string;
  slaDeadline?: string;
  slaBreached: boolean;
}

interface InboxMessage {
  id: number;
  conversationId: number;
  direction: string;
  senderName?: string;
  content: string;
  contentType: string;
  isRead: boolean;
  aiSuggestion?: string;
  sentAt: string;
}

interface ConversationsResult {
  conversations: InboxConversation[];
  total: number;
}

const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram_dm: Instagram,
  facebook_messenger: Facebook,
  linkedin_dm: Linkedin,
  twitter_dm: Twitter,
  email: Mail,
  whatsapp: MessageSquare,
  sms: Phone,
};

const priorityColors: Record<string, string> = {
  low: "bg-slate-500/20 text-slate-300",
  medium: "bg-blue-500/20 text-blue-300",
  high: "bg-orange-500/20 text-orange-300",
  urgent: "bg-red-500/20 text-red-300",
};

const sentimentColors: Record<string, string> = {
  positive: "text-green-400",
  neutral: "text-slate-400",
  negative: "text-red-400",
  mixed: "text-yellow-400",
};

export function SmartInbox({ brandId = 1 }: { brandId?: number }) {
  const [selectedConversation, setSelectedConversation] = useState<InboxConversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<{ status?: string; priority?: string; channel?: string }>({});
  const [replyText, setReplyText] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const queryClient = useQueryClient();

  const { data: conversationsData, isLoading: loadingConversations } = useQuery<ConversationsResult>({
    queryKey: ["inbox-conversations", brandId, filter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({ brandId: String(brandId) });
      if (filter.status) params.append("status", filter.status);
      if (filter.priority) params.append("priority", filter.priority);
      if (filter.channel) params.append("channel", filter.channel);
      if (searchQuery) params.append("search", searchQuery);
      
      const res = await fetch(`/api/integrations/inbox/conversations?${params}`);
      if (!res.ok) return { conversations: [], total: 0 };
      return res.json();
    },
  });

  const { data: messages, isLoading: loadingMessages } = useQuery<InboxMessage[]>({
    queryKey: ["inbox-messages", selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const res = await fetch(`/api/integrations/inbox/conversations/${selectedConversation.id}/messages`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedConversation,
  });

  const { data: inboxStats } = useQuery({
    queryKey: ["inbox-stats", brandId],
    queryFn: async () => {
      const res = await fetch(`/api/integrations/inbox/stats?brandId=${brandId}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const sendReplyMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: number; content: string }) => {
      const res = await fetch(`/api/integrations/inbox/conversations/${conversationId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, senderName: "Agent" }),
      });
      if (!res.ok) throw new Error("Failed to send reply");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox-messages", selectedConversation?.id] });
      setReplyText("");
    },
  });

  const generateAISuggestion = async () => {
    if (!selectedConversation) return;
    setIsGeneratingAI(true);
    try {
      const res = await fetch(`/api/integrations/inbox/conversations/${selectedConversation.id}/ai-suggestion`);
      if (res.ok) {
        const data = await res.json();
        setReplyText(data.suggestion);
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const markAsRead = async (conversationId: number) => {
    await fetch(`/api/integrations/inbox/conversations/${conversationId}/mark-read`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["inbox-conversations"] });
  };

  const conversations = conversationsData?.conversations || [];

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleSelectConversation = (conv: InboxConversation) => {
    setSelectedConversation(conv);
    if (conv.unreadCount > 0) {
      markAsRead(conv.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="flex h-screen">
        <div className="w-80 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Smart Inbox
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700"
              />
            </div>
          </div>

          <div className="p-2 border-b border-slate-700 flex gap-2 overflow-x-auto">
            <Button
              size="sm"
              variant={!filter.status ? "default" : "outline"}
              onClick={() => setFilter({})}
              className="border-slate-600 whitespace-nowrap"
            >
              All ({conversationsData?.total || 0})
            </Button>
            <Button
              size="sm"
              variant={filter.status === "open" ? "default" : "outline"}
              onClick={() => setFilter({ status: "open" })}
              className="border-slate-600 whitespace-nowrap"
            >
              Open ({inboxStats?.openConversations || 0})
            </Button>
            <Button
              size="sm"
              variant={filter.priority === "urgent" ? "default" : "outline"}
              onClick={() => setFilter({ priority: "urgent" })}
              className="border-red-600 text-red-300 whitespace-nowrap"
            >
              Urgent
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map((conv) => {
                const ChannelIcon = channelIcons[conv.channel] || MessageSquare;
                const isSelected = selectedConversation?.id === conv.id;
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      isSelected
                        ? "bg-blue-500/20 border border-blue-500/50"
                        : "bg-slate-800/30 hover:bg-slate-700/50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {conv.contactName?.split(" ").map(n => n[0]).join("") || <User className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm truncate">
                            {conv.contactName || "Unknown"}
                          </span>
                          <span className="text-xs text-slate-400 flex-shrink-0">
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <ChannelIcon className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-400 truncate">
                            {conv.subject || "No subject"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {conv.unreadCount > 0 && (
                            <Badge className="bg-blue-500 text-white text-xs px-1.5">
                              {conv.unreadCount}
                            </Badge>
                          )}
                          {conv.slaBreached && (
                            <AlertTriangle className="h-3 w-3 text-red-400" />
                          )}
                          <Badge className={`${priorityColors[conv.priority]} text-xs`}>
                            {conv.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
              {conversations.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  No conversations found
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-slate-700 bg-slate-800/30">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{inboxStats?.avgResponseTime?.toFixed(0) || 0}m</div>
                <div className="text-xs text-slate-400">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{inboxStats?.slaBreachCount || 0}</div>
                <div className="text-xs text-slate-400">SLA Breaches</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800/30">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-lg font-medium">
                    {selectedConversation.contactName?.split(" ").map(n => n[0]).join("") || <User className="h-6 w-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{selectedConversation.contactName || "Unknown"}</span>
                      {selectedConversation.sentiment && (
                        <span className={`text-sm ${sentimentColors[selectedConversation.sentiment]}`}>
                          {selectedConversation.sentiment === "positive" && "😊"}
                          {selectedConversation.sentiment === "negative" && "😞"}
                          {selectedConversation.sentiment === "neutral" && "😐"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      {selectedConversation.contactEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {selectedConversation.contactEmail}
                        </span>
                      )}
                      {selectedConversation.contactPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {selectedConversation.contactPhone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={priorityColors[selectedConversation.priority]}>
                    {selectedConversation.priority}
                  </Badge>
                  <Button size="sm" variant="outline" className="border-slate-600">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Assign
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-600">
                    <Tag className="h-4 w-4 mr-1" />
                    Tag
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-600">
                    <Archive className="h-4 w-4 mr-1" />
                    Close
                  </Button>
                  <Button size="icon" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selectedConversation.slaBreached && (
                <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/30 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-300">SLA Breached - Response required immediately</span>
                </div>
              )}

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-3xl mx-auto">
                  {messages?.map((message) => {
                    const isOutbound = message.direction === "outbound";
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl p-4 ${
                            isOutbound
                              ? "bg-blue-600 text-white"
                              : "bg-slate-700 text-white"
                          }`}
                        >
                          <div className="text-sm mb-1">{message.content}</div>
                          <div className={`text-xs ${isOutbound ? "text-blue-200" : "text-slate-400"}`}>
                            {message.senderName} • {formatTime(message.sentAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(!messages || messages.length === 0) && (
                    <div className="text-center py-12 text-slate-400">
                      No messages in this conversation yet
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-slate-700 bg-slate-800/30">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={generateAISuggestion}
                      disabled={isGeneratingAI}
                      className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
                    >
                      {isGeneratingAI ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-1" />
                      )}
                      AI Suggestion
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-600">
                      Quick Replies
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="bg-slate-800 border-slate-700 min-h-[80px] resize-none"
                    />
                    <Button
                      onClick={() => {
                        if (selectedConversation && replyText.trim()) {
                          sendReplyMutation.mutate({
                            conversationId: selectedConversation.id,
                            content: replyText,
                          });
                        }
                      }}
                      disabled={!replyText.trim() || sendReplyMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 px-6"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-400 mb-2">No Conversation Selected</h3>
                <p className="text-slate-500">Select a conversation from the list to start replying</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-72 border-l border-slate-700 p-4 bg-slate-800/20">
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          
          <div className="space-y-4">
            <Card className="bg-slate-700/30 border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Open</span>
                  <span className="text-lg font-bold text-blue-400">{inboxStats?.openConversations || 0}</span>
                </div>
                <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, ((inboxStats?.openConversations || 0) / Math.max(1, inboxStats?.totalConversations || 1)) * 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-700/30 border-slate-600">
              <CardContent className="p-4">
                <div className="text-sm text-slate-400 mb-2">By Channel</div>
                <div className="space-y-2">
                  {Object.entries(inboxStats?.byChannel || {}).map(([channel, count]) => {
                    const Icon = channelIcons[channel] || MessageSquare;
                    return (
                      <div key={channel} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-slate-400" />
                          {channel.replace("_", " ")}
                        </span>
                        <span>{count as number}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-700/30 border-slate-600">
              <CardContent className="p-4">
                <div className="text-sm text-slate-400 mb-2">Response Time</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-green-400">
                    {inboxStats?.avgResponseTime?.toFixed(0) || 0}
                  </span>
                  <span className="text-slate-400">min avg</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-700/30 border-slate-600">
              <CardContent className="p-4">
                <div className="text-sm text-slate-400 mb-2">Sentiment</div>
                <div className="space-y-2">
                  {Object.entries(inboxStats?.bySentiment || {}).map(([sentiment, count]) => (
                    <div key={sentiment} className="flex items-center justify-between text-sm">
                      <span className={`capitalize ${sentimentColors[sentiment]}`}>{sentiment}</span>
                      <span>{count as number}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartInbox;
