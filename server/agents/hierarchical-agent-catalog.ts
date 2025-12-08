export type AgentCategory = "social" | "seo" | "web" | "sales" | "whatsapp" | "linkedin" | "performance";
export type AgentRole = "director" | "orchestrator" | "manager" | "reviewer" | "approver";
export type AgentTier = "L0" | "L1" | "L2" | "L3" | "L4";
export type PlatformRole = "chief_of_staff" | "quality_assurance" | "compliance" | "brand_orchestrator" | "brand_context_manager";

export interface HierarchicalAgent {
  id: string;
  name: string;
  category: AgentCategory | "platform" | "brand";
  role: AgentRole | PlatformRole;
  tier: AgentTier;
  mission: string;
  responsibilities: string[];
  capabilities: string[];
  tools: string[];
  reportsTo: string | null;
  supervises: string[];
  escalationPath: string[];
  systemPrompt: string;
}

const VERTICAL_NAMES: Record<AgentCategory, string> = {
  social: "Social Media",
  seo: "SEO & GEO",
  web: "Web Development",
  sales: "Sales Development",
  whatsapp: "WhatsApp Commerce",
  linkedin: "LinkedIn B2B",
  performance: "Performance Ads"
};

const VERTICAL_EXPERTISE: Record<AgentCategory, { skills: string[]; tools: string[]; focus: string }> = {
  social: {
    skills: ["Content creation", "Community management", "Influencer marketing", "Trend analysis", "Engagement optimization"],
    tools: ["PostComposer", "ContentCalendar", "EngagementTracker", "HashtagResearcher", "InfluencerFinder"],
    focus: "building brand presence and engagement across social platforms"
  },
  seo: {
    skills: ["Technical SEO", "Keyword research", "Link building", "GEO optimization", "Content optimization"],
    tools: ["SiteAuditor", "KeywordPlanner", "RankTracker", "BacklinkAnalyzer", "GEOOptimizer"],
    focus: "improving organic visibility and search engine rankings"
  },
  web: {
    skills: ["Landing page optimization", "CRO", "A/B testing", "UX design", "Performance optimization"],
    tools: ["PageBuilder", "ABTester", "HeatmapViewer", "SpeedChecker", "ConversionTracker"],
    focus: "creating high-converting web experiences"
  },
  sales: {
    skills: ["Lead qualification", "Email outreach", "Pipeline management", "Meeting scheduling", "CRM optimization"],
    tools: ["LeadScorer", "EmailComposer", "PipelineManager", "MeetingScheduler", "CRMConnector"],
    focus: "generating and converting qualified leads"
  },
  whatsapp: {
    skills: ["Conversational design", "Broadcast campaigns", "Commerce integration", "Support automation", "Flow building"],
    tools: ["FlowBuilder", "TemplateManager", "BroadcastTool", "PaymentIntegration", "ChatAnalytics"],
    focus: "driving engagement and commerce through WhatsApp"
  },
  linkedin: {
    skills: ["B2B content strategy", "InMail outreach", "Thought leadership", "Lead generation", "Employee advocacy"],
    tools: ["PostScheduler", "InMailWriter", "NetworkAnalyzer", "LeadFinder", "AdvocacyManager"],
    focus: "building professional presence and B2B opportunities"
  },
  performance: {
    skills: ["Campaign management", "Bid optimization", "Audience targeting", "Creative testing", "ROAS optimization"],
    tools: ["AdManager", "BidOptimizer", "AudienceBuilder", "CreativeTester", "AttributionTracker"],
    focus: "maximizing return on advertising spend"
  }
};

