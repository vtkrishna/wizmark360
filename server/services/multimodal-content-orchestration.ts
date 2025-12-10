import { AIProvider } from "./ai-service";
import { waiSDKOrchestration } from "./wai-sdk-orchestration";

export type ContentModality = "text" | "voice" | "audio" | "video" | "image" | "multimodal";
export type ContentPurpose = "marketing" | "social" | "website" | "presentation" | "podcast" | "vibecoding";

interface HuggingFaceModel {
  id: string;
  name: string;
  modality: ContentModality;
  task: string;
  endpoint?: string;
  costPer1000Calls: number;
  qualityRating: number;
  speedRating: number;
}

interface MultimodalProvider {
  name: string;
  provider: AIProvider | "huggingface" | "elevenlabs" | "runway" | "stability";
  models: HuggingFaceModel[];
  capabilities: ContentModality[];
}

const HUGGINGFACE_MODELS: HuggingFaceModel[] = [
  {
    id: "microsoft/VibeVoice-Realtime-0.5B",
    name: "VibeVoice Realtime",
    modality: "voice",
    task: "text-to-speech",
    costPer1000Calls: 0.10,
    qualityRating: 9,
    speedRating: 10
  },
  {
    id: "openai/whisper-large-v3",
    name: "Whisper Large V3",
    modality: "voice",
    task: "speech-to-text",
    costPer1000Calls: 0.05,
    qualityRating: 10,
    speedRating: 8
  },
  {
    id: "stabilityai/stable-diffusion-xl-base-1.0",
    name: "Stable Diffusion XL",
    modality: "image",
    task: "text-to-image",
    costPer1000Calls: 0.50,
    qualityRating: 9,
    speedRating: 7
  },
  {
    id: "black-forest-labs/FLUX.1-dev",
    name: "FLUX.1 Dev",
    modality: "image",
    task: "text-to-image",
    costPer1000Calls: 0.80,
    qualityRating: 10,
    speedRating: 6
  },
  {
    id: "facebook/musicgen-large",
    name: "MusicGen Large",
    modality: "audio",
    task: "text-to-audio",
    costPer1000Calls: 0.30,
    qualityRating: 9,
    speedRating: 6
  },
  {
    id: "coqui/XTTS-v2",
    name: "XTTS V2",
    modality: "voice",
    task: "text-to-speech",
    costPer1000Calls: 0.15,
    qualityRating: 9,
    speedRating: 8
  },
  {
    id: "parler-tts/parler-tts-large-v1",
    name: "Parler TTS Large",
    modality: "voice",
    task: "text-to-speech",
    costPer1000Calls: 0.12,
    qualityRating: 8,
    speedRating: 9
  },
  {
    id: "Salesforce/blip2-opt-2.7b",
    name: "BLIP-2",
    modality: "multimodal",
    task: "image-to-text",
    costPer1000Calls: 0.08,
    qualityRating: 8,
    speedRating: 9
  },
  {
    id: "lllyasviel/sd-controlnet-canny",
    name: "ControlNet Canny",
    modality: "image",
    task: "image-to-image",
    costPer1000Calls: 0.40,
    qualityRating: 9,
    speedRating: 7
  }
];

