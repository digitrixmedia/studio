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
    } else {
        if (!pathname.startsWith('/login')) {
             router.push('/login');
        }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      const isSuperAdmin = currentUser.role === 'Super Admin';
      const isSuperAdminPath = pathname.startsWith('/super-admin');
      const isAppPath = pathname.startsWith('/(app)') || ['/dashboard', '/orders', '/tables', '/kitchen', '/menu', '/inventory', '/reports', '/staff'].some(p => pathname.startsWith(p));

      if (isSuperAdmin && !isSuperAdminPath) {
        router.push('/super-admin/dashboard');
      } else if (!isSuperAdmin && isSuperAdminPath) {
        router.push('/dashboard');
      } else if (pathname === '/login') {
         router.push(isSuperAdmin ? '/super-admin/dashboard' : '/dashboard');
      }
    } else if (!pathname.startsWith('/login')) {
      router.push('/login');
    }
  }, [currentUser, pathname, router]);

  const login = (role: Role) => {
    const user = users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('userRole', role);
      if (role === 'Super Admin') {
        router.push('/super-admin/dashboard');
      } else {
        router.push('/dashboard');
      }
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
