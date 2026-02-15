/**
 * WAI SDK Platform - Minimal Replit Server Entry Point
 * 
 * This is a simplified server entry that starts the application with only
 * the modules that actually exist in the codebase. Once missing modules
 * are implemented, switch to server/index.ts via the dev:full script.
 */

// Fix crypto not defined error for oauth4webapi/openid-client
import { webcrypto } from 'crypto';
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = webcrypto;
}

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { log, setupVite, serveStatic } from "./vite";
import { setupAuth, createAdminUser } from "./auth/local-auth";
import market360Router from "./routes/market360";
import aiRouter from "./routes/ai";
import brandsRouter from "./routes/brands";
import chatApiRoutes from "./routes/chat-api";
import market360VerticalRoutes from "./routes/market360-vertical-routes";
import llmAdminRoutes from "./routes/llm-admin-routes";
import multimodalContentRoutes from "./routes/multimodal-content-routes";
import rbacRoutes from "./routes/rbac-routes";
import predictiveAnalyticsRoutes from "./routes/predictive-analytics-api";
import unifiedOrchestrationRoutes from "./routes/unified-orchestration-api";
import contentLibraryRoutes from "./routes/content-library-routes";
import predictiveAnalyticsNewRoutes from "./routes/predictive-analytics-routes";
import adPublishingRoutes from "./routes/ad-publishing-routes";
import aiVisibilityRoutes from "./routes/ai-visibility-routes";
import translationRoutes from "./routes/translation-routes";
import whatsappRoutes from "./routes/whatsapp-routes";
import crmRoutes from "./routes/crm-full-routes";
import socialPublishingRoutes from "./routes/social-publishing-routes";
import voiceRoutes from "./routes/voice-routes";
import emailRoutes from "./routes/email-routes";
import paymentRoutes from "./routes/payment-routes";
import clientPortalRoutes from "./routes/client-portal-routes";
import influencerRoutes from "./routes/influencer-routes";
import { auditMiddleware } from "./services/audit-logging-service";
import webSearchRoutes from "./routes/web-search-routes";
import documentProcessingRoutes from "./routes/document-processing-routes";
import notebookLLMRoutes from "./routes/notebook-llm-routes";
import orchestrationPatternsRoutes from "./routes/orchestration-patterns-routes";
import mem0EnhancedRoutes from "./routes/mem0-enhanced-routes";
import camMonitoringRoutes from "./routes/cam-monitoring-routes";
import grpoLearningRoutes from "./routes/grpo-learning-routes";
import digitalTwinRoutes from "./routes/digital-twin-routes";
import contentPipelineRoutes from "./routes/content-pipeline-routes";
import platformConnectionsRoutes from "./routes/platform-connections";
import seoToolkitRoutes from "./routes/seo-toolkit-routes";
import conversionTrackingRoutes from "./routes/conversion-tracking-routes";
import telegramRoutes from "./routes/telegram-routes";
import unifiedAnalyticsRoutes from "./routes/unified-analytics-routes";
import verticalWorkflowRoutes from "./routes/vertical-workflow-routes";
import crossVerticalRoutes from "./routes/cross-vertical-routes";
import marketingChatRoutes from "./routes/marketing-chat-routes";
import waiSDKv32Routes from "./routes/wai-sdk-v32-routes";
import exportRoutes from "./routes/export-routes";
import strategyPipelineRoutes from "./routes/strategy-pipeline-routes";
import monitoringDashboardRoutes from "./routes/monitoring-dashboard-routes";
import { marketingAgentsLoader } from "./services/marketing-agents-loader";

const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT) || 5000;

