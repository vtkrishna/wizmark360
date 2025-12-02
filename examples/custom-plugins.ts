/**
 * WAI SDK - Custom Plugin Example
 * 
 * Demonstrates creating and registering custom orchestration plugins
 */

import {
  OrchestrationFacade,
  UnifiedRoutingRegistry,
  type IRoutingPlugin,
  type PluginContext,
} from '@wizards-ai/wai-sdk';
import type { WAIOrchestrationRequestInput } from '@wizards-ai/wai-sdk';
import type { OrchestrationResult } from '@wizards-ai/wai-sdk';

// Custom plugin: Request Logger
const requestLoggerPlugin: IRoutingPlugin = {
  id: 'request-logger',
  name: 'Request Logger',
  description: 'Logs all orchestration requests for debugging',
  
  onPreOrchestration: async (request: WAIOrchestrationRequestInput, context: PluginContext) => {
    console.log('📝 [Request Logger] Pre-orchestration hook');
    console.log('   Request ID:', context.requestId);
    console.log('   Workflow:', context.workflowName);
    console.log('   Type:', request.orchestrationType);
    console.log('   Priority:', request.priority);
    
    return request;
  },
  
  onPostOrchestration: async (
    request: WAIOrchestrationRequestInput,
    result: OrchestrationResult,
    context: PluginContext
  ) => {
    console.log('✅ [Request Logger] Post-orchestration hook');
    console.log('   Success:', result.success);
    console.log('   Execution time:', result.executionTimeMs + 'ms');
    console.log('   Cost:', '$' + (result.metadata?.cost || 0).toFixed(4));
    
    return result;
  },
};

// Custom plugin: Cost Tracker
const costTrackerPlugin: IRoutingPlugin = {
  id: 'cost-tracker',
  name: 'Cost Tracker',
  description: 'Tracks cumulative orchestration costs',
  
  onPostOrchestration: async (
    request: WAIOrchestrationRequestInput,
    result: OrchestrationResult,
    context: PluginContext
  ) => {
    const cost = result.metadata?.cost || 0;
    
    // In production, you'd persist this to a database
    console.log('💰 [Cost Tracker] Operation cost: $' + cost.toFixed(4));
    
    // Add cost tracking metadata
    return {
      ...result,
      metadata: {
        ...result.metadata,
        costTracked: true,
        trackingTimestamp: new Date().toISOString(),
      },
    };
  },
};

// Custom plugin: Request Enhancer
const requestEnhancerPlugin: IRoutingPlugin = {
  id: 'request-enhancer',
  name: 'Request Enhancer',
  description: 'Enhances requests with additional context',
  
  onPreOrchestration: async (request: WAIOrchestrationRequestInput, context: PluginContext) => {
    // Add custom metadata to all requests
    return {
      ...request,
      context: {
        ...request.context,
        enhanced: true,
        enhancedAt: new Date().toISOString(),
        appVersion: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
    };
  },
};

async function main() {
  console.log('🔌 WAI SDK - Custom Plugin Example\n');

  // Create registry and register plugins
  const registry = new UnifiedRoutingRegistry();
  
  console.log('Registering plugins...');
  registry.registerPlugin('request-logger', requestLoggerPlugin, {
    priority: 100, // High priority - runs first
    enabled: true,
  });
  
  registry.registerPlugin('cost-tracker', costTrackerPlugin, {
    priority: 50, // Medium priority
    enabled: true,
  });
  
  registry.registerPlugin('request-enhancer', requestEnhancerPlugin, {
    priority: 75, // Medium-high priority
    enabled: true,
  });
  
  console.log('✅ Registered 3 custom plugins\n');

  // Initialize facade (plugins will be used automatically via global registry)
  const facade = new OrchestrationFacade({
    studioId: 'plugin-example',
    enableMonitoring: true,
  });

  // Execute a workflow - plugins will intercept automatically
  console.log('Executing workflow with custom plugins...\n');
  
  const result = await facade.executeWorkflow('content-generation', {
    prompt: 'Explain quantum computing in simple terms',
    maxTokens: 150,
  }, {
    type: 'creative',
    priority: 'high',
  });

  console.log('\n📊 Final Result:');
  console.log('Content:', result.result);
  console.log('Enhanced metadata:', result.metadata);
  
  console.log('\n✅ Plugin example completed!');
}

main().catch(console.error);
