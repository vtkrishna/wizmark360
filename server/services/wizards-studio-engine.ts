/**
 * Wizards Studio Engine Service
 * Coordinates the 10 specialized studios for the 14-day startup journey
 * 
 * Part of Layer 3: Studio Engine - Framework for all 10 studios with workflow orchestration
 */

import { db } from '../db';
import {
  wizardsStudios,
  wizardsStudioSessions,
  wizardsStudioTasks,
  wizardsStudioDeliverables,
  wizardsStartups,
  type WizardsStudio,
  type InsertWizardsStudio,
  type WizardsStudioSession,
  type InsertWizardsStudioSession,
  type WizardsStudioTask,
  type InsertWizardsStudioTask,
  type WizardsStudioDeliverable,
  type InsertWizardsStudioDeliverable,
} from '@shared/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import type {
  StudioDefinition,
  StudioStatus,
  StudioCategory,
  TaskStatus,
  Priority,
} from '@shared/wizards-incubator-types';
import { wizardsOrchestrationService } from './wizards-orchestration-service';
import { createClockProvider, type ClockProvider } from './clock-provider';
import { studioSessionManager } from './wizards-studio-session-manager';
import { FEATURE_FLAGS } from '../config/feature-flags';

export class WizardsStudioEngineService {
  /**
   * Get all studio definitions
   */
  async getStudios(): Promise<WizardsStudio[]> {
    return db
      .select()
      .from(wizardsStudios)
      .where(eq(wizardsStudios.isActive, true))
      .orderBy(wizardsStudios.sequence);
  }

  /**
   * Get studio by ID
   */
  async getStudio(studioId: string): Promise<WizardsStudio | null> {
    const [studio] = await db
      .select()
      .from(wizardsStudios)
      .where(and(
        eq(wizardsStudios.studioId, studioId),
        eq(wizardsStudios.isActive, true)
      ))
      .limit(1);

    return studio || null;
  }

  /**
   * Get studios by category
   */
  async getStudiosByCategory(category: StudioCategory): Promise<WizardsStudio[]> {
    return db
      .select()
      .from(wizardsStudios)
      .where(and(
        eq(wizardsStudios.category, category),
        eq(wizardsStudios.isActive, true)
      ))
      .orderBy(wizardsStudios.sequence);
  }

  /**
   * Search studios by name or description
   */
  async searchStudios(searchTerm: string): Promise<WizardsStudio[]> {
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) {
      return [];
    }

