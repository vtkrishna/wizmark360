/**
 * Prompt Enhancer Service
 * AI-powered prompt optimization and project planning system
 */

import { elevenLLMProviders } from './eleven-llm-providers';

export interface PromptEnhancementRequest {
  originalPrompt: string;
  projectType?: 'web' | 'mobile' | 'desktop' | 'ai' | 'enterprise';
  complexity?: 'simple' | 'medium' | 'complex' | 'enterprise';
  timeline?: string;
  budget?: string;
  technologies?: string[];
  requirements?: string[];
}

export interface EnhancedPrompt {
  enhanced: string;
  improvements: string[];
  clarity: number; // 0-100
  specificity: number; // 0-100
  completeness: number; // 0-100
  technicalDepth: number; // 0-100
}

export interface ProjectPlan {
  id: string;
  title: string;
  description: string;
  phases: ProjectPhase[];
  timeline: string;
  estimatedCost: number;
  technologies: Technology[];
  risks: Risk[];
  success_metrics: string[];
  deliverables: Deliverable[];
  team_requirements: TeamRequirement[];
}

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  duration: string;
  dependencies: string[];
  tasks: Task[];
  milestones: Milestone[];
  agents_required: string[];
}

export interface Task {
  id: string;
  name: string;
  description: string;
  effort: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  skills_required: string[];
  estimated_hours: number;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  deliverables: string[];
}

export interface Technology {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'infrastructure' | 'ai' | 'mobile';
  reason: string;
  alternatives: string[];
}

export interface Risk {
  id: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  probability: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  phase: string;
  format: string;
}

export interface TeamRequirement {
  role: string;
  skills: string[];
  effort_percentage: number;
  critical: boolean;
}

export class PromptEnhancer {
  private enhancementPrompts = {
    clarity: `Analyze this prompt for clarity and suggest improvements:
- Are the requirements clearly stated?
- Is the scope well-defined?
- Are there any ambiguous terms?
- What additional context would be helpful?`,
    
    specificity: `Make this prompt more specific by adding:
- Technical specifications
- Functional requirements
- Non-functional requirements
- User experience expectations
- Performance criteria
- Security requirements`,
    
    completeness: `Identify missing elements in this prompt:
- Target audience definition
- Success criteria
- Constraints and limitations
- Integration requirements
- Deployment preferences
- Maintenance considerations`,
    
    structure: `Restructure this prompt for maximum effectiveness:
- Clear objective statement
- Detailed requirements list
- Technical preferences
- Timeline and budget constraints
- Quality expectations
- Acceptance criteria`
  };

  /**
   * Enhance a user prompt for better project planning
   */
  async enhancePrompt(request: PromptEnhancementRequest): Promise<EnhancedPrompt> {
    const enhancementRequest = {
      id: `prompt_enhance_${Date.now()}`,
      prompt: this.buildEnhancementPrompt(request),
      maxTokens: 3000,
      temperature: 0.7,
      priority: 'high' as const,
      context: {
        requiresStructured: true,
        outputFormat: 'json'
      }
    };

    const response = await elevenLLMProviders.processRequest(enhancementRequest);
    
    try {
      const result = JSON.parse(response.content);
      return {
        enhanced: result.enhanced_prompt,
        improvements: result.improvements || [],
        clarity: result.clarity_score || 70,
        specificity: result.specificity_score || 70,
        completeness: result.completeness_score || 70,
        technicalDepth: result.technical_depth_score || 70
      };
    } catch (error) {
      // Fallback if JSON parsing fails
      return {
        enhanced: response.content,
        improvements: ['Enhanced for clarity and completeness'],
        clarity: 75,
        specificity: 75,
        completeness: 75,
        technicalDepth: 75
      };
    }
  }

  /**
   * Generate comprehensive project plan from enhanced prompt
   */
  async generateProjectPlan(enhancedPrompt: string, originalRequest: PromptEnhancementRequest): Promise<ProjectPlan> {
    const planningRequest = {
      id: `project_plan_${Date.now()}`,
      prompt: this.buildProjectPlanPrompt(enhancedPrompt, originalRequest),
      maxTokens: 5000,
      temperature: 0.6,
      priority: 'high' as const,
      context: {
        requiresStructured: true,
        outputFormat: 'json'
      }
    };

    const response = await elevenLLMProviders.processRequest(planningRequest);
    
    try {
      const result = JSON.parse(response.content);
      return this.validateAndEnhanceProjectPlan(result);
    } catch (error) {
      console.error('Error parsing project plan:', error);
      throw new Error('Failed to generate structured project plan');
    }
  }

  private buildEnhancementPrompt(request: PromptEnhancementRequest): string {
    return `You are an expert prompt engineer and project analyst. Enhance the following prompt for optimal AI-powered software development:

ORIGINAL PROMPT:
"${request.originalPrompt}"

PROJECT CONTEXT:
- Type: ${request.projectType || 'not specified'}
- Complexity: ${request.complexity || 'not specified'}
- Timeline: ${request.timeline || 'not specified'}
- Budget: ${request.budget || 'not specified'}
- Technologies: ${request.technologies?.join(', ') || 'not specified'}
- Requirements: ${request.requirements?.join(', ') || 'not specified'}

ENHANCEMENT GOALS:
1. Improve clarity and remove ambiguity
2. Add technical specificity
3. Include missing requirements
4. Structure for AI agent processing
5. Add success criteria and acceptance tests

OUTPUT FORMAT (JSON):
{
  "enhanced_prompt": "detailed enhanced version",
  "improvements": ["list of specific improvements made"],
  "clarity_score": 0-100,
  "specificity_score": 0-100,
  "completeness_score": 0-100,
  "technical_depth_score": 0-100,
  "missing_elements": ["elements that need user clarification"],
  "recommendations": ["additional suggestions for the user"]
}`;
  }

