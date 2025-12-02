import { EventEmitter } from 'events';
import type { UnifiedOrchestrationRequest as EnhancedWAIRequest } from './unified-wai-orchestration-complete';
import { llmProviders } from './llm-providers';
import { storage } from '../storage';

interface SpecializedAgentConfig {
  name: string;
  role: string;
  expertise: string[];
  responsibilities: string[];
  decisionMakingLevel: 'strategic' | 'tactical' | 'operational';
  collaborationStyle: string;
}

interface LeadershipDecision {
  id: string;
  agentType: string;
  decisionType: 'strategic' | 'tactical' | 'operational';
  description: string;
  impact: 'high' | 'medium' | 'low';
  stakeholders: string[];
  timeline: string;
  metadata?: any;
}

export class SpecializedAgents extends EventEmitter {
  private orchestrator: any;
  private agentConfigs: Map<string, SpecializedAgentConfig> = new Map();
  private activeDecisions: Map<string, LeadershipDecision> = new Map();

  constructor(orchestrator: any) {
    super();
    this.orchestrator = orchestrator;
    this.initializeSpecializedAgents();
  }

  private initializeSpecializedAgents(): void {
    // CTO Agent Configuration
    this.agentConfigs.set('cto-agent', {
      name: 'Chief Technology Officer Agent',
      role: 'Technical Leadership',
      expertise: [
        'technology-strategy',
        'system-architecture',
        'engineering-leadership',
        'technical-debt-management',
        'scalability-planning',
        'technology-evaluation',
        'team-coordination',
        'technical-risk-assessment'
      ],
      responsibilities: [
        'Overall technical strategy and direction',
        'Architecture decisions and technology stack selection',
        'Engineering team coordination and workflow optimization',
        'Technical risk assessment and mitigation',
        'Code quality standards and best practices',
        'Scalability and performance planning',
        'Technical debt management',
        'Integration and deployment strategies'
      ],
      decisionMakingLevel: 'strategic',
      collaborationStyle: 'directive-collaborative'
    });

    // CPO Agent Configuration
    this.agentConfigs.set('cpo-agent', {
      name: 'Chief Product Officer Agent',
      role: 'Product Leadership',
      expertise: [
        'product-strategy',
        'user-experience-strategy',
        'market-analysis',
        'product-roadmap-planning',
        'user-research',
        'competitive-analysis',
        'feature-prioritization',
        'product-metrics'
      ],
      responsibilities: [
        'Product vision and strategy development',
        'User experience and interface design oversight',
        'Market analysis and competitive positioning',
        'Product roadmap planning and feature prioritization',
        'User feedback integration and research coordination',
        'Cross-functional team alignment on product goals',
        'Product performance metrics and KPI definition',
        'Stakeholder communication and product evangelism'
      ],
      decisionMakingLevel: 'strategic',
      collaborationStyle: 'user-centered-collaborative'
    });

    // CMO Agent Configuration
    this.agentConfigs.set('cmo-agent', {
      name: 'Chief Marketing Officer Agent',
      role: 'Marketing Leadership',
      expertise: [
        'marketing-strategy',
        'brand-positioning',
        'go-to-market-planning',
        'digital-marketing',
        'content-strategy',
        'customer-acquisition',
        'market-research',
        'growth-hacking'
      ],
      responsibilities: [
        'Marketing strategy and brand positioning',
        'Go-to-market planning and execution',
        'Customer acquisition and retention strategies',
        'Content marketing and thought leadership',
        'Digital marketing and online presence optimization',
        'Market research and customer insights',
        'Growth hacking and viral marketing tactics',
        'Marketing ROI optimization and metrics tracking'
      ],
      decisionMakingLevel: 'strategic',
      collaborationStyle: 'customer-focused-collaborative'
    });

    console.log('Specialized leadership agents initialized');
  }

