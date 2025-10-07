
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts';
import { salesData, menuItems, orders, menuCategories } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, IndianRupee, Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

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
  const [activeTab, setActiveTab] = useState('sales');
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -6),
    to: new Date(),
  });

  const handleExport = () => {
    let data: any[];
    let headers: string[];
    let filename: string;

    switch (activeTab) {
      case 'item-wise':
        headers = ['Item Name', 'Total Sales'];
        data = itemWiseSales;
        filename = 'item-wise-sales.csv';
        break;
      case 'category':
        headers = ['Category Name', 'Total Sales'];
        data = categorySales;
        filename = 'category-sales.csv';
        break;
      case 'sales':
      default:
        headers = ['Date', 'Sales'];
        data = salesData;
        filename = 'sales-report.csv';
        break;
    }

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
    <Tabs defaultValue="sales" value={activeTab} onValueChange={setActiveTab}>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="item-wise">Item-wise Sales</TabsTrigger>
          <TabsTrigger value="category">Category Sales</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
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
              <PopoverContent className="w-auto p-0" align="end">
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
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <TabsContent value="sales">
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales</CardTitle>
            <CardDescription>Sales data for the selected period.</CardDescription>
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
      <TabsContent value="item-wise">
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
       <TabsContent value="category">
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
    </Tabs>
  );
}
