
'use client';

import { useState } from 'react';
import { tables as initialTables, orders } from '@/lib/data';
import type { Table, TableStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Users, Utensils, Circle, CheckCircle, IndianRupee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';

const statusConfig: { [key in TableStatus]: { color: string; icon: React.ElementType } } = {
  Vacant: { color: 'border-green-500 bg-green-500/10', icon: Circle },
  Occupied: { color: 'border-orange-500 bg-orange-500/10', icon: Utensils },
  Billing: { color: 'border-red-500 bg-red-500/10', icon: IndianRupee },
};

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const router = useRouter();
  const { loadOrder, setCurrentOrder } = useAppContext();

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
  };

  const startNewOrder = () => {
    if (selectedTable) {
      setCurrentOrder([]); // Clear any existing order in POS
      router.push('/orders');
      setSelectedTable(null);
    }
  };

  const viewOrder = () => {
     if (selectedTable && selectedTable.currentOrderId) {
      const orderToLoad = orders.find(o => o.id === selectedTable.currentOrderId);
      if (orderToLoad) {
        loadOrder(orderToLoad);
        router.push('/orders');
      }
      setSelectedTable(null);
    }
  }

  const generateBill = () => {
    // Bill generation logic
    console.log("Generating bill for table: ", selectedTable?.name);
    setSelectedTable(null);
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Table Layout</h2>
        <div className="flex items-center gap-4">
          {Object.entries(statusConfig).map(([status, { color, icon: Icon }]) => (
            <div key={status} className="flex items-center gap-2 text-sm">
              <Icon className={cn('h-4 w-4', color.replace('border-', 'text-').replace(' bg-green-500/10',''))} />
              <span>{status}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tables.map(table => {
          const config = statusConfig[table.status];
          const order = table.currentOrderId ? orders.find(o => o.id === table.currentOrderId) : null;
          return (
            <Card
              key={table.id}
              className={cn(
                'cursor-pointer hover:shadow-lg transition-shadow',
                config.color
              )}
              onClick={() => handleTableClick(table)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">{table.name}</CardTitle>
                <config.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{table.capacity} Seats</span>
                </div>
                {order && (
                   <div className="mt-2 text-xs">
                     <p>Order #{order.orderNumber}</p>
                     <p className='flex items-center'>Total: <IndianRupee className="h-3 w-3 mx-1" />{order.total.toFixed(2)}</p>
                     <Badge variant={order.status === 'Ready' ? 'default' : 'secondary'}>{order.status}</Badge>
                   </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Table: {selectedTable?.name}</DialogTitle>
            <DialogDescription>
              Status: {selectedTable?.status}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedTable?.status === 'Vacant' && (
              <Button className="w-full" onClick={startNewOrder}>Start New Order</Button>
            )}
            {selectedTable?.status === 'Occupied' && (
              <div className="space-y-2">
                 <Button className="w-full" variant="outline" onClick={viewOrder}>View / Add to Order</Button>
                 <Button className="w-full" onClick={generateBill}>Generate Bill</Button>
              </div>
            )}
             {selectedTable?.status === 'Billing' && (
              <div className="space-y-2">
                 <Button className="w-full" variant="outline" onClick={viewOrder}>View Order</Button>
                 <Button className="w-full" disabled>Payment in Process</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
