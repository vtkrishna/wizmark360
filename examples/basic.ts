/**
 * WAI SDK v1.0 - Basic Usage Example
 * 
 * This example demonstrates simple orchestration execution
 */

import { WAIOrchestration } from '../src';

async function basicExample() {
  console.log('🚀 WAI SDK v1.0 - Basic Example\n');
  
  // Initialize WAI SDK
  const wai = new WAIOrchestration({
    providers: {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GEMINI_API_KEY,
    },
  });
  
  console.log('✅ WAI SDK initialized\n');
  
  // Execute simple orchestration
  console.log('📊 Executing: Analyze startup idea...');
  
  const result = await wai.execute({
    startupId: 1,
    sessionId: 'example-session',
    jobType: 'analysis',
    workflow: 'sequential',
    agents: ['business_strategist', 'market_researcher'],
    inputs: {
      task: 'Analyze this AI-powered productivity tool for remote teams',
      idea: 'An AI assistant that helps remote teams stay productive',
      targetMarket: 'Remote software teams',
    },
    priority: 'high',
  });
  
  console.log('\n✅ Orchestration completed!\n');
  console.log('📈 Results:');
  console.log('  Status:', result.status);
  console.log('  Agents Used:', result.agentsUsed.length);
  console.log('  Cost: $', result.cost?.toFixed(4) || '0.0000');
  console.log('  Duration:', result.duration, 'ms');
  console.log('\n📝 Output:');
  console.log(JSON.stringify(result.outputs, null, 2));
}

// Run example
basicExample().catch(console.error);
