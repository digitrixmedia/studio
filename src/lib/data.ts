

import type { User, MenuCategory, MenuItem, Table, Ingredient, Order, OrderStatus, Subscription, Franchise, SubscriptionStatus, PaymentMethod, Reservation, DeliveryBoy, AuditLog, Role, Vendor, PurchaseOrder } from '@/lib/types';
import { addDays, subDays } from 'date-fns';

export const users: User[] = [
  { id: 'user-1', name: 'Alia Admin', email: 'admin@zappyy.com', role: 'admin', subscriptionId: 'sub-1' },
  { id: 'user-2', name: 'Manoj Manager', email: 'manager@zappyy.com', role: 'manager', subscriptionId: 'sub-2' },
  { id: 'user-3', name: 'Chirag Cashier', email: 'cashier@zappyy.com', role: 'cashier', subscriptionId: 'sub-2' },
  { id: 'user-4', name: 'Vicky Waiter', email: 'waiter@zappyy.com', role: 'waiter', subscriptionId: 'sub-2' },
  { id: 'user-5', name: 'Karan Kitchen', email: 'kitchen@zappyy.com', role: 'kitchen', subscriptionId: 'sub-2' },
  { id: 'user-6', name: 'Sonia Super', email: 'super@zappyy.com', role: 'super-admin' },
];

export const menuCategories: MenuCategory[] = [
  { id: 'cat-1', name: 'Hot Coffee' },
  { id: 'cat-2', name: 'Cold Coffee' },
  { id: 'cat-3', name: 'Sandwiches' },
  { id: 'cat-7', name: 'Pizza' },
  { id: 'cat-4', name: 'Desserts' },
  { id: 'cat-5', name: 'Sides' },
  { id: 'cat-6', name: 'Beverages' },
];

export const menuItems: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Cappuccino',
    description: 'Classic Italian coffee drink with steamed milk foam.',
    price: 150,
    category: 'cat-1',
    foodType: 'veg',
    isAvailable: true,
    isBogo: true,
    variations: [
      { id: 'var-1-1', name: 'Regular', priceModifier: 0, ingredients: [] },
      { id: 'var-1-2', name: 'Large', priceModifier: 40, ingredients: [] },
    ],
    addons: [
      { id: 'addon-1', name: 'Extra Shot', price: 50 },
      { id: 'addon-2', name: 'Hazelnut Syrup', price: 30 },
    ],
    ingredients: [
      { ingredientId: 'ing-1', quantity: 10 },
      { ingredientId: 'ing-2', quantity: 150 },
      { ingredientId: 'ing-3', quantity: 5 },
    ],
  },
  {
    id: 'item-2',
    name: 'Espresso',
    description: 'A concentrated full-flavoured coffee shot.',
    price: 120,
    category: 'cat-1',
    foodType: 'veg',
    isAvailable: true,
    ingredients: [{ ingredientId: 'ing-1', quantity: 8 }],
  },
  {
    id: 'item-3',
    name: 'Cafe Latte',
    description: 'A milk coffee that is a made up of one or two shots of espresso, steamed milk and a final, thin layer of frothed milk on top.',
    price: 160,
    category: 'cat-1',
    foodType: 'veg',
    isAvailable: false,
    ingredients: [
      { ingredientId: 'ing-1', quantity: 10 },
      { ingredientId: 'ing-2', quantity: 200 },
    ],
  },
  {
    id: 'item-4',
    name: 'Iced Americano',
    description: 'Espresso shots topped with cold water produce a light layer of crema, then served over ice.',
    price: 180,
    category: 'cat-2',
    foodType: 'veg',
    isAvailable: true,
    ingredients: [
        { ingredientId: 'ing-1', quantity: 12 },
    ],
  },
  {
    id: 'item-5',
    name: 'Veggie Sandwich',
    description: 'A healthy and delicious sandwich filled with fresh vegetables.',
    price: 220,
    category: 'cat-3',
    foodType: 'veg',
    isAvailable: true,
    ingredients: [
      { ingredientId: 'ing-4', quantity: 2 },
      { ingredientId: 'ing-5', quantity: 50 },
    ],
    mealDeal: {
      upsellPrice: 99,
      sideItemIds: ['item-9'],
      drinkItemIds: ['item-10'],
    },
  },
  {
    id: 'item-11',
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh mozzarella, tomatoes, and basil.',
    price: 350,
    category: 'cat-7',
    foodType: 'veg',
    isAvailable: true,
    variations: [
      { id: 'var-11-1', name: 'Regular (8")', priceModifier: 0, ingredients: [] },
      { id: 'var-11-2', name: 'Medium (10")', priceModifier: 100, ingredients: [] },
      { id: 'var-11-3', name: 'Large (12")', priceModifier: 200, ingredients: [] },
    ],
    addons: [
      { id: 'addon-3', name: 'Extra Cheese', price: 60 },
      { id: 'addon-4', name: 'Olives', price: 40 },
    ],
    ingredients: [],
  },
  {
    id: 'item-6',
    name: 'New York Cheesecake',
    description: 'Creamy, dense, and smooth cheesecake with a graham cracker crust.',
    price: 250,
    category: 'cat-4',
    foodType: 'veg',
    isAvailable: true,
    ingredients: [{ ingredientId: 'ing-6', quantity: 1 }],
  },
    {
    id: 'item-7',
    name: 'Chocolate Brownie',
    description: 'Rich and fudgy chocolate brownie, served warm.',
    price: 180,
    category: 'cat-4',
    foodType: 'veg',
    isAvailable: true,
    ingredients: [
      { ingredientId: 'ing-3', quantity: 50 }
    ],
  },
    {
    id: 'item-8',
    name: 'Buttery Croissant',
    description: 'A classic French pastry, flaky and buttery.',
    price: 140,
    category: 'cat-4',
    foodType: 'veg',
    isAvailable: true,
    ingredients: [],
  },
  {
    id: 'item-9',
    name: 'French Fries',
    description: 'Classic crispy french fries.',
    price: 120,
    category: 'cat-5',
    foodType: 'veg',
    isAvailable: true,
    ingredients: [],
  },
  {
    id: 'item-10',
    name: 'Coke',
    description: 'Chilled Coca-cola.',
    price: 60,
    category: 'cat-6',
    foodType: 'veg',
    isAvailable: true,
    ingredients: [],
  },
];

