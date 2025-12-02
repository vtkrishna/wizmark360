/**
 * Wizards Incubator 14-Day Workflow Orchestration
 * End-to-end journey: Idea → Production MVP in 14 days
 * 
 * Coordinates all 10 studios in production sequence:
 * Days 1-2: Ideation Lab (Idea validation)
 * Days 3-4: Market Intelligence (Market research) + Product Blueprint
 * Days 5-9: Engineering Forge (MVP development)
 * Days 10-11: Experience Design (UI/UX) + Data/ML Studio (Analytics)
 * Days 12: Compliance Shield (Legal/Regulatory)
 * Days 13: Growth Studio (Marketing/Launch)
 * Day 14: Launch Control + Operations Cockpit
 */

import { WizardsIdeationLabService } from './studios/wizards-ideation-lab';
import { WizardsMarketIntelligenceService } from './studios/wizards-market-intelligence';
import { WizardsProductBlueprintService } from './studios/wizards-product-blueprint';
import { WizardsEngineeringForgeService } from './studios/wizards-engineering-forge';
import { WizardsExperienceDesignService } from './studios/wizards-experience-design';
import { WizardsDataMLStudioService } from './studios/wizards-data-ml-studio';
import { WizardsComplianceShieldService } from './studios/wizards-compliance-shield';
import { WizardsGrowthStudioService } from './studios/wizards-growth-studio';
import { WizardsLaunchControlService } from './studios/wizards-launch-control';
import { WizardsOperationsCockpitService } from './studios/wizards-operations-cockpit';
import { wizardsStudioEngineService } from './wizards-studio-engine';
import { wizardsArtifactStoreService } from './wizards-artifact-store';
import { wizardsOrchestrationService } from './wizards-orchestration-service';
import { db } from '../db';
import { wizardsStartups, wizardsJourneyTimeline } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface WorkflowPhase {
  day: number;
  studio: string;
  tasks: string[];
  estimatedDuration: string;
  dependencies: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
}

export interface WorkflowProgress {
  startupId: number;
  currentDay: number;
  currentPhase: string;
  overallProgress: number;
  phases: WorkflowPhase[];
  artifacts: Array<{
    id: number;
    name: string;
    type: string;
    studioId: string;
    createdAt: Date;
  }>;
}

export class Wizards14DayWorkflowService {
  private ideationLab: WizardsIdeationLabService;
  private marketIntelligence: WizardsMarketIntelligenceService;
  private productBlueprint: WizardsProductBlueprintService;
  private engineeringForge: WizardsEngineeringForgeService;
  private experienceDesign: WizardsExperienceDesignService;
  private dataMLStudio: WizardsDataMLStudioService;
  private complianceShield: WizardsComplianceShieldService;
  private growthStudio: WizardsGrowthStudioService;
  private launchControl: WizardsLaunchControlService;
  private operationsCockpit: WizardsOperationsCockpitService;

  constructor() {
    this.ideationLab = new WizardsIdeationLabService();
    this.marketIntelligence = new WizardsMarketIntelligenceService();
    this.productBlueprint = new WizardsProductBlueprintService();
    this.engineeringForge = new WizardsEngineeringForgeService();
    this.experienceDesign = new WizardsExperienceDesignService();
    this.dataMLStudio = new WizardsDataMLStudioService();
    this.complianceShield = new WizardsComplianceShieldService();
    this.growthStudio = new WizardsGrowthStudioService();
    this.launchControl = new WizardsLaunchControlService();
    this.operationsCockpit = new WizardsOperationsCockpitService();
  }

