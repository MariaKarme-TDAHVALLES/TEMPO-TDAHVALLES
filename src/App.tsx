
import React, { useState, useEffect, useRef } from 'react';
import { ProfileType, Task, AlarmType, MusicType, Language, Accessory, VoiceChoice, CalendarTask, TaskStep, LeisureActivity } from './types';
import Timer from './components/Timer';
import AlarmSelector from './components/AlarmSelector';
import MusicSelector from './components/MusicSelector';
import LanguageSelector from './components/LanguageSelector';
import Logo from './components/Logo';
import AIChat from './components/AIChat';
import { analyzeTask } from './services/geminiService';
import { translations } from './i18n';
import { playVictoryTheme, stopVictoryTheme } from './utils/audio';

const AVATARS = ['🦁','🦊','🦉','🐻','🐼','🦄','🐲','👽','🤖','🦸','🕵️','👩‍🚀','🦥','🦦','🦒','🦓','🐝','🐞','🦋','🐢','🐈','🐕','🍄','🌵'];
const HOUSE_COLORS = ['#FFFFFF', '#FFD700', '#FF6347', '#4682B4', '#3CB371', '#9370DB', '#FF69B4'];

const ACCESSORIES: Accessory[] = [
  { id: 'glasses', name: 'Gafas', icon: '🕶️', cost: 50, category: 'wearable' },
  { id: 'crown', name: 'Corona', icon: '👑', cost: 300, category: 'wearable' },
  { id: 'energy', name: 'Aura', icon: '✨', cost: 600, category: 'wearable' },
  { id: 'h1', name: 'Cabaña', icon: '🛖', cost: 250, category: 'house' },
  { id: 'h2', name: 'Castillo', icon: '🏰', cost: 1000, category: 'house' },
  { id: 'h3', name: 'Estación', icon: '🚀', cost: 2000, category: 'house' },
];

const INITIAL_CHECKLISTS: Record<string, TaskStep[]> = {
  backpack: [
    { id: 'b1', text: "Agafar l'agenda i mirar l'horari de demà", completed: false, icon: '📔' },
    { id: 'b2', text: "Llibres i carpetes segons l'horari", completed: false, icon: '📚' },
    { id: 'b3', text: "Revisar estutxe (llapis, bolis, goma)", completed: false, icon: '✏️' },
    { id: 'b4', text: "Material especial (plàstica, flauta...)", completed: false, icon: '🎨' },
    { id: 'b5', text: "Preparar carmanyola de l'esmorzar", completed: false, icon: '🥪' },
    { id: 'b6', text: "Ampolla d'aigua plena", completed: false, icon: '💧' },
  ],
  adult_essentials: [
    { id: 'ae1', text: 'Mòbil (revisar bateria)', completed: false, icon: '📱' },
    { id: 'ae2', text: 'Targeta de crèdit / Cartera', completed: false, icon: '💳' },
    { id: 'ae3', text: 'DNI / Documentació', completed: false, icon: '🪪' },
    { id: 'ae4', text: 'Claus del cotxe', completed: false, icon: '🚗' },
    { id: 'ae5', text: 'Claus de casa', completed: false, icon: '🔑' },
    { id: 'ae6', text: 'Tancar la porta amb clau', completed: false, icon: '🔐' },
    { id: 'ae7', text: 'Revisar finestres tancades', completed: false, icon: '🪟' },
    { id: 'ae8', text: 'Apagar llums i fogons', completed: false, icon: '💡' },
  ],
  sports: [
    { id: 's1', text: 'Samarreta de bàsquet', completed: false, icon: '🎽' },
    { id: 's2', text: 'Pantalons curts', completed: false, icon: '🩳' },
    { id: 's3', text: 'Mitjons esportius', completed: false, icon: '🧦' },
    { id: 's4', text: 'Roba interior de recanvi', completed: false, icon: '👕' },
    { id: 's5', text: 'Bambes de bàsquet', completed: false, icon: '👟' },
    { id: 's6', text: 'Xandall per després', completed: false, icon: '🧥' },
    { id: 's7', text: 'Tovallola de dutxa', completed: false, icon: '🚿' },
    { id: 's8', text: 'Xampú i Gel de dutxa', completed: false, icon: '🧴' },
    { id: 's9', text: 'Desodorant', completed: false, icon: '✨' },
    { id: 's10', text: 'Xancles per la dutxa', completed: false, icon: '🩴' },
    { id: 's11', text: "Ampolla d'aigua", completed: false, icon: '🥤' },
  ],
  football: [
    { id: 'f1', text: 'Samarreta de futbol', completed: false, icon: '👕' },
    { id: 'f2', text: 'Pantalons curts', completed: false, icon: '🩳' },
    { id: 'f3', text: 'Mitjons llargs (per canyelleres)', completed: false, icon: '🧦' },
    { id: 'f4', text: 'Canyelleres', completed: false, icon: '🛡️' },
    { id: 'f5', text: 'Botes de futbol / Tacos', completed: false, icon: '👟' },
    { id: 'f6', text: 'Roba interior de recanvi', completed: false, icon: '👕' },
    { id: 'f7', text: 'Xandall', completed: false, icon: '🧥' },
    { id: 'f8', text: 'Tovallola de dutxa', completed: false, icon: '🚿' },
    { id: 'f9', text: 'Xampú i Gel de dutxa', completed: false, icon: '🧴' },
    { id: 'f10', text: 'Desodorant', completed: false, icon: '✨' },
    { id: 'f11', text: 'Xancles dutxa', completed: false, icon: '🩴' },
    { id: 'f12', text: "Ampolla d'aigua", completed: false, icon: '💧' },
  ],
  hockey: [
    { id: 'h1', text: 'Samarreta de hoquei', completed: false, icon: '👕' },
    { id: 'h2', text: 'Pantalons / Faldilla de joc', completed: false, icon: '🩳' },
    { id: 'h3', text: 'Mitjons llargs de hoquei', completed: false, icon: '🧦' },
    { id: 'h4', text: 'Canyelleres específiques hoquei', completed: false, icon: '🛡️' },
    { id: 'h5', text: 'Protector bucal (imprescindible)', completed: false, icon: '👄' },
    { id: 'h6', text: 'Estic de hoquei', completed: false, icon: '🏒' },
    { id: 'h7', text: 'Sabatilles de hoquei (gespa/turf)', completed: false, icon: '👟' },
    { id: 'h8', text: 'Roba interior de recanvi', completed: false, icon: '👕' },
    { id: 'h9', text: 'Xandall', completed: false, icon: '🧥' },
    { id: 'h10', text: 'Tovallola de dutxa', completed: false, icon: '🚿' },
    { id: 'h11', text: 'Xampú i Gel de dutxa', completed: false, icon: '🧴' },
    { id: 'h12', text: 'Desodorant', completed: false, icon: '✨' },
    { id: 'h13', text: 'Xancles dutxa', completed: false, icon: '🩴' },
    { id: 'h14', text: "Ampolla d'aigua", completed: false, icon: '💧' },
  ]
};

