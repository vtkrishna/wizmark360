
/**
 * Multi-Agent Conversation System
 * Advanced agent collaboration with consensus building and iterative refinement
 */

import { EventEmitter } from 'events';
import { enhanced14LLMRouter } from './enhanced-14-llm-routing-engine';
import { crewAIOrchestrator } from './crewai-orchestrator';

export interface ConversationAgent {
  id: string;
  name: string;
  role: string;
  personality: AgentPersonality;
  specialization: string[];
  decisionWeight: number;
  canDelegate: boolean;
  canVeto: boolean;
}

export interface AgentPersonality {
  traits: string[];
  communicationStyle: 'analytical' | 'creative' | 'pragmatic' | 'critical' | 'collaborative';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  decisionStyle: 'fast' | 'deliberate' | 'consensus-driven';
}

export interface ConversationConfig {
  enabled: boolean;
  maxRounds: number;
  consensusThreshold: number;
  timeoutMinutes: number;
  requireUnanimous: boolean;
  allowSelfReflection: boolean;
  enablePersonalities: boolean;
  costBudget: number;
}

export interface ConversationRequest {
  taskId: string;
  prompt: string;
  taskType: string;
  requiredAgents: string[];
  optionalAgents: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  context: any;
  expectedOutput: string;
}

export interface AgentResponse {
  agentId: string;
  round: number;
  response: string;
  confidence: number;
  reasoning: string;
  suggestions: string[];
  concerns: string[];
  votes: Record<string, number>; // Voting on other agents' responses
}

export interface ConversationResult {
  taskId: string;
  finalResponse: string;
  consensusReached: boolean;
  participatingAgents: string[];
  totalRounds: number;
  agentResponses: AgentResponse[];
  refinementHistory: string[];
  qualityScore: number;
  cost: number;
  processingTime: number;
}

export class MultiAgentConversationSystem extends EventEmitter {
  private config: ConversationConfig;
  private conversationAgents: Map<string, ConversationAgent> = new Map();
  private activeConversations: Map<string, ConversationSession> = new Map();

  constructor(config: Partial<ConversationConfig> = {}) {
    super();
    this.config = {
      enabled: config.enabled ?? true,
      maxRounds: config.maxRounds ?? 3,
      consensusThreshold: config.consensusThreshold ?? 0.8,
      timeoutMinutes: config.timeoutMinutes ?? 10,
      requireUnanimous: config.requireUnanimous ?? false,
      allowSelfReflection: config.allowSelfReflection ?? true,
      enablePersonalities: config.enablePersonalities ?? true,
      costBudget: config.costBudget ?? 100
    };

    this.initializeConversationAgents();
  }

  /**
   * Initialize conversation agents with distinct personalities
   */
  private initializeConversationAgents(): void {
    const agents: ConversationAgent[] = [
      {
        id: 'the-architect',
        name: 'The Architect',
        role: 'System Design Lead',
        personality: {
          traits: ['analytical', 'systematic', 'detail-oriented', 'forward-thinking'],
          communicationStyle: 'analytical',
          riskTolerance: 'conservative',
          decisionStyle: 'deliberate'
        },
        specialization: ['system-architecture', 'scalability', 'performance', 'security'],
        decisionWeight: 1.2,
        canDelegate: true,
        canVeto: true
      },
      {
        id: 'the-critic',
        name: 'The Critic',
        role: 'Quality Assurance Lead',
        personality: {
          traits: ['critical', 'thorough', 'skeptical', 'quality-focused'],
          communicationStyle: 'critical',
          riskTolerance: 'conservative',
          decisionStyle: 'deliberate'
        },
        specialization: ['quality-assurance', 'testing', 'security', 'compliance'],
        decisionWeight: 1.1,
        canDelegate: false,
        canVeto: true
      },
      {
        id: 'the-implementer',
        name: 'The Implementer',
        role: 'Senior Developer',
        personality: {
          traits: ['pragmatic', 'solution-oriented', 'efficient', 'hands-on'],
          communicationStyle: 'pragmatic',
          riskTolerance: 'moderate',
          decisionStyle: 'fast'
        },
        specialization: ['implementation', 'coding', 'debugging', 'optimization'],
        decisionWeight: 1.0,
        canDelegate: false,
        canVeto: false
      },
      {
        id: 'the-innovator',
        name: 'The Innovator',
        role: 'Creative Technologist',
        personality: {
          traits: ['creative', 'innovative', 'experimental', 'future-minded'],
          communicationStyle: 'creative',
          riskTolerance: 'aggressive',
          decisionStyle: 'fast'
        },
        specialization: ['innovation', 'emerging-tech', 'user-experience', 'creativity'],
        decisionWeight: 0.9,
        canDelegate: false,
        canVeto: false
      },
      {
        id: 'the-coordinator',
        name: 'The Coordinator',
        role: 'Project Manager',
        personality: {
          traits: ['collaborative', 'organized', 'diplomatic', 'goal-oriented'],
          communicationStyle: 'collaborative',
          riskTolerance: 'moderate',
          decisionStyle: 'consensus-driven'
        },
        specialization: ['project-management', 'coordination', 'communication', 'planning'],
        decisionWeight: 1.0,
        canDelegate: true,
        canVeto: false
      }
    ];

    agents.forEach(agent => {
      this.conversationAgents.set(agent.id, agent);
    });

    console.log(`Initialized ${agents.length} conversation agents with distinct personalities`);
  }

