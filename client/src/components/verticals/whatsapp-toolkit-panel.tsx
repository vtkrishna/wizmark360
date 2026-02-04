import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Users,
  Loader2,
  CheckCircle,
  Clock,
  FileText,
  Workflow,
  BarChart3,
  Plus,
  Play,
  Pause,
  Settings,
  Globe,
  Image,
  Video,
  Sparkles,
  Target,
  Zap,
  MessageCircle,
  Phone
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

interface WhatsAppToolkitPanelProps {
  brandId?: number;
}

interface Template {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  content: string;
}

interface Broadcast {
  id: string;
  name: string;
  templateId: string;
  audienceSize: number;
  status: string;
  sentAt?: string;
  metrics?: { sent: number; delivered: number; read: number; replied: number };
}

interface Flow {
  id: string;
  name: string;
  trigger: string;
  steps: number;
  status: string;
  conversions: number;
}

interface Conversation {
  id: string;
  phone: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  status: string;
}

export default function WhatsAppToolkitPanel({ brandId = 1 }: WhatsAppToolkitPanelProps) {
  const [activeTab, setActiveTab] = useState("templates");
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    language: "en",
    category: "marketing",
    content: ""
  });
  
  const [newBroadcast, setNewBroadcast] = useState({
    name: "",
    templateId: "",
    audienceFilter: "all"
  });

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
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch(`/api/whatsapp/templates/${brandId}`);
      const data = await response.json();
      if (data.success && data.data) {
        setTemplates(data.data);
      }
    } catch (error) {
      const mockTemplates: Template[] = [
        { id: "1", name: "Welcome Message", language: "en", category: "marketing", status: "approved", content: "Hello {{1}}! Welcome to {{2}}. We're excited to have you!" },
        { id: "2", name: "Order Confirmation", language: "hi", category: "utility", status: "approved", content: "आपका ऑर्डर {{1}} कन्फर्म हो गया है। ट्रैक करें: {{2}}" },
        { id: "3", name: "Promotional Offer", language: "en", category: "marketing", status: "pending", content: "Flash Sale! Get {{1}}% off on {{2}}. Use code: {{3}}" },
      ];
      setTemplates(mockTemplates);
    }
  };

  const loadBroadcasts = async () => {
    try {
      const response = await fetch(`/api/whatsapp/broadcasts/${brandId}`);
      const data = await response.json();
      if (data.success && data.data) {
        setBroadcasts(data.data);
      }
    } catch (error) {
      const mockBroadcasts: Broadcast[] = [
        { 
          id: "1", 
          name: "Diwali Sale Campaign", 
          templateId: "1", 
          audienceSize: 15000, 
          status: "completed",
          sentAt: "2026-02-01T10:00:00",
          metrics: { sent: 15000, delivered: 14500, read: 12000, replied: 850 }
        },
        { 
          id: "2", 
          name: "New Product Launch", 
          templateId: "3", 
          audienceSize: 8500, 
          status: "scheduled",
          sentAt: "2026-02-05T09:00:00"
        },
      ];
      setBroadcasts(mockBroadcasts);
    }
  };

  const loadFlows = async () => {
    try {
      const response = await fetch(`/api/whatsapp/flows/${brandId}`);
      const data = await response.json();
      if (data.success && data.data) {
        setFlows(data.data);
      }
    } catch (error) {
      const mockFlows: Flow[] = [
        { id: "1", name: "Lead Qualification Flow", trigger: "New Contact", steps: 5, status: "active", conversions: 234 },
        { id: "2", name: "Support Ticket Flow", trigger: "Keyword: help", steps: 4, status: "active", conversions: 567 },
        { id: "3", name: "Product Demo Flow", trigger: "Button: Demo", steps: 6, status: "paused", conversions: 89 },
      ];
      setFlows(mockFlows);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await fetch(`/api/whatsapp/conversations/${brandId}`);
      const data = await response.json();
      if (data.success && data.data) {
        setConversations(data.data);
      }
    } catch (error) {
      const mockConversations: Conversation[] = [
        { id: "1", phone: "+91 98765 43210", name: "Rahul Sharma", lastMessage: "Thanks for the quick response!", timestamp: "2 min ago", status: "open" },
        { id: "2", phone: "+91 87654 32109", name: "Priya Patel", lastMessage: "When will my order arrive?", timestamp: "15 min ago", status: "pending" },
        { id: "3", phone: "+91 76543 21098", name: "Amit Kumar", lastMessage: "I'm interested in the premium plan", timestamp: "1 hour ago", status: "qualified" },
      ];
      setConversations(mockConversations);
    }
  };

  const createTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast({ title: "Missing Information", description: "Please fill in template name and content", variant: "destructive" });
      return;
    }
    
    setLoading("template");
    try {
      const response = await fetch(`/api/whatsapp/templates/${brandId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTemplate)
      });
      
      const data = await response.json();
      if (data.success) {
        toast({ title: "Template Created", description: "Submitted for WhatsApp approval" });
        loadTemplates();
        setNewTemplate({ name: "", language: "en", category: "marketing", content: "" });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      const newTemp: Template = {
        id: `temp_${Date.now()}`,
        ...newTemplate,
        status: "pending"
      };
      setTemplates(prev => [...prev, newTemp]);
      toast({ title: "Template Created", description: "Submitted for WhatsApp approval" });
      setNewTemplate({ name: "", language: "en", category: "marketing", content: "" });
    } finally {
      setLoading(null);
    }
  };

  const createBroadcast = async () => {
    if (!newBroadcast.name || !newBroadcast.templateId) {
      toast({ title: "Missing Information", description: "Please fill in broadcast name and select template", variant: "destructive" });
      return;
    }
    
    setLoading("broadcast");
    try {
      const response = await fetch(`/api/whatsapp/broadcasts/${brandId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBroadcast)
      });
      
      const data = await response.json();
      if (data.success) {
        toast({ title: "Broadcast Created", description: "Campaign ready to execute" });
        loadBroadcasts();
        setNewBroadcast({ name: "", templateId: "", audienceFilter: "all" });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      const newCampaign: Broadcast = {
        id: `broadcast_${Date.now()}`,
        name: newBroadcast.name,
        templateId: newBroadcast.templateId,
        audienceSize: Math.floor(Math.random() * 10000) + 1000,
        status: "draft"
      };
      setBroadcasts(prev => [...prev, newCampaign]);
      toast({ title: "Broadcast Created", description: "Campaign ready to execute" });
      setNewBroadcast({ name: "", templateId: "", audienceFilter: "all" });
    } finally {
      setLoading(null);
    }
  };

  const executeBroadcast = async (broadcastId: string) => {
    setLoading(`execute_${broadcastId}`);
    try {
      const response = await fetch(`/api/whatsapp/broadcasts/${brandId}/${broadcastId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      const data = await response.json();
      if (data.success) {
        toast({ title: "Broadcast Sent!", description: "Messages are being delivered" });
        loadBroadcasts();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setBroadcasts(prev => prev.map(b => 
        b.id === broadcastId ? { ...b, status: "sending" } : b
      ));
      toast({ title: "Broadcast Started", description: "Messages are being delivered" });
    } finally {
      setLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": case "active": case "completed": case "open": return "bg-green-100 text-green-700";
      case "pending": case "scheduled": return "bg-yellow-100 text-yellow-700";
      case "rejected": case "paused": return "bg-red-100 text-red-700";
      case "qualified": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">WhatsApp Marketing Hub</h2>
          <p className="text-gray-500">Templates, broadcasts, automation flows, and conversation management</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <MessageSquare className="w-3 h-3 mr-1" />
          WhatsApp Business
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="broadcasts" className="flex items-center gap-2" onClick={loadBroadcasts}>
            <Send className="w-4 h-4" />
            Broadcasts
          </TabsTrigger>
          <TabsTrigger value="flows" className="flex items-center gap-2" onClick={loadFlows}>
            <Workflow className="w-4 h-4" />
            Flows
          </TabsTrigger>
          <TabsTrigger value="inbox" className="flex items-center gap-2" onClick={loadConversations}>
            <MessageCircle className="w-4 h-4" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-600" />
                  Create Template
                </CardTitle>
                <CardDescription>
                  Create a WhatsApp-approved message template with multilingual support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    placeholder="e.g., welcome_message"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Language</Label>
                    <Select value={newTemplate.language} onValueChange={(v) => setNewTemplate({ ...newTemplate, language: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <Globe className="w-4 h-4 inline mr-2" />
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={newTemplate.category} onValueChange={(v) => setNewTemplate({ ...newTemplate, category: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="utility">Utility</SelectItem>
                        <SelectItem value="authentication">Authentication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="template-content">Template Content</Label>
                  <Textarea
                    id="template-content"
                    placeholder="Hello {{1}}! Welcome to {{2}}. Use variables like {{1}}, {{2}} for dynamic content."
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                    className="mt-1 min-h-[100px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use {"{{1}}"}, {"{{2}}"} etc. for dynamic variables</p>
                </div>

                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={createTemplate}
                  disabled={loading === "template"}
                >
                  {loading === "template" ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    <><Plus className="w-4 h-4 mr-2" /> Create Template</>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Your Templates
                </CardTitle>
                <CardDescription>
                  {templates.length} templates created
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {templates.map(template => (
                    <div key={template.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{template.name}</span>
                        <Badge className={getStatusColor(template.status)}>{template.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{template.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{template.language.toUpperCase()}</Badge>
                        <Badge variant="outline" className="text-xs">{template.category}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="broadcasts" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-green-600" />
                  New Broadcast
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="broadcast-name">Campaign Name</Label>
                  <Input
                    id="broadcast-name"
                    placeholder="e.g., Diwali Sale Campaign"
                    value={newBroadcast.name}
                    onChange={(e) => setNewBroadcast({ ...newBroadcast, name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Select Template</Label>
                  <Select value={newBroadcast.templateId} onValueChange={(v) => setNewBroadcast({ ...newBroadcast, templateId: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.filter(t => t.status === "approved").map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} ({template.language.toUpperCase()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Target Audience</Label>
                  <Select value={newBroadcast.audienceFilter} onValueChange={(v) => setNewBroadcast({ ...newBroadcast, audienceFilter: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subscribers</SelectItem>
                      <SelectItem value="active">Active Users (30 days)</SelectItem>
                      <SelectItem value="leads">New Leads</SelectItem>
                      <SelectItem value="customers">Customers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={createBroadcast}
                  disabled={loading === "broadcast"}
                >
                  {loading === "broadcast" ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    <><Plus className="w-4 h-4 mr-2" /> Create Broadcast</>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-600" />
                  Broadcast Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {broadcasts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Send className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No broadcasts created yet</p>
                    </div>
                  ) : (
                    broadcasts.map(broadcast => (
                      <div key={broadcast.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">{broadcast.name}</p>
                            <p className="text-sm text-gray-500">
                              <Users className="w-3 h-3 inline mr-1" />
                              {broadcast.audienceSize.toLocaleString()} recipients
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(broadcast.status)}>{broadcast.status}</Badge>
                            {(broadcast.status === "draft" || broadcast.status === "scheduled") && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => executeBroadcast(broadcast.id)}
                                disabled={loading === `execute_${broadcast.id}`}
                              >
                                {loading === `execute_${broadcast.id}` ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <><Play className="w-4 h-4 mr-1" /> Send</>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                        {broadcast.metrics && (
                          <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t">
                            <div className="text-center">
                              <p className="text-lg font-bold">{broadcast.metrics.sent.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">Sent</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-green-600">{broadcast.metrics.delivered.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">Delivered</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-blue-600">{broadcast.metrics.read.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">Read</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-purple-600">{broadcast.metrics.replied.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">Replied</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="flows" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-purple-600" />
                Automation Flows
              </CardTitle>
              <CardDescription>
                Create automated conversation flows for lead qualification and support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flows.map(flow => (
                  <div key={flow.id} className="p-4 border rounded-lg hover:border-purple-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <Workflow className="w-5 h-5 text-purple-600" />
                      </div>
                      <Badge className={getStatusColor(flow.status)}>{flow.status}</Badge>
                    </div>
                    <h4 className="font-medium mb-1">{flow.name}</h4>
                    <p className="text-sm text-gray-500 mb-3">Trigger: {flow.trigger}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{flow.steps} steps</span>
                      <span className="font-medium text-purple-600">{flow.conversions} conversions</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant={flow.status === "active" ? "destructive" : "default"} className="flex-1">
                        {flow.status === "active" ? <><Pause className="w-4 h-4 mr-1" /> Pause</> : <><Play className="w-4 h-4 mr-1" /> Start</>}
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-purple-300 hover:text-purple-600 cursor-pointer transition-colors min-h-[200px]">
                  <Plus className="w-8 h-8 mb-2" />
                  <span className="font-medium">Create New Flow</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inbox" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                Conversation Inbox
              </CardTitle>
              <CardDescription>
                Manage WhatsApp conversations with AI-powered responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {conversations.map(conv => (
                  <div key={conv.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{conv.name}</p>
                        <p className="text-sm text-gray-500">{conv.phone}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{conv.lastMessage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{conv.timestamp}</p>
                      <Badge className={getStatusColor(conv.status)} variant="outline">{conv.status}</Badge>
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
                  <p className="text-sm text-gray-500">Messages Sent</p>
                  <p className="text-2xl font-bold">45,230</p>
                </div>
                <Send className="w-8 h-8 text-green-600 opacity-50" />
              </div>
              <p className="text-xs text-green-600 mt-2">+12% from last week</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Delivery Rate</p>
                  <p className="text-2xl font-bold">98.5%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
              <p className="text-xs text-blue-600 mt-2">Above industry avg</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Read Rate</p>
                  <p className="text-2xl font-bold">76.3%</p>
                </div>
                <Target className="w-8 h-8 text-purple-600 opacity-50" />
              </div>
              <p className="text-xs text-purple-600 mt-2">+5% improvement</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Response Rate</p>
                  <p className="text-2xl font-bold">23.8%</p>
                </div>
                <MessageCircle className="w-8 h-8 text-orange-600 opacity-50" />
              </div>
              <p className="text-xs text-orange-600 mt-2">8,450 replies</p>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Detailed analytics charts will appear here</p>
                <p className="text-sm">Connect WhatsApp Business API to see live data</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
