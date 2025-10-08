
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Pie, PieChart, Cell } from 'recharts';
import { salesData, menuItems, orders, menuCategories, hourlySalesData } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, IndianRupee, Calendar as CalendarIcon, ShoppingCart, ShoppingBag } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { Order } from '@/lib/types';

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--primary))',
  },
  cash: { label: 'Cash', color: 'hsl(var(--chart-1))' },
  upi: { label: 'UPI', color: 'hsl(var(--chart-2))' },
  card: { label: 'Card', color: 'hsl(var(--chart-3))' },
  'Dine-In': { label: 'Dine-In', color: 'hsl(var(--chart-1))' },
  'Takeaway': { label: 'Takeaway', color: 'hsl(var(--chart-2))' },
  'Delivery': { label: 'Delivery', color: 'hsl(var(--chart-3))' },
};

// Data processing should happen based on selected date range in a real app
const completedOrders = orders.filter(o => o.status === 'Completed');

const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0);
const totalOrders = completedOrders.length;
const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

const itemWiseSales = menuItems
  .map(item => {
    const quantitySold = completedOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, orderItem) => 
        itemSum + (orderItem.id.startsWith(item.id) ? orderItem.quantity : 0), 0), 0);
    return { name: item.name, sales: quantitySold * item.price };
  })
  .filter(item => item.sales > 0)
  .sort((a, b) => b.sales - a.sales);

const categorySales = menuCategories.map(category => {
    const categoryItems = menuItems.filter(item => item.category === category.id);
    const sales = categoryItems.reduce((catSum, item) => {
        const itemSales = itemWiseSales.find(s => s.name === item.name)?.sales || 0;
        return catSum + itemSales;
    }, 0);
    return { name: category.name, sales };
}).filter(c => c.sales > 0);

const paymentMethodSales = (completedOrders as Required<Order>[]).reduce((acc, order) => {
    acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + order.total;
    return acc;
}, {} as Record<string, number>);

const paymentMethodData = Object.entries(paymentMethodSales).map(([method, sales]) => ({
  method,
  sales,
}));

const orderTypeSales = completedOrders.reduce((acc, order) => {
    acc[order.type] = (acc[order.type] || 0) + order.total;
    return acc;
}, {} as Record<string, number>);

const orderTypeData = Object.entries(orderTypeSales).map(([type, sales]) => ({
  type,
  sales,
}));


export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -6),
    to: new Date(),
  });

  const handleExport = () => {
    // This export logic can be expanded based on the active tab
    const data = itemWiseSales;
    const headers = ['Item Name', 'Total Sales'];
    let filename = 'item-wise-sales.csv';

    const rows = data.map(row => Object.values(row).join(','));
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n" 
      + rows.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='flex flex-col gap-6'>
       <Card>
        <CardHeader>
          <CardTitle>Reports Dashboard</CardTitle>
          <CardDescription>
            Analyze sales trends, top sellers, and operational metrics.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className='flex gap-2 items-center'>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
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
                Export Detailed Report
            </Button>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className='flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium'>Total Sales</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₹{totalSales.toLocaleString('en-IN')}</div>
                <p className="text-xs text-muted-foreground">For the selected period</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className='flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium'>Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalOrders.toLocaleString('en-IN')}</div>
                 <p className="text-xs text-muted-foreground">Completed orders</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className='flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium'>Average Order Value</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₹{averageOrderValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">For the selected period</p>
            </CardContent>
        </Card>
      </div>

       <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="item-wise">Item Sales</TabsTrigger>
          <TabsTrigger value="category">Category Sales</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Sales</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className='mt-6'>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Daily Sales</CardTitle>
                        <CardDescription>Sales data for the selected period.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                        <LineChart data={salesData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis
                            tickFormatter={(value) => `₹${value / 1000}k`}
                            tickLine={false}
                            axisLine={false}
                            />
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
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="sales" hideLabel formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />} />
                                <Pie data={paymentMethodData} dataKey="sales" nameKey="method" innerRadius={50}>
                                    {paymentMethodData.map((entry) => (
                                        <Cell key={entry.method} fill={`var(--color-${entry.method.toLowerCase()})`} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 mt-4">
               <Card>
                <CardHeader>
                    <CardTitle>Sales by Order Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                        <BarChart data={orderTypeData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="type" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                            <ChartTooltip 
                                content={<ChartTooltipContent 
                                formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                                />}
                            />
                            <Bar dataKey="sales" fill="var(--color-sales)" radius={4}>
                                {orderTypeData.map((entry) => (
                                    <Cell key={entry.type} fill={`var(--color-${entry.type})`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
               </Card>
            </div>
        </TabsContent>
        <TabsContent value="item-wise" className='mt-6'>
            <Card>
            <CardHeader>
                <CardTitle>Item-wise Sales</CardTitle>
                <CardDescription>Sales performance of individual items for the selected period.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                <BarChart data={itemWiseSales} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" dataKey="sales" tickFormatter={(value) => `₹${value / 1000}k`} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }}/>
                    <ChartTooltip 
                        content={<ChartTooltipContent 
                        formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                        />}
                    />
                    <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                </BarChart>
                </ChartContainer>
            </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="category" className='mt-6'>
            <Card>
            <CardHeader>
                <CardTitle>Category Sales</CardTitle>
                <CardDescription>Revenue from different menu categories for the selected period.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <BarChart data={categorySales}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickFormatter={(value) => `₹${value / 1000}k`}/>
                    <ChartTooltip 
                        content={<ChartTooltipContent 
                        formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                        />}
                    />
                    <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                </BarChart>
                </ChartContainer>
            </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="hourly" className='mt-6'>
            <Card>
            <CardHeader>
                <CardTitle>Hourly Sales Trend</CardTitle>
                <CardDescription>Identify your busiest hours during the day.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <LineChart data={hourlySalesData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis
                    tickFormatter={(value) => `₹${value}`}
                    tickLine={false}
                    axisLine={false}
                    />
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

    