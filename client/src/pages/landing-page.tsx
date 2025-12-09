import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, Users, Globe, Bot, LineChart, Shield, 
  Sparkles, ArrowRight, Check, Play, TrendingUp,
  MessageCircle, Search, Code2, Briefcase, Share2,
  Languages, Mic, Brain, Target, BarChart3, Mail
} from 'lucide-react';
import { useLocation } from 'wouter';

const verticals = [
  { 
    id: 'social', 
    icon: Share2, 
    name: 'Social Media', 
    color: 'from-pink-500 to-rose-500',
    agents: 45,
    description: 'AI content creation, scheduling, viral trend detection',
    features: ['AI Post Generator', 'Trend Jacker', 'Influencer Scout', 'Story Creator']
  },
  { 
    id: 'seo', 
    icon: Search, 
    name: 'SEO & GEO', 
    color: 'from-green-500 to-emerald-500',
    agents: 38,
    description: 'Technical audits, AI search optimization, rankings',
    features: ['GEO Optimizer', 'Keyword Intelligence', 'Backlink Builder', 'Schema Expert']
  },
  { 
    id: 'web', 
    icon: Code2, 
    name: 'Web Dev', 
    color: 'from-blue-500 to-cyan-500',
    agents: 32,
    description: 'AI page builder, landing pages, A/B testing',
    features: ['Visual Builder', 'CRO Optimizer', 'Speed Expert', 'UX Designer']
  },
  { 
    id: 'sales', 
    icon: Briefcase, 
    name: 'Sales SDR', 
    color: 'from-purple-500 to-violet-500',
    agents: 52,
    description: 'Lead intelligence, outreach automation, pipeline',
    features: ['Lead Qualifier', 'Email Personalizer', 'Meeting Booker', 'Pipeline Forecaster']
  },
  { 
    id: 'whatsapp', 
    icon: MessageCircle, 
    name: 'WhatsApp', 
    color: 'from-emerald-500 to-green-500',
    agents: 28,
    description: 'Conversational AI, commerce, voice support',
    features: ['Support Bot', 'Voice Agent', 'Flow Builder', 'Commerce Engine']
  },
  { 
    id: 'linkedin', 
    icon: Users, 
    name: 'LinkedIn B2B', 
    color: 'from-sky-500 to-blue-500',
    agents: 35,
    description: 'Thought leadership, outreach, network growth',
    features: ['Authority Builder', 'InMail Writer', 'SSI Optimizer', 'Content Publisher']
  },
  { 
    id: 'performance', 
    icon: BarChart3, 
    name: 'Performance Ads', 
    color: 'from-orange-500 to-amber-500',
    agents: 37,
    description: 'Multi-platform ads, bid optimization, ROAS',
    features: ['Bid Optimizer', 'Creative Factory', 'Budget Allocator', 'Attribution Analyst']
  },
];

const stats = [
  { value: '267', label: 'AI Agents', sublabel: 'Autonomous Marketing' },
  { value: '23', label: 'LLM Providers', sublabel: '752+ Models' },
  { value: '12', label: 'Indian Languages', sublabel: 'Sarvam AI' },
  { value: '7', label: 'Verticals', sublabel: 'Full Stack Marketing' },
];

const features = [
  { 
    icon: Bot, 
    title: '267 Autonomous Agents', 
    description: 'AI agents for every marketing task - from content creation to bid optimization, working 24/7.' 
  },
  { 
    icon: Languages, 
    title: '12 Indian Languages', 
    description: 'Create content in Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam & more via Sarvam AI.' 
  },
  { 
    icon: Mic, 
    title: 'Voice AI Integration', 
    description: 'Speech-to-text and text-to-speech for WhatsApp voice messages in 22 Indian languages.' 
  },
  { 
    icon: Brain, 
    title: 'Context Engineering', 
    description: 'Smart AI that understands your brand voice, audience, and campaign goals for personalized outputs.' 
  },
  { 
    icon: Target, 
    title: 'Smart Model Routing', 
    description: '4-tier architecture automatically selects the best AI model for each task - optimizing cost and quality.' 
  },
  { 
    icon: Shield, 
    title: 'Enterprise Compliance', 
    description: 'GDPR, DPDP Act (India), TRA (UAE), PDPA (Singapore) compliant with jurisdiction-aware guardrails.' 
  },
];


