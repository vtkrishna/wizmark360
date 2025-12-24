/**
 * WAI SDK Platform - Minimal Replit Server Entry Point
 * 
 * This is a simplified server entry that starts the application with only
 * the modules that actually exist in the codebase. Once missing modules
 * are implemented, switch to server/index.ts via the dev:full script.
 */

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { log, setupVite, serveStatic } from "./vite";
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
import { auditMiddleware } from "./services/audit-logging-service";

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

// Audit middleware for logging API access
app.use(auditMiddleware());

async function startServer() {
  try {
    console.log('🚀 Starting WAI SDK Platform - Minimal Mode');
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    
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
