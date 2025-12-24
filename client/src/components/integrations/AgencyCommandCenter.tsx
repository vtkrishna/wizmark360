import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  Mail,
  MessageSquare,
  Share2,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  ArrowUpRight,
  BarChart3,
  Target,
  Zap,
  Link,
  Instagram,
  Facebook,
  Linkedin,
  Settings,
  RefreshCw,
} from "lucide-react";

interface CRMStats {
  totalContacts: number;
  totalDeals: number;
  totalActivities: number;
  pipelineValue: number;
  avgLeadScore: number;
  lastSyncAt?: string;
  syncStatus: string;
}

interface SocialStats {
  totalPosts: number;
  published: number;
  scheduled: number;
  drafts: number;
  pendingApproval: number;
  totalEngagement: {
    likes: number;
    comments: number;
    shares: number;
  };
}

interface InboxStats {
  totalConversations: number;
  openConversations: number;
  unreadCount: number;
  avgResponseTime: number;
  slaBreachCount: number;
  byChannel: Record<string, number>;
  bySentiment: Record<string, number>;
}

export function AgencyCommandCenter({ brandId = 1 }: { brandId?: number }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: crmStats } = useQuery<CRMStats>({
    queryKey: ["crm-stats", brandId],
    queryFn: async () => {
      const res = await fetch(`/api/integrations/crm/connections/1/stats`);
      if (!res.ok) return { totalContacts: 0, totalDeals: 0, totalActivities: 0, pipelineValue: 0, avgLeadScore: 0, syncStatus: "idle" };
      return res.json();
    },
  });

  const { data: socialStats } = useQuery<SocialStats>({
    queryKey: ["social-stats", brandId],
    queryFn: async () => {
      const res = await fetch(`/api/integrations/social/stats?brandId=${brandId}`);
      if (!res.ok) return { totalPosts: 0, published: 0, scheduled: 0, drafts: 0, pendingApproval: 0, totalEngagement: { likes: 0, comments: 0, shares: 0 } };
      return res.json();
    },
  });

  const { data: inboxStats } = useQuery<InboxStats>({
    queryKey: ["inbox-stats", brandId],
    queryFn: async () => {
      const res = await fetch(`/api/integrations/inbox/stats?brandId=${brandId}`);
      if (!res.ok) return { totalConversations: 0, openConversations: 0, unreadCount: 0, avgResponseTime: 0, slaBreachCount: 0, byChannel: {}, bySentiment: {} };
      return res.json();
    },
  });

  const quickStats = [
    {
      title: "Total Contacts",
      value: crmStats?.totalContacts || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      change: "+12%",
    },
    {
      title: "Pipeline Value",
      value: `$${((crmStats?.pipelineValue || 0) / 1000).toFixed(1)}K`,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      change: "+8%",
    },
    {
      title: "Open Conversations",
      value: inboxStats?.openConversations || 0,
      icon: MessageSquare,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      change: inboxStats?.unreadCount ? `${inboxStats.unreadCount} unread` : "All caught up",
    },
    {
      title: "Scheduled Posts",
      value: socialStats?.scheduled || 0,
      icon: Calendar,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      change: `${socialStats?.pendingApproval || 0} pending`,
    },
  ];

  const integrationStatus = [
    { name: "HubSpot CRM", status: "connected", icon: Link, lastSync: "5 min ago" },
    { name: "Instagram", status: "connected", icon: Instagram, lastSync: "2 min ago" },
    { name: "Facebook", status: "connected", icon: Facebook, lastSync: "2 min ago" },
    { name: "LinkedIn", status: "connected", icon: Linkedin, lastSync: "10 min ago" },
    { name: "Smart Inbox", status: "active", icon: Mail, lastSync: "Live" },
  ];

  const urgentActions = [
    inboxStats?.slaBreachCount && inboxStats.slaBreachCount > 0
      ? { type: "warning", message: `${inboxStats.slaBreachCount} SLA breaches need attention`, action: "View" }
      : null,
    socialStats?.pendingApproval && socialStats.pendingApproval > 0
      ? { type: "info", message: `${socialStats.pendingApproval} posts pending approval`, action: "Review" }
      : null,
    inboxStats?.unreadCount && inboxStats.unreadCount > 0
      ? { type: "info", message: `${inboxStats.unreadCount} unread messages`, action: "Open Inbox" }
      : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Agency Command Center
            </h1>
            <p className="text-slate-400 mt-1">Unified control for all your marketing operations</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search contacts, posts, conversations... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80 bg-slate-800/50 border-slate-700 focus:border-blue-500"
              />
            </div>
            <Button variant="outline" size="icon" className="border-slate-700">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat) => (
            <Card key={stat.title} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span className="text-sm text-slate-400">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {urgentActions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Action Required
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {urgentActions.map((action, i) => (
                <Card key={i} className={`${action?.type === "warning" ? "bg-red-500/10 border-red-500/30" : "bg-blue-500/10 border-blue-500/30"} border`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {action?.type === "warning" ? (
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      ) : (
                        <Clock className="h-5 w-5 text-blue-400" />
                      )}
                      <span className="text-sm">{action?.message}</span>
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs">
                      {action?.action}
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">Overview</TabsTrigger>
            <TabsTrigger value="crm" className="data-[state=active]:bg-slate-700">CRM</TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-slate-700">Social</TabsTrigger>
            <TabsTrigger value="inbox" className="data-[state=active]:bg-slate-700">Inbox</TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-slate-700">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <div className="text-3xl font-bold text-blue-400">{crmStats?.avgLeadScore?.toFixed(0) || 0}</div>
                      <div className="text-sm text-slate-400 mt-1">Avg Lead Score</div>
                    </div>
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <div className="text-3xl font-bold text-green-400">{socialStats?.totalEngagement?.likes || 0}</div>
                      <div className="text-sm text-slate-400 mt-1">Total Likes</div>
                    </div>
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <div className="text-3xl font-bold text-purple-400">{inboxStats?.avgResponseTime?.toFixed(0) || 0}m</div>
                      <div className="text-sm text-slate-400 mt-1">Avg Response</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-400" />
                    Today's Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Respond to all messages</span>
                    <Badge variant={inboxStats?.unreadCount === 0 ? "default" : "secondary"} className="bg-slate-700">
                      {inboxStats?.unreadCount === 0 ? <CheckCircle className="h-3 w-3" /> : `${inboxStats?.unreadCount} left`}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Publish 3 posts</span>
                    <Badge variant="secondary" className="bg-slate-700">{socialStats?.published || 0}/3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Follow up leads</span>
                    <Badge variant="secondary" className="bg-slate-700">{crmStats?.totalActivities || 0} done</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-orange-400" />
                    Content Calendar
                  </CardTitle>
                  <Button size="sm" variant="outline" className="border-slate-600">
                    <Plus className="h-4 w-4 mr-1" />
                    New Post
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Instagram className="h-5 w-5 text-pink-400" />
                        <div>
                          <div className="text-sm font-medium">Product Launch Teaser</div>
                          <div className="text-xs text-slate-400">Scheduled for 2:00 PM</div>
                        </div>
                      </div>
                      <Badge className="bg-orange-500/20 text-orange-300">Pending</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Linkedin className="h-5 w-5 text-blue-400" />
                        <div>
                          <div className="text-sm font-medium">Industry Insights Article</div>
                          <div className="text-xs text-slate-400">Tomorrow 10:00 AM</div>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300">Approved</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Facebook className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="text-sm font-medium">Customer Success Story</div>
                          <div className="text-xs text-slate-400">Dec 26, 9:00 AM</div>
                        </div>
                      </div>
                      <Badge className="bg-slate-500/20 text-slate-300">Draft</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-400" />
                    Recent Conversations
                  </CardTitle>
                  <Button size="sm" variant="outline" className="border-slate-600">
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                      {[
                        { name: "Sarah Johnson", message: "I'm interested in the premium plan...", time: "2m ago", unread: true },
                        { name: "Mike Chen", message: "Thanks for the quick response!", time: "15m ago", unread: false },
                        { name: "Emily Davis", message: "Can you send me pricing details?", time: "1h ago", unread: true },
                        { name: "John Smith", message: "The demo was great, let's schedule...", time: "2h ago", unread: false },
                      ].map((conv, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 cursor-pointer">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-medium">
                            {conv.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{conv.name}</span>
                              <span className="text-xs text-slate-400">{conv.time}</span>
                            </div>
                            <p className="text-xs text-slate-400 truncate">{conv.message}</p>
                          </div>
                          {conv.unread && <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="crm">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>CRM Overview</CardTitle>
                <CardDescription>Manage your contacts, deals, and sales pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-6 bg-slate-700/30 rounded-xl">
                    <Users className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold">{crmStats?.totalContacts || 0}</div>
                    <div className="text-sm text-slate-400">Total Contacts</div>
                  </div>
                  <div className="text-center p-6 bg-slate-700/30 rounded-xl">
                    <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold">{crmStats?.totalDeals || 0}</div>
                    <div className="text-sm text-slate-400">Active Deals</div>
                  </div>
                  <div className="text-center p-6 bg-slate-700/30 rounded-xl">
                    <Target className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold">${((crmStats?.pipelineValue || 0) / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-slate-400">Pipeline Value</div>
                  </div>
                  <div className="text-center p-6 bg-slate-700/30 rounded-xl">
                    <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold">{crmStats?.avgLeadScore?.toFixed(0) || 0}</div>
                    <div className="text-sm text-slate-400">Avg Lead Score</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                  <Button variant="outline" className="border-slate-600">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync HubSpot
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Social Publishing</CardTitle>
                <CardDescription>Manage your content calendar and social posts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-6 bg-slate-700/30 rounded-xl">
                    <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold">{socialStats?.totalPosts || 0}</div>
                    <div className="text-sm text-slate-400">Total Posts</div>
                  </div>
                  <div className="text-center p-6 bg-slate-700/30 rounded-xl">
                    <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold">{socialStats?.published || 0}</div>
                    <div className="text-sm text-slate-400">Published</div>
                  </div>
                  <div className="text-center p-6 bg-slate-700/30 rounded-xl">
                    <Clock className="h-8 w-8 text-orange-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold">{socialStats?.scheduled || 0}</div>
                    <div className="text-sm text-slate-400">Scheduled</div>
                  </div>
                  <div className="text-center p-6 bg-slate-700/30 rounded-xl">
                    <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold">{socialStats?.totalEngagement?.likes || 0}</div>
                    <div className="text-sm text-slate-400">Total Engagement</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                  <Button variant="outline" className="border-slate-600">
                    <Zap className="h-4 w-4 mr-2" />
                    Generate with AI
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inbox">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Smart Inbox</CardTitle>
                <CardDescription>Unified messaging across all channels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-6 bg-slate-700/30 rounded-xl">
                    <MessageSquare className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold">{inboxStats?.totalConversations || 0}</div>
                    <div className="text-sm text-slate-400">Total Conversations</div>
                  </div>
                  <div className="text-center p-6 bg-slate-700/30 rounded-xl">
                    <Mail className="h-8 w-8 text-orange-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold">{inboxStats?.openConversations || 0}</div>
                    <div className="text-sm text-slate-400">Open</div>
                  </div>
                  <div className="text-center p-6 bg-slate-700/30 rounded-xl">
                    <Clock className="h-8 w-8 text-green-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold">{inboxStats?.avgResponseTime?.toFixed(0) || 0}m</div>
                    <div className="text-sm text-slate-400">Avg Response</div>
                  </div>
                  <div className="text-center p-6 bg-slate-700/30 rounded-xl">
                    <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold">{inboxStats?.slaBreachCount || 0}</div>
                    <div className="text-sm text-slate-400">SLA Breaches</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Open Inbox
                  </Button>
                  <Button variant="outline" className="border-slate-600">
                    <Settings className="h-4 w-4 mr-2" />
                    SLA Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Connected Integrations</CardTitle>
                <CardDescription>Manage your connected platforms and services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {integrationStatus.map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-600/30 rounded-lg">
                          <integration.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="font-medium">{integration.name}</div>
                          <div className="text-sm text-slate-400">Last sync: {integration.lastSync}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={integration.status === "connected" || integration.status === "active" ? "bg-green-500/20 text-green-300" : "bg-slate-500/20"}>
                          {integration.status}
                        </Badge>
                        <Button size="sm" variant="outline" className="border-slate-600">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button variant="outline" className="border-slate-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Integration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AgencyCommandCenter;
