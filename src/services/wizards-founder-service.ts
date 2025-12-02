/**
 * Wizards Founder Service
 * Manages founder profiles, journey tracking, achievements, and learning loops
 * 
 * Part of Layer 2: Founder Graph - The intelligence layer that learns from each founder
 */

import { db } from '../db';
import {
  wizardsFounders,
  wizardsJourneyTimeline,
  wizardsStartups,
  type WizardsFounder,
  type InsertWizardsFounder,
  type WizardsJourneyTimeline,
  type InsertWizardsJourneyTimeline,
} from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import type {
  FounderProfile,
  FounderProgress,
  Achievement,
  FounderType,
  StartupStage,
} from '@shared/wizards-incubator-types';
import { createClockProvider, type ClockProvider } from './clock-provider';

export class WizardsFounderService {
  /**
   * Create a new founder profile
   */
  async createFounder(data: InsertWizardsFounder): Promise<WizardsFounder> {
    const cleanData: any = {
      userId: data.userId,
    };

    if (data.founderType) cleanData.founderType = data.founderType;
    if (data.industryExperience !== undefined) cleanData.industryExperience = data.industryExperience;
    if (data.technicalBackground !== undefined) cleanData.technicalBackground = data.technicalBackground;
    if (data.startupStage) cleanData.startupStage = data.startupStage;
    if (data.goals) cleanData.goals = data.goals;
    if (data.preferences) cleanData.preferences = data.preferences;
    if (data.completedStudios) cleanData.completedStudios = data.completedStudios;
    if (data.currentStudio) cleanData.currentStudio = data.currentStudio;
    if (data.journeyProgress !== undefined) cleanData.journeyProgress = data.journeyProgress;
    if (data.learningProfile) cleanData.learningProfile = data.learningProfile;
    if (data.achievements) cleanData.achievements = data.achievements;
    if (data.networkConnections) cleanData.networkConnections = data.networkConnections;
    if (data.subscriptionTier) cleanData.subscriptionTier = data.subscriptionTier;

    const [founder] = await db
      .insert(wizardsFounders)
      .values(cleanData)
      .returning();

    return founder;
  }

  /**
   * Get founder by ID with full profile data
   */
  async getFounder(founderId: number): Promise<FounderProfile | null> {
    const [founder] = await db
      .select()
      .from(wizardsFounders)
      .where(eq(wizardsFounders.id, founderId))
      .limit(1);

    if (!founder) {
      return null;
    }

    const progress = await this.calculateProgress(founderId);

    return {
      ...founder,
      achievements: (founder.achievements as Achievement[]) || [],
      progress,
    };
  }

  /**
   * Get founder by user ID
   */
  async getFounderByUserId(userId: number): Promise<WizardsFounder | null> {
    const [founder] = await db
      .select()
      .from(wizardsFounders)
      .where(eq(wizardsFounders.userId, userId))
      .limit(1);

    return founder || null;
  }

  /**
   * Update founder profile
   */
  async updateFounder(
    founderId: number,
    updates: Partial<WizardsFounder>,
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsFounder> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `founder-${founderId}`
    );
    
    const [updated] = await db
      .update(wizardsFounders)
      .set({
        ...updates,
        updatedAt: clock.now(),
      })
      .where(eq(wizardsFounders.id, founderId))
      .returning();

