

export type Role = 'admin' | 'manager' | 'cashier' | 'waiter' | 'kitchen' | 'super-admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  subscriptionId?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
}

export interface MenuItemVariation {
  id: string;
  name: string; // e.g., 'Regular', 'Large'
  priceModifier: number; // e.g., 0 for regular, 20 for large
  ingredients: { ingredientId: string; quantity: number }[];
}

export interface MenuItemAddon {
  id: string;
  name: string; // e.g., 'Extra Espresso Shot'
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string; // categoryId
  imageUrl: string;
  imageHint: string;
  foodType?: 'veg' | 'non-veg' | 'jain';
  variations?: MenuItemVariation[];
  addons?: MenuItemAddon[];
  isAvailable: boolean;
  ingredients: { ingredientId: string; quantity: number }[];
}

export interface OrderItem {
  id: string; // This will be a unique id for the cart item
  name: string;
  quantity: number;
  price: number; // base price
  variation?: MenuItemVariation;
  addons?: MenuItemAddon[];
  notes?: string;
  totalPrice: number;
  isBogo?: boolean;
}

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';
export type OrderStatus = 'new' | 'preparing' | 'ready' | 'out-for-delivery' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'upi' | 'card';

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  tableId?: string;
  items: OrderItem[];
  subTotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  createdBy: string; // userId
  paymentMethod?: PaymentMethod;
  changeReturned?: number;
  customerName?: string;
  customerPhone?: string;
}

export type TableStatus = 'vacant' | 'occupied' | 'billing';

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: 'g' | 'ml' | 'pcs';
  stock: number;
  minStock: number;
}

// Super Admin Types
export type SubscriptionStatus = 'active' | 'inactive' | 'expired' | 'suspended';

export interface Franchise {
  id: string;
  name: string;
  totalSales: number;
  totalOutlets: number;
  totalStorage: number;
  lastActive: Date;
}
export interface Subscription {
  id: string;
  franchiseName: string;
  outletName: string;
  adminEmail: string;
  adminName?: string;
  startDate: Date;
  endDate: Date;
  status: SubscriptionStatus;
  storageUsedMB: number;
  totalReads: number;
  totalWrites: number;
}

export type AuditLogAction = 'login' | 'logout' | 'failed-login' | 'subscription-created' | 'subscription-suspended' | 'subscription-deleted';
export type AuditLogStatus = 'success' | 'failure' | 'warning';

export interface AuditLog {
    id: string;
    user: {
        name: string;
        role: Role;
    };
    action: AuditLogAction;
    target: string; // E.g., "Subscription: Brew & Bake - Outlet 2" or "System"
    status: AuditLogStatus;
    ipAddress: string;
    timestamp: Date;
}


// Franchise Admin Types
export interface FranchiseOutlet {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  managerName: string;
  todaySales?: number;
  totalSales?: number;
  ordersToday?: number;
}


// Operations Types
export type ReservationStatus = 'confirmed' | 'pending' | 'arrived' | 'cancelled';

export interface Reservation {
    id: string;
    name: string;
    phone: string;
    guests: number;
    time: Date;
    status: ReservationStatus;
    tableId?: string;
}

export interface DeliveryBoy {
    id: string;
    name: string;
    phone: string;
    status: 'available' | 'on-a-delivery' | 'offline';
    currentOrder?: string;
}

// App-specific type for orders being built in the POS
export interface AppOrder {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  customer: {
    name: string;
    phone: string;
  };
  orderType: OrderType;
  tableId: string;
  discount: number;
}
