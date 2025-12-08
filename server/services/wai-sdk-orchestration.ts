import { 
  AgentSystemPrompt, 
  AgentCategory, 
  AgentTier, 
  ALL_AGENTS, 
  getAgentsByCategory, 
  getAgentsByTier, 
  getAgentById, 
  generateSystemPrompt,
  TIER_DEFINITIONS,
  JURISDICTION_REGULATIONS,
  Jurisdiction
} from "./agent-system-prompts";
import { 
  EnhancedAIService, 
  AIProvider, 
  SupportedLanguage, 
  MODEL_TIERS, 
  ModelTier,
  LLM_REGISTRY 
} from "./enhanced-ai-service";

export interface WAITask {
  id: string;
  type: "content" | "analysis" | "automation" | "support" | "optimization" | "generation";
  vertical: AgentCategory;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  requiredCapabilities: string[];
  targetJurisdictions: Jurisdiction[];
  language: SupportedLanguage;
  context: Record<string, any>;
  constraints?: {
    maxLatency?: number;
    maxCost?: number;
    preferredTier?: ModelTier;
    requiredProvider?: AIProvider;
  };
}

export interface WAITaskResult {
  taskId: string;
  agentId: string;
  agentName: string;
  provider: AIProvider;
  model: string;
  tier: ModelTier;
  response: string;
  confidence: number;
  processingTime: number;
  tokensUsed?: number;
  metadata: {
    jurisdictionsApplied: Jurisdiction[];
    languageUsed: SupportedLanguage;
    guardrailsChecked: string[];
    escalationRequired: boolean;
  };
}

export interface AgentOrchestrationStats {
  totalAgents: number;
  agentsByCategory: Record<AgentCategory, number>;
  agentsByTier: Record<AgentTier, number>;
  activeAgents: number;
  tasksProcessed: number;
  averageConfidence: number;
}

export class WAISDKOrchestration {
  private aiService: EnhancedAIService;
  private taskQueue: WAITask[] = [];
  private completedTasks: WAITaskResult[] = [];
  private agentActivations: Map<string, number> = new Map();

  constructor() {
    this.aiService = new EnhancedAIService();
  }

