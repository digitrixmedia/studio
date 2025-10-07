'use client';

import type { FranchiseOutlet, Role, User } from '@/lib/types';
import { users } from '@/lib/data';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppContextType {
  currentUser: User | null;
  selectedOutlet: FranchiseOutlet | null;
  login: (role: Role) => void;
  logout: () => void;
  selectOutlet: (outlet: FranchiseOutlet) => void;
  clearSelectedOutlet: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedOutlet, setSelectedOutlet] = useState<FranchiseOutlet | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUserRole = localStorage.getItem('userRole');
    const storedOutlet = localStorage.getItem('selectedOutlet');
    
    if (storedUserRole) {
      const user = users.find(u => u.role === storedUserRole);
      if (user) {
        setCurrentUser(user);
      }
    }
    
    if (storedOutlet) {
      setSelectedOutlet(JSON.parse(storedOutlet));
    }
    
    if (!storedUserRole && !pathname.startsWith('/login')) {
         router.push('/login');
    }
  }, [router, pathname]);

  useEffect(() => {
    if (currentUser) {
      // If an admin has selected an outlet, we don't want to redirect them.
      if (currentUser.role === 'Admin' && selectedOutlet) {
        if (!pathname.startsWith('/orders')) {
             router.push('/orders');
        }
        return;
      }

      const isSuperAdmin = currentUser.role === 'Super Admin';
      const isFranchiseAdmin = currentUser.role === 'Admin';
      const isGenericUser = !isSuperAdmin && !isFranchiseAdmin;

      const isLoginPage = pathname.startsWith('/login');
      const isSuperAdminPath = pathname.startsWith('/super-admin');
      const isFranchisePath = pathname.startsWith('/franchise');
      const isGenericAppPath = !isSuperAdminPath && !isFranchisePath && !isLoginPage;

      if (isLoginPage) {
        if (isSuperAdmin) {
          router.push('/super-admin/dashboard');
        } else if (isFranchiseAdmin) {
          router.push('/franchise/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        if (isSuperAdmin && !isSuperAdminPath) {
          router.push('/super-admin/dashboard');
        } else if (isFranchiseAdmin && !isFranchisePath) {
          router.push('/franchise/dashboard');
        } else if (isGenericUser && !isGenericAppPath) {
          router.push('/dashboard');
        }
      }
    } else if (!pathname.startsWith('/login')) {
      router.push('/login');
    }
  }, [currentUser, selectedOutlet, pathname, router]);

  const login = (role: Role) => {
    const user = users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('userRole', role);
      if (role === 'Super Admin') {
        router.push('/super-admin/dashboard');
      } else if (role === 'Admin') {
        router.push('/franchise/dashboard');
      }
      else {
        router.push('/dashboard');
      }
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setSelectedOutlet(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('selectedOutlet');
    router.push('/login');
  };
  
  const selectOutlet = (outlet: FranchiseOutlet) => {
    if (currentUser?.role === 'Admin') {
      setSelectedOutlet(outlet);
      localStorage.setItem('selectedOutlet', JSON.stringify(outlet));
      router.push('/orders');
    }
  };

  const clearSelectedOutlet = () => {
    setSelectedOutlet(null);
    localStorage.removeItem('selectedOutlet');
    router.push('/franchise/dashboard');
  };

  const value = { currentUser, selectedOutlet, login, logout, selectOutlet, clearSelectedOutlet };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
