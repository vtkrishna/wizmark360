/**
 * OAuth Integration Service
 * Handles OAuth 2.0 flows for Meta, Google, LinkedIn, and other ad platforms
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';

export type OAuthProvider = 'meta' | 'google' | 'linkedin' | 'tiktok' | 'twitter' | 'pinterest';

export interface OAuthConfig {
  provider: OAuthProvider;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
}

export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType: string;
  scope: string[];
}

export interface PlatformConnection {
  id: string;
  brandId: string;
  provider: OAuthProvider;
  accountId: string;
  accountName: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  scopes: string[];
  isActive: boolean;
  lastSyncAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConnectionWizardState {
  step: number;
  provider?: OAuthProvider;
  authCode?: string;
  accounts?: { id: string; name: string; type: string }[];
  selectedAccountId?: string;
  permissions?: string[];
  pixelSetup?: boolean;
  complete: boolean;
}

const OAUTH_CONFIGS: Record<OAuthProvider, Omit<OAuthConfig, 'clientId' | 'clientSecret' | 'redirectUri'>> = {
  meta: {
    provider: 'meta',
    scopes: ['ads_management', 'ads_read', 'business_management', 'pages_manage_posts', 'pages_read_engagement', 'instagram_basic', 'instagram_content_publish'],
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token'
  },
  google: {
    provider: 'google',
    scopes: ['https://www.googleapis.com/auth/adwords', 'https://www.googleapis.com/auth/analytics.readonly', 'https://www.googleapis.com/auth/tagmanager.readonly'],
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token'
  },
  linkedin: {
    provider: 'linkedin',
    scopes: ['r_ads', 'r_ads_reporting', 'rw_ads', 'r_organization_social', 'w_organization_social', 'r_1st_connections_size'],
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken'
  },
  tiktok: {
    provider: 'tiktok',
    scopes: ['business.read', 'business.write', 'ads.read', 'ads.write'],
    authUrl: 'https://business-api.tiktok.com/open_api/v1.3/oauth2/authorize/',
    tokenUrl: 'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/'
  },
  twitter: {
    provider: 'twitter',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token'
  },
  pinterest: {
    provider: 'pinterest',
    scopes: ['boards:read', 'boards:write', 'pins:read', 'pins:write', 'user_accounts:read', 'ads:read', 'ads:write'],
    authUrl: 'https://www.pinterest.com/oauth/',
    tokenUrl: 'https://api.pinterest.com/v5/oauth/token'
  }
};

class OAuthIntegrationService {
  private connections: Map<string, PlatformConnection[]> = new Map();
  private wizardStates: Map<string, ConnectionWizardState> = new Map();

  constructor() {
    this.initializeFromDatabase();
    console.log('🔐 OAuth Integration Service initialized');
    console.log('   Supported providers: Meta, Google, LinkedIn, TikTok, Twitter, Pinterest');
  }

  private async initializeFromDatabase(): Promise<void> {
    try {
      const result = await db.execute(sql`
        SELECT * FROM ad_platform_connections WHERE is_active = true
      `);
      
      for (const row of (result.rows || []) as any[]) {
        const connection: PlatformConnection = {
          id: row.id,
          brandId: row.brand_id,
          provider: row.provider,
          accountId: row.account_id,
          accountName: row.account_name,
          accessToken: row.access_token,
          refreshToken: row.refresh_token,
          tokenExpiresAt: row.token_expires_at ? new Date(row.token_expires_at) : undefined,
          scopes: row.scopes || [],
          isActive: row.is_active,
          lastSyncAt: row.last_sync_at ? new Date(row.last_sync_at) : undefined,
          metadata: row.metadata || {},
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        };
        
        const existing = this.connections.get(row.brand_id) || [];
        existing.push(connection);
        this.connections.set(row.brand_id, existing);
      }
    } catch (error) {
      console.log('   Note: Platform connections table may not exist yet');
    }
  }

  getOAuthUrl(provider: OAuthProvider, brandId: string, redirectUri: string): string {
    const config = OAUTH_CONFIGS[provider];
    if (!config) throw new Error(`Unsupported provider: ${provider}`);

    const state = Buffer.from(JSON.stringify({ brandId, provider, timestamp: Date.now() })).toString('base64');
    
    const params = new URLSearchParams({
      client_id: process.env[`${provider.toUpperCase()}_CLIENT_ID`] || 'PLACEHOLDER',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state
    });

    if (provider === 'google') {
      params.append('access_type', 'offline');
      params.append('prompt', 'consent');
    }

    return `${config.authUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(provider: OAuthProvider, code: string, redirectUri: string): Promise<OAuthToken> {
    const config = OAUTH_CONFIGS[provider];
    if (!config) throw new Error(`Unsupported provider: ${provider}`);

    const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];

    if (!clientId || !clientSecret) {
      throw new Error(`Missing credentials for ${provider}. Please configure ${provider.toUpperCase()}_CLIENT_ID and ${provider.toUpperCase()}_CLIENT_SECRET`);
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
      tokenType: data.token_type || 'Bearer',
      scope: (data.scope || '').split(' ')
    };
  }

  async refreshAccessToken(provider: OAuthProvider, refreshToken: string): Promise<OAuthToken> {
    const config = OAUTH_CONFIGS[provider];
    if (!config) throw new Error(`Unsupported provider: ${provider}`);

    const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];

    if (!clientId || !clientSecret) {
      throw new Error(`Missing credentials for ${provider}`);
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
      tokenType: data.token_type || 'Bearer',
      scope: (data.scope || '').split(' ')
    };
  }

  async getAvailableAccounts(provider: OAuthProvider, accessToken: string): Promise<{ id: string; name: string; type: string }[]> {
    switch (provider) {
      case 'meta':
        return this.getMetaAdAccounts(accessToken);
      case 'google':
        return this.getGoogleAdAccounts(accessToken);
      case 'linkedin':
        return this.getLinkedInAdAccounts(accessToken);
      default:
        return [];
    }
  }

  private async getMetaAdAccounts(accessToken: string): Promise<{ id: string; name: string; type: string }[]> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_status,currency&access_token=${accessToken}`
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return (data.data || []).map((acc: any) => ({
        id: acc.id.replace('act_', ''),
        name: acc.name,
        type: 'ad_account'
      }));
    } catch {
      return [];
    }
  }

  private async getGoogleAdAccounts(accessToken: string): Promise<{ id: string; name: string; type: string }[]> {
    try {
      const response = await fetch(
        'https://googleads.googleapis.com/v15/customers:listAccessibleCustomers',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || ''
          }
        }
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return (data.resourceNames || []).map((name: string) => ({
        id: name.replace('customers/', ''),
        name: `Google Ads Account ${name.replace('customers/', '')}`,
        type: 'customer'
      }));
    } catch {
      return [];
    }
  }

  private async getLinkedInAdAccounts(accessToken: string): Promise<{ id: string; name: string; type: string }[]> {
    try {
      const response = await fetch(
        'https://api.linkedin.com/v2/adAccountsV2?q=search',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return (data.elements || []).map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        type: 'sponsored_account'
      }));
    } catch {
      return [];
    }
  }

  async createConnection(
    brandId: string,
    provider: OAuthProvider,
    accountId: string,
    accountName: string,
    token: OAuthToken
  ): Promise<PlatformConnection> {
    const connection: PlatformConnection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      brandId,
      provider,
      accountId,
      accountName,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      tokenExpiresAt: token.expiresAt,
      scopes: token.scope,
      isActive: true,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.execute(sql`
      INSERT INTO ad_platform_connections (
        id, brand_id, provider, account_id, account_name, 
        access_token, refresh_token, token_expires_at, scopes,
        is_active, metadata, created_at, updated_at
      ) VALUES (
        ${connection.id}, ${brandId}, ${provider}, ${accountId}, ${accountName},
        ${token.accessToken}, ${token.refreshToken || null}, 
        ${token.expiresAt?.toISOString() || null}::timestamp,
        ${JSON.stringify(token.scope)}::jsonb,
        true, '{}'::jsonb, NOW(), NOW()
      )
      ON CONFLICT (brand_id, provider, account_id) DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = COALESCE(EXCLUDED.refresh_token, ad_platform_connections.refresh_token),
        token_expires_at = EXCLUDED.token_expires_at,
        is_active = true,
        updated_at = NOW()
    `);

    const existing = this.connections.get(brandId) || [];
    existing.push(connection);
    this.connections.set(brandId, existing);

    return connection;
  }

  getConnections(brandId: string): PlatformConnection[] {
    return this.connections.get(brandId) || [];
  }

  getConnectionByProvider(brandId: string, provider: OAuthProvider): PlatformConnection | undefined {
    const connections = this.connections.get(brandId) || [];
    return connections.find(c => c.provider === provider && c.isActive);
  }

  async disconnectPlatform(brandId: string, provider: OAuthProvider): Promise<boolean> {
    await db.execute(sql`
      UPDATE ad_platform_connections 
      SET is_active = false, updated_at = NOW()
      WHERE brand_id = ${brandId} AND provider = ${provider}
    `);

    const connections = this.connections.get(brandId) || [];
    const updated = connections.filter(c => c.provider !== provider);
    this.connections.set(brandId, updated);

    return true;
  }

  startWizard(sessionId: string): ConnectionWizardState {
    const state: ConnectionWizardState = {
      step: 1,
      complete: false
    };
    this.wizardStates.set(sessionId, state);
    return state;
  }

  getWizardState(sessionId: string): ConnectionWizardState | undefined {
    return this.wizardStates.get(sessionId);
  }

  updateWizardState(sessionId: string, updates: Partial<ConnectionWizardState>): ConnectionWizardState {
    const current = this.wizardStates.get(sessionId) || { step: 1, complete: false };
    const updated = { ...current, ...updates };
    this.wizardStates.set(sessionId, updated);
    return updated;
  }

  completeWizard(sessionId: string): void {
    this.wizardStates.delete(sessionId);
  }

  getSupportedProviders(): { id: OAuthProvider; name: string; icon: string; description: string; scopes: string[] }[] {
    return [
      {
        id: 'meta',
        name: 'Meta (Facebook & Instagram)',
        icon: 'facebook',
        description: 'Connect your Meta Business account for Facebook and Instagram ads',
        scopes: OAUTH_CONFIGS.meta.scopes
      },
      {
        id: 'google',
        name: 'Google Ads',
        icon: 'google',
        description: 'Connect your Google Ads account for Search, Display, and YouTube ads',
        scopes: OAUTH_CONFIGS.google.scopes
      },
      {
        id: 'linkedin',
        name: 'LinkedIn Marketing',
        icon: 'linkedin',
        description: 'Connect your LinkedIn Campaign Manager for B2B advertising',
        scopes: OAUTH_CONFIGS.linkedin.scopes
      },
      {
        id: 'tiktok',
        name: 'TikTok for Business',
        icon: 'tiktok',
        description: 'Connect your TikTok Business account for video advertising',
        scopes: OAUTH_CONFIGS.tiktok.scopes
      },
      {
        id: 'twitter',
        name: 'Twitter/X Ads',
        icon: 'twitter',
        description: 'Connect your Twitter Ads account for promoted content',
        scopes: OAUTH_CONFIGS.twitter.scopes
      },
      {
        id: 'pinterest',
        name: 'Pinterest Ads',
        icon: 'pinterest',
        description: 'Connect your Pinterest Business account for visual discovery ads',
        scopes: OAUTH_CONFIGS.pinterest.scopes
      }
    ];
  }

  async checkTokenHealth(brandId: string): Promise<{ provider: OAuthProvider; healthy: boolean; expiresIn?: number }[]> {
    const connections = this.connections.get(brandId) || [];
    const results: { provider: OAuthProvider; healthy: boolean; expiresIn?: number }[] = [];

    for (const conn of connections) {
      let healthy = true;
      let expiresIn: number | undefined;

      if (conn.tokenExpiresAt) {
        const now = Date.now();
        const expiresAt = conn.tokenExpiresAt.getTime();
        expiresIn = Math.floor((expiresAt - now) / 1000);
        
        if (expiresIn < 3600 && conn.refreshToken) {
          try {
            const newToken = await this.refreshAccessToken(conn.provider, conn.refreshToken);
            conn.accessToken = newToken.accessToken;
            conn.tokenExpiresAt = newToken.expiresAt;
            expiresIn = newToken.expiresAt ? Math.floor((newToken.expiresAt.getTime() - now) / 1000) : undefined;
          } catch {
            healthy = false;
          }
        } else if (expiresIn < 0) {
          healthy = false;
        }
      }

      results.push({ provider: conn.provider, healthy, expiresIn });
    }

    return results;
  }
}

export const oauthIntegrationService = new OAuthIntegrationService();
