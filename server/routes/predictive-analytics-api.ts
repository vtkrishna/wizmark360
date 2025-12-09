import express, { type Request, type Response } from "express";
import { predictiveAnalyticsEngine } from "../services/predictive-analytics-engine";

const router = express.Router();

/**
 * GET /api/analytics/models
 * Get all predictive models
 */
router.get('/models', async (req: Request, res: Response) => {
  try {
    const models = predictiveAnalyticsEngine.getModels();
    
    res.json({
      success: true,
      data: models
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get models'
    });
  }
});

/**
 * POST /api/analytics/predictions/user-behavior
 * Generate user behavior predictions
 */
router.post('/predictions/user-behavior', async (req: Request, res: Response) => {
  try {
    const { userId, features } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const prediction = await predictiveAnalyticsEngine.predictUserBehavior(userId, features || {});

    res.json({
      success: true,
      data: prediction
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'User behavior prediction failed'
    });
  }
});

/**
 * POST /api/analytics/trends/analyze
 * Analyze business trends
 */
router.post('/trends/analyze', async (req: Request, res: Response) => {
  try {
    const { metrics } = req.body;

    if (!metrics || !Array.isArray(metrics)) {
      return res.status(400).json({
        success: false,
        error: 'Metrics array is required'
      });
    }

    const analyses = await predictiveAnalyticsEngine.analyzeBusinessTrends(metrics);

    res.json({
      success: true,
      data: analyses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Trend analysis failed'
    });
  }
});

/**
 * POST /api/analytics/forecasts/performance
 * Generate performance forecasts
 */
router.post('/forecasts/performance', async (req: Request, res: Response) => {
  try {
    const { components } = req.body;

    if (!components || !Array.isArray(components)) {
      return res.status(400).json({
        success: false,
        error: 'Components array is required'
      });
    }

    const forecasts = await predictiveAnalyticsEngine.generatePerformanceForecasts(components);

    res.json({
      success: true,
      data: forecasts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Performance forecasting failed'
    });
  }
});

/**
 * POST /api/analytics/alerts/generate
 * Generate predictive alerts
 */
router.post('/alerts/generate', async (req: Request, res: Response) => {
  try {
    const { metrics } = req.body;

    if (!metrics || !Array.isArray(metrics)) {
      return res.status(400).json({
        success: false,
        error: 'Metrics array is required'
      });
    }

    const alerts = await predictiveAnalyticsEngine.generatePredictiveAlerts(metrics);

    res.json({
      success: true,
      data: alerts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Alert generation failed'
    });
  }
});

/**
 * GET /api/analytics/predictions
 * Get all predictions or by type
 */
router.get('/predictions', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const predictions = predictiveAnalyticsEngine.getPredictions(type as string);

    res.json({
      success: true,
      data: predictions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get predictions'
    });
  }
});

/**
 * GET /api/analytics/trends
 * Get all trend analyses
 */
router.get('/trends', async (req: Request, res: Response) => {
  try {
    const analyses = predictiveAnalyticsEngine.getTrendAnalyses();

    res.json({
      success: true,
      data: analyses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get trend analyses'
    });
  }
});

/**
 * GET /api/analytics/alerts
 * Get alerts by severity
 */
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const { severity } = req.query;
    const alerts = predictiveAnalyticsEngine.getAlerts(severity as string);

    res.json({
      success: true,
      data: alerts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get alerts'
    });
  }
});

/**
 * GET /api/analytics/stats
 * Get engine statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = predictiveAnalyticsEngine.getEngineStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get stats'
    });
  }
});

/**
 * GET /api/analytics/health
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const stats = predictiveAnalyticsEngine.getEngineStats();
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        uptime: stats.uptime,
        models: stats.models,
        predictions: stats.predictions,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed'
    });
  }
});

/**
 * POST /api/analytics/auto-remediation
 * Auto-remediation for detected issues
 */