    return updated;
  }

  /**
   * Calculate founder progress metrics
   */
  async calculateProgress(founderId: number): Promise<FounderProgress> {
    const founder = await db
      .select()
      .from(wizardsFounders)
      .where(eq(wizardsFounders.id, founderId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!founder) {
      throw new Error('Founder not found');
    }

    const startups = await db
      .select()
      .from(wizardsStartups)
      .where(eq(wizardsStartups.founderId, founderId));

    const completedStudios = (founder.completedStudios as string[]) || [];
    const totalStudios = 10;
    const completionPercentage = Math.round((completedStudios.length / totalStudios) * 100);

    const launchedCount = startups.filter((s) => s.stage === 'launched').length;

    return {
      completedStudios: completedStudios.length,
      totalStudios,
      completionPercentage,
      currentDay: founder.journeyProgress || 0,
      startupCount: startups.length,
      launchedCount,
    };
  }

  /**
   * Record a journey timeline event
   */
  async recordJourneyEvent(
    startupId: number,
    event: Partial<InsertWizardsJourneyTimeline>
  ): Promise<WizardsJourneyTimeline> {
    const [journeyEvent] = await db
      .insert(wizardsJourneyTimeline)
      .values({
        startupId,
        eventType: event.eventType || 'activity',
        eventName: event.eventName || 'Event',
        eventDescription: event.eventDescription,
        studioName: event.studioName,
        dayNumber: event.dayNumber,
        metadata: event.metadata || {},
      })
      .returning();

    return journeyEvent;
  }

  /**
   * Get journey timeline for a startup
   */
  async getJourneyTimeline(startupId: number): Promise<WizardsJourneyTimeline[]> {
    return db
      .select()
      .from(wizardsJourneyTimeline)
      .where(eq(wizardsJourneyTimeline.startupId, startupId))
      .orderBy(desc(wizardsJourneyTimeline.createdAt));
  }

  /**
   * Award achievement to founder
   */
  async awardAchievement(
    founderId: number,
    achievement: {
      name: string;
      description: string;
      icon: string;
      category: 'milestone' | 'quality' | 'speed' | 'community' | 'special';
    },
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<void> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `founder-${founderId}-achievement`
    );
    
    const founder = await db
      .select()
      .from(wizardsFounders)
      .where(eq(wizardsFounders.id, founderId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!founder) {
      throw new Error('Founder not found');
    }

    const existingAchievements = (founder.achievements as Achievement[]) || [];
    
    const hasAchievement = existingAchievements.some(
      (a) => a.name === achievement.name
    );

    if (!hasAchievement) {
      const achievementId = this.hashString(`${founderId}-${achievement.name}`).toString(36);
      const newAchievement: Achievement = {
        id: `achievement-${achievementId}`,
        ...achievement,
        earnedAt: clock.now(),
      };

      await db
        .update(wizardsFounders)
        .set({
          achievements: [...existingAchievements, newAchievement],
          updatedAt: clock.now(),
        })
        .where(eq(wizardsFounders.id, founderId));
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Mark studio as completed for founder
   */
  async completeStudio(
    founderId: number,
    studioId: string,
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<void> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `founder-${founderId}-studio`
    );
    
    const founder = await db
      .select()
      .from(wizardsFounders)
      .where(eq(wizardsFounders.id, founderId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!founder) {
      throw new Error('Founder not found');
    }

    const completedStudios = (founder.completedStudios as string[]) || [];
    
    if (!completedStudios.includes(studioId)) {
      await db
        .update(wizardsFounders)
        .set({
          completedStudios: [...completedStudios, studioId],
          currentStudio: null,
          updatedAt: clock.now(),
        })
        .where(eq(wizardsFounders.id, founderId));

      await this.checkAndAwardMilestoneAchievements(founderId, completedStudios.length + 1, options);
    }
  }

  /**
   * Update founder journey progress (day number)
   */
  async updateJourneyProgress(
    founderId: number,
    dayNumber: number,
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<void> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `founder-${founderId}-progress`
    );
    
    await db
      .update(wizardsFounders)
      .set({
        journeyProgress: dayNumber,
        updatedAt: clock.now(),
      })
      .where(eq(wizardsFounders.id, founderId));
  }

  /**
   * Update founder credits balance
   */
  async updateCredits(
    founderId: number,
    amount: number,
    operation: 'add' | 'subtract',
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<number> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `founder-${founderId}-credits`
    );
    
    const founder = await db
      .select()
      .from(wizardsFounders)
      .where(eq(wizardsFounders.id, founderId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!founder) {
      throw new Error('Founder not found');
    }

    const currentBalance = founder.creditsBalance || 0;
    const newBalance = operation === 'add' 
      ? currentBalance + amount 
      : currentBalance - amount;

    if (newBalance < 0) {
      throw new Error('Insufficient credits');
    }

    await db
      .update(wizardsFounders)
      .set({
        creditsBalance: newBalance,
        updatedAt: clock.now(),
      })
      .where(eq(wizardsFounders.id, founderId));

    return newBalance;
  }

  /**
   * Update subscription tier
   */
  async updateSubscriptionTier(
    founderId: number,
    tier: 'free' | 'pro' | 'team' | 'enterprise',
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<void> {
    const baseSeed = options?.clockSeed || `founder-${founderId}-subscription`;
    const clock = createClockProvider(
      options?.deterministicMode || false,
      baseSeed
    );
    
    await db
      .update(wizardsFounders)
      .set({
        subscriptionTier: tier,
        updatedAt: clock.now(),
      })
      .where(eq(wizardsFounders.id, founderId));

    const tierCredits = {
      free: 100,
      pro: 1000,
      team: 10000,
      enterprise: 100000,
    };

    await this.updateCredits(founderId, tierCredits[tier], 'add', {
      deterministicMode: options?.deterministicMode,
      clockSeed: baseSeed,
    });
  }

  /**
   * Add connection to founder's network
   */
  async addNetworkConnection(
    founderId: number,
    connectionId: number,
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<void> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `founder-${founderId}-network`
    );
    
    const founder = await db
      .select()
      .from(wizardsFounders)
      .where(eq(wizardsFounders.id, founderId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!founder) {
      throw new Error('Founder not found');
    }

    const connections = (founder.networkConnections as number[]) || [];
    
    if (!connections.includes(connectionId)) {
      await db
        .update(wizardsFounders)
        .set({
          networkConnections: [...connections, connectionId],
          updatedAt: clock.now(),
        })
        .where(eq(wizardsFounders.id, founderId));
    }
  }

  /**
   * Update learning profile based on founder actions
   */
  async updateLearningProfile(
    founderId: number,
    learningData: Record<string, any>,
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<void> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `founder-${founderId}-learning`
    );
    
    const founder = await db
      .select()
      .from(wizardsFounders)
      .where(eq(wizardsFounders.id, founderId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!founder) {
      throw new Error('Founder not found');
    }

    const currentProfile = (founder.learningProfile as Record<string, any>) || {};

    await db
      .update(wizardsFounders)
      .set({
        learningProfile: {
          ...currentProfile,
          ...learningData,
          lastUpdated: clock.iso(),
        },
        updatedAt: clock.now(),
      })
      .where(eq(wizardsFounders.id, founderId));
  }

  /**
   * Check and award milestone achievements based on progress
   */
  private async checkAndAwardMilestoneAchievements(
    founderId: number,
    completedStudioCount: number,
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<void> {
    const milestones = [
      {
        count: 1,
        name: 'First Steps',
        description: 'Completed your first studio!',
        icon: '🎯',
      },
      {
        count: 3,
        name: 'Getting Started',
        description: 'Completed 3 studios',
        icon: '🚀',
      },
      {
        count: 5,
        name: 'Halfway There',
        description: 'Completed 5 studios',
        icon: '⭐',
      },
      {
        count: 10,
        name: 'Full Journey',
        description: 'Completed all 10 studios!',
        icon: '🏆',
      },
    ];

    const milestone = milestones.find((m) => m.count === completedStudioCount);
    
    if (milestone) {
      await this.awardAchievement(founderId, {
        name: milestone.name,
        description: milestone.description,
        icon: milestone.icon,
        category: 'milestone',
      }, options);
    }
  }

  /**
   * Get all founders (admin view)
   */
  async getAllFounders(): Promise<WizardsFounder[]> {
    return db
      .select()
      .from(wizardsFounders)
      .orderBy(desc(wizardsFounders.createdAt));
  }

  /**
   * Get founder statistics
   */
  async getFounderStats(founderId: number): Promise<{
    totalStartups: number;
    activeStartups: number;
    launchedStartups: number;
    totalCreditsSpent: number;
    averageQualityScore: number;
    studiosCompleted: number;
    achievementsEarned: number;
  }> {
    const founder = await db
      .select()
      .from(wizardsFounders)
      .where(eq(wizardsFounders.id, founderId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!founder) {
      throw new Error('Founder not found');
    }

    const startups = await db
      .select()
      .from(wizardsStartups)
      .where(eq(wizardsStartups.founderId, founderId));

    const totalStartups = startups.length;
    const activeStartups = startups.filter((s) => s.status === 'active').length;
    const launchedStartups = startups.filter((s) => s.stage === 'launched').length;

    const avgQuality = startups.reduce((sum, s) => sum + (s.qualityScore || 0), 0) / (totalStartups || 1);

    return {
      totalStartups,
      activeStartups,
      launchedStartups,
      totalCreditsSpent: 0,
      averageQualityScore: Math.round(avgQuality),
      studiosCompleted: (founder.completedStudios as string[])?.length || 0,
      achievementsEarned: (founder.achievements as Achievement[])?.length || 0,
    };
  }
}

export const wizardsFounderService = new WizardsFounderService();