  /**
   * Start multi-agent conversation
   */
  async startConversation(request: ConversationRequest): Promise<ConversationResult> {
    if (!this.config.enabled) {
      return this.createDirectResponse(request);
    }

    try {
      // Create conversation session
      const session = this.createConversationSession(request);
      this.activeConversations.set(request.taskId, session);

      // Conduct iterative conversation rounds
      let currentRound = 1;
      let consensusReached = false;
      
      while (currentRound <= this.config.maxRounds && !consensusReached) {
        this.emit('conversation.round.started', { taskId: request.taskId, round: currentRound });
        
        // Get responses from all participating agents
        const roundResponses = await this.conductConversationRound(session, currentRound);
        session.agentResponses.push(...roundResponses);
        
        // Evaluate consensus
        consensusReached = this.evaluateConsensus(roundResponses);
        
        // Conduct voting and refinement if not final round
        if (!consensusReached && currentRound < this.config.maxRounds) {
          await this.conductVotingAndRefinement(session, roundResponses, currentRound);
        }
        
        currentRound++;
        this.emit('conversation.round.completed', { taskId: request.taskId, round: currentRound - 1, consensusReached });
      }

      // Generate final consensus response
      const finalResponse = await this.generateConsensusResponse(session);
      
      // Calculate quality metrics
      const qualityScore = this.calculateQualityScore(session);
      
      // Clean up session
      this.activeConversations.delete(request.taskId);
      
      const result: ConversationResult = {
        taskId: request.taskId,
        finalResponse: finalResponse.content,
        consensusReached,
        participatingAgents: session.participatingAgents.map(a => a.id),
        totalRounds: currentRound - 1,
        agentResponses: session.agentResponses,
        refinementHistory: session.refinementHistory,
        qualityScore,
        cost: session.totalCost,
        processingTime: Date.now() - session.startTime
      };

      this.emit('conversation.completed', result);
      return result;

    } catch (error) {
      console.error('Multi-agent conversation failed:', error);
      this.activeConversations.delete(request.taskId);
      return this.createDirectResponse(request);
    }
  }

  /**
   * Create conversation session
   */
  private createConversationSession(request: ConversationRequest): ConversationSession {
    // Select participating agents based on task requirements
    const participatingAgents = this.selectAgentsForTask(request);
    
    return {
      taskId: request.taskId,
      request,
      participatingAgents,
      agentResponses: [],
      refinementHistory: [],
      startTime: Date.now(),
      totalCost: 0,
      currentContext: request.context
    };
  }

  /**
   * Select agents based on task requirements and specializations
   */
  private selectAgentsForTask(request: ConversationRequest): ConversationAgent[] {
    const agents: ConversationAgent[] = [];
    
    // Add required agents
    for (const agentId of request.requiredAgents) {
      const agent = this.conversationAgents.get(agentId);
      if (agent) agents.push(agent);
    }
    
    // Add agents based on task type and specializations
    for (const agent of this.conversationAgents.values()) {
      if (agents.find(a => a.id === agent.id)) continue; // Already added
      
      const hasRelevantSpecialization = agent.specialization.some(spec => 
        request.taskType.includes(spec) || 
        request.prompt.toLowerCase().includes(spec)
      );
      
      if (hasRelevantSpecialization) {
        agents.push(agent);
      }
    }
    
    // Always include coordinator for collaboration
    const coordinator = this.conversationAgents.get('the-coordinator');
    if (coordinator && !agents.find(a => a.id === coordinator.id)) {
      agents.push(coordinator);
    }
    
    // Limit to reasonable number of agents (3-5 for efficiency)
    return agents.slice(0, 5);
  }

