import { FileUpload } from '@shared/schema';
import { storage } from '../storage';

export interface ProjectAnalysis {
  type: 'prd' | 'brd' | 'figma' | 'image' | 'code' | 'other';
  summary: string;
  requirements: string[];
  technologies: string[];
  complexity: 'simple' | 'medium' | 'complex' | 'enterprise';
  estimatedTimeline: string;
  recommendedAgents: string[];
  architecture: {
    frontend: string[];
    backend: string[];
    database: string[];
    deployment: string[];
  };
}

export class ProjectAnalyzer {
  async analyzeUploadedFiles(projectId: number): Promise<ProjectAnalysis> {
    const files = await storage.getFileUploadsByProject(projectId);
    
    if (files.length === 0) {
      throw new Error('No files uploaded for analysis');
    }

    // Analyze each file and combine results
    const analyses = await Promise.all(
      files.map(file => this.analyzeFile(file))
    );

    return this.combineAnalyses(analyses);
  }

  private async analyzeFile(file: FileUpload): Promise<Partial<ProjectAnalysis>> {
    const analysis: Partial<ProjectAnalysis> = {};

    // Determine file type
    analysis.type = this.determineFileType(file);

    switch (analysis.type) {
      case 'prd':
      case 'brd':
        return this.analyzeDocumentFile(file);
      case 'figma':
        return this.analyzeFigmaFile(file);
      case 'image':
        return this.analyzeImageFile(file);
      case 'code':
        return this.analyzeCodeFile(file);
      default:
        return this.analyzeGenericFile(file);
    }
  }

