/**
 * Digital Twin API Routes - WAI SDK v3.1 P2
 */

import { Router, Request, Response } from 'express';
import { digitalTwinService } from '../services/digital-twin-service';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

/**
 * POST /api/v3/twins - Create digital twin
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { type, name, state, metadata } = req.body;

    if (!type || !name || !state) {
      return res.status(400).json({ error: 'type, name, and state are required' });
    }

    const twin = digitalTwinService.createTwin({ type, name, state, metadata });
    res.json({ success: true, twin });
  } catch (error: any) {
    console.error('Create twin error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/twins - List twins
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, status, limit } = req.query;
    
    const twins = digitalTwinService.listTwins({
      type: type as any,
      status: status as any,
      limit: limit ? parseInt(limit as string) : undefined
    });

    res.json({ success: true, twins, count: twins.length });
  } catch (error: any) {
    console.error('List twins error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/twins/:twinId - Get twin
 */
router.get('/:twinId', async (req: Request, res: Response) => {
  try {
    const { twinId } = req.params;
    const twin = digitalTwinService.getTwin(twinId);

    if (!twin) {
      return res.status(404).json({ error: 'Twin not found' });
    }

    res.json({ success: true, twin });
  } catch (error: any) {
    console.error('Get twin error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/v3/twins/:twinId - Update twin state
 */
router.patch('/:twinId', async (req: Request, res: Response) => {
  try {
    const { twinId } = req.params;
    const { state, source, requiresApproval } = req.body;

    if (!state) {
      return res.status(400).json({ error: 'state is required' });
    }

    const result = digitalTwinService.updateState(twinId, state, source, requiresApproval);
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Update twin error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/twins/:twinId/predictions - Get predictions
 */
router.get('/:twinId/predictions', async (req: Request, res: Response) => {
  try {
    const { twinId } = req.params;
    const predictions = digitalTwinService.getPredictions(twinId);
    res.json({ success: true, predictions });
  } catch (error: any) {
    console.error('Get predictions error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/twins/:twinId/history - Get history
 */
router.get('/:twinId/history', async (req: Request, res: Response) => {
  try {
    const { twinId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const history = digitalTwinService.getHistory(twinId, limit);
    res.json({ success: true, history });
  } catch (error: any) {
    console.error('Get history error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/twins/:twinId/simulate - Run simulation
 */
router.post('/:twinId/simulate', async (req: Request, res: Response) => {
  try {
    const { twinId } = req.params;
    const { name, description, variables, duration } = req.body;

    if (!name || !variables) {
      return res.status(400).json({ error: 'name and variables are required' });
    }

    const simulation = await digitalTwinService.runSimulation(twinId, {
      name,
      description: description || '',
      variables,
      duration: duration || 30
    });

    res.json({ success: true, simulation });
  } catch (error: any) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/twins/:twinId/simulations - List simulations
 */
router.get('/:twinId/simulations', async (req: Request, res: Response) => {
  try {
    const { twinId } = req.params;
    const simulations = digitalTwinService.listSimulations(twinId);
    res.json({ success: true, simulations });
  } catch (error: any) {
    console.error('List simulations error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/twins/:twinId/link - Link twins
 */
router.post('/:twinId/link', async (req: Request, res: Response) => {
  try {
    const { twinId } = req.params;
    const { linkedTwinId } = req.body;

    if (!linkedTwinId) {
      return res.status(400).json({ error: 'linkedTwinId is required' });
    }

    digitalTwinService.linkTwins(twinId, linkedTwinId);
    res.json({ success: true, message: 'Twins linked' });
  } catch (error: any) {
    console.error('Link twins error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/twins/approvals/pending - Get pending approvals
 */
router.get('/approvals/pending', async (req: Request, res: Response) => {
  try {
    const twinId = req.query.twinId as string | undefined;
    const approvals = digitalTwinService.getPendingApprovals(twinId);
    res.json({ success: true, approvals });
  } catch (error: any) {
    console.error('Get approvals error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/twins/approvals/:approvalId - Process approval
 */
router.post('/approvals/:approvalId', async (req: Request, res: Response) => {
  try {
    const { approvalId } = req.params;
    const { approved, approvedBy, comments } = req.body;

    if (typeof approved !== 'boolean' || !approvedBy) {
      return res.status(400).json({ error: 'approved (boolean) and approvedBy are required' });
    }

    const approval = digitalTwinService.processApproval(approvalId, {
      approved,
      approvedBy,
      comments
    });

    res.json({ success: true, approval });
  } catch (error: any) {
    console.error('Process approval error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/twins/health - Health check
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json(digitalTwinService.getHealth());
});

export default router;
