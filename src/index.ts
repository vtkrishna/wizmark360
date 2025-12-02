/**
 * WAI SDK v1.0 - Main Export
 * Enterprise AI Orchestration System
 */

// Core Services
export { RealLLMService } from './services/real-llm-service';
export { WizardsOrchestrationService } from './services/wizards-orchestration-service';
export { AGUIWAIIntegrationService } from './services/agui-wai-integration-service';
export { sharedAGUIService } from './services/shared-agui-service';

// Orchestration Core
export { default as WAIOrchestrationCoreV9 } from './orchestration/wai-orchestration-core-v9';

// Utilities
export { WAIRequestBuilder } from './builders/wai-request-builder';
export { createClockProvider } from './utils/clock-provider';

// Types
export type {
  OrchestrationRequest,
  OrchestrationResult,
  OrchestrationJobType,
  OrchestrationWorkflow,
} from './types/orchestration-types';

export type {
  AGUIEvent,
  AGUIMessageEvent,
  AGUIThinkingEvent,
  AGUIToolCallEvent,
  AGUIStreamSession,
  AGUIStreamOptions,
} from './types/agui-event-types';

// Main WAI Orchestration Class (Convenience wrapper)
export class WAIOrchestration {
  private orchestrationService: any;
  
  constructor(config?: any) {
    this.orchestrationService = new WizardsOrchestrationService();
  }
  
  async execute(request: any) {
    return this.orchestrationService.executeOrchestrationJob(request);
  }
  
  async getSystemHealth() {
    return this.orchestrationService.getSystemHealth();
  }
  
  async getAvailableAgents() {
    return this.orchestrationService.getAvailableAgents();
  }
  
  async getAvailableProviders() {
    return this.orchestrationService.getAvailableProviders();
  }
}

// Convenience exports
export const createWAI = (config?: any) => new WAIOrchestration(config);

console.log('✅ WAI SDK v1.0 loaded successfully');
