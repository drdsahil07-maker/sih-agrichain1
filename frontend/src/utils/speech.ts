/**
 * Web Speech API text-to-speech helper for AgriMitra voice assistants and accessibility
 */

class SpeechHelper {
  private isMuted: boolean = false;

  stopSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stopSpeech();
    }
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }

  speak(options: {
    text: string;
    isAi?: boolean;
    rate?: number;
    preferredLang?: 'hi' | 'en';
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }): () => void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (options.onStart) options.onStart();
      if (options.onEnd) setTimeout(options.onEnd, 1500);
      return () => {};
    }

    if (this.isMuted) {
      if (options.onStart) options.onStart();
      if (options.onEnd) setTimeout(options.onEnd, 1500);
      return () => {};
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(options.text);
      const voices = window.speechSynthesis.getVoices();

      if (options.preferredLang === 'hi') {
        const hindiVoice = voices.find(
          (v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')
        );
        if (hindiVoice) {
          utterance.voice = hindiVoice;
          utterance.lang = hindiVoice.lang;
        } else {
          utterance.lang = 'hi-IN';
        }
      } else {
        const inVoice = voices.find((v) => v.lang.toLowerCase().includes('en-in'));
        if (inVoice) {
          utterance.voice = inVoice;
          utterance.lang = inVoice.lang;
        } else {
          utterance.lang = 'en-IN';
        }
      }

      utterance.pitch = options.isAi ? 1.05 : 0.95;
      utterance.rate = options.rate || 0.95;

      utterance.onstart = () => {
        if (options.onStart) options.onStart();
      };
      utterance.onend = () => {
        if (options.onEnd) options.onEnd();
      };
      utterance.onerror = (err) => {
        if (options.onEnd) options.onEnd();
        if (options.onError) options.onError(err);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis note:', e);
      if (options.onEnd) options.onEnd();
    }

    return () => {
      this.stopSpeech();
    };
  }
}

export const speech = new SpeechHelper();