  selectBestAgent(task: WAITask): AgentSystemPrompt | null {
    const categoryAgents = getAgentsByCategory(task.vertical);
    
    if (categoryAgents.length === 0) {
      return ALL_AGENTS[0];
    }

    let bestAgent: AgentSystemPrompt | null = null;
    let bestScore = 0;

    for (const agent of categoryAgents) {
      let score = 0;

      const capabilityMatch = agent.capabilities.skills.filter(
        skill => task.requiredCapabilities.some(
          cap => skill.toLowerCase().includes(cap.toLowerCase()) || 
                 cap.toLowerCase().includes(skill.toLowerCase())
        )
      ).length;
      score += capabilityMatch * 20;

      const jurisdictionMatch = agent.capabilities.jurisdictions.filter(
        j => task.targetJurisdictions.includes(j) || j === "global"
      ).length;
      score += jurisdictionMatch * 15;

      if (agent.capabilities.languages.includes(task.language)) {
        score += 25;
      }

      const tierWeight: Record<AgentTier, number> = {
        "L0": 5,
        "L1": 10,
        "L2": 15,
        "L3": 20,
        "L4": 25
      };
      score += tierWeight[agent.identity.tier];

      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  selectOptimalModel(task: WAITask, agent: AgentSystemPrompt): { provider: AIProvider; model: string; tier: ModelTier } {
    if (task.constraints?.requiredProvider) {
      const models = LLM_REGISTRY.filter(m => m.provider === task.constraints!.requiredProvider);
      if (models.length > 0) {
        return { 
          provider: task.constraints.requiredProvider, 
          model: models[0].id,
          tier: this.getModelTier(task.constraints.requiredProvider)
        };
      }
    }

    const needsIndianLanguage = task.language !== "en" || 
      agent.capabilities.sarvamLanguages.length > 0 && task.language !== "en";

    if (needsIndianLanguage) {
      return { provider: "sarvam", model: "sarvam-m", tier: "tier3" };
    }

    if (task.constraints?.maxLatency && task.constraints.maxLatency < 2000) {
      return { provider: "groq", model: "llama-3.3-70b", tier: "tier2" };
    }

    if (task.type === "analysis" || task.type === "optimization") {
      return { provider: "anthropic", model: "claude-sonnet-4-20250514", tier: "tier1" };
    }

    if (task.type === "generation") {
      return { provider: "openai", model: "gpt-4o", tier: "tier1" };
    }

    if (task.priority === "critical" || task.priority === "high") {
      return { provider: "openai", model: "gpt-5", tier: "tier1" };
    }

    return { provider: "gemini", model: "gemini-2.5-flash", tier: "tier1" };
  }

  private getModelTier(provider: AIProvider): ModelTier {
    for (const [tier, config] of Object.entries(MODEL_TIERS)) {
      if (config.providers.includes(provider)) {
        return tier as ModelTier;
      }
    }
    return "tier1";
  }

  async executeTask(task: WAITask): Promise<WAITaskResult> {
    const startTime = Date.now();

    const agent = this.selectBestAgent(task);
    if (!agent) {
      throw new Error(`No suitable agent found for task: ${task.id}`);
    }

    const { provider, model, tier } = this.selectOptimalModel(task, agent);
    const systemPrompt = generateSystemPrompt(agent);

    const guardrailChecks = this.checkGuardrails(task, agent);
    if (!guardrailChecks.passed) {
      throw new Error(`Guardrail violation: ${guardrailChecks.violations.join(", ")}`);
    }

    const userMessage = this.buildTaskMessage(task, agent);

    const response = await this.aiService.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      provider,
      model
    );

    const processingTime = Date.now() - startTime;

    this.agentActivations.set(
      agent.identity.id, 
      (this.agentActivations.get(agent.identity.id) || 0) + 1
    );

    const result: WAITaskResult = {
      taskId: task.id,
      agentId: agent.identity.id,
      agentName: agent.identity.name,
      provider,
      model,
      tier,
      response: response.content,
      confidence: this.calculateConfidence(response.content, agent),
      processingTime,
      tokensUsed: response.tokensUsed,
      metadata: {
        jurisdictionsApplied: task.targetJurisdictions,
        languageUsed: task.language,
        guardrailsChecked: agent.guardrails.legalBoundaries.slice(0, 3),
        escalationRequired: false
      }
    };

    this.completedTasks.push(result);
    return result;
  }

  private buildTaskMessage(task: WAITask, agent: AgentSystemPrompt): string {
    const parts: string[] = [];

    parts.push(`## Task: ${task.description}`);
    parts.push("");
    parts.push(`**Type**: ${task.type}`);
    parts.push(`**Priority**: ${task.priority}`);
    parts.push(`**Vertical**: ${task.vertical}`);
    parts.push(`**Language**: ${task.language}`);
    parts.push(`**Target Jurisdictions**: ${task.targetJurisdictions.join(", ")}`);
    parts.push("");

    if (Object.keys(task.context).length > 0) {
      parts.push(`## Context`);
      parts.push("```json");
      parts.push(JSON.stringify(task.context, null, 2));
      parts.push("```");
      parts.push("");
    }

    parts.push(`## Required Capabilities`);
    task.requiredCapabilities.forEach(cap => parts.push(`- ${cap}`));
    parts.push("");

    parts.push(`## Expected Output Format`);
    parts.push("Please provide your response in the following format:");
    parts.push("```json");
    parts.push(JSON.stringify(agent.responseFormat.outputSchema, null, 2));
    parts.push("```");
    parts.push("");

    parts.push(`## Important Guidelines`);
    parts.push(`- Confidence score required (0-1)`);
    parts.push(`- Citation required: ${agent.responseFormat.citationRequired ? "Yes" : "No"}`);
    parts.push(`- Follow all guardrails and ethical constraints`);

    return parts.join("\n");
  }

  private checkGuardrails(task: WAITask, agent: AgentSystemPrompt): { passed: boolean; violations: string[] } {
    const violations: string[] = [];

    for (const jurisdiction of task.targetJurisdictions) {
      const limits = agent.guardrails.jurisdictionLimitations[jurisdiction];
      if (!limits) continue;
    }

    if (agent.guardrails.prohibitedActions.length > 0) {
      const taskLower = task.description.toLowerCase();
      for (const prohibited of agent.guardrails.prohibitedActions) {
        if (prohibited.toLowerCase().includes("share") && taskLower.includes("share customer")) {
          violations.push(`Prohibited action: ${prohibited}`);
        }
      }
    }

    return {
      passed: violations.length === 0,
      violations
    };
  }

  private calculateConfidence(response: string, agent: AgentSystemPrompt): number {
    let confidence = 0.7;

    if (response.length > 500) confidence += 0.1;
    if (response.length > 1000) confidence += 0.05;

    if (response.includes('"') || response.includes('{')) confidence += 0.05;

    const thresholds = agent.responseFormat.confidenceScoring.thresholds;
    return Math.min(Math.max(confidence, thresholds.low), thresholds.high);
  }

  getOrchestrationStats(): AgentOrchestrationStats {
    const agentsByCategory: Record<AgentCategory, number> = {
      social: 0, seo: 0, web: 0, sales: 0, whatsapp: 0, linkedin: 0, performance: 0
    };
    const agentsByTier: Record<AgentTier, number> = {
      L0: 0, L1: 0, L2: 0, L3: 0, L4: 0
    };

    ALL_AGENTS.forEach(agent => {
      agentsByCategory[agent.identity.category]++;
      agentsByTier[agent.identity.tier]++;
    });

    const avgConfidence = this.completedTasks.length > 0
      ? this.completedTasks.reduce((sum, t) => sum + t.confidence, 0) / this.completedTasks.length
      : 0;

    return {
      totalAgents: ALL_AGENTS.length,
      agentsByCategory,
      agentsByTier,
      activeAgents: this.agentActivations.size,
      tasksProcessed: this.completedTasks.length,
      averageConfidence: avgConfidence
    };
  }

  getAgentRegistry(): {
    agents: AgentSystemPrompt[];
    categories: AgentCategory[];
    tiers: typeof TIER_DEFINITIONS;
    jurisdictions: typeof JURISDICTION_REGULATIONS;
  } {
    return {
      agents: ALL_AGENTS,
      categories: ["social", "seo", "web", "sales", "whatsapp", "linkedin", "performance"],
      tiers: TIER_DEFINITIONS,
      jurisdictions: JURISDICTION_REGULATIONS
    };
  }

  getAgentSystemPrompt(agentId: string): string | null {
    const agent = getAgentById(agentId);
    if (!agent) return null;
    return generateSystemPrompt(agent);
  }

  async generateContent(
    vertical: AgentCategory,
    contentType: string,
    context: Record<string, any>,
    language: SupportedLanguage = "en",
    jurisdiction: Jurisdiction = "global"
  ): Promise<WAITaskResult> {
    const task: WAITask = {
      id: `content-${Date.now()}`,
      type: "generation",
      vertical,
      description: `Generate ${contentType} content for ${vertical} marketing`,
      priority: "medium",
      requiredCapabilities: ["content creation", contentType],
      targetJurisdictions: [jurisdiction],
      language,
      context
    };

    return this.executeTask(task);
  }

  async analyzePerformance(
    vertical: AgentCategory,
    metrics: Record<string, any>,
    jurisdiction: Jurisdiction = "global"
  ): Promise<WAITaskResult> {
    const task: WAITask = {
      id: `analysis-${Date.now()}`,
      type: "analysis",
      vertical,
      description: `Analyze performance metrics for ${vertical} campaigns`,
      priority: "high",
      requiredCapabilities: ["analytics", "optimization", "reporting"],
      targetJurisdictions: [jurisdiction],
      language: "en",
      context: { metrics }
    };

    return this.executeTask(task);
  }

  async optimizeCampaign(
    vertical: AgentCategory,
    campaignData: Record<string, any>,
    objectives: string[],
    jurisdiction: Jurisdiction = "global"
  ): Promise<WAITaskResult> {
    const task: WAITask = {
      id: `optimize-${Date.now()}`,
      type: "optimization",
      vertical,
      description: `Optimize ${vertical} campaign for improved performance`,
      priority: "high",
      requiredCapabilities: objectives,
      targetJurisdictions: [jurisdiction],
      language: "en",
      context: { campaign: campaignData, objectives }
    };

    return this.executeTask(task);
  }

  async handleSupport(
    message: string,
    language: SupportedLanguage,
    customerId?: string,
    jurisdiction: Jurisdiction = "india"
  ): Promise<WAITaskResult> {
    const task: WAITask = {
      id: `support-${Date.now()}`,
      type: "support",
      vertical: "whatsapp",
      description: `Handle customer support query: ${message.slice(0, 100)}...`,
      priority: "high",
      requiredCapabilities: ["customer service", "query resolution", "multilingual"],
      targetJurisdictions: [jurisdiction],
      language,
      context: { message, customerId }
    };

    return this.executeTask(task);
  }
}

export const waiOrchestration = new WAISDKOrchestration();
