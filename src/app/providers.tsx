'use client';

import { AppContextProvider } from '@/contexts/AppContext';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return <AppContextProvider>{children}</AppContextProvider>;
}
