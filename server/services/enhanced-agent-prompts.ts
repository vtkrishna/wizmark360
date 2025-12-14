import { SupportedLanguage } from "./enhanced-ai-service";

export interface ContextEngineeringConfig {
  enableChainOfThought: boolean;
  enableFewShotExamples: boolean;
  enableStructuredOutput: boolean;
  enableSelfCorrection: boolean;
  enableConfidenceScoring: boolean;
  enableSourceCitation: boolean;
  maxContextTokens: number;
  temperatureStrategy: "creative" | "balanced" | "precise";
}

export interface PromptEnhancementResult {
  enhancedPrompt: string;
  clarifyingQuestions: string[];
  suggestedContext: string[];
  estimatedComplexity: "low" | "medium" | "high";
  recommendedModel: string;
  contextWindowUsage: number;
}

export interface DocumentContext {
  id: string;
  type: "pdf" | "text" | "image" | "url" | "structured";
  content: string;
  summary?: string;
  metadata: Record<string, any>;
  tokens: number;
}

export interface EnhancedAgentRequest {
  userMessage: string;
  agentId: string;
  vertical: string;
  documents?: DocumentContext[];
  previousContext?: string[];
  language?: SupportedLanguage;
  config?: Partial<ContextEngineeringConfig>;
}

export interface EnhancedAgentResponse {
  response: string;
  confidence: number;
  reasoning?: string;
  sources?: string[];
  alternatives?: string[];
  followUpSuggestions?: string[];
  metadata: {
    tokensUsed: number;
    processingTime: number;
    modelUsed: string;
    promptEnhancementsApplied: string[];
  };
}

export const DEFAULT_CONTEXT_CONFIG: ContextEngineeringConfig = {
  enableChainOfThought: true,
  enableFewShotExamples: true,
  enableStructuredOutput: true,
  enableSelfCorrection: true,
  enableConfidenceScoring: true,
  enableSourceCitation: true,
  maxContextTokens: 8000,
  temperatureStrategy: "balanced"
};

export const PROMPT_ENGINEERING_PATTERNS = {
  TASK_CONTEXT_CONSTRAINTS_OUTPUT: `
## TASK
{task}

## CONTEXT
{context}

## CONSTRAINTS
{constraints}

## OUTPUT FORMAT
{outputFormat}
`,

  CHAIN_OF_THOUGHT: `
Let's approach this step-by-step:

1. First, I'll analyze the request to understand what's being asked
2. Then, I'll gather relevant information from the context
3. Next, I'll formulate my approach based on best practices
4. Finally, I'll provide a comprehensive response with reasoning

{task}
`,

  SELF_CORRECTION: `
After generating your initial response, review it for:
- Accuracy: Are all facts correct?
- Completeness: Does it address all parts of the request?
- Clarity: Is the response easy to understand?
- Relevance: Does it stay focused on the task?

If any issues are found, provide a corrected response.
`,

  CONFIDENCE_SCORING: `
Rate your confidence in this response on a scale of 0-100:
- 90-100: High confidence - well-supported by evidence/knowledge
- 70-89: Medium-high confidence - mostly reliable
- 50-69: Medium confidence - some uncertainty
- 30-49: Low-medium confidence - significant gaps
- 0-29: Low confidence - speculative

Explain the key factors affecting your confidence score.
`,

  SOURCE_CITATION: `
When providing information, cite your sources using the following format:
[Source: {source_name}] or [Based on: {reasoning}]

For facts, data, or specific claims, always indicate the basis of your knowledge.
`,

  ITERATIVE_REFINEMENT: `
After your initial response, consider:
1. What additional information would improve this response?
2. Are there alternative approaches worth mentioning?
3. What follow-up questions might the user have?

Provide these as suggestions for further exploration.
`
};

