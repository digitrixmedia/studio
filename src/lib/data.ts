

import type { User, MenuCategory, MenuItem, Table, Ingredient, Order, OrderStatus, Subscription, Franchise, SubscriptionStatus, PaymentMethod, Reservation, DeliveryBoy, AuditLog } from '@/lib/types';
import { addDays } from 'date-fns';

export const users: User[] = [
  { id: 'user-1', name: 'Alia Admin', email: 'admin@zappyy.com', role: 'Admin', avatar: '/avatars/01.png', subscriptionId: 'sub-1' },
  { id: 'user-2', name: 'Manoj Manager', email: 'manager@zappyy.com', role: 'Manager', avatar: '/avatars/02.png', subscriptionId: 'sub-2' },
  { id: 'user-3', name: 'Chirag Cashier', email: 'cashier@zappyy.com', role: 'Cashier', avatar: '/avatars/03.png', subscriptionId: 'sub-2' },
  { id: 'user-4', name: 'Vicky Waiter', email: 'waiter@zappyy.com', role: 'Waiter', avatar: '/avatars/04.png', subscriptionId: 'sub-2' },
  { id: 'user-5', name: 'Karan Kitchen', email: 'kitchen@zappyy.com', role: 'Kitchen', avatar: '/avatars/05.png', subscriptionId: 'sub-2' },
  { id: 'user-6', name: 'Sonia Super', email: 'super@zappyy.com', role: 'Super Admin', avatar: '/avatars/06.png' },
];

export const menuCategories: MenuCategory[] = [
  { id: 'cat-1', name: 'Hot Coffee' },
  { id: 'cat-2', name: 'Cold Coffee' },
  { id: 'cat-3', name: 'Sandwiches' },
  { id: 'cat-4', name: 'Desserts' },
];

export const menuItems: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Cappuccino',
    description: 'Classic Italian coffee drink with steamed milk foam.',
    price: 150,
    category: 'cat-1',
    imageUrl: 'https://picsum.photos/seed/cappuccino/400/300',
    imageHint: 'cappuccino coffee',
    foodType: 'Veg',
    isAvailable: true,
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
    imageUrl: 'https://picsum.photos/seed/espresso/400/300',
    imageHint: 'espresso shot',
    foodType: 'Veg',
    isAvailable: true,
    ingredients: [{ ingredientId: 'ing-1', quantity: 8 }],
  },
  {
    id: 'item-3',
    name: 'Cafe Latte',
    description: 'A milk coffee that is a made up of one or two shots of espresso, steamed milk and a final, thin layer of frothed milk on top.',
    price: 160,
    category: 'cat-1',
    imageUrl: 'https://picsum.photos/seed/latte/400/300',
    imageHint: 'latte art',
    foodType: 'Veg',
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
    imageUrl: 'https://picsum.photos/seed/icedcoffee/400/300',
    imageHint: 'iced coffee',
    foodType: 'Veg',
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
    imageUrl: 'https://picsum.photos/seed/sandwich/400/300',
    imageHint: 'vegetable sandwich',
    foodType: 'Veg',
    isAvailable: true,
    ingredients: [
      { ingredientId: 'ing-4', quantity: 2 },
      { ingredientId: 'ing-5', quantity: 50 },
    ],
  },
  {
    id: 'item-6',
    name: 'New York Cheesecake',
    description: 'Creamy, dense, and smooth cheesecake with a graham cracker crust.',
    price: 250,
    category: 'cat-4',
    imageUrl: 'https://picsum.photos/seed/cheesecake/400/300',
    imageHint: 'cheesecake slice',
    foodType: 'Veg',
    isAvailable: true,
    ingredients: [{ ingredientId: 'ing-6', quantity: 1 }],
  },
    {
    id: 'item-7',
    name: 'Chocolate Brownie',
    description: 'Rich and fudgy chocolate brownie, served warm.',
    price: 180,
    category: 'cat-4',
    imageUrl: 'https://picsum.photos/seed/brownie/400/300',
    imageHint: 'chocolate brownie',
    foodType: 'Veg',
    isAvailable: true,
    ingredients: [],
  },
    {
    id: 'item-8',
    name: 'Buttery Croissant',
    description: 'A classic French pastry, flaky and buttery.',
    price: 140,
    category: 'cat-4',
    imageUrl: 'https://picsum.photos/seed/croissant/400/300',
    imageHint: 'croissant pastry',
    foodType: 'Veg',
    isAvailable: true,
    ingredients: [],
  },
];

