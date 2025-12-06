import { useState, useEffect } from 'react';
import { Router, Route, Switch, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import Market360Dashboard from './pages/market360-dashboard';
import BrandOnboarding from './pages/brand-onboarding';
import VerticalDashboard from './pages/vertical-dashboard';
import OrchestrationDashboard from './pages/orchestration-dashboard';
import NotFound from './pages/not-found';

function RedirectTo({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation(to);
  }, [to, setLocation]);
  return null;
}

function Market360Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white">
      <nav className="px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Market360</h1>
        <a href="/market360" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition">
          Dashboard
        </a>
      </nav>
      
      <main className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">Self-Driving Agency Platform</h2>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          267+ Autonomous Agents managing multi-brand marketing across 7 critical verticals
        </p>
        
        <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
          {[
            { icon: "📱", name: "Social Media", desc: "Viral content & engagement" },
            { icon: "🔍", name: "SEO & GEO", desc: "Search optimization" },
            { icon: "🌐", name: "Web Dev", desc: "Generative UI/UX" },
            { icon: "💼", name: "Sales SDR", desc: "Autonomous outreach" },
            { icon: "💬", name: "WhatsApp", desc: "Community commerce" },
            { icon: "🔗", name: "LinkedIn", desc: "B2B authority" },
            { icon: "📊", name: "Performance", desc: "Cross-channel ads" },
            { icon: "🤖", name: "AI Agents", desc: "267+ specialized" },
          ].map((v, i) => (
            <div key={i} className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition">
              <div className="text-3xl mb-2">{v.icon}</div>
              <div className="font-semibold text-sm">{v.name}</div>
              <div className="text-xs text-gray-400">{v.desc}</div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-4 justify-center">
          <a 
            href="/onboarding" 
            className="inline-block px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg text-lg font-semibold transition shadow-lg"
          >
            Add New Brand
          </a>
          <a 
            href="/market360" 
            className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition shadow-lg"
          >
            Enter Dashboard
          </a>
        </div>
      </main>
      
      <footer className="text-center py-8 text-gray-400 text-sm">
        Powered by WAI SDK Orchestration Platform
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Router>
          <Switch>
            <Route path="/" component={Market360Landing} />
            <Route path="/market360" component={Market360Dashboard} />
            <Route path="/market360/:vertical">
              {(params) => <VerticalDashboard vertical={params.vertical} />}
            </Route>
            <Route path="/onboarding" component={BrandOnboarding} />
            <Route path="/orchestration" component={OrchestrationDashboard} />
            <Route component={NotFound} />
          </Switch>
        </Router>
      </div>
    </QueryClientProvider>
  );
}