export const FEW_SHOT_EXAMPLES = {
  content_creation: [
    {
      input: "Create a social media post for a new product launch",
      output: `Here's a compelling social media post for your product launch:

🚀 Introducing [Product Name] - The Future is Here!

We've been working on something special, and today we're thrilled to share it with you.

✨ Key Features:
• [Feature 1] - Transform your workflow
• [Feature 2] - Save time and resources  
• [Feature 3] - Built for the modern professional

🎁 Early Bird Offer: Get 20% off for the first 100 customers!

👉 Link in bio to learn more

#ProductLaunch #Innovation #NewRelease

---
Confidence: 85%
Reasoning: Standard product launch format with proven engagement elements. Customize placeholders for your specific product.`
    }
  ],
  
  analysis: [
    {
      input: "Analyze the performance of our Q3 marketing campaign",
      output: `## Q3 Marketing Campaign Analysis

### Executive Summary
Based on the provided metrics, here's a comprehensive analysis:

### Key Findings
1. **Reach & Engagement**: [Analysis with specific numbers]
2. **Conversion Performance**: [ROI calculations and insights]
3. **Channel Effectiveness**: [Breakdown by channel]

### Recommendations
1. Double down on high-performing channels
2. Optimize underperforming segments
3. Test new creative approaches for Q4

### Risk Areas
- [Identified risks with mitigation strategies]

---
Confidence: 78%
Sources: [Data sources used for analysis]`
    }
  ],
  
  strategy: [
    {
      input: "Develop a go-to-market strategy for entering the UAE market",
      output: `## UAE Market Entry Strategy

### Market Overview
The UAE presents a unique opportunity with:
- GDP: $421 billion
- Digital adoption rate: 98%
- Key industries: Finance, Real Estate, Tourism, Tech

### Recommended Approach

**Phase 1: Market Research (Weeks 1-4)**
- Conduct competitive analysis
- Identify local partners
- Understand regulatory requirements

**Phase 2: Localization (Weeks 5-8)**
- Arabic language adaptation
- Cultural customization
- Payment gateway integration (regional providers)

**Phase 3: Launch (Weeks 9-12)**
- Soft launch with beta users
- Influencer partnerships
- PR campaign targeting regional media

### Budget Estimate
- Research: $15,000-25,000
- Localization: $30,000-50,000
- Marketing: $50,000-100,000

---
Confidence: 72%
Note: Specific numbers should be validated with current market data.`
    }
  ]
};

export const CLARIFYING_QUESTION_TEMPLATES = {
  missing_context: [
    "To provide the best response, could you share more about {missing_element}?",
    "I'd like to understand {missing_element} better. Can you elaborate?",
    "What specific {missing_element} are you working with?"
  ],
  
  ambiguous_request: [
    "Your request could be interpreted in a few ways. Did you mean {option_a} or {option_b}?",
    "To make sure I address your needs correctly, are you looking for {option_a} or {option_b}?",
    "I want to be precise. When you say '{ambiguous_term}', do you mean {clarification}?"
  ],
  
  scope_clarification: [
    "Should this focus on {narrow_scope} or cover {broader_scope}?",
    "What timeframe are we considering - {short_term} or {long_term}?",
    "Is this for {audience_a} or {audience_b}?"
  ],
  
  constraint_identification: [
    "Are there any budget or resource constraints I should know about?",
    "What's the timeline for this project?",
    "Are there any regulatory or compliance requirements to consider?"
  ]
};

export class EnhancedPromptService {
  private config: ContextEngineeringConfig;

  constructor(config: Partial<ContextEngineeringConfig> = {}) {
    this.config = { ...DEFAULT_CONTEXT_CONFIG, ...config };
  }

