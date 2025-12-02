/**
 * Wizards Artifact Store Service
 * Manages code, designs, content, data, and deployment artifacts
 * 
 * Part of Layer 4: Artifact Store - Repository for all generated assets
 */

import { db } from '../db';
import {
  wizardsArtifacts,
  wizardsCodeRepository,
  wizardsDesignAssets,
  wizardsDeployments,
  wizardsStartups,
  type WizardsArtifact,
  type InsertWizardsArtifact,
  type WizardsCodeRepository,
  type InsertWizardsCodeRepository,
  type WizardsDesignAsset,
  type InsertWizardsDesignAsset,
  type WizardsDeployment,
  type InsertWizardsDeployment,
} from '@shared/schema';
import { eq, and, desc, sql, inArray, like } from 'drizzle-orm';
import type {
  Artifact,
  ArtifactType,
  ArtifactCategory,
  CodeArtifact,
  TechStack,
  QualityMetrics,
} from '@shared/wizards-incubator-types';
import { createClockProvider } from './clock-provider';

export class WizardsArtifactStoreService {
  /**
   * Create a new artifact
   */
  async createArtifact(
    data: {
      startupId: number;
      artifactType: ArtifactType;
      category: ArtifactCategory;
      name: string;
      description?: string;
      content?: string;
      fileUrl?: string;
      fileSize?: number;
      filePath?: string;
      mimeType?: string;
      version?: number;
      studioId?: string;
      sessionId?: number;
      tags?: string[];
      metadata?: any;
      isPublic?: boolean;
    },
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsArtifact> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `artifact-${data.startupId}-${data.name}`
    );

    const [artifact] = await db
      .insert(wizardsArtifacts)
      .values({
        startupId: data.startupId,
        artifactType: data.artifactType,
        category: data.category,
        name: data.name,
        description: data.description,
        content: data.content,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        filePath: data.filePath,
        mimeType: data.mimeType,
        version: data.version || 1,
        studioId: data.studioId,
        sessionId: data.sessionId,
        tags: data.tags || [],
        metadata: data.metadata || {},
        isPublic: data.isPublic || false,
        downloads: 0,
        createdAt: clock.now(),
        updatedAt: clock.now(),
      })
      .returning();

