/**
 * Multi-Conversation Chat System
 * Replicates Manus/Replit.com style conversational project development
 */

import { WebSocket } from 'ws';
import { consolidatedServicesManager } from './consolidated-services-manager';
import { completeAgentRegistry } from './complete-agent-registry';
import { intelligentAgentOrchestrator } from './intelligent-agent-orchestrator';

export interface ConversationMessage {
  id: string;
  conversationId: string;
  userId: string;
  agentId?: string;
  content: string;
  type: 'user' | 'agent' | 'system' | 'feedback' | 'suggestion';
  timestamp: Date;
  metadata?: {
    projectId?: string;
    taskId?: string;
    artifacts?: string[];
    codeChanges?: CodeChange[];
    testResults?: TestResult[];
    feedbackType?: 'approval' | 'revision' | 'question';
  };
}

export interface CodeChange {
  file: string;
  action: 'create' | 'modify' | 'delete';
  content: string;
  lineStart?: number;
  lineEnd?: number;
  description: string;
}

export interface TestResult {
  test: string;
  status: 'passed' | 'failed' | 'pending';
  details?: string;
  duration?: number;
}

export interface ConversationState {
  id: string;
  userId: string;
  projectId: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  currentPhase: 'planning' | 'development' | 'testing' | 'review' | 'deployment';
  activeAgents: string[];
  context: {
    requirements: string[];
    technologies: string[];
    constraints: string[];
    previousDecisions: string[];
  };
  progress: {
    completedTasks: number;
    totalTasks: number;
    estimatedCompletion: Date;
    blockers: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMemory {
  projectId: string;
  conversationSummaries: string[];
  keyDecisions: string[];
  userPreferences: Record<string, any>;
  codebase: {
    structure: string[];
    technologies: string[];
    dependencies: string[];
  };
  testingStrategy: string;
  deploymentConfig: Record<string, any>;
}

export class MultiConversationChatSystem {
  private conversations: Map<string, ConversationState>;
  private messages: Map<string, ConversationMessage[]>;
  private websockets: Map<string, WebSocket>;
  private projectMemories: Map<string, ProjectMemory>;
  private activeStreamingTasks: Map<string, any>;

  constructor() {
    this.conversations = new Map();
    this.messages = new Map();
    this.websockets = new Map();
    this.projectMemories = new Map();
    this.activeStreamingTasks = new Map();
    
    console.log('🗣️ Multi-Conversation Chat System initialized');
  }

  /**
   * Create a new conversation for a project
   */
  async createConversation(userId: string, projectId: string, initialMessage: string): Promise<ConversationState> {
    const conversationId = `conv_${projectId}_${Date.now()}`;
    
    const conversation: ConversationState = {
      id: conversationId,
      userId,
      projectId,
      status: 'active',
      currentPhase: 'planning',
      activeAgents: ['senior-software-architect'],
      context: {
        requirements: [],
        technologies: [],
        constraints: [],
        previousDecisions: []
      },
      progress: {
        completedTasks: 0,
        totalTasks: 0,
        estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week estimate
        blockers: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.conversations.set(conversationId, conversation);
    this.messages.set(conversationId, []);

    // Add initial user message
    await this.addMessage(conversationId, {
      id: `msg_${Date.now()}`,
      conversationId,
      userId,
      content: initialMessage,
      type: 'user',
      timestamp: new Date()
    });

    // Generate initial response
    await this.processUserMessage(conversationId, initialMessage);

    return conversation;
  }

  /**
   * Process user message with intelligent agent response
   */
  async processUserMessage(conversationId: string, content: string): Promise<ConversationMessage[]> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    // Analyze message intent and select appropriate agents
    const messageAnalysis = await this.analyzeMessageIntent(content, conversation);
    
    // Update conversation context
    await this.updateConversationContext(conversation, messageAnalysis);

    // Generate agent responses based on message type
    const responses: ConversationMessage[] = [];

    switch (messageAnalysis.intent) {
      case 'project-initiation':
        responses.push(...await this.handleProjectInitiation(conversation, content));
        break;
      case 'feature-request':
        responses.push(...await this.handleFeatureRequest(conversation, content));
        break;
      case 'code-review':
        responses.push(...await this.handleCodeReview(conversation, content));
        break;
      case 'feedback-approval':
        responses.push(...await this.handleFeedbackApproval(conversation, content));
        break;
      case 'testing-request':
        responses.push(...await this.handleTestingRequest(conversation, content));
        break;
      case 'deployment-request':
        responses.push(...await this.handleDeploymentRequest(conversation, content));
        break;
      default:
        responses.push(...await this.handleGeneralQuery(conversation, content));
    }

    // Add responses to conversation
    for (const response of responses) {
      await this.addMessage(conversationId, response);
    }

    // Broadcast to connected websockets
    await this.broadcastToConversation(conversationId, responses);

    return responses;
  }

  /**
   * Handle different types of user intents
   */
  private async handleProjectInitiation(conversation: ConversationState, content: string): Promise<ConversationMessage[]> {
    const responses: ConversationMessage[] = [];

    // Architect provides initial analysis
    const architectAnalysis = await consolidatedServicesManager.processUnifiedRequest({
      type: 'analysis',
      data: { prompt: `Analyze this project request and provide a comprehensive technical assessment: ${content}` },
      userId: conversation.userId,
      context: { phase: 'project-initiation' }
    });

    const analysisResult = architectAnalysis.result?.response || architectAnalysis.result?.analysis || 
      'I\'ve analyzed your project requirements and I\'m ready to help you build a comprehensive solution.';

    responses.push({
      id: `msg_${Date.now()}`,
      conversationId: conversation.id,
      userId: conversation.userId,
      agentId: 'senior-software-architect',
      content: `I've analyzed your project requirements. Here's my assessment:\n\n${analysisResult}\n\nI recommend we start by defining the architecture and selecting the optimal technology stack. Would you like me to proceed with creating a detailed project plan?`,
      type: 'agent',
      timestamp: new Date(),
      metadata: {
        projectId: conversation.projectId,
        artifacts: ['technical-analysis.md']
      }
    });

    // Update conversation to development phase
    conversation.currentPhase = 'development';
    conversation.activeAgents = ['senior-software-architect', 'full-stack-developer'];

    return responses;
  }

  private async handleFeatureRequest(conversation: ConversationState, content: string): Promise<ConversationMessage[]> {
    const responses: ConversationMessage[] = [];

    // Select appropriate agents based on feature type
    const featureAnalysis = await this.analyzeFeatureRequest(content);
    const requiredAgents = await this.selectAgentsForFeature(featureAnalysis);

    for (const agentId of requiredAgents) {
      const agent = completeAgentRegistry.getAgent(agentId);
      if (!agent) continue;

      const agentResponse = await consolidatedServicesManager.processUnifiedRequest({
        type: 'task',
        data: { 
          prompt: `As a ${agent.name}, analyze and implement this feature request: ${content}`,
          agentRole: agent.name,
          capabilities: agent.specialties
        },
        userId: conversation.userId,
        context: { 
          phase: conversation.currentPhase,
          projectContext: this.getProjectContext(conversation.projectId)
        }
      });

      const responseContent = agentResponse.result?.response || 
        `As a ${agent.name}, I'm ready to work on this feature request. Let me analyze the requirements and provide implementation details.`;

      responses.push({
        id: `msg_${Date.now()}_${agentId}`,
        conversationId: conversation.id,
        userId: conversation.userId,
        agentId,
        content: responseContent,
        type: 'agent',
        timestamp: new Date(),
        metadata: {
          projectId: conversation.projectId,
          codeChanges: agentResponse.result?.codeChanges || [],
          artifacts: agentResponse.result?.artifacts || []
        }
      });
    }

    return responses;
  }

  private async handleCodeReview(conversation: ConversationState, content: string): Promise<ConversationMessage[]> {
    const responses: ConversationMessage[] = [];

    // QA agent reviews the code
    const reviewResult = await consolidatedServicesManager.processUnifiedRequest({
      type: 'analysis',
      data: { 
        prompt: `Conduct a comprehensive code review: ${content}`,
        analysisType: 'code-review'
      },
      userId: conversation.userId,
      context: { phase: 'review' }
    });

    responses.push({
      id: `msg_${Date.now()}`,
      conversationId: conversation.id,
      userId: conversation.userId,
      agentId: 'qa-automation-engineer',
      content: `I've completed the code review. Here are my findings:\n\n${reviewResult.result.analysis}\n\nShall I proceed with implementing the suggested improvements?`,
      type: 'agent',
      timestamp: new Date(),
      metadata: {
        projectId: conversation.projectId,
        feedbackType: 'revision'
      }
    });

    return responses;
  }

  private async handleFeedbackApproval(conversation: ConversationState, content: string): Promise<ConversationMessage[]> {
    const responses: ConversationMessage[] = [];

    if (content.toLowerCase().includes('approve') || content.toLowerCase().includes('looks good')) {
      // Move to next phase
      const nextPhase = this.getNextPhase(conversation.currentPhase);
      conversation.currentPhase = nextPhase;
      
      responses.push({
        id: `msg_${Date.now()}`,
        conversationId: conversation.id,
        userId: conversation.userId,
        agentId: 'hierarchical-coordinator',
        content: `Excellent! I'm moving us to the ${nextPhase} phase. The team will now focus on the next set of tasks.`,
        type: 'agent',
        timestamp: new Date()
      });

      // Orchestrate next phase tasks
      await this.orchestratePhaseTransition(conversation, nextPhase);
    }

    return responses;
  }

  private async handleTestingRequest(conversation: ConversationState, content: string): Promise<ConversationMessage[]> {
    const responses: ConversationMessage[] = [];

    const testResults = await consolidatedServicesManager.processUnifiedRequest({
      type: 'task',
      data: { 
        prompt: `Execute comprehensive testing: ${content}`,
        taskType: 'testing'
      },
      userId: conversation.userId,
      context: { phase: 'testing' }
    });

    responses.push({
      id: `msg_${Date.now()}`,
      conversationId: conversation.id,
      userId: conversation.userId,
      agentId: 'qa-automation-engineer',
      content: `Testing completed! Here are the results:\n\n${testResults.result.response}`,
      type: 'agent',
      timestamp: new Date(),
      metadata: {
        projectId: conversation.projectId,
        testResults: testResults.result.testResults || []
      }
    });

    return responses;
  }

  private async handleDeploymentRequest(conversation: ConversationState, content: string): Promise<ConversationMessage[]> {
    const responses: ConversationMessage[] = [];

    const deploymentResult = await consolidatedServicesManager.processUnifiedRequest({
      type: 'integration',
      data: { 
        prompt: `Prepare deployment configuration: ${content}`,
        provider: 'deployment'
      },
      userId: conversation.userId,
      context: { phase: 'deployment' }
    });

    responses.push({
      id: `msg_${Date.now()}`,
      conversationId: conversation.id,
      userId: conversation.userId,
      agentId: 'devops-specialist',
      content: `Deployment configuration ready! ${deploymentResult.result.response}\n\nReady to deploy when you give the approval.`,
      type: 'agent',
      timestamp: new Date(),
      metadata: {
        projectId: conversation.projectId,
        artifacts: ['deployment-config.yml', 'ci-cd-pipeline.yml']
      }
    });

    return responses;
  }

  private async handleGeneralQuery(conversation: ConversationState, content: string): Promise<ConversationMessage[]> {
    const responses: ConversationMessage[] = [];

    // Use real-time chat agent for general queries
    const chatResponse = await consolidatedServicesManager.processUnifiedRequest({
      type: 'task',
      data: { prompt: content },
      userId: conversation.userId,
      context: { 
        conversationType: 'general',
        projectContext: this.getProjectContext(conversation.projectId)
      }
    });

    responses.push({
      id: `msg_${Date.now()}`,
      conversationId: conversation.id,
      userId: conversation.userId,
      agentId: 'real-time-chat-agent',
      content: chatResponse.result.response,
      type: 'agent',
      timestamp: new Date()
    });

    return responses;
  }

  /**
   * Connect WebSocket for real-time conversation updates
   */
  connectWebSocket(conversationId: string, ws: WebSocket) {
    this.websockets.set(conversationId, ws);
    
    ws.on('close', () => {
      this.websockets.delete(conversationId);
    });

    // Send conversation history
    const messages = this.messages.get(conversationId) || [];
    ws.send(JSON.stringify({
      type: 'conversation-history',
      data: messages
    }));
  }

  /**
   * Broadcast messages to connected clients
   */
  private async broadcastToConversation(conversationId: string, messages: ConversationMessage[]) {
    const ws = this.websockets.get(conversationId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'new-messages',
        data: messages
      }));
    }
  }

