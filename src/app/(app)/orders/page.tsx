'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { menuCategories, menuItems, tables } from '@/lib/data';
import type { OrderItem, MenuItem, OrderType } from '@/lib/types';
import { PlusCircle, MinusCircle, X, Send, IndianRupee, Printer, CheckCircle, User, Phone, Utensils, Package, Truck } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function OrdersPage() {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [activeCategory, setActiveCategory] = useState(menuCategories[0].id);
  const [orderType, setOrderType] = useState<OrderType>('Dine-In');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customizationItem, setCustomizationItem] = useState<MenuItem | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState<number | string>('');
  const { toast } = useToast();

  const addToCart = (item: MenuItem) => {
    // Check for variations or addons to open customization dialog
    if (item.variations || item.addons) {
      setCustomizationItem(item);
    } else {
      const existingItem = cart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        updateQuantity(item.id, existingItem.quantity + 1);
      } else {
        const newOrderItem: OrderItem = {
          id: item.id,
          name: item.name,
          quantity: 1,
          price: item.price,
          totalPrice: item.price,
        };
        setCart([...cart, newOrderItem]);
      }
    }
  };

  const handleCustomizationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customizationItem) return;

    const formData = new FormData(e.currentTarget);
    const variationId = formData.get('variation') as string;
    const notes = formData.get('notes') as string;

    const selectedVariation = customizationItem.variations?.find(v => v.id === variationId);
    
    let basePrice = customizationItem.price;
    let finalName = customizationItem.name;

    if (selectedVariation) {
      basePrice += selectedVariation.priceModifier;
      finalName += ` (${selectedVariation.name})`;
    }
    
    // Addon logic to be implemented here

    const newOrderItem: OrderItem = {
      id: `${customizationItem.id}-${Date.now()}`,
      name: finalName,
      quantity: 1,
      price: basePrice,
      totalPrice: basePrice,
      variation: selectedVariation,
      notes,
    };

    setCart([...cart, newOrderItem]);
    setCustomizationItem(null);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      setCart(
        cart.map(item =>
          item.id === itemId
            ? { ...item, quantity: newQuantity, totalPrice: item.price * newQuantity }
            : item
        )
      );
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };
  
  const resetOrder = () => {
    setCart([]);
    setSelectedTable('');
    setCustomerName('');
    setCustomerPhone('');
    setAmountPaid('');
    setIsPaymentDialogOpen(false);
  }
  
  const handleSendToKitchen = () => {
    toast({
      title: "Order Sent!",
      description: "The order has been sent to the kitchen for preparation.",
    });
  };

  const subTotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const tax = subTotal * 0.05; // 5% GST
  const total = subTotal + tax;
  const changeDue = Number(amountPaid) > total ? Number(amountPaid) - total : 0;
  
  const isOrderDetailsComplete = () => {
    if (orderType === 'Dine-In') return !!selectedTable;
    if (orderType === 'Takeaway' || orderType === 'Delivery') return !!customerName && !!customerPhone;
    return false;
  };

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Menu Section */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Point of Sale</CardTitle>
             <Tabs
              defaultValue={activeCategory}
              onValueChange={setActiveCategory}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                {menuCategories.map(category => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 pr-4">
                    {menuItems
                      .filter(item => item.category === activeCategory)
                      .map(item => (
                        <Card key={item.id} className="overflow-hidden">
                          <button
                            className="w-full text-left"
                            onClick={() => addToCart(item)}
                            disabled={!item.isAvailable}
                          >
                            <div className="relative aspect-video">
                                <Image src={item.imageUrl} alt={item.name} fill objectFit="cover" data-ai-hint={item.imageHint}/>
                                {!item.isAvailable && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="text-white font-bold">Unavailable</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-2">
                              <h3 className="font-semibold truncate">{item.name}</h3>
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
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Current Order</CardTitle>
            <Tabs value={orderType} onValueChange={(value) => setOrderType(value as OrderType)} className="w-full pt-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="Dine-In"><Utensils className="mr-2"/>Dine-In</TabsTrigger>
                <TabsTrigger value="Takeaway"><Package className="mr-2"/>Takeaway</TabsTrigger>
                <TabsTrigger value="Delivery"><Truck className="mr-2"/>Delivery</TabsTrigger>
              </TabsList>
              <CardDescription className="space-y-2 pt-4">
                 {orderType === 'Dine-In' && (
                    <Select value={selectedTable} onValueChange={setSelectedTable}>
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
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Customer Name" className="pl-10" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Phone Number" className="pl-10" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                    </div>
                  </div>
              </CardDescription>
            </Tabs>
          </CardHeader>
          <CardContent className="h-[calc(100%-14rem)] overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-muted-foreground">No items in order.</p>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-start">
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <IndianRupee className="h-3.5 w-3.5 mr-1" />
                        {item.price.toFixed(2)}
                      </p>
                      {item.notes && <p className='text-xs text-amber-700 dark:text-amber-500'>Notes: {item.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="w-20 text-right font-semibold flex items-center justify-end">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {item.totalPrice.toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-2 text-destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {cart.length > 0 && (
            <div className="p-6 border-t">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className='flex items-center'><IndianRupee className="h-4 w-4 mr-1" />{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className='flex items-center'><IndianRupee className="h-4 w-4 mr-1" />{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className='flex items-center'><IndianRupee className="h-5 w-5 mr-1" />{total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleSendToKitchen}><Send className="mr-2 h-4 w-4" /> Send to Kitchen</Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setIsPaymentDialogOpen(true)} disabled={!isOrderDetailsComplete()}>
                    <IndianRupee className="mr-2 h-4 w-4" /> Generate Bill
                </Button>
              </div>
            </div>
          )}
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
                        {customizationItem.variations && (
                            <div>
                                <label className="font-medium">Size</label>
                                <Select name="variation" defaultValue={customizationItem.variations[0].id}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customizationItem.variations.map(v => (
                                            <SelectItem key={v.id} value={v.id}>
                                                {v.name} (+<IndianRupee className="h-3.5 w-3.5 inline-block" />{v.priceModifier})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {/* Addon selection UI can be added here */}
                        <div>
                             <label className="font-medium">Notes</label>
                             <Textarea name="notes" placeholder="e.g. Extra hot, no sugar"/>
                        </div>
                        <Button type="submit" className="w-full">Add to Order</Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
        
        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Payment</DialogTitle>
                </DialogHeader>
                <Card>
                    <CardHeader>
                        <CardTitle>Bill Summary</CardTitle>
                        <CardDescription>
                          {orderType === 'Dine-In' ? tables.find(t => t.id === selectedTable)?.name : `${orderType} - ${customerName}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-2 text-sm">
                           {cart.map(item => (
                               <div key={item.id} className="flex justify-between">
                                   <span>{item.quantity} x {item.name}</span>
                                   <span>₹{item.totalPrice.toFixed(2)}</span>
                               </div>
                           ))}
                           <div className="flex justify-between font-bold pt-2 border-t">
                               <span>Total Amount</span>
                               <span>₹{total.toFixed(2)}</span>
                           </div>
                       </div>
                    </CardContent>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline">UPI / Card</Button>
                    <Button>Cash</Button>
                </div>
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
                {changeDue > 0 && (
                    <div className="text-center font-bold text-xl p-4 bg-muted rounded-md">
                        Change Due: ₹{changeDue.toFixed(2)}
                    </div>
                )}
                 <DialogFooter>
                    <Button variant="outline"><Printer className="mr-2" /> Print Bill</Button>
                    <Button onClick={resetOrder} className="bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="mr-2"/> Confirm Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}