    const likePattern = `%${trimmedTerm}%`;
    return db
      .select()
      .from(wizardsStudios)
      .where(and(
        eq(wizardsStudios.isActive, true),
        sql`(${wizardsStudios.name} ILIKE ${likePattern} OR ${wizardsStudios.displayName} ILIKE ${likePattern} OR ${wizardsStudios.description} ILIKE ${likePattern})`
      ))
      .orderBy(wizardsStudios.sequence);
  }

  /**
   * Start a new studio session for a startup
   * 
   * PHASE 2.2 UPDATE: Added userId parameter and feature flag for unified session management
   * When UNIFIED_SESSION_MANAGEMENT flag is ON, uses session manager with dependency enforcement
   * When flag is OFF, uses legacy direct DB insert for rollback safety
   */
  async startStudioSession(
    startupId: number,
    studioId: string,
    userId?: number,
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsStudioSession> {
    const studio = await this.getStudio(studioId);
    if (!studio) {
      throw new Error(`Studio not found: ${studioId}`);
    }

    // Create clock provider for both paths (consistent timestamps)
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `startup-${startupId}-studio-${studioId}`
    );

    // FEATURE FLAG: Unified session management with dependency enforcement
    if (FEATURE_FLAGS.UNIFIED_SESSION_MANAGEMENT && userId) {
      // NEW SYSTEM: Use session manager for dependency enforcement and artifact propagation
      const context = await studioSessionManager.createSessionWithContext(
        startupId,
        studioId,
        userId,
        {
          propagateContext: true,
          deterministicMode: options?.deterministicMode,
          clockSeed: options?.clockSeed,
        }
      );

      // Retrieve created session
      const [session] = await db
        .select()
        .from(wizardsStudioSessions)
        .where(eq(wizardsStudioSessions.id, context.sessionId!))
        .limit(1);

      // Update session with ALL legacy fields that existing code expects
      const [updatedSession] = await db
        .update(wizardsStudioSessions)
        .set({
          status: 'in_progress',
          startedAt: clock.now(),
          currentStep: 1,
          totalSteps: 5,
          progress: 0,
          agentsUsed: [],
          creditsConsumed: 0,
          metadata: {
            startedBy: userId ? 'user' : 'system',
            estimatedDays: studio.estimatedDays,
            ...(session.metadata as object || {}),
          },
        })
        .where(eq(wizardsStudioSessions.id, context.sessionId!))
        .returning();

      return updatedSession;
    }

    // OLD SYSTEM: Direct DB insert (fallback when flag OFF or no userId)
    const [session] = await db
      .insert(wizardsStudioSessions)
      .values({
        startupId,
        studioId,
        status: 'in_progress',
        startedAt: clock.now(),
        currentStep: 1,
        totalSteps: 5,
        progress: 0,
        agentsUsed: [],
        creditsConsumed: 0,
        metadata: {
          startedBy: 'system',
          estimatedDays: studio.estimatedDays,
        },
      })
      .returning();

    return session;
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: number): Promise<WizardsStudioSession | null> {
    const [session] = await db
      .select()
      .from(wizardsStudioSessions)
      .where(eq(wizardsStudioSessions.id, sessionId))
      .limit(1);

    return session || null;
  }

  /**
   * Get all sessions for a startup
   */
  async getStartupSessions(startupId: number): Promise<WizardsStudioSession[]> {
    return db
      .select()
      .from(wizardsStudioSessions)
      .where(eq(wizardsStudioSessions.startupId, startupId))
      .orderBy(desc(wizardsStudioSessions.createdAt));
  }

  /**
   * Get active sessions for a startup
   */
  async getActiveStartupSessions(startupId: number): Promise<WizardsStudioSession[]> {
    return db
      .select()
      .from(wizardsStudioSessions)
      .where(and(
        eq(wizardsStudioSessions.startupId, startupId),
        eq(wizardsStudioSessions.status, 'in_progress')
      ))
      .orderBy(desc(wizardsStudioSessions.startedAt));
  }

  /**
   * Get or create a studio session (auto-creation for workflows)
   * If an active session exists for this startup+studio, reuse it
   * Otherwise, create a new session automatically
   * 
   * PHASE 2.2 UPDATE (FIXED): Delegates to startStudioSession for consistent session creation
   * This ensures both paths (direct creation and auto-creation) produce identical sessions
   * with all legacy fields populated when feature flag is ON
   */
  async getOrCreateSession(
    startupId: number,
    studioId: string,
    userId?: number,
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsStudioSession> {
    // Check for existing active/in_progress session
    const existingSessions = await db
      .select()
      .from(wizardsStudioSessions)
      .where(and(
        eq(wizardsStudioSessions.startupId, startupId),
        eq(wizardsStudioSessions.studioId, studioId),
        sql`${wizardsStudioSessions.status} IN ('active', 'in_progress')`
      ))
      .orderBy(desc(wizardsStudioSessions.createdAt))
      .limit(1);

    if (existingSessions.length > 0) {
      return existingSessions[0];
    }

    // No active session found - delegate to startStudioSession for consistent creation
    // startStudioSession handles both feature-flagged (session manager) and legacy (direct insert) paths
    // This ensures identical session state regardless of entry point
    return this.startStudioSession(startupId, studioId, userId, options);
  }

  /**
   * Update session progress
   */
  async updateSessionProgress(
    sessionId: number,
    progress: Partial<{
      currentStep: number;
      progress: number;
      agentsUsed: string[];
      creditsConsumed: number;
      qualityScore: number;
      metadata: any;
    }>,
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsStudioSession> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `session-${sessionId}-progress`
    );

    const updateData: any = {
      updatedAt: clock.now(),
    };

    if (progress.currentStep !== undefined) updateData.currentStep = progress.currentStep;
    if (progress.progress !== undefined) updateData.progress = progress.progress;
    if (progress.agentsUsed !== undefined) updateData.agentsUsed = progress.agentsUsed;
    if (progress.creditsConsumed !== undefined) updateData.creditsConsumed = progress.creditsConsumed;
    if (progress.qualityScore !== undefined) updateData.qualityScore = progress.qualityScore;
    if (progress.metadata !== undefined) updateData.metadata = progress.metadata;

    const [session] = await db
      .update(wizardsStudioSessions)
      .set(updateData)
      .where(eq(wizardsStudioSessions.id, sessionId))
      .returning();

    return session;
  }

  /**
   * Complete a studio session
   */
  async completeSession(
    sessionId: number,
    result: {
      status?: StudioStatus;
      qualityScore?: number;
      feedback?: any;
    },
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsStudioSession> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `session-${sessionId}-complete`
    );

    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const completedAt = clock.now();
    const duration = session.startedAt
      ? Math.floor((completedAt.getTime() - session.startedAt.getTime()) / 1000)
      : 0;

    const [updatedSession] = await db
      .update(wizardsStudioSessions)
      .set({
        status: result.status || 'completed',
        completedAt,
        progress: 100,
        qualityScore: result.qualityScore,
        feedback: result.feedback,
        updatedAt: completedAt,
        metadata: {
          ...(session.metadata as object || {}),
          duration,
          completedBy: 'system',
        },
      })
      .where(eq(wizardsStudioSessions.id, sessionId))
      .returning();

    return updatedSession;
  }

  /**
   * Create a task for a session
   */
  async createTask(
    sessionId: number,
    task: {
      taskType: string;
      taskName: string;
      taskDescription?: string;
      assignedAgents: string[];
      priority?: Priority;
      inputs?: any;
    },
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsStudioTask> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `session-${sessionId}-task-${task.taskName}`
    );

    // Get current task count for sequence
    const existingTasks = await db
      .select()
      .from(wizardsStudioTasks)
      .where(eq(wizardsStudioTasks.sessionId, sessionId));
    
    const sequence = existingTasks.length + 1;

    const [newTask] = await db
      .insert(wizardsStudioTasks)
      .values({
        sessionId,
        sequence,
        taskType: task.taskType,
        description: task.taskDescription || task.taskName,
        status: 'pending',
        inputs: task.inputs || {},
        outputs: {},
        createdAt: clock.now(),
      })
      .returning();

    return newTask;
  }

  /**
   * Get tasks for a session
   */
  async getSessionTasks(sessionId: number): Promise<WizardsStudioTask[]> {
    return db
      .select()
      .from(wizardsStudioTasks)
      .where(eq(wizardsStudioTasks.sessionId, sessionId))
      .orderBy(wizardsStudioTasks.createdAt);
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    taskId: number,
    update: {
      status: TaskStatus;
      outputs?: any;
      orchestrationId?: string;
      creditsUsed?: number;
      errorMessage?: string;
      metadata?: any;
    },
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsStudioTask> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `task-${taskId}-update`
    );

    const task = await db
      .select()
      .from(wizardsStudioTasks)
      .where(eq(wizardsStudioTasks.id, taskId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const updateData: any = {
      status: update.status,
      updatedAt: clock.now(),
    };

    if (update.status === 'in_progress' && !task.startedAt) {
      updateData.startedAt = clock.now();
    }

    if (update.status === 'completed' && !task.completedAt) {
      updateData.completedAt = clock.now();
      if (task.startedAt) {
        updateData.duration = Math.floor(
          (updateData.completedAt.getTime() - task.startedAt.getTime()) / 1000
        );
      }
    }

    if (update.outputs !== undefined) updateData.outputs = update.outputs;
    if (update.orchestrationId !== undefined) updateData.orchestrationId = update.orchestrationId;
    if (update.creditsUsed !== undefined) updateData.creditsUsed = update.creditsUsed;
    if (update.errorMessage !== undefined) updateData.errorMessage = update.errorMessage;
    if (update.metadata !== undefined) updateData.metadata = update.metadata;

    const [updatedTask] = await db
      .update(wizardsStudioTasks)
      .set(updateData)
      .where(eq(wizardsStudioTasks.id, taskId))
      .returning();

    return updatedTask;
  }

  /**
   * Create a deliverable for a session
   */
  async createDeliverable(
    sessionId: number,
    deliverable: {
      deliverableType: string;
      deliverableName: string;
      content?: string;
      contentType?: string;
      fileUrl?: string;
      artifactId?: number;
      version?: string;
      qualityScore?: number;
      metadata?: any;
    },
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsStudioDeliverable> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `session-${sessionId}-deliverable-${deliverable.deliverableName}`
    );

    const [newDeliverable] = await db
      .insert(wizardsStudioDeliverables)
      .values({
        sessionId,
        deliverableType: deliverable.deliverableType,
        deliverableName: deliverable.deliverableName,
        content: deliverable.content,
        contentType: deliverable.contentType,
        fileUrl: deliverable.fileUrl,
        artifactId: deliverable.artifactId,
        version: deliverable.version || '1.0',
        qualityScore: deliverable.qualityScore,
        isApproved: false,
        metadata: deliverable.metadata || {},
        createdAt: clock.now(),
      })
      .returning();

    return newDeliverable;
  }

  /**
   * Get deliverables for a session
   */
  async getSessionDeliverables(sessionId: number): Promise<WizardsStudioDeliverable[]> {
    return db
      .select()
      .from(wizardsStudioDeliverables)
      .where(eq(wizardsStudioDeliverables.sessionId, sessionId))
      .orderBy(wizardsStudioDeliverables.createdAt);
  }

  /**
   * Approve a deliverable
   */
  async approveDeliverable(
    deliverableId: number,
    qualityScore?: number,
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsStudioDeliverable> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `deliverable-${deliverableId}-approve`
    );

    const [deliverable] = await db
      .update(wizardsStudioDeliverables)
      .set({
        isApproved: true,
        qualityScore,
        updatedAt: clock.now(),
      })
      .where(eq(wizardsStudioDeliverables.id, deliverableId))
      .returning();

    return deliverable;
  }

  /**
   * Execute a studio workflow
   * Coordinates with WAI Orchestration Service to execute studio tasks
   */
  async executeStudioWorkflow(
    sessionId: number,
    workflow: {
      tasks: Array<{
        taskName: string;
        taskType: string;
        description: string;
        agents: string[];
        inputs: any;
        priority?: Priority;
      }>;
    },
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<{
    session: WizardsStudioSession;
    tasks: WizardsStudioTask[];
    results: any[];
  }> {
    const baseSeed = options?.clockSeed || `session-${sessionId}-workflow`;
    const clock = createClockProvider(options?.deterministicMode || false, baseSeed);

    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const createdTasks: WizardsStudioTask[] = [];
    const results: any[] = [];

    let currentSession = session;

    for (let i = 0; i < workflow.tasks.length; i++) {
      const taskDef = workflow.tasks[i];

      const task = await this.createTask(
        sessionId,
        {
          taskType: taskDef.taskType,
          taskName: taskDef.taskName,
          taskDescription: taskDef.description,
          assignedAgents: taskDef.agents,
          priority: taskDef.priority,
          inputs: taskDef.inputs,
        },
        {
          deterministicMode: options?.deterministicMode,
          clockSeed: `${baseSeed}-task-${i}`,
        }
      );

      createdTasks.push(task);

      await this.updateTaskStatus(
        task.id,
        { status: 'in_progress' },
        {
          deterministicMode: options?.deterministicMode,
          clockSeed: `${baseSeed}-task-${i}-start`,
        }
      );

      try {
        const orchestrationResult = await wizardsOrchestrationService.executeOrchestrationJob({
          startupId: currentSession.startupId,
          sessionId,
          taskId: task.id,
          jobType: 'generation',
          workflow: 'sequential',
          agents: taskDef.agents,
          inputs: taskDef.inputs,
          priority: taskDef.priority,
          deterministicMode: options?.deterministicMode,
        });

        await this.updateTaskStatus(
          task.id,
          {
            status: 'completed',
            outputs: orchestrationResult.outputs,
            orchestrationId: orchestrationResult.jobId,
            creditsUsed: orchestrationResult.creditsConsumed,
          },
          {
            deterministicMode: options?.deterministicMode,
            clockSeed: `${baseSeed}-task-${i}-complete`,
          }
        );

        results.push(orchestrationResult);

        currentSession = await this.updateSessionProgress(
          sessionId,
          {
            currentStep: i + 1,
            progress: Math.round(((i + 1) / workflow.tasks.length) * 100),
            agentsUsed: Array.from(
              new Set([
                ...(currentSession.agentsUsed as string[] || []),
                ...taskDef.agents,
              ])
            ),
            creditsConsumed: (currentSession.creditsConsumed || 0) + orchestrationResult.creditsConsumed,
          },
          {
            deterministicMode: options?.deterministicMode,
            clockSeed: `${baseSeed}-progress-${i}`,
          }
        );
      } catch (error) {
        await this.updateTaskStatus(
          task.id,
          {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
          {
            deterministicMode: options?.deterministicMode,
            clockSeed: `${baseSeed}-task-${i}-failed`,
          }
        );

        currentSession = await this.updateSessionProgress(
          sessionId,
          {
            currentStep: i + 1,
            progress: Math.round(((i + 1) / workflow.tasks.length) * 100),
            agentsUsed: Array.from(
              new Set([
                ...(currentSession.agentsUsed as string[] || []),
                ...taskDef.agents,
              ])
            ),
            creditsConsumed: currentSession.creditsConsumed || 0,
          },
          {
            deterministicMode: options?.deterministicMode,
            clockSeed: `${baseSeed}-progress-${i}-failed`,
          }
        );

        throw error;
      }
    }

    const updatedSession = await this.getSession(sessionId);
    
    return {
      session: updatedSession!,
      tasks: createdTasks,
      results,
    };
  }

  /**
   * Get studio session summary with tasks and deliverables
   */
  async getSessionSummary(sessionId: number): Promise<{
    session: WizardsStudioSession;
    studio: WizardsStudio | null;
    tasks: WizardsStudioTask[];
    deliverables: WizardsStudioDeliverable[];
    statistics: {
      totalTasks: number;
      completedTasks: number;
      failedTasks: number;
      totalDeliverables: number;
      approvedDeliverables: number;
      averageQualityScore: number;
      totalCreditsUsed: number;
      totalDuration: number;
    };
  }> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const [studio, tasks, deliverables] = await Promise.all([
      this.getStudio(session.studioId),
      this.getSessionTasks(sessionId),
      this.getSessionDeliverables(sessionId),
    ]);

    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const failedTasks = tasks.filter((t) => t.status === 'failed');
    const approvedDeliverables = deliverables.filter((d) => d.isApproved);
    
    const totalCreditsUsed = tasks.reduce((sum, t) => sum + (t.creditsUsed || 0), 0);
    const totalDuration = tasks.reduce((sum, t) => sum + (t.duration || 0), 0);
    
    const qualityScores = deliverables
      .map((d) => d.qualityScore)
      .filter((s): s is number => s !== null && s !== undefined);
    const averageQualityScore = qualityScores.length > 0
      ? Math.round(qualityScores.reduce((sum, s) => sum + s, 0) / qualityScores.length)
      : 0;

    return {
      session,
      studio,
      tasks,
      deliverables,
      statistics: {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        failedTasks: failedTasks.length,
        totalDeliverables: deliverables.length,
        approvedDeliverables: approvedDeliverables.length,
        averageQualityScore,
        totalCreditsUsed,
        totalDuration,
      },
    };
  }
}

export const wizardsStudioEngineService = new WizardsStudioEngineService();
