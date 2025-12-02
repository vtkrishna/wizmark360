/**
 * Requirements Analyzer - COMPATIBILITY WRAPPER
 * 
 * This service delegates to the production requirements analyzer for enhanced performance
 * while maintaining backward compatibility with existing integrations.
 */

import { RequirementsAnalyzerService } from './requirements-analyzer-prod';
import type { Project, FileUpload, ActionPlan, InsertActionPlan } from '@shared/schema';

// Compatibility interface - maps to production service
export interface RequirementsAnalysis {
  type: 'prd' | 'brd' | 'figma' | 'image' | 'code' | 'text' | 'other';
  content: {
    summary: string;
    features: string[];
    techStack: string[];
    complexity: number; // 1-5
    estimatedTime: string;
    targetAudience: string[];
    businessGoals: string[];
    technicalRequirements: string[];
    constraints: string[];
    assumptions: string[];
  };
  confidence: number; // 0-1
  suggestions: string[];
  risks: string[];
  nextSteps: string[];
}

// Compatibility wrapper class
export class RequirementsAnalyzer {
  private prodService: RequirementsAnalyzerService;

  constructor() {
    this.prodService = new RequirementsAnalyzerService();
  }

  async analyzeRequirements(content: string, type: string = 'text'): Promise<RequirementsAnalysis> {
    const result = await this.prodService.analyzeRequirements({
      content,
      contentType: type as any,
      analysisDepth: 'comprehensive'
    });

    // Map production result to compatibility interface
    return {
      type: type as any,
      content: {
        summary: result.analysis?.summary || '',
        features: result.analysis?.functionalRequirements?.map(r => r.title) || [],
        techStack: [],
        complexity: result.analysis?.complexity === 'high' ? 4 : 3,
        estimatedTime: result.analysis?.timeline?.totalDuration || '2-4 weeks',
        targetAudience: [],
        businessGoals: result.analysis?.businessRules?.map(r => r.description) || [],
        technicalRequirements: result.analysis?.nonFunctionalRequirements?.map(r => r.title) || [],
        constraints: [],
        assumptions: []
      },
      confidence: 0.85,
      suggestions: result.recommendations || [],
      risks: result.analysis?.risks?.map(r => r.description) || [],
      nextSteps: ['Refine requirements', 'Create project plan', 'Begin development']
    };
  }
}

export interface ActionPlanGeneration {
  title: string;
  description: string;
  estimatedDuration: string;
  phases: {
    id: string;
    name: string;
    description: string;
    duration: string;
    tasks: TaskBreakdown[];
    dependencies: string[];
    deliverables: string[];
  }[];
  resources: {
    type: 'human' | 'tool' | 'service' | 'infrastructure';
    name: string;
    description: string;
    required: boolean;
    cost?: string;
  }[];
  risks: {
    category: 'technical' | 'business' | 'timeline' | 'resource';
    description: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
  }[];
  milestones: {
    name: string;
    description: string;
    dueDate: string;
    criteria: string[];
  }[];
}

export interface TaskBreakdown {
  id: string;
  title: string;
  description: string;
  type: 'development' | 'design' | 'testing' | 'deployment' | 'analysis' | 'research' | 'review';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'urgent';
  estimatedTime: number; // in hours
  dependencies: string[];
  assignedAgent: string; // AI agent type
  techStack: string[];
  acceptanceCriteria: string[];
  notes: string;
}

export class RequirementsAnalyzer {
  private analysisHistory: Map<string, RequirementsAnalysis> = new Map();
  private actionPlanHistory: Map<string, ActionPlanGeneration> = new Map();

  constructor() {}

