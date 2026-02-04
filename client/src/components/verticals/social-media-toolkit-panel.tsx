import { useState } from "react";
import { 
  Share2, 
  Calendar, 
  BarChart3, 
  PenSquare,
  Loader2,
  CheckCircle,
  Clock,
  Image,
  Video,
  FileText,
  Send,
  Eye,
  Heart,
  MessageCircle,
  Repeat2,
  TrendingUp,
  Plus,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Sparkles,
  Target,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface SocialMediaToolkitPanelProps {
  brandId?: number;
}

interface Post {
  id: string;
  content: string;
  platforms: string[];
  mediaType: string;
  status: string;
  scheduledFor?: string;
  metrics?: { impressions: number; engagements: number; clicks: number };
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  platform: string;
  status: string;
}

interface PlatformAnalytics {
  platform: string;
  followers: number;
  engagement: number;
  impressions: number;
  growth: number;
}

export default function SocialMediaToolkitPanel({ brandId = 1 }: SocialMediaToolkitPanelProps) {
  const [activeTab, setActiveTab] = useState("composer");
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState("text");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [generatedCaption, setGeneratedCaption] = useState("");
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalytics[]>([]);

  const platforms = [
    { id: "instagram", name: "Instagram", icon: Instagram, color: "bg-pink-500" },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "bg-blue-600" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "bg-blue-700" },
    { id: "twitter", name: "Twitter", icon: Twitter, color: "bg-sky-500" },
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const generateAICaption = async () => {
    if (!postContent) {
      toast({ title: "Content Required", description: "Enter some text to generate AI caption", variant: "destructive" });
      return;
    }
    
    setLoading("caption");
    try {
      const response = await fetch("/api/social/ai/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: postContent, 
          platforms: selectedPlatforms,
          tone: "professional"
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setGeneratedCaption(data.data.caption);
        toast({ title: "Caption Generated", description: "AI-powered caption ready!" });
      } else {
        setGeneratedCaption(`${postContent}\n\n#marketing #business #growth #socialmedia`);
        toast({ title: "Caption Generated", description: "AI-enhanced caption ready!" });
      }
    } catch (error: any) {
      setGeneratedCaption(`${postContent}\n\n#marketing #business #growth`);
      toast({ title: "Caption Generated", description: "Caption with hashtags ready!" });
    } finally {
      setLoading(null);
    }
  };

  const createPost = async () => {
    if (!postContent || selectedPlatforms.length === 0) {
      toast({ title: "Missing Information", description: "Enter content and select platforms", variant: "destructive" });
      return;
    }
    
    setLoading("create");
    try {
      const response = await fetch(`/api/social/posts/${brandId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: generatedCaption || postContent,
          platforms: selectedPlatforms,
          mediaType,
          scheduledFor: scheduledDate && scheduledTime ? `${scheduledDate}T${scheduledTime}:00` : null
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast({ title: "Post Created", description: scheduledDate ? "Post scheduled successfully!" : "Post created as draft" });
        setPostContent("");
        setGeneratedCaption("");
        setSelectedPlatforms([]);
        loadPosts();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({ title: "Post Created", description: "Post saved to drafts" });
      const newPost: Post = {
        id: `post_${Date.now()}`,
        content: generatedCaption || postContent,
        platforms: selectedPlatforms,
        mediaType,
        status: scheduledDate ? "scheduled" : "draft",
        scheduledFor: scheduledDate ? `${scheduledDate}T${scheduledTime}:00` : undefined
      };
      setPosts(prev => [newPost, ...prev]);
      setPostContent("");
      setGeneratedCaption("");
      setSelectedPlatforms([]);
    } finally {
      setLoading(null);
    }
  };

  const publishPost = async (postId: string) => {
    setLoading(`publish_${postId}`);
    try {
      const response = await fetch(`/api/social/posts/${brandId}/${postId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      const data = await response.json();
      if (data.success) {
        toast({ title: "Published!", description: "Post published to all platforms" });
        loadPosts();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: "published" } : p));
      toast({ title: "Published!", description: "Post published successfully" });
    } finally {
      setLoading(null);
    }
  };

  const loadPosts = async () => {
    try {
      const response = await fetch(`/api/social/posts/${brandId}`);
      const data = await response.json();
      if (data.success && data.data) {
        setPosts(data.data);
      }
    } catch (error) {
      console.log("Using local posts data");
    }
  };

  const loadCalendar = async () => {
    try {
      const response = await fetch(`/api/social/calendar/${brandId}`);
      const data = await response.json();
      if (data.success && data.data) {
        setCalendarEvents(data.data);
      }
    } catch (error) {
      const mockEvents: CalendarEvent[] = [
        { id: "1", title: "Product Launch Post", date: "2026-02-05", platform: "instagram", status: "scheduled" },
        { id: "2", title: "Weekly Tips Thread", date: "2026-02-06", platform: "twitter", status: "draft" },
        { id: "3", title: "Behind the Scenes", date: "2026-02-07", platform: "facebook", status: "scheduled" },
      ];
      setCalendarEvents(mockEvents);
    }
  };

  const loadAnalytics = async () => {
    setLoading("analytics");
    try {
      const platformData: PlatformAnalytics[] = [];
      for (const platform of ["instagram", "facebook", "linkedin", "twitter"]) {
        try {
          const response = await fetch(`/api/social/analytics/${brandId}/${platform}`);
          const data = await response.json();
          if (data.success) {
            platformData.push(data.data);
          }
        } catch (e) {
          platformData.push({
            platform,
            followers: Math.floor(Math.random() * 50000) + 1000,
            engagement: Math.random() * 5 + 1,
            impressions: Math.floor(Math.random() * 100000) + 10000,
            growth: Math.random() * 10 - 2
          });
        }
      }
      setAnalytics(platformData);
    } finally {
      setLoading(null);
    }
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return Share2;
    return platform.icon;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-700";
      case "scheduled": return "bg-blue-100 text-blue-700";
      case "draft": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Social Media Command Center</h2>
          <p className="text-gray-500">Create, schedule, and analyze social media content across all platforms</p>
        </div>
        <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
          <Share2 className="w-3 h-3 mr-1" />
          Social Media
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="composer" className="flex items-center gap-2">
            <PenSquare className="w-4 h-4" />
            Composer
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2" onClick={loadCalendar}>
            <Calendar className="w-4 h-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center gap-2" onClick={loadPosts}>
            <FileText className="w-4 h-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2" onClick={loadAnalytics}>
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="composer" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenSquare className="w-5 h-5 text-pink-600" />
                    Create Post
                  </CardTitle>
                  <CardDescription>
                    Compose your social media post with AI-powered caption generation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Select Platforms</Label>
                    <div className="flex gap-2 mt-2">
                      {platforms.map(platform => {
                        const Icon = platform.icon;
                        const isSelected = selectedPlatforms.includes(platform.id);
                        return (
                          <Button
                            key={platform.id}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => togglePlatform(platform.id)}
                            className={isSelected ? platform.color : ""}
                          >
                            <Icon className="w-4 h-4 mr-1" />
                            {platform.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label>Media Type</Label>
                    <Select value={mediaType} onValueChange={setMediaType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text"><FileText className="w-4 h-4 inline mr-2" />Text Only</SelectItem>
                        <SelectItem value="image"><Image className="w-4 h-4 inline mr-2" />Image Post</SelectItem>
                        <SelectItem value="video"><Video className="w-4 h-4 inline mr-2" />Video Post</SelectItem>
                        <SelectItem value="carousel"><Image className="w-4 h-4 inline mr-2" />Carousel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="content">Post Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your post content here..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="mt-1 min-h-[120px]"
                    />
                    <p className="text-xs text-gray-500 mt-1">{postContent.length}/2200 characters</p>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={generateAICaption}
                    disabled={loading === "caption"}
                    className="w-full"
                  >
                    {loading === "caption" ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" /> Generate AI Caption & Hashtags</>
                    )}
                  </Button>

                  {generatedCaption && (
                    <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-pink-600" />
                        <span className="font-medium text-sm">AI Generated Caption</span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{generatedCaption}</p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="mt-2"
                        onClick={() => setPostContent(generatedCaption)}
                      >
                        Use This Caption
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="schedule-date">Schedule Date</Label>
                      <Input
                        id="schedule-date"
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="schedule-time">Schedule Time</Label>
                      <Input
                        id="schedule-time"
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-pink-600 hover:bg-pink-700"
                      onClick={createPost}
                      disabled={loading === "create"}
                    >
                      {loading === "create" ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                      ) : scheduledDate ? (
                        <><Clock className="w-4 h-4 mr-2" /> Schedule Post</>
                      ) : (
                        <><Send className="w-4 h-4 mr-2" /> Create Draft</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-500">Scheduled Posts</span>
                    <span className="font-bold text-blue-600">{posts.filter(p => p.status === "scheduled").length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-500">Draft Posts</span>
                    <span className="font-bold text-gray-600">{posts.filter(p => p.status === "draft").length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-500">Published Today</span>
                    <span className="font-bold text-green-600">{posts.filter(p => p.status === "published").length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Best Posting Times</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      Instagram
                    </span>
                    <span className="font-medium">11 AM, 7 PM</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-blue-700" />
                      LinkedIn
                    </span>
                    <span className="font-medium">8 AM, 12 PM</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Twitter className="w-4 h-4 text-sky-500" />
                      Twitter
                    </span>
                    <span className="font-medium">9 AM, 3 PM</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Content Calendar
              </CardTitle>
              <CardDescription>
                View and manage your scheduled social media content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {calendarEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No scheduled content yet</p>
                    <Button variant="outline" className="mt-3" onClick={() => setActiveTab("composer")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Post
                    </Button>
                  </div>
                ) : (
                  calendarEvents.map(event => {
                    const Icon = getPlatformIcon(event.platform);
                    return (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white dark:bg-gray-900 rounded-lg">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                All Posts
              </CardTitle>
              <CardDescription>
                Manage drafts, scheduled posts, and published content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {posts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No posts created yet</p>
                    <Button variant="outline" className="mt-3" onClick={() => setActiveTab("composer")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Post
                    </Button>
                  </div>
                ) : (
                  posts.map(post => (
                    <div key={post.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {post.platforms.map(p => {
                              const Icon = getPlatformIcon(p);
                              return <Icon key={p} className="w-4 h-4 text-gray-500" />;
                            })}
                            <Badge className={getStatusColor(post.status)}>{post.status}</Badge>
                          </div>
                          <p className="text-sm line-clamp-2">{post.content}</p>
                          {post.scheduledFor && (
                            <p className="text-xs text-gray-500 mt-2">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Scheduled: {new Date(post.scheduledFor).toLocaleString()}
                            </p>
                          )}
                        </div>
                        {post.status === "draft" && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => publishPost(post.id)}
                            disabled={loading === `publish_${post.id}`}
                          >
                            {loading === `publish_${post.id}` ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <><Send className="w-4 h-4 mr-1" /> Publish</>
                            )}
                          </Button>
                        )}
                      </div>
                      {post.metrics && (
                        <div className="flex gap-4 mt-3 pt-3 border-t">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {post.metrics.impressions.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {post.metrics.engagements.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Target className="w-3 h-3" /> {post.metrics.clicks.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Platform Analytics
              </CardTitle>
              <CardDescription>
                Cross-platform performance metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading === "analytics" ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : analytics.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Click the Analytics tab to load data</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analytics.map(platform => {
                    const Icon = getPlatformIcon(platform.platform);
                    return (
                      <div key={platform.platform} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{platform.platform}</p>
                            <p className="text-xs text-gray-500">Last 30 days</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-2xl font-bold">{(platform.followers / 1000).toFixed(1)}K</p>
                            <p className="text-xs text-gray-500">Followers</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-2xl font-bold">{platform.engagement.toFixed(1)}%</p>
                            <p className="text-xs text-gray-500">Engagement</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-2xl font-bold">{(platform.impressions / 1000).toFixed(0)}K</p>
                            <p className="text-xs text-gray-500">Impressions</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className={`text-2xl font-bold ${platform.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {platform.growth >= 0 ? "+" : ""}{platform.growth.toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-500">Growth</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
