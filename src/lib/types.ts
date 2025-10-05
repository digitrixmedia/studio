export type Role = 'Admin' | 'Manager' | 'Cashier' | 'Waiter' | 'Kitchen';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

export interface MenuCategory {
  id: string;
  name: string;
}

export interface MenuItemVariation {
  id: string;
  name: string; // e.g., 'Regular', 'Large'
  priceModifier: number; // e.g., 0 for regular, 20 for large
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
  variations?: MenuItemVariation[];
  addons?: MenuItemAddon[];
  isAvailable: boolean;
  ingredients: { ingredientId: string; quantity: number }[];
}

export interface OrderItem {
  id: string; // This will be the menu item id
  name: string;
  quantity: number;
  price: number; // base price
  variation?: MenuItemVariation;
  addons?: MenuItemAddon[];
  notes?: string;
  totalPrice: number;
}

export type OrderType = 'Dine-In' | 'Takeaway' | 'Delivery';
export type OrderStatus = 'New' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card';

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
}

export type TableStatus = 'Vacant' | 'Occupied' | 'Billing';

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