const LEISURE_LIST: LeisureActivity[] = [
  { id: 'l1', text: 'Dibujo Libre', icon: '🎨', type: 'indoor' },
  { id: 'l2', text: 'Lego / Construcción', icon: '🧱', type: 'indoor' },
  { id: 'l3', text: 'Leer Cómic', icon: '📖', type: 'indoor' },
  { id: 'l4', text: 'Caminar 15 min', icon: '🌳', type: 'outdoor' },
  { id: 'l5', text: 'Llamar a un amigo', icon: '📞', type: 'outdoor' },
  { id: 'l6', text: 'Patinar', icon: '🛼', type: 'outdoor' },
  { id: 'l7', text: 'Boxeo Aire (Sentado)', icon: '🥊', type: 'injury' },
  { id: 'l8', text: 'Yoga Silla', icon: '🪑', type: 'injury' },
  { id: 'l9', text: 'Natación Suave', icon: '🏊', type: 'injury' },
];

const getProfileDefaultRoutines = (profile: ProfileType, lang: Language): CalendarTask[] => {
  const t = translations[lang];
  const routines: CalendarTask[] = [];
  const days = [0, 1, 2, 3, 4]; // Mon-Fri

  if (profile === ProfileType.CHILD) {
    days.forEach(day => {
      routines.push(
        { id: `c-wake-${day}`, day, time: "08:00", title: t.r_wake },
        { id: `c-dress-${day}`, day, time: "08:15", title: t.r_dress },
        { id: `c-bkfst-${day}`, day, time: "08:30", title: t.r_breakfast },
        { id: `c-teeth-${day}`, day, time: "08:45", title: t.r_teeth },
        { id: `c-school-${day}`, day, time: "09:00", title: t.r_school, duration: 210 },
        { id: `c-lunch-${day}`, day, time: "12:30", title: t.r_lunch, duration: 150 },
        { id: `c-shower-${day}`, day, time: "19:00", title: t.r_shower },
        { id: `c-pack-${day}`, day, time: "19:30", title: t.r_pack },
        { id: `c-dinner-${day}`, day, time: "20:00", title: t.r_dinner },
        { id: `c-sleep-${day}`, day, time: "21:00", title: t.r_sleep }
      );
    });
  } else if (profile === ProfileType.TEEN) {
    days.forEach(day => {
      routines.push(
        { id: `t-wake-${day}`, day, time: "07:00", title: t.r_wake },
        { id: `t-rout-${day}`, day, time: "07:15", title: t.r_routines },
        { id: `t-inst-${day}`, day, time: "08:00", title: t.r_highschool, duration: 390 },
        { id: `t-shower-${day}`, day, time: "20:00", title: t.r_shower },
        { id: `t-pack-${day}`, day, time: "20:30", title: t.r_pack },
        { id: `t-dinner-${day}`, day, time: "21:00", title: t.r_dinner },
        { id: `t-sleep-${day}`, day, time: "22:30", title: t.r_sleep }
      );
    });
  } else if (profile === ProfileType.ADULT) {
    days.forEach(day => {
      routines.push(
        { id: `a-wake-${day}`, day, time: "07:00", title: t.r_meds, duration: 30 },
        { id: `a-coffee-${day}`, day, time: "07:30", title: t.r_coffee, duration: 30 },
        { id: `a-work1-${day}`, day, time: "08:30", title: t.r_work1, duration: 180 },
        { id: `a-lunch-${day}`, day, time: "13:30", title: t.r_lunch, duration: 60 },
        { id: `a-work2-${day}`, day, time: "15:00", title: t.r_work2, duration: 120 },
        { id: `a-home-${day}`, day, time: "18:00", title: t.r_home, duration: 60 },
        { id: `a-dinner-${day}`, day, time: "20:30", title: t.r_dinner },
        { id: `a-winddown-${day}`, day, time: "22:00", title: t.r_winddown, duration: 30 },
        { id: `a-sleep-${day}`, day, time: "23:00", title: t.r_sleep }
      );
    });
  }
  return routines;
};

