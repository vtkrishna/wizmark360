import { Router, Request, Response } from 'express';
import { clientPortalService } from '../services/client-portal-service';
import { requireBrandAccess } from '../middleware/auth-middleware';

const router = Router();

router.use(requireBrandAccess);

router.get('/portals/:brandId', async (req: Request, res: Response) => {
  try {
    const portals = await clientPortalService.getPortals(req.params.brandId);
    res.json({ success: true, data: portals, count: portals.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portals' });
  }
});

router.post('/portals/:brandId', async (req: Request, res: Response) => {
  try {
    const portal = await clientPortalService.createPortal(req.params.brandId, req.body);
    res.json({ success: true, data: portal, message: 'Portal created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create portal' });
  }
});

router.get('/reports/:portalId', async (req: Request, res: Response) => {
  try {
    const reports = await clientPortalService.getReports(req.params.portalId);
    res.json({ success: true, data: reports, count: reports.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

router.post('/reports/:portalId', async (req: Request, res: Response) => {
  const { type, period } = req.body;
  if (!type || !period) {
    return res.status(400).json({ error: 'Type and period are required' });
  }
  try {
    const report = await clientPortalService.generateReport(req.params.portalId, type, period);
    res.json({ success: true, data: report, message: 'Report generated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

router.get('/approvals/:portalId', async (req: Request, res: Response) => {
  const { status } = req.query;
  try {
    const approvals = await clientPortalService.getApprovals(req.params.portalId, status as string);
    res.json({ success: true, data: approvals, count: approvals.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch approvals' });
  }
});

router.post('/approvals/:portalId', async (req: Request, res: Response) => {
  try {
    const approval = await clientPortalService.submitForApproval(req.params.portalId, req.body);
    res.json({ success: true, data: approval, message: 'Submitted for approval' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit for approval' });
  }
});

router.put('/approvals/:portalId/:approvalId/review', async (req: Request, res: Response) => {
  const { status, feedback } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  try {
    const approval = await clientPortalService.reviewApproval(
      req.params.portalId,
      req.params.approvalId,
      status,
      feedback
    );
    if (approval) {
      res.json({ success: true, data: approval, message: `Content ${status}` });
    } else {
      res.status(404).json({ error: 'Approval not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to review approval' });
  }
});

export default router;