export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [activeVertical, setActiveVertical] = useState(verticals[0]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-gray-200 bg-white/90">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">
                <span className="text-blue-600">Wizards</span>
                <span className="text-purple-600">Tech</span>
              </span>
              <Badge className="ml-2 bg-green-100 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                Agency Platform
              </Badge>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <a href="#verticals" className="text-gray-600 hover:text-gray-900 font-medium">Verticals</a>
              <a href="#brands" className="text-gray-600 hover:text-gray-900 font-medium">Brands</a>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setLocation('/dashboard')}>Sign In</Button>
              <Button 
                onClick={() => setLocation('/dashboard')} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Launch Platform <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/50 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200 text-sm px-4 py-2">
                Wizards Tech Global Agency Platform
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Self-Driving
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Marketing Agency
                </span>
                <br />
                for Your Brands
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                267 autonomous AI agents across 7 marketing verticals. 
                Create content in 12 Indian languages. Voice AI for WhatsApp. 
                Built on 23 LLM providers with 752+ models.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg"
                  onClick={() => setLocation('/brand-onboarding')}
                  className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Onboard New Brand
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation('/dashboard')}
                  className="text-lg px-8 py-6 border-gray-300 hover:bg-gray-50"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Brand Management
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Full Service Marketing
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Invoicing & Payments
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Chief of Staff AI</div>
                      <div className="text-white/70 text-sm">23 LLMs | 267 Agents | 12 Languages</div>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-md p-4 text-sm">
                      नमस्ते! I'm your Chief of Staff AI. I can help you manage campaigns, 
                      generate content in 12 Indian languages, and orchestrate 267 marketing agents. 
                      What would you like to accomplish today?
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md p-4 text-sm max-w-xs">
                      Create a WhatsApp campaign for Diwali in Hindi and Tamil
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-md p-4 text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-600 font-medium">3 agents activated</span>
                      </div>
                      Creating bilingual Diwali campaign with WhatsApp Commerce Agent, 
                      Content Creator, and Voice Agent for audio greetings...
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">+340%</div>
                    <div className="text-sm text-gray-500">Engagement Rate</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              >
                <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{stat.label}</div>
                    <div className="text-xs text-gray-500">{stat.sublabel}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-4 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-8 flex-wrap opacity-60">
            <span className="text-sm text-gray-500 font-medium">Trusted by leading brands:</span>
            <div className="flex items-center gap-8">
              <span className="text-xl font-bold text-gray-400">TechMahindra</span>
              <span className="text-xl font-bold text-gray-400">Flipkart</span>
              <span className="text-xl font-bold text-gray-400">Zoho</span>
              <span className="text-xl font-bold text-gray-400">Swiggy</span>
              <span className="text-xl font-bold text-gray-400">Razorpay</span>
            </div>
          </div>
        </div>
      </section>

      <section id="verticals" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">7 Marketing Verticals</Badge>
            <h2 className="text-4xl font-bold mb-4">One Platform. Complete Marketing Stack.</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              267 AI agents organized across 7 specialized verticals, each with dedicated tools and workflows.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-3">
              {verticals.map((vertical) => (
                <button
                  key={vertical.id}
                  onClick={() => setActiveVertical(vertical)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    activeVertical.id === vertical.id
                      ? 'bg-gradient-to-r ' + vertical.color + ' text-white border-transparent shadow-lg'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activeVertical.id === vertical.id ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      <vertical.icon className={`h-5 w-5 ${
                        activeVertical.id === vertical.id ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <div className="font-semibold">{vertical.name}</div>
                      <div className={`text-sm ${
                        activeVertical.id === vertical.id ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {vertical.agents} AI Agents
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              <Card className="h-full border-gray-200 overflow-hidden">
                <div className={`p-6 bg-gradient-to-r ${activeVertical.color} text-white`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                      <activeVertical.icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{activeVertical.name}</h3>
                      <p className="text-white/80">{activeVertical.description}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-4xl font-bold">{activeVertical.agents}</div>
                      <div className="text-white/80">AI Agents</div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4 text-gray-900">Key Capabilities:</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {activeVertical.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600"
                    onClick={() => setLocation(`/vertical/${activeVertical.id}`)}
                  >
                    Open {activeVertical.name} Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">Platform Capabilities</Badge>
            <h2 className="text-4xl font-bold mb-4">Built for Indian Marketers</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The only marketing platform with native Indian language support, voice AI, and compliance for Indian regulations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="h-full border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <section id="brands" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200">Agency Platform</Badge>
            <h2 className="text-4xl font-bold mb-4">Complete Brand Management</h2>
            <p className="text-xl text-gray-600">Onboard brands, manage services, track invoices, and deliver results.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold mb-2">Brand Onboarding</h3>
                <p className="text-gray-600 text-sm">Wizard-based onboarding with guidelines, assets, and service selection</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold mb-2">Service Packages</h3>
                <p className="text-gray-600 text-sm">Full or partial marketing services across 7 verticals</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <LineChart className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold mb-2">Finance & Invoicing</h3>
                <p className="text-gray-600 text-sm">Invoices, payments, receivables, and GST compliance</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-bold mb-2">Analytics Studio</h3>
                <p className="text-gray-600 text-sm">Per-brand dashboards, cross-brand rollups, custom reports</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Onboard a New Brand?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Start the brand onboarding process to configure services, upload assets, and begin marketing operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => setLocation('/brand-onboarding')}
              className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100"
            >
              <Zap className="mr-2 h-5 w-5" />
              Onboard New Brand
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => setLocation('/dashboard')}
              className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10"
            >
              <Play className="mr-2 h-5 w-5" />
              View Dashboard
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Wizards Tech Global</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered self-driving marketing agency platform for brand management and marketing operations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Marketing Verticals</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                {verticals.map((v) => (
                  <li key={v.id}><a href={`/vertical/${v.id}`} className="hover:text-white">{v.name}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="/brand-onboarding" className="hover:text-white">Brand Onboarding</a></li>
                <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
                <li><a href="/dashboard" className="hover:text-white">Analytics</a></li>
                <li><a href="/dashboard" className="hover:text-white">Invoicing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@wizardstechglobal.com</li>
                <li className="flex items-center gap-2"><Globe className="h-4 w-4" /> www.wizardstechglobal.com</li>
                <li className="flex items-center gap-2"><Globe className="h-4 w-4" /> India | UAE | Global</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            © 2024 Wizards Tech Global. All rights reserved. | Internal Platform
          </div>
        </div>
      </footer>
    </div>
  );
}
