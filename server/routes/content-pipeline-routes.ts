/**
 * Multi-Modal Content Pipeline API Routes - WAI SDK v3.1 P2
 */

import { Router, Request, Response } from 'express';
import { multiModalContentPipeline } from '../services/multimodal-content-pipeline';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

/**
 * POST /api/v3/content/pipelines - Create pipeline
 */
router.post('/pipelines', async (req: Request, res: Response) => {
  try {
    const { name, description, brandId, strategy } = req.body;

    if (!name || !strategy) {
      return res.status(400).json({ error: 'name and strategy are required' });
    }

    const pipeline = await multiModalContentPipeline.createPipeline({
      name,
      description: description || '',
      brandId,
      strategy
    });

    res.json({ success: true, pipeline });
  } catch (error: any) {
    console.error('Create pipeline error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/content/pipelines - List pipelines
 */
router.get('/pipelines', async (req: Request, res: Response) => {
  try {
    const { status, brandId, limit } = req.query;

    const pipelines = multiModalContentPipeline.listPipelines({
      status: status as any,
      brandId: brandId as string,
      limit: limit ? parseInt(limit as string) : undefined
    });

    res.json({ success: true, pipelines, count: pipelines.length });
  } catch (error: any) {
    console.error('List pipelines error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/content/pipelines/:pipelineId - Get pipeline
 */
router.get('/pipelines/:pipelineId', async (req: Request, res: Response) => {
  try {
    const { pipelineId } = req.params;
    const pipeline = multiModalContentPipeline.getPipeline(pipelineId);

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    res.json({ success: true, pipeline });
  } catch (error: any) {
    console.error('Get pipeline error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/content/pipelines/:pipelineId/execute - Execute pipeline
 */
router.post('/pipelines/:pipelineId/execute', async (req: Request, res: Response) => {
  try {
    const { pipelineId } = req.params;
    const pipeline = await multiModalContentPipeline.executePipeline(pipelineId);
    res.json({ success: true, pipeline });
  } catch (error: any) {
    console.error('Execute pipeline error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/content/pipelines/:pipelineId/outputs/:outputId/approve - Approve output
 */
router.post('/pipelines/:pipelineId/outputs/:outputId/approve', async (req: Request, res: Response) => {
  try {
    const { pipelineId, outputId } = req.params;
    const { approved, reviewer, comments } = req.body;

    if (typeof approved !== 'boolean' || !reviewer) {
      return res.status(400).json({ error: 'approved (boolean) and reviewer are required' });
    }

    const output = multiModalContentPipeline.approveOutput(pipelineId, outputId, {
      approved,
      reviewer,
      comments
    });

    if (!output) {
      return res.status(404).json({ error: 'Pipeline or output not found' });
    }

    res.json({ success: true, output });
  } catch (error: any) {
    console.error('Approve output error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/content/pipelines/:pipelineId/outputs/:outputId/variations - Generate variations
 */
router.post('/pipelines/:pipelineId/outputs/:outputId/variations', async (req: Request, res: Response) => {
  try {
    const { pipelineId, outputId } = req.params;
    const { count } = req.body;

    const variations = await multiModalContentPipeline.generateVariations(
      pipelineId,
      outputId,
      count || 3
    );

    res.json({ success: true, variations });
  } catch (error: any) {
    console.error('Generate variations error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/content/pipelines/:pipelineId/outputs/:outputId/adapt - Adapt for channels
 */
router.post('/pipelines/:pipelineId/outputs/:outputId/adapt', async (req: Request, res: Response) => {
  try {
    const { pipelineId, outputId } = req.params;
    const { channels } = req.body;

    if (!channels || !Array.isArray(channels)) {
      return res.status(400).json({ error: 'channels array is required' });
    }

    const adaptedOutputs = await multiModalContentPipeline.adaptContent(
      pipelineId,
      outputId,
      channels
    );

    res.json({ success: true, adaptedOutputs });
  } catch (error: any) {
    console.error('Adapt content error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/content/brands - Register brand
 */
router.post('/brands', async (req: Request, res: Response) => {
  try {
    const { brandId, guidelines } = req.body;

    if (!brandId || !guidelines) {
      return res.status(400).json({ error: 'brandId and guidelines are required' });
    }

    multiModalContentPipeline.registerBrand(brandId, guidelines);
    res.json({ success: true, message: 'Brand registered' });
  } catch (error: any) {
    console.error('Register brand error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/content/templates - Get templates
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const { type, channel } = req.query;

    const templates = multiModalContentPipeline.getTemplates({
      type: type as any,
      channel: channel as any
    });

    res.json({ success: true, templates });
  } catch (error: any) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/content/from-template - Create from template
 */
router.post('/from-template', async (req: Request, res: Response) => {
  try {
    const { templateId, variables, pipelineId } = req.body;

    if (!templateId || !variables) {
      return res.status(400).json({ error: 'templateId and variables are required' });
    }

    const output = await multiModalContentPipeline.createFromTemplate(
      templateId,
      variables,
      pipelineId
    );

    res.json({ success: true, output });
  } catch (error: any) {
    console.error('Create from template error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/content/health - Health check
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json(multiModalContentPipeline.getHealth());
});

export default router;
