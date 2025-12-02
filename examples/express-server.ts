/**
 * WAI SDK v1.0 - Express.js Integration Example
 * 
 * Complete Express server with WAI SDK orchestration
 */

import express from 'express';
import cors from 'cors';
import { WAIOrchestration, sharedAGUIService } from '../src';

const app = express();
const wai = new WAIOrchestration();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'WAI SDK v1.0' });
});

// System health
app.get('/api/wai/health', async (req, res) => {
  const health = await wai.getSystemHealth();
  res.json(health);
});

// Execute orchestration
app.post('/api/wai/execute', async (req, res) => {
  try {
    const result = await wai.execute({
      startupId: req.body.startupId || 1,
      sessionId: req.body.sessionId || 'api-session',
      jobType: req.body.jobType || 'analysis',
      workflow: req.body.workflow || 'sequential',
      agents: req.body.agents || [],
      inputs: req.body.inputs || {},
      priority: req.body.priority || 'medium',
      studioType: req.body.studioType,
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Orchestration failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create AG-UI streaming session
app.post('/api/agui/session', (req, res) => {
  const session = sharedAGUIService.createSession(
    req.body.startupId || 1,
    req.body.sessionId,
    req.body.studioId,
    req.body.userId
  );
  
  res.json({
    sessionId: session.id,
    streamUrl: `/api/agui/stream/${session.id}`,
  });
});

// SSE streaming endpoint
app.get('/api/agui/stream/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Listen for events
  const eventHandler = (event: any) => {
    res.write(`event: ${event.type}\n`);
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };
  
  sharedAGUIService.on(`event:${sessionId}`, eventHandler);
  
  // Cleanup on close
  req.on('close', () => {
    sharedAGUIService.off(`event:${sessionId}`, eventHandler);
  });
});

// Get available agents
app.get('/api/wai/agents', async (req, res) => {
  const agents = await wai.getAvailableAgents();
  res.json(agents);
});

// Get available providers
app.get('/api/wai/providers', async (req, res) => {
  const providers = await wai.getAvailableProviders();
  res.json(providers);
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('🚀 WAI SDK Express Server');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api/wai`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log('✅ Ready to accept requests\n');
});
