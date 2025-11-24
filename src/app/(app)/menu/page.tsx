
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { PlusCircle, Edit, IndianRupee, Trash2, Save, Sparkles, Upload, Gift } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import type { MenuCategory, MenuItem, MenuItemVariation, MealDeal } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  MultiSelect,
  type MultiSelectOption,
} from '@/components/ui/multi-select';
import { BulkUploadDialog } from '@/components/menu/BulkUploadDialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAppContext } from '@/contexts/AppContext';
import { useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

const initialFormState: Partial<MenuItem> = {
  name: '',
  price: 0,
  category: '',
  description: '',
  variations: [],
  addons: [],
  isBogo: false,
  mealDeal: {
    upsellPrice: 0,
    sideItemIds: [],
    drinkItemIds: [],
  },
};


export default function MenuPage() {
  const { menuItems, menuCategories, ingredients, selectedOutlet } = useAppContext();
  const firestore = useFirestore();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  
  const [customizationItem, setCustomizationItem] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState<Partial<MenuItem>>(initialFormState);
  const [variations, setVariations] = useState<Partial<MenuItemVariation>[]>([{ name: 'Regular', priceModifier: 0, ingredients: [] }]);
  const [hasCustomization, setHasCustomization] = useState(false);
  const [isMealDeal, setIsMealDeal] = useState(false);
  
  const { toast } = useToast();

  const handleInputChange = (field: keyof MenuItem, value: string | number | boolean | MealDeal | undefined) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() !== '' && selectedOutlet) {
      const newCategory: Omit<MenuCategory, 'id'> = {
        name: newCategoryName.trim(),
      };
      addDocumentNonBlocking(collection(firestore, `outlets/${selectedOutlet.id}/menu_categories`), newCategory);
      setNewCategoryName('');
      // We don't toast here anymore, optimistic UI updates handle feedback.
      // The useCollection hook will update the categories list automatically.
    }
  };
  
  const openEditForm = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
    const itemVariations = item.variations && item.variations.length > 0 ? item.variations : [{ name: 'Regular', priceModifier: 0, ingredients: [] }];
    setVariations(itemVariations);
    setHasCustomization(!!item.variations && item.variations.length > 0);
    setIsMealDeal(!!item.mealDeal);
    setIsFormOpen(true);
  };
  
  const openNewForm = () => {
    setEditingItem(null);
    setFormData(initialFormState);
    setVariations([{ name: 'Regular', priceModifier: 0, ingredients: [] }]);
    setHasCustomization(false);
    setIsMealDeal(false);
    setIsFormOpen(true);
  };

  const handleAddVariation = () => {
    setVariations([...variations, { name: '', priceModifier: 0, ingredients: [] }]);
  };
  
  const handleRemoveVariation = (index: number) => {
    const newVariations = variations.filter((_, i) => i !== index);
    setVariations(newVariations);
  };
  
  const handleVariationChange = (index: number, field: keyof Omit<MenuItemVariation, 'id'>, value: string | number) => {
    const newVariations = [...variations];
    const variation: Partial<MenuItemVariation> = { ...newVariations[index] };
     if (field === 'priceModifier') {
      variation[field] = Number(value);
    } else if (field === 'name') {
      variation[field] = value as string;
    }
    newVariations[index] = variation;
    setVariations(newVariations);
  };

  const handleVariationIngredientChange = (vIndex: number, iIndex: number, field: 'ingredientId' | 'quantity', value: string | number) => {
    const newVariations = [...variations];
    const variation = { ...newVariations[vIndex] };
    const newIngredients = [...(variation.ingredients || [])];
    if (field === 'quantity') {
      newIngredients[iIndex] = { ...newIngredients[iIndex], quantity: Number(value) };
    } else {
      newIngredients[iIndex] = { ...newIngredients[iIndex], ingredientId: String(value) };
    }
    variation.ingredients = newIngredients;
    newVariations[vIndex] = variation;
  }

  const addIngredientToVariation = (vIndex: number) => {
    const newVariations = [...variations];
    const variation = { ...newVariations[vIndex] };
    const newIngredients = [...(variation.ingredients || []), { ingredientId: '', quantity: 0 }];
    variation.ingredients = newIngredients;
    newVariations[vIndex] = variation;
  }

  const removeIngredientFromVariation = (vIndex: number, iIndex: number) => {
    const newVariations = [...variations];
    const variation = { ...newVariations[vIndex] };
    const newIngredients = [...(variation.ingredients || [])];
    newIngredients.splice(iIndex, 1);
    variation.ingredients = newIngredients;
  }

  const getIngredientUnit = (id: string) => {
    return ingredients.find(i => i.id === id)?.baseUnit || '';
  };
  
  const handleSaveItem = () => {
    if (!selectedOutlet) {
      toast({ variant: "destructive", title: "Error", description: "No outlet selected." });
      return;
    }

    const basePrice = formData.price;
    if (!formData.name || !formData.category || (basePrice === undefined && !hasCustomization) ) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out the name, price, and category.",
      });
      return;
    }

    const finalVariations = variations.map((v, i) => ({
      id: v.id || `${editingItem?.id || 'new'}-var-${i}`,
      name: v.name || '',
      priceModifier: v.priceModifier || 0,
      ingredients: v.ingredients || []
    }));
    
    let mealDealConfig: MealDeal | null = null;
    if (isMealDeal) {
      if (!formData.mealDeal?.upsellPrice || formData.mealDeal.upsellPrice <= 0) {
         toast({
          variant: "destructive",
          title: "Invalid Meal Deal",
          description: "Please set a valid upsell price for the meal deal.",
        });
        return;
      }
      mealDealConfig = formData.mealDeal;
    }
    
    // If there are customizations, the base price is 0. The price is determined by the variation.
    const finalPrice = hasCustomization ? 0 : Number(basePrice);

    const collectionRef = collection(firestore, `outlets/${selectedOutlet.id}/menu_items`);

    if (editingItem) {
      // Update existing item
      const updatedItem: Partial<MenuItem> = { 
        ...formData,
        price: finalPrice,
        variations: hasCustomization ? finalVariations : [],
        mealDeal: mealDealConfig || undefined,
      };
      const itemRef = doc(collectionRef, editingItem.id);
      setDocumentNonBlocking(itemRef, updatedItem, { merge: true });
      toast({ title: "Item Updated", description: `${formData.name} has been updated.` });
    } else {
      // Create new item
      const newItem: Omit<MenuItem, 'id'> = {
        isAvailable: true,
        ingredients: [],
        ...formData,
        price: finalPrice,
        variations: hasCustomization ? finalVariations : [],
        mealDeal: mealDealConfig,
      } as Omit<MenuItem, 'id'>;
      addDocumentNonBlocking(collectionRef, newItem);
      toast({ title: "Item Created", description: `${formData.name} has been added to the menu.` });
    }
    
    setIsFormOpen(false);
  };

  const toggleItemAvailability = (itemId: string, isAvailable: boolean) => {
    if (!selectedOutlet) return;
    const itemRef = doc(firestore, `outlets/${selectedOutlet.id}/menu_items`, itemId);
    setDocumentNonBlocking(itemRef, { isAvailable }, { merge: true });

    const itemName = menuItems.find(item => item.id === itemId)?.name;
    toast({
        title: `Item ${isAvailable ? 'Available' : 'Unavailable'}`,
        description: `${itemName} has been marked as ${isAvailable ? 'available' : 'unavailable'}.`
    });
  };

  const handleDeleteItem = () => {
    if (!itemToDelete || !selectedOutlet) return;
    const itemRef = doc(firestore, `outlets/${selectedOutlet.id}/menu_items`, itemToDelete.id);
    deleteDocumentNonBlocking(itemRef);
    toast({
      variant: "destructive",
      title: "Item Removed",
      description: `${itemToDelete.name} has been removed from the menu.`,
    });
    setItemToDelete(null);
  }

  const handleBulkUploadSuccess = (newItems: Omit<MenuItem, 'id' | 'isAvailable' | 'ingredients'>[]) => {
    if (!selectedOutlet) return;
    const collectionRef = collection(firestore, `outlets/${selectedOutlet.id}/menu_items`);

    newItems.forEach(item => {
      let category = menuCategories.find(c => c.name.toLowerCase() === item.category.toLowerCase());
      if (!category) {
        // This won't work as intended without a batch write and getting the ID back.
        // For simplicity, we assume categories exist or we just use the string. A real app would handle this more robustly.
        console.warn(`Category "${item.category}" not found. Item will be added but may not categorize correctly without manual creation.`);
      }

      const newItemData: Omit<MenuItem, 'id'> = {
        ...item,
        isAvailable: true,
        ingredients: [],
        category: category?.id || item.category, // Fallback to name if ID not found
      };
      addDocumentNonBlocking(collectionRef, newItemData);
    });

    toast({
      title: "Menu Import Started",
      description: `${newItems.length} items are being added to your menu.`,
    });
  };

  const menuItemOptions: MultiSelectOption[] = useMemo(() => {
    return menuItems
      .filter((item) => item.id !== formData.id)
      .map(item => ({ value: item.id, label: item.name }));
  }, [menuItems, formData.id]);


  useEffect(() => {
    if (isFormOpen && editingItem) {
      const itemVariations = editingItem.variations && editingItem.variations.length > 0 ? editingItem.variations : [{ name: 'Regular', priceModifier: 0, ingredients: [] }];
      setVariations(itemVariations);
      setHasCustomization(!!editingItem.variations && editingItem.variations.length > 0);
      setIsMealDeal(!!editingItem.mealDeal);
    }
  }, [isFormOpen, editingItem]);


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Menu Management</CardTitle>
              <CardDescription>
                Create, edit, and manage your cafe's menu items.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
                <Upload className="mr-2 h-4 w-4" /> Bulk Upload Menu
              </Button>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openNewForm}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit' : 'Add New'} Menu Item</DialogTitle>
                    <DialogDescription>
                      Fill in the details for the menu item.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input id="name" value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} className="col-span-3" />
                    </div>

                    {!hasCustomization && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">Base Price</Label>
                        <div className="col-span-3 relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="price" type="number" value={formData.price || ''} onChange={e => handleInputChange('price', Number(e.target.value))} className="pl-10" />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">Category</Label>
                      <div className="col-span-3 flex items-center gap-2">
                        <Select value={formData.category || ''} onValueChange={value => handleInputChange('category', value)}>
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
                      <Textarea id="description" className="col-span-3" placeholder="Item description..." value={formData.description || ''} onChange={e => handleInputChange('description', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="is-bogo-toggle" className="text-right">Is BOGO Item?</Label>
                      <div className="col-span-3">
                        <Switch id="is-bogo-toggle" checked={formData.isBogo} onCheckedChange={(checked) => handleInputChange('isBogo', checked)} />
                      </div>
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
                              {variations.map((variation, vIndex) => (
                                <Card key={vIndex} className="p-4 bg-muted/50">
                                    <div className="flex items-end gap-4 mb-4">
                                      <div className="flex-1 space-y-2">
                                        <Label>Variation Name</Label>
                                        <Input placeholder="e.g., Large" value={variation.name || ''} onChange={e => handleVariationChange(vIndex, 'name', e.target.value)} />
                                      </div>
                                      <div className="flex-1 space-y-2">
                                        <Label>Price (₹)</Label>
                                        <Input type="number" placeholder="e.g., 20" value={variation.priceModifier || ''} onChange={e => handleVariationChange(vIndex, 'priceModifier', e.target.value)} />
                                      </div>
                                      <div>
                                        <Button variant="destructive" size="icon" onClick={() => handleRemoveVariation(vIndex)}>
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Remove</span>
                                        </Button>
                                      </div>
                                    </div>
                                    <h5 className="text-sm font-medium mb-2">Recipe for {variation.name || 'this variation'} (in base units)</h5>
                                    <div className="p-2 border rounded-md text-center text-muted-foreground text-sm bg-background">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Ingredient</TableHead>
                                            <TableHead className='w-[120px]'>Quantity</TableHead>
                                            <TableHead className="w-[50px] text-right"></TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {(variation.ingredients || []).map((ing, iIndex) => (
                                            <TableRow key={iIndex}>
                                              <TableCell>
                                                <Select value={ing.ingredientId} onValueChange={value => handleVariationIngredientChange(vIndex, iIndex, 'ingredientId', value)}>
                                                  <SelectTrigger><SelectValue placeholder="Select ingredient" /></SelectTrigger>
                                                  <SelectContent>
                                                    {ingredients.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                                                  </SelectContent>
                                                </Select>
                                              </TableCell>
                                              <TableCell>
                                                <div className="flex items-center gap-2">
                                                  <Input type="number" value={ing.quantity} onChange={e => handleVariationIngredientChange(vIndex, iIndex, 'quantity', e.target.value)} className="w-20"/>
                                                  <span>{getIngredientUnit(ing.ingredientId)}</span>
                                                </div>
                                              </TableCell>
                                              <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => removeIngredientFromVariation(vIndex, iIndex)}>
                                                  <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                      <Button size="sm" variant="outline" className="mt-2" onClick={() => addIngredientToVariation(vIndex)}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Ingredient
                                      </Button>
                                    </div>
                                </Card>
                              ))}
                              <Button variant="outline" onClick={handleAddVariation}><PlusCircle className="mr-2 h-4 w-4" /> Add Variation</Button>
                          </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-4 items-center gap-4 border-t pt-4">
                      <div className="text-right flex flex-col items-end">
                          <Label htmlFor="meal-deal-toggle">Meal Deal</Label>
                          <p className="text-xs text-muted-foreground">This item can be upsold as a meal.</p>
                      </div>
                      <div className="col-span-3">
                        <Switch id="meal-deal-toggle" checked={isMealDeal} onCheckedChange={setIsMealDeal} />
                      </div>
                    </div>
                    
                    {isMealDeal && (
                      <div className="col-span-4 space-y-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="upsell-price" className="text-right">Upsell Price</Label>
                          <div className="col-span-3 relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="upsell-price"
                              type="number"
                              className="pl-10"
                              placeholder="e.g., 99"
                              value={formData.mealDeal?.upsellPrice || ''}
                              onChange={e => handleInputChange('mealDeal', { ...(formData.mealDeal!), upsellPrice: Number(e.target.value) })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="side-items" className="text-right pt-2">Side Items</Label>
                            <div className="col-span-3">
                                <MultiSelect
                                    options={menuItemOptions}
                                    value={formData.mealDeal?.sideItemIds || []}
                                    onValueChange={(v) => handleInputChange('mealDeal', { ...(formData.mealDeal!), sideItemIds: v })}
                                    placeholder="Select items for sides"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="drink-items" className="text-right pt-2">Drink Items</Label>
                            <div className="col-span-3">
                                <MultiSelect
                                    options={menuItemOptions}
                                    value={formData.mealDeal?.drinkItemIds || []}
                                    onValueChange={(v) => handleInputChange('mealDeal', { ...(formData.mealDeal!), drinkItemIds: v })}
                                    placeholder="Select items for drinks"
                                />
                            </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSaveItem}><Save className="mr-2 h-4 w-4" /> {editingItem ? 'Save Changes' : 'Save Item'}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map(item => {
                const displayPrice = item.variations && item.variations.length > 0 
                    ? item.variations[0].priceModifier 
                    : item.price;
                return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                      {item.name}
                      {item.isBogo && <Badge variant="outline" className="text-green-600 border-green-500"><Gift className="h-3 w-3 mr-1"/>BOGO</Badge>}
                      {item.mealDeal && <Badge variant="outline" className="text-amber-600 border-amber-500"><Sparkles className="h-3 w-3 mr-1"/>Meal</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {menuCategories.find(c => c.id === item.category)?.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {displayPrice.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch checked={item.isAvailable} onCheckedChange={(checked) => toggleItemAvailability(item.id, checked)} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openEditForm(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => setItemToDelete(item)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{item.name}" from the menu. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </CardContent>
        <BulkUploadDialog
          isOpen={isBulkUploadOpen}
          onClose={() => setIsBulkUploadOpen(false)}
          onSuccess={handleBulkUploadSuccess}
        />
      </Card>
      
      <Dialog open={!!customizationItem} onOpenChange={() => setCustomizationItem(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Customize {customizationItem?.name}</DialogTitle>
            </DialogHeader>
            {customizationItem && <CustomizationForm item={customizationItem} onClose={() => setCustomizationItem(null)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}


function CustomizationForm({ item, onClose }: { item: MenuItem, onClose: () => void }) {
  const [selectedVariation, setSelectedVariation] = useState<string>(item.variations?.[0]?.id || '');
  const [notes, setNotes] = useState('');
  
  // This would come from a global context in a real app
  const addToCart = (customizedItem: any) => {
    console.log("Adding to cart:", customizedItem);
    // In a real app, you'd call a context function here
    // e.g., cart.addItem(customizedItem);
    onClose();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const variationDetails = item.variations?.find(v => v.id === selectedVariation);
    
    addToCart({
      ...item,
      selectedVariation: variationDetails,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {item.variations && item.variations.length > 0 && (
        <div>
          <Label className="font-medium">Select Variation</Label>
          <RadioGroup 
            name="variation" 
            defaultValue={item.variations[0].id}
            value={selectedVariation}
            onValueChange={setSelectedVariation}
            className="mt-2 space-y-2"
          >
            {item.variations.map(v => (
              <div key={v.id} className="flex items-center space-x-2">
                <RadioGroupItem value={v.id} id={v.id} />
                <Label htmlFor={v.id} className="flex justify-between w-full">
                  <span>{v.name}</span>
                  <span className='text-muted-foreground'>(<IndianRupee className="h-3.5 w-3.5 inline-block" />{v.priceModifier.toFixed(2)})</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}
      <div>
        <Label className="font-medium">Special Notes</Label>
        <Textarea 
          name="notes" 
          placeholder="e.g. Extra spicy, no onions..." 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <DialogFooter>
        <Button type="submit" className="w-full">Add to Order</Button>
      </DialogFooter>
    </form>
  );
}

