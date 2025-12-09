import { 
  AgentSystemPrompt, 
  AgentCategory as LegacyAgentCategory, 
  AgentTier as LegacyAgentTier, 
  ALL_AGENTS as LEGACY_AGENTS, 
  getAgentsByCategory as getLegacyAgentsByCategory, 
  getAgentsByTier as getLegacyAgentsByTier, 
  getAgentById as getLegacyAgentById, 
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
import {
  ALL_HIERARCHICAL_AGENTS,
  HierarchicalAgent,
  getAgentsByCategory as getHierarchicalAgentsByCategory,
  getAgentsByRole,
  getVerticalHierarchy,
  AGENT_STATS as HIERARCHICAL_STATS,
  AgentCategory,
  AgentRole,
  AgentTier
} from "../agents/hierarchical-agent-catalog";
import {
  ALL_MARKET360_AGENTS,
  Market360Agent,
  getAgentsByVertical,
  getAgentsByROMALevel,
  getAgentById as getMarket360AgentById,
  getAgentStats as getMarket360Stats,
  Vertical,
  ROMALevel
} from "../agents/market360-agent-catalog";
import {
  PROVIDER_MANIFESTS,
  PROVIDER_STATS,
  getProviderById,
  selectOptimalModel,
  ModelTier as ProviderModelTier
} from "./llm-provider-manifest";

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

export interface DualModelWorkflowResult {
  taskId: string;
  planningPhase: {
    provider: "anthropic";
    model: string;
    architecture: string;
    taskBreakdown: string[];
    riskAssessment: string;
    estimatedComplexity: "low" | "medium" | "high";
    tokensUsed: number;
    processingTime: number;
  };
  executionPhase: {
    provider: "gemini";
    model: string;
    generatedCode: string;
    generatedUI?: string;
    stepsCompleted: number;
    tokensUsed: number;
    processingTime: number;
  };
  reviewPhase?: {
    provider: "anthropic";
    model: string;
    bugsFound: string[];
    optimizations: string[];
    approved: boolean;
    tokensUsed: number;
  };
  totalProcessingTime: number;
  totalTokensUsed: number;
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

  selectBestHierarchicalAgent(task: WAITask, targetRole: AgentRole = "manager"): HierarchicalAgent | null {
    const validVerticals = ["social", "seo", "web", "sales", "whatsapp", "linkedin", "performance"];
    if (!validVerticals.includes(task.vertical)) {
      return getAgentsByRole("chief_of_staff")[0] || null;
    }

    const hierarchy = getVerticalHierarchy(task.vertical as AgentCategory);
    
    switch (task.type) {
      case "analysis":
      case "optimization":
        return hierarchy.director;
      case "content":
      case "generation":
        return hierarchy.manager;
      case "automation":
        return hierarchy.orchestrator;
      case "support":
        return hierarchy.manager;
      default:
        return hierarchy[targetRole] || hierarchy.manager;
    }
  }

  selectMarket360Agent(task: WAITask): Market360Agent | null {
    const validVerticals: Vertical[] = ["social", "seo", "web", "sales", "whatsapp", "linkedin", "performance"];
    if (!validVerticals.includes(task.vertical as Vertical)) {
      return null;
    }
    
    const verticalAgents = getAgentsByVertical(task.vertical as Vertical);
    if (verticalAgents.length === 0) {
      return null;
    }

    let bestAgent: Market360Agent | null = null;
    let bestScore = 0;

    for (const agent of verticalAgents) {
      let score = 0;

      const capabilityMatch = agent.capabilities.filter(
        (cap: string) => task.requiredCapabilities.some(
          reqCap => cap.toLowerCase().includes(reqCap.toLowerCase()) ||
                   reqCap.toLowerCase().includes(cap.toLowerCase())
        )
      ).length;
      score += capabilityMatch * 25;

      const romaWeight: Record<ROMALevel, number> = {
        "L0": 5,
        "L1": 10,
        "L2": 20,
        "L3": 30,
        "L4": 40
      };
      score += romaWeight[agent.romaLevel];

      if (agent.languages.includes(task.language as any)) {
        score += 30;
      }

      const jurisdictionMatch = agent.jurisdictions.filter(
        (j: string) => task.targetJurisdictions.includes(j as Jurisdiction) || j === "global"
      ).length;
      score += jurisdictionMatch * 15;

      if (task.type === "analysis" || task.type === "optimization") {
        if (agent.romaLevel === "L4" || agent.romaLevel === "L3") score += 20;
        if (agent.id.includes("director") || agent.id.includes("orchestrator")) score += 15;
      }
      if (task.type === "generation" || task.type === "content") {
        if (agent.romaLevel === "L2") score += 15;
        if (agent.id.includes("writer") || agent.id.includes("creator") || agent.id.includes("generator")) score += 20;
      }
      if (task.type === "automation") {
        if (agent.id.includes("automation") || agent.id.includes("bot")) score += 20;
      }

      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  selectOptimalModelFromManifest(task: WAITask): { provider: ProviderManifest; model: any } | null {
    return selectOptimalModel({
      type: task.type,
      requiresSpeed: task.constraints?.maxLatency ? task.constraints.maxLatency < 2000 : false,
      requiresIndianLanguages: task.language !== "en",
      requiresVision: task.requiredCapabilities.includes("vision") || task.requiredCapabilities.includes("image"),
      requiresReasoning: task.type === "analysis" || task.type === "optimization"
    });
  }

  getPlatformStats(): { agents: ReturnType<typeof getMarket360Stats>; providers: typeof PROVIDER_STATS } {
    return {
      agents: getMarket360Stats(),
      providers: PROVIDER_STATS
    };
  }

  async executeDualModelWorkflow(
    task: {
      id: string;
      type: "website" | "ui_ux" | "design" | "content" | "research";
      description: string;
      brand: string;
      requirements: string[];
      includeReview?: boolean;
    }
  ): Promise<DualModelWorkflowResult> {
    const startTime = Date.now();
    let totalTokens = 0;

    const planningPrompt = `You are Claude 4.5 Opus, the high-level planning and architecture AI.

TASK: ${task.description}
BRAND: ${task.brand}
REQUIREMENTS: ${task.requirements.join(", ")}

Your role is STRICTLY limited to:
1. High-level planning and system architecture
2. Task decomposition into clear, executable steps
3. Risk detection and mitigation strategies
4. Long-term reasoning about implementation approach

DO NOT write any production code. Output a structured plan with:
- Architecture overview (2-3 sentences)
- Task breakdown (numbered list of 5-8 steps)
- Risk assessment (potential issues and mitigations)
- Complexity estimate (low/medium/high)

Format as JSON with keys: architecture, tasks, risks, complexity`;

    const planningStart = Date.now();
    const planningResult = await this.aiService.chat(
      [{ role: "user", content: planningPrompt }],
      "anthropic",
      "claude-sonnet-4-5-20250925"
    );
    const planningTime = Date.now() - planningStart;
    totalTokens += planningResult.tokensUsed || 0;

    let parsedPlan: { architecture: string; tasks: string[]; risks: string; complexity: string };
    try {
      const jsonMatch = planningResult.content.match(/\{[\s\S]*\}/);
      parsedPlan = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        architecture: planningResult.content.substring(0, 200),
        tasks: ["Step 1: Analyze requirements", "Step 2: Design structure", "Step 3: Implement components"],
        risks: "Standard implementation risks",
        complexity: "medium"
      };
    } catch {
      parsedPlan = {
        architecture: planningResult.content.substring(0, 200),
        tasks: ["Step 1: Analyze requirements", "Step 2: Design structure", "Step 3: Implement components"],
        risks: "Standard implementation risks",
        complexity: "medium"
      };
    }

    const executionPrompt = `You are Gemini 3.0 Pro, the code generation and UI/UX implementation AI.

ARCHITECTURE PLAN (from Claude - DO NOT modify):
${parsedPlan.architecture}

TASKS TO EXECUTE:
${parsedPlan.tasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}

BRAND: ${task.brand}
TYPE: ${task.type}

Your role is STRICTLY limited to:
1. Step-by-step code generation following the plan exactly
2. Clean, minimal, production-ready implementations
3. Frontend/UI development with modern best practices
4. Strict instruction following - NO architectural changes

Generate the implementation code. Be concise and production-ready.`;

    const executionStart = Date.now();
    
    let executionProvider: AIProvider = "gemini";
    let executionModel = "gemini-2.5-pro";
    
    if (!process.env.GEMINI_API_KEY) {
      if (process.env.OPENROUTER_API_KEY) {
        executionProvider = "openrouter";
        executionModel = "google/gemini-2.0-flash-001";
      } else if (process.env.GROQ_API_KEY) {
        executionProvider = "groq";
        executionModel = "llama-3.3-70b-versatile";
      }
    }

    const executionResult = await this.aiService.chat(
      [{ role: "user", content: executionPrompt }],
      executionProvider,
      executionModel
    );
    const executionTime = Date.now() - executionStart;
    totalTokens += executionResult.tokensUsed || 0;

    const result: DualModelWorkflowResult = {
      taskId: task.id,
      planningPhase: {
        provider: "anthropic",
        model: "claude-sonnet-4-5-20250925",
        architecture: parsedPlan.architecture,
        taskBreakdown: parsedPlan.tasks,
        riskAssessment: parsedPlan.risks,
        estimatedComplexity: (parsedPlan.complexity as "low" | "medium" | "high") || "medium",
        tokensUsed: planningResult.tokensUsed || 0,
        processingTime: planningTime
      },
      executionPhase: {
        provider: executionProvider as "gemini",
        model: executionModel,
        generatedCode: executionResult.content,
        generatedUI: task.type === "ui_ux" ? executionResult.content : undefined,
        stepsCompleted: parsedPlan.tasks.length,
        tokensUsed: executionResult.tokensUsed || 0,
        processingTime: executionTime
      },
      totalProcessingTime: Date.now() - startTime,
      totalTokensUsed: totalTokens
    };

    if (task.includeReview) {
      const reviewPrompt = `Review this implementation for bugs and optimization opportunities:

${executionResult.content}

Provide:
1. Bugs found (list)
2. Optimization suggestions (list)
3. Approval status (approved/needs_revision)

Format as JSON with keys: bugs, optimizations, approved`;

      const reviewResult = await this.aiService.chat(
        [{ role: "user", content: reviewPrompt }],
        "anthropic",
        "claude-sonnet-4-5-20250925"
      );
      totalTokens += reviewResult.tokensUsed || 0;

      let parsedReview: { bugs: string[]; optimizations: string[]; approved: boolean };
      try {
        const jsonMatch = reviewResult.content.match(/\{[\s\S]*\}/);
        parsedReview = jsonMatch ? JSON.parse(jsonMatch[0]) : { bugs: [], optimizations: [], approved: true };
      } catch {
        parsedReview = { bugs: [], optimizations: [], approved: true };
      }

      result.reviewPhase = {
        provider: "anthropic",
        model: "claude-sonnet-4-5-20250925",
        bugsFound: parsedReview.bugs || [],
        optimizations: parsedReview.optimizations || [],
        approved: parsedReview.approved ?? true,
        tokensUsed: reviewResult.tokensUsed || 0
      };
      result.totalTokensUsed = totalTokens;
    }

    return result;
  }

  selectContentCreationModel(
    contentType: "social" | "blog" | "email" | "ad" | "research" | "seo",
    priority: "cost" | "quality" | "speed"
  ): { provider: AIProvider; model: string; estimatedCost: number } {
    const modelMatrix: Record<string, Record<string, { provider: AIProvider; model: string; cost: number }>> = {
      social: {
        cost: { provider: "together", model: "meta-llama/Llama-3.2-3B-Instruct-Turbo", cost: 0.06 },
        quality: { provider: "anthropic", model: "claude-sonnet-4-5-20250925", cost: 3 },
        speed: { provider: "groq", model: "llama-3.3-70b-versatile", cost: 0.59 }
      },
      blog: {
        cost: { provider: "openrouter", model: "deepseek/deepseek-chat", cost: 0.14 },
        quality: { provider: "anthropic", model: "claude-sonnet-4-5-20250925", cost: 3 },
        speed: { provider: "groq", model: "llama-3.3-70b-versatile", cost: 0.59 }
      },
      email: {
        cost: { provider: "together", model: "meta-llama/Llama-3.2-3B-Instruct-Turbo", cost: 0.06 },
        quality: { provider: "openai", model: "gpt-4o", cost: 2.5 },
        speed: { provider: "groq", model: "llama-3.1-8b-instant", cost: 0.05 }
      },
      ad: {
        cost: { provider: "openrouter", model: "meta-llama/llama-3.1-8b-instruct", cost: 0.055 },
        quality: { provider: "openai", model: "gpt-4o", cost: 2.5 },
        speed: { provider: "groq", model: "llama-3.3-70b-versatile", cost: 0.59 }
      },
      research: {
        cost: { provider: "openrouter", model: "deepseek/deepseek-chat", cost: 0.14 },
        quality: { provider: "anthropic", model: "claude-sonnet-4-5-20250925", cost: 3 },
        speed: { provider: "together", model: "meta-llama/Llama-3.3-70B-Instruct-Turbo", cost: 0.88 }
      },
      seo: {
        cost: { provider: "together", model: "Qwen/Qwen2.5-7B-Instruct-Turbo", cost: 0.2 },
        quality: { provider: "openrouter", model: "deepseek/deepseek-chat", cost: 0.14 },
        speed: { provider: "groq", model: "llama-3.3-70b-versatile", cost: 0.59 }
      }
    };

    const selection = modelMatrix[contentType]?.[priority] || modelMatrix.social.cost;
    return {
      provider: selection.provider,
      model: selection.model,
      estimatedCost: selection.cost
    };
  }

  getMarket360AgentRegistry(): {
    agents: Market360Agent[];
    stats: ReturnType<typeof getMarket360Stats>;
    providers: typeof PROVIDER_STATS;
  } {
    return {
      agents: ALL_MARKET360_AGENTS,
      stats: getMarket360Stats(),
      providers: PROVIDER_STATS
    };
  }

  selectBestAgent(task: WAITask): AgentSystemPrompt | null {
    const categoryAgents = getLegacyAgentsByCategory(task.vertical as LegacyAgentCategory);
    
    if (categoryAgents.length === 0) {
      return LEGACY_AGENTS[0];
    }

    let bestAgent: AgentSystemPrompt | null = null;
    let bestScore = 0;

    for (const agent of categoryAgents) {
      let score = 0;

      const capabilityMatch = agent.capabilities.skills.filter(
        (skill: string) => task.requiredCapabilities.some(
          cap => skill.toLowerCase().includes(cap.toLowerCase()) || 
                 cap.toLowerCase().includes(skill.toLowerCase())
        )
      ).length;
      score += capabilityMatch * 20;

      const jurisdictionMatch = agent.capabilities.jurisdictions.filter(
        (j: Jurisdiction) => task.targetJurisdictions.includes(j) || j === "global"
      ).length;
      score += jurisdictionMatch * 15;

      if (agent.capabilities.languages.includes(task.language)) {
        score += 25;
      }

      const tierWeight: Record<LegacyAgentTier, number> = {
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
    // Honor explicit provider constraints
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

    // Indian language support via Sarvam
    const needsIndianLanguage = task.language !== "en" || 
      agent.capabilities.sarvamLanguages.length > 0 && task.language !== "en";

    if (needsIndianLanguage) {
      return { provider: "sarvam", model: "sarvam-m", tier: "tier3" };
    }

    // COST OPTIMIZATION: Route through aggregators for best value
    // Priority 1: Ultra-fast via Groq (free tier with generous limits)
    if (task.constraints?.maxLatency && task.constraints.maxLatency < 2000) {
      return { provider: "groq", model: "llama-3.3-70b-versatile", tier: "tier2" };
    }

    // Priority 2: Low/medium priority → Use Together.ai or OpenRouter for cost savings
    if (task.priority === "low" || task.priority === "medium") {
      // Together.ai: Ultra low cost ($0.06-0.18 per 1M tokens)
      if (process.env.TOGETHER_API_KEY) {
        return { provider: "together", model: "meta-llama/Llama-3.2-3B-Instruct-Turbo", tier: "tier2" };
      }
      // OpenRouter fallback: Low cost Llama 3.1 8B ($0.055 per 1M)
      if (process.env.OPENROUTER_API_KEY) {
        return { provider: "openrouter", model: "meta-llama/llama-3.1-8b-instruct", tier: "tier4" };
      }
    }

    // Priority 3: Reasoning tasks → Use cost-effective reasoning models
    if (task.type === "analysis" || task.type === "optimization") {
      // DeepSeek V3 via OpenRouter: Best reasoning at $0.14-0.28 per 1M
      if (process.env.OPENROUTER_API_KEY) {
        return { provider: "openrouter", model: "deepseek/deepseek-chat", tier: "tier4" };
      }
      // Fallback to native Anthropic Claude Sonnet 4.5 (latest)
      return { provider: "anthropic", model: "claude-sonnet-4-5-20250925", tier: "tier1" };
    }

    // Priority 4: Generation tasks → Balance quality and cost
    if (task.type === "generation") {
      // Together.ai Llama 3.3 70B: High quality at $0.88 per 1M
      if (process.env.TOGETHER_API_KEY) {
        return { provider: "together", model: "meta-llama/Llama-3.3-70B-Instruct-Turbo", tier: "tier2" };
      }
      return { provider: "openai", model: "gpt-5.1-chat-latest", tier: "tier1" };
    }

    // Priority 5: Critical/high priority → Use premium providers (latest models)
    if (task.priority === "critical" || task.priority === "high") {
      // GPT-5.1 Thinking for critical tasks
      return { provider: "openai", model: "gpt-5.1", tier: "tier1" };
    }

    // Default: Use Groq for fast, free inference
    if (process.env.GROQ_API_KEY) {
      return { provider: "groq", model: "llama-3.3-70b-versatile", tier: "tier2" };
    }

    // Ultimate fallback: Gemini Flash (very low cost)
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
    const m360Agent = this.selectMarket360Agent(task);
    if (m360Agent) {
      return this.executeMarket360Task(task, m360Agent);
    }
    
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

  async executeMarket360Task(task: WAITask, m360Agent: Market360Agent): Promise<WAITaskResult> {
    const startTime = Date.now();

    const modelSelection = this.selectOptimalModelFromManifest(task);
    if (!modelSelection) {
      throw new Error(`No suitable LLM model found for task: ${task.id}`);
    }

    const { provider, model } = modelSelection;
    const systemPrompt = m360Agent.systemPrompt;

    const romaGuardrails = this.checkMarket360Guardrails(task, m360Agent);
    if (!romaGuardrails.passed) {
      throw new Error(`ROMA guardrail violation: ${romaGuardrails.violations.join(", ")}`);
    }

    const userMessage = this.buildMarket360TaskMessage(task, m360Agent);

    const response = await this.aiService.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      provider.id as AIProvider,
      model.id
    );

    const processingTime = Date.now() - startTime;

    this.agentActivations.set(
      m360Agent.id,
      (this.agentActivations.get(m360Agent.id) || 0) + 1
    );

    const tier = provider.tier as ModelTier;

    const result: WAITaskResult = {
      taskId: task.id,
      agentId: m360Agent.id,
      agentName: m360Agent.name,
      provider: provider.id as AIProvider,
      model: model.id,
      tier,
      response: response.content,
      confidence: this.calculateMarket360Confidence(response.content, m360Agent),
      processingTime,
      tokensUsed: response.tokensUsed,
      metadata: {
        jurisdictionsApplied: task.targetJurisdictions,
        languageUsed: task.language,
        guardrailsChecked: [`ROMA-${m360Agent.romaLevel}`, ...m360Agent.capabilities.slice(0, 2)],
        escalationRequired: m360Agent.romaLevel === "L3" || m360Agent.romaLevel === "L4"
      }
    };

    this.completedTasks.push(result);
    return result;
  }

  private buildMarket360TaskMessage(task: WAITask, agent: Market360Agent): string {
    const parts: string[] = [];
    parts.push(`## Task: ${task.description}`);
    parts.push("");
    parts.push(`**Type**: ${task.type}`);
    parts.push(`**Priority**: ${task.priority}`);
    parts.push(`**Vertical**: ${task.vertical}`);
    parts.push(`**Language**: ${task.language}`);
    parts.push(`**ROMA Level**: ${agent.romaLevel}`);
    parts.push(`**Target Jurisdictions**: ${task.targetJurisdictions.join(", ")}`);
    parts.push("");

    if (Object.keys(task.context).length > 0) {
      parts.push(`## Context`);
      parts.push("```json");
      parts.push(JSON.stringify(task.context, null, 2));
      parts.push("```");
      parts.push("");
    }

    parts.push(`## Agent Capabilities`);
    agent.capabilities.forEach(cap => parts.push(`- ${cap}`));
    parts.push("");

    parts.push(`## Available Tools`);
    agent.tools.forEach(tool => parts.push(`- ${tool}`));
    parts.push("");

    parts.push(`## Required Capabilities`);
    task.requiredCapabilities.forEach(cap => parts.push(`- ${cap}`));
    parts.push("");

    parts.push(`## ROMA Level Guidelines`);
    const romaGuidelines: Record<ROMALevel, string> = {
      "L0": "Reactive: Respond to direct requests only",
      "L1": "Proactive: Anticipate needs and suggest improvements",
      "L2": "Autonomous: Execute tasks with minimal oversight",
      "L3": "Collaborative: Coordinate with other agents for complex workflows",
      "L4": "Self-Evolving: Learn and optimize based on outcomes"
    };
    parts.push(romaGuidelines[agent.romaLevel]);

    return parts.join("\n");
  }

  private checkMarket360Guardrails(task: WAITask, agent: Market360Agent): { passed: boolean; violations: string[] } {
    const violations: string[] = [];

    if (task.language !== "en" && !agent.languages.includes(task.language as any)) {
      violations.push(`Language ${task.language} not supported by agent ${agent.id}`);
    }

    const jurisdictionMatch = agent.jurisdictions.some(
      j => task.targetJurisdictions.includes(j as Jurisdiction) || j === "global"
    );
    if (!jurisdictionMatch) {
      violations.push(`No matching jurisdiction for agent ${agent.id}`);
    }

    if (agent.romaLevel === "L0" && (task.type === "optimization" || task.type === "analysis")) {
      violations.push(`L0 agent cannot handle ${task.type} tasks`);
    }

    return { passed: violations.length === 0, violations };
  }

  private calculateMarket360Confidence(content: string, agent: Market360Agent): number {
    let confidence = 0.7;
    
    if (content.length > 200) confidence += 0.05;
    if (content.length > 500) confidence += 0.05;
    
    const romaBonus: Record<ROMALevel, number> = {
      "L0": 0, "L1": 0.02, "L2": 0.05, "L3": 0.08, "L4": 0.1
    };
    confidence += romaBonus[agent.romaLevel];

    if (agent.capabilities.length > 3) confidence += 0.03;

    return Math.min(confidence, 0.98);
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
    return {
      totalAgents: AGENT_STATS.total,
      agentsByCategory: AGENT_STATS.byVertical,
      agentsByTier: AGENT_STATS.byTier,
      activeAgents: this.agentActivations.size,
      tasksProcessed: this.completedTasks.length,
      averageConfidence: this.completedTasks.length > 0
        ? this.completedTasks.reduce((sum, t) => sum + t.confidence, 0) / this.completedTasks.length
        : 0
    };
  }

  getHierarchicalAgentRegistry(): {
    agents: HierarchicalAgent[];
    stats: typeof AGENT_STATS;
    tiers: typeof TIER_DEFINITIONS;
    jurisdictions: typeof JURISDICTION_REGULATIONS;
  } {
    return {
      agents: ALL_HIERARCHICAL_AGENTS,
      stats: AGENT_STATS,
      tiers: TIER_DEFINITIONS,
      jurisdictions: JURISDICTION_REGULATIONS
    };
  }

  getAgentRegistry(): {
    agents: AgentSystemPrompt[];
    categories: LegacyAgentCategory[];
    tiers: typeof TIER_DEFINITIONS;
    jurisdictions: typeof JURISDICTION_REGULATIONS;
  } {
    return {
      agents: LEGACY_AGENTS,
      categories: ["social", "seo", "web", "sales", "whatsapp", "linkedin", "performance"],
      tiers: TIER_DEFINITIONS,
      jurisdictions: JURISDICTION_REGULATIONS
    };
  }

  getAgentSystemPrompt(agentId: string): string | null {
    const agent = getLegacyAgentById(agentId);
    if (!agent) return null;
    return generateSystemPrompt(agent);
  }

  getHierarchicalAgentSystemPrompt(agentId: string): string | null {
    const agent = ALL_HIERARCHICAL_AGENTS.find(a => a.id === agentId);
    if (!agent) return null;
    return agent.systemPrompt;
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
export const waiSDKOrchestration = waiOrchestration;
