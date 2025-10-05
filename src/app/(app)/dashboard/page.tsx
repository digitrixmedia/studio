import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { orders, ingredients, tables, menuItems } from '@/lib/data';
import { IndianRupee, ClipboardList, Utensils, AlertCircle, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const todaySales = orders.reduce((sum, order) => sum + (order.status === 'Completed' ? order.total : 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? todaySales / orders.filter(o => o.status === 'Completed').length : 0;
  const activeTables = tables.filter(t => t.status === 'Occupied' || t.status === 'Billing').length;
  
  const lowStockItems = ingredients.filter(i => i.stock < i.minStock);

  const topSellingItems = menuItems
    .map(item => {
      const quantitySold = orders.reduce((sum, order) => 
        sum + order.items.reduce((itemSum, orderItem) => 
          itemSum + (orderItem.id === item.id ? orderItem.quantity : 0), 0), 0);
      return { ...item, quantitySold };
    })
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Total Sales</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todaySales.toLocaleString('en-IN')}</div>
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
            <div className="text-2xl font-bold">₹{avgOrderValue.toFixed(2)}</div>
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
        <Link href="/orders" passHref>
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <PlusCircle className="mr-2 h-5 w-5" /> New Order
          </Button>
        </Link>
        <Link href="/tables" passHref>
          <Button size="lg" variant="outline">View Tables</Button>
        </Link>
        <Link href="/reports" passHref>
         <Button size="lg" variant="outline">Daily Sales Report</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Top Selling Items Today</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity Sold</TableHead>
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
        <Card className="lg:col-span-3">
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
                         <Badge variant="destructive">{item.stock} {item.unit}</Badge>
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
