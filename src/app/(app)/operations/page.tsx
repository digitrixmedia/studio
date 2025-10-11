
'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
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
import { orders as initialOrders } from '@/lib/data';
import type { Order, OrderStatus, OrderType } from '@/lib/types';
import { Eye, IndianRupee, XCircle } from 'lucide-react';
import { useState } from 'react';
import { format, isToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';


export default function OperationsPage() {
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>(initialOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    
    const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'All'>('All');
    const [orderTypeFilter, setOrderTypeFilter] = useState<OrderType | 'All'>('All');
    
    const [viewOrder, setViewOrder] = useState<Order | null>(null);


    const filteredOrders = orders.filter(order => {
        const isFromToday = isToday(order.createdAt);
        const statusMatch = orderStatusFilter === 'All' || order.status === orderStatusFilter;
        const typeMatch = orderTypeFilter === 'All' || order.type === orderTypeFilter;
        return isFromToday && statusMatch && typeMatch;
    });
    
    const handleCancelOrder = (orderId: string) => {
        setOrders(orders.map(o => o.id === orderId ? {...o, status: 'Cancelled'} : o));
        toast({ title: 'Order Cancelled', description: `Order #${orders.find(o=>o.id === orderId)?.orderNumber} has been cancelled.` });
    };

  return (
    <>
    <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
            <div>
                <CardTitle>Recent Orders</CardTitle>
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
                        <TableCell>{format(order.createdAt, 'p')}</TableCell>
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
