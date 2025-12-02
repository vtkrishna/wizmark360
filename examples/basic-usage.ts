/**
 * WAI SDK - Basic Usage Example
 * 
 * Demonstrates simple workflow execution with OrchestrationFacade
 */

import { OrchestrationFacade } from '@wizards-ai/wai-sdk';

async function main() {
  // Initialize the orchestration facade
  const facade = new OrchestrationFacade({
    studioId: 'my-app',
    enableStreaming: false, // Disable for simple usage
    enableMonitoring: true,
    enableRetries: true,
  });

  console.log('🚀 WAI SDK - Basic Usage Example\n');

  // Example 1: Simple text generation
  console.log('Example 1: Content Generation');
  const result1 = await facade.executeWorkflow('content-generation', {
    prompt: 'Write a brief introduction to AI orchestration',
    maxTokens: 200,
  }, {
    type: 'creative',
    priority: 'normal',
    costOptimization: true,
  });

  console.log('Generated content:', result1.result);
  console.log('Cost: $' + (result1.metadata?.cost || 0).toFixed(4));
  console.log('Model:', result1.metadata?.model);
  console.log('Execution time:', result1.executionTimeMs + 'ms\n');

  // Example 2: Code generation
  console.log('Example 2: Code Generation');
  const result2 = await facade.executeWorkflow('code-generation', {
    prompt: 'Create a function that calculates factorial',
    language: 'typescript',
  }, {
    type: 'development',
    priority: 'high',
    preferredProviders: ['anthropic'], // Use Claude for coding
  });

  console.log('Generated code:', result2.result);
  console.log('Cost: $' + (result2.metadata?.cost || 0).toFixed(4));
  console.log('Model:', result2.metadata?.model);
  console.log('Execution time:', result2.executionTimeMs + 'ms\n');

  // Example 3: Analysis task
  console.log('Example 3: Data Analysis');
  const result3 = await facade.executeWorkflow('analysis', {
    prompt: 'Analyze the pros and cons of microservices architecture',
    depth: 'comprehensive',
  }, {
    type: 'analytical',
    priority: 'normal',
    qualityThreshold: 0.9,
  });

  console.log('Analysis:', result3.result);
  console.log('Cost: $' + (result3.metadata?.cost || 0).toFixed(4));
  console.log('Model:', result3.metadata?.model);
  console.log('Quality score:', result3.metadata?.qualityScore);
  console.log('Execution time:', result3.executionTimeMs + 'ms\n');

  console.log('✅ All examples completed successfully!');
}

main().catch(console.error);
