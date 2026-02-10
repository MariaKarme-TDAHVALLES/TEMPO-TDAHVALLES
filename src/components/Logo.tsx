
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12" }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-tdah-orange font-black text-2xl tracking-tighter uppercase mr-1">Tempo</span>
      <span className="text-tdah-blue font-black text-4xl tracking-tighter">TD</span>
      <div className="bg-[#E85B22] w-10 h-10 flex items-center justify-center rounded-sm">
        <span className="text-white font-black text-4xl leading-none">A</span>
      </div>
      <span className="text-tdah-blue font-black text-4xl tracking-tighter">H</span>
      <span className="text-tdah-blue font-bold text-xl ml-1">Vallès</span>
    </div>
  );
};

export default Logo;
