import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, Target, 
  Users, MousePointer, Eye, ArrowUpRight, ArrowDownRight,
  AlertTriangle, CheckCircle, Info, Lightbulb, RefreshCw
} from "lucide-react";

interface UnifiedMetrics {
  overview: {
    totalSpend: number;
    totalRevenue: number;
    roas: number;
    roi: number;
    conversions: number;
    costPerConversion: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpm: number;
  };
  byChannel: Array<{
    channel: string;
    spend: number;
    revenue: number;
    roas: number;
    conversions: number;
    cpa: number;
    impressions: number;
    clicks: number;
    ctr: number;
    contribution: number;
  }>;
  byVertical: Array<{
    vertical: string;
    spend: number;
    revenue: number;
    roas: number;
    activities: number;
    performance: number;
  }>;
  trends: Array<{
    date: string;
    spend: number;
    revenue: number;
    conversions: number;
    roas: number;
  }>;
}

interface KPIDashboard {
  kpis: Array<{
    id: string;
    name: string;
    value: number;
    previousValue: number;
    change: number;
    changePercent: number;
    target?: number;
    status: 'on_track' | 'at_risk' | 'off_track';
  }>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'critical' | 'info';
    message: string;
    metric: string;
    timestamp: string;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    action: string;
  }>;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number): string {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
  return value.toFixed(0);
}

