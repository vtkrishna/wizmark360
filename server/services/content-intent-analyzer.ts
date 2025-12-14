import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { waiSDKOrchestration } from "./wai-sdk-orchestration";

export type ContentModality = "text" | "image" | "video" | "audio" | "music" | "voice";
export type Vertical = "social" | "seo" | "web" | "sales" | "whatsapp" | "linkedin" | "performance" | "general";

export interface ContentIntent {
  primaryModality: ContentModality;
  secondaryModalities: ContentModality[];
  contentType: string;
  platform?: string;
  language: string;
  tone: string;
  aspectRatio?: string;
  duration?: number;
  confidence: number;
  extractedDetails: {
    subject?: string;
    style?: string;
    color_scheme?: string;
    target_audience?: string;
    call_to_action?: string;
  };
}

const IMAGE_KEYWORDS = [
  "image", "picture", "photo", "visual", "graphic", "banner", "poster", "thumbnail",
  "infographic", "illustration", "design", "logo", "icon", "cover", "hero image",
  "product shot", "mockup", "carousel", "creative", "ad creative", "display ad",
  "social media image", "instagram post", "facebook post", "linkedin banner"
];

const VIDEO_KEYWORDS = [
  "video", "reel", "short", "clip", "motion", "animation", "explainer",
  "promo video", "product video", "testimonial video", "demo video", "tutorial",
  "youtube", "tiktok", "instagram reel", "story video", "animated"
];

const AUDIO_KEYWORDS = [
  "audio", "podcast", "recording", "sound", "announcement", "audio ad",
  "audio clip", "sound effect", "audio content", "audio file"
];

const VOICE_KEYWORDS = [
  "voice", "voiceover", "narration", "speech", "ivr", "voice message",
  "voice note", "spoken", "talk", "speak", "voice recording", "voice assistant"
];

const MUSIC_KEYWORDS = [
  "music", "jingle", "background music", "soundtrack", "tune", "melody",
  "brand music", "intro music", "outro music", "beat"
];

const PLATFORM_HINTS: Record<string, { aspectRatio: string; format: string }> = {
  instagram: { aspectRatio: "1:1", format: "square" },
  "instagram story": { aspectRatio: "9:16", format: "vertical" },
  "instagram reel": { aspectRatio: "9:16", format: "vertical" },
  facebook: { aspectRatio: "16:9", format: "landscape" },
  linkedin: { aspectRatio: "1:1", format: "square" },
  twitter: { aspectRatio: "16:9", format: "landscape" },
  youtube: { aspectRatio: "16:9", format: "landscape" },
  "youtube short": { aspectRatio: "9:16", format: "vertical" },
  tiktok: { aspectRatio: "9:16", format: "vertical" },
  whatsapp: { aspectRatio: "1:1", format: "square" },
  pinterest: { aspectRatio: "3:4", format: "vertical" },
  website: { aspectRatio: "16:9", format: "landscape" },
  email: { aspectRatio: "16:9", format: "landscape" }
};

