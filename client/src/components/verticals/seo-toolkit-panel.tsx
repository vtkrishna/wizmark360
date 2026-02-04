import { useState } from "react";
import { 
  Globe, 
  Search, 
  TrendingUp, 
  Link2, 
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Target,
  Sparkles,
  BarChart3,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SEOToolkitPanelProps {
  brandId?: number;
}

interface AuditResult {
  id: string;
  url: string;
  score: number;
  issues: { category: string; severity: string; count: number }[];
  coreWebVitals: { lcp: number; fid: number; cls: number };
  recommendations: string[];
}

interface KeywordResult {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  intent: string;
  trend: string;
}

interface BacklinkResult {
  domain: string;
  authority: number;
  backlinks: number;
  referringDomains: number;
  dofollow: number;
  nofollow: number;
}

export default function SEOToolkitPanel({ brandId = 1 }: SEOToolkitPanelProps) {
  const [activeTab, setActiveTab] = useState("audit");
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [auditUrl, setAuditUrl] = useState("");
  const [auditResults, setAuditResults] = useState<AuditResult | null>(null);
  
  const [keyword, setKeyword] = useState("");
  const [keywordResults, setKeywordResults] = useState<KeywordResult[]>([]);
  
  const [backlinkDomain, setBacklinkDomain] = useState("");
  const [backlinkResults, setBacklinkResults] = useState<BacklinkResult | null>(null);
  
  const [competitorUrls, setCompetitorUrls] = useState("");
  const [trackingKeywords, setTrackingKeywords] = useState("");

  const runTechnicalAudit = async () => {
    if (!auditUrl) {
      toast({ title: "URL Required", description: "Please enter a website URL to audit", variant: "destructive" });
      return;
    }
    
    setLoading("audit");
    try {
      const response = await fetch("/api/seo/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: String(brandId), url: auditUrl })
      });
      
      const data = await response.json();
      if (data.success) {
        setAuditResults(data.data);
        toast({ title: "Audit Complete", description: `Technical SEO audit completed for ${auditUrl}` });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({ title: "Audit Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const researchKeywords = async () => {
    if (!keyword) {
      toast({ title: "Keyword Required", description: "Please enter a keyword to research", variant: "destructive" });
      return;
    }
    
    setLoading("keyword");
    try {
      const response = await fetch(`/api/seo/keywords/research?keyword=${encodeURIComponent(keyword)}&includeRelated=true&includeQuestions=true`);
      const data = await response.json();
      
      if (data.success) {
        setKeywordResults(data.data.keywords || [data.data]);
        toast({ title: "Research Complete", description: `Found keyword data for "${keyword}"` });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({ title: "Research Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const analyzeBacklinks = async () => {
    if (!backlinkDomain) {
      toast({ title: "Domain Required", description: "Please enter a domain to analyze", variant: "destructive" });
      return;
    }
    
    setLoading("backlinks");
    try {
      const response = await fetch("/api/seo/backlinks/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: String(brandId), domain: backlinkDomain })
      });
      
      const data = await response.json();
      if (data.success) {
        setBacklinkResults(data.data);
        toast({ title: "Analysis Complete", description: `Backlink profile analyzed for ${backlinkDomain}` });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({ title: "Analysis Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const trackRankings = async () => {
    if (!trackingKeywords || !auditUrl) {
      toast({ title: "Input Required", description: "Please enter both domain and keywords to track", variant: "destructive" });
      return;
    }
    
    setLoading("rankings");
    try {
      const keywords = trackingKeywords.split(",").map(k => k.trim());
      const response = await fetch("/api/seo/rankings/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          brandId: String(brandId), 
          domain: auditUrl,
          keywords,
          location: "India",
          device: "desktop"
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast({ title: "Tracking Started", description: `Now tracking ${keywords.length} keywords for ${auditUrl}` });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({ title: "Tracking Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return "bg-green-100 text-green-700";
    if (difficulty <= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SEO Toolkit</h2>
          <p className="text-gray-500">Technical audits, keyword research, and backlink analysis</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Globe className="w-3 h-3 mr-1" />
          SEO & GEO
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Site Audit
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Keywords
          </TabsTrigger>
          <TabsTrigger value="backlinks" className="flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Backlinks
          </TabsTrigger>
          <TabsTrigger value="competitors" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Competitors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Technical SEO Audit
              </CardTitle>
              <CardDescription>
                Enter your website URL to run a comprehensive technical SEO audit
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
                    onClick={runTechnicalAudit} 
                    disabled={loading === "audit"}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading === "audit" ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Auditing...</>
                    ) : (
                      <><BarChart3 className="w-4 h-4 mr-2" /> Run Audit</>
                    )}
                  </Button>
                </div>
              </div>

              {auditResults && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Overall SEO Score</p>
                      <p className={`text-4xl font-bold ${getScoreColor(auditResults.score)}`}>
                        {auditResults.score}/100
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Audited URL</p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        {auditResults.url}
                        <ExternalLink className="w-3 h-3" />
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-white dark:bg-gray-800 border rounded-lg">
                      <p className="text-xs text-gray-500 uppercase">LCP</p>
                      <p className="text-2xl font-bold">{auditResults.coreWebVitals.lcp}s</p>
                      <p className="text-xs text-gray-400">Largest Contentful Paint</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 border rounded-lg">
                      <p className="text-xs text-gray-500 uppercase">FID</p>
                      <p className="text-2xl font-bold">{auditResults.coreWebVitals.fid}ms</p>
                      <p className="text-xs text-gray-400">First Input Delay</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 border rounded-lg">
                      <p className="text-xs text-gray-500 uppercase">CLS</p>
                      <p className="text-2xl font-bold">{auditResults.coreWebVitals.cls}</p>
                      <p className="text-xs text-gray-400">Cumulative Layout Shift</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Issues Found</h4>
                    <div className="space-y-2">
                      {auditResults.issues.map((issue, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            {issue.severity === "critical" ? (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            ) : issue.severity === "warning" ? (
                              <AlertCircle className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            <span className="font-medium">{issue.category}</span>
                          </div>
                          <Badge variant={issue.severity === "critical" ? "destructive" : "secondary"}>
                            {issue.count} issues
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {auditResults.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
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

        <TabsContent value="keywords" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                Keyword Research
              </CardTitle>
              <CardDescription>
                Discover high-value keywords with search volume, difficulty, and intent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="keyword">Seed Keyword</Label>
                  <Input
                    id="keyword"
                    placeholder="e.g., digital marketing agency India"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={researchKeywords} 
                    disabled={loading === "keyword"}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading === "keyword" ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Researching...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" /> Research</>
                    )}
                  </Button>
                </div>
              </div>

              {keywordResults.length > 0 && (
                <div className="mt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium">Keyword</th>
                          <th className="text-right py-3 px-2 font-medium">Volume</th>
                          <th className="text-right py-3 px-2 font-medium">Difficulty</th>
                          <th className="text-right py-3 px-2 font-medium">CPC</th>
                          <th className="text-left py-3 px-2 font-medium">Intent</th>
                          <th className="text-left py-3 px-2 font-medium">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {keywordResults.map((kw, i) => (
                          <tr key={i} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-3 px-2 font-medium">{kw.keyword}</td>
                            <td className="py-3 px-2 text-right">{kw.searchVolume.toLocaleString()}</td>
                            <td className="py-3 px-2 text-right">
                              <Badge className={getDifficultyColor(kw.difficulty)}>
                                {kw.difficulty}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-right">${kw.cpc.toFixed(2)}</td>
                            <td className="py-3 px-2">
                              <Badge variant="outline">{kw.intent}</Badge>
                            </td>
                            <td className="py-3 px-2">
                              <TrendingUp className={`w-4 h-4 ${kw.trend === "up" ? "text-green-500" : "text-gray-400"}`} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backlinks" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-purple-600" />
                Backlink Analysis
              </CardTitle>
              <CardDescription>
                Analyze your backlink profile and find link-building opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="backlink-domain">Domain</Label>
                  <Input
                    id="backlink-domain"
                    placeholder="example.com"
                    value={backlinkDomain}
                    onChange={(e) => setBacklinkDomain(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={analyzeBacklinks} 
                    disabled={loading === "backlinks"}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {loading === "backlinks" ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Link2 className="w-4 h-4 mr-2" /> Analyze</>
                    )}
                  </Button>
                </div>
              </div>

              {backlinkResults && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                    <p className="text-3xl font-bold text-purple-600">{backlinkResults.authority}</p>
                    <p className="text-sm text-gray-500">Domain Authority</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-600">{backlinkResults.backlinks.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total Backlinks</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">{backlinkResults.referringDomains}</p>
                    <p className="text-sm text-gray-500">Referring Domains</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-lg font-bold">
                      <span className="text-green-600">{backlinkResults.dofollow}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-gray-500">{backlinkResults.nofollow}</span>
                    </p>
                    <p className="text-sm text-gray-500">DoFollow / NoFollow</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-600" />
                Competitor Analysis
              </CardTitle>
              <CardDescription>
                Track competitor rankings and identify content gaps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="your-domain">Your Domain</Label>
                  <Input
                    id="your-domain"
                    placeholder="https://yourdomain.com"
                    value={auditUrl}
                    onChange={(e) => setAuditUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="competitors">Competitor URLs (comma separated)</Label>
                  <Input
                    id="competitors"
                    placeholder="competitor1.com, competitor2.com, competitor3.com"
                    value={competitorUrls}
                    onChange={(e) => setCompetitorUrls(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tracking-keywords">Keywords to Track (comma separated)</Label>
                  <Input
                    id="tracking-keywords"
                    placeholder="keyword 1, keyword 2, keyword 3"
                    value={trackingKeywords}
                    onChange={(e) => setTrackingKeywords(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={trackRankings} 
                  disabled={loading === "rankings"}
                  className="bg-orange-600 hover:bg-orange-700 w-fit"
                >
                  {loading === "rankings" ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up...</>
                  ) : (
                    <><Users className="w-4 h-4 mr-2" /> Start Competitor Tracking</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
