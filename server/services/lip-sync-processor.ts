/**
 * Professional Lip Sync Processor for 3D Avatar Animation
 * Converts text to phoneme/viseme data for realistic mouth movement
 */

// Standard viseme mapping for facial animation
export const VISEME_MAPPING = {
  // Vowels
  'A': { viseme_id: 0, mouth_shape: 'open_wide', intensity: 0.8 },
  'E': { viseme_id: 1, mouth_shape: 'open_mid', intensity: 0.6 },
  'I': { viseme_id: 2, mouth_shape: 'smile_narrow', intensity: 0.7 },
  'O': { viseme_id: 3, mouth_shape: 'rounded', intensity: 0.8 },
  'U': { viseme_id: 4, mouth_shape: 'pucker', intensity: 0.9 },
  
  // Consonants
  'M': { viseme_id: 5, mouth_shape: 'closed', intensity: 1.0 },
  'B': { viseme_id: 6, mouth_shape: 'pressed', intensity: 0.9 },
  'P': { viseme_id: 7, mouth_shape: 'pressed', intensity: 0.9 },
  'F': { viseme_id: 8, mouth_shape: 'bite_lower', intensity: 0.7 },
  'V': { viseme_id: 9, mouth_shape: 'bite_lower', intensity: 0.7 },
  'TH': { viseme_id: 10, mouth_shape: 'tongue_out', intensity: 0.6 },
  'S': { viseme_id: 11, mouth_shape: 'narrow_open', intensity: 0.5 },
  'SH': { viseme_id: 12, mouth_shape: 'pucker_narrow', intensity: 0.6 },
  'CH': { viseme_id: 13, mouth_shape: 'pucker_narrow', intensity: 0.7 },
  'L': { viseme_id: 14, mouth_shape: 'tongue_up', intensity: 0.6 },
  'R': { viseme_id: 15, mouth_shape: 'open_narrow', intensity: 0.5 },
  'W': { viseme_id: 16, mouth_shape: 'pucker_wide', intensity: 0.8 },
  'Y': { viseme_id: 17, mouth_shape: 'smile_wide', intensity: 0.6 },
  'K': { viseme_id: 18, mouth_shape: 'open_back', intensity: 0.4 },
  'G': { viseme_id: 19, mouth_shape: 'open_back', intensity: 0.4 },
  'H': { viseme_id: 20, mouth_shape: 'open_slight', intensity: 0.3 },
  'SILENCE': { viseme_id: 21, mouth_shape: 'rest', intensity: 0.0 }
};

// Phoneme to viseme mapping for more accurate lip sync
export const PHONEME_TO_VISEME: { [key: string]: string } = {
  // Vowels
  'AH': 'A', 'AA': 'A', 'AE': 'A', 'AW': 'A', 'AY': 'A',
  'EH': 'E', 'EY': 'E',
  'IH': 'I', 'IY': 'I', 'IX': 'I',
  'OH': 'O', 'OW': 'O', 'OY': 'O',
  'UH': 'U', 'UW': 'U', 'UX': 'U',
  
  // Consonants
  'M': 'M', 'EM': 'M',
  'B': 'B', 'P': 'P',
  'F': 'F', 'V': 'V',
  'TH': 'TH', 'DH': 'TH',
  'S': 'S', 'Z': 'S',
  'SH': 'SH', 'ZH': 'SH', 'CH': 'CH', 'JH': 'CH',
  'L': 'L', 'EL': 'L',
  'R': 'R', 'ER': 'R',
  'W': 'W', 'Y': 'Y',
  'K': 'K', 'G': 'G', 'NG': 'K',
  'T': 'S', 'D': 'S', 'N': 'S',
  'H': 'H', 'HH': 'H',
  
  // Silence
  'SIL': 'SILENCE', 'SP': 'SILENCE', '': 'SILENCE'
};

/**
 * LipSyncProcessor class for converting text to viseme animation data
 */
export class LipSyncProcessor {
  
