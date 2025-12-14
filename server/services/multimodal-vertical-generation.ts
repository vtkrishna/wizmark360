import { db } from "../db";
import { contentItems } from "@shared/schema";
import { contentIntentAnalyzer, ContentIntent, ContentModality, Vertical } from "./content-intent-analyzer";
import { waiSDKOrchestration } from "./wai-sdk-orchestration";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";

export interface MultimodalGenerationRequest {
  prompt: string;
  vertical: Vertical;
  brandId: number;
  brandName?: string;
  saveToLibrary?: boolean;
  overrideModality?: ContentModality;
}

export interface GeneratedAsset {
  id: string;
  type: ContentModality;
  url?: string;
  content?: string;
  fileName?: string;
  mimeType?: string;
  metadata: Record<string, any>;
}

export interface MultimodalGenerationResult {
  success: boolean;
  intent: ContentIntent;
  assets: GeneratedAsset[];
  savedToLibrary: boolean;
  libraryItemIds: string[];
  textResponse?: string;
  error?: string;
}

const VERTICAL_IMAGE_PROMPTS: Record<Vertical, (details: ContentIntent) => string> = {
  social: (intent) => `Professional social media ${intent.extractedDetails.subject || 'marketing'} image, ${intent.tone} style, vibrant colors, engaging visual for ${intent.platform || 'Instagram'}, high quality, ${intent.extractedDetails.style || 'modern'} aesthetic`,
  seo: (intent) => `Professional infographic or visual content for ${intent.extractedDetails.subject || 'SEO content'}, data visualization, clean design, informative, ${intent.extractedDetails.style || 'corporate'} style`,
  web: (intent) => `High-quality web design element, ${intent.extractedDetails.subject || 'hero section'}, modern UI/UX, clean aesthetic, professional, ${intent.extractedDetails.style || 'minimalist'} design`,
  sales: (intent) => `Professional sales presentation visual, ${intent.extractedDetails.subject || 'business concept'}, corporate style, trust-building imagery, ${intent.extractedDetails.style || 'executive'} look`,
  whatsapp: (intent) => `Mobile-optimized image for WhatsApp marketing, ${intent.extractedDetails.subject || 'product showcase'}, clear and simple, easy to view on mobile, ${intent.tone} tone`,
  linkedin: (intent) => `Professional LinkedIn content image, ${intent.extractedDetails.subject || 'thought leadership'}, corporate aesthetic, business professional, ${intent.extractedDetails.style || 'sophisticated'} design`,
  performance: (intent) => `High-converting ad creative, ${intent.extractedDetails.subject || 'product advertisement'}, eye-catching, clear call-to-action visual space, ${intent.extractedDetails.style || 'bold'} colors`,
  general: (intent) => `Professional marketing image, ${intent.extractedDetails.subject || 'brand content'}, high quality, ${intent.extractedDetails.style || 'modern'} style`
};

const VERTICAL_VIDEO_PROMPTS: Record<Vertical, (details: ContentIntent) => string> = {
  social: (intent) => `Cinematic social media video, ${intent.extractedDetails.subject || 'trending content'}, dynamic motion, engaging transitions, perfect for ${intent.platform || 'Instagram Reels'}`,
  seo: (intent) => `Professional explainer video, ${intent.extractedDetails.subject || 'educational content'}, clear narration style, informative visuals`,
  web: (intent) => `Product demo video, ${intent.extractedDetails.subject || 'website feature'}, smooth animations, professional quality, modern web aesthetic`,
  sales: (intent) => `Sales pitch video, ${intent.extractedDetails.subject || 'product benefits'}, persuasive visuals, corporate quality, trust-building imagery`,
  whatsapp: (intent) => `Short mobile video for WhatsApp, ${intent.extractedDetails.subject || 'quick update'}, vertical format, clear message, engaging`,
  linkedin: (intent) => `Professional LinkedIn video, ${intent.extractedDetails.subject || 'thought leadership'}, executive quality, B2B focused, corporate aesthetic`,
  performance: (intent) => `High-converting video ad, ${intent.extractedDetails.subject || 'product showcase'}, attention-grabbing opening, clear CTA, dynamic`,
  general: (intent) => `Professional marketing video, ${intent.extractedDetails.subject || 'brand story'}, high quality production, engaging narrative`
};

