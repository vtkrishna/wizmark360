/**
 * Vertical Workflow API Routes
 * End-to-end workflow execution for all 7 marketing verticals
 */

import { Router, Request, Response } from 'express';
import { verticalWorkflowEngine } from '../services/vertical-workflow-engine';

const router = Router();

router.get('/workflows', async (req: Request, res: Response) => {
  try {
    const workflows = verticalWorkflowEngine.listWorkflows();
    res.json({
      success: true,
      data: workflows.map(wf => ({
        id: wf.id,
        name: wf.name,
        vertical: wf.vertical,
        description: wf.description,
        version: wf.version,
        stepCount: wf.steps.length,
        triggers: wf.triggers.map(t => t.type)
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/workflows/:workflowId', async (req: Request, res: Response) => {
  try {
    const workflow = verticalWorkflowEngine.getWorkflow(req.params.workflowId);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }
    res.json({ success: true, data: workflow });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/workflows/:workflowId/execute', async (req: Request, res: Response) => {
  try {
    const { inputs, options } = req.body;
    const execution = await verticalWorkflowEngine.executeWorkflow(
      req.params.workflowId,
      inputs || {},
      {
        ...options,
        mockExternalApis: options?.mockExternalApis !== false
      }
    );

    res.json({
      success: true,
      data: {
        id: execution.id,
        workflowId: execution.workflowId,
        status: execution.status,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        outputs: execution.outputs,
        errors: execution.errors
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/executions', async (req: Request, res: Response) => {
  try {
    const workflowId = req.query.workflowId as string | undefined;
    const executions = verticalWorkflowEngine.listExecutions(workflowId);
    
    res.json({
      success: true,
      data: executions.map(e => ({
        id: e.id,
        workflowId: e.workflowId,
        status: e.status,
        currentStep: e.currentStep,
        startedAt: e.startedAt,
        completedAt: e.completedAt,
        errorCount: e.errors.length
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/executions/:executionId', async (req: Request, res: Response) => {
  try {
    const execution = verticalWorkflowEngine.getExecution(req.params.executionId);
    if (!execution) {
      return res.status(404).json({ success: false, error: 'Execution not found' });
    }

    res.json({
      success: true,
      data: {
        id: execution.id,
        workflowId: execution.workflowId,
        status: execution.status,
        currentStep: execution.currentStep,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        inputs: execution.inputs,
        outputs: execution.outputs,
        stepResults: Object.fromEntries(execution.stepResults),
        errors: execution.errors
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/verticals', async (req: Request, res: Response) => {
  try {
    const workflows = verticalWorkflowEngine.listWorkflows();
    const verticalSet = new Set<string>();
    workflows.forEach(wf => verticalSet.add(wf.vertical));
    const verticals = Array.from(verticalSet);
    
    const verticalSummary = verticals.map(vertical => {
      const verticalWorkflows = workflows.filter(wf => wf.vertical === vertical);
      return {
        id: vertical,
        name: vertical.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        workflowCount: verticalWorkflows.length,
        workflows: verticalWorkflows.map(wf => ({ id: wf.id, name: wf.name }))
      };
    });

    res.json({ success: true, data: verticalSummary });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
