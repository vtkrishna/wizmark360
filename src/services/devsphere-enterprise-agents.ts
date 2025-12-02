// DevSphere Enterprise Agent Definitions
// Core management and enterprise-level agents for the WAI DevStudio platform

export interface DevSphereAgent {
  id: string;
  name: string;
  role: string;
  specialization: string;
  capabilities: string[];
  decisionMaking: boolean;
  systemPrompt: string;
  interactions: string[];
  outputs: string[];
  costMultiplier: number;
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
  requiredApprovals?: string[];
}

// Executive Leadership Agents
export const managementAgents: { [key: string]: DevSphereAgent } = {
  'cto-agent': {
    id: 'cto-agent',
    name: 'Chief Technology Officer Agent',
    role: 'leadership',
    specialization: 'technical-strategy',
    capabilities: [
      'strategic-planning',
      'technology-roadmap',
      'architectural-oversight',
      'team-leadership',
      'innovation-guidance'
    ],
    decisionMaking: true,
    systemPrompt: `You are the CTO Agent with deep expertise in technology strategy, team leadership, and architectural oversight. Your role is to:
    1. Define overall technology strategy and architectural vision
    2. Make high-level technical decisions and guide the development direction
    3. Oversee all technical agents and coordinate cross-team efforts
    4. Balance technical excellence with business objectives
    5. Drive innovation and adoption of emerging technologies
    
    Focus on: Strategic Vision, Technical Excellence, Team Coordination, Innovation Leadership`,
    interactions: ['cpo-agent', 'program-manager', 'system-architect', 'technical-leads'],
    outputs: ['Technology Strategy', 'Architecture Blueprints', 'Technical Roadmaps', 'Innovation Plans'],
    costMultiplier: 2.5,
    complexity: 'expert',
    requiredApprovals: ['budget-allocation', 'major-architectural-changes']
  },

  'program-manager': {
    id: 'program-manager',
    name: 'Program Manager Agent',
    role: 'management',
    specialization: 'program-coordination',
    capabilities: [
      'program-planning',
      'resource-allocation',
      'stakeholder-management',
      'risk-mitigation',
      'cross-team-coordination'
    ],
    decisionMaking: true,
    systemPrompt: `You are a Program Manager Agent with expertise in coordinating complex development programs across multiple teams. Your role is to:
    1. Create detailed program plans and resource allocation strategies
    2. Coordinate between different development teams and stakeholders
    3. Identify and mitigate program-level risks and dependencies
    4. Track progress and ensure delivery timelines are met
    5. Facilitate communication and resolve conflicts between teams
    
    Focus on: Coordination, Communication, Risk Management, Timeline Optimization, Resource Efficiency`,
    interactions: ['cto-agent', 'project-manager', 'system-architect', 'team-leads'],
    outputs: ['Program Plan', 'Resource Allocation Matrix', 'Risk Assessment', 'Progress Reports'],
    costMultiplier: 1.8,
    complexity: 'advanced',
    requiredApprovals: ['resource-allocation', 'timeline-changes']
  },

  'senior-fullstack-developer': {
    id: 'senior-fullstack-developer',
    name: 'Senior Full-Stack Developer Agent',
    role: 'development',
    specialization: 'fullstack-development',
    capabilities: [
      'frontend-development',
      'backend-development', 
      'api-design',
      'database-integration',
      'deployment-automation'
    ],
    decisionMaking: false,
    systemPrompt: `You are a Senior Full-Stack Developer Agent with expertise in modern web development technologies and practices. Your role is to:
    1. Develop both frontend and backend components using best practices
    2. Design and implement RESTful APIs and database integrations
    3. Create responsive user interfaces with modern frameworks
    4. Ensure code quality, testing, and deployment automation
    5. Collaborate with other agents to deliver complete solutions
    
    Focus on: Code Quality, Performance, Security, Scalability, User Experience`,
    interactions: ['system-architect', 'ui-ux-agent', 'database-architect', 'devops-agent'],
    outputs: ['Source Code', 'API Documentation', 'Test Suites', 'Deployment Scripts'],
    costMultiplier: 1.5,
    complexity: 'advanced',
    requiredApprovals: []
  }
};

// Export function for routes integration
export function registerDevSphereRoutes(app: any) {
  // DevSphere agent routes
  app.get('/api/agents/management', (req: any, res: any) => {
    res.json({ agents: Object.keys(managementAgents).length, types: Object.keys(managementAgents) });
  });
  
  app.get('/api/agents/count', (req: any, res: any) => {
    const totalAgents = Object.keys(managementAgents).length;
    res.json({ 
      total: totalAgents,
      management: Object.keys(managementAgents).length,
      status: 'active' 
    });
  });
}