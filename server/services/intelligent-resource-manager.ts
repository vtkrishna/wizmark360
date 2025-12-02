/**
 * Intelligent Resource Manager
 * AI-powered resource allocation and management system for agents
 */

import { EventEmitter } from 'events';
import { waiAPI } from './wai-api';

export interface ResourceAnalysis {
  taskId: string;
  projectComplexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  skillsRequired: string[];
  estimatedEffort: number; // in hours
  riskFactors: string[];
  dependencies: string[];
  recommendedTeamSize: number;
  recommendedAgents: AgentRecommendation[];
}

export interface AgentRecommendation {
  agentType: string;
  agentId: string;
  role: string;
  workload: number; // percentage
  estimatedHours: number;
  skillMatch: number; // 0-1
  availability: number; // 0-1
  priority: 'primary' | 'secondary' | 'support';
  reasoning: string;
}

export interface ResourceAllocation {
  taskId: string;
  teamComposition: TeamMember[];
  totalCost: number;
  estimatedDuration: number;
  confidence: number;
  alternatives: AlternativeAllocation[];
}

export interface TeamMember {
  agentId: string;
  agentType: string;
  role: string;
  allocation: number; // percentage
  estimatedHours: number;
  hourlyRate: number;
  specialization: string[];
  workloadStatus: 'available' | 'busy' | 'overloaded';
}

export interface AlternativeAllocation {
  scenario: string;
  teamComposition: TeamMember[];
  tradeoffs: string[];
  cost: number;
  duration: number;
}

export interface WorkloadDistribution {
  agentId: string;
  currentLoad: number;
  maxCapacity: number;
  utilization: number;
  queuedTasks: number;
  estimatedAvailability: Date;
  efficiency: number;
}

export class IntelligentResourceManager extends EventEmitter {
  private agentWorkloads: Map<string, WorkloadDistribution> = new Map();
  private allocationHistory: Map<string, ResourceAllocation[]> = new Map();
  private performanceMetrics: Map<string, AgentPerformance> = new Map();
  private marketRates: Map<string, number> = new Map();

  constructor() {
    super();
    this.initializeAgentWorkloads();
    this.initializeMarketRates();
    this.startWorkloadMonitoring();
  }

  /**
   * AI-powered resource analysis and allocation
   */
  async analyzeAndAllocateResources(task: any): Promise<ResourceAllocation> {
    try {
      console.log(`🧠 Analyzing resource requirements for: ${task.title}`);
      
      // 1. Analyze task requirements using AI
      const analysis = await this.analyzeTaskRequirements(task);
      
      // 2. Get intelligent agent recommendations
      const recommendations = await this.getAgentRecommendations(analysis);
      
      // 3. Optimize resource allocation
      const allocation = await this.optimizeResourceAllocation(recommendations);
      
      // 4. Validate and adjust allocation
      const finalAllocation = await this.validateAndAdjustAllocation(allocation);
      
      // 5. Update workload tracking
      this.updateWorkloadAllocations(finalAllocation);
      
      console.log(`✅ Resource allocation completed for: ${task.title}`);
      return finalAllocation;
      
    } catch (error) {
      console.error('❌ Resource allocation failed:', error);
      throw error;
    }
  }

  /**
   * AI-powered task requirements analysis
   */
  private async analyzeTaskRequirements(task: any): Promise<ResourceAnalysis> {
    const analysisPrompt = `
Analyze this task for intelligent resource allocation:

Task: ${task.title}
Description: ${task.description}
Type: ${task.type}
Priority: ${task.priority}
Complexity: ${task.complexity}
Requirements: ${task.requirements?.join(', ') || 'None specified'}

Provide detailed analysis in JSON format:
{
  "projectComplexity": "simple|moderate|complex|enterprise",
  "skillsRequired": ["skill1", "skill2", ...],
  "estimatedEffort": number_of_hours,
  "riskFactors": ["risk1", "risk2", ...],
  "dependencies": ["dep1", "dep2", ...],
  "recommendedTeamSize": number,
  "workloadDistribution": {
    "frontend": percentage,
    "backend": percentage,
    "design": percentage,
    "qa": percentage,
    "devops": percentage
  },
  "specializedRoles": ["role1", "role2", ...],
  "timelineFactors": ["factor1", "factor2", ...],
  "qualityRequirements": ["req1", "req2", ...]
}

Consider:
- Technical complexity and skill requirements
- Team coordination overhead
- Quality and testing needs
- Deployment and infrastructure requirements
- Risk mitigation strategies
`;

    const response = await waiAPI.processRequest({
      type: 'llm',
      action: 'analyze',
      parameters: {
        prompt: analysisPrompt,
        model: 'claude-sonnet-4-20250514',
        temperature: 0.2
      }
    });

    const analysis = JSON.parse(response.data.response);
    
    return {
      taskId: task.id,
      projectComplexity: analysis.projectComplexity,
      skillsRequired: analysis.skillsRequired,
      estimatedEffort: analysis.estimatedEffort,
      riskFactors: analysis.riskFactors,
      dependencies: analysis.dependencies,
      recommendedTeamSize: analysis.recommendedTeamSize,
      recommendedAgents: [] // Will be populated by getAgentRecommendations
    };
  }