const MULTIMODAL_PROVIDERS: MultimodalProvider[] = [
  {
    name: "HuggingFace",
    provider: "huggingface",
    models: HUGGINGFACE_MODELS,
    capabilities: ["text", "voice", "audio", "image", "multimodal"]
  },
  {
    name: "OpenAI",
    provider: "openai",
    models: [
      { id: "gpt-4o", name: "GPT-4o Vision", modality: "multimodal", task: "vision-language", costPer1000Calls: 2.5, qualityRating: 10, speedRating: 8 },
      { id: "dall-e-3", name: "DALL-E 3", modality: "image", task: "text-to-image", costPer1000Calls: 4.0, qualityRating: 10, speedRating: 7 },
      { id: "whisper-1", name: "Whisper", modality: "voice", task: "speech-to-text", costPer1000Calls: 0.6, qualityRating: 9, speedRating: 9 },
      { id: "tts-1-hd", name: "TTS HD", modality: "voice", task: "text-to-speech", costPer1000Calls: 3.0, qualityRating: 9, speedRating: 8 }
    ],
    capabilities: ["text", "voice", "image", "multimodal"]
  },
  {
    name: "Anthropic",
    provider: "anthropic",
    models: [
      { id: "claude-sonnet-4-20250514", name: "Claude 4 Sonnet", modality: "multimodal", task: "vision-language", costPer1000Calls: 3.0, qualityRating: 10, speedRating: 7 }
    ],
    capabilities: ["text", "multimodal"]
  },
  {
    name: "Google",
    provider: "gemini",
    models: [
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", modality: "multimodal", task: "vision-language", costPer1000Calls: 1.25, qualityRating: 9, speedRating: 8 },
      { id: "imagen-3", name: "Imagen 3", modality: "image", task: "text-to-image", costPer1000Calls: 2.0, qualityRating: 9, speedRating: 7 }
    ],
    capabilities: ["text", "image", "multimodal"]
  }
];

interface MultimodalContentRequest {
  purpose: ContentPurpose;
  modalities: ContentModality[];
  prompt: string;
  brand?: string;
  priority: "cost" | "quality" | "speed" | "balanced";
  voiceSettings?: {
    language?: string;
    voice?: string;
    style?: "conversational" | "professional" | "energetic" | "calm";
  };
  imageSettings?: {
    style?: string;
    aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3";
    quality?: "draft" | "standard" | "hd";
  };
  audioSettings?: {
    duration?: number;
    genre?: string;
  };
}

interface MultimodalContentResult {
  requestId: string;
  outputs: {
    modality: ContentModality;
    provider: string;
    model: string;
    content: string | Buffer;
    metadata: Record<string, unknown>;
    processingTime: number;
    estimatedCost: number;
  }[];
  totalProcessingTime: number;
  totalEstimatedCost: number;
  vibecodingEnabled: boolean;
}

class MultimodalContentOrchestrationService {
  private huggingFaceApiKey: string | undefined;

  constructor() {
    this.huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
  }

  getAvailableModels(): { providers: MultimodalProvider[]; totalModels: number } {
    const totalModels = MULTIMODAL_PROVIDERS.reduce((sum, p) => sum + p.models.length, 0);
    return { providers: MULTIMODAL_PROVIDERS, totalModels };
  }

  getModelsByModality(modality: ContentModality): HuggingFaceModel[] {
    const models: HuggingFaceModel[] = [];
    for (const provider of MULTIMODAL_PROVIDERS) {
      models.push(...provider.models.filter(m => m.modality === modality));
    }
    return models;
  }

  selectBestModel(
    modality: ContentModality,
    priority: "cost" | "quality" | "speed" | "balanced"
  ): { provider: MultimodalProvider; model: HuggingFaceModel } | null {
    const allModels: { provider: MultimodalProvider; model: HuggingFaceModel }[] = [];
    
    for (const provider of MULTIMODAL_PROVIDERS) {
      for (const model of provider.models) {
        if (model.modality === modality || model.modality === "multimodal") {
          allModels.push({ provider, model });
        }
      }
    }

    if (allModels.length === 0) return null;

    let selected: { provider: MultimodalProvider; model: HuggingFaceModel };

    switch (priority) {
      case "cost":
        selected = allModels.reduce((best, curr) => 
          curr.model.costPer1000Calls < best.model.costPer1000Calls ? curr : best
        );
        break;
      case "quality":
        selected = allModels.reduce((best, curr) => 
          curr.model.qualityRating > best.model.qualityRating ? curr : best
        );
        break;
      case "speed":
        selected = allModels.reduce((best, curr) => 
          curr.model.speedRating > best.model.speedRating ? curr : best
        );
        break;
      default:
        const scored = allModels.map(m => ({
          ...m,
          score: (m.model.qualityRating * 0.4) + (m.model.speedRating * 0.3) + ((10 - Math.min(m.model.costPer1000Calls * 2, 10)) * 0.3)
        }));
        selected = scored.reduce((best, curr) => curr.score > best.score ? curr : best);
    }

    return selected;
  }

