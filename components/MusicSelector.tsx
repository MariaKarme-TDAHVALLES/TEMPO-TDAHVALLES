
import React from 'react';
import { MusicType, Language } from '../types';
import { translations } from '../i18n';

interface MusicSelectorProps {
  selected: MusicType;
  onSelect: (type: MusicType) => void;
  lang: Language;
}

const MusicSelector: React.FC<MusicSelectorProps> = ({ selected, onSelect, lang }) => {
  const t = translations[lang];
  const options = [
    { type: MusicType.NONE, label: t.music_none, icon: '❌' },
    { type: MusicType.RELAXING, label: t.music_relax, icon: '🧘' },
    { type: MusicType.ALPHA_WAVES, label: t.music_alpha, icon: '🌊' },
    { type: MusicType.WHITE_NOISE, label: t.music_white, icon: '📺' },
    { type: MusicType.EIGHTIES, label: t.music_80s, icon: ' cassette' },
    { type: MusicType.CLASSICAL, label: t.music_classical, icon: '🎼' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">{t.music}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.type}
            onClick={() => onSelect(opt.type)}
            className={`px-3 py-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 text-[10px] font-black uppercase ${
              selected === opt.type 
                ? 'border-tdah-orange bg-white text-tdah-orange shadow-md scale-105' 
                : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
            }`}
          >
            <span className="text-xl">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MusicSelector;