  /**
   * Get intelligent agent recommendations based on analysis
   */
  private async getAgentRecommendations(analysis: ResourceAnalysis): Promise<AgentRecommendation[]> {
    // Get available agents from WAI system
    const availableAgents = this.getAvailableAgents();
    const recommendations: AgentRecommendation[] = [];

    // AI-powered agent matching
    const matchingPrompt = `
Match the best agents for this project:

Project Analysis:
- Complexity: ${analysis.projectComplexity}
- Skills Required: ${analysis.skillsRequired.join(', ')}
- Estimated Effort: ${analysis.estimatedEffort} hours
- Team Size: ${analysis.recommendedTeamSize}

Available Agents:
${Array.from(availableAgents.entries()).map(([id, agent]) => 
  `- ${id}: ${agent.name} (${agent.capabilities.join(', ')})`
).join('\n')}

Current Workloads:
${Array.from(this.agentWorkloads.entries()).map(([id, workload]) => 
  `- ${id}: ${Math.round(workload.utilization * 100)}% utilization`
).join('\n')}

Provide agent recommendations in JSON format:
{
  "primaryTeam": [
    {
      "agentId": "agent-id",
      "agentType": "agent-type",
      "role": "specific-role",
      "workload": percentage,
      "estimatedHours": hours,
      "skillMatch": 0.0-1.0,
      "priority": "primary",
      "reasoning": "why this agent is recommended"
    }
  ],
  "supportTeam": [...],
  "alternatives": [...]
}

Consider:
- Agent skill match with requirements
- Current workload and availability
- Team composition and coordination
- Cost optimization
- Quality and performance expectations
`;

    const response = await waiAPI.processRequest({
      type: 'llm',
      action: 'recommend',
      parameters: {
        prompt: matchingPrompt,
        model: 'claude-sonnet-4-20250514',
        temperature: 0.3
      }
    });

    const recommendations_data = JSON.parse(response.data.response);
    
    // Process primary team recommendations
    for (const rec of recommendations_data.primaryTeam || []) {
      const agent = availableAgents.get(rec.agentId);
      const workload = this.agentWorkloads.get(rec.agentId);
      
      if (agent && workload) {
        recommendations.push({
          agentType: agent.role,
          agentId: rec.agentId,
          role: rec.role,
          workload: rec.workload,
          estimatedHours: rec.estimatedHours,
          skillMatch: rec.skillMatch,
          availability: 1 - workload.utilization,
          priority: rec.priority,
          reasoning: rec.reasoning
        });
      }
    }

    // Process support team recommendations
    for (const rec of recommendations_data.supportTeam || []) {
      const agent = availableAgents.get(rec.agentId);
      const workload = this.agentWorkloads.get(rec.agentId);
      
      if (agent && workload) {
        recommendations.push({
          agentType: agent.role,
          agentId: rec.agentId,
          role: rec.role,
          workload: rec.workload,
          estimatedHours: rec.estimatedHours,
          skillMatch: rec.skillMatch,
          availability: 1 - workload.utilization,
          priority: 'support',
          reasoning: rec.reasoning
        });
      }
    }

    return recommendations;
  }

  /**
   * Get available agents from the system
   */
  private getAvailableAgents(): Map<string, any> {
    const agentMap = new Map();
    const defaultAgents = [
      { id: 'cto', name: 'Chief Technology Officer', capabilities: ['architecture', 'strategy', 'leadership'] },
      { id: 'cpo', name: 'Chief Product Officer', capabilities: ['product-strategy', 'roadmap', 'user-experience'] },
      { id: 'system-architect', name: 'System Architect', capabilities: ['system-design', 'scalability', 'performance'] },
      { id: 'fullstack-developer', name: 'Fullstack Developer', capabilities: ['frontend', 'backend', 'database'] },
      { id: 'frontend-developer', name: 'Frontend Developer', capabilities: ['react', 'typescript', 'ui'] },
      { id: 'backend-developer', name: 'Backend Developer', capabilities: ['api', 'database', 'server'] },
      { id: 'ui-ux-designer', name: 'UI/UX Designer', capabilities: ['design', 'user-experience', 'prototyping'] },
      { id: 'qa-engineer', name: 'QA Engineer', capabilities: ['testing', 'automation', 'quality-assurance'] },
      { id: 'devops-engineer', name: 'DevOps Engineer', capabilities: ['deployment', 'ci-cd', 'infrastructure'] },
      { id: 'data-scientist', name: 'Data Scientist', capabilities: ['analytics', 'machine-learning', 'insights'] }
    ];
    
    for (const agent of defaultAgents) {
      agentMap.set(agent.id, agent);
    }
    
    return agentMap;
  }

