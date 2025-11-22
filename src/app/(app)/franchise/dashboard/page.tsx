

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, BarChart3, ShoppingBag, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { ManageOutletDialog } from '@/components/franchise/ManageOutletDialog';
import type { FranchiseOutlet, SubscriptionStatus } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';


const salesChartConfig = {
  total: { label: 'Total Sales', color: 'hsl(var(--primary))' },
  today: { label: "Today's Sales", color: 'hsl(var(--chart-2))' },
};

const trendChartConfig = {
    sales: { label: 'Sales', color: 'hsl(var(--primary))' },
}

export default function FranchiseDashboardPage() {
    const { currentUser, pastOrders, selectOutlet } = useAppContext();
    const loggedInFranchiseName = currentUser?.name || "The Coffee House";

    // This is a placeholder, a real implementation would fetch this from a 'subscriptions' collection.
    const subscriptions = useMemo(() => (currentUser ? [{
        id: currentUser.subscriptionId || 'sub-1',
        franchiseName: loggedInFranchiseName,
        outletName: `${loggedInFranchiseName} - Main Branch`,
        adminName: currentUser.name,
        adminEmail: currentUser.email,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
        status: 'active',
        storageUsedMB: 1500,
        totalReads: 120000,
        totalWrites: 30000,
    }] : []), [currentUser, loggedInFranchiseName]);

    const outlets: FranchiseOutlet[] = useMemo(() => subscriptions
      .filter(s => s.franchiseName === loggedInFranchiseName)
      .map(sub => ({
        id: sub.id,
        name: sub.outletName,
        status: sub.status,
        managerName: sub.adminName || `Manager`,
        todaySales: pastOrders.filter(o => o.createdAt >= new Date(new Date().setHours(0,0,0,0))).reduce((sum, o) => sum + o.total, 0),
        totalSales: pastOrders.reduce((sum, o) => sum + o.total, 0),
        ordersToday: pastOrders.filter(o => o.createdAt >= new Date(new Date().setHours(0,0,0,0))).length,
    })), [subscriptions, loggedInFranchiseName, pastOrders]);

    const summary = useMemo(() => {
        const totalSales = outlets.reduce((sum, o) => sum + (o.totalSales || 0), 0);
        const todaySales = outlets.reduce((sum, o) => sum + (o.todaySales || 0), 0);
        const totalOrders = outlets.reduce((sum, o) => sum + (o.ordersToday || 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
        
        return {
            totalSales,
            todaySales,
            totalOrders,
            activeOutlets: outlets.filter(o => o.status === 'active').length,
            inactiveOutlets: outlets.filter(o => o.status !== 'active').length,
            topPerformer: { name: outlets[0]?.name || 'N/A', sales: outlets[0]?.todaySales || 0 },
            lowPerformer: { name: outlets[outlets.length - 1]?.name || 'N/A', sales: outlets[outlets.length - 1]?.todaySales || 0 },
            avgOrderValue,
        };
    }, [outlets]);

    const salesPerOutlet = useMemo(() => outlets.map(o => ({
        name: o.name.replace(`${loggedInFranchiseName} - `, ''),
        total: o.totalSales,
        today: o.todaySales,
    })), [outlets, loggedInFranchiseName]);

    const salesTrend = useMemo(() => {
        const trend = pastOrders.reduce((acc, order) => {
            const day = order.createdAt.toISOString().split('T')[0];
            acc[day] = (acc[day] || 0) + order.total;
            return acc;
        }, {} as Record<string, number>);
        
        return Object.entries(trend).map(([day, sales]) => ({ day, sales })).slice(-7);
    }, [pastOrders]);


    const [selectedOutlet, setSelectedOutlet] = useState<FranchiseOutlet | null>(null);

    const getStatusVariant = (status: SubscriptionStatus) => {
        switch (status) {
        case 'active': return 'default';
        case 'inactive': return 'secondary';
        case 'expired': return 'destructive';
        case 'suspended': return 'destructive';
        default: return 'outline';
        }
    };

    if (outlets.length === 0) {
        return (
            <div className="flex flex-col gap-8 text-center items-center justify-center h-full">
                <h1 className='text-3xl font-bold'>Franchise Dashboard</h1>
                <p className="text-muted-foreground">No outlets found for your franchise. Please contact Super Admin.</p>
            </div>
        )
    }

  return (
    <>
    <div className="flex flex-col gap-8">
        <h1 className='text-3xl font-bold'>Franchise Dashboard</h1>
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <IndianRupee className="h-6 w-6 mr-1" />
              {summary.totalSales.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">All outlets combined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <IndianRupee className="h-6 w-6 mr-1" />
              {summary.todaySales.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">+5.2% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalOrders.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">All outlets combined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Outlets</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeOutlets}</div>
            <p className="text-xs text-muted-foreground">Currently operational</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Outlets</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.inactiveOutlets}</div>
            <p className="text-xs text-muted-foreground">Suspended or Expired</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Per Outlet</CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={salesChartConfig} className="min-h-[300px] w-full">
               <BarChart data={salesPerOutlet}>
                 <CartesianGrid vertical={false} />
                 <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                 <YAxis tickFormatter={(value) => `₹${value / 1000}k`}/>
                 <ChartTooltip 
                    content={<ChartTooltipContent 
                      formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                    />}
                  />
                 <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                 <Bar dataKey="today" fill="var(--color-today)" radius={4} />
               </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>7-Day Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={trendChartConfig} className="min-h-[300px] w-full">
              <LineChart data={salesTrend}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickFormatter={(value) => `₹${value / 1000}k`}/>
                <ChartTooltip 
                    content={<ChartTooltipContent 
                        formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                    />} 
                />
                <Line dataKey="sales" type="monotone" stroke="var(--color-sales)" strokeWidth={2} dot={true} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Outlets Overview</CardTitle>
            <CardDescription>Manage and view performance of all your outlets.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Outlet Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Today's Sales</TableHead>
                        <TableHead>Total Sales</TableHead>
                        <TableHead>Orders Today</TableHead>
                        <TableHead>Manager</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {outlets.map(outlet => (
                        <TableRow key={outlet.id}>
                            <TableCell className='font-medium'>{outlet.name}</TableCell>
                            <TableCell><Badge variant={getStatusVariant(outlet.status as SubscriptionStatus)} className="capitalize">{outlet.status}</Badge></TableCell>
                            <TableCell>
                                <div className='flex items-center'>
                                    <IndianRupee className="h-4 w-4 mr-1" />
                                    {(outlet.todaySales || 0).toLocaleString('en-IN')}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className='flex items-center'>
                                    <IndianRupee className="h-4 w-4 mr-1" />
                                    {(outlet.totalSales || 0).toLocaleString('en-IN')}
                                </div>
                            </TableCell>
                            <TableCell>{outlet.ordersToday || 0}</TableCell>
                            <TableCell>{outlet.managerName}</TableCell>
                            <TableCell className='text-right'>
                                <Button variant="outline" size="sm" className='mr-2' onClick={() => setSelectedOutlet(outlet)}>Manage</Button>
                                <Button size="sm" onClick={() => selectOutlet(outlet)}>Open POS</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader>
                <CardTitle className='text-base flex items-center gap-2'><TrendingUp className='text-green-500'/> Top Performing Outlet</CardTitle>
            </CardHeader>
            <CardContent>
                <p className='text-lg font-bold'>{summary.topPerformer.name}</p>
                <p className='text-muted-foreground flex items-center'>
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {summary.topPerformer.sales.toLocaleString('en-IN')} today
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className='text-base flex items-center gap-2'><TrendingDown className='text-red-500'/> Lowest Performing Outlet</CardTitle>
            </CardHeader>
            <CardContent>
                <p className='text-lg font-bold'>{summary.lowPerformer.name}</p>
                <p className='text-muted-foreground flex items-center'>
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {summary.lowPerformer.sales.toLocaleString('en-IN')} today
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className='text-base'>Average Order Value</CardTitle>
            </CardHeader>
            <CardContent>
                <p className='text-xl font-bold flex items-center'>
                    <IndianRupee className="h-5 w-5 mr-1" />
                    {summary.avgOrderValue.toFixed(2)}
                </p>
                <p className='text-muted-foreground'>Across all outlets</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle className='text-base'>Sales Growth</CardTitle>
            </CardHeader>
            <CardContent>
                <p className='text-xl font-bold text-green-600'>+12.5%</p>
                <p className='text-muted-foreground'>vs. last 7 days</p>
            </CardContent>
        </Card>
      </div>

    </div>
    {selectedOutlet && (
        <ManageOutletDialog
            outlet={selectedOutlet}
            isOpen={!!selectedOutlet}
            onClose={() => setSelectedOutlet(null)}
        />
    )}
    </>
  );
}
