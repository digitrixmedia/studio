
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
import { menuItems, menuCategories, tables } from '@/lib/data';
import type { MenuItem, OrderItem, OrderType, AppOrder, MenuItemAddon } from '@/lib/types';
import { CheckCircle, IndianRupee, Mail, MessageSquarePlus, MinusCircle, Package, PauseCircle, Phone, PlayCircle, PlusCircle, Printer, Search, Send, ShoppingBag, Tag, Truck, User, Utensils, X } from 'lucide-react';
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
import { generateSmsBill } from '@/ai/flows/generate-sms-bill-flow';


export default function OrdersPage() {
  const { 
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
    getOrderByTable,
    currentUser,
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
  const [manualTaxRate, setManualTaxRate] = useState<number | null>(null);

  
  const updateActiveOrder = (items: OrderItem[]) => {
    if (activeOrderId) {
      updateOrder(activeOrderId, { items });
    }
  };

  const addToCart = (item: MenuItem) => {
    if (!activeOrder) return;

    if ((item.variations && item.variations.length > 0) || settings.showItemDiscountBox) {
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

  const toggleBogoForItem = (itemId: string, isBogo: boolean) => {
    if (!activeOrder) return;
    const updatedItems = activeOrder.items.map(item =>
      item.id === itemId ? { ...item, isBogo } : item
    );
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
    setManualTaxRate(null);
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

  const bogoDiscount = useMemo(() => {
    if (!activeOrder) return 0;
    
    // Manual BOGO calculation
    const manualBogoDiscount = activeOrder.items.reduce((totalDiscount, item) => {
      if (item.isBogo && item.quantity >= 2) {
        const freeItemsCount = Math.floor(item.quantity / 2);
        return totalDiscount + freeItemsCount * item.price;
      }
      return totalDiscount;
    }, 0);
    
    if (manualBogoDiscount > 0) return manualBogoDiscount;

    // Automatic BOGO calculation
    if (settings.applyBogoAutomatically) {
      return activeOrder.items.reduce((totalDiscount, item) => {
        if (item.quantity >= 2) {
          const freeItemsCount = Math.floor(item.quantity / 2);
          return totalDiscount + freeItemsCount * item.price;
        }
        return totalDiscount;
      }, 0);
    }
    
    return 0;
  }, [activeOrder, settings.applyBogoAutomatically]);
  
  let discountableAmount = subTotal - bogoDiscount;
  if (settings.ignoreAddonPrice) {
      discountableAmount -= addonsTotal;
  }
  
  let calculatedDiscount = 0;
  if (settings.discountType === 'percentage') {
    calculatedDiscount = discountableAmount * (settings.discountValue / 100);
  } else {
    calculatedDiscount = settings.discountValue;
  }
  
  if (settings.specialDiscountReasonMandatory && calculatedDiscount > 0) {
      // In a real app, you'd check for a reason. For now, we block it.
      // This part of the logic is prepared for a future UI addition.
      toast({
          variant: "destructive",
          title: "Discount Reason Required",
          description: "Please provide a reason for applying a special discount.",
      });
      calculatedDiscount = 0;
  }

  const discountAmount = Math.min(discountableAmount, calculatedDiscount);

  const totalBeforeTaxAndDiscount = subTotal - bogoDiscount;

  const tax = useMemo(() => {
    const taxRate = manualTaxRate !== null ? manualTaxRate : settings.taxAmount;
    if (taxRate <= 0) return 0;

    const taxableAmount = settings.calculateTaxBeforeDiscount ? totalBeforeTaxAndDiscount : totalBeforeTaxAndDiscount - discountAmount;
    
    if (settings.calculateBackwardTax) {
      const total = totalBeforeTaxAndDiscount - discountAmount;
      return total - (total / (1 + (taxRate / 100)));
    }
    
    return taxableAmount * (taxRate / 100);
  }, [settings.calculateTaxBeforeDiscount, settings.calculateBackwardTax, settings.taxAmount, totalBeforeTaxAndDiscount, discountAmount, manualTaxRate]);


  let total = totalBeforeTaxAndDiscount - discountAmount + tax;

  if (settings.isComplimentary) {
      total = 0;
      if (settings.disableTaxOnComplimentary) {
          // tax variable will still hold the calculated tax, but total is 0
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
  
    const now = new Date();
    const billHtml = `
      <html>
        <head>
          <title>Customer Bill</title>
          <style>
            @page { 
              size: 80mm auto; 
              margin: 0;
            }
            body {
              font-family: 'Arial', 'Source Code Pro', monospace;
              color: #000;
              width: 76mm;
              padding: 0;
              margin: 0 auto;
              -webkit-print-color-adjust: exact;
            }
            * { 
              box-sizing: border-box; 
              margin: 0;
              padding: 0;
            }
            .container { 
              display: block;
              padding: 2mm;
            }
            .header { 
              display: block;
              text-align: center;
              margin-bottom: 5px;
            }
            .header h2 {
                font-weight: bold; 
                font-size: 1.4rem;
                margin-bottom: 2px;
            }
            .header p { 
              font-size: 12px; 
              line-height: 1.2;
              font-weight: bold;
              margin: 0;
            }
            
            .hr { 
              border-top: 1px dashed #000; 
              margin: 5px 0; 
            }
            
            .customer-details { 
              display: block;
              text-align: left; 
              margin-bottom: 5px; 
              font-size: 12px; 
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              font-size: 12px; 
              margin-bottom: 5px; 
            }
            .info-grid div { text-align: left; }
            .info-grid div:nth-child(even) { text-align: right; }
            
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { padding: 1px 0; }
            th { text-align: left; border-bottom: 1px solid #000; font-weight: bold; }
            
            .col-no { width: 8%; }
            .col-item { width: 42%; }
            .col-qty { width: 10%; text-align: center; }
            .col-price { width: 20%; text-align: right; }
            .col-amount { width: 20%; text-align: right; }
            
            .item-variation { font-size: 11px; padding-left: 15px; }
            .notes { font-size: 11px; font-style: italic; padding-left: 15px; }
            
            .totals { 
              display: block;
              margin-top: 5px; 
              font-size: 12px; 
            }
            .totals .row { display: flex; justify-content: space-between; }
            .totals .grand-total { font-size: 16px; font-weight: bold; margin-top: 5px; }
            
            .footer { 
              display: block;
              margin-top: 10px; 
              font-size: 12px; 
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${settings.printCafeName}</h2>
              <p>${settings.printAddress.replace(/\n/g, '<br>')}</p>
              ${settings.printCustomDetails ? `<p>${settings.printCustomDetails.replace(/\n/g, '<br>')}</p>` : ''}
              <p>Ph: ${settings.printPhone}</p>
            </div>
            
            <div class="hr"></div>
            <div class="customer-details">
              Name: ${activeOrder.customer.name || 'N/A'}<br>
              Phone: ${activeOrder.customer.phone || 'N/A'}
            </div>
            <div class="hr"></div>

            <div class="info-grid">
              <div>Date: ${now.toLocaleDateString()}</div>
              <div>${activeOrder.orderType}: ${activeOrder.orderType === 'dine-in' ? tables.find(t => t.id === activeOrder.tableId)?.name || 'Self' : 'Self'}</div>
              <div>Time: ${now.toLocaleTimeString()}</div>
              <div>Bill No.: ${activeOrder.orderNumber}</div>
              <div>Cashier: ${currentUser?.name.split(' ')[0] || 'Biller'}</div>
            </div>

            <div class="hr"></div>

            <table>
              <thead>
                <tr>
                  <th class="col-no">No.</th>
                  <th class="col-item">Item</th>
                  <th class="col-qty">Qty</th>
                  <th class="col-price">Price</th>
                  <th class="col-amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${activeOrder.items.map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td class="col-item">${item.name.replace(/\s\(.*\)/, '')}</td>
                    <td class="col-qty">${item.quantity}</td>
                    <td class="col-price">${item.price.toFixed(2)}</td>
                    <td class="col-amount">${item.totalPrice.toFixed(2)}</td>
                  </tr>
                  ${item.variation && item.variation.name !== 'Regular' ? `<tr><td></td><td colspan="4" class="item-variation">(${item.variation.name})</td></tr>` : ''}
                  ${item.notes ? `<tr><td></td><td colspan="4" class="notes">- ${item.notes}</div></td></tr>` : ''}
                `).join('')}
              </tbody>
            </table>
            
            <div class="hr"></div>

            <div class="totals">
               <div class="row">
                  <span>Total Qty: ${activeOrder.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  <span>Sub Total: ${subTotal.toFixed(2)}</span>
               </div>
               ${bogoDiscount > 0 ? `<div class="row"><span>BOGO Discount</span><span>- ${bogoDiscount.toFixed(2)}</span></div>` : ''}
               ${discountAmount > 0 ? `<div class="row"><span>Discount</span><span>- ${discountAmount.toFixed(2)}</span></div>` : ''}
               ${tax > 0 ? `<div class="row"><span>GST (${manualTaxRate !== null ? manualTaxRate : settings.taxAmount}%)</span><span>${tax.toFixed(2)}</span></div>` : ''}
            </div>

            <div class="hr"></div>
            
            <div class="totals">
              <div class="row grand-total">
                <span>Grand Total</span>
                <span>₹${total.toFixed(2)}</span>
              </div>
            </div>
            
             <div class="hr"></div>

            <div class="footer">
              <p>${settings.printFooterMessage}</p>
            </div>
          </div>
        </body>
      </html>
    `;
    printContent(billHtml);
  };
  
  const handlePrintKOT = () => {
    if (!activeOrder) return;
     const now = new Date();
     const kotHtml = `
      <html>
        <head>
          <title>KOT</title>
          <style>
            @page { 
              size: 80mm auto; 
              margin: 0;
            }
            body {
              font-family: 'Arial', 'Source Code Pro', monospace;
              color: #000;
              width: 76mm;
              padding: 0;
              margin: 0 auto;
              -webkit-print-color-adjust: exact;
            }
            * { 
              box-sizing: border-box; 
              margin: 0;
              padding: 0;
            }
            .container { 
              display: block;
              padding: 2mm;
            }
            .header { 
              display: block;
              text-align: center;
              margin-bottom: 5px;
            }
            .header h2 {
                font-weight: bold; 
                font-size: 1.5rem;
                margin-bottom: 4px;
                border-bottom: 1px dashed #000;
                padding-bottom: 4px;
            }
            .hr { 
              border-top: 1px dashed #000; 
              margin: 5px 0; 
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              font-size: 12px; 
              font-weight: bold;
              margin-bottom: 5px; 
            }
            .info-grid div { text-align: left; }
            .info-grid div:nth-child(even) { text-align: right; }
            
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { padding: 2px 0; vertical-align: top;}
            th { text-align: left; border-bottom: 1px solid #000; font-weight: bold; }
            
            .col-qty { width: 15%; text-align: center; font-size: 1.1rem; font-weight: bold; }
            .col-item { width: 85%; }

            .item-name { font-weight: bold; font-size: 1rem; }
            .item-variation { font-size: 11px; padding-left: 10px; }
            .notes { font-size: 11px; font-style: italic; padding-left: 10px; white-space: normal; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>KITCHEN ORDER TICKET</h2>
            </div>
            
            <div class="info-grid">
              <div>Order: #${activeOrder.orderNumber}</div>
              <div>${now.toLocaleTimeString()}</div>
              <div>For: ${activeOrder.orderType === 'dine-in' ? tables.find(t => t.id === activeOrder.tableId)?.name || 'Dine-In' : activeOrder.orderType}</div>
              <div>Cashier: ${currentUser?.name.split(' ')[0] || 'Biller'}</div>
            </div>

            <div class="hr"></div>

            <table>
              <thead>
                <tr>
                  <th class="col-qty">QTY</th>
                  <th class="col-item">ITEM</th>
                </tr>
              </thead>
              <tbody>
                ${activeOrder.items.map((item) => `
                  <tr>
                    <td class="col-qty">${item.quantity}x</td>
                    <td class="col-item">
                      <div class="item-name">${item.name.replace(/\s\(.*\)/, '')}</div>
                      ${item.variation && item.variation.name !== 'Regular' ? `<div class="item-variation">(${item.variation.name})</div>` : ''}
                      ${item.notes ? `<div class="notes">- ${item.notes}</div>` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
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
  
  const handleSaveAndEbill = async () => {
    if (!activeOrder) return;
    if (!activeOrder.customer.phone) {
      toast({
        variant: 'destructive',
        title: 'Missing Phone Number',
        description: 'Please enter a customer phone number to send an e-bill.',
      });
      return;
    }

    try {
      const orderDetails = {
        customerName: activeOrder.customer.name,
        items: activeOrder.items.map(i => ({ name: i.name, quantity: i.quantity, totalPrice: i.totalPrice })),
        total: total,
        orderNumber: activeOrder.orderNumber,
        cafeName: settings.printCafeName,
      };

      const result = await generateSmsBill(orderDetails);

      // Simulate sending SMS
      console.log('--- SIMULATING SMS ---');
      console.log(`To: ${activeOrder.customer.phone}`);
      console.log(`Message: ${result.smsContent}`);
      console.log('--------------------');
      
      toast({
          title: "eBill Sent",
          description: `SMS bill sent to ${activeOrder.customer.phone}.`,
      });

      resetCurrentOrder();
    } catch (error) {
      console.error("Error generating or sending eBill:", error);
      toast({
          variant: "destructive",
          title: "Failed to Send eBill",
          description: "There was a problem generating the bill content.",
      });
    }
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

  useEffect(() => {
    if (activeOrder && activeOrder.items.length === 0) {
      setManualTaxRate(null);
    }
  }, [activeOrder]);

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
                        <Card key={item.id} className="overflow-hidden relative shadow-md hover:shadow-xl transition-shadow duration-200 hover:-translate-y-1">
                          <button
                            className="w-full text-left p-2"
                            onClick={() => addToCart(item)}
                            disabled={!item.isAvailable}
                          >
                             {!item.isAvailable && (
                                <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center">
                                    <span className="font-bold text-destructive">Unavailable</span>
                                </div>
                            )}
                            <h3 className="font-semibold truncate text-sm sm:text-base">{item.name}</h3>
                             <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                            <p className="text-sm flex items-center mt-1">
                              <IndianRupee className="h-3.5 w-3.5 mr-1" />
                              {item.price.toFixed(2)}
                            </p>
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
                            <TabsTrigger value="dine-in"><Utensils className="mr-0 sm:mr-2 h-4 w-4"/> <span className='hidden sm:inline'>Dine-In</span></TabsTrigger>
                            <TabsTrigger value="takeaway"><Package className="mr-0 sm:mr-2 h-4 w-4"/> <span className='hidden sm:inline'>Takeaway</span></TabsTrigger>
                            <TabsTrigger value="delivery"><Truck className="mr-0 sm:mr-2 h-4 w-4"/> <span className='hidden sm:inline'>Delivery</span></TabsTrigger>
                        </TabsList>
                        <CardDescription asChild className="space-y-2 pt-4">
                            <div>
                                {activeOrder.orderType === 'dine-in' && (
                                    <Select value={activeOrder.tableId} onValueChange={(value) => updateOrder(activeOrder.id, { tableId: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Table" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tables.map(table => (
                                                <SelectItem key={table.id} value={table.id} disabled={table.status !== 'vacant'}>
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
                                <div className='flex-1 text-left'>
                                    <button onClick={() => openNoteEditor(item)}>
                                        <p className="font-semibold text-sm">{item.name}</p>
                                    </button>
                                     <div className="flex items-center gap-2">
                                        <p className="text-sm text-muted-foreground flex items-center">
                                            <IndianRupee className="h-3.5 w-3.5 mr-1" />
                                            {item.price.toFixed(2)}
                                        </p>
                                        {item.quantity >= 2 && (
                                            <div className="flex items-center space-x-1">
                                                <Checkbox id={`bogo-${item.id}`} checked={!!item.isBogo} onCheckedChange={(checked) => toggleBogoForItem(item.id, !!checked)} />
                                                <Label htmlFor={`bogo-${item.id}`} className="text-xs">BOGO</Label>
                                            </div>
                                        )}
                                     </div>
                                    {item.notes && <p className='text-xs text-amber-700 dark:text-amber-500 flex items-center gap-1'><MessageSquarePlus className="h-3 w-3"/> {item.notes}</p>}
                                </div>
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
                                {bogoDiscount > 0 && !settings.isComplimentary && (
                                    <div className="flex justify-between text-destructive">
                                    <span>BOGO Discount</span>
                                    <span className='flex items-center'>- <IndianRupee className="h-4 w-4 mx-1" />{bogoDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                {discountAmount > 0 && !settings.isComplimentary && (
                                    <div className="flex justify-between text-destructive">
                                    <span>Discount ({settings.discountValue}{settings.discountType === 'percentage' ? '%' : ''})</span>
                                    <span className='flex items-center'>- <IndianRupee className="h-4 w-4 mx-1" />{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                 <div className="flex justify-between">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <div className="flex items-center gap-2 cursor-pointer">
                                        <span>GST ({manualTaxRate !== null ? manualTaxRate : settings.taxAmount}%)</span>
                                        <Tag className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64">
                                      <div className="grid gap-4">
                                        <div className="space-y-2">
                                          <h4 className="font-medium leading-none">Manual Tax</h4>
                                          <p className="text-sm text-muted-foreground">
                                            Enter a tax rate to override the default.
                                          </p>
                                        </div>
                                        <div className="grid gap-2">
                                          <Label htmlFor="manual-tax">Tax Rate (%)</Label>
                                          <Input
                                            id="manual-tax"
                                            type="number"
                                            value={manualTaxRate ?? ""}
                                            onChange={(e) => setManualTaxRate(e.target.value === '' ? null : Number(e.target.value))}
                                            placeholder="e.g., 18"
                                          />
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                <span className={cn('flex items-center', settings.isComplimentary && settings.disableTaxOnComplimentary && 'line-through')}>
                                    <IndianRupee className="h-4 w-4 mr-1" />
                                    {tax.toFixed(2)}
                                </span>
                                </div>
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
                                {activeOrder.orderType === 'dine-in' && activeOrder.tableId ? tables.find(t => t.id === activeOrder.tableId)?.name : `${activeOrder.orderType} - ${activeOrder.customer.name}`}
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
                                {bogoDiscount > 0 && !settings.isComplimentary && (
                                    <div className="flex justify-between text-destructive">
                                    <span>BOGO Discount</span>
                                    <span className='flex items-center'>- <IndianRupee className="h-3.5 w-3.5 mr-1" />{bogoDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                {discountAmount > 0 && !settings.isComplimentary && (
                                <div className="flex justify-between text-destructive">
                                    <span>Discount</span>
                                    <span className='flex items-center'>- <IndianRupee className="inline-block h-3.5 w-3.5 mr-1"/>{discountAmount.toFixed(2)}</span>
                                </div>
                               )}
                                {tax > 0 && (
                                <div className="flex justify-between">
                                    <span>GST ({manualTaxRate !== null ? manualTaxRate : settings.taxAmount}%)</span>
                                    <span className={cn('flex items-center', settings.isComplimentary && settings.disableTaxOnComplimentary && 'line-through')}><IndianRupee className="inline-block h-3.5 w-3.5 mr-1"/>{tax.toFixed(2)}</span>
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
