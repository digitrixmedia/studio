
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ingredients as initialIngredients, menuItems } from '@/lib/data';
import { PlusCircle, Edit, Save, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import type { MenuItem, Ingredient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [editableRecipes, setEditableRecipes] = useState<Record<string, { ingredientId: string; quantity: number }[]>>({});
  const [stockUpdateIngredient, setStockUpdateIngredient] = useState<Ingredient | null>(null);
  const [stockUpdateQuantity, setStockUpdateQuantity] = useState('');
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);
  const { toast } = useToast();

  const handleEditRecipe = (item: MenuItem) => {
    setEditableRecipes(prev => ({ ...prev, [item.id]: [...item.ingredients] }));
  };

  const handleSaveRecipe = (itemId: string) => {
    // Here you would typically save the changes to your backend
    console.log('Saving recipe for', itemId, editableRecipes[itemId]);
    const { [itemId]: _, ...rest } = editableRecipes;
    setEditableRecipes(rest);
  };

  const handleCancelEdit = (itemId: string) => {
    const { [itemId]: _, ...rest } = editableRecipes;
    setEditableRecipes(rest);
  };
  
  const handleIngredientChange = (itemId: string, index: number, field: 'ingredientId' | 'quantity', value: string | number) => {
    const updatedIngredients = [...editableRecipes[itemId]];
    if (field === 'quantity') {
      updatedIngredients[index] = { ...updatedIngredients[index], quantity: Number(value) };
    } else {
      updatedIngredients[index] = { ...updatedIngredients[index], ingredientId: String(value) };
    }
    setEditableRecipes(prev => ({ ...prev, [itemId]: updatedIngredients }));
  };

  const addIngredientToRecipe = (itemId: string) => {
     const updatedIngredients = [...editableRecipes[itemId], { ingredientId: '', quantity: 0 }];
     setEditableRecipes(prev => ({ ...prev, [itemId]: updatedIngredients }));
  }

  const removeIngredientFromRecipe = (itemId: string, index: number) => {
    const updatedIngredients = [...editableRecipes[itemId]];
    updatedIngredients.splice(index, 1);
    setEditableRecipes(prev => ({...prev, [itemId]: updatedIngredients}));
  }

  const getIngredientName = (id: string) => {
    return ingredients.find(i => i.id === id)?.name || 'Unknown';
  };
  
  const getIngredientUnit = (id: string) => {
    return ingredients.find(i => i.id === id)?.unit || '';
  };
  
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

    setIngredients(prevIngredients =>
        prevIngredients.map(ing =>
            ing.id === stockUpdateIngredient.id
                ? { ...ing, stock: ing.stock + quantityToAdd }
                : ing
        )
    );

    toast({
        title: "Stock Updated",
        description: `${quantityToAdd} ${stockUpdateIngredient.unit} added to ${stockUpdateIngredient.name}.`,
    });

    setStockUpdateIngredient(null);
  };

  const handleDeleteIngredient = () => {
    if (!ingredientToDelete) return;
    setIngredients(prev => prev.filter(ing => ing.id !== ingredientToDelete.id));
    toast({
        title: "Ingredient Removed",
        description: `${ingredientToDelete.name} has been removed from the inventory.`,
        variant: "destructive",
    });
    setIngredientToDelete(null);
  };

  return (
    <>
    <Tabs defaultValue="stock">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="stock">Stock Levels</TabsTrigger>
          <TabsTrigger value="recipes">Recipe Mapping</TabsTrigger>
        </TabsList>
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
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                  Current Stock
                </Label>
                <Input id="stock" type="number" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="min-stock" className="text-right">
                  Min. Stock
                </Label>
                <Input id="min-stock" type="number" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right">
                  Unit
                </Label>
                <Input
                  id="unit"
                  placeholder="g, ml, pcs"
                  className="col-span-3"
                />
              </div>
            </div>
            <SheetFooter>
              <Button type="submit">Save Ingredient</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      <TabsContent value="stock">
        <Card>
          <CardHeader>
            <CardTitle>Inventory & Stock Management</CardTitle>
            <CardDescription>
              Track stock of raw materials and get low stock alerts.
            </CardDescription>
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
                            {item.stock} {item.unit}
                          </Badge>
                        ) : (
                          `${item.stock} ${item.unit}`
                        )}
                      </TableCell>
                      <TableCell>
                        {item.minStock} {item.unit}
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
      </TabsContent>
      <TabsContent value="recipes">
        <Card>
          <CardHeader>
            <CardTitle>Recipe Mapping</CardTitle>
            <CardDescription>
              Link menu items to ingredients for automatic stock deduction.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Accordion type="single" collapsible className="w-full">
              {menuItems.map(item => {
                const isEditing = !!editableRecipes[item.id];
                const recipeIngredients = isEditing ? editableRecipes[item.id] : item.ingredients;

                return (
                  <AccordionItem value={item.id} key={item.id}>
                    <AccordionTrigger>{item.name}</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex justify-end mb-2">
                        {isEditing ? (
                          <div className="flex gap-2">
                             <Button size="sm" onClick={() => addIngredientToRecipe(item.id)}>
                              <PlusCircle className="mr-2 h-4 w-4" /> Add Ingredient
                            </Button>
                            <Button size="sm" onClick={() => handleSaveRecipe(item.id)}>
                              <Save className="mr-2 h-4 w-4" /> Save
                            </Button>
                             <Button size="sm" variant="outline" onClick={() => handleCancelEdit(item.id)}>Cancel</Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleEditRecipe(item)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Recipe
                          </Button>
                        )}
                      </div>
                      
                      {recipeIngredients.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ingredient</TableHead>
                              <TableHead className='w-[150px]'>Quantity</TableHead>
                               {isEditing && <TableHead className="w-[50px] text-right">Actions</TableHead>}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recipeIngredients.map((ing, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {isEditing ? (
                                     <Select
                                        value={ing.ingredientId}
                                        onValueChange={(value) => handleIngredientChange(item.id, index, 'ingredientId', value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select ingredient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {ingredients.map(i => (
                                            <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                  ) : (
                                    getIngredientName(ing.ingredientId)
                                  )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                     {isEditing ? (
                                         <Input 
                                            type="number"
                                            value={ing.quantity}
                                            onChange={(e) => handleIngredientChange(item.id, index, 'quantity', e.target.value)}
                                            className="w-24"
                                        />
                                     ) : (
                                        <span>{ing.quantity}</span>
                                     )}
                                     <span>{getIngredientUnit(ing.ingredientId)}</span>
                                    </div>
                                </TableCell>
                                {isEditing && (
                                  <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => removeIngredientFromRecipe(item.id, index)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-muted-foreground text-sm p-4 text-center">
                          No ingredients mapped for this item.
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

     {/* Add Stock Dialog */}
    <Dialog open={!!stockUpdateIngredient} onOpenChange={() => setStockUpdateIngredient(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Stock for {stockUpdateIngredient?.name}</DialogTitle>
          <DialogDescription>
            Current stock: {stockUpdateIngredient?.stock} {stockUpdateIngredient?.unit}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="stock-quantity">Quantity to Add ({stockUpdateIngredient?.unit})</Label>
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

    {/* Delete Ingredient Dialog */}
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
    

    