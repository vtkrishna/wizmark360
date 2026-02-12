import { Router, Request, Response } from 'express';
import {
  createStrategy,
  generateExecutionPlans,
  getStrategyStatus,
  getStrategies,
  updateTaskStatus,
  getExecutionPlans,
} from '../services/strategy-execution-pipeline';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { brandId, name, objectives, targetAudience, budget, duration, verticals } = req.body;

    if (!brandId || !name || !objectives || !budget || !verticals) {
      return res.status(400).json({ error: 'Missing required fields: brandId, name, objectives, budget, verticals' });
    }

    const strategy = await createStrategy({
      brandId,
      name,
      objectives,
      targetAudience: targetAudience || 'General market audience — demographics, interests, and behaviors to be refined during strategy execution',
      budget,
      duration: duration || '3 months',
      verticals,
    });

    res.status(201).json(strategy);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create strategy' });
  }
});

router.get('/', (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string | undefined;
    const strategies = getStrategies(brandId);
    res.json(strategies);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list strategies' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const status = getStrategyStatus(req.params.id);
    if (!status) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    const plans = getExecutionPlans(req.params.id);

    res.json({
      ...status.strategy,
      executionPlans: plans || [],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get strategy details' });
  }
});

router.post('/:id/execute', async (req: Request, res: Response) => {
  try {
    const strategies = getStrategies();
    const strategy = strategies.find(s => s.id === req.params.id);

    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    const plans = await generateExecutionPlans(strategy);
    res.json({ strategyId: strategy.id, executionPlans: plans });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate execution plans' });
  }
});

router.get('/:id/status', (req: Request, res: Response) => {
  try {
    const status = getStrategyStatus(req.params.id);
    if (!status) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get strategy status' });
  }
});

router.patch('/:id/tasks/:taskId', (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'in_progress', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: pending, in_progress, completed, failed' });
    }

    const task = updateTaskStatus(req.params.taskId, status);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update task status' });
  }
});

export default router;
