import { useState, useEffect } from "react";
import AppShell from "../components/layout/app-shell";
import {
  Link2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Trash2,
  Plus,
  ChevronRight,
  AlertCircle,
  Loader2,
  Shield,
  Zap
} from "lucide-react";

interface Provider {
  id: string;
  name: string;
  icon: string;
  description: string;
  scopes: string[];
}

interface Connection {
  id: string;
  provider: string;
  accountId: string;
  accountName: string;
  isActive: boolean;
  scopes: string[];
  lastSyncAt?: string;
  createdAt: string;
}

interface WizardState {
  step: number;
  provider?: string;
  accounts?: { id: string; name: string; type: string }[];
  selectedAccountId?: string;
  complete: boolean;
}

const PROVIDER_ICONS: Record<string, string> = {
  meta: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/meta.svg",
  google: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/google.svg",
  linkedin: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg",
  tiktok: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tiktok.svg",
  twitter: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/x.svg",
  pinterest: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/pinterest.svg"
};

const PROVIDER_COLORS: Record<string, string> = {
  meta: "bg-blue-500",
  google: "bg-red-500",
  linkedin: "bg-blue-700",
  tiktok: "bg-black",
  twitter: "bg-gray-900",
  pinterest: "bg-red-600"
};

export default function PlatformConnectionsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    checkUrlParams();
  }, []);

  const checkUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    const successParam = params.get('success');
    const providerParam = params.get('provider');

    if (errorParam) {
      setError(`Connection failed: ${errorParam}`);
    }
    if (successParam === 'connected' && providerParam) {
      setSuccess(`Successfully connected to ${providerParam}!`);
    }

    window.history.replaceState({}, '', window.location.pathname);
  };

  const loadData = async () => {
    try {
      const [providersRes, connectionsRes] = await Promise.all([
        fetch('/api/platform-connections/providers'),
        fetch('/api/platform-connections/connections?brandId=default')
      ]);

      if (providersRes.ok) {
        const data = await providersRes.json();
        setProviders(data.data || []);
      }

      if (connectionsRes.ok) {
        const data = await connectionsRes.json();
        setConnections(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const startConnection = async (provider: Provider) => {
    setSelectedProvider(provider);
    setWizardStep(1);
    setWizardOpen(true);
  };

  const connectProvider = async () => {
    if (!selectedProvider) return;
    
    setConnecting(true);
    setError(null);

    try {
      const res = await fetch(`/api/platform-connections/connect/${selectedProvider.id}?brandId=default`);
      const data = await res.json();

      if (data.success && data.data.authUrl) {
        window.location.href = data.data.authUrl;
      } else {
        setError(data.error || 'Failed to initiate connection');
        setConnecting(false);
      }
    } catch (err) {
      setError('Failed to connect. Please try again.');
      setConnecting(false);
    }
  };

  const disconnectProvider = async (provider: string) => {
    if (!confirm(`Are you sure you want to disconnect ${provider}?`)) return;

    try {
      const res = await fetch(`/api/platform-connections/connections/${provider}?brandId=default`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setConnections(prev => prev.filter(c => c.provider !== provider));
        setSuccess(`${provider} disconnected successfully`);
      }
    } catch (err) {
      setError('Failed to disconnect');
    }
  };

  const isConnected = (providerId: string) => {
    return connections.some(c => c.provider === providerId && c.isActive);
  };

  const getConnection = (providerId: string) => {
    return connections.find(c => c.provider === providerId && c.isActive);
  };

  const WizardModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-lg w-full p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Connect {selectedProvider?.name}</h2>
          <button
            onClick={() => { setWizardOpen(false); setConnecting(false); }}
            className="text-gray-400 hover:text-white"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(step => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                wizardStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                {wizardStep > step ? <CheckCircle2 className="w-5 h-5" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-0.5 ${wizardStep > step ? 'bg-blue-600' : 'bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        {wizardStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl">
              <div className={`w-12 h-12 ${PROVIDER_COLORS[selectedProvider?.id || '']} rounded-xl flex items-center justify-center`}>
                <span className="text-white text-xl font-bold">
                  {selectedProvider?.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-white">{selectedProvider?.name}</h3>
                <p className="text-sm text-gray-400">{selectedProvider?.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Permissions Required:</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedProvider?.scopes.slice(0, 6).map((scope, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="truncate">{scope.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setWizardStep(2)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-white">Secure Connection</h4>
                  <p className="text-sm text-gray-400">Your credentials are encrypted and never stored</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-white">Instant Sync</h4>
                  <p className="text-sm text-gray-400">Your campaigns and data sync automatically</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-white">Auto Refresh</h4>
                  <p className="text-sm text-gray-400">Access tokens refresh automatically</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setWizardStep(1)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={connectProvider}
                disabled={connecting}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5" />
                    Connect
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Platform Connections</h1>
            <p className="text-gray-400">Connect your advertising and social media platforms</p>
          </div>

          {(success || error) && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              success ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-red-500/20 border border-red-500/50 text-red-400'
            }`}>
              {success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{success || error}</span>
              <button
                onClick={() => { setSuccess(null); setError(null); }}
                className="ml-auto"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          )}

          {connections.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Connected Platforms</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map(conn => (
                  <div key={conn.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${PROVIDER_COLORS[conn.provider]} rounded-lg flex items-center justify-center`}>
                          <span className="text-white font-bold">
                            {conn.provider.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-white capitalize">{conn.provider}</h3>
                          <p className="text-sm text-gray-400">{conn.accountName}</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {conn.lastSyncAt ? `Synced ${new Date(conn.lastSyncAt).toLocaleDateString()}` : 'Connected'}
                      </span>
                      <button
                        onClick={() => disconnectProvider(conn.provider)}
                        className="text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Disconnect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Available Platforms</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map(provider => {
                  const connected = isConnected(provider.id);
                  return (
                    <div
                      key={provider.id}
                      className={`bg-gray-800/50 border rounded-xl p-4 transition-all ${
                        connected 
                          ? 'border-green-500/30 opacity-60' 
                          : 'border-gray-700 hover:border-blue-500/50 cursor-pointer'
                      }`}
                      onClick={() => !connected && startConnection(provider)}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`w-12 h-12 ${PROVIDER_COLORS[provider.id]} rounded-xl flex items-center justify-center`}>
                          <span className="text-white text-xl font-bold">
                            {provider.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{provider.name}</h3>
                          <p className="text-sm text-gray-400 line-clamp-1">{provider.description}</p>
                        </div>
                        {connected ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      {!connected && (
                        <button className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" />
                          Connect
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-12 p-6 bg-gray-800/30 border border-gray-700 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-3">Need Help?</h3>
            <p className="text-gray-400 mb-4">
              To connect ad platforms, you'll need to configure OAuth credentials. 
              Contact your administrator or check the documentation for setup instructions.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Shield className="w-4 h-4 text-green-500" />
                <span>OAuth 2.0 Secure</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <RefreshCw className="w-4 h-4 text-blue-500" />
                <span>Auto Token Refresh</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Link2 className="w-4 h-4 text-purple-500" />
                <span>Multi-account Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {wizardOpen && <WizardModal />}
    </AppShell>
  );
}
