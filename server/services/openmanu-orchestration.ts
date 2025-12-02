/**
 * OpenManu Orchestration Layer - Advanced Workflow Management
 * 
 * Implements comprehensive orchestration capabilities with:
 * - Multi-agent workflow coordination
 * - Dynamic task decomposition and routing
 * - Parallel execution management
 * - Dependency resolution and scheduling
 * - Resource allocation optimization
 * - Real-time workflow monitoring
 */

import { EventEmitter } from 'events';
import type { LLMRequest, LLMResponse } from './llm-providers/unified-llm-adapter';
import { providerRegistry, type ProviderSelection } from './llm-providers/provider-registry';
import { generateCorrelationId } from './orchestration-utils';

export interface WorkflowTask {
  id: string;
  type: 'llm-generation' | 'analysis' | 'synthesis' | 'validation' | 'transformation';
  name: string;
  description: string;
  priority: number;
  dependencies: string[];
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  constraints: {
    maxExecutionTime: number;
    maxCost: number;
    requiredCapabilities: string[];
    preferredProviders: string[];
  };
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  assignedProvider?: string;
  startTime?: Date;
  endTime?: Date;
  cost?: number;
  metadata?: Record<string, any>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  tasks: WorkflowTask[];
  globalConstraints: {
    maxTotalCost: number;
    maxExecutionTime: number;
    qualityThreshold: number;
  };
  executionStrategy: 'sequential' | 'parallel' | 'adaptive';
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: 'exponential' | 'linear' | 'fixed';
    retryableErrors: string[];
  };
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime: Date;
  endTime?: Date;
  totalCost: number;
  taskExecutions: Map<string, TaskExecution>;
  metrics: {
    tasksCompleted: number;
    tasksFailed: number;
    averageTaskTime: number;
    peakParallelism: number;
  };
  results: Record<string, any>;
  errors: string[];
}

export interface TaskExecution {
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying';
  attempts: number;
  startTime?: Date;
  endTime?: Date;
  cost: number;
  provider?: string;
  results?: any;
  error?: string;
  dependencies: string[];
  dependents: string[];
}

export class OpenManuOrchestrator extends EventEmitter {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private taskQueue: WorkflowTask[] = [];
  private runningTasks: Map<string, TaskExecution> = new Map();
  private maxParallelTasks: number = 10;
  private isProcessing: boolean = false;

  constructor() {
    super();
    this.initializeOrchestrator();
    console.log('🎼 OpenManu Orchestrator initialized');
  }

  private initializeOrchestrator(): void {
    // Start task processing loop
    this.startTaskProcessor();
    
    // Register built-in workflow templates
    this.registerBuiltInWorkflows();
    
    // Setup monitoring
    this.setupMetricsCollection();
    
    console.log('✅ OpenManu orchestration layer ready');
  }

  private startTaskProcessor(): void {
    setInterval(async () => {
      if (!this.isProcessing && this.taskQueue.length > 0) {
        await this.processTaskQueue();
      }
    }, 1000); // Check every second
  }

