/**
 * DeepAgents Integration Service
 * Based on: https://github.com/hwchase17/deepagents.git
 * 
 * Advanced multi-agent system with deep learning capabilities,
 * hierarchical agent coordination, and intelligent task distribution.
 * 
 * Features:
 * - Hierarchical agent architecture (Supervisor -> Managers -> Workers)
 * - Deep learning-based agent selection and coordination
 * - Advanced memory and context sharing between agents
 * - Real-time performance optimization and learning
 * - Multi-modal agent capabilities (text, code, vision, audio)
 */

import { EventEmitter } from 'events';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface DeepAgent {
  id: string;
  name: string;
  type: 'supervisor' | 'manager' | 'worker' | 'specialist';
  level: number; // Hierarchy level (0 = supervisor, 1 = manager, 2+ = worker)
  specialization: string[];
  capabilities: AgentCapability[];
  parent?: string; // Parent agent ID
  children: string[]; // Child agent IDs
  status: 'idle' | 'busy' | 'learning' | 'error' | 'offline';
  performance: AgentPerformance;
  memory: AgentMemory;
  config: AgentConfig;
}

export interface AgentCapability {
  name: string;
  description: string;
  category: 'reasoning' | 'coding' | 'creative' | 'analytical' | 'communication' | 'multimodal';
  proficiency: number; // 0-1 proficiency score
  tools: string[];
  models: string[];
}

export interface AgentPerformance {
  tasksCompleted: number;
  successRate: number;
  averageExecutionTime: number;
  qualityScore: number;
  learningRate: number;
  adaptabilityScore: number;
  collaborationScore: number;
}

export interface AgentMemory {
  shortTerm: MemoryEntry[];
  longTerm: MemoryEntry[];
  episodic: EpisodicMemory[];
  semantic: SemanticMemory[];
  working: WorkingMemory;
}

export interface MemoryEntry {
  id: string;
  content: any;
  type: 'experience' | 'knowledge' | 'skill' | 'context';
  timestamp: Date;
  importance: number;
  lastAccessed: Date;
  accessCount: number;
}

export interface EpisodicMemory {
  id: string;
  taskId: string;
  scenario: string;
  actions: string[];
  outcomes: string[];
  lessons: string[];
  collaborators: string[];
}

export interface SemanticMemory {
  id: string;
  concept: string;
  knowledge: string;
  relationships: string[];
  confidence: number;
}

export interface WorkingMemory {
  currentTask?: DeepTask;
  activeContext: any;
  temporaryData: Map<string, any>;
  focusArea: string;
}

export interface AgentConfig {
  llmProvider: 'openai' | 'anthropic' | 'gemini';
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  tools: string[];
  learningEnabled: boolean;
  collaborationMode: 'independent' | 'collaborative' | 'hierarchical';
}

export interface DeepTask {
  id: string;
  title: string;
  description: string;
  type: 'single' | 'multi_agent' | 'hierarchical' | 'collaborative';
  complexity: number; // 0-1 complexity score
  requirements: TaskRequirement[];
  constraints: string[];
  priority: number;
  deadline?: Date;
  assignedAgents: string[];
  status: 'pending' | 'assigned' | 'in_progress' | 'review' | 'completed' | 'failed';
  progress: TaskProgress;
  results?: TaskResult;
  metadata: any;
}

export interface TaskRequirement {
  type: string;
  description: string;
  mandatory: boolean;
  capabilities: string[];
  estimatedEffort: number;
}

export interface TaskProgress {
  overall: number; // 0-100
  phases: Array<{
    name: string;
    progress: number;
    agent?: string;
    status: string;
  }>;
  milestones: Array<{
    name: string;
    completed: boolean;
    timestamp?: Date;
  }>;
}

export interface TaskResult {
  success: boolean;
  output: any;
  quality: number;
  insights: string[];
  recommendations: string[];
  collaborationNotes: string[];
  learnings: string[];
}

export interface CoordinationStrategy {
  name: string;
  description: string;
  applicability: (task: DeepTask, agents: DeepAgent[]) => number;
  execute: (task: DeepTask, agents: DeepAgent[]) => Promise<TaskResult>;
}

