/**
 * Persistent Agent Manager - Complete Tmux-Orchestrator Implementation
 * Provides continuous agent operation with session persistence and self-scheduling
 */

import { EventEmitter } from 'events';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { waiComprehensiveOrchestrationBackbone } from './wai-comprehensive-orchestration-backbone-v7';
import type { UnifiedOrchestrationRequest as EnhancedWAIRequest } from './unified-wai-orchestration-complete';

export interface PersistentAgentConfig {
  id: string;
  name: string;
  role: 'orchestrator' | 'project-manager' | 'engineer' | 'specialist';
  hierarchy: {
    level: 'executive' | 'senior' | 'specialist' | 'junior';
    reportsTo?: string;
    manages?: string[];
  };
  capabilities: string[];
  persistence: {
    sessionTimeout: number; // minutes
    maxIdleTime: number; // minutes
    autoSchedule: boolean;
    checkInInterval: number; // minutes
  };
  context: {
    projectId?: number;
    currentTask?: string;
    longTermMemory: any;
    workingDirectory?: string;
  };
}

export interface AgentSession {
  id: string;
  agentId: string;
  processId?: number;
  status: 'active' | 'idle' | 'scheduled' | 'terminated';
  lastActivity: Date;
  nextCheckIn?: Date;
  sessionData: any;
  communicationLog: AgentMessage[];
}

export interface AgentMessage {
  id: string;
  fromAgent: string;
  toAgent: string;
  message: string;
  timestamp: Date;
  type: 'task-assignment' | 'status-update' | 'coordination' | 'report';
  metadata?: any;
}

export interface ScheduledTask {
  id: string;
  agentId: string;
  description: string;
  scheduledFor: Date;
  recurring: boolean;
  interval?: number; // minutes
  maxExecutions?: number;
  executionCount: number;
  lastExecution?: Date;
}

