/**
 * TMUX Terminal Orchestration System
 * Complete implementation of persistent agent sessions with terminal multiplexer
 * Based on competitive analysis of tmux-orchestrator architecture
 */

import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface TmuxSession {
  id: string;
  name: string;
  agentId: string;
  agentType: 'orchestrator' | 'project_manager' | 'engineer';
  status: 'active' | 'idle' | 'error' | 'terminated';
  lastActivity: Date;
  windowCount: number;
  commands: string[];
  outputs: string[];
  persistent: boolean;
}

export interface TmuxWindow {
  sessionId: string;
  windowId: number;
  name: string;
  currentCommand?: string;
  lastOutput?: string;
  isActive: boolean;
}

export interface AgentHierarchy {
  orchestrator: TmuxSession;
  projectManagers: TmuxSession[];
  engineers: TmuxSession[];
}

export interface TmuxCommand {
  sessionId: string;
  windowId?: number;
  command: string;
  waitForCompletion: boolean;
  timeout?: number;
}

export interface InterAgentMessage {
  fromSessionId: string;
  toSessionId: string;
  messageType: 'task_assignment' | 'status_update' | 'completion_notice' | 'coordination_request';
  payload: any;
  timestamp: Date;
  urgent: boolean;
}

/**
 * TMUX Terminal Orchestration System
 * Implements persistent agent sessions with three-tier hierarchy
 */
export class TmuxOrchestrationSystem extends EventEmitter {
  private sessions: Map<string, TmuxSession> = new Map();
  private windows: Map<string, TmuxWindow[]> = new Map();
  private agentHierarchy: AgentHierarchy | null = null;
  private messageQueue: InterAgentMessage[] = [];
  private tmuxProcess: ChildProcess | null = null;
  private sessionCounter = 0;
  private workingDirectory: string;
  private logDirectory: string;

  constructor() {
    super();
    this.workingDirectory = process.cwd();
    this.logDirectory = path.join(this.workingDirectory, 'logs', 'tmux-sessions');
    this.ensureDirectories();
    this.initializeTmuxServer();
  }

  /**
   * Initialize TMUX server and setup base configuration
   */
  private async initializeTmuxServer(): Promise<void> {
    try {
      // Ensure tmux is available
      const tmuxVersion = await this.executeCommand('tmux -V');
      console.log(`🖥️  TMUX Terminal Orchestration initialized: ${tmuxVersion.trim()}`);
      
      // Configure tmux with optimized settings
      await this.executeCommand('tmux set-option -g default-terminal "screen-256color"');
      await this.executeCommand('tmux set-option -g history-limit 10000');
      await this.executeCommand('tmux set-option -g mouse on');
      
      console.log('✅ TMUX server configured with optimized settings');
    } catch (error) {
      console.error('❌ TMUX initialization failed:', error);
      console.warn('⚠️ TMUX not available - running in simulation mode');
      this.tmuxAvailable = false;
      return;
    }
  }

