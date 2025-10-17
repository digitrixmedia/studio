
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
import { useToast } from '@/hooks/use-toast';

const statusConfig: { [key in TableStatus]: { color: string; icon: React.ElementType } } = {
  Vacant: { color: 'border-green-500 bg-green-500/10', icon: Circle },
  Occupied: { color: 'border-orange-500 bg-orange-500/10', icon: Utensils },
  Billing: { color: 'border-red-500 bg-red-500/10', icon: IndianRupee },
};

export default function TablesPage() {
  const { 
    tables, 
    setTables, 
    startOrderForTable, 
    getOrderByTable,
    setActiveOrderId
  } = useAppContext();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const router = useRouter();
  const { toast } = useToast();


  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
  };

  const handleStartNewOrder = () => {
    if (selectedTable) {
      startOrderForTable(selectedTable.id);
      setSelectedTable(null);
    }
  };

  const viewOrder = () => {
     if (selectedTable) {
      const order = getOrderByTable(selectedTable.id);
      if (order) {
        setActiveOrderId(order.id);
        router.push('/orders');
      } else {
        // This case might happen if an order was cleared but table status wasn't updated
        // For robustness, we can start a new order.
        handleStartNewOrder();
      }
      setSelectedTable(null);
    }
  }

  const handleGenerateBill = () => {
    if (selectedTable) {
      setTables(prevTables => 
        prevTables.map(t => 
          t.id === selectedTable.id ? { ...t, status: 'Billing' } : t
        )
      );
      toast({
        title: "Bill Generated",
        description: `${selectedTable.name} is now in billing status.`,
      });
      setSelectedTable(null);
    }
  }
  
  const handleMarkAsPaid = () => {
    if (selectedTable) {
      setTables(prevTables => 
        prevTables.map(t => 
          t.id === selectedTable.id ? { ...t, status: 'Vacant', currentOrderId: undefined } : t
        )
      );
       // Here you would also likely remove the order from the active orders list
      toast({
        title: "Table Vacated",
        description: `${selectedTable.name} is now available.`,
      });
      setSelectedTable(null);
    }
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
          const orderForTable = getOrderByTable(table.id);
          const orderTotal = orderForTable ? orderForTable.items.reduce((sum, item) => sum + item.totalPrice, 0) : null;
          
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
                {orderForTable && table.status !== 'Vacant' && (
                   <div className="mt-2 text-xs">
                     <p>Order: #{orderForTable.orderNumber}</p>
                     {orderTotal !== null && (
                       <p className='flex items-center font-semibold'>Total: <IndianRupee className="h-3 w-3 mx-1" />{orderTotal.toFixed(2)}</p>
                     )}
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
              Capacity: {selectedTable?.capacity} | Status: <span className='font-bold'>{selectedTable?.status}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            {selectedTable?.status === 'Vacant' && (
              <Button className="w-full" onClick={handleStartNewOrder}>Start New Order</Button>
            )}
            {selectedTable?.status === 'Occupied' && (
              <>
                 <Button className="w-full" variant="outline" onClick={viewOrder}>View / Add to Order</Button>
                 <Button className="w-full" onClick={handleGenerateBill}>Generate Bill</Button>
              </>
            )}
             {selectedTable?.status === 'Billing' && (
              <>
                 <Button className="w-full" variant="outline" onClick={viewOrder}>View Order</Button>
                 <Button className="w-full" onClick={handleMarkAsPaid}>Mark as Paid & Vacate</Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
