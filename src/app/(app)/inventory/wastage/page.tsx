
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
import type { Wastage, WastageItem, Ingredient } from '@/lib/types';
import { AddWastageDialog } from '@/components/inventory/AddWastageDialog';


// Mock data for initial state
const initialWastageEntries: Wastage[] = [
  {
    id: 'wastage-1',
    wastageNumber: 'WT-001',
    date: new Date(),
    wastageFor: 'Raw Material',
    items: [
      { id: 'wi-1', itemId: 'ing-1', name: 'Coffee Beans', quantity: 0.5, unit: 'kg', amount: 400 },
      { id: 'wi-2', itemId: 'ing-5', name: 'Veggie Mix', quantity: 1, unit: 'kg', amount: 150 },
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
      { id: 'wi-3', itemId: 'item-5', name: 'Veggie Sandwich', quantity: 2, unit: 'pcs', amount: 440 },
    ],
    totalAmount: 440,
    userId: 'user-2',
    reason: 'Burnt during preparation',
  },
];

export default function WastagePage() {
  const [wastageEntries, setWastageEntries] = useState(initialWastageEntries);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ingredientsState, setIngredientsState] = useState(ingredients);


  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Unknown User';
  };

  const handleSaveWastage = (newWastage: Wastage) => {
    setWastageEntries(prev => [newWastage, ...prev]);
     // Deduct stock logic
    if (newWastage.wastageFor === 'Raw Material') {
      setIngredientsState(prevIngredients => {
        const updatedIngredients = [...prevIngredients];
        newWastage.items.forEach(wItem => {
          const ingIndex = updatedIngredients.findIndex(ing => ing.id === wItem.itemId);
          if (ingIndex !== -1) {
            updatedIngredients[ingIndex].stock -= wItem.quantity;
          }
        });
        return updatedIngredients;
      });
    } else {
      // For menu items, you would deduct from the raw materials based on recipe mapping.
      // This is a complex logic that would be implemented here in a real application.
    }
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

      <AddWastageDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveWastage}
      />
    </>
  );
}
