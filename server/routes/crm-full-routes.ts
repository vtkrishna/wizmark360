import { Router, Request, Response } from 'express';
import { crmIntegrationFullService } from '../services/crm-integration-full-service';
import { requireBrandAccess } from '../middleware/auth-middleware';

const router = Router();

router.use(requireBrandAccess);

router.post('/configure/:brandId', async (req: Request, res: Response) => {
  try {
    const result = await crmIntegrationFullService.configureCRM(req.params.brandId, req.body);
    res.json({ success: result.success, message: result.message });
  } catch (error) {
    res.status(500).json({ error: 'Failed to configure CRM' });
  }
});

router.post('/sync/:brandId', async (req: Request, res: Response) => {
  try {
    const result = await crmIntegrationFullService.syncCRM(req.params.brandId);
    res.json({ success: true, data: result, message: 'CRM sync completed' });
  } catch (error) {
    res.status(500).json({ error: 'Sync failed' });
  }
});

router.get('/sync/history/:brandId', (req: Request, res: Response) => {
  const history = crmIntegrationFullService.getSyncHistory(req.params.brandId);
  res.json({ success: true, data: history });
});

router.get('/contacts/:brandId', async (req: Request, res: Response) => {
  const { search, status, tags } = req.query;
  try {
    const contacts = await crmIntegrationFullService.getContacts(req.params.brandId, {
      search: search as string,
      status: status as string,
      tags: tags ? (tags as string).split(',') : undefined
    });
    res.json({ success: true, data: contacts, count: contacts.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

router.post('/contacts/:brandId', async (req: Request, res: Response) => {
  try {
    const contact = await crmIntegrationFullService.createContact(req.params.brandId, req.body);
    res.json({ success: true, data: contact, message: 'Contact created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

router.get('/leads/:brandId', async (req: Request, res: Response) => {
  const { status, minScore } = req.query;
  try {
    const leads = await crmIntegrationFullService.getLeads(req.params.brandId, {
      status: status as string,
      minScore: minScore ? parseInt(minScore as string) : undefined
    });
    res.json({ success: true, data: leads, count: leads.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

router.post('/leads/:brandId', async (req: Request, res: Response) => {
  try {
    const lead = await crmIntegrationFullService.createLead(req.params.brandId, req.body);
    res.json({ success: true, data: lead, message: 'Lead created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

router.post('/leads/:brandId/:leadId/activity', async (req: Request, res: Response) => {
  try {
    const lead = await crmIntegrationFullService.addLeadActivity(
      req.params.brandId,
      req.params.leadId,
      req.body
    );
    if (lead) {
      res.json({ success: true, data: lead, message: 'Activity added' });
    } else {
      res.status(404).json({ error: 'Lead not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add activity' });
  }
});

router.get('/deals/:brandId', async (req: Request, res: Response) => {
  const { stage, minValue } = req.query;
  try {
    const deals = await crmIntegrationFullService.getDeals(req.params.brandId, {
      stage: stage as string,
      minValue: minValue ? parseInt(minValue as string) : undefined
    });
    res.json({ success: true, data: deals, count: deals.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

router.post('/deals/:brandId', async (req: Request, res: Response) => {
  try {
    const deal = await crmIntegrationFullService.createDeal(req.params.brandId, req.body);
    res.json({ success: true, data: deal, message: 'Deal created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

router.get('/pipeline/:brandId', async (req: Request, res: Response) => {
  try {
    const stats = await crmIntegrationFullService.getPipelineStats(req.params.brandId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pipeline stats' });
  }
});

export default router;
