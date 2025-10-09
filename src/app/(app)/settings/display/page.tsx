
'use client';

import { useState } from 'react';
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { users } from '@/lib/data';

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

    const handleSaveChanges = () => {
        // In a real app, this would save to a context or backend.
        toast({
            title: 'Settings Saved',
            description: 'Your default values have been updated.',
        });
        console.log({
            defaultOrderType,
            defaultCustomer,
            defaultPayment,
            defaultQuantity,
            finalizeWithoutAmount
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
                                <div className="flex justify-end">
                                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {activeTab === 'discount' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Discount Settings</CardTitle>
                                <CardDescription>Configure how discounts are applied and displayed.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Discount settings will go here.</p>
                            </CardContent>
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
                                <CardDescription>Configure options related to table billing and settlement.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Table settlement settings will go here.</p>
                            </CardContent>
                        </Card>
                    )}
                </>
             )}
        </SettingsPageLayout>
    );
}