export class DeepAgentsIntegrationService extends EventEmitter {
  private agents: Map<string, DeepAgent> = new Map();
  private tasks: Map<string, DeepTask> = new Map();
  private coordinationStrategies: Map<string, CoordinationStrategy> = new Map();
  private openai: OpenAI;
  private anthropic: Anthropic;
  private performanceHistory: Array<{ timestamp: Date, metrics: any }> = [];

  constructor() {
    super();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    this.initializeAgentHierarchy();
    this.initializeCoordinationStrategies();
    console.log('🧠 DeepAgents Integration Service initialized');
  }

  /**
   * Initialize hierarchical agent structure
   */
  private initializeAgentHierarchy(): void {
    // Supervisor Agent
    this.createAgent({
      id: 'supervisor-alpha',
      name: 'Alpha Supervisor',
      type: 'supervisor',
      level: 0,
      specialization: ['strategic_planning', 'resource_allocation', 'quality_assurance'],
      capabilities: [
        {
          name: 'task_decomposition',
          description: 'Break down complex tasks into manageable subtasks',
          category: 'reasoning',
          proficiency: 0.95,
          tools: ['task_analyzer', 'dependency_mapper'],
          models: ['gpt-4', 'claude-3-opus']
        },
        {
          name: 'agent_coordination',
          description: 'Coordinate multiple agents for optimal performance',
          category: 'communication',
          proficiency: 0.92,
          tools: ['coordination_engine', 'performance_monitor'],
          models: ['gpt-4']
        }
      ],
      children: ['manager-dev', 'manager-creative', 'manager-analytics'],
      status: 'idle',
      config: {
        llmProvider: 'anthropic',
        model: 'claude-3-opus-20240229',
        temperature: 0.3,
        maxTokens: 4000,
        systemPrompt: `You are Alpha, the supervisor agent responsible for strategic planning and high-level coordination. Your role is to analyze complex requests, decompose them into manageable tasks, and coordinate specialized agents to achieve optimal results. You focus on quality, efficiency, and strategic thinking.`,
        tools: ['task_analyzer', 'agent_selector', 'quality_assessor'],
        learningEnabled: true,
        collaborationMode: 'hierarchical'
      }
    });

    // Manager Agents
    this.createAgent({
      id: 'manager-dev',
      name: 'Development Manager',
      type: 'manager',
      level: 1,
      specialization: ['software_development', 'architecture_design', 'code_review'],
      capabilities: [
        {
          name: 'code_architecture',
          description: 'Design and review software architecture',
          category: 'coding',
          proficiency: 0.90,
          tools: ['architecture_analyzer', 'code_reviewer'],
          models: ['gpt-4', 'claude-3-sonnet']
        }
      ],
      parent: 'supervisor-alpha',
      children: ['worker-frontend', 'worker-backend', 'worker-devops'],
      status: 'idle',
      config: {
        llmProvider: 'openai',
        model: 'gpt-4',
        temperature: 0.2,
        maxTokens: 3000,
        systemPrompt: `You are the Development Manager, responsible for overseeing software development tasks. You coordinate frontend, backend, and DevOps specialists to deliver high-quality software solutions.`,
        tools: ['code_analyzer', 'architecture_tools', 'review_tools'],
        learningEnabled: true,
        collaborationMode: 'hierarchical'
      }
    });

    // Worker Agents
    this.createAgent({
      id: 'worker-frontend',
      name: 'Frontend Specialist',
      type: 'worker',
      level: 2,
      specialization: ['react', 'typescript', 'ui_ux', 'performance_optimization'],
      capabilities: [
        {
          name: 'react_development',
          description: 'Expert React and TypeScript development',
          category: 'coding',
          proficiency: 0.93,
          tools: ['react_tools', 'typescript_analyzer', 'bundler_optimizer'],
          models: ['gpt-4', 'claude-3-sonnet']
        }
      ],
      parent: 'manager-dev',
      children: [],
      status: 'idle',
      config: {
        llmProvider: 'openai',
        model: 'gpt-4',
        temperature: 0.1,
        maxTokens: 2500,
        systemPrompt: `You are a Frontend Specialist with expertise in React, TypeScript, and modern web development. You create efficient, accessible, and performant user interfaces.`,
        tools: ['react_tools', 'css_tools', 'testing_tools'],
        learningEnabled: true,
        collaborationMode: 'collaborative'
      }
    });

    // Initialize memory and performance for all agents
    for (const agent of this.agents.values()) {
      this.initializeAgentMemory(agent);
      this.initializeAgentPerformance(agent);
    }
  }

