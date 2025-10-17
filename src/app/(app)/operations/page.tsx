
'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { orders as initialOrders, reservations as initialReservations, deliveryBoys as initialDeliveryBoys } from '@/lib/data';
import type { Order, OrderStatus, OrderType, Reservation, DeliveryBoy } from '@/lib/types';
import { Eye, IndianRupee, XCircle, Phone, Clock, CookingPot, Check, User, Users, Calendar, PlusCircle, Bike } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

type CustomerSummary = {
    phone: string;
    name: string;
    totalOrders: number;
    totalSpent: number;
}

export default function OperationsPage() {
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>(initialOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
    const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>(initialDeliveryBoys);
    
    const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'All'>('All');
    const [orderTypeFilter, setOrderTypeFilter] = useState<OrderType | 'All'>('All');
    
    const [viewOrder, setViewOrder] = useState<Order | null>(null);

    const filteredOrders = orders.filter(order => {
        const statusMatch = orderStatusFilter === 'All' || order.status === orderStatusFilter;
        const typeMatch = orderTypeFilter === 'All' || order.type === orderTypeFilter;
        return statusMatch && typeMatch;
    });
    
    const handleCancelOrder = (orderId: string) => {
        setOrders(orders.map(o => o.id === orderId ? {...o, status: 'Cancelled'} : o));
        toast({ title: 'Order Cancelled', description: `Order #${orders.find(o=>o.id === orderId)?.orderNumber} has been cancelled.` });
    };

    const kots = orders.filter(o => o.status === 'New' || o.status === 'Preparing');

    const customerSummary = orders.reduce((acc, order) => {
        if (order.customerPhone) {
            if (!acc[order.customerPhone]) {
                acc[order.customerPhone] = { phone: order.customerPhone, name: order.customerName || 'Unknown', totalOrders: 0, totalSpent: 0 };
            }
            acc[order.customerPhone].totalOrders += 1;
            acc[order.customerPhone].totalSpent += order.total;
        }
        return acc;
    }, {} as Record<string, CustomerSummary>);

    const customerList = Object.values(customerSummary).sort((a,b) => b.totalSpent - a.totalSpent);
    
    const liveViewOrders = {
        'New': orders.filter(o => o.status === 'New'),
        'Preparing': orders.filter(o => o.status === 'Preparing'),
        'Ready': orders.filter(o => o.status === 'Ready'),
    };

  return (
    <>
    <div className='space-y-4'>
        <h1 className='text-2xl font-bold'>Operations Management</h1>
        <Tabs defaultValue="orders">
            <TabsList className='grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6'>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="kots">KOTs</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="live-view">Live View</TabsTrigger>
                <TabsTrigger value="reservations">Reservations</TabsTrigger>
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
            </TabsList>
            <TabsContent value="orders">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>All Orders</CardTitle>
                            <CardDescription>A log of all orders placed today.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Select value={orderStatusFilter} onValueChange={(val) => setOrderStatusFilter(val as any)}>
                                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter by status..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Statuses</SelectItem>
                                    <SelectItem value="New">New</SelectItem>
                                    <SelectItem value="Preparing">Preparing</SelectItem>
                                    <SelectItem value="Ready">Ready</SelectItem>
                                    <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
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
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className='text-right'>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className='font-bold'>#{order.orderNumber}</TableCell>
                                    <TableCell>
                                        <div>{order.customerName || 'N/A'}</div>
                                        {order.customerPhone && <div className='text-xs text-muted-foreground'>{order.customerPhone}</div>}
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{order.type}</Badge></TableCell>
                                    <TableCell><Badge>{order.status}</Badge></TableCell>
                                    <TableCell className='text-right flex items-center justify-end'>
                                        <IndianRupee className="h-4 w-4 mr-1" />
                                        {order.total.toFixed(2)}
                                    </TableCell>
                                    <TableCell>{format(order.createdAt, 'PPp')}</TableCell>
                                    <TableCell className='text-right'>
                                        <Button variant="ghost" size="icon" onClick={() => setViewOrder(order)}><Eye /></Button>
                                            <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className='text-destructive' disabled={order.status === 'Cancelled' || order.status === 'Completed'}>
                                                    <XCircle />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will cancel order #{order.orderNumber}. This action cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Close</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleCancelOrder(order.id)}>Confirm Cancel</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
                        <CardTitle>Active KOTs</CardTitle>
                        <CardDescription>Kitchen Order Tickets currently being prepared.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {kots.map(kot => (
                                <Card key={kot.id} className="flex flex-col">
                                    <CardHeader className="flex-row items-center justify-between">
                                        <CardTitle className="text-lg">#{kot.orderNumber}</CardTitle>
                                        <Badge>{kot.status}</Badge>
                                    </CardHeader>
                                    <CardContent className="flex-1 space-y-1">
                                        {kot.items.map(item => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span>{item.quantity} x {item.name}</span>
                                            </div>
                                        ))}
                                    </CardContent>
                                    <CardFooter>
                                        <p className="text-xs text-muted-foreground">Sent to kitchen at {format(kot.createdAt, 'p')}</p>
                                    </CardFooter>
                                </Card>
                            ))}
                       </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="customers">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Directory</CardTitle>
                        <CardDescription>Overview of your customer base.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Total Orders</TableHead>
                                    <TableHead className="text-right">Total Spent</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customerList.map(customer => (
                                    <TableRow key={customer.phone}>
                                        <TableCell>
                                            <div className="font-medium">{customer.name}</div>
                                            <div className="text-sm text-muted-foreground">{customer.phone}</div>
                                        </TableCell>
                                        <TableCell>{customer.totalOrders}</TableCell>
                                        <TableCell className="text-right flex items-center justify-end">
                                            <IndianRupee className="h-4 w-4 mr-1" />
                                            {customer.totalSpent.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="live-view">
                <div className="h-[calc(100vh-15rem)] grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(liveViewOrders).map(([status, orders]) => (
                        <Card key={status} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {status === 'New' && <Clock />}
                                    {status === 'Preparing' && <CookingPot />}
                                    {status === 'Ready' && <Check />}
                                    {status} ({orders.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden">
                                <ScrollArea className="h-full">
                                    <div className="space-y-3 pr-4">
                                        {orders.map(order => (
                                            <Card key={order.id} className={cn("p-3", status === 'New' && 'bg-blue-500/10 border-blue-500', status === 'Preparing' && 'bg-orange-500/10 border-orange-500', status === 'Ready' && 'bg-green-500/10 border-green-500')}>
                                                <div className="flex justify-between font-bold">
                                                    <span>#{order.orderNumber}</span>
                                                    <Badge variant="secondary">{order.type}</Badge>
                                                </div>
                                                <div className="text-sm mt-1">
                                                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="reservations">
                 <Card>
                    <CardHeader>
                        <CardTitle>Table Reservations</CardTitle>
                        <CardDescription>Manage upcoming customer reservations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Guests</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reservations.map(res => (
                                    <TableRow key={res.id}>
                                        <TableCell>
                                            <div className="font-medium">{res.name}</div>
                                            <div className="text-sm text-muted-foreground">{res.phone}</div>
                                        </TableCell>
                                        <TableCell className="flex items-center gap-2"><Users className="h-4 w-4"/> {res.guests}</TableCell>
                                        <TableCell>{format(res.time, 'PPp')}</TableCell>
                                        <TableCell><Badge>{res.status}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm">Confirm</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                 </Card>
            </TabsContent>
            <TabsContent value="delivery">
                 <Card>
                    <CardHeader>
                        <CardTitle>Delivery Management</CardTitle>
                        <CardDescription>Track delivery personnel and assigned orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-2">Delivery Personnel</h3>
                                <div className="space-y-4">
                                {deliveryBoys.map(boy => (
                                    <Card key={boy.id}>
                                        <CardHeader className="p-4 flex-row items-center justify-between">
                                            <div>
                                                <p className="font-semibold">{boy.name}</p>
                                                <p className="text-sm text-muted-foreground">{boy.phone}</p>
                                            </div>
                                            <Badge variant={boy.status === 'Available' ? 'default' : 'secondary'}>{boy.status}</Badge>
                                        </CardHeader>
                                        {boy.status === 'On a delivery' && (
                                            <CardFooter className="p-4 pt-0">
                                                <p className="text-xs">Delivering Order: <span className="font-bold">{boy.currentOrder}</span></p>
                                            </CardFooter>
                                        )}
                                    </Card>
                                ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Orders for Delivery</h3>
                                <div className="space-y-3">
                                {orders.filter(o => o.type === 'Delivery' && o.status === 'Ready').map(order => (
                                    <Card key={order.id}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold">#{order.orderNumber}</p>
                                                    <p className="text-sm text-muted-foreground">{order.customerName}</p>
                                                </div>
                                                <Select>
                                                    <SelectTrigger className="w-[150px]">
                                                        <SelectValue placeholder="Assign Rider" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {deliveryBoys.filter(b => b.status === 'Available').map(b => (
                                                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
            </TabsContent>
        </Tabs>
    </div>

     {/* Dialog for viewing an order */}
    <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Order #{viewOrder?.orderNumber}</DialogTitle>
                <DialogDescription>
                    {viewOrder?.customerName} | {viewOrder?.type}
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
                        {viewOrder?.items.map(item => (
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
                        {viewOrder?.total.toFixed(2)}
                    </span>
                </div>
            </div>
             <DialogFooter>
                <Button variant="outline" onClick={() => setViewOrder(null)}>Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
