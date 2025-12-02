/**
 * Wizards Incubator Feature Registration
 * Registers all implemented Wizards Incubator platform features in the Feature Registry
 */

import { codeDuplicationGuard } from './code-duplication-guard';

export async function registerWizardsIncubatorFeatures(): Promise<void> {
  console.log('📝 Registering Wizards Incubator Platform features...\n');

  const features = [
    // Core Infrastructure Layers (4)
    {
      name: 'Wizards Orchestration Integration Service',
      description: 'Layer 1: Connects Wizards platform to WAI SDK v1.0 with dual-clock architecture for deterministic testing and production observability',
      featureType: 'infrastructure' as const,
      hasDatabase: true,
      databaseTables: ['wizards_startups', 'wizards_founders', 'wizards_sessions', 'wizards_tasks'],
      hasApi: false,
      apiEndpoints: [],
      hasFrontend: false,
      frontendComponents: [],
      files: ['server/services/wizards-orchestration-service.ts', 'shared/wizards-incubator-types.ts'],
    },
    {
      name: 'Wizards Founder Graph Service',
      description: 'Layer 2: Manages founder profiles, startup metadata, learning loops, and journey tracking',
      featureType: 'infrastructure' as const,
      hasDatabase: true,
      databaseTables: ['wizards_startups', 'wizards_founders', 'wizards_learning_loops', 'wizards_milestones'],
      hasApi: false,
      apiEndpoints: [],
      hasFrontend: false,
      frontendComponents: [],
      files: ['server/services/wizards-founder-graph.ts'],
    },
    {
      name: 'Wizards Studio Engine Core',
      description: 'Layer 3: Framework powering all 10 studios with session management, task tracking, and workflow orchestration',
      featureType: 'infrastructure' as const,
      hasDatabase: true,
      databaseTables: ['wizards_sessions', 'wizards_tasks'],
      hasApi: false,
      apiEndpoints: [],
      hasFrontend: false,
      frontendComponents: [],
      files: ['server/services/wizards-studio-engine.ts'],
    },
    {
      name: 'Wizards Artifact Store Service',
      description: 'Layer 4: Version-controlled repository for code, designs, documents with cascade deletion and tag-aware search',
      featureType: 'infrastructure' as const,
      hasDatabase: true,
      databaseTables: ['wizards_artifacts', 'wizards_artifact_versions', 'wizards_artifact_relationships'],
      hasApi: false,
      apiEndpoints: [],
      hasFrontend: false,
      frontendComponents: [],
      files: ['server/services/wizards-artifact-store.ts'],
    },

    // Studios (10)
    {
      name: 'Studio 1 - Ideation Lab',
      description: 'Idea validation, market research, and business model canvas generation',
      featureType: 'backend-only' as const,
      hasDatabase: true,
      databaseTables: ['wizards_sessions', 'wizards_tasks', 'wizards_artifacts'],
      hasApi: false,
      apiEndpoints: [],
      hasFrontend: false,
      frontendComponents: [],
      files: ['server/services/studios/wizards-ideation-lab.ts'],
    },
    {
      name: 'Studio 2 - Market Intelligence',
      description: 'Competitive analysis, customer personas, and GTM strategy development',
      featureType: 'backend-only' as const,
      hasDatabase: true,
      databaseTables: ['wizards_sessions', 'wizards_tasks', 'wizards_artifacts'],
      hasApi: false,
      apiEndpoints: [],
      hasFrontend: false,
      frontendComponents: [],
      files: ['server/services/studios/wizards-market-intelligence.ts'],
    },
    {
      name: 'Studio 3 - Product Blueprint',
      description: 'PRD generation, system architecture design, database modeling, and API specifications',
      featureType: 'backend-only' as const,
      hasDatabase: true,
      databaseTables: ['wizards_sessions', 'wizards_tasks', 'wizards_artifacts'],
      hasApi: false,
      apiEndpoints: [],
      hasFrontend: false,
      frontendComponents: [],
      files: ['server/services/studios/wizards-product-blueprint.ts'],
    },
    {
      name: 'Studio 4 - Experience Design',
      description: 'UI/UX design, wireframes, prototypes, and design system creation',
      featureType: 'backend-only' as const,
      hasDatabase: true,
      databaseTables: ['wizards_sessions', 'wizards_tasks', 'wizards_artifacts'],
      hasApi: false,
      apiEndpoints: [],
      hasFrontend: false,
      frontendComponents: [],
      files: ['server/services/studios/wizards-experience-design.ts'],
    },
    {
      name: 'Studio 5 - Engineering Forge',
      description: 'Full-stack code generation for any technology stack (React, Vue, Angular, etc.)',
      featureType: 'backend-only' as const,
      hasDatabase: true,
      databaseTables: ['wizards_sessions', 'wizards_tasks', 'wizards_artifacts'],
      hasApi: false,
      apiEndpoints: [],
      hasFrontend: false,
      frontendComponents: [],
      files: ['server/services/studios/wizards-engineering-forge.ts'],
    },
    {
      name: 'Studio 6 - Data & ML Studio',
      description: 'Recommendation engines, predictive analytics, and AI feature development',
      featureType: 'backend-only' as const,
      hasDatabase: true,
      databaseTables: ['wizards_sessions', 'wizards_tasks', 'wizards_artifacts'],
      hasApi: false,
      apiEndpoints: [],
      hasFrontend: false,
      frontendComponents: [],
      files: ['server/services/studios/wizards-data-ml-studio.ts'],
    },
    {
      name: 'Studio 7 - Compliance Shield',
      description: 'GDPR, HIPAA, SOC2 compliance documentation, legal documents, and security audits',
      featureType: 'backend-only' as const,
      hasDatabase: true,
      databaseTables: ['wizards_sessions', 'wizards_tasks', 'wizards_artifacts'],
      hasApi: false,
      apiEndpoints: [],
      hasFrontend: false,
      frontendComponents: [],
      files: ['server/services/studios/wizards-compliance-shield.ts'],
    },
    {
      name: 'Studio 8 - Growth Studio',
      description: 'SEO optimization, content creation, marketing automation, and growth hacking',
      featureType: 'backend-only' as const,
      hasDatabase: true,
      databaseTables: ['wizards_sessions', 'wizards_tasks', 'wizards_artifacts'],
      hasApi: false,
      apiEndpoints: [],
      hasFrontend: false,
      frontendComponents: [],
      files: ['server/services/studios/wizards-growth-studio.ts'],
    },
    {
      name: 'Studio 9 - Launch Control',
      description: 'Deployment configuration, CI/CD pipelines, monitoring, and multi-cloud support',
      featureType: 'backend-only' as const,
      hasDatabase: true,
      databaseTables: ['wizards_sessions', 'wizards_tasks', 'wizards_artifacts'],
      hasApi: false,
      apiEndpoints: [],
      hasFrontend: false,
      frontendComponents: [],
      files: ['server/services/studios/wizards-launch-control.ts'],
    },
    {
      name: 'Studio 10 - Operations Cockpit',
      description: 'Analytics dashboards, customer success programs, optimization recommendations, and business reporting',
      featureType: 'backend-only' as const,
      hasDatabase: true,
      databaseTables: ['wizards_sessions', 'wizards_tasks', 'wizards_artifacts'],
      hasApi: false,
      apiEndpoints: [],
      hasFrontend: false,
      frontendComponents: [],
      files: ['server/services/studios/wizards-operations-cockpit.ts'],
    },

    // Industry Templates Service
    {
      name: 'Wizards Industry Templates Service',
      description: 'Pre-configured workflows for Fintech, Healthcare, E-commerce, and SaaS industries combining multiple studios',
      featureType: 'backend-only' as const,
      hasDatabase: true,
      databaseTables: ['wizards_sessions', 'wizards_tasks', 'wizards_artifacts'],
      hasApi: false,
      apiEndpoints: [],
      hasFrontend: false,
      frontendComponents: [],
      files: ['server/services/wizards-industry-templates.ts'],
    },
  ];

  let registered = 0;
  let skipped = 0;
  let errors = 0;

  for (const feature of features) {
    try {
      // Check if already registered
      const check = await codeDuplicationGuard.checkBeforeCreating(feature.name, []);
      
      if (check.existingFeatures.includes(feature.name)) {
        console.log(`⏭️  Skipped: ${feature.name} (already registered)`);
        skipped++;
        continue;
      }

      // Register feature
      await codeDuplicationGuard.registerFeature(feature);
      console.log(`✅ Registered: ${feature.name}`);
      registered++;
    } catch (error) {
      console.error(`❌ Error registering ${feature.name}:`, error);
      errors++;
    }
  }

  console.log('\n📊 Registration Summary:');
  console.log(`   ✅ Registered: ${registered}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📦 Total Features: ${features.length}\n`);

  if (errors > 0) {
    throw new Error(`Failed to register ${errors} features`);
  }

  console.log('🎉 Wizards Incubator Platform features registered successfully!\n');
}

// Export for use in initialization scripts
export const wizardsFeatureRegistration = {
  registerAllFeatures: registerWizardsIncubatorFeatures,
};
