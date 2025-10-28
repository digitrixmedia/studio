

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

import { superAdminStats as initialStats, topFranchisesBySales as initialFranchises, dailyActiveOutlets as initialActivity, subscriptionStatusDistribution as initialSubs } from '@/lib/data';
import { BarChart3, Box, CreditCard, IndianRupee, RefreshCw, ShoppingBag, Users, Database, FileText } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const subscriptionChartConfig = {
  active: { label: 'Active', color: 'hsl(var(--chart-1))' },
  expired: { label: 'Expired', color: 'hsl(var(--chart-2))' },
  suspended: { label: 'Suspended', color: 'hsl(var(--chart-3))' },
  inactive: { label: 'Inactive', color: 'hsl(var(--chart-4))' },
};
const activityChartConfig = {
    outlets: { label: 'Active Outlets', color: 'hsl(var(--primary))' },
}
const storageChartConfig = {
  storage: { label: 'Storage (GB)', color: 'hsl(var(--chart-1))' },
};


export default function SuperAdminDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(initialStats);
  const [franchises, setFranchises] = useState(initialFranchises);
  const [activity, setActivity] = useState(initialActivity);
  const [subscriptions, setSubscriptions] = useState(initialSubs);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulate data fetching and update
      setStats(prev => ({ ...prev, totalOrders: prev.totalOrders + Math.floor(Math.random() * 100) }));
      setFranchises(prev => prev.map(f => ({ ...f, totalSales: f.totalSales + Math.floor(Math.random() * 1000) })).sort((a, b) => b.totalSales - a.totalSales));
      setActivity(prev => prev.map(a => ({ ...a, count: a.count + Math.floor(Math.random() * 3) - 1 })));
      setLoading(false);
    }, 1000);
  };
  
  const storageData = franchises.map(f => ({ name: f.name, storage: f.totalStorage }));

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Active + Expired</p>
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
            <CardTitle className="text-sm font-medium">Total Storage Used</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStorageUsedGB} GB</div>
            <p className="text-xs text-muted-foreground">Across all tenants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
                <IndianRupee className="h-6 w-6 mr-1" />
                {(stats.totalSales / 100000).toFixed(2)}L
            </div>
            <p className="text-xs text-muted-foreground">From all outlets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">From all outlets</p>
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
                {franchises.slice(0, 5).map(f => (
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
                <Pie data={subscriptions} dataKey="count" nameKey="status" innerRadius={50}>
                   {subscriptions.map((entry) => (
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
                 <XAxis type="number" dataKey="storage" tickFormatter={(val) => `${val}GB`} />
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

  