  async executeTask(agentType: string, request: EnhancedWAIRequest): Promise<any> {
    const agentConfig = this.agentConfigs.get(agentType);
    if (!agentConfig) {
      throw new Error(`Unknown specialized agent type: ${agentType}`);
    }

    // Create specialized prompt for leadership agent
    const prompt = this.createLeadershipPrompt(agentConfig, request);

    try {
      // Use premium models for leadership decisions (Claude for strategic thinking)
      const response = await llmProviders.processWithAnthropic({
        prompt,
        type: 'analysis',
        maxTokens: 4000,
        temperature: 0.2 // Lower temperature for more focused leadership decisions
      });

      // Process and structure the response
      const structuredResponse = await this.structureLeadershipResponse(agentType, response, request);

      // Record the decision/recommendation
      await this.recordLeadershipDecision(agentType, structuredResponse, request);

      // Coordinate with other agents if needed
      await this.coordinateWithTeam(agentType, structuredResponse, request);

      return {
        content: structuredResponse.content,
        model: response.model,
        quality: 0.95, // High quality expected from leadership agents
        agent: agentType,
        metadata: {
          decisionType: structuredResponse.decisionType,
          impact: structuredResponse.impact,
          stakeholders: structuredResponse.stakeholders,
          timeline: structuredResponse.timeline,
          processingTime: response.processingTime,
          cost: response.cost
        }
      };

    } catch (error) {
      console.error(`Error executing specialized agent ${agentType}:`, error);
      throw new Error(`Specialized agent ${agentType} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createLeadershipPrompt(config: SpecializedAgentConfig, request: EnhancedWAIRequest): string {
    return `You are the ${config.name}, a senior leadership role in our AI-driven software development organization using the BMAD (Breakthrough Method for Agile AI-Driven Development) methodology.

**Your Role & Expertise:**
- Role: ${config.role}
- Decision-making Level: ${config.decisionMakingLevel}
- Collaboration Style: ${config.collaborationStyle}

**Your Core Expertise:**
${config.expertise.map(skill => `• ${skill.replace('-', ' ')}`).join('\n')}

**Your Key Responsibilities:**
${config.responsibilities.map(resp => `• ${resp}`).join('\n')}

**Current Leadership Challenge:**
Task: ${request.operation}
Context: ${request.content}
Priority: ${request.priority}
Project ID: ${request.projectId}

**Leadership Framework:**
As a ${config.role} leader, please provide:

1. **Strategic Analysis**: High-level assessment of the situation
2. **Decision Recommendation**: Clear, actionable recommendations
3. **Resource Allocation**: How to best utilize our 28 AI agents and team resources
4. **Risk Assessment**: Potential risks and mitigation strategies
5. **Success Metrics**: How we'll measure success
6. **Timeline & Milestones**: Key deliverables and deadlines
7. **Stakeholder Communication**: Key messages for different stakeholders

**Leadership Perspective:**
Consider the broader impact on:
- Technical excellence and innovation
- User experience and product quality
- Market positioning and competitive advantage
- Team efficiency and developer experience
- Cost optimization and ROI
- Long-term strategic goals

Please provide a comprehensive leadership response that demonstrates ${config.decisionMakingLevel} thinking and aligns with our BMAD methodology for autonomous AI-driven development.

**Response Format:**
Structure your response with clear sections for each framework element above. Be specific, actionable, and consider the interconnections between different aspects of the project.
`;
  }

  private async structureLeadershipResponse(agentType: string, response: any, request: EnhancedWAIRequest): Promise<any> {
    const content = response.content;
    
    // Extract key components from the leadership response
    const decisionType = this.extractDecisionType(content);
    const impact = this.extractImpactLevel(content);
    const stakeholders = this.extractStakeholders(content, agentType);
    const timeline = this.extractTimeline(content);

    // Add leadership-specific formatting and structure
    const structuredContent = this.addLeadershipStructure(agentType, content);

    return {
      content: structuredContent,
      decisionType,
      impact,
      stakeholders,
      timeline,
      agentType,
      originalResponse: content
    };
  }

  private extractDecisionType(content: string): 'strategic' | 'tactical' | 'operational' {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('strategic') || lowerContent.includes('long-term') || lowerContent.includes('vision')) {
      return 'strategic';
    }
    if (lowerContent.includes('tactical') || lowerContent.includes('short-term') || lowerContent.includes('implementation')) {
      return 'tactical';
    }
    return 'operational';
  }

  private extractImpactLevel(content: string): 'high' | 'medium' | 'low' {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('critical') || lowerContent.includes('major impact') || lowerContent.includes('significant')) {
      return 'high';
    }
    if (lowerContent.includes('moderate') || lowerContent.includes('medium impact')) {
      return 'medium';
    }
    return 'low';
  }

  private extractStakeholders(content: string, agentType: string): string[] {
    const baseStakeholders: Record<string, string[]> = {
      'cto-agent': ['engineering-team', 'architecture-team', 'devops-team', 'security-team'],
      'cpo-agent': ['product-team', 'ux-team', 'marketing-team', 'customer-success'],
      'cmo-agent': ['marketing-team', 'sales-team', 'content-team', 'brand-team']
    };
    
    const defaultStakeholders = baseStakeholders[agentType] || ['development-team'];
    
    // Additional stakeholders mentioned in content
    const mentionedStakeholders: string[] = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('user') || lowerContent.includes('customer')) {
      mentionedStakeholders.push('users');
    }
    if (lowerContent.includes('developer') || lowerContent.includes('engineering')) {
      mentionedStakeholders.push('developers');
    }
    if (lowerContent.includes('designer') || lowerContent.includes('ux')) {
      mentionedStakeholders.push('designers');
    }
    
    return [...defaultStakeholders, ...mentionedStakeholders];
  }

  private extractTimeline(content: string): string {
    const lowerContent = content.toLowerCase();
    
    // Look for timeline indicators
    if (lowerContent.includes('week')) {
      const weekMatch = content.match(/(\d+)\s*week/i);
      return weekMatch ? `${weekMatch[1]} weeks` : '2-4 weeks';
    }
    
    if (lowerContent.includes('month')) {
      const monthMatch = content.match(/(\d+)\s*month/i);
      return monthMatch ? `${monthMatch[1]} months` : '1-2 months';
    }
    
    if (lowerContent.includes('day')) {
      const dayMatch = content.match(/(\d+)\s*day/i);
      return dayMatch ? `${dayMatch[1]} days` : '5-10 days';
    }
    
    // Default timeline based on agent type
    const defaultTimelines: Record<string, string> = {
      'cto-agent': '2-4 weeks',
      'cpo-agent': '3-6 weeks',
      'cmo-agent': '4-8 weeks'
    };
    
    return defaultTimelines[agentType] || '2-4 weeks';
  }

  private addLeadershipStructure(agentType: string, content: string): string {
    const agentConfig = this.agentConfigs.get(agentType);
    if (!agentConfig) return content;

    const header = `## ${agentConfig.name} - Leadership Decision\n\n`;
    const footer = `\n\n---\n*Decision made by ${agentConfig.name} using ${agentConfig.collaborationStyle} approach*\n*Expertise: ${agentConfig.expertise.slice(0, 3).join(', ')}*`;
    
    return header + content + footer;
  }

  private async recordLeadershipDecision(agentType: string, response: any, request: EnhancedWAIRequest): Promise<void> {
    const decision: LeadershipDecision = {
      id: `${agentType}-${Date.now()}`,
      agentType,
      decisionType: response.decisionType,
      description: request.operation,
      impact: response.impact,
      stakeholders: response.stakeholders,
      timeline: response.timeline,
      metadata: {
        requestId: request.id,
        projectId: request.projectId,
        priority: request.priority,
        content: response.content
      }
    };

    this.activeDecisions.set(decision.id, decision);

    // Store in database for persistence
    await storage.createMetric({
      projectId: request.projectId,
      agentType,
      metricType: 'leadership-decision',
      value: JSON.stringify(decision)
    });

    this.emit('leadership.decision', decision);
  }

  private async coordinateWithTeam(agentType: string, response: any, request: EnhancedWAIRequest): Promise<void> {
    // Coordinate with other agents based on the leadership decision
    const coordinationTasks: Record<string, string[]> = {
      'cto-agent': ['architect-agent', 'devops-agent', 'security-agent'],
      'cpo-agent': ['ui-ux-agent', 'frontend-agent', 'analyst-agent'],
      'cmo-agent': ['ui-ux-agent', 'frontend-agent', 'content-agent']
    };

    const agentsToNotify = coordinationTasks[agentType] || [];
    
    for (const targetAgent of agentsToNotify) {
      // Create coordination tasks for other agents
      const coordinationRequest: EnhancedWAIRequest = {
        id: `coord-${request.id}-${targetAgent}`,
        type: 'analysis',
        operation: `Leadership directive from ${agentType}: ${request.operation}`,
        content: `Leadership decision context: ${response.content.substring(0, 500)}...`,
        projectId: request.projectId,
        priority: request.priority,
        userId: request.userId,
        metadata: {
          coordinationType: 'leadership-directive',
          sourceAgent: agentType,
          targetAgent,
          originalRequestId: request.id
        }
      };

      // Emit coordination event for the orchestrator to handle
      this.emit('coordination.required', coordinationRequest);
    }
  }

  // Public API methods
  async getActiveDecisions(projectId?: number): Promise<LeadershipDecision[]> {
    const decisions = Array.from(this.activeDecisions.values());
    if (projectId) {
      return decisions.filter(decision => decision.metadata?.projectId === projectId);
    }
    return decisions;
  }

  async getAgentCapabilities(agentType: string): Promise<SpecializedAgentConfig | undefined> {
    return this.agentConfigs.get(agentType);
  }

  async getAllSpecializedAgents(): Promise<SpecializedAgentConfig[]> {
    return Array.from(this.agentConfigs.values());
  }

  async generateStrategicReport(projectId: number): Promise<any> {
    const decisions = await this.getActiveDecisions(projectId);
    
    const report = {
      projectId,
      generatedAt: new Date(),
      leadershipSummary: {
        totalDecisions: decisions.length,
        strategicDecisions: decisions.filter(d => d.decisionType === 'strategic').length,
        highImpactDecisions: decisions.filter(d => d.impact === 'high').length,
        activeStakeholders: [...new Set(decisions.flatMap(d => d.stakeholders))]
      },
      agentContributions: {} as Record<string, any>,
      recommendations: [] as string[]
    };

    // Analyze contributions by agent type
    for (const agentType of ['cto-agent', 'cpo-agent', 'cmo-agent']) {
      const agentDecisions = decisions.filter(d => d.agentType === agentType);
      report.agentContributions[agentType] = {
        decisionsCount: agentDecisions.length,
        averageImpact: agentDecisions.length > 0 ? 
          agentDecisions.filter(d => d.impact === 'high').length / agentDecisions.length : 0,
        keyFocus: this.extractKeyFocus(agentDecisions)
      };
    }

    // Generate strategic recommendations
    if (report.leadershipSummary.strategicDecisions < 3) {
      report.recommendations.push('Consider more strategic planning sessions with leadership agents');
    }
    if (report.leadershipSummary.highImpactDecisions > report.leadershipSummary.totalDecisions * 0.7) {
      report.recommendations.push('High concentration of high-impact decisions - ensure adequate execution resources');
    }

    return report;
  }

  private extractKeyFocus(decisions: LeadershipDecision[]): string[] {
    // Extract common themes from decisions
    const themes: Record<string, number> = {};
    
    decisions.forEach(decision => {
      const words = decision.description.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 4) { // Focus on meaningful words
          themes[word] = (themes[word] || 0) + 1;
        }
      });
    });

    // Return top themes
    return Object.entries(themes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([theme]) => theme);
  }
}
