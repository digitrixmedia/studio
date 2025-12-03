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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Save, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import type { MenuItem } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';

import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function InventoryRecipesPage() {
  const { ingredients, menuItems, selectedOutlet } = useAppContext();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [editableRecipes, setEditableRecipes] = useState<
    Record<string, { ingredientId: string; quantity: number }[]>
  >({});

  const handleEditRecipe = (item: MenuItem) => {
    setEditableRecipes(prev => ({ ...prev, [item.id]: [...(item.ingredients || [])] }));
  };

  const handleSaveRecipe = async (itemId: string) => {
    const recipe = editableRecipes[itemId];
    if (!recipe) return;

    try {
      await updateDoc(
        doc(firestore, `outlets/${selectedOutlet?.id}/menu_items/${itemId}`),
        { ingredients: recipe }
      );

      toast({ title: 'Recipe updated!', description: 'Stock deduction now enabled.' });
      console.log('Recipe saved:', recipe);
    } catch (err) {
      console.error('Error saving recipe: ', err);
      toast({
        variant: 'destructive',
        title: 'Failed to save recipe',
        description: 'Check Firestore rules & network.'
      });
    }

    const { [itemId]: _, ...rest } = editableRecipes;
    setEditableRecipes(rest);
  };

  const handleCancelEdit = (itemId: string) => {
    const { [itemId]: _, ...rest } = editableRecipes;
    setEditableRecipes(rest);
  };

  const handleIngredientChange = (
    itemId: string,
    index: number,
    field: 'ingredientId' | 'quantity',
    value: string | number
  ) => {
    const updated = [...editableRecipes[itemId]];
    updated[index] = { ...updated[index], [field]: field === 'quantity' ? Number(value) : String(value) };
    setEditableRecipes(prev => ({ ...prev, [itemId]: updated }));
  };

  const addIngredientToRecipe = (itemId: string) => {
    const updated = [...editableRecipes[itemId], { ingredientId: '', quantity: 0 }];
    setEditableRecipes(prev => ({ ...prev, [itemId]: updated }));
  };

  const removeIngredientFromRecipe = (itemId: string, index: number) => {
    const updated = editableRecipes[itemId].filter((_, i) => i !== index);
    setEditableRecipes(prev => ({ ...prev, [itemId]: updated }));
  };

  const getIngredientName = (id: string) =>
    ingredients.find(i => i.id === id)?.name || 'Unknown';

  const getIngredientUnit = (id: string) =>
    ingredients.find(i => i.id === id)?.baseUnit || '';

  return (
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
            const recipe = isEditing ? editableRecipes[item.id] : item.ingredients || [];

            return (
              <AccordionItem key={item.id} value={item.id}>
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
                        <Button size="sm" variant="outline" onClick={() => handleCancelEdit(item.id)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleEditRecipe(item)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Recipe
                      </Button>
                    )}
                  </div>

                  {recipe.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ingredient</TableHead>
                          <TableHead className="w-[150px]">Quantity</TableHead>
                          {isEditing && (
                            <TableHead className="w-[50px] text-right">Actions</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recipe.map((ing, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {isEditing ? (
                                <Select
                                  value={ing.ingredientId}
                                  onValueChange={v =>
                                    handleIngredientChange(item.id, index, 'ingredientId', v)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select ingredient" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ingredients.map(i => (
                                      <SelectItem key={i.id} value={i.id}>
                                        {i.name}
                                      </SelectItem>
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
                                    className="w-24"
                                    value={ing.quantity}
                                    onChange={e =>
                                      handleIngredientChange(item.id, index, 'quantity', e.target.value)
                                    }
                                  />
                                ) : (
                                  <span>{ing.quantity}</span>
                                )}

                                <span>{getIngredientUnit(ing.ingredientId)}</span>
                              </div>
                            </TableCell>

                            {isEditing && (
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeIngredientFromRecipe(item.id, index)}
                                >
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
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
