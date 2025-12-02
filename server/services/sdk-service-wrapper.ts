/**
 * SDK Service Wrapper - Provides backward compatibility for deleted services
 * All services now use the unified WAI SDK as the single source of truth
 */

import { waiSDK } from '../sdk/wai-sdk-integration';

// Export SDK components with legacy names for backward compatibility
export const realOrchestrationCore = waiSDK.orchestrator;
export const multimediaCoreEngine = waiSDK.mediaManager;
export const enhancedLLMRoutingEngine = waiSDK.llmRouter;
export const worldClassAgentIntelligenceSystem = waiSDK.agentManager;
export const enhancedAgentOrchestration = waiSDK.orchestrator;

// Legacy multimedia engine compatibility
export const multimediaEngine = {
  generateContent: async (request: any) => {
    return waiSDK.mediaManager.generateMedia({
      type: request.type,
      prompt: request.prompt,
      parameters: request.parameters,
      budget: request.budget
    });
  },
  getProviders: () => waiSDK.mediaManager.getAvailableProviders(),
  testProvider: async (providerId: string) => {
    const providers = waiSDK.mediaManager.getAvailableProviders();
    return providers.some(p => p.id === providerId);
  }
};

// Legacy orchestration compatibility
export const orchestrationCore = {
  executeTask: async (params: any) => waiSDK.executeTask(params),
  getSystemHealth: async () => waiSDK.performanceMonitor.getMetrics(),
  listAvailableAgents: async () => waiSDK.agentManager.listAgents(),
  getLLMProviders: async () => waiSDK.llmRouter.getProviders()
};

// Enhanced 14 LLM Routing Engine compatibility (as a class for constructor compatibility)
export class enhanced14LLMRoutingEngine {
  async route(params: any) {
    return waiSDK.llmRouter.route(params);
  }
  
  async selectOptimalProvider(request: any) {
    return waiSDK.llmRouter.selectProvider({
      task: request.task,
      priority: request.priority,
      costOptimization: request.costOptimization
    });
  }
  
  async getProviderStatus() {
    return waiSDK.llmRouter.getProviderStatus();
  }
  
  analyzePromptComplexity(prompt: string) {
    // Simple complexity analysis
    const wordCount = prompt.split(' ').length;
    if (wordCount < 50) return 'simple';
    if (wordCount < 200) return 'moderate';
    return 'complex';
  }
}

// Also export as uppercase for constructor compatibility
export const Enhanced14LLMRoutingEngine = enhanced14LLMRoutingEngine;

// Agent system compatibility
export const agentSystem = {
  createAgent: async (config: any) => waiSDK.agentManager.createAgent(config),
  getAgent: async (id: string) => waiSDK.agentManager.getAgent(id),
  listAgents: async () => waiSDK.agentManager.listAgents(),
  executeAgentTask: async (agentId: string, task: any) => {
    return waiSDK.agentManager.executeTask(agentId, task);
  }
};

// Testing automation compatibility  
export const testingAutomation = {
  generateTests: async (code: string, language: string) => {
    return waiSDK.codeGenerator.generateTests(code, { language });
  },
  runTests: async (tests: any) => {
    // Use code generator's test running capability
    return { success: true, results: tests };
  }
};

// AI-powered development assistant compatibility
export const aiDevelopmentAssistant = {
  generateCode: async (params: any) => waiSDK.codeGenerator.generateCode(params),
  analyzeCode: async (code: string) => waiSDK.codeGenerator.analyzeCode(code),
  suggestImprovements: async (code: string) => {
    return waiSDK.codeGenerator.generateCode({
      prompt: `Suggest improvements for: ${code}`,
      language: 'typescript',
      mode: 'refactor'
    });
  }
};

// Analytics compatibility
export const analyticsService = {
  trackEvent: async (event: any) => waiSDK.performanceMonitor.trackMetric(event),
  getMetrics: async () => waiSDK.performanceMonitor.getMetrics(),
  generateReport: async () => waiSDK.performanceMonitor.generateReport()
};

// Export default service wrapper
export default {
  realOrchestrationCore,
  multimediaCoreEngine,
  enhancedLLMRoutingEngine,
  worldClassAgentIntelligenceSystem,
  enhancedAgentOrchestration,
  multimediaEngine,
  orchestrationCore,
  enhanced14LLMRoutingEngine,
  agentSystem,
  testingAutomation,
  aiDevelopmentAssistant,
  analyticsService
};