import { EnhancedAIService } from "./enhanced-ai-service";

export interface ClarificationAnalysis {
  needsClarification: boolean;
  confidence: number;
  ambiguities: AmbiguityDetection[];
  suggestedQuestions: ClarifyingQuestion[];
  inferredIntent: string;
  missingCriticalInfo: string[];
}

export interface AmbiguityDetection {
  type: "scope" | "timeline" | "audience" | "goal" | "format" | "technical" | "preference";
  description: string;
  possibleInterpretations: string[];
  impact: "high" | "medium" | "low";
}

export interface ClarifyingQuestion {
  question: string;
  type: "required" | "optional" | "enhancement";
  category: string;
  expectedAnswerType: "text" | "choice" | "number" | "boolean";
  choices?: string[];
  defaultValue?: string;
}

export interface DeepResearchConfig {
  maxClarifyingQuestions: number;
  askBeforeProceeding: boolean;
  autoInferWhenPossible: boolean;
  minConfidenceToSkip: number;
  enableIterativeRefinement: boolean;
}

export const DEFAULT_DEEP_RESEARCH_CONFIG: DeepResearchConfig = {
  maxClarifyingQuestions: 5,
  askBeforeProceeding: true,
  autoInferWhenPossible: true,
  minConfidenceToSkip: 0.85,
  enableIterativeRefinement: true
};

export class PromptClarificationService {
  private aiService: EnhancedAIService;
  private config: DeepResearchConfig;

  constructor(config: Partial<DeepResearchConfig> = {}) {
    this.aiService = new EnhancedAIService();
    this.config = { ...DEFAULT_DEEP_RESEARCH_CONFIG, ...config };
  }

  async analyzeForClarification(
    userMessage: string,
    vertical: string,
    agentCapabilities: string[]
  ): Promise<ClarificationAnalysis> {
    const patternAnalysis = this.analyzePatterns(userMessage);
    const verticalRequirements = this.getVerticalRequirements(vertical);
    
    const ambiguities: AmbiguityDetection[] = [];
    const missingCriticalInfo: string[] = [];

    if (!this.hasGoalClarity(userMessage)) {
      ambiguities.push({
        type: "goal",
        description: "The primary objective is not clearly stated",
        possibleInterpretations: this.inferPossibleGoals(userMessage, vertical),
        impact: "high"
      });
      missingCriticalInfo.push("primary goal/objective");
    }

    if (!this.hasAudienceClarity(userMessage)) {
      ambiguities.push({
        type: "audience",
        description: "Target audience is not specified",
        possibleInterpretations: ["General audience", "B2B professionals", "B2C consumers", "Specific niche"],
        impact: "medium"
      });
    }

    if (!this.hasScopeClarity(userMessage)) {
      ambiguities.push({
        type: "scope",
        description: "Scope of work is unclear",
        possibleInterpretations: ["Quick task", "Comprehensive project", "Ongoing initiative"],
        impact: "medium"
      });
    }

    if (this.needsFormatClarification(userMessage, vertical)) {
      ambiguities.push({
        type: "format",
        description: "Output format preference not specified",
        possibleInterpretations: this.getFormatOptions(vertical),
        impact: "low"
      });
    }

    for (const req of verticalRequirements) {
      if (!this.hasRequirement(userMessage, req.keywords)) {
        if (req.critical) {
          missingCriticalInfo.push(req.name);
        }
      }
    }

    const suggestedQuestions = this.generateClarifyingQuestions(
      ambiguities,
      missingCriticalInfo,
      vertical
    );

    const confidence = this.calculateConfidence(
      patternAnalysis,
      ambiguities,
      missingCriticalInfo
    );

    const needsClarification = 
      confidence < this.config.minConfidenceToSkip ||
      ambiguities.some(a => a.impact === "high") ||
      missingCriticalInfo.length > 0;

    return {
      needsClarification,
      confidence,
      ambiguities,
      suggestedQuestions: suggestedQuestions.slice(0, this.config.maxClarifyingQuestions),
      inferredIntent: this.inferIntent(userMessage, vertical),
      missingCriticalInfo
    };
  }

