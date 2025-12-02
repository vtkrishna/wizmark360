/**
 * WAI SDK v9.0 - BMAD 2.0 Integration
 * Bidirectional Multi-Agent Dialogue framework integration with audit tables
 */

import { EventEmitter } from 'events';
import { productionDB } from '../persistence/production-database';

export interface BMADAgent {
  id: string;
  role: 'initiator' | 'responder' | 'moderator' | 'evaluator';
  persona: {
    name: string;
    expertise: string[];
    communicationStyle: 'formal' | 'casual' | 'technical' | 'creative';
    perspective: string;
  };
  state: {
    context: any;
    memory: any[];
    goals: string[];
    constraints: string[];
  };
  metrics: {
    contributionScore: number;
    agreementLevel: number;
    qualityRating: number;
    participationCount: number;
  };
}

export interface BMADDialogue {
  id: string;
  topic: string;
  objective: string;
  participants: BMADAgent[];
  phases: BMADPhase[];
  currentPhase: number;
  status: 'active' | 'paused' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  outcomes: {
    consensus: boolean;
    decisions: string[];
    insights: string[];
    actionItems: string[];
  };
  auditTrail: BMADAuditEntry[];
}

export interface BMADPhase {
  id: string;
  name: string;
  type: 'exploration' | 'analysis' | 'synthesis' | 'evaluation' | 'decision';
  duration: number; // milliseconds
  exchanges: BMADExchange[];
  phaseGoals: string[];
  successCriteria: string[];
  status: 'pending' | 'active' | 'completed';
}

export interface BMADExchange {
  id: string;
  timestamp: Date;
  speakerId: string;
  addresseeId?: string; // null for broadcast
  messageType: 'statement' | 'question' | 'response' | 'proposal' | 'objection' | 'agreement';
  content: string;
  context: any;
  references: string[]; // references to previous exchanges
  confidence: number; // 0-1
  impact: number; // estimated impact on dialogue progression
}