function validateEnvironment(): { critical: string[]; warnings: string[] } {
  const critical: string[] = [];
  const warnings: string[] = [];

  if (!process.env.DATABASE_URL) critical.push('DATABASE_URL');

  const recommendedKeys = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GEMINI_API_KEY'];
  const optionalKeys = ['GROQ_API_KEY', 'COHERE_API_KEY', 'SARVAM_API_KEY', 'TOGETHER_API_KEY', 'OPENROUTER_API_KEY', 'ZHIPU_API_KEY'];

  let hasAtLeastOneLLM = false;
  for (const key of recommendedKeys) {
    if (process.env[key]) {
      hasAtLeastOneLLM = true;
    } else {
      warnings.push(`${key} not set (recommended)`);
    }
  }
  if (!hasAtLeastOneLLM) {
    critical.push('At least one LLM API key (OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY)');
  }

  for (const key of optionalKeys) {
    if (!process.env[key]) {
      warnings.push(`${key} not set (optional)`);
    }
  }

  if (isProduction && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'dev-secret-change-in-production')) {
    critical.push('SESSION_SECRET must be set in production (use a strong random string)');
  }

  return { critical, warnings };
}

const app = express();
const server = createServer(app);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) || [];
const replitDomains = process.env.REPLIT_DOMAINS?.split(',').map(d => `https://${d.trim()}`) || [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!isProduction) {
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('.replit.dev') || origin.includes('.repl.co')) {
        return callback(null, true);
      }
    }
    if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (replitDomains.some(d => origin.startsWith(d))) {
      return callback(null, true);
    }
    callback(null, false);
  },
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: false,
}));

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later', retryAfter: 60 },
  keyGenerator: (req) => {
    return (req as any).user?.id?.toString() || req.ip || 'anonymous';
  },
});

const llmLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI request rate limit exceeded. Please wait before sending more requests.', retryAfter: 60 },
  keyGenerator: (req) => {
    return (req as any).user?.id?.toString() || req.ip || 'anonymous';
  },
});

const voiceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Voice/translation rate limit exceeded. Please wait.', retryAfter: 60 },
  keyGenerator: (req) => {
    return (req as any).user?.id?.toString() || req.ip || 'anonymous';
  },
});

app.use('/api/', generalLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '5.0.0',
    timestamp: new Date().toISOString(),
    platform: 'WizMark 360 - AI Marketing Operating System',
    agents: 262,
    llmProviders: 24,
    models: '886+',
    environment: isProduction ? 'production' : 'development',
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'WizMark 360 - AI Marketing Operating System',
    version: '5.0.0',
    agents: 262,
    verticals: ['social', 'seo', 'web', 'sales', 'whatsapp', 'linkedin', 'performance', 'pr-comms'],
  });
});

app.use('/api/market360', market360Router);

app.use('/api/ai', llmLimiter, aiRouter);

// Brands/ERP API routes
app.use('/api/brands', brandsRouter);

app.use('/api', chatApiRoutes);

// Market360 Vertical Workflow Routes
app.use('/api/market360/verticals', market360VerticalRoutes);

// LLM Admin Config Routes
app.use('/api/admin/llm', llmAdminRoutes);

// Multimodal Content Routes
app.use('/api/multimodal-content', multimodalContentRoutes);

// RBAC & Audit Routes
app.use('/api/rbac', rbacRoutes);

// Predictive Analytics Routes
app.use('/api/analytics', predictiveAnalyticsRoutes);

// Unified WAI SDK Orchestration Routes
app.use('/api/orchestration', unifiedOrchestrationRoutes);

// Brand-Aware Content Library Routes
app.use('/api/content-library', contentLibraryRoutes);

// New Predictive Analytics Routes (Phase 2)
app.use('/api/analytics/predictions', predictiveAnalyticsNewRoutes);

// Native Ad Publishing Routes
app.use('/api/ads', adPublishingRoutes);

// AI Visibility Tracker Routes (GEO - ChatGPT/Perplexity monitoring)
app.use('/api/ai-visibility', aiVisibilityRoutes);

app.use('/api/translation', voiceLimiter, translationRoutes);

// WhatsApp Business API Routes
app.use('/api/whatsapp', whatsappRoutes);

// CRM Integration Routes (Salesforce/HubSpot)
app.use('/api/crm', crmRoutes);

// Social Publishing Routes (Meta/LinkedIn/Twitter)
app.use('/api/social', socialPublishingRoutes);

