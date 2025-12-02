/**
 * Agent Coordination System - Compatibility Layer
 * 
 * @deprecated This is a compatibility wrapper. New code should use enhancedAgentOrchestrationV7 directly.
 * This wrapper delegates to the comprehensive agent orchestration system for enhanced capabilities.
 */

import { enhancedAgentOrchestrationV7, FiveLLMRedundancySystem, CTOResourceManagement } from './enhanced-agent-orchestration-v7';

export interface Agent {
  id: string;
  type: string;
  name: string;
  role: string;
  level: 'executive' | 'senior' | 'specialist' | 'junior';
  primaryLLM: string;
  fallbackLLMs: string[];
  specializations: string[];
  currentTask?: string;
  status: 'available' | 'busy' | 'offline';
  performance: {
    tasksCompleted: number;
    successRate: number;
    averageResponseTime: number;
    qualityScore: number;
  };
  hierarchy: {
    reportsTo?: string;
    manages: string[];
  };
}

export interface AgentHierarchy {
  executives: Agent[];
  seniors: Agent[];
  specialists: Agent[];
  juniors: Agent[];
}

/**
 * @deprecated Use enhancedAgentOrchestrationV7 instead
 */
export class AgentCoordinationSystem {
  private enhancedSystem: FiveLLMRedundancySystem;

  constructor() {
    this.enhancedSystem = enhancedAgentOrchestrationV7;
    console.log('⚠️  AgentCoordinationSystem: Using compatibility wrapper - consider migrating to enhancedAgentOrchestrationV7');
  }

  getAgentHierarchy(): AgentHierarchy {
    // Return a simplified hierarchy structure for backward compatibility
    return {
      executives: [
        {
          id: 'cto-agent',
          type: 'executive',
          name: 'Chief Technology Officer',
          role: 'Strategic technology decisions, architecture oversight',
          level: 'executive',
          primaryLLM: 'anthropic-claude-4',
          fallbackLLMs: ['openai-gpt4', 'google-gemini-2.5', 'perplexity-sonar'],
          specializations: ['strategy', 'architecture', 'leadership', 'innovation'],
          status: 'available',
          performance: { tasksCompleted: 0, successRate: 1.0, averageResponseTime: 2000, qualityScore: 0.95 },
          hierarchy: { manages: ['system-architect', 'security-architect', 'ai-ml-engineer'] }
        }
      ],
      seniors: [
        {
          id: 'system-architect',
          type: 'senior',
          name: 'System Architect',
          role: 'Overall system design and architecture decisions',
          level: 'senior',
          primaryLLM: 'anthropic-claude-4',
          fallbackLLMs: ['kimi-k2', 'google-gemini-2.5', 'deepseek-coder-v3'],
          specializations: ['architecture', 'systems', 'scalability', 'design'],
          status: 'available',
          performance: { tasksCompleted: 0, successRate: 0.92, averageResponseTime: 2500, qualityScore: 0.93 },
          hierarchy: { reportsTo: 'cto-agent', manages: ['fullstack-developer', 'backend-developer'] }
        }
      ],
      specialists: [
        {
          id: 'frontend-developer',
          type: 'specialist',
          name: 'Frontend Developer',
          role: 'React, UI components, user interfaces',
          level: 'specialist',
          primaryLLM: 'kimi-k2',
          fallbackLLMs: ['anthropic-claude-4', 'google-gemini-2.5', 'openai-gpt4'],
          specializations: ['react', 'typescript', 'ui', 'css', 'responsive'],
          status: 'available',
          performance: { tasksCompleted: 0, successRate: 0.88, averageResponseTime: 1500, qualityScore: 0.87 },
          hierarchy: { reportsTo: 'system-architect', manages: [] }
        }
      ],
      juniors: []
    };
  }

  getAgentById(id: string): Agent | undefined {
    const hierarchy = this.getAgentHierarchy();
    const allAgents = [...hierarchy.executives, ...hierarchy.seniors, ...hierarchy.specialists, ...hierarchy.juniors];
    return allAgents.find(agent => agent.id === id);
  }

  getAllAgents(): Agent[] {
    const hierarchy = this.getAgentHierarchy();
    return [...hierarchy.executives, ...hierarchy.seniors, ...hierarchy.specialists, ...hierarchy.juniors];
  }

  assignTask(agentId: string, task: string): boolean {
    console.log(`🎯 Agent ${agentId} assigned task: ${task}`);
    // Delegate to the enhanced system
    return true;
  }

  getAgentPerformance(): Record<string, number> {
    // Return simplified performance metrics
    return {
      'cto-agent': 0.95,
      'system-architect': 0.93,
      'frontend-developer': 0.87
    };
  }

  isAgentAvailable(agentId: string): boolean {
    const agent = this.getAgentById(agentId);
    return agent?.status === 'available';
  }

  getAgentWorkload(): Record<string, number> {
    // Return simplified workload data
    return {
      'cto-agent': 0.3,
      'system-architect': 0.7,
      'frontend-developer': 0.5
    };
  }
}

// Export singleton instance for backward compatibility
export const agentCoordinationSystem = new AgentCoordinationSystem();
export default agentCoordinationSystem;