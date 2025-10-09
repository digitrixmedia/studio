
'use client';

import type { FranchiseOutlet, Role, User, MenuItem, MenuCategory, Order, OrderItem, OrderType, AppOrder } from '@/lib/types';
import { users, menuItems as initialMenuItems, menuCategories as initialMenuCategories, subscriptions } from '@/lib/data';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from './SettingsContext';

interface AppContextType {
  currentUser: User | null;
  selectedOutlet: FranchiseOutlet | null;
  menuItems: MenuItem[];
  menuCategories: MenuCategory[];
  orders: AppOrder[];
  setOrders: React.Dispatch<React.SetStateAction<AppOrder[]>>;
  heldOrders: AppOrder[];
  setHeldOrders: React.Dispatch<React.SetStateAction<AppOrder[]>>;
  activeOrderId: string | null;
  setActiveOrderId: React.Dispatch<React.SetStateAction<string | null>>;
  addOrder: () => void;
  removeOrder: (orderId: string) => void;
  updateOrder: (orderId: string, updates: Partial<AppOrder>) => void;
  holdOrder: (orderId: string) => void;
  resumeOrder: (orderId: string) => void;
  getOrderByTable: (tableId: string) => AppOrder | undefined;
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  setMenuCategories: React.Dispatch<React.SetStateAction<MenuCategory[]>>;
  loadOrder: (order: Order) => void;
  login: (role: Role) => void;
  logout: () => void;
  selectOutlet: (outlet: FranchiseOutlet) => void;
  clearSelectedOutlet: () => void;
  createNewOrder: () => AppOrder;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

let orderCounter = 1;

const createNewOrder = (): AppOrder => ({
  id: `order-${Date.now()}`,
  orderNumber: `${1000 + orderCounter++}`,
  items: [],
  customer: { name: '', phone: '' },
  orderType: 'Dine-In',
  tableId: '',
  discount: 0,
});

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedOutlet, setSelectedOutlet] = useState<FranchiseOutlet | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(initialMenuCategories);
  
  const [orders, setOrders] = useState<AppOrder[]>([createNewOrder()]);
  const [heldOrders, setHeldOrders] = useState<AppOrder[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(orders[0].id);

  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { setSetting } = useSettings();

  useEffect(() => {
    const storedUserRole = localStorage.getItem('userRole') as Role | null;
    const storedOutlet = localStorage.getItem('selectedOutlet');
    
    if (storedUserRole) {
      login(storedUserRole, true); // Pass a flag to prevent immediate redirection
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentUser) {
      // If no user is logged in, and we are not on the login page, redirect to login
      if (!pathname.startsWith('/login')) {
        router.push('/login');
      }
      return;
    }

    const isLoginPage = pathname.startsWith('/login');
    const isSuperAdminPath = pathname.startsWith('/super-admin');
    const isFranchisePath = pathname.startsWith('/franchise');
    const isAppPath = !isSuperAdminPath && !isFranchisePath && !isLoginPage;

    const userRole = currentUser.role;

    // 1. If user is on the login page, redirect them to their correct dashboard
    if (isLoginPage) {
      if (userRole === 'Super Admin') router.push('/super-admin/dashboard');
      else if (userRole === 'Admin') router.push('/franchise/dashboard');
      else router.push('/dashboard');
      return;
    }

    // 2. Handle role-based access to different app sections
    switch (userRole) {
      case 'Super Admin':
        // If a Super Admin is NOT in the super admin section, redirect them.
        if (!isSuperAdminPath) {
          router.push('/super-admin/dashboard');
        }
        break;
      
      case 'Admin':
        // If Franchise Admin has selected an outlet, they should be in the main app.
        if (selectedOutlet) {
          if (!isAppPath) {
            router.push('/dashboard');
          }
        } 
        // If no outlet is selected, they should be in the franchise section.
        else {
          if (!isFranchisePath) {
            router.push('/franchise/dashboard');
          }
        }
        break;

      default: // For Manager, Cashier, Waiter, Kitchen
        // If a regular user is NOT in the main app section, redirect them.
        if (!isAppPath) {
          router.push('/dashboard');
        }
        break;
    }
  }, [currentUser, selectedOutlet, pathname, router]);

  const login = (role: Role, isInitialLoad = false) => {
    const user = users.find(u => u.role === role);
    if (user) {
      // Super Admins can always log in
      if (user.role === 'Super Admin') {
        setCurrentUser(user);
        localStorage.setItem('userRole', role);
        if (!isInitialLoad) router.push('/super-admin/dashboard');
        return;
      }
      
      // Check subscription status for all other users
      const userSubscription = subscriptions.find(s => s.id === user.subscriptionId);
      if (userSubscription && userSubscription.status === 'Active') {
        setCurrentUser(user);
        localStorage.setItem('userRole', role);
        if (!isInitialLoad) {
           if (role === 'Admin') {
            router.push('/franchise/dashboard');
          } else {
            router.push('/dashboard');
          }
        }
      } else if (!isInitialLoad) { // Only show toast on explicit login attempts
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: `Your subscription is ${userSubscription?.status || 'not found'}. Please contact support.`,
        });
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
  
  const addOrder = () => {
    const newOrder = createNewOrder();
    setOrders(prev => [...prev, newOrder]);
    setActiveOrderId(newOrder.id);
  };

  const removeOrder = (orderId: string) => {
    setOrders(prev => {
        const newOrders = prev.filter(o => o.id !== orderId);
        if (newOrders.length === 0) {
            const newOrder = createNewOrder();
            setActiveOrderId(newOrder.id);
            return [newOrder];
        }
        if (activeOrderId === orderId) {
            setActiveOrderId(newOrders[0].id);
        }
        return newOrders;
    });
  };

  const updateOrder = (orderId: string, updates: Partial<AppOrder>) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
  };
  
  const getOrderByTable = (tableId: string) => {
      return orders.find(o => o.tableId === tableId && o.orderType === 'Dine-In');
  }

  const holdOrder = (orderId: string) => {
    const orderToHold = orders.find(o => o.id === orderId);
    if (!orderToHold) return;

    if (orderToHold.items.length === 0) {
      toast({
        variant: "destructive",
        title: "Cannot Hold Empty Order",
        description: "Add items to the order before placing it on hold.",
      });
      return;
    }

    setHeldOrders(prev => [...prev, orderToHold]);
    removeOrder(orderId);
    toast({
      title: "Order Held",
      description: `Order #${orderToHold.orderNumber} for ${orderToHold.customer.name || 'a customer'} has been put on hold.`,
    });
  };

  const resumeOrder = (orderId: string) => {
    const orderToResume = heldOrders.find(o => o.id === orderId);
    if (!orderToResume) return;

    setOrders(prev => [...prev, orderToResume]);
    setHeldOrders(prev => prev.filter(o => o.id !== orderId));
    setActiveOrderId(orderToResume.id);
    toast({
      title: "Order Resumed",
      description: `Order #${orderToResume.orderNumber} for ${orderToResume.customer.name || 'a customer'} is now active.`,
    });
  };

  const loadOrder = (order: Order) => {
    const newAppOrder: AppOrder = {
        id: `order-${Date.now()}`,
        orderNumber: order.orderNumber,
        items: order.items,
        customer: {
            name: order.customerName || '',
            phone: order.customerPhone || '',
        },
        orderType: order.type,
        tableId: order.tableId || '',
        discount: order.discount || 0,
    };
    setSetting('discountValue', order.discount || 0);

    const existingOrderIndex = orders.findIndex(o => o.items.length === 0);
    if(existingOrderIndex !== -1) {
        setOrders(prev => {
            const newOrders = [...prev];
            newOrders[existingOrderIndex] = newAppOrder;
            return newOrders;
        });
        setActiveOrderId(newAppOrder.id);
    } else {
        setOrders(prev => [...prev, newAppOrder]);
        setActiveOrderId(newAppOrder.id);
    }
  };

  const value = { 
    currentUser, 
    selectedOutlet, 
    login, 
    logout, 
    selectOutlet, 
    clearSelectedOutlet, 
    menuItems, 
    menuCategories, 
    setMenuItems, 
    setMenuCategories,
    orders,
    setOrders,
    heldOrders,
    setHeldOrders,
    activeOrderId,
    setActiveOrderId,
    addOrder,
    removeOrder,
    updateOrder,
    holdOrder,
    resumeOrder,
    getOrderByTable,
    loadOrder,
    createNewOrder,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
