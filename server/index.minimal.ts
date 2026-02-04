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

const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT) || 5000;

// Create Express app and HTTP server
const app = express();
const server = createServer(app);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - allow Replit dev domains
app.use(cors({
  origin: (origin, callback) => {
    if (!isProduction && (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('.replit.dev'))) {
      return callback(null, true);
    }
    if (!origin) return callback(null, true);
    callback(null, false);
  },
  credentials: true
}));

// Basic security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for Replit development
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0-minimal',
    timestamp: new Date().toISOString(),
    message: 'WAI SDK Platform - Minimal Server Running',
    note: 'This is a minimal server. Many modules are missing from the GitHub import. See replit.md for details.'
  });
});

// Basic API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Market360 - Wizards MarketAI Platform',
    version: '1.0.0',
    mode: 'minimal',
    endpoints: {
      health: '/api/health',
      info: '/api',
      market360: '/api/market360/*',
    },
    verticals: ['social', 'seo', 'web', 'sales', 'whatsapp', 'linkedin', 'performance'],
    message: 'Market360 Self-Driving Agency Platform powered by WAI SDK'
  });
});

// Market360 API routes
app.use('/api/market360', market360Router);

// AI API routes
app.use('/api/ai', aiRouter);

// Brands/ERP API routes
app.use('/api/brands', brandsRouter);

// Chat API routes - Main AI orchestration endpoint
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

// Translation Routes (Sarvam + Gemini for Indian languages)
app.use('/api/translation', translationRoutes);

// WhatsApp Business API Routes
app.use('/api/whatsapp', whatsappRoutes);

// CRM Integration Routes (Salesforce/HubSpot)
app.use('/api/crm', crmRoutes);

// Social Publishing Routes (Meta/LinkedIn/Twitter)
app.use('/api/social', socialPublishingRoutes);

// Voice Agent Routes (Sarvam STT/TTS)
app.use('/api/voice', voiceRoutes);

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
app.use('/api/chat', marketingChatRoutes);

// Audit middleware for logging API access
app.use(auditMiddleware());

async function startServer() {
  try {
    console.log('🚀 Starting WAI SDK Platform - Minimal Mode');
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    
    // Setup authentication (MUST be before other routes)
    await setupAuth(app);
    await createAdminUser();
    console.log('🔐 Authentication configured (username/password + Google OAuth)');
    
    // Setup Vite in development or serve static in production
    if (isProduction) {
      try {
        serveStatic(app);
        log('Production static files served');
      } catch (error) {
        console.warn('⚠️  Static files not found. Run build first:', error);
      }
    } else {
      await setupVite(app, server);
      log('Development mode with Vite HMR enabled');
    }
    
    // Start server
    server.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server running on http://0.0.0.0:${port}`);
      console.log(`🌐 Health check: http://localhost:${port}/api/health`);
      console.log(`🔐 Auth: /api/login, /api/logout, /api/auth/user`);
      console.log(`📝 Note: Running in minimal mode - see replit.md for details`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
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