  /**
   * Helper methods
   */
  private async addMessage(conversationId: string, message: ConversationMessage) {
    const messages = this.messages.get(conversationId) || [];
    messages.push(message);
    this.messages.set(conversationId, messages);
  }

  private async analyzeMessageIntent(content: string, conversation: ConversationState): Promise<any> {
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('create') || contentLower.includes('build') || contentLower.includes('develop')) {
      return { intent: 'project-initiation', confidence: 0.9 };
    }
    if (contentLower.includes('add') || contentLower.includes('feature') || contentLower.includes('implement')) {
      return { intent: 'feature-request', confidence: 0.85 };
    }
    if (contentLower.includes('review') || contentLower.includes('check') || contentLower.includes('look at')) {
      return { intent: 'code-review', confidence: 0.8 };
    }
    if (contentLower.includes('approve') || contentLower.includes('good') || contentLower.includes('proceed')) {
      return { intent: 'feedback-approval', confidence: 0.9 };
    }
    if (contentLower.includes('test') || contentLower.includes('verify') || contentLower.includes('validate')) {
      return { intent: 'testing-request', confidence: 0.85 };
    }
    if (contentLower.includes('deploy') || contentLower.includes('publish') || contentLower.includes('release')) {
      return { intent: 'deployment-request', confidence: 0.9 };
    }
    
