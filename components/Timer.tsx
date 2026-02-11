
import React, { useState, useEffect, useRef } from 'react';
import { AlarmType, ProfileType, MusicType, Language, VoiceChoice } from '../types';
import { playAlarm, speakReminder } from '../utils/audio';
import { translations } from '../i18n';

interface TimerProps {
  initialMinutes: number;
  onComplete: (onTime: boolean) => void;
  alarmType: AlarmType;
  profile: ProfileType;
  musicType: MusicType;
  lang: Language;
  voiceChoice: VoiceChoice;
}

const MUSIC_SOURCES: Record<string, string> = {
  [MusicType.RELAXING]: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  [MusicType.ALPHA_WAVES]: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  [MusicType.WHITE_NOISE]: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  [MusicType.EIGHTIES]: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  [MusicType.CLASSICAL]: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
};

type TimerPhase = 'work' | 'break';

const WORK_INTERVAL = 10 * 60; // 10 minutes in seconds
const BREAK_INTERVAL = 3 * 60; // 3 minutes in seconds

const Timer: React.FC<TimerProps> = ({ initialMinutes, onComplete, alarmType, profile, musicType, lang, voiceChoice }) => {
  const t = translations[lang];
  
  // Total work budget allowed for the task
  const [totalWorkSecondsLeft, setTotalWorkSecondsLeft] = useState(initialMinutes * 60);
  
  // Current Phase management
  const [phase, setPhase] = useState<TimerPhase>('work');
  
  // Time elapsed in the current continuous work session (to trigger break at 10m)
  const [currentWorkSessionElapsed, setCurrentWorkSessionElapsed] = useState(0);
  
  // Time remaining in current break (only used if phase === 'break')
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(BREAK_INTERVAL);

  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [reminderPlayed, setReminderPlayed] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Music handling
  useEffect(() => {
    if (!isActive || musicType === MusicType.NONE || isFinished) {
      audioRef.current?.pause();
      return;
    }
    
    // Switch track if phase changes? Maybe keep it simple for now, or pause music during break?
    // Let's pause work music during break to help distinguish phases.
    if (phase === 'break') {
      audioRef.current?.pause();
      return;
    }

    const source = MUSIC_SOURCES[musicType];
    if (audioRef.current && audioRef.current.src !== source) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (!audioRef.current) {
      audioRef.current = new Audio(source);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
    audioRef.current.play().catch(e => {
      if (e.name !== 'AbortError') console.warn("Background music play failed", e);
    });
    return () => { audioRef.current?.pause(); };
  }, [isActive, musicType, phase, isFinished]);

  // Main Timer Logic
  useEffect(() => {
    if (isActive && !isFinished) {
      timerRef.current = window.setInterval(() => {
        
        if (phase === 'work') {
          // Decrement total budget
          setTotalWorkSecondsLeft((prev) => {
             const newVal = prev - 1;
             if (newVal <= 0) {
               setIsFinished(true);
               setIsActive(false);
               triggerImpactAlarm();
               return 0;
             }
             return newVal;
          });

          // Increment session elapsed
          setCurrentWorkSessionElapsed(prev => {
            const newVal = prev + 1;
            // CHECK FOR BREAK TRIGGER (Every 10 mins)
            if (newVal >= WORK_INTERVAL && totalWorkSecondsLeft > 60) {
              // Only trigger break if there is actually time left to work after the break
              triggerBreak();
              return 0; // Reset session
            }
            return newVal;
          });

        } else {
          // Break Phase
          setBreakSecondsLeft(prev => {
            const newVal = prev - 1;
            if (newVal <= 0) {
              endBreak();
              return BREAK_INTERVAL;
            }
            return newVal;
          });
        }

      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, isFinished, phase, totalWorkSecondsLeft]);

  const triggerBreak = () => {
    setPhase('break');
    setBreakSecondsLeft(BREAK_INTERVAL);
    playAlarm(AlarmType.NEON_PULSE); // Soft sound for break start
    speakReminder(t.breakStart, voiceChoice, lang);
  };

  const endBreak = () => {
    setPhase('work');
    playAlarm(AlarmType.NEON_PULSE); // Soft sound for work resume
    speakReminder(t.breakEnd, voiceChoice, lang);
  };

  const triggerImpactAlarm = () => {
    if (audioRef.current) audioRef.current.pause();
    playAlarm(alarmType);
  };

  // 5 Minute Reminder (Based on total work time remaining)
  useEffect(() => {
    if (totalWorkSecondsLeft === 300 && !reminderPlayed && isActive && phase === 'work') {
      speakReminder(t.reminderText, voiceChoice, lang);
      setReminderPlayed(true);
    }
  }, [totalWorkSecondsLeft, reminderPlayed, isActive, phase, voiceChoice, lang, t.reminderText]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (phase === 'break') return 'bg-indigo-400 text-white animate-pulse'; // Distinct break color
    
    const percentage = (totalWorkSecondsLeft / (initialMinutes * 60)) * 100;
    if (totalWorkSecondsLeft === 0) return 'bg-black animate-shake';
    
    if (profile === ProfileType.ADULT) {
      if (percentage < 20) return 'bg-rose-700 text-white';
      if (percentage < 50) return 'bg-amber-600 text-white';
      return 'bg-teal-700 text-white';
    }
    // Child/Teen colors
    if (percentage < 20) return 'bg-red-600 text-white';
    if (percentage < 50) return 'bg-[#E85B22] text-white';
    return 'bg-[#003366] text-white';
  };

  const getProfileStyles = () => {
    switch(profile) {
      case ProfileType.CHILD: 
      case ProfileType.ADULT:
        return "rounded-full aspect-square flex flex-col items-center justify-center border-8 border-white shadow-2xl";
      case ProfileType.TEEN: 
        return "rounded-3xl aspect-video flex flex-col items-center justify-center border-4 border-blue-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]";
    }
  };

  const displayedTime = phase === 'work' ? totalWorkSecondsLeft : breakSecondsLeft;
  const label = phase === 'work' ? t.workMode : t.breakMode;

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className={`transition-all duration-500 relative ${getTimerColor()} ${getProfileStyles()}`}>
        
        {/* Phase Indicator Badge */}
        <div className="absolute top-8 px-4 py-1 bg-white/20 rounded-full backdrop-blur-sm">
           <span className="font-bold text-sm uppercase tracking-widest">{label}</span>
        </div>

        <span className={`text-7xl md:text-8xl font-black tabular-nums tracking-tighter ${profile === ProfileType.CHILD ? 'font-child' : profile === ProfileType.TEEN ? 'font-teen' : 'font-adult'}`}>
          {formatTime(displayedTime)}
        </span>

        {phase === 'work' && (
           <div className="absolute bottom-10 text-xs font-bold opacity-70">
             {t.nextBreak}: {formatTime(WORK_INTERVAL - currentWorkSessionElapsed)}
           </div>
        )}

        {totalWorkSecondsLeft === 0 && (
          <div className="absolute bottom-20 mt-4 text-2xl font-bold animate-strobe uppercase">{t.timeUp}</div>
        )}
      </div>

      <div className="flex gap-4 justify-center">
        {!isActive && totalWorkSecondsLeft > 0 && (
          <button onClick={() => setIsActive(true)} className="px-8 py-4 bg-tdah-blue text-white rounded-2xl font-black text-xl hover:bg-tdah-orange transition-all shadow-xl active:scale-95">
            {totalWorkSecondsLeft === (initialMinutes * 60) ? t.start : t.continue}
          </button>
        )}
        {isActive && (
          <button onClick={() => setIsActive(false)} className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-black text-xl hover:bg-slate-700 transition-all shadow-lg active:scale-95">
            {t.pause}
          </button>
        )}
        <button onClick={() => { if (audioRef.current) audioRef.current.pause(); onComplete(totalWorkSecondsLeft > 0); }} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xl hover:bg-emerald-600 transition-all shadow-lg active:scale-95">
          {t.done}
        </button>
      </div>
    </div>
  );
};

export default Timer;
