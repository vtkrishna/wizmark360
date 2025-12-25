import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  DollarSign, 
  AlertTriangle,
  BarChart3,
  LineChart,
  Activity,
  Zap,
  RefreshCw
} from "lucide-react";

interface PredictionResult {
  id: string;
  predictionType: string;
  score: number;
  confidence: number;
  factors: Array<{
    name: string;
    value: number;
    impact: string;
    description: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: string;
    expectedImpact: number;
  }>;
}

interface VerticalInsights {
  vertical: string;
  healthScore: number;
  predictions: PredictionResult[];
  trends: Array<{ metric: string; trend: string; change: number }>;
  opportunities: Array<{ title: string; impact: number; effort: string }>;
  risks: Array<{ title: string; probability: number; severity: string }>;
}

interface ForecastData {
  date: string;
  value: number;
  lowerBound: number;
  upperBound: number;
}

export function PredictiveAnalyticsDashboard() {
  const [selectedVertical, setSelectedVertical] = useState<string>("social_media");
  const [selectedForecastType, setSelectedForecastType] = useState<string>("revenue");
  const brandId = "demo-brand-1";

  const { data: verticalInsights, isLoading: insightsLoading, refetch: refetchInsights } = useQuery<VerticalInsights>({
    queryKey: ["verticalInsights", selectedVertical, brandId],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/predictions/vertical/${selectedVertical}/insights?brandId=${brandId}`);
      if (!res.ok) throw new Error("Failed to fetch insights");
      return res.json();
    },
  });

  const forecastMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/analytics/predictions/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          forecastType: selectedForecastType,
          options: {
            horizon: 30,
            granularity: "daily",
            includeSeasonality: true
          }
        })
      });
      if (!res.ok) throw new Error("Failed to generate forecast");
      return res.json();
    }
  });

  const verticals = [
    { id: "social_media", name: "Social Media", icon: Users },
    { id: "seo_geo", name: "SEO/GEO", icon: Target },
    { id: "sales_sdr", name: "Sales/SDR", icon: DollarSign },
    { id: "performance_ads", name: "Performance Ads", icon: BarChart3 },
    { id: "linkedin_b2b", name: "LinkedIn B2B", icon: Activity },
    { id: "whatsapp", name: "WhatsApp", icon: Zap },
    { id: "web_development", name: "Web Development", icon: LineChart }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrendIcon = (trend: string) => {
    return trend === "increasing" ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : trend === "decreasing" ? (
      <TrendingDown className="h-4 w-4 text-red-500" />
    ) : (
      <Activity className="h-4 w-4 text-gray-500" />
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Predictive Analytics</h1>
          <p className="text-muted-foreground">AI-powered predictions and forecasting across all verticals</p>
        </div>
        <Button onClick={() => refetchInsights()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {verticals.map((vertical) => {
          const Icon = vertical.icon;
          return (
            <Button
              key={vertical.id}
              variant={selectedVertical === vertical.id ? "default" : "outline"}
              className="flex flex-col h-20 gap-1"
              onClick={() => setSelectedVertical(vertical.id)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs text-center">{vertical.name}</span>
            </Button>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(verticalInsights?.healthScore || 0)}`}>
                  {verticalInsights?.healthScore?.toFixed(0) || 0}%
                </div>
                <Progress value={verticalInsights?.healthScore || 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{verticalInsights?.predictions?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Running models</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {verticalInsights?.opportunities?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Growth areas identified</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {verticalInsights?.risks?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Areas needing attention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Key Trends</CardTitle>
                <CardDescription>Performance trends for {selectedVertical.replace("_", " ")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(verticalInsights?.trends || [
                    { metric: "Engagement Rate", trend: "increasing", change: 12.5 },
                    { metric: "Conversion Rate", trend: "stable", change: 2.1 },
                    { metric: "Cost per Lead", trend: "decreasing", change: -8.3 }
                  ]).map((trend, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(trend.trend)}
                        <span className="font-medium">{trend.metric}</span>
                      </div>
                      <span className={trend.change >= 0 ? "text-green-600" : "text-red-600"}>
                        {trend.change >= 0 ? "+" : ""}{trend.change.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>Suggested actions based on predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(verticalInsights?.predictions?.[0]?.recommendations || [
                    { title: "Optimize top-performing content", priority: "high", expectedImpact: 25 },
                    { title: "Expand audience targeting", priority: "medium", expectedImpact: 18 },
                    { title: "Test new creative formats", priority: "medium", expectedImpact: 15 }
                  ]).slice(0, 3).map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 border rounded-lg">
                      <Zap className="h-4 w-4 mt-1 text-yellow-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{rec.title}</span>
                          <Badge className={getPriorityColor(rec.priority)} variant="secondary">
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Expected impact: +{rec.expectedImpact}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { type: "lead_score", title: "Lead Scoring", description: "AI-powered lead qualification", icon: Target },
              { type: "content_performance", title: "Content Performance", description: "Predict engagement before posting", icon: BarChart3 },
              { type: "campaign_roi", title: "Campaign ROI", description: "Forecast campaign returns", icon: DollarSign },
              { type: "churn_risk", title: "Churn Risk", description: "Identify at-risk customers", icon: AlertTriangle },
              { type: "ad_performance", title: "Ad Performance", description: "Predict ad metrics", icon: TrendingUp },
              { type: "conversion_probability", title: "Conversion Probability", description: "Likelihood to convert", icon: Activity }
            ].map((pred) => {
              const Icon = pred.icon;
              return (
                <Card key={pred.type} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{pred.title}</CardTitle>
                        <CardDescription className="text-xs">{pred.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Model Accuracy</p>
                        <p className="text-2xl font-bold">87%</p>
                      </div>
                      <Button size="sm">Run Prediction</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue Forecast</CardTitle>
                  <CardDescription>30-day forecast with confidence intervals</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedForecastType} onValueChange={setSelectedForecastType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Forecast type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="conversions">Conversions</SelectItem>
                      <SelectItem value="traffic">Traffic</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => forecastMutation.mutate()} disabled={forecastMutation.isPending}>
                    {forecastMutation.isPending ? "Generating..." : "Generate Forecast"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {forecastMutation.data?.forecast ? (
                <div className="space-y-4">
                  <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
                    <div className="text-center space-y-2">
                      <LineChart className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Forecast generated with {forecastMutation.data.forecast.length} data points
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {forecastMutation.data.forecast.slice(0, 3).map((point: ForecastData, i: number) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">{point.date}</p>
                        <p className="text-xl font-bold">${point.value.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          Range: ${point.lowerBound.toLocaleString()} - ${point.upperBound.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
                  <div className="text-center space-y-2">
                    <LineChart className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Click "Generate Forecast" to create predictions</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Growth Opportunities</CardTitle>
              <CardDescription>AI-identified areas for improvement and growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(verticalInsights?.opportunities || [
                  { title: "Optimize top-performing content", impact: 25, effort: "low" },
                  { title: "Expand audience targeting", impact: 18, effort: "medium" },
                  { title: "Test new creative formats", impact: 15, effort: "medium" },
                  { title: "Implement A/B testing framework", impact: 12, effort: "high" }
                ]).map((opp, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-100 rounded-full">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{opp.title}</p>
                        <p className="text-sm text-muted-foreground">Effort: {opp.effort}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">+{opp.impact}%</p>
                      <p className="text-xs text-muted-foreground">Expected impact</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Alerts</CardTitle>
              <CardDescription>Potential issues that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(verticalInsights?.risks || [
                  { title: "Audience fatigue detected", probability: 0.65, severity: "high" },
                  { title: "Budget underutilization", probability: 0.45, severity: "medium" },
                  { title: "Creative performance declining", probability: 0.35, severity: "medium" }
                ]).map((risk, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        risk.severity === "high" ? "bg-red-100" : 
                        risk.severity === "medium" ? "bg-yellow-100" : "bg-gray-100"
                      }`}>
                        <AlertTriangle className={`h-5 w-5 ${
                          risk.severity === "high" ? "text-red-600" : 
                          risk.severity === "medium" ? "text-yellow-600" : "text-gray-600"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{risk.title}</p>
                        <p className="text-sm text-muted-foreground">Severity: {risk.severity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{(risk.probability * 100).toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">Probability</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
