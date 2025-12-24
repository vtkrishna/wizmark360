import { Router, Request, Response } from "express";
import { multimodalContentOrchestration } from "../services/multimodal-content-orchestration";
import { EnhancedAIService } from "../services/enhanced-ai-service";
import { getAgentsByVertical, Vertical } from "../agents/market360-agent-catalog";

const enhancedAI = new EnhancedAIService();

const router = Router();

router.get("/models", (_req: Request, res: Response) => {
  const models = multimodalContentOrchestration.getAvailableModels();
  res.json({
    success: true,
    ...models
  });
});

router.get("/models/by-modality/:modality", (req: Request, res: Response) => {
  const { modality } = req.params;
  const validModalities = ["text", "voice", "audio", "video", "image", "multimodal"];
  
  if (!validModalities.includes(modality)) {
    return res.status(400).json({
      error: "Invalid modality",
      validOptions: validModalities
    });
  }
  
  const models = multimodalContentOrchestration.getModelsByModality(modality as any);
  res.json({
    success: true,
    modality,
    count: models.length,
    models
  });
});

router.post("/select-best", (req: Request, res: Response) => {
  const { modality, priority } = req.body;
  
  const validModalities = ["text", "voice", "audio", "video", "image", "multimodal"];
  const validPriorities = ["cost", "quality", "speed", "balanced"];
  
  if (!modality || !validModalities.includes(modality)) {
    return res.status(400).json({
      error: "Invalid modality",
      validOptions: validModalities
    });
  }
  
  if (!priority || !validPriorities.includes(priority)) {
    return res.status(400).json({
      error: "Invalid priority",
      validOptions: validPriorities
    });
  }
  
  const selection = multimodalContentOrchestration.selectBestModel(modality, priority);
  
  if (!selection) {
    return res.status(404).json({
      error: "No models available for this modality"
    });
  }
  
  res.json({
    success: true,
    modality,
    priority,
    selectedProvider: selection.provider.name,
    selectedModel: selection.model
  });
});

