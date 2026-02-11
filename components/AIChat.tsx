
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ProfileType, Language, Task } from '../types';
import { translations } from '../i18n';
import { speakText } from '../utils/audio';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIChatProps {
  profile: ProfileType;
  lang: Language;
  activeTask?: Task;
}

const AIChat: React.FC<AIChatProps> = ({ profile, lang, activeTask }) => {
  const t = translations[lang];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  const systemInstructions = {
    [ProfileType.CHILD]: `Eres un compañero divertido llamado TEMPO. Ayudas a un niño con TDAH. Usa emojis, frases cortas y mucho ánimo. Si hay una tarea activa, ayuda a concentrarse en ella. Idioma: ${lang}.`,
    [ProfileType.TEEN]: `Eres un mentor 'cool' llamado TEMPO para un adolescente con TDAH. Sé directo, evita sonar como un padre. Da trucos de productividad (body doubling, pomodoro). Idioma: ${lang}.`,
    [ProfileType.ADULT]: `Eres un asistente ejecutivo experto en TDAH. Ofrece estrategias claras (time blocking, priorización). Sé empático pero enfocado en resultados. Idioma: ${lang}.`
  };

  // Initialize Chat Session
  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Create new chat session
    chatSessionRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstructions[profile],
      },
    });

    // Reset UI messages when profile changes significantly, 
    // but we could also keep them if we wanted persistence.
    // For now, let's keep it clean for the new persona.
    setMessages([]);

  }, [profile, lang]);

  // Notify AI about the active task context change
  useEffect(() => {
    if (activeTask && chatSessionRef.current) {
      // We send a hidden message to the model to update its context
      chatSessionRef.current.sendMessage({
        message: `[SYSTEM UPDATE: The user has started a new task: "${activeTask.title}". Duration: ${activeTask.durationMinutes} min. Help them stay focused on this.]`
      }).catch(console.error);
    }
  }, [activeTask?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !chatSessionRef.current) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await chatSessionRef.current.sendMessage({ message: userText });
      const modelText = response.text || "Hmm, no he podido pensar en nada.";
      
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "⚠️ Error de conexión. Inténtalo de nuevo." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeech = (text: string) => {
    speakText(text, lang);
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-3xl shadow-2xl border-2 border-tdah-blue overflow-hidden font-adult">
      <div className="bg-tdah-blue p-4 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="bg-tdah-orange w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner border-2 border-white">🤖</div>
          <div>
            <h3 className="text-white font-black uppercase text-sm tracking-wide">{t.chatTitle}</h3>
            {activeTask && (
              <p className="text-blue-200 text-[10px] font-bold truncate max-w-[150px]">Focus: {activeTask.title}</p>
            )}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
            <span className="text-4xl mb-4">💬</span>
            <p className="text-slate-500 font-bold text-sm italic">{t.chatEmpty}</p>
            {activeTask && (
              <button 
                onClick={() => setInput(`Ayúdame a empezar con: ${activeTask.title}`)}
                className="mt-4 text-xs bg-blue-100 text-tdah-blue px-3 py-2 rounded-full font-bold hover:bg-blue-200 transition-colors"
              >
                "Ayúdame con mi tarea"
              </button>
            )}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-tdah-orange text-white rounded-br-none' 
                  : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
              }`}>
                {m.text}
              </div>
              {m.role === 'model' && (
                <button 
                  onClick={() => handleSpeech(m.text)}
                  className="text-slate-400 hover:text-tdah-blue transition-colors px-1"
                  title="Leer en voz alta"
                >
                  🔊
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-200 flex gap-2 shadow-sm">
              <div className="w-2 h-2 bg-tdah-blue rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-tdah-blue rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-tdah-blue rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={t.chatPlaceholder}
          className="flex-1 p-3 bg-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-tdah-blue transition-all"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading}
          className="bg-tdah-blue text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-50 hover:bg-tdah-orange"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default AIChat;
