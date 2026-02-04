import { useState } from "react";
import { 
  Users, 
  Target, 
  BarChart3,
  Loader2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Sparkles,
  Zap,
  ArrowUpRight,
  MessageSquare,
  PlayCircle,
  PauseCircle
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

interface SalesSDRToolkitPanelProps {
  brandId?: number;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  score: number;
  status: string;
  source: string;
  value: number;
  lastActivity: string;
  nextAction: string;
}

interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: string;
  probability: number;
  closeDate: string;
  owner: string;
}

interface Sequence {
  id: string;
  name: string;
  steps: number;
  enrolled: number;
  completed: number;
  replyRate: number;
  status: string;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  leadName: string;
  timestamp: string;
  outcome?: string;
}

export default function SalesSDRToolkitPanel({ brandId = 1 }: SalesSDRToolkitPanelProps) {
  const [activeTab, setActiveTab] = useState("leads");
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [leads, setLeads] = useState<Lead[]>([
    { id: "1", name: "Rahul Sharma", email: "rahul@techcorp.in", company: "TechCorp India", title: "VP Engineering", score: 92, status: "hot", source: "LinkedIn", value: 250000, lastActivity: "2 hours ago", nextAction: "Schedule demo call" },
    { id: "2", name: "Priya Patel", email: "priya@startupxyz.com", company: "StartupXYZ", title: "CEO", score: 85, status: "warm", source: "Website", value: 180000, lastActivity: "1 day ago", nextAction: "Send proposal" },
    { id: "3", name: "Amit Kumar", email: "amit@growthco.io", company: "GrowthCo", title: "Head of Marketing", score: 78, status: "warm", source: "Referral", value: 120000, lastActivity: "3 days ago", nextAction: "Follow up email" },
    { id: "4", name: "Sneha Gupta", email: "sneha@enterprise.com", company: "Enterprise Ltd", title: "CTO", score: 65, status: "cold", source: "Cold Outreach", value: 450000, lastActivity: "1 week ago", nextAction: "Re-engage sequence" },
  ]);

  const [deals, setDeals] = useState<Deal[]>([
    { id: "1", name: "TechCorp Enterprise Deal", company: "TechCorp India", value: 250000, stage: "proposal", probability: 60, closeDate: "2026-02-28", owner: "SDR Team" },
    { id: "2", name: "StartupXYZ Platform License", company: "StartupXYZ", value: 180000, stage: "negotiation", probability: 75, closeDate: "2026-02-15", owner: "SDR Team" },
    { id: "3", name: "GrowthCo Marketing Suite", company: "GrowthCo", value: 120000, stage: "discovery", probability: 30, closeDate: "2026-03-15", owner: "SDR Team" },
  ]);

  const [sequences, setSequences] = useState<Sequence[]>([
    { id: "1", name: "Enterprise Outbound", steps: 7, enrolled: 250, completed: 180, replyRate: 24, status: "active" },
    { id: "2", name: "Warm Lead Nurture", steps: 5, enrolled: 120, completed: 95, replyRate: 42, status: "active" },
    { id: "3", name: "Re-engagement Campaign", steps: 4, enrolled: 80, completed: 45, replyRate: 18, status: "paused" },
  ]);

  const [activities] = useState<Activity[]>([
    { id: "1", type: "email", description: "Opened proposal email", leadName: "Priya Patel", timestamp: "10 min ago" },
    { id: "2", type: "call", description: "Discovery call completed", leadName: "Rahul Sharma", timestamp: "2 hours ago", outcome: "Positive - Demo scheduled" },
    { id: "3", type: "meeting", description: "Demo meeting", leadName: "Amit Kumar", timestamp: "Yesterday", outcome: "Needs follow up" },
    { id: "4", type: "email", description: "Sent follow-up sequence", leadName: "Sneha Gupta", timestamp: "2 days ago" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const stages = [
    { id: "lead", name: "Lead", color: "bg-gray-100" },
    { id: "discovery", name: "Discovery", color: "bg-blue-100" },
    { id: "demo", name: "Demo", color: "bg-purple-100" },
    { id: "proposal", name: "Proposal", color: "bg-orange-100" },
    { id: "negotiation", name: "Negotiation", color: "bg-yellow-100" },
    { id: "closed_won", name: "Closed Won", color: "bg-green-100" },
  ];

  const totalPipelineValue = deals.reduce((sum, d) => sum + d.value, 0);
  const weightedPipeline = deals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0);
  const hotLeads = leads.filter(l => l.status === "hot").length;
  const avgLeadScore = leads.length > 0 ? leads.reduce((sum, l) => sum + l.score, 0) / leads.length : 0;

  const scoreLead = async (leadId: string) => {
    setLoading(`score_${leadId}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLeads(prev => prev.map(l => 
        l.id === leadId ? { ...l, score: Math.min(100, l.score + Math.floor(Math.random() * 10)) } : l
      ));
      toast({ title: "Lead Scored", description: "AI analysis updated the lead score based on recent engagement" });
    } finally {
      setLoading(null);
    }
  };

  const createSequence = async () => {
    setLoading("sequence");
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newSeq: Sequence = {
        id: `seq_${Date.now()}`,
        name: "New AI Sequence",
        steps: 5,
        enrolled: 0,
        completed: 0,
        replyRate: 0,
        status: "draft"
      };
      setSequences(prev => [newSeq, ...prev]);
      toast({ title: "Sequence Created", description: "Configure your email steps and enroll leads" });
    } finally {
      setLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hot": return "bg-red-100 text-red-700";
      case "warm": return "bg-orange-100 text-orange-700";
      case "cold": return "bg-blue-100 text-blue-700";
      case "active": return "bg-green-100 text-green-700";
      case "paused": return "bg-gray-100 text-gray-700";
      case "draft": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "email": return Mail;
      case "call": return Phone;
      case "meeting": return Calendar;
      default: return MessageSquare;
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || lead.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sales & SDR Command Center</h2>
          <p className="text-gray-500">Lead scoring, pipeline management, and outreach sequences</p>
        </div>
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <Target className="w-3 h-3 mr-1" />
          Sales SDR
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Pipeline Value</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">₹{(totalPipelineValue / 100000).toFixed(1)}L</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500 opacity-50" />
          </div>
          <p className="text-xs text-green-600 mt-2">Weighted: ₹{(weightedPipeline / 100000).toFixed(1)}L</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 dark:text-red-400">Hot Leads</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{hotLeads}</p>
            </div>
            <Target className="w-8 h-8 text-red-500 opacity-50" />
          </div>
          <p className="text-xs text-red-600 mt-2">Ready for conversion</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400">Avg Lead Score</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{avgLeadScore.toFixed(0)}</p>
            </div>
            <Star className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
          <p className="text-xs text-purple-600 mt-2">AI-powered scoring</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Active Sequences</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{sequences.filter(s => s.status === "active").length}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
          <p className="text-xs text-blue-600 mt-2">{sequences.reduce((sum, s) => sum + s.enrolled, 0)} enrolled</p>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="sequences" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Sequences
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-600" />
                    Lead Management
                  </CardTitle>
                  <CardDescription>AI-scored leads with intelligent prioritization</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search leads..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="cold">Cold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredLeads.map(lead => (
                  <div key={lead.id} className="p-4 border rounded-lg hover:border-orange-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                          {lead.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-gray-500">{lead.title} at {lead.company}</p>
                          <p className="text-xs text-gray-400">{lead.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(lead.score)}`}>
                          {lead.score}
                        </div>
                        <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => scoreLead(lead.id)}
                          disabled={loading === `score_${lead.id}`}
                        >
                          {loading === `score_${lead.id}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <><Sparkles className="w-4 h-4 mr-1" /> Re-score</>
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex gap-4 text-gray-500">
                        <span>Source: {lead.source}</span>
                        <span>Value: ₹{(lead.value / 1000).toFixed(0)}K</span>
                        <span>Last: {lead.lastActivity}</span>
                      </div>
                      <div className="flex items-center gap-2 text-orange-600">
                        <ArrowUpRight className="w-4 h-4" />
                        <span className="font-medium">{lead.nextAction}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Deal Pipeline
              </CardTitle>
              <CardDescription>Track deals through your sales stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {stages.map(stage => {
                  const stageDeals = deals.filter(d => d.stage === stage.id);
                  const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
                  return (
                    <div key={stage.id} className={`flex-1 min-w-[150px] p-3 rounded-lg ${stage.color}`}>
                      <p className="font-medium text-sm">{stage.name}</p>
                      <p className="text-xs text-gray-500">{stageDeals.length} deals</p>
                      <p className="text-sm font-bold mt-1">₹{(stageValue / 100000).toFixed(1)}L</p>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                {deals.map(deal => {
                  const stage = stages.find(s => s.id === deal.stage);
                  return (
                    <div key={deal.id} className="p-4 border rounded-lg hover:border-green-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{deal.name}</p>
                          <p className="text-sm text-gray-500">{deal.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">₹{(deal.value / 100000).toFixed(1)}L</p>
                          <p className="text-xs text-gray-500">Close: {deal.closeDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={stage?.color}>{stage?.name}</Badge>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">Probability: {deal.probability}%</span>
                          <span className="text-gray-500">Owner: {deal.owner}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${deal.probability}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sequences" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Email Sequences
                  </CardTitle>
                  <CardDescription>Automated outreach campaigns with AI optimization</CardDescription>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={createSequence}
                  disabled={loading === "sequence"}
                >
                  {loading === "sequence" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  New Sequence
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sequences.map(sequence => (
                  <div key={sequence.id} className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-medium">{sequence.name}</p>
                      <Badge className={getStatusColor(sequence.status)}>{sequence.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <p className="text-gray-500">Steps</p>
                        <p className="font-bold">{sequence.steps}</p>
                      </div>
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <p className="text-gray-500">Enrolled</p>
                        <p className="font-bold">{sequence.enrolled}</p>
                      </div>
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <p className="text-gray-500">Completed</p>
                        <p className="font-bold">{sequence.completed}</p>
                      </div>
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <p className="text-gray-500">Reply Rate</p>
                        <p className="font-bold text-green-600">{sequence.replyRate}%</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Edit
                      </Button>
                      <Button size="sm" variant={sequence.status === "active" ? "destructive" : "default"} className="flex-1">
                        {sequence.status === "active" ? <><PauseCircle className="w-4 h-4 mr-1" /> Pause</> : <><PlayCircle className="w-4 h-4 mr-1" /> Start</>}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Track all sales activities and touchpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map(activity => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="p-2 bg-white dark:bg-gray-900 rounded-lg">
                        <Icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-gray-500">{activity.leadName}</p>
                        {activity.outcome && (
                          <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            {activity.outcome}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{activity.timestamp}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Leads</span>
                      <span className="font-medium">450</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className="bg-blue-600 h-4 rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Qualified</span>
                      <span className="font-medium">180 (40%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className="bg-purple-600 h-4 rounded-full" style={{ width: "40%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Demos</span>
                      <span className="font-medium">72 (16%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className="bg-orange-600 h-4 rounded-full" style={{ width: "16%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Closed Won</span>
                      <span className="font-medium">28 (6.2%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className="bg-green-600 h-4 rounded-full" style={{ width: "6.2%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Avg Deal Size</p>
                    <p className="text-2xl font-bold">₹1.8L</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" /> +12% vs last quarter
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Win Rate</p>
                    <p className="text-2xl font-bold">32%</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" /> +5% improvement
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Sales Cycle</p>
                    <p className="text-2xl font-bold">28 days</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingDown className="w-3 h-3" /> -5 days faster
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Monthly Target</p>
                    <p className="text-2xl font-bold">78%</p>
                    <p className="text-xs text-blue-600 mt-1">₹15.6L of ₹20L</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
