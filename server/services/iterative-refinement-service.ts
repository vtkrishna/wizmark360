
import { EventEmitter } from 'events';
import { storage } from '../storage';
import { waiOrchestrationV3Service } from './unified-orchestration-client'
import { enhancedPromptOrchestration } from './enhanced-prompt-orchestration';

interface RefinementSession {
  id: string;
  userId: number;
  originalPrompt: string;
  currentPrompt: string;
  type: 'content' | 'software' | 'game';
  iterations: RefinementIteration[];
  status: 'active' | 'completed' | 'paused';
  context: any;
  createdAt: Date;
  updatedAt: Date;
}

interface RefinementIteration {
  id: string;
  prompt: string;
  enhancedPrompt: string;
  output: any;
  userFeedback?: UserFeedback;
  agentSuggestions?: string[];
  timestamp: Date;
  cost: number;
  quality: number;
}

interface UserFeedback {
  satisfaction: number; // 1-10
  specificIssues: string[];
  desiredChanges: string[];
  additionalRequirements: string[];
  conversationNotes: string[];
}

interface ConversationContext {
  messages: ConversationMessage[];
  agentPersonality: string;
  userPreferences: any;
  projectContext: any;
}

interface ConversationMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export class IterativeRefinementService extends EventEmitter {
  private activeSessions: Map<string, RefinementSession> = new Map();
  private conversationContexts: Map<string, ConversationContext> = new Map();

  constructor() {
    super();
  }

