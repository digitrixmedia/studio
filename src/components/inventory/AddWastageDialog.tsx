
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, PlusCircle, Save, Trash2 } from 'lucide-react';
import { ingredients as initialIngredients, menuItems as initialMenuItems, users } from '@/lib/data';
import type { Ingredient, MenuItem, Wastage, WastageItem } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/contexts/AppContext';

interface AddWastageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wastage: Wastage) => void;
}

const initialWastageItemState: Omit<WastageItem, 'id'> = {
  itemId: '',
  name: '',
  quantity: 1,
  unit: '',
  purchasePrice: 0,
  amount: 0,
  description: '',
};

export function AddWastageDialog({ isOpen, onClose, onSave }: AddWastageDialogProps) {
  const { toast } = useToast();
  const { currentUser } = useAppContext();
  
  const [date, setDate] = useState<Date>(new Date());
  const [wastageFor, setWastageFor] = useState<'Raw Material' | 'Item'>('Raw Material');
  const [wastageItems, setWastageItems] = useState<Omit<WastageItem, 'id'>[]>([]);
  const [reason, setReason] = useState('');
  
  const [ingredients] = useState<Ingredient[]>(initialIngredients);
  const [menuItems] = useState<MenuItem[]>(initialMenuItems);

  const handleItemChange = (index: number, field: keyof Omit<WastageItem, 'id'>, value: string | number) => {
    setWastageItems(prevItems => {
        const updatedItems = [...prevItems];
        const currentItem = { ...updatedItems[index] };

        const numericValue = typeof value === 'string' && !['itemId', 'description', 'name', 'unit'].includes(field) ? parseFloat(value) || 0 : value;
        
        // Use a type assertion to handle the flexible key
        (currentItem as any)[field] = numericValue;
        
        if (field === 'itemId') {
            const selectedSourceItem = wastageFor === 'Raw Material'
                ? ingredients.find(i => i.id === value)
                : menuItems.find(i => i.id === value);
            
            if (selectedSourceItem) {
                currentItem.unit = 'unit' in selectedSourceItem ? selectedSourceItem.unit : 'pcs';
                currentItem.name = selectedSourceItem.name;
                // A real app would fetch avg. purchase price. Here we use item price for menu items.
                currentItem.purchasePrice = 'price' in selectedSourceItem ? selectedSourceItem.price : 0; 
            }
        }
        
        // Always recalculate amount
        currentItem.amount = (currentItem.quantity || 0) * (currentItem.purchasePrice || 0);

        updatedItems[index] = currentItem;
        return updatedItems;
    });
  };
  
  useEffect(() => {
    // Reset items when wastage type changes
    setWastageItems([initialWastageItemState]);
  }, [wastageFor]);
  
  useEffect(() => {
    if (isOpen) {
      // When dialog opens, initialize with one item
      setWastageItems([initialWastageItemState]);
    } else {
        // Reset state when dialog closes
        setDate(new Date());
        setWastageFor('Raw Material');
        setWastageItems([]);
        setReason('');
    }
  }, [isOpen]);

  const addNewWastageItem = () => {
    setWastageItems(prev => [...prev, { ...initialWastageItemState }]);
  };

  const removeWastageItem = (index: number) => {
    setWastageItems(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSave = () => {
     if (wastageItems.some(i => !i.itemId || (i.quantity || 0) <= 0)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Items',
        description: 'Please select a material/item and enter a valid quantity for all rows.',
      });
      return;
    }
    
    const totalAmount = wastageItems.reduce((sum, item) => sum + (item.amount || 0), 0);

    const newWastageEntry: Wastage = {
      id: `wastage-${Date.now()}`,
      wastageNumber: `WT-${Date.now().toString().slice(-4)}`,
      date,
      wastageFor,
      items: wastageItems.map((item, index) => ({ ...item, id: `wi-${Date.now()}-${index}` } as WastageItem)),
      totalAmount,
      userId: currentUser?.id || 'user-unknown',
      reason,
    };

    onSave(newWastageEntry);

    toast({
      title: 'Wastage Entry Saved',
      description: 'The wastage has been recorded and stock levels updated.',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
            <DialogTitle>Add New Wastage Entry</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                <Card>
                    <CardHeader>
                    <CardTitle>Wastage Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label>Date *</Label>
                        <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant="outline"
                            className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={date} onSelect={(d) => setDate(d || new Date())} initialFocus />
                        </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label>Wastage For *</Label>
                        <RadioGroup
                        value={wastageFor}
                        onValueChange={(val) => setWastageFor(val as any)}
                        className="flex items-center space-x-4 pt-2"
                        >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Raw Material" id="raw-material" />
                            <Label htmlFor="raw-material">Raw Material</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Item" id="item" />
                            <Label htmlFor="item">Item</Label>
                        </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label>Reason</Label>
                        <Textarea placeholder="Reason for wastage..." value={reason} onChange={e => setReason(e.target.value)} />
                    </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <div className='flex justify-between items-center'>
                            <CardTitle>Wastage Item Details *</CardTitle>
                            <Button variant="outline" onClick={addNewWastageItem}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add New
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='w-[250px]'>{wastageFor}</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Avg. Purchase Price</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {wastageItems.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Select value={item.itemId} onValueChange={val => handleItemChange(index, 'itemId', val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={`Select ${wastageFor}`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(wastageFor === 'Raw Material' ? ingredients : menuItems).map(i => (
                                                        <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell><Input type="number" value={item.quantity || ''} onChange={e => handleItemChange(index, 'quantity', e.target.value)} placeholder="Quantity" /></TableCell>
                                        <TableCell><Input value={item.unit || ''} readOnly className="border-none bg-transparent" placeholder="Unit" /></TableCell>
                                        <TableCell><Input type="number" value={item.purchasePrice || ''} onChange={e => handleItemChange(index, 'purchasePrice', e.target.value)} placeholder="Avg. Price" /></TableCell>
                                        <TableCell><Input value={(item.amount || 0).toFixed(2)} readOnly className="border-none bg-transparent" /></TableCell>
                                        <TableCell><Input value={item.description || ''} onChange={e => handleItemChange(index, 'description', e.target.value)} placeholder="Description" /></TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => removeWastageItem(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
            <DialogFooter className="border-t pt-4">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Save
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
