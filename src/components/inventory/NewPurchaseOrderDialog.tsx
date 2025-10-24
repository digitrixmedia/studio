
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { vendors as initialVendors, ingredients } from '@/lib/data';
import type { PurchaseOrder, PurchaseOrderItem, Vendor, Ingredient } from '@/lib/types';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface NewPurchaseOrderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newOrder: PurchaseOrder) => void;
    setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
}

const initialItemState: Omit<PurchaseOrderItem, 'id'> = {
    ingredientId: '',
    quantity: 1,
    unitPrice: 0,
    amount: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    description: '',
};

const initialNewVendorState = {
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    gstin: ''
};

interface OtherCharge {
    name: string;
    amount: number;
    cgst: number;
    sgst: number;
}

export function NewPurchaseOrderDialog({ isOpen, onClose, onSave, setIngredients }: NewPurchaseOrderDialogProps) {
    const [po, setPo] = useState<Omit<PurchaseOrder, 'id' | 'status'>>({
        poNumber: `PO-${Date.now()}`,
        vendorId: '',
        date: new Date(),
        items: [{...initialItemState, id: `item-${Date.now()}`}],
        subTotal: 0,
        totalDiscount: 0,
        otherCharges: 0,
        totalTaxes: 0,
        grandTotal: 0,
        paymentStatus: 'unpaid',
    });
    const [otherCharge, setOtherCharge] = useState<OtherCharge>({ name: 'Delivery Charge', amount: 0, cgst: 0, sgst: 0 });
    const [isOtherChargesOpen, setIsOtherChargesOpen] = useState(false);

    const [updateInventory, setUpdateInventory] = useState(true);
    const { toast } = useToast();
    
    const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
    const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
    const [newVendor, setNewVendor] = useState(initialNewVendorState);

    const selectedVendor = vendors.find(v => v.id === po.vendorId);

    const handleItemChange = (index: number, field: keyof Omit<PurchaseOrderItem, 'id'>, value: string | number) => {
        const updatedItems = [...po.items];
        const currentItem = { ...updatedItems[index] };
        
        const numericValue = typeof value === 'string' && field !== 'ingredientId' && field !== 'description' ? parseFloat(value) || 0 : value;

        if (field === 'ingredientId' || field === 'description') {
            (currentItem as any)[field] = value;
        } else {
            (currentItem as any)[field] = numericValue;
        }
        
        if (field === 'quantity' || field === 'unitPrice') {
            currentItem.amount = currentItem.quantity * currentItem.unitPrice;
        }

        updatedItems[index] = currentItem;
        setPo(prev => ({ ...prev, items: updatedItems }));
    };

    const addNewItem = () => {
        setPo(prev => ({ ...prev, items: [...prev.items, { ...initialItemState, id: `item-${Date.now()}` }] }));
    };

    const removeItem = (index: number) => {
        setPo(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    useEffect(() => {
        const subTotal = po.items.reduce((sum, item) => sum + item.amount, 0);
        const totalItemTaxes = po.items.reduce((sum, item) => sum + (item.amount * ((item.cgst + item.sgst + item.igst) / 100)), 0);
        
        const otherChargeAmount = otherCharge.amount || 0;
        const otherChargeTaxes = otherChargeAmount * ((otherCharge.cgst + otherCharge.sgst) / 100);
        
        const grandTotal = subTotal - po.totalDiscount + otherChargeAmount + totalItemTaxes + otherChargeTaxes;

        setPo(prev => ({
            ...prev,
            subTotal,
            otherCharges: otherChargeAmount,
            totalTaxes: totalItemTaxes + otherChargeTaxes,
            grandTotal,
        }));
    }, [po.items, po.totalDiscount, otherCharge]);

    const handleSave = () => {
        if (!po.vendorId || po.items.some(i => !i.ingredientId)) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please select a supplier and ensure all items have a raw material selected.'
            });
            return;
        }
        
        const newOrder: PurchaseOrder = {
            ...po,
            id: `po-${Date.now()}`,
            status: 'completed',
        };

        if (updateInventory) {
          setIngredients(prevIngredients => {
            const newIngredients = [...prevIngredients];
            newOrder.items.forEach(item => {
              const ingIndex = newIngredients.findIndex(ing => ing.id === item.ingredientId);
              if (ingIndex > -1) {
                newIngredients[ingIndex].stock += item.quantity;
              }
            });
            return newIngredients;
          });
        }

        onSave(newOrder);

        toast({
            title: 'Purchase Entry Saved',
            description: `Entry for PO #${po.poNumber} has been saved.`,
        });
        onClose();
    };

    const getIngredientUnit = (id: string) => ingredients.find(i => i.id === id)?.unit || '';

    const handleAddNewVendor = () => {
        if (!newVendor.name || !newVendor.email || !newVendor.phone) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please enter name, email, and phone for the new vendor.'
            });
            return;
        }
        const newVendorData: Vendor = {
            id: `vendor-${Date.now()}`,
            ...newVendor,
        };
        setVendors(prev => [...prev, newVendorData]);
        setPo(prevPo => ({...prevPo, vendorId: newVendorData.id }));
        setNewVendor(initialNewVendorState);
        setIsAddVendorOpen(false);
        toast({
            title: 'Vendor Added',
            description: `${newVendorData.name} has been added and selected.`
        });
    };
    
    const handleSaveOtherCharge = () => {
        // The state is already updated onChange, so this just closes the dialog
        setIsOtherChargesOpen(false);
    }
    
    const effectiveTaxRate = useMemo(() => {
        const taxableAmount = po.subTotal - po.totalDiscount + po.otherCharges;
        if (taxableAmount <= 0 || po.totalTaxes <= 0) return 0;
        return (po.totalTaxes / taxableAmount) * 100;
    }, [po.subTotal, po.totalDiscount, po.otherCharges, po.totalTaxes]);


    return (
        <>
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>New Purchase Entry</DialogTitle>
                    <DialogDescription>Enter the details of the raw material purchase.</DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                            <div className="space-y-1.5 flex items-end gap-2">
                                <div className="flex-1">
                                    <Label>Supplier</Label>
                                    <Select value={po.vendorId} onValueChange={vendorId => setPo(prev => ({ ...prev, vendorId }))}>
                                        <SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                                        <SelectContent>
                                            {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="icon"><PlusCircle className="h-4 w-4" /></Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Supplier</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="new-vendor-name">Name</Label>
                                                <Input id="new-vendor-name" value={newVendor.name} onChange={(e) => setNewVendor(v => ({...v, name: e.target.value}))} />
                                            </div>
                                             <div className="space-y-2">
                                                <Label htmlFor="new-vendor-contact">Contact Person</Label>
                                                <Input id="new-vendor-contact" value={newVendor.contactPerson} onChange={(e) => setNewVendor(v => ({...v, contactPerson: e.target.value}))} />
                                            </div>
                                             <div className="space-y-2">
                                                <Label htmlFor="new-vendor-phone">Phone</Label>
                                                <Input id="new-vendor-phone" value={newVendor.phone} onChange={(e) => setNewVendor(v => ({...v, phone: e.target.value}))} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="new-vendor-email">Email</Label>
                                                <Input id="new-vendor-email" type="email" value={newVendor.email} onChange={(e) => setNewVendor(v => ({...v, email: e.target.value}))} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="new-vendor-gstin">GSTIN</Label>
                                                <Input id="new-vendor-gstin" value={newVendor.gstin} onChange={(e) => setNewVendor(v => ({...v, gstin: e.target.value}))} />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsAddVendorOpen(false)}>Cancel</Button>
                                            <Button onClick={handleAddNewVendor}>Add Supplier</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <div className="space-y-1.5">
                                <Label>GST No.</Label>
                                <Input value={selectedVendor?.gstin || ''} disabled />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Invoice Number</Label>
                                <Input placeholder="Enter invoice number" value={po.invoiceNumber || ''} onChange={e => setPo(p => ({...p, invoiceNumber: e.target.value}))}/>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Invoice Date</Label>
                                <Input type="date" value={po.invoiceDate ? format(po.invoiceDate, 'yyyy-MM-dd') : ''} onChange={e => setPo(p => ({...p, invoiceDate: new Date(e.target.value)}))}/>
                            </div>
                        </div>

                         <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-end gap-4 mb-4">
                                     <Button variant="outline" disabled>More Actions</Button>
                                     <Button variant="outline" disabled>Application Of Discount</Button>
                                     <Button variant="outline" disabled>% Discount Calculation</Button>
                                     <Button onClick={addNewItem}><PlusCircle className="mr-2 h-4 w-4" /> Add New</Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[250px]">Name</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead>Unit</TableHead>
                                                <TableHead>Price (₹)</TableHead>
                                                <TableHead>Amount (₹)</TableHead>
                                                <TableHead className="min-w-[120px] text-center">CGST %</TableHead>
                                                <TableHead className="min-w-[120px] text-center">SGST %</TableHead>
                                                <TableHead className="min-w-[120px] text-center">IGST %</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {po.items.map((item, index) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <Select value={item.ingredientId} onValueChange={(val) => handleItemChange(index, 'ingredientId', val)}>
                                                            <SelectTrigger><SelectValue placeholder="Select/Add Raw Material"/></SelectTrigger>
                                                            <SelectContent>
                                                                {ingredients.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell><Input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-20" /></TableCell>
                                                    <TableCell>{getIngredientUnit(item.ingredientId) || 'Unit'}</TableCell>
                                                    <TableCell><Input type="number" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} className="w-24" /></TableCell>
                                                    <TableCell>{item.amount.toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <Input type="number" value={item.cgst} onChange={(e) => handleItemChange(index, 'cgst', e.target.value)} className="w-20 text-center" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input type="number" value={item.sgst} onChange={(e) => handleItemChange(index, 'sgst', e.target.value)} className="w-20 text-center" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input type="number" value={item.igst} onChange={(e) => handleItemChange(index, 'igst', e.target.value)} className="w-20 text-center" />
                                                    </TableCell>
                                                    <TableCell><Input placeholder="Description" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} /></TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="icon" onClick={() => removeItem(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                         </Card>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="update-inventory" checked={updateInventory} onCheckedChange={checked => setUpdateInventory(Boolean(checked))} />
                                    <Label htmlFor="update-inventory">Update Inventory Stock</Label>
                                </div>
                            </div>

                            <Card>
                                <CardContent className="p-4 space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <Label>Sub Total:</Label>
                                        <span>{po.subTotal.toFixed(2)}</span>
                                    </div>
                                     <div className="flex justify-between items-center text-sm">
                                        <Label>Total Discount:</Label>
                                         <div className="flex items-center gap-2">
                                            <Input type="number" className="w-24 h-8" value={po.totalDiscount} onChange={e => setPo(p => ({...p, totalDiscount: Number(e.target.value)}))} />
                                            <span className="text-destructive">- {po.totalDiscount.toFixed(2)}</span>
                                         </div>
                                    </div>
                                     <div className="flex justify-between items-center text-sm">
                                        <Button variant="link" className="p-0 h-auto" onClick={() => setIsOtherChargesOpen(true)}>
                                            + {otherCharge.name}:
                                        </Button>
                                        <span>{po.otherCharges.toFixed(2)}</span>
                                    </div>
                                     <div className="flex justify-between items-center text-sm">
                                        <Label>Total Taxes ({effectiveTaxRate.toFixed(2)}%):</Label>
                                        <span className="text-green-600">{po.totalTaxes.toFixed(2)}</span>
                                    </div>
                                     <div className="flex justify-between items-center font-bold text-base border-t pt-2">
                                        <Label>Grand Total:</Label>
                                        <span>{po.grandTotal.toFixed(2)}</span>
                                    </div>
                                     <div className="flex justify-between items-center text-sm pt-2">
                                        <Label>Payment Type:</Label>
                                        <ToggleGroup type="single" variant="outline" value={po.paymentStatus} onValueChange={(val: 'paid' | 'unpaid') => val && setPo(p => ({...p, paymentStatus: val}))}>
                                            <ToggleGroupItem value="unpaid">Unpaid</ToggleGroupItem>
                                            <ToggleGroupItem value="paid">Paid</ToggleGroupItem>
                                        </ToggleGroup>
                                    </div>
                                </CardContent>
                            </Card>
                         </div>
                </div>
                 <DialogFooter className="border-t pt-4">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        <Dialog open={isOtherChargesOpen} onOpenChange={setIsOtherChargesOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{otherCharge.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className='space-y-2'>
                       <Label>Delivery Charge:</Label>
                        <Input 
                            type="number" 
                            placeholder="Included in Invoice" 
                            value={otherCharge.amount === 0 ? '' : otherCharge.amount}
                            onChange={(e) => setOtherCharge(prev => ({ ...prev, amount: Number(e.target.value)}))}
                        />
                    </div>
                    <Card className='p-4'>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>CGST(%):</Label>
                                <Input 
                                    type="number"
                                    value={otherCharge.cgst === 0 ? '' : otherCharge.cgst}
                                    onChange={(e) => setOtherCharge(prev => ({ ...prev, cgst: Number(e.target.value)}))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>SGST(%):</Label>
                                <Input
                                    type="number"
                                    value={otherCharge.sgst === 0 ? '' : otherCharge.sgst}
                                    onChange={(e) => setOtherCharge(prev => ({ ...prev, sgst: Number(e.target.value)}))}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOtherChargesOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveOtherCharge}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        </>
    );
}
