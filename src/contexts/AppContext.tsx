
'use client';

import type { FranchiseOutlet, Role, User, MenuItem, MenuCategory, Order, OrderItem } from '@/lib/types';
import { users, menuItems as initialMenuItems, menuCategories as initialMenuCategories } from '@/lib/data';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppContextType {
  currentUser: User | null;
  selectedOutlet: FranchiseOutlet | null;
  menuItems: MenuItem[];
  menuCategories: MenuCategory[];
  currentOrder: OrderItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  setMenuCategories: React.Dispatch<React.SetStateAction<MenuCategory[]>>;
  setCurrentOrder: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  loadOrder: (order: Order) => void;
  login: (role: Role) => void;
  logout: () => void;
  selectOutlet: (outlet: FranchiseOutlet) => void;
  clearSelectedOutlet: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedOutlet, setSelectedOutlet] = useState<FranchiseOutlet | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(initialMenuCategories);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUserRole = localStorage.getItem('userRole') as Role | null;
    const storedOutlet = localStorage.getItem('selectedOutlet');
    
    if (storedUserRole) {
      const user = users.find(u => u.role === storedUserRole);
      if (user) {
        setCurrentUser(user);
      }
    }
    
    if (storedOutlet) {
      try {
        setSelectedOutlet(JSON.parse(storedOutlet));
      } catch (e) {
        localStorage.removeItem('selectedOutlet');
      }
    }
    
    if (!storedUserRole && !pathname.startsWith('/login')) {
         router.push('/login');
    }
  }, [router, pathname]);

  useEffect(() => {
    if (currentUser) {
      const isSuperAdmin = currentUser.role === 'Super Admin';
      const isFranchiseAdmin = currentUser.role === 'Admin';
      
      // If a franchise admin has selected an outlet, their context switches.
      if (isFranchiseAdmin && selectedOutlet) {
        // They should be in the app view, not franchise/super-admin views.
        if (pathname.startsWith('/franchise') || pathname.startsWith('/super-admin')) {
             router.push('/dashboard');
        }
        return;
      }

      const isGenericUser = !isSuperAdmin && !isFranchiseAdmin;

      const isLoginPage = pathname.startsWith('/login');
      const isSuperAdminPath = pathname.startsWith('/super-admin');
      const isFranchisePath = pathname.startsWith('/franchise');
      // Any page that isn't for a specific admin role or login
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
        // Redirect if user is in the wrong section of the app
        if (isSuperAdmin && !isSuperAdminPath) {
          router.push('/super-admin/dashboard');
        } else if (isFranchiseAdmin && !isFranchisePath && !selectedOutlet) {
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
  
  const loadOrder = (order: Order) => {
    setCurrentOrder(order.items);
    // Potentially load other order details like customer info, table etc.
    // This part is left for future expansion if needed.
  }

  const value = { currentUser, selectedOutlet, login, logout, selectOutlet, clearSelectedOutlet, menuItems, menuCategories, setMenuItems, setMenuCategories, currentOrder, setCurrentOrder, loadOrder };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