  /**
   * Conduct a single conversation round
   */
  private async conductConversationRound(session: ConversationSession, round: number): Promise<AgentResponse[]> {
    const responses: AgentResponse[] = [];
    
    for (const agent of session.participatingAgents) {
      try {
        const agentPrompt = this.buildAgentPrompt(agent, session, round);
        
        // Get response from agent using appropriate LLM
        const llmResponse = await this.getAgentResponse(agent, agentPrompt);
        
        const response: AgentResponse = {
          agentId: agent.id,
          round,
          response: llmResponse.content,
          confidence: this.extractConfidence(llmResponse.content),
          reasoning: this.extractReasoning(llmResponse.content),
          suggestions: this.extractSuggestions(llmResponse.content),
          concerns: this.extractConcerns(llmResponse.content),
          votes: {}
        };
        
        responses.push(response);
        session.totalCost += llmResponse.cost || 0;
        
        this.emit('agent.response', { taskId: session.taskId, agent: agent.id, round, response });
        
      } catch (error) {
        console.error(`Agent ${agent.id} failed in round ${round}:`, error);
      }
    }
    
    return responses;
  }

  /**
   * Build agent-specific prompt with personality and context
   */
  private buildAgentPrompt(agent: ConversationAgent, session: ConversationSession, round: number): string {
    let prompt = `You are ${agent.name}, a ${agent.role} with the following characteristics:

**Personality Traits:** ${agent.personality.traits.join(', ')}
**Communication Style:** ${agent.personality.communicationStyle}
**Risk Tolerance:** ${agent.personality.riskTolerance}
**Decision Style:** ${agent.personality.decisionStyle}
**Specializations:** ${agent.specialization.join(', ')}

**Current Task:** ${session.request.prompt}

**Task Context:** ${JSON.stringify(session.currentContext)}

**Expected Output:** ${session.request.expectedOutput}

`;

    // Add previous round context if not first round
    if (round > 1) {
      const previousResponses = session.agentResponses.filter(r => r.round === round - 1);
      if (previousResponses.length > 0) {
        prompt += `**Previous Round Discussion:**\n`;
        previousResponses.forEach(response => {
          const respondingAgent = session.participatingAgents.find(a => a.id === response.agentId);
          prompt += `\n${respondingAgent?.name}: ${response.response}\n`;
        });
        prompt += '\n';
      }
    }

    // Add personality-specific instructions
    prompt += this.getPersonalityInstructions(agent.personality);

    prompt += `

**Your Response Should Include:**
1. Your analysis or solution based on your expertise
2. Your confidence level (0-100%)
3. Your reasoning for this approach
4. Any suggestions for improvement
5. Any concerns or risks you identify

Respond in character as ${agent.name}, maintaining your professional perspective and communication style.`;

    return prompt;
  }

  /**
   * Get personality-specific instructions
   */
  private getPersonalityInstructions(personality: AgentPersonality): string {
    const instructions: Record<string, string> = {
      'analytical': 'Provide detailed analysis with data and logical reasoning. Focus on systematic evaluation and evidence-based conclusions.',
      'creative': 'Think outside the box and propose innovative solutions. Challenge conventional approaches and explore new possibilities.',
      'pragmatic': 'Focus on practical, implementable solutions. Consider resource constraints and real-world feasibility.',
      'critical': 'Critically evaluate all aspects, identify potential issues and risks. Question assumptions and demand high quality standards.',
      'collaborative': 'Seek common ground and facilitate team consensus. Focus on communication and coordination between different perspectives.'
    };

    return instructions[personality.communicationStyle] || 'Provide your expert perspective based on your role and experience.';
  }