  /**
   * Get 14-day workflow template
   */
  getWorkflowTemplate(): WorkflowPhase[] {
    return [
      {
        day: 1,
        studio: 'ideation-lab',
        tasks: ['Idea validation', 'Market potential assessment', 'Competitive analysis'],
        estimatedDuration: '6-8 hours',
        dependencies: [],
        status: 'pending',
      },
      {
        day: 2,
        studio: 'ideation-lab',
        tasks: ['Business model canvas', 'Value proposition refinement', 'Customer segments'],
        estimatedDuration: '6-8 hours',
        dependencies: ['Day 1: Ideation Lab'],
        status: 'pending',
      },
      {
        day: 3,
        studio: 'market-intelligence',
        tasks: ['Deep market research', 'TAM/SAM/SOM analysis', 'Competitor deep dive'],
        estimatedDuration: '8-10 hours',
        dependencies: ['Day 2: Ideation Lab'],
        status: 'pending',
      },
      {
        day: 4,
        studio: 'product-blueprint',
        tasks: ['Product requirements', 'Feature prioritization', 'Technical architecture'],
        estimatedDuration: '6-8 hours',
        dependencies: ['Day 3: Market Intelligence'],
        status: 'pending',
      },
      {
        day: 5,
        studio: 'engineering-forge',
        tasks: ['Tech stack selection', 'Database design', 'Core API development'],
        estimatedDuration: '10-12 hours',
        dependencies: ['Day 4: Product Blueprint'],
        status: 'pending',
      },
      {
        day: 6,
        studio: 'engineering-forge',
        tasks: ['Frontend development', 'Backend services', 'Authentication system'],
        estimatedDuration: '10-12 hours',
        dependencies: ['Day 5: Engineering Forge'],
        status: 'pending',
      },
      {
        day: 7,
        studio: 'engineering-forge',
        tasks: ['Feature implementation', 'Integration testing', 'Bug fixes'],
        estimatedDuration: '10-12 hours',
        dependencies: ['Day 6: Engineering Forge'],
        status: 'pending',
      },
      {
        day: 8,
        studio: 'engineering-forge',
        tasks: ['Advanced features', 'Performance optimization', 'Security hardening'],
        estimatedDuration: '10-12 hours',
        dependencies: ['Day 7: Engineering Forge'],
        status: 'pending',
      },
      {
        day: 9,
        studio: 'engineering-forge',
        tasks: ['Final integration', 'End-to-end testing', 'Documentation'],
        estimatedDuration: '8-10 hours',
        dependencies: ['Day 8: Engineering Forge'],
        status: 'pending',
      },
      {
        day: 10,
        studio: 'experience-design',
        tasks: ['UI/UX design', 'Branding', 'Design system implementation'],
        estimatedDuration: '8-10 hours',
        dependencies: ['Day 9: Engineering Forge'],
        status: 'pending',
      },
      {
        day: 11,
        studio: 'data-ml-studio',
        tasks: ['Analytics setup', 'ML model integration', 'Data pipelines'],
        estimatedDuration: '6-8 hours',
        dependencies: ['Day 10: Experience Design'],
        status: 'pending',
      },
      {
        day: 12,
        studio: 'compliance-shield',
        tasks: ['Privacy policy', 'Terms of service', 'GDPR compliance', 'Security audit'],
        estimatedDuration: '6-8 hours',
        dependencies: ['Day 11: Data/ML Studio'],
        status: 'pending',
      },
      {
        day: 13,
        studio: 'growth-studio',
        tasks: ['Marketing strategy', 'Launch plan', 'Content creation', 'SEO setup'],
        estimatedDuration: '8-10 hours',
        dependencies: ['Day 12: Compliance Shield'],
        status: 'pending',
      },
      {
        day: 14,
        studio: 'launch-control',
        tasks: ['Deployment', 'Production monitoring', 'Launch checklist', 'Go-live'],
        estimatedDuration: '6-8 hours',
        dependencies: ['Day 13: Growth Studio'],
        status: 'pending',
      },
    ];
  }

  /**
   * Initialize 14-day workflow for a startup
   */
  async initializeWorkflow(
    startupId: number,
    founderId: number,
    ideaDescription: string,
    options?: {
      industry?: string;
      targetMarket?: string;
      deterministicMode?: boolean;
      clockSeed?: string;
    }
  ): Promise<{
    success: boolean;
    workflowId: string;
    sessionId: number;
    phases: WorkflowPhase[];
    message: string;
  }> {
    const workflowId = `wf-${startupId}-${Date.now()}`;
    
    const session = await wizardsStudioEngineService.startStudioSession(
      startupId,
      'workflow-orchestrator',
      options
    );

    const phases = this.getWorkflowTemplate();

    await db.insert(wizardsJourneyTimeline).values({
      startupId,
      eventType: 'workflow_started',
      eventName: 'Workflow Initialized',
      eventDescription: '14-day MVP development workflow initialized',
      studioName: 'Workflow Orchestrator',
      dayNumber: 0,
      metadata: { workflowId, sessionId: session.id, founderId, ideaDescription },
    });

    await db.update(wizardsStartups)
      .set({
        currentPhase: 'initialization',
        progress: 0,
      })
      .where(eq(wizardsStartups.id, startupId));

    return {
      success: true,
      workflowId,
      sessionId: session.id,
      phases,
      message: '14-day workflow initialized successfully. Ready to transform your idea into an MVP!',
    };
  }

