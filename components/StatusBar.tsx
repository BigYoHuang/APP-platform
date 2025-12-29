import React, { useState, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';

interface StatusBarProps {
  lightMode?: boolean; // True = Dark text (for light backgrounds), False = White text
  showHome?: boolean;  // Whether to show the Home button
  onHomeClick?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  lightMode = false, 
  showHome = false, 
  onHomeClick 
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Determine text/icon color
  const textColor = lightMode ? 'text-slate-900' : 'text-white';
  const buttonHover = lightMode ? 'active:bg-slate-200/50' : 'active:bg-white/20';

  return (
    <div className={`fixed top-0 left-0 right-0 h-10 px-4 sm:px-6 flex justify-between items-center z-[100] transition-colors duration-300 font-medium select-none pointer-events-none`}>
      {/* Left Side: Home Button or Time */}
      <div className={`flex items-center gap-2 min-w-[80px] pointer-events-auto ${textColor}`}>
        {showHome ? (
          <button 
            onClick={onHomeClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 -ml-2 rounded-full backdrop-blur-md transition-all duration-200 ${buttonHover} animate-in fade-in slide-in-from-left-2`}
          >
            <LayoutGrid size={18} strokeWidth={2.5} />
            <span className="text-sm font-bold tracking-tight">主畫面</span>
          </button>
        ) : (
          <span className="text-sm font-semibold tracking-wide tabular-nums">
            {formatTime(time)}
          </span>
        )}
      </div>

      {/* Center: Time (only show if Home button is active on left, to keep balance) */}
      {showHome && (
        <div className={`absolute left-1/2 -translate-x-1/2 text-sm font-semibold tracking-wide tabular-nums opacity-0 sm:opacity-100 transition-opacity ${textColor}`}>
          {formatTime(time)}
        </div>
      )}

      {/* Right Side: Company Name - Increased size x1.2 (text-xs -> text-[13px] approx) */}
      <div className={`flex items-center gap-2.5 min-w-[80px] justify-end ${textColor}`}>
        <span className="text-[13px] sm:text-sm font-bold tracking-widest opacity-90">合煜消防</span>
      </div>
    </div>
  );
};