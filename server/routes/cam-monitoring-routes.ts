/**
 * CAM 2.0 Monitoring API Routes - WAI SDK v3.1
 */

import { Router, Request, Response } from 'express';
import { camV2MonitoringService } from '../services/cam-v2-monitoring';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

/**
 * POST /api/v3/monitoring/operation/start - Start tracking an operation
 */
router.post('/operation/start', async (req: Request, res: Response) => {
  try {
    const { type, agentId, workflowId, provider, model, metadata } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'type is required' });
    }

    const operationId = camV2MonitoringService.startOperation(type, {
      agentId,
      workflowId,
      provider,
      model,
      metadata
    });

    res.json({ success: true, operationId });
  } catch (error: any) {
    console.error('Start operation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/monitoring/operation/:operationId/complete - Complete an operation
 */
router.post('/operation/:operationId/complete', async (req: Request, res: Response) => {
  try {
    const { operationId } = req.params;
    const { success, inputTokens, outputTokens, cost, errorMessage, qualityScore } = req.body;

    camV2MonitoringService.completeOperation(operationId, {
      success: success ?? true,
      inputTokens,
      outputTokens,
      cost,
      errorMessage,
      qualityScore
    });

    res.json({ success: true, message: 'Operation completed' });
  } catch (error: any) {
    console.error('Complete operation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/monitoring/health - Get system health
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const health = camV2MonitoringService.getSystemHealth();
    res.json({ success: true, health });
  } catch (error: any) {
    console.error('Health check error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/monitoring/costs - Get cost analytics
 */
router.get('/costs', async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as 'day' | 'week' | 'month') || 'day';
    const analytics = camV2MonitoringService.getCostAnalytics(period);
    res.json({ success: true, analytics });
  } catch (error: any) {
    console.error('Cost analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/monitoring/agents - Get agent metrics
 */
router.get('/agents', async (req: Request, res: Response) => {
  try {
    const agentId = req.query.agentId as string | undefined;
    const metrics = camV2MonitoringService.getAgentMetrics(agentId);
    res.json({ success: true, agents: metrics });
  } catch (error: any) {
    console.error('Agent metrics error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/monitoring/providers - Get provider metrics
 */
router.get('/providers', async (req: Request, res: Response) => {
  try {
    const providerId = req.query.providerId as string | undefined;
    const metrics = camV2MonitoringService.getProviderMetrics(providerId);
    res.json({ success: true, providers: metrics });
  } catch (error: any) {
    console.error('Provider metrics error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/monitoring/quality - Record quality metric
 */
router.post('/quality', async (req: Request, res: Response) => {
  try {
    const { operationId, scores, feedback } = req.body;

    if (!operationId || !scores) {
      return res.status(400).json({ error: 'operationId and scores are required' });
    }

    camV2MonitoringService.recordQualityMetric(operationId, scores, feedback);
    res.json({ success: true, message: 'Quality metric recorded' });
  } catch (error: any) {
    console.error('Quality metric error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/monitoring/quality/trends - Get quality trends
 */
router.get('/quality/trends', async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as 'day' | 'week' | 'month') || 'week';
    const trends = camV2MonitoringService.getQualityTrends(period);
    res.json({ success: true, trends });
  } catch (error: any) {
    console.error('Quality trends error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/monitoring/alerts - Get alerts
 */
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const { severity, acknowledged, limit } = req.query;
    
    const alerts = camV2MonitoringService.getAlerts({
      severity: severity as any,
      acknowledged: acknowledged === 'true' ? true : acknowledged === 'false' ? false : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });

    res.json({ success: true, alerts });
  } catch (error: any) {
    console.error('Alerts error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/monitoring/alerts/:alertId/acknowledge - Acknowledge alert
 */
router.post('/alerts/:alertId/acknowledge', async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const acknowledged = camV2MonitoringService.acknowledgeAlert(alertId);
    res.json({ success: acknowledged, message: acknowledged ? 'Alert acknowledged' : 'Alert not found' });
  } catch (error: any) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/monitoring/budget - Set cost budget
 */
router.post('/budget', async (req: Request, res: Response) => {
  try {
    const { daily, monthly } = req.body;

    if (typeof daily !== 'number' || typeof monthly !== 'number') {
      return res.status(400).json({ error: 'daily and monthly budgets are required' });
    }

    camV2MonitoringService.setCostBudget(daily, monthly);
    res.json({ success: true, message: 'Budget updated', budget: { daily, monthly } });
  } catch (error: any) {
    console.error('Set budget error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
