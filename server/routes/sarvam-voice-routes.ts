import { Router } from 'express';
import { sarvamVoiceService, SarvamLanguage } from '../services/sarvam-voice-service';

const router = Router();

router.post('/speech-to-text', async (req, res) => {
  try {
    const { audioData, language, speakerId, enablePunctuation, enableDiarization, model } = req.body;

    if (!audioData || !language) {
      return res.status(400).json({
        success: false,
        error: 'audioData and language are required',
      });
    }

    const result = await sarvamVoiceService.speechToText({
      audioData,
      language: language as SarvamLanguage,
      speakerId,
      enablePunctuation,
      enableDiarization,
      model,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, language, voice, gender, speed, pitch, style, model } = req.body;

    if (!text || !language) {
      return res.status(400).json({
        success: false,
        error: 'text and language are required',
      });
    }

    const result = await sarvamVoiceService.textToSpeech({
      text,
      language: language as SarvamLanguage,
      voice,
      gender,
      speed,
      pitch,
      style,
      model,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/batch-tts', async (req, res) => {
  try {
    const { texts, language, options } = req.body;

    if (!texts || !Array.isArray(texts) || !language) {
      return res.status(400).json({
        success: false,
        error: 'texts array and language are required',
      });
    }

    const results = await sarvamVoiceService.batchTTS(
      texts,
      language as SarvamLanguage,
      options
    );

    res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/voices', (req, res) => {
  const { language } = req.query;
  
  const voices = language 
    ? sarvamVoiceService.getAvailableVoices(language as SarvamLanguage)
    : sarvamVoiceService.getAvailableVoices();

  res.json({
    success: true,
    data: {
      voices,
      count: voices.length,
    },
  });
});

router.get('/voices/:voiceId', (req, res) => {
  const voice = sarvamVoiceService.getVoiceById(req.params.voiceId);
  
  if (!voice) {
    return res.status(404).json({
      success: false,
      error: 'Voice not found',
    });
  }

  res.json({
    success: true,
    data: voice,
  });
});

router.get('/languages', (req, res) => {
  const languages = sarvamVoiceService.getSupportedLanguages();
  
  res.json({
    success: true,
    data: {
      languages,
      count: languages.length,
    },
  });
});

router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: sarvamVoiceService.getStats(),
  });
});

router.post('/clear-cache', (req, res) => {
  sarvamVoiceService.clearCache();
  
  res.json({
    success: true,
    message: 'Voice audio cache cleared',
  });
});

export default router;
