/* Centralized TypeScript types for DineMitra POS
   Cleaned and extended to include Reservations, Delivery personnel,
   and broader Order statuses used across the app.
*/

export type Role = 'admin' | 'manager' | 'cashier' | 'waiter' | 'kitchen';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  outletId?: string;
  avatar?: string;
}

// ----------------------
// MENU SYSTEM
// ----------------------
export interface MenuCategory {
  id: string;
  name: string;
}

export interface MenuItemVariation {
  id: string;
  name: string;
  priceModifier: number;
  ingredients: { ingredientId: string; quantity: number }[];
}

export type MenuItemAddon = {
  id: string;
  name: string;
  price?: number;
  variations?: {
    variationId: string;
    price: number;
  }[];
};



export interface MealDeal {
  upsellPrice: number;
  sideItemIds: string[];
  drinkItemIds: string[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  foodType?: 'veg' | 'non-veg' | 'jain';
  variations?: MenuItemVariation[];
  addons?: MenuItemAddon[];
  isAvailable: boolean;
  isBogo?: boolean;
  ingredients: { ingredientId: string; quantity: number }[];
  // Allow mealDeal to be undefined or null (some pages set it to null)
  mealDeal?: MealDeal | null;
}

// ----------------------
// ORDERS
// ----------------------
export interface OrderItem {
  id: string;
  name: string;
  menuItemId: string;
  quantity: number;
  price: number;
  variation?: MenuItemVariation;
  addons?: MenuItemAddon[];
  notes?: string;
  totalPrice: number;
  isBogo?: boolean;

  baseMenuItemId?: string;
  isMealParent?: boolean;
  isMealChild?: boolean;
  mealParentId?: string;
}

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

// Extended OrderStatus to cover incoming/rejected online flows
export type OrderStatus =
  | 'new'
  | 'incoming'
  | 'preparing'
  | 'ready'
  | 'out-for-delivery'
  | 'completed'
  | 'rejected'
  | 'cancelled';

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

  /** Firestore timestamp is allowed, so keep flexible */
  createdAt: Date | any;

  createdBy: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: PaymentMethod;
  onlineOrderSource?: OnlineOrderSource;

  // required for queries and security rules
  outletId: string;
}

// ----------------------
// TABLES
// ----------------------
export type TableStatus = 'vacant' | 'occupied' | 'billing';

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
}

// ----------------------
// INGREDIENTS / STOCK
// ----------------------
export type Unit = 'g' | 'ml' | 'pcs' | 'kg' | 'l';

export interface UnitConversion {
  unit: Unit;
  factor: number;
}

export interface Ingredient {
  id: string;
  name: string;
  baseUnit: Unit;
  stock: number;
  minStock: number;
  purchaseUnits: UnitConversion[];
}

// ----------------------
// VENDORS / PURCHASE ORDERS
// ----------------------
export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin?: string;
}

export interface PurchaseOrderItem {
  id: string;
  ingredientId: string;
  quantity: number;
  purchaseUnit: Unit;
  unitPrice: number;
  amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  description?: string;
}

export type PurchaseOrderStatus = 'incoming' | 'pending' | 'processing' | 'completed' | 'cancelled';
export type PurchasePaymentStatus = 'paid' | 'unpaid';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  date: Date;
  invoiceNumber?: string;
  invoiceDate?: Date;
  items: PurchaseOrderItem[];
  subTotal: number;
  totalDiscount: number;
  otherCharges: number;
  totalTaxes: number;
  grandTotal: number;
  status: PurchaseOrderStatus;
  paymentStatus: PurchasePaymentStatus;
}

// ----------------------
// WASTAGE
// ----------------------
export interface WastageItem {
  id: string;
  itemId: string;
  name: string;
  quantity: number;
  unit: Unit | '';
  purchasePrice?: number;
  amount: number;
  description?: string;
}

export interface Wastage {
  id: string;
  wastageNumber: string;
  date: Date;
  wastageFor: 'Raw Material' | 'Item';
  items: WastageItem[];
  totalAmount: number;
  userId: string;
  reason: string;
}

// ----------------------
// FRANCHISE
// ----------------------
export interface FranchiseOutlet {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  managerName: string;
  todaySales?: number;
  totalSales?: number;
  ordersToday?: number;
  ownerId?: string;
  createdAt?: Date;
}

// ----------------------
// CUSTOMERS & APP ORDERS
// ----------------------
export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  tier: 'New' | 'Regular' | 'VIP';
  firstVisit: Date;
  lastVisit: Date;
  address?: string;
  birthday?: string;
  anniversary?: string;
  notes?: string;
}

export interface AppOrder {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  customer: { name: string; phone: string };
  orderType: OrderType;
  tableId: string;
  discount: number;
  redeemedPoints: number;
  createdAt?: any;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
}

// ----------------------
// RESERVATIONS
// ----------------------
export type ReservationStatus = 'pending' | 'confirmed' | 'arrived' | 'cancelled';

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  guests: number;
  time: Date;
  tableId?: string;
  status: ReservationStatus;
}

// ----------------------
// DELIVERY / RIDERS
// ----------------------
export type DeliveryBoyStatus = 'available' | 'on-a-delivery' | 'offline';

export interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  status: DeliveryBoyStatus;
  // optional currently assigned order label (e.g. "#1002")
  currentOrder?: string;
}

// ----------------------
// MISC
// ----------------------
export type OnlineOrderSource = 'zomato' | 'swiggy' | 'unknown';

// Export everything as named exports (already done above)
