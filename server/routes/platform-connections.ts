/**
 * Platform Connections API Routes
 * Handles OAuth flows for ad platform connections (Meta, Google, LinkedIn, etc.)
 */

import { Router, Request, Response } from 'express';
import { oauthIntegrationService, OAuthProvider } from '../services/oauth-integration-service';

const router = Router();

router.get('/providers', async (req: Request, res: Response) => {
  try {
    const providers = oauthIntegrationService.getSupportedProviders();
    res.json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get providers' });
  }
});

router.get('/connect/:provider', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const brandId = req.query.brandId as string || 'default';
    
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'http://localhost:5000';
    const redirectUri = `${baseUrl}/api/platform-connections/callback/${provider}`;
    
    const authUrl = oauthIntegrationService.getOAuthUrl(provider as OAuthProvider, brandId, redirectUri);
    
    res.json({ success: true, data: { authUrl, redirectUri } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/callback/:provider', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const { code, state, error: oauthError } = req.query;
    
    if (oauthError) {
      return res.redirect(`/settings/integrations?error=${encodeURIComponent(oauthError as string)}`);
    }
    
    if (!code || !state) {
      return res.redirect('/settings/integrations?error=missing_params');
    }
    
    const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    const { brandId } = stateData;
    
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'http://localhost:5000';
    const redirectUri = `${baseUrl}/api/platform-connections/callback/${provider}`;
    
    const token = await oauthIntegrationService.exchangeCodeForToken(
      provider as OAuthProvider, 
      code as string, 
      redirectUri
    );
    
    const accounts = await oauthIntegrationService.getAvailableAccounts(
      provider as OAuthProvider,
      token.accessToken
    );
    
    if (accounts.length === 1) {
      await oauthIntegrationService.createConnection(
        brandId,
        provider as OAuthProvider,
        accounts[0].id,
        accounts[0].name,
        token
      );
      return res.redirect(`/settings/integrations?success=connected&provider=${provider}`);
    }
    
    const sessionId = `wizard_${Date.now()}`;
    oauthIntegrationService.updateWizardState(sessionId, {
      step: 3,
      provider: provider as OAuthProvider,
      accounts,
      complete: false
    });
    
    res.redirect(`/settings/integrations?wizard=${sessionId}&provider=${provider}`);
  } catch (error: any) {
    console.error('Platform OAuth callback error:', error);
    res.redirect(`/settings/integrations?error=${encodeURIComponent(error.message)}`);
  }
});

router.get('/connections', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const connections = oauthIntegrationService.getConnections(brandId);
    
    const sanitized = connections.map(c => ({
      id: c.id,
      provider: c.provider,
      accountId: c.accountId,
      accountName: c.accountName,
      isActive: c.isActive,
      scopes: c.scopes,
      lastSyncAt: c.lastSyncAt,
      createdAt: c.createdAt
    }));
    
    res.json({ success: true, data: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get connections' });
  }
});

router.delete('/connections/:provider', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const brandId = req.query.brandId as string || 'default';
    
    await oauthIntegrationService.disconnectPlatform(brandId, provider as OAuthProvider);
    
    res.json({ success: true, message: `${provider} disconnected successfully` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to disconnect' });
  }
});

router.get('/health', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const health = await oauthIntegrationService.checkTokenHealth(brandId);
    
    res.json({ success: true, data: health });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to check health' });
  }
});

router.post('/wizard/start', async (req: Request, res: Response) => {
  try {
    const sessionId = `wizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const state = oauthIntegrationService.startWizard(sessionId);
    
    res.json({ success: true, data: { sessionId, state } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to start wizard' });
  }
});

router.get('/wizard/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const state = oauthIntegrationService.getWizardState(sessionId);
    
    if (!state) {
      return res.status(404).json({ success: false, error: 'Wizard session not found' });
    }
    
    res.json({ success: true, data: state });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get wizard state' });
  }
});

router.post('/wizard/:sessionId/select-account', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { accountId, brandId } = req.body;
    
    const state = oauthIntegrationService.getWizardState(sessionId);
    if (!state || !state.provider) {
      return res.status(400).json({ success: false, error: 'Invalid wizard state' });
    }
    
    const account = state.accounts?.find(a => a.id === accountId);
    if (!account) {
      return res.status(400).json({ success: false, error: 'Account not found' });
    }
    
    oauthIntegrationService.updateWizardState(sessionId, {
      step: 4,
      selectedAccountId: accountId
    });
    
    res.json({ success: true, message: 'Account selected' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to select account' });
  }
});

router.post('/wizard/:sessionId/complete', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    oauthIntegrationService.updateWizardState(sessionId, { complete: true });
    oauthIntegrationService.completeWizard(sessionId);
    
    res.json({ success: true, message: 'Wizard completed' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to complete wizard' });
  }
});

export default router;
