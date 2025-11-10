

'use client';

import * as React from 'react';
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
import type { MenuItem, OrderItem, OrderType, AppOrder, MenuItemAddon, MealDeal, Customer } from '@/lib/types';
import { CheckCircle, IndianRupee, Mail, MessageSquarePlus, MinusCircle, Package, PauseCircle, Phone, PlayCircle, PlusCircle, Printer, Search, Send, Sparkles, ShoppingBag, Tag, Truck, User, Utensils, X, Gift, Award } from 'lucide-react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CustomerSearch } from '@/components/pos/CustomerSearch';


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
    customers,
    updateCustomer
  } = useAppContext();
  const { settings, setSetting } = useSettings();
  
  const activeOrder = useMemo(() => orders.find(o => o.id === activeOrderId), [orders, activeOrderId]);
  const activeCustomer = useMemo(() => {
    if (!activeOrder?.customer.phone) return null;
    return customers.find(c => c.phone === activeOrder.customer.phone) || null;
  }, [customers, activeOrder?.customer.phone]);

  const [activeCategory, setActiveCategory] = useState(menuCategories[0].id);
  
  const [customizationItem, setCustomizationItem] = useState<MenuItem | null>(null);
  const [mealUpsellParentItem, setMealUpsellParentItem] = useState<OrderItem | null>(null);
  const [noteEditingItem, setNoteEditingItem] = useState<OrderItem | null>(null);
  const [isHeldBillsOpen, setIsHeldBillsOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState<number | string>('');
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [billSearchQuery, setBillSearchQuery] = useState('');
  const [manualTaxRate, setManualTaxRate] = useState<number | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  
  const updateActiveOrder = (items: OrderItem[], redeemedPoints?: number) => {
    if (activeOrderId) {
      const updates: Partial<AppOrder> = { items };
      if (redeemedPoints !== undefined) {
        updates.redeemedPoints = redeemedPoints;
      }
      updateOrder(activeOrderId, updates);
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
         const menuItem = menuItems.find(mi => mi.id === item.id);
         const isBogoActive = menuItem?.isBogo ? (parseInt(settings.defaultQuantity, 10) || 1) >= 2 : false;
         const newOrderItem: OrderItem = {
          id: uniqueCartId,
          baseMenuItemId: item.id,
          name: item.name,
          quantity: parseInt(settings.defaultQuantity, 10) || 1,
          price: item.price,
          totalPrice: item.price * (parseInt(settings.defaultQuantity, 10) || 1),
          isMealParent: !!item.mealDeal,
          isBogo: isBogoActive,
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
        const menuItem = menuItems.find(mi => mi.id === customizationItem.id);
        const isBogoActive = menuItem?.isBogo ? 1 >= 2 : false;
        const newOrderItem: OrderItem = {
          id: uniqueCartId,
          baseMenuItemId: customizationItem.id,
          name: finalName,
          quantity: 1,
          price: basePrice,
          totalPrice: basePrice,
          variation: selectedVariation,
          notes: notes || undefined,
          isMealParent: !!customizationItem.mealDeal,
          isBogo: isBogoActive,
        };
        updateActiveOrder([...activeOrder.items, newOrderItem]);
    }

    setCustomizationItem(null);
  };
  
    const handleAddMeal = (sideId: string, drinkId: string) => {
    if (!mealUpsellParentItem || !activeOrder) return;

    const parentItem = menuItems.find(m => m.id === mealUpsellParentItem.baseMenuItemId);
    if (!parentItem || !parentItem.mealDeal) return;

    const sideItem = menuItems.find(m => m.id === sideId);
    const drinkItem = menuItems.find(m => m.id === drinkId);

    if (!sideItem || !drinkItem) {
        toast({ title: "Error", description: "Selected side or drink not found.", variant: "destructive" });
        return;
    }
    
    const mealDealItem: OrderItem = {
        id: `meal-deal-${mealUpsellParentItem.id}`,
        baseMenuItemId: 'meal-deal',
        name: 'Meal Deal',
        quantity: mealUpsellParentItem.quantity,
        price: parentItem.mealDeal.upsellPrice,
        totalPrice: parentItem.mealDeal.upsellPrice * mealUpsellParentItem.quantity,
        isMealChild: true,
        mealParentId: mealUpsellParentItem.id,
    };
    
    const mealSide: OrderItem = {
        id: `meal-side-${mealUpsellParentItem.id}`,
        baseMenuItemId: sideItem.id,
        name: sideItem.name,
        quantity: mealUpsellParentItem.quantity,
        price: 0,
        totalPrice: 0,
        isMealChild: true,
        mealParentId: mealUpsellParentItem.id,
    };

    const mealDrink: OrderItem = {
        id: `meal-drink-${mealUpsellParentItem.id}`,
        baseMenuItemId: drinkItem.id,
        name: drinkItem.name,
        quantity: mealUpsellParentItem.quantity,
        price: 0,
        totalPrice: 0,
        isMealChild: true,
        mealParentId: mealUpsellParentItem.id,
    };

    const updatedParentItem: OrderItem = {
        ...mealUpsellParentItem,
        isMealParent: false, // Turn off the prompt
    };

    const parentIndex = activeOrder.items.findIndex(item => item.id === mealUpsellParentItem.id);
    const newItems = [...activeOrder.items];
    
    newItems[parentIndex] = updatedParentItem;
    // Insert meal items right after the parent
    newItems.splice(parentIndex + 1, 0, mealDealItem, mealSide, mealDrink);
    
    updateActiveOrder(newItems);
    setMealUpsellParentItem(null); // Close the selector
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
      const updatedItems = activeOrder.items.map(item => {
          if (item.id === itemId) {
            const menuItem = menuItems.find(mi => mi.id === item.baseMenuItemId);
            const isBogoActive = menuItem?.isBogo ? newQuantity >= 2 : (item.isBogo || false);
            return { ...item, quantity: newQuantity, totalPrice: item.price * newQuantity, isBogo: isBogoActive };
          }
          return item;
        });
      updateActiveOrder(updatedItems);
    }
  };

  const removeFromCart = (itemId: string) => {
    if (!activeOrder) return;
    // Also remove associated meal items
    const updatedItems = activeOrder.items.filter(item => item.id !== itemId && item.mealParentId !== itemId);
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
    
    // In a real app with a backend, we'd persist the completed order here.
    // For now, we just reset the state.

    // If points were redeemed, update the customer's loyalty points
    if (activeOrder && activeOrder.redeemedPoints > 0 && activeCustomer) {
      const newPoints = activeCustomer.loyaltyPoints - activeOrder.redeemedPoints;
      updateCustomer(activeCustomer.id, { loyaltyPoints: newPoints });
    }

    if (orders.length === 1) {
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
    setPointsToRedeem(0);
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
    
    return activeOrder.items.reduce((totalDiscount, item) => {
      if (item.isBogo && item.quantity >= 2) {
        const freeItemsCount = Math.floor(item.quantity / 2);
        return totalDiscount + freeItemsCount * item.price;
      }
      return totalDiscount;
    }, 0);
    
  }, [activeOrder]);

  let pointsDiscount = activeOrder?.redeemedPoints || 0;
  
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

    let taxableAmount = totalBeforeTaxAndDiscount - discountAmount - pointsDiscount;
    
    if (settings.calculateTaxBeforeDiscount) {
      taxableAmount = totalBeforeTaxAndDiscount;
    }
    
    if (settings.calculateBackwardTax) {
      const total = totalBeforeTaxAndDiscount - discountAmount - pointsDiscount;
      return total - (total / (1 + (taxRate / 100)));
    }
    
    return taxableAmount * (taxRate / 100);
  }, [settings.calculateTaxBeforeDiscount, settings.calculateBackwardTax, settings.taxAmount, totalBeforeTaxAndDiscount, discountAmount, pointsDiscount, manualTaxRate]);


  let total = totalBeforeTaxAndDiscount - discountAmount - pointsDiscount + tax;

  if (settings.isComplimentary) {
      total = 0;
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
              width: 72mm;
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
              padding: 1mm;
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
            .meal-item { font-size: 11px; padding-left: 15px; color: #333; }
            
            .totals { 
              display: block;
              margin-top: 5px; 
              font-size: 12px; 
            }
            .totals .row { display: flex; justify-content: space-between; }
            .totals .grand-total { font-size: 16px; font-weight: bold; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${settings.printCafeName}</h2>
              <p>${settings.printAddress.replace(/\\n/g, '<br>')}</p>
              ${settings.printCustomDetails ? `<p>${settings.printCustomDetails.replace(/\\n/g, '<br>')}</p>` : ''}
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
                ${activeOrder.items.map((item, index) => {
                  if (item.isMealChild) return ''; // Skip meal children, they are handled under parent
                  let itemHtml = `
                    <tr>
                      <td>${index + 1}</td>
                      <td class="col-item">${item.name.replace(/\\s\\(.*\\)/, '')}</td>
                      <td class="col-qty">${item.quantity}</td>
                      <td class="col-price">${item.price.toFixed(2)}</td>
                      <td class="col-amount">${item.totalPrice.toFixed(2)}</td>
                    </tr>
                    ${item.variation && item.variation.name !== 'Regular' ? `<tr><td></td><td colspan="4" class="item-variation">(${item.variation.name})</td></tr>` : ''}
                    ${item.notes ? `<tr><td></td><td colspan="4" class="notes">- ${item.notes}</div></td></tr>` : ''}`;

                  const mealItems = activeOrder.items.filter(i => i.mealParentId === item.id);
                  if (mealItems.length > 0) {
                      const mealDealItem = mealItems.find(i => i.baseMenuItemId === 'meal-deal');
                      if (mealDealItem) {
                         itemHtml += `
                           <tr>
                              <td></td>
                              <td class="col-item meal-item">+ ${mealDealItem.name}</td>
                              <td class="col-qty"></td>
                              <td class="col-price">${mealDealItem.price.toFixed(2)}</td>
                              <td class="col-amount">${mealDealItem.totalPrice.toFixed(2)}</td>
                           </tr>`;
                      }
                      mealItems.forEach(mealItem => {
                        if (mealItem.baseMenuItemId !== 'meal-deal') {
                           itemHtml += `
                           <tr>
                              <td></td>
                              <td colspan="4" class="col-item meal-item">+ ${mealItem.name}</td>
                           </tr>`;
                        }
                      });
                  }

                  return itemHtml;
                }).join('')}
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
               ${pointsDiscount > 0 ? `<div class="row"><span>Points Redeemed</span><span>- ${pointsDiscount.toFixed(2)}</span></div>` : ''}
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
            .meal-item { font-size: 11px; padding-left: 15px; color: #333; }
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
                ${activeOrder.items.map((item) => {
                  if(item.baseMenuItemId === 'meal-deal') return ''; // Don't print the deal itself
                  let itemHtml = `
                    <tr>
                      <td class="col-qty">${item.quantity}x</td>
                      <td class="col-item">
                        <div class="item-name">${item.name.replace(/\\s\\(.*\\)/, '')} ${item.isMealChild && item.mealParentId ? '(Meal)' : ''}</div>
                        ${item.variation && item.variation.name !== 'Regular' ? `<div class="item-variation">(${item.variation.name})</div>` : ''}
                        ${item.notes ? `<div class="notes">- ${item.notes}</div>` : ''}
                      </td>
                    </tr>`;
                    
                  if(!item.isMealChild) {
                     const mealChildren = activeOrder.items.filter(i => i.mealParentId === item.id);
                     if(mealChildren.length > 0) {
                        mealChildren.forEach(child => {
                            if(child.baseMenuItemId !== 'meal-deal') {
                                itemHtml += `
                                <tr>
                                    <td class="col-qty"></td>
                                    <td class="col-item meal-item">+ ${child.name} (Meal)</td>
                                </tr>`;
                            }
                        })
                     }
                  }
                  
                  return itemHtml;
                }).join('')}
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
    setIsPaymentDialogOpen(false);
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

      console.log('--- SIMULATING SMS ---');
      console.log(`To: ${activeOrder.customer.phone}`);
      console.log(`Message: ${result.smsContent}`);
      console.log('--------------------');
      
      toast({
          title: "eBill Sent",
          description: `SMS bill sent to ${activeOrder.customer.phone}.`,
      });

      resetCurrentOrder();
      setIsPaymentDialogOpen(false);
    } catch (error) {
      console.error("Error generating or sending eBill:", error);
      toast({
          variant: "destructive",
          title: "Failed to Send eBill",
          description: "There was a problem generating the bill content.",
      });
    }
  }

  const handleRedeemPoints = () => {
    if (!activeOrder) return;

    if (pointsToRedeem > (activeCustomer?.loyaltyPoints || 0)) {
        toast({ title: "Error", description: "Cannot redeem more points than available.", variant: "destructive" });
        return;
    }

    if (pointsToRedeem > total) {
        toast({ title: "Error", description: "Redemption value cannot exceed bill total.", variant: "destructive" });
        return;
    }

    updateOrder(activeOrder.id, { redeemedPoints: pointsToRedeem });
    toast({ title: "Points Applied", description: `${pointsToRedeem} points have been redeemed as a discount.` });
  };

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
  
  const findImage = (itemId: string) => {
    const item = menuItems.find(m => m.id === itemId);
    const id = item?.name.toLowerCase().split(' ')[0].replace(/[^a-z]/g, '');
    const placeholder = PlaceHolderImages.find(p => p.id.startsWith(id || ''));
    return placeholder?.imageUrl || "https://picsum.photos/seed/placeholder/200/200";
  }

  useEffect(() => {
    if (activeOrder && activeOrder.items.length === 0) {
      setManualTaxRate(null);
      setPointsToRedeem(0);
      updateOrder(activeOrder.id, { redeemedPoints: 0 });
    }
  }, [activeOrder?.items.length]);

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
                        <Card key={item.id} className="overflow-hidden relative shadow-md hover:shadow-xl transition-shadow duration-200 hover:-translate-y-1 flex flex-col">
                          <button
                            className="w-full text-left p-2 flex-1 flex flex-col"
                            onClick={() => addToCart(item)}
                            disabled={!item.isAvailable}
                          >
                             {!item.isAvailable && (
                                <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center">
                                    <span className="font-bold text-destructive">Unavailable</span>
                                </div>
                            )}
                            {settings.displayItemImages && (
                              <div className="aspect-video relative w-full mb-2">
                                <Image 
                                  src={findImage(item.id)}
                                  alt={item.name}
                                  fill
                                  className="object-cover rounded-md"
                                />
                              </div>
                            )}
                            <div className="flex-1 flex flex-col">
                                <h3 className="font-semibold text-sm sm:text-base">{item.name}</h3>
                                <p className="text-xs text-muted-foreground whitespace-normal flex-1">{item.description}</p>
                                <p className="text-sm flex items-center mt-auto pt-1">
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
                        <div 
                          onClick={(e) => { e.stopPropagation(); removeOrder(order.id); }}
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs"
                        >
                          <X className="h-3 w-3"/>
                        </div>
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
                        <CardDescription>
                          <div className='py-4 space-y-2'>
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
                              <CustomerSearch 
                                activeOrder={activeOrder}
                                onCustomerSelect={(customer) => updateOrder(activeOrder.id, { customer })}
                              />
                          </div>
                        </CardDescription>
                        </Tabs>
                         {activeCustomer && (
                            <div className="mt-2 text-sm text-center bg-muted/50 p-2 rounded-md">
                                <span className='font-semibold'>{activeCustomer.name}</span> has <span className='font-bold text-primary'>{activeCustomer.loyaltyPoints - (activeOrder.redeemedPoints || 0)}</span> points available.
                            </div>
                        )}
                    </div>
                    <CardContent className="flex-1 overflow-y-auto pt-0">
                        {activeOrder.items.length === 0 ? (
                        <p className="text-muted-foreground">No items in order.</p>
                        ) : (
                        <div className="space-y-2">
                            {activeOrder.items.map(item => (
                            <div key={item.id}>
                                <div className="flex items-start">
                                    <div className='flex-1 text-left'>
                                        <button onClick={() => openNoteEditor(item)} disabled={item.isMealChild}>
                                            <p className={cn("font-semibold text-sm", item.isMealChild && "pl-4 text-muted-foreground")}>{item.name}</p>
                                        </button>
                                         {!item.isMealChild && (
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
                                         )}
                                        {item.notes && <p className='text-xs text-amber-700 dark:text-amber-500 flex items-center gap-1'><MessageSquarePlus className="h-3 w-3"/> {item.notes}</p>}
                                    </div>
                                    <div className={cn("flex items-center gap-1 sm:gap-2", item.isMealChild && "opacity-0 pointer-events-none")}>
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
                                    <p className={cn("w-20 text-right font-semibold flex items-center justify-end text-sm", item.isMealChild && "text-muted-foreground")}>
                                    <IndianRupee className="h-3.5 w-3.5 mr-1" />
                                    {item.totalPrice.toFixed(2)}
                                    </p>
                                    <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-6 w-6 ml-1 sm:ml-2 text-destructive", item.isMealChild && "opacity-0 pointer-events-none")}
                                    onClick={() => removeFromCart(item.id)}
                                    >
                                    <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                {item.isMealParent && (
                                    <div className="pl-4 mt-1">
                                        <Button size="sm" variant="outline" className="h-auto py-1" onClick={() => setMealUpsellParentItem(item)}>
                                            <Sparkles className="h-3 w-3 mr-2 text-amber-500"/> Make it a Meal
                                        </Button>
                                    </div>
                                )}
                            </div>
                            ))}
                        </div>
                        )}
                    </CardContent>
                    {activeOrder.items.length > 0 && (
                        <CardFooter className='flex-col items-stretch gap-2 !p-4 border-t'>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <div className="flex items-center gap-1">
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
                                                  <ToggleGroupItem value="fixed">Fixed</ToggleGroupItem>
                                                  <ToggleGroupItem value="percentage">Percentage</ToggleGroupItem>
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
                                      {activeCustomer && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"><Award /></Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-72">
                                                <div className="grid gap-4">
                                                     <div className="space-y-2">
                                                        <h4 className="font-medium leading-none">Redeem Loyalty Points</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Available: <span className="font-bold">{activeCustomer.loyaltyPoints} points</span>
                                                        </p>
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <Input type="number" value={pointsToRedeem || ''} onChange={(e) => setPointsToRedeem(Number(e.target.value))} placeholder="Points to redeem"/>
                                                            <Button onClick={handleRedeemPoints}>Apply</Button>
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
                                {pointsDiscount > 0 && !settings.isComplimentary && (
                                    <div className="flex justify-between text-destructive">
                                        <span>Points Redeemed</span>
                                        <span className='flex items-center'>- <IndianRupee className="h-4 w-4 mx-1" />{pointsDiscount.toFixed(2)}</span>
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
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => setIsPaymentDialogOpen(true)} disabled={!settings.isComplimentary && !settings.finalizeWithoutAmount && total > 0 && !amountPaid}>
                                <IndianRupee className="mr-2 h-4 w-4" /> {settings.discountButtonText || 'Generate Bill'}
                            </Button>
                        </CardFooter>
                    )}
                </div>
        </Card>
      </div>
        
        {/* Make a Meal Dialog */}
        <MealUpsellDialog
            parentItem={mealUpsellParentItem}
            onClose={() => setMealUpsellParentItem(null)}
            onAddMeal={handleAddMeal}
        />

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
                           {activeOrder.items.map(item => {
                                if (item.isMealChild) return null;
                                return (
                                <React.Fragment key={item.id}>
                                   <div className="flex justify-between">
                                       <span>{item.quantity} x {item.name}</span>
                                       <span className={cn('flex items-center', settings.isComplimentary && 'line-through')}>
                                           <IndianRupee className="inline-block h-3.5 w-3.5 mr-1"/>
                                           {item.price.toFixed(2)}
                                        </span>
                                   </div>
                                   {activeOrder.items.filter(i => i.mealParentId === item.id).map(mealItem => (
                                       <div key={mealItem.id} className="pl-4 text-xs text-muted-foreground flex justify-between">
                                           <span>+ {mealItem.name}</span>
                                           <span>
                                                {mealItem.baseMenuItemId === 'meal-deal' ? 
                                                    <span className='flex items-center'><IndianRupee className="inline-block h-3 w-3 mr-1"/>{mealItem.price.toFixed(2)}</span>
                                                    : '(Meal)'
                                                }
                                           </span>
                                       </div>
                                   ))}
                               </React.Fragment>
                               )
                           })}
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
                               {pointsDiscount > 0 && !settings.isComplimentary && (
                                <div className="flex justify-between text-destructive">
                                    <span>Points Redeemed</span>
                                    <span className='flex items-center'>- <IndianRupee className="inline-block h-3.5 w-3.5 mr-1"/>{pointsDiscount.toFixed(2)}</span>
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
                       <Button onClick={() => { resetCurrentOrder(); setIsPaymentDialogOpen(false); }} className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={!settings.isComplimentary && !settings.finalizeWithoutAmount && total > 0 && !amountPaid}>
                        <CheckCircle className="mr-2"/> Confirm Payment
                      </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}

interface MealUpsellDialogProps {
  parentItem: OrderItem | null;
  onClose: () => void;
  onAddMeal: (sideId: string, drinkId: string) => void;
}

function MealUpsellDialog({ parentItem, onClose, onAddMeal }: MealUpsellDialogProps) {
    const parentMenuItem = useMemo(() => parentItem ? menuItems.find(m => m.id === parentItem.baseMenuItemId) : null, [parentItem]);
    const mealDeal = parentMenuItem?.mealDeal;

    const [selectedSide, setSelectedSide] = useState<string>('');
    const [selectedDrink, setSelectedDrink] = useState<string>('');

    const sideItems = useMemo(() => {
        if (!mealDeal) return [];
        return menuItems.filter(item => mealDeal.sideItemIds.includes(item.id));
    }, [mealDeal]);

    const drinkItems = useMemo(() => {
        if (!mealDeal) return [];
        return menuItems.filter(item => mealDeal.drinkItemIds.includes(item.id));
    }, [mealDeal]);

    useEffect(() => {
        if (parentItem) {
            if (sideItems.length > 0) setSelectedSide(sideItems[0].id);
            if (drinkItems.length > 0) setSelectedDrink(drinkItems[0].id);
        } else {
            setSelectedSide('');
            setSelectedDrink('');
        }
    }, [parentItem, sideItems, drinkItems]);
    
    if (!parentItem || !mealDeal) return null;

    const handleConfirm = () => {
        if (!selectedSide || !selectedDrink) {
            alert("Please select a side and a drink.");
            return;
        }
        onAddMeal(selectedSide, selectedDrink);
    }

    return (
        <Dialog open={!!parentItem} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Make it a Meal!</DialogTitle>
                    <DialogDescription>
                        Add a side and a drink to your {parentMenuItem?.name} for just <IndianRupee className="inline h-4 w-4"/>{mealDeal.upsellPrice} more.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label>Choose a Side</Label>
                        <Select value={selectedSide} onValueChange={setSelectedSide}>
                            <SelectTrigger><SelectValue placeholder="Select a side..." /></SelectTrigger>
                            <SelectContent>
                                {sideItems.map(item => (
                                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Choose a Drink</Label>
                         <Select value={selectedDrink} onValueChange={setSelectedDrink}>
                            <SelectTrigger><SelectValue placeholder="Select a drink..." /></SelectTrigger>
                            <SelectContent>
                                {drinkItems.map(item => (
                                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={!selectedSide || !selectedDrink}>Add Meal</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

    

    