  private registerBuiltInWorkflows(): void {
    // Multi-step content generation workflow
    this.registerWorkflow({
      id: 'content-generation-pipeline',
      name: 'Content Generation Pipeline',
      description: 'Multi-stage content creation with research, writing, and validation',
      version: '1.0.0',
      tasks: [
        {
          id: 'research',
          type: 'llm-generation',
          name: 'Research Phase',
          description: 'Gather information and context',
          priority: 100,
          dependencies: [],
          inputs: { topic: 'string', requirements: 'object' },
          outputs: { research_data: 'object' },
          constraints: {
            maxExecutionTime: 60000,
            maxCost: 0.10,
            requiredCapabilities: ['research', 'factual-accuracy'],
            preferredProviders: ['perplexity', 'google', 'openai']
          },
          status: 'pending'
        },
        {
          id: 'outline',
          type: 'llm-generation',
          name: 'Outline Creation',
          description: 'Create detailed content outline',
          priority: 90,
          dependencies: ['research'],
          inputs: { research_data: 'object', content_type: 'string' },
          outputs: { outline: 'object' },
          constraints: {
            maxExecutionTime: 45000,
            maxCost: 0.05,
            requiredCapabilities: ['planning', 'structure'],
            preferredProviders: ['anthropic', 'openai', 'claude']
          },
          status: 'pending'
        },
        {
          id: 'writing',
          type: 'llm-generation',
          name: 'Content Writing',
          description: 'Generate main content based on outline',
          priority: 80,
          dependencies: ['outline'],
          inputs: { outline: 'object', style: 'string' },
          outputs: { content: 'string' },
          constraints: {
            maxExecutionTime: 120000,
            maxCost: 0.20,
            requiredCapabilities: ['creativity', 'writing'],
            preferredProviders: ['anthropic', 'openai', 'meta']
          },
          status: 'pending'
        },
        {
          id: 'validation',
          type: 'validation',
          name: 'Content Validation',
          description: 'Review and validate generated content',
          priority: 70,
          dependencies: ['writing'],
          inputs: { content: 'string', criteria: 'object' },
          outputs: { validation_results: 'object', final_content: 'string' },
          constraints: {
            maxExecutionTime: 30000,
            maxCost: 0.05,
            requiredCapabilities: ['analysis', 'fact-checking'],
            preferredProviders: ['openai', 'anthropic']
          },
          status: 'pending'
        }
      ],
      globalConstraints: {
        maxTotalCost: 0.50,
        maxExecutionTime: 300000,
        qualityThreshold: 0.8
      },
      executionStrategy: 'sequential',
      retryPolicy: {
        maxRetries: 2,
        backoffStrategy: 'exponential',
        retryableErrors: ['timeout', 'rate_limit', 'server_error']
      }
    });

    // Parallel analysis workflow
    this.registerWorkflow({
      id: 'multi-perspective-analysis',
      name: 'Multi-Perspective Analysis',
      description: 'Analyze content from multiple perspectives simultaneously',
      version: '1.0.0',
      tasks: [
        {
          id: 'technical-analysis',
          type: 'analysis',
          name: 'Technical Analysis',
          description: 'Analyze technical aspects',
          priority: 100,
          dependencies: [],
          inputs: { content: 'string' },
          outputs: { technical_insights: 'object' },
          constraints: {
            maxExecutionTime: 60000,
            maxCost: 0.15,
            requiredCapabilities: ['technical-analysis', 'coding'],
            preferredProviders: ['deepseek', 'meta', 'together-ai']
          },
          status: 'pending'
        },
        {
          id: 'business-analysis',
          type: 'analysis',
          name: 'Business Analysis',
          description: 'Analyze business implications',
          priority: 100,
          dependencies: [],
          inputs: { content: 'string' },
          outputs: { business_insights: 'object' },
          constraints: {
            maxExecutionTime: 60000,
            maxCost: 0.15,
            requiredCapabilities: ['business-analysis', 'strategic-thinking'],
            preferredProviders: ['anthropic', 'openai', 'xai']
          },
          status: 'pending'
        },
        {
          id: 'user-experience-analysis',
          type: 'analysis',
          name: 'User Experience Analysis',
          description: 'Analyze from user perspective',
          priority: 100,
          dependencies: [],
          inputs: { content: 'string' },
          outputs: { ux_insights: 'object' },
          constraints: {
            maxExecutionTime: 60000,
            maxCost: 0.15,
            requiredCapabilities: ['user-experience', 'design-thinking'],
            preferredProviders: ['anthropic', 'google', 'openai']
          },
          status: 'pending'
        },
        {
          id: 'synthesis',
          type: 'synthesis',
          name: 'Insight Synthesis',
          description: 'Combine all perspectives into unified insights',
          priority: 50,
          dependencies: ['technical-analysis', 'business-analysis', 'user-experience-analysis'],
          inputs: { 
            technical_insights: 'object', 
            business_insights: 'object', 
            ux_insights: 'object' 
          },
          outputs: { comprehensive_analysis: 'object' },
          constraints: {
            maxExecutionTime: 90000,
            maxCost: 0.25,
            requiredCapabilities: ['synthesis', 'strategic-thinking'],
            preferredProviders: ['anthropic', 'openai', 'xai']
          },
          status: 'pending'
        }
      ],
      globalConstraints: {
        maxTotalCost: 0.80,
        maxExecutionTime: 180000,
        qualityThreshold: 0.85
      },
      executionStrategy: 'parallel',
      retryPolicy: {
        maxRetries: 1,
        backoffStrategy: 'linear',
        retryableErrors: ['timeout', 'rate_limit']
      }
    });

    console.log('📚 Built-in workflows registered');
  }