  private analyzePatterns(message: string): {
    hasAction: boolean;
    hasSubject: boolean;
    hasContext: boolean;
    wordCount: number;
    questionType: "what" | "how" | "why" | "when" | "where" | "statement";
  } {
    const wordCount = message.split(/\s+/).length;
    const hasAction = /create|write|generate|analyze|build|develop|design|optimize|improve|launch/i.test(message);
    const hasSubject = /content|post|campaign|website|email|ad|strategy|report|analysis/i.test(message);
    const hasContext = /for|about|regarding|concerning|related to/i.test(message);

    let questionType: "what" | "how" | "why" | "when" | "where" | "statement" = "statement";
    if (/^what/i.test(message)) questionType = "what";
    else if (/^how/i.test(message)) questionType = "how";
    else if (/^why/i.test(message)) questionType = "why";
    else if (/^when/i.test(message)) questionType = "when";
    else if (/^where/i.test(message)) questionType = "where";

    return { hasAction, hasSubject, hasContext, wordCount, questionType };
  }

  private hasGoalClarity(message: string): boolean {
    return /to\s+(increase|improve|generate|achieve|reach|boost|grow|reduce|minimize)/i.test(message) ||
           /goal|objective|target|aim|purpose|want to|need to|trying to/i.test(message);
  }

  private hasAudienceClarity(message: string): boolean {
    return /for\s+(our|the|my)?\s*(customers?|users?|audience|clients?|team|stakeholders)/i.test(message) ||
           /targeting|aimed at|directed at|B2B|B2C|enterprise|SMB|consumers?/i.test(message);
  }

  private hasScopeClarity(message: string): boolean {
    return /\d+\s*(posts?|emails?|pages?|articles?)/i.test(message) ||
           /complete|comprehensive|quick|simple|detailed|brief|full/i.test(message) ||
           /by\s+(today|tomorrow|next week|end of)/i.test(message);
  }

  private needsFormatClarification(message: string, vertical: string): boolean {
    const formatKeywords = /format|style|structure|layout|template|design/i;
    if (formatKeywords.test(message)) return false;

    const contentVerticals = ["social", "seo", "web", "performance"];
    return contentVerticals.includes(vertical) && !/\.(pdf|doc|ppt|html|json)/i.test(message);
  }

  private hasRequirement(message: string, keywords: string[]): boolean {
    return keywords.some(kw => new RegExp(kw, "i").test(message));
  }

  private getVerticalRequirements(vertical: string): Array<{
    name: string;
    keywords: string[];
    critical: boolean;
  }> {
    const requirements: Record<string, Array<{ name: string; keywords: string[]; critical: boolean }>> = {
      social: [
        { name: "platform", keywords: ["instagram", "facebook", "twitter", "linkedin", "tiktok", "platform"], critical: false },
        { name: "brand voice", keywords: ["tone", "voice", "style", "brand"], critical: false },
        { name: "content type", keywords: ["post", "story", "reel", "video", "image", "carousel"], critical: false }
      ],
      seo: [
        { name: "target keywords", keywords: ["keyword", "search term", "query", "ranking"], critical: true },
        { name: "URL/domain", keywords: ["website", "url", "domain", "page", "site"], critical: false },
        { name: "competitors", keywords: ["competitor", "competition", "rival"], critical: false }
      ],
      sales: [
        { name: "product/service", keywords: ["product", "service", "offering", "solution"], critical: true },
        { name: "target market", keywords: ["market", "segment", "industry", "vertical"], critical: false },
        { name: "pricing context", keywords: ["price", "cost", "budget", "investment"], critical: false }
      ],
      performance: [
        { name: "budget", keywords: ["budget", "spend", "investment", "cost"], critical: true },
        { name: "platform", keywords: ["google", "facebook", "meta", "linkedin", "platform"], critical: false },
        { name: "KPIs", keywords: ["kpi", "metric", "goal", "target", "roas", "cpa", "ctr"], critical: false }
      ],
      whatsapp: [
        { name: "use case", keywords: ["support", "sales", "notification", "marketing", "automation"], critical: true },
        { name: "message type", keywords: ["template", "message", "broadcast", "campaign"], critical: false }
      ],
      linkedin: [
        { name: "objective", keywords: ["leads", "awareness", "recruitment", "sales", "engagement"], critical: true },
        { name: "target titles", keywords: ["title", "role", "position", "decision maker"], critical: false }
      ],
      web: [
        { name: "website type", keywords: ["landing", "ecommerce", "blog", "portfolio", "corporate"], critical: true },
        { name: "functionality", keywords: ["feature", "function", "capability", "integration"], critical: false }
      ]
    };

    return requirements[vertical] || [];
  }

