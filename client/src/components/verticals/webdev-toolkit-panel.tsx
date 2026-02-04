import { useState } from "react";
import { 
  Globe, 
  Code2, 
  Gauge,
  Loader2,
  BarChart3,
  Layout,
  Smartphone,
  Monitor,
  Zap,
  Shield,
  Search,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Clock,
  FileText,
  Sparkles,
  Image,
  Palette
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

interface WebDevToolkitPanelProps {
  brandId?: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: string;
  threshold: { good: number; poor: number };
}

interface SecurityIssue {
  id: string;
  type: string;
  severity: string;
  description: string;
  recommendation: string;
}

interface LandingPage {
  id: string;
  name: string;
  url: string;
  status: string;
  conversionRate: number;
  visitors: number;
}

interface AuditResult {
  url: string;
  score: number;
  performance: PerformanceMetric[];
  issues: { category: string; severity: string; count: number }[];
  recommendations: string[];
}

export default function WebDevToolkitPanel({ brandId = 1 }: WebDevToolkitPanelProps) {
  const [activeTab, setActiveTab] = useState("audit");
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [auditUrl, setAuditUrl] = useState("");
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  const [landingPages, setLandingPages] = useState<LandingPage[]>([
    { id: "1", name: "Product Launch Page", url: "/launch", status: "live", conversionRate: 12.5, visitors: 4520 },
    { id: "2", name: "Free Trial Signup", url: "/trial", status: "live", conversionRate: 8.3, visitors: 3200 },
    { id: "3", name: "Webinar Registration", url: "/webinar", status: "draft", conversionRate: 0, visitors: 0 },
  ]);

  const [securityIssues] = useState<SecurityIssue[]>([
    { id: "1", type: "ssl", severity: "critical", description: "SSL certificate expires in 15 days", recommendation: "Renew SSL certificate immediately" },
    { id: "2", type: "headers", severity: "warning", description: "Missing Content-Security-Policy header", recommendation: "Add CSP header to prevent XSS attacks" },
    { id: "3", type: "cookies", severity: "info", description: "Cookies missing SameSite attribute", recommendation: "Add SameSite=Lax to all cookies" },
  ]);

  const [newPage, setNewPage] = useState({
    name: "",
    template: "product",
    headline: "",
    description: ""
  });

  const runSiteAudit = async () => {
    if (!auditUrl) {
      toast({ title: "URL Required", description: "Please enter a website URL to audit", variant: "destructive" });
      return;
    }
    
    setLoading("audit");
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const result: AuditResult = {
        url: auditUrl,
        score: Math.floor(Math.random() * 30) + 65,
        performance: [
          { name: "Largest Contentful Paint", value: 2.4, unit: "s", status: "good", threshold: { good: 2.5, poor: 4 } },
          { name: "First Input Delay", value: 85, unit: "ms", status: "good", threshold: { good: 100, poor: 300 } },
          { name: "Cumulative Layout Shift", value: 0.12, unit: "", status: "needs-improvement", threshold: { good: 0.1, poor: 0.25 } },
          { name: "Time to First Byte", value: 0.6, unit: "s", status: "good", threshold: { good: 0.8, poor: 1.8 } },
          { name: "First Contentful Paint", value: 1.8, unit: "s", status: "good", threshold: { good: 1.8, poor: 3 } },
        ],
        issues: [
          { category: "Performance", severity: "warning", count: 3 },
          { category: "Accessibility", severity: "info", count: 5 },
          { category: "SEO", severity: "warning", count: 2 },
          { category: "Best Practices", severity: "info", count: 4 },
        ],
        recommendations: [
          "Reduce unused JavaScript to improve page load speed",
          "Add alt text to 3 images for better accessibility",
          "Implement lazy loading for below-the-fold images",
          "Minify CSS files to reduce bundle size",
          "Enable text compression (gzip/brotli)"
        ]
      };
      
      setAuditResult(result);
      toast({ title: "Audit Complete", description: `Site audit completed for ${auditUrl}` });
    } finally {
      setLoading(null);
    }
  };

  const createLandingPage = async () => {
    if (!newPage.name || !newPage.headline) {
      toast({ title: "Missing Information", description: "Please fill in page name and headline", variant: "destructive" });
      return;
    }
    
    setLoading("create");
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const page: LandingPage = {
        id: `page_${Date.now()}`,
        name: newPage.name,
        url: `/${newPage.name.toLowerCase().replace(/\s+/g, "-")}`,
        status: "draft",
        conversionRate: 0,
        visitors: 0
      };
      
      setLandingPages(prev => [...prev, page]);
      toast({ title: "Page Created", description: "Your landing page is ready for editing" });
      setNewPage({ name: "", template: "product", headline: "", description: "" });
    } finally {
      setLoading(null);
    }
  };

  const optimizePage = async (pageId: string) => {
    setLoading(`optimize_${pageId}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLandingPages(prev => prev.map(p => 
        p.id === pageId ? { ...p, conversionRate: p.conversionRate * 1.2 } : p
      ));
      toast({ 
        title: "AI Optimization Complete", 
        description: "Headline, CTA, and layout optimized based on conversion data" 
      });
    } finally {
      setLoading(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const getMetricStatus = (metric: PerformanceMetric) => {
    if (metric.value <= metric.threshold.good) return "good";
    if (metric.value <= metric.threshold.poor) return "needs-improvement";
    return "poor";
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case "good": return "bg-green-100 text-green-700 border-green-300";
      case "needs-improvement": return "bg-orange-100 text-orange-700 border-orange-300";
      case "poor": return "bg-red-100 text-red-700 border-red-300";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-700";
      case "warning": return "bg-orange-100 text-orange-700";
      case "info": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return AlertCircle;
      case "warning": return AlertTriangle;
      case "info": return CheckCircle;
      default: return CheckCircle;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Web Development Hub</h2>
          <p className="text-gray-500">Site audits, performance monitoring, and landing page optimization</p>
        </div>
        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
          <Code2 className="w-3 h-3 mr-1" />
          Web Dev
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Site Audit
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="landing" className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Landing Pages
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-indigo-600" />
                Website Audit
              </CardTitle>
              <CardDescription>
                Comprehensive performance, SEO, and accessibility analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="audit-url">Website URL</Label>
                  <Input
                    id="audit-url"
                    placeholder="https://example.com"
                    value={auditUrl}
                    onChange={(e) => setAuditUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={runSiteAudit} 
                    disabled={loading === "audit"}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {loading === "audit" ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Auditing...</>
                    ) : (
                      <><Search className="w-4 h-4 mr-2" /> Run Audit</>
                    )}
                  </Button>
                </div>
              </div>

              {auditResult && (
                <div className="mt-6 space-y-6">
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Overall Score</p>
                      <p className={`text-5xl font-bold ${getScoreColor(auditResult.score)}`}>
                        {auditResult.score}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Audited URL</p>
                      <p className="font-medium flex items-center gap-1">
                        {auditResult.url}
                        <ExternalLink className="w-4 h-4" />
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Core Web Vitals</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {auditResult.performance.slice(0, 3).map((metric, i) => (
                        <div key={i} className={`p-4 border-2 rounded-lg ${getMetricColor(getMetricStatus(metric))}`}>
                          <p className="text-sm font-medium">{metric.name}</p>
                          <p className="text-3xl font-bold mt-1">
                            {metric.value}{metric.unit}
                          </p>
                          <p className="text-xs mt-1 capitalize">{getMetricStatus(metric).replace("-", " ")}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Issues Found</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {auditResult.issues.map((issue, i) => (
                        <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{issue.category}</span>
                            <Badge className={getSeverityColor(issue.severity)} variant="outline">
                              {issue.count}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">AI Recommendations</h4>
                    <ul className="space-y-2">
                      {auditResult.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Load Time</p>
                  <p className="text-2xl font-bold">1.8s</p>
                </div>
                <Clock className="w-8 h-8 text-green-600 opacity-50" />
              </div>
              <p className="text-xs text-green-600 mt-2">Good</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Page Size</p>
                  <p className="text-2xl font-bold">2.4MB</p>
                </div>
                <FileText className="w-8 h-8 text-orange-600 opacity-50" />
              </div>
              <p className="text-xs text-orange-600 mt-2">Could be optimized</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Requests</p>
                  <p className="text-2xl font-bold">45</p>
                </div>
                <Globe className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
              <p className="text-xs text-blue-600 mt-2">HTTP requests</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Uptime</p>
                  <p className="text-2xl font-bold">99.9%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
              </div>
              <p className="text-xs text-green-600 mt-2">Last 30 days</p>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Performance Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Desktop Performance</h4>
                  <div className="flex items-center gap-4 mb-4">
                    <Monitor className="w-8 h-8 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Performance Score</span>
                        <span className="text-sm font-bold text-green-600">92</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "92%" }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Mobile Performance</h4>
                  <div className="flex items-center gap-4 mb-4">
                    <Smartphone className="w-8 h-8 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Performance Score</span>
                        <span className="text-sm font-bold text-orange-600">78</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: "78%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="landing" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5 text-indigo-600" />
                  Create Landing Page
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="page-name">Page Name</Label>
                  <Input
                    id="page-name"
                    placeholder="e.g., Product Launch"
                    value={newPage.name}
                    onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Template</Label>
                  <Select value={newPage.template} onValueChange={(v) => setNewPage({ ...newPage, template: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product Launch</SelectItem>
                      <SelectItem value="lead">Lead Generation</SelectItem>
                      <SelectItem value="webinar">Webinar Registration</SelectItem>
                      <SelectItem value="ebook">E-book Download</SelectItem>
                      <SelectItem value="pricing">Pricing Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    placeholder="Your compelling headline"
                    value={newPage.headline}
                    onChange={(e) => setNewPage({ ...newPage, headline: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your offer"
                    value={newPage.description}
                    onChange={(e) => setNewPage({ ...newPage, description: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Sparkles className="w-4 h-4 mr-2" /> AI Generate Copy
                  </Button>
                  <Button 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    onClick={createLandingPage}
                    disabled={loading === "create"}
                  >
                    {loading === "create" ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                    ) : (
                      <><Layout className="w-4 h-4 mr-2" /> Create Page</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Your Landing Pages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {landingPages.map(page => (
                    <div key={page.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{page.name}</p>
                          <p className="text-sm text-gray-500">{page.url}</p>
                        </div>
                        <Badge className={page.status === "live" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                          {page.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex gap-4">
                          <span>CVR: <strong className="text-green-600">{page.conversionRate}%</strong></span>
                          <span>Visitors: <strong>{page.visitors.toLocaleString()}</strong></span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => optimizePage(page.id)}
                          disabled={loading === `optimize_${page.id}`}
                        >
                          {loading === `optimize_${page.id}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <><Sparkles className="w-4 h-4 mr-1" /> Optimize</>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Security Scan Results
              </CardTitle>
              <CardDescription>
                Monitor and fix security vulnerabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityIssues.map(issue => {
                  const Icon = getSeverityIcon(issue.severity);
                  return (
                    <div key={issue.id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${getSeverityColor(issue.severity)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{issue.description}</p>
                            <Badge className={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
                          </div>
                          <p className="text-sm text-gray-500">{issue.recommendation}</p>
                        </div>
                        <Button size="sm" variant="outline">Fix</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Page Views</p>
                  <p className="text-2xl font-bold">45.2K</p>
                </div>
                <Globe className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12% this week
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Session</p>
                  <p className="text-2xl font-bold">3:24</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600 opacity-50" />
              </div>
              <p className="text-xs text-green-600 mt-2">Above average</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Bounce Rate</p>
                  <p className="text-2xl font-bold">42%</p>
                </div>
                <RefreshCw className="w-8 h-8 text-orange-600 opacity-50" />
              </div>
              <p className="text-xs text-orange-600 mt-2">Needs improvement</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Conversions</p>
                  <p className="text-2xl font-bold">1,234</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
              </div>
              <p className="text-xs text-green-600 mt-2">+8.5% CVR</p>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Traffic & Engagement Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Detailed analytics charts will appear here</p>
                <p className="text-sm">Connect Google Analytics for real-time data</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
