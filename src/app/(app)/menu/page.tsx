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
import { Switch } from '@/components/ui/switch';
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
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { menuItems, menuCategories as initialMenuCategories, ingredients } from '@/lib/data';
import { PlusCircle, Edit, IndianRupee, Trash2, Save } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import type { MenuCategory, MenuItemVariation } from '@/lib/types';


// This would typically be a client component to handle state, but for display purposes, we can keep it simple.
// For a real app, state for sheet open/close and editing item would be managed with useState.

export default function MenuPage() {
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(initialMenuCategories);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [hasCustomization, setHasCustomization] = useState(false);
  const [variations, setVariations] = useState<Partial<MenuItemVariation>[]>([{ name: 'Regular', priceModifier: 0, ingredients: [] }]);

  const handleAddCategory = () => {
    if (newCategoryName.trim() !== '') {
      const newCategory: MenuCategory = {
        id: `cat-${Date.now()}`,
        name: newCategoryName.trim(),
      };
      setMenuCategories([...menuCategories, newCategory]);
      setNewCategoryName('');
    }
  };

  const handleAddVariation = () => {
    setVariations([...variations, { name: '', priceModifier: 0, ingredients: [] }]);
  };
  
  const handleRemoveVariation = (index: number) => {
    const newVariations = variations.filter((_, i) => i !== index);
    setVariations(newVariations);
  };
  
  const handleVariationChange = (index: number, field: keyof MenuItemVariation, value: string | number) => {
    const newVariations = [...variations];
    const variation = { ...newVariations[index] };
    if (field === 'priceModifier') {
      variation[field] = Number(value);
    } else {
      variation[field] = value as string;
    }
    newVariations[index] = variation;
    setVariations(newVariations);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Menu Management</CardTitle>
            <CardDescription>
              Create, edit, and manage your cafe's menu items.
            </CardDescription>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[640px] max-h-screen overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Add New Menu Item</SheetTitle>
                <SheetDescription>
                  Fill in the details for the new menu item.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" defaultValue="Cafe Latte" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Price</Label>
                   <div className="col-span-3 relative">
                     <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input id="price" type="number" defaultValue="160" className="pl-10" />
                   </div>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category</Label>
                   <div className="col-span-3 flex items-center gap-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {menuCategories.map(cat => (
                           <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                     <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="outline" size="icon"><PlusCircle className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Category</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <Label htmlFor="new-category-name">Category Name</Label>
                            <Input 
                              id="new-category-name" 
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                          </div>
                          <DialogFooter>
                             <DialogClose asChild>
                              <Button onClick={handleAddCategory}>Add Category</Button>
                             </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                     </Dialog>
                   </div>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Textarea id="description" className="col-span-3" placeholder="Item description..."/>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="customization-toggle" className="text-right">Customization</Label>
                   <div className="col-span-3">
                     <Switch id="customization-toggle" checked={hasCustomization} onCheckedChange={setHasCustomization} />
                   </div>
                </div>

                {hasCustomization && (
                   <div className="col-span-4 border-t pt-4">
                      <h4 className="text-md font-semibold mb-2">Item Variations</h4>
                      <div className="space-y-4">
                          {variations.map((variation, index) => (
                             <Card key={index} className="p-4 bg-muted/50">
                                <div className="flex items-end gap-4 mb-4">
                                  <div className="flex-1 space-y-2">
                                    <Label>Variation Name</Label>
                                    <Input placeholder="e.g., Large" value={variation.name} onChange={e => handleVariationChange(index, 'name', e.target.value)} />
                                  </div>
                                   <div className="flex-1 space-y-2">
                                    <Label>Price Modifier (₹)</Label>
                                    <Input type="number" placeholder="e.g., 20" value={variation.priceModifier} onChange={e => handleVariationChange(index, 'priceModifier', e.target.value)} />
                                  </div>
                                  <div>
                                    <Button variant="destructive" size="icon" onClick={() => handleRemoveVariation(index)}>
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Remove</span>
                                    </Button>
                                  </div>
                                </div>
                                <h5 className="text-sm font-medium mb-2">Recipe for {variation.name || 'this variation'}</h5>
                                {/* Placeholder for recipe mapping per variation */}
                                <div className="p-2 border rounded-md text-center text-muted-foreground text-sm bg-background">
                                  Ingredient mapping for this variation will be here.
                                </div>
                             </Card>
                          ))}
                           <Button variant="outline" onClick={handleAddVariation}><PlusCircle className="mr-2 h-4 w-4" /> Add Variation</Button>
                      </div>
                   </div>
                )}
              </div>
              <SheetFooter>
                <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save Item</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.map(item => (
              <TableRow key={item.id}>
                <TableCell>
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="rounded-md object-cover"
                    data-ai-hint={item.imageHint}
                  />
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {menuCategories.find(c => c.id === item.category)?.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {item.price.toFixed(2)}
                  </div>
                </TableCell>
                <TableCell>
                  <Switch checked={item.isAvailable} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