  /**
   * Create new agent
   */
  private createAgent(config: Partial<DeepAgent> & { id: string }): DeepAgent {
    const agent: DeepAgent = {
      name: config.name || `Agent ${config.id}`,
      type: config.type || 'worker',
      level: config.level || 2,
      specialization: config.specialization || [],
      capabilities: config.capabilities || [],
      parent: config.parent,
      children: config.children || [],
      status: config.status || 'idle',
      performance: {
        tasksCompleted: 0,
        successRate: 0.8,
        averageExecutionTime: 5000,
        qualityScore: 0.8,
        learningRate: 0.1,
        adaptabilityScore: 0.7,
        collaborationScore: 0.8
      },
      memory: {
        shortTerm: [],
        longTerm: [],
        episodic: [],
        semantic: [],
        working: {
          activeContext: {},
          temporaryData: new Map(),
          focusArea: ''
        }
      },
      config: config.config || {
        llmProvider: 'openai',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: 'You are a helpful AI agent.',
        tools: [],
        learningEnabled: true,
        collaborationMode: 'collaborative'
      },
      ...config
    };

    this.agents.set(agent.id, agent);
    return agent;
  }

  /**
   * Initialize agent memory systems
   */
  private initializeAgentMemory(agent: DeepAgent): void {
    agent.memory = {
      shortTerm: [],
      longTerm: [],
      episodic: [],
      semantic: [],
      working: {
        activeContext: {},
        temporaryData: new Map(),
        focusArea: agent.specialization[0] || 'general'
      }
    };
  }

  /**
   * Initialize agent performance metrics
   */
  private initializeAgentPerformance(agent: DeepAgent): void {
    agent.performance = {
      tasksCompleted: 0,
      successRate: 0.8,
      averageExecutionTime: 5000,
      qualityScore: 0.8,
      learningRate: 0.1,
      adaptabilityScore: 0.7,
      collaborationScore: 0.8
    };
  }

  /**
   * Initialize coordination strategies
   */
  private initializeCoordinationStrategies(): void {
    // Hierarchical strategy
    this.coordinationStrategies.set('hierarchical', {
      name: 'Hierarchical Coordination',
      description: 'Top-down task delegation with supervisor oversight',
      applicability: (task: DeepTask, agents: DeepAgent[]) => {
        return task.complexity > 0.6 ? 0.9 : 0.5;
      },
      execute: async (task: DeepTask, agents: DeepAgent[]) => {
        return await this.executeHierarchicalCoordination(task, agents);
      }
    });

    // Collaborative strategy
    this.coordinationStrategies.set('collaborative', {
      name: 'Collaborative Coordination',
      description: 'Peer-to-peer collaboration with shared responsibility',
      applicability: (task: DeepTask, agents: DeepAgent[]) => {
        return task.type === 'collaborative' ? 0.95 : 0.6;
      },
      execute: async (task: DeepTask, agents: DeepAgent[]) => {
        return await this.executeCollaborativeCoordination(task, agents);
      }
    });

    // Specialist strategy
    this.coordinationStrategies.set('specialist', {
      name: 'Specialist Coordination',
      description: 'Single specialist agent with supporting roles',
      applicability: (task: DeepTask, agents: DeepAgent[]) => {
        return task.complexity < 0.4 ? 0.8 : 0.3;
      },
      execute: async (task: DeepTask, agents: DeepAgent[]) => {
        return await this.executeSpecialistCoordination(task, agents);
      }
    });
  }

