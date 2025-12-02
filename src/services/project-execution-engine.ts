/**
 * Project Execution Engine - Real-time Project Orchestration
 * Manages complete project lifecycle with intelligent agent coordination
 */

import { EventEmitter } from 'events';
import { WebSocket } from 'ws';
import { storage } from '../storage-enhanced';
import { waiOrchestrator } from './unified-orchestration-client';
import { projectManagementService } from './project-management';
import { projectMemoryManager } from './project-memory-manager';
import { ResourceManager } from './resource-manager';
import { AgentCoordinator } from './agent-communication';

export interface ExecutionPhase {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'paused';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  estimatedDuration: number;
  agents: AssignedAgent[];
  tasks: ExecutionTask[];
  dependencies: string[];
  output?: any;
  metrics?: PhaseMetrics;
}

export interface ExecutionTask {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  assignedAgent: string;
  estimatedHours: number;
  actualHours?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  output?: any;
  startTime?: Date;
  endTime?: Date;
}

export interface AssignedAgent {
  id: string;
  name: string;
  type: string;
  role: string;
  status: 'active' | 'idle' | 'working' | 'completed' | 'error';
  currentTask?: string;
  progress: number;
  workload: number;
  performance: AgentPerformance;
  allocation: ResourceAllocation;
}

export interface AgentPerformance {
  efficiency: number;
  quality: number;
  speed: number;
  reliability: number;
  tasksCompleted: number;
  averageTaskTime: number;
  errorRate: number;
}

export interface ResourceAllocation {
  cpuUsage: number;
  memoryUsage: number;
  networkUsage: number;
  priority: number;
  maxConcurrentTasks: number;
}

export interface PhaseMetrics {
  completionRate: number;
  efficiency: number;
  quality: number;
  timeToComplete: number;
  resourceUtilization: number;
  errorCount: number;
}

export interface ProjectExecutionStatus {
  projectId: number;
  status: 'initializing' | 'running' | 'paused' | 'completed' | 'failed';
  currentPhase: string;
  overallProgress: number;
  phases: ExecutionPhase[];
  activeAgents: AssignedAgent[];
  metrics: ProjectMetrics;
  estimatedCompletion: Date;
  actualCompletion?: Date;
}

export interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageTaskTime: number;
  totalCost: number;
  efficiency: number;
  quality: number;
}

export interface ExecutionResult {
  success: boolean;
  projectId: number;
  executionId: string;
  status: ProjectExecutionStatus;
  message: string;
  timestamp: Date;
}

export class ProjectExecutionEngine extends EventEmitter {
  private activeExecutions: Map<number, ProjectExecutionStatus> = new Map();
  private executionHistory: Map<number, ProjectExecutionStatus[]> = new Map();
  private agentPool: Map<string, AssignedAgent> = new Map();
  private resourceManager: ResourceManager;
  private agentCoordinator: AgentCoordinator;
  private websocketConnections: Map<number, WebSocket[]> = new Map();

  constructor() {
    super();
    this.resourceManager = new ResourceManager();
    this.agentCoordinator = new AgentCoordinator();
    this.initializeAgentPool();
    this.startHealthMonitoring();
    this.setupEventListeners();
    this.setupProjectIntegrations();
  }