  private buildProjectPlanPrompt(enhancedPrompt: string, request: PromptEnhancementRequest): string {
    return `You are a senior project manager and software architect. Create a comprehensive project plan for the following enhanced requirements:

ENHANCED REQUIREMENTS:
"${enhancedPrompt}"

PROJECT PARAMETERS:
- Type: ${request.projectType || 'web application'}
- Complexity: ${request.complexity || 'medium'}
- Timeline: ${request.timeline || 'flexible'}
- Budget: ${request.budget || 'moderate'}

Create a detailed project plan that leverages WAI DevStudio's 39 specialized agents, 11 LLM providers, and enterprise capabilities.

OUTPUT FORMAT (JSON):
{
  "id": "unique_project_id",
  "title": "project title",
  "description": "comprehensive project description",
  "phases": [
    {
      "id": "phase_id",
      "name": "phase name",
      "description": "phase description",
      "duration": "time estimate",
      "dependencies": ["phase dependencies"],
      "tasks": [
        {
          "id": "task_id",
          "name": "task name",
          "description": "task description",
          "effort": "effort estimate",
          "priority": "critical|high|medium|low",
          "skills_required": ["required skills"],
          "estimated_hours": 0
        }
      ],
      "milestones": [
        {
          "id": "milestone_id",
          "name": "milestone name",
          "description": "milestone description",
          "criteria": ["success criteria"],
          "deliverables": ["deliverable names"]
        }
      ],
      "agents_required": ["WAI agent types needed"]
    }
  ],
  "timeline": "overall timeline",
  "estimatedCost": 0,
  "technologies": [
    {
      "name": "technology name",
      "category": "frontend|backend|database|infrastructure|ai|mobile",
      "reason": "selection rationale",
      "alternatives": ["alternative options"]
    }
  ],
  "risks": [
    {
      "id": "risk_id",
      "description": "risk description",
      "impact": "low|medium|high|critical",
      "probability": "low|medium|high",
      "mitigation": "mitigation strategy"
    }
  ],
  "success_metrics": ["measurable success criteria"],
  "deliverables": [
    {
      "id": "deliverable_id",
      "name": "deliverable name",
      "description": "deliverable description",
      "phase": "associated phase",
      "format": "deliverable format"
    }
  ],
  "team_requirements": [
    {
      "role": "team role",
      "skills": ["required skills"],
      "effort_percentage": 0,
      "critical": true|false
    }
  ]
}`;
  }

  private validateAndEnhanceProjectPlan(plan: any): ProjectPlan {
    // Validate required fields and provide defaults
    return {
      id: plan.id || `project_${Date.now()}`,
      title: plan.title || 'Untitled Project',
      description: plan.description || 'Project description not provided',
      phases: this.validatePhases(plan.phases || []),
      timeline: plan.timeline || 'To be determined',
      estimatedCost: typeof plan.estimatedCost === 'number' ? plan.estimatedCost : 0,
      technologies: plan.technologies || [],
      risks: plan.risks || [],
      success_metrics: plan.success_metrics || [],
      deliverables: plan.deliverables || [],
      team_requirements: plan.team_requirements || []
    };
  }

  private validatePhases(phases: any[]): ProjectPhase[] {
    return phases.map((phase, index) => ({
      id: phase.id || `phase_${index + 1}`,
      name: phase.name || `Phase ${index + 1}`,
      description: phase.description || 'Phase description not provided',
      duration: phase.duration || 'TBD',
      dependencies: Array.isArray(phase.dependencies) ? phase.dependencies : [],
      tasks: Array.isArray(phase.tasks) ? phase.tasks.map((task: any, taskIndex: number) => ({
        id: task.id || `task_${index}_${taskIndex}`,
        name: task.name || `Task ${taskIndex + 1}`,
        description: task.description || 'Task description not provided',
        effort: task.effort || 'TBD',
        priority: ['critical', 'high', 'medium', 'low'].includes(task.priority) ? task.priority : 'medium',
        skills_required: Array.isArray(task.skills_required) ? task.skills_required : [],
        estimated_hours: typeof task.estimated_hours === 'number' ? task.estimated_hours : 0
      })) : [],
      milestones: Array.isArray(phase.milestones) ? phase.milestones : [],
      agents_required: Array.isArray(phase.agents_required) ? phase.agents_required : []
    }));
  }

  /**
   * Get prompt enhancement suggestions
   */
  async getPromptSuggestions(prompt: string): Promise<string[]> {
    const analysisRequest = {
      id: `prompt_analysis_${Date.now()}`,
      prompt: `Analyze this prompt and provide 5 specific suggestions to improve it for AI-powered software development:

"${prompt}"

Focus on:
1. Technical clarity
2. Scope definition
3. Requirements completeness
4. Success criteria
5. Implementation details

Provide concise, actionable suggestions.`,
      maxTokens: 1000,
      temperature: 0.7,
      priority: 'medium' as const
    };

    const response = await elevenLLMProviders.processRequest(analysisRequest);
    
    // Extract suggestions from response (simple parsing)
    const suggestions = response.content
      .split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(suggestion => suggestion.length > 10);

    return suggestions.length > 0 ? suggestions : [
      'Add specific technical requirements',
      'Define clear success criteria',
      'Specify target audience and use cases',
      'Include performance and security requirements',
      'Clarify integration and deployment needs'
    ];
  }
}

export const promptEnhancer = new PromptEnhancer();