export interface BMADAuditEntry {
  id: string;
  timestamp: Date;
  event: 'dialogue_started' | 'phase_changed' | 'agent_joined' | 'agent_left' | 'exchange_added' | 'consensus_reached' | 'dialogue_ended';
  agentId?: string;
  phaseId?: string;
  exchangeId?: string;
  metadata: any;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export class BMADManager extends EventEmitter {
  private dialogues: Map<string, BMADDialogue> = new Map();
  private agents: Map<string, BMADAgent> = new Map();
  private auditStorage: BMADAuditStorage;

  constructor() {
    super();
    this.auditStorage = new BMADAuditStorage();
    console.log('🎭 BMAD 2.0 Manager initialized');
  }

  /**
   * Create a new BMAD dialogue
   */
  async createDialogue(
    topic: string,
    objective: string,
    participantSpecs: Array<{
      role: BMADAgent['role'];
      persona: Partial<BMADAgent['persona']>;
      goals?: string[];
      constraints?: string[];
    }>
  ): Promise<string> {
    const dialogueId = `bmad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create participants
    const participants: BMADAgent[] = participantSpecs.map((spec, index) => ({
      id: `agent_${dialogueId}_${index}`,
      role: spec.role,
      persona: {
        name: spec.persona.name || `Agent ${index + 1}`,
        expertise: spec.persona.expertise || ['general'],
        communicationStyle: spec.persona.communicationStyle || 'formal',
        perspective: spec.persona.perspective || 'neutral'
      },
      state: {
        context: {},
        memory: [],
        goals: spec.goals || [],
        constraints: spec.constraints || []
      },
      metrics: {
        contributionScore: 0,
        agreementLevel: 0.5,
        qualityRating: 0,
        participationCount: 0
      }
    }));

    // Initialize dialogue phases
    const phases: BMADPhase[] = [
      {
        id: `phase_exploration_${dialogueId}`,
        name: 'Exploration',
        type: 'exploration',
        duration: 300000, // 5 minutes
        exchanges: [],
        phaseGoals: ['Understand the problem space', 'Identify key perspectives'],
        successCriteria: ['All agents have contributed', 'Problem is clearly defined'],
        status: 'pending'
      },
      {
        id: `phase_analysis_${dialogueId}`,
        name: 'Analysis',
        type: 'analysis',
        duration: 600000, // 10 minutes
        exchanges: [],
        phaseGoals: ['Analyze different approaches', 'Identify trade-offs'],
        successCriteria: ['Multiple solutions proposed', 'Trade-offs understood'],
        status: 'pending'
      },
      {
        id: `phase_synthesis_${dialogueId}`,
        name: 'Synthesis',
        type: 'synthesis',
        duration: 300000, // 5 minutes
        exchanges: [],
        phaseGoals: ['Combine insights', 'Form consensus'],
        successCriteria: ['Common ground identified', 'Unified approach proposed'],
        status: 'pending'
      },
      {
        id: `phase_decision_${dialogueId}`,
        name: 'Decision',
        type: 'decision',
        duration: 180000, // 3 minutes
        exchanges: [],
        phaseGoals: ['Make final decisions', 'Define action items'],
        successCriteria: ['Decisions made', 'Action items defined'],
        status: 'pending'
      }
    ];

    const dialogue: BMADDialogue = {
      id: dialogueId,
      topic,
      objective,
      participants,
      phases,
      currentPhase: 0,
      status: 'active',
      startTime: new Date(),
      outcomes: {
        consensus: false,
        decisions: [],
        insights: [],
        actionItems: []
      },
      auditTrail: []
    };

    // Store dialogue
    this.dialogues.set(dialogueId, dialogue);
    
    // Register agents
    participants.forEach(agent => {
      this.agents.set(agent.id, agent);
    });

    // Audit dialogue creation
    await this.auditStorage.logEvent({
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      event: 'dialogue_started',
      metadata: { dialogueId, topic, objective, participantCount: participants.length },
      impact: 'high'
    });

    // Start first phase
    await this.startPhase(dialogueId, 0);

    this.emit('dialogue-created', { dialogueId, dialogue });
    
    console.log(`🎭 BMAD dialogue created: ${dialogueId} on topic "${topic}"`);
    return dialogueId;
  }

  /**
   * Add an exchange to the dialogue
   */
  async addExchange(
    dialogueId: string,
    speakerId: string,
    content: string,
    messageType: BMADExchange['messageType'],
    addresseeId?: string,
    context?: any
  ): Promise<string> {
    const dialogue = this.dialogues.get(dialogueId);
    if (!dialogue || dialogue.status !== 'active') {
      throw new Error(`Dialogue ${dialogueId} not found or not active`);
    }

    const agent = this.agents.get(speakerId);
    if (!agent) {
      throw new Error(`Agent ${speakerId} not found`);
    }

    const currentPhase = dialogue.phases[dialogue.currentPhase];
    if (!currentPhase || currentPhase.status !== 'active') {
      throw new Error(`Current phase not active for dialogue ${dialogueId}`);
    }

    const exchangeId = `exchange_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const exchange: BMADExchange = {
      id: exchangeId,
      timestamp: new Date(),
      speakerId,
      addresseeId,
      messageType,
      content,
      context: context || {},
      references: this.findReferences(content, currentPhase.exchanges),
      confidence: this.calculateConfidence(content, agent),
      impact: this.calculateImpact(content, messageType, currentPhase)
    };

    // Add exchange to current phase
    currentPhase.exchanges.push(exchange);

    // Update agent metrics
    agent.metrics.participationCount++;
    agent.metrics.contributionScore = this.calculateContributionScore(agent, currentPhase);

    // Update agent memory
    agent.state.memory.push({
      type: 'exchange',
      content: exchange,
      timestamp: new Date()
    });

    // Audit exchange
    await this.auditStorage.logEvent({
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      event: 'exchange_added',
      agentId: speakerId,
      phaseId: currentPhase.id,
      exchangeId,
      metadata: { messageType, contentLength: content.length, impact: exchange.impact },
      impact: exchange.impact > 0.7 ? 'high' : exchange.impact > 0.4 ? 'medium' : 'low'
    });

    // Check phase completion
    if (this.isPhaseComplete(currentPhase)) {
      await this.completePhase(dialogueId, dialogue.currentPhase);
    }

    this.emit('exchange-added', { dialogueId, exchangeId, exchange });
    
    return exchangeId;
  }

  /**
   * Check if dialogue has reached consensus
   */
  private async checkConsensus(dialogue: BMADDialogue): Promise<boolean> {
    const lastPhase = dialogue.phases[dialogue.phases.length - 1];
    if (!lastPhase || lastPhase.status !== 'completed') {
      return false;
    }

    // Analyze exchanges for agreement patterns
    const agreementExchanges = lastPhase.exchanges.filter(ex => 
      ex.messageType === 'agreement' || ex.content.toLowerCase().includes('agree')
    );

    const disagreementExchanges = lastPhase.exchanges.filter(ex => 
      ex.messageType === 'objection' || ex.content.toLowerCase().includes('disagree')
    );

    const consensusThreshold = 0.8;
    const agreementRatio = agreementExchanges.length / (agreementExchanges.length + disagreementExchanges.length);

    return agreementRatio >= consensusThreshold;
  }

  /**
   * Complete the dialogue
   */
  async completeDialogue(dialogueId: string): Promise<BMADDialogue> {
    const dialogue = this.dialogues.get(dialogueId);
    if (!dialogue) {
      throw new Error(`Dialogue ${dialogueId} not found`);
    }

    dialogue.status = 'completed';
    dialogue.endTime = new Date();

    // Check consensus
    dialogue.outcomes.consensus = await this.checkConsensus(dialogue);

    // Extract outcomes
    dialogue.outcomes.decisions = this.extractDecisions(dialogue);
    dialogue.outcomes.insights = this.extractInsights(dialogue);
    dialogue.outcomes.actionItems = this.extractActionItems(dialogue);

    // Audit completion
    await this.auditStorage.logEvent({
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      event: 'dialogue_ended',
      metadata: { 
        dialogueId, 
        duration: dialogue.endTime.getTime() - dialogue.startTime.getTime(),
        consensus: dialogue.outcomes.consensus,
        exchangeCount: dialogue.phases.reduce((sum, phase) => sum + phase.exchanges.length, 0)
      },
      impact: 'critical'
    });

    this.emit('dialogue-completed', { dialogueId, dialogue });
    
    console.log(`🎭 BMAD dialogue completed: ${dialogueId} (consensus: ${dialogue.outcomes.consensus})`);
    return dialogue;
  }

  // Helper methods
  private findReferences(content: string, exchanges: BMADExchange[]): string[] {
    const references: string[] = [];
    
    // Simple reference detection - look for mentions of previous exchanges
    exchanges.forEach(exchange => {
      if (content.toLowerCase().includes(exchange.content.substring(0, 20).toLowerCase())) {
        references.push(exchange.id);
      }
    });

    return references;
  }

  private calculateConfidence(content: string, agent: BMADAgent): number {
    // Simple confidence calculation based on content and agent expertise
    const confidenceIndicators = ['certainly', 'definitely', 'clearly', 'obviously'];
    const uncertaintyIndicators = ['maybe', 'perhaps', 'possibly', 'might'];
    
    let confidence = 0.5; // baseline
    
    confidenceIndicators.forEach(indicator => {
      if (content.toLowerCase().includes(indicator)) {
        confidence += 0.1;
      }
    });
    
    uncertaintyIndicators.forEach(indicator => {
      if (content.toLowerCase().includes(indicator)) {
        confidence -= 0.1;
      }
    });

    return Math.max(0, Math.min(1, confidence));
  }

  private calculateImpact(content: string, messageType: BMADExchange['messageType'], phase: BMADPhase): number {
    let impact = 0.3; // baseline

    // Message type impact
    switch (messageType) {
      case 'proposal':
        impact += 0.4;
        break;
      case 'agreement':
        impact += 0.3;
        break;
      case 'objection':
        impact += 0.2;
        break;
      case 'question':
        impact += 0.1;
        break;
    }

    // Content length impact (longer messages tend to have more impact)
    impact += Math.min(0.2, content.length / 1000);

    return Math.max(0, Math.min(1, impact));
  }

  private calculateContributionScore(agent: BMADAgent, phase: BMADPhase): number {
    const agentExchanges = phase.exchanges.filter(ex => ex.speakerId === agent.id);
    const totalImpact = agentExchanges.reduce((sum, ex) => sum + ex.impact, 0);
    const avgImpact = agentExchanges.length > 0 ? totalImpact / agentExchanges.length : 0;
    
    return Math.min(1, avgImpact * agentExchanges.length * 0.1);
  }

  private isPhaseComplete(phase: BMADPhase): boolean {
    // Simple completion criteria
    const hasMinimumExchanges = phase.exchanges.length >= 3;
    const hasHighImpactExchanges = phase.exchanges.some(ex => ex.impact > 0.7);
    
    return hasMinimumExchanges && hasHighImpactExchanges;
  }

  private async startPhase(dialogueId: string, phaseIndex: number): Promise<void> {
    const dialogue = this.dialogues.get(dialogueId);
    if (!dialogue || !dialogue.phases[phaseIndex]) {
      throw new Error(`Cannot start phase ${phaseIndex} for dialogue ${dialogueId}`);
    }

    const phase = dialogue.phases[phaseIndex];
    phase.status = 'active';
    dialogue.currentPhase = phaseIndex;

    // Audit phase start
    await this.auditStorage.logEvent({
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      event: 'phase_changed',
      phaseId: phase.id,
      metadata: { dialogueId, phaseIndex, phaseName: phase.name },
      impact: 'medium'
    });

    this.emit('phase-started', { dialogueId, phaseIndex, phase });
  }

  private async completePhase(dialogueId: string, phaseIndex: number): Promise<void> {
    const dialogue = this.dialogues.get(dialogueId);
    if (!dialogue || !dialogue.phases[phaseIndex]) {
      return;
    }

    const phase = dialogue.phases[phaseIndex];
    phase.status = 'completed';

    // Start next phase if available
    if (phaseIndex + 1 < dialogue.phases.length) {
      await this.startPhase(dialogueId, phaseIndex + 1);
    } else {
      // All phases complete, finish dialogue
      await this.completeDialogue(dialogueId);
    }
  }

  private extractDecisions(dialogue: BMADDialogue): string[] {
    const decisions: string[] = [];
    
    dialogue.phases.forEach(phase => {
      phase.exchanges.forEach(exchange => {
        if (exchange.messageType === 'proposal' && exchange.impact > 0.6) {
          decisions.push(exchange.content);
        }
      });
    });

    return decisions;
  }

  private extractInsights(dialogue: BMADDialogue): string[] {
    const insights: string[] = [];
    
    dialogue.phases.forEach(phase => {
      if (phase.type === 'analysis' || phase.type === 'synthesis') {
        phase.exchanges.forEach(exchange => {
          if (exchange.impact > 0.5) {
            insights.push(exchange.content);
          }
        });
      }
    });

    return insights;
  }

  private extractActionItems(dialogue: BMADDialogue): string[] {
    const actionItems: string[] = [];
    
    const lastPhase = dialogue.phases[dialogue.phases.length - 1];
    if (lastPhase) {
      lastPhase.exchanges.forEach(exchange => {
        if (exchange.content.toLowerCase().includes('action') || 
            exchange.content.toLowerCase().includes('implement') ||
            exchange.content.toLowerCase().includes('next step')) {
          actionItems.push(exchange.content);
        }
      });
    }

    return actionItems;
  }

  // Public API methods
  getDialogue(dialogueId: string): BMADDialogue | undefined {
    return this.dialogues.get(dialogueId);
  }

  getAllDialogues(): BMADDialogue[] {
    return Array.from(this.dialogues.values());
  }

  getActiveDialogues(): BMADDialogue[] {
    return Array.from(this.dialogues.values()).filter(d => d.status === 'active');
  }

  getAgent(agentId: string): BMADAgent | undefined {
    return this.agents.get(agentId);
  }

  async getAuditTrail(dialogueId: string): Promise<BMADAuditEntry[]> {
    return this.auditStorage.getAuditTrail(dialogueId);
  }
}

/**
 * BMAD Audit Storage for compliance and tracking
 */
class BMADAuditStorage {
  private auditEntries: BMADAuditEntry[] = [];

  async logEvent(entry: BMADAuditEntry): Promise<void> {
    this.auditEntries.push(entry);
    
    // In production, this would write to a persistent database
    console.log(`📝 BMAD Audit: ${entry.event} (${entry.impact})`);
  }

  async getAuditTrail(dialogueId?: string): Promise<BMADAuditEntry[]> {
    if (dialogueId) {
      return this.auditEntries.filter(entry => 
        entry.metadata?.dialogueId === dialogueId
      );
    }
    return [...this.auditEntries];
  }

  async getAuditStats(): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByImpact: Record<string, number>;
  }> {
    const eventsByType: Record<string, number> = {};
    const eventsByImpact: Record<string, number> = {};

    this.auditEntries.forEach(entry => {
      eventsByType[entry.event] = (eventsByType[entry.event] || 0) + 1;
      eventsByImpact[entry.impact] = (eventsByImpact[entry.impact] || 0) + 1;
    });

    return {
      totalEvents: this.auditEntries.length,
      eventsByType,
      eventsByImpact
    };
  }
}

// Export singleton instance
export const bmadManager = new BMADManager();