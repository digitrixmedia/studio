
'use client';

import { AppContextProvider } from '@/contexts/AppContext';
import { SettingsProvider } from '@/contexts/SettingsContext';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <AppContextProvider>{children}</AppContextProvider>
    </SettingsProvider>
  );
}