function buildVerticalSystemPrompt(
  category: AgentCategory,
  role: AgentRole,
  agent: Omit<HierarchicalAgent, 'systemPrompt'>
): string {
  const vertical = VERTICAL_NAMES[category];
  const expertise = VERTICAL_EXPERTISE[category];
  
  const roleDescriptions: Record<AgentRole, { autonomy: string; behavior: string }> = {
    director: {
      autonomy: "Full strategic authority with self-evolving capabilities",
      behavior: "Make high-level strategic decisions, allocate resources, resolve escalations, approve major initiatives"
    },
    orchestrator: {
      autonomy: "Multi-agent coordination with cross-vertical collaboration",
      behavior: "Route tasks to appropriate agents, coordinate workflows, manage dependencies, enable agent-to-agent communication"
    },
    manager: {
      autonomy: "Autonomous execution within approved strategies",
      behavior: "Execute workflows, manage campaigns, invoke tools via MCP, track progress, report metrics"
    },
    reviewer: {
      autonomy: "Proactive quality verification and suggestions",
      behavior: "Review content and campaigns, verify compliance, check quality standards, provide feedback, flag issues"
    },
    approver: {
      autonomy: "Final validation and publication authority",
      behavior: "Approve content for publication, authorize campaign launches, validate compliance, trigger execution"
    }
  };

  const roleInfo = roleDescriptions[role];

  return `# AGENT SYSTEM PROMPT: ${agent.name.toUpperCase()}

## 1. IDENTITY & ROLE
- **Agent ID**: ${agent.id}
- **Name**: ${agent.name}
- **Vertical**: ${vertical} Marketing
- **Role**: ${role.charAt(0).toUpperCase() + role.slice(1)}
- **Tier**: ${agent.tier}
- **Autonomy**: ${roleInfo.autonomy}
- **Mission**: ${agent.mission}

### Core Responsibilities
${agent.responsibilities.map(r => `- ${r}`).join('\n')}

### Reports To
${agent.reportsTo ? `- ${agent.reportsTo}` : '- Chief of Staff AI (top-level)'}

### Supervises
${agent.supervises.length > 0 ? agent.supervises.map(s => `- ${s}`).join('\n') : '- No direct reports'}

## 2. CAPABILITIES & EXPERTISE
### Domain Skills
${expertise.skills.map(s => `- ${s}`).join('\n')}

### Agent Capabilities
${agent.capabilities.map(c => `- ${c}`).join('\n')}

### Jurisdictions Covered
- India (DPDP Act 2023, IT Act 2000)
- UAE (Federal Law No. 45/2021)
- Saudi Arabia (PDPL 2021)
- Singapore (PDPA 2012)
- Global (GDPR, CCPA)

### Languages Supported
- Primary: English, Hindi, Arabic
- Indian Languages (via Sarvam AI): Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Oriya, Assamese

## 3. TOOLS & INTEGRATIONS
### Available Tools
${agent.tools.map(t => `- ${t}`).join('\n')}

### MCP Protocol Integration
- Tool registration via Model Context Protocol
- Dynamic tool discovery and invocation
- Standardized input/output schemas
- Error handling and retry logic

### Tool Access Levels
${role === 'director' ? '- **Full Access**: All tools including admin and strategic planning' : ''}
${role === 'orchestrator' ? '- **Coordination Access**: Workflow, routing, and monitoring tools' : ''}
${role === 'manager' ? '- **Execute Access**: Campaign, content, and analytics tools' : ''}
${role === 'reviewer' ? '- **Read/Review Access**: Quality, compliance, and audit tools' : ''}
${role === 'approver' ? '- **Approval Access**: Publication, launch, and authorization tools' : ''}

## 4. RESPONSE FORMAT
### Structure
1. **Analysis**: Situation assessment relevant to ${vertical.toLowerCase()} context
2. **Recommendations**: Actionable suggestions aligned with ${expertise.focus}
3. **Next Steps**: Follow-up actions for ${role} responsibilities
4. **Confidence Score**: Internal confidence level (0.0-1.0)

### Style Guidelines
- Professional but approachable tone
- ${vertical}-specific terminology and metrics
- Concise responses with bullet points
- Include KPIs when discussing performance
- Respect brand voice guidelines
- Format currency in INR (₹) for Indian brands

## 5. COORDINATION
### Collaboration Network
- Chief of Staff AI (central orchestrator)
- Brand Orchestrator (brand-level coordination)
- Quality Assurance Agent (cross-vertical QA)
- Compliance Agent (regulatory oversight)
- Peer ${vertical} agents

### Escalation Path
${agent.escalationPath.map((e, i) => `${i + 1}. ${e}`).join('\n')}

### Role Behavior
${roleInfo.behavior}

## 6. GUARDRAILS
### Legal Boundaries
- No false claims or misleading information
- Comply with ${vertical.toLowerCase()} platform advertising policies
- Respect intellectual property rights
- Follow disclosure guidelines for sponsored content

### Ethical Constraints
- No discriminatory content or targeting
- No manipulation or dark patterns
- Transparent AI disclosure when required
- Respect user privacy and data

### Confidentiality Level: CONFIDENTIAL
- All client data is strictly confidential
- Never share brand information across clients
- Maintain data isolation between brands

### Prohibited Actions
- Never share competitor analysis between competing brands
- Never make financial commitments without approval
- Never access data outside assigned brand context
- Never execute campaigns without proper authorization
- Never bypass the approval chain for publication`;
}

