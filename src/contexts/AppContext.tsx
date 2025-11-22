
// /src/contexts/AppContext.tsx
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
import { initializeFirebase, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  writeBatch,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  getDoc,
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
  subscriptions: any[];
  setSubscriptions: React.Dispatch<React.SetStateAction<any[]>>;
  outlets: FranchiseOutlet[];
  setOutlets: React.Dispatch<React.SetStateAction<FranchiseOutlet[]>>;
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
  try {
    await signInWithEmailAndPassword(auth, superAdminEmail, superAdminPassword);
    await signOut(auth);
  } catch (e: any) {
    if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
      try {
        if (auth.currentUser) await signOut(auth);
        const uc = await createUserWithEmailAndPassword(auth, superAdminEmail, superAdminPassword);
        const superAdminUser: User = {
          id: uc.user.uid,
          name: 'Super Admin',
          email: superAdminEmail,
          role: 'super-admin',
        };
        await setDoc(doc(firestore, 'users', uc.user.uid), superAdminUser);
        await signOut(auth);
      } catch (err) {
        console.error('Failed creating super admin:', err);
      }
    } else if (e.code !== 'auth/wrong-password') {
      console.error('Super admin check error:', e);
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

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<FranchiseOutlet[]>([]);
  
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { settings, setSetting } = useSettings();

  // initialize firebase (your helper must return { auth, firestore })
  const { auth, firestore } = initializeFirebase();

  useEffect(() => {
    const setup = async () => {
      await ensureSuperAdminExists(auth, firestore);
      setIsInitializing(false);
    };
    setup();
  }, [auth, firestore]);

  // auth state listener -> load Firestore user doc
  useEffect(() => {
    if (isInitializing) return;
    const unsub = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (!fbUser) {
        setCurrentUser(null);
        return;
      }
      try {
        const uDoc = await getDoc(doc(firestore, 'users', fbUser.uid));
        if (uDoc.exists()) {
          setCurrentUser(uDoc.data() as User);
        }
        else {
          await signOut(auth); // Log out if Firestore user doc is missing
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
      // super-admin gets all users, franchise-admin gets all users under their subscription
      // for this app, we will assume a franchise admin can see all other admins (tenants)
      if (currentUser?.role === 'super-admin' || currentUser?.role === 'admin') {
         return collection(firestore, 'users');
      }
      return null;
    }, [firestore, currentUser])
  );

  const users = useMemo(() => usersData || [], [usersData]);


  // real-time collection hooks (keeps the rest of the app updated)
  const { data: menuItemsData } = useCollection<MenuItem>(
    useMemoFirebase(() => (firestore ? collection(firestore, 'menu_items') : null), [firestore])
  );
  const { data: menuCategoriesData } = useCollection<MenuCategory>(
    useMemoFirebase(() => (firestore ? collection(firestore, 'menu_categories') : null), [firestore])
  );
  const { data: tablesData, setData: setTables } = useCollection<Table>(
    useMemoFirebase(() => (firestore ? collection(firestore, 'tables') : null), [firestore])
  );
  const { data: ingredientsData, setData: setIngredients } = useCollection<Ingredient>(
    useMemoFirebase(() => (firestore ? collection(firestore, 'ingredients') : null), [firestore])
  );
  const { data: pastOrdersData, setData: setPastOrders } = useCollection<Order>(
    useMemoFirebase(() => (firestore ? query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'), limit(100)) : null), [firestore])
  );

  const menuItems = useMemo(() => menuItemsData || [], [menuItemsData]);
  const menuCategories = useMemo(() => menuCategoriesData || [], [menuCategoriesData]);
  const tables = useMemo(() => tablesData || [], [tablesData]);
  const ingredients = useMemo(() => ingredientsData || [], [ingredientsData]);
  const pastOrders = useMemo(() => pastOrdersData || [], [pastOrdersData]);
  

  // derived customers from completed past orders
  const customers = useMemo(() => {
    const map = new Map<string, Customer>();
    pastOrders.forEach((o) => {
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
    // implement if you add a /customers collection; for now it's a placeholder
    console.log('updateCustomer called', customerId, updates);
  };
  
  // This logic derives outlets and subscriptions directly from the users list
  useEffect(() => {
    if (!users || users.length === 0) {
      setOutlets([]);
      setSubscriptions([]);
      return;
    }
    const adminUsers = users.filter(u => u.role === 'admin');
    
    const derivedOutlets: FranchiseOutlet[] = adminUsers.map(user => ({
      id: user.subscriptionId || user.id, // Use subscriptionId if available
      name: `${user.name}'s Outlet`, // Simplified outlet name
      status: 'active', // Placeholder status
      managerName: user.name,
      // Sales data would be calculated from pastOrders filtered by outlet
    }));
    
    const derivedSubscriptions = adminUsers.map(user => ({
      id: user.subscriptionId || user.id,
      franchiseName: user.name,
      outletName: `${user.name}'s Outlet`,
      adminEmail: user.email,
      adminName: user.name,
      startDate: new Date(), // Placeholder
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Placeholder
      status: 'active', // Placeholder
      // Usage data would come from Firebase project analytics
      storageUsedMB: 0, 
      totalReads: 0,
      totalWrites: 0,
    }));
    
    setOutlets(derivedOutlets);
    setSubscriptions(derivedSubscriptions);
  }, [users]);


  // routing / local storage selected outlet rehydrate
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('selectedOutlet') : null;
    if (stored) {
      try {
        setSelectedOutlet(JSON.parse(stored));
      } catch {
        localStorage.removeItem('selectedOutlet');
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
  
    const publicPaths = ['/login'];
    if (!isInitializing && !currentUser && !publicPaths.includes(pathname)) {
        if (pathname !== '/login') router.replace('/login');
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
        if (selectedOutlet) {
          if (!isAppPath) redirectToDefaultScreen();
        } else {
          if (!isFranchisePath) router.push('/franchise/dashboard');
        }
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

  // order helpers (kept consistent with your earlier code)
  const addOrder = () => {
    const n = createNewOrder();
    setOrders((p) => [...p, n]);
    setActiveOrderId(n.id);
  };

  const removeOrder = (orderId: string) => {
    setOrders((prev) => {
      const newA = prev.filter((o) => o.id !== orderId);
      if (newA.length === 0) {
        const nn = createNewOrder();
        setActiveOrderId(nn.id);
        return [nn];
      }
      if (activeOrderId === orderId) setActiveOrderId(newA[0].id);
      return newA;
    });
  };

  const updateOrder = (orderId: string, updates: Partial<AppOrder>) =>
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o)));

  // finalizeOrder: IMPORTANT - integrate your existing finalizeOrder logic here (batch commit, inventory updates, etc.)
  const finalizeOrder = async (orderId: string) => {
    // TODO: paste your existing finalizeOrder implementation here that uses `firestore` and `currentUser`.
    console.warn('finalizeOrder placeholder called for', orderId);
  };

  const holdOrder = (orderId: string) => {
    const orderToHold = orders.find((o) => o.id === orderId);
    if (!orderToHold) return;
    if (!orderToHold.items.length) {
      toast({ variant: 'destructive', title: 'Cannot hold empty order' });
      return;
    }
    setHeldOrders((p) => [...p, orderToHold]);
    removeOrder(orderId);
    toast({ title: 'Order held', description: `Order #${orderToHold.orderNumber} is on hold.` });
  };

  const resumeOrder = (orderId: string) => {
    const orderToResume = heldOrders.find((o) => o.id === orderId);
    if (!orderToResume) return;
    setOrders((p) => [...p, orderToResume]);
    setHeldOrders((p) => p.filter((o) => o.id !== orderId));
    setActiveOrderId(orderToResume.id);
    toast({ title: 'Order resumed', description: `Order #${orderToResume.orderNumber} resumed.` });
  };

  const getOrderByTable = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (table && (table as any).currentOrderId) {
      return orders.find((o) => o.id === (table as any).currentOrderId);
    }
    return orders.find((o) => o.tableId === tableId && o.orderType === 'dine-in');
  };

  const loadOrder = (order: Order) => {
    const newAppOrder: AppOrder = {
      id: `order-${Date.now()}`,
      orderNumber: order.orderNumber,
      items: order.items,
      customer: { name: order.customerName || '', phone: order.customerPhone || '' },
      orderType: order.type,
      tableId: order.tableId || '',
      discount: order.discount || 0,
      redeemedPoints: 0,
    };
    const existingIndex = orders.findIndex((o) => o.items.length === 0);
    if (existingIndex !== -1) {
      setOrders((prev) => {
        const newArr = [...prev];
        newArr[existingIndex] = newAppOrder;
        return newArr;
      });
      setActiveOrderId(newAppOrder.id);
    } else {
      setOrders((p) => [...p, newAppOrder]);
      setActiveOrderId(newAppOrder.id);
    }
  };

  const loadOnlineOrderIntoPOS = (order: Order) => {
    const newBill: AppOrder = {
      id: `order-${Date.now()}`,
      orderNumber: order.orderNumber,
      items: order.items,
      customer: { name: order.customerName || 'Online Customer', phone: order.customerPhone || '' },
      orderType: 'delivery',
      tableId: '',
      discount: 0,
      redeemedPoints: 0,
    };
    const emptyIndex = orders.findIndex((o) => o.items.length === 0);
    if (emptyIndex !== -1) {
      setOrders((prev) => {
        const newArr = [...prev];
        newArr[emptyIndex] = newBill;
        return newArr;
      });
      setActiveOrderId(newBill.id);
    } else {
      setOrders((p) => [...p, newBill]);
      setActiveOrderId(newBill.id);
    }
  };

  const startOrderForTable = async (tableId: string) => {
    const existing = getOrderByTable(tableId);
    if (existing) {
      setActiveOrderId(existing.id);
      router.push('/orders');
      return;
    }
    const newOrder = createNewOrder();
    newOrder.tableId = tableId;
    newOrder.orderType = 'dine-in';
    newOrder.id = `order-table-${tableId}-${Date.now()}`;
    const emptyIndex = orders.findIndex((o) => o.items.length === 0 && !o.tableId);
    if (emptyIndex !== -1) {
      setOrders((prev) => {
        const newArr = [...prev];
        newArr[emptyIndex] = newOrder;
        return newArr;
      });
    } else setOrders((p) => [...p, newOrder]);
    setActiveOrderId(newOrder.id);
    try {
      await setDoc(doc(firestore, 'tables', tableId), { status: 'occupied', currentOrderId: newOrder.id }, { merge: true });
    } catch (err) {
      console.error('Error reserving table', err);
    }
    router.push('/orders');
  };

  const value = {
    currentUser,
    selectedOutlet,
    logout,
    selectOutlet,
    clearSelectedOutlet,
    menuItems,
    menuCategories,
    customers,
    updateCustomer,
    orders,
    setOrders,
    pastOrders: pastOrders || [],
    setPastOrders: setPastOrders as any,
    users,
    setUsers: setUsers as any,
    tables: tables || [],
    setTables: setTables as any,
    ingredients: ingredients || [],
    setIngredients: setIngredients as any,
    heldOrders,
    setHeldOrders,
    activeOrderId,
    setActiveOrderId,
    addOrder,
    removeOrder,
    updateOrder,
    finalizeOrder,
    holdOrder,
    resumeOrder,
    getOrderByTable,
    loadOrder,
    loadOnlineOrderIntoPOS,
    createNewOrder,
    startOrderForTable,
    auth,
    subscriptions,
    setSubscriptions,
    outlets,
    setOutlets,
  } as AppContextType;

  if (isInitializing) return <div className="flex h-screen w-full items-center justify-center"><p>Initializing application...</p></div>;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
