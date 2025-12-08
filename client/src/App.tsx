import { useEffect } from 'react';
import { Router, Route, Switch, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import Market360Dashboard from './pages/market360-dashboard';
import BrandOnboarding from './pages/brand-onboarding';
import VerticalDashboard from './pages/vertical-dashboard';
import OrchestrationDashboard from './pages/orchestration-dashboard';
import LandingPage from './pages/landing-page';
import NotFound from './pages/not-found';

function RedirectTo({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation(to);
  }, [to, setLocation]);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Router>
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/market360" component={Market360Dashboard} />
            <Route path="/market360/:vertical">
              {(params) => <VerticalDashboard vertical={params.vertical} />}
            </Route>
            <Route path="/onboarding" component={BrandOnboarding} />
            <Route path="/brand-onboarding" component={BrandOnboarding} />
            <Route path="/orchestration" component={OrchestrationDashboard} />
            <Route component={NotFound} />
          </Switch>
        </Router>
      </div>
    </QueryClientProvider>
  );
}