  /**
   * Get response from agent using appropriate LLM
   */
  private async getAgentResponse(agent: ConversationAgent, prompt: string): Promise<any> {
    // Select LLM provider based on agent specialization
    const provider = this.selectLLMForAgent(agent);
    
    const request = {
      id: `conversation_${agent.id}_${Date.now()}`,
      prompt,
      maxTokens: 1500,
      temperature: this.getTemperatureForPersonality(agent.personality),
      provider,
      priority: 'high' as const,
      context: {
        agentId: agent.id,
        agentRole: agent.role,
        requiresStructured: true
      }
    };

    return await elevenLLMProviders.processRequest(request);
  }

  /**
   * Select optimal LLM provider for agent
   */
  private selectLLMForAgent(agent: ConversationAgent): string {
    // Map agent types to optimal LLM providers
    const providerMapping: Record<string, string> = {
      'system-architecture': 'anthropic', // Claude for architectural thinking
      'quality-assurance': 'openai',      // GPT for systematic testing
      'implementation': 'deepseek',       // DeepSeek for coding
      'innovation': 'openai',             // GPT for creative thinking
      'project-management': 'google'      // Gemini for coordination
    };

    const primarySpecialization = agent.specialization[0];
    return providerMapping[primarySpecialization] || 'openai';
  }

  /**
   * Get temperature based on personality
   */
  private getTemperatureForPersonality(personality: AgentPersonality): number {
    const temperatureMapping: Record<string, number> = {
      'analytical': 0.3,
      'creative': 0.8,
      'pragmatic': 0.4,
      'critical': 0.2,
      'collaborative': 0.5
    };

    return temperatureMapping[personality.communicationStyle] || 0.5;
  }

  /**
   * Extract confidence score from response
   */
  private extractConfidence(response: string): number {
    // Look for confidence indicators in the response
    const confidenceMatch = response.match(/confidence[:\s]*(\d+)%?/i);
    if (confidenceMatch) {
      return parseInt(confidenceMatch[1]);
    }
    
    // Fallback: estimate based on language certainty
    const certaintyWords = ['definitely', 'certainly', 'clearly', 'obviously'];
    const uncertaintyWords = ['maybe', 'perhaps', 'possibly', 'might', 'could'];
    
    const certaintyCount = certaintyWords.filter(word => response.toLowerCase().includes(word)).length;
    const uncertaintyCount = uncertaintyWords.filter(word => response.toLowerCase().includes(word)).length;
    
    return Math.max(50, Math.min(95, 70 + (certaintyCount - uncertaintyCount) * 10));
  }

  /**
   * Extract reasoning from response
   */
  private extractReasoning(response: string): string {
    // Look for reasoning section
    const reasoningMatch = response.match(/reasoning[:\s]*(.*?)(?=\n\n|\n[A-Z]|$)/is);
    if (reasoningMatch) {
      return reasoningMatch[1].trim();
    }
    
    // Fallback: use first substantial paragraph
    const paragraphs = response.split('\n\n').filter(p => p.length > 50);
    return paragraphs[0] || 'No explicit reasoning provided';
  }