export const tables: Table[] = [
  { id: 'table-1', name: 'Table 1', capacity: 4, status: 'vacant' },
  { id: 'table-2', name: 'Table 2', capacity: 4, status: 'occupied', currentOrderId: 'order-1' },
  { id: 'table-3', name: 'Table 3', capacity: 2, status: 'vacant' },
  { id: 'table-4', name: 'Table 4', capacity: 2, status: 'billing', currentOrderId: 'order-2' },
  { id: 'table-5', name: 'Table 5', capacity: 6, status: 'vacant' },
  { id: 'table-6', name: 'Sofa Seating', capacity: 8, status: 'occupied', currentOrderId: 'order-3' },
  { id: 'table-7', name: 'Table 7', capacity: 4, status: 'vacant' },
  { id: 'table-8', name: 'Table 8', capacity: 4, status: 'vacant' },
];

export const ingredients: Ingredient[] = [
  { id: 'ing-1', name: 'Coffee Beans', baseUnit: 'g', stock: 800000, minStock: 1000, purchaseUnits: [{ unit: 'kg', factor: 1000 }, { unit: 'g', factor: 1 }] },
  { id: 'ing-2', name: 'Milk', baseUnit: 'ml', stock: 5000, minStock: 2000, purchaseUnits: [{ unit: 'l', factor: 1000 }, { unit: 'ml', factor: 1 }] },
  { id: 'ing-3', name: 'Sugar', baseUnit: 'g', stock: 10000, minStock: 2000, purchaseUnits: [{ unit: 'kg', factor: 1000 }, { unit: 'g', factor: 1 }] },
  { id: 'ing-4', name: 'Bread Loaves', baseUnit: 'pcs', stock: 8, minStock: 10, purchaseUnits: [{ unit: 'pcs', factor: 1 }] },
  { id: 'ing-5', name: 'Veggie Mix', baseUnit: 'g', stock: 2000, minStock: 500, purchaseUnits: [{ unit: 'kg', factor: 1000 }, { unit: 'g', factor: 1 }] },
  { id: 'ing-6', name: 'Cheesecake Slice', baseUnit: 'pcs', stock: 5, minStock: 4, purchaseUnits: [{ unit: 'pcs', factor: 1 }] },
];

