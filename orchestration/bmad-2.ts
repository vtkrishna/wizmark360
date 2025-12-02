/**
 * BMAD 2.0 - Business Multi-Agent Dynamics
 * Implements Runbook Prompt 5: Asset dependency graph, parallel execution, resource management
 * 
 * BMAD 2.0 Features:
 * - Asset Dependency Graph for intelligent task coordination
 * - Parallel Agent Execution with resource constraints
 * - Dynamic Resource Allocation based on task complexity
 * - Conflict Resolution and Deadlock Detection
 * - Performance Optimization through Load Balancing
 */

import { EventEmitter } from 'events';
import { WAILogger } from '../utils/logger';
import { AgentResourceRequirement, TaskDependency, ExecutionPlan } from '../types/spi-contracts';

export class BMAD2OrchestrationEngine extends EventEmitter {
  private logger: WAILogger;
  private initialized = false;
  private dependencyGraph: Map<string, TaskNode> = new Map();
  private resourcePool: ResourcePool;
  private executionQueue: PriorityQueue<ExecutionTask>;
  private activeExecutions: Map<string, ExecutionContext> = new Map();
  private performanceMetrics: PerformanceTracker;
  
  constructor(private config: BMAD2Config) {
    super();
    this.logger = new WAILogger('BMAD2.0');
    this.resourcePool = new ResourcePool(config.resources);
    this.executionQueue = new PriorityQueue();
    this.performanceMetrics = new PerformanceTracker();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.logger.info('🔄 Initializing BMAD 2.0 Orchestration Engine...');

      // Initialize resource pool
      await this.resourcePool.initialize();

      // Start execution monitoring
      this.startExecutionMonitoring();

      // Start performance optimization
      this.startPerformanceOptimization();

      this.initialized = true;
      this.logger.info('✅ BMAD 2.0 initialized with advanced coordination');

    } catch (error) {
      this.logger.error('❌ BMAD 2.0 initialization failed:', error);
      throw error;
    }
  }

  /**
   * Submit a task for orchestrated execution
   */
  async submitTask(taskDefinition: TaskDefinition): Promise<ExecutionHandle> {
    if (!this.initialized) {
      throw new Error('BMAD 2.0 not initialized');
    }

    this.logger.info(`🎯 Submitting task: ${taskDefinition.id}`);

    // Create task node in dependency graph
    const taskNode = await this.createTaskNode(taskDefinition);
    this.dependencyGraph.set(taskDefinition.id, taskNode);

    // Analyze dependencies and create execution plan
    const executionPlan = await this.createExecutionPlan(taskNode);

    // Schedule execution
    const handle = await this.scheduleExecution(executionPlan);

    this.emit('taskSubmitted', { taskId: taskDefinition.id, handle });
    return handle;
  }

  /**
   * Create task node with dependency analysis
   */
  private async createTaskNode(task: TaskDefinition): Promise<TaskNode> {
    const node: TaskNode = {
      id: task.id,
      task,
      dependencies: new Set(),
      dependents: new Set(),
      status: 'pending',
      resourceRequirements: await this.analyzeResourceRequirements(task),
      estimatedDuration: await this.estimateTaskDuration(task),
      priority: task.priority || 5,
      metadata: {
        createdAt: Date.now(),
        submittedBy: task.submitter,
        tags: task.tags || []
      }
    };

    // Analyze task dependencies
    if (task.dependencies) {
      for (const depId of task.dependencies) {
        const depNode = this.dependencyGraph.get(depId);
        if (depNode) {
          node.dependencies.add(depId);
          depNode.dependents.add(task.id);
        }
      }
    }

    // Detect circular dependencies
    if (this.hasCircularDependency(node)) {
      throw new Error(`Circular dependency detected for task ${task.id}`);
    }

    return node;
  }

  /**
   * Create optimized execution plan with parallel opportunities
   */
  private async createExecutionPlan(taskNode: TaskNode): Promise<ExecutionPlan> {
    this.logger.info(`📋 Creating execution plan for ${taskNode.id}`);

    // Build execution graph
    const executionGraph = await this.buildExecutionGraph(taskNode);

    // Identify parallel execution opportunities
    const parallelGroups = this.identifyParallelGroups(executionGraph);

    // Optimize resource allocation
    const resourceAllocation = await this.optimizeResourceAllocation(parallelGroups);

    // Create staged execution plan
    const executionStages = this.createExecutionStages(parallelGroups, resourceAllocation);

    const plan: ExecutionPlan = {
      id: `plan_${taskNode.id}_${Date.now()}`,
      taskId: taskNode.id,
      stages: executionStages,
      totalEstimatedDuration: executionStages.reduce((sum, stage) => sum + stage.estimatedDuration, 0),
      resourceRequirements: resourceAllocation,
      parallelismDegree: Math.max(...parallelGroups.map(g => g.length)),
      createdAt: Date.now()
    };

    this.logger.info(`✅ Execution plan created: ${parallelGroups.length} parallel groups, ${plan.parallelismDegree} max parallelism`);
    return plan;
  }

  /**
   * Schedule task execution with resource management
   */
  private async scheduleExecution(plan: ExecutionPlan): Promise<ExecutionHandle> {
    const handle: ExecutionHandle = {
      id: `exec_${plan.taskId}_${Date.now()}`,
      taskId: plan.taskId,
      planId: plan.id,
      status: 'queued',
      createdAt: Date.now(),
      estimatedCompletion: Date.now() + plan.totalEstimatedDuration
    };

    // Check resource availability
    const resourcesAvailable = await this.resourcePool.checkAvailability(plan.resourceRequirements);
    
    if (resourcesAvailable) {
      // Execute immediately
      await this.executeTask(handle, plan);
    } else {
      // Queue for later execution
      const executionTask: ExecutionTask = {
        handle,
        plan,
        priority: this.calculateExecutionPriority(plan),
        queuedAt: Date.now()
      };
      
      this.executionQueue.enqueue(executionTask);
      this.logger.info(`📄 Task queued for execution: ${handle.id}`);
    }

    return handle;
  }

  /**
   * Execute task with full resource management and monitoring
   */
  private async executeTask(handle: ExecutionHandle, plan: ExecutionPlan): Promise<void> {
    this.logger.info(`🚀 Starting execution: ${handle.id}`);

    try {
      // Reserve resources
      const resourceLease = await this.resourcePool.allocateResources(plan.resourceRequirements);

      // Create execution context
      const context: ExecutionContext = {
        handle,
        plan,
        resourceLease,
        startedAt: Date.now(),
        stage: 0,
        stageResults: [],
        metrics: {
          totalDuration: 0,
          stagesDuration: [],
          resourceUtilization: [],
          parallelismAchieved: []
        }
      };

      this.activeExecutions.set(handle.id, context);
      handle.status = 'running';

      // Execute stages sequentially with parallel execution within stages
      for (let stageIndex = 0; stageIndex < plan.stages.length; stageIndex++) {
        await this.executeStage(context, stageIndex);
      }

      // Complete execution
      await this.completeExecution(context);

    } catch (error) {
      this.logger.error(`❌ Execution failed: ${handle.id}`, error);
      handle.status = 'failed';
      handle.error = error.message;
      await this.cleanupExecution(handle.id);
      throw error;
    }
  }

  /**
   * Execute a single stage with parallel agent coordination
   */
  private async executeStage(context: ExecutionContext, stageIndex: number): Promise<void> {
    const stage = context.plan.stages[stageIndex];
    const stageStart = Date.now();

    this.logger.info(`🎭 Executing stage ${stageIndex + 1}/${context.plan.stages.length}: ${stage.tasks.length} parallel tasks`);

    try {
      // Prepare agents for parallel execution
      const agentTasks = await Promise.all(
        stage.tasks.map(task => this.prepareAgentTask(task, context))
      );

      // Execute all tasks in parallel with resource constraints
      const stageResults = await this.executeParallelTasks(agentTasks, stage.maxParallelism);

      // Update context
      context.stage = stageIndex;
      context.stageResults[stageIndex] = stageResults;
      
      const stageDuration = Date.now() - stageStart;
      context.metrics.stagesDuration[stageIndex] = stageDuration;
      context.metrics.parallelismAchieved[stageIndex] = stageResults.length;

      this.logger.info(`✅ Stage ${stageIndex + 1} completed in ${stageDuration}ms with ${stageResults.length} parallel executions`);

    } catch (error) {
      this.logger.error(`❌ Stage ${stageIndex + 1} failed:`, error);
      throw error;
    }
  }

  /**
   * Execute multiple tasks in parallel with resource management
   */
  private async executeParallelTasks(agentTasks: PreparedAgentTask[], maxParallelism: number): Promise<TaskResult[]> {
    const results: TaskResult[] = [];
    const executing: Promise<TaskResult>[] = [];
    
    for (const agentTask of agentTasks) {
      // Respect parallelism limits
      if (executing.length >= maxParallelism) {
        const completed = await Promise.race(executing);
        results.push(completed);
        executing.splice(executing.findIndex(p => p === completed), 1);
      }

      // Start task execution
      const taskPromise = this.executeAgentTask(agentTask);
      executing.push(taskPromise);
    }

    // Wait for remaining tasks
    const remainingResults = await Promise.all(executing);
    results.push(...remainingResults);

    return results;
  }

  /**
   * Execute individual agent task with full iteration support
   */
  private async executeAgentTask(agentTask: PreparedAgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    let iteration = 0;
    const maxIterations = agentTask.task.maxIterations || 10;

    this.logger.info(`🤖 Starting agent task: ${agentTask.agent.id} for ${agentTask.task.id}`);

    try {
      let result: any = null;
      let isComplete = false;

      // Iterate until completion or max iterations
      while (!isComplete && iteration < maxIterations) {
        iteration++;
        
        this.logger.debug(`🔄 Agent ${agentTask.agent.id} iteration ${iteration}/${maxIterations}`);

        // Execute agent step
        const stepResult = await agentTask.agent.executeStep({
          ...agentTask.task,
          iteration,
          previousResult: result,
          context: agentTask.context
        });

        result = stepResult.result;
        isComplete = stepResult.completed || this.isTaskComplete(stepResult, agentTask.task);

        // Performance tracking
        this.performanceMetrics.recordAgentStep(agentTask.agent.id, {
          iteration,
          duration: stepResult.duration || 0,
          success: stepResult.success !== false,
          resourceUsage: stepResult.resourceUsage || {}
        });

        // Check for early termination conditions
        if (stepResult.shouldTerminate) {
          this.logger.warn(`⚠️ Agent ${agentTask.agent.id} requested early termination`);
          break;
        }
      }

      const totalDuration = Date.now() - startTime;

      const taskResult: TaskResult = {
        taskId: agentTask.task.id,
        agentId: agentTask.agent.id,
        result,
        completed: isComplete,
        iterations: iteration,
        duration: totalDuration,
        success: isComplete,
        metadata: {
          startTime,
          endTime: Date.now(),
          resourceUsage: agentTask.resourceUsage
        }
      };

      this.logger.info(`✅ Agent task completed: ${agentTask.agent.id} (${iteration} iterations, ${totalDuration}ms)`);
      return taskResult;

    } catch (error) {
      const taskResult: TaskResult = {
        taskId: agentTask.task.id,
        agentId: agentTask.agent.id,
        result: null,
        completed: false,
        iterations: iteration,
        duration: Date.now() - startTime,
        success: false,
        error: error.message,
        metadata: {
          startTime,
          endTime: Date.now(),
          error: error.stack
        }
      };

      this.logger.error(`❌ Agent task failed: ${agentTask.agent.id}`, error);
      return taskResult;
    }
  }

  /**
   * Analyze resource requirements for a task
   */
  private async analyzeResourceRequirements(task: TaskDefinition): Promise<ResourceRequirements> {
    const requirements: ResourceRequirements = {
      cpu: task.estimatedCPU || this.estimateCPURequirement(task),
      memory: task.estimatedMemory || this.estimateMemoryRequirement(task),
      agents: task.requiredAgents || await this.estimateAgentRequirement(task),
      duration: task.estimatedDuration || await this.estimateTaskDuration(task),
      priority: task.priority || 5,
      tags: task.tags || []
    };

    return requirements;
  }

  /**
   * Build execution graph for dependency visualization
   */
  private async buildExecutionGraph(rootNode: TaskNode): Promise<ExecutionGraph> {
    const graph: ExecutionGraph = {
      nodes: new Map(),
      edges: [],
      levels: []
    };

    // Traverse dependency tree
    const visited = new Set<string>();
    const queue = [rootNode];

    while (queue.length > 0) {
      const node = queue.shift()!;
      if (visited.has(node.id)) continue;

      visited.add(node.id);
      graph.nodes.set(node.id, node);

      // Add dependencies to queue
      for (const depId of node.dependencies) {
        const depNode = this.dependencyGraph.get(depId);
        if (depNode && !visited.has(depId)) {
          queue.push(depNode);
          graph.edges.push({ from: depId, to: node.id });
        }
      }
    }

    // Calculate execution levels for parallel grouping
    graph.levels = this.calculateExecutionLevels(graph);

    return graph;
  }

  /**
   * Identify tasks that can be executed in parallel
   */
  private identifyParallelGroups(graph: ExecutionGraph): ParallelGroup[] {
    const groups: ParallelGroup[] = [];

    for (const level of graph.levels) {
      if (level.length > 0) {
        groups.push({
          level: groups.length,
          tasks: level,
          maxParallelism: Math.min(level.length, this.config.maxParallelism || 10),
          estimatedDuration: Math.max(...level.map(nodeId => {
            const node = graph.nodes.get(nodeId);
            return node?.estimatedDuration || 1000;
          }))
        });
      }
    }

    return groups;
  }

  /**
   * Start performance optimization monitoring
   */
  private startPerformanceOptimization(): void {
    setInterval(() => {
      this.optimizeResourceAllocation();
      this.rebalanceExecutionQueue();
      this.garbageCollectCompletedTasks();
    }, 30000); // Every 30 seconds
  }

  /**
   * Get comprehensive health status
   */
  async getHealth(): Promise<ComponentHealth> {
    const resourceHealth = await this.resourcePool.getHealth();
    const queueStatus = this.executionQueue.getStatus();
    
    return {
      healthy: this.initialized && resourceHealth.healthy,
      status: this.initialized ? 'active' : 'inactive',
      lastCheck: Date.now(),
      details: {
        initialized: this.initialized,
        activeTasks: this.activeExecutions.size,
        queuedTasks: queueStatus.length,
        resourceUtilization: resourceHealth.utilization,
        dependencyNodes: this.dependencyGraph.size,
        performanceScore: this.performanceMetrics.getOverallScore()
      }
    };
  }

  // Helper methods for implementation details
  private estimateCPURequirement(task: TaskDefinition): number {
    // Base CPU on task complexity
    const complexity = task.complexity || 'medium';
    const cpuMap = { low: 0.5, medium: 1.0, high: 2.0, extreme: 4.0 };
    return cpuMap[complexity as keyof typeof cpuMap] || 1.0;
  }

  private estimateMemoryRequirement(task: TaskDefinition): number {
    // Base memory on data size and task type
    const baseMemory = 512; // MB
    const multiplier = task.dataSize ? Math.log10(task.dataSize + 1) : 1;
    return Math.round(baseMemory * multiplier);
  }

  private async estimateAgentRequirement(task: TaskDefinition): Promise<number> {
    // Estimate agents needed based on task type and complexity
    if (task.type === 'parallel-processing') return task.parallelism || 4;
    if (task.type === 'data-analysis') return 2;
    return 1;
  }

  private async estimateTaskDuration(task: TaskDefinition): Promise<number> {
    // Estimate duration based on historical data and task complexity
    const baseDuration = 5000; // 5 seconds
    const complexityMultiplier = { low: 0.5, medium: 1.0, high: 2.0, extreme: 5.0 };
    const multiplier = complexityMultiplier[task.complexity as keyof typeof complexityMultiplier] || 1.0;
    return Math.round(baseDuration * multiplier);
  }

  async shutdown(): Promise<void> {
    this.logger.info('🔄 Shutting down BMAD 2.0...');
    
    // Stop all active executions gracefully
    for (const [id, context] of this.activeExecutions) {
      await this.cleanupExecution(id);
    }
    
    await this.resourcePool.shutdown();
    this.initialized = false;
  }
}

