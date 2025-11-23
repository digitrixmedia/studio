
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, IndianRupee, Calendar as CalendarIcon, ShoppingBag, BarChart3 } from 'lucide-react';
import type { FranchiseOutlet, MenuItem, MenuCategory, Order } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';

const chartConfig = {
  sales: { label: 'Sales', color: 'hsl(var(--primary))' },
  items: { label: 'Items', color: 'hsl(var(--chart-2))' },
};

export default function FranchiseReportsPage() {
    const { menuItems, menuCategories, pastOrders: orders, outlets } = useAppContext();

  const [selectedOutlets, setSelectedOutlets] = useState<string[]>(['all']);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -6),
    to: new Date(),
  });

  const filteredOutlets = selectedOutlets[0] === 'all' 
    ? outlets 
    : outlets.filter(o => selectedOutlets.includes(o.id));

  const summary = useMemo(() => {
    const revenue = filteredOutlets.reduce((sum, o) => sum + (o.totalSales || 0), 0);
    // Simple mock for orders
    const totalOrders = filteredOutlets.reduce((sum, o) => sum + ((o.totalSales || 0) / 450), 0);
    return {
        revenue,
        orders: totalOrders,
        avgOrderValue: totalOrders > 0 ? revenue / totalOrders : 0,
    }
  }, [filteredOutlets]);


    const salesTrend = useMemo(() => {
        const trend = orders.reduce((acc, order) => {
            const day = new Date(order.createdAt).toISOString().split('T')[0];
            acc[day] = (acc[day] || 0) + order.total;
            return acc;
        }, {} as Record<string, number>);
        
        return Object.entries(trend).map(([day, sales]) => ({ day, sales })).slice(-7);
    }, [orders]);

  const itemWiseSales = menuItems
    .map(item => {
        const quantitySold = orders.reduce((sum, order) => 
        sum + order.items.reduce((itemSum, orderItem) => 
            itemSum + (orderItem.baseMenuItemId === item.id ? orderItem.quantity : 0), 0), 0);
        return { name: item.name, sales: quantitySold * item.price };
    })
    .filter(item => item.sales > 0)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);
    
  const categorySales = menuCategories.map(category => {
      const categoryItems = menuItems.filter(item => item.category === category.id);
      const sales = categoryItems.reduce((catSum, item) => {
          const itemSales = itemWiseSales.find(s => s.name === item.name)?.sales || 0;
          return catSum + itemSales;
      }, 0);
      return { name: category.name, sales };
  }).filter(c => c.sales > 0);

  const handleExport = () => {
    const headers = ['Outlet', 'Total Sales', 'Total Orders', 'Avg. Order Value'];
    const rows = filteredOutlets.map(outlet => {
      const outletOrders = (outlet.totalSales || 0) / 450;
      const outletAOV = outletOrders > 0 ? (outlet.totalSales || 0) / outletOrders : 0;
      const sanitizedName = `"${outlet.name.replace(/"/g, '""')}"`;
      return [
        sanitizedName,
        outlet.totalSales || '0',
        Math.round(outletOrders),
        outletAOV.toFixed(2)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "outlet_breakdown_report.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Franchise Performance Reports</CardTitle>
          <CardDescription>
            Analyze sales, top items, and outlet performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className='flex gap-2 items-center'>
                <Select value={selectedOutlets[0]} onValueChange={(val) => setSelectedOutlets([val])}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Outlet" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Outlets</SelectItem>
                        {outlets.map(outlet => (
                            <SelectItem key={outlet.id} value={outlet.id}>{outlet.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className="w-[280px] justify-start text-left font-normal"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date range</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
            </div>
            <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
            </Button>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className='flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold flex items-center">
                    <IndianRupee className="h-6 w-6 mr-1" />
                    {summary.revenue.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-muted-foreground">For the selected period</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className='flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium'>Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{Math.round(summary.orders).toLocaleString('en-IN')}</div>
                 <p className="text-xs text-muted-foreground">Across selected outlets</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className='flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium'>Average Order Value</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold flex items-center">
                    <IndianRupee className="h-6 w-6 mr-1" />
                    {summary.avgOrderValue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">For the selected period</p>
            </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Sales Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <LineChart data={salesTrend}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="day" />
                            <YAxis tickFormatter={(val) => `₹${val / 1000}k`} />
                            <ChartTooltip content={<ChartTooltipContent formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />} />
                            <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Top Selling Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <BarChart data={itemWiseSales.slice(0, 5)} layout='vertical' margin={{ left: 30 }}>
                             <CartesianGrid horizontal={false} />
                             <XAxis type="number" dataKey="sales" tickFormatter={(val) => `₹${val / 1000}k`} />
                             <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }}/>
                             <ChartTooltip content={<ChartTooltipContent formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />} />
                             <Bar dataKey="sales" fill="var(--color-items)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>

         <Card>
            <CardHeader>
                <CardTitle>Outlet Breakdown</CardTitle>
                <CardDescription>Performance comparison of selected outlets.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Outlet</TableHead>
                            <TableHead className='text-right'>Total Sales</TableHead>
                            <TableHead className='text-right'>Total Orders</TableHead>
                            <TableHead className='text-right'>Avg. Order Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOutlets.map(outlet => {
                            const outletOrders = (outlet.totalSales || 0) / 450;
                            const outletAOV = outletOrders > 0 ? (outlet.totalSales || 0) / outletOrders : 0;
                            return (
                                <TableRow key={outlet.id}>
                                    <TableCell className='font-medium'>{outlet.name}</TableCell>
                                    <TableCell className='text-right'>
                                        <div className='flex items-center justify-end'>
                                            <IndianRupee className="h-4 w-4 mr-1" />
                                            {outlet.totalSales?.toLocaleString('en-IN') || '0'}
                                        </div>
                                    </TableCell>
                                    <TableCell className='text-right'>{Math.round(outletOrders).toLocaleString('en-IN')}</TableCell>
                                    <TableCell className='text-right'>
                                        <div className='flex items-center justify-end'>
                                            <IndianRupee className="h-4 w-4 mr-1" />
                                            {outletAOV.toFixed(2)}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}

    

    