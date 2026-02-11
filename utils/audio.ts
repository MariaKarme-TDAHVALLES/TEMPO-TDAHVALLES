
import { AlarmType, VoiceChoice } from "../types";

let audioCtx: AudioContext | null = null;
let currentVictoryAudio: HTMLAudioElement | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playAlarm = (type: AlarmType) => {
  const ctx = getCtx();
  const now = ctx.currentTime;

  switch (type) {
    case AlarmType.SIREN:
      for (let i = 0; i < 5; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now + i);
        osc.frequency.exponentialRampToValueAtTime(440, now + i + 0.5);
        osc.frequency.exponentialRampToValueAtTime(880, now + i + 1.0);
        
        gain.gain.setValueAtTime(0.3, now + i);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i + 1.0);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i);
        osc.stop(now + i + 1);
      }
      break;

    case AlarmType.SEISMIC:
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(60, now);
      osc2.frequency.linearRampToValueAtTime(40, now + 3);
      
      gain2.gain.setValueAtTime(0.5, now);
      gain2.gain.linearRampToValueAtTime(0, now + 3);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 3);
      break;

    case AlarmType.NEON_PULSE:
      [0, 0.2, 0.4, 0.6].forEach(delay => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000, now + delay);
        osc.frequency.exponentialRampToValueAtTime(100, now + delay + 0.15);
        
        gain.gain.setValueAtTime(0.4, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.15);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.2);
      });
      break;
  }
};

export const playVictoryTheme = () => {
  stopVictoryTheme();
  const audio = new Audio('https://www.myinstants.com/media/sounds/we-are-the-champions-chorus.mp3');
  audio.volume = 0.6;
  currentVictoryAudio = audio;
  audio.play().catch(err => {
    if (err.name !== 'AbortError') console.error("Victory theme playback failed", err);
  });
};

export const stopVictoryTheme = () => {
  if (currentVictoryAudio) {
    currentVictoryAudio.pause();
    currentVictoryAudio = null;
  }
};

export const speakText = (text: string, lang: string) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel(); // Stop previous
  
  const utterance = new SpeechSynthesisUtterance(text);
  // Map our internal lang codes to BCP 47 tags
  const langMap: Record<string, string> = {
    'ca': 'ca-ES',
    'es': 'es-ES',
    'en': 'en-US',
    'de': 'de-DE',
    'fr': 'fr-FR',
    'it': 'it-IT'
  };
  
  utterance.lang = langMap[lang] || 'es-ES';
  
  // Try to find a good voice
  const voices = window.speechSynthesis.getVoices();
  // Prefer a natural sounding voice if available
  const preferredVoice = voices.find(v => v.lang.startsWith(utterance.lang) && !v.name.includes('Google'));
  if (preferredVoice) utterance.voice = preferredVoice;

  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
};

export const speakReminder = (text: string, voiceChoice: VoiceChoice, lang: string) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'ca' ? 'ca-ES' : 'es-ES';
  
  const voices = window.speechSynthesis.getVoices();
  const targetVoice = voices.find(v => {
    const isMale = v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('jordi');
    const isFemale = v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('monica') || v.name.toLowerCase().includes('joana');
    return voiceChoice === VoiceChoice.MALE ? isMale : isFemale;
  });

  if (targetVoice) utterance.voice = targetVoice;
  utterance.pitch = voiceChoice === VoiceChoice.MALE ? 0.9 : 1.1;
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
};