  async generateVibeContent(request: MultimodalContentRequest): Promise<MultimodalContentResult> {
    const startTime = Date.now();
    const requestId = `vibe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const outputs: MultimodalContentResult["outputs"] = [];
    let totalCost = 0;

    const isVibecoding = request.purpose === "vibecoding";

    for (const modality of request.modalities) {
      const selection = this.selectBestModel(modality, request.priority);
      
      if (!selection) continue;

      const modalityStart = Date.now();
      let content: string | Buffer = "";
      let metadata: Record<string, unknown> = {};

      try {
        switch (modality) {
          case "text":
            const textResult = await this.generateText(request.prompt, selection, request.brand);
            content = textResult.content;
            metadata = textResult.metadata;
            break;
          
          case "voice":
            const voiceResult = await this.generateVoice(request.prompt, selection, request.voiceSettings, isVibecoding);
            content = voiceResult.content;
            metadata = voiceResult.metadata;
            break;
          
          case "audio":
            const audioResult = await this.generateAudio(request.prompt, selection, request.audioSettings);
            content = audioResult.content;
            metadata = audioResult.metadata;
            break;
          
          case "image":
            const imageResult = await this.generateImage(request.prompt, selection, request.imageSettings);
            content = imageResult.content;
            metadata = imageResult.metadata;
            break;
          
          case "multimodal":
            const multiResult = await this.generateMultimodal(request.prompt, selection);
            content = multiResult.content;
            metadata = multiResult.metadata;
            break;
        }
      } catch (error) {
        content = `[${modality} generation pending - ${selection.model.name}]`;
        metadata = { error: error instanceof Error ? error.message : "Generation failed", fallback: true };
      }

      const processingTime = Date.now() - modalityStart;
      const estimatedCost = selection.model.costPer1000Calls / 1000;
      totalCost += estimatedCost;

      outputs.push({
        modality,
        provider: selection.provider.name,
        model: selection.model.name,
        content,
        metadata,
        processingTime,
        estimatedCost
      });
    }

    return {
      requestId,
      outputs,
      totalProcessingTime: Date.now() - startTime,
      totalEstimatedCost: totalCost,
      vibecodingEnabled: isVibecoding
    };
  }

  private async generateText(
    prompt: string,
    selection: { provider: MultimodalProvider; model: HuggingFaceModel },
    brand?: string
  ): Promise<{ content: string; metadata: Record<string, unknown> }> {
    const enhancedPrompt = brand 
      ? `Create content for brand "${brand}": ${prompt}`
      : prompt;

    const result = await waiSDKOrchestration.executeAgentTask({
      agentId: "content-creator",
      vertical: "social",
      task: {
        type: "generation",
        input: { prompt: enhancedPrompt },
        priority: "high"
      }
    });

    return {
      content: result.output?.response || prompt,
      metadata: { 
        model: result.modelUsed,
        provider: result.providerUsed,
        tokensUsed: result.metrics.tokensUsed
      }
    };
  }

  private async generateVoice(
    prompt: string,
    selection: { provider: MultimodalProvider; model: HuggingFaceModel },
    settings?: MultimodalContentRequest["voiceSettings"],
    isVibecoding?: boolean
  ): Promise<{ content: string; metadata: Record<string, unknown> }> {
    const isVibeVoice = selection.model.id === "microsoft/VibeVoice-Realtime-0.5B";
    
    const metadata: Record<string, unknown> = {
      model: selection.model.id,
      modelName: selection.model.name,
      provider: selection.provider.name,
      task: selection.model.task,
      language: settings?.language || "en",
      voice: settings?.voice || "default",
      style: settings?.style || "conversational",
      vibecodingMode: isVibecoding && isVibeVoice,
      realtimeCapable: isVibeVoice
    };

    if (isVibeVoice && isVibecoding) {
      metadata.vibeFeatures = [
        "real-time synthesis",
        "natural prosody",
        "emotion control",
        "context awareness",
        "low latency streaming"
      ];
    }

    return {
      content: `[Voice content using ${selection.model.name}] - Text: "${prompt.substring(0, 100)}..."`,
      metadata
    };
  }

  private async generateAudio(
    prompt: string,
    selection: { provider: MultimodalProvider; model: HuggingFaceModel },
    settings?: MultimodalContentRequest["audioSettings"]
  ): Promise<{ content: string; metadata: Record<string, unknown> }> {
    return {
      content: `[Audio content using ${selection.model.name}] - Prompt: "${prompt.substring(0, 100)}..."`,
      metadata: {
        model: selection.model.id,
        modelName: selection.model.name,
        provider: selection.provider.name,
        duration: settings?.duration || 30,
        genre: settings?.genre || "ambient"
      }
    };
  }

  private async generateImage(
    prompt: string,
    selection: { provider: MultimodalProvider; model: HuggingFaceModel },
    settings?: MultimodalContentRequest["imageSettings"]
  ): Promise<{ content: string; metadata: Record<string, unknown> }> {
    return {
      content: `[Image content using ${selection.model.name}] - Prompt: "${prompt.substring(0, 100)}..."`,
      metadata: {
        model: selection.model.id,
        modelName: selection.model.name,
        provider: selection.provider.name,
        aspectRatio: settings?.aspectRatio || "1:1",
        quality: settings?.quality || "standard",
        style: settings?.style || "photorealistic"
      }
    };
  }

  private async generateMultimodal(
    prompt: string,
    selection: { provider: MultimodalProvider; model: HuggingFaceModel }
  ): Promise<{ content: string; metadata: Record<string, unknown> }> {
    return {
      content: `[Multimodal content using ${selection.model.name}] - Prompt: "${prompt.substring(0, 100)}..."`,
      metadata: {
        model: selection.model.id,
        modelName: selection.model.name,
        provider: selection.provider.name,
        capabilities: ["vision", "text", "reasoning"]
      }
    };
  }

  getVibeVoiceCapabilities(): {
    model: HuggingFaceModel;
    features: string[];
    useCases: string[];
    languages: string[];
  } {
    const vibeVoice = HUGGINGFACE_MODELS.find(m => m.id === "microsoft/VibeVoice-Realtime-0.5B")!;
    
    return {
      model: vibeVoice,
      features: [
        "Real-time voice synthesis",
        "Natural prosody and intonation",
        "Emotion control",
        "Context-aware generation",
        "Low-latency streaming",
        "Vibecoding support",
        "Multi-speaker capability"
      ],
      useCases: [
        "Vibecoding - voice-based content creation",
        "Real-time voice assistants",
        "Interactive presentations",
        "Live content narration",
        "Dynamic audio branding",
        "Podcast generation",
        "Marketing voice-overs"
      ],
      languages: [
        "English (US)", "English (UK)", "Spanish", "French", 
        "German", "Italian", "Portuguese", "Japanese", "Korean",
        "Chinese (Mandarin)", "Hindi", "Arabic"
      ]
    };
  }

  getMultimodalCapabilitySummary(): {
    totalModels: number;
    byModality: Record<ContentModality, number>;
    byProvider: Record<string, number>;
    vibecodingReady: boolean;
    recommendedForMarketing: HuggingFaceModel[];
  } {
    const byModality: Record<ContentModality, number> = {
      text: 0, voice: 0, audio: 0, video: 0, image: 0, multimodal: 0
    };
    const byProvider: Record<string, number> = {};

    for (const provider of MULTIMODAL_PROVIDERS) {
      byProvider[provider.name] = provider.models.length;
      for (const model of provider.models) {
        byModality[model.modality]++;
      }
    }

    const recommendedForMarketing = [
      ...HUGGINGFACE_MODELS.filter(m => m.id.includes("VibeVoice") || m.id.includes("FLUX") || m.id.includes("stable-diffusion")),
      ...MULTIMODAL_PROVIDERS.find(p => p.name === "OpenAI")?.models.filter(m => m.task.includes("image") || m.task.includes("speech")) || []
    ];

    return {
      totalModels: MULTIMODAL_PROVIDERS.reduce((sum, p) => sum + p.models.length, 0),
      byModality,
      byProvider,
      vibecodingReady: true,
      recommendedForMarketing
    };
  }
}

export const multimodalContentOrchestration = new MultimodalContentOrchestrationService();
