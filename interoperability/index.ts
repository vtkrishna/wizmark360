/**
 * WAI v9.0 Interoperability Module
 * 
 * Unified export for all interoperability bridges and adapters
 */

export { 
  CrewAIBMADBridgeImpl as CrewAIBMADBridge,
  type CrewAIBMADBridge as ICrewAIBMADBridge,
  type CrewDefinition,
  type CrewAgent,
  type CrewWorkflow,
  type CrewCoordination,
  type CrewBMADResult,
  type InteroperabilityStatus,
  type InteroperabilityMetrics,
  type PerformanceMetrics
} from './crewai-bmad-bridge';

// Re-export external framework adapters for unified access
export {
  ExternalFrameworkManager,
  ROMAAdapter,
  ClaudeFlowAdapter,
  type ExternalFrameworkAdapter,
  type FrameworkCapability,
  type FrameworkTask,
  type FrameworkResult,
  type FrameworkStatus
} from '../adapters/external-framework-adapters';

export {
  OpenPipeARTAdapter
} from '../adapters/openpipe-art-adapter';

export {
  EigentAIAdapter
} from '../adapters/eigent-ai-adapter';

/**
 * Initialize complete interoperability system
 */
export async function initializeInteroperabilitySystem(
  crewAIService: any,
  bmadFramework: any,
  waiCore: any
): Promise<{
  crewBMADBridge: ICrewAIBMADBridge;
  externalFrameworkManager: ExternalFrameworkManager;
}> {
  console.log('🔗 Initializing WAI v9.0 Interoperability System...');
  
  // Initialize CrewAI/BMAD bridge
  const { CrewAIBMADBridge } = await import('./crewai-bmad-bridge');
  const crewBMADBridge = new CrewAIBMADBridge(crewAIService, bmadFramework, waiCore);
  await crewBMADBridge.initialize();
  
  // Initialize external framework manager
  const { ExternalFrameworkManager } = await import('../adapters/external-framework-adapters');
  const externalFrameworkManager = new ExternalFrameworkManager();
  await externalFrameworkManager.initialize(waiCore);
  
  console.log('✅ WAI v9.0 Interoperability System initialized successfully');
  
  return {
    crewBMADBridge,
    externalFrameworkManager
  };
}

export default {
  initializeInteroperabilitySystem
};