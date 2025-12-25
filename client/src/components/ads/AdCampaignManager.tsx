import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Play, 
  Pause, 
  RefreshCw,
  DollarSign,
  TrendingUp,
  Target,
  Users,
  AlertTriangle,
  BarChart3,
  Eye,
  MousePointer,
  ShoppingCart,
  Zap,
  Settings
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  platform: string;
  objective: string;
  status: string;
  budget: { type: string; amount: number; currency: string };
  schedule: { startDate: string; endDate?: string };
  performance?: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    revenue: number;
    ctr: number;
    cpc: number;
    roas: number;
  };
  aiOptimizations?: Array<{
    type: string;
    suggestion: string;
    expectedImpact: number;
    status: string;
  }>;
}

interface BudgetAlert {
  id: string;
  severity: string;
  message: string;
  percentage: number;
  createdAt: string;
}

export function AdCampaignManager() {
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const brandId = "demo-brand-1";

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    platform: "meta",
    objective: "conversions",
    budgetAmount: 1000,
    budgetType: "daily",
    startDate: new Date().toISOString().split('T')[0]
  });

  const { data: campaignsData, isLoading, refetch } = useQuery({
    queryKey: ["adCampaigns", brandId, selectedPlatform],
    queryFn: async () => {
      const params = new URLSearchParams({ brandId });
      if (selectedPlatform !== "all") params.append("platform", selectedPlatform);
      const res = await fetch(`/api/ads/campaigns?${params}`);
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      return res.json();
    },
  });

  const { data: alertsData } = useQuery({
    queryKey: ["budgetAlerts", brandId],
    queryFn: async () => {
      const res = await fetch(`/api/ads/alerts?brandId=${brandId}`);
      if (!res.ok) throw new Error("Failed to fetch alerts");
      return res.json();
    },
  });

  const { data: crossChannelData } = useQuery({
    queryKey: ["crossChannel", brandId],
    queryFn: async () => {
      const res = await fetch(`/api/ads/cross-channel?brandId=${brandId}`);
      if (!res.ok) throw new Error("Failed to fetch cross-channel data");
      return res.json();
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ads/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          platform: newCampaign.platform,
          name: newCampaign.name,
          objective: newCampaign.objective,
          status: "draft",
          budget: {
            type: newCampaign.budgetType,
            amount: newCampaign.budgetAmount,
            currency: "USD"
          },
          schedule: {
            startDate: new Date(newCampaign.startDate),
            timeZone: "UTC"
          },
          targeting: {},
          adSets: []
        })
      });
      if (!res.ok) throw new Error("Failed to create campaign");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adCampaigns"] });
      setIsCreateDialogOpen(false);
      setNewCampaign({
        name: "",
        platform: "meta",
        objective: "conversions",
        budgetAmount: 1000,
        budgetType: "daily",
        startDate: new Date().toISOString().split('T')[0]
      });
    }
  });

  const pauseCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const res = await fetch(`/api/ads/campaigns/${campaignId}/pause`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to pause campaign");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adCampaigns"] })
  });

  const resumeCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const res = await fetch(`/api/ads/campaigns/${campaignId}/resume`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to resume campaign");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adCampaigns"] })
  });

  const campaigns: Campaign[] = campaignsData?.campaigns || [];
  const alerts: BudgetAlert[] = alertsData?.alerts || [];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "meta": return "📘";
      case "google": return "🔍";
      case "linkedin": return "💼";
      case "tiktok": return "🎵";
      default: return "📢";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "paused": return "bg-yellow-100 text-yellow-800";
      case "draft": return "bg-gray-100 text-gray-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ad Campaign Manager</h1>
          <p className="text-muted-foreground">Manage campaigns across Meta, Google, and LinkedIn</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>Set up a new advertising campaign across platforms</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    placeholder="Enter campaign name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Platform</Label>
                    <Select value={newCampaign.platform} onValueChange={(v) => setNewCampaign({ ...newCampaign, platform: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meta">📘 Meta Ads</SelectItem>
                        <SelectItem value="google">🔍 Google Ads</SelectItem>
                        <SelectItem value="linkedin">💼 LinkedIn Ads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Objective</Label>
                    <Select value={newCampaign.objective} onValueChange={(v) => setNewCampaign({ ...newCampaign, objective: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="awareness">Brand Awareness</SelectItem>
                        <SelectItem value="traffic">Website Traffic</SelectItem>
                        <SelectItem value="leads">Lead Generation</SelectItem>
                        <SelectItem value="conversions">Conversions</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Budget Type</Label>
                    <Select value={newCampaign.budgetType} onValueChange={(v) => setNewCampaign({ ...newCampaign, budgetType: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="lifetime">Lifetime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Budget Amount ($)</Label>
                    <Input
                      type="number"
                      value={newCampaign.budgetAmount}
                      onChange={(e) => setNewCampaign({ ...newCampaign, budgetAmount: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => createCampaignMutation.mutate()} disabled={createCampaignMutation.isPending || !newCampaign.name}>
                  {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Budget Alerts</span>
          </div>
          <div className="mt-2 space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between text-sm">
                <span>{alert.message}</span>
                <Badge variant="outline" className={alert.severity === "critical" ? "border-red-500 text-red-600" : "border-yellow-500 text-yellow-600"}>
                  {alert.percentage.toFixed(0)}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(crossChannelData?.totals?.spend || 0)}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(crossChannelData?.totals?.conversions || 0)}</div>
            <p className="text-xs text-muted-foreground">Total conversions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(crossChannelData?.totals?.revenue || 0)}</div>
            <p className="text-xs text-muted-foreground">Total revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              ROAS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(crossChannelData?.totals?.roas || 0).toFixed(2)}x</div>
            <p className="text-xs text-muted-foreground">Return on ad spend</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="platforms">Platform Performance</TabsTrigger>
            <TabsTrigger value="guardrails">Budget Guardrails</TabsTrigger>
          </TabsList>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="meta">Meta Ads</SelectItem>
              <SelectItem value="google">Google Ads</SelectItem>
              <SelectItem value="linkedin">LinkedIn Ads</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="campaigns" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No campaigns yet</h3>
                <p className="text-muted-foreground mb-4">Create your first campaign to get started</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{getPlatformIcon(campaign.platform)}</span>
                        <div>
                          <h3 className="font-medium">{campaign.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {campaign.objective} | {formatCurrency(campaign.budget.amount)}/{campaign.budget.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {campaign.status === "active" ? (
                          <Button size="sm" variant="outline" onClick={() => pauseCampaignMutation.mutate(campaign.id)}>
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        ) : campaign.status === "paused" ? (
                          <Button size="sm" variant="outline" onClick={() => resumeCampaignMutation.mutate(campaign.id)}>
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        ) : null}
                        <Button size="sm" variant="ghost">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {campaign.performance && (
                      <div className="grid grid-cols-6 gap-4 mt-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                            <Eye className="h-3 w-3" />
                            Impressions
                          </div>
                          <p className="font-medium">{formatNumber(campaign.performance.impressions)}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                            <MousePointer className="h-3 w-3" />
                            Clicks
                          </div>
                          <p className="font-medium">{formatNumber(campaign.performance.clicks)}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                            CTR
                          </div>
                          <p className="font-medium">{(campaign.performance.ctr * 100).toFixed(2)}%</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                            <DollarSign className="h-3 w-3" />
                            Spend
                          </div>
                          <p className="font-medium">{formatCurrency(campaign.performance.spend)}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                            <ShoppingCart className="h-3 w-3" />
                            Conversions
                          </div>
                          <p className="font-medium">{campaign.performance.conversions}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                            <TrendingUp className="h-3 w-3" />
                            ROAS
                          </div>
                          <p className="font-medium text-green-600">{campaign.performance.roas.toFixed(2)}x</p>
                        </div>
                      </div>
                    )}

                    {campaign.aiOptimizations && campaign.aiOptimizations.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          AI Optimization Suggestions
                        </div>
                        <div className="space-y-2">
                          {campaign.aiOptimizations.slice(0, 2).map((opt, i) => (
                            <div key={i} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                              <span>{opt.suggestion}</span>
                              <Badge variant="outline">+{opt.expectedImpact}% impact</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(crossChannelData?.platforms || []).map((platform: any) => (
              <Card key={platform.platform}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{getPlatformIcon(platform.platform)}</span>
                    <span className="capitalize">{platform.platform} Ads</span>
                  </CardTitle>
                  <CardDescription>{platform.campaigns} active campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spend</span>
                      <span className="font-medium">{formatCurrency(platform.spend)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conversions</span>
                      <span className="font-medium">{formatNumber(platform.conversions)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-medium text-green-600">{formatCurrency(platform.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ROAS</span>
                      <span className="font-medium">{platform.roas.toFixed(2)}x</span>
                    </div>
                    <Progress value={platform.roas * 20} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {crossChannelData?.insights && (
            <Card>
              <CardHeader>
                <CardTitle>Cross-Channel Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {crossChannelData.insights.map((insight: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <Zap className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="guardrails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Guardrails</CardTitle>
              <CardDescription>Set spending limits and alerts to protect your budget</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { type: "daily_max", title: "Daily Spending Limit", icon: DollarSign },
                    { type: "cpa_max", title: "Maximum CPA", icon: Target },
                    { type: "cpc_max", title: "Maximum CPC", icon: MousePointer }
                  ].map((guardrail) => {
                    const Icon = guardrail.icon;
                    return (
                      <Card key={guardrail.type} className="border-dashed">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{guardrail.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input type="number" placeholder="Set limit" className="h-8" />
                            <Button size="sm" variant="outline">Set</Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
