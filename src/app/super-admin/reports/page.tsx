
'use client'

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
import { topFranchisesBySales, monthlyNewSubscriptions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const storageChartConfig = {
  storage: { label: 'Storage (GB)', color: 'hsl(var(--chart-1))' },
};
const subsChartConfig = {
  subscriptions: { label: 'New Subs', color: 'hsl(var(--chart-2))' },
};

export default function SuperAdminReportsPage() {
  const storageData = topFranchisesBySales.map(f => ({ name: f.name, storage: f.totalStorage }));
  
  return (
    <div className="flex flex-col gap-8">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Detailed Analytics</h1>
          <p className="text-muted-foreground">In-depth reports on franchises and subscriptions.</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export All Data (CSV)
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Storage Used per Outlet (GB)</CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={storageChartConfig} className="min-h-[300px] w-full">
               <BarChart data={storageData} layout="vertical" margin={{ left: 20, right: 20 }}>
                 <CartesianGrid horizontal={false} />
                 <XAxis type="number" dataKey="storage" />
                 <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }}/>
                 <ChartTooltip content={<ChartTooltipContent />} />
                 <Bar dataKey="storage" fill="var(--color-storage)" radius={4} />
               </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly New Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={subsChartConfig} className="min-h-[300px] w-full">
              <LineChart data={monthlyNewSubscriptions}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="count" type="monotone" stroke="var(--color-subscriptions)" strokeWidth={2} dot={true} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Franchise Summary</CardTitle>
            <CardDescription>Overview of all franchises.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Franchise</TableHead>
                        <TableHead>Total Outlets</TableHead>
                        <TableHead>Total Sales</TableHead>
                        <TableHead>Total Storage (GB)</TableHead>
                        <TableHead>Last Active</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {topFranchisesBySales.map(f => (
                        <TableRow key={f.id}>
                            <TableCell className='font-medium'>{f.name}</TableCell>
                            <TableCell>{f.totalOutlets}</TableCell>
                            <TableCell>₹{f.totalSales.toLocaleString('en-IN')}</TableCell>
                            <TableCell>{f.totalStorage.toFixed(2)} GB</TableCell>
                            <TableCell>{f.lastActive.toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