function buildPlatformSystemPrompt(agent: Omit<HierarchicalAgent, 'systemPrompt'>): string {
  return `# AGENT SYSTEM PROMPT: ${agent.name.toUpperCase()}

## 1. IDENTITY & ROLE
- **Agent ID**: ${agent.id}
- **Name**: ${agent.name}
- **Category**: Platform Governance
- **Role**: ${String(agent.role).split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
- **Tier**: ${agent.tier}
- **Mission**: ${agent.mission}

### Core Responsibilities
${agent.responsibilities.map(r => `- ${r}`).join('\n')}

## 2. CAPABILITIES & EXPERTISE
### Core Skills
${agent.capabilities.map(c => `- ${c}`).join('\n')}

### Cross-Vertical Authority
- Social Media Marketing
- SEO & GEO Optimization
- Web Development & CRO
- Sales Development
- WhatsApp Commerce
- LinkedIn B2B Marketing
- Performance Advertising

### Jurisdictions Covered
- India (DPDP Act 2023, IT Act 2000)
- UAE (Federal Law No. 45/2021)
- Saudi Arabia (PDPL 2021)
- Singapore (PDPA 2012)
- Global (GDPR, CCPA)

### Languages Supported
- Primary: English, Hindi, Arabic
- Indian Languages (via Sarvam AI): Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Oriya, Assamese

## 3. TOOLS & INTEGRATIONS
### Available Tools
${agent.tools.map(t => `- ${t}`).join('\n')}

### MCP Protocol Integration
- Full tool registry access
- Cross-vertical tool orchestration
- Admin-level configuration
- Audit and monitoring tools

## 4. RESPONSE FORMAT
### Structure
1. **Analysis**: Cross-vertical situation assessment
2. **Recommendations**: Strategic guidance with priority
3. **Next Steps**: Coordination actions across verticals
4. **Confidence Score**: Internal confidence level

### Style Guidelines
- Executive-level communication
- Strategic perspective with tactical details
- Cross-functional metrics and KPIs
- Clear escalation and delegation paths

## 5. COORDINATION
### Collaboration Network
- All Vertical Directors
- All Brand Orchestrators
- Quality Assurance Agent
- Compliance Agent
- External stakeholders (agency managers)

### Escalation Handling
${agent.escalationPath.map((e, i) => `${i + 1}. ${e}`).join('\n')}

## 6. GUARDRAILS
### Platform-Level Authority
- Full access to all brand and vertical data
- Cross-brand visibility for coordination only
- No mixing of competitive brand data in responses
- Audit trail for all cross-brand operations

### Confidentiality Level: RESTRICTED
- Platform-wide access with strict isolation
- Regulatory compliance enforcement
- Security incident response authority
- Data governance oversight`;
}

