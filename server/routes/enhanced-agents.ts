import { Router, Request, Response } from "express";
import { 
  enhancedPromptService, 
  EnhancedAgentRequest,
  DocumentContext,
  DEFAULT_CONTEXT_CONFIG
} from "../services/enhanced-agent-prompts";
import { 
  promptClarificationService,
  ClarificationAnalysis
} from "../services/prompt-clarification-service";
import { 
  documentContextHandler,
  DocumentProcessingResult
} from "../services/document-context-handler";
import { waiOrchestration } from "../services/wai-sdk-orchestration";
import { 
  getAgentById as getMarket360AgentById,
  getAgentsByVertical,
  Vertical
} from "../agents/market360-agent-catalog";

const router = Router();

router.post("/analyze-request", async (req: Request, res: Response) => {
  try {
    const { message, vertical, agentId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const agent = agentId ? getMarket360AgentById(agentId) : null;
    const capabilities = agent?.capabilities || [];

    const analysis = await promptClarificationService.analyzeForClarification(
      message,
      vertical || "social",
      capabilities
    );

    res.json({
      needsClarification: analysis.needsClarification,
      confidence: analysis.confidence,
      inferredIntent: analysis.inferredIntent,
      ambiguities: analysis.ambiguities,
      missingCriticalInfo: analysis.missingCriticalInfo,
      suggestedQuestions: analysis.suggestedQuestions,
      formattedQuestions: promptClarificationService.formatQuestionsForUser(analysis.suggestedQuestions)
    });
  } catch (error) {
    console.error("Request analysis error:", error);
    res.status(500).json({ error: "Failed to analyze request" });
  }
});

router.post("/enhance-prompt", async (req: Request, res: Response) => {
  try {
    const { message, agentId, vertical, documents, config } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const agent = agentId ? getMarket360AgentById(agentId) : null;
    const agentContext = {
      agentName: agent?.name || "Marketing Agent",
      agentRole: agent?.romaLevel || "L2",
      vertical: vertical || "social",
      capabilities: agent?.capabilities || ["content creation", "analysis"]
    };

    let documentContexts: DocumentContext[] = [];
    if (documents && Array.isArray(documents)) {
      for (const doc of documents) {
        const result = await documentContextHandler.processDocument({
          id: doc.id || `doc-${Date.now()}`,
          type: doc.type || "text",
          content: doc.content,
          metadata: doc.metadata
        });
        documentContexts.push(result.document);
      }
    }

    const enhancementResult = enhancedPromptService.enhancePrompt(
      message,
      agentContext,
      documentContexts
    );

    res.json({
      originalMessage: message,
      enhancedPrompt: enhancementResult.enhancedPrompt,
      clarifyingQuestions: enhancementResult.clarifyingQuestions,
      suggestedContext: enhancementResult.suggestedContext,
      estimatedComplexity: enhancementResult.estimatedComplexity,
      recommendedModel: enhancementResult.recommendedModel,
      contextWindowUsage: enhancementResult.contextWindowUsage,
      documentsProcessed: documentContexts.length
    });
  } catch (error) {
    console.error("Prompt enhancement error:", error);
    res.status(500).json({ error: "Failed to enhance prompt" });
  }
});

router.post("/deep-research", async (req: Request, res: Response) => {
  try {
    const { message, vertical, agentId, documents, clarifications, skipClarification } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const agent = agentId ? getMarket360AgentById(agentId) : null;
    const capabilities = agent?.capabilities || [];

    const analysis = await promptClarificationService.analyzeForClarification(
      message,
      vertical || "social",
      capabilities
    );

    if (analysis.needsClarification && !skipClarification && !clarifications) {
      return res.json({
        status: "needs_clarification",
        confidence: analysis.confidence,
        questions: analysis.suggestedQuestions,
        formattedQuestions: promptClarificationService.formatQuestionsForUser(analysis.suggestedQuestions),
        inferredIntent: analysis.inferredIntent,
        missingInfo: analysis.missingCriticalInfo
      });
    }

    let finalMessage = message;
    if (clarifications) {
      const refinement = await promptClarificationService.refineWithUserInput(
        message,
        clarifications,
        analysis
      );
      finalMessage = refinement.refinedRequest;
    }

    const agentContext = {
      agentName: agent?.name || "Deep Research Agent",
      agentRole: agent?.romaLevel || "L3",
      vertical: vertical || "social",
      capabilities: capabilities.length > 0 ? capabilities : ["deep research", "analysis", "content creation"]
    };

    let documentContexts: DocumentContext[] = [];
    if (documents && Array.isArray(documents)) {
      for (const doc of documents) {
        const result = await documentContextHandler.processDocument({
          id: doc.id || `doc-${Date.now()}`,
          type: doc.type || "text",
          content: doc.content,
          metadata: doc.metadata
        });
        documentContexts.push(result.document);
      }
    }

    const enhancementResult = enhancedPromptService.enhancePrompt(
      finalMessage,
      agentContext,
      documentContexts
    );

    const task = {
      id: `deep-research-${Date.now()}`,
      type: "analysis" as const,
      vertical: vertical || "social",
      description: finalMessage,
      priority: "high" as const,
      requiredCapabilities: ["deep research", "analysis"],
      targetJurisdictions: ["global" as const],
      language: "en" as const,
      context: { 
        enhancedPrompt: enhancementResult.enhancedPrompt,
        documentsAttached: documentContexts.length
      }
    };

    const result = await waiOrchestration.executeTask(task);

    res.json({
      status: "completed",
      response: result.response,
      confidence: result.confidence,
      agent: {
        id: result.agentId,
        name: result.agentName
      },
      processingDetails: {
        model: result.model,
        provider: result.provider,
        processingTime: result.processingTime,
        tokensUsed: result.tokensUsed
      },
      enhancements: {
        complexity: enhancementResult.estimatedComplexity,
        contextWindowUsage: enhancementResult.contextWindowUsage,
        documentsUsed: documentContexts.length
      }
    });
  } catch (error) {
    console.error("Deep research error:", error);
    res.status(500).json({ error: "Failed to execute deep research" });
  }
});

router.post("/documents", async (req: Request, res: Response) => {
  try {
    const { id, type, content, metadata } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Document content is required" });
    }

    const result = await documentContextHandler.processDocument({
      id: id || `doc-${Date.now()}`,
      type: type || "text",
      content,
      metadata
    });

    const hasRealContent = !result.document.content.includes('[PDF Document Detected') &&
                           !result.document.content.includes('[URL Fetch Failed') &&
                           !result.document.content.includes('[Image Analysis]') &&
                           !result.document.content.includes('LIMITATION:');

    res.json({
      document: {
        id: result.document.id,
        type: result.document.type,
        tokens: result.document.tokens,
        hasSummary: !!result.document.summary,
        contentPreview: result.document.content.substring(0, 200) + '...'
      },
      status: result.processingStatus,
      hasUsableContent: hasRealContent,
      contentQuality: hasRealContent ? 'full' : 'limited',
      warnings: result.warnings,
      extractedEntities: result.extractedEntities?.slice(0, 20),
      recommendations: hasRealContent ? [] : [
        'For best results, use document type "text" with pre-extracted content',
        'URL fetching works for publicly accessible pages',
        'PDF and image processing have limitations - consider converting to text first'
      ]
    });
  } catch (error) {
    console.error("Document processing error:", error);
    res.status(500).json({ error: "Failed to process document" });
  }
});

