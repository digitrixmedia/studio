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
import { topFranchisesBySales, monthlyNewSubscriptions, subscriptions as allSubscriptions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Download, IndianRupee, Calendar as CalendarIcon, Database, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { addDays, format, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { SubscriptionStatus } from '@/lib/types';


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

  const [selectedFranchise, setSelectedFranchise] = useState<string>(topFranchisesBySales[0].id);

  const filteredFranchises = useMemo(() => {
    if (!date || !date.from) return topFranchisesBySales;
    
    const interval = { start: date.from, end: date.to || new Date(8640000000000000) };
    
    return topFranchisesBySales.filter(f => isWithinInterval(f.lastActive, interval));

  }, [date]);
  
  const filteredSubscriptions = useMemo(() => {
    if (!date || !date.from) return allSubscriptions;
    
    const interval = { start: date.from, end: date.to || new Date(8640000000000000) };
    
    return allSubscriptions.filter(s => isWithinInterval(new Date(s.endDate), interval));
  }, [date]);

  const outletsForSelectedFranchise = useMemo(() => {
    const franchise = topFranchisesBySales.find(f => f.id === selectedFranchise);
    if (!franchise) return [];
    return allSubscriptions.filter(s => s.franchiseName === franchise.name);
  }, [selectedFranchise]);

  const storageData = filteredFranchises.map(f => ({ name: f.name, storage: f.totalStorage }));
  
  const handleFranchiseClick = (franchiseName: string) => {
    router.push(`/super-admin/subscriptions?franchise=${encodeURIComponent(franchiseName)}`);
  };

  const handleExport = () => {
    const headers = ['Franchise Name', 'Outlet Name', 'Status', 'Storage Used (MB)', 'Start Date', 'End Date', 'Admin Name', 'Admin Email', 'Total Reads', 'Total Writes'];
    const rows = allSubscriptions.map(s => 
      [
        s.franchiseName,
        s.outletName,
        s.status,
        s.storageUsedMB,
        format(new Date(s.startDate), 'yyyy-MM-dd'),
        format(new Date(s.endDate), 'yyyy-MM-dd'),
        s.adminName || '',
        s.adminEmail,
        s.totalReads,
        s.totalWrites,
      ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "full_subscriptions_report.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };
  
    const getStatusVariant = (status: SubscriptionStatus) => {
        switch (status) {
        case 'active': return 'default';
        case 'inactive': return 'secondary';
        case 'expired': return 'destructive';
        case 'suspended': return 'destructive';
        default: return 'outline';
        }
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
            <CardTitle>Storage Used per Franchise (GB)</CardTitle>
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
            <CardDescription>Overview of all franchises. Click a row to see subscription details.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Franchise</TableHead>
                        <TableHead className='text-right'>Outlets</TableHead>
                        <TableHead className='text-right'>Total Sales</TableHead>
                        <TableHead className='text-right'>Storage</TableHead>
                        <TableHead className='text-right'>Total Reads</TableHead>
                        <TableHead className='text-right'>Total Writes</TableHead>
                        <TableHead className='text-right'>Last Active</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredFranchises.map(f => (
                        <TableRow key={f.id} onClick={() => handleFranchiseClick(f.name)} className="cursor-pointer">
                            <TableCell className='font-medium'>{f.name}</TableCell>
                            <TableCell className='text-right'>{f.totalOutlets}</TableCell>
                            <TableCell className='text-right'>
                                <div className='flex items-center justify-end'>
                                    <IndianRupee className="h-4 w-4 mr-1" />
                                    {f.totalSales.toLocaleString('en-IN')}
                                </div>
                            </TableCell>
                            <TableCell className='text-right'>{f.totalStorage.toFixed(2)} GB</TableCell>
                            <TableCell className='text-right'>{(f.totalReads / 1000000).toFixed(2)}M</TableCell>
                            <TableCell className='text-right'>{(f.totalWrites / 1000000).toFixed(2)}M</TableCell>
                            <TableCell className='text-right'>{new Date(f.lastActive).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

        <Card>
            <CardHeader>
                <div className='flex justify-between items-center'>
                    <div>
                        <CardTitle>Outlet Breakdown</CardTitle>
                        <CardDescription>Detailed view of outlets for the selected franchise.</CardDescription>
                    </div>
                    <Select value={selectedFranchise} onValueChange={setSelectedFranchise}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select a franchise" />
                        </SelectTrigger>
                        <SelectContent>
                            {topFranchisesBySales.map(f => (
                                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Outlet Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className='text-right'>End Date</TableHead>
                            <TableHead className='text-right'>Storage</TableHead>
                            <TableHead className='text-right'>Total Reads</TableHead>
                            <TableHead className='text-right'>Total Writes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {outletsForSelectedFranchise.map(sub => {
                            const isExpired = new Date(sub.endDate) < new Date();
                            let status = sub.status;
                            if (isExpired && status !== 'suspended') {
                                status = 'expired';
                            }
                            return (
                                <TableRow key={sub.id}>
                                    <TableCell className="font-medium">{sub.outletName}</TableCell>
                                    <TableCell><Badge variant={getStatusVariant(status)}>{status}</Badge></TableCell>
                                    <TableCell className='text-right'>{format(new Date(sub.endDate), 'dd MMM, yyyy')}</TableCell>
                                    <TableCell className='text-right'>{(sub.storageUsedMB / 1024).toFixed(2)} GB</TableCell>
                                    <TableCell className='text-right'>
                                        <div className='flex items-center justify-end gap-1'>
                                            <FileText className="h-4 w-4 text-muted-foreground" /> 
                                            {(sub.totalReads / 1000).toFixed(1)}k
                                        </div>
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        <div className='flex items-center justify-end gap-1'>
                                            <Database className="h-4 w-4 text-muted-foreground" />
                                            {(sub.totalWrites / 1000).toFixed(1)}k
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

    

    


  


    