  private determineFileType(file: FileUpload): ProjectAnalysis['type'] {
    const extension = file.originalName.split('.').pop()?.toLowerCase();
    const mimeType = file.mimeType.toLowerCase();

    if (mimeType.includes('image')) return 'image';
    if (extension === 'fig' || file.originalName.includes('figma')) return 'figma';
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'go'].includes(extension || '')) return 'code';
    if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(extension || '')) {
      // Try to determine if it's PRD or BRD based on filename
      const filename = file.originalName.toLowerCase();
      if (filename.includes('prd') || filename.includes('product') || filename.includes('requirement')) {
        return 'prd';
      }
      if (filename.includes('brd') || filename.includes('business') || filename.includes('brief')) {
        return 'brd';
      }
    }
    
    return 'other';
  }

  private async analyzeDocumentFile(file: FileUpload): Promise<Partial<ProjectAnalysis>> {
    // In real implementation, this would extract text and analyze content
    return {
      summary: `Document analysis for ${file.originalName}`,
      requirements: [
        'User authentication and authorization',
        'Responsive web interface',
        'Data persistence and management',
        'API integration capabilities',
        'Performance optimization'
      ],
      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      complexity: 'medium',
      estimatedTimeline: '8-12 weeks',
      recommendedAgents: ['cto', 'architect', 'frontend', 'backend', 'ui_ux', 'qa']
    };
  }

  private async analyzeFigmaFile(file: FileUpload): Promise<Partial<ProjectAnalysis>> {
    return {
      summary: `UI/UX design analysis for ${file.originalName}`,
      requirements: [
        'Modern responsive design implementation',
        'Component-based architecture',
        'Interactive user interface',
        'Accessibility compliance',
        'Cross-browser compatibility'
      ],
      technologies: ['React', 'Tailwind CSS', 'Framer Motion', 'React Bits'],
      complexity: 'medium',
      estimatedTimeline: '6-10 weeks',
      recommendedAgents: ['ui_ux', 'frontend', 'architect']
    };
  }

  private async analyzeImageFile(file: FileUpload): Promise<Partial<ProjectAnalysis>> {
    return {
      summary: `Visual reference analysis for ${file.originalName}`,
      requirements: [
        'UI replication based on image reference',
        'Visual design implementation',
        'Layout and styling optimization'
      ],
      technologies: ['React', 'CSS', 'Tailwind CSS'],
      complexity: 'simple',
      estimatedTimeline: '3-6 weeks',
      recommendedAgents: ['ui_ux', 'frontend']
    };
  }

  private async analyzeCodeFile(file: FileUpload): Promise<Partial<ProjectAnalysis>> {
    return {
      summary: `Code analysis for ${file.originalName}`,
      requirements: [
        'Code review and optimization',
        'Integration with existing codebase',
        'Testing and quality assurance',
        'Documentation updates'
      ],
      technologies: ['Existing stack analysis required'],
      complexity: 'medium',
      estimatedTimeline: '4-8 weeks',
      recommendedAgents: ['architect', 'frontend', 'backend', 'qa']
    };
  }

  private async analyzeGenericFile(file: FileUpload): Promise<Partial<ProjectAnalysis>> {
    return {
      summary: `Generic file analysis for ${file.originalName}`,
      requirements: ['Further analysis required'],
      technologies: ['To be determined'],
      complexity: 'medium',
      estimatedTimeline: '6-10 weeks',
      recommendedAgents: ['cto', 'architect']
    };
  }

  private combineAnalyses(analyses: Partial<ProjectAnalysis>[]): ProjectAnalysis {
    // Combine all analyses into a comprehensive project analysis
    const combined: ProjectAnalysis = {
      type: 'other',
      summary: '',
      requirements: [],
      technologies: [],
      complexity: 'medium',
      estimatedTimeline: '6-12 weeks',
      recommendedAgents: [],
      architecture: {
        frontend: ['React', 'TypeScript', 'Tailwind CSS', 'React Bits'],
        backend: ['Node.js', 'Express', 'TypeScript'],
        database: ['PostgreSQL', 'Redis'],
        deployment: ['AWS', 'Docker', 'CI/CD Pipeline']
      }
    };

    // Merge all analyses
    analyses.forEach(analysis => {
      if (analysis.summary) {
        combined.summary += analysis.summary + '\n';
      }
      if (analysis.requirements) {
        combined.requirements.push(...analysis.requirements);
      }
      if (analysis.technologies) {
        combined.technologies.push(...analysis.technologies);
      }
      if (analysis.recommendedAgents) {
        combined.recommendedAgents.push(...analysis.recommendedAgents);
      }
    });

    // Remove duplicates
    combined.requirements = [...new Set(combined.requirements)];
    combined.technologies = [...new Set(combined.technologies)];
    combined.recommendedAgents = [...new Set(combined.recommendedAgents)];

    // Determine overall complexity
    const complexities = analyses.map(a => a.complexity).filter(Boolean);
    if (complexities.includes('enterprise')) combined.complexity = 'enterprise';
    else if (complexities.includes('complex')) combined.complexity = 'complex';
    else if (complexities.includes('medium')) combined.complexity = 'medium';
    else combined.complexity = 'simple';

    // Set primary type based on most common type
    const types = analyses.map(a => a.type).filter(Boolean);
    const typeCount = types.reduce((acc, type) => {
      acc[type!] = (acc[type!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonType = Object.entries(typeCount).sort(([,a], [,b]) => b - a)[0]?.[0];
    if (mostCommonType) {
      combined.type = mostCommonType as ProjectAnalysis['type'];
    }

    combined.summary = combined.summary.trim() || 'Comprehensive project analysis completed';

    return combined;
  }

  async generateProjectConfig(analysis: ProjectAnalysis, projectName: string): Promise<any> {
    return {
      name: projectName,
      analysis,
      phases: this.generateProjectPhases(analysis),
      techStack: this.generateTechStack(analysis),
      deployment: this.generateDeploymentConfig(analysis),
      timeline: this.generateTimeline(analysis),
      budget: this.estimateBudget(analysis)
    };
  }

  private generateProjectPhases(analysis: ProjectAnalysis): any[] {
    const basePhases = [
      {
        name: 'Planning & Analysis',
        duration: '1-2 weeks',
        agents: ['cto', 'cpo', 'architect'],
        deliverables: ['Technical specification', 'Architecture document', 'Project roadmap']
      },
      {
        name: 'Design & Prototyping',
        duration: '2-3 weeks',
        agents: ['ui_ux', 'frontend'],
        deliverables: ['UI/UX designs', 'Component library', 'Prototypes']
      },
      {
        name: 'Development',
        duration: '4-8 weeks',
        agents: ['frontend', 'backend', 'database'],
        deliverables: ['Frontend application', 'Backend APIs', 'Database schema']
      },
      {
        name: 'Testing & Quality Assurance',
        duration: '1-2 weeks',
        agents: ['qa', 'security'],
        deliverables: ['Test results', 'Security audit', 'Performance report']
      },
      {
        name: 'Deployment & Launch',
        duration: '1 week',
        agents: ['devops'],
        deliverables: ['Production deployment', 'Monitoring setup', 'Documentation']
      }
    ];

    // Adjust phases based on complexity
    if (analysis.complexity === 'enterprise') {
      basePhases.forEach(phase => {
        phase.duration = phase.duration.replace(/(\d+)/g, (match) => (parseInt(match) * 1.5).toString());
      });
    } else if (analysis.complexity === 'simple') {
      basePhases.forEach(phase => {
        phase.duration = phase.duration.replace(/(\d+)/g, (match) => Math.max(1, parseInt(match) * 0.7).toString());
      });
    }

    return basePhases;
  }

  private generateTechStack(analysis: ProjectAnalysis): any {
    return {
      frontend: {
        framework: 'React',
        language: 'TypeScript',
        styling: 'Tailwind CSS',
        components: 'React Bits',
        state: 'React Query',
        routing: 'Wouter'
      },
      backend: {
        runtime: 'Node.js',
        framework: 'Express',
        language: 'TypeScript',
        database: 'PostgreSQL',
        cache: 'Redis',
        orm: 'Drizzle ORM'
      },
      deployment: {
        platform: 'AWS',
        containerization: 'Docker',
        cicd: 'GitHub Actions',
        monitoring: 'CloudWatch'
      },
      ai: {
        orchestration: 'WAI SDK',
        agents: 'BMAD + CrewAI',
        memory: 'mem0',
        providers: ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Qwen']
      }
    };
  }

  private generateDeploymentConfig(analysis: ProjectAnalysis): any {
    return {
      environments: ['development', 'staging', 'production'],
      strategy: 'blue-green',
      scalability: analysis.complexity === 'enterprise' ? 'auto-scaling' : 'fixed',
      monitoring: true,
      backup: true,
      security: {
        ssl: true,
        waf: analysis.complexity !== 'simple',
        vpc: analysis.complexity === 'enterprise'
      }
    };
  }

  private generateTimeline(analysis: ProjectAnalysis): any {
    const baseWeeks = {
      simple: 6,
      medium: 10,
      complex: 16,
      enterprise: 24
    };

    const weeks = baseWeeks[analysis.complexity];
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalWeeks: weeks,
      milestones: [
        { name: 'Planning Complete', week: Math.ceil(weeks * 0.2) },
        { name: 'Design Complete', week: Math.ceil(weeks * 0.4) },
        { name: 'Development Complete', week: Math.ceil(weeks * 0.8) },
        { name: 'Testing Complete', week: Math.ceil(weeks * 0.95) },
        { name: 'Launch', week: weeks }
      ]
    };
  }

  private estimateBudget(analysis: ProjectAnalysis): any {
    const baseCosts = {
      simple: 5000,
      medium: 15000,
      complex: 40000,
      enterprise: 100000
    };

    const total = baseCosts[analysis.complexity];

    return {
      total,
      breakdown: {
        development: Math.ceil(total * 0.6),
        infrastructure: Math.ceil(total * 0.2),
        ai_services: Math.ceil(total * 0.1),
        miscellaneous: Math.ceil(total * 0.1)
      },
      currency: 'USD'
    };
  }
}

export const projectAnalyzer = new ProjectAnalyzer();