  analyzeRequestCompleteness(request: string): {
    isComplete: boolean;
    missingElements: string[];
    suggestedQuestions: string[];
    complexity: "low" | "medium" | "high";
  } {
    const missingElements: string[] = [];
    const suggestedQuestions: string[] = [];

    const hasTarget = /for|to|targeting|audience|customers?/i.test(request);
    const hasPlatform = /instagram|facebook|twitter|linkedin|whatsapp|email|website/i.test(request);
    const hasTone = /professional|casual|friendly|formal|urgent|exciting/i.test(request);
    const hasGoal = /increase|improve|generate|create|build|launch|optimize/i.test(request);
    const hasTimeline = /today|tomorrow|this week|next week|asap|deadline|by/i.test(request);
    const hasBrand = /brand|company|business|organization|our/i.test(request);

    if (!hasTarget) {
      missingElements.push("target audience");
      suggestedQuestions.push("Who is the target audience for this content?");
    }
    if (!hasPlatform && /content|post|message/i.test(request)) {
      missingElements.push("platform/channel");
      suggestedQuestions.push("Which platform or channel is this for?");
    }
    if (!hasTone) {
      missingElements.push("tone/style");
      suggestedQuestions.push("What tone would you like - professional, casual, or something else?");
    }
    if (!hasGoal) {
      missingElements.push("specific goal");
      suggestedQuestions.push("What's the primary goal you're trying to achieve?");
    }
    if (!hasBrand) {
      missingElements.push("brand context");
      suggestedQuestions.push("Can you tell me more about your brand or company?");
    }

    const wordCount = request.split(/\s+/).length;
    let complexity: "low" | "medium" | "high" = "low";
    if (wordCount > 50 || missingElements.length <= 1) {
      complexity = "medium";
    }
    if (wordCount > 100 || /strategy|analysis|comprehensive|detailed/i.test(request)) {
      complexity = "high";
    }

    return {
      isComplete: missingElements.length <= 1,
      missingElements,
      suggestedQuestions: suggestedQuestions.slice(0, 3),
      complexity
    };
  }

  enhancePrompt(
    userMessage: string,
    agentContext: {
      agentName: string;
      agentRole: string;
      vertical: string;
      capabilities: string[];
    },
    documents?: DocumentContext[]
  ): PromptEnhancementResult {
    const analysis = this.analyzeRequestCompleteness(userMessage);
    
    let enhancedPrompt = "";
    const appliedEnhancements: string[] = [];

    enhancedPrompt += `You are ${agentContext.agentName}, a specialized ${agentContext.agentRole} agent in the ${agentContext.vertical} vertical.\n\n`;
    enhancedPrompt += `Your capabilities include: ${agentContext.capabilities.join(", ")}\n\n`;

    if (this.config.enableChainOfThought) {
      enhancedPrompt += PROMPT_ENGINEERING_PATTERNS.CHAIN_OF_THOUGHT.replace("{task}", "");
      appliedEnhancements.push("chain-of-thought");
    }

    if (documents && documents.length > 0) {
      enhancedPrompt += "## ATTACHED DOCUMENTS\n";
      for (const doc of documents) {
        enhancedPrompt += `### ${doc.type.toUpperCase()} Document: ${doc.id}\n`;
        if (doc.summary) {
          enhancedPrompt += `Summary: ${doc.summary}\n`;
        }
        enhancedPrompt += `Content: ${doc.content.substring(0, 2000)}${doc.content.length > 2000 ? '...' : ''}\n\n`;
      }
      appliedEnhancements.push("document-context");
    }

    enhancedPrompt += `## USER REQUEST\n${userMessage}\n\n`;

    if (this.config.enableStructuredOutput) {
      enhancedPrompt += `## RESPONSE REQUIREMENTS
Provide your response in the following structure:
1. **Direct Answer**: Address the user's request directly
2. **Reasoning**: Explain your approach (if applicable)
3. **Alternatives**: Suggest alternatives when relevant
4. **Follow-up**: Propose next steps or clarifications needed\n\n`;
      appliedEnhancements.push("structured-output");
    }

    if (this.config.enableConfidenceScoring) {
      enhancedPrompt += PROMPT_ENGINEERING_PATTERNS.CONFIDENCE_SCORING + "\n\n";
      appliedEnhancements.push("confidence-scoring");
    }

    if (this.config.enableSourceCitation) {
      enhancedPrompt += PROMPT_ENGINEERING_PATTERNS.SOURCE_CITATION + "\n\n";
      appliedEnhancements.push("source-citation");
    }

    if (this.config.enableSelfCorrection) {
      enhancedPrompt += PROMPT_ENGINEERING_PATTERNS.SELF_CORRECTION + "\n\n";
      appliedEnhancements.push("self-correction");
    }

    const fewShotCategory = this.determineFewShotCategory(userMessage);
    const examples = FEW_SHOT_EXAMPLES[fewShotCategory];
    if (this.config.enableFewShotExamples && examples && examples.length > 0) {
      enhancedPrompt += "## EXAMPLE FORMAT\n";
      enhancedPrompt += `Input: ${examples[0].input}\n`;
      enhancedPrompt += `Output: ${examples[0].output}\n\n`;
      appliedEnhancements.push("few-shot-examples");
    }

    const estimatedTokens = Math.ceil(enhancedPrompt.length / 4);
    const recommendedModel = this.selectRecommendedModel(analysis.complexity, estimatedTokens);

    return {
      enhancedPrompt,
      clarifyingQuestions: analysis.suggestedQuestions,
      suggestedContext: analysis.missingElements,
      estimatedComplexity: analysis.complexity,
      recommendedModel,
      contextWindowUsage: estimatedTokens / this.config.maxContextTokens
    };
  }

