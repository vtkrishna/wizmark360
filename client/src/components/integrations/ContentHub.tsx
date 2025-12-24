import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Plus,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Clock,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  Send,
  Eye,
  Sparkles,
  Image,
  Video,
  FileText,
  ArrowRight,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ContentCalendarItem {
  id: number;
  brandId: number;
  title: string;
  description?: string;
  contentType: string;
  platforms: string[];
  scheduledAt?: string;
  publishedAt?: string;
  status: string;
  priority: string;
  tags: string[];
  metadata?: Record<string, any>;
}

interface CalendarResult {
  items: ContentCalendarItem[];
  total: number;
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
};

const statusColors: Record<string, string> = {
  draft: "bg-slate-500/20 text-slate-300",
  pending_internal: "bg-yellow-500/20 text-yellow-300",
  pending_client: "bg-orange-500/20 text-orange-300",
  approved: "bg-green-500/20 text-green-300",
  rejected: "bg-red-500/20 text-red-300",
  scheduled: "bg-blue-500/20 text-blue-300",
  published: "bg-emerald-500/20 text-emerald-300",
  failed: "bg-red-500/20 text-red-300",
};

export function ContentHub({ brandId = 1 }: { brandId?: number }) {
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    platforms: [] as string[],
    contentType: "post",
  });
  const [aiGenerating, setAiGenerating] = useState(false);

  const queryClient = useQueryClient();

  const { data: calendarData, isLoading } = useQuery<CalendarResult>({
    queryKey: ["content-calendar", brandId],
    queryFn: async () => {
      const res = await fetch(`/api/integrations/social/calendar?brandId=${brandId}`);
      if (!res.ok) return { items: [], total: 0 };
      return res.json();
    },
  });

  const { data: pendingApprovals } = useQuery({
    queryKey: ["pending-approvals", brandId],
    queryFn: async () => {
      const res = await fetch(`/api/integrations/social/approvals/pending?brandId=${brandId}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: Partial<ContentCalendarItem>) => {
      const res = await fetch("/api/integrations/social/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, brandId }),
      });
      if (!res.ok) throw new Error("Failed to create post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-calendar"] });
      setShowCreateDialog(false);
      setNewPost({ title: "", description: "", platforms: [], contentType: "post" });
    },
  });

  const generateAIContent = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch("/api/integrations/social/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          topic: newPost.title || "Product announcement",
          tone: "professional",
          platforms: newPost.platforms.length ? newPost.platforms : ["instagram", "linkedin"],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewPost(prev => ({
          ...prev,
          description: `${data.caption}\n\n${data.hashtags.map((h: string) => `#${h}`).join(" ")}`,
        }));
      }
    } finally {
      setAiGenerating(false);
    }
  };

  const togglePlatform = (platform: string) => {
    setNewPost(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getPostsForDate = (date: Date) => {
    if (!calendarData?.items) return [];
    return calendarData.items.filter(item => {
      if (!item.scheduledAt) return false;
      const postDate = new Date(item.scheduledAt);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: number) => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const items = calendarData?.items || [];
  const drafts = items.filter(i => i.status === "draft");
  const scheduled = items.filter(i => i.status === "scheduled" || i.status === "approved");
  const published = items.filter(i => i.status === "published");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Content Hub
            </h1>
            <p className="text-slate-400 mt-1">Plan, create, and publish content across all platforms</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Content
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Content</DialogTitle>
                <DialogDescription>Create a new post for your social channels</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Title</label>
                  <Input
                    placeholder="Enter post title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-slate-400">Content</label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={generateAIContent}
                      disabled={aiGenerating}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      {aiGenerating ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                      Generate with AI
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Write your post content..."
                    value={newPost.description}
                    onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-slate-800 border-slate-700 min-h-32"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Platforms</label>
                  <div className="flex gap-3">
                    {["instagram", "facebook", "linkedin", "twitter"].map(platform => {
                      const Icon = platformIcons[platform];
                      const isSelected = newPost.platforms.includes(platform);
                      return (
                        <button
                          key={platform}
                          onClick={() => togglePlatform(platform)}
                          className={`p-3 rounded-xl border transition-all ${
                            isSelected
                              ? "bg-purple-500/20 border-purple-500"
                              : "bg-slate-800 border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <Icon className={`h-6 w-6 ${isSelected ? "text-purple-400" : "text-slate-400"}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Content Type</label>
                  <div className="flex gap-3">
                    {[
                      { type: "post", icon: FileText, label: "Post" },
                      { type: "image", icon: Image, label: "Image" },
                      { type: "video", icon: Video, label: "Video" },
                    ].map(({ type, icon: Icon, label }) => (
                      <button
                        key={type}
                        onClick={() => setNewPost(prev => ({ ...prev, contentType: type }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                          newPost.contentType === type
                            ? "bg-purple-500/20 border-purple-500"
                            : "bg-slate-800 border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-slate-700">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createPostMutation.mutate({
                      title: newPost.title,
                      description: newPost.description,
                      platforms: newPost.platforms,
                      contentType: newPost.contentType,
                      status: "draft",
                      priority: "medium",
                      tags: [],
                      metadata: {},
                    })}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!newPost.title || newPost.platforms.length === 0}
                  >
                    Create Draft
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-slate-500/20 rounded-lg">
                  <Edit3 className="h-5 w-5 text-slate-400" />
                </div>
                <span className="text-slate-400">Drafts</span>
              </div>
              <div className="text-3xl font-bold">{drafts.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-slate-400">Scheduled</span>
              </div>
              <div className="text-3xl font-bold">{scheduled.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Eye className="h-5 w-5 text-orange-400" />
                </div>
                <span className="text-slate-400">Pending Approval</span>
              </div>
              <div className="text-3xl font-bold">{pendingApprovals?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <span className="text-slate-400">Published</span>
              </div>
              <div className="text-3xl font-bold">{published.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-slate-700 mb-6">
            <TabsTrigger value="calendar" className="data-[state=active]:bg-slate-700">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="list" className="data-[state=active]:bg-slate-700">
              <FileText className="h-4 w-4 mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger value="approvals" className="data-[state=active]:bg-slate-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approvals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  {selectedDate.toLocaleString("default", { month: "long", year: "numeric" })}
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => navigateMonth(-1)} className="border-slate-600">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => navigateMonth(1)} className="border-slate-600">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-center text-sm text-slate-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(selectedDate).map((date, i) => {
                    if (!date) {
                      return <div key={`empty-${i}`} className="h-24" />;
                    }
                    const posts = getPostsForDate(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={date.toISOString()}
                        className={`h-24 p-2 rounded-lg border ${
                          isToday ? "border-purple-500 bg-purple-500/10" : "border-slate-700 bg-slate-800/30"
                        } hover:bg-slate-700/30 cursor-pointer transition-colors`}
                      >
                        <div className={`text-sm mb-1 ${isToday ? "text-purple-400 font-bold" : "text-slate-400"}`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {posts.slice(0, 2).map(post => (
                            <div
                              key={post.id}
                              className="text-xs p-1 bg-slate-700/50 rounded truncate flex items-center gap-1"
                            >
                              {post.platforms[0] && platformIcons[post.platforms[0]] && (
                                (() => {
                                  const Icon = platformIcons[post.platforms[0]];
                                  return <Icon className="h-3 w-3 flex-shrink-0" />;
                                })()
                              )}
                              <span className="truncate">{post.title}</span>
                            </div>
                          ))}
                          {posts.length > 2 && (
                            <div className="text-xs text-slate-400">+{posts.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>All Content</CardTitle>
                <CardDescription>View and manage all your content</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex gap-1">
                            {item.platforms.map(platform => {
                              const Icon = platformIcons[platform];
                              return Icon ? <Icon key={platform} className="h-5 w-5 text-slate-400" /> : null;
                            })}
                          </div>
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-slate-400">
                              {item.scheduledAt
                                ? `Scheduled: ${new Date(item.scheduledAt).toLocaleDateString()}`
                                : "Not scheduled"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={statusColors[item.status] || "bg-slate-500/20"}>
                            {item.status.replace("_", " ")}
                          </Badge>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="text-center py-12 text-slate-400">
                        No content yet. Create your first post!
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Review and approve content before publishing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApprovals?.map((approval: any) => (
                    <div
                      key={approval.id}
                      className="p-6 bg-slate-700/30 rounded-xl border border-slate-600"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="font-medium mb-1">Content Approval Request</div>
                          <div className="text-sm text-slate-400">
                            Type: {approval.approvalType} | Requested: {new Date(approval.requestedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-300">Pending</Badge>
                      </div>
                      <div className="flex gap-3">
                        <Button className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button variant="outline" className="border-slate-600">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!pendingApprovals || pendingApprovals.length === 0) && (
                    <div className="text-center py-12 text-slate-400">
                      No pending approvals. All content is up to date!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default ContentHub;