const orderStatuses: OrderStatus[] = ['new', 'preparing', 'ready', 'out-for-delivery', 'completed', 'cancelled'];
const paymentMethods: PaymentMethod[] = ['cash', 'upi', 'card'];
const customerNames = ['Aarav', 'Sanya', 'Vikram', 'Anika', 'Rohan', 'Isha'];

const generateOrders = (count: number): Order[] => {
  const orders: Order[] = [];
  for (let i = 1; i <= count; i++) {
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const orderItems = Array.from({ length: itemCount }, () => {
        const item = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        return {
            id: item.id,
            name: item.name,
            quantity: quantity,
            price: item.price,
            totalPrice: item.price * quantity,
        };
    });

    const subTotal = orderItems.reduce((acc, item) => acc + item.totalPrice, 0);
    const tax = 0;
    const total = subTotal + tax;
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    const customerIndex = Math.floor(Math.random() * customerNames.length);

    orders.push({
      id: `order-${i}`,
      orderNumber: `${1000 + i}`,
      type: Math.random() > 0.5 ? 'dine-in' : (Math.random() > 0.5 ? 'takeaway' : 'delivery'),
      items: orderItems,
      subTotal,
      tax,
      discount: 0,
      total,
      status: status,
      customerName: status !== 'cancelled' ? customerNames[customerIndex] : undefined,
      customerPhone: status !== 'cancelled' ? `987654320${customerIndex}` : undefined,
      paymentMethod: status === 'completed' ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)] : undefined,
      createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      createdBy: users[Math.floor(Math.random() * 3) + 2].id, // Cashier or Waiter
    });
  }
  return orders;
};

export const orders: Order[] = generateOrders(50);

// Assign some specific orders to tables
orders[0] = { ...orders[0], id: 'order-1', tableId: 'table-2', type: 'dine-in', status: 'preparing' };
orders[1] = { ...orders[1], id: 'order-2', tableId: 'table-4', type: 'dine-in', status: 'ready' };
orders[2] = { ...orders[2], id: 'order-3', tableId: 'table-6', type: 'dine-in', status: 'new' };

export const dailySalesData: { date: Date, sales: number, orders: number, aov: number }[] = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const sales = Math.floor(Math.random() * 5000) + 1000;
    const orders = Math.floor(Math.random() * 20) + 10;
    return {
        date,
        sales,
        orders,
        aov: orders > 0 ? sales / orders : 0
    };
});


export const hourlySalesData = Array.from({length: 12}, (_, i) => ({
    hour: `${i + 9} AM`,
    sales: Math.floor(Math.random() * 1500) + 200
}));