  /**
   * Optimize resource allocation using AI
   */
  private async optimizeResourceAllocation(recommendations: AgentRecommendation[]): Promise<ResourceAllocation> {
    const optimizationPrompt = `
Optimize this resource allocation:

Recommendations:
${recommendations.map(rec => `
- ${rec.agentId} (${rec.agentType}): ${rec.role}
  - Workload: ${rec.workload}%
  - Skill Match: ${rec.skillMatch}
  - Availability: ${rec.availability}
  - Priority: ${rec.priority}
  - Reasoning: ${rec.reasoning}
`).join('\n')}

Market Rates:
${Array.from(this.marketRates.entries()).map(([type, rate]) => 
  `- ${type}: $${rate}/hour`
).join('\n')}

Optimize for:
1. Cost efficiency
2. Timeline optimization
3. Quality assurance
4. Risk mitigation
5. Team coordination

Provide optimized allocation in JSON format:
{
  "teamComposition": [
    {
      "agentId": "agent-id",
      "agentType": "agent-type",
      "role": "specific-role",
      "allocation": percentage,
      "estimatedHours": hours,
      "hourlyRate": rate,
      "specialization": ["skill1", "skill2"],
      "workloadStatus": "available|busy|overloaded"
    }
  ],
  "totalCost": total_cost,
  "estimatedDuration": duration_in_hours,
  "confidence": 0.0-1.0,
  "alternatives": [
    {
      "scenario": "cost-optimized",
      "teamComposition": [...],
      "tradeoffs": ["tradeoff1", "tradeoff2"],
      "cost": cost,
      "duration": duration
    }
  ],
  "riskMitigation": ["strategy1", "strategy2"],
  "qualityAssurance": ["measure1", "measure2"]
}
`;

    const response = await waiAPI.processRequest({
      type: 'llm',
      action: 'optimize',
      parameters: {
        prompt: optimizationPrompt,
        model: 'claude-sonnet-4-20250514',
        temperature: 0.2
      }
    });

    const optimization = JSON.parse(response.data.response);
    
    return {
      taskId: recommendations[0]?.agentId || 'unknown',
      teamComposition: optimization.teamComposition,
      totalCost: optimization.totalCost,
      estimatedDuration: optimization.estimatedDuration,
      confidence: optimization.confidence,
      alternatives: optimization.alternatives
    };
  }

  /**
   * Validate and adjust allocation based on constraints
   */
  private async validateAndAdjustAllocation(allocation: ResourceAllocation): Promise<ResourceAllocation> {
    // Check agent availability
    for (const member of allocation.teamComposition) {
      const workload = this.agentWorkloads.get(member.agentId);
      if (workload && workload.utilization > 0.9) {
        // Find alternative agent
        const alternative = await this.findAlternativeAgent(member);
        if (alternative) {
          const index = allocation.teamComposition.indexOf(member);
          allocation.teamComposition[index] = alternative;
        }
      }
    }

    // Validate budget constraints
    if (allocation.totalCost > 10000) { // Example budget limit
      const budgetOptimized = await this.optimizeForBudget(allocation);
      return budgetOptimized;
    }

    return allocation;
  }

