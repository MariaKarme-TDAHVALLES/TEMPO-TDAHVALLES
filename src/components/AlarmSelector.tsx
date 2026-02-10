
import React from 'react';
import { AlarmType, Language } from '../types';
import { playAlarm } from '../utils/audio';
import { translations } from '../i18n';

interface AlarmSelectorProps {
  selected: AlarmType;
  onSelect: (type: AlarmType) => void;
  lang: Language;
}

const AlarmSelector: React.FC<AlarmSelectorProps> = ({ selected, onSelect, lang }) => {
  const t = translations[lang];
  const alarms = [
    { type: AlarmType.SIREN, label: t.siren, icon: '🚨', color: 'bg-red-500' },
    { type: AlarmType.SEISMIC, label: t.seismic, icon: '🌋', color: 'bg-tdah-orange' },
    { type: AlarmType.NEON_PULSE, label: t.neon, icon: '⚡', color: 'bg-tdah-blue' },
  ];

  const handleTest = (type: AlarmType) => {
    onSelect(type);
    playAlarm(type);
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">{t.alarm}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {alarms.map((a) => (
          <button
            key={a.type}
            onClick={() => handleTest(a.type)}
            className={`px-4 py-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-black text-sm uppercase ${
              selected === a.type 
                ? 'border-tdah-blue bg-white text-tdah-blue shadow-lg scale-105' 
                : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${a.color}`}></div>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AlarmSelector;
