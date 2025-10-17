
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
import { topFranchisesBySales, monthlyNewSubscriptions, subscriptions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Download, IndianRupee, Calendar as CalendarIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { addDays, format, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';

const storageChartConfig = {
  storage: { label: 'Storage (GB)', color: 'hsl(var(--chart-1))' },
};
const subsChartConfig = {
  subscriptions: { label: 'New Subs', color: 'hsl(var(--chart-2))' },
};

export default function SuperAdminReportsPage() {
  const router = useRouter();
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const filteredFranchises = useMemo(() => {
    if (!date || !date.from) return topFranchisesBySales;
    
    // if only 'from' is selected, check from that date onwards. if both, check within interval.
    const interval = { start: date.from, end: date.to || new Date(8640000000000000) };
    
    return topFranchisesBySales.filter(f => isWithinInterval(f.lastActive, interval));

  }, [date]);
  
  const filteredSubscriptions = useMemo(() => {
    if (!date || !date.from) return subscriptions;
    
    const interval = { start: date.from, end: date.to || new Date(8640000000000000) };
    
    return subscriptions.filter(s => isWithinInterval(s.endDate, interval));
  }, [date]);

  const storageData = filteredFranchises.map(f => ({ name: f.name, storage: f.totalStorage }));
  
  const handleFranchiseClick = (franchiseName: string) => {
    router.push(`/super-admin/subscriptions?franchise=${encodeURIComponent(franchiseName)}`);
  };

  const handleExport = () => {
    const headers = ['Franchise Name', 'Outlet Name', 'Status', 'Storage Used (MB)', 'Start Date', 'End Date', 'Admin Name', 'Admin Email'];
    const rows = filteredSubscriptions.map(s => 
      [
        s.franchiseName,
        s.outletName,
        s.status,
        s.storageUsedMB,
        format(s.startDate, 'yyyy-MM-dd'),
        format(s.endDate, 'yyyy-MM-dd'),
        s.adminName || '',
        s.adminEmail
      ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(',') // Handle commas and quotes
    );

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n" 
      + rows.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "detailed_subscriptions_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="flex flex-col gap-8">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Detailed Analytics</h1>
          <p className="text-muted-foreground">In-depth reports on franchises and subscriptions.</p>
        </div>
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
            Export Detailed Report
          </Button>
        </div>
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
            <CardDescription>Overview of all franchises. Click a row to see details.</CardDescription>
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
                    {filteredFranchises.map(f => (
                        <TableRow key={f.id} onClick={() => handleFranchiseClick(f.name)} className="cursor-pointer">
                            <TableCell className='font-medium'>{f.name}</TableCell>
                            <TableCell>{f.totalOutlets}</TableCell>
                            <TableCell className='flex items-center'>
                                <IndianRupee className="h-4 w-4 mr-1" />
                                {f.totalSales.toLocaleString('en-IN')}
                            </TableCell>
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