function MetricCard({ title, value, change, changePercent, icon: Icon, format = 'number' }: {
  title: string;
  value: number;
  change?: number;
  changePercent?: number;
  icon: any;
  format?: 'number' | 'currency' | 'percent' | 'multiplier';
}) {
  const isPositive = (change || 0) >= 0;
  const formattedValue = format === 'currency' ? formatCurrency(value) 
    : format === 'percent' ? `${value.toFixed(2)}%`
    : format === 'multiplier' ? `${value.toFixed(2)}x`
    : formatNumber(value);

  return (
    <Card className="hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-default">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold mt-2">{formattedValue}</p>
            {changePercent !== undefined && (
              <div className={`flex items-center text-sm mt-2 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                <span>{Math.abs(changePercent).toFixed(1)}% vs last period</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ml-4 flex-shrink-0 ${isPositive ? 'bg-green-100' : 'bg-blue-100'}`}>
            <Icon className={`h-6 w-6 ${isPositive ? 'text-green-600' : 'text-blue-600'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChannelPerformanceTable({ channels }: { channels: UnifiedMetrics['byChannel'] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">Channel</th>
            <th className="text-right p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">Spend</th>
            <th className="text-right p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">Revenue</th>
            <th className="text-right p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">ROAS</th>
            <th className="text-right p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">Conversions</th>
            <th className="text-right p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">CPA</th>
            <th className="text-right p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">CTR</th>
            <th className="text-right p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">Contribution</th>
          </tr>
        </thead>
        <tbody>
          {channels.map((channel, idx) => (
            <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    channel.roas >= 2 ? 'bg-green-500' : channel.roas >= 1 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="capitalize font-medium text-sm">{channel.channel.replace('_', ' ')}</span>
                </div>
              </td>
              <td className="text-right p-4 text-sm">{formatCurrency(channel.spend)}</td>
              <td className="text-right p-4 text-sm">{formatCurrency(channel.revenue)}</td>
              <td className="text-right p-4">
                <Badge className={`${
                  channel.roas >= 2 ? 'bg-green-100 text-green-700 hover:bg-green-200' : 
                  channel.roas >= 1 ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 
                  'bg-red-100 text-red-700 hover:bg-red-200'
                }`}>
                  {channel.roas.toFixed(2)}x
                </Badge>
              </td>
              <td className="text-right p-4 text-sm">{channel.conversions}</td>
              <td className="text-right p-4 text-sm">{formatCurrency(channel.cpa)}</td>
              <td className="text-right p-4 text-sm">{channel.ctr.toFixed(2)}%</td>
              <td className="text-right p-4">
                <div className="flex items-center gap-2">
                  <Progress value={channel.contribution} className="w-16 h-2" />
                  <span className="text-sm text-muted-foreground">{channel.contribution.toFixed(0)}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VerticalPerformanceCards({ verticals }: { verticals: UnifiedMetrics['byVertical'] }) {
  const verticalIcons: Record<string, string> = {
    social: '📱', seo: '🔍', performance_ads: '📊', email: '📧',
    whatsapp: '💬', linkedin_b2b: '💼', web: '🌐'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {verticals.map((vertical, idx) => (
        <Card key={idx} className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{verticalIcons[vertical.vertical] || '📈'}</span>
              <div>
                <h4 className="font-semibold capitalize">{vertical.vertical.replace('_', ' ')}</h4>
                <p className="text-sm text-muted-foreground">{vertical.activities} activities</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Spend</span>
                <span className="font-medium">{formatCurrency(vertical.spend)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Revenue</span>
                <span className="font-medium">{formatCurrency(vertical.revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ROAS</span>
                <Badge variant={vertical.roas >= 2.5 ? 'default' : 'secondary'}>
                  {vertical.roas.toFixed(2)}x
                </Badge>
              </div>
              <Progress value={vertical.performance} className="mt-2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function KPIAlerts({ alerts, recommendations }: { alerts: KPIDashboard['alerts']; recommendations: KPIDashboard['recommendations'] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border ${
                alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-2">
                  {alert.type === 'critical' ? <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" /> :
                   alert.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" /> :
                   <Info className="h-4 w-4 text-blue-600 mt-0.5" />}
                  <div>
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">Metric: {alert.metric}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" /> AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-3 rounded-lg border bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <Badge variant={rec.impact === 'high' ? 'default' : 'secondary'} className="text-xs">
                        {rec.impact} impact
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="mt-2 text-xs">
                  {rec.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UnifiedAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [selectedVertical, setSelectedVertical] = useState('all');

  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery<{ data: UnifiedMetrics }>({
    queryKey: ['/api/unified-analytics/metrics', dateRange],
    refetchInterval: 60000
  });

  const { data: kpis, isLoading: kpisLoading } = useQuery<{ data: KPIDashboard }>({
    queryKey: ['/api/unified-analytics/kpis'],
    refetchInterval: 60000
  });

  const isLoading = metricsLoading || kpisLoading;
  const overview = metrics?.data?.overview;
  const channels = metrics?.data?.byChannel || [];
  const verticals = metrics?.data?.byVertical || [];
  const alerts = kpis?.data?.alerts || [];
  const recommendations = kpis?.data?.recommendations || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Unified Analytics</h1>
              <p className="text-muted-foreground">Enterprise Marketing Intelligence — Cross-vertical ROI, ROAS & Performance Analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => refetchMetrics()}>
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard 
                title="Total Spend" 
                value={overview?.totalSpend || 0} 
                changePercent={12.5}
                icon={DollarSign} 
                format="currency" 
              />
              <MetricCard 
                title="Total Revenue" 
                value={overview?.totalRevenue || 0} 
                changePercent={18.2}
                icon={TrendingUp} 
                format="currency" 
              />
              <MetricCard 
                title="ROAS" 
                value={overview?.roas || 0} 
                changePercent={5.8}
                icon={Target} 
                format="multiplier" 
              />
              <MetricCard 
                title="ROI" 
                value={overview?.roi || 0} 
                changePercent={8.3}
                icon={BarChart3} 
                format="percent" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard 
                title="Conversions" 
                value={overview?.conversions || 0} 
                changePercent={15.2}
                icon={CheckCircle} 
              />
              <MetricCard 
                title="Cost Per Conversion" 
                value={overview?.costPerConversion || 0} 
                changePercent={-8.5}
                icon={DollarSign} 
                format="currency" 
              />
              <MetricCard 
                title="CTR" 
                value={overview?.ctr || 0} 
                changePercent={3.2}
                icon={MousePointer} 
                format="percent" 
              />
              <MetricCard 
                title="Impressions" 
                value={overview?.impressions || 0} 
                changePercent={22.1}
                icon={Eye} 
              />
            </div>

            <Tabs defaultValue="channels" className="space-y-4">
              <TabsList>
                <TabsTrigger value="channels">Channel Performance</TabsTrigger>
                <TabsTrigger value="verticals">Vertical Performance</TabsTrigger>
                <TabsTrigger value="insights">AI-Powered Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="channels">
                <Card>
                  <CardHeader>
                    <CardTitle>Channel Performance Breakdown</CardTitle>
                    <CardDescription>Compare ROI across all marketing channels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChannelPerformanceTable channels={channels} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="verticals">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Performance by Marketing Vertical</h3>
                  <VerticalPerformanceCards verticals={verticals} />
                </div>
              </TabsContent>

              <TabsContent value="insights">
                <KPIAlerts alerts={alerts} recommendations={recommendations} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
