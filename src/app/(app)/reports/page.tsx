'use client';

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
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts';
import { salesData, menuItems, orders, menuCategories } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--primary))',
  },
};

const itemWiseSales = menuItems
  .map(item => {
    const quantitySold = orders.reduce((sum, order) => 
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

export default function ReportsPage() {
  return (
    <Tabs defaultValue="sales">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="item-wise">Item-wise Sales</TabsTrigger>
          <TabsTrigger value="category">Category Sales</TabsTrigger>
        </TabsList>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <TabsContent value="sales">
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales</CardTitle>
            <CardDescription>Sales data for the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <LineChart data={salesData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis
                  tickFormatter={(value) => `₹${value / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="sales" type="monotone" stroke="var(--color-sales)" strokeWidth={2} dot={true} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="item-wise">
        <Card>
          <CardHeader>
            <CardTitle>Item-wise Sales</CardTitle>
            <CardDescription>Sales performance of individual items.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
               <BarChart data={itemWiseSales} layout="vertical">
                 <CartesianGrid horizontal={false} />
                 <XAxis type="number" dataKey="sales" tickFormatter={(value) => `₹${value / 1000}k`} />
                 <YAxis type="category" dataKey="name" width={120} />
                 <ChartTooltip content={<ChartTooltipContent />} />
                 <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
               </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>
       <TabsContent value="category">
        <Card>
          <CardHeader>
            <CardTitle>Category Sales</CardTitle>
            <CardDescription>Revenue from different menu categories.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
               <BarChart data={categorySales}>
                 <CartesianGrid vertical={false} />
                 <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                 <YAxis tickFormatter={(value) => `₹${value / 1000}k`}/>
                 <ChartTooltip content={<ChartTooltipContent />} />
                 <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
               </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
