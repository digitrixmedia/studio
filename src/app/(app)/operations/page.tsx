
'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { orders, tables } from '@/lib/data';
import type { Order, OrderStatus, OrderType, Table as TableType } from '@/lib/types';
import { Calendar as CalendarIcon, CheckCircle, Circle, Clock, CookingPot, Edit, Eye, IndianRupee, Mail, MapPin, Motorcycle, Phone, PlusCircle, Search, Trash2, User, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// Mock data for new sections
const customers = Array.from(new Set(orders.map(o => o.customerName).filter(Boolean))).map((name, i) => ({
    id: `cust-${i+1}`,
    name,
    phone: `98765432${String(i).padStart(2, '0')}`,
    email: `${name?.toLowerCase().split(' ')[0]}@example.com`,
    totalOrders: orders.filter(o => o.customerName === name).length,
    totalSpent: orders.filter(o => o.customerName === name).reduce((sum, o) => sum + o.total, 0),
}));

const reservations = [
    { id: 'res-1', name: 'Ankit Sharma', phone: '9988776655', guests: 4, time: new Date(new Date().setHours(20,0,0)), status: 'Confirmed' },
    { id: 'res-2', name: 'Riya Gupta', phone: '9123456789', guests: 2, time: new Date(new Date().setHours(19,30,0)), status: 'Pending' },
    { id: 'res-3', name: 'Vikram Singh', phone: '9876543210', guests: 6, time: new Date(new Date().setHours(21,0,0)), status: 'Arrived' },
];

const deliveryBoys = [
    { id: 'db-1', name: 'Ravi Kumar', phone: '8877665544', status: 'Available' },
    { id: 'db-2', name: 'Suresh Patel', phone: '8123456789', status: 'On a delivery', currentOrder: '#1045' },
    { id: 'db-3', name: 'Manoj Verma', phone: '8888888888', status: 'Available' },
]

export default function OperationsPage() {
    const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'All'>('All');
    const [orderTypeFilter, setOrderTypeFilter] = useState<OrderType | 'All'>('All');
    const [kotStatusFilter, setKotStatusFilter] = useState<OrderStatus | 'All'>('All');

    const filteredOrders = orders.filter(order => {
        const statusMatch = orderStatusFilter === 'All' || order.status === orderStatusFilter;
        const typeMatch = orderTypeFilter === 'All' || order.type === orderTypeFilter;
        return statusMatch && typeMatch;
    });
    
    const filteredKots = orders.filter(order => {
        const isKitchenOrder = ['New', 'Preparing', 'Ready'].includes(order.status);
        const statusMatch = kotStatusFilter === 'All' || order.status === kotStatusFilter;
        return isKitchenOrder && statusMatch;
    });

    const liveViewStats = {
        totalSales: orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + o.total, 0),
        totalOrders: orders.length,
        occupiedTables: tables.filter(t => t.status === 'Occupied').length,
        availableTables: tables.filter(t => t.status === 'Vacant').length,
        runningKots: orders.filter(o => ['New', 'Preparing'].includes(o.status)).length,
        readyKots: orders.filter(o => o.status === 'Ready').length,
    }

  return (
    <Tabs defaultValue="orders" className="h-full">
      <CardHeader>
        <CardTitle>Operations Management</CardTitle>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mt-4">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="kots">KOTs</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="live-view">Live View</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
          <TabsTrigger value="delivery-boys">Delivery</TabsTrigger>
        </TabsList>
      </CardHeader>

      <TabsContent value="orders">
        <Card>
          <CardHeader>
             <div className="flex justify-between items-center">
                <CardTitle>All Orders</CardTitle>
                <div className="flex gap-2">
                    <Select value={orderStatusFilter} onValueChange={(val) => setOrderStatusFilter(val as any)}>
                        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter by status..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Statuses</SelectItem>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Preparing">Preparing</SelectItem>
                            <SelectItem value="Ready">Ready</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={orderTypeFilter} onValueChange={(val) => setOrderTypeFilter(val as any)}>
                        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter by type..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Types</SelectItem>
                            <SelectItem value="Dine-In">Dine-In</SelectItem>
                            <SelectItem value="Takeaway">Takeaway</SelectItem>
                            <SelectItem value="Delivery">Delivery</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredOrders.map(order => (
                        <TableRow key={order.id}>
                            <TableCell className='font-bold'>#{order.orderNumber}</TableCell>
                            <TableCell>{order.customerName || 'N/A'}</TableCell>
                            <TableCell><Badge variant="outline">{order.type}</Badge></TableCell>
                            <TableCell><Badge>{order.status}</Badge></TableCell>
                            <TableCell>₹{order.total.toFixed(2)}</TableCell>
                            <TableCell>{format(order.createdAt, 'PPp')}</TableCell>
                            <TableCell className='text-right'>
                                <Button variant="ghost" size="icon"><Eye /></Button>
                                <Button variant="ghost" size="icon" className='text-destructive'><XCircle /></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="kots">
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Kitchen Order Tickets</CardTitle>
                    <Select value={kotStatusFilter} onValueChange={(val) => setKotStatusFilter(val as any)}>
                        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter by status..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Preparing">Preparing</SelectItem>
                            <SelectItem value="Ready">Ready</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>KOT #</TableHead>
                            <TableHead>Order For</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredKots.map(order => (
                            <TableRow key={order.id}>
                                <TableCell className='font-bold'>#{order.orderNumber}</TableCell>
                                <TableCell>{order.type === 'Dine-In' ? tables.find(t=>t.id === order.tableId)?.name : order.type}</TableCell>
                                <TableCell>{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</TableCell>
                                <TableCell><Badge>{order.status}</Badge></TableCell>
                                <TableCell>{format(order.createdAt, 'p')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="customers">
        <Card>
            <CardHeader>
                 <div className="flex justify-between items-center">
                    <CardTitle>Customers</CardTitle>
                    <div className="relative w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search customers..." className="pl-10"/>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Total Orders</TableHead>
                            <TableHead className='text-right'>Total Spent</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.map(customer => (
                             <TableRow key={customer.id}>
                                <TableCell className='font-medium'>{customer.name}</TableCell>
                                <TableCell>
                                    <div><Phone className="inline mr-2 h-3 w-3"/>{customer.phone}</div>
                                    <div><Mail className="inline mr-2 h-3 w-3"/>{customer.email}</div>
                                </TableCell>
                                <TableCell>{customer.totalOrders}</TableCell>
                                <TableCell className='text-right'>₹{customer.totalSpent.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="live-view">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{liveViewStats.totalSales.toLocaleString('en-IN')}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{liveViewStats.totalOrders}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Occupied Tables</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{liveViewStats.occupiedTables} / {tables.length}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Running KOTs</CardTitle>
                    <CookingPot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{liveViewStats.runningKots}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ready KOTs</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{liveViewStats.readyKots}</div>
                </CardContent>
            </Card>
        </div>
      </TabsContent>

      <TabsContent value="reservations">
         <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Table Reservations</CardTitle>
                    <Button><PlusCircle className="mr-2 h-4 w-4"/> New Reservation</Button>
                </div>
                 <div className="flex gap-2 pt-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(new Date(), 'LLL dd, y')}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" /></PopoverContent>
                    </Popover>
                 </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Guest</TableHead>
                            <TableHead>Guests</TableHead>
                            <TableHead>Table</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className='text-right'>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reservations.map(res => (
                            <TableRow key={res.id}>
                                <TableCell className='font-bold'>{format(res.time, 'p')}</TableCell>
                                <TableCell>
                                    <div>{res.name}</div>
                                    <div className='text-xs text-muted-foreground'>{res.phone}</div>
                                </TableCell>
                                <TableCell>{res.guests}</TableCell>
                                <TableCell><Button variant="outline" size="sm">Assign</Button></TableCell>
                                <TableCell><Badge>{res.status}</Badge></TableCell>
                                <TableCell className='text-right'>
                                    <Button variant="ghost" size="icon"><Edit/></Button>
                                    <Button variant="ghost" size="icon" className='text-destructive'><Trash2/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
         </Card>
      </TabsContent>
      
       <TabsContent value="delivery-boys">
         <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Delivery Personnel</CardTitle>
                    <Button><PlusCircle className="mr-2 h-4 w-4"/> Add Delivery Boy</Button>
                </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Current Order</TableHead>
                             <TableHead className='text-right'>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deliveryBoys.map(db => (
                            <TableRow key={db.id}>
                                <TableCell className='font-medium'>{db.name}</TableCell>
                                <TableCell>{db.phone}</TableCell>
                                <TableCell>
                                    <Badge variant={db.status === 'Available' ? 'default' : 'secondary'}>
                                       {db.status === 'Available' ? <Circle className="mr-2 h-2 w-2 fill-green-500 text-green-500"/> : <Clock className="mr-2 h-3 w-3"/>}
                                        {db.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{db.currentOrder || 'N/A'}</TableCell>
                                <TableCell className='text-right'>
                                    <Button variant="ghost" size="icon"><Edit/></Button>
                                    <Button variant="ghost" size="icon" className='text-destructive'><Trash2/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </CardContent>
         </Card>
      </TabsContent>

    </Tabs>
  );
}
