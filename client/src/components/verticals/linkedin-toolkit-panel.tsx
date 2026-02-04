import { useState } from "react";
import { 
  Linkedin, 
  Users, 
  MessageSquare,
  Loader2,
  BarChart3,
  Building2,
  Briefcase,
  UserPlus,
  Send,
  Target,
  Sparkles,
  Eye,
  TrendingUp,
  Calendar,
  FileText,
  Plus,
  Search,
  Star,
  CheckCircle
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

interface LinkedInToolkitPanelProps {
  brandId?: number;
}

interface Profile {
  id: string;
  name: string;
  headline: string;
  company: string;
  connections: number;
  profileViews: number;
  ssiScore: number;
}

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  sent: number;
  accepted: number;
  replied: number;
}

interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  score: number;
  status: string;
  lastActivity: string;
}

interface Post {
  id: string;
  content: string;
  type: string;
  impressions: number;
  engagements: number;
  comments: number;
  publishedAt: string;
}

export default function LinkedInToolkitPanel({ brandId = 1 }: LinkedInToolkitPanelProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [profile] = useState<Profile>({
    id: "1",
    name: "WizMark 360",
    headline: "AI Marketing Operating System | 267 Agents | 7 Verticals",
    company: "WizMark 360",
    connections: 5847,
    profileViews: 1234,
    ssiScore: 78
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { id: "1", name: "CTO Outreach Q1", type: "connection", status: "active", sent: 500, accepted: 145, replied: 67 },
    { id: "2", name: "Marketing Leaders InMail", type: "inmail", status: "active", sent: 200, accepted: 0, replied: 42 },
    { id: "3", name: "SaaS Founders Campaign", type: "connection", status: "paused", sent: 300, accepted: 89, replied: 34 },
  ]);

  const [leads, setLeads] = useState<Lead[]>([
    { id: "1", name: "Priya Sharma", title: "VP Marketing", company: "TechCorp India", score: 92, status: "hot", lastActivity: "2 hours ago" },
    { id: "2", name: "Rahul Mehta", title: "CTO", company: "StartupXYZ", score: 85, status: "warm", lastActivity: "1 day ago" },
    { id: "3", name: "Anita Patel", title: "CEO", company: "GrowthCo", score: 78, status: "warm", lastActivity: "3 days ago" },
  ]);

  const [posts, setPosts] = useState<Post[]>([
    { id: "1", content: "Excited to announce our new AI-powered marketing platform...", type: "update", impressions: 15600, engagements: 456, comments: 34, publishedAt: "2 days ago" },
    { id: "2", content: "5 ways AI is transforming digital marketing in 2026...", type: "article", impressions: 8900, engagements: 234, comments: 18, publishedAt: "1 week ago" },
  ]);

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    type: "connection",
    targetAudience: "",
    messageTemplate: ""
  });

  const [newPost, setNewPost] = useState({
    content: "",
    type: "update"
  });

  const optimizeProfile = async () => {
    setLoading("optimize");
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({ 
        title: "Profile Optimized", 
        description: "AI suggestions: Update headline with industry keywords, add featured section, optimize summary for SEO" 
      });
    } finally {
      setLoading(null);
    }
  };

  const createCampaign = async () => {
    if (!newCampaign.name || !newCampaign.messageTemplate) {
      toast({ title: "Missing Information", description: "Please fill in campaign name and message template", variant: "destructive" });
      return;
    }
    
    setLoading("campaign");
    try {
      const campaign: Campaign = {
        id: `camp_${Date.now()}`,
        name: newCampaign.name,
        type: newCampaign.type,
        status: "draft",
        sent: 0,
        accepted: 0,
        replied: 0
      };
      setCampaigns(prev => [campaign, ...prev]);
      toast({ title: "Campaign Created", description: "Your outreach campaign is ready to launch" });
      setNewCampaign({ name: "", type: "connection", targetAudience: "", messageTemplate: "" });
    } finally {
      setLoading(null);
    }
  };

  const generateAIMessage = async () => {
    setLoading("ai_message");
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setNewCampaign(prev => ({
        ...prev,
        messageTemplate: `Hi {{first_name}},

I noticed your impressive work at {{company}} as {{title}}. Your expertise in {{industry}} caught my attention.

I'm reaching out because we've helped similar companies achieve 3x marketing ROI with our AI-powered platform.

Would you be open to a 15-minute chat to explore how we could help {{company}} scale their marketing efforts?

Best regards,
{{sender_name}}`
      }));
      toast({ title: "Message Generated", description: "AI-crafted personalized message ready!" });
    } finally {
      setLoading(null);
    }
  };

  const publishPost = async () => {
    if (!newPost.content) {
      toast({ title: "Missing Content", description: "Please write your post content", variant: "destructive" });
      return;
    }
    
    setLoading("post");
    try {
      const post: Post = {
        id: `post_${Date.now()}`,
        content: newPost.content,
        type: newPost.type,
        impressions: 0,
        engagements: 0,
        comments: 0,
        publishedAt: "Just now"
      };
      setPosts(prev => [post, ...prev]);
      toast({ title: "Post Published", description: "Your LinkedIn post is now live" });
      setNewPost({ content: "", type: "update" });
    } finally {
      setLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": case "hot": return "bg-green-100 text-green-700";
      case "warm": return "bg-orange-100 text-orange-700";
      case "paused": case "cold": return "bg-gray-100 text-gray-700";
      case "draft": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">LinkedIn B2B Hub</h2>
          <p className="text-gray-500">Profile optimization, outreach campaigns, and lead generation</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Linkedin className="w-3 h-3 mr-1" />
          LinkedIn B2B
        </Badge>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-600" />
        <span className="text-sm text-amber-800">
          <strong>Demo Mode:</strong> Connect your LinkedIn account in Settings to enable live profile optimization and outreach.
        </span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="outreach" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Outreach
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    W
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{profile.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{profile.headline}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Building2 className="w-4 h-4" />
                      {profile.company}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{profile.connections.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Connections</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{profile.profileViews}</p>
                    <p className="text-sm text-gray-500">Profile Views</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className={`text-2xl font-bold ${getScoreColor(profile.ssiScore)}`}>{profile.ssiScore}</p>
                    <p className="text-sm text-gray-500">SSI Score</p>
                  </div>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={optimizeProfile}
                  disabled={loading === "optimize"}
                >
                  {loading === "optimize" ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> AI Profile Optimization</>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">SSI Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Professional Brand</span>
                    <span className="font-medium">21/25</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "84%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Finding People</span>
                    <span className="font-medium">19/25</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "76%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Engaging Insights</span>
                    <span className="font-medium">18/25</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "72%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Building Relationships</span>
                    <span className="font-medium">20/25</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "80%" }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="outreach" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Create Outreach Campaign
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    placeholder="e.g., CTO Outreach Q1"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Campaign Type</Label>
                  <Select value={newCampaign.type} onValueChange={(v) => setNewCampaign({ ...newCampaign, type: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="connection">Connection Request</SelectItem>
                      <SelectItem value="inmail">InMail Campaign</SelectItem>
                      <SelectItem value="message">Direct Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target-audience">Target Audience</Label>
                  <Input
                    id="target-audience"
                    placeholder="e.g., CTOs at Series A startups"
                    value={newCampaign.targetAudience}
                    onChange={(e) => setNewCampaign({ ...newCampaign, targetAudience: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="message-template">Message Template</Label>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={generateAIMessage}
                      disabled={loading === "ai_message"}
                    >
                      {loading === "ai_message" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <><Sparkles className="w-4 h-4 mr-1" /> AI Generate</>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="message-template"
                    placeholder="Use {{first_name}}, {{company}}, {{title}} for personalization"
                    value={newCampaign.messageTemplate}
                    onChange={(e) => setNewCampaign({ ...newCampaign, messageTemplate: e.target.value })}
                    className="mt-1 min-h-[150px] font-mono text-sm"
                  />
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={createCampaign}
                  disabled={loading === "campaign"}
                >
                  {loading === "campaign" ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Create Campaign</>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  Active Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaigns.map(campaign => (
                    <div key={campaign.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-gray-500 capitalize">{campaign.type} campaign</p>
                        </div>
                        <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <p className="font-bold">{campaign.sent}</p>
                          <p className="text-xs text-gray-500">Sent</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-green-600">{campaign.accepted}</p>
                          <p className="text-xs text-gray-500">Accepted</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-blue-600">{campaign.replied}</p>
                          <p className="text-xs text-gray-500">Replied</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-500">
                          Accept Rate: {campaign.sent > 0 ? ((campaign.accepted / campaign.sent) * 100).toFixed(1) : 0}% | 
                          Reply Rate: {campaign.accepted > 0 ? ((campaign.replied / campaign.accepted) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Lead Pipeline
              </CardTitle>
              <CardDescription>
                AI-scored leads from your LinkedIn outreach campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leads.map(lead => (
                  <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {lead.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-gray-500">{lead.title} at {lead.company}</p>
                        <p className="text-xs text-gray-400">Last activity: {lead.lastActivity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className={`text-xl font-bold ${getScoreColor(lead.score)}`}>{lead.score}</p>
                        <p className="text-xs text-gray-500">Lead Score</p>
                      </div>
                      <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-1" /> Message
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Create LinkedIn Post
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Post Type</Label>
                <Select value={newPost.type} onValueChange={(v) => setNewPost({ ...newPost, type: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="update">Text Update</SelectItem>
                    <SelectItem value="article">Long-form Article</SelectItem>
                    <SelectItem value="poll">Poll</SelectItem>
                    <SelectItem value="carousel">Document/Carousel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="post-content">Content</Label>
                <Textarea
                  id="post-content"
                  placeholder="Share your thoughts, insights, or updates..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="mt-1 min-h-[150px]"
                />
                <p className="text-xs text-gray-500 mt-1">{newPost.content.length}/3000 characters</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Sparkles className="w-4 h-4 mr-2" /> AI Enhance
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={publishPost}
                  disabled={loading === "post"}
                >
                  {loading === "post" ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Publish</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {posts.map(post => (
                  <div key={post.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm line-clamp-2 mb-3">{post.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {post.impressions.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" /> {post.engagements}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {post.comments}</span>
                      </div>
                      <span className="text-xs text-gray-400">{post.publishedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Profile Views</p>
                  <p className="text-2xl font-bold">1,234</p>
                </div>
                <Eye className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
              <p className="text-xs text-green-600 mt-2">+18% this week</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Post Impressions</p>
                  <p className="text-2xl font-bold">24.5K</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600 opacity-50" />
              </div>
              <p className="text-xs text-green-600 mt-2">+32% vs last month</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Connection Rate</p>
                  <p className="text-2xl font-bold">29%</p>
                </div>
                <UserPlus className="w-8 h-8 text-green-600 opacity-50" />
              </div>
              <p className="text-xs text-blue-600 mt-2">Above avg (22%)</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Reply Rate</p>
                  <p className="text-2xl font-bold">46%</p>
                </div>
                <MessageSquare className="w-8 h-8 text-orange-600 opacity-50" />
              </div>
              <p className="text-xs text-green-600 mt-2">Excellent!</p>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Detailed analytics charts coming soon</p>
                <p className="text-sm">Connect LinkedIn API for real-time data</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