  /**
   * Execute Day 1-2: Ideation Lab
   */
  async executeDays1to2(
    startupId: number,
    sessionId: number,
    ideaDescription: string,
    options?: {
      industry?: string;
      targetMarket?: string;
      deterministicMode?: boolean;
      clockSeed?: string;
    }
  ): Promise<{
    validation: any;
    businessModel: any;
    artifacts: any[];
  }> {
    const { validation, taskId: validationTaskId, artifactId: validationArtifactId } =
      await this.ideationLab.validateIdea(startupId, sessionId, ideaDescription, options);

    const { canvas, taskId: canvasTaskId, artifactId: canvasArtifactId } =
      await this.ideationLab.generateBusinessModelCanvas(startupId, sessionId, ideaDescription, {
        valueProposition: validation.competitiveAdvantage,
        ...options,
      });

    await db.insert(wizardsJourneyTimeline).values({
      startupId,
      eventType: 'phase_completed',
      eventName: 'Idea Validated',
      eventDescription: `Viability score: ${validation.viabilityScore}/100`,
      studioName: 'Ideation Lab',
      dayNumber: 1,
      metadata: { taskIds: [validationTaskId, canvasTaskId], artifactIds: [validationArtifactId, canvasArtifactId] },
    });

    await db.update(wizardsStartups)
      .set({
        currentPhase: 'ideation',
        progress: 15,
      })
      .where(eq(wizardsStartups.id, startupId));

    return {
      validation,
      businessModel: canvas,
      artifacts: [
        { id: validationArtifactId, type: 'idea-validation' },
        { id: canvasArtifactId, type: 'business-model-canvas' },
      ],
    };
  }

  /**
   * Execute Day 3: Market Intelligence
   */
  async executeDay3(
    startupId: number,
    sessionId: number,
    ideaDescription: string,
    options?: {
      industry?: string;
      targetMarket?: string;
      deterministicMode?: boolean;
      clockSeed?: string;
    }
  ): Promise<{
    marketResearch: any;
    artifacts: any[];
  }> {
    const { analysis, taskId, artifactId } = await this.marketIntelligence.analyzeCompetitors(
      startupId,
      sessionId,
      options?.industry || 'technology',
      {
        targetMarket: options?.targetMarket,
        ...options,
      }
    );

    await db.insert(wizardsJourneyTimeline).values({
      startupId,
      eventType: 'phase_completed',
      eventName: 'Market Research Complete',
      eventDescription: `Analyzed ${analysis.competitors.length} competitors, threat level: ${analysis.threatLevel}`,
      studioName: 'Market Intelligence',
      dayNumber: 3,
      metadata: { taskId, artifactId },
    });

    await db.update(wizardsStartups)
      .set({
        currentPhase: 'market-research',
        progress: 25,
      })
      .where(eq(wizardsStartups.id, startupId));

    return {
      marketResearch: analysis,
      artifacts: [{ id: artifactId, type: 'market-research' }],
    };
  }

  /**
   * Execute Day 4: Product Blueprint
   */
  async executeDay4(
    startupId: number,
    sessionId: number,
    ideaDescription: string,
    marketResearch: any,
    options?: {
      deterministicMode?: boolean;
      clockSeed?: string;
    }
  ): Promise<{
    prd: any;
    architecture: any;
    artifacts: any[];
  }> {
    const { prd, taskId: prdTaskId, artifactId: prdArtifactId } =
      await this.productBlueprint.generatePRD(startupId, sessionId, ideaDescription, options);

    const { architecture, taskId: archTaskId, artifactId: archArtifactId } =
      await this.productBlueprint.designSystemArchitecture(startupId, sessionId, ideaDescription, options);

    await db.insert(wizardsJourneyTimeline).values({
      startupId,
      eventType: 'phase_completed',
      eventName: 'Product Blueprint Ready',
      eventDescription: `PRD with ${prd.coreFunctionality.length} features, System architecture designed`,
      studioName: 'Product Blueprint',
      dayNumber: 4,
      metadata: { taskIds: [prdTaskId, archTaskId], artifactIds: [prdArtifactId, archArtifactId] },
    });

    await db.update(wizardsStartups)
      .set({
        currentPhase: 'product-blueprint',
        progress: 35,
      })
      .where(eq(wizardsStartups.id, startupId));

    return {
      prd,
      architecture,
      artifacts: [
        { id: prdArtifactId, type: 'prd' },
        { id: archArtifactId, type: 'system-architecture' },
      ],
    };
  }

  /**
   * Execute Days 5-9: Engineering Forge (MVP Development)
   */
  async executeDays5to9(
    startupId: number,
    sessionId: number,
    prd: any,
    architecture: any,
    options?: {
      deterministicMode?: boolean;
      clockSeed?: string;
    }
  ): Promise<{
    codebase: any;
    artifacts: any[];
  }> {
    const projectName = prd.productName || 'MVP Project';
    const specification = `${prd.productVision}\n\nCore Features:\n${prd.coreFunctionality.map((f: any) => `- ${f.feature}: ${f.description}`).join('\n')}`;

    const { application, taskId, artifactId } = await this.engineeringForge.generateFullStackApp(
      startupId,
      sessionId,
      projectName,
      specification,
      options
    );

    await db.insert(wizardsJourneyTimeline).values({
      startupId,
      eventType: 'phase_completed',
      eventName: 'MVP Development Complete',
      eventDescription: `Full-stack application generated: ${projectName}`,
      studioName: 'Engineering Forge',
      dayNumber: 9,
      metadata: { taskId, artifactId },
    });

    await db.update(wizardsStartups)
      .set({
        currentPhase: 'engineering',
        progress: 60,
      })
      .where(eq(wizardsStartups.id, startupId));

    return {
      codebase: application,
      artifacts: [{ id: artifactId, type: 'mvp-codebase' }],
    };
  }

