
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { purchaseOrders, vendors } from '@/lib/data';
import type { PurchaseOrder } from '@/lib/types';
import { PlusCircle, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import { NewPurchaseOrderDialog } from '@/components/inventory/NewPurchaseOrderDialog';

export default function PurchaseOrdersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getVendorName = (vendorId: string) => {
    return vendors.find(v => v.id === vendorId)?.name || 'Unknown Vendor';
  };

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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Purchase Management</CardTitle>
              <CardDescription>
                A log of all your raw material purchases.
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
                <TableRow key={po.id}>
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
      <NewPurchaseOrderDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </>
  );
}
