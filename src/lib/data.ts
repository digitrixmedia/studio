import type { User, MenuCategory, MenuItem, Table, Ingredient, Order, OrderStatus, Subscription, Franchise, SubscriptionStatus } from '@/lib/types';

export const users: User[] = [
  { id: 'user-1', name: 'Alia Admin', email: 'admin@zappyy.com', role: 'Admin', avatar: '/avatars/01.png' },
  { id: 'user-2', name: 'Manoj Manager', email: 'manager@zappyy.com', role: 'Manager', avatar: '/avatars/02.png' },
  { id: 'user-3', name: 'Chirag Cashier', email: 'cashier@zappyy.com', role: 'Cashier', avatar: '/avatars/03.png' },
  { id: 'user-4', name: 'Vicky Waiter', email: 'waiter@zappyy.com', role: 'Waiter', avatar: '/avatars/04.png' },
  { id: 'user-5', name: 'Karan Kitchen', email: 'kitchen@zappyy.com', role: 'Kitchen', avatar: '/avatars/05.png' },
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
    isAvailable: true,
    variations: [
      { id: 'var-1-1', name: 'Regular', priceModifier: 0 },
      { id: 'var-1-2', name: 'Large', priceModifier: 40 },
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

const orderStatuses: OrderStatus[] = ['New', 'Preparing', 'Ready', 'Completed'];
const generateOrders = (count: number): Order[] => {
  const orders: Order[] = [];
  for (let i = 1; i <= count; i++) {
    const orderItems = [
        { ...menuItems[Math.floor(Math.random() * menuItems.length)] },
        { ...menuItems[Math.floor(Math.random() * menuItems.length)] },
    ].map(item => ({
        id: item.id,
        name: item.name,
        quantity: Math.floor(Math.random() * 2) + 1,
        price: item.price,
        totalPrice: item.price * (Math.floor(Math.random() * 2) + 1)
    }));

    const subTotal = orderItems.reduce((acc, item) => acc + item.totalPrice, 0);
    const tax = subTotal * 0.18;
    const total = subTotal + tax;
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];

    orders.push({
      id: `order-${i}`,
      orderNumber: `${1000 + i}`,
      type: Math.random() > 0.5 ? 'Dine-In' : 'Takeaway',
      items: orderItems,
      subTotal,
      tax,
      discount: 0,
      total,
      status: status,
      createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      createdBy: users[Math.floor(Math.random() * 4) + 1].id,
    });
  }
  return orders;
};

export const orders: Order[] = generateOrders(25);

// Assign some specific orders to tables
orders[0] = { ...orders[0], id: 'order-1', tableId: 'table-2', type: 'Dine-In', status: 'Preparing' };
orders[1] = { ...orders[1], id: 'order-2', tableId: 'table-4', type: 'Dine-In', status: 'Ready' };
orders[2] = { ...orders[2], id: 'order-3', tableId: 'table-6', type: 'Dine-In', status: 'New' };

export const salesData = [
  { date: 'Mon', sales: Math.floor(Math.random() * 5000) + 1000 },
  { date: 'Tue', sales: Math.floor(Math.random() * 5000) + 1000 },
  { date: 'Wed', sales: Math.floor(Math.random() * 5000) + 1000 },
  { date: 'Thu', sales: Math.floor(Math.random() * 5000) + 1000 },
  { date: 'Fri', sales: Math.floor(Math.random() * 5000) + 1000 },
  { date: 'Sat', sales: Math.floor(Math.random() * 5000) + 1000 },
  { date: 'Sun', sales: Math.floor(Math.random() * 5000) + 1000 },
];

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
    } else {
        status = subscriptionStatuses[Math.floor(Math.random() * 2)]; // Active or Inactive
    }
    
    return {
        id: `sub-${i + 1}`,
        franchiseName: franchise.name,
        outletName: `${franchise.name} - Outlet ${outletNumber}`,
        adminEmail: `admin${i+1}@${franchise.name.toLowerCase().replace(/\s/g, '')}.com`,
        startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        endDate,
        status,
        storageUsedMB: Math.floor(Math.random() * 5000),
    };
});


export const superAdminStats = {
    totalSubscriptions: subscriptions.length,
    activeOutlets: subscriptions.filter(s => s.status === 'Active').length,
    totalStorageUsedGB: (subscriptions.reduce((acc, s) => acc + s.storageUsedMB, 0) / 1024).toFixed(2),
    totalSales: 12500000,
    totalOrders: 45000,
};

export const topFranchisesBySales: Franchise[] = franchisesMock.map(f => ({
    id: f.id,
    name: f.name,
    totalSales: Math.floor(Math.random() * 500000) + 100000,
    totalOutlets: subscriptions.filter(s => s.franchiseName === f.name).length,
    totalStorage: (subscriptions.filter(s => s.franchiseName === f.name).reduce((acc, s) => acc + s.storageUsedMB, 0) / 1024).toFixed(2),
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
