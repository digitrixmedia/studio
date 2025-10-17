
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { orders as initialOrders } from '@/lib/data';
import type { Order } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Clock, Check, CookingPot, MessageSquarePlus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>(
    initialOrders.filter(o => o.status === 'new' || o.status === 'preparing')
  );

  const updateOrderStatus = (orderId: string, status: 'preparing' | 'ready') => {
    setOrders(currentOrders =>
      currentOrders.map(o => (o.id === orderId ? { ...o, status } : o))
    );
  };
  
  // Remove "Ready" orders after a delay
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(currentOrders => currentOrders.filter(o => o.status !== 'ready'));
    }, 30000); // Remove after 30 seconds
    return () => clearInterval(interval);
  }, []);

  const newOrders = orders.filter(o => o.status === 'new');
  const preparingOrders = orders.filter(o => o.status === 'preparing');

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock /> New Orders ({newOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
           <ScrollArea className="h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pr-4">
                {newOrders.map(order => (
                <OrderTicket key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
                ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CookingPot /> Preparing ({preparingOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
           <ScrollArea className="h-full">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pr-4">
                {preparingOrders.map(order => (
                <OrderTicket key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
                ))}
            </div>
           </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function OrderTicket({ order, onUpdateStatus }: { order: Order, onUpdateStatus: (orderId: string, status: 'preparing' | 'ready') => void }) {
  return (
    <Card className={cn(
        "flex flex-col",
        order.status === 'new' && "bg-blue-500/10 border-blue-500",
        order.status === 'preparing' && "bg-orange-500/10 border-orange-500",
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
            <span>#{order.orderNumber}</span>
            <Badge variant="secondary">{order.type === 'dine-in' ? `Table: ${order.tableId?.split('-')[1]}` : order.type}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-2 text-sm">
        {order.items.map(item => (
          <div key={item.id}>
            <span className="font-bold">{item.quantity}x</span> {item.name}
             {item.notes && <p className='text-xs text-amber-700 dark:text-amber-500 pl-4 flex items-center gap-1'><MessageSquarePlus className="h-3 w-3"/> {item.notes}</p>}
          </div>
        ))}
      </CardContent>
      <CardFooter className="p-2">
        {order.status === 'new' && (
             <Button className="w-full" onClick={() => onUpdateStatus(order.id, 'preparing')}>
                <CookingPot className="mr-2 h-4 w-4" /> Start Preparing
            </Button>
        )}
        {order.status === 'preparing' && (
             <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => onUpdateStatus(order.id, 'ready')}>
                <Check className="mr-2 h-4 w-4" /> Mark as Ready
            </Button>
        )}
      </CardFooter>
    </Card>
  )
}