// Import concrete implementations
import { ResourcePool, PriorityQueue, PerformanceTracker } from '../core/resource-pool';

// Type definitions
export interface BMAD2Config {
  maxParallelism?: number;
  resources?: any;
  optimizationInterval?: number;
}

interface TaskDefinition {
  id: string;
  type: string;
  complexity?: 'low' | 'medium' | 'high' | 'extreme';
  dependencies?: string[];
  requiredAgents?: number;
  estimatedDuration?: number;
  estimatedCPU?: number;
  estimatedMemory?: number;
  priority?: number;
  maxIterations?: number;
  parallelism?: number;
  dataSize?: number;
  tags?: string[];
  submitter?: string;
  [key: string]: any;
}

interface TaskNode {
  id: string;
  task: TaskDefinition;
  dependencies: Set<string>;
  dependents: Set<string>;
  status: 'pending' | 'ready' | 'running' | 'completed' | 'failed';
  resourceRequirements: ResourceRequirements;
  estimatedDuration: number;
  priority: number;
  metadata: {
    createdAt: number;
    submittedBy?: string;
    tags: string[];
  };
}

interface ResourceRequirements {
  cpu: number;
  memory: number;
  agents: number;
  duration: number;
  priority: number;
  tags: string[];
}

interface ExecutionStage {
  tasks: TaskDefinition[];
  maxParallelism: number;
  estimatedDuration: number;
}

