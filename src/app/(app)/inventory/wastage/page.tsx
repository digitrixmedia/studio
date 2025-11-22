

'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PlusCircle, IndianRupee } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import type { Wastage, WastageItem, Ingredient } from '@/lib/types';
import { AddWastageDialog } from '@/components/inventory/AddWastageDialog';
import { useAppContext } from '@/contexts/AppContext';


export default function WastagePage() {
  const { users } = useAppContext();
  const [wastageEntries, setWastageEntries] = useState<Wastage[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<Wastage | null>(null);


  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Unknown User';
  };

  const handleSaveWastage = (newWastage: Wastage) => {
    setWastageEntries(prev => [newWastage, ...prev]);
     // In a real app, stock deduction would happen here via context/API
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Wastage Management</CardTitle>
              <CardDescription>
                A log of all recorded wastage.
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Wastage
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wastage No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Wastage For</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wastageEntries.map((entry) => (
                <TableRow key={entry.id} onClick={() => setViewingEntry(entry)} className="cursor-pointer">
                  <TableCell className="font-medium">{entry.wastageNumber}</TableCell>
                  <TableCell>{format(entry.date, 'PPP')}</TableCell>
                  <TableCell>{entry.wastageFor}</TableCell>
                  <TableCell>{getUserName(entry.userId)}</TableCell>
                  <TableCell>{entry.reason}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {entry.totalAmount.toFixed(2)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
               {wastageEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No wastage entries recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddWastageDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveWastage}
      />

       <Dialog open={!!viewingEntry} onOpenChange={() => setViewingEntry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Wastage Details: {viewingEntry?.wastageNumber}</DialogTitle>
            <DialogDescription>
              Recorded on {viewingEntry ? format(viewingEntry.date, 'PPP') : ''} by {viewingEntry ? getUserName(viewingEntry.userId) : ''}.
              <br/>
              Reason: {viewingEntry?.reason}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead className='text-right'>Quantity</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewingEntry?.items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className='font-medium'>{item.name}</TableCell>
                    <TableCell className='text-right'>{item.quantity} {item.unit}</TableCell>
                    <TableCell className='text-right flex items-center justify-end'>
                      <IndianRupee className="h-4 w-4 mr-1"/>
                      {item.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             <div className="flex justify-end font-bold text-lg mt-4 pr-4">
                <div className="flex items-center gap-4">
                  <span>Total Wastage:</span>
                  <div className="flex items-center">
                    <IndianRupee className="h-5 w-5 mr-1" />
                    {viewingEntry?.totalAmount.toFixed(2)}
                  </div>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingEntry(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
