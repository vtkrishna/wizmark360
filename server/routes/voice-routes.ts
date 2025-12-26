import { Router, Request, Response } from 'express';
import { sarvamVoiceAgentService } from '../services/sarvam-voice-agent-service';

const router = Router();

router.get('/status', (_req: Request, res: Response) => {
  const status = sarvamVoiceAgentService.getServiceStatus();
  res.json({
    success: true,
    data: status,
    message: status.configured
      ? 'Sarvam Voice Service is configured and ready'
      : 'Sarvam Voice Service is awaiting API key'
  });
});

router.get('/languages', (_req: Request, res: Response) => {
  const languages = sarvamVoiceAgentService.getSupportedLanguages();
  res.json({
    success: true,
    data: languages,
    count: languages.length
  });
});

router.get('/voices', (_req: Request, res: Response) => {
  const voices = sarvamVoiceAgentService.getAvailableVoices();
  res.json({
    success: true,
    data: voices,
    count: voices.length
  });
});

router.post('/stt', async (req: Request, res: Response) => {
  const { audioUrl, language } = req.body;
  
  if (!audioUrl || !language) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['audioUrl', 'language']
    });
  }
  
  try {
    const result = await sarvamVoiceAgentService.speechToText(audioUrl, { language });
    res.json({
      success: true,
      data: result,
      message: 'Speech transcribed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to transcribe speech' });
  }
});

router.post('/tts', async (req: Request, res: Response) => {
  const { text, language, voice, speed, format } = req.body;
  
  if (!text || !language) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['text', 'language']
    });
  }
  
  try {
    const result = await sarvamVoiceAgentService.textToSpeech(text, {
      language,
      voice,
      speed,
      format
    });
    res.json({
      success: true,
      data: result,
      message: 'Audio generated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate audio' });
  }
});

router.post('/messages/:brandId', async (req: Request, res: Response) => {
  const { type, text, language } = req.body;
  
  if (!type || !text || !language) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['type', 'text', 'language']
    });
  }
  
  try {
    const message = await sarvamVoiceAgentService.createVoiceMessage(
      req.params.brandId,
      type,
      text,
      language
    );
    res.json({
      success: true,
      data: message,
      message: 'Voice message created'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create voice message' });
  }
});

router.get('/messages/:brandId', async (req: Request, res: Response) => {
  try {
    const messages = await sarvamVoiceAgentService.getVoiceMessages(req.params.brandId);
    res.json({
      success: true,
      data: messages,
      count: messages.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch voice messages' });
  }
});

router.post('/conversation', async (req: Request, res: Response) => {
  const { brandId, audioUrl, language, context } = req.body;
  
  if (!brandId || !audioUrl || !language) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['brandId', 'audioUrl', 'language']
    });
  }
  
  try {
    const result = await sarvamVoiceAgentService.processVoiceConversation(
      brandId,
      audioUrl,
      language,
      context
    );
    res.json({
      success: true,
      data: result,
      message: 'Voice conversation processed'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process conversation' });
  }
});

router.post('/whatsapp-note', async (req: Request, res: Response) => {
  const { text, language, maxDuration } = req.body;
  
  if (!text || !language) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['text', 'language']
    });
  }
  
  try {
    const result = await sarvamVoiceAgentService.generateWhatsAppVoiceNote(
      text,
      language,
      maxDuration
    );
    res.json({
      success: true,
      data: result,
      message: 'WhatsApp voice note generated'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate voice note' });
  }
});

export default router;