  /**
   * Start a new refinement session
   */
  async startRefinementSession(
    userId: number,
    originalPrompt: string,
    type: 'content' | 'software' | 'game',
    context: any = {}
  ): Promise<RefinementSession> {
    const sessionId = `refinement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Enhance the initial prompt
    const enhancedResult = await enhancedPromptOrchestration.enhancePrompt({
      originalPrompt,
      taskType: type,
      complexity: 'moderate',
      component: 'iterative-refinement',
      userId,
      context
    });

    // Generate initial output
    const initialOutput = await this.generateOutput(enhancedResult.enhanced, type, context);

    const iteration: RefinementIteration = {
      id: `iter_${Date.now()}`,
      prompt: originalPrompt,
      enhancedPrompt: enhancedResult.enhanced,
      output: initialOutput,
      timestamp: new Date(),
      cost: initialOutput.cost || 0,
      quality: initialOutput.quality || 0.8
    };

    const session: RefinementSession = {
      id: sessionId,
      userId,
      originalPrompt,
      currentPrompt: originalPrompt,
      type,
      iterations: [iteration],
      status: 'active',
      context,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.activeSessions.set(sessionId, session);
    
    // Initialize conversation context
    this.conversationContexts.set(sessionId, {
      messages: [
        {
          role: 'system',
          content: this.getSystemPromptForType(type),
          timestamp: new Date()
        },
        {
          role: 'agent',
          content: `I've generated your ${type} based on your requirements. How does this look? Feel free to provide specific feedback or ask for modifications.`,
          timestamp: new Date()
        }
      ],
      agentPersonality: this.getAgentPersonalityForType(type),
      userPreferences: context.userPreferences || {},
      projectContext: context
    });

    this.emit('session:started', { sessionId, userId, type });
    
    return session;
  }

  /**
   * Add user feedback and generate refined version
   */
  async addUserFeedback(
    sessionId: string,
    feedback: UserFeedback,
    conversationMessage?: string
  ): Promise<RefinementIteration> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Refinement session not found');
    }

    const conversationContext = this.conversationContexts.get(sessionId);
    if (!conversationContext) {
      throw new Error('Conversation context not found');
    }

    // Add user message to conversation
    if (conversationMessage) {
      conversationContext.messages.push({
        role: 'user',
        content: conversationMessage,
        timestamp: new Date(),
        metadata: { feedback }
      });
    }

    // Update the last iteration with feedback
    const lastIteration = session.iterations[session.iterations.length - 1];
    lastIteration.userFeedback = feedback;

    // Generate refined prompt based on feedback and conversation
    const refinedPrompt = await this.generateRefinedPrompt(
      session,
      feedback,
      conversationContext
    );

    // Enhance the refined prompt
    const enhancedResult = await enhancedPromptOrchestration.enhancePrompt({
      originalPrompt: refinedPrompt,
      taskType: session.type,
      complexity: 'moderate',
      component: 'iterative-refinement',
      userId: session.userId,
      context: {
        ...session.context,
        previousIterations: session.iterations,
        userFeedback: feedback
      }
    });

    // Generate new output
    const newOutput = await this.generateOutput(
      enhancedResult.enhanced,
      session.type,
      {
        ...session.context,
        refinementContext: {
          previousOutput: lastIteration.output,
          userFeedback: feedback,
          iterationNumber: session.iterations.length + 1
        }
      }
    );

    // Create new iteration
    const newIteration: RefinementIteration = {
      id: `iter_${Date.now()}`,
      prompt: refinedPrompt,
      enhancedPrompt: enhancedResult.enhanced,
      output: newOutput,
      agentSuggestions: enhancedResult.recommendations || [],
      timestamp: new Date(),
      cost: newOutput.cost || 0,
      quality: newOutput.quality || 0.8
    };

    session.iterations.push(newIteration);
    session.currentPrompt = refinedPrompt;
    session.updatedAt = new Date();

    // Add agent response to conversation
    conversationContext.messages.push({
      role: 'agent',
      content: this.generateAgentResponse(feedback, newIteration, session.type),
      timestamp: new Date(),
      metadata: { iteration: newIteration.id }
    });

    this.emit('iteration:created', { sessionId, iteration: newIteration });
    
    return newIteration;
  }

  /**
   * Handle conversational interaction
   */
  async handleConversation(
    sessionId: string,
    userMessage: string
  ): Promise<string> {
    const session = this.activeSessions.get(sessionId);
    const conversationContext = this.conversationContexts.get(sessionId);
    
    if (!session || !conversationContext) {
      throw new Error('Session or conversation context not found');
    }

    // Add user message
    conversationContext.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    // Generate contextual agent response
    const agentResponse = await this.generateContextualAgentResponse(
      userMessage,
      session,
      conversationContext
    );

    // Add agent response
    conversationContext.messages.push({
      role: 'agent',
      content: agentResponse,
      timestamp: new Date()
    });

    this.emit('conversation:message', { sessionId, userMessage, agentResponse });

    return agentResponse;
  }

  /**
   * Get conversation history for a session
   */
  getConversationHistory(sessionId: string): ConversationMessage[] {
    const conversationContext = this.conversationContexts.get(sessionId);
    return conversationContext?.messages || [];
  }

  /**
   * Get session details with all iterations
   */
  getSessionDetails(sessionId: string): RefinementSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Compare iterations side by side
   */
  compareIterations(
    sessionId: string,
    iteration1Id: string,
    iteration2Id: string
  ): { comparison: any; recommendations: string[] } {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const iter1 = session.iterations.find(i => i.id === iteration1Id);
    const iter2 = session.iterations.find(i => i.id === iteration2Id);

    if (!iter1 || !iter2) {
      throw new Error('One or both iterations not found');
    }

    const comparison = {
      prompts: {
        iteration1: iter1.prompt,
        iteration2: iter2.prompt,
        changes: this.analyzePromptChanges(iter1.prompt, iter2.prompt)
      },
      outputs: {
        iteration1: iter1.output,
        iteration2: iter2.output,
        improvements: this.analyzeOutputChanges(iter1.output, iter2.output)
      },
      metrics: {
        qualityImprovement: iter2.quality - iter1.quality,
        costDifference: iter2.cost - iter1.cost,
        timestamp: {
          iteration1: iter1.timestamp,
          iteration2: iter2.timestamp
        }
      }
    };

    const recommendations = this.generateComparisonRecommendations(comparison, session.type);

    return { comparison, recommendations };
  }

  /**
   * Private helper methods
   */
  private async generateOutput(prompt: string, type: string, context: any): Promise<any> {
    try {
      switch (type) {
        case 'content':
          return await this.generateContentOutput(prompt, context);
        case 'software':
          return await this.generateSoftwareOutput(prompt, context);
        case 'game':
          return await this.generateGameOutput(prompt, context);
        default:
          throw new Error(`Unsupported generation type: ${type}`);
      }
    } catch (error) {
      console.error('Output generation failed:', error);
      return {
        error: error.message,
        fallback: `Generated ${type} content for: ${prompt.substring(0, 100)}...`,
        cost: 0.01,
        quality: 0.3
      };
    }
  }

  private async generateContentOutput(prompt: string, context: any): Promise<any> {
    // Use WAI content generation
    const result = await waiOrchestrationV3Service.generateContent({
      prompt,
      type: context.contentType || 'text',
      agent: 'content_creator',
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
      options: context
    });

    return {
      content: result.content,
      type: result.type,
      metadata: result.metadata,
      cost: result.cost || 0.05,
      quality: result.quality || 0.85
    };
  }

  private async generateSoftwareOutput(prompt: string, context: any): Promise<any> {
    // Use WAI software development orchestration
    const result = await waiOrchestrationV3Service.executeTask({
      agentId: 'fullstack_developer',
      task: 'generate_application',
      parameters: {
        requirements: prompt,
        context,
        refinementContext: context.refinementContext
      },
      priority: 'high',
      projectId: context.projectId || `refinement_${Date.now()}`
    });

    return {
      code: result.data?.code || `// Generated code for: ${prompt}`,
      architecture: result.data?.architecture || 'Standard web application architecture',
      features: result.data?.features || ['Core functionality', 'User interface', 'Database integration'],
      deployment: result.data?.deployment || 'Cloud-ready deployment configuration',
      cost: result.cost || 0.15,
      quality: result.quality || 0.88
    };
  }

  private async generateGameOutput(prompt: string, context: any): Promise<any> {
    // Use WAI game development orchestration
    const result = await waiOrchestrationV3Service.executeTask({
      agentId: 'game_developer',
      task: 'generate_game',
      parameters: {
        gameDescription: prompt,
        context,
        refinementContext: context.refinementContext
      },
      priority: 'high',
      projectId: context.projectId || `game_refinement_${Date.now()}`
    });

    return {
      gameCode: result.data?.gameCode || `// Generated game for: ${prompt}`,
      assets: result.data?.assets || ['Sprites', 'Sounds', 'Animations'],
      mechanics: result.data?.mechanics || ['Player movement', 'Game logic', 'Scoring system'],
      levels: result.data?.levels || ['Level 1 design'],
      cost: result.cost || 0.20,
      quality: result.quality || 0.82
    };
  }

  private async generateRefinedPrompt(
    session: RefinementSession,
    feedback: UserFeedback,
    conversationContext: ConversationContext
  ): Promise<string> {
    const lastIteration = session.iterations[session.iterations.length - 1];
    
    const refinementPrompt = `
Based on the user feedback and conversation history, refine this ${session.type} generation prompt:

Original Prompt: ${session.originalPrompt}
Current Prompt: ${lastIteration.prompt}

User Feedback:
- Satisfaction Level: ${feedback.satisfaction}/10
- Specific Issues: ${feedback.specificIssues.join(', ')}
- Desired Changes: ${feedback.desiredChanges.join(', ')}
- Additional Requirements: ${feedback.additionalRequirements.join(', ')}

Conversation Context: ${conversationContext.messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

Generate an improved prompt that addresses the user's concerns and incorporates their feedback.
`;

    try {
      const result = await waiOrchestrationV3Service.executeTask({
        agentId: 'prompt_enhancer',
        task: 'refine_prompt',
        parameters: {
          refinementPrompt,
          originalContext: session.context,
          feedback
        },
        priority: 'high',
        projectId: session.id
      });

      return result.data?.refinedPrompt || lastIteration.prompt;
    } catch (error) {
      console.error('Prompt refinement failed:', error);
      return lastIteration.prompt;
    }
  }

  private async generateContextualAgentResponse(
    userMessage: string,
    session: RefinementSession,
    conversationContext: ConversationContext
  ): Promise<string> {
    const responsePrompt = `
You are a specialized ${session.type} generation assistant with the following personality: ${conversationContext.agentPersonality}

User just said: "${userMessage}"

Conversation history:
${conversationContext.messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

Current project context:
- Type: ${session.type}
- Iterations: ${session.iterations.length}
- Status: ${session.status}

Respond helpfully and contextually to the user's message. If they're asking for changes, guide them on how to provide specific feedback.
`;

    try {
      const result = await waiOrchestrationV3Service.executeTask({
        agentId: this.getAgentIdForType(session.type),
        task: 'generate_response',
        parameters: {
          prompt: responsePrompt,
          context: conversationContext
        },
        priority: 'medium',
        projectId: session.id
      });

      return result.data?.response || "I understand. Could you provide more specific details about what you'd like to change?";
    } catch (error) {
      console.error('Agent response generation failed:', error);
      return "I'm here to help! Could you tell me more about what you'd like to improve?";
    }
  }

  private getSystemPromptForType(type: string): string {
    switch (type) {
      case 'content':
        return 'You are a creative content generation assistant focused on helping users create and refine multimedia content.';
      case 'software':
        return 'You are a software development assistant specializing in helping users build and iterate on software projects.';
      case 'game':
        return 'You are a game development assistant focused on creating engaging and fun game experiences.';
      default:
        return 'You are a helpful AI assistant focused on iterative creation and refinement.';
    }
  }

  private getAgentPersonalityForType(type: string): string {
    switch (type) {
      case 'content':
        return 'Creative, enthusiastic, detail-oriented, and collaborative';
      case 'software':
        return 'Technical, methodical, solution-focused, and patient';
      case 'game':
        return 'Playful, innovative, user-experience focused, and engaging';
      default:
        return 'Helpful, adaptive, and user-focused';
    }
  }

  private getAgentIdForType(type: string): string {
    switch (type) {
      case 'content':
        return 'content_creator';
      case 'software':
        return 'fullstack_developer';
      case 'game':
        return 'game_developer';
      default:
        return 'general_assistant';
    }
  }

  private generateAgentResponse(feedback: UserFeedback, iteration: RefinementIteration, type: string): string {
    const satisfactionLevel = feedback.satisfaction;
    
    if (satisfactionLevel >= 8) {
      return `Great! I'm glad you're happy with this iteration. I've made the refinements you requested. The new version addresses your feedback while maintaining the quality of the ${type}.`;
    } else if (satisfactionLevel >= 6) {
      return `I've created a new version based on your feedback. I focused on ${feedback.desiredChanges.slice(0, 2).join(' and ')}. How does this look now?`;
    } else {
      return `I understand there are several areas that need improvement. I've completely reworked the ${type} to address: ${feedback.specificIssues.join(', ')}. This should be much closer to what you're looking for.`;
    }
  }

  private analyzePromptChanges(prompt1: string, prompt2: string): string[] {
    const changes = [];
    if (prompt2.length > prompt1.length * 1.2) {
      changes.push('Significantly expanded requirements');
    }
    if (prompt2.includes('fix') || prompt2.includes('improve')) {
      changes.push('Added improvement instructions');
    }
    if (prompt2.includes('remove') || prompt2.includes('delete')) {
      changes.push('Added removal instructions');
    }
    return changes;
  }

  private analyzeOutputChanges(output1: any, output2: any): string[] {
    const improvements = [];
    if (output2.quality > output1.quality) {
      improvements.push('Quality improved');
    }
    if (output2.cost < output1.cost) {
      improvements.push('Cost optimized');
    }
    return improvements;
  }

  private generateComparisonRecommendations(comparison: any, type: string): string[] {
    const recommendations = [];
    
    if (comparison.metrics.qualityImprovement > 0.1) {
      recommendations.push('This iteration shows significant quality improvement');
    }
    
    if (comparison.metrics.costDifference > 0) {
      recommendations.push('Consider the cost increase - evaluate if the improvements justify the expense');
    }
    
    recommendations.push(`Continue iterating to refine the ${type} further`);
    
    return recommendations;
  }
}

export const iterativeRefinementService = new IterativeRefinementService();