  /**
   * Extract suggestions from response
   */
  private extractSuggestions(response: string): string[] {
    const suggestions: string[] = [];
    
    // Look for suggestion patterns
    const suggestionPatterns = [
      /suggestions?[:\s]*(.*?)(?=\n\n|\n[A-Z]|$)/is,
      /recommend[:\s]*(.*?)(?=\n\n|\n[A-Z]|$)/is,
      /propose[:\s]*(.*?)(?=\n\n|\n[A-Z]|$)/is
    ];
    
    for (const pattern of suggestionPatterns) {
      const match = response.match(pattern);
      if (match) {
        const suggestionText = match[1];
        // Split by bullet points or numbers
        const items = suggestionText.split(/[-•*]\s+|^\d+\.\s+/gm).filter(item => item.trim().length > 10);
        suggestions.push(...items.map(item => item.trim()));
      }
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  /**
   * Extract concerns from response
   */
  private extractConcerns(response: string): string[] {
    const concerns: string[] = [];
    
    // Look for concern patterns
    const concernPatterns = [
      /concerns?[:\s]*(.*?)(?=\n\n|\n[A-Z]|$)/is,
      /risks?[:\s]*(.*?)(?=\n\n|\n[A-Z]|$)/is,
      /issues?[:\s]*(.*?)(?=\n\n|\n[A-Z]|$)/is,
      /problems?[:\s]*(.*?)(?=\n\n|\n[A-Z]|$)/is
    ];
    
    for (const pattern of concernPatterns) {
      const match = response.match(pattern);
      if (match) {
        const concernText = match[1];
        const items = concernText.split(/[-•*]\s+|^\d+\.\s+/gm).filter(item => item.trim().length > 10);
        concerns.push(...items.map(item => item.trim()));
      }
    }
    
    return concerns.slice(0, 5); // Limit to 5 concerns
  }

  /**
   * Conduct voting and refinement between rounds
   */
  private async conductVotingAndRefinement(session: ConversationSession, responses: AgentResponse[], round: number): Promise<void> {
    // Implement voting mechanism
    for (const agent of session.participatingAgents) {
      for (const response of responses) {
        if (response.agentId !== agent.id) {
          // Agent votes on other agents' responses
          const vote = await this.getAgentVote(agent, response, session);
          response.votes[agent.id] = vote;
        }
      }
    }
    
    // Identify areas for refinement based on votes and concerns
    const refinementAreas = this.identifyRefinementAreas(responses);
    
    if (refinementAreas.length > 0) {
      session.refinementHistory.push(`Round ${round}: ${refinementAreas.join(', ')}`);
      
      // Update context for next round
      session.currentContext = {
        ...session.currentContext,
        refinementAreas,
        previousResponses: responses.map(r => ({
          agent: r.agentId,
          response: r.response,
          confidence: r.confidence,
          votes: Object.values(r.votes).reduce((sum, vote) => sum + vote, 0) / Object.keys(r.votes).length
        }))
      };
    }
  }

  /**
   * Get agent vote on another agent's response
   */
  private async getAgentVote(voter: ConversationAgent, response: AgentResponse, session: ConversationSession): Promise<number> {
    const prompt = `As ${voter.name}, evaluate the following response from ${response.agentId}:

Response: ${response.response}

Rate this response on a scale of 1-10 considering:
- Relevance to the task
- Quality of the solution
- Feasibility of implementation
- Alignment with best practices

Provide only a number from 1-10.`;

    try {
      const voteResponse = await this.getAgentResponse(voter, prompt);
      const voteMatch = voteResponse.content.match(/(\d+)/);
      return voteMatch ? Math.max(1, Math.min(10, parseInt(voteMatch[1]))) : 5;
    } catch (error) {
      return 5; // Default neutral vote
    }
  }

  /**
   * Identify areas for refinement based on votes and concerns
   */
  private identifyRefinementAreas(responses: AgentResponse[]): string[] {
    const areas: string[] = [];
    
    // Low scoring responses need refinement
    const lowScoringResponses = responses.filter(r => {
      const avgVote = Object.values(r.votes).reduce((sum, vote) => sum + vote, 0) / Object.keys(r.votes).length;
      return avgVote < 6;
    });
    
    if (lowScoringResponses.length > 0) {
      areas.push('Address concerns about low-scoring approaches');
    }
    
    // Common concerns across agents
    const allConcerns = responses.flatMap(r => r.concerns);
    const concernFrequency: Record<string, number> = {};
    
    allConcerns.forEach(concern => {
      const key = concern.toLowerCase();
      concernFrequency[key] = (concernFrequency[key] || 0) + 1;
    });
    
    const commonConcerns = Object.entries(concernFrequency)
      .filter(([_, count]) => count >= 2)
      .map(([concern, _]) => concern);
    
    if (commonConcerns.length > 0) {
      areas.push(`Address common concerns: ${commonConcerns.slice(0, 3).join(', ')}`);
    }
    
    return areas;
  }

  /**
   * Evaluate if consensus has been reached
   */
  private evaluateConsensus(responses: AgentResponse[]): boolean {
    if (responses.length === 0) return false;
    
    // Calculate average confidence
    const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
    
    // Calculate voting consensus
    const avgVotes = responses.map(r => {
      const votes = Object.values(r.votes);
      return votes.length > 0 ? votes.reduce((sum, vote) => sum + vote, 0) / votes.length : 7;
    });
    
    const overallConsensus = avgVotes.reduce((sum, vote) => sum + vote, 0) / avgVotes.length;
    
    // Consensus reached if both confidence and voting are above threshold
    const consensusScore = (avgConfidence / 100 + overallConsensus / 10) / 2;
    
    return consensusScore >= this.config.consensusThreshold;
  }

  /**
   * Generate final consensus response
   */
  private async generateConsensusResponse(session: ConversationSession): Promise<any> {
    const allResponses = session.agentResponses;
    const latestRound = Math.max(...allResponses.map(r => r.round));
    const latestResponses = allResponses.filter(r => r.round === latestRound);
    
    // Build consensus prompt
    const consensusPrompt = `Based on the multi-agent discussion below, synthesize a final consensus response that incorporates the best elements from all perspectives:

**Original Task:** ${session.request.prompt}

**Agent Responses:**
${latestResponses.map(r => {
  const agent = session.participatingAgents.find(a => a.id === r.agentId);
  return `\n**${agent?.name} (${r.confidence}% confidence):**\n${r.response}`;
}).join('\n\n')}

**Refinement History:**
${session.refinementHistory.join('\n')}

**Requirements:**
- Synthesize the best ideas from all agents
- Address any concerns raised
- Provide a comprehensive, implementable solution
- Maintain high quality standards

Generate a final response that represents the team's consensus solution.`;

    // Use the coordinator agent or best-performing agent to generate consensus
    const coordinator = session.participatingAgents.find(a => a.id === 'the-coordinator') || session.participatingAgents[0];
    
    return await this.getAgentResponse(coordinator, consensusPrompt);
  }

  /**
   * Calculate overall quality score for the conversation
   */
  private calculateQualityScore(session: ConversationSession): number {
    const responses = session.agentResponses;
    if (responses.length === 0) return 0;
    
    // Factors: average confidence, consensus level, refinement iterations, participation
    const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
    
    const latestRound = Math.max(...responses.map(r => r.round));
    const consensusLevel = this.evaluateConsensus(responses.filter(r => r.round === latestRound)) ? 100 : 60;
    
    const refinementBonus = Math.min(20, session.refinementHistory.length * 5);
    const participationBonus = Math.min(20, session.participatingAgents.length * 4);
    
    return Math.min(100, (avgConfidence * 0.4 + consensusLevel * 0.4 + refinementBonus + participationBonus) * 0.01 * 100);
  }

  /**
   * Create direct response when conversation is disabled
   */
  private async createDirectResponse(request: ConversationRequest): Promise<ConversationResult> {
    // Use single best agent for the task
    const bestAgent = this.selectAgentsForTask(request)[0];
    
    if (!bestAgent) {
      throw new Error('No suitable agent available for task');
    }
    
    const prompt = this.buildAgentPrompt(bestAgent, {
      taskId: request.taskId,
      request,
      participatingAgents: [bestAgent],
      agentResponses: [],
      refinementHistory: [],
      startTime: Date.now(),
      totalCost: 0,
      currentContext: request.context
    }, 1);
    
    const response = await this.getAgentResponse(bestAgent, prompt);
    
    return {
      taskId: request.taskId,
      finalResponse: response.content,
      consensusReached: true,
      participatingAgents: [bestAgent.id],
      totalRounds: 1,
      agentResponses: [{
        agentId: bestAgent.id,
        round: 1,
        response: response.content,
        confidence: 85,
        reasoning: 'Direct single-agent response',
        suggestions: [],
        concerns: [],
        votes: {}
      }],
      refinementHistory: [],
      qualityScore: 85,
      cost: response.cost || 0,
      processingTime: 1000
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ConversationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('config.updated', this.config);
  }

  /**
   * Get conversation statistics
   */
  getConversationStats(): any {
    return {
      totalConversations: this.activeConversations.size,
      availableAgents: this.conversationAgents.size,
      config: this.config
    };
  }

  /**
   * Get available conversation agents
   */
  getAvailableAgents(): ConversationAgent[] {
    return Array.from(this.conversationAgents.values());
  }
}

interface ConversationSession {
  taskId: string;
  request: ConversationRequest;
  participatingAgents: ConversationAgent[];
  agentResponses: AgentResponse[];
  refinementHistory: string[];
  startTime: number;
  totalCost: number;
  currentContext: any;
}

export const multiAgentConversationSystem = new MultiAgentConversationSystem();
