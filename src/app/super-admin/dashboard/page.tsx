
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Box, CreditCard, IndianRupee, RefreshCw, Users, Database, FileText } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/contexts/AppContext';
import { Subscription } from '@/lib/types';


const subscriptionChartConfig = {
  active: { label: 'Active', color: 'hsl(var(--chart-1))' },
  expired: { label: 'Expired', color: 'hsl(var(--chart-2))' },
  suspended: { label: 'Suspended', color: 'hsl(var(--chart-3))' },
  inactive: { label: 'Inactive', color: 'hsl(var(--chart-4))' },
};

const storageChartConfig = {
  storage: { label: 'Storage (GB)', color: 'hsl(var(--chart-1))' },
};


export default function SuperAdminDashboardPage() {
  const [loading, setLoading] = useState(false);
  const { pastOrders, users } = useAppContext();

  const subscriptions: Subscription[] = useMemo(() => users.filter(u => u.role === 'admin' && u.subscriptionId).map(u => ({
    id: u.subscriptionId!,
    franchiseName: u.name, // Simplified
    outletName: u.name + ' Outlet', // Simplified
    adminEmail: u.email,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Placeholder
    endDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000), // Placeholder
    status: 'active', // Placeholder
    storageUsedMB: Math.random() * 2048,
    totalReads: Math.random() * 500000,
    totalWrites: Math.random() * 100000,
  })), [users]);

  const stats = useMemo(() => {
    const totalSales = pastOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = pastOrders.length;
    const totalReads = subscriptions.reduce((sum, sub) => sum + sub.totalReads, 0);
    const totalWrites = subscriptions.reduce((sum, sub) => sum + sub.totalWrites, 0);
    const totalStorageUsedGB = subscriptions.reduce((sum, sub) => sum + (sub.storageUsedMB / 1024), 0);
    const activeOutlets = subscriptions.filter(s => s.status === 'active').length;

    return {
      totalSubscriptions: subscriptions.length,
      activeOutlets,
      totalStorageUsedGB: totalStorageUsedGB.toFixed(2),
      totalSales,
      totalOrders,
      totalReads,
      totalWrites,
    }
  }, [pastOrders, subscriptions]);

  const topFranchises = useMemo(() => {
    // This is simplified. A real implementation would group outlets by franchise.
    return subscriptions.map(sub => ({
        id: sub.id,
        name: sub.franchiseName,
        totalSales: pastOrders.length > 0 ? (stats.totalSales / subscriptions.length) * (Math.random() * 0.4 + 0.8) : 0,
        totalStorage: sub.storageUsedMB / 1024,
    })).sort((a,b) => b.totalSales - a.totalSales);
  }, [subscriptions, pastOrders, stats.totalSales]);

  const subscriptionStatusDist = useMemo(() => {
    const statusCount = subscriptions.reduce((acc, sub) => {
        acc[sub.status] = (acc[sub.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCount).map(([status, count]) => ({ status, count }));
  }, [subscriptions]);


  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  const storageData = topFranchises.map(f => ({ name: f.name, storage: f.totalStorage }));

  return (
    <div className="flex flex-col gap-8">
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Super Admin Dashboard</h1>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          {loading ? 'Refreshing...' : 'Refresh Stats'}
        </Button>
      </div>
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">All active tenants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Outlets</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOutlets}</div>
            <p className="text-xs text-muted-foreground">Currently operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStorageUsedGB} GB</div>
            <p className="text-xs text-muted-foreground">Across all tenants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reads</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalReads / 1000000).toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground">Database reads</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Writes</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalWrites / 1000000).toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground">Database writes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top 5 Franchises by Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Franchise</TableHead>
                  <TableHead className="text-right">Total Sales</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topFranchises.slice(0, 5).map(f => (
                  <TableRow key={f.id}>
                    <TableCell>{f.name}</TableCell>
                    <TableCell className="text-right flex items-center justify-end">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {f.totalSales.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={subscriptionChartConfig} className="min-h-[250px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="count" hideLabel />} />
                <Pie data={subscriptionStatusDist} dataKey="count" nameKey="status" innerRadius={50}>
                   {subscriptionStatusDist.map((entry) => (
                    <Cell key={entry.status} fill={`var(--color-${entry.status.toLowerCase()})`} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
         <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Storage Used per Franchise</CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={storageChartConfig} className="min-h-[250px] w-full">
               <BarChart data={storageData} layout="vertical" margin={{ left: 20 }}>
                 <CartesianGrid horizontal={false} />
                 <XAxis type="number" dataKey="storage" tickFormatter={(val) => `${val.toFixed(2)}GB`} />
                 <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                 <ChartTooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                 <Bar dataKey="storage" fill="var(--color-storage)" radius={4} />
               </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    