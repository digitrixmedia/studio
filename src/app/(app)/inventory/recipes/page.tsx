
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
import { ingredients, menuItems } from '@/lib/data';
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


export default function InventoryRecipesPage() {
  const [editableRecipes, setEditableRecipes] = useState<Record<string, { ingredientId: string; quantity: number }[]>>({});

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
  );
}