interface ExecutionHandle {
  id: string;
  taskId: string;
  planId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  createdAt: number;
  estimatedCompletion?: number;
  error?: string;
}

interface ExecutionTask {
  handle: ExecutionHandle;
  plan: ExecutionPlan;
  priority: number;
  queuedAt: number;
}

interface ExecutionContext {
  handle: ExecutionHandle;
  plan: ExecutionPlan;
  resourceLease: any;
  startedAt: number;
  stage: number;
  stageResults: TaskResult[][];
  metrics: ExecutionMetrics;
}

interface ExecutionMetrics {
  totalDuration: number;
  stagesDuration: number[];
  resourceUtilization: number[];
  parallelismAchieved: number[];
}

interface PreparedAgentTask {
  agent: any;
  task: TaskDefinition;
  context: any;
  resourceUsage: any;
}

interface TaskResult {
  taskId: string;
  agentId: string;
  result: any;
  completed: boolean;
  iterations: number;
  duration: number;
  success: boolean;
  error?: string;
  metadata: any;
}

interface ExecutionGraph {
  nodes: Map<string, TaskNode>;
  edges: Array<{ from: string; to: string }>;
  levels: string[][];
}

interface ParallelGroup {
  level: number;
  tasks: string[];
  maxParallelism: number;
  estimatedDuration: number;
}

interface ComponentHealth {
  healthy: boolean;
  status: string;
  lastCheck: number;
  details?: any;
}