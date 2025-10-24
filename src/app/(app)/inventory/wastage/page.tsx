
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
import { PlusCircle, IndianRupee } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { ingredients, menuItems, users } from '@/lib/data';
import type { Wastage, WastageItem } from '@/lib/types';


// Mock data for initial state
const initialWastageEntries: Wastage[] = [
  {
    id: 'wastage-1',
    wastageNumber: 'WT-001',
    date: new Date(),
    wastageFor: 'Raw Material',
    items: [
      { id: 'wi-1', itemId: 'ing-1', quantity: 0.5, unit: 'kg', amount: 400 },
      { id: 'wi-2', itemId: 'ing-5', quantity: 1, unit: 'kg', amount: 150 },
    ],
    totalAmount: 550,
    userId: 'user-2',
    reason: 'Spoiled',
  },
  {
    id: 'wastage-2',
    wastageNumber: 'WT-002',
    date: new Date(Date.now() - 86400000), // Yesterday
    wastageFor: 'Item',
    items: [
      { id: 'wi-3', itemId: 'item-5', quantity: 2, unit: 'pcs', amount: 440 },
    ],
    totalAmount: 440,
    userId: 'user-2',
    reason: 'Burnt during preparation',
  },
];

export default function WastagePage() {
  const [wastageEntries, setWastageEntries] = useState(initialWastageEntries);

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Unknown User';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Wastage Management</CardTitle>
            <CardDescription>
              A log of all recorded wastage.
            </CardDescription>
          </div>
          <Link href="/inventory/wastage/add">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Wastage
            </Button>
          </Link>
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
              <TableRow key={entry.id}>
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
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