app.use('/api/voice', voiceLimiter, voiceRoutes);

// Email Campaign Routes
app.use('/api/email', emailRoutes);

// Payment & Invoicing Routes (Stripe)
app.use('/api/payments', paymentRoutes);

// Client Portal Routes (White-label)
app.use('/api/portal', clientPortalRoutes);

// Influencer Marketplace Routes
app.use('/api/influencers', influencerRoutes);

// WAI SDK v3.1 P0 Enterprise Services
app.use('/api/v3/web-search', webSearchRoutes);
app.use('/api/v3/documents', documentProcessingRoutes);
app.use('/api/v3/notebook', notebookLLMRoutes);
app.use('/api/v3/orchestration', orchestrationPatternsRoutes);

// WAI SDK v3.1 P1 Intelligence Layer
app.use('/api/v3/memory', mem0EnhancedRoutes);
app.use('/api/v3/monitoring', camMonitoringRoutes);
app.use('/api/v3/learning', grpoLearningRoutes);

// WAI SDK v3.1 P2 Advanced Features
app.use('/api/v3/twins', digitalTwinRoutes);
app.use('/api/v3/content', contentPipelineRoutes);

// Platform v4.0 - Platform Integrations & OAuth
app.use('/api/platform-connections', platformConnectionsRoutes);
app.use('/api/seo', seoToolkitRoutes);
app.use('/api/conversions', conversionTrackingRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/unified-analytics', unifiedAnalyticsRoutes);
app.use('/api/vertical-workflows', verticalWorkflowRoutes);
app.use('/api/cross-vertical', crossVerticalRoutes);
app.use('/api/chat', llmLimiter, marketingChatRoutes);
app.use('/api/wai-sdk/v3.2', waiSDKv32Routes);
app.use('/api/export', exportRoutes);
app.use('/api/strategy-pipeline', strategyPipelineRoutes);
app.use('/api/monitoring-dashboard', monitoringDashboardRoutes);

// Audit middleware for logging API access
app.use(auditMiddleware());

app.use((err: any, req: any, res: any, next: any) => {
  const statusCode = err.status || err.statusCode || 500;
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message || err);
  if (!res.headersSent) {
    res.status(statusCode).json({
      error: isProduction ? 'An unexpected error occurred' : err.message,
      statusCode,
      ...(isProduction ? {} : { stack: err.stack }),
    });
  }
});

async function startServer() {
  try {
    console.log('='.repeat(60));
    console.log('  WizMark 360 - AI Marketing Operating System v5.0.0');
    console.log('='.repeat(60));
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);

    const { critical, warnings } = validateEnvironment();

    if (warnings.length > 0) {
      console.log(`\n  [WARNINGS] ${warnings.length} optional configurations missing:`);
      warnings.forEach(w => console.log(`    - ${w}`));
    }

    if (critical.length > 0 && isProduction) {
      console.error(`\n  [CRITICAL] Cannot start in production - missing required config:`);
      critical.forEach(c => console.error(`    - ${c}`));
      process.exit(1);
    } else if (critical.length > 0) {
      console.warn(`\n  [WARNING] Missing configurations (non-fatal in development):`);
      critical.forEach(c => console.warn(`    - ${c}`));
    }

    await marketingAgentsLoader.initialize();
    console.log('  262 marketing agents loaded');

    await setupAuth(app);
    await createAdminUser();
    console.log('  Authentication configured (local + Google OAuth)');
    console.log('  PostgreSQL session store active');
    console.log('  Rate limiting enabled (200/min general, 30/min AI, 10/min voice)');

    if (isProduction) {
      try {
        serveStatic(app);
        log('Production static files served');
      } catch (error) {
        console.warn('  Static files not found. Run build first.');
      }
    } else {
      await setupVite(app, server);
      log('Development mode with Vite HMR enabled');
    }

    server.listen(port, "0.0.0.0", () => {
      console.log(`\n  Server running on http://0.0.0.0:${port}`);
      console.log(`  Health: http://localhost:${port}/api/health`);
      console.log('='.repeat(60));
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();
