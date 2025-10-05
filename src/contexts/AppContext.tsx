'use client';

import type { Role, User } from '@/lib/types';
import { users } from '@/lib/data';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppContextType {
  currentUser: User | null;
  login: (role: Role) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUserRole = localStorage.getItem('userRole');
    if (storedUserRole) {
      const user = users.find(u => u.role === storedUserRole);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, []);

  useEffect(() => {
    if (!currentUser && pathname !== '/login') {
      router.push('/login');
    } else if (currentUser && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [currentUser, pathname, router]);

  const login = (role: Role) => {
    const user = users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('userRole', role);
      router.push('/dashboard');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  const value = { currentUser, login, logout };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