export const vendors: Vendor[] = [
    { id: 'vendor-1', name: 'Fresh Veggies Co.', contactPerson: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh@freshveg.com', gstin: '29ABCDE1234F1Z5' },
    { id: 'vendor-2', name: 'Daily Dairy Supply', contactPerson: 'Sunita Sharma', phone: '9876543211', email: 'sunita@dailydairy.com', gstin: '27FGHIJ5678K2Z9' },
    { id: 'vendor-3', name: 'Beans & Co.', contactPerson: 'Amit Patel', phone: '9876543212', email: 'amit@beansco.com', gstin: '24LMNOP9012Q3ZA' },
];

export const purchaseOrders: PurchaseOrder[] = [
    {
        id: 'po-1',
        poNumber: 'PO-2024-001',
        vendorId: 'vendor-1',
        date: subDays(new Date(), 5),
        items: [
            { id: 'poi-1', ingredientId: 'ing-5', quantity: 10, purchaseUnit: 'kg', unitPrice: 150, amount: 1500, cgst: 2.5, sgst: 2.5, igst: 0 },
        ],
        subTotal: 1500,
        totalDiscount: 0,
        otherCharges: 0,
        totalTaxes: 75,
        grandTotal: 1575,
        status: 'completed',
        paymentStatus: 'paid',
    },
    {
        id: 'po-2',
        poNumber: 'PO-2024-002',
        vendorId: 'vendor-2',
        date: subDays(new Date(), 2),
        items: [
            { id: 'poi-2', ingredientId: 'ing-2', quantity: 20, purchaseUnit: 'l', unitPrice: 50, amount: 1000, cgst: 0, sgst: 0, igst: 0 },
        ],
        subTotal: 1000,
        totalDiscount: 50,
        otherCharges: 0,
        totalTaxes: 0,
        grandTotal: 950,
        status: 'completed',
        paymentStatus: 'paid',
    },
    {
        id: 'po-3',
        poNumber: 'PO-2024-003',
        vendorId: 'vendor-3',
        date: new Date(),
        items: [
            { id: 'poi-3', ingredientId: 'ing-1', quantity: 5, purchaseUnit: 'kg', unitPrice: 800, amount: 4000, cgst: 9, sgst: 9, igst: 0 },
        ],
        subTotal: 4000,
        totalDiscount: 0,
        otherCharges: 0,
        totalTaxes: 720,
        grandTotal: 4720,
        status: 'pending',
        paymentStatus: 'unpaid',
    },
];

// MOCKED SUPER ADMIN DATA
const subscriptionStatuses: SubscriptionStatus[] = ['active', 'inactive', 'expired', 'suspended'];

const franchisesMock: { id: string; name: string }[] = [
    { id: 'franchise-1', name: 'The Coffee House' },
    { id: 'franchise-2', name: 'Brew & Bake' },
    { id: 'franchise-3', name: 'Daily Grind' },
    { id: 'franchise-4', name: 'Mocha Magic' },
    { id: 'franchise-5', name: 'Perk Up' },
];

export const subscriptions: Subscription[] = Array.from({ length: 15 }, (_, i) => {
    const franchise = franchisesMock[i % franchisesMock.length];
    const outletNumber = Math.floor(i / franchisesMock.length) + 1;
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + Math.floor(Math.random() * 12) - 3);

    let status: SubscriptionStatus = 'active';
    if (endDate < new Date()) {
        status = 'expired';
    } else if (i === 1) { // Ensure Manager user has an active subscription for demo
        status = 'active';
    }
     else {
        status = subscriptionStatuses[Math.floor(Math.random() * 2)]; // active or inactive
    }
    
    return {
        id: `sub-${i + 1}`,
        franchiseName: franchise.name,
        outletName: `${franchise.name} - Outlet ${outletNumber}`,
        adminName: `Manager ${i+1}`,
        adminEmail: `admin${i}@zappyy.com`,
        startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        endDate,
        status,
        storageUsedMB: Math.floor(Math.random() * 5000),
        totalReads: Math.floor(Math.random() * 1000000),
        totalWrites: Math.floor(Math.random() * 500000),
      };
});

// Ensure the main users have predictable subscription statuses
subscriptions[0] = {...subscriptions[0], id: 'sub-1', adminEmail: 'admin@zappyy.com', status: 'active'}; // For Admin
subscriptions[1] = {...subscriptions[1], id: 'sub-2', adminEmail: 'manager@zappyy.com', status: 'active'}; // For Manager/Cashier/etc


export const superAdminStats = {
    totalSubscriptions: subscriptions.length,
    activeOutlets: subscriptions.filter(s => s.status === 'active').length,
    totalStorageUsedGB: (subscriptions.reduce((acc, s) => acc + s.storageUsedMB, 0) / 1024).toFixed(2),
    totalSales: 12500000,
    totalOrders: 45000,
    totalReads: subscriptions.reduce((acc, s) => acc + s.totalReads, 0),
    totalWrites: subscriptions.reduce((acc, s) => acc + s.totalWrites, 0),
};