    return artifact;
  }

  /**
   * Get artifact by ID
   */
  async getArtifact(artifactId: number): Promise<WizardsArtifact | null> {
    const [artifact] = await db
      .select()
      .from(wizardsArtifacts)
      .where(eq(wizardsArtifacts.id, artifactId))
      .limit(1);

    return artifact || null;
  }

  /**
   * Get all artifacts for a startup
   */
  async getStartupArtifacts(startupId: number): Promise<WizardsArtifact[]> {
    return db
      .select()
      .from(wizardsArtifacts)
      .where(eq(wizardsArtifacts.startupId, startupId))
      .orderBy(desc(wizardsArtifacts.createdAt));
  }

  /**
   * Get artifacts by type
   */
  async getArtifactsByType(
    startupId: number,
    artifactType: ArtifactType
  ): Promise<WizardsArtifact[]> {
    return db
      .select()
      .from(wizardsArtifacts)
      .where(and(
        eq(wizardsArtifacts.startupId, startupId),
        eq(wizardsArtifacts.artifactType, artifactType)
      ))
      .orderBy(desc(wizardsArtifacts.createdAt));
  }

  /**
   * Get artifacts by category
   */
  async getArtifactsByCategory(
    startupId: number,
    category: ArtifactCategory
  ): Promise<WizardsArtifact[]> {
    return db
      .select()
      .from(wizardsArtifacts)
      .where(and(
        eq(wizardsArtifacts.startupId, startupId),
        eq(wizardsArtifacts.category, category)
      ))
      .orderBy(desc(wizardsArtifacts.createdAt));
  }

  /**
   * Search artifacts by name, description, or tags
   */
  async searchArtifacts(
    startupId: number,
    searchTerm: string
  ): Promise<WizardsArtifact[]> {
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) {
      return [];
    }

    const likePattern = `%${trimmedTerm}%`;
    return db
      .select()
      .from(wizardsArtifacts)
      .where(and(
        eq(wizardsArtifacts.startupId, startupId),
        sql`(
          ${wizardsArtifacts.name} ILIKE ${likePattern} OR 
          ${wizardsArtifacts.description} ILIKE ${likePattern} OR
          EXISTS (
            SELECT 1 FROM unnest(${wizardsArtifacts.tags}) AS tag
            WHERE tag ILIKE ${likePattern}
          )
        )`
      ))
      .orderBy(desc(wizardsArtifacts.createdAt));
  }

  /**
   * Update artifact
   */
  async updateArtifact(
    artifactId: number,
    updates: {
      name?: string;
      description?: string;
      content?: string;
      fileUrl?: string;
      tags?: string[];
      metadata?: any;
      isPublic?: boolean;
    },
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsArtifact> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `artifact-${artifactId}-update`
    );

    const updateData: any = {
      updatedAt: clock.now(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.fileUrl !== undefined) updateData.fileUrl = updates.fileUrl;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata;
    if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;

    const [artifact] = await db
      .update(wizardsArtifacts)
      .set(updateData)
      .where(eq(wizardsArtifacts.id, artifactId))
      .returning();

    return artifact;
  }

  /**
   * Increment artifact download counter
   */
  async incrementDownloads(
    artifactId: number,
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsArtifact> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `artifact-${artifactId}-download`
    );

    const artifact = await this.getArtifact(artifactId);
    if (!artifact) {
      throw new Error(`Artifact not found: ${artifactId}`);
    }

    const [updated] = await db
      .update(wizardsArtifacts)
      .set({
        downloads: (artifact.downloads || 0) + 1,
        updatedAt: clock.now(),
      })
      .where(eq(wizardsArtifacts.id, artifactId))
      .returning();

    return updated;
  }

  /**
   * Delete artifact and associated code/design records
   */
  async deleteArtifact(artifactId: number): Promise<boolean> {
    await db.delete(wizardsCodeRepository).where(eq(wizardsCodeRepository.artifactId, artifactId));
    
    await db.delete(wizardsDesignAssets).where(eq(wizardsDesignAssets.artifactId, artifactId));
    
    await db.delete(wizardsArtifacts).where(eq(wizardsArtifacts.id, artifactId));

    return true;
  }

  /**
   * Create code repository record
   */
  async createCodeRepository(
    data: {
      artifactId: number;
      repository?: string;
      branch?: string;
      commitHash?: string;
      fileStructure?: any;
      techStack?: TechStack;
      dependencies?: Record<string, string>;
      buildStatus?: string;
      testCoverage?: number;
      linesOfCode?: number;
      qualityMetrics?: QualityMetrics;
    },
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsCodeRepository> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `code-repo-${data.artifactId}`
    );

    const [codeRepo] = await db
      .insert(wizardsCodeRepository)
      .values({
        artifactId: data.artifactId,
        repository: data.repository,
        branch: data.branch || 'main',
        commitHash: data.commitHash,
        fileStructure: data.fileStructure || {},
        techStack: data.techStack || {},
        dependencies: data.dependencies || {},
        buildStatus: data.buildStatus,
        testCoverage: data.testCoverage,
        linesOfCode: data.linesOfCode,
        qualityMetrics: data.qualityMetrics || {},
        createdAt: clock.now(),
        updatedAt: clock.now(),
      })
      .returning();

    return codeRepo;
  }

  /**
   * Get code repository by artifact ID
   */
  async getCodeRepository(artifactId: number): Promise<WizardsCodeRepository | null> {
    const [codeRepo] = await db
      .select()
      .from(wizardsCodeRepository)
      .where(eq(wizardsCodeRepository.artifactId, artifactId))
      .limit(1);

    return codeRepo || null;
  }

  /**
   * Update code repository
   */
  async updateCodeRepository(
    artifactId: number,
    updates: {
      repository?: string;
      branch?: string;
      commitHash?: string;
      fileStructure?: any;
      techStack?: TechStack;
      dependencies?: Record<string, string>;
      buildStatus?: string;
      testCoverage?: number;
      linesOfCode?: number;
      qualityMetrics?: QualityMetrics;
    },
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsCodeRepository> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `code-repo-${artifactId}-update`
    );

    const updateData: any = {
      updatedAt: clock.now(),
    };

    if (updates.repository !== undefined) updateData.repository = updates.repository;
    if (updates.branch !== undefined) updateData.branch = updates.branch;
    if (updates.commitHash !== undefined) updateData.commitHash = updates.commitHash;
    if (updates.fileStructure !== undefined) updateData.fileStructure = updates.fileStructure;
    if (updates.techStack !== undefined) updateData.techStack = updates.techStack;
    if (updates.dependencies !== undefined) updateData.dependencies = updates.dependencies;
    if (updates.buildStatus !== undefined) updateData.buildStatus = updates.buildStatus;
    if (updates.testCoverage !== undefined) updateData.testCoverage = updates.testCoverage;
    if (updates.linesOfCode !== undefined) updateData.linesOfCode = updates.linesOfCode;
    if (updates.qualityMetrics !== undefined) updateData.qualityMetrics = updates.qualityMetrics;

    const [codeRepo] = await db
      .update(wizardsCodeRepository)
      .set(updateData)
      .where(eq(wizardsCodeRepository.artifactId, artifactId))
      .returning();

    return codeRepo;
  }

  /**
   * Create design asset record
   */
  async createDesignAsset(
    data: {
      artifactId: number;
      assetType: string;
      figmaUrl?: string;
      previewUrl?: string;
      designSystem?: any;
      components?: any[];
      colorPalette?: string[];
      typography?: any;
      accessibilityScore?: number;
    },
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsDesignAsset> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `design-asset-${data.artifactId}`
    );

    const [designAsset] = await db
      .insert(wizardsDesignAssets)
      .values({
        artifactId: data.artifactId,
        assetType: data.assetType,
        figmaUrl: data.figmaUrl,
        previewUrl: data.previewUrl,
        designSystem: data.designSystem || {},
        components: data.components || [],
        colorPalette: data.colorPalette || [],
        typography: data.typography || {},
        accessibilityScore: data.accessibilityScore,
        createdAt: clock.now(),
        updatedAt: clock.now(),
      })
      .returning();

    return designAsset;
  }

  /**
   * Get design asset by artifact ID
   */
  async getDesignAsset(artifactId: number): Promise<WizardsDesignAsset | null> {
    const [designAsset] = await db
      .select()
      .from(wizardsDesignAssets)
      .where(eq(wizardsDesignAssets.artifactId, artifactId))
      .limit(1);

    return designAsset || null;
  }

  /**
   * Update design asset
   */
  async updateDesignAsset(
    artifactId: number,
    updates: {
      figmaUrl?: string;
      previewUrl?: string;
      designSystem?: any;
      components?: any[];
      colorPalette?: string[];
      typography?: any;
      accessibilityScore?: number;
    },
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsDesignAsset> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `design-asset-${artifactId}-update`
    );

    const updateData: any = {
      updatedAt: clock.now(),
    };

    if (updates.figmaUrl !== undefined) updateData.figmaUrl = updates.figmaUrl;
    if (updates.previewUrl !== undefined) updateData.previewUrl = updates.previewUrl;
    if (updates.designSystem !== undefined) updateData.designSystem = updates.designSystem;
    if (updates.components !== undefined) updateData.components = updates.components;
    if (updates.colorPalette !== undefined) updateData.colorPalette = updates.colorPalette;
    if (updates.typography !== undefined) updateData.typography = updates.typography;
    if (updates.accessibilityScore !== undefined) updateData.accessibilityScore = updates.accessibilityScore;

    const [designAsset] = await db
      .update(wizardsDesignAssets)
      .set(updateData)
      .where(eq(wizardsDesignAssets.artifactId, artifactId))
      .returning();

    return designAsset;
  }

  /**
   * Create deployment record
   */
  async createDeployment(
    data: {
      startupId: number;
      deploymentType: string;
      environment: string;
      provider: string;
      region?: string;
      url?: string;
      version?: string;
      configuration?: any;
      resources?: any;
    },
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsDeployment> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `deployment-${data.startupId}-${data.environment}`
    );

    const [deployment] = await db
      .insert(wizardsDeployments)
      .values({
        startupId: data.startupId,
        deploymentType: data.deploymentType,
        environment: data.environment,
        provider: data.provider,
        region: data.region,
        url: data.url,
        status: 'active',
        version: data.version,
        healthStatus: 'unknown',
        configuration: data.configuration || {},
        resources: data.resources || {},
        metrics: {},
        deployedAt: clock.now(),
        createdAt: clock.now(),
        updatedAt: clock.now(),
      })
      .returning();

    return deployment;
  }

  /**
   * Get deployments for a startup
   */
  async getStartupDeployments(startupId: number): Promise<WizardsDeployment[]> {
    return db
      .select()
      .from(wizardsDeployments)
      .where(eq(wizardsDeployments.startupId, startupId))
      .orderBy(desc(wizardsDeployments.deployedAt));
  }

  /**
   * Get deployments by environment
   */
  async getDeploymentsByEnvironment(
    startupId: number,
    environment: string
  ): Promise<WizardsDeployment[]> {
    return db
      .select()
      .from(wizardsDeployments)
      .where(and(
        eq(wizardsDeployments.startupId, startupId),
        eq(wizardsDeployments.environment, environment)
      ))
      .orderBy(desc(wizardsDeployments.deployedAt));
  }

  /**
   * Update deployment status
   */
  async updateDeploymentStatus(
    deploymentId: number,
    updates: {
      status?: string;
      healthStatus?: string;
      metrics?: any;
      url?: string;
    },
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsDeployment> {
    const clock = createClockProvider(
      options?.deterministicMode || false,
      options?.clockSeed || `deployment-${deploymentId}-update`
    );

    const updateData: any = {
      updatedAt: clock.now(),
    };

    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.healthStatus !== undefined) {
      updateData.healthStatus = updates.healthStatus;
      updateData.lastHealthCheck = clock.now();
    }
    if (updates.metrics !== undefined) updateData.metrics = updates.metrics;
    if (updates.url !== undefined) updateData.url = updates.url;

    const [deployment] = await db
      .update(wizardsDeployments)
      .set(updateData)
      .where(eq(wizardsDeployments.id, deploymentId))
      .returning();

    return deployment;
  }

  /**
   * Get artifact with full details (code/design metadata)
   */
  async getArtifactWithDetails(artifactId: number): Promise<{
    artifact: WizardsArtifact;
    codeRepository?: WizardsCodeRepository;
    designAsset?: WizardsDesignAsset;
  } | null> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) {
      return null;
    }

    const result: {
      artifact: WizardsArtifact;
      codeRepository?: WizardsCodeRepository;
      designAsset?: WizardsDesignAsset;
    } = { artifact };

    if (artifact.artifactType === 'code') {
      const codeRepo = await this.getCodeRepository(artifactId);
      if (codeRepo) {
        result.codeRepository = codeRepo;
      }
    }

    if (artifact.artifactType === 'design') {
      const designAsset = await this.getDesignAsset(artifactId);
      if (designAsset) {
        result.designAsset = designAsset;
      }
    }

    return result;
  }

  /**
   * Get startup artifact statistics
   */
  async getStartupArtifactStats(startupId: number): Promise<{
    totalArtifacts: number;
    artifactsByType: Record<string, number>;
    artifactsByCategory: Record<string, number>;
    totalDownloads: number;
    publicArtifacts: number;
    codeRepositories: number;
    designAssets: number;
    deployments: number;
    totalStorageSize: number;
  }> {
    const artifacts = await this.getStartupArtifacts(startupId);
    const deployments = await this.getStartupDeployments(startupId);

    const artifactsByType: Record<string, number> = {};
    const artifactsByCategory: Record<string, number> = {};
    let totalDownloads = 0;
    let publicArtifacts = 0;
    let codeRepositories = 0;
    let designAssets = 0;
    let totalStorageSize = 0;

    for (const artifact of artifacts) {
      artifactsByType[artifact.artifactType] = (artifactsByType[artifact.artifactType] || 0) + 1;
      artifactsByCategory[artifact.category] = (artifactsByCategory[artifact.category] || 0) + 1;
      totalDownloads += artifact.downloads || 0;
      if (artifact.isPublic) publicArtifacts++;
      if (artifact.artifactType === 'code') codeRepositories++;
      if (artifact.artifactType === 'design') designAssets++;
      totalStorageSize += artifact.fileSize || 0;
    }

    return {
      totalArtifacts: artifacts.length,
      artifactsByType,
      artifactsByCategory,
      totalDownloads,
      publicArtifacts,
      codeRepositories,
      designAssets,
      deployments: deployments.length,
      totalStorageSize,
    };
  }

  /**
   * Create a new version of an artifact
   */
  async createArtifactVersion(
    originalArtifactId: number,
    newVersion: string,
    updates?: {
      content?: string;
      fileUrl?: string;
      fileSize?: number;
      metadata?: any;
    },
    options?: { deterministicMode?: boolean; clockSeed?: string }
  ): Promise<WizardsArtifact> {
    const original = await this.getArtifact(originalArtifactId);
    if (!original) {
      throw new Error(`Original artifact not found: ${originalArtifactId}`);
    }

    const newArtifact = await this.createArtifact(
      {
        startupId: original.startupId,
        artifactType: original.artifactType as ArtifactType,
        category: original.category as ArtifactCategory,
        name: original.name,
        description: original.description || undefined,
        content: updates?.content ?? original.content ?? undefined,
        fileUrl: updates?.fileUrl ?? original.fileUrl ?? undefined,
        fileSize: updates?.fileSize ?? original.fileSize ?? undefined,
        filePath: original.filePath ?? undefined,
        mimeType: original.mimeType ?? undefined,
        version: newVersion,
        studioId: original.studioId ?? undefined,
        sessionId: original.sessionId ?? undefined,
        tags: (original.tags as string[]) || [],
        metadata: {
          ...(original.metadata as object || {}),
          ...(updates?.metadata || {}),
          previousVersion: original.version,
          previousArtifactId: originalArtifactId,
        },
        isPublic: original.isPublic ?? false,
      },
      {
        deterministicMode: options?.deterministicMode,
        clockSeed: options?.clockSeed || `artifact-version-${originalArtifactId}-${newVersion}`,
      }
    );

    return newArtifact;
  }

  /**
   * Get all versions of an artifact (by name and startup)
   */
  async getArtifactVersions(
    startupId: number,
    artifactName: string
  ): Promise<WizardsArtifact[]> {
    return db
      .select()
      .from(wizardsArtifacts)
      .where(and(
        eq(wizardsArtifacts.startupId, startupId),
        eq(wizardsArtifacts.name, artifactName)
      ))
      .orderBy(desc(wizardsArtifacts.createdAt));
  }

  /**
   * Compare two artifact versions
   */
  async compareArtifactVersions(
    artifactId1: number,
    artifactId2: number
  ): Promise<{
    artifact1: WizardsArtifact;
    artifact2: WizardsArtifact;
    differences: {
      versionChanged: boolean;
      contentChanged: boolean;
      fileUrlChanged: boolean;
      fileSizeChanged: boolean;
      metadataChanged: boolean;
      tagsChanged: boolean;
    };
    sizeDifference?: number;
  }> {
    const artifact1 = await this.getArtifact(artifactId1);
    const artifact2 = await this.getArtifact(artifactId2);

    if (!artifact1 || !artifact2) {
      throw new Error('One or both artifacts not found');
    }

    const differences = {
      versionChanged: artifact1.version !== artifact2.version,
      contentChanged: artifact1.content !== artifact2.content,
      fileUrlChanged: artifact1.fileUrl !== artifact2.fileUrl,
      fileSizeChanged: artifact1.fileSize !== artifact2.fileSize,
      metadataChanged: JSON.stringify(artifact1.metadata) !== JSON.stringify(artifact2.metadata),
      tagsChanged: JSON.stringify(artifact1.tags) !== JSON.stringify(artifact2.tags),
    };

    const sizeDifference =
      artifact1.fileSize && artifact2.fileSize
        ? artifact2.fileSize - artifact1.fileSize
        : undefined;

    return {
      artifact1,
      artifact2,
      differences,
      sizeDifference,
    };
  }
}

export const wizardsArtifactStoreService = new WizardsArtifactStoreService();