  private setupMetricsCollection(): void {
    // Collect metrics every 30 seconds
    setInterval(() => {
      this.collectMetrics();
    }, 30000);
  }

  private collectMetrics(): void {
    const activeExecutions = Array.from(this.executions.values())
      .filter(e => e.status === 'running');
    
    const queuedTasks = this.taskQueue.length;
    const runningTasks = this.runningTasks.size;
    
    this.emit('metrics-collected', {
      activeExecutions: activeExecutions.length,
      queuedTasks,
      runningTasks,
      timestamp: new Date()
    });
  }

  public registerWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow);
    this.emit('workflow-registered', { workflowId: workflow.id, name: workflow.name });
    console.log(`📋 Registered workflow: ${workflow.name} (${workflow.id})`);
  }

  public async executeWorkflow(
    workflowId: string, 
    inputs: Record<string, any>, 
    options?: {
      priority?: number;
      customConstraints?: Partial<WorkflowDefinition['globalConstraints']>;
      executionStrategy?: WorkflowDefinition['executionStrategy'];
    }
  ): Promise<string> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const executionId = generateCorrelationId();
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'queued',
      progress: 0,
      startTime: new Date(),
      totalCost: 0,
      taskExecutions: new Map(),
      metrics: {
        tasksCompleted: 0,
        tasksFailed: 0,
        averageTaskTime: 0,
        peakParallelism: 0
      },
      results: {},
      errors: []
    };

    // Initialize task executions
    for (const task of workflow.tasks) {
      const taskExecution: TaskExecution = {
        taskId: task.id,
        status: 'pending',
        attempts: 0,
        cost: 0,
        dependencies: task.dependencies,
        dependents: this.findTaskDependents(task.id, workflow.tasks)
      };
      execution.taskExecutions.set(task.id, taskExecution);
    }

    this.executions.set(executionId, execution);

    // Queue initial tasks (those with no dependencies)
    const initialTasks = workflow.tasks.filter(task => task.dependencies.length === 0);
    for (const task of initialTasks) {
      const enhancedTask = { ...task, inputs: { ...task.inputs, ...inputs } };
      this.taskQueue.push(enhancedTask);
    }

    execution.status = 'running';
    this.emit('workflow-started', { executionId, workflowId });
    
    console.log(`🚀 Started workflow execution: ${workflowId} (${executionId})`);
    return executionId;
  }

  private findTaskDependents(taskId: string, tasks: WorkflowTask[]): string[] {
    return tasks
      .filter(task => task.dependencies.includes(taskId))
      .map(task => task.id);
  }

  private async processTaskQueue(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0) return;
    
    this.isProcessing = true;
    
    try {
      // Get tasks that can run (all dependencies met, within parallel limits)
      const runnableTasks = this.getRunnableTasks();
      
      // Execute tasks in parallel up to the limit
      const tasksToRun = runnableTasks.slice(0, this.maxParallelTasks - this.runningTasks.size);
      
      for (const task of tasksToRun) {
        this.executeTask(task);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private getRunnableTasks(): WorkflowTask[] {
    return this.taskQueue.filter(task => {
      // Check if all dependencies are completed
      return task.dependencies.every(depId => {
        // Find the execution that contains this task
        for (const execution of this.executions.values()) {
          const taskExecution = execution.taskExecutions.get(depId);
          if (taskExecution && taskExecution.status === 'completed') {
            return true;
          }
        }
        return false;
      });
    });
  }

  private async executeTask(task: WorkflowTask): Promise<void> {
    const executionId = this.findExecutionForTask(task.id);
    if (!executionId) {
      console.error(`No execution found for task ${task.id}`);
      return;
    }

    const execution = this.executions.get(executionId)!;
    const taskExecution = execution.taskExecutions.get(task.id)!;

    // Remove from queue and add to running
    this.taskQueue = this.taskQueue.filter(t => t.id !== task.id);
    this.runningTasks.set(task.id, taskExecution);

    taskExecution.status = 'running';
    taskExecution.startTime = new Date();
    taskExecution.attempts++;

    this.emit('task-started', { executionId, taskId: task.id });

    try {
      // Select optimal provider for this task
      const providerSelection = await this.selectProviderForTask(task);
      taskExecution.provider = providerSelection.provider.getProvider().id;

      // Execute the task
      const result = await this.performTaskExecution(task, providerSelection);
      
      taskExecution.status = 'completed';
      taskExecution.endTime = new Date();
      taskExecution.results = result.content;
      taskExecution.cost = result.cost;

      execution.totalCost += result.cost;
      execution.metrics.tasksCompleted++;

      // Queue dependent tasks
      await this.queueDependentTasks(task.id, execution);

      this.emit('task-completed', { 
        executionId, 
        taskId: task.id, 
        cost: result.cost,
        responseTime: result.responseTime 
      });

      // Check if workflow is complete
      this.checkWorkflowCompletion(executionId);

    } catch (error) {
      taskExecution.status = 'failed';
      taskExecution.endTime = new Date();
      taskExecution.error = error instanceof Error ? error.message : String(error);
      
      execution.metrics.tasksFailed++;
      execution.errors.push(`Task ${task.id}: ${taskExecution.error}`);

      this.emit('task-failed', { 
        executionId, 
        taskId: task.id, 
        error: taskExecution.error 
      });

      // Handle retry logic
      await this.handleTaskFailure(task, taskExecution, execution);

    } finally {
      this.runningTasks.delete(task.id);
    }
  }

  private findExecutionForTask(taskId: string): string | null {
    for (const [executionId, execution] of this.executions) {
      if (execution.taskExecutions.has(taskId)) {
        return executionId;
      }
    }
    return null;
  }

  private async selectProviderForTask(task: WorkflowTask): Promise<ProviderSelection> {
    // Create a mock LLM request to help with provider selection
    const mockRequest: LLMRequest = {
      messages: [{ role: 'user', content: task.description }],
      maxTokens: 2000,
      temperature: 0.7
    };

    // Use cost-optimized selection if we have budget constraints
    if (task.constraints.maxCost) {
      return await providerRegistry.selectProvider(mockRequest, 'cheapest');
    }

    // Use balanced selection for general tasks
    return await providerRegistry.selectProvider(mockRequest, 'balanced');
  }

  private async performTaskExecution(task: WorkflowTask, providerSelection: ProviderSelection): Promise<LLMResponse> {
    // Convert task to LLM request
    const request: LLMRequest = {
      messages: [
        {
          role: 'system',
          content: `You are executing a workflow task: ${task.name}. ${task.description}`
        },
        {
          role: 'user',
          content: JSON.stringify(task.inputs)
        }
      ],
      maxTokens: 4000,
      temperature: task.type === 'analysis' ? 0.3 : 0.7,
      correlationId: `task-${task.id}`
    };

    return await providerSelection.provider.generateResponse(request);
  }

  private async queueDependentTasks(completedTaskId: string, execution: WorkflowExecution): Promise<void> {
    const workflow = this.workflows.get(execution.workflowId)!;
    
    // Find tasks that depend on the completed task
    const dependentTasks = workflow.tasks.filter(task => 
      task.dependencies.includes(completedTaskId)
    );

    for (const task of dependentTasks) {
      // Check if all dependencies are now met
      const allDependenciesMet = task.dependencies.every(depId => {
        const depExecution = execution.taskExecutions.get(depId);
        return depExecution && depExecution.status === 'completed';
      });

      if (allDependenciesMet) {
        // Gather outputs from dependencies
        const dependencyOutputs = {};
        for (const depId of task.dependencies) {
          const depExecution = execution.taskExecutions.get(depId);
          if (depExecution && depExecution.results) {
            Object.assign(dependencyOutputs, depExecution.results);
          }
        }

        // Queue the task with dependency outputs
        const enhancedTask = { 
          ...task, 
          inputs: { ...task.inputs, ...dependencyOutputs } 
        };
        this.taskQueue.push(enhancedTask);
      }
    }
  }

  private checkWorkflowCompletion(executionId: string): void {
    const execution = this.executions.get(executionId)!;
    const workflow = this.workflows.get(execution.workflowId)!;

    const allTasksCompleted = workflow.tasks.every(task => {
      const taskExecution = execution.taskExecutions.get(task.id);
      return taskExecution && 
             (taskExecution.status === 'completed' || taskExecution.status === 'failed');
    });

    if (allTasksCompleted) {
      const hasFailures = Array.from(execution.taskExecutions.values())
        .some(te => te.status === 'failed');

      execution.status = hasFailures ? 'failed' : 'completed';
      execution.endTime = new Date();
      execution.progress = 100;

      // Collect final results
      for (const task of workflow.tasks) {
        const taskExecution = execution.taskExecutions.get(task.id);
        if (taskExecution && taskExecution.results) {
          execution.results[task.id] = taskExecution.results;
        }
      }

      this.emit('workflow-completed', { 
        executionId, 
        status: execution.status,
        totalCost: execution.totalCost,
        results: execution.results 
      });

      console.log(`✅ Workflow ${execution.workflowId} ${execution.status}: ${executionId}`);
    }
  }

  private async handleTaskFailure(
    task: WorkflowTask, 
    taskExecution: TaskExecution, 
    execution: WorkflowExecution
  ): Promise<void> {
    const workflow = this.workflows.get(execution.workflowId)!;
    
    if (taskExecution.attempts < workflow.retryPolicy.maxRetries) {
      // Schedule retry
      const retryDelay = this.calculateRetryDelay(
        taskExecution.attempts, 
        workflow.retryPolicy.backoffStrategy
      );

      setTimeout(() => {
        taskExecution.status = 'retrying';
        this.taskQueue.push(task);
        this.emit('task-retrying', { 
          executionId: execution.id, 
          taskId: task.id, 
          attempt: taskExecution.attempts + 1 
        });
      }, retryDelay);
    } else {
      // Max retries exceeded, mark execution as failed
      execution.status = 'failed';
      execution.endTime = new Date();
      
      this.emit('workflow-failed', { 
        executionId: execution.id, 
        failedTask: task.id,
        error: taskExecution.error 
      });
    }
  }

  private calculateRetryDelay(attempt: number, strategy: string): number {
    const baseDelay = 1000; // 1 second
    
    switch (strategy) {
      case 'exponential':
        return baseDelay * Math.pow(2, attempt);
      case 'linear':
        return baseDelay * (attempt + 1);
      case 'fixed':
      default:
        return baseDelay;
    }
  }

  // Public API methods
  public getWorkflowStatus(executionId: string): WorkflowExecution | null {
    return this.executions.get(executionId) || null;
  }

  public getWorkflowDefinition(workflowId: string): WorkflowDefinition | null {
    return this.workflows.get(workflowId) || null;
  }

  public listWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  public listActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .filter(e => e.status === 'running' || e.status === 'queued');
  }

  public async cancelExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'cancelled';
      execution.endTime = new Date();
      
      // Cancel running tasks
      for (const [taskId, taskExecution] of execution.taskExecutions) {
        if (taskExecution.status === 'running') {
          taskExecution.status = 'failed';
          taskExecution.error = 'Execution cancelled';
          this.runningTasks.delete(taskId);
        }
      }

      // Remove queued tasks for this execution
      this.taskQueue = this.taskQueue.filter(task => 
        this.findExecutionForTask(task.id) !== executionId
      );

      this.emit('workflow-cancelled', { executionId });
      console.log(`🛑 Cancelled workflow execution: ${executionId}`);
    }
  }

  public getSystemMetrics(): any {
    return {
      registeredWorkflows: this.workflows.size,
      activeExecutions: Array.from(this.executions.values())
        .filter(e => e.status === 'running').length,
      queuedTasks: this.taskQueue.length,
      runningTasks: this.runningTasks.size,
      totalExecutions: this.executions.size,
      maxParallelTasks: this.maxParallelTasks
    };
  }

  public setMaxParallelTasks(max: number): void {
    this.maxParallelTasks = Math.max(1, Math.min(max, 50));
    console.log(`🔄 Updated max parallel tasks: ${this.maxParallelTasks}`);
  }
}

// Global orchestrator instance
export const openManuOrchestrator = new OpenManuOrchestrator();