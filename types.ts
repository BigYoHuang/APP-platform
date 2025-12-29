import React from 'react';

export interface AppConfig {
  id: string;
  name: string;
  iconColor: string; // Tailwind class for background color
  iconImage?: string; // Optional URL for icon image
  component: React.ReactNode;
  isDocked?: boolean;
}

export interface AppState {
  isOpen: boolean;
  activeAppId: string | null;
}