const Fireworks: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const particles: any[] = [];
    class Particle {
      x: number; y: number; color: string; velocity: any; alpha: number;
      constructor(x: number, y: number, color: string) {
        this.x = x; this.y = y; this.color = color; this.alpha = 1;
        this.velocity = { x: (Math.random()-0.5)*10, y: (Math.random()-0.5)*10 };
      }
      draw() { ctx!.save(); ctx!.globalAlpha = this.alpha; ctx!.beginPath(); ctx!.arc(this.x,this.y,2.5,0,Math.PI*2); ctx!.fillStyle=this.color; ctx!.fill(); ctx!.restore(); }
      update() { this.x += this.velocity.x; this.y += this.velocity.y; this.alpha -= 0.01; }
    }
    const animate = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      if (Math.random() < 0.06) {
        const x = Math.random()*canvas.width, y = Math.random()*canvas.height*0.6;
        const color = `hsl(${Math.random()*360},100%,60%)`;
        for(let i=0;i<40;i++) particles.push(new Particle(x,y,color));
      }
      particles.forEach((p,i) => { if (p.alpha<=0) particles.splice(i,1); else { p.update(); p.draw(); } });
      requestAnimationFrame(animate);
    }; animate();
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100]" />;
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.SPANISH);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [coins, setCoins] = useState(100);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [activeAcc, setActiveAcc] = useState<string | null>(null);
  const [activeHouse, setActiveHouse] = useState<string | null>(null);
  const [houseColor, setHouseColor] = useState('#FFFFFF');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [voice, setVoice] = useState(VoiceChoice.FEMALE);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [weeklyTasks, setWeeklyTasks] = useState<CalendarTask[]>([]);
  const [customChecklists, setCustomChecklists] = useState<Record<string, TaskStep[]>>(INITIAL_CHECKLISTS);
  const [activeChecklistKey, setActiveChecklistKey] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  
  // New State for Calendar Zoom/Modal
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const [celebration, setCelebration] = useState(false);
  const [alarmType, setAlarmType] = useState(AlarmType.NEON_PULSE);
  const [musicType, setMusicType] = useState(MusicType.NONE);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [customDuration, setCustomDuration] = useState<string>(''); // For user input time

  const [isGenerating, setIsGenerating] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const t = translations[lang];

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
    const saved = localStorage.getItem('tempo_valles_data_v2');
    if (saved) {
      const data = JSON.parse(saved);
      setCoins(data.coins || 100);
      setOwnedItems(data.ownedItems || []);
      setWeeklyTasks(data.weeklyTasks || []);
      setCustomChecklists(data.customChecklists || INITIAL_CHECKLISTS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tempo_valles_data_v2', JSON.stringify({ coins, ownedItems, weeklyTasks, customChecklists }));
  }, [coins, ownedItems, weeklyTasks, customChecklists]);

  // Translate existing default routines when language changes
  useEffect(() => {
    setWeeklyTasks(prevTasks => {
      const t = translations[lang];
      return prevTasks.map(task => {
        // Child
        if (task.id.startsWith('c-wake-')) return { ...task, title: t.r_wake };
        if (task.id.startsWith('c-dress-')) return { ...task, title: t.r_dress };
        if (task.id.startsWith('c-bkfst-')) return { ...task, title: t.r_breakfast };
        if (task.id.startsWith('c-teeth-')) return { ...task, title: t.r_teeth };
        if (task.id.startsWith('c-school-')) return { ...task, title: t.r_school };
        if (task.id.startsWith('c-lunch-')) return { ...task, title: t.r_lunch };
        if (task.id.startsWith('c-shower-')) return { ...task, title: t.r_shower };
        if (task.id.startsWith('c-pack-')) return { ...task, title: t.r_pack };
        if (task.id.startsWith('c-dinner-')) return { ...task, title: t.r_dinner };
        if (task.id.startsWith('c-sleep-')) return { ...task, title: t.r_sleep };
        
        // Teen
        if (task.id.startsWith('t-wake-')) return { ...task, title: t.r_wake };
        if (task.id.startsWith('t-rout-')) return { ...task, title: t.r_routines };
        if (task.id.startsWith('t-inst-')) return { ...task, title: t.r_highschool };
        if (task.id.startsWith('t-shower-')) return { ...task, title: t.r_shower };
        if (task.id.startsWith('t-pack-')) return { ...task, title: t.r_pack };
        if (task.id.startsWith('t-dinner-')) return { ...task, title: t.r_dinner };
        if (task.id.startsWith('t-sleep-')) return { ...task, title: t.r_sleep };

        // Adult
        if (task.id.startsWith('a-wake-')) return { ...task, title: t.r_meds };
        if (task.id.startsWith('a-coffee-')) return { ...task, title: t.r_coffee };
        if (task.id.startsWith('a-work1-')) return { ...task, title: t.r_work1 };
        if (task.id.startsWith('a-lunch-')) return { ...task, title: t.r_lunch };
        if (task.id.startsWith('a-work2-')) return { ...task, title: t.r_work2 };
        if (task.id.startsWith('a-home-')) return { ...task, title: t.r_home };
        if (task.id.startsWith('a-dinner-')) return { ...task, title: t.r_dinner };
        if (task.id.startsWith('a-winddown-')) return { ...task, title: t.r_winddown };
        if (task.id.startsWith('a-sleep-')) return { ...task, title: t.r_sleep };

        return task;
      });
    });
  }, [lang]);

  // Adjust scroll position to center "Today" when calendar loads
  const calendarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (calendarRef.current) {
      const today = (new Date().getDay() + 6) % 7; // 0=Mon, 6=Sun
      // Rough calculation for scrolling to current day based on new large card width
      // Mobile width approx window width, Desktop approx 600px
      const isMobile = window.innerWidth < 768;
      const cardWidth = isMobile ? window.innerWidth : 600; 
      calendarRef.current.scrollLeft = today * cardWidth;
    }
  }, [profile, weeklyTasks]); // Run when profile loads or tasks change

  const selectProfile = (p: ProfileType) => {
    setProfile(p);
    // Always regenerate defaults based on current language for freshness, or check if empty
    // If we want to strictly follow "if no weekly tasks exist", we keep the check.
    // But if we want to ensure language matches, we might want to overwrite if they are default tasks.
    // For safety, let's stick to the existing logic: only if empty.
    if (weeklyTasks.length === 0) {
      setWeeklyTasks(getProfileDefaultRoutines(p, lang));
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
  };

  const handleTaskComplete = async (onTime: boolean) => {
    const updatedTasks = tasks.map(t => t.id === activeTaskId ? {...t, completed: true, onTime} : t);
    setTasks(updatedTasks);
    setActiveTaskId(null);
    if(onTime) {
      setCoins(c => c + 35);
      setCelebration(true);
      playVictoryTheme();
      setTimeout(() => { setCelebration(false); stopVictoryTheme(); }, 10000);
    } else {
      setCoins(c => c + 5);
    }
  };

  const deleteTaskFromHistory = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const buyItem = (item: Accessory) => {
    if (coins >= item.cost) {
      setCoins(c => c - item.cost);
      setOwnedItems([...ownedItems, item.id]);
      if (item.category === 'wearable') setActiveAcc(item.id);
      else setActiveHouse(item.id);
    }
  };

  const addTaskToCalendar = (task: Task, day: number) => {
    const calTask: CalendarTask = {
      id: Date.now().toString(),
      day,
      time: "09:00",
      title: task.title,
      duration: task.durationMinutes
    };
    setWeeklyTasks([...weeklyTasks, calTask]);
  };

  const removeCalendarTask = (id: string) => {
    setWeeklyTasks(weeklyTasks.filter(t => t.id !== id));
  };

  const updateChecklist = (key: string, steps: TaskStep[]) => {
    setCustomChecklists({...customChecklists, [key]: steps});
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    setIsGenerating(true);
    
    // Analyze task first
    const analysis = await analyzeTask(profile!, newTaskTitle, lang);
    
    let finalDuration = analysis.estimatedMinutes;
    let realityCheckNeeded = false;
    let realityCheckMsg = "";

    // If user provided a duration
    if (customDuration) {
      const userMin = parseInt(customDuration);
      if (!isNaN(userMin) && userMin > 0) {
        finalDuration = userMin;
        
        // Reality Check Logic: > 2x different?
        if (userMin < analysis.estimatedMinutes * 0.5) {
          realityCheckNeeded = true;
          realityCheckMsg = `${t.realityCheckTooFast} (${analysis.estimatedMinutes} min). ${analysis.feedback}`;
        } else if (userMin > analysis.estimatedMinutes * 2) {
          realityCheckNeeded = true;
          realityCheckMsg = `${t.realityCheckTooSlow} (${analysis.estimatedMinutes} min).`;
        }
      }
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      durationMinutes: finalDuration,
      completed: false,
      steps: analysis.steps,
      aiEstimatedMinutes: analysis.estimatedMinutes,
      aiFeedback: analysis.feedback
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setCustomDuration('');
    setIsGenerating(false);

    if (realityCheckNeeded) {
      setShowChat(true);
    }
  };

  const getDayName = (dayIndex: number) => {
    const keys = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    return t[keys[dayIndex]];
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="watermark-container"><Logo className="scale-[5]" /></div>
        <div className="max-w-4xl w-full space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-black"><span className="text-tdah-orange">{t.tempo}</span> <span className="text-tdah-blue">{t.title}</span></h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest">{t.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[ProfileType.CHILD, ProfileType.TEEN, ProfileType.ADULT].map(p => (
              <button key={p} onClick={() => selectProfile(p)} className="p-10 bg-white rounded-3xl shadow-xl hover:border-tdah-orange border-2 border-transparent transition-all flex flex-col items-center">
                <span className="text-6xl mb-4">{p === 'child' ? '🍭' : p === 'teen' ? '🎮' : '💼'}</span>
                <span className="text-2xl font-black uppercase text-tdah-blue">{t[p]}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center gap-6">
            <LanguageSelector selected={lang} onSelect={setLang} />
            {deferredPrompt && (
              <button onClick={handleInstall} className="bg-tdah-orange text-white px-8 py-3 rounded-full font-black text-xs uppercase shadow-lg hover:scale-105 transition-transform">
                📲 {t.install}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const todayIndex = (new Date().getDay() + 6) % 7; // Convert 0(Sun) -> 6, 1(Mon) -> 0

  return (
    <div className={`min-h-screen p-4 md:p-8 bg-slate-50 ${profile === 'child' ? 'font-child' : profile === 'teen' ? 'font-teen' : 'font-adult'}`}>
      {celebration && <Fireworks />}

      {/* ZOOM MODAL FOR CALENDAR */}
      {selectedDay !== null && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl flex flex-col animate-pulse-glow border-4 border-tdah-blue">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <div>
                <h3 className="text-3xl font-black text-tdah-blue uppercase">{getDayName(selectedDay)}</h3>
                {selectedDay === todayIndex && <span className="text-tdah-orange font-bold uppercase text-sm tracking-widest">Hoy / Avui / Today</span>}
              </div>
              <button onClick={() => setSelectedDay(null)} className="bg-slate-200 w-12 h-12 rounded-full font-black text-slate-500 hover:bg-rose-500 hover:text-white transition-colors text-xl">
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {weeklyTasks.filter(wt => wt.day === selectedDay).length === 0 ? (
                 <p className="text-slate-400 font-bold italic text-center py-10">No hay tareas / No hi ha tasques</p>
              ) : (
                weeklyTasks.filter(wt => wt.day === selectedDay).map(wt => (
                  <div key={wt.id} className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-100 flex justify-between items-center">
                    <div>
                       <div className="text-2xl font-black text-tdah-blue">{wt.title}</div>
                       <div className="text-lg font-bold text-slate-500 mt-1">🕒 {wt.time} {wt.duration ? `(${wt.duration}m)` : ''}</div>
                    </div>
                    <button onClick={() => removeCalendarTask(wt.id)} className="bg-rose-100 text-rose-500 p-4 rounded-xl hover:bg-rose-500 hover:text-white transition-colors">
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-center">
               <button onClick={() => setWeeklyTasks([...weeklyTasks, { id: Date.now().toString(), day: selectedDay, time: "10:00", title: "Nova tasca" }])} className="bg-tdah-blue text-white px-8 py-3 rounded-full font-black uppercase shadow-lg hover:scale-105 transition-transform">
                 + {t.newTask}
               </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="bg-white p-6 rounded-3xl shadow-md flex flex-wrap justify-between items-center gap-4 sticky top-4 z-50">
          <div className="flex items-center gap-4">
            <div className="relative">
              {activeHouse && <span className="absolute -top-10 -left-6 text-4xl animate-bounce" style={{color: houseColor}}>{ACCESSORIES.find(h => h.id === activeHouse)?.icon}</span>}
              <div className={`w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl shadow-inner ${celebration ? 'animate-bounce' : ''}`}>
                {selectedAvatar}
                {activeAcc && <span className="absolute -top-1 -right-1 text-xl">{ACCESSORIES.find(a => a.id === activeAcc)?.icon}</span>}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 font-black text-xl text-tdah-blue">🪙 {coins}</div>
              <button onClick={() => setProfile(null)} className="text-[10px] font-black uppercase text-tdah-orange underline">{t.changeProfile}</button>
            </div>
          </div>
          <div className="flex gap-4 items-center">
             <button 
               onClick={() => setShowChat(!showChat)}
               className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all ${showChat ? 'bg-tdah-orange scale-110' : 'bg-white hover:scale-105 hover:bg-orange-50'}`}
             >
               {showChat ? '❌' : '🤖'}
             </button>
             <div className="bg-slate-100 px-4 py-1 rounded-full text-[10px] font-black uppercase text-slate-500">{t[profile]}</div>
             {deferredPrompt && (
               <button onClick={handleInstall} className="hidden md:block bg-tdah-orange text-white px-4 py-1 rounded-full text-[10px] font-black uppercase shadow-sm">📲</button>
             )}
          </div>
        </div>

        {activeTaskId ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-2xl">
              <Timer voiceChoice={voice} initialMinutes={tasks.find(tk => tk.id === activeTaskId)?.durationMinutes || 15} onComplete={handleTaskComplete} alarmType={alarmType} profile={profile} musicType={musicType} lang={lang} />
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl space-y-4">
              <h3 className="text-xl font-black uppercase text-tdah-blue">📋 {t.steps}</h3>
              {tasks.find(tk => tk.id === activeTaskId)?.steps.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 font-bold">
                   <input type="checkbox" className="w-5 h-5 accent-tdah-orange" />
                   <span>{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        ) : celebration ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 bg-white rounded-3xl shadow-2xl border-4 border-tdah-orange">
             <div className="relative">
                <span className="text-9xl animate-dance block">{selectedAvatar}</span>
                {profile === 'teen' && <div className="absolute -bottom-4 bg-blue-600 text-white font-black px-6 py-2 rounded-full shadow-[0_0_20px_blue] animate-pulse">LIKE 👍</div>}
                {profile === 'adult' && <div className="absolute -bottom-4 bg-emerald-600 text-white font-black px-6 py-2 rounded-full shadow-lg">VICTORY 🏆</div>}
             </div>
             <h2 className="text-6xl font-black text-tdah-blue">{t.congrats}</h2>
             <p className="text-2xl font-bold text-emerald-600">✨ {t.earned} 35 {t.coins} ✨</p>
             <button onClick={() => { setCelebration(false); stopVictoryTheme(); }} className="px-12 py-5 bg-tdah-blue text-white rounded-full font-black text-4xl hover:scale-110 transition-transform shadow-2xl border-4 border-white">
               {t.done}
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
            {/* AI CHAT OVERLAY/SIDEBAR */}
            {showChat && (
              <div className="lg:col-span-1 fixed bottom-24 right-4 z-[100] w-[350px] md:w-[400px]">
                <AIChat 
                  profile={profile} 
                  lang={lang} 
                  activeTask={tasks.find(t => t.id === activeTaskId)} 
                />
              </div>
            )}

            <div className="lg:col-span-2 space-y-6">
              {/* TASKS */}
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                <h2 className="text-2xl font-black text-tdah-blue uppercase mb-6">➕ {t.newTask}</h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="flex-[2] p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold" placeholder="¿Qué vamos a hacer?" />
                  <input type="number" value={customDuration} onChange={e => setCustomDuration(e.target.value)} className="flex-1 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold" placeholder={t.minPlaceholder} />
                  <button onClick={handleAddTask} disabled={isGenerating} className="bg-tdah-orange text-white px-8 py-4 rounded-2xl font-black disabled:opacity-50 min-w-[100px]">
                    {isGenerating ? '...' : 'OK'}
                  </button>
                </div>
                <div className="mt-6 space-y-3">
                  {tasks.filter(tk => !tk.completed).map(tk => (
                    <div key={tk.id} className="p-4 bg-slate-50 rounded-2xl flex flex-wrap justify-between items-center gap-3 border border-slate-100 hover:border-tdah-blue transition-colors">
                      <div className="flex items-center gap-2">
                         <div className="w-10 h-10 rounded-full bg-blue-100 text-tdah-blue flex items-center justify-center font-black text-sm">{tk.durationMinutes}m</div>
                         <span className="font-black text-lg text-slate-700">{tk.title}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => addTaskToCalendar(tk, new Date().getDay() - 1)} className="text-[10px] font-black uppercase text-tdah-blue hover:underline">{t.addToCalendar}</button>
                        <button onClick={() => { setActiveTaskId(tk.id); if (tk.aiFeedback && (tk.durationMinutes < (tk.aiEstimatedMinutes || 0) * 0.5)) setShowChat(true); }} className="bg-tdah-blue text-white px-6 py-2 rounded-xl font-black uppercase text-xs">{t.start}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* HISTORY */}
              {tasks.some(t => t.completed) && (
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                  <h2 className="text-xl font-black text-tdah-blue uppercase mb-6">✅ {t.history}</h2>
                  <div className="space-y-3">
                    {tasks.filter(tk => tk.completed).map(tk => (
                      <div key={tk.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center border border-emerald-100">
                        <span className="font-bold text-slate-500 line-through">{tk.title} ({tk.durationMinutes}m)</span>
                        <button onClick={() => deleteTaskFromHistory(tk.id)} className="bg-rose-50 text-rose-500 px-4 py-1 rounded-lg text-[10px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all">{t.delete}</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WEEKLY CALENDAR - IMPROVED CAROUSEL (ONE DAY FOCUSED) */}
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-black text-tdah-blue uppercase">📅 {t.weekly}</h2>
                  <span className="text-xs font-bold text-slate-400">Scroll ↔</span>
                </div>
                
                {/* Scrollable Container */}
                <div ref={calendarRef} className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide px-[5%] md:px-[20%]">
                  {[0,1,2,3,4,5,6].map((day) => {
                    const isToday = day === todayIndex;
                    return (
                      <div 
                        key={day} 
                        className={`min-w-[90vw] md:min-w-[600px] flex-shrink-0 snap-center space-y-4 p-6 rounded-3xl border-4 transition-all relative shadow-lg ${isToday ? 'bg-orange-50 border-tdah-orange' : 'bg-slate-50 border-slate-100'}`}
                      >
                         <div className="flex justify-between items-center border-b-2 border-slate-200 pb-3 mb-2">
                           <div className="flex flex-col">
                             <div className={`font-black text-3xl uppercase ${isToday ? 'text-tdah-orange' : 'text-slate-400'}`}>
                               {getDayName(day)}
                             </div>
                             {isToday && <span className="text-xs font-bold text-tdah-blue tracking-wider">HOY / AVUI / TODAY</span>}
                           </div>
                           <button 
                             onClick={() => setSelectedDay(day)}
                             title={t.expand}
                             className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center hover:bg-tdah-blue hover:text-white transition-colors text-xl"
                           >
                             🔍
                           </button>
                         </div>
                         
                         <div className="space-y-3 h-[250px] overflow-y-auto custom-scrollbar">
                           {weeklyTasks.filter(wt => wt.day === day).length === 0 ? (
                             <div className="h-full flex flex-col items-center justify-center text-slate-300 font-bold italic space-y-2">
                               <span className="text-4xl">📭</span>
                               <span>No tasks</span>
                             </div>
                           ) : (
                             weeklyTasks.filter(wt => wt.day === day).map(wt => (
                               <div key={wt.id} className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm flex justify-between items-center group hover:border-tdah-blue transition-colors">
                                 <div>
                                    <div className="text-tdah-blue font-black text-lg">{wt.title}</div>
                                    <div className="text-sm font-bold text-slate-400 flex items-center gap-1">
                                      ⏰ {wt.time} {wt.duration && <span className="bg-blue-100 text-blue-600 px-2 rounded-full text-[10px]">{wt.duration}m</span>}
                                    </div>
                                 </div>
                                 <button onClick={() => removeCalendarTask(wt.id)} className="bg-rose-50 text-rose-500 w-8 h-8 rounded-lg flex items-center justify-center font-bold hover:bg-rose-500 hover:text-white transition-all">×</button>
                               </div>
                             ))
                           )}
                         </div>
                         <button onClick={() => setWeeklyTasks([...weeklyTasks, { id: Date.now().toString(), day, time: "10:00", title: "Nova tasca" }])} className="w-full py-3 text-sm font-black uppercase text-slate-400 hover:text-white hover:bg-tdah-blue transition-colors border-2 border-dashed border-slate-300 rounded-xl hover:border-tdah-blue">+ {t.newTask}</button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CHECKLISTS CUSTOMIZATION */}
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                <h2 className="text-xl font-black text-tdah-blue uppercase mb-6">☑️ {t.checklists}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.keys(customChecklists).map(key => {
                    if (profile !== ProfileType.ADULT && key === 'adult_essentials') return null;
                    
                    let icon = '📝';
                    if (key === 'backpack') icon = '🎒';
                    else if (key === 'sports') icon = '🏀';
                    else if (key === 'football') icon = '⚽';
                    else if (key === 'hockey') icon = '🏒';
                    else if (key === 'adult_essentials') icon = '👜';
                    else if (key === 'essentials') icon = '🔑';

                    return (
                      <button key={key} onClick={() => setActiveChecklistKey(activeChecklistKey === key ? null : key)} className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${activeChecklistKey === key ? 'bg-orange-50 border-tdah-orange' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                        <span className="text-3xl">{icon}</span>
                        <span className="text-[10px] font-black uppercase">{t[key] || key}</span>
                      </button>
                    );
                  })}
                </div>
                {activeChecklistKey && (
                  <div className="mt-6 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 space-y-4">
                    <div className="flex justify-between items-center"><h4 className="font-black uppercase text-tdah-blue text-sm">Editando: {t[activeChecklistKey]}</h4><button onClick={() => setActiveChecklistKey(null)} className="text-xs font-bold text-slate-400 uppercase">×</button></div>
                    <div className="space-y-2">
                      {customChecklists[activeChecklistKey].map(s => (
                        <div key={s.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                           <span className="text-sm">{s.icon || '🔹'}</span>
                           <input type="text" value={s.text} onChange={e => {
                             const steps = customChecklists[activeChecklistKey].map(step => step.id === s.id ? {...step, text: e.target.value} : step);
                             updateChecklist(activeChecklistKey, steps);
                           }} className="flex-1 text-sm font-bold bg-transparent outline-none" />
                           <button onClick={() => {
                             const steps = customChecklists[activeChecklistKey].filter(step => step.id !== s.id);
                             updateChecklist(activeChecklistKey, steps);
                           }} className="text-rose-400 hover:text-rose-600">×</button>
                        </div>
                      ))}
                      <button onClick={() => {
                        const steps = [...customChecklists[activeChecklistKey], { id: Date.now().toString(), text: "Nou element", completed: false }];
                        updateChecklist(activeChecklistKey, steps);
                      }} className="w-full py-2 bg-white rounded-lg border-2 border-dashed border-slate-300 text-xs font-black uppercase text-slate-400 hover:text-tdah-blue hover:border-tdah-blue">+ {t.addStep}</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
               {/* SHOP */}
               <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-amber-100 space-y-6">
                 <h2 className="text-xl font-black uppercase text-tdah-blue">🏠 {t.evolution}</h2>
                 <div className="grid grid-cols-2 gap-3">
                    {ACCESSORIES.map(acc => {
                      const owned = ownedItems.includes(acc.id);
                      return (
                        <button key={acc.id} onClick={() => owned ? (acc.category === 'house' ? setActiveHouse(acc.id) : setActiveAcc(acc.id)) : buyItem(acc)} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${owned ? 'border-tdah-blue bg-blue-50' : (coins >= acc.cost ? 'border-amber-200' : 'opacity-40')}`}>
                           <span className="text-3xl">{acc.icon}</span>
                           <span className="text-[10px] font-black uppercase text-center">{acc.name}</span>
                           <span className="text-[10px] font-bold text-amber-600">{owned ? t.owned : `🪙 ${acc.cost}`}</span>
                        </button>
                      );
                    })}
                 </div>
               </div>

               {/* LEISURE */}
               <div className="bg-white p-8 rounded-3xl shadow-lg border border-emerald-100">
                 <h2 className="text-xl font-black text-tdah-blue uppercase mb-6">🎯 {t.leisure}</h2>
                 <div className="space-y-6">
                   {['indoor', 'outdoor', 'injury'].map(cat => (
                     <div key={cat} className="space-y-2">
                       <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t[cat]}</h3>
                       <div className="grid grid-cols-1 gap-2">
                         {LEISURE_LIST.filter(l => l.type === cat).map(l => (
                           <div key={l.id} className="p-3 bg-slate-50 rounded-xl text-xs font-bold border border-slate-100 flex items-center gap-3">
                             <span className="text-lg">{l.icon}</span> {l.text}
                           </div>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
