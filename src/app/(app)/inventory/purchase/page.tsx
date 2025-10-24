
'use client';

import { useState, useEffect } from 'react';
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
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import type { PurchaseOrder, PurchaseOrderItem, Vendor } from '@/lib/types';
import { PlusCircle, IndianRupee, Trash2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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

export default function PurchaseEntryPage() {
    const [po, setPo] = useState<Omit<PurchaseOrder, 'id' | 'status'>>({
        poNumber: `PO-${Date.now()}`,
        vendorId: '',
        date: new Date(),
        items: [initialItemState],
        subTotal: 0,
        totalDiscount: 0,
        otherCharges: 0,
        totalTaxes: 0,
        grandTotal: 0,
        paymentStatus: 'unpaid',
    });
    const [updateInventory, setUpdateInventory] = useState(true);
    const { toast } = useToast();

    const selectedVendor = vendors.find(v => v.id === po.vendorId);

    const handleItemChange = (index: number, field: keyof Omit<PurchaseOrderItem, 'id'>, value: string | number) => {
        const updatedItems = [...po.items];
        const currentItem = { ...updatedItems[index] };
        
        // Ensure values are numbers where appropriate
        const numericValue = typeof value === 'string' && field !== 'ingredientId' && field !== 'description' ? parseFloat(value) || 0 : value;

        if (field === 'ingredientId' || field === 'description') {
            (currentItem as any)[field] = value;
        } else {
            (currentItem as any)[field] = numericValue;
        }
        
        // Recalculate amount if quantity or unitPrice changes
        if (field === 'quantity' || field === 'unitPrice') {
            currentItem.amount = currentItem.quantity * currentItem.unitPrice;
        }

        updatedItems[index] = currentItem;
        setPo(prev => ({ ...prev, items: updatedItems }));
    };

    const addNewItem = () => {
        setPo(prev => ({ ...prev, items: [...prev.items, { ...initialItemState }] }));
    };

    const removeItem = (index: number) => {
        setPo(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    useEffect(() => {
        const subTotal = po.items.reduce((sum, item) => sum + item.amount, 0);
        const totalTaxes = po.items.reduce((sum, item) => sum + (item.amount * ((item.cgst + item.sgst + item.igst) / 100)), 0);
        const grandTotal = subTotal - po.totalDiscount + po.otherCharges + totalTaxes;

        setPo(prev => ({
            ...prev,
            subTotal,
            totalTaxes,
            grandTotal,
        }));
    }, [po.items, po.totalDiscount, po.otherCharges]);

    const handleSave = () => {
        if (!po.vendorId || po.items.some(i => !i.ingredientId)) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please select a vendor and ensure all items have a raw material selected.'
            });
            return;
        }

        toast({
            title: 'Purchase Entry Saved',
            description: `Entry for PO #${po.poNumber} has been saved.`,
        });
        // Here you would typically send the data to a backend and navigate away
        console.log('Saved PO:', po);
    };

    const getIngredientUnit = (id: string) => ingredients.find(i => i.id === id)?.unit || '';

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>New Purchase Entry</CardTitle>
                    <CardDescription>Enter the details of the raw material purchase.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Supplier & Invoice Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                        <div className="space-y-1.5">
                            <Label>Supplier</Label>
                            <Select value={po.vendorId} onValueChange={vendorId => setPo(prev => ({ ...prev, vendorId }))}>
                                <SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                                <SelectContent>
                                    {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
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
                </CardContent>
            </Card>

             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Items</CardTitle>
                    <div className="flex items-center gap-4">
                         <Button variant="outline" disabled>More Actions</Button>
                         <Button variant="outline" disabled>Application Of Discount</Button>
                         <Button variant="outline" disabled>% Discount Calculation</Button>
                         <Button onClick={addNewItem}><PlusCircle className="mr-2 h-4 w-4" /> Add New</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Name</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Price (₹)</TableHead>
                                    <TableHead>Amount (₹)</TableHead>
                                    <TableHead colSpan={3} className="text-center">Tax (%)</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                                 <TableRow>
                                    <TableHead></TableHead>
                                    <TableHead></TableHead>
                                    <TableHead></TableHead>
                                    <TableHead></TableHead>
                                    <TableHead></TableHead>
                                    <TableHead className="w-[80px]">CGST</TableHead>
                                    <TableHead className="w-[80px]">SGST</TableHead>
                                    <TableHead className="w-[80px]">IGST</TableHead>
                                    <TableHead></TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {po.items.map((item, index) => (
                                    <TableRow key={index}>
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
                                        <TableCell><Input type="number" value={item.cgst} onChange={e => handleItemChange(index, 'cgst', e.target.value)} /></TableCell>
                                        <TableCell><Input type="number" value={item.sgst} onChange={e => handleItemChange(index, 'sgst', e.target.value)} /></TableCell>
                                        <TableCell><Input type="number" value={item.igst} onChange={e => handleItemChange(index, 'igst', e.target.value)} /></TableCell>
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
                            <span>{po.subTotal.toFixed(3)}</span>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <Label>Total Discount:</Label>
                             <div className="flex items-center gap-2">
                                <Input type="number" className="w-24 h-8" value={po.totalDiscount} onChange={e => setPo(p => ({...p, totalDiscount: Number(e.target.value)}))} />
                                <span className="text-destructive">- {po.totalDiscount.toFixed(3)}</span>
                             </div>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <Label>+ Add Other Charges:</Label>
                            <span>{po.otherCharges.toFixed(3)}</span>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <Label>Total Taxes:</Label>
                            <span className="text-green-600">{po.totalTaxes.toFixed(3)}</span>
                        </div>
                         <div className="flex justify-between items-center font-bold text-base border-t pt-2">
                            <Label>Grand Total:</Label>
                            <span>{po.grandTotal.toFixed(3)}</span>
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

            <div className="flex justify-end gap-2 p-4 bg-card border-t sticky bottom-0">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Save</Button>
            </div>
        </div>
    );
}