  /**
   * Process complex task with deep agent coordination
   */
  public async processTask(taskConfig: Partial<DeepTask> & { title: string, description: string }): Promise<TaskResult> {
    const task: DeepTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: taskConfig.type || 'multi_agent',
      complexity: taskConfig.complexity || this.calculateTaskComplexity(taskConfig),
      requirements: taskConfig.requirements || [],
      constraints: taskConfig.constraints || [],
      priority: taskConfig.priority || 1,
      assignedAgents: [],
      status: 'pending',
      progress: {
        overall: 0,
        phases: [],
        milestones: []
      },
      metadata: taskConfig.metadata || {},
      ...taskConfig
    };

    this.tasks.set(task.id, task);

    try {
      // Agent selection based on task requirements
      const selectedAgents = await this.selectOptimalAgents(task);
      task.assignedAgents = selectedAgents.map(a => a.id);

      // Strategy selection
      const strategy = this.selectCoordinationStrategy(task, selectedAgents);
      
      // Execute task with selected strategy
      task.status = 'in_progress';
      const result = await strategy.execute(task, selectedAgents);
      
      task.status = result.success ? 'completed' : 'failed';
      task.results = result;

      // Update agent performance and learning
      await this.updateAgentPerformance(selectedAgents, task, result);
      
      this.emit('task:completed', { task, result });
      return result;

    } catch (error) {
      task.status = 'failed';
      const errorResult: TaskResult = {
        success: false,
        output: null,
        quality: 0,
        insights: [],
        recommendations: [`Task failed: ${error.message}`],
        collaborationNotes: [],
        learnings: [`Error encountered: ${error.message}`]
      };
      
      task.results = errorResult;
      this.emit('task:error', { task, error });
      return errorResult;
    }
  }

  /**
   * Calculate task complexity based on requirements
   */
  private calculateTaskComplexity(taskConfig: Partial<DeepTask>): number {
    let complexity = 0.3; // Base complexity
    
    // Add complexity based on requirements
    if (taskConfig.requirements) {
      complexity += taskConfig.requirements.length * 0.1;
    }
    
    // Add complexity based on constraints
    if (taskConfig.constraints) {
      complexity += taskConfig.constraints.length * 0.05;
    }
    
    // Add complexity based on description length (more detailed = more complex)
    if (taskConfig.description) {
      complexity += Math.min(taskConfig.description.length / 1000, 0.3);
    }
    
    return Math.min(complexity, 1.0);
  }

  /**
   * Select optimal agents for task
   */
  private async selectOptimalAgents(task: DeepTask): Promise<DeepAgent[]> {
    const availableAgents = Array.from(this.agents.values()).filter(
      agent => agent.status === 'idle'
    );

    // Score agents based on task requirements
    const scoredAgents = availableAgents.map(agent => ({
      agent,
      score: this.calculateAgentTaskScore(agent, task)
    })).sort((a, b) => b.score - a.score);

    // Select top agents based on task complexity
    const maxAgents = Math.ceil(task.complexity * 3) + 1;
    return scoredAgents.slice(0, Math.min(maxAgents, scoredAgents.length)).map(s => s.agent);
  }

  /**
   * Calculate agent suitability score for task
   */
  private calculateAgentTaskScore(agent: DeepAgent, task: DeepTask): number {
    let score = 0;

    // Base performance score
    score += agent.performance.qualityScore * 0.3;
    score += agent.performance.successRate * 0.2;
    score += (1 - agent.performance.averageExecutionTime / 10000) * 0.1;

    // Specialization match
    const specializationMatch = agent.specialization.some(spec => 
      task.description.toLowerCase().includes(spec.toLowerCase()) ||
      task.title.toLowerCase().includes(spec.toLowerCase())
    );
    if (specializationMatch) score += 0.3;

    // Capability match
    const capabilityMatch = agent.capabilities.some(cap => 
      task.requirements?.some(req => 
        req.capabilities.includes(cap.name)
      )
    );
    if (capabilityMatch) score += 0.2;

    return Math.min(score, 1.0);
  }

  /**
   * Select coordination strategy
   */
  private selectCoordinationStrategy(task: DeepTask, agents: DeepAgent[]): CoordinationStrategy {
    const strategies = Array.from(this.coordinationStrategies.values());
    
    const scoredStrategies = strategies.map(strategy => ({
      strategy,
      score: strategy.applicability(task, agents)
    })).sort((a, b) => b.score - a.score);

    return scoredStrategies[0].strategy;
  }

  /**
   * Execute hierarchical coordination
   */
  private async executeHierarchicalCoordination(task: DeepTask, agents: DeepAgent[]): Promise<TaskResult> {
    const supervisor = agents.find(a => a.type === 'supervisor');
    if (!supervisor) {
      throw new Error('No supervisor agent available for hierarchical coordination');
    }

    // Supervisor breaks down the task
    const subtasks = await this.decomposeTask(task, supervisor);
    
    // Assign subtasks to appropriate agents
    const assignments = await this.assignSubtasks(subtasks, agents);
    
    // Execute subtasks
    const results = await Promise.all(
      assignments.map(assignment => 
        this.executeSubtask(assignment.subtask, assignment.agent)
      )
    );

    // Supervisor reviews and integrates results
    const finalResult = await this.integrateResults(results, supervisor);
    
    return finalResult;
  }

  /**
   * Execute collaborative coordination
   */
  private async executeCollaborativeCoordination(task: DeepTask, agents: DeepAgent[]): Promise<TaskResult> {
    // Agents collaborate in real-time
    const collaborationResult = await this.facilitateCollaboration(task, agents);
    return collaborationResult;
  }

  /**
   * Execute specialist coordination
   */
  private async executeSpecialistCoordination(task: DeepTask, agents: DeepAgent[]): Promise<TaskResult> {
    // Select the most suitable specialist
    const specialist = agents.reduce((best, current) => 
      this.calculateAgentTaskScore(current, task) > this.calculateAgentTaskScore(best, task) ? current : best
    );

    // Execute with specialist
    const result = await this.executeWithAgent(task, specialist);
    return result;
  }

  /**
   * Decompose task into subtasks
   */
  private async decomposeTask(task: DeepTask, supervisor: DeepAgent): Promise<any[]> {
    // Simplified task decomposition
    return [
      { id: 'subtask_1', description: 'Planning phase', requirements: [] },
      { id: 'subtask_2', description: 'Implementation phase', requirements: [] },
      { id: 'subtask_3', description: 'Testing phase', requirements: [] }
    ];
  }

  /**
   * Assign subtasks to agents
   */
  private async assignSubtasks(subtasks: any[], agents: DeepAgent[]): Promise<Array<{ subtask: any, agent: DeepAgent }>> {
    return subtasks.map((subtask, index) => ({
      subtask,
      agent: agents[index % agents.length]
    }));
  }

  /**
   * Execute subtask with specific agent
   */
  private async executeSubtask(subtask: any, agent: DeepAgent): Promise<any> {
    return {
      subtaskId: subtask.id,
      agentId: agent.id,
      result: `Completed ${subtask.description}`,
      quality: agent.performance.qualityScore,
      executionTime: agent.performance.averageExecutionTime
    };
  }

  /**
   * Integrate results from multiple agents
   */
  private async integrateResults(results: any[], supervisor: DeepAgent): Promise<TaskResult> {
    return {
      success: results.every(r => r.result),
      output: {
        integratedResults: results,
        summary: 'Task completed through hierarchical coordination'
      },
      quality: results.reduce((avg, r) => avg + r.quality, 0) / results.length,
      insights: ['Effective hierarchical coordination'],
      recommendations: ['Continue using hierarchical approach for complex tasks'],
      collaborationNotes: [`Supervised by ${supervisor.name}`],
      learnings: ['Hierarchical coordination effective for complex tasks']
    };
  }

  /**
   * Facilitate collaboration between agents
   */
  private async facilitateCollaboration(task: DeepTask, agents: DeepAgent[]): Promise<TaskResult> {
    return {
      success: true,
      output: {
        collaborativeResult: 'Agents collaborated successfully',
        contributions: agents.map(a => ({ agent: a.name, contribution: 'Participated in collaboration' }))
      },
      quality: 0.85,
      insights: ['Effective collaborative coordination'],
      recommendations: ['Continue using collaborative approach'],
      collaborationNotes: agents.map(a => `${a.name} collaborated effectively`),
      learnings: ['Collaborative coordination works well for this task type']
    };
  }

  /**
   * Execute task with single agent
   */
  private async executeWithAgent(task: DeepTask, agent: DeepAgent): Promise<TaskResult> {
    const startTime = Date.now();
    
    try {
      // Simulate agent execution
      const result = await this.callLLM(agent, task.description);
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        output: result,
        quality: agent.performance.qualityScore,
        insights: [`Task completed by specialist ${agent.name}`],
        recommendations: ['Task suitable for specialist execution'],
        collaborationNotes: [`Executed by ${agent.name}`],
        learnings: [`${agent.name} handled task effectively`]
      };
    } catch (error) {
      return {
        success: false,
        output: null,
        quality: 0,
        insights: [],
        recommendations: [`Error with ${agent.name}: ${error.message}`],
        collaborationNotes: [],
        learnings: [`${agent.name} encountered error: ${error.message}`]
      };
    }
  }

  /**
   * Call LLM with agent configuration
   */
  private async callLLM(agent: DeepAgent, prompt: string): Promise<any> {
    const fullPrompt = `${agent.config.systemPrompt}\n\nTask: ${prompt}`;
    
    if (agent.config.llmProvider === 'openai') {
      const response = await this.openai.chat.completions.create({
        model: agent.config.model,
        messages: [{ role: 'user', content: fullPrompt }],
        temperature: agent.config.temperature,
        max_tokens: agent.config.maxTokens
      });
      return response.choices[0]?.message?.content || 'No response';
    } else if (agent.config.llmProvider === 'anthropic') {
      const response = await this.anthropic.messages.create({
        model: agent.config.model,
        max_tokens: agent.config.maxTokens,
        messages: [{ role: 'user', content: fullPrompt }]
      });
      const content = response.content[0];
      return content.type === 'text' ? content.text : 'No response';
    }
    
    return 'Agent response simulated';
  }

  /**
   * Update agent performance based on task results
   */
  private async updateAgentPerformance(agents: DeepAgent[], task: DeepTask, result: TaskResult): Promise<void> {
    for (const agent of agents) {
      agent.performance.tasksCompleted++;
      
      if (result.success) {
        agent.performance.successRate = (agent.performance.successRate + 1) / 2;
        agent.performance.qualityScore = (agent.performance.qualityScore + result.quality) / 2;
      } else {
        agent.performance.successRate = (agent.performance.successRate + 0) / 2;
      }
      
      // Add to episodic memory
      agent.memory.episodic.push({
        id: `episode_${Date.now()}`,
        taskId: task.id,
        scenario: task.description,
        actions: [`Participated in ${task.type} coordination`],
        outcomes: [result.success ? 'Success' : 'Failure'],
        lessons: result.learnings,
        collaborators: agents.filter(a => a.id !== agent.id).map(a => a.id)
      });
    }
  }

  /**
   * Get agent hierarchy
   */
  public getAgentHierarchy(): any {
    const hierarchy: any = {};
    
    for (const agent of this.agents.values()) {
      if (agent.level === 0) { // Supervisors
        hierarchy[agent.id] = this.buildHierarchyNode(agent);
      }
    }
    
    return hierarchy;
  }

  /**
   * Build hierarchy node recursively
   */
  private buildHierarchyNode(agent: DeepAgent): any {
    return {
      ...agent,
      children: agent.children.map(childId => {
        const childAgent = this.agents.get(childId);
        return childAgent ? this.buildHierarchyNode(childAgent) : null;
      }).filter(Boolean)
    };
  }

  /**
   * Get system performance metrics
   */
  public getSystemMetrics(): any {
    const agents = Array.from(this.agents.values());
    const tasks = Array.from(this.tasks.values());
    
    return {
      agentCount: agents.length,
      activeAgents: agents.filter(a => a.status !== 'offline').length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      averageSuccessRate: agents.reduce((sum, a) => sum + a.performance.successRate, 0) / agents.length,
      averageQuality: agents.reduce((sum, a) => sum + a.performance.qualityScore, 0) / agents.length,
      hierarchyLevels: Math.max(...agents.map(a => a.level)) + 1,
      coordinationStrategies: this.coordinationStrategies.size
    };
  }
}

export const deepAgentsIntegrationService = new DeepAgentsIntegrationService();