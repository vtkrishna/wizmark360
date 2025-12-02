/**
 * Comprehensive Agent System Types and Interfaces
 * Core types for the WAI agent orchestration system
 */

export enum AgentTier {
  EXECUTIVE = 'executive',
  DEVELOPMENT = 'development', 
  CREATIVE = 'creative',
  QA = 'qa',
  DEVOPS = 'devops',
  SPECIALIST = 'specialist'
}

export enum AgentSpecialization {
  ORCHESTRATION = 'orchestration',
  REQUIREMENTS_ANALYSIS = 'requirements-analysis',
  FULLSTACK_DEVELOPMENT = 'fullstack-development',
  FRONTEND_DEVELOPMENT = 'frontend-development',
  BACKEND_DEVELOPMENT = 'backend-development',
  CONTENT_CREATION = 'content-creation',
  UI_UX_DESIGN = 'ui-ux-design',
  QA_TESTING = 'qa-testing',
  DEVOPS_AUTOMATION = 'devops-automation'
}

export enum CoordinationType {
  HIERARCHICAL = 'hierarchical',
  PARALLEL = 'parallel', 
  SEQUENTIAL = 'sequential',
  SWARM = 'swarm',
  MESH = 'mesh'
}

export enum TaskType {
  COORDINATION = 'coordination',
  ANALYSIS = 'analysis',
  DEVELOPMENT = 'development',
  CREATIVE = 'creative',
  TESTING = 'testing',
  DEPLOYMENT = 'deployment',
  CONTENT_CREATION = 'content-creation'
}

export interface AgentConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  tier: AgentTier;
  specialization: AgentSpecialization | string;
  coordinationPattern: CoordinationType;
  systemPrompt: string;
  capabilities: string[];
  skillset: string[];
  taskTypes: (TaskType | string)[];
  collaboratesWithAgents: string[];
  dependsOnAgents: string[];
  outputForAgents: string[];
  performanceTargets: Record<string, number>;
  runtimeConfig: Record<string, any>;
  workflowPatterns: string[];
}

export interface AgentTask {
  id: string;
  taskId: string;
  agentId: string;
  task: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, any>;
  requirements: Record<string, any>;
  metadata: Record<string, any>;
  inputData?: Record<string, any>;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export interface BaseAgent {
  id: string;
  name: string;
  tier: string;
  specializations: string[];
  status: 'inactive' | 'active' | 'busy' | 'error';
  execute(task: AgentTask): Promise<any>;
  executeTask(task: AgentTask): Promise<any>;
  canHandle(taskType: string): boolean;
  getStatus(): { status: string; [key: string]: any };
  shutdown(): Promise<void>;
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface QualityMetrics {
  accuracy: number;
  completeness: number;
  timeliness: number;
  relevance: number;
  overall: number;
}

export interface AgentCoordination {
  id: string;
  pattern: CoordinationType;
  participants: string[];
  status: 'active' | 'inactive' | 'completed' | 'failed';
  metrics: QualityMetrics;
}

export interface MemoryEntry {
  id: string;
  type: 'execution' | 'context' | 'learning' | 'performance' | 'conversation';
  agentId: string;
  content: Record<string, any>;
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface MonitoringEntry {
  id: string;
  agentId: string;
  event: string;
  data: Record<string, any>;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface WAIAgent {
  id: string;
  config: AgentConfig;
  status: 'active' | 'inactive' | 'busy' | 'error';
  currentTasks: string[];
  performance: {
    tasksCompleted: number;
    successRate: number;
    avgResponseTime: number;
    qualityScore: number;
  };
  
  // Core agent methods
  execute(task: any): Promise<any>;
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
}