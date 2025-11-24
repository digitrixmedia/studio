
'use client';

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
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
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
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Ingredient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';


export default function InventoryStockPage() {
  const { ingredients } = useAppContext();
  const firestore = useFirestore();
  const [stockUpdateIngredient, setStockUpdateIngredient] = useState<Ingredient | null>(null);
  const [stockUpdateQuantity, setStockUpdateQuantity] = useState('');
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);
  
  const [newIngredient, setNewIngredient] = useState({ name: '', stock: '', minStock: '', unit: '' });
  
  const { toast } = useToast();
  
  const handleOpenAddStockDialog = (ingredient: Ingredient) => {
    setStockUpdateIngredient(ingredient);
    setStockUpdateQuantity('');
  };

  const handleAddStock = () => {
    if (!stockUpdateIngredient || !stockUpdateQuantity) return;
    const quantityToAdd = Number(stockUpdateQuantity);

    if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
        toast({
            variant: "destructive",
            title: "Invalid Quantity",
            description: "Please enter a valid positive number for the stock quantity.",
        });
        return;
    }

    const newStock = stockUpdateIngredient.stock + quantityToAdd;
    updateDocumentNonBlocking(doc(firestore, 'ingredients', stockUpdateIngredient.id), { stock: newStock });

    toast({
        title: "Stock Updated",
        description: `${quantityToAdd} ${stockUpdateIngredient.baseUnit} added to ${stockUpdateIngredient.name}.`,
    });

    setStockUpdateIngredient(null);
  };

  const handleDeleteIngredient = () => {
    if (!ingredientToDelete) return;
    deleteDocumentNonBlocking(doc(firestore, 'ingredients', ingredientToDelete.id));
    toast({
        title: "Ingredient Removed",
        description: `${ingredientToDelete.name} has been removed from the inventory.`,
        variant: "destructive",
    });
    setIngredientToDelete(null);
  };
  
  const handleAddNewIngredient = () => {
    if (!newIngredient.name || !newIngredient.stock || !newIngredient.minStock || !newIngredient.unit) {
        toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill all fields.' });
        return;
    }
    const newDoc: Omit<Ingredient, 'id'> = {
      name: newIngredient.name,
      stock: Number(newIngredient.stock),
      minStock: Number(newIngredient.minStock),
      baseUnit: newIngredient.unit as any,
      purchaseUnits: [], // This should be managed elsewhere
    };
    
    addDocumentNonBlocking(collection(firestore, 'ingredients'), newDoc);
    
    toast({ title: 'Ingredient added', description: `${newIngredient.name} added to inventory.` });
    setNewIngredient({ name: '', stock: '', minStock: '', unit: '' });
  }

  return (
    <>
    <Card>
        <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Inventory & Stock Management</CardTitle>
                <CardDescription>
                Track stock of raw materials and get low stock alerts.
                </CardDescription>
            </div>
            <Sheet>
            <SheetTrigger asChild>
                <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Ingredient
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                <SheetTitle>Add Ingredient</SheetTitle>
                <SheetDescription>
                    Add a new raw material to your inventory.
                </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={newIngredient.name} onChange={e => setNewIngredient(p => ({...p, name: e.target.value}))} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stock" className="text-right">Current Stock</Label>
                    <Input id="stock" type="number" value={newIngredient.stock} onChange={e => setNewIngredient(p => ({...p, stock: e.target.value}))} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="min-stock" className="text-right">Min. Stock</Label>
                    <Input id="min-stock" type="number" value={newIngredient.minStock} onChange={e => setNewIngredient(p => ({...p, minStock: e.target.value}))} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit" className="text-right">Base Unit</Label>
                    <Input id="unit" placeholder="g, ml, pcs" value={newIngredient.unit} onChange={e => setNewIngredient(p => ({...p, unit: e.target.value}))} className="col-span-3" />
                </div>
                </div>
                <SheetFooter>
                <Button type="submit" onClick={handleAddNewIngredient}>Save Ingredient</Button>
                </SheetFooter>
            </SheetContent>
            </Sheet>
        </div>
        </CardHeader>
        <CardContent>
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Minimum Stock</TableHead>
                <TableHead className="w-[200px]">Stock Level</TableHead>
                <TableHead>Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {ingredients.map(item => {
                const stockPercentage =
                item.stock > 0 && item.minStock > 0
                    ? (item.stock / (item.minStock * 2)) * 100
                    : 0;
                const isLowStock = item.stock < item.minStock;
                return (
                <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                    {isLowStock ? (
                        <Badge variant="destructive">
                        {item.stock} {item.baseUnit}
                        </Badge>
                    ) : (
                        `${item.stock} ${item.baseUnit}`
                    )}
                    </TableCell>
                    <TableCell>
                    {item.minStock} {item.baseUnit}
                    </TableCell>
                    <TableCell>
                    <Progress
                        value={stockPercentage}
                        className={
                        isLowStock ? '[&>div]:bg-destructive' : ''
                        }
                    />
                    </TableCell>
                    <TableCell className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenAddStockDialog(item)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Stock
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setIngredientToDelete(item)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Remove
                    </Button>
                    </TableCell>
                </TableRow>
                );
            })}
            </TableBody>
        </Table>
        </CardContent>
    </Card>

    <Dialog open={!!stockUpdateIngredient} onOpenChange={() => setStockUpdateIngredient(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Stock for {stockUpdateIngredient?.name}</DialogTitle>
          <DialogDescription>
            Current stock: {stockUpdateIngredient?.stock} {stockUpdateIngredient?.baseUnit}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="stock-quantity">Quantity to Add ({stockUpdateIngredient?.baseUnit})</Label>
          <Input 
            id="stock-quantity"
            type="number"
            value={stockUpdateQuantity}
            onChange={(e) => setStockUpdateQuantity(e.target.value)}
            placeholder={`e.g., 500`}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setStockUpdateIngredient(null)}>Cancel</Button>
          <Button onClick={handleAddStock}>Add Stock</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={!!ingredientToDelete} onOpenChange={() => setIngredientToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove "{ingredientToDelete?.name}" from your inventory.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIngredientToDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteIngredient} className="bg-destructive hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