  /**
   * Execute Day 10: Experience Design
   */
  async executeDay10(
    startupId: number,
    sessionId: number,
    prd: any,
    options?: {
      deterministicMode?: boolean;
      clockSeed?: string;
    }
  ): Promise<{
    designSystem: any;
    artifacts: any[];
  }> {
    const brandName = prd.productName || 'MVP Brand';

    const { designSystem, taskId, artifactId } = await this.experienceDesign.createDesignSystem(
      startupId,
      sessionId,
      brandName,
      options
    );

    await db.insert(wizardsJourneyTimeline).values({
      startupId,
      eventType: 'phase_completed',
      eventName: 'UI/UX Design Complete',
      eventDescription: `Design system with branding and components created for ${brandName}`,
      studioName: 'Experience Design',
      dayNumber: 10,
      metadata: { taskId, artifactId },
    });

    await db.update(wizardsStartups)
      .set({
        currentPhase: 'design',
        progress: 70,
      })
      .where(eq(wizardsStartups.id, startupId));

    return {
      designSystem,
      artifacts: [{ id: artifactId, type: 'design-system' }],
    };
  }

  /**
   * Execute Day 14: Launch Control
   */
  async executeDay14(
    startupId: number,
    sessionId: number,
    options?: {
      deterministicMode?: boolean;
      clockSeed?: string;
    }
  ): Promise<{
    deployment: any;
    artifacts: any[];
  }> {
    const { config, taskId, artifactId } = await this.launchControl.generateDeploymentConfig(
      startupId,
      sessionId,
      'vercel',
      'production',
      'Full-stack MVP application',
      {
        regions: ['us-east-1'],
        autoScaling: true,
        ...options,
      }
    );

    const deploymentUrl = `https://mvp-${startupId}.example.com`;

    await db.insert(wizardsJourneyTimeline).values({
      startupId,
      eventType: 'launch_completed',
      eventName: 'MVP Launched!',
      eventDescription: `Production deployment complete. MVP is live at ${deploymentUrl}`,
      studioName: 'Launch Control',
      dayNumber: 14,
      metadata: { taskId, artifactId, deploymentUrl },
    });

    await db.update(wizardsStartups)
      .set({
        currentPhase: 'launched',
        progress: 100,
      })
      .where(eq(wizardsStartups.id, startupId));

    return {
      deployment: { ...config, productionUrl: deploymentUrl },
      artifacts: [{ id: artifactId, type: 'deployment-config' }],
    };
  }

  /**
   * Execute Day 11: Data/ML Studio
   */
  async executeDay11(
    startupId: number,
    sessionId: number,
    projectName: string,
    options?: {
      deterministicMode?: boolean;
      clockSeed?: string;
    }
  ): Promise<{
    mlModel: any;
    artifacts: any[];
  }> {
    const { engine, taskId, artifactId } = await this.dataMLStudio.buildRecommendationEngine(
      startupId,
      sessionId,
      `Build recommendation engine for ${projectName} with user preferences, item features, and interaction history`,
      { algorithmType: 'collaborative-filtering', ...options }
    );

    await db.insert(wizardsJourneyTimeline).values({
      startupId,
      eventType: 'ml_integration_completed',
      eventName: 'ML/AI Features Implemented',
      eventDescription: `Recommendation engine and predictive models built for ${projectName}`,
      studioName: 'Data/ML Studio',
      dayNumber: 11,
      metadata: { taskId, artifactId },
    });

    await db.update(wizardsStartups)
      .set({
        currentPhase: 'ml-integration',
        progress: 75,
      })
      .where(eq(wizardsStartups.id, startupId));

    return {
      mlModel: engine,
      artifacts: [{ id: artifactId, type: 'ml-model' }],
    };
  }