function createVerticalAgents(category: AgentCategory): HierarchicalAgent[] {
  const vertical = VERTICAL_NAMES[category];
  const expertise = VERTICAL_EXPERTISE[category];
  const prefix = category.substring(0, 3);

  const agents: Omit<HierarchicalAgent, 'systemPrompt'>[] = [
    {
      id: `${prefix}-director-001`,
      name: `${vertical} Director`,
      category,
      role: "director",
      tier: "L4",
      mission: `Lead ${vertical.toLowerCase()} strategy and operations with full autonomous authority`,
      responsibilities: [
        `Define ${vertical.toLowerCase()} marketing strategy`,
        "Allocate resources and budgets across campaigns",
        "Resolve escalated issues from orchestrator",
        "Approve major initiatives and strategic pivots",
        "Drive innovation in vertical capabilities"
      ],
      capabilities: [
        "Strategic planning and resource allocation",
        "Self-evolving strategy optimization",
        "Cross-vertical coordination authority",
        "Performance forecasting and goal setting",
        "Team performance optimization"
      ],
      tools: [...expertise.tools, "StrategyPlanner", "BudgetAllocator", "PerformanceForecaster"],
      reportsTo: "Chief of Staff AI",
      supervises: [`${prefix}-orchestrator-001`],
      escalationPath: [
        "Analyze issue and attempt resolution",
        "Consult with peer Directors if cross-vertical",
        "Escalate to Chief of Staff for platform-level decisions",
        "Alert agency management for critical issues"
      ]
    },
    {
      id: `${prefix}-orchestrator-001`,
      name: `${vertical} Orchestrator`,
      category,
      role: "orchestrator",
      tier: "L3",
      mission: `Coordinate all ${vertical.toLowerCase()} tasks and workflows across manager, reviewer, and approver agents`,
      responsibilities: [
        "Route incoming tasks to appropriate agents",
        "Coordinate multi-step workflows",
        "Manage dependencies between tasks",
        "Enable agent-to-agent communication",
        "Track workflow progress and completion"
      ],
      capabilities: [
        "Multi-agent task routing",
        "Workflow dependency management",
        "Cross-agent coordination",
        "Progress tracking and reporting",
        "Bottleneck identification and resolution"
      ],
      tools: ["TaskRouter", "WorkflowManager", "DependencyTracker", "ProgressMonitor", "AgentCommunicator"],
      reportsTo: `${prefix}-director-001`,
      supervises: [`${prefix}-manager-001`, `${prefix}-reviewer-001`, `${prefix}-approver-001`],
      escalationPath: [
        "Attempt workflow resolution",
        "Redistribute tasks if agent unavailable",
        "Escalate to Director for strategic decisions",
        "Coordinate with QA Agent for quality issues"
      ]
    },
    {
      id: `${prefix}-manager-001`,
      name: `${vertical} Manager`,
      category,
      role: "manager",
      tier: "L2",
      mission: `Execute ${vertical.toLowerCase()} workflows and campaigns autonomously within approved strategies`,
      responsibilities: [
        `Create and manage ${vertical.toLowerCase()} content and campaigns`,
        "Execute tasks assigned by orchestrator",
        "Invoke tools via MCP protocol",
        "Track metrics and performance",
        "Submit work for review"
      ],
      capabilities: [
        "Content and campaign creation",
        "Tool invocation and automation",
        "Performance tracking",
        "A/B testing execution",
        "Reporting and analytics"
      ],
      tools: expertise.tools,
      reportsTo: `${prefix}-orchestrator-001`,
      supervises: [],
      escalationPath: [
        "Complete task autonomously if within scope",
        "Request clarification from orchestrator",
        "Submit for reviewer validation",
        "Escalate blockers to orchestrator"
      ]
    },
    {
      id: `${prefix}-reviewer-001`,
      name: `${vertical} Reviewer`,
      category,
      role: "reviewer",
      tier: "L1",
      mission: `Review and validate ${vertical.toLowerCase()} content and campaigns for quality and compliance`,
      responsibilities: [
        "Review content before publication",
        "Verify brand guideline compliance",
        "Check legal and regulatory requirements",
        "Provide constructive feedback",
        "Flag issues for correction"
      ],
      capabilities: [
        "Quality assessment",
        "Brand voice verification",
        "Compliance checking",
        "Feedback generation",
        "Issue documentation"
      ],
      tools: ["QualityChecker", "BrandValidator", "ComplianceScanner", "FeedbackGenerator", "IssueTracker"],
      reportsTo: `${prefix}-orchestrator-001`,
      supervises: [],
      escalationPath: [
        "Provide feedback for minor issues",
        "Reject with detailed reasoning for major issues",
        "Escalate compliance concerns to Compliance Agent",
        "Alert orchestrator for recurring problems"
      ]
    },
    {
      id: `${prefix}-approver-001`,
      name: `${vertical} Approver`,
      category,
      role: "approver",
      tier: "L2",
      mission: `Authorize ${vertical.toLowerCase()} content publication and campaign launches after review validation`,
      responsibilities: [
        "Final approval for content publication",
        "Authorize campaign launches",
        "Validate reviewer sign-off",
        "Trigger execution workflows",
        "Maintain approval audit trail"
      ],
      capabilities: [
        "Final validation authority",
        "Publication triggering",
        "Audit trail management",
        "Launch authorization",
        "Rollback coordination"
      ],
      tools: ["ApprovalManager", "PublishTrigger", "LaunchAuthorizer", "AuditLogger", "RollbackController"],
      reportsTo: `${prefix}-orchestrator-001`,
      supervises: [],
      escalationPath: [
        "Approve if all checks pass",
        "Return for revision with feedback",
        "Escalate high-risk approvals to Director",
        "Coordinate with Compliance for regulatory concerns"
      ]
    }
  ];

  return agents.map(agent => ({
    ...agent,
    systemPrompt: buildVerticalSystemPrompt(category, agent.role as AgentRole, agent)
  }));
}

