import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
  Minus,
  MessageSquare,
  Sparkles,
  Bot,
  Zap,
  Target,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Plus,
  Trash2,
  RefreshCw,
  FileText,
  Eye
} from 'lucide-react';

interface AIVisibilityDashboardProps {
  brandId?: string;
  brandName?: string;
}

interface Platform {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface VisibilityScore {
  platform: string;
  overallScore: number;
  mentionRate: number;
  sentimentScore: number;
  positionScore: number;
  trend: 'improving' | 'stable' | 'declining';
  trendPercentage: number;
}

interface TrackingQuery {
  id: string;
  query: string;
  category: string;
  priority: string;
  frequency: string;
  isActive: boolean;
}

interface Insight {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: string;
  actionItems: string[];
  relatedPlatforms: string[];
}

const platformIcons: Record<string, React.ReactNode> = {
  chatgpt: <MessageSquare className="h-5 w-5" />,
  perplexity: <Search className="h-5 w-5" />,
  gemini: <Sparkles className="h-5 w-5" />,
  claude: <Bot className="h-5 w-5" />,
  copilot: <Zap className="h-5 w-5" />
};

export function AIVisibilityDashboard({ 
  brandId = '1', 
  brandName = 'Your Brand' 
}: AIVisibilityDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newQuery, setNewQuery] = useState('');
  const [newCategory, setNewCategory] = useState('product');
  const [checkQuery, setCheckQuery] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['chatgpt', 'perplexity', 'gemini']);

  const { data: platforms } = useQuery({
    queryKey: ['ai-visibility-platforms'],
    queryFn: async () => {
      const res = await fetch('/api/ai-visibility/platforms');
      const data = await res.json();
      return data.data as Platform[];
    }
  });

  const { data: scores, isLoading: scoresLoading } = useQuery({
    queryKey: ['ai-visibility-scores', brandId],
    queryFn: async () => {
      const res = await fetch(`/api/ai-visibility/score/${brandId}?brandName=${encodeURIComponent(brandName)}`);
      const data = await res.json();
      return data.data as VisibilityScore[];
    }
  });

  const { data: trackingQueries, isLoading: queriesLoading } = useQuery({
    queryKey: ['ai-visibility-queries', brandId],
    queryFn: async () => {
      const res = await fetch(`/api/ai-visibility/tracking-queries/${brandId}`);
      const data = await res.json();
      return data.data as TrackingQuery[];
    }
  });

  const { data: insights } = useQuery({
    queryKey: ['ai-visibility-insights', brandId],
    queryFn: async () => {
      const res = await fetch(`/api/ai-visibility/insights/${brandId}?brandName=${encodeURIComponent(brandName)}`);
      const data = await res.json();
      return data.data as Insight[];
    }
  });

  const addQueryMutation = useMutation({
    mutationFn: async (queryData: { query: string; category: string }) => {
      const res = await fetch('/api/ai-visibility/tracking-queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          query: queryData.query,
          category: queryData.category,
          priority: 'medium',
          frequency: 'weekly'
        })
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-visibility-queries'] });
      setNewQuery('');
      toast({
        title: 'Query Added',
        description: 'Your tracking query has been added successfully.'
      });
    }
  });

  const removeQueryMutation = useMutation({
    mutationFn: async (queryId: string) => {
      const res = await fetch(`/api/ai-visibility/tracking-queries/${brandId}/${queryId}`, {
        method: 'DELETE'
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-visibility-queries'] });
      toast({
        title: 'Query Removed',
        description: 'Tracking query has been removed.'
      });
    }
  });

  const checkVisibilityMutation = useMutation({
    mutationFn: async (query: string) => {
      const res = await fetch('/api/ai-visibility/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          brandName,
          query,
          platforms: selectedPlatforms
        })
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Visibility Check Complete',
        description: data.message
      });
    }
  });

  const overallScore = scores?.length 
    ? Math.round(scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length)
    : 0;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Lightbulb className="h-5 w-5 text-green-500" />;
      case 'threat': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'trend': return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'recommendation': return <Target className="h-5 w-5 text-purple-500" />;
      default: return <Eye className="h-5 w-5" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return <Badge variant="destructive">High Impact</Badge>;
      case 'medium': return <Badge variant="secondary">Medium Impact</Badge>;
      case 'low': return <Badge variant="outline">Low Impact</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Visibility Tracker</h1>
          <p className="text-muted-foreground">
            Monitor how your brand appears in AI search engines like ChatGPT, Perplexity, and Gemini
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['ai-visibility-scores'] })}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Visibility</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallScore}%</div>
            <Progress value={overallScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Across {scores?.length || 0} AI platforms
            </p>
          </CardContent>
        </Card>

        {scores?.slice(0, 3).map(score => (
          <Card key={score.platform}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize flex items-center gap-2">
                {platformIcons[score.platform]}
                {score.platform}
              </CardTitle>
              {getTrendIcon(score.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{score.overallScore}%</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span className={score.trendPercentage >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {score.trendPercentage >= 0 ? '+' : ''}{score.trendPercentage}%
                </span>
                <span className="ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="check" className="space-y-4">
        <TabsList>
          <TabsTrigger value="check">Check Visibility</TabsTrigger>
          <TabsTrigger value="tracking">Tracking Queries</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="platforms">Platform Scores</TabsTrigger>
        </TabsList>

        <TabsContent value="check" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Check Your Brand Visibility</CardTitle>
              <CardDescription>
                Enter a search query to see how your brand appears in AI search results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="check-query">Search Query</Label>
                  <Input
                    id="check-query"
                    placeholder="e.g., best marketing automation tools"
                    value={checkQuery}
                    onChange={(e) => setCheckQuery(e.target.value)}
                  />
                </div>
                <div className="w-48">
                  <Label>Platforms</Label>
                  <Select 
                    value={selectedPlatforms.join(',')} 
                    onValueChange={(v) => setSelectedPlatforms(v.split(','))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platforms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chatgpt,perplexity,gemini">All Platforms</SelectItem>
                      <SelectItem value="chatgpt">ChatGPT Only</SelectItem>
                      <SelectItem value="perplexity">Perplexity Only</SelectItem>
                      <SelectItem value="gemini">Gemini Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={() => checkVisibilityMutation.mutate(checkQuery)}
                disabled={!checkQuery || checkVisibilityMutation.isPending}
              >
                {checkVisibilityMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Check Visibility
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tracking Queries</CardTitle>
              <CardDescription>
                Add queries to automatically track your brand visibility over time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="new-query">New Query</Label>
                  <Input
                    id="new-query"
                    placeholder="e.g., best CRM software for startups"
                    value={newQuery}
                    onChange={(e) => setNewQuery(e.target.value)}
                  />
                </div>
                <div className="w-40">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="comparison">Comparison</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="how-to">How-to</SelectItem>
                      <SelectItem value="industry">Industry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => addQueryMutation.mutate({ query: newQuery, category: newCategory })}
                    disabled={!newQuery || addQueryMutation.isPending}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Query
                  </Button>
                </div>
              </div>

              <Separator />

              <ScrollArea className="h-64">
                {queriesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : trackingQueries?.length ? (
                  <div className="space-y-2">
                    {trackingQueries.map(query => (
                      <div 
                        key={query.id} 
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{query.query}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{query.category}</Badge>
                            <Badge variant="secondary">{query.frequency}</Badge>
                            <Badge 
                              variant={query.priority === 'high' ? 'destructive' : 'outline'}
                            >
                              {query.priority}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQueryMutation.mutate(query.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <Search className="h-8 w-8 mb-2" />
                    <p>No tracking queries yet</p>
                    <p className="text-sm">Add queries to start monitoring your visibility</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {insights?.map(insight => (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                    </div>
                    {getImpactBadge(insight.impact)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Recommended Actions:</p>
                    <ul className="text-sm space-y-1">
                      {insight.actionItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    {insight.relatedPlatforms.map(platform => (
                      <Badge key={platform} variant="outline" className="capitalize">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scoresLoading ? (
              <div className="col-span-full flex items-center justify-center h-32">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              scores?.map(score => (
                <Card key={score.platform}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize flex items-center gap-2">
                        {platformIcons[score.platform]}
                        {score.platform}
                      </CardTitle>
                      {getTrendIcon(score.trend)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Score</span>
                        <span className="font-medium">{score.overallScore}%</span>
                      </div>
                      <Progress value={score.overallScore} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/50 rounded-lg p-2">
                        <p className="text-lg font-bold">{score.mentionRate}%</p>
                        <p className="text-xs text-muted-foreground">Mention Rate</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <p className="text-lg font-bold">{score.sentimentScore}%</p>
                        <p className="text-xs text-muted-foreground">Sentiment</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <p className="text-lg font-bold">{score.positionScore}%</p>
                        <p className="text-xs text-muted-foreground">Position</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Trend</span>
                      <span className={`font-medium ${
                        score.trendPercentage >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {score.trendPercentage >= 0 ? '+' : ''}{score.trendPercentage}% vs last period
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AIVisibilityDashboard;