router.post("/generate", async (req: Request, res: Response) => {
  const {
    purpose,
    modalities,
    prompt,
    brand,
    priority,
    voiceSettings,
    imageSettings,
    audioSettings
  } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: "Missing required field: prompt" });
  }
  
  if (!modalities || !Array.isArray(modalities) || modalities.length === 0) {
    return res.status(400).json({
      error: "Missing or invalid modalities",
      example: ["text", "voice", "image"]
    });
  }
  
  try {
    const result = await multimodalContentOrchestration.generateVibeContent({
      purpose: purpose || "marketing",
      modalities,
      prompt,
      brand,
      priority: priority || "balanced",
      voiceSettings,
      imageSettings,
      audioSettings
    });
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error("Multimodal generation error:", error);
    res.status(500).json({
      error: "Content generation failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/vibecoding", async (req: Request, res: Response) => {
  const { prompt, brand, voiceSettings, includeImage } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: "Missing required field: prompt" });
  }
  
  const modalities: string[] = ["text", "voice"];
  if (includeImage) modalities.push("image");
  
  try {
    const result = await multimodalContentOrchestration.generateVibeContent({
      purpose: "vibecoding",
      modalities: modalities as any[],
      prompt,
      brand,
      priority: "quality",
      voiceSettings: voiceSettings || {
        style: "conversational",
        language: "en"
      }
    });
    
    res.json({
      success: true,
      vibecodingResult: result,
      vibeVoiceUsed: result.outputs.some(o => o.model.includes("VibeVoice"))
    });
  } catch (error) {
    res.status(500).json({
      error: "Vibecoding generation failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get("/vibevoice/capabilities", (_req: Request, res: Response) => {
  const capabilities = multimodalContentOrchestration.getVibeVoiceCapabilities();
  res.json({
    success: true,
    ...capabilities
  });
});

router.get("/summary", (_req: Request, res: Response) => {
  const summary = multimodalContentOrchestration.getMultimodalCapabilitySummary();
  res.json({
    success: true,
    summary
  });
});

router.get("/huggingface/models", (_req: Request, res: Response) => {
  const { providers } = multimodalContentOrchestration.getAvailableModels();
  const huggingFace = providers.find(p => p.name === "HuggingFace");
  
  res.json({
    success: true,
    provider: "HuggingFace",
    models: huggingFace?.models || [],
    capabilities: huggingFace?.capabilities || [],
    aggregatorEnabled: true
  });
});

router.post("/content-pipeline", async (req: Request, res: Response) => {
  const {
    vertical = "social",
    brandId,
    objective,
    contentType,
    targetAudience,
    tone = "professional",
    language = "en",
    includeImage = true,
    includeVideo = false,
    priority = "balanced"
  } = req.body;

  if (!objective) {
    return res.status(400).json({ error: "Missing required field: objective" });
  }

  const pipelineId = `pipeline_${Date.now()}`;
  const startTime = Date.now();

  try {
    const verticalAgents = getAgentsByVertical(vertical as Vertical);
    const strategist = verticalAgents.find(a => a.romaLevel === "L4");
    const contentCreator = verticalAgents.find(a => a.romaLevel === "L2");

    const strategyPrompt = `As a ${vertical} marketing strategist, create a content strategy for:
Objective: ${objective}
Target Audience: ${targetAudience || "general audience"}
Content Type: ${contentType || "social post"}
Tone: ${tone}

Provide a brief strategy with key messaging points, hooks, and call-to-action.`;

    const strategyResult = await enhancedAI.chat([
      { role: "system", content: `You are ${strategist?.name || "Content Strategist"}, an expert ${vertical} marketing strategist.` },
      { role: "user", content: strategyPrompt }
    ], "anthropic");

    const contentPrompt = `Using this strategy: ${strategyResult.content}

Create ${contentType || "social media content"} for:
Objective: ${objective}
Tone: ${tone}
Language: ${language}

Generate the actual content with headlines, body text, and hashtags if applicable.`;

    const contentResult = await enhancedAI.chat([
      { role: "system", content: `You are ${contentCreator?.name || "Content Creator"}, an expert ${vertical} content creator.` },
      { role: "user", content: contentPrompt }
    ], "openai");

    const outputs: any[] = [
      {
        stage: "strategy",
        agent: strategist?.name || "Content Strategist",
        romaLevel: strategist?.romaLevel || "L4",
        content: strategyResult.content,
        model: strategyResult.model
      },
      {
        stage: "content",
        agent: contentCreator?.name || "Content Creator",
        romaLevel: contentCreator?.romaLevel || "L2",
        content: contentResult.content,
        model: contentResult.model
      }
    ];

    if (includeImage) {
      const imagePrompt = `Create a marketing image for: ${objective}. Style: ${tone}, modern, professional.`;
      const imageResult = await multimodalContentOrchestration.generateVibeContent({
        purpose: "marketing",
        modalities: ["image"],
        prompt: imagePrompt,
        brand: brandId,
        priority: priority as any
      });

      outputs.push({
        stage: "visual",
        agent: "Visual Designer Agent",
        romaLevel: "L2",
        content: imageResult.outputs[0]?.content || "Image generation pending",
        model: imageResult.outputs[0]?.model || "FLUX.1",
        estimatedCost: imageResult.totalEstimatedCost
      });
    }

    if (includeVideo) {
      outputs.push({
        stage: "video",
        agent: "Video Producer Agent",
        romaLevel: "L2",
        content: "Video generation available via premium tier",
        model: "Runway Gen-3",
        status: "pending_upgrade"
      });
    }

    res.json({
      success: true,
      pipelineId,
      vertical,
      brandId,
      stages: outputs.length,
      outputs,
      processingTime: Date.now() - startTime,
      metadata: {
        agentsUsed: outputs.map(o => o.agent),
        modelsUsed: outputs.map(o => o.model),
        objective,
        contentType,
        targetAudience
      }
    });
  } catch (error) {
    console.error("Content pipeline error:", error);
    res.status(500).json({
      error: "Content pipeline failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get("/pipeline/verticals", (_req: Request, res: Response) => {
  const verticals = ["social", "seo", "web", "sales", "whatsapp", "linkedin", "performance"];
  
  const verticalInfo = verticals.map(v => {
    const agents = getAgentsByVertical(v as Vertical);
    return {
      id: v,
      name: v.charAt(0).toUpperCase() + v.slice(1),
      agentCount: agents.length,
      strategist: agents.find(a => a.romaLevel === "L4")?.name,
      orchestrator: agents.find(a => a.romaLevel === "L3")?.name,
      contentTypes: getContentTypesForVertical(v)
    };
  });

  res.json({ verticals: verticalInfo });
});

function getContentTypesForVertical(vertical: string): string[] {
  const types: Record<string, string[]> = {
    social: ["Post", "Story", "Reel", "Carousel", "Thread"],
    seo: ["Blog Article", "Landing Page", "Meta Content", "Schema Markup"],
    web: ["Website Copy", "Product Page", "About Page", "FAQ"],
    sales: ["Email Sequence", "Sales Deck", "Proposal", "Case Study"],
    whatsapp: ["Broadcast Message", "Drip Campaign", "Template", "Automation Flow"],
    linkedin: ["Post", "Article", "InMail", "Company Update"],
    performance: ["Ad Copy", "Landing Page", "A/B Variants", "Retargeting Content"]
  };
  return types[vertical] || ["Content"];
}

export default router;