class ContentIntentAnalyzer {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
  }

  async analyzeIntent(prompt: string, vertical: Vertical): Promise<ContentIntent> {
    const lowerPrompt = prompt.toLowerCase();
    
    const quickAnalysis = this.quickKeywordAnalysis(lowerPrompt, vertical);
    
    if (quickAnalysis.confidence >= 0.85) {
      return quickAnalysis;
    }
    
    try {
      const aiAnalysis = await this.aiPoweredAnalysis(prompt, vertical);
      return this.mergeAnalysis(quickAnalysis, aiAnalysis);
    } catch (error) {
      console.log("AI analysis fallback to keyword analysis:", error);
      return quickAnalysis;
    }
  }

  private quickKeywordAnalysis(prompt: string, vertical: Vertical): ContentIntent {
    let primaryModality: ContentModality = "text";
    let confidence = 0.6;
    const secondaryModalities: ContentModality[] = [];
    
    const hasImageKeyword = IMAGE_KEYWORDS.some(kw => prompt.includes(kw));
    const hasVideoKeyword = VIDEO_KEYWORDS.some(kw => prompt.includes(kw));
    const hasAudioKeyword = AUDIO_KEYWORDS.some(kw => prompt.includes(kw));
    const hasVoiceKeyword = VOICE_KEYWORDS.some(kw => prompt.includes(kw));
    const hasMusicKeyword = MUSIC_KEYWORDS.some(kw => prompt.includes(kw));
    
    if (hasVideoKeyword) {
      primaryModality = "video";
      confidence = 0.9;
      if (hasVoiceKeyword) secondaryModalities.push("voice");
      else if (hasAudioKeyword) secondaryModalities.push("audio");
      if (hasMusicKeyword) secondaryModalities.push("music");
    } else if (hasImageKeyword) {
      primaryModality = "image";
      confidence = 0.9;
    } else if (hasMusicKeyword) {
      primaryModality = "music";
      confidence = 0.85;
    } else if (hasVoiceKeyword) {
      primaryModality = "voice";
      confidence = 0.85;
    } else if (hasAudioKeyword) {
      primaryModality = "audio";
      confidence = 0.85;
    }
    
    let platform: string | undefined;
    let aspectRatio = "1:1";
    
    for (const [plat, hints] of Object.entries(PLATFORM_HINTS)) {
      if (prompt.includes(plat)) {
        platform = plat;
        aspectRatio = hints.aspectRatio;
        break;
      }
    }
    
    const contentType = this.inferContentType(prompt, vertical, primaryModality);
    const tone = this.inferTone(prompt);
    const language = this.inferLanguage(prompt);
    
    return {
      primaryModality,
      secondaryModalities,
      contentType,
      platform,
      language,
      tone,
      aspectRatio,
      confidence,
      extractedDetails: this.extractDetails(prompt, primaryModality)
    };
  }

  private async aiPoweredAnalysis(prompt: string, vertical: Vertical): Promise<ContentIntent | null> {
    const analysisPrompt = `Analyze this content creation request and extract structured information.

Request: "${prompt}"
Vertical: ${vertical}

Respond with JSON only:
{
  "primaryModality": "text" | "image" | "video" | "audio" | "music" | "voice",
  "secondaryModalities": [],
  "contentType": "specific content type",
  "platform": "target platform if mentioned",
  "language": "English or detected language",
  "tone": "professional/casual/creative/formal/playful",
  "aspectRatio": "1:1" | "16:9" | "9:16" | "4:3" | "3:4",
  "confidence": 0.0-1.0,
  "extractedDetails": {
    "subject": "main subject/topic",
    "style": "visual or content style",
    "color_scheme": "if mentioned",
    "target_audience": "if identifiable",
    "call_to_action": "if present"
  }
}`;

    try {
      if (this.openai) {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: analysisPrompt }],
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 500
        });
        
        const content = response.choices[0]?.message?.content;
        if (content) {
          return JSON.parse(content) as ContentIntent;
        }
      }
    } catch (error) {
      console.log("OpenAI analysis failed, trying fallback");
    }

    return null;
  }

  private mergeAnalysis(quick: ContentIntent, ai: ContentIntent | null): ContentIntent {
    if (!ai) return quick;
    
    return {
      primaryModality: ai.confidence > quick.confidence ? ai.primaryModality : quick.primaryModality,
      secondaryModalities: [...new Set([...quick.secondaryModalities, ...ai.secondaryModalities])],
      contentType: ai.contentType || quick.contentType,
      platform: ai.platform || quick.platform,
      language: ai.language || quick.language,
      tone: ai.tone || quick.tone,
      aspectRatio: ai.aspectRatio || quick.aspectRatio,
      duration: ai.duration,
      confidence: Math.max(quick.confidence, ai.confidence),
      extractedDetails: { ...quick.extractedDetails, ...ai.extractedDetails }
    };
  }

  private inferContentType(prompt: string, vertical: Vertical, modality: ContentModality): string {
    const verticalContentTypes: Record<Vertical, Record<ContentModality, string>> = {
      social: {
        text: "social_post",
        image: "social_creative",
        video: "social_reel",
        audio: "social_audio",
        music: "background_music",
        voice: "voiceover"
      },
      seo: {
        text: "seo_content",
        image: "infographic",
        video: "explainer_video",
        audio: "podcast",
        music: "intro_music",
        voice: "narration"
      },
      web: {
        text: "web_copy",
        image: "hero_banner",
        video: "product_demo",
        audio: "audio_guide",
        music: "website_music",
        voice: "accessibility_audio"
      },
      sales: {
        text: "sales_email",
        image: "sales_deck_visual",
        video: "sales_pitch",
        audio: "sales_call",
        music: "presentation_music",
        voice: "sales_voicemail"
      },
      whatsapp: {
        text: "whatsapp_message",
        image: "whatsapp_image",
        video: "whatsapp_video",
        audio: "whatsapp_audio",
        music: "notification_sound",
        voice: "voice_message"
      },
      linkedin: {
        text: "linkedin_article",
        image: "linkedin_banner",
        video: "linkedin_video",
        audio: "linkedin_audio",
        music: "professional_intro",
        voice: "thought_leadership"
      },
      performance: {
        text: "ad_copy",
        image: "ad_creative",
        video: "video_ad",
        audio: "audio_ad",
        music: "ad_jingle",
        voice: "ad_voiceover"
      },
      general: {
        text: "general_content",
        image: "general_image",
        video: "general_video",
        audio: "general_audio",
        music: "general_music",
        voice: "general_voice"
      }
    };

    return verticalContentTypes[vertical]?.[modality] || "content";
  }

  private inferTone(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes("professional") || lowerPrompt.includes("corporate")) return "professional";
    if (lowerPrompt.includes("casual") || lowerPrompt.includes("friendly")) return "casual";
    if (lowerPrompt.includes("creative") || lowerPrompt.includes("artistic")) return "creative";
    if (lowerPrompt.includes("formal") || lowerPrompt.includes("official")) return "formal";
    if (lowerPrompt.includes("playful") || lowerPrompt.includes("fun")) return "playful";
    if (lowerPrompt.includes("serious") || lowerPrompt.includes("urgent")) return "serious";
    
    return "professional";
  }

  private inferLanguage(prompt: string): string {
    const hindiPattern = /[\u0900-\u097F]/;
    const tamilPattern = /[\u0B80-\u0BFF]/;
    const teluguPattern = /[\u0C00-\u0C7F]/;
    const bengaliPattern = /[\u0980-\u09FF]/;
    
    if (hindiPattern.test(prompt)) return "Hindi";
    if (tamilPattern.test(prompt)) return "Tamil";
    if (teluguPattern.test(prompt)) return "Telugu";
    if (bengaliPattern.test(prompt)) return "Bengali";
    
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes("in hindi") || lowerPrompt.includes("hindi में")) return "Hindi";
    if (lowerPrompt.includes("in tamil")) return "Tamil";
    if (lowerPrompt.includes("in telugu")) return "Telugu";
    if (lowerPrompt.includes("in marathi")) return "Marathi";
    if (lowerPrompt.includes("in gujarati")) return "Gujarati";
    if (lowerPrompt.includes("in kannada")) return "Kannada";
    if (lowerPrompt.includes("in malayalam")) return "Malayalam";
    if (lowerPrompt.includes("in punjabi")) return "Punjabi";
    if (lowerPrompt.includes("in bengali")) return "Bengali";
    
    return "English";
  }

  private extractDetails(prompt: string, modality: ContentModality): ContentIntent["extractedDetails"] {
    const details: ContentIntent["extractedDetails"] = {};
    
    const forMatch = prompt.match(/(?:for|about|featuring|showing)\s+([^,.]+)/i);
    if (forMatch) {
      details.subject = forMatch[1].trim();
    }
    
    const stylePatterns = [
      /(\w+)\s+style/i,
      /in\s+a\s+(\w+)\s+(?:way|manner|format)/i,
      /(?:minimalist|modern|vintage|retro|corporate|elegant|bold|vibrant)/i
    ];
    
    for (const pattern of stylePatterns) {
      const match = prompt.match(pattern);
      if (match) {
        details.style = match[1] || match[0];
        break;
      }
    }
    
    const colorMatch = prompt.match(/(?:in\s+)?(?:colors?|colour?s?)\s*(?:of|like|:)?\s*([^,.]+)/i);
    if (colorMatch) {
      details.color_scheme = colorMatch[1].trim();
    }
    
    const audienceMatch = prompt.match(/(?:for|targeting|aimed at)\s+([\w\s]+?)(?:\s+audience|\s+users|\s+customers|,|\.)/i);
    if (audienceMatch) {
      details.target_audience = audienceMatch[1].trim();
    }
    
    return details;
  }

  isMultimodalRequest(prompt: string): boolean {
    const lowerPrompt = prompt.toLowerCase();
    return IMAGE_KEYWORDS.some(kw => lowerPrompt.includes(kw)) ||
           VIDEO_KEYWORDS.some(kw => lowerPrompt.includes(kw)) ||
           AUDIO_KEYWORDS.some(kw => lowerPrompt.includes(kw)) ||
           VOICE_KEYWORDS.some(kw => lowerPrompt.includes(kw)) ||
           MUSIC_KEYWORDS.some(kw => lowerPrompt.includes(kw));
  }
}

export const contentIntentAnalyzer = new ContentIntentAnalyzer();
