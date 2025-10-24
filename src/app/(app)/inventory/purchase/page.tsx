
'use client';

import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { purchaseOrders as initialPOs, vendors, ingredients } from '@/lib/data';
import type { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus, Vendor } from '@/lib/types';
import { PlusCircle, IndianRupee, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const initialNewPOState = {
  vendorId: '',
  items: [{ ingredientId: '', quantity: 1, unitPrice: 0 }],
};

export default function PurchaseManagementPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPOs);
  const [isNewPOOpen, setIsNewPOOpen] = useState(false);
  const [newPOData, setNewPOData] = useState(initialNewPOState);
  const { toast } = useToast();

  const getVendorName = (vendorId: string) => {
    return vendors.find(v => v.id === vendorId)?.name || 'Unknown Vendor';
  };

  const handleItemChange = (index: number, field: 'ingredientId' | 'quantity' | 'unitPrice', value: string | number) => {
    const updatedItems = [...newPOData.items];
    const currentItem = { ...updatedItems[index] };

    if (field === 'ingredientId') {
      currentItem.ingredientId = String(value);
    } else {
      currentItem[field] = Number(value);
    }

    updatedItems[index] = currentItem;
    setNewPOData(prev => ({ ...prev, items: updatedItems }));
  };
  
  const addNewItem = () => {
    setNewPOData(prev => ({ ...prev, items: [...prev.items, { ingredientId: '', quantity: 1, unitPrice: 0 }] }));
  };

  const removeItem = (index: number) => {
    setNewPOData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };
  
  const handleCreatePO = () => {
    if (!newPOData.vendorId || newPOData.items.some(i => !i.ingredientId || i.quantity <= 0)) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please select a vendor and ensure all items have an ingredient and quantity.",
        });
        return;
    }

    const finalItems: PurchaseOrderItem[] = newPOData.items.map((item, index) => ({
        id: `poi-${Date.now()}-${index}`,
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
    }));

    const totalAmount = finalItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const poNumber = `PO-2024-${String(purchaseOrders.length + 1).padStart(3, '0')}`;

    const newPO: PurchaseOrder = {
        id: `po-${Date.now()}`,
        poNumber,
        vendorId: newPOData.vendorId,
        date: new Date(),
        items: finalItems,
        totalAmount,
        status: 'pending',
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    toast({
        title: "Purchase Order Created",
        description: `${poNumber} has been created for ${getVendorName(newPO.vendorId)}.`,
    });

    setIsNewPOOpen(false);
    setNewPOData(initialNewPOState);
  };

  const getIngredientName = (id: string) => ingredients.find(i => i.id === id)?.name || 'N/A';
  const getIngredientUnit = (id: string) => ingredients.find(i => i.id === id)?.unit || '';

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Purchase Management</CardTitle>
              <CardDescription>
                Track purchase orders, vendors, and incoming stock.
              </CardDescription>
            </div>
            <Button onClick={() => setIsNewPOOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> New Purchase Order
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.map(po => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.poNumber}</TableCell>
                  <TableCell>{getVendorName(po.vendorId)}</TableCell>
                  <TableCell>{format(po.date, 'PPP')}</TableCell>
                  <TableCell>
                    <Badge variant={po.status === 'completed' ? 'default' : (po.status === 'pending' ? 'secondary' : 'destructive')}>
                      {po.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {po.totalAmount.toLocaleString('en-IN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Purchase Order Dialog */}
      <Dialog open={isNewPOOpen} onOpenChange={setIsNewPOOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Select value={newPOData.vendorId} onValueChange={(value) => setNewPOData(prev => ({...prev, vendorId: value}))}>
                    <SelectTrigger id="vendor">
                        <SelectValue placeholder="Select a vendor" />
                    </SelectTrigger>
                    <SelectContent>
                        {vendors.map(vendor => (
                            <SelectItem key={vendor.id} value={vendor.id}>{vendor.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <h4 className="font-semibold">Items</h4>
            <div className="space-y-2">
                {newPOData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 border rounded-md">
                        <div className="col-span-5">
                             <Label className="text-xs">Ingredient</Label>
                            <Select value={item.ingredientId} onValueChange={(val) => handleItemChange(index, 'ingredientId', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Ingredient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ingredients.map(ing => (
                                        <SelectItem key={ing.id} value={ing.id}>{ing.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-3">
                             <Label className="text-xs">Quantity</Label>
                             <div className="flex items-center gap-1">
                                <Input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                                <span className="text-xs text-muted-foreground">{getIngredientUnit(item.ingredientId)}</span>
                             </div>
                        </div>
                        <div className="col-span-3">
                            <Label className="text-xs">Unit Price (₹)</Label>
                            <Input type="number" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} />
                        </div>
                        <div className="col-span-1 flex items-end">
                            <Button variant="destructive" size="icon" onClick={() => removeItem(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
             <Button variant="outline" size="sm" onClick={addNewItem}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPOOpen(false)}>Cancel</Button>
            <Button onClick={handleCreatePO}>Create PO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
