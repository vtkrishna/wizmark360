/**
 * Wizards Studio Session Manager Service
 * Centralized service for propagating AG-UI sessions, artifacts, and deliverables across studios
 * 
 * Features:
 * - Automatic AG-UI session propagation
 * - Artifact handoff between studios
 * - Context preservation
 * - Dependency tracking
 * - Studio workflow orchestration
 */

import { db } from '../db';
import {
  wizardsStudioSessions,
  wizardsArtifacts,
  wizardsStartups,
  type WizardsStudioSession,
  type WizardsArtifact,
} from '@shared/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { WizardsArtifactStoreService } from './wizards-artifact-store';
import { createClockProvider } from './clock-provider';

// Studio dependency map - defines which studios depend on outputs from which studios
const STUDIO_DEPENDENCIES: Record<string, string[]> = {
  'ideation-lab': [], // No dependencies - always first
  'market-intelligence': ['ideation-lab'], // Depends on idea validation
  'product-blueprint': ['ideation-lab', 'market-intelligence'], // Depends on idea + market research
  'experience-design': ['product-blueprint'], // Depends on product specs
  'engineering-forge': ['product-blueprint', 'experience-design'], // Depends on specs + design
  'quality-assurance-lab': ['engineering-forge'], // Depends on code
  'growth-engine': ['engineering-forge', 'quality-assurance-lab'], // Depends on validated product
  'operations-hub': ['engineering-forge', 'quality-assurance-lab'], // Depends on validated product
  'launch-command': ['quality-assurance-lab', 'growth-engine'], // Depends on QA + growth strategy
  'deployment-studio': ['engineering-forge', 'launch-command'], // Depends on code + launch plan
};

// Artifact handoff rules - what artifact types are needed by each studio
const ARTIFACT_REQUIREMENTS: Record<string, string[]> = {
  'ideation-lab': [],
  'market-intelligence': ['business_model', 'problem_statement'],
  'product-blueprint': ['business_model', 'market_research', 'competitive_analysis'],
  'experience-design': ['product_requirements', 'user_stories'],
  'engineering-forge': ['product_requirements', 'wireframes', 'design_system'],
  'quality-assurance-lab': ['source_code', 'technical_architecture'],
  'growth-engine': ['source_code', 'marketing_materials'],
  'operations-hub': ['source_code', 'deployment_config'],
  'launch-command': ['marketing_materials', 'growth_strategy'],
  'deployment-studio': ['source_code', 'deployment_config', 'infrastructure_plan'],
};

export interface SessionContext {
  startupId: number;
  studioId: string;
  sessionId?: number;
  aguiSessionId?: string;
  parentSessions?: number[];
  inheritedArtifacts?: WizardsArtifact[];
  metadata?: Record<string, any>;
}

export interface StudioHandoffResult {
  success: boolean;
  context: SessionContext;
  artifacts: WizardsArtifact[];
  aguiSessionId?: string;
  message: string;
}

export class WizardsStudioSessionManager {
  private artifactStore: WizardsArtifactStoreService;

  constructor() {
    this.artifactStore = new WizardsArtifactStoreService();
  }

  /**
   * Create a new studio session with automatic context propagation
   */
  async createSessionWithContext(
    startupId: number,
    studioId: string,
    userId: number,
    options?: {
      propagateContext?: boolean;
      deterministicMode?: boolean;
      clockSeed?: string;
    }
  ): Promise<SessionContext> {
    // CRITICAL: Enforce dependency graph before allowing session creation
    const readiness = await this.isStudioReady(startupId, studioId);
    if (!readiness.ready) {
      throw new Error(
        `Cannot start ${studioId}: ${readiness.message}. Missing dependencies: ${readiness.missingDependencies.join(', ')}`
      );
    }

    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `session-${startupId}-${studioId}`
    );

    // Get dependency studios
    const dependencyStudioIds = STUDIO_DEPENDENCIES[studioId] || [];
    
    // Find parent sessions from dependency studios
    const parentSessions: WizardsStudioSession[] = [];
    if (options?.propagateContext && dependencyStudioIds.length > 0) {
      const sessions = await db
        .select()
        .from(wizardsStudioSessions)
        .where(
          and(
            eq(wizardsStudioSessions.startupId, startupId),
            inArray(wizardsStudioSessions.studioId, dependencyStudioIds),
            eq(wizardsStudioSessions.status, 'completed')
          )
        )
        .orderBy(desc(wizardsStudioSessions.createdAt));

      parentSessions.push(...sessions);
    }

