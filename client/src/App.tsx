import { Router, Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { BrandProvider } from './contexts/brand-context';
import NewDashboard from './pages/new-dashboard';
import VerticalPage from './pages/vertical-page';
import BrandOnboarding from './pages/brand-onboarding';
import LandingPage from './pages/landing-page';
import BrandsPage from './pages/brands';
import ContentLibraryPage from './pages/content-library';
import AnalyticsPage from './pages/analytics';
import SettingsPage from './pages/settings';
import PlatformConnectionsPage from './pages/platform-connections';
import UnifiedAnalyticsPage from './pages/unified-analytics';
import GlobalMarketingChat from './pages/global-marketing-chat';
import AdminLLMSettings from './pages/admin-llm-settings';
import ContentCalendar from './pages/content-calendar';
import Login from './pages/Login';
import NotFound from './pages/not-found';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrandProvider>
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
              <Route path="/settings/integrations" component={PlatformConnectionsPage} />
              <Route path="/platform-connections" component={PlatformConnectionsPage} />
              <Route path="/unified-analytics" component={UnifiedAnalyticsPage} />
              <Route path="/calendar" component={ContentCalendar} />
              <Route path="/strategy" component={NewDashboard} />
              <Route path="/marketing-chat" component={GlobalMarketingChat} />
              <Route path="/admin/llm-settings" component={AdminLLMSettings} />
              <Route path="/admin/agents" component={AdminLLMSettings} />
              <Route path="/login">
                {() => <Login onLoginSuccess={() => window.location.href = '/dashboard'} />}
              </Route>
              <Route path="/signin">
                {() => <Login onLoginSuccess={() => window.location.href = '/dashboard'} />}
              </Route>
              <Route component={NotFound} />
            </Switch>
          </Router>
        </div>
      </BrandProvider>
    </QueryClientProvider>
  );
}
