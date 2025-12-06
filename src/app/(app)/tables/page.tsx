'use client';

import { useState } from 'react';
import type { Table, TableStatus } from '@/lib/types';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Users,
  Utensils,
  Circle,
  IndianRupee,
  PlusCircle,
  Trash2,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { useFirestore } from '@/firebase';
import { doc, addDoc, collection } from 'firebase/firestore';

import {
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';

import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


/* -------------------------------------------
   TABLE STATUS UI CONFIG
--------------------------------------------*/
const statusConfig: {
  [key in TableStatus]: { color: string; icon: React.ElementType };
} = {
  vacant: { color: 'border-green-500 bg-green-500/10', icon: Circle },
  occupied: { color: 'border-orange-500 bg-orange-500/10', icon: Utensils },
  billing: { color: 'border-red-500 bg-red-500/10', icon: IndianRupee },
};


/* -------------------------------------------
   MAIN PAGE
--------------------------------------------*/
export default function TablesPage() {
  const {
    tables,
    setTables,
    startOrderForTable,
    getOrderByTable,
    setActiveOrderId,
    finalizeOrder,
    selectedOutlet,
  } = useAppContext();

  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);

  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');


  /* -------------------------------------------
     TABLE CLICK
  --------------------------------------------*/
  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
  };


  /* -------------------------------------------
     START NEW ORDER
  --------------------------------------------*/
  const handleStartNewOrder = () => {
    if (selectedTable) {
      startOrderForTable(selectedTable.id);
      setSelectedTable(null);
    }
  };


  /* -------------------------------------------
     VIEW ORDER FOR TABLE
  --------------------------------------------*/
  const viewOrder = () => {
    if (!selectedTable) return;

    const order = getOrderByTable(selectedTable.id);

    if (order) {
      setActiveOrderId(order.id);
      router.push('/orders');
    } else {
      handleStartNewOrder();
    }

    setSelectedTable(null);
  };


  /* -------------------------------------------
     GENERATE BILL
  --------------------------------------------*/
  const handleGenerateBill = () => {
    if (!selectedTable || !selectedOutlet) return;

    updateDocumentNonBlocking(
      doc(firestore, `outlets/${selectedOutlet.id}/tables`, selectedTable.id),
      { status: 'billing' }
    );

    toast({
      title: 'Bill Generated',
      description: `${selectedTable.name} is now in billing mode.`,
    });

    setSelectedTable(null);
  };


  /* -------------------------------------------
     MARK TABLE AS PAID
  --------------------------------------------*/
  const handleMarkAsPaid = async () => {
    if (!selectedTable || !selectedTable.currentOrderId) {
      toast({
        title: 'Error',
        description: 'No active order for this table.',
        variant: 'destructive',
      });
      return;
    }

    await finalizeOrder(selectedTable.currentOrderId, {
  subTotal: 0,
  discount: 0,
  tax: 0,
  total: 0,
});

    toast({
      title: 'Table Vacated',
      description: `${selectedTable.name} is now available.`,
    });

    setSelectedTable(null);
  };


  /* -------------------------------------------
     ADD NEW TABLE
  --------------------------------------------*/
  const handleAddTable = async () => {
    if (!newTableName || !newTableCapacity) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Enter both name and capacity.',
      });
      return;
    }

    if (!selectedOutlet) {
      toast({
        variant: 'destructive',
        title: 'No Outlet Selected',
        description: 'Cannot add a table without selecting an outlet.',
      });
      return;
    }

    const newTableData: Omit<Table, 'id'> = {
      name: newTableName,
      capacity: Number(newTableCapacity),
      status: 'vacant',
    };

    const tablesRef = collection(firestore, `outlets/${selectedOutlet.id}/tables`);

    try {
      await addDoc(tablesRef, newTableData);
      toast({ title: 'Table Added', description: `${newTableName} added successfully.` });
    } catch (error) {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: tablesRef.path,
          operation: 'create',
          requestResourceData: newTableData,
        })
      );
    }

    setIsAddTableOpen(false);
    setNewTableName('');
    setNewTableCapacity('4');
  };


  /* -------------------------------------------
     DELETE TABLE
  --------------------------------------------*/
  const handleDeleteTable = () => {
    if (!selectedTable || !selectedOutlet) return;

    deleteDocumentNonBlocking(
      doc(firestore, `outlets/${selectedOutlet.id}/tables`, selectedTable.id)
    );

    toast({
      title: 'Table Removed',
      description: `${selectedTable.name} deleted.`,
      variant: 'destructive',
    });

    setSelectedTable(null);
  };


  /* -------------------------------------------
     ORDER TOTAL
  --------------------------------------------*/
  const orderForSelectedTable = selectedTable
    ? getOrderByTable(selectedTable.id)
    : undefined;

  const orderTotal = orderForSelectedTable
    ? orderForSelectedTable.items.reduce((sum, item) => sum + item.totalPrice, 0)
    : null;


  /* -------------------------------------------
     UI
  --------------------------------------------*/
  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Table Layout</h2>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4">
            {Object.entries(statusConfig).map(([status, { color, icon: Icon }]) => (
              <div key={status} className="flex items-center gap-2 text-sm capitalize">
                <Icon
                  className={cn(
                    'h-4 w-4',
                    color.replace('border-', 'text-').replace(' bg-green-500/10', '')
                  )}
                />
                <span>{status}</span>
              </div>
            ))}
          </div>

          <Button onClick={() => setIsAddTableOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Table
          </Button>
        </div>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tables.map((table) => {
          const config = statusConfig[table.status] || {
            color: 'border-gray-500 bg-gray-500/10',
            icon: Circle,
          };

          const order = getOrderByTable(table.id);
          const total =
            order?.items.reduce((sum, item) => sum + item.totalPrice, 0) ?? null;

          return (
            <Card
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={cn(
                'cursor-pointer hover:shadow-lg transition-shadow',
                config.color
              )}
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

                {order && table.status !== 'vacant' && (
                  <div className="mt-2 text-xs">
                    <p>Order: #{order.orderNumber}</p>

                    {total !== null && (
                      <p className="flex items-center font-semibold">
                        Total:
                        <IndianRupee className="h-3 w-3 mx-1" />
                        {total.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* TABLE ACTION DIALOG */}
      <Dialog open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Table: {selectedTable?.name}</DialogTitle>
            <DialogDescription>
              Capacity: {selectedTable?.capacity} | Status:{' '}
              <span className="font-bold capitalize">{selectedTable?.status}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            {/* VACANT */}
            {selectedTable?.status === 'vacant' && (
              <>
                <Button className="w-full" onClick={handleStartNewOrder}>
                  Start New Order
                </Button>

                {/* Delete */}
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
                        This will permanently delete {selectedTable?.name}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={handleDeleteTable}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}

            {/* OCCUPIED */}
            {selectedTable?.status === 'occupied' && (
              <>
                <Button className="w-full" variant="outline" onClick={viewOrder}>
                  View / Add to Order
                </Button>

                <Button className="w-full" onClick={handleGenerateBill}>
                  Generate Bill
                </Button>
              </>
            )}

            {/* BILLING */}
            {selectedTable?.status === 'billing' && (
              <>
                <Button className="w-full" variant="outline" onClick={viewOrder}>
                  View Order
                </Button>

                <Button className="w-full" onClick={handleMarkAsPaid}>
                  Mark as Paid & Vacate
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ADD TABLE DIALOG */}
      <Dialog open={isAddTableOpen} onOpenChange={setIsAddTableOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
            <DialogDescription>Enter table details below.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="table-name" className="text-right">
                Name
              </Label>
              <Input
                id="table-name"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="table-capacity" className="text-right">
                Capacity
              </Label>
              <Input
                id="table-capacity"
                type="number"
                value={newTableCapacity}
                onChange={(e) => setNewTableCapacity(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTableOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTable}>Add Table</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
