// src/contexts/AppContext.tsx
'use client';

import type {
  FranchiseOutlet,
  Role,
  User,
  MenuItem,
  MenuCategory,
  Order,
  AppOrder,
  Table,
  Customer,
  Ingredient,
  Subscription,
} from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from './SettingsContext';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  type User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { initializeFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  getDoc,
  writeBatch,
  DocumentData,
  Query,
} from 'firebase/firestore';

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
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
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
  finalizeOrder: (orderId: string) => Promise<void>;
  holdOrder: (orderId: string) => void;
  resumeOrder: (orderId: string) => void;
  getOrderByTable: (tableId: string) => AppOrder | undefined;
  loadOrder: (order: Order) => void;
  loadOnlineOrderIntoPOS: (order: Order) => void;
  logout: () => void;
  selectOutlet: (outlet: FranchiseOutlet) => void;
  clearSelectedOutlet: () => void;
  createNewOrder: () => AppOrder;
  startOrderForTable: (tableId: string) => void;
  auth: ReturnType<typeof getAuth>;
  subscriptions: Subscription[];
  outlets: FranchiseOutlet[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

let orderCounter = 1;
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

async function ensureSuperAdminExists(auth: ReturnType<typeof getAuth>, firestore: any) {
  const superAdminEmail = 'superadmin@pos.com';
  const superAdminPassword = 'password123';
  
  // This function is for dev convenience. We'll try to create the user.
  // If the user already exists, Firebase will throw an 'auth/email-already-in-use' error, which we can safely ignore.
  // We will NOT automatically sign the user in.
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, superAdminEmail, superAdminPassword);
    const superAdminUser: User = { id: userCredential.user.uid, name: 'Super Admin', email: superAdminEmail, role: 'super-admin' };
    await setDoc(doc(firestore, 'users', userCredential.user.uid), superAdminUser);
    console.log('Super Admin user created successfully.');
    // Sign the user out immediately after creation so they have to log in manually.
    await signOut(auth);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      // This is expected and fine. The user exists.
    } else {
      console.error('Failed to ensure super-admin exists:', error);
    }
  }
}