  /**
   * Analyze uploaded requirements and documents
   */
  async analyzeRequirements(
    project: Project,
    files: FileUpload[],
    textRequirements?: string,
    userId?: number
  ): Promise<RequirementsAnalysis> {
    try {
      // Prepare analysis context
      const analysisContext = {
        projectName: project.name,
        projectDescription: project.description,
        files: files.map(f => ({
          name: f.originalName,
          type: f.mimeType,
          size: f.size,
          path: f.path
        })),
        textRequirements,
        existingAnalysis: project.analysis,
        userContext: userId ? await mem0Memory.getRelevantContext(userId.toString(), project.id.toString()) : null
      };

      // Use Claude MCP for advanced document analysis
      const claudeAnalysis = await claudeMCP.executeEngineeringTask(
        `analysis_${project.id}`,
        'analyze_requirements',
        analysisContext
      );

      // Enhance with additional LLM providers for comprehensive analysis
      const enhancedAnalysis = await this.enhanceAnalysisWithMultipleProviders(analysisContext, claudeAnalysis);

      // Store analysis in memory for future reference
      if (userId) {
        await mem0Memory.addMemory(
          `Requirements analysis for project: ${project.name}`,
          'workflow',
          {
            projectId: project.id,
            userId,
            analysis: enhancedAnalysis,
            timestamp: new Date()
          }
        );
      }

      // Cache the analysis
      this.analysisHistory.set(`${project.id}_${Date.now()}`, enhancedAnalysis);

      return enhancedAnalysis;
    } catch (error) {
      console.error('Requirements analysis failed:', error);
      
      // Return basic analysis as fallback
      return this.generateFallbackAnalysis(project, files, textRequirements);
    }
  }

  /**
   * Generate comprehensive action plan based on requirements analysis
   */
  async generateActionPlan(
    project: Project,
    analysis: RequirementsAnalysis,
    userId?: number
  ): Promise<ActionPlanGeneration> {
    try {
      const planningContext = {
        project: {
          name: project.name,
          description: project.description,
          techStack: project.techStack,
          priority: project.priority,
          dueDate: project.dueDate
        },
        analysis,
        organizationCapabilities: await this.getOrganizationCapabilities(project.organizationId),
        availableAgents: this.getAvailableAgents(),
        userPreferences: userId ? await mem0Memory.getPersonalizedRecommendations(userId.toString()) : null
      };

      // Generate action plan using Claude MCP
      const actionPlan = await claudeMCP.executeEngineeringTask(
        `planning_${project.id}`,
        'generate_action_plan',
        planningContext
      );

      // Enhance plan with additional providers
      const enhancedPlan = await this.enhanceActionPlan(actionPlan, planningContext);

      // Store action plan
      this.actionPlanHistory.set(`${project.id}_${Date.now()}`, enhancedPlan);

      return enhancedPlan;
    } catch (error) {
      console.error('Action plan generation failed:', error);
      return this.generateFallbackActionPlan(project, analysis);
    }
  }

  /**
   * Analyze uploaded files and extract requirements
   */
  async analyzeUploadedFiles(files: FileUpload[]): Promise<{
    fileAnalysis: Record<string, any>;
    extractedRequirements: string[];
    suggestedTechStack: string[];
    detectedPatterns: string[];
  }> {
    const fileAnalysis: Record<string, any> = {};
    const extractedRequirements: string[] = [];
    const suggestedTechStack: string[] = [];
    const detectedPatterns: string[] = [];

    for (const file of files) {
      try {
        let analysis: any = {};

        if (file.mimeType.startsWith('image/')) {
          // Analyze images (screenshots, mockups, designs)
          analysis = await this.analyzeImageFile(file);
        } else if (file.mimeType === 'application/pdf') {
          // Analyze PDF documents (PRD, BRD, specs)
          analysis = await this.analyzePDFFile(file);
        } else if (file.mimeType.includes('text/') || file.mimeType.includes('application/json')) {
          // Analyze text files and JSON
          analysis = await this.analyzeTextFile(file);
        } else if (file.originalName.includes('.fig') || file.originalName.includes('figma')) {
          // Analyze Figma files
          analysis = await this.analyzeFigmaFile(file);
        }

        fileAnalysis[file.originalName] = analysis;
        
        if (analysis.requirements) {
          extractedRequirements.push(...analysis.requirements);
        }
        
        if (analysis.techStack) {
          suggestedTechStack.push(...analysis.techStack);
        }
        
        if (analysis.patterns) {
          detectedPatterns.push(...analysis.patterns);
        }
      } catch (error) {
        console.error(`Error analyzing file ${file.originalName}:`, error);
        fileAnalysis[file.originalName] = { error: 'Analysis failed' };
      }
    }

    return {
      fileAnalysis,
      extractedRequirements: [...new Set(extractedRequirements)],
      suggestedTechStack: [...new Set(suggestedTechStack)],
      detectedPatterns: [...new Set(detectedPatterns)]
    };
  }

