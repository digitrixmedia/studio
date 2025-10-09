
'use client';

import { useState } from 'react';
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { users } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const navItems = [
    { name: 'Display Settings', id: 'display' },
    { name: 'Default Values', id: 'defaults' },
    { name: 'Discount Settings', id: 'discount' },
    { name: 'Order Cancel Reasons', id: 'cancel' },
    { name: 'Table Settlement', id: 'settlement' },
]

export default function DisplaySettingsPage() {
    const { toast } = useToast();
    
    // State for Default Values settings
    const [defaultOrderType, setDefaultOrderType] = useState('Dine-In');
    const [defaultCustomer, setDefaultCustomer] = useState(users[0].id);
    const [defaultPayment, setDefaultPayment] = useState('Cash');
    const [defaultQuantity, setDefaultQuantity] = useState('1');
    const [finalizeWithoutAmount, setFinalizeWithoutAmount] = useState(true);

    // State for Discount settings
    const [discountLabel, setDiscountLabel] = useState('Coupon Code');
    const [discountButtonText, setDiscountButtonText] = useState('Apply');
    const [displayNoDiscount, setDisplayNoDiscount] = useState(true);
    const [defaultOpenDiscount, setDefaultOpenDiscount] = useState(false);
    const [enableOrderWiseInfo, setEnableOrderWiseInfo] = useState(false);
    const [allowNegativeQuantity, setAllowNegativeQuantity] = useState(false);

    // State for Table Settlement settings
    const [lockActiveTable, setLockActiveTable] = useState<'save-print' | 'settle-save' | 'none'>('settle-save');
    const [releaseTableOn, setReleaseTableOn] = useState<'print-bill' | 'settle-save'>('settle-save');
    const [releaseRecentSectionOn, setReleaseRecentSectionOn] = useState<'print-bill' | 'settle-save'>('settle-save');
    const [releaseForOnlineOrders, setReleaseForOnlineOrders] = useState(false);


    const handleSaveChanges = () => {
        // In a real app, this would save to a context or backend.
        toast({
            title: 'Settings Saved',
            description: 'Your display settings have been updated.',
        });
        console.log({
            defaultOrderType,
            defaultCustomer,
            defaultPayment,
            defaultQuantity,
            finalizeWithoutAmount,
            discountLabel,
            discountButtonText,
            displayNoDiscount,
            defaultOpenDiscount,
            enableOrderWiseInfo,
            allowNegativeQuantity,
            lockActiveTable,
            releaseTableOn,
            releaseRecentSectionOn,
            releaseForOnlineOrders,
        });
    };


    return (
        <SettingsPageLayout navItems={navItems}>
             {(activeTab) => (
                <>
                    {activeTab === 'display' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Display Settings</CardTitle>
                                <CardDescription>Manage general display preferences.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>General display settings will go here.</p>
                            </CardContent>
                        </Card>
                    )}
                    {activeTab === 'defaults' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Default Values</CardTitle>
                                <CardDescription>Set default values for various operations to speed up the ordering process.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="default-order-type">Default Order Type</Label>
                                        <Select value={defaultOrderType} onValueChange={setDefaultOrderType}>
                                            <SelectTrigger id="default-order-type">
                                                <SelectValue placeholder="Select order type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Dine-In">Dine-In</SelectItem>
                                                <SelectItem value="Takeaway">Takeaway</SelectItem>
                                                <SelectItem value="Delivery">Delivery</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="default-customer">Default Customer</Label>
                                        <Select value={defaultCustomer} onValueChange={setDefaultCustomer}>
                                            <SelectTrigger id="default-customer">
                                                <SelectValue placeholder="Select a customer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map(user => (
                                                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="default-payment">Default Payment Type</Label>
                                        <Select value={defaultPayment} onValueChange={setDefaultPayment}>
                                            <SelectTrigger id="default-payment">
                                                <SelectValue placeholder="Select payment type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                                <SelectItem value="UPI">UPI / Card</SelectItem>
                                                <SelectItem value="Due">Due</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="default-quantity">Default Quantity</Label>
                                        <Input
                                            id="default-quantity"
                                            type="number"
                                            value={defaultQuantity}
                                            onChange={(e) => setDefaultQuantity(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                  <div>
                                    <h4 className="font-medium">Finalize Order without Amount</h4>
                                    <p className="text-sm text-muted-foreground">
                                      If enabled, the finalize button will be active even if the paid amount is zero.
                                    </p>
                                  </div>
                                  <Switch
                                    checked={finalizeWithoutAmount}
                                    onCheckedChange={setFinalizeWithoutAmount}
                                    aria-label="Finalize order without amount"
                                  />
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Button onClick={handleSaveChanges}>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    )}
                    {activeTab === 'discount' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Discount Settings</CardTitle>
                                <CardDescription>Configure how discounts are applied and displayed in the billing screen.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Discount</h3>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                            <Label htmlFor="discount-label" className='md:text-right'>Discount Label</Label>
                                            <div className='md:col-span-2'>
                                                <Input id="discount-label" value={discountLabel} onChange={e => setDiscountLabel(e.target.value)} />
                                                <p className="text-xs text-muted-foreground mt-1">This setting would describe what the discount would be displayed as.</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                            <Label htmlFor="discount-button-text" className='md:text-right'>Discount Calculate Button Text *</Label>
                                            <Input id="discount-button-text" className='md:col-span-2' value={discountButtonText} onChange={e => setDiscountButtonText(e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                             <div className="md:col-start-2 md:col-span-2 space-y-4">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="display-no-discount" checked={displayNoDiscount} onCheckedChange={checked => setDisplayNoDiscount(Boolean(checked))} />
                                                    <Label htmlFor="display-no-discount">Display "Leave as it is. (No Discount)" on Discount Screen?</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="default-open-discount" checked={defaultOpenDiscount} onCheckedChange={checked => setDefaultOpenDiscount(Boolean(checked))} />
                                                    <div>
                                                        <Label htmlFor="default-open-discount">By default make discount area open</Label>
                                                        <p className="text-xs text-muted-foreground">This settings enables default display of discount area in billing screen</p>
                                                    </div>
                                                </div>
                                             </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />
                                
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Order Wise Information</h3>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="enable-order-wise-info" checked={enableOrderWiseInfo} onCheckedChange={checked => setEnableOrderWiseInfo(Boolean(checked))}/>
                                        <div>
                                            <Label htmlFor="enable-order-wise-info">Enable Order wise information</Label>
                                            <p className="text-xs text-muted-foreground">The following settings helps in configures enabling as well as configuring Order wise information</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <Separator />

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Negative Quantity Settings</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Negative Quantity Reason</Label>
                                            <p className="text-sm text-muted-foreground">This setting is only available in cloud login.</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="allow-negative-quantity" checked={allowNegativeQuantity} onCheckedChange={checked => setAllowNegativeQuantity(Boolean(checked))}/>
                                            <Label htmlFor="allow-negative-quantity">Allow negative quantity</ Label>
                                        </div>
                                    </div>
                                </div>

                            </CardContent>
                             <CardFooter>
                                <Button onClick={handleSaveChanges}>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    )}
                    {activeTab === 'cancel' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Cancel Reasons</CardTitle>
                                <CardDescription>Manage predefined reasons for cancelling an order.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Order cancel reason settings will go here.</p>
                            </CardContent>
                        </Card>
                    )}
                    {activeTab === 'settlement' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Table Settlement</CardTitle>
                                <CardDescription>The following settings helps in configuring locking and releasing table in billing screen.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <RadioGroup value={lockActiveTable} onValueChange={(value) => setLockActiveTable(value as any)}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                        <Label className='md:text-right'>Lock Active Table :</Label>
                                        <div className='md:col-span-2 flex items-center gap-6'>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="save-print" id="lock-save-print" />
                                                <Label htmlFor="lock-save-print">Save & Print</Label>
                                            </div>
                                             <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="settle-save" id="lock-settle-save" />
                                                <Label htmlFor="lock-settle-save">Settle & Save</Label>
                                            </div>
                                             <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="none" id="lock-none" />
                                                <Label htmlFor="lock-none">None</Label>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>
                                 <RadioGroup value={releaseTableOn} onValueChange={(value) => setReleaseTableOn(value as any)}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                        <Label className='md:text-right'>Release Table On :</Label>
                                        <div className='md:col-span-2 flex items-center gap-6'>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="print-bill" id="release-table-print-bill" />
                                                <Label htmlFor="release-table-print-bill">Print Bill</Label>
                                            </div>
                                             <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="settle-save" id="release-table-settle-save" />
                                                <Label htmlFor="release-table-settle-save">Settle & Save</Label>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>
                                <RadioGroup value={releaseRecentSectionOn} onValueChange={(value) => setReleaseRecentSectionOn(value as any)}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                        <Label className='md:text-right'>Release Recent Section On :</Label>
                                        <div className='md:col-span-2 flex items-center gap-6'>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="print-bill" id="release-recent-print-bill" />
                                                <Label htmlFor="release-recent-print-bill">Print Bill</Label>
                                            </div>
                                             <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="settle-save" id="release-recent-settle-save" />
                                                <Label htmlFor="release-recent-settle-save">Settle & Save</Label>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>
                                 <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                    <div className="md:col-start-2 md:col-span-2 flex items-center space-x-2">
                                        <Checkbox id="release-online" checked={releaseForOnlineOrders} onCheckedChange={checked => setReleaseForOnlineOrders(Boolean(checked))} />
                                        <Label htmlFor="release-online">Release Recent Section On Order Delivered (For Online Orders)</Label>
                                    </div>
                                 </div>
                            </CardContent>
                             <CardFooter>
                                <Button onClick={handleSaveChanges}>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    )}
                </>
             )}
        </SettingsPageLayout>
    );
}
