
'use client';

import { useState, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Pie, PieChart, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dailySalesData as initialDailySales, menuItems, orders, menuCategories, hourlySalesData, users, purchaseOrders, vendors, ingredients } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, IndianRupee, Calendar as CalendarIcon, ShoppingCart, ShoppingBag, Eye, Percent, Truck, Loader2 } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { Order, PurchaseOrder } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--primary))',
  },
  cash: { label: 'Cash', color: 'hsl(var(--chart-1))' },
  upi: { label: 'UPI', color: 'hsl(var(--chart-2))' },
  card: { label: 'Card', color: 'hsl(var(--chart-3))' },
  'dine-in': { label: 'Dine-In', color: 'hsl(var(--chart-1))' },
  takeaway: { label: 'Takeaway', color: 'hsl(var(--chart-2))' },
  delivery: { label: 'Delivery', color: 'hsl(var(--chart-3))' },
};

const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown';
const getVendorName = (vendorId: string) => vendors.find(v => v.id === vendorId)?.name || 'Unknown Vendor';
const getIngredientName = (ingredientId: string) => ingredients.find(i => i.id === ingredientId)?.name || 'Unknown Ingredient';


export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -6),
    to: new Date(),
  });
  const [selectedDay, setSelectedDay] = useState<{ date: Date; orders: Order[] } | null>(null);
  const [viewedOrder, setViewedOrder] = useState<Order | null>(null);
  const [viewedPurchaseOrder, setViewedPurchaseOrder] = useState<PurchaseOrder | null>(null);

  const filteredCompletedOrders = useMemo(() => {
    return orders.filter(o => {
        const isCompleted = o.status === 'completed';
        if (!date?.from || !isCompleted) return isCompleted;
        const isInInterval = isWithinInterval(o.createdAt, {
            start: startOfDay(date.from),
            end: date.to ? endOfDay(date.to) : endOfDay(date.from)
        });
        return isInInterval;
    });
  }, [date]);
  
  const filteredPurchaseOrders = useMemo(() => {
    return purchaseOrders.filter(po => {
      if(!date?.from) return true;
      return isWithinInterval(po.date, {
        start: startOfDay(date.from),
        end: date.to ? endOfDay(date.to) : endOfDay(date.from),
      });
    });
  }, [date]);


  // Sales metrics
  const totalSales = filteredCompletedOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredCompletedOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  
  // Purchase metrics
  const totalPurchases = filteredPurchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0);
  const totalPurchaseOrders = filteredPurchaseOrders.length;
  const uniqueVendors = new Set(filteredPurchaseOrders.map(po => po.vendorId)).size;

  const itemWiseSales = useMemo(() => {
    return menuItems
      .map(item => {
        const { quantitySold, totalSales } = filteredCompletedOrders.reduce(
          (acc, order) => {
            order.items.forEach(orderItem => {
              if (orderItem.id.startsWith(item.id)) {
                acc.quantitySold += orderItem.quantity;
                acc.totalSales += orderItem.totalPrice;
              }
            });
            return acc;
          },
          { quantitySold: 0, totalSales: 0 }
        );

        return {
          name: item.name,
          category: item.category,
          quantitySold: quantitySold,
          sales: totalSales,
        };
      })
      .filter(item => item.sales > 0)
      .sort((a, b) => b.sales - a.sales);
  }, [filteredCompletedOrders]);

    const categorySales = useMemo(() => {
        return menuCategories.map(category => {
            const itemsInCategory = itemWiseSales.filter(item => item.category === category.id);
            const sales = itemsInCategory.reduce((sum, item) => sum + item.sales, 0);
            const itemsSold = itemsInCategory.reduce((sum, item) => sum + item.quantitySold, 0);
            return {
                name: category.name,
                sales,
                itemsSold,
                percentage: totalSales > 0 ? (sales / totalSales) * 100 : 0,
            };
        }).filter(c => c.sales > 0)
          .sort((a, b) => b.sales - a.sales);
    }, [itemWiseSales, totalSales]);

    const paymentMethodSales = (filteredCompletedOrders as Required<Order>[]).reduce((acc, order) => {
        acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + order.total;
        return acc;
    }, {} as Record<string, number>);

    const paymentMethodData = Object.entries(paymentMethodSales).map(([method, sales]) => ({
      method,
      sales,
    }));

    const orderTypeSales = filteredCompletedOrders.reduce((acc, order) => {
        acc[order.type] = (acc[order.type] || 0) + order.total;
        return acc;
    }, {} as Record<string, number>);

    const orderTypeData = Object.entries(orderTypeSales).map(([type, sales]) => ({
      type,
      sales,
    }));
    
  const dailySalesData = useMemo(() => {
    return initialDailySales.map(day => {
      const filtered = filteredCompletedOrders.filter(order => format(order.createdAt, 'EEE') === format(day.date, 'EEE'));
      return {
        ...day,
        sales: filtered.reduce((sum, o) => sum + o.total, 0),
        orders: filtered.length,
        aov: filtered.length > 0 ? filtered.reduce((sum, o) => sum + o.total, 0) / filtered.length : 0
      };
    }).filter(d => d.orders > 0);
  }, [filteredCompletedOrders]);
  
  const vendorWisePurchases = useMemo(() => {
    const vendorMap = new Map<string, { name: string, total: number, orders: number }>();
    filteredPurchaseOrders.forEach(po => {
      const vendorName = getVendorName(po.vendorId);
      const existing = vendorMap.get(po.vendorId);
      if (existing) {
        existing.total += po.grandTotal;
        existing.orders += 1;
      } else {
        vendorMap.set(po.vendorId, { name: vendorName, total: po.grandTotal, orders: 1 });
      }
    });
    return Array.from(vendorMap.values()).sort((a,b) => b.total - a.total);
  }, [filteredPurchaseOrders]);

  const handleExport = () => {
    const sanitize = (value: any) => `"${String(value).replace(/"/g, '""')}"`;
    let csvContent = "data:text/csv;charset=utf-8,";

    // Section: Report Summary
    csvContent += "ZappyyPOS Comprehensive Report\n";
    const dateRange = date?.from ? `${format(date.from, "LLL dd, y")} - ${date.to ? format(date.to, "LLL dd, y") : ''}` : 'All Time';
    csvContent += `Date Range:,"${dateRange}"\n\n`;
    
    csvContent += "Overall Summary\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Sales,"${totalSales.toFixed(2)}"\n`;
    csvContent += `Total Orders,"${totalOrders}"\n`;
    csvContent += `Average Order Value,"${averageOrderValue.toFixed(2)}"\n\n`;

    // Section: Daily Sales
    csvContent += "Daily Sales Breakdown\n";
    csvContent += "Date,Total Sales,Orders,Avg. Order Value\n";
    dailySalesData.forEach(d => {
      csvContent += [format(d.date, 'yyyy-MM-dd'), d.sales.toFixed(2), d.orders, d.aov.toFixed(2)].join(',') + '\n';
    });
    csvContent += "\n";

    // Section: Item-wise Sales
    csvContent += "Item-wise Sales\n";
    csvContent += "Item,Quantity Sold,Total Sales\n";
    itemWiseSales.forEach(item => {
        csvContent += [sanitize(item.name), item.quantitySold, item.sales.toFixed(2)].join(',') + '\n';
    });
    csvContent += "\n";

    // Section: Category Sales
    csvContent += "Category Sales\n";
    csvContent += "Category,Items Sold,% of Total Sales,Total Revenue\n";
    categorySales.forEach(cat => {
        csvContent += [sanitize(cat.name), cat.itemsSold, cat.percentage.toFixed(2), cat.sales.toFixed(2)].join(',') + '\n';
    });
    csvContent += "\n";

    // Section: Order Type Sales
    csvContent += "Sales by Order Type\n";
    csvContent += "Order Type,Total Sales\n";
    orderTypeData.forEach(ot => {
        csvContent += [sanitize(ot.type), ot.sales.toFixed(2)].join(',') + '\n';
    });
    csvContent += "\n";

    // Section: Payment Method Sales
    csvContent += "Sales by Payment Method\n";
    csvContent += "Payment Method,Total Sales\n";
    paymentMethodData.forEach(pm => {
        csvContent += [sanitize(pm.method), pm.sales.toFixed(2)].join(',') + '\n';
    });
    csvContent += "\n";

    // Section: Purchase Summary
    csvContent += "Purchase Summary\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Purchases,"${totalPurchases.toFixed(2)}"\n`;
    csvContent += `Total Purchase Orders,"${totalPurchaseOrders}"\n`;
    csvContent += `Unique Suppliers,"${uniqueVendors}"\n\n`;

    // Section: Vendor-wise Purchases
    csvContent += "Vendor-wise Purchases\n";
    csvContent += "Supplier,Total Orders,Total Amount\n";
    vendorWisePurchases.forEach(v => {
        csvContent += [sanitize(v.name), v.orders, v.total.toFixed(2)].join(',') + '\n';
    });
    csvContent += "\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ZappyyPOS_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDayClick = (dayData: { date: Date, orders: number }) => {
    const simulatedOrders = orders.filter(o => o.status === 'completed' && format(o.createdAt, 'EEE') === format(dayData.date, 'EEE'));
    setSelectedDay({ date: dayData.date, orders: simulatedOrders });
  };
  
  const handleExportDayDetails = () => {
    if (!selectedDay) return;

    const headers = ['Order #', 'Time', 'Customer', 'Type', 'Cashier', 'Total'];
    const rows = selectedDay.orders.map(order => 
        [
            order.orderNumber,
            format(order.createdAt, 'p'),
            order.customerName || 'N/A',
            order.type,
            getUserName(order.createdBy),
            order.total.toFixed(2)
        ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `sales_details_${format(selectedDay.date, 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }


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
                <div className="text-2xl font-bold flex items-center">
                    <IndianRupee className="h-6 w-6 mr-1" />
                    {totalSales.toLocaleString('en-IN')}
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
                <div className="text-2xl font-bold flex items-center">
                    <IndianRupee className="h-6 w-6 mr-1" />
                    {averageOrderValue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">For the selected period</p>
            </CardContent>
        </Card>
      </div>

       <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="daily-sales">Daily Sales</TabsTrigger>
          <TabsTrigger value="item-wise">Item Sales</TabsTrigger>
          <TabsTrigger value="category">Category Sales</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Sales</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className='mt-6 space-y-6'>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Sales by Order Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                            <BarChart data={orderTypeData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="type" tickLine={false} axisLine={false} tickMargin={8} className="capitalize" />
                                <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                                <ChartTooltip 
                                    cursor={false}
                                    content={<ChartTooltipContent 
                                    formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                                    />}
                                />
                                <Bar dataKey="sales" radius={4}>
                                    {orderTypeData.map((entry) => (
                                        <Cell key={entry.type} fill={`var(--color-${entry.type.toLowerCase()})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="sales" hideLabel formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />} />
                                <Pie data={paymentMethodData} dataKey="sales" nameKey="method" innerRadius={50} paddingAngle={5}>
                                    {paymentMethodData.map((entry) => (
                                        <Cell key={entry.method} fill={`var(--color-${entry.method.toLowerCase()})`} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="method" />} />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Sales Report</CardTitle>
                    <CardDescription>A detailed breakdown of each sale in the selected period. Click a row to see order details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order No.</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Order Type</TableHead>
                                <TableHead>Biller</TableHead>
                                <TableHead className='text-right'>Discount</TableHead>
                                <TableHead className='text-right'>Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="font-bold bg-muted hover:bg-muted">
                                <TableCell>Total</TableCell>
                                <TableCell colSpan={4}></TableCell>
                                <TableCell className='text-right'>{filteredCompletedOrders.reduce((sum, o) => sum + o.discount, 0).toFixed(2)}</TableCell>
                                <TableCell className='text-right'>{totalSales.toFixed(2)}</TableCell>
                            </TableRow>
                            {filteredCompletedOrders.map(order => (
                                <TableRow key={order.id} onClick={() => setViewedOrder(order)} className="cursor-pointer">
                                    <TableCell>#{order.orderNumber}</TableCell>
                                    <TableCell>{format(order.createdAt, 'dd-MM-yy')}</TableCell>
                                    <TableCell className="capitalize">{order.paymentMethod}</TableCell>
                                    <TableCell className="capitalize">{order.type.replace(/-/g, ' ')}</TableCell>
                                    <TableCell>{getUserName(order.createdBy)}</TableCell>
                                    <TableCell className="text-right">{order.discount.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-medium">{order.total.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="daily-sales" className='mt-6'>
           <Card>
                <CardHeader>
                    <CardTitle>Daily Sales</CardTitle>
                    <CardDescription>Sales data for the selected period. Click a row to see individual bills.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                    <LineChart data={dailySalesData}>
                        <CartesianGrid vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            tickLine={false} 
                            axisLine={false} 
                            tickMargin={8} 
                            tickFormatter={(value) => format(value, 'EEE, d')}
                        />
                        <YAxis
                        tickFormatter={(value) => `₹${value / 1000}k`}
                        tickLine={false}
                        axisLine={false}
                        />
                        <ChartTooltip 
                        content={<ChartTooltipContent 
                            formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                            labelFormatter={(label, payload) => {
                                if (payload && payload.length > 0) {
                                    return format(payload[0].payload.date, 'EEE, MMM d');
                                }
                                return label;
                            }}
                        />} 
                        />
                        <Line dataKey="sales" type="monotone" stroke="var(--color-sales)" strokeWidth={2} dot={true} />
                    </LineChart>
                    </ChartContainer>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Total Sales</TableHead>
                                <TableHead className="text-right">Orders</TableHead>
                                <TableHead className="text-right">Avg. Order Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dailySalesData.map(day => (
                                <TableRow key={format(day.date, 'yyyy-MM-dd')} onClick={() => handleDayClick(day)} className="cursor-pointer">
                                    <TableCell className='font-medium'>{format(day.date, 'EEE, MMM d')}</TableCell>
                                    <TableCell className="text-right flex items-center justify-end">
                                        <IndianRupee className="h-4 w-4 mr-1" />
                                        {day.sales.toLocaleString('en-IN')}
                                    </TableCell>
                                    <TableCell className="text-right">{day.orders}</TableCell>
                                    <TableCell className="text-right flex items-center justify-end">
                                        <IndianRupee className="h-4 w-4 mr-1" />
                                        {day.aov.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="item-wise" className='mt-6'>
            <Card>
            <CardHeader>
                <CardTitle>Item-wise Sales</CardTitle>
                <CardDescription>Sales performance of individual items for the selected period.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
                <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                <BarChart data={itemWiseSales.slice(0, 10)} layout="vertical" margin={{ left: 20, right: 20 }}>
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
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Quantity Sold</TableHead>
                      <TableHead className="text-right">Total Sales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemWiseSales.map(item => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">{item.quantitySold}</TableCell>
                        <TableCell className="text-right flex items-center justify-end">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          {item.sales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

            </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="category" className='mt-6'>
            <Card>
            <CardHeader>
                <CardTitle>Category Sales</CardTitle>
                <CardDescription>Revenue from different menu categories for the selected period.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Items Sold</TableHead>
                      <TableHead className="text-right">% of Total Sales</TableHead>
                      <TableHead className="text-right">Total Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categorySales.map(cat => (
                      <TableRow key={cat.name}>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell className="text-right">{cat.itemsSold}</TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                                {cat.percentage.toFixed(2)}<Percent className="h-3 w-3 ml-1" />
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <IndianRupee className="h-4 w-4 mr-1" />
                            {cat.sales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
        <TabsContent value="purchases" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
              <Card>
                  <CardHeader className='flex-row items-center justify-between pb-2'>
                      <CardTitle className='text-sm font-medium'>Total Purchases</CardTitle>
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold flex items-center">
                          <IndianRupee className="h-6 w-6 mr-1" />
                          {totalPurchases.toLocaleString('en-IN')}
                      </div>
                      <p className="text-xs text-muted-foreground">For the selected period</p>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className='flex-row items-center justify-between pb-2'>
                      <CardTitle className='text-sm font-medium'>Purchase Orders</CardTitle>
                      <Truck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{totalPurchaseOrders}</div>
                      <p className="text-xs text-muted-foreground">in selected period</p>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className='flex-row items-center justify-between pb-2'>
                      <CardTitle className='text-sm font-medium'>Unique Suppliers</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{uniqueVendors}</div>
                      <p className="text-xs text-muted-foreground">in selected period</p>
                  </CardContent>
              </Card>
          </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendor-wise Purchases</CardTitle>
                <CardDescription>Breakdown of purchase amounts by supplier.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right">Total Orders</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorWisePurchases.map(vendor => (
                      <TableRow key={vendor.name}>
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell className="text-right">{vendor.orders}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <IndianRupee className="h-4 w-4 mr-1" />
                            {vendor.total.toLocaleString('en-IN')}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Purchase Order Log</CardTitle>
                        <CardDescription>Detailed log of all purchase entries. Click to view details.</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPurchaseOrders.map(po => (
                        <TableRow key={po.id} onClick={() => setViewedPurchaseOrder(po)} className="cursor-pointer">
                          <TableCell className="font-medium">{po.poNumber}</TableCell>
                          <TableCell>{getVendorName(po.vendorId)}</TableCell>
                          <TableCell>{format(po.date, 'dd MMM, yyyy')}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              <IndianRupee className="h-4 w-4 mr-1" />
                              {po.grandTotal.toFixed(2)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Sales Details for {selectedDay?.date ? format(selectedDay.date, 'EEE, MMM d') : ''}</DialogTitle>
            <DialogDescription>
              Showing all completed bills for the selected day.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedDay?.orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                    <TableCell>{format(order.createdAt, 'p')}</TableCell>
                    <TableCell>{order.customerName || 'N/A'}</TableCell>
                    <TableCell><Badge variant="outline">{order.type}</Badge></TableCell>
                    <TableCell>{getUserName(order.createdBy)}</TableCell>
                    <TableCell className="text-right flex items-center justify-end">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {order.total.toFixed(2)}
                    </TableCell>
                     <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setViewedOrder(order)}>
                            <Eye className="h-4 w-4" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
           <DialogFooter>
                <Button variant="outline" onClick={handleExportDayDetails}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
                <Button onClick={() => setSelectedDay(null)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

       <Dialog open={!!viewedOrder} onOpenChange={() => setViewedOrder(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Order #{viewedOrder?.orderNumber}</DialogTitle>
                <DialogDescription>
                    {viewedOrder?.customerName} | {viewedOrder?.type}
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className='text-right'>Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {viewedOrder?.items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>{item.quantity} x {item.name}</TableCell>
                                <TableCell className='text-right flex items-center justify-end'>
                                    <IndianRupee className="h-4 w-4 mr-1" />
                                    {item.totalPrice.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 <div className='mt-4 pt-4 border-t font-bold flex justify-between'>
                    <span>Total</span>
                    <span className='flex items-center'>
                        <IndianRupee className="h-5 w-5 mr-1" />
                        {viewedOrder?.total.toFixed(2)}
                    </span>
                </div>
            </div>
             <DialogFooter>
                <Button variant="outline" onClick={() => setViewedOrder(null)}>Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    
    <Dialog open={!!viewedPurchaseOrder} onOpenChange={() => setViewedPurchaseOrder(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Purchase Order: {viewedPurchaseOrder?.poNumber}</DialogTitle>
          <DialogDescription>
            Vendor: {viewedPurchaseOrder ? getVendorName(viewedPurchaseOrder.vendorId) : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viewedPurchaseOrder?.items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{getIngredientName(item.ingredientId)}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className='mt-4 pt-4 border-t space-y-2 text-sm'>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{viewedPurchaseOrder?.subTotal.toFixed(2)}</span>
            </div>
             <div className="flex justify-between">
              <span>Discount</span>
              <span className="text-destructive">- {viewedPurchaseOrder?.totalDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Other Charges</span>
              <span>{viewedPurchaseOrder?.otherCharges.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes</span>
              <span>{viewedPurchaseOrder?.totalTaxes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>Grand Total</span>
              <span>{viewedPurchaseOrder?.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setViewedPurchaseOrder(null)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
}