  /**
   * Find alternative agent when primary choice is unavailable
   */
  private async findAlternativeAgent(member: TeamMember): Promise<TeamMember | null> {
    const availableAgents = this.getAvailableAgents();
    
    for (const [id, agent] of availableAgents) {
      if (id === member.agentId) continue;
      
      const workload = this.agentWorkloads.get(id);
      if (workload && workload.utilization < 0.7) {
        // Check if agent has similar capabilities
        const hasRequiredSkills = agent.capabilities.some(cap => 
          member.specialization.includes(cap)
        );
        
        if (hasRequiredSkills) {
          return {
            ...member,
            agentId: id,
            agentType: agent.role,
            workloadStatus: 'available'
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Optimize allocation for budget constraints
   */
  private async optimizeForBudget(allocation: ResourceAllocation): Promise<ResourceAllocation> {
    // Sort team members by hourly rate
    const sortedMembers = [...allocation.teamComposition].sort((a, b) => a.hourlyRate - b.hourlyRate);
    
    // Prefer lower-cost agents while maintaining quality
    const optimizedTeam = sortedMembers.map(member => {
      // Reduce allocation for expensive agents
      if (member.hourlyRate > 100) {
        return {
          ...member,
          allocation: Math.max(member.allocation * 0.8, 50), // Minimum 50% allocation
          estimatedHours: Math.max(member.estimatedHours * 0.8, 10)
        };
      }
      return member;
    });

    // Recalculate total cost
    const totalCost = optimizedTeam.reduce((sum, member) => 
      sum + (member.estimatedHours * member.hourlyRate), 0
    );

    return {
      ...allocation,
      teamComposition: optimizedTeam,
      totalCost
    };
  }

  /**
   * Update workload allocations after resource assignment
   */
  private updateWorkloadAllocations(allocation: ResourceAllocation): void {
    for (const member of allocation.teamComposition) {
      const workload = this.agentWorkloads.get(member.agentId);
      if (workload) {
        workload.currentLoad += member.estimatedHours;
        workload.utilization = workload.currentLoad / workload.maxCapacity;
        workload.queuedTasks += 1;
        
        // Update estimated availability
        const hoursToComplete = workload.currentLoad / workload.efficiency;
        workload.estimatedAvailability = new Date(Date.now() + hoursToComplete * 60 * 60 * 1000);
      }
    }
  }

  /**
   * Initialize agent workloads
   */
  private initializeAgentWorkloads(): void {
    const agents = this.getAvailableAgents();
    
    // Check if agents is a Map or an array
    if (agents instanceof Map) {
      for (const [id, agent] of agents) {
        this.agentWorkloads.set(id, {
          agentId: id,
          currentLoad: 0,
          maxCapacity: 40, // 40 hours per week
          utilization: 0,
          queuedTasks: 0,
          estimatedAvailability: new Date(),
          efficiency: 0.8 // 80% efficiency
        });
      }
    } else if (Array.isArray(agents)) {
      for (const agent of agents) {
        this.agentWorkloads.set(agent.id, {
          agentId: agent.id,
          currentLoad: 0,
          maxCapacity: 40, // 40 hours per week
          utilization: 0,
          queuedTasks: 0,
          estimatedAvailability: new Date(),
          efficiency: 0.8 // 80% efficiency
        });
      }
    } else {
      // Fallback: initialize with default agent types
      const defaultAgents = [
        'cto', 'cpo', 'cmo', 'program-manager', 'system-architect', 
        'fullstack-developer', 'frontend-developer', 'backend-developer',
        'ui-ux-designer', 'qa-engineer', 'devops-engineer', 'data-scientist',
        'security-engineer', 'content-strategist', 'marketing-specialist'
      ];
      
      for (const agentId of defaultAgents) {
        this.agentWorkloads.set(agentId, {
          agentId,
          currentLoad: 0,
          maxCapacity: 40, // 40 hours per week
          utilization: 0,
          queuedTasks: 0,
          estimatedAvailability: new Date(),
          efficiency: 0.8 // 80% efficiency
        });
      }
    }
  }

  /**
   * Initialize market rates for different agent types
   */
  private initializeMarketRates(): void {
    const rates = {
      'system-architect': 150,
      'senior-developer': 120,
      'fullstack-developer': 100,
      'frontend-developer': 90,
      'backend-developer': 90,
      'ui-ux-designer': 80,
      'qa-engineer': 70,
      'devops-engineer': 110,
      'data-scientist': 130,
      'security-engineer': 140,
      'product-manager': 120,
      'content-strategist': 60,
      'marketing-specialist': 70
    };

    for (const [type, rate] of Object.entries(rates)) {
      this.marketRates.set(type, rate);
    }
  }

  /**
   * Start workload monitoring
   */
  private startWorkloadMonitoring(): void {
    setInterval(() => {
      this.updateWorkloadMetrics();
      this.detectWorkloadImbalances();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Update workload metrics
   */
  private updateWorkloadMetrics(): void {
    for (const [id, workload] of this.agentWorkloads) {
      // Simulate workload decay over time
      workload.currentLoad = Math.max(0, workload.currentLoad - 0.1);
      workload.utilization = workload.currentLoad / workload.maxCapacity;
      
      // Update performance metrics
      const performance = this.performanceMetrics.get(id) || {
        completedTasks: 0,
        averageQuality: 0.8,
        averageSpeed: 1.0,
        reliability: 0.9
      };
      
      this.performanceMetrics.set(id, performance);
    }
  }

  /**
   * Detect workload imbalances
   */
  private detectWorkloadImbalances(): void {
    const overloadedAgents = Array.from(this.agentWorkloads.values())
      .filter(workload => workload.utilization > 0.9);
    
    const underutilizedAgents = Array.from(this.agentWorkloads.values())
      .filter(workload => workload.utilization < 0.3);

    if (overloadedAgents.length > 0) {
      this.emit('workload.imbalance', {
        type: 'overloaded',
        agents: overloadedAgents.map(w => w.agentId)
      });
    }

    if (underutilizedAgents.length > 0) {
      this.emit('workload.imbalance', {
        type: 'underutilized',
        agents: underutilizedAgents.map(w => w.agentId)
      });
    }
  }

  /**
   * Get resource allocation recommendations
   */
  async getResourceRecommendations(taskType: string): Promise<AgentRecommendation[]> {
    const recommendations = await this.getAgentRecommendations({
      taskId: 'recommendation-query',
      projectComplexity: 'moderate',
      skillsRequired: [taskType],
      estimatedEffort: 20,
      riskFactors: [],
      dependencies: [],
      recommendedTeamSize: 3,
      recommendedAgents: []
    });

    return recommendations;
  }

  /**
   * Get current resource utilization
   */
  getResourceUtilization(): ResourceUtilization {
    const workloads = Array.from(this.agentWorkloads.values());
    const totalCapacity = workloads.reduce((sum, w) => sum + w.maxCapacity, 0);
    const totalLoad = workloads.reduce((sum, w) => sum + w.currentLoad, 0);
    
    return {
      totalAgents: workloads.length,
      activeAgents: workloads.filter(w => w.currentLoad > 0).length,
      utilization: totalLoad / totalCapacity,
      availableCapacity: totalCapacity - totalLoad,
      queuedTasks: workloads.reduce((sum, w) => sum + w.queuedTasks, 0),
      averageEfficiency: workloads.reduce((sum, w) => sum + w.efficiency, 0) / workloads.length
    };
  }

  /**
   * Get detailed workload analysis
   */
  getWorkloadAnalysis(): WorkloadAnalysis {
    const workloads = Array.from(this.agentWorkloads.values());
    
    return {
      totalAgents: workloads.length,
      utilization: {
        high: workloads.filter(w => w.utilization > 0.8).length,
        medium: workloads.filter(w => w.utilization > 0.4 && w.utilization <= 0.8).length,
        low: workloads.filter(w => w.utilization <= 0.4).length
      },
      bottlenecks: workloads.filter(w => w.utilization > 0.9).map(w => ({
        agentId: w.agentId,
        utilization: w.utilization,
        queuedTasks: w.queuedTasks
      })),
      recommendations: this.generateWorkloadRecommendations(workloads)
    };
  }

  /**
   * Generate workload recommendations
   */
  private generateWorkloadRecommendations(workloads: WorkloadDistribution[]): string[] {
    const recommendations: string[] = [];
    
    const overloaded = workloads.filter(w => w.utilization > 0.9);
    const underutilized = workloads.filter(w => w.utilization < 0.3);
    
    if (overloaded.length > 0) {
      recommendations.push(`${overloaded.length} agents are overloaded. Consider redistributing tasks.`);
    }
    
    if (underutilized.length > 0) {
      recommendations.push(`${underutilized.length} agents are underutilized. Consider assigning more tasks.`);
    }
    
    if (workloads.length > 0) {
      const avgUtilization = workloads.reduce((sum, w) => sum + w.utilization, 0) / workloads.length;
      if (avgUtilization > 0.8) {
        recommendations.push('Overall utilization is high. Consider scaling up the team.');
      } else if (avgUtilization < 0.4) {
        recommendations.push('Overall utilization is low. Consider optimizing task distribution.');
      }
    }
    
    return recommendations;
  }
}

// Type definitions
interface AgentPerformance {
  completedTasks: number;
  averageQuality: number;
  averageSpeed: number;
  reliability: number;
}

interface ResourceUtilization {
  totalAgents: number;
  activeAgents: number;
  utilization: number;
  availableCapacity: number;
  queuedTasks: number;
  averageEfficiency: number;
}

interface WorkloadAnalysis {
  totalAgents: number;
  utilization: {
    high: number;
    medium: number;
    low: number;
  };
  bottlenecks: {
    agentId: string;
    utilization: number;
    queuedTasks: number;
  }[];
  recommendations: string[];
}

export const intelligentResourceManager = new IntelligentResourceManager();