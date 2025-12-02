/**
 * Wizards Founder Graph Service
 * Layer 2: Manages founder profiles and startup metadata
 * 
 * Part of Wizards Incubator Platform infrastructure
 * Note: Learning loops and journey tracking features pending implementation in future sprints
 */

import { db } from '../db';
import {
  wizardsStartups,
  wizardsFounders,
} from '@shared/schema';
import { eq } from 'drizzle-orm';

type WizardsStartup = typeof wizardsStartups.$inferSelect;
type WizardsFounder = typeof wizardsFounders.$inferSelect;

export class WizardsFounderGraphService {
  async createFounder(data: {
    userId: number;
    founderType?: 'solo' | 'co-founder';
    industryExperience?: string;
    technicalBackground?: boolean;
    startupStage?: 'idea' | 'validation' | 'mvp' | 'launched' | 'scaling';
  }): Promise<WizardsFounder> {
    const [founder] = await db
      .insert(wizardsFounders)
      .values({
        userId: data.userId,
        founderType: data.founderType || 'solo',
        industryExperience: data.industryExperience,
        technicalBackground: data.technicalBackground || false,
        startupStage: data.startupStage || 'idea',
      })
      .returning();

    return founder;
  }

  async getFounderByUserId(userId: number): Promise<WizardsFounder | undefined> {
    const founder = await db.query.wizardsFounders.findFirst({
      where: eq(wizardsFounders.userId, userId),
    });
    return founder;
  }

  async updateFounder(
    founderId: number,
    updates: Partial<{
      founderType: string;
      industryExperience: string;
      technicalBackground: boolean;
      startupStage: string;
      currentStudio: string;
      journeyProgress: number;
    }>
  ): Promise<WizardsFounder> {
    const [updated] = await db
      .update(wizardsFounders)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(wizardsFounders.id, founderId))
      .returning();

    return updated;
  }

  async createStartup(data: {
    founderId: number;
    name: string;
    tagline?: string;
    description?: string;
    industry: string;
    problemStatement?: string;
    solutionDescription?: string;
    targetMarket?: string;
    businessModel?: string;
    stage?: 'ideation' | 'validation' | 'development' | 'launch' | 'growth';
  }): Promise<WizardsStartup> {
    const [startup] = await db
      .insert(wizardsStartups)
      .values({
        founderId: data.founderId,
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        industry: data.industry,
        problemStatement: data.problemStatement,
        solutionDescription: data.solutionDescription,
        targetMarket: data.targetMarket,
        businessModel: data.businessModel,
        stage: data.stage || 'ideation',
      })
      .returning();

    return startup;
  }

  async getStartupById(startupId: number): Promise<WizardsStartup | undefined> {
    const startup = await db.query.wizardsStartups.findFirst({
      where: eq(wizardsStartups.id, startupId),
    });
    return startup;
  }

  async getStartupsByFounder(founderId: number): Promise<WizardsStartup[]> {
    const startups = await db
      .select()
      .from(wizardsStartups)
      .where(eq(wizardsStartups.founderId, founderId));
    return startups;
  }

  async updateStartup(
    startupId: number,
    updates: Partial<{
      name: string;
      tagline: string;
      description: string;
      industry: string;
      problemStatement: string;
      solutionDescription: string;
      targetMarket: string;
      businessModel: string;
      stage: string;
      currentDay: number;
      status: string;
    }>
  ): Promise<WizardsStartup> {
    const [updated] = await db
      .update(wizardsStartups)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(wizardsStartups.id, startupId))
      .returning();

    return updated;
  }

  async getFounderProfile(userId: number): Promise<{
    founder: WizardsFounder | undefined;
    startups: WizardsStartup[];
    stats: {
      startupCount: number;
      journeyProgress: number;
      completedStudios: number;
      currentStage: string;
    };
  }> {
    const founder = await this.getFounderByUserId(userId);
    
    if (!founder) {
      return {
        founder: undefined,
        startups: [],
        stats: {
          startupCount: 0,
          journeyProgress: 0,
          completedStudios: 0,
          currentStage: 'not_started',
        },
      };
    }

    const startups = await this.getStartupsByFounder(founder.id);

    return {
      founder,
      startups,
      stats: {
        startupCount: startups.length,
        journeyProgress: founder.journeyProgress || 0,
        completedStudios: (founder.completedStudios as string[]).length,
        currentStage: founder.startupStage,
      },
    };
  }
}

export const wizardsFounderGraphService = new WizardsFounderGraphService();