  private inferPossibleGoals(message: string, vertical: string): string[] {
    const verticalGoals: Record<string, string[]> = {
      social: ["Increase engagement", "Grow followers", "Drive traffic", "Build brand awareness", "Generate leads"],
      seo: ["Improve rankings", "Increase organic traffic", "Build authority", "Target new keywords", "Fix technical issues"],
      sales: ["Generate leads", "Close deals", "Qualify prospects", "Nurture relationships", "Expand accounts"],
      performance: ["Lower CPA", "Increase ROAS", "Scale campaigns", "Improve conversion rate", "Reach new audiences"],
      whatsapp: ["Automate support", "Send broadcasts", "Qualify leads", "Improve response time", "Scale messaging"],
      linkedin: ["Generate B2B leads", "Build thought leadership", "Recruit talent", "Expand network", "Drive sales"],
      web: ["Launch new site", "Improve UX", "Increase conversions", "Add features", "Optimize performance"]
    };

    return verticalGoals[vertical] || ["Achieve business objective", "Improve performance", "Solve specific problem"];
  }

  private getFormatOptions(vertical: string): string[] {
    const formats: Record<string, string[]> = {
      social: ["Image post", "Carousel", "Video/Reel", "Story", "Text post", "Thread"],
      seo: ["Technical audit", "Content plan", "Keyword analysis", "Competitor report", "Action items"],
      sales: ["Email template", "Sales script", "Proposal", "Pitch deck", "Follow-up sequence"],
      performance: ["Campaign structure", "Ad copy", "Creative brief", "Budget plan", "Performance report"],
      whatsapp: ["Message template", "Automation flow", "Response scripts", "Broadcast campaign"],
      linkedin: ["Post", "Article", "Ad creative", "Message template", "Content calendar"],
      web: ["Wireframe", "Design mockup", "Code", "Content structure", "Technical spec"]
    };

    return formats[vertical] || ["Document", "Report", "Plan", "Action items"];
  }

  private generateClarifyingQuestions(
    ambiguities: AmbiguityDetection[],
    missingInfo: string[],
    vertical: string
  ): ClarifyingQuestion[] {
    const questions: ClarifyingQuestion[] = [];

    for (const info of missingInfo) {
      questions.push({
        question: this.generateQuestionForMissingInfo(info, vertical),
        type: "required",
        category: info,
        expectedAnswerType: "text"
      });
    }

    for (const ambiguity of ambiguities) {
      if (ambiguity.impact === "high" || ambiguity.impact === "medium") {
        questions.push({
          question: this.generateQuestionForAmbiguity(ambiguity),
          type: ambiguity.impact === "high" ? "required" : "optional",
          category: ambiguity.type,
          expectedAnswerType: "choice",
          choices: ambiguity.possibleInterpretations
        });
      }
    }

    return questions;
  }

  private generateQuestionForMissingInfo(info: string, vertical: string): string {
    const questionTemplates: Record<string, string> = {
      "primary goal/objective": "What's the main goal you're trying to achieve with this?",
      "target keywords": "What keywords or search terms are you targeting?",
      "budget": "What's your budget for this initiative?",
      "use case": "What's the primary use case - support, sales, or marketing?",
      "objective": "What's your main objective - lead generation, awareness, or engagement?",
      "website type": "What type of website do you need - landing page, e-commerce, blog, or corporate site?",
      "product/service": "What product or service are we focusing on?"
    };

    return questionTemplates[info] || `Could you provide more details about ${info}?`;
  }

