import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, Command, Zap, MessageCircle, Share2, Users, 
  Briefcase, BarChart3, Code2, Bot, TrendingUp, Clock,
  FileText, Target, Send, Sparkles, ArrowRight, Globe
} from 'lucide-react';

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  vertical?: string;
  action: () => void;
}

interface CommandCenterProps {
  onAction?: (action: string, data?: any) => void;
  className?: string;
}

export function CommandCenter({ onAction, className = '' }: CommandCenterProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: stats } = useQuery({
    queryKey: ['market360-stats'],
    queryFn: () => fetch('/api/market360/stats').then(r => r.json()),
  });

  const { data: agents } = useQuery({
    queryKey: ['market360-agents'],
    queryFn: () => fetch('/api/market360/agents').then(r => r.json()),
  });

  const quickActions: QuickAction[] = [
    {
      id: 'create-campaign',
      name: 'Create New Campaign',
      description: 'Launch a multi-channel marketing campaign',
      icon: Sparkles,
      category: 'campaign',
      action: () => { onAction?.('create-campaign'); setOpen(false); }
    },
    {
      id: 'generate-social',
      name: 'Generate Social Content',
      description: 'AI-powered social media post creation',
      icon: Share2,
      category: 'content',
      vertical: 'social',
      action: () => { onAction?.('generate-social'); setOpen(false); }
    },
    {
      id: 'whatsapp-flow',
      name: 'Create WhatsApp Flow',
      description: 'Build automated WhatsApp conversation flows',
      icon: MessageCircle,
      category: 'automation',
      vertical: 'whatsapp',
      action: () => { onAction?.('whatsapp-flow'); setOpen(false); }
    },
    {
      id: 'seo-audit',
      name: 'Run SEO Audit',
      description: 'Analyze website SEO and get recommendations',
      icon: Search,
      category: 'analysis',
      vertical: 'seo',
      action: () => { onAction?.('seo-audit'); setOpen(false); }
    },
    {
      id: 'linkedin-post',
      name: 'Create LinkedIn Post',
      description: 'Generate thought leadership content',
      icon: Users,
      category: 'content',
      vertical: 'linkedin',
      action: () => { onAction?.('linkedin-post'); setOpen(false); }
    },
    {
      id: 'sales-outreach',
      name: 'Generate Sales Outreach',
      description: 'AI-personalized email and message sequences',
      icon: Briefcase,
      category: 'sales',
      vertical: 'sales',
      action: () => { onAction?.('sales-outreach'); setOpen(false); }
    },
    {
      id: 'ad-copy',
      name: 'Generate Ad Copy',
      description: 'Create high-converting ad creatives',
      icon: BarChart3,
      category: 'content',
      vertical: 'performance',
      action: () => { onAction?.('ad-copy'); setOpen(false); }
    },
    {
      id: 'landing-page',
      name: 'Build Landing Page',
      description: 'AI-generated conversion-optimized pages',
      icon: Code2,
      category: 'web',
      vertical: 'web',
      action: () => { onAction?.('landing-page'); setOpen(false); }
    },
    {
      id: 'translate-content',
      name: 'Translate to Indian Languages',
      description: 'Convert content to Hindi, Tamil, Telugu, and 9 more',
      icon: Globe,
      category: 'content',
      action: () => { onAction?.('translate'); setOpen(false); }
    },
    {
      id: 'analyze-performance',
      name: 'Analyze Campaign Performance',
      description: 'Get AI insights on campaign metrics',
      icon: TrendingUp,
      category: 'analysis',
      action: () => { onAction?.('analyze'); setOpen(false); }
    },
    {
      id: 'schedule-posts',
      name: 'Schedule Posts',
      description: 'Plan and schedule content across channels',
      icon: Clock,
      category: 'content',
      action: () => { onAction?.('schedule'); setOpen(false); }
    },
    {
      id: 'lead-score',
      name: 'Score Leads',
      description: 'AI-powered lead qualification and scoring',
      icon: Target,
      category: 'sales',
      vertical: 'sales',
      action: () => { onAction?.('lead-score'); setOpen(false); }
    },
  ];

  const categories = [
    { id: 'all', name: 'All Actions', count: quickActions.length },
    { id: 'campaign', name: 'Campaigns', count: quickActions.filter(a => a.category === 'campaign').length },
    { id: 'content', name: 'Content', count: quickActions.filter(a => a.category === 'content').length },
    { id: 'automation', name: 'Automation', count: quickActions.filter(a => a.category === 'automation').length },
    { id: 'analysis', name: 'Analysis', count: quickActions.filter(a => a.category === 'analysis').length },
    { id: 'sales', name: 'Sales', count: quickActions.filter(a => a.category === 'sales').length },
  ];

  const filteredActions = quickActions.filter(action => {
    const matchesSearch = action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || action.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={`relative h-10 w-full justify-start bg-white/80 text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64 ${className}`}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Quick actions...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">Ctrl</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2 border-b">
            <div className="flex items-center gap-2">
              <Command className="h-5 w-5 text-blue-600" />
              <DialogTitle>Command Center</DialogTitle>
              <Badge className="ml-auto bg-green-100 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1.5" />
                {stats?.activeAgents || 267} Agents Active
              </Badge>
            </div>
          </DialogHeader>

          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search actions, agents, campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">
              {categories.map(cat => (
                <Badge
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name} ({cat.count})
                </Badge>
              ))}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {filteredActions.length > 0 ? (
              <div className="space-y-1">
                {filteredActions.map(action => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200">
                      <action.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {action.name}
                        {action.vertical && (
                          <Badge variant="outline" className="text-xs">
                            {action.vertical}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{action.description}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No actions found for "{searchQuery}"</p>
              </div>
            )}
          </div>

          <div className="p-3 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>Press <kbd className="px-1 py-0.5 bg-white border rounded">Enter</kbd> to select</span>
              <span>Press <kbd className="px-1 py-0.5 bg-white border rounded">Esc</kbd> to close</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span>Powered by WAI SDK</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
