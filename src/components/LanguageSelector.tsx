
import React from 'react';
import { Language } from '../types';

interface LanguageSelectorProps {
  selected: Language;
  onSelect: (lang: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selected, onSelect }) => {
  const languages = [
    { code: Language.SPANISH, label: 'ES', flag: '🇪🇸' },
    { code: Language.CATALAN, label: 'CA', flag: '⬛🟨' },
    { code: Language.ENGLISH, label: 'EN', flag: '🇬🇧' },
    { code: Language.GERMAN, label: 'DE', flag: '🇩🇪' },
    { code: Language.FRENCH, label: 'FR', flag: '🇫🇷' },
    { code: Language.ARANESE, label: 'OC', flag: '⬛⬛' },
    { code: Language.ITALIAN, label: 'IT', flag: '🇮🇹' },
    { code: Language.BASQUE, label: 'EU', flag: '🟥⬜' },
    { code: Language.GALICIAN, label: 'GL', flag: '⬜🟦' },
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onSelect(lang.code)}
          title={lang.label}
          className={`px-3 py-1 rounded-full text-xs font-bold border-2 transition-all ${
            selected === lang.code
              ? 'bg-tdah-orange border-tdah-orange text-white'
              : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
