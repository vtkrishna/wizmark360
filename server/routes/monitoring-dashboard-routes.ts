import { Router, Request, Response } from 'express';
import pg from 'pg';
import { getStrategies } from '../services/strategy-execution-pipeline';
import { listDocuments } from '../services/document-generator';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const router = Router();

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

router.get('/kpis', async (_req: Request, res: Response) => {
  try {
    let totalBrands = 0;
    let totalCampaigns = 0;
    let totalBudget = 0;
    try {
      const brandResult = await pool.query('SELECT COUNT(*) as count FROM brands');
      totalBrands = parseInt(brandResult.rows[0].count, 10);
    } catch { /* brands table may not exist */ }
    try {
      const campaignResult = await pool.query('SELECT COUNT(*) as count FROM campaigns');
      totalCampaigns = parseInt(campaignResult.rows[0].count, 10);
      const budgetResult = await pool.query('SELECT COALESCE(SUM(budget), 0) as total FROM campaigns');
      totalBudget = parseFloat(budgetResult.rows[0].total);
    } catch { /* campaigns table may not exist */ }

    const strategies = getStrategies();
    const documents = listDocuments();

    const totalStrategies = strategies.length;
    const totalDocuments = documents.length;
    const activeCampaigns = strategies.filter(
      s => s.status === 'executing' || s.status === 'monitoring'
    ).length + totalCampaigns;

    const now = new Date();
    const hasRealActivity = totalStrategies > 0 || totalDocuments > 0 || totalCampaigns > 0;

    res.json({
      success: true,
      metadata: {
        dataSource: hasRealActivity ? 'live' : 'awaiting_data',
        generatedAt: now.toISOString(),
        hasRealActivity
      },
      kpis: {
        totalBrands: { value: totalBrands, dataSource: 'database' },
        totalStrategies: { value: totalStrategies, dataSource: 'live' },
        totalDocuments: { value: totalDocuments, dataSource: 'live' },
        activeCampaigns: { value: activeCampaigns, dataSource: activeCampaigns > 0 ? 'database' : 'awaiting_data' },
        totalReach: { value: 0, dataSource: 'awaiting_data' },
        engagementRate: { value: 0, dataSource: 'awaiting_data' },
        conversions: { value: 0, dataSource: 'awaiting_data' },
        roas: { value: 0, dataSource: 'awaiting_data' },
        costPerLead: { value: 0, dataSource: 'awaiting_data' },
        monthlySpend: { value: totalBudget, dataSource: totalBudget > 0 ? 'database' : 'awaiting_data' },
        monthlyRevenue: { value: 0, dataSource: 'awaiting_data' },
        roi: { value: 0, dataSource: 'awaiting_data' },
        contentCreated: { value: totalDocuments, dataSource: 'live' },
        agentsActive: { value: 262, dataSource: 'platform' }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/vertical-performance', async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

    const strategies = getStrategies();
    const activeVerticalIds = new Set<string>();
    for (const strategy of strategies) {
      if (strategy.status === 'executing' || strategy.status === 'monitoring' || strategy.status === 'planning') {
        for (const v of strategy.verticals) {
          activeVerticalIds.add(v.toLowerCase());
        }
      }
    }

    const verticalDefs = [
      { id: 'social', name: 'Social Media' },
      { id: 'seo', name: 'SEO & GEO' },
      { id: 'web', name: 'Web Development' },
      { id: 'sales', name: 'Sales & SDR' },
      { id: 'whatsapp', name: 'WhatsApp Marketing' },
      { id: 'linkedin', name: 'LinkedIn & B2B' },
      { id: 'performance', name: 'Performance Ads' },
      { id: 'pr', name: 'PR & Communications' }
    ];

    const verticals = verticalDefs.map((v) => {
      const active = activeVerticalIds.has(v.id);
      return { id: v.id, name: v.name, reach: 0, engagement: 0, conversions: 0, spend: 0, revenue: 0, roas: 0, active };
    });

    res.json({
      success: true,
      metadata: {
        dataSource: activeVerticalIds.size > 0 ? 'live' : 'awaiting_data',
        activeStrategiesCount: strategies.length,
        generatedAt: now.toISOString()
      },
      verticals
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/spend-breakdown', async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const months: { month: string; spend: number; revenue: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ month: getMonthLabel(d), spend: 0, revenue: 0 });
    }

    res.json({
      success: true,
      metadata: {
        dataSource: 'awaiting_data',
        generatedAt: now.toISOString()
      },
      months
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/recent-activity', async (_req: Request, res: Response) => {
  try {
    const now = new Date();

    const realActivities: Array<{
      id: string;
      type: string;
      title: string;
      vertical: string;
      timestamp: string;
      status: string;
      dataSource: string;
    }> = [];

    const documents = listDocuments();
    for (const doc of documents) {
      realActivities.push({
        id: `doc_${doc.id}`,
        type: 'document_generated',
        title: `Document Generated: ${doc.filename}`,
        vertical: 'content',
        timestamp: new Date(doc.createdAt).toISOString(),
        status: 'completed',
        dataSource: 'live'
      });
    }

    const strategies = getStrategies();
    for (const strategy of strategies) {
      realActivities.push({
        id: `strategy_${strategy.id}`,
        type: 'strategy_created',
        title: `Strategy Created: ${strategy.name}`,
        vertical: strategy.verticals[0] || 'general',
        timestamp: new Date(strategy.createdAt).toISOString(),
        status: strategy.status === 'completed' ? 'completed' : strategy.status === 'executing' ? 'in_progress' : 'pending',
        dataSource: 'live'
      });
    }

    realActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      success: true,
      metadata: {
        dataSource: realActivities.length > 0 ? 'live' : 'awaiting_data',
        liveEventsCount: realActivities.length,
        generatedAt: now.toISOString()
      },
      activities: realActivities
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/alerts', async (_req: Request, res: Response) => {
  try {
    const now = new Date();

    res.json({
      success: true,
      metadata: {
        dataSource: 'awaiting_data',
        generatedAt: now.toISOString()
      },
      alerts: [],
      recommendations: []
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
