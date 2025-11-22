
'use client';

import type { FranchiseOutlet, Role, User, MenuItem, MenuCategory, Order, OrderItem, OrderType, AppOrder, Table, Customer, Ingredient } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from './SettingsContext';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUser, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { addDoc, collection, doc, serverTimestamp, setDoc, writeBatch, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';


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
  login: (email: string, password: string) => void;
  logout: () => void;
  selectOutlet: (outlet: FranchiseOutlet) => void;
  clearSelectedOutlet: () => void;
  createNewOrder: () => AppOrder;
  startOrderForTable: (tableId: string) => void;
  auth: ReturnType<typeof getAuth>;
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

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedOutlet, setSelectedOutlet] = useState<FranchiseOutlet | null>(null);
  
  const [orders, setOrders] = useState<AppOrder[]>([createNewOrder()]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(orders[0].id);

  const [heldOrders, setHeldOrders] = useState<AppOrder[]>([]);
  
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { settings, setSetting } = useSettings();

  const { auth, firestore } = initializeFirebase();
  
  const isAdminOrSuperAdmin = useMemo(() => {
    return currentUser?.role === 'admin' || currentUser?.role === 'super-admin';
  }, [currentUser]);

  const usersQuery = useMemoFirebase(() => {
    return isAdminOrSuperAdmin ? collection(firestore, 'users') : null;
  }, [firestore, isAdminOrSuperAdmin]);
  const { data: usersData } = useCollection<User>(usersQuery);

  const { data: menuItemsData } = useCollection<MenuItem>(useMemoFirebase(() => collection(firestore, 'menu_items'), [firestore]));
  const { data: menuCategoriesData } = useCollection<MenuCategory>(useMemoFirebase(() => collection(firestore, 'menu_categories'), [firestore]));
  const { data: tablesData, setData: setTables } = useCollection<Table>(useMemoFirebase(() => collection(firestore, 'tables'), [firestore]));
  const { data: ingredientsData, setData: setIngredients } = useCollection<Ingredient>(useMemoFirebase(() => collection(firestore, 'ingredients'), [firestore]));
  const { data: pastOrdersData, setData: setPastOrders } = useCollection<Order>(useMemoFirebase(() => query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'), limit(100)), [firestore]));
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const setupSuperAdmin = async () => {
      // Check if users collection is empty
      const usersCollection = collection(firestore, 'users');
      const usersSnapshot = await getDocs(query(usersCollection, limit(1)));
      if (usersSnapshot.empty) {
        console.log("No users found. Creating Super Admin account...");
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, 'superadmin@pos.com', 'password123');
          const superAdminUser: User = {
            id: userCredential.user.uid,
            name: 'Super Admin',
            email: 'superadmin@pos.com',
            role: 'super-admin',
          };
          await setDoc(doc(firestore, 'users', userCredential.user.uid), superAdminUser);
          console.log("Super Admin account created successfully.");
        } catch (error: any) {
          if (error.code === 'auth/email-already-in-use') {
            console.log("Super Admin email already exists in Auth. Skipping creation.");
          } else {
            console.error("Failed to create Super Admin:", error);
          }
        }
      } else {
        console.log("Users collection is not empty. Skipping Super Admin setup.");
      }
    };
    setupSuperAdmin();
  }, [auth, firestore]);
  

  useEffect(() => {
    if (usersData) setUsers(usersData);
  }, [usersData]);

  const menuItems = useMemo(() => menuItemsData || [], [menuItemsData]);
  const menuCategories = useMemo(() => menuCategoriesData || [], [menuCategoriesData]);
  const tables = useMemo(() => tablesData || [], [tablesData]);
  const ingredients = useMemo(() => ingredientsData || [], [ingredientsData]);
  const pastOrders = useMemo(() => pastOrdersData || [], [pastOrdersData]);


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
                        firstVisit: (order.createdAt as unknown as Timestamp).toDate(),
                        lastVisit: (order.createdAt as unknown as Timestamp).toDate(),
                        tier: 'New',
                        birthday: order.customerPhone === '9876543200' ? '1990-11-15' : undefined,
                    };
                }
                
                customer.totalOrders += 1;
                customer.totalSpent += order.total;
                const orderDate = (order.createdAt as unknown as Timestamp).toDate();
                if (orderDate < customer.firstVisit) customer.firstVisit = orderDate;
                if (orderDate > customer.lastVisit) customer.lastVisit = orderDate;
                
                customer.loyaltyPoints = Math.floor(customer.totalSpent / 10);
                if (customer.totalSpent > 5000) customer.tier = 'VIP';
                else if (customer.totalOrders > 5) customer.tier = 'Regular';

                customerMap.set(order.customerPhone, customer);
            }
        });

        return Array.from(customerMap.values()).sort((a,b) => b.totalSpent - a.totalSpent);
    }, [pastOrders]);

    const updateCustomer = async (customerId: string, updates: Partial<Customer>) => {
        // In a real app, customer would be a top-level collection.
        // For now, we will log the update as we don't have a /customers collection.
        console.log("Updating customer logic would go here", customerId, updates);
    }


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser && firebaseUser.email) {
            if(users.length > 0) {
              const appUser = users.find(u => u.email === firebaseUser.email);
              if (appUser) {
                  setCurrentUser(appUser);
              }
            }
        } else {
            setCurrentUser(null);
             if (!pathname.startsWith('/login')) {
                router.push('/login');
            }
        }
    });

    return () => unsubscribe();
  }, [auth, users, pathname, router]);

  useEffect(() => {
    if (!currentUser && auth.currentUser && users.length > 0) {
      const fbUser = auth.currentUser;
      const appUser = users.find(u => u.email === fbUser.email);
      if (appUser) setCurrentUser(appUser);
    } else if (currentUser && auth.currentUser && auth.currentUser.email !== currentUser.email) {
      const appUser = users.find(u => u.email === auth.currentUser?.email);
      if (appUser) setCurrentUser(appUser);
    }
  }, [auth.currentUser, currentUser, users]);


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
        if (settings.defaultScreen === 'Dashboard') router.push('/dashboard');
        else if (settings.defaultScreen === 'Billing') router.push('/orders');
        else router.push('/tables');
    }

    if (isLoginPage) {
      if (userRole === 'super-admin') router.push('/super-admin/dashboard');
      else if (userRole === 'admin') router.push('/franchise/dashboard');
      else if (userRole === 'waiter' || userRole === 'cashier') router.push('/orders');
      else redirectToDefaultScreen();
      return;
    }

    switch (userRole) {
      case 'super-admin':
        if (!isSuperAdminPath) router.push('/super-admin/dashboard');
        break;
      
      case 'admin':
        if (selectedOutlet) { if (!isAppPath) redirectToDefaultScreen(); } 
        else { if (!isFranchisePath) router.push('/franchise/dashboard'); }
        break;

      default:
        if (!isAppPath) {
          if (userRole === 'waiter' || userRole === 'cashier') router.push('/orders');
          else redirectToDefaultScreen();
        }
        break;
    }
  }, [currentUser, selectedOutlet, pathname, router, settings.defaultScreen]);

  const login = async (email: string, password: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        let description = "An unknown error occurred.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = "Invalid email or password. Please try again.";
        }
        toast({ variant: "destructive", title: "Login Failed", description });
    }
  };

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
  
  const finalizeOrder = async (orderId: string) => {
    const orderToFinalize = orders.find(o => o.id === orderId);
    if (!orderToFinalize || !currentUser) return;

    const batch = writeBatch(firestore);

    // 1. Create the final Order document
    const subTotal = orderToFinalize.items.reduce((acc, item) => acc + item.totalPrice, 0);
    const tax = subTotal * (settings.taxAmount / 100); // simplified tax
    const total = subTotal - (orderToFinalize.discount || 0) - (orderToFinalize.redeemedPoints || 0) + tax;
    
    const finalOrder: Omit<Order, 'id'> = {
      orderNumber: orderToFinalize.orderNumber,
      type: orderToFinalize.orderType,
      tableId: orderToFinalize.tableId,
      items: orderToFinalize.items,
      subTotal,
      tax,
      discount: orderToFinalize.discount || 0,
      total,
      status: 'completed',
      createdAt: serverTimestamp() as any, // Let server set the time
      createdBy: currentUser.id,
      paymentMethod: orderToFinalize.paymentMethod || 'cash',
      customerName: orderToFinalize.customer.name,
      customerPhone: orderToFinalize.customer.phone,
    };
    
    const orderRef = doc(collection(firestore, 'orders'));
    batch.set(orderRef, finalOrder);

    // 2. Update table status if dine-in
    if (orderToFinalize.orderType === 'dine-in' && orderToFinalize.tableId) {
      const tableRef = doc(firestore, 'tables', orderToFinalize.tableId);
      batch.update(tableRef, { status: 'vacant', currentOrderId: null });
    }

    // 3. Deduct inventory
    orderToFinalize.items.forEach(item => {
      const menuItem = menuItems.find(mi => mi.id === item.baseMenuItemId);
      if (!menuItem || !menuItem.ingredients) return;
      
      menuItem.ingredients.forEach(ing => {
        const ingredientRef = doc(firestore, 'ingredients', ing.ingredientId);
        const ingData = ingredients.find(i => i.id === ing.ingredientId);
        if (ingData) {
          const newStock = ingData.stock - (ing.quantity * item.quantity);
          batch.update(ingredientRef, { stock: newStock });
        }
      });
    });

    try {
      await batch.commit();
      toast({ title: 'Order Finalized', description: `Order #${finalOrder.orderNumber} has been completed.` });
      // Reset POS
      removeOrder(orderId);
      setSetting('discountValue', 0);
      setSetting('discountType', 'fixed');
      setSetting('isComplimentary', false);
    } catch (error) {
      console.error("Error finalizing order:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not finalize order.' });
    }
  };
  
  const getOrderByTable = (tableId: string) => {
      const table = tables.find(t => t.id === tableId);
      if (table && table.currentOrderId) {
        return orders.find(o => o.id === table.currentOrderId);
      }
      return orders.find(o => o.tableId === tableId && o.orderType === 'dine-in');
  }

  const holdOrder = (orderId: string) => {
    const orderToHold = orders.find(o => o.id === orderId);
    if (!orderToHold) return;

    if (orderToHold.items.length === 0) {
      toast({ variant: "destructive", title: "Cannot Hold Empty Order", description: "Add items to the order before placing it on hold." });
      return;
    }

    setHeldOrders(prev => [...prev, orderToHold]);
    removeOrder(orderId);
    toast({ title: "Order Held", description: `Order #${orderToHold.orderNumber} has been put on hold.` });
  };

  const resumeOrder = (orderId: string) => {
    const orderToResume = heldOrders.find(o => o.id === orderId);
    if (!orderToResume) return;

    setOrders(prev => [...prev, orderToResume]);
    setHeldOrders(prev => prev.filter(o => o.id !== orderId));
    setActiveOrderId(orderToResume.id);
    toast({ title: "Order Resumed", description: `Order #${orderToResume.orderNumber} is now active.` });
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
      customer: { name: order.customerName || 'Online Customer', phone: order.customerPhone || '' },
      orderType: 'delivery',
      tableId: '',
      discount: 0,
      redeemedPoints: 0,
    };

    const emptyOrderIndex = orders.findIndex(o => o.items.length === 0);
    if (emptyOrderIndex !== -1) {
      setOrders(prev => {
        const newOrders = [...prev];
        newOrders[emptyOrderIndex] = newBill;
        return newOrders;
      });
      setActiveOrderId(newBill.id);
    } else {
      setOrders(prev => [...prev, newBill]);
      setActiveOrderId(newBill.id);
    }
  };

  const startOrderForTable = async (tableId: string) => {
      const existingOrder = getOrderByTable(tableId);
      if (existingOrder) {
          setActiveOrderId(existingOrder.id);
          router.push('/orders');
          return;
      }
      
      const newOrder = createNewOrder();
      newOrder.tableId = tableId;
      newOrder.orderType = 'dine-in';
      newOrder.id = `order-table-${tableId}-${Date.now()}`;
      
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
      
      await setDoc(doc(firestore, 'tables', tableId), { status: 'occupied', currentOrderId: newOrder.id }, { merge: true });
      
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
    pastOrders: pastOrders || [],
    setPastOrders: setPastOrders as React.Dispatch<React.SetStateAction<Order[]>>,
    users: users || [],
    setUsers,
    tables: tables || [],
    setTables: setTables as React.Dispatch<React.SetStateAction<Table[]>>,
    ingredients: ingredients || [],
    setIngredients: setIngredients as React.Dispatch<React.SetStateAction<Ingredient[]>>,
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