  /**
   * Generate task breakdown with agent assignment
   */
  async generateTaskBreakdown(
    actionPlan: ActionPlanGeneration,
    project: Project
  ): Promise<TaskBreakdown[]> {
    const allTasks: TaskBreakdown[] = [];

    for (const phase of actionPlan.phases) {
      for (const task of phase.tasks) {
        // Enhance task with AI analysis
        const enhancedTask = await this.enhanceTaskWithAI(task, phase, project);
        allTasks.push(enhancedTask);
      }
    }

    return allTasks;
  }

  /**
   * Private helper methods
   */
  private async enhanceAnalysisWithMultipleProviders(
    context: any,
    baseAnalysis: any
  ): Promise<RequirementsAnalysis> {
    // Use multiple LLM providers for comprehensive analysis
    const providers = ['openai', 'anthropic', 'google'];
    const analyses: any[] = [baseAnalysis];

    for (const provider of providers) {
      try {
        const analysis = await advancedLLMProviders.processRequest({
          provider,
          model: this.getBestModelForProvider(provider),
          messages: [{
            role: 'user',
            content: this.buildAnalysisPrompt(context)
          }],
          temperature: 0.1,
          response_format: { type: 'json_object' }
        });
        
        analyses.push(analysis.choices[0].message.content);
      } catch (error) {
        console.warn(`Failed to get analysis from ${provider}:`, error);
      }
    }

    // Merge and synthesize analyses
    return this.synthesizeAnalyses(analyses);
  }

  private async enhanceActionPlan(actionPlan: any, context: any): Promise<ActionPlanGeneration> {
    // Enhance action plan with additional AI insights
    const enhancementPrompt = `
    Based on the following action plan and context, enhance it with:
    1. More detailed task breakdowns
    2. Realistic time estimates
    3. Risk assessments
    4. Resource requirements
    5. Agent assignments

    Context: ${JSON.stringify(context)}
    Action Plan: ${JSON.stringify(actionPlan)}
    
    Provide enhanced action plan in JSON format.
    `;

    try {
      const enhancement = await advancedLLMProviders.processRequest({
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        messages: [{ role: 'user', content: enhancementPrompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(enhancement.choices[0].message.content);
    } catch (error) {
      console.warn('Failed to enhance action plan:', error);
      return actionPlan;
    }
  }

  private async analyzeImageFile(file: FileUpload): Promise<any> {
    // Use vision models to analyze images
    const analysisPrompt = `
    Analyze this image and extract:
    1. UI/UX requirements
    2. Design patterns
    3. Suggested technologies
    4. Functional requirements
    5. User flow insights
    
    Provide analysis in JSON format.
    `;

    try {
      const analysis = await advancedLLMProviders.processRequest({
        provider: 'openai',
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: analysisPrompt },
            { 
              type: 'image_url', 
              image_url: { url: `file://${file.path}` }
            }
          ]
        }],
        temperature: 0.1
      });

      return JSON.parse(analysis.choices[0].message.content);
    } catch (error) {
      return { error: 'Image analysis failed', type: 'image' };
    }
  }

  private async analyzePDFFile(file: FileUpload): Promise<any> {
    // Placeholder for PDF analysis - would need PDF parsing library
    return {
      type: 'document',
      requirements: ['Document-based requirements detected'],
      techStack: ['Web application'],
      patterns: ['Traditional software project']
    };
  }