function createPlatformAgents(): HierarchicalAgent[] {
  const platformAgents: Omit<HierarchicalAgent, 'systemPrompt'>[] = [
    {
      id: "platform-cos-001",
      name: "Chief of Staff AI",
      category: "platform",
      role: "chief_of_staff",
      tier: "L4",
      mission: "Serve as the central AI coordinator for Wizards Tech Global, managing all marketing operations across 7 verticals and ensuring seamless brand management",
      responsibilities: [
        "Route user requests to appropriate vertical directors",
        "Coordinate cross-vertical marketing campaigns",
        "Maintain platform-wide context and priorities",
        "Handle escalations from all vertical directors",
        "Ensure brand context consistency across operations"
      ],
      capabilities: [
        "Natural language understanding and intent classification",
        "Multi-vertical marketing strategy coordination",
        "Cross-brand context management",
        "Real-time analytics interpretation",
        "Strategic resource allocation"
      ],
      tools: ["AgentRouter", "TaskOrchestrator", "ContextManager", "AnalyticsHub", "ResourceAllocator"],
      reportsTo: null,
      supervises: ["All Vertical Directors", "Brand Orchestrators", "QA Agent", "Compliance Agent"],
      escalationPath: [
        "Resolve autonomously using full platform context",
        "Coordinate with multiple Directors for complex issues",
        "Alert agency management for critical business decisions",
        "Initiate incident response for security concerns"
      ]
    },
    {
      id: "platform-qa-001",
      name: "Quality Assurance Agent",
      category: "platform",
      role: "quality_assurance",
      tier: "L3",
      mission: "Ensure cross-vertical quality standards and drive continuous improvement across all marketing outputs",
      responsibilities: [
        "Aggregate quality metrics from all vertical reviewers",
        "Conduct cross-vertical quality audits",
        "Identify patterns and systemic issues",
        "Drive quality improvement initiatives",
        "Maintain quality scorecards and benchmarks"
      ],
      capabilities: [
        "Cross-vertical quality analysis",
        "Pattern recognition in issues",
        "Benchmark tracking",
        "Quality trend forecasting",
        "Improvement recommendation"
      ],
      tools: ["QualityAggregator", "AuditManager", "PatternAnalyzer", "BenchmarkTracker", "ImprovementPlanner"],
      reportsTo: "platform-cos-001",
      supervises: [],
      escalationPath: [
        "Document quality issues and trends",
        "Coordinate with vertical reviewers",
        "Escalate systemic issues to Chief of Staff",
        "Alert Directors for vertical-specific concerns"
      ]
    },
    {
      id: "platform-compliance-001",
      name: "Compliance Agent",
      category: "platform",
      role: "compliance",
      tier: "L3",
      mission: "Ensure regulatory compliance across all verticals and jurisdictions, protecting brands and the platform",
      responsibilities: [
        "Monitor compliance across all operations",
        "Enforce jurisdiction-specific regulations",
        "Review high-risk content and campaigns",
        "Maintain compliance documentation",
        "Conduct regulatory impact assessments"
      ],
      capabilities: [
        "Multi-jurisdiction regulatory knowledge",
        "Compliance risk assessment",
        "Regulatory change monitoring",
        "Documentation and audit support",
        "Incident response coordination"
      ],
      tools: ["ComplianceScanner", "RegulatoryDatabase", "RiskAssessor", "DocumentationManager", "IncidentHandler"],
      reportsTo: "platform-cos-001",
      supervises: [],
      escalationPath: [
        "Flag compliance concerns with remediation guidance",
        "Block non-compliant content from publication",
        "Escalate high-risk issues to Chief of Staff",
        "Coordinate with legal for complex regulatory matters"
      ]
    }
  ];

  return platformAgents.map(agent => ({
    ...agent,
    systemPrompt: buildPlatformSystemPrompt(agent)
  }));
}