export function AppContextProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedOutlet, setSelectedOutlet] = useState<FranchiseOutlet | null>(null);

  const [orders, setOrders] = useState<AppOrder[]>([createNewOrder()]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(orders[0].id);
  const [heldOrders, setHeldOrders] = useState<AppOrder[]>([]);

  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { settings } = useSettings();

  const { auth, firestore } = initializeFirebase();

  useEffect(() => {
    const setup = async () => {
      await ensureSuperAdminExists(auth, firestore);
      setIsInitializing(false);
    };
    if (process.env.NODE_ENV === 'development') {
      setup();
    } else {
      setIsInitializing(false);
    }
  }, [auth, firestore]);

  useEffect(() => {
    if (isInitializing) return;
    const unsub = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (!fbUser) {
        setCurrentUser(null);
        return;
      }
      try {
        const uDoc = await getDoc(doc(firestore, 'users', fbUser.uid));
        if (uDoc.exists()) setCurrentUser(uDoc.data() as User);
        else {
          await signOut(auth);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Error loading user doc:', err);
        setCurrentUser(null);
      }
    });
    return () => unsub();
  }, [auth, firestore, isInitializing]);

  const { data: usersData, setData: setUsers } = useCollection<User>(
    useMemoFirebase(() => {
      if (!firestore) return null;
      return collection(firestore, 'users');
    }, [firestore])
  );
  const users = usersData || [];

  // Fetch ALL outlets if user is a super-admin
  const { data: allOutletsData } = useCollection<FranchiseOutlet>(
    useMemoFirebase(() => {
      if (firestore && currentUser?.role === 'super-admin') {
        return collection(firestore, 'outlets');
      }
      return null;
    }, [firestore, currentUser])
  );

  // Fetch a SINGLE outlet if user is an admin with an outletId
  const { data: singleOutletData } = useDoc<FranchiseOutlet>(
    useMemoFirebase(() => {
      if (firestore && currentUser?.role === 'admin' && currentUser.outletId) {
        return doc(firestore, 'outlets', currentUser.outletId);
      }
      return null;
    }, [firestore, currentUser])
  );
  
  const outlets = useMemo(() => {
    if (currentUser?.role === 'super-admin') {
      return allOutletsData || [];
    }
    if (currentUser?.role === 'admin' && singleOutletData) {
      return [singleOutletData];
    }
    return [];
  }, [currentUser, allOutletsData, singleOutletData]);


  const subscriptions = useMemo(() => {
    if (!outlets || !users) return [];
    return outlets.map(o => {
        const owner = users.find(u => u.id === o.ownerId);
        return {
            id: o.id,
            franchiseName: owner?.name || 'Unknown Franchise',
            outletName: o.name,
            adminEmail: owner?.email || 'unknown',
            adminName: owner?.name,
            startDate: (o.createdAt as any)?.toDate() || new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            status: 'active', // This should come from the document data if available
            storageUsedMB: 0,
            totalReads: 0,
            totalWrites: 0,
        };
    });
  }, [outlets, users]);


  const { data: menuItemsData } = useCollection<MenuItem>(
    useMemoFirebase(() => {
      if (!firestore || !selectedOutlet) return null;
      return collection(firestore, `outlets/${selectedOutlet.id}/menu_items`);
    }, [firestore, selectedOutlet])
  );

  const { data: menuCategoriesData } = useCollection<MenuCategory>(
    useMemoFirebase(() => {
      if (!firestore || !selectedOutlet) return null;
      return collection(firestore, `outlets/${selectedOutlet.id}/menu_categories`);
    }, [firestore, selectedOutlet])
  );

  const { data: tablesData, setData: setTables } = useCollection<Table>(
    useMemoFirebase(() => {
      if (!firestore || !selectedOutlet) return null;
      return collection(firestore, `outlets/${selectedOutlet.id}/tables`);
    }, [firestore, selectedOutlet])
  );

  const { data: ingredientsData, setData: setIngredients } = useCollection<Ingredient>(
    useMemoFirebase(() => {
      if (!firestore || !selectedOutlet) return null;
      return collection(firestore, `outlets/${selectedOutlet.id}/ingredients`);
    }, [firestore, selectedOutlet])
  );

  const { data: pastOrdersData, setData: setPastOrders } = useCollection<Order>(
    useMemoFirebase(() => {
      if (!firestore || !selectedOutlet) return null;
      return query(collection(firestore, `outlets/${selectedOutlet.id}/orders`), orderBy('createdAt', 'desc'), limit(100));
    }, [firestore, selectedOutlet])
  );

  const menuItems = useMemo(() => menuItemsData || [], [menuItemsData]);
  const menuCategories = useMemo(() => menuCategoriesData || [], [menuCategoriesData]);
  const tables = useMemo(() => tablesData || [], [tablesData]);
  const ingredients = useMemo(() => ingredientsData || [], [ingredientsData]);
  const pastOrders = useMemo(() => pastOrdersData || [], [pastOrdersData]);

  const customers = useMemo(() => {
    const map = new Map<string, Customer>();
    (pastOrders || []).forEach((o) => {
      if (!o.customerPhone || o.status !== 'completed') return;
      let c = map.get(o.customerPhone);
      if (!c) {
        c = {
          id: `cust-${o.customerPhone}`,
          name: o.customerName || 'Unknown',
          phone: o.customerPhone,
          totalOrders: 0,
          totalSpent: 0,
          loyaltyPoints: 0,
          firstVisit: (o.createdAt as any)?.toDate ? (o.createdAt as any).toDate() : new Date(),
          lastVisit: (o.createdAt as any)?.toDate ? (o.createdAt as any).toDate() : new Date(),
          tier: 'New',
        };
      }
      c.totalOrders += 1;
      c.totalSpent += o.total;
      const dt = (o.createdAt as any)?.toDate ? (o.createdAt as any).toDate() : new Date();
      if (dt < c.firstVisit) c.firstVisit = dt;
      if (dt > c.lastVisit) c.lastVisit = dt;
      c.loyaltyPoints = Math.floor(c.totalSpent / 10);
      if (c.totalSpent > 5000) c.tier = 'VIP';
      else if (c.totalOrders > 5) c.tier = 'Regular';
      map.set(o.customerPhone, c);
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [pastOrders]);

  const updateCustomer = async (customerId: string, updates: Partial<Customer>) => {
    console.log('updateCustomer', customerId, updates);
  };

  useEffect(() => {
    const stored = localStorage.getItem('selectedOutlet');
    if (stored) {
      try { setSelectedOutlet(JSON.parse(stored)); } catch { localStorage.removeItem('selectedOutlet'); }
    }
  }, []);

  useEffect(() => {
    if (isInitializing) return;
    const publicPaths = ['/login'];
    if (!currentUser && !publicPaths.includes(pathname)) {
      router.replace('/login');
      return;
    }
    if (!currentUser) return;

    const isLoginPage = pathname.startsWith('/login');
    const isSuperAdminPath = pathname.startsWith('/super-admin');
    const isFranchisePath = pathname.startsWith('/franchise');
    const isAppPath = !isSuperAdminPath && !isFranchisePath && !isLoginPage;

    const redirectToDefaultScreen = () => {
      if (settings.defaultScreen === 'Dashboard') router.push('/dashboard');
      else if (settings.defaultScreen === 'Billing') router.push('/orders');
      else router.push('/tables');
    };

    if (isLoginPage) {
      if (currentUser.role === 'super-admin') router.push('/super-admin/dashboard');
      else if (currentUser.role === 'admin') router.push('/franchise/dashboard');
      else if (currentUser.role === 'waiter' || currentUser.role === 'cashier') router.push('/orders');
      else redirectToDefaultScreen();
      return;
    }

    switch (currentUser.role) {
      case 'super-admin':
        if (!isSuperAdminPath) router.push('/super-admin/dashboard');
        break;
      case 'admin':
        if (selectedOutlet) { if (!isAppPath) redirectToDefaultScreen(); }
        else { if (!isFranchisePath) router.push('/franchise/dashboard'); }
        break;
      default:
        if (!isAppPath) {
          if (currentUser.role === 'waiter' || currentUser.role === 'cashier') router.push('/orders');
          else redirectToDefaultScreen();
        }
        break;
    }
  }, [currentUser, selectedOutlet, pathname, settings.defaultScreen, isInitializing, router]);

  const logout = async () => {
    await signOut(auth);
    setSelectedOutlet(null);
    localStorage.removeItem('selectedOutlet');
    setCurrentUser(null);
    setOrders([createNewOrder()]);
    setActiveOrderId(orders[0].id);
    router.push('/login');
  };

  const selectOutlet = (outlet: FranchiseOutlet) => {
    if (currentUser?.role === 'admin') {
      setSelectedOutlet(outlet);
      localStorage.setItem('selectedOutlet', JSON.stringify(outlet));
      if (settings.defaultScreen === 'Dashboard') router.push('/dashboard');
      else if (settings.defaultScreen === 'Billing') router.push('/orders');
      else router.push('/tables');
    }
  };

  const clearSelectedOutlet = () => {
    setSelectedOutlet(null);
    localStorage.removeItem('selectedOutlet');
    router.push('/franchise/dashboard');
  };

  const addOrder = () => { const n = createNewOrder(); setOrders(p => [...p, n]); setActiveOrderId(n.id); };
  const removeOrder = (orderId: string) => {
    setOrders(prev => {
      const newA = prev.filter(o => o.id !== orderId);
      if (newA.length === 0) {
        const nn = createNewOrder(); setActiveOrderId(nn.id); return [nn];
      }
      if (activeOrderId === orderId) setActiveOrderId(newA[0].id);
      return newA;
    });
  };
  const updateOrder = (orderId: string, updates: Partial<AppOrder>) => setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));

  const finalizeOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !selectedOutlet || !currentUser) {
      toast({ variant: "destructive", title: "Error", description: "Cannot finalize order. Missing context." });
      return;
    }
    const batch = writeBatch(firestore);
    const orderRef = doc(collection(firestore, `outlets/${selectedOutlet.id}/orders`));
    const total = order.items.reduce((t, item) => t + (item.price || 0) * (item.quantity || 0), 0);
    const payload: Partial<Order> = {
      orderNumber: order.orderNumber, items: order.items, total, discount: order.discount || 0,
      type: order.orderType, customerName: order.customer.name || "", customerPhone: order.customer.phone || "",
      status: "completed", outletId: selectedOutlet.id, tableId: order.tableId || "",
      createdAt: serverTimestamp(), createdBy: currentUser.id,
    };
    batch.set(orderRef, payload);
    if (order.tableId) {
      const tableRef = doc(firestore, `outlets/${selectedOutlet.id}/tables`, order.tableId);
      batch.update(tableRef, { status: 'vacant', currentOrderId: "" });
    }
    await batch.commit();
    removeOrder(orderId);
    toast({ title: "Order completed", description: `Order #${order.orderNumber} saved.` });
  };

  const holdOrder = (orderId: string) => {
    const orderToHold = orders.find(o => o.id === orderId);
    if (!orderToHold || !orderToHold.items.length) { toast({ variant: 'destructive', title: 'Cannot hold empty order' }); return; }
    setHeldOrders(p => [...p, orderToHold]);
    removeOrder(orderId);
    toast({ title: 'Order held', description: `Order #${orderToHold.orderNumber} is on hold.` });
  };

  const resumeOrder = (orderId: string) => {
    const orderToResume = heldOrders.find(o => o.id === orderId);
    if (!orderToResume) return;
    setOrders(p => [...p, orderToResume]);
    setHeldOrders(p => p.filter(o => o.id !== orderId));
    setActiveOrderId(orderToResume.id);
    toast({ title: 'Order resumed', description: `Order #${orderToResume.orderNumber} resumed.` });
  };

  const getOrderByTable = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (table?.currentOrderId) return orders.find(o => o.id === table.currentOrderId);
    return orders.find(o => o.tableId === tableId && o.orderType === 'dine-in');
  };

  const loadOrder = (order: Order) => {
    const newAppOrder: AppOrder = {
      id: `order-${Date.now()}`, orderNumber: order.orderNumber, items: order.items,
      customer: { name: order.customerName || '', phone: order.customerPhone || '' },
      orderType: order.type, tableId: order.tableId || '', discount: order.discount || 0, redeemedPoints: 0,
    };
    const emptyIndex = orders.findIndex(o => o.items.length === 0);
    if (emptyIndex !== -1) {
      setOrders(prev => { const arr = [...prev]; arr[emptyIndex] = newAppOrder; return arr; });
      setActiveOrderId(newAppOrder.id);
    } else {
      setOrders(p => [...p, newAppOrder]);
      setActiveOrderId(newAppOrder.id);
    }
  };

  const loadOnlineOrderIntoPOS = (order: Order) => {
    const newBill: AppOrder = {
      id: `order-${Date.now()}`, orderNumber: order.orderNumber, items: order.items,
      customer: { name: order.customerName || 'Online Customer', phone: order.customerPhone || '' },
      orderType: 'delivery', tableId: '', discount: 0, redeemedPoints: 0,
    };
    const emptyIndex = orders.findIndex(o => o.items.length === 0);
    if (emptyIndex !== -1) {
      setOrders(prev => { const arr = [...prev]; arr[emptyIndex] = newBill; return arr; });
      setActiveOrderId(newBill.id);
    } else {
      setOrders(p => [...p, newBill]);
      setActiveOrderId(newBill.id);
    }
  };

  const startOrderForTable = async (tableId: string) => {
    const existing = getOrderByTable(tableId);
    if (existing) { setActiveOrderId(existing.id); router.push('/orders'); return; }
    const newOrder = createNewOrder();
    newOrder.tableId = tableId; newOrder.orderType = 'dine-in';
    newOrder.id = `order-table-${tableId}-${Date.now()}`;
    const emptyIndex = orders.findIndex(o => o.items.length === 0 && !o.tableId);
    if (emptyIndex !== -1) setOrders(prev => { const arr = [...prev]; arr[emptyIndex] = newOrder; return arr; });
    else setOrders(p => [...p, newOrder]);
    setActiveOrderId(newOrder.id);
    if (selectedOutlet) {
      const tableRef = doc(firestore, `outlets/${selectedOutlet.id}/tables`, tableId);
      await setDoc(tableRef, { status: 'occupied', currentOrderId: newOrder.id }, { merge: true });
    }
    router.push('/orders');
  };

  const value = {
    currentUser, selectedOutlet, logout, selectOutlet, clearSelectedOutlet,
    menuItems, menuCategories, customers, updateCustomer, orders, setOrders,
    pastOrders, setPastOrders: setPastOrders as any, users, setUsers: setUsers as any,
    tables, setTables: setTables as any, ingredients, setIngredients: setIngredients as any,
    heldOrders, setHeldOrders, activeOrderId, setActiveOrderId, addOrder, removeOrder,
    updateOrder, finalizeOrder, holdOrder, resumeOrder, getOrderByTable, loadOrder,
    loadOnlineOrderIntoPOS, createNewOrder, startOrderForTable, auth,
    subscriptions,
    outlets,
  } as AppContextType;

  if (isInitializing) return <div className="flex h-screen w-full items-center justify-center"><p>Initializing application...</p></div>;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