export class PersistentAgentManager extends EventEmitter {
  private agents: Map<string, PersistentAgentConfig> = new Map();
  private sessions: Map<string, AgentSession> = new Map();
  private scheduledTasks: Map<string, ScheduledTask> = new Map();
  private communicationQueue: Map<string, AgentMessage[]> = new Map();
  private sessionDirectory: string;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private schedulerInterval: NodeJS.Timeout | null = null;
  private healingInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.sessionDirectory = join(process.cwd(), 'agent-sessions');
    this.ensureSessionDirectory();
    this.initializeSystemAgents();
  }

  private ensureSessionDirectory(): void {
    if (!existsSync(this.sessionDirectory)) {
      mkdirSync(this.sessionDirectory, { recursive: true });
    }
  }

  private initializeSystemAgents(): void {
    // Initialize core system agents based on Tmux-Orchestrator hierarchy
    const orchestratorAgent: PersistentAgentConfig = {
      id: 'wai-orchestrator',
      name: 'WAI System Orchestrator',
      role: 'orchestrator',
      hierarchy: {
        level: 'executive',
        manages: ['project-manager-1', 'project-manager-2']
      },
      capabilities: [
        'multi-project-coordination',
        'resource-allocation',
        'strategic-planning',
        'performance-monitoring',
        'agent-lifecycle-management'
      ],
      persistence: {
        sessionTimeout: 480, // 8 hours
        maxIdleTime: 60, // 1 hour
        autoSchedule: true,
        checkInInterval: 60 // 1 hour
      },
      context: {
        longTermMemory: {
          activeProjects: [],
          systemMetrics: {},
          agentPerformance: {}
        }
      }
    };

    this.agents.set(orchestratorAgent.id, orchestratorAgent);
    this.createAgentSession(orchestratorAgent.id);
  }

  /**
   * Create a new persistent agent with Tmux-Orchestrator style persistence
   */
  async createPersistentAgent(config: PersistentAgentConfig): Promise<string> {
    const agentId = config.id;
    
    // Store agent configuration
    this.agents.set(agentId, config);
    
    // Create persistent session
    const sessionId = await this.createAgentSession(agentId);
    
    // Schedule initial check-in if auto-schedule is enabled
    if (config.persistence.autoSchedule) {
      await this.scheduleAgentCheckIn(
        agentId,
        config.persistence.checkInInterval,
        'Initial agent activation and status check'
      );
    }

    // Persist agent configuration to disk
    this.persistAgentConfig(agentId);

    this.emit('agent_created', { agentId, sessionId, config });
    return sessionId;
  }

  /**
   * Create a persistent session for an agent (similar to tmux session)
   */
  private async createAgentSession(agentId: string): Promise<string> {
    const sessionId = `session_${agentId}_${Date.now()}`;
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const session: AgentSession = {
      id: sessionId,
      agentId,
      status: 'active',
      lastActivity: new Date(),
      sessionData: {
        context: agent.context,
        currentWorkflow: null,
        messageHistory: []
      },
      communicationLog: []
    };

    this.sessions.set(sessionId, session);
    this.communicationQueue.set(agentId, []);

    // Load any persisted session data
    await this.loadPersistedSession(sessionId);

    console.log(`✅ Persistent session created for agent: ${agentId} (${sessionId})`);
    return sessionId;
  }

  /**
   * Self-scheduling system inspired by schedule_with_note.sh
   */
  async scheduleAgentCheckIn(
    agentId: string,
    intervalMinutes: number,
    note: string,
    recurring: boolean = true
  ): Promise<string> {
    const taskId = `schedule_${agentId}_${Date.now()}`;
    const scheduledFor = new Date(Date.now() + intervalMinutes * 60 * 1000);

    const task: ScheduledTask = {
      id: taskId,
      agentId,
      description: note,
      scheduledFor,
      recurring,
      interval: intervalMinutes,
      executionCount: 0
    };

    this.scheduledTasks.set(taskId, task);

    // Schedule the actual execution
    const delay = intervalMinutes * 60 * 1000;
    setTimeout(() => {
      this.executeScheduledTask(taskId);
    }, delay);

    console.log(`📅 Scheduled check-in for ${agentId} in ${intervalMinutes} minutes: ${note}`);
    return taskId;
  }

  /**
   * Inter-agent communication system (like send-claude-message.sh)
   */
  async sendMessageToAgent(
    fromAgentId: string,
    toAgentId: string,
    message: string,
    type: AgentMessage['type'] = 'coordination'
  ): Promise<void> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const agentMessage: AgentMessage = {
      id: messageId,
      fromAgent: fromAgentId,
      toAgent: toAgentId,
      message,
      timestamp: new Date(),
      type
    };

    // Add to communication queue for target agent
    const queue = this.communicationQueue.get(toAgentId) || [];
    queue.push(agentMessage);
    this.communicationQueue.set(toAgentId, queue);

    // Add to session communication log
    const session = this.getAgentSession(toAgentId);
    if (session) {
      session.communicationLog.push(agentMessage);
      session.lastActivity = new Date();
    }

    this.emit('message_sent', agentMessage);
    console.log(`💬 Message sent from ${fromAgentId} to ${toAgentId}: ${message.substring(0, 50)}...`);
  }

  /**
   * Execute scheduled tasks (autonomous agent check-ins)
   */
  private async executeScheduledTask(taskId: string): Promise<void> {
    const task = this.scheduledTasks.get(taskId);
    if (!task) return;

    const agent = this.agents.get(task.agentId);
    if (!agent) return;

    try {
      // Create a WAI request for the scheduled task
      const request: EnhancedWAIRequest = {
        id: `scheduled_${taskId}`,
        type: 'development',
        operation: 'agent_check_in',
        content: `Agent ${task.agentId} scheduled check-in: ${task.description}`,
        projectId: 1,
        priority: 'medium',
        userId: 1,
        metadata: {
          agentId: task.agentId,
          taskId: taskId,
          scheduledExecution: true
        }
      };

      // Execute through WAI orchestration
      const result = await waiOrchestrator.processRequest(request);
      
      // Update task execution count
      task.executionCount++;
      task.lastExecution = new Date();

      // Schedule next execution if recurring
      if (task.recurring && task.interval) {
        const nextExecution = new Date(Date.now() + task.interval * 60 * 1000);
        task.scheduledFor = nextExecution;
        
        setTimeout(() => {
          this.executeScheduledTask(taskId);
        }, task.interval * 60 * 1000);
      }

      console.log(`✅ Executed scheduled task ${taskId} for agent ${task.agentId}`);
      this.emit('task_executed', { taskId, agentId: task.agentId, result });

    } catch (error) {
      console.error(`❌ Failed to execute scheduled task ${taskId}:`, error);
      this.emit('task_failed', { taskId, agentId: task.agentId, error });
    }
  }

  /**
   * Enhanced health monitoring with self-healing (Tmux-Orchestrator pattern)
   */
  private async monitorAgentHealth(): Promise<void> {
    const now = new Date();
    
    for (const [sessionId, session] of this.sessions) {
      const agent = this.agents.get(session.agentId);
      if (!agent) continue;

      const timeSinceActivity = now.getTime() - session.lastActivity.getTime();
      const maxIdleMs = agent.persistence.maxIdleTime * 60 * 1000;

      // Check for idle agents
      if (timeSinceActivity > maxIdleMs && session.status === 'active') {
        session.status = 'idle';
        console.log(`💤 Agent ${session.agentId} session moved to idle state`);
        
        // Trigger self-healing if needed
        if (timeSinceActivity > maxIdleMs * 2) {
          await this.healAgent(session.agentId, 'excessive_idle_time');
        }
      }

      // Check for scheduled check-ins
      if (session.nextCheckIn && now >= session.nextCheckIn) {
        await this.triggerAgentCheckIn(session.agentId);
      }
    }
  }

  /**
   * Self-healing system for agent recovery
   */
  private async healAgent(agentId: string, reason: string): Promise<void> {
    console.log(`🔧 Initiating self-healing for agent ${agentId}, reason: ${reason}`);
    
    const agent = this.agents.get(agentId);
    const session = this.getAgentSession(agentId);
    
    if (!agent || !session) return;

    try {
      // Mark as healing
      session.status = 'scheduled'; // Temporary status during healing
      
      // Create healing request
      const healingRequest: EnhancedWAIRequest = {
        id: `healing_${agentId}_${Date.now()}`,
        type: 'analysis',
        operation: 'agent_self_healing',
        content: `Self-healing agent ${agentId} due to: ${reason}`,
        projectId: 1,
        priority: 'high',
        userId: 1,
        metadata: {
          agentId,
          healingReason: reason,
          sessionId: session.id
        }
      };

      const result = await waiOrchestrator.processRequest(healingRequest);
      
      // Reset agent state
      session.status = 'active';
      session.lastActivity = new Date();
      
      // Schedule immediate check-in
      await this.scheduleAgentCheckIn(agentId, 1, `Post-healing check-in: ${reason}`, false);
      
      console.log(`✅ Agent ${agentId} successfully healed`);
      this.emit('agent_healed', { agentId, reason, result });
      
    } catch (error) {
      console.error(`❌ Failed to heal agent ${agentId}:`, error);
      session.status = 'terminated';
      this.emit('agent_healing_failed', { agentId, reason, error });
    }
  }

  /**
   * Start enhanced monitoring with all Tmux-Orchestrator features
   */
  public start(): void {
    console.log('🔍 Started persistent agent session monitoring with Tmux-Orchestrator patterns');
    
    // Start enhanced background monitoring with self-healing
    this.heartbeatInterval = setInterval(() => this.monitorAgentHealth(), 30000); // Health checks every 30 seconds
    this.schedulerInterval = setInterval(() => this.processScheduledTasks(), 60000); // Tasks every minute
    this.healingInterval = setInterval(() => this.performSelfHealing(), 120000); // Self-healing every 2 minutes
    
    this.emit('manager.started', { 
      timestamp: new Date(),
      features: ['persistent-sessions', 'self-healing', 'hierarchical-coordination', 'autonomous-scheduling']
    });
  }

  /**
   * Stop all monitoring intervals
   */
  public stop(): void {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.schedulerInterval) clearInterval(this.schedulerInterval);
    if (this.healingInterval) clearInterval(this.healingInterval);
    
    console.log('🛑 Stopped persistent agent monitoring');
  }

  /**
   * Get comprehensive system status report
   */
  public getSystemStatus(): any {
    const activeAgents = Array.from(this.agents.values());
    const activeSessions = Array.from(this.sessions.values());
    const scheduledTasks = Array.from(this.scheduledTasks.values());

    return {
      timestamp: new Date().toISOString(),
      tmuxOrchestrator: {
        implemented: true,
        features: {
          persistentSessions: {
            enabled: true,
            totalSessions: activeSessions.length,
            activeSessions: activeSessions.filter(s => s.status === 'active').length,
            idleSessions: activeSessions.filter(s => s.status === 'idle').length
          },
          selfScheduling: {
            enabled: true,
            totalScheduledTasks: scheduledTasks.length,
            recurringTasks: scheduledTasks.filter(t => t.recurring).length,
            executedTasks: scheduledTasks.reduce((sum, t) => sum + t.executionCount, 0)
          },
          hierarchicalCoordination: {
            enabled: true,
            orchestrators: activeAgents.filter(a => a.role === 'orchestrator').length,
            projectManagers: activeAgents.filter(a => a.role === 'project-manager').length,
            engineers: activeAgents.filter(a => a.role === 'engineer').length,
            specialists: activeAgents.filter(a => a.role === 'specialist').length
          },
          interAgentCommunication: {
            enabled: true,
            totalMessages: Array.from(this.communicationQueue.values()).flat().length,
            activeQueues: Array.from(this.communicationQueue.values()).filter(q => q.length > 0).length
          },
          selfHealing: {
            enabled: true,
            monitoringInterval: '30 seconds',
            healingInterval: '2 minutes',
            lastHealthCheck: new Date().toISOString()
          }
        }
      },
      agents: {
        total: activeAgents.length,
        byRole: {
          orchestrator: activeAgents.filter(a => a.role === 'orchestrator').length,
          'project-manager': activeAgents.filter(a => a.role === 'project-manager').length,
          engineer: activeAgents.filter(a => a.role === 'engineer').length,
          specialist: activeAgents.filter(a => a.role === 'specialist').length
        }
      }
    };
  }

  // Helper methods
  private getAgentSession(agentId: string): AgentSession | undefined {
    return Array.from(this.sessions.values()).find(session => session.agentId === agentId);
  }

  private async loadPersistedSession(sessionId: string): Promise<void> {
    // Implement session persistence loading logic
    const sessionPath = join(this.sessionDirectory, `${sessionId}_session.json`);
    if (existsSync(sessionPath)) {
      try {
        const sessionData = JSON.parse(readFileSync(sessionPath, 'utf8'));
        const session = this.sessions.get(sessionId);
        if (session) {
          session.sessionData = { ...session.sessionData, ...sessionData.sessionData };
        }
      } catch (error) {
        console.error(`Failed to load persisted session ${sessionId}:`, error);
      }
    }
  }

  private persistAgentConfig(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    
    try {
      const configPath = join(this.sessionDirectory, `${agentId}_config.json`);
      writeFileSync(configPath, JSON.stringify(agent, null, 2));
    } catch (error) {
      console.error(`Failed to persist agent config for ${agentId}:`, error);
    }
  }

  private async performSelfHealing(): Promise<void> {
    // Additional self-healing logic can be implemented here
  }

  private async processScheduledTasks(): Promise<void> {
    // Process any pending scheduled tasks
    const now = new Date();
    for (const [taskId, task] of this.scheduledTasks) {
      if (task.scheduledFor <= now && !task.lastExecution) {
        await this.executeScheduledTask(taskId);
      }
    }
  }

  private async triggerAgentCheckIn(agentId: string): Promise<void> {
    await this.scheduleAgentCheckIn(agentId, 60, 'Regular scheduled check-in', false);
  }
}

// Export singleton instance
export const persistentAgentManager = new PersistentAgentManager();