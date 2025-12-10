import { Router, Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import NewDashboard from './pages/new-dashboard';
import VerticalPage from './pages/vertical-page';
import BrandOnboarding from './pages/brand-onboarding';
import LandingPage from './pages/landing-page';
import BrandsPage from './pages/brands';
import ContentLibraryPage from './pages/content-library';
import AnalyticsPage from './pages/analytics';
import SettingsPage from './pages/settings';
import NotFound from './pages/not-found';

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
            <Route path="/brands" component={BrandsPage} />
            <Route path="/content" component={ContentLibraryPage} />
            <Route path="/content-library" component={ContentLibraryPage} />
            <Route path="/analytics" component={AnalyticsPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={NotFound} />
          </Switch>
        </Router>
      </div>
    </QueryClientProvider>
  );
}