router.get("/documents", async (_req: Request, res: Response) => {
  try {
    const documents = documentContextHandler.getAllDocuments();
    const stats = documentContextHandler.getDocumentStats();

    res.json({
      documents: documents.map(doc => ({
        id: doc.id,
        type: doc.type,
        tokens: doc.tokens,
        hasSummary: !!doc.summary,
        metadata: doc.metadata
      })),
      stats
    });
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({ error: "Failed to get documents" });
  }
});

router.get("/documents/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const document = documentContextHandler.getDocument(id);

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json({
      id: document.id,
      type: document.type,
      content: document.content.substring(0, 5000),
      summary: document.summary,
      tokens: document.tokens,
      metadata: document.metadata
    });
  } catch (error) {
    console.error("Get document error:", error);
    res.status(500).json({ error: "Failed to get document" });
  }
});

router.delete("/documents/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const removed = documentContextHandler.removeDocument(id);

    if (!removed) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json({ success: true, message: `Document ${id} removed` });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

router.post("/documents/context", async (req: Request, res: Response) => {
  try {
    const { query, documentIds, maxTokens } = req.body;

    if (!query || !documentIds || !Array.isArray(documentIds)) {
      return res.status(400).json({ error: "Query and documentIds array are required" });
    }

    const ragContext = await documentContextHandler.getRelevantContext(
      query,
      documentIds,
      maxTokens || 4000
    );

    res.json({
      query: ragContext.query,
      documentsUsed: ragContext.documentsUsed,
      totalTokens: ragContext.totalTokens,
      chunks: ragContext.relevantChunks.map(chunk => ({
        id: chunk.id,
        relevanceScore: chunk.relevanceScore,
        preview: chunk.content.substring(0, 200) + "..."
      })),
      formattedContext: documentContextHandler.formatContextForPrompt(ragContext)
    });
  } catch (error) {
    console.error("Document context error:", error);
    res.status(500).json({ error: "Failed to get document context" });
  }
});

router.post("/clarify", async (req: Request, res: Response) => {
  try {
    const { originalRequest, clarifications, previousAnalysis } = req.body;

    if (!originalRequest || !clarifications) {
      return res.status(400).json({ error: "Original request and clarifications are required" });
    }

    const analysis: ClarificationAnalysis = previousAnalysis || {
      needsClarification: true,
      confidence: 0.5,
      ambiguities: [],
      suggestedQuestions: [],
      inferredIntent: "",
      missingCriticalInfo: []
    };

    const refinement = await promptClarificationService.refineWithUserInput(
      originalRequest,
      clarifications,
      analysis
    );

    res.json({
      refinedRequest: refinement.refinedRequest,
      additionalContext: refinement.additionalContext,
      readyToProcess: refinement.readyToProcess,
      remainingQuestions: refinement.remainingQuestions,
      formattedRemaining: promptClarificationService.formatQuestionsForUser(refinement.remainingQuestions)
    });
  } catch (error) {
    console.error("Clarification error:", error);
    res.status(500).json({ error: "Failed to process clarification" });
  }
});

router.get("/config", async (_req: Request, res: Response) => {
  res.json({
    contextEngineering: DEFAULT_CONTEXT_CONFIG,
    promptPatterns: Object.keys(require("../services/enhanced-agent-prompts").PROMPT_ENGINEERING_PATTERNS),
    fewShotCategories: Object.keys(require("../services/enhanced-agent-prompts").FEW_SHOT_EXAMPLES),
    clarificationConfig: require("../services/prompt-clarification-service").DEFAULT_DEEP_RESEARCH_CONFIG,
    documentStats: documentContextHandler.getDocumentStats()
  });
});

router.get("/agents/:vertical/enhanced", async (req: Request, res: Response) => {
  try {
    const { vertical } = req.params;
    const validVerticals: Vertical[] = ["social", "seo", "web", "sales", "whatsapp", "linkedin", "performance"];
    
    if (!validVerticals.includes(vertical as Vertical)) {
      return res.status(400).json({ error: "Invalid vertical" });
    }

    const agents = getAgentsByVertical(vertical as Vertical);

    const enhancedAgents = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      romaLevel: agent.romaLevel,
      capabilities: agent.capabilities,
      tools: agent.tools,
      languages: agent.languages,
      enhancedFeatures: {
        supportsDeepResearch: agent.romaLevel === "L3" || agent.romaLevel === "L4",
        supportsDocumentContext: true,
        supportsClarifyingQuestions: true,
        supportsIterativeRefinement: agent.romaLevel !== "L0",
        chainOfThoughtEnabled: true,
        confidenceScoringEnabled: true
      }
    }));

    res.json({
      vertical,
      totalAgents: enhancedAgents.length,
      agents: enhancedAgents
    });
  } catch (error) {
    console.error("Get enhanced agents error:", error);
    res.status(500).json({ error: "Failed to get enhanced agents" });
  }
});

export default router;
