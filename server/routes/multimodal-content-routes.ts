import { Router, Request, Response } from "express";
import { multimodalContentOrchestration } from "../services/multimodal-content-orchestration";

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

export default router;
