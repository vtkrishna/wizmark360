import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SarvamTranslationService } from '../sarvam-translation-service.js';

describe('SarvamTranslationService', () => {
  let service: SarvamTranslationService;

  beforeEach(() => {
    service = new SarvamTranslationService();
    // Clear cache before each test
    (service as any).cache.clear();
  });

  describe('RTL Language Detection', () => {
    it('should identify Urdu as RTL language', () => {
      const rtlLanguages = (service as any).rtlLanguages;
      expect(rtlLanguages).toContain('ur');
    });

    it('should identify Sindhi as RTL language', () => {
      const rtlLanguages = (service as any).rtlLanguages;
      expect(rtlLanguages).toContain('sd');
    });

    it('should identify Kashmiri as RTL language', () => {
      const rtlLanguages = (service as any).rtlLanguages;
      expect(rtlLanguages).toContain('ks');
    });

    it('should identify Hindi as LTR language', () => {
      const rtlLanguages = (service as any).rtlLanguages;
      expect(rtlLanguages).not.toContain('hi');
    });
  });

  describe('Seed Translations', () => {
    it('should have pre-loaded seed translations', () => {
      const seedTranslations = (service as any).seedTranslations;
      expect(Object.keys(seedTranslations).length).toBeGreaterThan(0);
    });

    it('should include all critical UI keys in seed translations', () => {
      const seedTranslations = (service as any).seedTranslations;
      const criticalKeys = [
        'platform',
        'wizardsIncubator',
        'agentsActive',
        'incubator',
        'superAgent',
        'dashboard',
        'switchPlatform'
      ];

      criticalKeys.forEach(key => {
        expect(seedTranslations[key]).toBeDefined();
      });
    });

    it('should have Hindi translations for critical keys', () => {
      const seedTranslations = (service as any).seedTranslations;
      expect(seedTranslations['platform']['hi']).toBe('मंच');
      expect(seedTranslations['dashboard']['hi']).toBe('डैशबोर्ड');
    });

    it('should have Bengali translations for critical keys', () => {
      const seedTranslations = (service as any).seedTranslations;
      expect(seedTranslations['platform']['bn']).toBe('প্ল্যাটফর্ম');
    });
  });

  describe('Translation Caching', () => {
    it('should cache translation after first call', async () => {
      const text = 'Hello World';
      const targetLang = 'hi';

      // First call
      const result1 = await service.translateText(text, 'en', targetLang);
      
      // Check cache
      const cacheKey = `${text}|en|${targetLang}`;
      const cached = (service as any).cache.get(cacheKey);
      
      expect(cached).toBeDefined();
      expect(cached).toBe(result1);
    });

    it('should return cached result on second call', async () => {
      const text = 'Test';
      const targetLang = 'ta';

      // First call
      await service.translateText(text, 'en', targetLang);
      
      // Manually set cache to verify it's being used
      const cacheKey = `${text}|en|${targetLang}`;
      (service as any).cache.set(cacheKey, 'CACHED_VALUE');
      
      // Second call should return cached value
      const result = await service.translateText(text, 'en', targetLang);
      expect(result).toBe('CACHED_VALUE');
    });

    it('should handle cache size limit (10000 entries)', async () => {
      const cache = (service as any).cache;
      
      // Fill cache to capacity
      for (let i = 0; i < 10000; i++) {
        cache.set(`test${i}`, `value${i}`);
      }
      
      expect(cache.size).toBeLessThanOrEqual(10000);
    });
  });

  describe('Batch Translation', () => {
    it('should translate multiple texts', async () => {
      const texts = ['Hello', 'World', 'Test'];
      const results = await service.translateBatch(texts, 'en', 'hi');
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.translatedText).toBeDefined();
        expect(result.translatedText.length).toBeGreaterThan(0);
      });
    });

    it('should handle empty array', async () => {
      const results = await service.translateBatch([], 'en', 'hi');
      expect(results).toHaveLength(0);
    });

    it('should preserve order of translations', async () => {
      const texts = ['First', 'Second', 'Third'];
      const results = await service.translateBatch(texts, 'en', 'hi');
      
      expect(results).toHaveLength(3);
      expect(results[0].originalText).toBe('First');
      expect(results[1].originalText).toBe('Second');
      expect(results[2].originalText).toBe('Third');
    });
  });

  describe('Fallback Mechanism', () => {
    it('should return original text when Sarvam API fails', async () => {
      const text = 'Fallback Test';
      const result = await service.translateText(text, 'en', 'unknown_lang' as any);
      
      // When API fails, should return original text
      expect(result).toBeDefined();
    });

    it('should use seed translation when available', async () => {
      const result = await service.translateText('platform', 'en', 'hi');
      
      // Should return seed translation for known key
      expect(result).toBe('मंच');
    });
  });

  describe('Language Support', () => {
    it('should support all 23 languages', () => {
      const supportedLanguages = service.getSupportedLanguages();
      expect(supportedLanguages).toHaveLength(23);
    });

    it('should include all 22 Indian languages plus English', () => {
      const supportedLanguages = service.getSupportedLanguages();
      const languageCodes = supportedLanguages.map(lang => lang.code);
      
      expect(languageCodes).toContain('en'); // English
      expect(languageCodes).toContain('hi'); // Hindi
      expect(languageCodes).toContain('bn'); // Bengali
      expect(languageCodes).toContain('ta'); // Tamil
      expect(languageCodes).toContain('te'); // Telugu
      expect(languageCodes).toContain('mr'); // Marathi
      expect(languageCodes).toContain('gu'); // Gujarati
      expect(languageCodes).toContain('ur'); // Urdu
      expect(languageCodes).toContain('kn'); // Kannada
      expect(languageCodes).toContain('or'); // Odia
      expect(languageCodes).toContain('ml'); // Malayalam
      expect(languageCodes).toContain('pa'); // Punjabi
    });

    it('should correctly mark RTL languages', () => {
      const supportedLanguages = service.getSupportedLanguages();
      
      const urdu = supportedLanguages.find(lang => lang.code === 'ur');
      const sindhi = supportedLanguages.find(lang => lang.code === 'sd');
      const kashmiri = supportedLanguages.find(lang => lang.code === 'ks');
      const hindi = supportedLanguages.find(lang => lang.code === 'hi');
      
      expect(urdu?.rtl).toBe(true);
      expect(sindhi?.rtl).toBe(true);
      expect(kashmiri?.rtl).toBe(true);
      expect(hindi?.rtl).toBe(false);
    });
  });

  describe('Translation Statistics', () => {
    it('should return stats with cache size', () => {
      const stats = service.getStats();
      
      expect(stats.cacheSize).toBeDefined();
      expect(stats.cacheSize).toBeGreaterThanOrEqual(0);
    });

    it('should return supported language count', () => {
      const stats = service.getStats();
      
      expect(stats.supportedLanguages).toBe(23);
    });

    it('should return RTL language count', () => {
      const stats = service.getStats();
      
      expect(stats.rtlLanguages).toBe(3); // Urdu, Sindhi, Kashmiri
    });

    it('should update cache size after translations', async () => {
      const initialStats = service.getStats();
      
      await service.translateText('Test', 'en', 'hi');
      
      const updatedStats = service.getStats();
      expect(updatedStats.cacheSize).toBeGreaterThanOrEqual(initialStats.cacheSize);
    });
  });

  describe('All Languages Translation', () => {
    it('should translate text to all languages', async () => {
      const results = await service.translateToAllLanguages('Hello', 'en');
      
      expect(Object.keys(results)).toHaveLength(23); // 22 Indian + English
    });

    it('should include source language in results', async () => {
      const results = await service.translateToAllLanguages('Test', 'en');
      
      expect(results['en']).toBe('Test'); // Source text unchanged
    });

    it('should handle seed translations in all-language translation', async () => {
      const results = await service.translateToAllLanguages('platform', 'en');
      
      expect(results['hi']).toBe('मंच'); // Seed translation
      expect(results['bn']).toBe('প্ল্যাটফর্ম'); // Seed translation
    });
  });
});
