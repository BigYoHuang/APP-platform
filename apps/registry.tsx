import React from 'react';
import { AppConfig } from '../types';
import ConstructionApp from './construction-photo-log/App';
import FirestopApp from './firestop-estimate/App';

// Use this placeholder when uploading new apps
export const PlaceholderApp = ({ name }: { name: string }) => (
  <div className="flex flex-col items-center justify-center h-full w-full bg-white/50 text-gray-800 p-8 text-center">
    <div className="text-6xl mb-4 drop-shadow-lg">✨</div>
    <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
      {name}
    </h1>
    <p className="text-gray-600 font-medium">Application content goes here.</p>
  </div>
);

// --- APP REGISTRY ---
export const APP_REGISTRY: AppConfig[] = [
  {
    id: 'construction-log',
    name: '施工紀錄',
    iconColor: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    iconImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop', // Construction themed image
    component: <ConstructionApp />
  },
  {
    id: 'firestop-estimate',
    name: '防火填塞估價',
    iconColor: 'bg-gradient-to-br from-orange-500 to-red-600',
    iconImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2669&auto=format&fit=crop', // Blueprint/Plan image
    component: <FirestopApp />
  }
];

export const getAppById = (id: string): AppConfig | undefined => {
  return APP_REGISTRY.find(app => app.id === id);
};