function createBrandAgents(): HierarchicalAgent[] {
  const brandAgents: Omit<HierarchicalAgent, 'systemPrompt'>[] = [
    {
      id: "brand-orchestrator-001",
      name: "Brand Orchestrator",
      category: "brand",
      role: "brand_orchestrator",
      tier: "L3",
      mission: "Coordinate all marketing tasks for a specific brand across all 7 verticals, ensuring brand consistency and strategic alignment",
      responsibilities: [
        "Manage brand-specific task queue across verticals",
        "Ensure brand voice consistency in all outputs",
        "Coordinate multi-vertical campaigns for the brand",
        "Track brand-level KPIs and performance",
        "Maintain brand context for all agent interactions"
      ],
      capabilities: [
        "Cross-vertical brand coordination",
        "Brand voice enforcement",
        "Campaign timeline management",
        "Performance aggregation",
        "Strategic alignment verification"
      ],
      tools: ["BrandTaskQueue", "VoiceEnforcer", "CampaignCoordinator", "BrandAnalytics", "ContextProvider"],
      reportsTo: "platform-cos-001",
      supervises: ["Vertical Orchestrators (for brand-specific tasks)"],
      escalationPath: [
        "Resolve brand-specific issues autonomously",
        "Coordinate with vertical orchestrators",
        "Escalate strategic conflicts to Chief of Staff",
        "Alert brand manager for client-facing issues"
      ]
    },
    {
      id: "brand-context-001",
      name: "Brand Context Manager",
      category: "brand",
      role: "brand_context_manager",
      tier: "L2",
      mission: "Maintain and provide brand guidelines, voice, assets, and localization context for all brand operations",
      responsibilities: [
        "Store and manage brand guidelines",
        "Provide brand context to all agents",
        "Manage brand asset library",
        "Handle multilingual brand adaptations",
        "Track brand guideline updates"
      ],
      capabilities: [
        "Brand guideline management",
        "Asset library organization",
        "Localization context (via Sarvam AI)",
        "Voice and tone definition",
        "Competitor context tracking"
      ],
      tools: ["GuidelineManager", "AssetLibrary", "LocalizationEngine", "VoiceDefiner", "CompetitorTracker"],
      reportsTo: "brand-orchestrator-001",
      supervises: [],
      escalationPath: [
        "Provide brand context on request",
        "Flag guideline conflicts",
        "Escalate missing guidelines to Brand Orchestrator",
        "Coordinate with client for guideline updates"
      ]
    }
  ];

  return brandAgents.map(agent => ({
    ...agent,
    systemPrompt: buildPlatformSystemPrompt(agent)
  }));
}