  private initializeAgentPool() {
    console.log('🔧 Initializing 39-agent pool for project execution');
    
    // Executive Agents
    this.createAgent('cto', 'Chief Technology Officer', 'executive', 95);
    this.createAgent('cpo', 'Chief Product Officer', 'executive', 92);
    this.createAgent('cmo', 'Chief Marketing Officer', 'executive', 90);
    this.createAgent('program-manager', 'Program Manager', 'executive', 88);

    // Architecture Agents
    this.createAgent('system-architect', 'System Architect', 'architecture', 94);
    this.createAgent('data-architect', 'Data Architect', 'architecture', 91);
    this.createAgent('security-architect', 'Security Architect', 'architecture', 93);

    // Development Agents
    this.createAgent('fullstack-developer-1', 'Fullstack Developer 1', 'development', 89);
    this.createAgent('fullstack-developer-2', 'Fullstack Developer 2', 'development', 87);
    this.createAgent('fullstack-developer-3', 'Fullstack Developer 3', 'development', 85);
    this.createAgent('frontend-developer-1', 'Frontend Developer 1', 'development', 90);
    this.createAgent('frontend-developer-2', 'Frontend Developer 2', 'development', 88);
    this.createAgent('backend-developer-1', 'Backend Developer 1', 'development', 91);
    this.createAgent('backend-developer-2', 'Backend Developer 2', 'development', 89);
    this.createAgent('mobile-developer', 'Mobile Developer', 'development', 86);
    this.createAgent('database-developer', 'Database Developer', 'development', 92);

    // Quality Agents
    this.createAgent('qa-engineer-1', 'QA Engineer 1', 'quality', 87);
    this.createAgent('qa-engineer-2', 'QA Engineer 2', 'quality', 85);
    this.createAgent('qa-engineer-3', 'QA Engineer 3', 'quality', 84);
    this.createAgent('devops-engineer', 'DevOps Engineer', 'quality', 93);
    this.createAgent('security-engineer', 'Security Engineer', 'quality', 91);
    this.createAgent('performance-engineer', 'Performance Engineer', 'quality', 88);

    // Design Agents
    this.createAgent('ui-ux-designer', 'UI/UX Designer', 'design', 86);
    this.createAgent('art-director', 'Art Director', 'design', 84);

    // Data Agents
    this.createAgent('data-scientist', 'Data Scientist', 'data', 89);
    this.createAgent('data-engineer', 'Data Engineer', 'data', 87);
    this.createAgent('ml-engineer', 'ML Engineer', 'data', 90);
    this.createAgent('analytics-engineer', 'Analytics Engineer', 'data', 85);

    // Content Agents
    this.createAgent('content-strategist', 'Content Strategist', 'content', 83);
    this.createAgent('copywriter', 'Copywriter', 'content', 82);
    this.createAgent('technical-writer', 'Technical Writer', 'content', 84);

    // Specialized Agents
    this.createAgent('api-specialist', 'API Specialist', 'specialized', 88);
    this.createAgent('integration-specialist', 'Integration Specialist', 'specialized', 86);
    this.createAgent('deployment-specialist', 'Deployment Specialist', 'specialized', 89);
    this.createAgent('monitoring-specialist', 'Monitoring Specialist', 'specialized', 87);
    this.createAgent('documentation-specialist', 'Documentation Specialist', 'specialized', 83);

    console.log(`✅ Agent pool initialized with ${this.agentPool.size} agents`);
  }

  private createAgent(id: string, name: string, type: string, efficiency: number) {
    const agent: AssignedAgent = {
      id,
      name,
      type,
      role: name,
      status: 'idle',
      progress: 0,
      workload: 0,
      performance: {
        efficiency,
        quality: 80 + Math.random() * 15,
        speed: 75 + Math.random() * 20,
        reliability: 85 + Math.random() * 10,
        tasksCompleted: 0,
        averageTaskTime: 0,
        errorRate: Math.random() * 5
      },
      allocation: {
        cpuUsage: 0,
        memoryUsage: 0,
        networkUsage: 0,
        priority: 1,
        maxConcurrentTasks: type === 'executive' ? 3 : 2
      }
    };
    this.agentPool.set(id, agent);
  }

