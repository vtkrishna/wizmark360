import { Router, Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { BrandProvider } from './contexts/brand-context';
import ProtectedRoute from './components/ProtectedRoute';
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
import OrganizationSettings from './pages/organization-settings';
import AuditLogs from './pages/audit-logs';
import Login from './pages/Login';
import NotFound from './pages/not-found';
import EnhancedAgentOrchestration from './pages/enhanced-agent-orchestration';
import OrchestrationDashboard from './pages/orchestration-dashboard';
import QuickStartGuide from './pages/QuickStartGuide';
import WaiCapabilities from './pages/wai-capabilities';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrandProvider>
        <div className="min-h-screen bg-background">
          <Router>
            <Switch>
              <Route path="/" component={LandingPage} />
              <Route path="/login">
                {() => <Login onLoginSuccess={() => window.location.href = '/dashboard'} />}
              </Route>
              <Route path="/signin">
                {() => <Login onLoginSuccess={() => window.location.href = '/dashboard'} />}
              </Route>
              <Route path="/dashboard">
                {() => <ProtectedRoute><NewDashboard /></ProtectedRoute>}
              </Route>
              <Route path="/chat">
                {() => <ProtectedRoute><NewDashboard /></ProtectedRoute>}
              </Route>
              <Route path="/vertical/:vertical">
                {(params) => <ProtectedRoute><VerticalPage vertical={params.vertical} /></ProtectedRoute>}
              </Route>
              <Route path="/onboarding">
                {() => <ProtectedRoute><BrandOnboarding /></ProtectedRoute>}
              </Route>
              <Route path="/brand-onboarding">
                {() => <ProtectedRoute><BrandOnboarding /></ProtectedRoute>}
              </Route>
              <Route path="/brands">
                {() => <ProtectedRoute><BrandsPage /></ProtectedRoute>}
              </Route>
              <Route path="/content">
                {() => <ProtectedRoute><ContentLibraryPage /></ProtectedRoute>}
              </Route>
              <Route path="/content-library">
                {() => <ProtectedRoute><ContentLibraryPage /></ProtectedRoute>}
              </Route>
              <Route path="/analytics">
                {() => <ProtectedRoute><AnalyticsPage /></ProtectedRoute>}
              </Route>
              <Route path="/settings">
                {() => <ProtectedRoute><SettingsPage /></ProtectedRoute>}
              </Route>
              <Route path="/settings/integrations">
                {() => <ProtectedRoute><PlatformConnectionsPage /></ProtectedRoute>}
              </Route>
              <Route path="/platform-connections">
                {() => <ProtectedRoute><PlatformConnectionsPage /></ProtectedRoute>}
              </Route>
              <Route path="/unified-analytics">
                {() => <ProtectedRoute><UnifiedAnalyticsPage /></ProtectedRoute>}
              </Route>
              <Route path="/calendar">
                {() => <ProtectedRoute><ContentCalendar /></ProtectedRoute>}
              </Route>
              <Route path="/strategy">
                {() => <ProtectedRoute><NewDashboard /></ProtectedRoute>}
              </Route>
              <Route path="/marketing-chat">
                {() => <ProtectedRoute><GlobalMarketingChat /></ProtectedRoute>}
              </Route>
              <Route path="/admin/llm-settings">
                {() => <ProtectedRoute><AdminLLMSettings /></ProtectedRoute>}
              </Route>
              <Route path="/admin/agents">
                {() => <ProtectedRoute><AdminLLMSettings /></ProtectedRoute>}
              </Route>
              <Route path="/organization">
                {() => <ProtectedRoute><OrganizationSettings /></ProtectedRoute>}
              </Route>
              <Route path="/admin/audit-logs">
                {() => <ProtectedRoute><AuditLogs /></ProtectedRoute>}
              </Route>
              <Route path="/orchestration">
                {() => <ProtectedRoute><EnhancedAgentOrchestration /></ProtectedRoute>}
              </Route>
              <Route path="/agent-orchestration">
                {() => <ProtectedRoute><OrchestrationDashboard /></ProtectedRoute>}
              </Route>
              <Route path="/quickstart">
                {() => <ProtectedRoute><QuickStartGuide /></ProtectedRoute>}
              </Route>
              <Route path="/ai-capabilities">
                {() => <ProtectedRoute><WaiCapabilities /></ProtectedRoute>}
              </Route>
              <Route component={NotFound} />
            </Switch>
          </Router>
        </div>
      </BrandProvider>
    </QueryClientProvider>
  );
}