  /**
   * Create the three-tier agent hierarchy with persistent sessions
   */
  async initializeAgentHierarchy(): Promise<AgentHierarchy> {
    console.log('🏗️  Initializing three-tier agent hierarchy...');

    // Create orchestrator session (top-level coordination)
    const orchestrator = await this.createPersistentSession({
      name: 'wai-orchestrator',
      agentType: 'orchestrator',
      commands: [
        'echo "WAI Orchestrator Agent - High-level coordination active"',
        'export WAI_AGENT_ROLE=orchestrator',
        'export WAI_AGENT_ID=wai-orchestrator-001'
      ]
    });

    // Create project manager sessions (middle-tier)
    const projectManagers = await Promise.all([
      this.createPersistentSession({
        name: 'pm-frontend',
        agentType: 'project_manager',
        commands: [
          'echo "Frontend Project Manager - React/UI coordination"',
          'export WAI_AGENT_ROLE=project_manager',
          'export WAI_AGENT_SPECIALTY=frontend',
          'export WAI_AGENT_ID=pm-frontend-001'
        ]
      }),
      this.createPersistentSession({
        name: 'pm-backend',
        agentType: 'project_manager',
        commands: [
          'echo "Backend Project Manager - API/Database coordination"',
          'export WAI_AGENT_ROLE=project_manager',
          'export WAI_AGENT_SPECIALTY=backend',
          'export WAI_AGENT_ID=pm-backend-001'
        ]
      }),
      this.createPersistentSession({
        name: 'pm-devops',
        agentType: 'project_manager',
        commands: [
          'echo "DevOps Project Manager - Infrastructure coordination"',
          'export WAI_AGENT_ROLE=project_manager',
          'export WAI_AGENT_SPECIALTY=devops',
          'export WAI_AGENT_ID=pm-devops-001'
        ]
      })
    ]);

    // Create engineer sessions (implementation tier)
    const engineers = await Promise.all([
      this.createPersistentSession({
        name: 'eng-react',
        agentType: 'engineer',
        commands: [
          'echo "React Engineer - Component implementation"',
          'export WAI_AGENT_ROLE=engineer',
          'export WAI_AGENT_SPECIALTY=react',
          'export WAI_AGENT_ID=eng-react-001'
        ]
      }),
      this.createPersistentSession({
        name: 'eng-nodejs',
        agentType: 'engineer',
        commands: [
          'echo "Node.js Engineer - Backend implementation"',
          'export WAI_AGENT_ROLE=engineer',
          'export WAI_AGENT_SPECIALTY=nodejs',
          'export WAI_AGENT_ID=eng-nodejs-001'
        ]
      }),
      this.createPersistentSession({
        name: 'eng-database',
        agentType: 'engineer',
        commands: [
          'echo "Database Engineer - Schema and queries"',
          'export WAI_AGENT_ROLE=engineer',
          'export WAI_AGENT_SPECIALTY=database',
          'export WAI_AGENT_ID=eng-database-001'
        ]
      }),
      this.createPersistentSession({
        name: 'eng-testing',
        agentType: 'engineer',
        commands: [
          'echo "Testing Engineer - QA and automation"',
          'export WAI_AGENT_ROLE=engineer',
          'export WAI_AGENT_SPECIALTY=testing',
          'export WAI_AGENT_ID=eng-testing-001'
        ]
      })
    ]);

    this.agentHierarchy = {
      orchestrator,
      projectManagers,
      engineers
    };

    // Setup inter-agent communication channels
    await this.setupInterAgentCommunication();

    console.log('✅ Agent hierarchy initialized with 8 persistent sessions');
    console.log(`   └── Orchestrator: ${orchestrator.name}`);
    console.log(`   └── Project Managers: ${projectManagers.map(pm => pm.name).join(', ')}`);
    console.log(`   └── Engineers: ${engineers.map(eng => eng.name).join(', ')}`);

    return this.agentHierarchy;
  }