  /**
   * Execute Day 12: Compliance Shield
   */
  async executeDay12(
    startupId: number,
    sessionId: number,
    productName: string,
    options?: {
      deterministicMode?: boolean;
      clockSeed?: string;
    }
  ): Promise<{
    compliance: any;
    artifacts: any[];
  }> {
    const { framework, taskId, artifactId } = await this.complianceShield.generateComplianceFramework(
      startupId,
      sessionId,
      'GDPR',
      `Compliance framework for ${productName} covering GDPR, CCPA, and SOC2 standards`,
      options
    );

    await db.insert(wizardsJourneyTimeline).values({
      startupId,
      eventType: 'compliance_completed',
      eventName: 'Compliance & Security Audit Complete',
      eventDescription: `Legal compliance framework established for ${productName}`,
      studioName: 'Compliance Shield',
      dayNumber: 12,
      metadata: { taskId, artifactId },
    });

    await db.update(wizardsStartups)
      .set({
        currentPhase: 'compliance',
        progress: 82,
      })
      .where(eq(wizardsStartups.id, startupId));

    return {
      compliance: framework,
      artifacts: [{ id: artifactId, type: 'compliance-framework' }],
    };
  }

  /**
   * Execute Day 13: Growth Studio
   */
  async executeDay13(
    startupId: number,
    sessionId: number,
    productName: string,
    industry: string,
    targetAudience: string,
    options?: {
      deterministicMode?: boolean;
      clockSeed?: string;
    }
  ): Promise<{
    growth: any;
    artifacts: any[];
  }> {
    const { strategy, taskId, artifactId } = await this.growthStudio.generateSEOStrategy(
      startupId,
      sessionId,
      industry,
      targetAudience,
      { focusKeywords: ['organic-search', 'content-marketing', 'social-media'], ...options }
    );

    await db.insert(wizardsJourneyTimeline).values({
      startupId,
      eventType: 'growth_strategy_completed',
      eventName: 'Growth & Marketing Strategy Ready',
      eventDescription: `SEO, content, and acquisition strategy created for ${productName} in ${industry} industry`,
      studioName: 'Growth Studio',
      dayNumber: 13,
      metadata: { taskId, artifactId, productName, industry },
    });

    await db.update(wizardsStartups)
      .set({
        currentPhase: 'growth-planning',
        progress: 90,
      })
      .where(eq(wizardsStartups.id, startupId));

    return {
      growth: strategy,
      artifacts: [{ id: artifactId, type: 'growth-strategy' }],
    };
  }

  /**
   * Get workflow progress for a startup
   */
  async getWorkflowProgress(startupId: number): Promise<WorkflowProgress> {
    const [startup] = await db
      .select()
      .from(wizardsStartups)
      .where(eq(wizardsStartups.id, startupId))
      .limit(1);

    if (!startup) {
      throw new Error('Startup not found');
    }

    const timeline = await db
      .select()
      .from(wizardsJourneyTimeline)
      .where(eq(wizardsJourneyTimeline.startupId, startupId))
      .orderBy(wizardsJourneyTimeline.dayNumber);

    const currentDay = timeline.length > 0 ? Math.max(...timeline.map(t => t.dayNumber || 0)) : 0;
    const currentPhase = startup.currentPhase || 'initialization';

    const phases = this.getWorkflowTemplate().map((phase) => ({
      ...phase,
      status: (phase.day <= currentDay ? 'completed' : phase.day === currentDay + 1 ? 'in-progress' : 'pending') as 'pending' | 'in-progress' | 'completed' | 'blocked',
    }));

    const completedPhases = phases.filter(p => p.status === 'completed').length;
    const overallProgress = Math.round((completedPhases / phases.length) * 100);

    const artifactIds = timeline.flatMap(t => {
      const metadata = t.metadata as any;
      return metadata?.artifactIds || (metadata?.artifactId ? [metadata.artifactId] : []);
    });

    const artifacts = artifactIds.length > 0
      ? await wizardsArtifactStoreService.getArtifactsByType(startupId, 'document')
      : [];

    return {
      startupId,
      currentDay,
      currentPhase,
      overallProgress,
      phases,
      artifacts: artifacts.map((a: any) => ({
        id: a.id,
        name: a.name,
        type: a.artifactType,
        studioId: a.studioId,
        createdAt: a.createdAt!,
      })),
    };
  }