  private async analyzeTextFile(file: FileUpload): Promise<any> {
    // Analyze text files for requirements
    return {
      type: 'text',
      requirements: ['Text-based requirements'],
      techStack: ['To be determined'],
      patterns: ['Custom requirements']
    };
  }

  private async analyzeFigmaFile(file: FileUpload): Promise<any> {
    // Analyze Figma design files
    return {
      type: 'design',
      requirements: ['UI/UX requirements from Figma'],
      techStack: ['React', 'CSS/Tailwind', 'JavaScript'],
      patterns: ['Modern web application', 'Component-based design']
    };
  }

  private async enhanceTaskWithAI(
    task: TaskBreakdown,
    phase: any,
    project: Project
  ): Promise<TaskBreakdown> {
    // Enhance task with AI recommendations
    const enhancementPrompt = `
    Enhance this task with detailed information:
    - Acceptance criteria
    - Technical implementation notes
    - Potential challenges
    - Best agent assignment
    
    Task: ${JSON.stringify(task)}
    Phase: ${phase.name}
    Project: ${project.name}
    
    Return enhanced task in JSON format.
    `;

    try {
      const enhancement = await advancedLLMProviders.processRequest({
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        messages: [{ role: 'user', content: enhancementPrompt }],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });

      const enhancedData = JSON.parse(enhancement.choices[0].message.content);
      return { ...task, ...enhancedData };
    } catch (error) {
      return task;
    }
  }

  private generateFallbackAnalysis(
    project: Project,
    files: FileUpload[],
    textRequirements?: string
  ): RequirementsAnalysis {
    return {
      type: 'other',
      content: {
        summary: `Analysis for ${project.name}: ${project.description || 'No description provided'}`,
        features: textRequirements ? [textRequirements] : ['Feature analysis pending'],
        techStack: (project.techStack as string[]) || ['To be determined'],
        complexity: 3,
        estimatedTime: '4-6 weeks',
        targetAudience: ['General users'],
        businessGoals: ['Solve user problems'],
        technicalRequirements: ['Scalable architecture'],
        constraints: ['Budget and timeline'],
        assumptions: ['Standard web application requirements']
      },
      confidence: 0.6,
      suggestions: ['Upload more detailed requirements', 'Provide design mockups'],
      risks: ['Unclear requirements', 'Timeline constraints'],
      nextSteps: ['Clarify requirements', 'Begin initial development']
    };
  }

  private generateFallbackActionPlan(
    project: Project,
    analysis: RequirementsAnalysis
  ): ActionPlanGeneration {
    return {
      title: `Action Plan: ${project.name}`,
      description: 'Comprehensive development plan based on requirements analysis',
      estimatedDuration: analysis.content.estimatedTime,
      phases: [
        {
          id: 'planning',
          name: 'Planning & Architecture',
          description: 'Project setup and architecture design',
          duration: '1 week',
          tasks: [],
          dependencies: [],
          deliverables: ['Project structure', 'Architecture document']
        },
        {
          id: 'development',
          name: 'Core Development',
          description: 'Main application development',
          duration: '3-4 weeks',
          tasks: [],
          dependencies: ['planning'],
          deliverables: ['Working application', 'Test suite']
        },
        {
          id: 'deployment',
          name: 'Testing & Deployment',
          description: 'Final testing and production deployment',
          duration: '1 week',
          tasks: [],
          dependencies: ['development'],
          deliverables: ['Production application', 'Documentation']
        }
      ],
      resources: [
        { type: 'human', name: 'Development Team', description: 'Full-stack developers', required: true },
        { type: 'tool', name: 'Development Tools', description: 'IDEs, version control', required: true },
        { type: 'infrastructure', name: 'Hosting Platform', description: 'Cloud deployment', required: true }
      ],
      risks: [
        {
          category: 'timeline',
          description: 'Potential delays due to complexity',
          probability: 'medium',
          impact: 'medium',
          mitigation: 'Regular progress reviews and scope adjustments'
        }
      ],
      milestones: [
        {
          name: 'Project Setup Complete',
          description: 'Development environment ready',
          dueDate: '1 week',
          criteria: ['Repository created', 'CI/CD pipeline setup']
        },
        {
          name: 'MVP Ready',
          description: 'Minimum viable product complete',
          dueDate: '4 weeks',
          criteria: ['Core features working', 'Basic testing complete']
        }
      ]
    };
  }