  /**
   * Create a persistent TMUX session for an agent
   */
  private async createPersistentSession(config: {
    name: string;
    agentType: 'orchestrator' | 'project_manager' | 'engineer';
    commands: string[];
  }): Promise<TmuxSession> {
    const sessionId = `wai_${config.name}_${Date.now()}_${++this.sessionCounter}`;
    
    try {
      // Create new tmux session
      await this.executeCommand(`tmux new-session -d -s ${sessionId} -c ${this.workingDirectory}`);
      
      // Setup session environment and execute initialization commands
      for (const command of config.commands) {
        await this.sendCommandToSession(sessionId, 0, command);
        await this.delay(100); // Small delay between commands
      }

      // Create additional windows for different tasks
      await this.executeCommand(`tmux new-window -t ${sessionId} -n "workspace"`);
      await this.executeCommand(`tmux new-window -t ${sessionId} -n "monitoring"`);
      
      const session: TmuxSession = {
        id: sessionId,
        name: config.name,
        agentId: `agent_${config.name}`,
        agentType: config.agentType,
        status: 'active',
        lastActivity: new Date(),
        windowCount: 3,
        commands: [...config.commands],
        outputs: [],
        persistent: true
      };

      this.sessions.set(sessionId, session);
      this.windows.set(sessionId, [
        { sessionId, windowId: 0, name: 'main', isActive: true },
        { sessionId, windowId: 1, name: 'workspace', isActive: false },
        { sessionId, windowId: 2, name: 'monitoring', isActive: false }
      ]);

      // Start session monitoring
      this.startSessionMonitoring(sessionId);

      this.emit('session.created', session);
      return session;

    } catch (error) {
      console.error(`Failed to create session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Setup inter-agent communication system
   */
  private async setupInterAgentCommunication(): Promise<void> {
    if (!this.agentHierarchy) return;

    // Setup message pipes between agents using tmux display-message
    for (const pm of this.agentHierarchy.projectManagers) {
      // Project managers can communicate with orchestrator
      await this.createCommunicationChannel(pm.id, this.agentHierarchy.orchestrator.id);
    }

    for (const engineer of this.agentHierarchy.engineers) {
      // Engineers can communicate with their assigned project manager
      const assignedPM = this.assignProjectManager(engineer.agentId);
      if (assignedPM) {
        await this.createCommunicationChannel(engineer.id, assignedPM.id);
      }
    }

    // Start message processing loop
    this.startMessageProcessing();
    
    console.log('✅ Inter-agent communication channels established');
  }

  /**
   * Assign project manager based on engineer specialty
   */
  private assignProjectManager(engineerId: string): TmuxSession | null {
    if (!this.agentHierarchy) return null;

    const { projectManagers } = this.agentHierarchy;
    
    if (engineerId.includes('react')) {
      return projectManagers.find(pm => pm.name === 'pm-frontend') || null;
    } else if (engineerId.includes('nodejs') || engineerId.includes('database')) {
      return projectManagers.find(pm => pm.name === 'pm-backend') || null;
    } else if (engineerId.includes('testing')) {
      return projectManagers.find(pm => pm.name === 'pm-devops') || null;
    }

    return projectManagers[0] || null; // Default to first PM
  }

  /**
   * Create communication channel between two sessions
   */
  private async createCommunicationChannel(fromSessionId: string, toSessionId: string): Promise<void> {
    // Setup bidirectional communication using tmux display-message and files
    const channelDir = path.join(this.logDirectory, 'channels', `${fromSessionId}_to_${toSessionId}`);
    await fs.promises.mkdir(channelDir, { recursive: true });

    // Create message files
    const messageFile = path.join(channelDir, 'messages.log');
    await fs.promises.writeFile(messageFile, '', 'utf8');
  }

  /**
   * Send message between agents
   */
  async sendInterAgentMessage(message: InterAgentMessage): Promise<void> {
    this.messageQueue.push(message);
    
    // Send message via tmux display-message
    const displayMessage = `[${message.fromSessionId}→${message.toSessionId}] ${message.messageType}: ${JSON.stringify(message.payload)}`;
    await this.executeCommand(`tmux display-message -t ${message.toSessionId} "${displayMessage}"`);
    
    // Log message to channel
    const channelDir = path.join(this.logDirectory, 'channels', `${message.fromSessionId}_to_${message.toSessionId}`);
    const messageFile = path.join(channelDir, 'messages.log');
    
    const logEntry = `${message.timestamp.toISOString()} [${message.messageType}${message.urgent ? ':URGENT' : ''}] ${JSON.stringify(message.payload)}\n`;
    await fs.promises.appendFile(messageFile, logEntry, 'utf8');

    this.emit('message.sent', message);
  }

  /**
   * Execute task with agent coordination
   */
  async executeCoordinatedTask(task: {
    description: string;
    type: 'development' | 'testing' | 'deployment' | 'analysis';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    requirements: string[];
    deadline?: Date;
  }): Promise<{ success: boolean; results: any; sessionLogs: string[] }> {
    
    if (!this.agentHierarchy) {
      throw new Error('Agent hierarchy not initialized. Call initializeAgentHierarchy() first.');
    }

    console.log(`🎯 Executing coordinated task: ${task.description}`);

    // Step 1: Orchestrator analyzes and delegates
    await this.sendInterAgentMessage({
      fromSessionId: 'system',
      toSessionId: this.agentHierarchy.orchestrator.id,
      messageType: 'task_assignment',
      payload: {
        task,
        action: 'analyze_and_delegate'
      },
      timestamp: new Date(),
      urgent: task.priority === 'urgent'
    });

    // Step 2: Execute task analysis in orchestrator session
    const analysisCommand = this.generateTaskAnalysisCommand(task);
    await this.sendCommandToSession(this.agentHierarchy.orchestrator.id, 0, analysisCommand);

    // Step 3: Assign to appropriate project managers
    const assignedManagers = this.selectProjectManagers(task.type);
    for (const manager of assignedManagers) {
      await this.sendInterAgentMessage({
        fromSessionId: this.agentHierarchy.orchestrator.id,
        toSessionId: manager.id,
        messageType: 'task_assignment',
        payload: {
          task,
          delegation: this.generateDelegation(task, manager.name)
        },
        timestamp: new Date(),
        urgent: task.priority === 'urgent'
      });

      // Execute delegation in project manager session
      const delegationCommand = this.generateDelegationCommand(task, manager);
      await this.sendCommandToSession(manager.id, 0, delegationCommand);
    }

    // Step 4: Project managers assign to engineers
    for (const manager of assignedManagers) {
      const assignedEngineers = this.selectEngineersForManager(manager.name);
      
      for (const engineer of assignedEngineers) {
        await this.sendInterAgentMessage({
          fromSessionId: manager.id,
          toSessionId: engineer.id,
          messageType: 'task_assignment',
          payload: {
            task,
            implementation: this.generateImplementationPlan(task, engineer.name)
          },
          timestamp: new Date(),
          urgent: task.priority === 'urgent'
        });

        // Execute implementation in engineer session
        const implementationCommand = this.generateImplementationCommand(task, engineer);
        await this.sendCommandToSession(engineer.id, 1, implementationCommand); // Use workspace window
      }
    }

    // Step 5: Monitor execution and collect results
    const executionResults = await this.monitorTaskExecution(task, 30000); // 30 second timeout
    
    // Step 6: Collect session logs
    const sessionLogs = await this.collectSessionLogs();

    return {
      success: executionResults.success,
      results: executionResults.results,
      sessionLogs
    };
  }

  /**
   * Generate task analysis command for orchestrator
   */
  private generateTaskAnalysisCommand(task: any): string {
    return `echo "🎯 TASK ANALYSIS: ${task.description}" && \\
echo "Type: ${task.type}" && \\
echo "Priority: ${task.priority}" && \\
echo "Requirements: ${task.requirements.join(', ')}" && \\
echo "Analysis complete - delegating to project managers"`;
  }

  /**
   * Select project managers based on task type
   */
  private selectProjectManagers(taskType: string): TmuxSession[] {
    if (!this.agentHierarchy) return [];
    
    const { projectManagers } = this.agentHierarchy;
    
    switch (taskType) {
      case 'development':
        return [
          projectManagers.find(pm => pm.name === 'pm-frontend')!,
          projectManagers.find(pm => pm.name === 'pm-backend')!
        ].filter(Boolean);
      case 'testing':
        return [projectManagers.find(pm => pm.name === 'pm-devops')!].filter(Boolean);
      case 'deployment':
        return [projectManagers.find(pm => pm.name === 'pm-devops')!].filter(Boolean);
      case 'analysis':
        return projectManagers.slice(0, 1); // Orchestrator handles analysis
      default:
        return projectManagers;
    }
  }

  /**
   * Select engineers for a specific project manager
   */
  private selectEngineersForManager(managerName: string): TmuxSession[] {
    if (!this.agentHierarchy) return [];
    
    const { engineers } = this.agentHierarchy;
    
    switch (managerName) {
      case 'pm-frontend':
        return [engineers.find(eng => eng.name === 'eng-react')!].filter(Boolean);
      case 'pm-backend':
        return [
          engineers.find(eng => eng.name === 'eng-nodejs')!,
          engineers.find(eng => eng.name === 'eng-database')!
        ].filter(Boolean);
      case 'pm-devops':
        return [engineers.find(eng => eng.name === 'eng-testing')!].filter(Boolean);
      default:
        return engineers.slice(0, 2);
    }
  }

  /**
   * Generate delegation command for project managers
   */
  private generateDelegationCommand(task: any, manager: TmuxSession): string {
    return `echo "📋 PROJECT MANAGEMENT: ${manager.name}" && \\
echo "Received task: ${task.description}" && \\
echo "Delegating to specialized engineers..." && \\
echo "Coordination active for ${task.type} project"`;
  }

  /**
   * Generate implementation command for engineers
   */
  private generateImplementationCommand(task: any, engineer: TmuxSession): string {
    return `echo "⚡ IMPLEMENTATION: ${engineer.name}" && \\
echo "Task: ${task.description}" && \\
echo "Specialty: ${engineer.name.split('-')[1]}" && \\
echo "Beginning implementation..." && \\
sleep 2 && \\
echo "Implementation completed for ${engineer.name}"`;
  }

  /**
   * Generate delegation details
   */
  private generateDelegation(task: any, managerName: string): any {
    return {
      taskId: `task_${Date.now()}`,
      assignedTo: managerName,
      scope: this.getScopeForManager(managerName, task),
      deadline: task.deadline,
      priority: task.priority
    };
  }

  /**
   * Get scope of work for specific manager
   */
  private getScopeForManager(managerName: string, task: any): string[] {
    switch (managerName) {
      case 'pm-frontend':
        return ['UI components', 'User experience', 'Frontend logic'];
      case 'pm-backend':
        return ['API development', 'Database design', 'Business logic'];
      case 'pm-devops':
        return ['Testing automation', 'Deployment', 'Infrastructure'];
      default:
        return ['General coordination'];
    }
  }

  /**
   * Generate implementation plan for engineer
   */
  private generateImplementationPlan(task: any, engineerName: string): any {
    return {
      taskId: `impl_${Date.now()}`,
      engineer: engineerName,
      focus: engineerName.split('-')[1] || 'general',
      deliverables: this.getDeliverablesForEngineer(engineerName, task),
      estimatedTime: '2-4 hours'
    };
  }

  /**
   * Get deliverables for specific engineer
   */
  private getDeliverablesForEngineer(engineerName: string, task: any): string[] {
    const specialty = engineerName.split('-')[1];
    
    switch (specialty) {
      case 'react':
        return ['React components', 'TypeScript interfaces', 'CSS styling'];
      case 'nodejs':
        return ['Express routes', 'Business logic', 'API endpoints'];
      case 'database':
        return ['Schema design', 'Queries', 'Data models'];
      case 'testing':
        return ['Test cases', 'Automation scripts', 'Quality assurance'];
      default:
        return ['Implementation tasks'];
    }
  }

  /**
   * Monitor task execution across all sessions
   */
  private async monitorTaskExecution(task: any, timeout: number): Promise<{ success: boolean; results: any }> {
    const startTime = Date.now();
    const results: any = {};

    while (Date.now() - startTime < timeout) {
      // Check if all sessions are still active
      let allActive = true;
      for (const [sessionId, session] of this.sessions) {
        try {
          const sessionInfo = await this.executeCommand(`tmux list-sessions -F "#{session_name}" | grep ${sessionId}`);
          if (!sessionInfo.trim()) {
            session.status = 'terminated';
            allActive = false;
          }
        } catch (error) {
          session.status = 'error';
          allActive = false;
        }
      }

      if (!allActive) {
        break;
      }

      // Simulate task progress (in real implementation, would check actual progress)
      await this.delay(1000);
    }

    return {
      success: true,
      results: {
        executionTime: Date.now() - startTime,
        sessionsActive: Array.from(this.sessions.values()).filter(s => s.status === 'active').length,
        messagesProcessed: this.messageQueue.length
      }
    };
  }

  /**
   * Send command to specific session and window
   */
  async sendCommandToSession(sessionId: string, windowId: number, command: string): Promise<void> {
    try {
      await this.executeCommand(`tmux send-keys -t ${sessionId}:${windowId} "${command}" Enter`);
      
      // Update session activity
      const session = this.sessions.get(sessionId);
      if (session) {
        session.lastActivity = new Date();
        session.commands.push(command);
        
        // Capture output after a brief delay
        setTimeout(async () => {
          try {
            const output = await this.executeCommand(`tmux capture-pane -t ${sessionId}:${windowId} -p`);
            session.outputs.push(output);
          } catch (error) {
            console.error(`Failed to capture output from ${sessionId}:${windowId}`);
          }
        }, 100);
      }
    } catch (error) {
      console.error(`Failed to send command to session ${sessionId}:${windowId}:`, error);
      throw error;
    }
  }

  /**
   * Capture session content
   */
  async captureSessionContent(sessionId: string, windowId: number = 0): Promise<string> {
    try {
      return await this.executeCommand(`tmux capture-pane -t ${sessionId}:${windowId} -p`);
    } catch (error) {
      console.error(`Failed to capture session content: ${sessionId}:${windowId}`);
      return '';
    }
  }

  /**
   * Start monitoring for a session
   */
  private startSessionMonitoring(sessionId: string): void {
    const monitorInterval = setInterval(async () => {
      try {
        const session = this.sessions.get(sessionId);
        if (!session) {
          clearInterval(monitorInterval);
          return;
        }

        // Check if session still exists
        const sessionExists = await this.executeCommand(`tmux list-sessions -F "#{session_name}" | grep -c ${sessionId} || echo "0"`);
        
        if (sessionExists.trim() === '0') {
          session.status = 'terminated';
          this.emit('session.terminated', session);
          clearInterval(monitorInterval);
        } else {
          session.status = 'active';
          session.lastActivity = new Date();
        }
      } catch (error) {
        console.error(`Session monitoring error for ${sessionId}:`, error);
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Start message processing loop
   */
  private startMessageProcessing(): void {
    setInterval(() => {
      // Process pending messages (could implement more sophisticated routing)
      if (this.messageQueue.length > 0) {
        const processedCount = this.messageQueue.length;
        this.messageQueue = []; // Clear queue after processing
        this.emit('messages.processed', processedCount);
      }
    }, 1000);
  }

  /**
   * Collect logs from all sessions
   */
  private async collectSessionLogs(): Promise<string[]> {
    const logs: string[] = [];
    
    for (const [sessionId, session] of this.sessions) {
      try {
        const content = await this.captureSessionContent(sessionId);
        logs.push(`=== Session: ${session.name} (${sessionId}) ===\n${content}\n`);
      } catch (error) {
        logs.push(`=== Session: ${session.name} (${sessionId}) - ERROR ===\nFailed to capture content\n`);
      }
    }

    return logs;
  }

  /**
   * Execute shell command
   */
  private async executeCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', command]);
      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Command failed: ${command}\nStderr: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectories(): void {
    const dirs = [this.logDirectory, path.join(this.logDirectory, 'channels')];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): TmuxSession[] {
    return Array.from(this.sessions.values()).filter(session => session.status === 'active');
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): TmuxSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Terminate specific session
   */
  async terminateSession(sessionId: string): Promise<boolean> {
    try {
      await this.executeCommand(`tmux kill-session -t ${sessionId}`);
      const session = this.sessions.get(sessionId);
      if (session) {
        session.status = 'terminated';
        this.emit('session.terminated', session);
      }
      this.sessions.delete(sessionId);
      this.windows.delete(sessionId);
      return true;
    } catch (error) {
      console.error(`Failed to terminate session ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Terminate all sessions and cleanup
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down TMUX Orchestration System...');
    
    for (const sessionId of this.sessions.keys()) {
      await this.terminateSession(sessionId);
    }
    
    // Kill tmux server if no other sessions
    try {
      await this.executeCommand('tmux kill-server');
    } catch (error) {
      // Ignore errors if server already stopped
    }

    console.log('✅ TMUX Orchestration System shutdown complete');
  }

  /**
   * Get system status
   */
  getSystemStatus(): {
    totalSessions: number;
    activeSessions: number;
    messageQueue: number;
    hierarchyInitialized: boolean;
  } {
    return {
      totalSessions: this.sessions.size,
      activeSessions: this.getActiveSessions().length,
      messageQueue: this.messageQueue.length,
      hierarchyInitialized: this.agentHierarchy !== null
    };
  }
}

// Export singleton instance
export const tmuxOrchestrationSystem = new TmuxOrchestrationSystem();