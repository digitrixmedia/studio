
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IndianRupee, Percent } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface PrintableReportProps {
    dateRange: DateRange | undefined;
    summary: { totalSales: number; totalOrders: number; averageOrderValue: number };
    orderTypeData: { type: string, sales: number }[];
    paymentMethodData: { method: string, sales: number }[];
    dailySalesData: { date: Date; sales: number; orders: number; aov: number }[];
    itemWiseSales: { name: string; quantitySold: number; sales: number }[];
    categorySales: { name: string; itemsSold: number; percentage: number; sales: number }[];
    hourlySalesData: { hour: string; sales: number }[];
    purchaseSummary: { totalPurchases: number; totalPurchaseOrders: number; uniqueVendors: number };
    vendorWisePurchases: { name: string; total: number; orders: number }[];
}

const chartConfig = {
  sales: { label: 'Sales', color: 'hsl(var(--primary))' },
  cash: { label: 'Cash', color: '#34d399' },
  upi: { label: 'UPI', color: '#fb923c' },
  card: { label: 'Card', color: '#60a5fa' },
  'dine-in': { label: 'Dine-In', color: '#34d399' },
  takeaway: { label: 'Takeaway', color: '#fb923c' },
  delivery: { label: 'Delivery', color: '#60a5fa' },
};

export const PrintableReport = ({
    dateRange,
    summary,
    orderTypeData,
    paymentMethodData,
    dailySalesData,
    itemWiseSales,
    categorySales,
    hourlySalesData,
    purchaseSummary,
    vendorWisePurchases
}: PrintableReportProps) => {

    const formattedDateRange = dateRange?.from ? (
        dateRange.to ? 
        `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
        : format(dateRange.from, "LLL dd, y")
    ) : 'All Time';

    return (
        <div className="bg-white p-8 w-[210mm]">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold">ZappyyPOS Comprehensive Report</h1>
                <p className="text-lg text-gray-600">{formattedDateRange}</p>
            </header>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Sales Summary</h2>
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardHeader><CardTitle>Total Sales</CardTitle></CardHeader>
                        <CardContent className="text-2xl font-bold">₹{summary.totalSales.toLocaleString('en-IN')}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Total Orders</CardTitle></CardHeader>
                        <CardContent className="text-2xl font-bold">{summary.totalOrders.toLocaleString('en-IN')}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Avg. Order Value</CardTitle></CardHeader>
                        <CardContent className="text-2xl font-bold">₹{summary.averageOrderValue.toFixed(2)}</CardContent>
                    </Card>
                </div>
            </section>
            
             <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Overview</h2>
                <div className="grid grid-cols-2 gap-8" style={{ pageBreakInside: 'avoid' }}>
                    <div>
                        <h3 className="font-medium text-center mb-2">Sales by Order Type</h3>
                        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                            <BarChart data={orderTypeData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="type" />
                                <YAxis tickFormatter={(val) => `₹${val / 1000}k`} />
                                <ChartTooltip content={<ChartTooltipContent formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />} />
                                <Bar dataKey="sales" radius={4}>
                                    {orderTypeData.map((entry) => (
                                        <Cell key={entry.type} fill={chartConfig[entry.type.toLowerCase() as keyof typeof chartConfig]?.color || '#8884d8'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </div>
                     <div>
                        <h3 className="font-medium text-center mb-2">Payment Methods</h3>
                        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                            <PieChart>
                                <Pie data={paymentMethodData} dataKey="sales" nameKey="method" innerRadius={50} paddingAngle={5}>
                                    {paymentMethodData.map((entry) => (
                                        <Cell key={entry.method} fill={chartConfig[entry.method.toLowerCase() as keyof typeof chartConfig]?.color || '#82ca9d'} />
                                    ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />} />
                            </PieChart>
                        </ChartContainer>
                    </div>
                </div>
            </section>

             <section className="mb-8" style={{ pageBreakBefore: 'always' }}>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Daily Sales</h2>
                 <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                    <LineChart data={dailySalesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickFormatter={(val) => format(val, 'd MMM')} />
                        <YAxis tickFormatter={(val) => `₹${val/1000}k`}/>
                        <ChartTooltip content={<ChartTooltipContent formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />} />
                        <Line type="monotone" dataKey="sales" stroke={chartConfig.sales.color} />
                    </LineChart>
                </ChartContainer>
            </section>
            
            <section className="mb-8" style={{ pageBreakBefore: 'always' }}>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Top Selling Items</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-right">Quantity Sold</TableHead>
                            <TableHead className="text-right">Total Sales</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {itemWiseSales.slice(0,10).map(item => (
                            <TableRow key={item.name}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{item.quantitySold}</TableCell>
                                <TableCell className="text-right">₹{item.sales.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>

             <section className="mb-8" style={{ pageBreakBefore: 'always' }}>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Category Sales</h2>
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
                        <TableCell className="text-right">{cat.percentage.toFixed(2)}%</TableCell>
                        <TableCell className="text-right">₹{cat.sales.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </section>

            <section className="mb-8" style={{ pageBreakBefore: 'always' }}>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Purchase Summary</h2>
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardHeader><CardTitle>Total Purchases</CardTitle></CardHeader>
                        <CardContent className="text-2xl font-bold">₹{purchaseSummary.totalPurchases.toLocaleString('en-IN')}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Purchase Orders</CardTitle></CardHeader>
                        <CardContent className="text-2xl font-bold">{purchaseSummary.totalPurchaseOrders}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Unique Suppliers</CardTitle></CardHeader>
                        <CardContent className="text-2xl font-bold">{purchaseSummary.uniqueVendors}</CardContent>
                    </Card>
                </div>
                <h3 className="text-lg font-semibold mt-6 mb-2">Vendor-wise Purchases</h3>
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
                        <TableCell className="text-right">₹{vendor.total.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </section>
        </div>
    );
};