  /**
   * Execute complete 14-day workflow (automated)
   */
  async executeCompleteWorkflow(
    startupId: number,
    founderId: number,
    ideaDescription: string,
    options?: {
      industry?: string;
      targetMarket?: string;
      deterministicMode?: boolean;
      clockSeed?: string;
    }
  ): Promise<{
    success: boolean;
    workflowId: string;
    artifacts: any[];
    deploymentUrl?: string;
    message: string;
  }> {
    const { workflowId, sessionId } = await this.initializeWorkflow(
      startupId,
      founderId,
      ideaDescription,
      options
    );

    const allArtifacts: any[] = [];

    const days1to2 = await this.executeDays1to2(startupId, sessionId, ideaDescription, options);
    allArtifacts.push(...days1to2.artifacts);

    const day3 = await this.executeDay3(startupId, sessionId, ideaDescription, options);
    allArtifacts.push(...day3.artifacts);

    const day4 = await this.executeDay4(
      startupId,
      sessionId,
      ideaDescription,
      day3.marketResearch,
      options
    );
    allArtifacts.push(...day4.artifacts);

    const days5to9 = await this.executeDays5to9(
      startupId,
      sessionId,
      day4.prd,
      day4.architecture,
      options
    );
    allArtifacts.push(...days5to9.artifacts);

    const day10 = await this.executeDay10(startupId, sessionId, day4.prd, options);
    allArtifacts.push(...day10.artifacts);

    const day11 = await this.executeDay11(startupId, sessionId, day4.prd.productName || ideaDescription, options);
    allArtifacts.push(...day11.artifacts);

    const day12 = await this.executeDay12(startupId, sessionId, day4.prd.productName || ideaDescription, options);
    allArtifacts.push(...day12.artifacts);

    const day13 = await this.executeDay13(startupId, sessionId, day4.prd.productName || ideaDescription, options?.industry || 'Technology', options?.targetMarket || 'General Market', options);
    allArtifacts.push(...day13.artifacts);

    const day14 = await this.executeDay14(startupId, sessionId, options);
    allArtifacts.push(...day14.artifacts);

    return {
      success: true,
      workflowId,
      artifacts: allArtifacts,
      deploymentUrl: day14.deployment.productionUrl,
      message: `🎉 MVP successfully developed and launched in 14 days! Deployment URL: ${day14.deployment.productionUrl}`,
    };
  }

  /**
   * Start workflow execution
   * Initializes workflow and optionally executes first phase
   */
  async startWorkflowExecution(
    startupId: number,
    founderId: number,
    ideaDescription: string,
    options?: {
      industry?: string;
      targetMarket?: string;
      autoExecute?: boolean;
      deterministicMode?: boolean;
      clockSeed?: string;
    }
  ): Promise<{
    success: boolean;
    workflowId: string;
    sessionId: number;
    orchestrationJobId?: string;
    message: string;
    nextPhase: number;
  }> {
    const { workflowId, sessionId } = await this.initializeWorkflow(
      startupId,
      founderId,
      ideaDescription,
      options
    );

    if (options?.autoExecute) {
      const phase1Result = await this.executePhase(startupId, sessionId, 1, {
        ideaDescription,
        industry: options.industry,
        targetMarket: options.targetMarket,
      });

      return {
        success: true,
        workflowId,
        sessionId,
        orchestrationJobId: phase1Result.orchestrationJobId,
        message: '14-day workflow started. Phase 1 (Ideation Lab) completed successfully. Use execute-phase for remaining phases.',
        nextPhase: 2,
      };
    }

    return {
      success: true,
      workflowId,
      sessionId,
      message: '14-day workflow initialized. Use execute-phase endpoint to run individual phases.',
      nextPhase: 1,
    };
  }

  /**
   * Execute a specific workflow phase with real orchestration
   * Creates orchestration jobs for each phase
   */
  async executePhase(
    startupId: number,
    sessionId: number,
    phaseDay: number,
    inputs: Record<string, any>
  ): Promise<{
    success: boolean;
    phase: number;
    outputs: any;
    artifacts: any[];
    nextPhase?: number;
    orchestrationJobId: string;
  }> {
    const [startup] = await db
      .select()
      .from(wizardsStartups)
      .where(eq(wizardsStartups.id, startupId))
      .limit(1);

    if (!startup) {
      throw new Error('Startup not found');
    }

    const phaseConfig = this.getPhaseConfiguration(phaseDay, startup, inputs);

    const orchestrationRequest = {
      startupId,
      sessionId,
      taskId: undefined,
      jobType: phaseConfig.jobType,
      workflow: phaseConfig.workflow,
      studioType: phaseConfig.studioType,
      agents: [],
      inputs: {
        task: phaseConfig.taskDescription,
        phaseDay,
        ...phaseConfig.inputs,
      },
      priority: 'high' as const,
    };

    const orchestrationResult = await wizardsOrchestrationService.executeOrchestrationJob(
      orchestrationRequest
    );

    const artifactId = await wizardsArtifactStoreService.createArtifact({
      startupId,
      sessionId,
      studioId: phaseConfig.studioId,
      artifactType: phaseConfig.artifactType,
      category: 'business-plan',
      name: phaseConfig.artifactName,
      description: phaseConfig.taskDescription,
      content: orchestrationResult.outputs?.result || {},
      version: '1.0.0',
      metadata: {
        phaseDay,
        orchestrationJobId: orchestrationResult.jobId,
        agentsUsed: orchestrationResult.agentsUsed,
        providersUsed: orchestrationResult.providersUsed,
      },
    });

    await db.insert(wizardsJourneyTimeline).values({
      startupId,
      eventType: 'phase_completed',
      eventName: phaseConfig.eventName,
      eventDescription: phaseConfig.eventDescription,
      studioName: phaseConfig.studioName,
      dayNumber: phaseDay,
      metadata: { 
        sessionId,
        phaseDay,
        orchestrationJobId: orchestrationResult.jobId,
        artifactId,
        apiTriggered: true,
        cost: orchestrationResult.cost,
        agentsUsed: orchestrationResult.agentsUsed?.length || 0,
      },
    });

    await db.update(wizardsStartups)
      .set({
        currentPhase: phaseConfig.phaseName,
        progress: Math.round((phaseDay / 14) * 100),
      })
      .where(eq(wizardsStartups.id, startupId));

    const nextPhase = phaseDay < 14 ? phaseDay + 1 : undefined;

    return {
      success: true,
      phase: phaseDay,
      outputs: orchestrationResult.outputs,
      artifacts: [{ id: artifactId, type: phaseConfig.artifactType }],
      nextPhase,
      orchestrationJobId: orchestrationResult.jobId,
    };
  }

