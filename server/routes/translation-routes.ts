import { Router, Request, Response } from "express";
import { SarvamTranslationService } from "../services/sarvam-translation-service";

const router = Router();
const sarvamService = new SarvamTranslationService();

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', script: 'Devanagari' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Perso-Arabic' }
];

router.get("/languages", (_req: Request, res: Response) => {
  res.json({
    success: true,
    languages: SUPPORTED_LANGUAGES,
    total: SUPPORTED_LANGUAGES.length,
    providers: ['sarvam', 'gemini'],
    message: "Supported Indian languages for content creation and translation"
  });
});

router.post("/translate", async (req: Request, res: Response) => {
  const { text, sourceLanguage, targetLanguage, domain } = req.body;
  
  if (!text || !targetLanguage) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["text", "targetLanguage"],
      optional: ["sourceLanguage", "domain"]
    });
  }
  
  try {
    const result = await sarvamService.translate({
      text,
      sourceLanguage: sourceLanguage || 'en',
      targetLanguage,
      domain: domain || 'general'
    });
    
    res.json({
      success: true,
      ...result,
      message: `Translated from ${sourceLanguage || 'en'} to ${targetLanguage}`
    });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({
      error: "Translation failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/batch-translate", async (req: Request, res: Response) => {
  const { texts, sourceLanguage, targetLanguage, domain } = req.body;
  
  if (!texts || !Array.isArray(texts) || texts.length === 0 || !targetLanguage) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["texts (array)", "targetLanguage"],
      example: { texts: ["Hello", "Welcome"], targetLanguage: "hi" }
    });
  }
  
  try {
    const result = await sarvamService.batchTranslate({
      texts,
      sourceLanguage: sourceLanguage || 'en',
      targetLanguage,
      domain: domain || 'general'
    });
    
    res.json({
      success: true,
      ...result,
      message: `Batch translated ${texts.length} texts to ${targetLanguage}`
    });
  } catch (error) {
    console.error("Batch translation error:", error);
    res.status(500).json({
      error: "Batch translation failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get("/detect", async (req: Request, res: Response) => {
  const { text } = req.query;
  
  if (!text) {
    return res.status(400).json({
      error: "Missing text parameter",
      example: "/api/translation/detect?text=नमस्ते"
    });
  }
  
  const detectedLang = detectLanguageFromScript(text as string);
  res.json({
    success: true,
    language: detectedLang.code,
    languageName: detectedLang.name,
    confidence: detectedLang.confidence,
    message: `Language detected: ${detectedLang.name}`
  });
});

function detectLanguageFromScript(text: string): { code: string; name: string; confidence: number } {
  const scripts: { [key: string]: { code: string; name: string } } = {
    devanagari: { code: 'hi', name: 'Hindi' },
    bengali: { code: 'bn', name: 'Bengali' },
    telugu: { code: 'te', name: 'Telugu' },
    tamil: { code: 'ta', name: 'Tamil' },
    gujarati: { code: 'gu', name: 'Gujarati' },
    kannada: { code: 'kn', name: 'Kannada' },
    malayalam: { code: 'ml', name: 'Malayalam' },
    gurmukhi: { code: 'pa', name: 'Punjabi' },
    odia: { code: 'or', name: 'Odia' }
  };
  
  if (/[\u0900-\u097F]/.test(text)) return { ...scripts.devanagari, confidence: 0.95 };
  if (/[\u0980-\u09FF]/.test(text)) return { ...scripts.bengali, confidence: 0.95 };
  if (/[\u0C00-\u0C7F]/.test(text)) return { ...scripts.telugu, confidence: 0.95 };
  if (/[\u0B80-\u0BFF]/.test(text)) return { ...scripts.tamil, confidence: 0.95 };
  if (/[\u0A80-\u0AFF]/.test(text)) return { ...scripts.gujarati, confidence: 0.95 };
  if (/[\u0C80-\u0CFF]/.test(text)) return { ...scripts.kannada, confidence: 0.95 };
  if (/[\u0D00-\u0D7F]/.test(text)) return { ...scripts.malayalam, confidence: 0.95 };
  if (/[\u0A00-\u0A7F]/.test(text)) return { ...scripts.gurmukhi, confidence: 0.95 };
  if (/[\u0B00-\u0B7F]/.test(text)) return { ...scripts.odia, confidence: 0.95 };
  
  return { code: 'en', name: 'English', confidence: 0.8 };
}

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const stats = sarvamService.getStats();
    res.json({
      success: true,
      ...stats,
      message: "Translation service statistics"
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to get stats"
    });
  }
});

export default router;
