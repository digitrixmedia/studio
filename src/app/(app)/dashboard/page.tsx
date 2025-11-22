
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IndianRupee, ClipboardList, Utensils, AlertCircle, PlusCircle, ShoppingBag, CalendarPlus } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';

export default function DashboardPage() {
  const { pastOrders, ingredients, tables, menuItems } = useAppContext();

  const todaySales = useMemo(() => {
    if (!pastOrders) return 0;
    return pastOrders.reduce((sum, order) => sum + (order.status === 'completed' ? order.total : 0), 0);
  }, [pastOrders]);

  const totalOrders = useMemo(() => pastOrders?.length || 0, [pastOrders]);
  const completedOrdersCount = useMemo(() => pastOrders?.filter(o => o.status === 'completed').length || 0, [pastOrders]);
  const avgOrderValue = completedOrdersCount > 0 ? todaySales / completedOrdersCount : 0;
  const activeTables = useMemo(() => tables.filter(t => t.status === 'occupied' || t.status === 'billing').length, [tables]);
  
  const lowStockItems = useMemo(() => ingredients.filter(i => i.stock < i.minStock), [ingredients]);

  const topSellingItems = useMemo(() => {
    if (!menuItems || !pastOrders) return [];
    return menuItems
      .map(item => {
        const quantitySold = pastOrders.reduce((sum, order) => 
          sum + (order.items || []).reduce((itemSum, orderItem) => 
            itemSum + (orderItem.baseMenuItemId === item.id ? orderItem.quantity : 0), 0), 0);
        return { ...item, quantitySold };
      })
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);
  }, [menuItems, pastOrders]);
    
  const recentOrders = useMemo(() => pastOrders?.slice(0, 5) || [], [pastOrders]);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Total Sales</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <IndianRupee className="h-6 w-6 mr-1" />
              {todaySales.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders Today</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalOrders}</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <IndianRupee className="h-6 w-6 mr-1" />
              {avgOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tables</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTables}</div>
            <p className="text-xs text-muted-foreground">out of {tables.length} tables</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <PlusCircle className="mr-2 h-5 w-5" /> New Order
          </Button>
        </Link>
        <Link href="/tables">
          <Button size="lg" variant="outline">View Tables</Button>
        </Link>
        <Link href="/operations?tab=reservations">
          <Button size="lg" variant="outline">
            <CalendarPlus className="mr-2 h-5 w-5" /> Book a Table
          </Button>
        </Link>
        <Link href="/reports">
         <Button size="lg" variant="outline">Daily Sales Report</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSellingItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                    </TableCell>
                    <TableCell className="text-right">{item.quantitySold}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">#{order.orderNumber}</div>
                      <div className="text-sm text-muted-foreground">{order.customerName || 'N/A'}</div>
                    </TableCell>
                    <TableCell className='flex items-center'>
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {order.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right"><Badge>{order.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
         <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="text-destructive" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <Table>
                 <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">
                         <Badge variant="destructive">{item.stock} {item.baseUnit}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>All stock levels are good!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
