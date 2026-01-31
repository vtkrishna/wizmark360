/**
 * Advanced Orchestration Patterns API Routes - WAI SDK v3.1
 * 
 * Multi-agent workflow orchestration endpoints.
 */

import { Router, Request, Response } from 'express';
import { advancedOrchestrationPatterns, type WorkflowDefinition } from '../services/advanced-orchestration-patterns';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * POST /api/v3/orchestration/workflows
 * Register a new workflow
 */
router.post('/workflows', authenticateToken, async (req: Request, res: Response) => {
  try {
    const workflow: WorkflowDefinition = req.body;

    advancedOrchestrationPatterns.registerWorkflow(workflow);

    res.json({
      success: true,
      data: workflow,
      message: 'Workflow registered successfully'
    });
  } catch (error) {
    console.error('Register workflow error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to register workflow'
    });
  }
});

/**
 * GET /api/v3/orchestration/workflows
 * List all registered workflows
 */
router.get('/workflows', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const workflows = advancedOrchestrationPatterns.listWorkflows();

    res.json({
      success: true,
      data: workflows
    });
  } catch (error) {
    console.error('List workflows error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list workflows'
    });
  }
});

/**
 * GET /api/v3/orchestration/workflows/:id
 * Get a workflow by ID
 */
router.get('/workflows/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const workflow = advancedOrchestrationPatterns.getWorkflow(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve workflow'
    });
  }
});

/**
 * DELETE /api/v3/orchestration/workflows/:id
 * Delete a workflow
 */
router.delete('/workflows/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const deleted = advancedOrchestrationPatterns.deleteWorkflow(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      message: 'Workflow deleted'
    });
  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete workflow'
    });
  }
});

/**
 * POST /api/v3/orchestration/workflows/:id/execute
 * Execute a workflow
 */
router.post('/workflows/:id/execute', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { input, options } = req.body;

    const result = await advancedOrchestrationPatterns.executeWorkflow(
      req.params.id,
      input,
      options
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Execute workflow error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Workflow execution failed'
    });
  }
});

/**
 * GET /api/v3/orchestration/executions/:id
 * Get execution status
 */
router.get('/executions/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const execution = advancedOrchestrationPatterns.getExecution(req.params.id);

    if (!execution) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found'
      });
    }

    res.json({
      success: true,
      data: execution
    });
  } catch (error) {
    console.error('Get execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve execution'
    });
  }
});

/**
 * POST /api/v3/orchestration/templates/marketing
 * Create a pre-built marketing workflow from template
 */
router.post('/templates/marketing', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { type } = req.body;

    if (!['content_pipeline', 'campaign_launch', 'competitor_analysis'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid template type. Use: content_pipeline, campaign_launch, competitor_analysis'
      });
    }

    const workflow = advancedOrchestrationPatterns.createMarketingWorkflow(type);

    res.json({
      success: true,
      data: workflow,
      message: `Marketing workflow '${type}' created successfully`
    });
  } catch (error) {
    console.error('Create marketing workflow error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create marketing workflow'
    });
  }
});

/**
 * GET /api/v3/orchestration/patterns
 * Get available orchestration patterns
 */
router.get('/patterns', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      patterns: [
        {
          id: 'sequential',
          name: 'Sequential (Pipeline)',
          description: 'Linear chain of agents, each processing output from the previous',
          useCases: ['Content creation', 'Document processing', 'Data transformation'],
          tokenEfficiency: 'Medium'
        },
        {
          id: 'concurrent',
          name: 'Concurrent (Parallel)',
          description: 'Multiple agents run simultaneously on the same input',
          useCases: ['Multi-source research', 'Competitor analysis', 'A/B testing'],
          tokenEfficiency: 'High'
        },
        {
          id: 'supervisor',
          name: 'Supervisor (Hierarchical)',
          description: 'Central orchestrator coordinates all agent interactions',
          useCases: ['Complex campaigns', 'Multi-channel coordination', 'Quality assurance'],
          tokenEfficiency: 'Low (high traceability)'
        },
        {
          id: 'adaptive_network',
          name: 'Adaptive Network (Decentralized)',
          description: 'Agents collaborate and handoff tasks without central control',
          useCases: ['Customer support', 'Real-time interactions', 'Voice interfaces'],
          tokenEfficiency: 'Very High (200%+ vs supervisor)'
        },
        {
          id: 'handoff',
          name: 'Handoff (Referral)',
          description: 'Agents dynamically delegate based on expertise',
          useCases: ['Specialized tasks', 'Regulatory workflows', 'Expert consultations'],
          tokenEfficiency: 'High'
        },
        {
          id: 'custom',
          name: 'Custom (Programmatic)',
          description: 'Full SDK control over orchestration logic',
          useCases: ['Regulated industries', 'Deterministic workflows', 'Custom logic'],
          tokenEfficiency: 'Configurable'
        }
      ]
    }
  });
});

/**
 * GET /api/v3/orchestration/health
 * Get service health status
 */
router.get('/health', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: advancedOrchestrationPatterns.getHealth()
  });
});

export default router;