  private determineFewShotCategory(message: string): keyof typeof FEW_SHOT_EXAMPLES {
    if (/create|write|generate|draft|compose/i.test(message)) {
      return "content_creation";
    }
    if (/analyze|review|assess|evaluate|measure/i.test(message)) {
      return "analysis";
    }
    return "strategy";
  }

  private selectRecommendedModel(complexity: "low" | "medium" | "high", tokens: number): string {
    if (complexity === "high" || tokens > 6000) {
      return "claude-sonnet-4-20250514";
    }
    if (complexity === "medium") {
      return "gpt-4o";
    }
    return "llama-3.3-70b-versatile";
  }

  generateClarifyingQuestions(
    request: string,
    vertical: string,
    existingContext?: string[]
  ): string[] {
    const questions: string[] = [];
    const analysis = this.analyzeRequestCompleteness(request);

    questions.push(...analysis.suggestedQuestions);

    const verticalQuestions: Record<string, string[]> = {
      social: [
        "Which social platforms should we prioritize?",
        "What's your posting frequency goal?",
        "Do you have brand guidelines to follow?"
      ],
      seo: [
        "What are your target keywords?",
        "Who are your main competitors?",
        "What's your current domain authority?"
      ],
      sales: [
        "What's your ideal customer profile?",
        "What's your typical sales cycle length?",
        "What CRM are you using?"
      ],
      performance: [
        "What's your monthly advertising budget?",
        "What platforms are you advertising on?",
        "What's your target CPA/ROAS?"
      ],
      whatsapp: [
        "What's your current WhatsApp Business setup?",
        "What's your typical message volume?",
        "Do you need automated responses?"
      ],
      linkedin: [
        "Are you targeting B2B or B2C?",
        "What job titles are you targeting?",
        "Do you want organic or paid reach?"
      ],
      web: [
        "What type of website do you need?",
        "What's your tech stack preference?",
        "Do you need e-commerce functionality?"
      ]
    };

    const verticalSpecific = verticalQuestions[vertical] || [];
    for (const q of verticalSpecific) {
      if (!existingContext?.some(ctx => ctx.toLowerCase().includes(q.toLowerCase().split(" ")[2]))) {
        questions.push(q);
      }
    }

    return questions.slice(0, 5);
  }

  addDocumentContext(
    documents: DocumentContext[],
    maxTokens: number = 4000
  ): string {
    let contextString = "## DOCUMENT CONTEXT\n\n";
    let currentTokens = 0;

    const sortedDocs = [...documents].sort((a, b) => {
      const typeOrder = { structured: 0, text: 1, pdf: 2, url: 3, image: 4 };
      return (typeOrder[a.type] || 5) - (typeOrder[b.type] || 5);
    });

    for (const doc of sortedDocs) {
      if (currentTokens >= maxTokens) break;

      const docHeader = `### Document: ${doc.id} (${doc.type})\n`;
      const docContent = doc.summary || doc.content.substring(0, 1000);
      const docTokens = Math.ceil((docHeader.length + docContent.length) / 4);

      if (currentTokens + docTokens <= maxTokens) {
        contextString += docHeader;
        contextString += docContent + "\n\n";
        currentTokens += docTokens;
      }
    }

    return contextString;
  }

  getTemperature(): number {
    switch (this.config.temperatureStrategy) {
      case "creative": return 0.9;
      case "precise": return 0.2;
      case "balanced": 
      default: return 0.7;
    }
  }
}

export const enhancedPromptService = new EnhancedPromptService();
