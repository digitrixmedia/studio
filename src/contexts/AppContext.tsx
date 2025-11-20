'use client';

import type { FranchiseOutlet, Role, User, MenuItem, MenuCategory, Order, OrderItem, OrderType, AppOrder, Table, Customer } from '@/lib/types';
import { users as initialUsersData, menuItems as initialMenuItems, menuCategories as initialMenuCategories, subscriptions, tables as initialTables, orders as mockOrders } from '@/lib/data';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from './SettingsContext';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUser, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

interface AppContextType {
  currentUser: User | null;
  selectedOutlet: FranchiseOutlet | null;
  menuItems: MenuItem[];
  menuCategories: MenuCategory[];
  orders: AppOrder[];
  setOrders: React.Dispatch<React.SetStateAction<AppOrder[]>>;
  pastOrders: Order[];
  setPastOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  heldOrders: AppOrder[];
  setHeldOrders: React.Dispatch<React.SetStateAction<AppOrder[]>>;
  customers: Customer[];
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void;
  activeOrderId: string | null;
  setActiveOrderId: React.Dispatch<React.SetStateAction<string | null>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  addOrder: () => void;
  removeOrder: (orderId: string) => void;
  updateOrder: (orderId: string, updates: Partial<AppOrder>) => void;
  holdOrder: (orderId: string) => void;
  resumeOrder: (orderId: string) => void;
  getOrderByTable: (tableId: string) => AppOrder | undefined;
  loadOrder: (order: Order) => void;
  loadOnlineOrderIntoPOS: (order: Order) => void;
  login: (email: string, password: string) => void;
  logout: () => void;
  selectOutlet: (outlet: FranchiseOutlet) => void;
  clearSelectedOutlet: () => void;
  createNewOrder: () => AppOrder;
  startOrderForTable: (tableId: string) => void;
  auth: ReturnType<typeof getAuth>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

let orderCounter = mockOrders.length + 1;

const createNewOrder = (): AppOrder => ({
  id: `order-${Date.now()}`,
  orderNumber: `${1000 + orderCounter++}`,
  items: [],
  customer: { name: '', phone: '' },
  orderType: 'dine-in',
  tableId: '',
  discount: 0,
  redeemedPoints: 0,
});

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedOutlet, setSelectedOutlet] = useState<FranchiseOutlet | null>(null);
  const menuItems = initialMenuItems;
  const menuCategories = initialMenuCategories;
  
  const [orders, setOrders] = useState<AppOrder[]>([createNewOrder()]);
  const [pastOrders, setPastOrders] = useState<Order[]>(mockOrders);
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [heldOrders, setHeldOrders] = useState<AppOrder[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(orders[0].id);
  const [users, setUsers] = useState<User[]>(initialUsersData);

  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { settings, setSetting } = useSettings();

  const { auth } = initializeFirebase();

  // Create Firebase users from mock data on initial load
  useEffect(() => {
    const createUsers = async () => {
      for (const user of initialUsersData) {
        try {
          await createUserWithEmailAndPassword(auth, user.email, 'password123');
          console.log(`User ${user.email} created successfully.`);
        } catch (error: any) {
          if (error.code === 'auth/email-already-in-use') {
            // This is expected on subsequent loads, so we can ignore it.
          } else {
            console.error(`Error creating user ${user.email}:`, error);
          }
        }
      }
    };
    createUsers();
  }, [auth]);

    const customers = useMemo(() => {
        const customerMap = new Map<string, Customer>();

        pastOrders.forEach(order => {
            if (order.customerPhone && order.status === 'completed') {
                let customer = customerMap.get(order.customerPhone);
                if (!customer) {
                    customer = {
                        id: `cust-${order.customerPhone}`,
                        name: order.customerName || 'Unknown',
                        phone: order.customerPhone,
                        totalOrders: 0,
                        totalSpent: 0,
                        loyaltyPoints: 0,
                        firstVisit: order.createdAt,
                        lastVisit: order.createdAt,
                        tier: 'New',
                        birthday: order.customerPhone === '9876543200' ? '1990-11-15' : undefined,
                    };
                }
                
                customer.totalOrders += 1;
                customer.totalSpent += order.total;
                if (order.createdAt < customer.firstVisit) customer.firstVisit = order.createdAt;
                if (order.createdAt > customer.lastVisit) customer.lastVisit = order.createdAt;
                
                customer.loyaltyPoints = Math.floor(customer.totalSpent / 10);
                if (customer.totalSpent > 5000) customer.tier = 'VIP';
                else if (customer.totalOrders > 5) customer.tier = 'Regular';

                customerMap.set(order.customerPhone, customer);
            }
        });

        return Array.from(customerMap.values()).sort((a,b) => b.totalSpent - a.totalSpent);
    }, [pastOrders]);

    const updateCustomer = (customerId: string, updates: Partial<Customer>) => {
        // In a real app, this would be an API call. Here we just simulate for the loyalty points.
        const customerToUpdate = customers.find(c => c.id === customerId);
        if (customerToUpdate) {
            // This is not persisted in this demo, but shows the mechanism
            console.log("Updating customer", customerId, "with", updates);
        }
    }


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser && firebaseUser.email) {
            // User is signed in.
            const appUser = users.find(u => u.email === firebaseUser.email);
            if (appUser) {
                setCurrentUser(appUser);
            } else {
                // This case can happen if a user is deleted from `data.ts` but not Firebase.
                // Or if a new user was just created and the local `users` state hasn't updated yet.
                // We'll rely on redirection logic to handle this gracefully.
                setCurrentUser(null);
            }
        } else {
            // User is signed out.
            setCurrentUser(null);
             if (!pathname.startsWith('/login')) {
                router.push('/login');
            }
        }
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, users]); // Add `users` as a dependency

  useEffect(() => {
    const storedOutlet = localStorage.getItem('selectedOutlet');
     if (storedOutlet) {
      try {
        setSelectedOutlet(JSON.parse(storedOutlet));
      } catch (e) {
        localStorage.removeItem('selectedOutlet');
      }
    }
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
    
    const redirectToDefaultScreen = () => {
        if (settings.defaultScreen === 'Dashboard') {
            router.push('/dashboard');
        } else if (settings.defaultScreen === 'Billing') {
            router.push('/orders');
        } else { // Table Management
            router.push('/tables');
        }
    }

    // 1. If user is on the login page, redirect them to their correct dashboard
    if (isLoginPage) {
      if (userRole === 'super-admin') router.push('/super-admin/dashboard');
      else if (userRole === 'admin') router.push('/franchise/dashboard');
      else if (userRole === 'waiter' || userRole === 'cashier') router.push('/orders');
      else {
        redirectToDefaultScreen();
      }
      return;
    }

    // 2. Handle role-based access to different app sections
    switch (userRole) {
      case 'super-admin':
        // If a Super Admin is NOT in the super admin section, redirect them.
        if (!isSuperAdminPath) {
          router.push('/super-admin/dashboard');
        }
        break;
      
      case 'admin':
        // If Franchise Admin has selected an outlet, they should be in the main app.
        if (selectedOutlet) {
          if (!isAppPath) {
            redirectToDefaultScreen();
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
          if (userRole === 'waiter' || userRole === 'cashier') {
            router.push('/orders');
          } else {
            redirectToDefaultScreen();
          }
        }
        break;
    }
  }, [currentUser, selectedOutlet, pathname, router, settings.defaultScreen]);

  const login = async (email: string, password: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle the user state update and redirection
    } catch (error: any) {
        let description = "An unknown error occurred.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = "Invalid email or password. Please try again.";
        }
        toast({
            variant: "destructive",
            title: "Login Failed",
            description,
        });
    }
  };

  const logout = async () => {
    await signOut(auth);
    setSelectedOutlet(null);
    localStorage.removeItem('selectedOutlet');
    router.push('/login');
  };
  
  const selectOutlet = (outlet: FranchiseOutlet) => {
    if (currentUser?.role === 'admin') {
      setSelectedOutlet(outlet);
      localStorage.setItem('selectedOutlet', JSON.stringify(outlet));
       if (settings.defaultScreen === 'Dashboard') {
        router.push('/dashboard');
      } else if (settings.defaultScreen === 'Billing') {
        router.push('/orders');
      } else {
        router.push('/tables');
      }
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
      const table = tables.find(t => t.id === tableId);
      if (table && table.currentOrderId) {
        return orders.find(o => o.id === table.currentOrderId);
      }
      // Fallback for orders that might not have currentOrderId set on the table
      return orders.find(o => o.tableId === tableId && o.orderType === 'dine-in');
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
        redeemedPoints: 0,
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

  const loadOnlineOrderIntoPOS = (order: Order) => {
    const newBill: AppOrder = {
      id: `order-${Date.now()}`,
      orderNumber: order.orderNumber,
      items: order.items,
      customer: {
        name: order.customerName || 'Online Customer',
        phone: order.customerPhone || '',
      },
      orderType: 'delivery',
      tableId: '',
      discount: 0,
      redeemedPoints: 0,
    };

    const emptyOrderIndex = orders.findIndex(o => o.items.length === 0);
    if (emptyOrderIndex !== -1) {
      // Replace an empty bill if one exists
      setOrders(prev => {
        const newOrders = [...prev];
        newOrders[emptyOrderIndex] = newBill;
        return newOrders;
      });
      setActiveOrderId(newBill.id);
    } else {
      // Otherwise, add a new bill
      setOrders(prev => [...prev, newBill]);
      setActiveOrderId(newBill.id);
    }
  };

  const startOrderForTable = (tableId: string) => {
      const existingOrder = getOrderByTable(tableId);
      if (existingOrder) {
          setActiveOrderId(existingOrder.id);
          router.push('/orders');
          return;
      }
      
      const newOrder = createNewOrder();
      newOrder.tableId = tableId;
      newOrder.orderType = 'dine-in';
      newOrder.id = `order-table-${tableId}-${Date.now()}`; // More specific ID
      
      const emptyOrderIndex = orders.findIndex(o => o.items.length === 0 && !o.tableId);
      
      if (emptyOrderIndex !== -1) {
          setOrders(prev => {
              const newOrders = [...prev];
              newOrders[emptyOrderIndex] = newOrder;
              return newOrders;
          });
          setActiveOrderId(newOrder.id);
      } else {
          setOrders(prev => [...prev, newOrder]);
          setActiveOrderId(newOrder.id);
      }
      
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'occupied', currentOrderId: newOrder.id } : t));
      
      router.push('/orders');
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
    customers,
    updateCustomer,
    orders,
    setOrders,
    pastOrders,
    setPastOrders,
    users,
    setUsers,
    tables,
    setTables,
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
    loadOnlineOrderIntoPOS,
    createNewOrder,
    startOrderForTable,
    auth
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
