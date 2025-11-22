
'use client';

import { AppContextProvider } from '@/contexts/AppContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <SettingsProvider>
        <AppContextProvider>{children}</AppContextProvider>
      </SettingsProvider>
    </FirebaseClientProvider>
  );
}