export const tables: Table[] = [
  { id: 'table-1', name: 'Table 1', capacity: 4, status: 'Vacant' },
  { id: 'table-2', name: 'Table 2', capacity: 4, status: 'Occupied', currentOrderId: 'order-1' },
  { id: 'table-3', name: 'Table 3', capacity: 2, status: 'Vacant' },
  { id: 'table-4', name: 'Table 4', capacity: 2, status: 'Billing', currentOrderId: 'order-2' },
  { id: 'table-5', name: 'Table 5', capacity: 6, status: 'Vacant' },
  { id: 'table-6', name: 'Sofa Seating', capacity: 8, status: 'Occupied', currentOrderId: 'order-3' },
  { id: 'table-7', name: 'Table 7', capacity: 4, status: 'Vacant' },
  { id: 'table-8', name: 'Table 8', capacity: 4, status: 'Vacant' },
];

export const ingredients: Ingredient[] = [
  { id: 'ing-1', name: 'Coffee Beans', unit: 'g', stock: 800, minStock: 1000 },
  { id: 'ing-2', name: 'Milk', unit: 'ml', stock: 5000, minStock: 2000 },
  { id: 'ing-3', name: 'Sugar', unit: 'g', stock: 10000, minStock: 2000 },
  { id: 'ing-4', name: 'Bread Loaves', unit: 'pcs', stock: 8, minStock: 10 },
  { id: 'ing-5', name: 'Veggie Mix', unit: 'g', stock: 2000, minStock: 500 },
  { id: 'ing-6', name: 'Cheesecake Slice', unit: 'pcs', stock: 5, minStock: 4 },
];

const orderStatuses: OrderStatus[] = ['New', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Cancelled'];
const paymentMethods: PaymentMethod[] = ['Cash', 'UPI', 'Card'];
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
      type: Math.random() > 0.5 ? 'Dine-In' : (Math.random() > 0.5 ? 'Takeaway' : 'Delivery'),
      items: orderItems,
      subTotal,
      tax,
      discount: 0,
      total,
      status: status,
      customerName: status !== 'Cancelled' ? customerNames[customerIndex] : undefined,
      customerPhone: status !== 'Cancelled' ? `98765432${String(customerIndex).padStart(2,'0')}` : undefined,
      paymentMethod: status === 'Completed' ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)] : undefined,
      createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      createdBy: users[Math.floor(Math.random() * 3) + 2].id, // Cashier or Waiter
    });
  }
  return orders;
};

export const orders: Order[] = generateOrders(50);

// Assign some specific orders to tables
orders[0] = { ...orders[0], id: 'order-1', tableId: 'table-2', type: 'Dine-In', status: 'Preparing' };
orders[1] = { ...orders[1], id: 'order-2', tableId: 'table-4', type: 'Dine-In', status: 'Ready' };
orders[2] = { ...orders[2], id: 'order-3', tableId: 'table-6', type: 'Dine-In', status: 'New' };

export const dailySalesData = [
  { date: 'Mon', sales: Math.floor(Math.random() * 5000) + 1000, orders: Math.floor(Math.random() * 20) + 10, aov: 0 },
  { date: 'Tue', sales: Math.floor(Math.random() * 5000) + 1000, orders: Math.floor(Math.random() * 20) + 10, aov: 0 },
  { date: 'Wed', sales: Math.floor(Math.random() * 5000) + 1000, orders: Math.floor(Math.random() * 20) + 10, aov: 0 },
  { date: 'Thu', sales: Math.floor(Math.random() * 5000) + 1000, orders: Math.floor(Math.random() * 20) + 10, aov: 0 },
  { date: 'Fri', sales: Math.floor(Math.random() * 5000) + 1000, orders: Math.floor(Math.random() * 20) + 10, aov: 0 },
  { date: 'Sat', sales: Math.floor(Math.random() * 5000) + 1000, orders: Math.floor(Math.random() * 20) + 10, aov: 0 },
  { date: 'Sun', sales: Math.floor(Math.random() * 5000) + 1000, orders: Math.floor(Math.random() * 20) + 10, aov: 0 },
].map(d => ({ ...d, aov: d.orders > 0 ? d.sales / d.orders : 0 }));


export const hourlySalesData = Array.from({length: 12}, (_, i) => ({
    hour: `${i + 9} AM`,
    sales: Math.floor(Math.random() * 1500) + 200
}));

