

'use client';

import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { tables } from '@/lib/data';
import type { MenuItem, OrderItem, OrderType, AppOrder, MenuItemAddon } from '@/lib/types';
import { Check, CheckCircle, IndianRupee, MinusCircle, Package, PauseCircle, Phone, PlayCircle, PlusCircle, Printer, Search, Send, Truck, User, Utensils, X, MessageSquarePlus, Tag, Mail, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useSettings } from '@/contexts/SettingsContext';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';


export default function OrdersPage() {
  const { 
    menuItems, 
    menuCategories, 
    orders,
    heldOrders,
    setOrders,
    setHeldOrders,
    activeOrderId,
    setActiveOrderId,
    addOrder,
    removeOrder,
    updateOrder,
    holdOrder,
    resumeOrder,
    createNewOrder,
  } = useAppContext();
  const { settings, setSetting } = useSettings();
  
  const activeOrder = useMemo(() => orders.find(o => o.id === activeOrderId), [orders, activeOrderId]);

  const [activeCategory, setActiveCategory] = useState(menuCategories[0].id);
  
  const [customizationItem, setCustomizationItem] = useState<MenuItem | null>(null);
  const [noteEditingItem, setNoteEditingItem] = useState<OrderItem | null>(null);
  const [isHeldBillsOpen, setIsHeldBillsOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState<number | string>('');
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [billSearchQuery, setBillSearchQuery] = useState('');

  const FoodTypeIndicator = ({ type }: { type: MenuItem['foodType'] }) => {
    if (!type) return null;
    const color = type === 'Veg' ? 'border-green-500' : 'border-red-500';
    const bgColor = type === 'Veg' ? 'bg-green-500' : 'bg-red-500';
    return (
      <div className={`absolute top-1 right-1 border ${color} p-0.5 rounded-full`}>
        <div className={`h-1.5 w-1.5 rounded-full ${bgColor}`}></div>
      </div>
    );
  };
  
  const updateActiveOrder = (items: OrderItem[]) => {
    if (activeOrderId) {
      updateOrder(activeOrderId, { items });
    }
  };

  const addToCart = (item: MenuItem) => {
    if (!activeOrder) return;

    if (item.variations && item.variations.length > 0 || settings.showItemDiscountBox) {
      setCustomizationItem(item);
    } else {
       const uniqueCartId = `${item.id}-base-${Date.now()}`;
       const existingItem = activeOrder.items.find(cartItem => cartItem.name === item.name && !cartItem.variation && !cartItem.notes);
       
       if (existingItem) {
         updateQuantity(existingItem.id, existingItem.quantity + 1);
       } else {
         const newOrderItem: OrderItem = {
          id: uniqueCartId,
          name: item.name,
          quantity: parseInt(settings.defaultQuantity, 10) || 1,
          price: item.price,
          totalPrice: item.price * (parseInt(settings.defaultQuantity, 10) || 1),
        };
        updateActiveOrder([...activeOrder.items, newOrderItem]);
       }
    }
  };

  const handleCustomizationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customizationItem || !activeOrder) return;

    const formData = new FormData(e.currentTarget);
    const variationId = formData.get('variation') as string;
    const notes = formData.get('notes') as string;
    
    const selectedVariation = customizationItem.variations?.find(v => v.id === variationId);
    
    let basePrice = customizationItem.price;
    let finalName = customizationItem.name;
    const uniqueCartId = `${customizationItem.id}-${selectedVariation?.id || 'base'}-${Date.now()}`;

    if (selectedVariation) {
      basePrice += selectedVariation.priceModifier;
      finalName += ` (${selectedVariation.name})`;
    }
    
    const existingItem = activeOrder.items.find(cartItem => cartItem.name === finalName && cartItem.notes === (notes || undefined));

    if (existingItem) {
        updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
        const newOrderItem: OrderItem = {
          id: uniqueCartId,
          name: finalName,
          quantity: 1,
          price: basePrice,
          totalPrice: basePrice,
          variation: selectedVariation,
          notes: notes || undefined,
        };
        updateActiveOrder([...activeOrder.items, newOrderItem]);
    }

    setCustomizationItem(null);
  };
  
  const openNoteEditor = (item: OrderItem) => {
    setNoteEditingItem(item);
    setCurrentNote(item.notes || '');
  };

  const handleSaveNote = () => {
    if (!noteEditingItem || !activeOrder) return;
    const updatedItems = activeOrder.items.map(item => item.id === noteEditingItem.id ? {...item, notes: currentNote} : item);
    updateActiveOrder(updatedItems);
    setNoteEditingItem(null);
    setCurrentNote('');
    toast({ title: 'Note Saved' });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
     if (!activeOrder) return;

    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      const updatedItems = activeOrder.items.map(item =>
          item.id === itemId
            ? { ...item, quantity: newQuantity, totalPrice: item.price * newQuantity }
            : item
        );
      updateActiveOrder(updatedItems);
    }
  };

  const removeFromCart = (itemId: string) => {
    if (!activeOrder) return;
    const updatedItems = activeOrder.items.filter(item => item.id !== itemId);
    updateActiveOrder(updatedItems);
  };
  
  const resetCurrentOrder = () => {
    if (!activeOrderId) return;
    
    // Check if it's the last order
    if (orders.length === 1) {
      // Just reset the order, don't remove it
       const newOrder = createNewOrder();
      setOrders([newOrder]);
      setActiveOrderId(newOrder.id);
    } else {
      removeOrder(activeOrderId);
    }

    setAmountPaid('');
    setSetting('discountValue', 0);
    setSetting('discountType', 'fixed');
    setSetting('isComplimentary', false);
    setIsPaymentDialogOpen(false);
  }
  
  const handleSendToKitchen = () => {
    if (!activeOrder || activeOrder.items.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Order",
        description: "Cannot send an empty order to the kitchen.",
      });
      return;
    }
    toast({
      title: "Order Sent!",
      description: "The order has been sent to the kitchen for preparation.",
    });
  };

  const subTotal = activeOrder ? activeOrder.items.reduce((acc, item) => acc + item.totalPrice, 0) : 0;
  
  const addonsTotal = activeOrder ? activeOrder.items.reduce((acc, item) => {
      const itemAddonsTotal = (item.addons || []).reduce((addonAcc, addon) => addonAcc + addon.price, 0);
      return acc + (itemAddonsTotal * item.quantity);
  }, 0) : 0;
  
  const discountableAmount = settings.ignoreAddonPrice ? subTotal - addonsTotal : subTotal;
  
  let calculatedDiscount = 0;
  if (settings.discountType === 'percentage') {
    calculatedDiscount = discountableAmount * (settings.discountValue / 100);
  } else {
    calculatedDiscount = settings.discountValue;
  }
  
  if (settings.specialDiscountReasonMandatory && calculatedDiscount > 0) {
      // In a real app, you'd check for a reason. For now, we simulate this by blocking.
      toast({
          variant: "destructive",
          title: "Discount Reason Required",
          description: "Please provide a reason for applying a special discount.",
      });
      // Reset discount to prevent application
      calculatedDiscount = 0;
  }

  const discountAmount = Math.min(discountableAmount, calculatedDiscount);

  let tax = 0;
  let total = 0;

  if (settings.calculateBackwardTax) {
    // Prices are tax-inclusive
    total = subTotal - discountAmount;
    const taxRate = settings.taxAmount / 100;
    const preTaxTotal = total / (1 + taxRate);
    tax = total - preTaxTotal;
  } else {
    // Prices are tax-exclusive
    const totalBeforeTax = settings.calculateTaxBeforeDiscount ? subTotal : subTotal - discountAmount;
    tax = totalBeforeTax * (settings.taxAmount / 100);
    total = subTotal - discountAmount + tax;
  }
  
  if (settings.isComplimentary) {
      total = 0;
      if (settings.disableTaxOnComplimentary) {
          tax = 0;
      }
  }

  const changeDue = Number(amountPaid) > total ? Number(amountPaid) - total : 0;
  
  const printContent = (content: string) => {
      const printWindow = window.open('', '', 'width=400,height=600');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      } else {
        toast({
          variant: "destructive",
          title: "Popup Blocked",
          description: "Please allow popups for this site to print.",
        });
      }
  };

  const handlePrintBill = () => {
    if (!activeOrder) return;
    const printSettings = {
        cafeName: 'ZappyyPOS',
        address: '123 Coffee Lane, Bengaluru',
        customDetails: 'GSTIN: 29ABCDE1234F1Z5',
        phone: '9876543210',
        footerMessage: 'Thank you for your visit!',
    };
  
    const billHtml = `
      <html>
        <head>
          <title>Customer Bill</title>
          <style>
            body { font-family: 'Source Code Pro', monospace; padding: 16px; color: #000; width: 300px; }
            h2, p { margin: 0; padding: 0; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 12px; }
            .header h2 { font-size: 20px; font-weight: bold; }
            .header p { font-size: 13px; }
            .summary { margin-bottom: 12px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 14px; }
            .item .name { flex: 1; text-align: left; margin-right: 8px; }
            .item .price { width: 80px; text-align: right; }
            .total { border-top: 2px dashed #000; padding-top: 6px; margin-top: 8px; font-size: 14px; }
            .center { text-align: center; margin-top: 16px; font-size: 13px; }
            .notes { font-size: 12px; font-style: italic; padding-left: 10px; }
            .complimentary-tag { font-weight: bold; font-size: 16px; text-align: center; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${printSettings.cafeName}</h2>
            <p>${printSettings.address}</p>
            ${printSettings.customDetails ? `<p>${printSettings.customDetails}</p>` : ''}
            <p>Ph: ${printSettings.phone}</p>
            <p>Order: #${activeOrder.orderNumber} | ${new Date().toLocaleString()}</p>
            <p>For: ${activeOrder.orderType === 'Dine-In' ? tables.find(t => t.id === activeOrder.tableId)?.name || 'Dine-In' : `${activeOrder.orderType} - ${activeOrder.customer.name || 'Customer'}`}</p>
          </div>
          ${settings.isComplimentary ? '<div class="complimentary-tag">** COMPLIMENTARY **</div>' : ''}
          <div class="summary">
            ${activeOrder.items.map(item => `<div class="item"><span class="name">${item.quantity}x ${item.name}</span><span class="price"><span class="flex items-center"><span class="h-4 w-4 mr-1"></span>${item.totalPrice.toFixed(2)}</span></span></div>${item.notes ? `<div class="notes">- ${item.notes}</div>` : ''}`).join('')}
          </div>
          <div class="total">
            <div class="item"><span class="name">Subtotal</span><span class="price"><span class="flex items-center"><span class="h-4 w-4 mr-1"></span>${subTotal.toFixed(2)}</span></span></div>
            ${discountAmount > 0 ? `<div class="item"><span class="name">Discount</span><span class="price">- <span class="flex items-center"><span class="h-4 w-4 mr-1"></span>${discountAmount.toFixed(2)}</span></span></div>` : ''}
            ${tax > 0 ? `<div class="item"><span class="name">GST (${settings.taxAmount}%)</span><span class="price"><span class="flex items-center"><span class="h-4 w-4 mr-1"></span>${tax.toFixed(2)}</span></span></div>` : ''}
            <div class="item"><span class="name"><b>Total</b></span><span class="price"><b><span class="flex items-center"><span class="h-4 w-4 mr-1"></span>${total.toFixed(2)}</span></b></span></div>
          </div>
          <div class="center">
            <p>${printSettings.footerMessage}</p>
          </div>
        </body>
      </html>
    `;
    printContent(billHtml);
  };
  
  const handlePrintKOT = () => {
    if (!activeOrder) return;
     const kotHtml = `
      <html>
        <head>
          <title>KOT</title>
          <style>
            body { font-family: 'Source Code Pro', monospace; padding: 16px; color: #000; width: 300px; }
            h2, p { margin: 0; padding: 0; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
            .header h2 { font-size: 24px; font-weight: bold; }
            .info { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; font-weight: bold; }
            .item { margin-bottom: 8px; font-size: 16px; }
            .item .name { font-weight: bold; }
            .item .notes { padding-left: 16px; font-size: 14px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>KOT</h2>
          </div>
          <div class="info">
            <span>Order: #${activeOrder.orderNumber}</span>
            <span>${new Date().toLocaleTimeString()}</span>
          </div>
          <div class="info">
             <span>For: ${activeOrder.orderType === 'Dine-In' ? tables.find(t => t.id === activeOrder.tableId)?.name || 'Dine-In' : activeOrder.orderType}</span>
          </div>
          <div class="items">
            ${activeOrder.items.map(item => `
              <div class="item">
                <div class="name">${item.quantity} x ${item.name}</div>
                ${item.notes ? `<div class="notes">- ${item.notes}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;
    printContent(kotHtml);
  };

  const handlePrintAndSettle = () => {
    handlePrintBill();
    resetCurrentOrder();
  };
  
  const handleKotAndPrint = () => {
    handlePrintKOT();
    handlePrintBill();
  };
  
  const handleSaveAndEbill = () => {
    toast({
        title: "eBill Sent",
        description: "The bill has been sent to the customer's registered contact.",
    });
    resetCurrentOrder();
  }

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (searchQuery) {
        return matchesSearch;
    }

    return item.category === activeCategory;
  });

  const filteredHeldOrders = heldOrders.filter(order =>
    order.customer.name.toLowerCase().includes(billSearchQuery.toLowerCase()) ||
    order.orderNumber.toString().includes(billSearchQuery)
  );

  if (!activeOrder) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading orders...</p>
        </div>
    )
  }

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Menu Section */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className='hidden sm:block'>Point of Sale</CardTitle>
             <Tabs
              defaultValue={activeCategory}
              onValueChange={setActiveCategory}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                {menuCategories.map(category => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            {settings.displaySearch && (
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search menu items..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 pr-4">
                    {filteredMenuItems.map(item => (
                        <Card key={item.id} className="overflow-hidden relative">
                           <FoodTypeIndicator type={item.foodType} />
                          <button
                            className="w-full text-left"
                            onClick={() => addToCart(item)}
                            disabled={!item.isAvailable}
                          >
                            <div className="relative aspect-video">
                                {settings.displayItemImages && <Image src={item.imageUrl} alt={item.name} fill objectFit="cover" data-ai-hint={item.imageHint}/>}
                                {!settings.displayItemImages && <div className="aspect-video bg-muted flex items-center justify-center"><Utensils className="w-8 h-8 text-muted-foreground"/></div>}

                                {!item.isAvailable && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="text-white font-bold">Unavailable</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-2">
                              <h3 className="font-semibold truncate text-sm sm:text-base">{item.name}</h3>
                              <p className="text-sm flex items-center">
                                <IndianRupee className="h-3.5 w-3.5 mr-1" />
                                {item.price.toFixed(2)}
                              </p>
                            </div>
                          </button>
                        </Card>
                      ))}
                  </div>
                 </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary Section */}
      <div className="lg:col-span-1">
        <Card className="h-full flex flex-col">
          <CardHeader className="p-2">
              <ScrollArea className="max-w-full">
                <div className="flex items-center gap-1 p-1">
                  {orders.map((order, index) => (
                    <Button 
                      key={order.id} 
                      variant={order.id === activeOrderId ? 'secondary' : 'ghost'}
                      size="sm"
                      className="relative"
                      onClick={() => setActiveOrderId(order.id)}
                    >
                      Order {index + 1}
                      {orders.length > 1 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeOrder(order.id); }}
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs"
                        >
                          <X className="h-3 w-3"/>
                        </button>
                      )}
                    </Button>
                  ))}
                   <Button variant="ghost" size="icon" onClick={addOrder}><PlusCircle /></Button>
                   <div className="flex-grow" />
                   <Button variant="outline" size="sm" onClick={() => setIsHeldBillsOpen(true)} className="relative">
                      <ShoppingBag className="mr-2 h-4 w-4" /> Held Bills
                      {heldOrders.length > 0 && <Badge className="absolute -top-2 -right-2 px-1.5">{heldOrders.length}</Badge>}
                    </Button>
                </div>
              </ScrollArea>
            </CardHeader>
                <div className='flex flex-col h-full'>
                    <div className='px-6 pb-6 border-t'>
                        <div className="relative w-full my-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search Bill No / KOT No..." className="pl-10" value={billSearchQuery} onChange={(e) => setBillSearchQuery(e.target.value)} />
                        </div>
                        <Tabs value={activeOrder.orderType} onValueChange={(value) => updateOrder(activeOrder.id, {orderType: value as OrderType})} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="Dine-In"><Utensils className="mr-0 sm:mr-2 h-4 w-4"/> <span className='hidden sm:inline'>Dine-In</span></TabsTrigger>
                            <TabsTrigger value="Takeaway"><Package className="mr-0 sm:mr-2 h-4 w-4"/> <span className='hidden sm:inline'>Takeaway</span></TabsTrigger>
                            <TabsTrigger value="Delivery"><Truck className="mr-0 sm:mr-2 h-4 w-4"/> <span className='hidden sm:inline'>Delivery</span></TabsTrigger>
                        </TabsList>
                        <CardDescription asChild className="space-y-2 pt-4">
                            <div>
                                {activeOrder.orderType === 'Dine-In' && (
                                    <Select value={activeOrder.tableId} onValueChange={(value) => updateOrder(activeOrder.id, { tableId: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Table" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tables.map(table => (
                                                <SelectItem key={table.id} value={table.id} disabled={table.status !== 'Vacant'}>
                                                    {table.name} ({table.status})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                    <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Customer Name" className="pl-10" value={activeOrder.customer.name} onChange={(e) => updateOrder(activeOrder.id, { customer: {...activeOrder.customer, name: e.target.value}})} />
                                    </div>
                                    <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Phone Number" className="pl-10" value={activeOrder.customer.phone} onChange={(e) => updateOrder(activeOrder.id, { customer: {...activeOrder.customer, phone: e.target.value}})} />
                                    </div>
                                </div>
                            </div>
                        </CardDescription>
                        </Tabs>
                    </div>
                    <CardContent className="flex-1 overflow-y-auto pt-0">
                        {activeOrder.items.length === 0 ? (
                        <p className="text-muted-foreground">No items in order.</p>
                        ) : (
                        <div className="space-y-2">
                            {activeOrder.items.map(item => (
                            <div key={item.id} className="flex items-start">
                                <button className='flex-1 text-left' onClick={() => openNoteEditor(item)}>
                                    <p className="font-semibold text-sm">{item.name}</p>
                                    <p className="text-sm text-muted-foreground flex items-center">
                                        <IndianRupee className="h-3.5 w-3.5 mr-1" />
                                        {item.price.toFixed(2)}
                                    </p>
                                    {item.notes && <p className='text-xs text-amber-700 dark:text-amber-500 flex items-center gap-1'><MessageSquarePlus className="h-3 w-3"/> {item.notes}</p>}
                                </button>
                                <div className="flex items-center gap-1 sm:gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                    <MinusCircle className="h-4 w-4" />
                                </Button>
                                <span className='text-sm'>{item.quantity}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                                </div>
                                <p className="w-20 text-right font-semibold flex items-center justify-end text-sm">
                                <IndianRupee className="h-3.5 w-3.5 mr-1" />
                                {item.totalPrice.toFixed(2)}
                                </p>
                                <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-1 sm:ml-2 text-destructive"
                                onClick={() => removeFromCart(item.id)}
                                >
                                <X className="h-4 w-4" />
                                </Button>
                            </div>
                            ))}
                        </div>
                        )}
                    </CardContent>
                    {activeOrder.items.length > 0 && (
                        <CardFooter className='flex-col items-stretch gap-2 !p-4 border-t'>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <div className="flex items-center gap-2">
                                    <span>Subtotal</span>
                                    {settings.displayDiscountTextbox && (
                                     <Popover>
                                        <PopoverTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"><Tag /></Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64">
                                          <div className="grid gap-4">
                                            <div className="space-y-2">
                                              <h4 className="font-medium leading-none">{settings.discountLabel || 'Add Discount'}</h4>
                                              <p className="text-sm text-muted-foreground">
                                                Apply a fixed or percentage-based discount.
                                              </p>
                                            </div>
                                            <div className="grid gap-2">
                                              <div className="flex items-center gap-2">
                                                <Input
                                                  type="number"
                                                  value={settings.discountValue || ''}
                                                  onChange={(e) => setSetting('discountValue', Number(e.target.value))}
                                                  className="flex-1"
                                                  placeholder="Value"
                                                />
                                                <ToggleGroup
                                                  type="single"
                                                  variant="outline"
                                                  value={settings.discountType}
                                                  onValueChange={(value: 'fixed' | 'percentage') => value && setSetting('discountType', value)}
                                                >
                                                  <ToggleGroupItem value="fixed" aria-label="Fixed amount">Fixed</ToggleGroupItem>
                                                  <ToggleGroupItem value="percentage" aria-label="Percentage">Percentage</ToggleGroupItem>
                                                </ToggleGroup>
                                              </div>
                                               <div className="flex items-center space-x-2 pt-2">
                                                    <Checkbox id="is-complimentary" checked={settings.isComplimentary} onCheckedChange={(checked) => setSetting('isComplimentary', !!checked)} />
                                                    <Label htmlFor="is-complimentary">Mark as Complimentary</Label>
                                                </div>
                                            </div>
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                      )}
                                  </div>
                                  <span className={cn('flex items-center', settings.isComplimentary && 'line-through')}>
                                      <IndianRupee className="h-4 w-4 mr-1" />
                                      {subTotal.toFixed(2)}
                                  </span>
                                </div>
                                {discountAmount > 0 && !settings.isComplimentary && (
                                    <div className="flex justify-between text-destructive">
                                    <span>Discount ({settings.discountValue}{settings.discountType === 'percentage' ? '%' : ''})</span>
                                    <span className='flex items-center'>- <IndianRupee className="h-4 w-4 mx-1" />{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                {tax > 0 && (
                                <div className="flex justify-between">
                                <span>GST ({settings.taxAmount}%)</span>
                                <span className={cn('flex items-center', settings.isComplimentary && 'line-through')}>
                                    <IndianRupee className="h-4 w-4 mr-1" />
                                    {tax.toFixed(2)}
                                </span>
                                </div>
                                )}
                                <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span className='flex items-center'>
                                    <IndianRupee className="h-5 w-5 mr-1" />
                                    {total.toFixed(2)}
                                </span>
                                </div>
                            </div>
                            <div className='grid grid-cols-2 gap-2'>
                                <Button variant="secondary" onClick={() => holdOrder(activeOrder.id)}><PauseCircle className="mr-2 h-4 w-4" /> Hold</Button>
                                <Button variant="outline" onClick={handleSendToKitchen}><Send className="mr-2 h-4 w-4" /> KOT</Button>
                            </div>
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => setIsPaymentDialogOpen(true)} disabled={!settings.finalizeWithoutAmount && total > 0 && !amountPaid}>
                                <IndianRupee className="mr-2 h-4 w-4" /> {settings.discountButtonText || 'Generate Bill'}
                            </Button>
                        </CardFooter>
                    )}
                </div>
        </Card>
      </div>

        {/* Customization Dialog */}
        <Dialog open={!!customizationItem} onOpenChange={() => setCustomizationItem(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Customize {customizationItem?.name}</DialogTitle>
                </DialogHeader>
                {customizationItem && (
                    <form onSubmit={handleCustomizationSubmit} className="space-y-4">
                        {customizationItem.variations && customizationItem.variations.length > 0 && (
                            <div>
                                <Label className="font-medium">Select Variation</Label>
                                <Select name="variation" defaultValue={customizationItem.variations[0].id}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a variation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customizationItem.variations.map(v => (
                                            <SelectItem key={v.id} value={v.id}>
                                                {v.name} (+<IndianRupee className="h-3.5 w-3.5 inline-block" />{v.priceModifier.toFixed(2)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div>
                            <Label className="font-medium">Special Notes</Label>
                            <Textarea name="notes" placeholder="e.g. Extra spicy, no onions..." />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full">Add to Order</Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
        
        {/* Note Editing Dialog */}
        <Dialog open={!!noteEditingItem} onOpenChange={() => setNoteEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Note for {noteEditingItem?.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Textarea 
                placeholder="e.g. Extra spicy, no onions..."
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNoteEditingItem(null)}>Cancel</Button>
              <Button onClick={handleSaveNote}>Save Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Held Bills Dialog */}
        <Dialog open={isHeldBillsOpen} onOpenChange={setIsHeldBillsOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Held Orders</DialogTitle>
                    <DialogDescription>
                        These orders are on hold. You can resume them at any time.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredHeldOrders.length > 0 ? filteredHeldOrders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className='font-bold'>#{order.orderNumber}</TableCell>
                                    <TableCell>{order.customer.name || 'N/A'}</TableCell>
                                    <TableCell><Badge variant="outline">{order.orderType}</Badge></TableCell>
                                    <TableCell>{order.items.length}</TableCell>
                                    <TableCell className="text-right flex items-center justify-end">
                                        <IndianRupee className="h-4 w-4 mr-1" />
                                        {order.items.reduce((sum, i) => sum + i.totalPrice, 0).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" onClick={() => { resumeOrder(order.id); setIsHeldBillsOpen(false); }}>
                                            <PlayCircle className="mr-2 h-4 w-4" /> Resume
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No orders match your search.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Payment</DialogTitle>
                </DialogHeader>
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Bill Summary</CardTitle>
                                <CardDescription>
                                {activeOrder.orderType === 'Dine-In' && activeOrder.tableId ? tables.find(t => t.id === activeOrder.tableId)?.name : `${activeOrder.orderType} - ${activeOrder.customer.name}`}
                                </CardDescription>
                            </div>
                            {settings.isComplimentary && <Badge variant="destructive">COMPLIMENTARY</Badge>}
                        </div>
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-2 text-sm">
                           {activeOrder.items.map(item => (
                               <div key={item.id} className="flex justify-between">
                                   <span>{item.quantity} x {item.name}</span>
                                   <span className={cn('flex items-center', settings.isComplimentary && 'line-through')}>
                                       <IndianRupee className="inline-block h-3.5 w-3.5 mr-1"/>
                                       {item.totalPrice.toFixed(2)}
                                    </span>
                               </div>
                           ))}
                           <div className="border-t pt-2 mt-2 space-y-2">
                               <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className={cn('flex items-center', settings.isComplimentary && 'line-through')}><IndianRupee className="inline-block h-3.5 w-3.5 mr-1"/>{subTotal.toFixed(2)}</span>
                               </div>
                               {discountAmount > 0 && !settings.isComplimentary && (
                                <div className="flex justify-between text-destructive">
                                    <span>Discount</span>
                                    <span className='flex items-center'>- <IndianRupee className="inline-block h-3.5 w-3.5 mr-1"/>{discountAmount.toFixed(2)}</span>
                                </div>
                               )}
                                {tax > 0 && (
                                <div className="flex justify-between">
                                    <span>GST ({settings.taxAmount}%)</span>
                                    <span className={cn('flex items-center', settings.isComplimentary && 'line-through')}><IndianRupee className="inline-block h-3.5 w-3.5 mr-1"/>{tax.toFixed(2)}</span>
                               </div>
                               )}
                           </div>
                           <div className="flex justify-between font-bold pt-2 border-t text-base">
                               <span>Total Amount</span>
                               <span className='flex items-center'>
                                   <IndianRupee className="inline-block h-4 w-4 mr-1"/>
                                   {total.toFixed(2)}
                                </span>
                           </div>
                       </div>
                    </CardContent>
                </Card>
                 {!settings.isComplimentary && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline">UPI / Card</Button>
                            <Button>Cash</Button>
                        </div>
                        {settings.displaySettleAmount && (
                            <div className="space-y-2">
                                <Label htmlFor="amount-paid">Amount Paid</Label>
                                <Input 
                                    id="amount-paid" 
                                    type="number" 
                                    placeholder="Enter amount customer paid" 
                                    value={amountPaid} 
                                    onChange={(e) => setAmountPaid(e.target.value)}
                                />
                            </div>
                        )}
                        {changeDue > 0 && (
                            <div className="text-center font-bold text-xl p-4 bg-muted rounded-md">
                                Change Due: <span className='flex items-center justify-center'><IndianRupee className="inline-block h-5 w-5 mr-1"/>{changeDue.toFixed(2)}</span>
                            </div>
                        )}
                    </>
                 )}
                 <DialogFooter className='sm:flex-col sm:space-x-0 gap-2'>
                    <div className='grid grid-cols-2 gap-2'>
                      <Button variant="outline" onClick={handlePrintBill}>
                        <Printer className="mr-2" /> Print Bill
                      </Button>
                       <Button variant="outline" onClick={handleKotAndPrint}>
                        <Printer className="mr-2" /> KOT & Print
                      </Button>
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                      <Button variant="outline" onClick={handleSaveAndEbill}>
                        <Mail className="mr-2" /> Save & eBill
                      </Button>
                       <Button onClick={resetCurrentOrder} className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={!settings.isComplimentary && !settings.finalizeWithoutAmount && total > 0 && !amountPaid}>
                        <CheckCircle className="mr-2"/> Confirm Payment
                      </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}


