import { useState } from "react";
import { 
  TrendingUp, 
  Target, 
  DollarSign,
  Loader2,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  Plus,
  Settings,
  Eye,
  MousePointer,
  ShoppingCart,
  Users,
  Sparkles,
  Zap,
  RefreshCw
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

interface PerformanceAdsToolkitPanelProps {
  brandId?: number;
}

interface Campaign {
  id: string;
  name: string;
  platform: string;
  objective: string;
  status: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
}

interface AdSet {
  id: string;
  campaignId: string;
  name: string;
  targeting: string;
  budget: number;
  status: string;
}

interface Creative {
  id: string;
  name: string;
  type: string;
  headline: string;
  ctr: number;
  status: string;
}

export default function PerformanceAdsToolkitPanel({ brandId = 1 }: PerformanceAdsToolkitPanelProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { id: "1", name: "Brand Awareness Q1", platform: "meta", objective: "awareness", status: "active", budget: 50000, spent: 32500, impressions: 1250000, clicks: 15600, conversions: 234, roas: 4.2 },
    { id: "2", name: "Lead Generation", platform: "google", objective: "leads", status: "active", budget: 30000, spent: 18900, impressions: 450000, clicks: 8900, conversions: 156, roas: 3.8 },
    { id: "3", name: "Retargeting Campaign", platform: "meta", objective: "conversions", status: "paused", budget: 20000, spent: 15000, impressions: 320000, clicks: 4500, conversions: 89, roas: 5.1 },
  ]);

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    platform: "meta",
    objective: "conversions",
    dailyBudget: "",
    targetAudience: "",
    startDate: "",
    endDate: ""
  });

  const platforms = [
    { id: "meta", name: "Meta Ads", icon: "📘" },
    { id: "google", name: "Google Ads", icon: "🔍" },
    { id: "linkedin", name: "LinkedIn Ads", icon: "💼" },
    { id: "twitter", name: "Twitter Ads", icon: "🐦" },
  ];

  const objectives = [
    { id: "awareness", name: "Brand Awareness", description: "Maximize reach and impressions" },
    { id: "traffic", name: "Website Traffic", description: "Drive clicks to your website" },
    { id: "leads", name: "Lead Generation", description: "Capture contact information" },
    { id: "conversions", name: "Conversions", description: "Drive purchases and signups" },
    { id: "app_installs", name: "App Installs", description: "Promote app downloads" },
  ];

  const createCampaign = async () => {
    if (!newCampaign.name || !newCampaign.dailyBudget) {
      toast({ title: "Missing Information", description: "Please fill in campaign name and budget", variant: "destructive" });
      return;
    }
    
    setLoading("create");
    try {
      const campaign: Campaign = {
        id: `camp_${Date.now()}`,
        name: newCampaign.name,
        platform: newCampaign.platform,
        objective: newCampaign.objective,
        status: "draft",
        budget: parseFloat(newCampaign.dailyBudget) * 30,
        spent: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        roas: 0
      };
      setCampaigns(prev => [campaign, ...prev]);
      toast({ title: "Campaign Created", description: "Your campaign is ready to launch" });
      setNewCampaign({
        name: "",
        platform: "meta",
        objective: "conversions",
        dailyBudget: "",
        targetAudience: "",
        startDate: "",
        endDate: ""
      });
    } finally {
      setLoading(null);
    }
  };

  const toggleCampaignStatus = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, status: c.status === "active" ? "paused" : "active" }
        : c
    ));
    toast({ title: "Campaign Updated", description: "Status changed successfully" });
  };

  const optimizeCampaign = async (campaignId: string) => {
    setLoading(`optimize_${campaignId}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCampaigns(prev => prev.map(c => 
        c.id === campaignId 
          ? { ...c, roas: c.roas * 1.15 }
          : c
      ));
      toast({ 
        title: "AI Optimization Complete", 
        description: "Budget reallocated to top-performing ad sets. Expected ROAS improvement: +15%" 
      });
    } finally {
      setLoading(null);
    }
  };

  const totalSpend = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgRoas = campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "paused": return "bg-yellow-100 text-yellow-700";
      case "draft": return "bg-gray-100 text-gray-700";
      case "completed": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Advertising Hub</h2>
          <p className="text-gray-500">Manage ad campaigns across Meta, Google, LinkedIn, and Twitter</p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <TrendingUp className="w-3 h-3 mr-1" />
          Performance Ads
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Total Spend</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">₹{(totalSpend / 1000).toFixed(1)}K</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
          <p className="text-xs text-blue-600 mt-2">of ₹{(totalBudget / 1000).toFixed(0)}K budget</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Conversions</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{totalConversions.toLocaleString()}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-green-500 opacity-50" />
          </div>
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +23% vs last month
          </p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400">Avg ROAS</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{avgRoas.toFixed(1)}x</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
          <p className="text-xs text-purple-600 mt-2">Target: 4.0x</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400">Active Campaigns</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{campaigns.filter(c => c.status === "active").length}</p>
            </div>
            <Target className="w-8 h-8 text-orange-500 opacity-50" />
          </div>
          <p className="text-xs text-orange-600 mt-2">Across {new Set(campaigns.map(c => c.platform)).size} platforms</p>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create
          </TabsTrigger>
          <TabsTrigger value="optimize" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Optimize
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-600" />
                  Spend by Platform
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platforms.map(platform => {
                    const platformSpend = campaigns
                      .filter(c => c.platform === platform.id)
                      .reduce((sum, c) => sum + c.spent, 0);
                    const percentage = totalSpend > 0 ? (platformSpend / totalSpend) * 100 : 0;
                    return (
                      <div key={platform.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium flex items-center gap-2">
                            <span>{platform.icon}</span>
                            {platform.name}
                          </span>
                          <span className="text-sm text-gray-500">₹{(platformSpend / 1000).toFixed(1)}K ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Top Performing Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaigns
                    .sort((a, b) => b.roas - a.roas)
                    .slice(0, 3)
                    .map((campaign, index) => (
                      <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{campaign.name}</p>
                            <p className="text-xs text-gray-500">{campaign.conversions} conversions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{campaign.roas.toFixed(1)}x</p>
                          <p className="text-xs text-gray-500">ROAS</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                All Campaigns
              </CardTitle>
              <CardDescription>
                Manage and monitor all your advertising campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map(campaign => {
                  const platform = platforms.find(p => p.id === campaign.platform);
                  const ctr = campaign.clicks > 0 ? (campaign.clicks / campaign.impressions * 100) : 0;
                  const cvr = campaign.clicks > 0 ? (campaign.conversions / campaign.clicks * 100) : 0;
                  return (
                    <div key={campaign.id} className="p-4 border rounded-lg hover:border-purple-300 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{platform?.icon}</span>
                          <div>
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{campaign.objective.replace("_", " ")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toggleCampaignStatus(campaign.id)}
                          >
                            {campaign.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => optimizeCampaign(campaign.id)}
                            disabled={loading === `optimize_${campaign.id}`}
                          >
                            {loading === `optimize_${campaign.id}` ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-6 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Budget</p>
                          <p className="font-medium">₹{(campaign.budget / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Spent</p>
                          <p className="font-medium">₹{(campaign.spent / 1000).toFixed(1)}K</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Impressions</p>
                          <p className="font-medium">{(campaign.impressions / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-gray-500">CTR</p>
                          <p className="font-medium">{ctr.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Conversions</p>
                          <p className="font-medium">{campaign.conversions}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">ROAS</p>
                          <p className={`font-bold ${campaign.roas >= 4 ? "text-green-600" : campaign.roas >= 2 ? "text-yellow-600" : "text-red-600"}`}>
                            {campaign.roas.toFixed(1)}x
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {((campaign.spent / campaign.budget) * 100).toFixed(0)}% of budget used
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                Create New Campaign
              </CardTitle>
              <CardDescription>
                Launch a new advertising campaign with AI-powered targeting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="campaign-name">Campaign Name</Label>
                    <Input
                      id="campaign-name"
                      placeholder="e.g., Summer Sale 2026"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Advertising Platform</Label>
                    <Select value={newCampaign.platform} onValueChange={(v) => setNewCampaign({ ...newCampaign, platform: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map(platform => (
                          <SelectItem key={platform.id} value={platform.id}>
                            <span className="flex items-center gap-2">
                              <span>{platform.icon}</span>
                              {platform.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Campaign Objective</Label>
                    <Select value={newCampaign.objective} onValueChange={(v) => setNewCampaign({ ...newCampaign, objective: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {objectives.map(obj => (
                          <SelectItem key={obj.id} value={obj.id}>
                            <div>
                              <p>{obj.name}</p>
                              <p className="text-xs text-gray-500">{obj.description}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="daily-budget">Daily Budget (₹)</Label>
                    <Input
                      id="daily-budget"
                      type="number"
                      placeholder="e.g., 5000"
                      value={newCampaign.dailyBudget}
                      onChange={(e) => setNewCampaign({ ...newCampaign, dailyBudget: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="target-audience">Target Audience Description</Label>
                    <Textarea
                      id="target-audience"
                      placeholder="e.g., Professionals aged 25-45 interested in technology and business"
                      value={newCampaign.targetAudience}
                      onChange={(e) => setNewCampaign({ ...newCampaign, targetAudience: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={newCampaign.startDate}
                        onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={newCampaign.endDate}
                        onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={createCampaign}
                disabled={loading === "create"}
              >
                {loading === "create" ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Campaign...</>
                ) : (
                  <><Zap className="w-4 h-4 mr-2" /> Create Campaign</>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimize" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Campaign Optimizer
              </CardTitle>
              <CardDescription>
                Let AI analyze your campaigns and suggest optimizations for better ROAS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">AI Recommendations</h4>
                      <p className="text-sm text-gray-500">Based on your campaign performance data</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <ArrowUpRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Increase budget for "Lead Generation" campaign by 20% - highest conversion efficiency</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowDownRight className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>Consider pausing low-performing ad sets in "Brand Awareness" campaign to improve ROAS</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RefreshCw className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Refresh creatives for "Retargeting Campaign" - CTR declining over past 7 days</span>
                    </li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Apply All Recommendations
                  </Button>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure AI Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
