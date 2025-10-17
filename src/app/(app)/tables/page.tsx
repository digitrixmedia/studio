
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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Users, Utensils, Circle, CheckCircle, IndianRupee, PlusCircle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const statusConfig: { [key in TableStatus]: { color: string; icon: React.ElementType } } = {
  vacant: { color: 'border-green-500 bg-green-500/10', icon: Circle },
  occupied: { color: 'border-orange-500 bg-orange-500/10', icon: Utensils },
  billing: { color: 'border-red-500 bg-red-500/10', icon: IndianRupee },
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
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');
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
          t.id === selectedTable.id ? { ...t, status: 'billing' } : t
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
          t.id === selectedTable.id ? { ...t, status: 'vacant', currentOrderId: undefined } : t
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

  const handleAddTable = () => {
    if (!newTableName || !newTableCapacity) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please provide a name and capacity for the table."
        });
        return;
    }
    const newTable: Table = {
        id: `table-${Date.now()}`,
        name: newTableName,
        capacity: parseInt(newTableCapacity, 10),
        status: 'vacant',
    };
    setTables(prev => [...prev, newTable]);
    toast({
        title: "Table Added",
        description: `${newTableName} has been added to your layout.`
    });
    setIsAddTableOpen(false);
    setNewTableName('');
    setNewTableCapacity('4');
  };

  const handleDeleteTable = () => {
    if (selectedTable) {
        setTables(prev => prev.filter(t => t.id !== selectedTable.id));
        toast({
            title: "Table Removed",
            description: `${selectedTable.name} has been removed from your layout.`,
            variant: "destructive"
        });
        setSelectedTable(null);
    }
  }


  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Table Layout</h2>
        <div className='flex items-center gap-4'>
            <div className="hidden sm:flex items-center gap-4">
            {Object.entries(statusConfig).map(([status, { color, icon: Icon }]) => (
                <div key={status} className="flex items-center gap-2 text-sm capitalize">
                <Icon className={cn('h-4 w-4', color.replace('border-', 'text-').replace(' bg-green-500/10',''))} />
                <span>{status}</span>
                </div>
            ))}
            </div>
            <Button onClick={() => setIsAddTableOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Table
            </Button>
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
                {orderForTable && table.status !== 'vacant' && (
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
              Capacity: {selectedTable?.capacity} | Status: <span className='font-bold capitalize'>{selectedTable?.status}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            {selectedTable?.status === 'vacant' && (
              <>
                <Button className="w-full" onClick={handleStartNewOrder}>Start New Order</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full" variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Table
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {selectedTable.name}. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteTable} className='bg-destructive hover:bg-destructive/90'>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            {selectedTable?.status === 'occupied' && (
              <>
                 <Button className="w-full" variant="outline" onClick={viewOrder}>View / Add to Order</Button>
                 <Button className="w-full" onClick={handleGenerateBill}>Generate Bill</Button>
              </>
            )}
             {selectedTable?.status === 'billing' && (
              <>
                 <Button className="w-full" variant="outline" onClick={viewOrder}>View Order</Button>
                 <Button className="w-full" onClick={handleMarkAsPaid}>Mark as Paid & Vacate</Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

       <Dialog open={isAddTableOpen} onOpenChange={setIsAddTableOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Table</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new table.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="table-name" className="text-right">Name</Label>
                        <Input id="table-name" value={newTableName} onChange={e => setNewTableName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="table-capacity" className="text-right">Capacity</Label>
                        <Input id="table-capacity" type="number" value={newTableCapacity} onChange={e => setNewTableCapacity(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddTableOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddTable}>Add Table</Button>
                </DialogFooter>
            </DialogContent>
      </Dialog>
    </div>
  );
}