class MultimodalVerticalGeneration {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private gemini: GoogleGenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  }

  async generateContent(request: MultimodalGenerationRequest): Promise<MultimodalGenerationResult> {
    const { prompt, vertical, brandId, brandName, saveToLibrary = true, overrideModality } = request;

    const intent = await contentIntentAnalyzer.analyzeIntent(prompt, vertical);
    
    if (overrideModality) {
      intent.primaryModality = overrideModality;
    }

    const assets: GeneratedAsset[] = [];
    const libraryItemIds: string[] = [];
    let textResponse: string | undefined;

    try {
      switch (intent.primaryModality) {
        case "image":
          const imageAsset = await this.generateImage(prompt, vertical, intent);
          if (imageAsset) {
            assets.push(imageAsset);
            textResponse = `I've created a ${intent.contentType} for your ${vertical} campaign. The image has been generated with a ${intent.tone} style${intent.platform ? ` optimized for ${intent.platform}` : ''}.`;
          }
          break;

        case "video":
          const videoAsset = await this.generateVideo(prompt, vertical, intent);
          if (videoAsset) {
            assets.push(videoAsset);
            textResponse = `I've created a ${intent.contentType} video for your ${vertical} campaign. Duration: ${intent.duration || 6} seconds${intent.platform ? `, optimized for ${intent.platform}` : ''}.`;
          }
          break;

        case "voice":
        case "audio":
          const audioAsset = await this.generateAudio(prompt, vertical, intent);
          if (audioAsset) {
            assets.push(audioAsset);
            textResponse = `I've generated ${intent.contentType} audio content in ${intent.language}. The audio has a ${intent.tone} tone suitable for ${vertical} marketing.`;
          }
          break;

        case "music":
          const musicAsset = await this.generateMusic(prompt, vertical, intent);
          if (musicAsset) {
            assets.push(musicAsset);
            textResponse = `I've created ${intent.contentType} for your ${vertical} campaign. This music can be used as background for your marketing content.`;
          }
          break;

        case "text":
        default:
          const textAsset = await this.generateText(prompt, vertical, intent);
          if (textAsset) {
            assets.push(textAsset);
            textResponse = textAsset.content;
          }
          break;
      }

      for (const secondary of intent.secondaryModalities) {
        try {
          let secondaryAsset: GeneratedAsset | null = null;
          switch (secondary) {
            case "image":
              secondaryAsset = await this.generateImage(prompt, vertical, intent);
              break;
            case "audio":
            case "voice":
              secondaryAsset = await this.generateAudio(prompt, vertical, intent, secondary);
              break;
          }
          if (secondaryAsset) {
            assets.push(secondaryAsset);
          }
        } catch (e) {
          console.log(`Secondary modality ${secondary} generation failed:`, e);
        }
      }

      if (saveToLibrary && assets.length > 0) {
        for (const asset of assets) {
          const itemId = await this.saveToContentLibrary(asset, intent, brandId, brandName, vertical);
          if (itemId) {
            libraryItemIds.push(itemId);
          }
        }
      }

      return {
        success: true,
        intent,
        assets,
        savedToLibrary: libraryItemIds.length > 0,
        libraryItemIds,
        textResponse
      };

    } catch (error) {
      console.error("Multimodal generation error:", error);
      return {
        success: false,
        intent,
        assets,
        savedToLibrary: false,
        libraryItemIds: [],
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  private async generateImage(prompt: string, vertical: Vertical, intent: ContentIntent): Promise<GeneratedAsset | null> {
    if (!this.openai) {
      console.log("OpenAI not available for image generation");
      return null;
    }

    try {
      const enhancedPrompt = VERTICAL_IMAGE_PROMPTS[vertical](intent);
      const fullPrompt = `${enhancedPrompt}. User request: ${prompt}`;

      const aspectRatioMap: Record<string, "1024x1024" | "1792x1024" | "1024x1792"> = {
        "1:1": "1024x1024",
        "16:9": "1792x1024",
        "9:16": "1024x1792",
        "4:3": "1024x1024",
        "3:4": "1024x1024"
      };

      const size = aspectRatioMap[intent.aspectRatio || "1:1"] || "1024x1024";

      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: fullPrompt,
        n: 1,
        size,
        quality: "standard"
      });

      const imageUrl = response.data[0]?.url;
      if (!imageUrl) return null;

      const fileName = `${vertical}_image_${Date.now()}.png`;

      return {
        id: uuidv4(),
        type: "image",
        url: imageUrl,
        fileName,
        mimeType: "image/png",
        metadata: {
          prompt: fullPrompt,
          size,
          model: "dall-e-3",
          vertical,
          platform: intent.platform,
          aspectRatio: intent.aspectRatio
        }
      };
    } catch (error) {
      console.error("Image generation error:", error);
      return null;
    }
  }

  private async generateVideo(prompt: string, vertical: Vertical, intent: ContentIntent): Promise<GeneratedAsset | null> {
    const enhancedPrompt = VERTICAL_VIDEO_PROMPTS[vertical](intent);
    const fullPrompt = `${enhancedPrompt}. User request: ${prompt}`;

    const aspectRatio = intent.aspectRatio === "9:16" ? "9:16" : "16:9";
    const duration = intent.duration || 6;

    return {
      id: uuidv4(),
      type: "video",
      content: `Video generation queued: ${fullPrompt}`,
      metadata: {
        prompt: fullPrompt,
        aspectRatio,
        duration,
        status: "pending",
        vertical,
        platform: intent.platform,
        note: "Video generation requires dedicated video API (Veo/Runway/Pika)"
      }
    };
  }

  private async generateAudio(prompt: string, vertical: Vertical, intent: ContentIntent, requestedModality?: "audio" | "voice"): Promise<GeneratedAsset | null> {
    if (!this.openai) {
      return null;
    }

    try {
      const textToSpeak = intent.extractedDetails.subject || prompt.slice(0, 200);

      const response = await this.openai.audio.speech.create({
        model: "tts-1",
        voice: intent.tone === "professional" ? "onyx" : intent.tone === "casual" ? "nova" : "alloy",
        input: textToSpeak
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      const assetType = requestedModality || (intent.primaryModality === "voice" ? "voice" : "audio");
      const fileName = `${vertical}_${assetType}_${Date.now()}.mp3`;
      const filePath = `attached_assets/generated_audio/${fileName}`;

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, buffer);

      return {
        id: uuidv4(),
        type: assetType,
        url: `/${filePath}`,
        fileName,
        mimeType: "audio/mpeg",
        metadata: {
          text: textToSpeak,
          voice: intent.tone === "professional" ? "onyx" : "nova",
          language: intent.language,
          vertical,
          isVoice: assetType === "voice"
        }
      };
    } catch (error) {
      console.error("Audio generation error:", error);
      return null;
    }
  }

  private async generateMusic(prompt: string, vertical: Vertical, intent: ContentIntent): Promise<GeneratedAsset | null> {
    return {
      id: uuidv4(),
      type: "music",
      content: `Music generation queued for: ${prompt}`,
      metadata: {
        prompt,
        vertical,
        status: "pending",
        note: "Music generation requires MusicGen or Suno API"
      }
    };
  }

  private async generateText(prompt: string, vertical: Vertical, intent: ContentIntent): Promise<GeneratedAsset | null> {
    const systemPrompt = this.getVerticalSystemPrompt(vertical, intent);

    try {
      if (this.anthropic) {
        const response = await this.anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [
            { role: "user", content: prompt }
          ],
          system: systemPrompt
        });

        const content = response.content[0];
        if (content.type === "text") {
          return {
            id: uuidv4(),
            type: "text",
            content: content.text,
            metadata: {
              model: "claude-sonnet-4-20250514",
              vertical,
              contentType: intent.contentType,
              language: intent.language,
              tone: intent.tone
            }
          };
        }
      } else if (this.openai) {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          max_tokens: 2000
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          return {
            id: uuidv4(),
            type: "text",
            content,
            metadata: {
              model: "gpt-4o",
              vertical,
              contentType: intent.contentType,
              language: intent.language,
              tone: intent.tone
            }
          };
        }
      }
    } catch (error) {
      console.error("Text generation error:", error);
    }

    return null;
  }

  private getVerticalSystemPrompt(vertical: Vertical, intent: ContentIntent): string {
    const prompts: Record<Vertical, string> = {
      social: `You are a social media content expert. Create engaging ${intent.contentType} content in ${intent.language} with a ${intent.tone} tone. Focus on viral potential and engagement.`,
      seo: `You are an SEO content specialist. Create optimized ${intent.contentType} content in ${intent.language}. Focus on keyword integration and search visibility.`,
      web: `You are a web content strategist. Create compelling ${intent.contentType} copy in ${intent.language}. Focus on conversion and user experience.`,
      sales: `You are a B2B sales copywriter. Create persuasive ${intent.contentType} content in ${intent.language}. Focus on value propositions and trust building.`,
      whatsapp: `You are a conversational marketing expert. Create engaging ${intent.contentType} messages in ${intent.language}. Keep messages concise and mobile-friendly.`,
      linkedin: `You are a LinkedIn thought leadership expert. Create professional ${intent.contentType} content in ${intent.language}. Focus on insights and professional value.`,
      performance: `You are a performance advertising specialist. Create high-converting ${intent.contentType} copy in ${intent.language}. Focus on CTAs and conversion optimization.`,
      general: `You are a marketing content expert. Create professional ${intent.contentType} content in ${intent.language} with a ${intent.tone} tone.`
    };
    
    return prompts[vertical];
  }

  private async saveToContentLibrary(
    asset: GeneratedAsset,
    intent: ContentIntent,
    brandId: number,
    brandName?: string,
    vertical?: Vertical
  ): Promise<string | null> {
    try {
      const contentName = `${vertical || 'general'}_${asset.type}_${new Date().toISOString().split('T')[0]}`;
      
      const [inserted] = await db.insert(contentItems).values({
        name: contentName,
        type: asset.type,
        content: asset.content || null,
        url: asset.url || null,
        status: "published",
        author: brandName || "AI Generated",
        language: intent.language,
        tags: [vertical, intent.contentType, intent.platform].filter(Boolean),
        metadata: {
          ...asset.metadata,
          brandId,
          generatedAt: new Date().toISOString(),
          intent: {
            modality: intent.primaryModality,
            contentType: intent.contentType,
            platform: intent.platform,
            tone: intent.tone
          }
        }
      }).returning({ id: contentItems.id });

      return inserted?.id || null;
    } catch (error) {
      console.error("Error saving to content library:", error);
      return null;
    }
  }

  async getGeneratedAssets(brandId: number, type?: string, limit = 20): Promise<any[]> {
    try {
      const query = db.select().from(contentItems);
      
      return await query.limit(limit);
    } catch (error) {
      console.error("Error fetching generated assets:", error);
      return [];
    }
  }
}

export const multimodalVerticalGeneration = new MultimodalVerticalGeneration();
