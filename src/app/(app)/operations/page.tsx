
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Order, OrderStatus, OrderType, Reservation, DeliveryBoy, ReservationStatus, Table as TableType, AppOrder, OrderItem, Customer, OnlineOrderSource } from '@/lib/types';
import { Eye, IndianRupee, XCircle, Phone, Clock, CookingPot, Check, User, Users, Calendar as CalendarIcon, PlusCircle, Bike, Trash2, Search, KeyRound, Star, Award, History, Edit, Home, Cake, Gift, MessageSquare, CheckCircle, Wifi, Ban, ArrowRight } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { format, setHours, setMinutes, isWithinInterval, startOfDay, endOfDay, formatDistanceToNow, differenceInDays, getYear, setYear } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { DateRange } from 'react-day-picker';
import { Textarea } from '@/components/ui/textarea';
import { ZappyyIcon } from '@/components/icons';

const initialReservationState = {
    name: '',
    phone: '',
    guests: '2',
    date: new Date(),
    hour: '20',
    minute: '00',
};

const initialDeliveryBoyState = {
    name: '',
    phone: '',
};

export default function OperationsPage() {
    const { 
        pastOrders: orders, 
        setPastOrders: setOrders,
        tables,
        setTables,
        startOrderForTable,
        loadOrder,
        customers,
        loadOnlineOrderIntoPOS,
        menuItems,
        selectedOutlet,
        currentUser
    } = useAppContext();    
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
    
    const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [orderTypeFilter, setOrderTypeFilter] = useState<OrderType | 'all'>('all');
    const [orderSearchQuery, setOrderSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });
    
    const [viewOrder, setViewOrder] = useState<Order | null>(null);
    const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
    const [isReservationOpen, setIsReservationOpen] = useState(false);
    const [newReservation, setNewReservation] = useState(initialReservationState);

    const [isDeliveryBoyOpen, setIsDeliveryBoyOpen] = useState(false);
    const [newDeliveryBoy, setNewDeliveryBoy] = useState(initialDeliveryBoyState);

    const [seatingReservation, setSeatingReservation] = useState<Reservation | null>(null);
    
    const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
    const [password, setPassword] = useState('');
    
    const [isEditingCustomer, setIsEditingCustomer] = useState(false);
    const [customerFormData, setCustomerFormData] = useState<Partial<Customer>>({});

    const defaultTab = searchParams.get('tab') || 'orders';

    const handleSimulateOnlineOrder = useCallback((source: OnlineOrderSource) => {
        const randomItemsCount = Math.floor(Math.random() * 3) + 1;
        const orderItems: OrderItem[] = Array.from({ length: randomItemsCount }, (_, i) => {
            const item = menuItems[Math.floor(Math.random() * menuItems.length)];
            const quantity = 1;
            return {
                id: `${item.id}-${i}`,
                menuItemId: item.id,
                name: item.name,
                quantity,
                price: item.price,
                totalPrice: item.price * quantity,
            };
        });

        const subTotal = orderItems.reduce((acc, item) => acc + item.totalPrice, 0);
        const tax = subTotal * 0.05;
        const total = subTotal + tax;
        
        const newOnlineOrder: Order = {
            outletId: selectedOutlet?.id || currentUser?.outletId || "",
            id: `online-${source}-${Date.now()}`,
            orderNumber: `Z-${Math.floor(Math.random() * 9000) + 1000}`,
            type: 'delivery',
            items: orderItems,
            subTotal,
            tax,
            discount: 0,
            total,
            status: 'incoming',
            createdAt: new Date(),
            createdBy: 'system',
            customerName: 'Online Customer',
            customerPhone: '9999988888',
            onlineOrderSource: source,
        };

        setOrders(prev => [newOnlineOrder, ...prev]);
        toast({
            title: `New Online Order from ${source.charAt(0).toUpperCase() + source.slice(1)}!`,
            description: `A new order has arrived. Please review and accept.`,
            action: (
                <Button variant="outline" size="sm" onClick={() => router.push('/operations?tab=online-orders')}>
                    View <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            ),
        });
    }, [menuItems, router, setOrders, toast]);

    
    
    useEffect(() => {
        if (viewCustomer) {
            setCustomerFormData({
                name: viewCustomer.name,
                phone: viewCustomer.phone,
                address: viewCustomer.address || '',
                birthday: viewCustomer.birthday || '',
                anniversary: viewCustomer.anniversary || '',
                notes: viewCustomer.notes || '',
            });
        }
    }, [viewCustomer]);


    const filteredOrders = orders.filter(order => {
        const statusMatch = orderStatusFilter === 'all' || order.status === orderStatusFilter;
        const typeMatch = orderTypeFilter === 'all' || order.type === orderTypeFilter;
        const searchMatch = orderSearchQuery === '' ||
            order.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
            (order.customerName && order.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase())) ||
            (order.customerPhone && order.customerPhone.includes(orderSearchQuery));
        
        const dateMatch = !dateFilter?.from || isWithinInterval(order.createdAt, {
            start: startOfDay(dateFilter.from),
            end: dateFilter.to ? endOfDay(dateFilter.to) : endOfDay(dateFilter.from)
        });

        return statusMatch && typeMatch && searchMatch && dateMatch;
    });
    
    const handleCancelOrder = (orderId: string) => {
        // In a real app, you would verify the password against the current user's credentials
        if (password !== 'password') { // Using "password" as a dummy password for demo
            toast({
                variant: 'destructive',
                title: 'Incorrect Password',
                description: 'The password you entered is incorrect. Order not cancelled.',
            });
            setPassword('');
            return;
        }

        setOrders(orders.map(o => o.id === orderId ? {...o, status: 'cancelled'} : o));
        toast({ title: 'Order Cancelled', description: `Order #${orders.find(o=>o.id === orderId)?.orderNumber} has been cancelled.` });
        setOrderToCancel(null);
        setPassword('');
    };

    const handleCreateReservation = () => {
        if (!newReservation.name || !newReservation.phone) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Name and phone are required.'});
            return;
        }

        const reservationTime = setMinutes(setHours(newReservation.date, parseInt(newReservation.hour)), parseInt(newReservation.minute));

        const reservation: Reservation = {
            id: `res-${Date.now()}`,
            name: newReservation.name,
            phone: newReservation.phone,
            guests: parseInt(newReservation.guests),
            time: reservationTime,
            status: 'confirmed'
        };

        setReservations(prev => [reservation, ...prev]);
        toast({ title: 'Reservation Created', description: `Table reserved for ${newReservation.name}.` });
        setIsReservationOpen(false);
        setNewReservation(initialReservationState);
    }
    
    const handleCreateDeliveryBoy = () => {
        if (!newDeliveryBoy.name || !newDeliveryBoy.phone) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Name and phone are required.'});
            return;
        }
        
        const deliveryBoy: DeliveryBoy = {
            id: `db-${Date.now()}`,
            name: newDeliveryBoy.name,
            phone: newDeliveryBoy.phone,
            status: 'available',
        };

        setDeliveryBoys(prev => [deliveryBoy, ...prev]);
        toast({ title: 'Delivery Boy Added', description: `${newDeliveryBoy.name} is now available.` });
        setIsDeliveryBoyOpen(false);
        setNewDeliveryBoy(initialDeliveryBoyState);
    }

    const handleRemoveDeliveryBoy = (id: string) => {
        const boyToRemove = deliveryBoys.find(b => b.id === id);
        setDeliveryBoys(prev => prev.filter(b => b.id !== id));
        toast({
            title: 'Delivery Boy Removed',
            description: `${boyToRemove?.name} has been removed from the list.`,
            variant: "destructive"
        });
    }

    const handleAssignRider = (orderId: string, deliveryBoyId: string) => {
        const deliveryBoy = deliveryBoys.find(b => b.id === deliveryBoyId);
        const order = orders.find(o => o.id === orderId);

        if (!deliveryBoy || !order) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not assign rider.'});
            return;
        }

        // Update delivery boy status
        setDeliveryBoys(prev => prev.map(b => b.id === deliveryBoyId ? { ...b, status: 'on-a-delivery', currentOrder: `#${order.orderNumber}` } : b));
        
        // Update order status
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'out-for-delivery' } : o));

        toast({ title: 'Rider Assigned', description: `${deliveryBoy.name} has been assigned to order #${order.orderNumber}.` });
    }
    
     const handleMarkAsDelivered = (deliveryBoyId: string) => {
        const deliveryBoy = deliveryBoys.find(b => b.id === deliveryBoyId);
        if (!deliveryBoy || !deliveryBoy.currentOrder) return;
        
        const orderNumber = deliveryBoy.currentOrder.replace('#', '');
        const order = orders.find(o => o.orderNumber === orderNumber);

        if (order) {
            // Update order status
            setOrders(prev => prev.map(o => o.orderNumber === orderNumber ? { ...o, status: 'completed' } : o));
            toast({ title: "Order Completed", description: `Order #${orderNumber} has been marked as delivered.` });
        }

        // Update delivery boy status
        setDeliveryBoys(prev => prev.map(b => b.id === deliveryBoyId ? { ...b, status: 'available', currentOrder: undefined } : b));
    };

    const kots = orders.filter(o => o.status === 'new' || o.status === 'preparing');
    
    const liveViewOrders = {
        'new': orders.filter(o => o.status === 'new'),
        'preparing': orders.filter(o => o.status === 'preparing'),
        'ready': orders.filter(o => o.status === 'ready'),
    };
    
    const handleUpdateReservationStatus = (reservationId: string, newStatus: ReservationStatus) => {
        setReservations(prev => prev.map(res => res.id === reservationId ? { ...res, status: newStatus } : res));
        const reservationName = reservations.find(r => r.id === reservationId)?.name;
        toast({
            title: "Reservation Updated",
            description: `Reservation for ${reservationName} has been marked as ${newStatus}.`
        });
    };

    const handleSeatReservation = (tableId: string) => {
        if (!seatingReservation) return;

        // 1. Update table status to 'Occupied'
        setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'occupied' } : t));

        // 2. Update reservation status to 'Arrived'
        handleUpdateReservationStatus(seatingReservation.id, 'arrived');
        
        // 3. Create a new order for this table
        startOrderForTable(tableId);

        // 4. Update reservation with tableId
        setReservations(prev => prev.map(r => r.id === seatingReservation.id ? {...r, tableId} : r));

        toast({
            title: "Guests Seated",
            description: `${seatingReservation.name} has been seated at ${tables.find(t=>t.id === tableId)?.name}. Navigating to POS.`,
        });

        // 5. Close dialog and navigate
        setSeatingReservation(null);
        router.push('/orders');
    };

    const getReservationAction = (reservation: Reservation) => {
        switch (reservation.status) {
            case 'pending':
                return <Button variant="outline" size="sm" onClick={() => handleUpdateReservationStatus(reservation.id, 'confirmed')}>Confirm</Button>;
            case 'confirmed':
                return <Button variant="outline" size="sm" onClick={() => setSeatingReservation(reservation)}>Mark as Arrived</Button>;
            case 'arrived':
                 return <Button variant="outline" size="sm" disabled>Seated</Button>;
            default:
                return null;
        }
    };
    
    const handleReorder = (order: Order) => {
        loadOrder(order);
        router.push('/orders');
    };
    
    const getTierBadgeVariant = (tier: 'New' | 'Regular' | 'VIP'): 'secondary' | 'default' | 'destructive' => {
        if (tier === 'VIP') return 'destructive';
        if (tier === 'Regular') return 'default';
        return 'secondary';
    }

    const handleSaveCustomer = () => {
        if (!viewCustomer) return;
        // Here you would save the data to your backend
        console.log("Saving customer:", customerFormData);

        // For demo purposes, we update the viewCustomer state to reflect changes
        setViewCustomer(prev => prev ? { ...prev, ...customerFormData } as Customer : null);
        
        toast({
            title: "Customer Updated",
            description: `${customerFormData.name}'s details have been saved.`
        });
        setIsEditingCustomer(false);
    }

    const isDateUpcoming = (dateString: string | undefined): boolean => {
        if (!dateString) return false;
        
        const today = new Date();
        const eventDate = new Date(dateString);
        
        // Set the event's year to the current year to check for upcoming anniversary/birthday
        const thisYearsEvent = setYear(eventDate, getYear(today));
        
        const diff = differenceInDays(thisYearsEvent, today);
        
        // Check if the event is within the next 30 days but not in the past
        return diff >= 0 && diff <= 30;
    };
    
    const handleOnlineOrderAction = (orderId: string, action: 'accept' | 'reject') => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        if (action === 'accept') {
            loadOnlineOrderIntoPOS(order);
            setOrders(prev => prev.filter(o => o.id !== orderId)); // Remove from operations view
            toast({
                title: "Order Accepted",
                description: `Order #${order.orderNumber} has been loaded into the POS.`,
            });
            router.push('/orders');
        } else { // Reject
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'rejected' } : o));
            toast({
                title: "Order Rejected",
                description: `The online order has been rejected.`,
            });
        }
    };
    
    const onlineOrders = orders.filter(o => o.status === 'incoming' || o.status === 'rejected');


  return (
    <>
    <div className='space-y-4'>
        <h1 className='text-2xl font-bold'>Operations Management</h1>
        <Tabs defaultValue={defaultTab} onValueChange={(value) => router.push(`/operations?tab=${value}`)}>
            <TabsList className='grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-7'>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="online-orders" className='relative'>
                    Online Orders
                    {onlineOrders.filter(o => o.status === 'incoming').length > 0 && (
                        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs">
                           {onlineOrders.filter(o => o.status === 'incoming').length}
                        </span>
                    )}
                </TabsTrigger>
                <TabsTrigger value="kots">KOTs</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="live-view">Live View</TabsTrigger>
                <TabsTrigger value="reservations">Reservations</TabsTrigger>
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
            </TabsList>
            <TabsContent value="orders">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>All Orders</CardTitle>
                            <CardDescription>A log of all orders placed today.</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                             <div className="relative w-full sm:w-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                placeholder="Search by Order #, Name, Phone..." 
                                className="pl-10 w-full sm:w-64"
                                value={orderSearchQuery}
                                onChange={(e) => setOrderSearchQuery(e.target.value)}
                                />
                            </div>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                    "w-full sm:w-[280px] justify-start text-left font-normal",
                                    !dateFilter && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateFilter?.from ? (
                                    dateFilter.to ? (
                                        <>
                                        {format(dateFilter.from, "LLL dd, y")} -{" "}
                                        {format(dateFilter.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateFilter.from, "LLL dd, y")
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
                                    defaultMonth={dateFilter?.from}
                                    selected={dateFilter}
                                    onSelect={setDateFilter}
                                    numberOfMonths={2}
                                />
                                </PopoverContent>
                            </Popover>
                            <Select value={orderStatusFilter} onValueChange={(val) => setOrderStatusFilter(val as any)}>
                                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Filter by status..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="preparing">Preparing</SelectItem>
                                    <SelectItem value="ready">Ready</SelectItem>
                                    <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={orderTypeFilter} onValueChange={(val) => setOrderTypeFilter(val as any)}>
                                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Filter by type..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="dine-in">Dine-In</SelectItem>
                                    <SelectItem value="takeaway">Takeaway</SelectItem>
                                    <SelectItem value="delivery">Delivery</SelectItem>
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
                                    <TableCell className='font-bold'>{order.orderNumber}</TableCell>
                                    <TableCell>
                                        <div>{order.customerName || 'N/A'}</div>
                                        {order.customerPhone && <div className='text-xs text-muted-foreground'>{order.customerPhone}</div>}
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{order.type}</Badge></TableCell>
                                    <TableCell><Badge>{order.status}</Badge></TableCell>
                                    <TableCell className='text-right flex items-center justify-end'>
                                        <IndianRupee className="h-4 w-4 mr-1" />
                                        {Number(order.total || 0).toFixed(2)}
                                    </TableCell>
                                    <TableCell>{order.createdAt ? format(new Date(order.createdAt), 'PPp') : '—'
                                    }</TableCell>
                                    <TableCell className='text-right'>
                                        <Button variant="ghost" size="icon" onClick={() => setViewOrder(order)}><Eye /></Button>
                                         <Button variant="ghost" size="icon" onClick={() => handleReorder(order)}><PlusCircle /></Button>
                                            <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className='text-destructive' disabled={order.status === 'cancelled'}>
                                                    <XCircle />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will cancel order {order.orderNumber}. This action cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Close</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => setOrderToCancel(order)}>Confirm Cancel</AlertDialogAction>
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
            <TabsContent value="online-orders">
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Online Aggregator Orders</CardTitle>
                                <CardDescription>Accept or reject new orders. New orders will appear here automatically.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {onlineOrders.map(order => (
                                <Card key={order.id} className={cn("flex flex-col", order.status === 'rejected' && 'bg-destructive/10 border-destructive/50')}>
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-center">
                                            <span>{order.orderNumber}</span>
                                            {order.onlineOrderSource === 'zomato' && <ZappyyIcon className="h-6 w-6 text-red-500" />}
                                            {order.onlineOrderSource === 'swiggy' && <ZappyyIcon className="h-6 w-6 text-orange-500" />}
                                        </CardTitle>
                                        <CardDescription>{formatDistanceToNow(order.createdAt, { addSuffix: true })}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 space-y-1 text-sm">
                                        {order.items.map((item, index) => (
                                            <div key={`${item.id}-${index}`} className="flex justify-between">
                                                <span>{item.quantity} x {item.name}</span>
                                                <span className="flex items-center"><IndianRupee className="h-3.5 w-3.5 mr-1" />{(Number(item.totalPrice) || 0).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </CardContent>
                                    <CardFooter className="flex gap-2">
                                        {order.status === 'incoming' && (
                                            <>
                                                <Button className="w-full" size="sm" onClick={() => handleOnlineOrderAction(order.id, 'accept')}>
                                                    <CheckCircle className="mr-2" /> Accept
                                                </Button>
                                                <Button className="w-full" size="sm" variant="destructive" onClick={() => handleOnlineOrderAction(order.id, 'reject')}>
                                                    <Ban className="mr-2" /> Reject
                                                </Button>
                                            </>
                                        )}
                                        {order.status === 'rejected' && (
                                            <p className="text-destructive font-semibold text-sm">Order Rejected</p>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
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
                                        {kot.items.map((item, index) => (
                                            <div key={`${item.id}-${index}`} className="flex justify-between text-sm">
                                                <span>{item.quantity} x {item.name}</span>
                                            </div>
                                        ))}
                                    </CardContent>
                                    <CardFooter>
                                        <p className="text-xs text-muted-foreground">Sent to kitchen at {format(new Date(kot.createdAt), 'p')}</p>
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
                        <CardDescription>Overview of your customer base. Click on a row to view details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Tier</TableHead>
                                    <TableHead className='text-right'>Total Orders</TableHead>
                                    <TableHead className="text-right">Total Spent</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.map(customer => (
                                    <TableRow key={customer.phone} onClick={() => setViewCustomer(customer)} className="cursor-pointer">
                                        <TableCell>
                                            <div className="font-medium">{customer.name}</div>
                                            <div className="text-sm text-muted-foreground">{customer.phone}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getTierBadgeVariant(customer.tier)}>{customer.tier}</Badge>
                                        </TableCell>
                                        <TableCell className='text-right'>{customer.totalOrders}</TableCell>
                                        <TableCell className="text-right flex items-center justify-end">
                                            <IndianRupee className="h-4 w-4 mr-1" />
                                            {(Number(customer.totalSpent) || 0).toFixed(2)}
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
                                <CardTitle className="flex items-center gap-2 capitalize">
                                    {status === 'new' && <Clock />}
                                    {status === 'preparing' && <CookingPot />}
                                    {status === 'ready' && <Check />}
                                    {status} ({orders.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden">
                                <ScrollArea className="h-full">
                                    <div className="space-y-3 pr-4">
                                        {orders.map(order => (
                                            <Card key={order.id} className={cn("p-3", status === 'new' && 'bg-blue-500/10 border-blue-500', status === 'preparing' && 'bg-orange-500/10 border-orange-500', status === 'ready' && 'bg-green-500/10 border-green-500')}>
                                                <div className="flex justify-between font-bold">
                                                    <span>{order.orderNumber}</span>
                                                    <Badge variant="secondary">{order.type}</Badge>
                                                </div>
                                                <div className="text-sm mt-1">
                                                    {order.items.map((i, index) => `${i.quantity}x ${i.name}`).join(', ')}
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
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Table Reservations</CardTitle>
                            <CardDescription>Manage upcoming customer reservations.</CardDescription>
                        </div>
                        <Button onClick={() => setIsReservationOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> New Reservation
                        </Button>
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
                                            {getReservationAction(res)}
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
                                <div className='flex justify-between items-center mb-2'>
                                    <h3 className="font-semibold">Delivery Personnel</h3>
                                    <Button size="sm" variant="outline" onClick={() => setIsDeliveryBoyOpen(true)}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                {deliveryBoys.map(boy => (
                                    <Card key={boy.id}>
                                        <CardHeader className="p-4 flex-row items-start justify-between">
                                            <div>
                                                <p className="font-semibold">{boy.name}</p>
                                                <p className="text-sm text-muted-foreground">{boy.phone}</p>
                                            </div>
                                            <div className='flex flex-col items-end gap-2'>
                                                <Badge variant={boy.status === 'available' ? 'default' : 'secondary'}>{boy.status}</Badge>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently remove {boy.name} from the delivery list.
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleRemoveDeliveryBoy(boy.id)}>
                                                            Confirm
                                                        </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </CardHeader>
                                        {boy.status === 'on-a-delivery' && (
                                            <CardFooter className="p-4 pt-0 flex items-center justify-between">
                                                <p className="text-xs">Delivering Order: <span className="font-bold">{boy.currentOrder}</span></p>
                                                <Button size="sm" variant="secondary" onClick={() => handleMarkAsDelivered(boy.id)}>
                                                    <CheckCircle className="mr-2 h-4 w-4" /> Delivered
                                                </Button>
                                            </CardFooter>
                                        )}
                                    </Card>
                                ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Orders for Delivery</h3>
                                <div className="space-y-3">
                                {orders.filter(o => o.type === 'delivery' && o.status === 'ready').map(order => (
                                    <Card key={order.id}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold">{order.orderNumber}</p>
                                                    <p className="text-sm text-muted-foreground">{order.customerName}</p>
                                                </div>
                                                <Select onValueChange={(deliveryBoyId) => handleAssignRider(order.id, deliveryBoyId)}>
                                                    <SelectTrigger className="w-[150px]">
                                                        <SelectValue placeholder="Assign Rider" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {deliveryBoys.filter(b => b.status === 'available').map(b => (
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
                        {viewOrder?.items.map((item, index) => (
                            <TableRow key={`${item.id}-${index}`}>
                                <TableCell>{item.quantity} x {item.name}</TableCell>
                                <TableCell className='text-right flex items-center justify-end'>
                                    <IndianRupee className="h-4 w-4 mr-1" />
                                    {(Number(item.totalPrice) || 0).toFixed(2)}
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

    {/* Dialog for viewing a customer */}
    <Dialog open={!!viewCustomer} onOpenChange={(open) => { if (!open) { setViewCustomer(null); setIsEditingCustomer(false); } }}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <DialogTitle className="flex items-center gap-2">
                            <User /> {isEditingCustomer ? 'Edit Customer' : viewCustomer?.name}
                            {!isEditingCustomer && <Badge variant={getTierBadgeVariant(viewCustomer?.tier || 'New')}>{viewCustomer?.tier}</Badge>}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditingCustomer ? 'Update customer details below.' : viewCustomer?.phone}
                        </DialogDescription>
                    </div>
                    {!isEditingCustomer && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditingCustomer(true)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                    )}
                </div>
            </DialogHeader>

            {isEditingCustomer ? (
                <div className="py-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cust-name">Name</Label>
                            <Input id="cust-name" value={customerFormData.name || ''} onChange={(e) => setCustomerFormData(prev => ({...prev, name: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cust-phone">Phone</Label>
                            <Input id="cust-phone" value={customerFormData.phone || ''} onChange={(e) => setCustomerFormData(prev => ({...prev, phone: e.target.value}))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="cust-bday">Birthday</Label>
                            <Input id="cust-bday" type="date" value={customerFormData.birthday || ''} onChange={(e) => setCustomerFormData(prev => ({...prev, birthday: e.target.value}))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="cust-anniversary">Anniversary</Label>
                            <Input id="cust-anniversary" type="date" value={customerFormData.anniversary || ''} onChange={(e) => setCustomerFormData(prev => ({...prev, anniversary: e.target.value}))} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cust-address">Address</Label>
                        <Textarea id="cust-address" placeholder="Customer's address" value={customerFormData.address || ''} onChange={(e) => setCustomerFormData(prev => ({...prev, address: e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cust-notes">Notes</Label>
                        <Textarea id="cust-notes" placeholder="Add personal notes about the customer..." value={customerFormData.notes || ''} onChange={(e) => setCustomerFormData(prev => ({...prev, notes: e.target.value}))} />
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-center py-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="font-bold text-lg flex items-center justify-center gap-1"><Star className="h-5 w-5 text-yellow-500" />{viewCustomer?.loyaltyPoints}</p>
                            <p className="text-muted-foreground">Loyalty Points</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="font-bold text-lg">{viewCustomer?.totalOrders}</p>
                            <p className="text-muted-foreground">Total Orders</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="font-bold text-lg flex items-center justify-center"><IndianRupee className="h-4 w-4" />{(Number(viewCustomer?.totalSpent) || 0).toFixed(2)}</p>
                            <p className="text-muted-foreground">Total Spent</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="font-bold text-lg">{format(viewCustomer?.lastVisit || new Date(), 'dd MMM yyyy')}</p>
                            <p className="text-muted-foreground">Last Visit</p>
                        </div>
                    </div>
                    <div className="space-y-4 text-sm">
                         <h4 className="font-semibold mb-2">Customer Details</h4>
                         <div className="grid grid-cols-2 gap-4">
                            {viewCustomer?.birthday && (
                                <div className="flex items-center gap-2">
                                    <Cake className="h-4 w-4 text-muted-foreground"/>
                                    <span>Birthday: {format(new Date(viewCustomer.birthday), 'dd MMM')}</span>
                                    {isDateUpcoming(viewCustomer.birthday) && <Badge variant="secondary">Upcoming</Badge>}
                                </div>
                            )}
                             {viewCustomer?.anniversary && (
                                <div className="flex items-center gap-2">
                                    <Gift className="h-4 w-4 text-muted-foreground"/>
                                    <span>Anniversary: {format(new Date(viewCustomer.anniversary), 'dd MMM')}</span>
                                     {isDateUpcoming(viewCustomer.anniversary) && <Badge variant="secondary">Upcoming</Badge>}
                                </div>
                            )}
                             {viewCustomer?.address && (
                                <div className="flex items-start col-span-2 gap-2">
                                    <Home className="h-4 w-4 text-muted-foreground mt-1"/>
                                    <span>Address: {viewCustomer.address}</span>
                                </div>
                            )}
                             {viewCustomer?.notes && (
                                <div className="flex items-start col-span-2 gap-2">
                                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-1"/>
                                    <span>Notes: {viewCustomer.notes}</span>
                                </div>
                            )}
                         </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><History/> Order History</h4>
                        <ScrollArea className="h-64">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order #</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className='text-right'>Total</TableHead>
                                        <TableHead className='text-right'>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.filter(o => o.customerPhone === viewCustomer?.phone).map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell>{order.orderNumber}</TableCell>
                                            <TableCell>{formatDistanceToNow(order.createdAt, { addSuffix: true })}</TableCell>
                                            <TableCell className='text-right flex items-center justify-end'><IndianRupee className="h-4 w-4 mr-1" />{(Number(order.total) || 0).toFixed(2)}</TableCell>
                                            <TableCell className='text-right'>
                                                <Button variant="ghost" size="icon" onClick={() => setViewOrder(order)}>
                                                    <Eye className="h-4 w-4"/>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                </>
            )}
             <DialogFooter>
                {isEditingCustomer ? (
                    <>
                        <Button variant="outline" onClick={() => setIsEditingCustomer(false)}>Cancel</Button>
                        <Button onClick={handleSaveCustomer}>Save Changes</Button>
                    </>
                ) : (
                    <Button variant="outline" onClick={() => { setViewCustomer(null); setIsEditingCustomer(false); }}>Close</Button>
                )}
            </DialogFooter>
        </DialogContent>
    </Dialog>
    
    {/* Dialog for creating a reservation */}
    <Dialog open={isReservationOpen} onOpenChange={setIsReservationOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>New Table Reservation</DialogTitle>
                <DialogDescription>
                    Enter the customer's details to reserve a table.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="res-name" className="text-right">Name</Label>
                    <Input id="res-name" value={newReservation.name} onChange={e => setNewReservation({...newReservation, name: e.target.value})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="res-phone" className="text-right">Phone</Label>
                    <Input id="res-phone" value={newReservation.phone} onChange={e => setNewReservation({...newReservation, phone: e.target.value})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="res-guests" className="text-right">Guests</Label>
                    <Input id="res-guests" type="number" value={newReservation.guests} onChange={e => setNewReservation({...newReservation, guests: e.target.value})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Date & Time</Label>
                    <div className="col-span-3 flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal", !newReservation.date && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {newReservation.date ? format(newReservation.date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={newReservation.date} onSelect={date => setNewReservation({...newReservation, date: date || new Date()})} initialFocus/>
                            </PopoverContent>
                        </Popover>
                        <Select value={newReservation.hour} onValueChange={hour => setNewReservation({...newReservation, hour})}>
                            <SelectTrigger className="w-20"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {Array.from({length: 13}, (_, i) => i + 9).map(h => <SelectItem key={h} value={String(h).padStart(2,'0')}>{String(h).padStart(2,'0')}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={newReservation.minute} onValueChange={minute => setNewReservation({...newReservation, minute})}>
                             <SelectTrigger className="w-20"><SelectValue/></SelectTrigger>
                             <SelectContent>
                                {['00','15','30','45'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                             </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsReservationOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateReservation}>Create Reservation</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    {/* Dialog for assigning a table */}
    <Dialog open={!!seatingReservation} onOpenChange={() => setSeatingReservation(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Seat Reservation for {seatingReservation?.name}</DialogTitle>
          <DialogDescription>
            Select a vacant table to assign to this party of {seatingReservation?.guests}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            {tables.filter(t => t.status === 'vacant' && t.capacity >= (seatingReservation?.guests || 0)).map(table => (
              <Button 
                key={table.id}
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleSeatReservation(table.id)}
              >
                {table.name} (Capacity: {table.capacity})
              </Button>
            ))}
            {tables.filter(t => t.status === 'vacant' && t.capacity >= (seatingReservation?.guests || 0)).length === 0 && (
              <p className="text-center text-muted-foreground">No suitable vacant tables found.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Dialog for adding a delivery boy */}
    <Dialog open={isDeliveryBoyOpen} onOpenChange={setIsDeliveryBoyOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Delivery Personnel</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="db-name" className="text-right">Name</Label>
                    <Input id="db-name" value={newDeliveryBoy.name} onChange={e => setNewDeliveryBoy({...newDeliveryBoy, name: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="db-phone" className="text-right">Phone</Label>
                    <Input id="db-phone" value={newDeliveryBoy.phone} onChange={e => setNewDeliveryBoy({...newDeliveryBoy, phone: e.target.value})} className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeliveryBoyOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateDeliveryBoy}>Save Personnel</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    {/* Dialog for password confirmation on cancel */}
    <Dialog open={!!orderToCancel} onOpenChange={() => { setOrderToCancel(null); setPassword(''); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Password Required</DialogTitle>
          <DialogDescription>
            Enter your password to confirm cancellation of order #{orderToCancel?.orderNumber}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="cancel-password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setOrderToCancel(null); setPassword(''); }}>
            Cancel
          </Button>
          <Button onClick={() => handleCancelOrder(orderToCancel!.id)} className="bg-destructive hover:bg-destructive/90">
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