router.post('/auto-remediation', async (req: Request, res: Response) => {
  try {
    const { alerts, dryRun = true } = req.body;

    if (!alerts || !Array.isArray(alerts)) {
      return res.status(400).json({
        success: false,
        error: 'Alerts array is required'
      });
    }

    const remediationActions = alerts.map((alert: any) => {
      const actions: any[] = [];
      
      switch (alert.type) {
        case 'performance':
          actions.push({
            type: 'scale_resources',
            target: alert.component || 'auto',
            action: alert.severity === 'critical' ? 'immediate_scale_up' : 'scheduled_scale',
            parameters: {
              factor: alert.severity === 'critical' ? 2.0 : 1.5,
              duration: '1h'
            }
          });
          break;
          
        case 'capacity':
          actions.push({
            type: 'provision_resources',
            target: alert.resource || 'auto',
            action: 'add_capacity',
            parameters: {
              amount: alert.deficit || '20%',
              priority: alert.severity
            }
          });
          break;
          
        case 'error_rate':
          actions.push({
            type: 'traffic_management',
            target: alert.service || 'auto',
            action: 'enable_circuit_breaker',
            parameters: {
              threshold: 0.5,
              timeout: '30s',
              fallback: 'cached_response'
            }
          });
          break;
          
        case 'latency':
          actions.push({
            type: 'optimization',
            target: alert.endpoint || 'auto',
            action: 'enable_caching',
            parameters: {
              ttl: '5m',
              strategy: 'lazy_loading'
            }
          });
          break;
          
        case 'security':
          actions.push({
            type: 'security_response',
            target: alert.source || 'auto',
            action: 'enable_rate_limiting',
            parameters: {
              limit: 100,
              window: '1m',
              block_duration: '15m'
            }
          });
          break;
          
        default:
          actions.push({
            type: 'notification',
            target: 'ops_team',
            action: 'escalate',
            parameters: {
              channel: 'slack',
              priority: alert.severity
            }
          });
      }
      
      return {
        alertId: alert.id,
        alertType: alert.type,
        severity: alert.severity,
        actions,
        status: dryRun ? 'simulated' : 'executed',
        timestamp: new Date().toISOString()
      };
    });

    const summary = {
      totalAlerts: alerts.length,
      remediationsPlanned: remediationActions.length,
      actionsByType: remediationActions.reduce((acc: Record<string, number>, r: any) => {
        r.actions.forEach((a: any) => {
          acc[a.type] = (acc[a.type] || 0) + 1;
        });
        return acc;
      }, {}),
      dryRun,
      executedAt: dryRun ? null : new Date().toISOString()
    };

    res.json({
      success: true,
      data: {
        remediations: remediationActions,
        summary
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Auto-remediation failed'
    });
  }
});

/**
 * GET /api/analytics/capabilities
 * Get analytics capabilities
 */
router.get('/capabilities', async (req: Request, res: Response) => {
  try {
    const capabilities = {
      predictiveModels: {
        userBehavior: {
          churnPrediction: true,
          lifetimeValuePrediction: true,
          engagementScoring: true,
          preferenceAnalysis: true
        },
        businessIntelligence: {
          trendAnalysis: true,
          forecastGeneration: true,
          anomalyDetection: true,
          seasonalityDetection: true
        },
        performanceForecasting: {
          capacityPlanning: true,
          costProjection: true,
          reliabilityPrediction: true,
          optimizationRecommendations: true
        }
      },
      realTimeFeatures: {
        monitoring: true,
        alerting: true,
        autoRemediation: true
      },
      dataProcessing: {
        batchAnalysis: true,
        streamProcessing: true,
        multiModalSupport: true,
        mlPipelines: true
      },
      integrations: {
        waiOrchestration: true,
        businessIntelligence: true,
        performanceMonitoring: true,
        alertingSystems: true
      }
    };

    res.json({
      success: true,
      data: capabilities
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get capabilities'
    });
  }
});

/**
 * GET /api/analytics/docs
 * API documentation
 */
router.get('/docs', async (req: Request, res: Response) => {
  try {
    const documentation = {
      title: 'Predictive Analytics & AI Insights API Documentation',
      version: '1.0.0',
      baseUrl: '/api/analytics',
      description: 'Enterprise-grade predictive analytics with machine learning insights',
      endpoints: [
        {
          method: 'GET',
          path: '/models',
          description: 'Get all predictive models and their configurations',
          parameters: 'None'
        },
        {
          method: 'POST',
          path: '/predictions/user-behavior',
          description: 'Generate user behavior predictions including churn and lifetime value',
          parameters: {
            userId: 'string (required) - User identifier',
            features: 'object - User behavior features and metrics'
          }
        },
        {
          method: 'POST',
          path: '/trends/analyze',
          description: 'Analyze business trends and generate insights',
          parameters: {
            metrics: 'array (required) - Business metrics for analysis'
          }
        },
        {
          method: 'POST',
          path: '/forecasts/performance',
          description: 'Generate performance forecasts for system components',
          parameters: {
            components: 'array (required) - System components to forecast'
          }
        },
        {
          method: 'GET',
          path: '/predictions',
          description: 'Get all predictions or filter by type',
          parameters: {
            type: 'string - Filter predictions by type'
          }
        },
        {
          method: 'GET',
          path: '/alerts',
          description: 'Get predictive alerts by severity',
          parameters: {
            severity: 'string - Filter by severity level'
          }
        }
      ],
      examples: {
        userBehaviorPrediction: {
          userId: 'user-123',
          features: {
            daysSinceLastLogin: 3,
            featureUsageDecline: 20,
            engagementScore: 0.75,
            sessionDuration: 1800,
            supportTickets: 1
          }
        },
        trendAnalysis: {
          metrics: [
            {
              id: 'revenue-001',
              name: 'Monthly Revenue',
              type: 'revenue',
              value: 50000,
              unit: 'USD',
              timestamp: '2025-08-17T00:00:00Z',
              trend: 'increasing',
              confidence: 0.89
            }
          ]
        },
        performanceForecast: {
          components: ['api-server', 'database', 'cache-layer']
        }
      }
    };

    res.json({
      success: true,
      data: documentation
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get documentation'
    });
  }
});

export default router;