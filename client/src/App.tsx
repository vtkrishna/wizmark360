import { useEffect } from 'react';
import { Router, Route, Switch, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import NewDashboard from './pages/new-dashboard';
import VerticalPage from './pages/vertical-page';
import BrandOnboarding from './pages/brand-onboarding';
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
            <Route path="/dashboard" component={NewDashboard} />
            <Route path="/chat" component={NewDashboard} />
            <Route path="/vertical/:vertical">
              {(params) => <VerticalPage vertical={params.vertical} />}
            </Route>
            <Route path="/onboarding" component={BrandOnboarding} />
            <Route path="/brand-onboarding" component={BrandOnboarding} />
            <Route component={NotFound} />
          </Switch>
        </Router>
      </div>
    </QueryClientProvider>
  );
}