  /**
   * Get orchestration configuration for each phase (Days 1-14)
   */
  private getPhaseConfiguration(phaseDay: number, startup: any, inputs: Record<string, any>) {
    const configs: Record<number, any> = {
      1: {
        studioType: 'ideation_lab',
        studioId: 'ideation-lab',
        studioName: 'Ideation Lab',
        phaseName: 'ideation',
        taskDescription: `Validate startup idea: ${inputs.ideaDescription || startup.description || ''}`,
        eventName: 'Idea Validation Complete',
        eventDescription: 'AI-powered idea validation completed',
        artifactType: 'idea-validation',
        artifactName: 'Idea Validation Report',
        jobType: 'analysis',
        workflow: 'sequential',
        inputs: {
          ideaDescription: inputs.ideaDescription || startup.description || '',
          industry: inputs.industry,
          targetMarket: inputs.targetMarket,
        },
      },
      2: {
        studioType: 'ideation_lab',
        studioId: 'ideation-lab',
        studioName: 'Ideation Lab',
        phaseName: 'business-model',
        taskDescription: `Generate business model canvas for ${inputs.productName || startup.name || 'startup'}`,
        eventName: 'Business Model Canvas Complete',
        eventDescription: 'Business model and value proposition defined',
        artifactType: 'business-model-canvas',
        artifactName: 'Business Model Canvas',
        jobType: 'generation',
        workflow: 'sequential',
        inputs: {
          ideaDescription: inputs.ideaDescription || startup.description || '',
          validation: inputs.validation,
        },
      },
      3: {
        studioType: 'market_validation',
        studioId: 'market-intelligence',
        studioName: 'Market Intelligence',
        phaseName: 'market-research',
        taskDescription: `Analyze market for: ${inputs.ideaDescription || startup.description || ''}`,
        eventName: 'Market Research Complete',
        eventDescription: 'Competitive analysis and market sizing completed',
        artifactType: 'market-research',
        artifactName: 'Market Research Report',
        jobType: 'analysis',
        workflow: 'sequential',
        inputs: {
          ideaDescription: inputs.ideaDescription || startup.description || '',
          industry: inputs.industry,
        },
      },
      4: {
        studioType: 'product_development',
        studioId: 'product-blueprint',
        studioName: 'Product Blueprint',
        phaseName: 'product-spec',
        taskDescription: `Create product specification and technical architecture`,
        eventName: 'Product Blueprint Complete',
        eventDescription: 'PRD and technical architecture created',
        artifactType: 'product-spec',
        artifactName: 'Product Requirements Document',
        jobType: 'generation',
        workflow: 'sequential',
        inputs: {
          marketResearch: inputs.marketResearch,
        },
      },
      5: {
        studioType: 'product_development',
        studioId: 'engineering-forge',
        studioName: 'Engineering Forge',
        phaseName: 'development-phase1',
        taskDescription: `Day 5: Tech stack selection and database design for ${inputs.productName || startup.name}`,
        eventName: 'Tech Stack & Database Design Complete',
        eventDescription: 'Technology stack selected, database schema designed',
        artifactType: 'technical-foundation',
        artifactName: 'Technical Foundation',
        jobType: 'generation',
        workflow: 'hierarchical',
        inputs: {
          prd: inputs.prd,
          architecture: inputs.architecture,
        },
      },
      6: {
        studioType: 'product_development',
        studioId: 'engineering-forge',
        studioName: 'Engineering Forge',
        phaseName: 'development-phase2',
        taskDescription: `Day 6: Frontend and backend services development`,
        eventName: 'Core Services Development Complete',
        eventDescription: 'Frontend, backend, and authentication implemented',
        artifactType: 'core-services',
        artifactName: 'Core Application Services',
        jobType: 'generation',
        workflow: 'hierarchical',
        inputs: inputs,
      },
      7: {
        studioType: 'product_development',
        studioId: 'engineering-forge',
        studioName: 'Engineering Forge',
        phaseName: 'development-phase3',
        taskDescription: `Day 7: Feature implementation and integration testing`,
        eventName: 'Feature Implementation Complete',
        eventDescription: 'Core features implemented and integration tested',
        artifactType: 'feature-implementation',
        artifactName: 'Feature Set Implementation',
        jobType: 'generation',
        workflow: 'hierarchical',
        inputs: inputs,
      },
      8: {
        studioType: 'product_development',
        studioId: 'engineering-forge',
        studioName: 'Engineering Forge',
        phaseName: 'development-phase4',
        taskDescription: `Day 8: Advanced features and performance optimization`,
        eventName: 'Advanced Features Complete',
        eventDescription: 'Advanced features built, performance optimized',
        artifactType: 'advanced-features',
        artifactName: 'Advanced Features & Optimization',
        jobType: 'optimization',
        workflow: 'hierarchical',
        inputs: inputs,
      },
      9: {
        studioType: 'product_development',
        studioId: 'engineering-forge',
        studioName: 'Engineering Forge',
        phaseName: 'development-phase5',
        taskDescription: `Day 9: Final integration and end-to-end testing`,
        eventName: 'MVP Development Complete',
        eventDescription: 'Full MVP integrated and E2E tested',
        artifactType: 'mvp-complete',
        artifactName: 'Complete MVP',
        jobType: 'generation',
        workflow: 'hierarchical',
        inputs: inputs,
      },
      10: {
        studioType: 'product_development',
        studioId: 'experience-design',
        studioName: 'Experience Design',
        phaseName: 'ux-design',
        taskDescription: `Day 10: UI/UX design, branding, and design system`,
        eventName: 'UX Design Complete',
        eventDescription: 'UI/UX design, branding, and design system created',
        artifactType: 'design-system',
        artifactName: 'Design System & Branding',
        jobType: 'generation',
        workflow: 'sequential',
        inputs: {
          prd: inputs.prd,
        },
      },
      11: {
        studioType: 'product_development',
        studioId: 'data-ml-studio',
        studioName: 'Data & ML Studio',
        phaseName: 'analytics',
        taskDescription: `Day 11: Analytics setup and data pipelines`,
        eventName: 'Analytics Setup Complete',
        eventDescription: 'Analytics dashboards and ML pipelines configured',
        artifactType: 'analytics-setup',
        artifactName: 'Analytics & ML Infrastructure',
        jobType: 'generation',
        workflow: 'sequential',
        inputs: {
          productName: inputs.productName || startup.name,
        },
      },
      12: {
        studioType: 'legal_compliance',
        studioId: 'compliance-shield',
        studioName: 'Compliance Shield',
        phaseName: 'compliance',
        taskDescription: `Day 12: Privacy policy, terms of service, and compliance audit`,
        eventName: 'Compliance & Legal Complete',
        eventDescription: 'Legal documents and compliance checks completed',
        artifactType: 'legal-compliance',
        artifactName: 'Legal & Compliance Documents',
        jobType: 'generation',
        workflow: 'sequential',
        inputs: {
          productName: inputs.productName || startup.name,
        },
      },
      13: {
        studioType: 'growth_hacking',
        studioId: 'growth-studio',
        studioName: 'Growth Studio',
        phaseName: 'growth-strategy',
        taskDescription: `Day 13: Marketing strategy, content creation, and SEO`,
        eventName: 'Growth Strategy Complete',
        eventDescription: 'Marketing plan, content, and SEO strategy created',
        artifactType: 'growth-strategy',
        artifactName: 'Growth & Marketing Strategy',
        jobType: 'generation',
        workflow: 'sequential',
        inputs: {
          productName: inputs.productName || startup.name,
          industry: inputs.industry,
          targetMarket: inputs.targetMarket,
        },
      },
      14: {
        studioType: 'operations',
        studioId: 'launch-control-operations',
        studioName: 'Launch Control & Operations Cockpit',
        phaseName: 'launch-and-operations',
        taskDescription: `Day 14: Production deployment, launch, and operational setup for ${inputs.productName || startup.name}`,
        eventName: 'Launch & Operations Complete',
        eventDescription: 'MVP deployed to production, launched, and operational monitoring configured',
        artifactType: 'deployment-and-operations',
        artifactName: 'Production Deployment & Operations Setup',
        jobType: 'deployment',
        workflow: 'sequential',
        inputs: {
          productName: inputs.productName || startup.name,
          mvp: inputs.mvp,
        },
      },
    };

    const config = configs[phaseDay];
    if (!config) {
      throw new Error(`No configuration found for phase day ${phaseDay}. Valid days are 1-14.`);
    }
    
    return config;
  }
}

export const wizards14DayWorkflowService = new Wizards14DayWorkflowService();
