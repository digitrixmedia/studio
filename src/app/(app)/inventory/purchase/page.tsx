
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { purchaseOrders as initialPurchaseOrders, vendors, ingredients as initialIngredients } from '@/lib/data';
import type { PurchaseOrder, Ingredient } from '@/lib/types';
import { PlusCircle, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import { NewPurchaseOrderDialog } from '@/components/inventory/NewPurchaseOrderDialog';

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | null>(null);

  const getVendorName = (vendorId: string) => {
    return vendors.find(v => v.id === vendorId)?.name || 'Unknown Vendor';
  };
  
  const getIngredientName = (ingredientId: string) => {
    return initialIngredients.find(i => i.id === ingredientId)?.name || 'Unknown';
  }

  const getStatusVariant = (status: 'pending' | 'completed' | 'cancelled') => {
    switch (status) {
        case 'completed': return 'default';
        case 'pending': return 'secondary';
        case 'cancelled': return 'destructive';
    }
  }
  
  const getPaymentStatusVariant = (status: 'paid' | 'unpaid') => {
    return status === 'paid' ? 'default' : 'destructive';
  }

  const handleNewOrder = (newOrder: PurchaseOrder) => {
    setPurchaseOrders(prev => [newOrder, ...prev]);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Purchase Management</CardTitle>
              <CardDescription>
                A log of all your raw material purchases. Click a row to view details.
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> New Purchase Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.map((po) => (
                <TableRow key={po.id} onClick={() => setViewingOrder(po)} className="cursor-pointer">
                  <TableCell className="font-medium">{po.poNumber}</TableCell>
                  <TableCell>{getVendorName(po.vendorId)}</TableCell>
                  <TableCell>{format(po.date, 'PPP')}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(po.status)} className="capitalize">{po.status}</Badge>
                  </TableCell>
                   <TableCell>
                    <Badge variant={getPaymentStatusVariant(po.paymentStatus)} className="capitalize">{po.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {po.grandTotal.toFixed(2)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <NewPurchaseOrderDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSave={handleNewOrder}
        setIngredients={setIngredients}
      />
       <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Purchase Order: {viewingOrder?.poNumber}</DialogTitle>
            <DialogDescription>
              Details for the purchase from {viewingOrder && getVendorName(viewingOrder.vendorId)}.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className='text-right'>Quantity</TableHead>
                  <TableHead className='text-right'>Unit Price</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewingOrder?.items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{getIngredientName(item.ingredientId)}</TableCell>
                    <TableCell className='text-right'>{item.quantity} {item.purchaseUnit}</TableCell>
                    <TableCell className='text-right'>
                      <div className="flex items-center justify-end">
                        <IndianRupee className="h-4 w-4 mr-1"/>
                        {item.unitPrice.toFixed(2)}
                      </div>
                    </TableCell>
                     <TableCell className='text-right'>
                      <div className="flex items-center justify-end">
                        <IndianRupee className="h-4 w-4 mr-1"/>
                        {item.amount.toFixed(2)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             <div className="flex flex-col items-end mt-4 text-sm space-y-1 pr-4">
                <div className='flex w-48 justify-between'>
                    <span>Subtotal:</span>
                    <span>{viewingOrder?.subTotal.toFixed(2)}</span>
                </div>
                 <div className='flex w-48 justify-between'>
                    <span>Discount:</span>
                    <span className='text-destructive'>- {viewingOrder?.totalDiscount.toFixed(2)}</span>
                </div>
                 <div className='flex w-48 justify-between'>
                    <span>Other Charges:</span>
                    <span>{viewingOrder?.otherCharges.toFixed(2)}</span>
                </div>
                 <div className='flex w-48 justify-between'>
                    <span>Taxes:</span>
                    <span>{viewingOrder?.totalTaxes.toFixed(2)}</span>
                </div>
                 <div className='flex w-48 justify-between font-bold text-base border-t mt-2 pt-2'>
                    <span>Grand Total:</span>
                    <span>{viewingOrder?.grandTotal.toFixed(2)}</span>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingOrder(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
