import React, { useState } from 'react';
import { APP_REGISTRY, getAppById } from './apps/registry';
import { AppIcon } from './components/AppIcon';
import { StatusBar } from './components/StatusBar';

// Liquid Glass Wallpaper
const WALLPAPER_URL = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

export default function App() {
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleOpenApp = (id: string) => {
    setActiveAppId(id);
  };

  const handleCloseApp = () => {
    setIsClosing(true);
    setTimeout(() => {
      setActiveAppId(null);
      setIsClosing(false);
    }, 400); 
  };

  const ActiveAppComponent = activeAppId ? getAppById(activeAppId)?.component : null;

  return (
    <div 
      className="relative w-full h-full bg-cover bg-center overflow-hidden font-sans select-none"
      style={{ backgroundImage: `url(${WALLPAPER_URL})` }}
    >
      {/* 
        StatusBar: 
        當沒有 App 開啟時，顯示白色文字，左側顯示時間。
        當 App 開啟時，顯示深色文字 (lightMode=true)，左側變為「回主畫面」按鈕。
      */}
      <StatusBar 
        lightMode={!!activeAppId} 
        showHome={!!activeAppId}
        onHomeClick={handleCloseApp}
      />

      {/* Liquid Glass Overlay Effect */}
      <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[1px] pointer-events-none" />

      {/* --- HOME SCREEN --- */}
      <div 
        className={`w-full h-full flex flex-col p-6 pt-16 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${activeAppId ? 'scale-90 opacity-0 blur-sm pointer-events-none' : 'scale-100 opacity-100 blur-0'}`}
      >
        {/* App Grid - Flow layout instead of fixed Dock */}
        <div className="flex flex-wrap content-start gap-x-6 gap-y-8 justify-start">
          {APP_REGISTRY.length > 0 ? (
            APP_REGISTRY.map(app => (
              <AppIcon key={app.id} app={app} onClick={handleOpenApp} />
            ))
          ) : (
            // Empty State - Liquid Glass Card
            <div className="w-full flex items-center justify-center h-[60vh]">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] text-center max-w-sm">
                <div className="text-4xl mb-4">💎</div>
                <h2 className="text-white text-xl font-semibold mb-2 tracking-wide">System Ready</h2>
                <p className="text-blue-100/80 text-sm leading-relaxed">
                  The platform is initialized. Upload your app packages to populate the grid.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- ACTIVE APP CONTAINER (Liquid Glass Modal) --- */}
      {ActiveAppComponent && (
        <div 
          className={`absolute inset-0 z-40 flex flex-col transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] 
            ${isClosing ? 'translate-y-[120%] opacity-50 scale-95' : 'translate-y-0 opacity-100 scale-100'}`}
        >
          {/* Glass App Container */}
          {/* 
            移除底部邊距 (m-2 -> 0) 和圓角，使其更像原生全螢幕 App。
            若您希望保留「卡片感」，可以改回 m-2 sm:m-4 rounded-[3rem]。
            這裡我改為 m-0 rounded-none 以獲得最大的操作空間。
          */}
          <div className="flex-1 bg-white/95 backdrop-blur-2xl shadow-2xl overflow-hidden relative flex flex-col pt-10">
            
            {/* App Content */}
            <div className="flex-1 w-full overflow-hidden relative z-10">
               {ActiveAppComponent}
            </div>

            {/* 原本底部的 Home Indicator 已移除，改用 StatusBar 控制 */}
          </div>
        </div>
      )}
    </div>
  );
}