  /**
   * Generate lip sync keyframes from text with realistic timing
   */
  static generateLipSyncFromText(text: string, duration: number): any[] {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    const keyframes: any[] = [];
    
    let currentTime = 0;
    const avgWordsPerSecond = Math.max(2, words.length / duration); // Realistic speech rate
    const frameRate = 30; // 30 FPS for smooth animation
    const frameInterval = 1 / frameRate;
    
    console.log(`🎬 Generating lip sync for "${text}"`);
    console.log(`📊 Words: ${words.length}, Duration: ${duration}s, Rate: ${avgWordsPerSecond.toFixed(1)} words/sec`);
    
    for (const word of words) {
      const wordDuration = Math.max(0.3, word.length / (avgWordsPerSecond * 4)); // Minimum 300ms per word
      const phonemes = this.textToPhonemes(word);
      
      console.log(`🔤 Word: "${word}" -> Phonemes: [${phonemes.join(', ')}] (${wordDuration.toFixed(2)}s)`);
      
      for (let i = 0; i < phonemes.length; i++) {
        const phoneme = phonemes[i];
        const viseme = PHONEME_TO_VISEME[phoneme] || 'SILENCE';
        const visemeData = VISEME_MAPPING[viseme as keyof typeof VISEME_MAPPING];
        
        const phonemeDuration = wordDuration / phonemes.length;
        const startTime = currentTime + (i * phonemeDuration);
        
        // Add multiple frames for smooth animation
        const framesForPhoneme = Math.max(2, Math.floor(phonemeDuration / frameInterval));
        
        for (let frame = 0; frame < framesForPhoneme; frame++) {
          const frameTime = startTime + (frame * frameInterval);
          const progress = frame / (framesForPhoneme - 1);
          
          // Smooth intensity curve for more natural animation
          const intensity = visemeData.intensity * Math.sin(progress * Math.PI);
          
          keyframes.push({
            time: frameTime,
            viseme_id: visemeData.viseme_id,
            phoneme: phoneme,
            viseme: viseme,
            mouth_shape: visemeData.mouth_shape,
            intensity: Math.max(0.1, intensity),
            word: word,
            progress: progress
          });
        }
      }
      
      currentTime += wordDuration + 0.1; // Small pause between words
    }
    
    // Add final rest position
    keyframes.push({
      time: duration,
      viseme_id: VISEME_MAPPING.SILENCE.viseme_id,
      phoneme: 'SIL',
      viseme: 'SILENCE',
      mouth_shape: 'rest',
      intensity: 0.0,
      word: '',
      progress: 1.0
    });
    
    console.log(`✅ Generated ${keyframes.length} lip sync keyframes`);
    return keyframes;
  }
  
  /**
   * Simple text to phoneme conversion (basic implementation)
   * In production, this would use a more sophisticated phoneme dictionary
   */
  private static textToPhonemes(word: string): string[] {
    const phonemes: string[] = [];
    const chars = word.toLowerCase().split('');
    
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const nextChar = chars[i + 1];
      
      // Handle common digraphs and special cases
      if (char === 'c' && nextChar === 'h') {
        phonemes.push('CH');
        i++; // Skip next character
      } else if (char === 's' && nextChar === 'h') {
        phonemes.push('SH');
        i++;
      } else if (char === 't' && nextChar === 'h') {
        phonemes.push('TH');
        i++;
      } else {
        // Map individual characters to phonemes
        switch (char) {
          case 'a': phonemes.push('AH'); break;
          case 'e': phonemes.push('EH'); break;
          case 'i': phonemes.push('IH'); break;
          case 'o': phonemes.push('OH'); break;
          case 'u': phonemes.push('UH'); break;
          case 'y': phonemes.push('Y'); break;
          case 'b': phonemes.push('B'); break;
          case 'c': phonemes.push('K'); break;
          case 'd': phonemes.push('D'); break;
          case 'f': phonemes.push('F'); break;
          case 'g': phonemes.push('G'); break;
          case 'h': phonemes.push('H'); break;
          case 'j': phonemes.push('JH'); break;
          case 'k': phonemes.push('K'); break;
          case 'l': phonemes.push('L'); break;
          case 'm': phonemes.push('M'); break;
          case 'n': phonemes.push('N'); break;
          case 'p': phonemes.push('P'); break;
          case 'q': phonemes.push('K'); break;
          case 'r': phonemes.push('R'); break;
          case 's': phonemes.push('S'); break;
          case 't': phonemes.push('T'); break;
          case 'v': phonemes.push('V'); break;
          case 'w': phonemes.push('W'); break;
          case 'x': phonemes.push('K'); break;
          case 'z': phonemes.push('Z'); break;
          default: phonemes.push('SIL'); break;
        }
      }
    }
    
    return phonemes.length > 0 ? phonemes : ['SIL'];
  }
  
  /**
   * Enhanced lip sync generation using API-based phoneme extraction
   * This method would be used when we have access to more sophisticated TTS APIs
   */
  static async generateAdvancedLipSync(text: string, audioData: Buffer, duration: number): Promise<any[]> {
    try {
      // For now, use the basic text-based method
      // In future, this could integrate with APIs like Azure Speech Services
      // which provide phoneme timing data directly from TTS
      
      console.log('🚀 Using advanced lip sync generation (fallback to text-based)');
      return this.generateLipSyncFromText(text, duration);
      
    } catch (error) {
      console.error('❌ Advanced lip sync generation failed, falling back to basic method:', error);
      return this.generateLipSyncFromText(text, duration);
    }
  }
  
  /**
   * Optimize keyframes for smooth animation
   */
  static optimizeKeyframes(keyframes: any[]): any[] {
    if (keyframes.length < 2) return keyframes;
    
    const optimized: any[] = [];
    let lastViseme = '';
    
    for (const frame of keyframes) {
      // Only add keyframes when viseme changes or at significant intervals
      if (frame.viseme !== lastViseme || optimized.length === 0) {
        optimized.push(frame);
        lastViseme = frame.viseme;
      }
    }
    
    // Always include the last frame
    if (optimized[optimized.length - 1] !== keyframes[keyframes.length - 1]) {
      optimized.push(keyframes[keyframes.length - 1]);
    }
    
    console.log(`⚡ Optimized keyframes: ${keyframes.length} -> ${optimized.length}`);
    return optimized;
  }
}

export default LipSyncProcessor;