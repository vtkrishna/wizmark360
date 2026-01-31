/**
 * GRPO Continuous Learning API Routes - WAI SDK v3.1
 */

import { Router, Request, Response } from 'express';
import { grpoLearningService } from '../services/grpo-learning-service';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

/**
 * POST /api/v3/learning/feedback - Record feedback
 */
router.post('/feedback', async (req: Request, res: Response) => {
  try {
    const { operationId, agentId, provider, model, taskType, input, output, rating, helpful, comments, feedbackType, metadata } = req.body;

    if (!operationId || !provider || !model || !taskType || !input || !output || rating === undefined || helpful === undefined) {
      return res.status(400).json({ 
        error: 'operationId, provider, model, taskType, input, output, rating, and helpful are required' 
      });
    }

    const feedbackId = grpoLearningService.recordFeedback(operationId, {
      agentId,
      provider,
      model,
      taskType,
      input,
      output,
      rating,
      helpful,
      comments,
      feedbackType,
      metadata
    });

    res.json({ success: true, feedbackId });
  } catch (error: any) {
    console.error('Record feedback error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/learning/route - Get optimal routing decision
 */
router.post('/route', async (req: Request, res: Response) => {
  try {
    const { taskType, preferredProviders, excludeProviders, maxCost, maxLatency, minConfidence } = req.body;

    if (!taskType) {
      return res.status(400).json({ error: 'taskType is required' });
    }

    const decision = grpoLearningService.getOptimalRoute(taskType, {
      preferredProviders,
      excludeProviders,
      maxCost,
      maxLatency,
      minConfidence
    });

    res.json({ success: true, decision });
  } catch (error: any) {
    console.error('Routing error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/learning/experiments - Create experiment
 */
router.post('/experiments', async (req: Request, res: Response) => {
  try {
    const { name, description, variants } = req.body;

    if (!name || !description || !variants || !Array.isArray(variants)) {
      return res.status(400).json({ error: 'name, description, and variants array are required' });
    }

    const experiment = grpoLearningService.createExperiment(name, description, variants);
    res.json({ success: true, experiment });
  } catch (error: any) {
    console.error('Create experiment error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/learning/experiments - List experiments
 */
router.get('/experiments', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as 'active' | 'paused' | 'completed' | undefined;
    const experiments = grpoLearningService.listExperiments(status);
    res.json({ success: true, experiments });
  } catch (error: any) {
    console.error('List experiments error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/learning/experiments/:experimentId - Get experiment
 */
router.get('/experiments/:experimentId', async (req: Request, res: Response) => {
  try {
    const { experimentId } = req.params;
    const experiment = grpoLearningService.getExperiment(experimentId);

    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    res.json({ success: true, experiment });
  } catch (error: any) {
    console.error('Get experiment error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/learning/experiments/:experimentId/variant - Get variant for A/B testing
 */
router.get('/experiments/:experimentId/variant', async (req: Request, res: Response) => {
  try {
    const { experimentId } = req.params;
    const variant = grpoLearningService.getExperimentVariant(experimentId);

    if (!variant) {
      return res.status(404).json({ error: 'Experiment not found or not active' });
    }

    res.json({ success: true, variant });
  } catch (error: any) {
    console.error('Get variant error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/learning/experiments/:experimentId/conversion - Record conversion
 */
router.post('/experiments/:experimentId/conversion', async (req: Request, res: Response) => {
  try {
    const { experimentId } = req.params;
    const { variantId, score } = req.body;

    if (!variantId || score === undefined) {
      return res.status(400).json({ error: 'variantId and score are required' });
    }

    grpoLearningService.recordExperimentConversion(experimentId, variantId, score);
    res.json({ success: true, message: 'Conversion recorded' });
  } catch (error: any) {
    console.error('Record conversion error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/learning/experiments/:experimentId/conclude - Conclude experiment
 */
router.post('/experiments/:experimentId/conclude', async (req: Request, res: Response) => {
  try {
    const { experimentId } = req.params;
    const experiment = grpoLearningService.concludeExperiment(experimentId);

    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    res.json({ success: true, experiment });
  } catch (error: any) {
    console.error('Conclude experiment error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/learning/metrics - Get learning metrics
 */
router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const metrics = grpoLearningService.getLearningMetrics();
    res.json({ success: true, metrics });
  } catch (error: any) {
    console.error('Learning metrics error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/learning/health - Health check
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json(grpoLearningService.getHealth());
});

export default router;