  private generateQuestionForAmbiguity(ambiguity: AmbiguityDetection): string {
    const templates: Record<string, string> = {
      goal: "To ensure I deliver exactly what you need, which of these best describes your goal?",
      audience: "Who is the primary audience for this?",
      scope: "What's the scope you're looking for?",
      format: "What format would you prefer for the output?",
      timeline: "What's your timeline for this?",
      technical: "What technical requirements should I consider?",
      preference: "Do you have a preference for how this should be approached?"
    };

    return templates[ambiguity.type] || "Could you clarify this aspect of your request?";
  }

  private calculateConfidence(
    patterns: ReturnType<typeof this.analyzePatterns>,
    ambiguities: AmbiguityDetection[],
    missingInfo: string[]
  ): number {
    let confidence = 0.5;

    if (patterns.hasAction) confidence += 0.1;
    if (patterns.hasSubject) confidence += 0.1;
    if (patterns.hasContext) confidence += 0.1;
    if (patterns.wordCount > 20) confidence += 0.05;
    if (patterns.wordCount > 50) confidence += 0.05;

    for (const ambiguity of ambiguities) {
      if (ambiguity.impact === "high") confidence -= 0.15;
      else if (ambiguity.impact === "medium") confidence -= 0.1;
      else confidence -= 0.05;
    }

    confidence -= missingInfo.length * 0.1;

    return Math.max(0, Math.min(1, confidence));
  }

  private inferIntent(message: string, vertical: string): string {
    const actionPatterns = [
      { pattern: /create|write|generate|draft/i, intent: "content creation" },
      { pattern: /analyze|review|audit|assess/i, intent: "analysis and review" },
      { pattern: /optimize|improve|enhance|boost/i, intent: "optimization" },
      { pattern: /strategy|plan|roadmap/i, intent: "strategic planning" },
      { pattern: /help|assist|support/i, intent: "assistance and guidance" },
      { pattern: /launch|start|begin|initiate/i, intent: "project initiation" },
      { pattern: /fix|solve|resolve|troubleshoot/i, intent: "problem solving" }
    ];

    for (const { pattern, intent } of actionPatterns) {
      if (pattern.test(message)) {
        return `${intent} for ${vertical}`;
      }
    }

    return `general ${vertical} task`;
  }

  async refineWithUserInput(
    originalRequest: string,
    clarifications: Record<string, string>,
    previousAnalysis: ClarificationAnalysis
  ): Promise<{
    refinedRequest: string;
    additionalContext: string;
    readyToProcess: boolean;
    remainingQuestions: ClarifyingQuestion[];
  }> {
    let refinedRequest = originalRequest;
    const clarificationText: string[] = [];

    for (const [key, value] of Object.entries(clarifications)) {
      clarificationText.push(`${key}: ${value}`);
    }

    const additionalContext = clarificationText.join("\n");

    const answeredCategories = Object.keys(clarifications);
    const remainingQuestions = previousAnalysis.suggestedQuestions.filter(
      q => !answeredCategories.includes(q.category)
    );

    const requiredRemaining = remainingQuestions.filter(q => q.type === "required");
    const readyToProcess = requiredRemaining.length === 0;

    refinedRequest = `${originalRequest}\n\nAdditional Context:\n${additionalContext}`;

    return {
      refinedRequest,
      additionalContext,
      readyToProcess,
      remainingQuestions
    };
  }

  formatQuestionsForUser(questions: ClarifyingQuestion[]): string {
    if (questions.length === 0) return "";

    let formatted = "Before I proceed, I'd like to clarify a few things to give you the best possible response:\n\n";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      formatted += `${i + 1}. ${q.question}`;
      
      if (q.choices && q.choices.length > 0) {
        formatted += "\n   Options: " + q.choices.join(" | ");
      }
      
      if (q.type === "optional") {
        formatted += " (optional)";
      }
      
      formatted += "\n\n";
    }

    formatted += "Feel free to answer as many as you'd like, or just say 'proceed' and I'll make reasonable assumptions.";

    return formatted;
  }
}

export const promptClarificationService = new PromptClarificationService();
