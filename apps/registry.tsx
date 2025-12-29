import React from 'react';
import { AppConfig } from '../types';

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
// Currently empty. Add your app configs here after uploading the zip.
export const APP_REGISTRY: AppConfig[] = [
  // Example format:
  // {
  //   id: 'my-app',
  //   name: 'My App',
  //   iconColor: 'bg-white',
  //   component: <MyCustomApp />
  // }
];

export const getAppById = (id: string): AppConfig | undefined => {
  return APP_REGISTRY.find(app => app.id === id);
};