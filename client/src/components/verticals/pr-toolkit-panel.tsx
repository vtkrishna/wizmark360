import { useState, useEffect } from "react";
import { 
  Megaphone, 
  Newspaper, 
  Users,
  Loader2,
  CheckCircle,
  Clock,
  FileText,
  AlertTriangle,
  BarChart3,
  Plus,
  Send,
  Eye,
  TrendingUp,
  TrendingDown,
  Globe,
  Building2,
  Mic,
  Video,
  Image,
  MessageSquare,
  Search,
  Filter,
  Sparkles,
  Target,
  Zap,
  Bell,
  Shield,
  Calendar
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

interface PRToolkitPanelProps {
  brandId?: number;
}

interface PressRelease {
  id: string;
  title: string;
  status: string;
  category: string;
  language: string;
  publishDate?: string;
  coverage: number;
  sentiment: string;
}

interface MediaMention {
  id: string;
  outlet: string;
  title: string;
  sentiment: string;
  reach: number;
  date: string;
  type: string;
}

interface Crisis {
  id: string;
  title: string;
  severity: string;
  status: string;
  detectedAt: string;
  responseTime?: string;
}

interface Journalist {
  id: string;
  name: string;
  outlet: string;
  beat: string;
  relationship: string;
  lastContact?: string;
}

export default function PRToolkitPanel({ brandId = 1 }: PRToolkitPanelProps) {
  const [activeTab, setActiveTab] = useState("command");
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [mediaMentions, setMediaMentions] = useState<MediaMention[]>([]);
  const [crises, setCrises] = useState<Crisis[]>([]);
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  
  const [newRelease, setNewRelease] = useState({
    title: "",
    type: "announcement",
    language: "en",
    content: ""
  });

  const releaseTypes = [
    { value: "announcement", label: "Company Announcement" },
    { value: "product", label: "Product Launch" },
    { value: "partnership", label: "Partnership" },
    { value: "financial", label: "Financial News" },
    { value: "executive", label: "Executive Appointment" },
    { value: "event", label: "Event" },
    { value: "crisis", label: "Crisis Response" },
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "kn", name: "Kannada" },
    { code: "ml", name: "Malayalam" },
    { code: "mr", name: "Marathi" },
    { code: "bn", name: "Bengali" },
    { code: "gu", name: "Gujarati" },
    { code: "pa", name: "Punjabi" },
    { code: "ur", name: "Urdu" },
    { code: "or", name: "Odia" },
  ];

  useEffect(() => {
    loadPressReleases();
    loadMediaMentions();
    loadCrises();
    loadJournalists();
  }, []);

  const loadPressReleases = async () => {
    const mockReleases: PressRelease[] = [
      { id: "1", title: "Q4 2025 Earnings Announcement", status: "published", category: "financial", language: "en", publishDate: "2026-02-01", coverage: 45, sentiment: "positive" },
      { id: "2", title: "New AI Product Launch", status: "scheduled", category: "product", language: "en", publishDate: "2026-02-10", coverage: 0, sentiment: "neutral" },
      { id: "3", title: "Strategic Partnership with Tech Giant", status: "draft", category: "partnership", language: "en", coverage: 0, sentiment: "neutral" },
      { id: "4", title: "नए सीईओ की नियुक्ति", status: "published", category: "executive", language: "hi", publishDate: "2026-01-28", coverage: 28, sentiment: "positive" },
    ];
    setPressReleases(mockReleases);
  };

  const loadMediaMentions = async () => {
    const mockMentions: MediaMention[] = [
      { id: "1", outlet: "Economic Times", title: "Tech Company Reports Record Quarter", sentiment: "positive", reach: 2500000, date: "2026-02-02", type: "print" },
      { id: "2", outlet: "TechCrunch", title: "Startup Disrupts Traditional Market", sentiment: "positive", reach: 1800000, date: "2026-02-01", type: "digital" },
      { id: "3", outlet: "NDTV Profit", title: "Industry Analysis: Market Trends", sentiment: "neutral", reach: 3200000, date: "2026-01-31", type: "broadcast" },
      { id: "4", outlet: "Business Standard", title: "Company Faces Regulatory Questions", sentiment: "negative", reach: 1500000, date: "2026-01-30", type: "print" },
      { id: "5", outlet: "YourStory", title: "Founder Interview: Vision 2030", sentiment: "positive", reach: 800000, date: "2026-01-29", type: "digital" },
    ];
    setMediaMentions(mockMentions);
  };

  const loadCrises = async () => {
    const mockCrises: Crisis[] = [
      { id: "1", title: "Social Media Complaint Trending", severity: "low", status: "resolved", detectedAt: "2026-01-28T10:00:00", responseTime: "15 min" },
      { id: "2", title: "Data Privacy Concern", severity: "medium", status: "monitoring", detectedAt: "2026-02-01T14:30:00" },
    ];
    setCrises(mockCrises);
  };

  const loadJournalists = async () => {
    const mockJournalists: Journalist[] = [
      { id: "1", name: "Priya Sharma", outlet: "Economic Times", beat: "Technology", relationship: "strong", lastContact: "2026-01-25" },
      { id: "2", name: "Rahul Menon", outlet: "TechCrunch India", beat: "Startups", relationship: "good", lastContact: "2026-01-20" },
      { id: "3", name: "Ananya Desai", outlet: "NDTV Profit", beat: "Finance", relationship: "new", lastContact: "2026-01-15" },
      { id: "4", name: "Vikram Singh", outlet: "Business Standard", beat: "Markets", relationship: "strong", lastContact: "2026-01-28" },
    ];
    setJournalists(mockJournalists);
  };

  const createPressRelease = async () => {
    if (!newRelease.title || !newRelease.content) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setLoading("create");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const release: PressRelease = {
      id: Date.now().toString(),
      title: newRelease.title,
      status: "draft",
      category: newRelease.type,
      language: newRelease.language,
      coverage: 0,
      sentiment: "neutral"
    };
    
    setPressReleases([release, ...pressReleases]);
    setNewRelease({ title: "", type: "announcement", language: "en", content: "" });
    setLoading(null);
    toast({ title: "Press Release Created", description: "AI is optimizing your press release for media distribution" });
  };

  const generateWithAI = async () => {
    if (!newRelease.title) {
      toast({ title: "Error", description: "Please enter a title first", variant: "destructive" });
      return;
    }

    setLoading("generate");
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const aiContent = `FOR IMMEDIATE RELEASE

${newRelease.title.toUpperCase()}

[City, Date] – [Company Name] today announced ${newRelease.title.toLowerCase()}, marking a significant milestone in the company's strategic growth journey.

"This announcement represents our commitment to innovation and excellence," said [Spokesperson Name], [Title] at [Company Name]. "We are excited about the opportunities this creates for our customers and stakeholders."

Key highlights include:
• [Key Point 1]
• [Key Point 2]
• [Key Point 3]

For more information, please contact:
[PR Contact Name]
[Email]
[Phone]

About [Company Name]:
[Company Name] is a leading provider of [industry] solutions, serving customers across India and globally.

###`;

    setNewRelease({ ...newRelease, content: aiContent });
    setLoading(null);
    toast({ title: "AI Content Generated", description: "Press release draft created following AP Style guidelines" });
  };

  const totalReach = mediaMentions.reduce((sum, m) => sum + m.reach, 0);
  const positiveCount = mediaMentions.filter(m => m.sentiment === "positive").length;
  const negativeCount = mediaMentions.filter(m => m.sentiment === "negative").length;
  const activeCrises = crises.filter(c => c.status !== "resolved").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">PR & Communications Hub</h2>
          <p className="text-gray-500">Press releases, media relations, crisis management, and brand communications</p>
        </div>
        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
          <Megaphone className="w-3 h-3 mr-1" />
          PR Vertical
        </Badge>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-600" />
        <span className="text-sm text-amber-800">
          <strong>AI-Powered:</strong> 18 specialized PR agents ready to automate your communications workflow.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 border-rose-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-rose-600 dark:text-rose-400">Media Reach</p>
              <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{(totalReach / 1000000).toFixed(1)}M</p>
            </div>
            <Globe className="w-8 h-8 text-rose-500 opacity-50" />
          </div>
          <p className="text-xs text-rose-600 mt-2">Across {mediaMentions.length} mentions</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Positive Coverage</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{positiveCount}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
          </div>
          <p className="text-xs text-green-600 mt-2">{((positiveCount / mediaMentions.length) * 100).toFixed(0)}% positive sentiment</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Press Releases</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{pressReleases.length}</p>
            </div>
            <Newspaper className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
          <p className="text-xs text-blue-600 mt-2">{pressReleases.filter(p => p.status === "published").length} published this month</p>
        </Card>
        <Card className={`p-4 ${activeCrises > 0 ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200' : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${activeCrises > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>Active Alerts</p>
              <p className={`text-2xl font-bold ${activeCrises > 0 ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}`}>{activeCrises}</p>
            </div>
            <AlertTriangle className={`w-8 h-8 ${activeCrises > 0 ? 'text-red-500' : 'text-gray-500'} opacity-50`} />
          </div>
          <p className={`text-xs ${activeCrises > 0 ? 'text-red-600' : 'text-gray-600'} mt-2`}>{activeCrises > 0 ? 'Requires attention' : 'All clear'}</p>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="command" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Command
          </TabsTrigger>
          <TabsTrigger value="releases" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Releases
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Newspaper className="w-4 h-4" />
            Coverage
          </TabsTrigger>
          <TabsTrigger value="crisis" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Crisis
          </TabsTrigger>
          <TabsTrigger value="relations" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Relations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="command" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-500" />
                  AI Press Release Generator
                </CardTitle>
                <CardDescription>Create professional press releases with AI assistance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Headline / Title</Label>
                  <Input 
                    placeholder="e.g., Company Launches Revolutionary AI Platform"
                    value={newRelease.title}
                    onChange={(e) => setNewRelease({ ...newRelease, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Release Type</Label>
                    <Select 
                      value={newRelease.type}
                      onValueChange={(value) => setNewRelease({ ...newRelease, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {releaseTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select 
                      value={newRelease.language}
                      onValueChange={(value) => setNewRelease({ ...newRelease, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea 
                    placeholder="Press release content..."
                    className="min-h-[200px]"
                    value={newRelease.content}
                    onChange={(e) => setNewRelease({ ...newRelease, content: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={generateWithAI}
                    variant="outline"
                    disabled={loading === "generate"}
                  >
                    {loading === "generate" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Generate with AI
                  </Button>
                  <Button 
                    onClick={createPressRelease}
                    className="bg-rose-600 hover:bg-rose-700"
                    disabled={loading === "create"}
                  >
                    {loading === "create" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4 mr-2" />
                    )}
                    Create Release
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common PR tasks powered by AI agents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Newspaper className="w-4 h-4 mr-2" />
                  Draft Media Advisory
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mic className="w-4 h-4 mr-2" />
                  Prepare Talking Points
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Generate Q&A Document
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Video className="w-4 h-4 mr-2" />
                  Create Video Script
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Image className="w-4 h-4 mr-2" />
                  Generate Infographic
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="w-4 h-4 mr-2" />
                  Translate to Regional Languages
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="w-4 h-4 mr-2" />
                  Draft Executive Bio
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Real-Time Media Monitoring</CardTitle>
              <CardDescription>Live tracking of brand mentions and sentiment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">Positive Trend</span>
                  </div>
                  <p className="text-sm text-green-600">
                    Brand sentiment up 12% this week. Strong coverage of product launch.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-700">Media Alert</span>
                  </div>
                  <p className="text-sm text-blue-600">
                    3 new journalist inquiries pending response. Average response time: 2.5 hours.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-700">Coverage Goal</span>
                  </div>
                  <p className="text-sm text-purple-600">
                    78% of Q1 media coverage target achieved. 12 days remaining.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="releases" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input placeholder="Search releases..." className="w-64" />
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
            <Button className="bg-rose-600 hover:bg-rose-700">
              <Plus className="w-4 h-4 mr-2" />
              New Release
            </Button>
          </div>

          <div className="space-y-3">
            {pressReleases.map(release => (
              <Card key={release.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="w-10 h-10 text-rose-500 p-2 bg-rose-50 rounded-lg" />
                    <div>
                      <h4 className="font-medium">{release.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Badge variant="outline" className="text-xs">{release.category}</Badge>
                        <span>•</span>
                        <span>{languages.find(l => l.code === release.language)?.name}</span>
                        {release.publishDate && (
                          <>
                            <span>•</span>
                            <span>{new Date(release.publishDate).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {release.coverage > 0 && (
                      <div className="text-center">
                        <p className="text-lg font-bold text-rose-600">{release.coverage}</p>
                        <p className="text-xs text-gray-500">Pickups</p>
                      </div>
                    )}
                    <Badge className={
                      release.status === "published" ? "bg-green-100 text-green-700" :
                      release.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }>
                      {release.status}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Media Coverage Dashboard</CardTitle>
              <CardDescription>Track all brand mentions across print, digital, and broadcast media</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mediaMentions.map(mention => (
                  <div key={mention.id} className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        mention.sentiment === "positive" ? "bg-green-500" :
                        mention.sentiment === "negative" ? "bg-red-500" :
                        "bg-gray-400"
                      }`} />
                      <div>
                        <h4 className="font-medium">{mention.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-medium text-rose-600">{mention.outlet}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">{mention.type}</Badge>
                          <span>•</span>
                          <span>{mention.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{(mention.reach / 1000000).toFixed(1)}M</p>
                        <p className="text-xs text-gray-500">reach</p>
                      </div>
                      <Badge className={
                        mention.sentiment === "positive" ? "bg-green-100 text-green-700" :
                        mention.sentiment === "negative" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }>
                        {mention.sentiment}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crisis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-rose-500" />
                Crisis Command Center
              </CardTitle>
              <CardDescription>Real-time crisis detection, response management, and reputation protection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {crises.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="font-medium">No Active Crises</p>
                  <p className="text-sm">All systems normal. Monitoring continues 24/7.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {crises.map(crisis => (
                    <div key={crisis.id} className={`p-4 rounded-lg border ${
                      crisis.severity === "high" ? "border-red-300 bg-red-50" :
                      crisis.severity === "medium" ? "border-yellow-300 bg-yellow-50" :
                      "border-gray-200 bg-gray-50"
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`w-5 h-5 ${
                            crisis.severity === "high" ? "text-red-500" :
                            crisis.severity === "medium" ? "text-yellow-500" :
                            "text-gray-500"
                          }`} />
                          <div>
                            <h4 className="font-medium">{crisis.title}</h4>
                            <p className="text-sm text-gray-500">
                              Detected: {new Date(crisis.detectedAt).toLocaleString()}
                              {crisis.responseTime && ` • Response: ${crisis.responseTime}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            crisis.status === "resolved" ? "bg-green-100 text-green-700" :
                            crisis.status === "monitoring" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }>
                            {crisis.status}
                          </Badge>
                          <Badge variant="outline">{crisis.severity}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button variant="outline" className="w-full">
                  <Bell className="w-4 h-4 mr-2" />
                  Configure Alerts
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Crisis Playbook
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Media Relations Database</CardTitle>
              <CardDescription>Manage journalist relationships and media contacts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Input placeholder="Search journalists..." className="w-64" />
                <Button className="bg-rose-600 hover:bg-rose-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>

              <div className="space-y-3">
                {journalists.map(journalist => (
                  <div key={journalist.id} className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{journalist.name}</h4>
                        <p className="text-sm text-gray-500">{journalist.outlet} • {journalist.beat}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm text-gray-500">
                        {journalist.lastContact && (
                          <p>Last contact: {new Date(journalist.lastContact).toLocaleDateString()}</p>
                        )}
                      </div>
                      <Badge className={
                        journalist.relationship === "strong" ? "bg-green-100 text-green-700" :
                        journalist.relationship === "good" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }>
                        {journalist.relationship}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Send className="w-4 h-4" />
                      </Button>
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
