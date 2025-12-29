import React from 'react';
import { AppConfig } from '../types';

interface AppIconProps {
  app: AppConfig;
  onClick: (id: string) => void;
  showLabel?: boolean;
}

export const AppIcon: React.FC<AppIconProps> = ({ app, onClick, showLabel = true }) => {
  return (
    <div className="flex flex-col items-center gap-2 w-[80px] sm:w-[90px] animate-in fade-in zoom-in duration-500">
      <button
        onClick={() => onClick(app.id)}
        className="group relative w-[68px] h-[68px] sm:w-[74px] sm:h-[74px] rounded-[22px] transition-all duration-300 active:scale-95 hover:scale-105"
      >
        {/* Liquid Glass Container Layer */}
        <div className={`absolute inset-0 rounded-[22px] overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.6)] border border-white/20 backdrop-blur-md ${app.iconColor ? app.iconColor : 'bg-white/20'}`}>
          
          {/* Icon Image or Placeholder */}
          {app.iconImage ? (
             <img src={app.iconImage} alt={app.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-white/90 text-3xl font-bold mix-blend-overlay">
               {app.name.charAt(0)}
             </div>
          )}

          {/* Glossy Reflection (Top) */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
          
          {/* Specular Highlight (Corner) */}
          <div className="absolute -top-[20%] -right-[20%] w-[80%] h-[80%] bg-white/20 blur-xl rounded-full pointer-events-none" />
        </div>
      </button>

      {/* Label with shadow for readability on complex backgrounds. Removed truncate to allow wrapping for longer names (7 chars) */}
      {showLabel && (
        <span className="text-[12px] leading-tight font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none text-center w-full px-0.5 line-clamp-2 break-words">
          {app.name}
        </span>
      )}
    </div>
  );
};