    return { intent: 'general-query', confidence: 0.5 };
  }

  private async updateConversationContext(conversation: ConversationState, analysis: any) {
    conversation.updatedAt = new Date();
    this.conversations.set(conversation.id, conversation);
  }

  private async analyzeFeatureRequest(content: string): Promise<any> {
    // Analyze what type of feature is being requested
    return {
      type: 'feature',
      complexity: 'medium',
      domains: ['frontend', 'backend'],
      technologies: []
    };
  }

  private async selectAgentsForFeature(analysis: any): Promise<string[]> {
    // Select appropriate agents based on feature analysis
    return ['full-stack-developer', 'ui-ux-designer'];
  }

  private getProjectContext(projectId: string): any {
    return this.projectMemories.get(projectId) || {};
  }

  private getNextPhase(currentPhase: string): ConversationState['currentPhase'] {
    const phases: ConversationState['currentPhase'][] = ['planning', 'development', 'testing', 'review', 'deployment'];
    const currentIndex = phases.indexOf(currentPhase);
    return phases[Math.min(currentIndex + 1, phases.length - 1)];
  }

  private async orchestratePhaseTransition(conversation: ConversationState, nextPhase: string) {
    // Orchestrate tasks for the next phase
    const orchestrationResult = await intelligentAgentOrchestrator.orchestrateTask(
      `Transition project to ${nextPhase} phase`,
      conversation.userId,
      { projectId: conversation.projectId, phase: nextPhase }
    );
    
    conversation.activeAgents = [orchestrationResult.selectedAgent];
  }

  /**
   * Get conversation statistics and health
   */
  getConversationStats() {
    return {
      totalConversations: this.conversations.size,
      activeConversations: Array.from(this.conversations.values()).filter(c => c.status === 'active').length,
      totalMessages: Array.from(this.messages.values()).reduce((sum, msgs) => sum + msgs.length, 0),
      connectedWebSockets: this.websockets.size,
      conversationsByPhase: this.getConversationsByPhase()
    };
  }

  private getConversationsByPhase() {
    const phases = {};
    this.conversations.forEach(conv => {
      phases[conv.currentPhase] = (phases[conv.currentPhase] || 0) + 1;
    });
    return phases;
  }

  /**
   * Archive completed conversations
   */
  async archiveConversation(conversationId: string) {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.status = 'archived';
      this.conversations.set(conversationId, conversation);
    }
  }

  /**
   * Export conversation for analysis
   */
  exportConversation(conversationId: string) {
    return {
      conversation: this.conversations.get(conversationId),
      messages: this.messages.get(conversationId) || []
    };
  }
}

export const multiConversationChatSystem = new MultiConversationChatSystem();