
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
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
import { orders as initialOrders, tables as initialTables, reservations as initialReservations, deliveryBoys as initialDeliveryBoys } from '@/lib/data';
import type { Order, OrderStatus, OrderType, Table as TableType, DeliveryBoy, Reservation } from '@/lib/types';
import { Calendar as CalendarIcon, CheckCircle, Circle, Clock, CookingPot, Edit, Eye, IndianRupee, Mail, MapPin, Motorcycle, Phone, PlusCircle, Search, Trash2, User, XCircle, Check } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, isSameDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock data for new sections
const initialCustomers = Array.from(new Set(initialOrders.map(o => o.customerName).filter(Boolean))).map((name, i) => ({
    id: `cust-${i+1}`,
    name,
    phone: `98765432${String(i).padStart(2, '0')}`,
    email: `${name?.toLowerCase().split(' ')[0]}@example.com`,
    totalOrders: initialOrders.filter(o => o.customerName === name).length,
    totalSpent: initialOrders.filter(o => o.customerName === name).reduce((sum, o) => sum + o.total, 0),
}));


export default function OperationsPage() {
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [tables, setTables] = useState<TableType[]>(initialTables);
    const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
    const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>(initialDeliveryBoys);
    
    const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'All'>('All');
    const [orderTypeFilter, setOrderTypeFilter] = useState<OrderType | 'All'>('All');
    const [kotStatusFilter, setKotStatusFilter] = useState<OrderStatus | 'All'>('All');
    
    const [viewOrder, setViewOrder] = useState<Order | null>(null);
    const [sheetContent, setSheetContent] = useState<'reservation' | 'deliveryBoy' | null>(null);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [editingDeliveryBoy, setEditingDeliveryBoy] = useState<DeliveryBoy | null>(null);
    const [assigningDeliveryBoy, setAssigningDeliveryBoy] = useState<DeliveryBoy | null>(null);
    const [selectedOrderToAssign, setSelectedOrderToAssign] = useState<string>('');
    const [assigningReservation, setAssigningReservation] = useState<Reservation | null>(null);
    const [selectedTableForReservation, setSelectedTableForReservation] = useState<string>('');
    const [reservationDate, setReservationDate] = useState<Date | undefined>(new Date());


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

    const filteredReservations = reservations.filter(res => 
        reservationDate ? isSameDay(res.time, reservationDate) : true
    ).sort((a,b) => a.time.getTime() - b.time.getTime());

    const deliveryOrdersReady = orders.filter(o => o.type === 'Delivery' && o.status === 'Ready');
    
    const handleCancelOrder = (orderId: string) => {
        setOrders(orders.map(o => o.id === orderId ? {...o, status: 'Cancelled'} : o));
        toast({ title: 'Order Cancelled', description: `Order #${orders.find(o=>o.id === orderId)?.orderNumber} has been cancelled.` });
    };

    const liveViewStats = {
        totalSales: orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + o.total, 0),
        totalOrders: orders.length,
        occupiedTables: tables.filter(t => t.status === 'Occupied').length,
        availableTables: tables.filter(t => t.status === 'Vacant').length,
        runningKots: orders.filter(o => ['New', 'Preparing'].includes(o.status)).length,
        readyKots: orders.filter(o => o.status === 'Ready').length,
    }
    
    const openNewReservationSheet = () => {
        setEditingReservation(null);
        setSheetContent('reservation');
    }
    
    const openEditReservationSheet = (reservation: Reservation) => {
        setEditingReservation(reservation);
        setReservationDate(reservation.time);
        setSheetContent('reservation');
    }
    
    const openNewDeliveryBoySheet = () => {
        setEditingDeliveryBoy(null);
        setSheetContent('deliveryBoy');
    }

    const openEditDeliveryBoySheet = (boy: DeliveryBoy) => {
        setEditingDeliveryBoy(boy);
        setSheetContent('deliveryBoy');
    }

    const handleSaveReservation = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const reservationData = Object.fromEntries(formData.entries()) as Omit<Reservation, 'id' | 'time'> & { time: string, date: string };
        const timeParts = reservationData.time.split(':');
        const newDate = reservationDate ? new Date(reservationDate) : new Date();
        newDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]));

        if (editingReservation) {
            const updatedReservation = { 
                ...editingReservation, 
                name: reservationData.name,
                phone: reservationData.phone,
                guests: Number(reservationData.guests),
                time: newDate
            };
            setReservations(reservations.map(r => r.id === editingReservation.id ? updatedReservation : r));
            toast({ title: "Reservation Updated" });
        } else {
             const newReservation: Reservation = {
                id: `res-${Date.now()}`,
                name: reservationData.name,
                phone: reservationData.phone,
                guests: Number(reservationData.guests),
                time: newDate,
                status: 'Confirmed'
             };
             setReservations([newReservation, ...reservations]);
             toast({ title: "Reservation Created" });
        }
        setSheetContent(null);
    }
    
    const handleDeleteReservation = (id: string) => {
        setReservations(reservations.filter(r => r.id !== id));
        toast({ title: "Reservation Deleted" });
    }

    const handleSaveDeliveryBoy = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const boyData = Object.fromEntries(formData.entries()) as { name: string; phone: string };

        if (editingDeliveryBoy) {
            const updatedBoy = { ...editingDeliveryBoy, ...boyData };
            setDeliveryBoys(deliveryBoys.map(db => db.id === editingDeliveryBoy.id ? updatedBoy : db));
            toast({ title: "Delivery Boy Updated" });
        } else {
            const newBoy: DeliveryBoy = {
                id: `db-${Date.now()}`,
                name: boyData.name,
                phone: boyData.phone,
                status: 'Available',
            };
            setDeliveryBoys([newBoy, ...deliveryBoys]);
            toast({ title: "Delivery Boy Added" });
        }
        setSheetContent(null);
    }
    
    const handleDeleteDeliveryBoy = (id: string) => {
        setDeliveryBoys(deliveryBoys.filter(db => db.id !== id));
        toast({ title: "Delivery Boy Removed" });
    }

    const handleAssignOrder = () => {
        if (!assigningDeliveryBoy || !selectedOrderToAssign) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select an order to assign.' });
            return;
        }

        const order = orders.find(o => o.id === selectedOrderToAssign);
        
        // Update Delivery Boy
        setDeliveryBoys(deliveryBoys.map(db => 
            db.id === assigningDeliveryBoy.id 
                ? { ...db, status: 'On a delivery', currentOrder: `#${order?.orderNumber}` }
                : db
        ));

        // Update Order
        setOrders(orders.map(o => 
            o.id === selectedOrderToAssign 
                ? { ...o, status: 'Out for Delivery' } 
                : o
        ));

        toast({ title: 'Order Assigned', description: `Order #${order?.orderNumber} assigned to ${assigningDeliveryBoy.name}.` });
        
        // Reset
        setAssigningDeliveryBoy(null);
        setSelectedOrderToAssign('');
    }
    
    const handleCompleteDelivery = (deliveryBoyId: string) => {
        const deliveryBoy = deliveryBoys.find(db => db.id === deliveryBoyId);
        if (!deliveryBoy || !deliveryBoy.currentOrder) return;
        
        const orderNumber = deliveryBoy.currentOrder.replace('#','');

        // Update Order to Completed
        setOrders(orders.map(o => 
            o.orderNumber === orderNumber
                ? { ...o, status: 'Completed' }
                : o
        ));

        // Update Delivery Boy to Available
        setDeliveryBoys(deliveryBoys.map(db => 
            db.id === deliveryBoyId
                ? { ...db, status: 'Available', currentOrder: undefined }
                : db
        ));
        
        toast({ title: 'Delivery Completed', description: `Order #${orderNumber} marked as complete.`});
    }

    const handleAssignTableToReservation = () => {
        if (!assigningReservation || !selectedTableForReservation) return;

        setReservations(reservations.map(r => 
            r.id === assigningReservation.id 
                ? { ...r, tableId: selectedTableForReservation, status: 'Arrived' } 
                : r
        ));

        setTables(tables.map(t => 
            t.id === selectedTableForReservation 
                ? { ...t, status: 'Occupied' }
                : t
        ));
        
        toast({
            title: 'Table Assigned',
            description: `Table ${tables.find(t=>t.id === selectedTableForReservation)?.name} assigned to reservation for ${assigningReservation.name}.`
        });

        setAssigningReservation(null);
        setSelectedTableForReservation('');
    };

  return (
    <>
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
                        <TableHead>Total</TableHead>
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
                            <TableCell>₹{order.total.toFixed(2)}</TableCell>
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
                        {initialCustomers.map(customer => (
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
                    <Button onClick={openNewReservationSheet}><PlusCircle className="mr-2 h-4 w-4"/> New Reservation</Button>
                </div>
                 <div className="flex gap-2 pt-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {reservationDate ? format(reservationDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={reservationDate} onSelect={setReservationDate} initialFocus/></PopoverContent>
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
                        {filteredReservations.length > 0 ? filteredReservations.map(res => (
                            <TableRow key={res.id}>
                                <TableCell className='font-bold'>{format(res.time, 'p')}</TableCell>
                                <TableCell>
                                    <div>{res.name}</div>
                                    <div className='text-xs text-muted-foreground'>{res.phone}</div>
                                </TableCell>
                                <TableCell>{res.guests}</TableCell>
                                <TableCell>{res.tableId ? tables.find(t=> t.id === res.tableId)?.name : <Button variant="outline" size="sm" onClick={() => setAssigningReservation(res)}>Assign</Button>}</TableCell>
                                <TableCell><Badge>{res.status}</Badge></TableCell>
                                <TableCell className='text-right'>
                                    <Button variant="ghost" size="icon" onClick={() => openEditReservationSheet(res)}><Edit/></Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                           <Button variant="ghost" size="icon" className='text-destructive'><Trash2/></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Reservation?</AlertDialogTitle>
                                                <AlertDialogDescription>This will permanently delete the reservation for {res.name}.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteReservation(res.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No reservations for this date.
                                </TableCell>
                            </TableRow>
                        )}
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
                    <Button onClick={openNewDeliveryBoySheet}><PlusCircle className="mr-2 h-4 w-4"/> Add Delivery Boy</Button>
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
                                    {db.status === 'Available' ? (
                                        <Button size="sm" onClick={() => setAssigningDeliveryBoy(db)}>Assign Order</Button>
                                    ) : (
                                        <Button size="sm" variant="outline" onClick={() => handleCompleteDelivery(db.id)}>
                                            <Check className="mr-2 h-4 w-4"/>
                                            Complete
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" onClick={() => openEditDeliveryBoySheet(db)}><Edit/></Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="icon" className='text-destructive'><Trash2/></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Remove Delivery Boy?</AlertDialogTitle>
                                                <AlertDialogDescription>Are you sure you want to remove {db.name}?</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteDeliveryBoy(db.id)}>Remove</AlertDialogAction>
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

    </Tabs>

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
                                <TableCell className='text-right'>₹{item.totalPrice.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 <div className='mt-4 pt-4 border-t font-bold flex justify-between'>
                    <span>Total</span>
                    <span>₹{viewOrder?.total.toFixed(2)}</span>
                </div>
            </div>
        </DialogContent>
    </Dialog>
    
    {/* Dialog for assigning a delivery boy */}
    <Dialog open={!!assigningDeliveryBoy} onOpenChange={() => setAssigningDeliveryBoy(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Assign Order to {assigningDeliveryBoy?.name}</DialogTitle>
                <DialogDescription>Select a "Ready" delivery order to assign.</DialogDescription>
            </DialogHeader>
            <div className='py-4 space-y-4'>
                <Label htmlFor="order-to-assign">Select Order</Label>
                <Select value={selectedOrderToAssign} onValueChange={setSelectedOrderToAssign}>
                    <SelectTrigger id="order-to-assign">
                        <SelectValue placeholder="Select a ready order..." />
                    </SelectTrigger>
                    <SelectContent>
                        {deliveryOrdersReady.length > 0 ? (
                             deliveryOrdersReady.map(o => (
                                <SelectItem key={o.id} value={o.id}>
                                    #{o.orderNumber} - {o.customerName} (₹{o.total.toFixed(2)})
                                </SelectItem>
                             ))
                        ) : (
                            <div className='p-4 text-sm text-muted-foreground'>No delivery orders are ready.</div>
                        )}
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setAssigningDeliveryBoy(null)}>Cancel</Button>
                <Button onClick={handleAssignOrder} disabled={!selectedOrderToAssign}>Confirm Assignment</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    
    {/* Dialog for assigning a table to a reservation */}
    <Dialog open={!!assigningReservation} onOpenChange={() => setAssigningReservation(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Assign Table for {assigningReservation?.name}</DialogTitle>
                <DialogDescription>Select a vacant table for this reservation.</DialogDescription>
            </DialogHeader>
            <div className='py-4 space-y-4'>
                <Label htmlFor="table-for-reservation">Select Table</Label>
                <Select value={selectedTableForReservation} onValueChange={setSelectedTableForReservation}>
                    <SelectTrigger id="table-for-reservation">
                        <SelectValue placeholder="Select a vacant table..." />
                    </SelectTrigger>
                    <SelectContent>
                        {tables.filter(t => t.status === 'Vacant').length > 0 ? (
                             tables.filter(t => t.status === 'Vacant').map(t => (
                                <SelectItem key={t.id} value={t.id}>
                                    {t.name} (Capacity: {t.capacity})
                                </SelectItem>
                             ))
                        ) : (
                            <div className='p-4 text-sm text-muted-foreground'>No vacant tables available.</div>
                        )}
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setAssigningReservation(null)}>Cancel</Button>
                <Button onClick={handleAssignTableToReservation} disabled={!selectedTableForReservation}>Confirm Assignment</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    {/* Sheet for adding/editing a reservation or delivery boy */}
    <Sheet open={!!sheetContent} onOpenChange={() => setSheetContent(null)}>
        <SheetContent>
            {sheetContent === 'reservation' && (
                <>
                <SheetHeader>
                    <SheetTitle>{editingReservation ? 'Edit' : 'New'} Reservation</SheetTitle>
                    <SheetDescription>
                        {editingReservation ? 'Update the details for this booking.' : 'Create a new table reservation.'}
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSaveReservation}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" name="name" defaultValue={editingReservation?.name} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">Phone</Label>
                            <Input id="phone" name="phone" defaultValue={editingReservation?.phone} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="guests" className="text-right">Guests</Label>
                            <Input id="guests" name="guests" type="number" defaultValue={editingReservation?.guests} className="col-span-3" required />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn("col-span-3 justify-start text-left font-normal", !reservationDate && "text-muted-foreground")}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {reservationDate ? format(reservationDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={reservationDate}
                                    onSelect={setReservationDate}
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="time" className="text-right">Time</Label>
                            <Input id="time" name="time" type="time" defaultValue={editingReservation ? format(editingReservation.time, 'HH:mm') : ''} className="col-span-3" required />
                        </div>
                    </div>
                    <SheetFooter>
                        <Button type="submit">Save Reservation</Button>
                    </SheetFooter>
                </form>
                </>
            )}
             {sheetContent === 'deliveryBoy' && (
                <>
                <SheetHeader>
                    <SheetTitle>{editingDeliveryBoy ? 'Edit' : 'Add'} Delivery Boy</SheetTitle>
                    <SheetDescription>
                        {editingDeliveryBoy ? 'Update details for this delivery person.' : 'Add a new delivery person.'}
                    </SheetDescription>
                </SheetHeader>
                 <form onSubmit={handleSaveDeliveryBoy}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" name="name" defaultValue={editingDeliveryBoy?.name} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">Phone</Label>
                            <Input id="phone" name="phone" defaultValue={editingDeliveryBoy?.phone} className="col-span-3" required />
                        </div>
                    </div>
                    <SheetFooter>
                        <Button type="submit">Save Delivery Boy</Button>
                    </SheetFooter>
                </form>
                </>
            )}
        </SheetContent>
    </Sheet>
    </>
  );
}

    