  async startExecution(projectId: number, phases: ExecutionPhase[]): Promise<ExecutionResult> {
    try {
      console.log(`🚀 Starting execution for project ${projectId}`);

      // Create project memory context
      const projectName = `Project ${projectId}`;
      await projectMemoryManager.createProjectMemory(projectId, projectName);

      // Create project management board
      const board = await projectManagementService.createProjectBoard(
        projectId,
        projectName,
        'AI-powered development project'
      );

      // Register agents for project memory
      for (const [agentId, agent] of this.agentPool.entries()) {
        await projectMemoryManager.registerAgentForProject(projectId, agentId, agent.type);
        projectManagementService.registerAgent(agent);
      }

      // Initialize execution status
      const executionStatus: ProjectExecutionStatus = {
        projectId,
        status: 'initializing',
        currentPhase: phases[0]?.id || '',
        overallProgress: 0,
        phases,
        activeAgents: [],
        metrics: {
          totalTasks: phases.reduce((sum, phase) => sum + phase.tasks.length, 0),
          completedTasks: 0,
          failedTasks: 0,
          averageTaskTime: 0,
          totalCost: 0,
          efficiency: 0,
          quality: 0
        },
        estimatedCompletion: this.calculateEstimatedCompletion(phases)
      };

      // Store execution status
      this.activeExecutions.set(projectId, executionStatus);

      // Create tasks in project management board
      await this.createProjectTasks(board.id, phases);

      // Allocate agents for first phase
      const allocatedAgents = await this.agentCoordinator.allocateAgents(phases[0]);
      executionStatus.activeAgents = allocatedAgents;

      // Start execution
      executionStatus.status = 'running';
      this.startPhaseExecution(projectId, phases[0]);

      // Record project start in memory
      await projectMemoryManager.recordAgentActivity(projectId, 'system', {
        action: 'project_execution_started',
        context: { 
          totalPhases: phases.length,
          totalTasks: executionStatus.metrics.totalTasks,
          boardId: board.id
        },
        success: true
      });

      // Emit execution started event
      this.emit('execution.started', { projectId, executionStatus });

      return {
        success: true,
        projectId,
        executionId: `exec_${projectId}_${Date.now()}`,
        status: executionStatus,
        message: 'Project execution started successfully',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Failed to start execution:', error);
      return {
        success: false,
        projectId,
        executionId: '',
        status: {} as ProjectExecutionStatus,
        message: `Failed to start execution: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  // Create tasks in project management board from execution phases
  private async createProjectTasks(boardId: string, phases: ExecutionPhase[]): Promise<void> {
    for (const phase of phases) {
      const columnId = this.mapPhaseToColumn(phase.name);
      
      for (const task of phase.tasks) {
        await projectManagementService.createTask(
          boardId,
          columnId,
          task.name,
          task.description,
          task.assignedAgent,
          {
            priority: task.priority,
            estimatedHours: task.estimatedHours,
            dependencies: task.dependencies,
            tags: [phase.name, 'auto-generated']
          }
        );
      }
    }
  }

  // Map execution phases to project management columns
  private mapPhaseToColumn(phaseName: string): string {
    const phaseColumnMap: Record<string, string> = {
      'requirements': 'requirements',
      'design': 'design',
      'development': 'development',
      'testing': 'testing',
      'review': 'review',
      'deployment': 'deployment'
    };

    const normalized = phaseName.toLowerCase();
    for (const [key, value] of Object.entries(phaseColumnMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }
    
    return 'backlog'; // Default column
  }

  async pauseExecution(projectId: number): Promise<void> {
    const execution = this.activeExecutions.get(projectId);
    if (execution) {
      execution.status = 'paused';
      execution.activeAgents.forEach(agent => {
        if (agent.status === 'working') {
          agent.status = 'idle';
        }
      });
      this.emit('execution.paused', { projectId, execution });
      console.log(`⏸️ Execution paused for project ${projectId}`);
    }
  }

  async resumeExecution(projectId: number): Promise<void> {
    const execution = this.activeExecutions.get(projectId);
    if (execution && execution.status === 'paused') {
      execution.status = 'running';
      const currentPhase = execution.phases.find(p => p.id === execution.currentPhase);
      if (currentPhase) {
        this.startPhaseExecution(projectId, currentPhase);
      }
      this.emit('execution.resumed', { projectId, execution });
      console.log(`▶️ Execution resumed for project ${projectId}`);
    }
  }

  async terminateExecution(projectId: number): Promise<void> {
    const execution = this.activeExecutions.get(projectId);
    if (execution) {
      execution.status = 'failed';
      execution.activeAgents.forEach(agent => {
        agent.status = 'idle';
        this.returnAgentToPool(agent);
      });
      this.activeExecutions.delete(projectId);
      this.emit('execution.terminated', { projectId, execution });
      console.log(`🛑 Execution terminated for project ${projectId}`);
    }
  }

  async getExecutionStatus(projectId: number): Promise<ProjectExecutionStatus | null> {
    return this.activeExecutions.get(projectId) || null;
  }

  private async startPhaseExecution(projectId: number, phase: ExecutionPhase) {
    const execution = this.activeExecutions.get(projectId);
    if (!execution) return;

    console.log(`🔄 Starting phase: ${phase.name} for project ${projectId}`);
    
    phase.status = 'in_progress';
    phase.startTime = new Date();
    execution.currentPhase = phase.id;

    // Execute tasks in parallel where possible
    const taskPromises = phase.tasks.map(task => this.executeTask(projectId, phase.id, task));
    
    try {
      await Promise.all(taskPromises);
      
      // Phase completed successfully
      phase.status = 'completed';
      phase.endTime = new Date();
      phase.progress = 100;
      
      this.emit('phase.completed', { projectId, phaseId: phase.id, phase });
      
      // Move to next phase or complete project
      await this.moveToNextPhase(projectId);
      
    } catch (error) {
      console.error(`Phase ${phase.name} failed:`, error);
      phase.status = 'failed';
      this.emit('phase.failed', { projectId, phaseId: phase.id, error });
    }
  }

  private async executeTask(projectId: number, phaseId: string, task: ExecutionTask): Promise<void> {
    const execution = this.activeExecutions.get(projectId);
    if (!execution) return;

    console.log(`📝 Executing task: ${task.name} (${task.id})`);
    
    task.status = 'in_progress';
    task.startTime = new Date();
    
    // Find assigned agent
    const agent = execution.activeAgents.find(a => a.id === task.assignedAgent);
    if (!agent) {
      throw new Error(`Agent ${task.assignedAgent} not found`);
    }

    agent.status = 'working';
    agent.currentTask = task.name;
    agent.progress = 0;

    // Simulate task execution with real-time progress updates
    const taskDuration = task.estimatedHours * 1000; // Convert to ms for demo
    const updateInterval = taskDuration / 10; // 10 updates per task
    
    return new Promise((resolve, reject) => {
      const progressInterval = setInterval(() => {
        if (task.status !== 'in_progress') {
          clearInterval(progressInterval);
          return;
        }

        task.progress = Math.min(task.progress + 10, 100);
        agent.progress = task.progress;

        this.emit('task.progress', { projectId, phaseId, taskId: task.id, progress: task.progress });

        if (task.progress >= 100) {
          clearInterval(progressInterval);
          task.status = 'completed';
          task.endTime = new Date();
          task.actualHours = (task.endTime.getTime() - task.startTime!.getTime()) / (1000 * 60 * 60);
          
          agent.status = 'idle';
          agent.currentTask = undefined;
          agent.progress = 0;
          agent.performance.tasksCompleted++;
          agent.performance.averageTaskTime = 
            (agent.performance.averageTaskTime + task.actualHours) / agent.performance.tasksCompleted;

          this.emit('task.completed', { projectId, phaseId, taskId: task.id, task });
          resolve();
        }
      }, updateInterval);

      // Simulate potential task failure
      if (Math.random() < 0.05) { // 5% chance of failure
        setTimeout(() => {
          clearInterval(progressInterval);
          task.status = 'failed';
          agent.status = 'error';
          agent.performance.errorRate++;
          this.emit('task.failed', { projectId, phaseId, taskId: task.id, error: 'Task execution failed' });
          reject(new Error('Task execution failed'));
        }, Math.random() * taskDuration);
      }
    });
  }

  private async moveToNextPhase(projectId: number): Promise<void> {
    const execution = this.activeExecutions.get(projectId);
    if (!execution) return;

    const currentPhaseIndex = execution.phases.findIndex(p => p.id === execution.currentPhase);
    const nextPhaseIndex = currentPhaseIndex + 1;

    if (nextPhaseIndex < execution.phases.length) {
      // Move to next phase
      const nextPhase = execution.phases[nextPhaseIndex];
      
      // Reallocate agents for next phase
      const newAgents = await this.agentCoordinator.allocateAgents(nextPhase);
      execution.activeAgents = newAgents;
      
      // Start next phase
      this.startPhaseExecution(projectId, nextPhase);
    } else {
      // Project completed
      execution.status = 'completed';
      execution.actualCompletion = new Date();
      execution.overallProgress = 100;
      
      // Return all agents to pool
      execution.activeAgents.forEach(agent => this.returnAgentToPool(agent));
      
      this.emit('execution.completed', { projectId, execution });
      console.log(`🎉 Project ${projectId} completed successfully`);
    }
  }

  private returnAgentToPool(agent: AssignedAgent): void {
    agent.status = 'idle';
    agent.currentTask = undefined;
    agent.progress = 0;
    agent.workload = 0;
    this.agentPool.set(agent.id, agent);
  }

  private calculateEstimatedCompletion(phases: ExecutionPhase[]): Date {
    const totalHours = phases.reduce((sum, phase) => 
      sum + phase.tasks.reduce((taskSum, task) => taskSum + task.estimatedHours, 0), 0
    );
    
    return new Date(Date.now() + totalHours * 60 * 60 * 1000);
  }

  private startHealthMonitoring(): void {
    setInterval(() => {
      this.monitorExecutionHealth();
    }, 30000); // Check every 30 seconds
  }

  private monitorExecutionHealth(): void {
    this.activeExecutions.forEach((execution, projectId) => {
      // Check for stuck tasks
      execution.phases.forEach(phase => {
        phase.tasks.forEach(task => {
          if (task.status === 'in_progress' && task.startTime) {
            const taskAge = Date.now() - task.startTime.getTime();
            const expectedDuration = task.estimatedHours * 60 * 60 * 1000;
            
            if (taskAge > expectedDuration * 2) {
              console.warn(`Task ${task.id} is taking longer than expected`);
              this.emit('task.overdue', { projectId, taskId: task.id, task });
            }
          }
        });
      });
      
      // Check agent health
      execution.activeAgents.forEach(agent => {
        if (agent.status === 'error') {
          this.handleAgentError(projectId, agent);
        }
      });
    });
  }

  private handleAgentError(projectId: number, agent: AssignedAgent): void {
    console.log(`🔧 Handling agent error for ${agent.id}`);
    
    // Try to reassign tasks to other agents
    const execution = this.activeExecutions.get(projectId);
    if (execution) {
      // Find a replacement agent
      const replacementAgent = this.agentCoordinator.findReplacementAgent(agent.type);
      if (replacementAgent) {
        // Replace the agent
        const index = execution.activeAgents.findIndex(a => a.id === agent.id);
        execution.activeAgents[index] = replacementAgent;
        this.emit('agent.replaced', { projectId, oldAgent: agent, newAgent: replacementAgent });
      }
    }
  }

  // WebSocket management for real-time updates
  subscribeToProject(projectId: number, ws: WebSocket): void {
    if (!this.websocketConnections.has(projectId)) {
      this.websocketConnections.set(projectId, []);
    }
    this.websocketConnections.get(projectId)!.push(ws);
    
    ws.on('close', () => {
      const connections = this.websocketConnections.get(projectId) || [];
      const index = connections.indexOf(ws);
      if (index > -1) {
        connections.splice(index, 1);
      }
    });
  }

  private broadcastToProject(projectId: number, message: any): void {
    const connections = this.websocketConnections.get(projectId) || [];
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  // Event handlers for real-time updates
  private setupEventListeners() {
    // Set up event listeners for real-time updates
    this.on('execution.started', (data) => {
      this.broadcastToProject(data.projectId, {
        type: 'execution.started',
        data: data.executionStatus
      });
    });

    this.on('phase.completed', (data) => {
      this.broadcastToProject(data.projectId, {
        type: 'phase.completed',
        data: data.phase
      });
    });

    this.on('task.progress', (data) => {
      this.broadcastToProject(data.projectId, {
        type: 'task.progress',
        data: { taskId: data.taskId, progress: data.progress }
      });
    });

    this.on('execution.completed', (data) => {
      this.broadcastToProject(data.projectId, {
        type: 'execution.completed',
        data: data.execution
      });
    });
    
    console.log('🎯 Project Execution Engine initialized with real-time capabilities');
  }

  // Setup project management and memory integrations
  private setupProjectIntegrations(): void {
    // Listen to project management events
    projectManagementService.on('task_created', async (event) => {
      await this.handleTaskCreated(event);
    });

    projectManagementService.on('task_completed', async (event) => {
      await this.handleTaskCompleted(event);
    });

    projectManagementService.on('agent_assigned', async (event) => {
      await this.handleAgentAssigned(event);
    });

    // Listen to memory events
    projectMemoryManager.on('project_memory_created', async (event) => {
      console.log(`🧠 Memory context created for project ${event.projectId}`);
    });

    console.log('🔗 Project management and memory integrations setup completed');
  }

  // Handle project management events
  private async handleTaskCreated(event: any): Promise<void> {
    const { projectId, boardId, data: task } = event.data;
    
    // Record task creation in memory
    await projectMemoryManager.recordAgentActivity(projectId, 'system', {
      action: 'task_created',
      context: { taskId: task.id, title: task.title, boardId },
      success: true
    });

    // Broadcast to project subscribers
    this.broadcastToProject(projectId, {
      type: 'project_task_created',
      data: { boardId, task }
    });
  }

  private async handleTaskCompleted(event: any): Promise<void> {
    const { projectId, data: task } = event.data;
    
    // Record task completion in memory
    if (task.assignedAgent) {
      await projectMemoryManager.recordTaskCompletion(projectId, task.assignedAgent.id, task.id, {
        startTime: task.createdAt,
        endTime: new Date(),
        status: 'completed',
        actions: [],
        learnings: [],
        challenges: [],
        solutions: [],
        codeChanges: []
      });
    }

    // Broadcast to project subscribers
    this.broadcastToProject(projectId, {
      type: 'project_task_completed',
      data: { task }
    });
  }

  private async handleAgentAssigned(event: any): Promise<void> {
    const { projectId, data } = event.data;
    const { task, agent } = data;
    
    // Record agent assignment in memory
    await projectMemoryManager.recordAgentActivity(projectId, agent.id, {
      action: 'task_assigned',
      context: { taskId: task.id, taskTitle: task.title },
      success: true
    });

    // Broadcast to project subscribers
    this.broadcastToProject(projectId, {
      type: 'project_agent_assigned',
      data: { task, agent }
    });
  }
}

// Resource Manager for intelligent resource allocation
class ResourceManager {
  private resourceUsage: Map<string, number> = new Map();
  private maxResources = 100;

  async allocateResources(agentId: string, requirements: number): Promise<boolean> {
    const currentUsage = this.resourceUsage.get(agentId) || 0;
    const totalUsage = Array.from(this.resourceUsage.values()).reduce((sum, usage) => sum + usage, 0);
    
    if (totalUsage + requirements <= this.maxResources) {
      this.resourceUsage.set(agentId, currentUsage + requirements);
      return true;
    }
    return false;
  }

  async releaseResources(agentId: string, amount: number): Promise<void> {
    const currentUsage = this.resourceUsage.get(agentId) || 0;
    this.resourceUsage.set(agentId, Math.max(0, currentUsage - amount));
  }

  getResourceUtilization(): number {
    const totalUsage = Array.from(this.resourceUsage.values()).reduce((sum, usage) => sum + usage, 0);
    return (totalUsage / this.maxResources) * 100;
  }
}

// Agent Coordinator for intelligent agent allocation
class AgentCoordinator {
  async allocateAgents(phase: ExecutionPhase): Promise<AssignedAgent[]> {
    const requiredAgents: AssignedAgent[] = [];
    
    // Allocate agents based on phase requirements
    for (const agentType of phase.agents) {
      const agent = this.findAvailableAgent(agentType);
      if (agent) {
        agent.status = 'active';
        agent.workload = 75; // Set workload
        requiredAgents.push(agent);
      }
    }
    
    return requiredAgents;
  }

  findAvailableAgent(agentType: string): AssignedAgent | null {
    // Find the best available agent of the requested type
    const availableAgents = Array.from(projectExecutionEngine.agentPool.values())
      .filter(agent => agent.type === agentType || agent.role.toLowerCase().includes(agentType.toLowerCase()))
      .filter(agent => agent.status === 'idle')
      .sort((a, b) => b.performance.efficiency - a.performance.efficiency);
    
    return availableAgents[0] || null;
  }

  findReplacementAgent(agentType: string): AssignedAgent | null {
    return this.findAvailableAgent(agentType);
  }
}

// Export singleton instance
export const projectExecutionEngine = new ProjectExecutionEngine();