export const topFranchisesBySales: Franchise[] = franchisesMock.map(f => {
    const franchiseSubs = subscriptions.filter(s => s.franchiseName === f.name);
    return {
        id: f.id,
        name: f.name,
        totalSales: Math.floor(Math.random() * 500000) + 100000,
        totalOutlets: franchiseSubs.length,
        totalStorage: (franchiseSubs.reduce((acc, s) => acc + s.storageUsedMB, 0) / 1024),
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        totalReads: franchiseSubs.reduce((acc, s) => acc + s.totalReads, 0),
        totalWrites: franchiseSubs.reduce((acc, s) => acc + s.totalWrites, 0),
    }
}).sort((a, b) => b.totalSales - a.totalSales);


export const dailyActiveOutlets = [
  { day: 'Mon', count: Math.floor(Math.random() * 10) + 5 },
  { day: 'Tue', count: Math.floor(Math.random() * 10) + 5 },
  { day: 'Wed', count: Math.floor(Math.random() * 10) + 5 },
  { day: 'Thu', count: Math.floor(Math.random() * 10) + 5 },
  { day: 'Fri', count: Math.floor(Math.random() * 10) + 5 },
  { day: 'Sat', count: Math.floor(Math.random() * 10) + 5 },
  { day: 'Sun', count: Math.floor(Math.random() * 10) + 5 },
];

export const subscriptionStatusDistribution = subscriptionStatuses.map(status => ({
    status,
    count: subscriptions.filter(s => s.status === status).length,
}));

export const monthlyNewSubscriptions = [
    { month: 'Jan', count: 5 }, { month: 'Feb', count: 8 }, { month: 'Mar', count: 12 },
    { month: 'Apr', count: 7 }, { month: 'May', count: 10 }, { month: 'Jun', count: 15 },
];

export const reservations: Reservation[] = [
    { id: 'res-1', name: 'Ankit Sharma', phone: '9988776655', guests: 4, time: new Date(new Date().setHours(20,0,0)), status: 'confirmed' },
    { id: 'res-2', name: 'Riya Gupta', phone: '9123456789', guests: 2, time: new Date(new Date().setHours(19,30,0)), status: 'pending' },
    { id: 'res-3', name: 'Vikram Singh', phone: '9876543210', guests: 6, time: new Date(new Date().setHours(21,0,0)), status: 'arrived', tableId: 'table-6' },
    { id: 'res-4', name: 'Priya Mehta', phone: '9876501234', guests: 3, time: new Date(addDays(new Date(), 1).setHours(20,30,0)), status: 'confirmed' },
    { id: 'res-5', name: 'Rahul Verma', phone: '9998887776', guests: 5, time: new Date(addDays(new Date(), 2).setHours(19,0,0)), status: 'confirmed' },
];


export const deliveryBoys: DeliveryBoy[] = [
    { id: 'db-1', name: 'Ravi Kumar', phone: '8877665544', status: 'available' },
    { id: 'db-2', name: 'Suresh Patel', phone: '8123456789', status: 'on-a-delivery', currentOrder: '#1045' },
    { id: 'db-3', name: 'Manoj Verma', phone: '8888888888', status: 'available' },
]

export const auditLogs: AuditLog[] = [
    { id: 'log-1', user: { name: 'Sonia Super', role: 'super-admin' }, action: 'login', target: 'System', status: 'success', ipAddress: '103.22.45.1', timestamp: new Date() },
    { id: 'log-2', user: { name: 'Sonia Super', role: 'super-admin' }, action: 'subscription-created', target: 'Daily Grind - Outlet 3', status: 'success', ipAddress: '103.22.45.1', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: 'log-3', user: { name: 'Alia Admin', role: 'admin' }, action: 'login', target: 'The Coffee House', status: 'success', ipAddress: '192.168.1.10', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    { id: 'log-4', user: { name: 'Sonia Super', role: 'super-admin' }, action: 'subscription-suspended', target: 'Mocha Magic - Outlet 2', status: 'warning', ipAddress: '103.22.45.1', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: 'log-5', user: { name: 'Unknown', role: 'manager' }, action: 'failed-login', target: 'System', status: 'failure', ipAddress: '203.11.10.5', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
];

  