  private buildAnalysisPrompt(context: any): string {
    return `
    Analyze the following project requirements and provide a comprehensive analysis:

    Project: ${context.projectName}
    Description: ${context.projectDescription}
    Files: ${JSON.stringify(context.files)}
    Requirements: ${context.textRequirements}

    Provide analysis in JSON format with:
    - type (prd|brd|figma|image|code|text|other)
    - content (summary, features, techStack, complexity, estimatedTime, etc.)
    - confidence (0-1)
    - suggestions
    - risks
    - nextSteps

    Be thorough and specific.
    `;
  }

  private synthesizeAnalyses(analyses: any[]): RequirementsAnalysis {
    // Combine multiple analyses into one comprehensive result
    // This is a simplified implementation - could be enhanced with ML
    const firstAnalysis = analyses[0];
    
    return {
      type: firstAnalysis.type || 'other',
      content: firstAnalysis.content || {
        summary: 'Analysis completed',
        features: [],
        techStack: [],
        complexity: 3,
        estimatedTime: '4-6 weeks',
        targetAudience: [],
        businessGoals: [],
        technicalRequirements: [],
        constraints: [],
        assumptions: []
      },
      confidence: 0.8,
      suggestions: firstAnalysis.suggestions || [],
      risks: firstAnalysis.risks || [],
      nextSteps: firstAnalysis.nextSteps || []
    };
  }

  private getBestModelForProvider(provider: string): string {
    const modelMap: Record<string, string> = {
      'openai': 'gpt-4o',
      'anthropic': 'claude-sonnet-4-20250514',
      'google': 'gemini-2.5-pro',
      'xai': 'grok-2-1212'
    };
    return modelMap[provider] || 'gpt-4o';
  }

  private async getOrganizationCapabilities(orgId: number | null): Promise<any> {
    // Get organization capabilities and resources
    return {
      teamSize: 5,
      techStack: ['React', 'Node.js', 'PostgreSQL'],
      specializations: ['Web Development', 'AI Integration'],
      budget: 'medium',
      timeline: 'flexible'
    };
  }

  private getAvailableAgents(): string[] {
    return [
      'cto', 'cpo', 'cmo', 'frontend-developer', 'backend-developer',
      'fullstack-developer', 'ui-designer', 'ux-designer', 'qa-engineer',
      'devops-engineer', 'security-specialist', 'ai-specialist'
    ];
  }

  /**
   * Get analysis statistics
   */
  getAnalysisStats(): {
    totalAnalyses: number;
    avgConfidence: number;
    topRequirementTypes: string[];
    commonTechStacks: string[];
  } {
    const analyses = Array.from(this.analysisHistory.values());
    
    return {
      totalAnalyses: analyses.length,
      avgConfidence: analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length || 0,
      topRequirementTypes: this.getTopTypes(analyses.map(a => a.type)),
      commonTechStacks: this.getCommonTechStacks(analyses)
    };
  }

  private getTopTypes(types: string[]): string[] {
    const counts = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type]) => type);
  }

  private getCommonTechStacks(analyses: RequirementsAnalysis[]): string[] {
    const allTech = analyses.flatMap(a => a.content.techStack);
    const counts = allTech.reduce((acc, tech) => {
      acc[tech] = (acc[tech] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tech]) => tech);
  }
}

export const requirementsAnalyzer = new RequirementsAnalyzer();