// MOCKED SUPER ADMIN DATA
const subscriptionStatuses: SubscriptionStatus[] = ['Active', 'Inactive', 'Expired', 'Suspended'];

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

    let status: SubscriptionStatus = 'Active';
    if (endDate < new Date()) {
        status = 'Expired';
    } else if (i === 1) { // Ensure Manager user has an active subscription for demo
        status = 'Active';
    }
     else {
        status = subscriptionStatuses[Math.floor(Math.random() * 2)]; // Active or Inactive
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
subscriptions[0] = {...subscriptions[0], id: 'sub-1', adminEmail: 'admin@zappyy.com', status: 'Active'}; // For Admin
subscriptions[1] = {...subscriptions[1], id: 'sub-2', adminEmail: 'manager@zappyy.com', status: 'Active'}; // For Manager/Cashier/etc


export const superAdminStats = {
    totalSubscriptions: subscriptions.length,
    activeOutlets: subscriptions.filter(s => s.status === 'Active').length,
    totalStorageUsedGB: (subscriptions.reduce((acc, s) => acc + s.storageUsedMB, 0) / 1024).toFixed(2),
    totalSales: 12500000,
    totalOrders: 45000,
    totalReads: subscriptions.reduce((acc, s) => acc + s.totalReads, 0),
    totalWrites: subscriptions.reduce((acc, s) => acc + s.totalWrites, 0),
};

export const topFranchisesBySales: Franchise[] = franchisesMock.map(f => ({
    id: f.id,
    name: f.name,
    totalSales: Math.floor(Math.random() * 500000) + 100000,
    totalOutlets: subscriptions.filter(s => s.franchiseName === f.name).length,
    totalStorage: (subscriptions.filter(s => s.franchiseName === f.name).reduce((acc, s) => acc + s.storageUsedMB, 0) / 1024),
    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
})).sort((a, b) => b.totalSales - a.totalSales);


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
    { id: 'res-1', name: 'Ankit Sharma', phone: '9988776655', guests: 4, time: new Date(new Date().setHours(20,0,0)), status: 'Confirmed' },
    { id: 'res-2', name: 'Riya Gupta', phone: '9123456789', guests: 2, time: new Date(new Date().setHours(19,30,0)), status: 'Pending' },
    { id: 'res-3', name: 'Vikram Singh', phone: '9876543210', guests: 6, time: new Date(new Date().setHours(21,0,0)), status: 'Arrived', tableId: 'table-6' },
    { id: 'res-4', name: 'Priya Mehta', phone: '9876501234', guests: 3, time: new Date(addDays(new Date(), 1).setHours(20,30,0)), status: 'Confirmed' },
    { id: 'res-5', name: 'Rahul Verma', phone: '9998887776', guests: 5, time: new Date(addDays(new Date(), 2).setHours(19,0,0)), status: 'Confirmed' },
];


export const deliveryBoys: DeliveryBoy[] = [
    { id: 'db-1', name: 'Ravi Kumar', phone: '8877665544', status: 'Available' },
    { id: 'db-2', name: 'Suresh Patel', phone: '8123456789', status: 'On a delivery', currentOrder: '#1045' },
    { id: 'db-3', name: 'Manoj Verma', phone: '8888888888', status: 'Available' },
]

export const auditLogs: AuditLog[] = [
    { id: 'log-1', user: { name: 'Sonia Super', role: 'Super Admin' }, action: 'Login', target: 'System', status: 'Success', ipAddress: '103.22.45.1', timestamp: new Date() },
    { id: 'log-2', user: { name: 'Sonia Super', role: 'Super Admin' }, action: 'Subscription Created', target: 'Daily Grind - Outlet 3', status: 'Success', ipAddress: '103.22.45.1', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: 'log-3', user: { name: 'Alia Admin', role: 'Admin' }, action: 'Login', target: 'The Coffee House', status: 'Success', ipAddress: '192.168.1.10', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    { id: 'log-4', user: { name: 'Sonia Super', role: 'Super Admin' }, action: 'Subscription Suspended', target: 'Mocha Magic - Outlet 2', status: 'Warning', ipAddress: '103.22.45.1', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: 'log-5', user: { name: 'Unknown', role: 'Manager' }, action: 'Failed Login', target: 'System', status: 'Failure', ipAddress: '203.11.10.5', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
];
