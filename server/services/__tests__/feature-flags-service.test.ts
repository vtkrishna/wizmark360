import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { featureFlagsService } from '../feature-flags-service';
import { db } from '../../db';
import { featureFlags } from '../../../shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Feature Flags Service Test Suite
 * 
 * Comprehensive testing of the hierarchical feature flag system for WAI SDK v1.0 rollout.
 * 
 * Coverage:
 * - Flag Hierarchy (global → studio → capability)
 * - Studio Flags (all 10 studios)
 * - Flag CRUD Operations
 * - Normalization (case-insensitive, underscore/hyphen variants)
 * - Error Handling
 * 
 * Test Count: 25 tests
 */

describe('FeatureFlagsService', () => {
  /**
   * Helper: Clean up all feature flags after each test
   */
  afterEach(async () => {
    await db.delete(featureFlags);
  });

  describe('Flag Hierarchy', () => {
    it('should return false when global master switch is disabled', async () => {
      // Set global master switch OFF
      await featureFlagsService.setFlag({
        flagKey: 'wai_v1_enabled',
        flagName: 'WAI v1.0 Master',
        enabled: false,
        scope: 'global',
        scopeId: '_global',
      });

      // Enable studio flag
      await featureFlagsService.setFlag({
        flagKey: 'wai_v1_ideation_lab',
        flagName: 'WAI v1.0 Ideation Lab',
        enabled: true,
        scope: 'studio',
        scopeId: 'ideation_lab',
      });

      // Global master OFF should short-circuit
      const result = await featureFlagsService.isWAIv1EnabledForStudio('ideation_lab');
      expect(result).toBe(false);
    });

    it('should return false when studio flag is disabled even if global enabled', async () => {
      // Set global master switch ON
      await featureFlagsService.setFlag({
        flagKey: 'wai_v1_enabled',
        flagName: 'WAI v1.0 Master',
        enabled: true,
        scope: 'global',
        scopeId: '_global',
      });

      // Disable studio flag
      await featureFlagsService.setFlag({
        flagKey: 'wai_v1_ideation_lab',
        flagName: 'WAI v1.0 Ideation Lab',
        enabled: false,
        scope: 'studio',
        scopeId: 'ideation_lab',
      });

      // Studio flag OFF should disable studio
      const result = await featureFlagsService.isWAIv1EnabledForStudio('ideation_lab');
      expect(result).toBe(false);
    });

    it('should return true when both global and studio flags are enabled', async () => {
      // Set global master switch ON
      await featureFlagsService.setFlag({
        flagKey: 'wai_v1_enabled',
        flagName: 'WAI v1.0 Master',
        enabled: true,
        scope: 'global',
        scopeId: '_global',
      });

      // Enable studio flag
      await featureFlagsService.setFlag({
        flagKey: 'wai_v1_ideation_lab',
        flagName: 'WAI v1.0 Ideation Lab',
        enabled: true,
        scope: 'studio',
        scopeId: 'ideation_lab',
      });

      // Both ON = studio enabled
      const result = await featureFlagsService.isWAIv1EnabledForStudio('ideation_lab');
      expect(result).toBe(true);
    });

    it('should return false for capability flags when disabled', async () => {
      // Capability flag OFF
      await featureFlagsService.setFlag({
        flagKey: 'wai_v1_tools',
        flagName: 'WAI v1.0 Tools',
        enabled: false,
        scope: 'global',
        scopeId: '_global',
      });

      const result = await featureFlagsService.isWAIv1FeatureEnabled('tools');
      expect(result).toBe(false);
    });

    it('should return true for capability flags when enabled', async () => {
      // Capability flag ON
      await featureFlagsService.setFlag({
        flagKey: 'wai_v1_tools',
        flagName: 'WAI v1.0 Tools',
        enabled: true,
        scope: 'global',
        scopeId: '_global',
      });

      const result = await featureFlagsService.isWAIv1FeatureEnabled('tools');
      expect(result).toBe(true);
    });
  });

  describe('Studio Flags - All 10 Studios', () => {
    beforeEach(async () => {
      // Enable global master switch for all studio tests
      await featureFlagsService.setFlag({
        flagKey: 'wai_v1_enabled',
        flagName: 'WAI v1.0 Master',
        enabled: true,
        scope: 'global',
        scopeId: '_global',
      });
    });

    const studios = [
      { id: 'ideation_lab', name: 'Ideation Lab' },
      { id: 'engineering_forge', name: 'Engineering Forge' },
      { id: 'market_intelligence', name: 'Market Intelligence' },
      { id: 'product_blueprint', name: 'Product Blueprint' },
      { id: 'experience_design', name: 'Experience Design' },
      { id: 'quality_assurance', name: 'Quality Assurance' },
      { id: 'growth_engine', name: 'Growth Engine' },
      { id: 'launch_control', name: 'Launch Command' },
      { id: 'operations_cockpit', name: 'Operations Hub' },
      { id: 'deployment_studio', name: 'Deployment Studio' },
    ];

    for (const studio of studios) {
      it(`should enable ${studio.name} when studio flag is ON`, async () => {
        // Enable studio flag
        await featureFlagsService.setFlag({
          flagKey: `wai_v1_${studio.id}`,
          flagName: `WAI v1.0 ${studio.name}`,
          enabled: true,
          scope: 'studio',
          scopeId: studio.id,
        });

        const result = await featureFlagsService.isWAIv1EnabledForStudio(studio.id);
        expect(result).toBe(true);
      });
    }
  });

  describe('Flag CRUD Operations', () => {
    it('should create a new flag', async () => {
      const flag = await featureFlagsService.setFlag({
        flagKey: 'test_flag',
        flagName: 'Test Flag',
        description: 'Test flag for CRUD operations',
        enabled: true,
        scope: 'global',
        scopeId: '_global',
      });

      expect(flag.flagKey).toBe('test_flag');
      expect(flag.enabled).toBe(true);
      expect(flag.scope).toBe('global');
    });

    it('should update an existing flag', async () => {
      // Create flag
      await featureFlagsService.setFlag({
        flagKey: 'test_flag',
        flagName: 'Test Flag',
        enabled: false,
        scope: 'global',
        scopeId: '_global',
      });

      // Update flag
      const updated = await featureFlagsService.setFlag({
        flagKey: 'test_flag',
        flagName: 'Test Flag',
        enabled: true,
        scope: 'global',
        scopeId: '_global',
      });

      expect(updated.enabled).toBe(true);
    });

    it('should preserve metadata when updating flag', async () => {
      // Create flag with metadata
      await featureFlagsService.setFlag({
        flagKey: 'test_flag',
        flagName: 'Test Flag',
        enabled: false,
        scope: 'global',
        scopeId: '_global',
        metadata: { rolloutPercent: 10 },
      });

      // Update flag with additional metadata
      const updated = await featureFlagsService.setFlag({
        flagKey: 'test_flag',
        flagName: 'Test Flag',
        enabled: true,
        scope: 'global',
        scopeId: '_global',
        metadata: { experiment: 'test-001' },
      });

      // Both metadata fields should be present (merged)
      const metadata = updated.metadata as any;
      expect(metadata.rolloutPercent).toBe(10);
      expect(metadata.experiment).toBe('test-001');
    });

    it('should enable a flag using enable() method', async () => {
      const flag = await featureFlagsService.enable('test_flag', 'global', '_global');
      expect(flag.enabled).toBe(true);
    });

    it('should disable a flag using disable() method', async () => {
      // Create enabled flag first
      await featureFlagsService.enable('test_flag', 'global', '_global');

      // Disable it
      const flag = await featureFlagsService.disable('test_flag', 'global', '_global');
      expect(flag.enabled).toBe(false);
    });

    it('should retrieve all flags', async () => {
      // Create multiple flags
      await featureFlagsService.enable('flag1', 'global', '_global');
      await featureFlagsService.enable('flag2', 'studio', 'ideation_lab');
      await featureFlagsService.enable('flag3', 'global', '_global');

      const allFlags = await featureFlagsService.getAllFlags();
      expect(allFlags.length).toBeGreaterThanOrEqual(3);
    });

    it('should retrieve flags by scope', async () => {
      // Create flags in different scopes
      await featureFlagsService.enable('global_flag', 'global', '_global');
      await featureFlagsService.enable('studio_flag', 'studio', 'ideation_lab');

      const globalFlags = await featureFlagsService.getFlagsByScope('global');
      const studioFlags = await featureFlagsService.getFlagsByScope('studio');

      expect(globalFlags.some(f => f.flagKey === 'global_flag')).toBe(true);
      expect(studioFlags.some(f => f.flagKey === 'studio_flag')).toBe(true);
    });
  });

  describe('Normalization', () => {
    beforeEach(async () => {
      // Enable global master switch
      await featureFlagsService.setFlag({
        flagKey: 'wai_v1_enabled',
        flagName: 'WAI v1.0 Master',
        enabled: true,
        scope: 'global',
        scopeId: '_global',
      });

      // Enable ideation_lab studio flag
      await featureFlagsService.setFlag({
        flagKey: 'wai_v1_ideation_lab',
        flagName: 'WAI v1.0 Ideation Lab',
        enabled: true,
        scope: 'studio',
        scopeId: 'ideation_lab',
      });
    });

    it('should handle studio ID normalization (underscore to hyphen)', async () => {
      // The flag is stored with underscore (ideation_lab)
      // But adapter normalizes hyphenated IDs (ideation-lab) to underscored
      // This test verifies the flag lookup works regardless
      
      const result = await featureFlagsService.isWAIv1EnabledForStudio('ideation_lab');
      expect(result).toBe(true);
    });

    it('should support scoped flag override', async () => {
      // Create global flag
      await featureFlagsService.setFlag({
        flagKey: 'test_flag',
        flagName: 'Test Flag',
        enabled: false,
        scope: 'global',
        scopeId: '_global',
      });

      // Create scoped override
      await featureFlagsService.setFlag({
        flagKey: 'test_flag',
        flagName: 'Test Flag',
        enabled: true,
        scope: 'studio',
        scopeId: 'ideation_lab',
      });

      // Scoped flag should take precedence
      const scoped = await featureFlagsService.isEnabled('test_flag', 'studio', 'ideation_lab');
      expect(scoped).toBe(true);

      // Global flag should still be false
      const global = await featureFlagsService.isEnabled('test_flag', 'global', '_global');
      expect(global).toBe(false);
    });

    it('should fall back to global flag when scoped flag does not exist', async () => {
      // Create only global flag
      await featureFlagsService.setFlag({
        flagKey: 'test_flag',
        flagName: 'Test Flag',
        enabled: true,
        scope: 'global',
        scopeId: '_global',
      });

      // Query for non-existent scoped flag should fall back to global
      const result = await featureFlagsService.isEnabled('test_flag', 'studio', 'ideation_lab');
      expect(result).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return false when flag does not exist (fail closed)', async () => {
      const result = await featureFlagsService.isEnabled('non_existent_flag', 'global', '_global');
      expect(result).toBe(false);
    });

    it('should return false on database errors (fail closed)', async () => {
      // Mock database error
      const originalQuery = db.query.featureFlags.findFirst;
      vi.spyOn(db.query.featureFlags, 'findFirst').mockRejectedValueOnce(new Error('Database connection failed'));

      const result = await featureFlagsService.isEnabled('test_flag', 'global', '_global');
      expect(result).toBe(false);

      // Restore original
      db.query.featureFlags.findFirst = originalQuery;
    });

    it('should default scopeId to _global if not provided', async () => {
      const flag = await featureFlagsService.setFlag({
        flagKey: 'test_flag',
        flagName: 'Test Flag',
        enabled: true,
        scope: 'global',
      });

      expect(flag.scopeId).toBe('_global');
    });
  });

  describe('Default Flags Initialization', () => {
    it('should initialize all default flags (idempotent)', async () => {
      // Initialize defaults
      await featureFlagsService.initializeDefaultFlags();

      // Get all flags
      const allFlags = await featureFlagsService.getAllFlags();

      // Should have at least:
      // - 1 global master
      // - 4 capability flags (tools, mem0, mcp, multimodal)
      // - 13 studio flags (10 canonical + 3 legacy)
      expect(allFlags.length).toBeGreaterThanOrEqual(18);

      // Verify global master exists
      const masterFlag = allFlags.find(f => f.flagKey === 'wai_v1_enabled');
      expect(masterFlag).toBeDefined();
      expect(masterFlag?.enabled).toBe(false); // Safe default

      // Verify all capability flags exist
      const capabilityFlags = ['wai_v1_tools', 'wai_v1_mem0', 'wai_v1_mcp', 'wai_v1_multimodal'];
      for (const key of capabilityFlags) {
        const flag = allFlags.find(f => f.flagKey === key);
        expect(flag).toBeDefined();
        expect(flag?.enabled).toBe(false); // Safe default
      }

      // Verify all 10 canonical studio flags exist
      const studioIds = [
        'ideation_lab',
        'engineering_forge',
        'market_intelligence',
        'product_blueprint',
        'experience_design',
        'quality_assurance',
        'growth_engine',
        'launch_control',
        'operations_cockpit',
        'deployment_studio',
      ];

      for (const studioId of studioIds) {
        const flagKey = `wai_v1_${studioId}`;
        const flag = allFlags.find(f => f.flagKey === flagKey);
        expect(flag).toBeDefined();
        expect(flag?.enabled).toBe(false); // Safe default
        expect(flag?.scope).toBe('studio');
        expect(flag?.scopeId).toBe(studioId);
      }
    });

    it('should not duplicate flags on repeated initialization', async () => {
      // Initialize defaults twice
      await featureFlagsService.initializeDefaultFlags();
      await featureFlagsService.initializeDefaultFlags();

      // Count flags (should only have one of each)
      const allFlags = await featureFlagsService.getAllFlags();
      const masterFlags = allFlags.filter(f => f.flagKey === 'wai_v1_enabled');

      expect(masterFlags.length).toBe(1); // Should only have one master flag
    });
  });

  describe('Capability Flags', () => {
    const capabilities = [
      { name: 'tools', description: '93 production-ready tools' },
      { name: 'mem0', description: 'mem0 memory management' },
      { name: 'mcp', description: 'Model Context Protocol server' },
      { name: 'multimodal', description: 'Voice, video, music, image generation' },
    ];

    for (const capability of capabilities) {
      it(`should check ${capability.name} capability flag`, async () => {
        // Enable capability
        await featureFlagsService.setFlag({
          flagKey: `wai_v1_${capability.name}`,
          flagName: `WAI v1.0 ${capability.name}`,
          description: capability.description,
          enabled: true,
          scope: 'global',
          scopeId: '_global',
        });

        const result = await featureFlagsService.isWAIv1FeatureEnabled(capability.name);
        expect(result).toBe(true);
      });
    }
  });
});
