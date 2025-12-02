/**
 * WAI SDK - Multi-Provider Example
 * 
 * Demonstrates using different LLM providers for different tasks
 */

import { OrchestrationFacade } from '@wizards-ai/wai-sdk';

async function main() {
  const facade = new OrchestrationFacade({
    studioId: 'multi-provider-demo',
    enableMonitoring: true,
    enableRetries: true,
  });

  console.log('🌐 WAI SDK - Multi-Provider Example\n');

  // Use Claude (Anthropic) for coding tasks
  console.log('1️⃣ Using Claude for code generation...');
  const claudeResult = await facade.executeWorkflow('code-generation', {
    prompt: 'Create a React hook for data fetching with loading states',
    language: 'typescript',
  }, {
    type: 'development',
    priority: 'high',
    preferredProviders: ['anthropic'],
  });

  console.log('✅ Claude generated:', claudeResult.result?.toString().substring(0, 100) + '...');
  console.log('   Model:', claudeResult.metadata?.model);
  console.log('   Cost: $' + (claudeResult.metadata?.cost || 0).toFixed(4));
  console.log();

  // Use GPT-4o for creative writing
  console.log('2️⃣ Using GPT-4o for creative writing...');
  const openaiResult = await facade.executeWorkflow('content-generation', {
    prompt: 'Write a compelling product tagline for an AI orchestration platform',
    style: 'creative',
  }, {
    type: 'creative',
    priority: 'normal',
    preferredProviders: ['openai'],
  });

  console.log('✅ GPT-4o generated:', openaiResult.result);
  console.log('   Model:', openaiResult.metadata?.model);
  console.log('   Cost: $' + (openaiResult.metadata?.cost || 0).toFixed(4));
  console.log();

  // Use Gemini for data analysis
  console.log('3️⃣ Using Gemini for analysis...');
  const geminiResult = await facade.executeWorkflow('analysis', {
    prompt: 'Compare the performance characteristics of React, Vue, and Svelte',
    depth: 'detailed',
  }, {
    type: 'analytical',
    priority: 'normal',
    preferredProviders: ['google'],
  });

  console.log('✅ Gemini analyzed:', geminiResult.result?.toString().substring(0, 150) + '...');
  console.log('   Model:', geminiResult.metadata?.model);
  console.log('   Cost: $' + (geminiResult.metadata?.cost || 0).toFixed(4));
  console.log();

  // Auto-select best provider (cost-optimized)
  console.log('4️⃣ Auto-selecting provider with cost optimization...');
  const autoResult = await facade.executeWorkflow('content-generation', {
    prompt: 'Summarize the benefits of microservices architecture',
    maxTokens: 200,
  }, {
    type: 'hybrid',
    priority: 'normal',
    costOptimization: true, // SDK will choose cheapest suitable provider
  });

  console.log('✅ Auto-selected provider:', autoResult.metadata?.provider);
  console.log('   Model:', autoResult.metadata?.model);
  console.log('   Cost: $' + (autoResult.metadata?.cost || 0).toFixed(4));
  console.log('   Content:', autoResult.result?.toString().substring(0, 100) + '...');
  console.log();

  // Calculate total cost
  const totalCost = 
    (claudeResult.metadata?.cost || 0) +
    (openaiResult.metadata?.cost || 0) +
    (geminiResult.metadata?.cost || 0) +
    (autoResult.metadata?.cost || 0);

  console.log('📊 Summary:');
  console.log('   Total operations: 4');
  console.log('   Providers used: Anthropic, OpenAI, Google, Auto');
  console.log('   Total cost: $' + totalCost.toFixed(4));
  console.log('\n✅ Multi-provider example completed!');
}

main().catch(console.error);
