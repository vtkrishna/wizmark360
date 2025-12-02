/**
 * WAI SDK v1.0 - AG-UI Streaming Example
 * 
 * Demonstrates real-time streaming with AG-UI protocol
 */

import { WAIOrchestration, sharedAGUIService } from '../src';

async function streamingExample() {
  console.log('🚀 WAI SDK v1.0 - Streaming Example\n');
  
  const wai = new WAIOrchestration();
  
  // Create AG-UI session for real-time streaming
  const aguiSession = sharedAGUIService.createSession(1, 123, 'ideation_lab', 1);
  console.log('✅ AG-UI session created:', aguiSession.id, '\n');
  
  // Listen to real-time events
  sharedAGUIService.on(`event:${aguiSession.id}`, (event) => {
    console.log(`📡 [${event.type}]`, event.agentId || 'system');
    
    if (event.type === 'thinking') {
      console.log('   💭', event.description);
    }
    if (event.type === 'message') {
      console.log('   💬', event.content);
    }
    if (event.type === 'tool_call') {
      console.log('   🔧', event.toolName);
    }
  });
  
  // Execute with streaming
  console.log('📊 Executing with real-time streaming...\n');
  
  const result = await wai.execute({
    startupId: 1,
    sessionId: '123',
    jobType: 'generation',
    workflow: 'hierarchical',
    studioType: 'ideation_lab',
    agents: [],
    inputs: {
      task: 'Generate innovative startup ideas in the AI space',
    },
    priority: 'high',
    aguiSessionId: aguiSession.id,
  });
  
  console.log('\n✅ Streaming orchestration completed!');
  console.log('  Status:', result.status);
  console.log('  AG-UI Session:', aguiSession.id);
  
  // Close session
  sharedAGUIService.closeSession(aguiSession.id);
}

streamingExample().catch(console.error);