    // Collect artifacts from parent sessions
    const inheritedArtifacts: WizardsArtifact[] = [];
    if (parentSessions.length > 0) {
      const parentSessionIds = parentSessions.map(s => s.id);
      const artifacts = await db
        .select()
        .from(wizardsArtifacts)
        .where(
          and(
            eq(wizardsArtifacts.startupId, startupId),
            inArray(wizardsArtifacts.sessionId!, parentSessionIds)
          )
        )
        .orderBy(desc(wizardsArtifacts.createdAt));

      inheritedArtifacts.push(...artifacts);
    }

    // Create the new session
    const [session] = await db
      .insert(wizardsStudioSessions)
      .values({
        startupId,
        studioId,
        userId,
        status: 'pending',
        startedAt: null,
        completedAt: null,
        duration: null,
        orchestrationJobId: null,
        taskCount: 0,
        completedTaskCount: 0,
        qualityScore: 0,
        creditsUsed: 0,
        createdAt: clock.now(),
        updatedAt: clock.now(),
      })
      .returning();

    return {
      startupId,
      studioId,
      sessionId: session.id,
      parentSessions: parentSessions.map(s => s.id),
      inheritedArtifacts,
      metadata: {
        parentStudioIds: dependencyStudioIds,
        inheritedArtifactCount: inheritedArtifacts.length,
        createdAt: session.createdAt,
      },
    };
  }

  /**
   * Get required artifacts for a studio from previous studios
   */
  async getRequiredArtifacts(
    startupId: number,
    studioId: string
  ): Promise<WizardsArtifact[]> {
    const requiredTypes = ARTIFACT_REQUIREMENTS[studioId] || [];
    if (requiredTypes.length === 0) {
      return [];
    }

    const dependencyStudioIds = STUDIO_DEPENDENCIES[studioId] || [];
    if (dependencyStudioIds.length === 0) {
      return [];
    }

    // Get completed sessions from dependency studios
    const sessions = await db
      .select()
      .from(wizardsStudioSessions)
      .where(
        and(
          eq(wizardsStudioSessions.startupId, startupId),
          inArray(wizardsStudioSessions.studioId, dependencyStudioIds),
          eq(wizardsStudioSessions.status, 'completed')
        )
      )
      .orderBy(desc(wizardsStudioSessions.createdAt));

    if (sessions.length === 0) {
      return [];
    }

    const sessionIds = sessions.map(s => s.id);

    // Get artifacts from those sessions matching required types
    const artifacts = await db
      .select()
      .from(wizardsArtifacts)
      .where(
        and(
          eq(wizardsArtifacts.startupId, startupId),
          inArray(wizardsArtifacts.sessionId!, sessionIds),
          inArray(wizardsArtifacts.artifactType, requiredTypes as any[])
        )
      )
      .orderBy(desc(wizardsArtifacts.createdAt));

    return artifacts;
  }

  /**
   * Check if a studio is ready to start (all dependencies completed)
   */
  async isStudioReady(
    startupId: number,
    studioId: string
  ): Promise<{ ready: boolean; missingDependencies: string[]; message: string }> {
    const dependencyStudioIds = STUDIO_DEPENDENCIES[studioId] || [];
    
    // Studios with no dependencies are always ready
    if (dependencyStudioIds.length === 0) {
      return {
        ready: true,
        missingDependencies: [],
        message: `${studioId} is ready to start (no dependencies)`,
      };
    }

    // Check which dependencies have completed sessions
    const completedSessions = await db
      .select()
      .from(wizardsStudioSessions)
      .where(
        and(
          eq(wizardsStudioSessions.startupId, startupId),
          inArray(wizardsStudioSessions.studioId, dependencyStudioIds),
          eq(wizardsStudioSessions.status, 'completed')
        )
      );

    const completedStudioIds = completedSessions.map(s => s.studioId);
    const missingDependencies = dependencyStudioIds.filter(
      id => !completedStudioIds.includes(id)
    );

    const ready = missingDependencies.length === 0;

    return {
      ready,
      missingDependencies,
      message: ready
        ? `${studioId} is ready to start (all dependencies completed)`
        : `${studioId} requires completion of: ${missingDependencies.join(', ')}`,
    };
  }

  /**
   * Propagate AG-UI session and artifacts to next studio
   */
  async handoffToNextStudio(
    startupId: number,
    fromStudioId: string,
    sessionId: number,
    options?: {
      aguiSessionId?: string;
      deterministicMode?: boolean;
      clockSeed?: string;
    }
  ): Promise<StudioHandoffResult> {
    // Find next logical studio based on workflow
    const nextStudioId = this.getNextStudio(fromStudioId);
    
    if (!nextStudioId) {
      return {
        success: false,
        context: { startupId, studioId: fromStudioId },
        artifacts: [],
        message: `No next studio found after ${fromStudioId}`,
      };
    }

    // Check if next studio is ready
    const readiness = await this.isStudioReady(startupId, nextStudioId);
    
    if (!readiness.ready) {
      return {
        success: false,
        context: { startupId, studioId: nextStudioId },
        artifacts: [],
        message: `Next studio (${nextStudioId}) not ready: ${readiness.message}`,
      };
    }

    // Get artifacts from completed session
    const artifacts = await db
      .select()
      .from(wizardsArtifacts)
      .where(
        and(
          eq(wizardsArtifacts.startupId, startupId),
          eq(wizardsArtifacts.sessionId!, sessionId)
        )
      );

    return {
      success: true,
      context: {
        startupId,
        studioId: nextStudioId,
        aguiSessionId: options?.aguiSessionId,
        parentSessions: [sessionId],
        inheritedArtifacts: artifacts,
        metadata: {
          handoffFrom: fromStudioId,
          handoffTime: new Date().toISOString(),
        },
      },
      artifacts,
      aguiSessionId: options?.aguiSessionId,
      message: `Successfully handed off from ${fromStudioId} to ${nextStudioId} with ${artifacts.length} artifacts`,
    };
  }

  /**
   * Get the next studio in the workflow sequence
   */
  private getNextStudio(currentStudioId: string): string | null {
    const sequence = [
      'ideation-lab',
      'market-intelligence',
      'product-blueprint',
      'experience-design',
      'engineering-forge',
      'quality-assurance-lab',
      'growth-engine',
      'operations-hub',
      'launch-command',
      'deployment-studio',
    ];

    const currentIndex = sequence.indexOf(currentStudioId);
    if (currentIndex === -1 || currentIndex === sequence.length - 1) {
      return null;
    }

    return sequence[currentIndex + 1];
  }

  /**
   * Get suggested next studios based on completed work
   */
  async getSuggestedNextStudios(
    startupId: number
  ): Promise<Array<{ studioId: string; ready: boolean; message: string }>> {
    const allStudios = Object.keys(STUDIO_DEPENDENCIES);
    const suggestions = [];

    for (const studioId of allStudios) {
      const readiness = await this.isStudioReady(startupId, studioId);
      
      // Only suggest ready studios that haven't been completed
      if (readiness.ready) {
        const existingSession = await db
          .select()
          .from(wizardsStudioSessions)
          .where(
            and(
              eq(wizardsStudioSessions.startupId, startupId),
              eq(wizardsStudioSessions.studioId, studioId),
              eq(wizardsStudioSessions.status, 'completed')
            )
          )
          .limit(1);

        if (existingSession.length === 0) {
          suggestions.push({
            studioId,
            ready: true,
            message: `Ready to start ${studioId}`,
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * Get session context with all inherited artifacts and AG-UI sessions
   */
  async getSessionContext(sessionId: number): Promise<SessionContext | null> {
    const [session] = await db
      .select()
      .from(wizardsStudioSessions)
      .where(eq(wizardsStudioSessions.id, sessionId))
      .limit(1);

    if (!session) {
      return null;
    }

    // Get dependency studios
    const dependencyStudioIds = STUDIO_DEPENDENCIES[session.studioId] || [];
    
    // Find parent sessions
    const parentSessions = await db
      .select()
      .from(wizardsStudioSessions)
      .where(
        and(
          eq(wizardsStudioSessions.startupId, session.startupId),
          inArray(wizardsStudioSessions.studioId, dependencyStudioIds),
          eq(wizardsStudioSessions.status, 'completed')
        )
      )
      .orderBy(desc(wizardsStudioSessions.createdAt));

    // Get inherited artifacts
    const inheritedArtifacts = await this.getRequiredArtifacts(
      session.startupId,
      session.studioId
    );

    return {
      startupId: session.startupId,
      studioId: session.studioId,
      sessionId: session.id,
      parentSessions: parentSessions.map(s => s.id),
      inheritedArtifacts,
      metadata: {
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        creditsUsed: session.creditsUsed,
      },
    };
  }

  /**
   * Get studio dependencies for a given studio
   */
  getStudioDependencies(studioId: string): string[] {
    return STUDIO_DEPENDENCIES[studioId] || [];
  }

  /**
   * Get artifact requirements for a given studio
   */
  getArtifactRequirements(studioId: string): string[] {
    return ARTIFACT_REQUIREMENTS[studioId] || [];
  }
}

// Export singleton instance
export const studioSessionManager = new WizardsStudioSessionManager();