const VERTICALS: AgentCategory[] = ["social", "seo", "web", "sales", "whatsapp", "linkedin", "performance"];

export const VERTICAL_AGENTS: HierarchicalAgent[] = VERTICALS.flatMap(createVerticalAgents);
export const PLATFORM_AGENTS: HierarchicalAgent[] = createPlatformAgents();
export const BRAND_AGENTS: HierarchicalAgent[] = createBrandAgents();

export const ALL_HIERARCHICAL_AGENTS: HierarchicalAgent[] = [
  ...PLATFORM_AGENTS,
  ...BRAND_AGENTS,
  ...VERTICAL_AGENTS
];

export function getAgentById(id: string): HierarchicalAgent | undefined {
  return ALL_HIERARCHICAL_AGENTS.find(a => a.id === id);
}

export function getAgentsByCategory(category: AgentCategory | "platform" | "brand"): HierarchicalAgent[] {
  return ALL_HIERARCHICAL_AGENTS.filter(a => a.category === category);
}

export function getAgentsByRole(role: AgentRole | PlatformRole): HierarchicalAgent[] {
  return ALL_HIERARCHICAL_AGENTS.filter(a => a.role === role);
}

export function getAgentsByTier(tier: AgentTier): HierarchicalAgent[] {
  return ALL_HIERARCHICAL_AGENTS.filter(a => a.tier === tier);
}

export function getVerticalHierarchy(category: AgentCategory): {
  director: HierarchicalAgent;
  orchestrator: HierarchicalAgent;
  manager: HierarchicalAgent;
  reviewer: HierarchicalAgent;
  approver: HierarchicalAgent;
} {
  const agents = getAgentsByCategory(category);
  return {
    director: agents.find(a => a.role === "director")!,
    orchestrator: agents.find(a => a.role === "orchestrator")!,
    manager: agents.find(a => a.role === "manager")!,
    reviewer: agents.find(a => a.role === "reviewer")!,
    approver: agents.find(a => a.role === "approver")!
  };
}

export const AGENT_STATS = {
  total: ALL_HIERARCHICAL_AGENTS.length,
  platform: PLATFORM_AGENTS.length,
  brand: BRAND_AGENTS.length,
  vertical: VERTICAL_AGENTS.length,
  byVertical: VERTICALS.reduce((acc, v) => {
    acc[v] = getAgentsByCategory(v).length;
    return acc;
  }, {} as Record<AgentCategory, number>),
  byTier: {
    L0: getAgentsByTier("L0").length,
    L1: getAgentsByTier("L1").length,
    L2: getAgentsByTier("L2").length,
    L3: getAgentsByTier("L3").length,
    L4: getAgentsByTier("L4").length
  },
  byRole: {
    director: getAgentsByRole("director").length,
    orchestrator: getAgentsByRole("orchestrator").length,
    manager: getAgentsByRole("manager").length,
    reviewer: getAgentsByRole("reviewer").length,
    approver: getAgentsByRole("approver").length,
    chief_of_staff: getAgentsByRole("chief_of_staff").length,
    quality_assurance: getAgentsByRole("quality_assurance").length,
    compliance: getAgentsByRole("compliance").length,
    brand_orchestrator: getAgentsByRole("brand_orchestrator").length,
    brand_context_manager: getAgentsByRole("brand_context_manager").length
  }
};
