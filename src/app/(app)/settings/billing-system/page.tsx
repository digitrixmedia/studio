
'use client';

import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

const navItems = [
    { name: 'Order and Order Sync Settings', id: 'order-sync' },
    { name: 'Payment Sync Settings', id: 'payment-sync' },
    { name: 'Display settings', id: 'display' },
    { name: 'Security Setting', id: 'security' },
];

export default function BillingSystemSettingsPage() {
    const { toast } = useToast();

    // State for Order and Order Sync Settings
    const [closingHour, setClosingHour] = useState('01');
    const [closingMinute, setClosingMinute] = useState('00');
    const [displayExtendNotification, setDisplayExtendNotification] = useState(true);
    const [is24x7, setIs24x7] = useState(false);
    const [syncPacketSize, setSyncPacketSize] = useState('100');
    const [defaultOrderLimit, setDefaultOrderLimit] = useState('500');
    const [autoSyncTime, setAutoSyncTime] = useState('15');
    const [pendingOrderSyncTime, setPendingOrderSyncTime] = useState('5');
    const [captainOrderSyncTime, setCaptainOrderSyncTime] = useState('5');
    const [minutesToEdit, setMinutesToEdit] = useState('2880');

    // State for Payment Sync Settings
    const [paymentRequestSyncTime, setPaymentRequestSyncTime] = useState('5');
    const [checkPaymentRequestSyncTime, setCheckPaymentRequestSyncTime] = useState('5');
    
    // State for Display settings
    const [billingScreenRefreshCount, setBillingScreenRefreshCount] = useState('0');

    // State for Security Setting
    const [managerPassword, setManagerPassword] = useState('');
    const [idleTime, setIdleTime] = useState('0');

    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your billing system settings have been updated.",
        });
        console.log({
            closingHour,
            closingMinute,
            displayExtendNotification,
            is24x7,
            syncPacketSize,
            defaultOrderLimit,
            autoSyncTime,
            pendingOrderSyncTime,
            captainOrderSyncTime,
            minutesToEdit,
            paymentRequestSyncTime,
            checkPaymentRequestSyncTime,
            billingScreenRefreshCount,
            managerPassword,
            idleTime,
        });
    };

    return (
        <SettingsPageLayout navItems={navItems}>
            {(activeTab) => (
                <>
                {activeTab === 'order-sync' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Order and Order Sync Settings</CardTitle>
                            <CardDescription>The following settings are related to Order synchronization and finalize settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                             <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-4">
                                <Label className="font-semibold">Restaurant Closing Hours</Label>
                                <div className="md:col-span-2 flex items-end gap-2">
                                     <div className="flex items-center gap-2">
                                        <Select value={closingHour} onValueChange={setClosingHour}>
                                            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')).map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <span>:</span>
                                         <Select value={closingMinute} onValueChange={setClosingMinute}>
                                            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                 {Array.from({length: 60}, (_, i) => String(i).padStart(2, '0')).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                     </div>
                                     <Button variant="outline">Change Closing Hours</Button>
                                     <Button variant="outline"><span className="text-xl font-normal mr-2">+</span> Extend Closing Hours</Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                <div></div>
                                 <div className="md:col-span-2 space-y-4">
                                     <p className="text-sm text-muted-foreground">Current day will be closed on 2025-10-10 01:00</p>
                                     <div className="flex items-center space-x-2">
                                        <Checkbox id="display-notification" checked={displayExtendNotification} onCheckedChange={(checked) => setDisplayExtendNotification(!!checked)} />
                                        <Label htmlFor="display-notification">Display the notification (toaster) for temporary Extend Closing Hours</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="is-24x7" checked={is24x7} onCheckedChange={(checked) => setIs24x7(!!checked)} />
                                        <Label htmlFor="is-24x7">Is the outlet open round-the-clock (24*7)?</Label>
                                    </div>
                                 </div>
                            </div>

                             <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                <Label htmlFor="sync-packet-size" className="font-semibold">Sync Batch Packet Size</Label>
                                <div className="md:col-span-2">
                                    <Select value={syncPacketSize} onValueChange={setSyncPacketSize}>
                                        <SelectTrigger className="w-full md:w-1/2"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="100">100</SelectItem>
                                            <SelectItem value="200">200</SelectItem>
                                            <SelectItem value="500">500</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground mt-1">The number of orders that would be synced in one packet.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                <Label htmlFor="default-order-limit" className="font-semibold">Default Order Limit * :</Label>
                                <div className="md:col-span-2">
                                    <Input id="default-order-limit" value={defaultOrderLimit} onChange={e => setDefaultOrderLimit(e.target.value)} className="w-full md:w-1/2" />
                                    <p className="text-xs text-muted-foreground mt-1">The maximum number of orders that would be displayed in PoS.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                <Label htmlFor="auto-sync-time" className="font-semibold">Default Auto Sync Time</Label>
                                <div className="md:col-span-2">
                                    <div className="flex items-center gap-2">
                                        <Select value={autoSyncTime} onValueChange={setAutoSyncTime}>
                                            <SelectTrigger className="w-full md:w-1/2"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">5</SelectItem>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="15">15</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <span>Min</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">The time taken for the orders to be synced with the dashboard automatically. Please note internet must be connected to enable auto-sync.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                <Label htmlFor="pending-sync-time" className="font-semibold">Default Pending Order Sync Time</Label>
                                <div className="md:col-span-2">
                                    <div className="flex items-center gap-2">
                                        <Select value={pendingOrderSyncTime} onValueChange={setPendingOrderSyncTime}>
                                            <SelectTrigger className="w-full md:w-1/2"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">5</SelectItem>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="15">15</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <span>Sec</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">The time taken for the pending orders to be synced with the dashboard. Please note internet must be connected to enable auto-sync.</p>
                                </div>
                            </div>

                             <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                <Label htmlFor="captain-sync-time" className="font-semibold">Default Captain Order Intranet Sync Time</Label>
                                <div className="md:col-span-2">
                                    <div className="flex items-center gap-2">
                                        <Select value={captainOrderSyncTime} onValueChange={setCaptainOrderSyncTime}>
                                            <SelectTrigger className="w-full md:w-1/2"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">5</SelectItem>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="15">15</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <span>Sec</span>
                                    </div>
                                </div>
                            </div>

                             <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                <Label htmlFor="minutes-to-edit" className="font-semibold">No. of Minutes to Edit Orders* :</Label>
                                <div className="md:col-span-2">
                                    <Input id="minutes-to-edit" value={minutesToEdit} onChange={e => setMinutesToEdit(e.target.value)} className="w-full md:w-1/2" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveChanges}>Save Changes</Button>
                        </CardFooter>
                    </Card>
                )}
                {activeTab === 'payment-sync' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Sync Settings</CardTitle>
                            <CardDescription>The following settings are related to Payment synchronization settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                <Label htmlFor="payment-request-sync-time" className="font-semibold">Payment request sync time*:</Label>
                                <div className="md:col-span-2 flex items-center gap-2">
                                    <Input id="payment-request-sync-time" value={paymentRequestSyncTime} onChange={e => setPaymentRequestSyncTime(e.target.value)} className="w-24" />
                                    <span>Sec</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                <Label htmlFor="check-payment-request-sync-time" className="font-semibold">Check payment request sync time*:</Label>
                                <div className="md:col-span-2 flex items-center gap-2">
                                    <Input id="check-payment-request-sync-time" value={checkPaymentRequestSyncTime} onChange={e => setCheckPaymentRequestSyncTime(e.target.value)} className="w-24" />
                                    <span>Sec</span>
                                </div>
                            </div>
                        </CardContent>
                         <CardFooter>
                            <Button onClick={handleSaveChanges}>Save Changes</Button>
                        </CardFooter>
                    </Card>
                )}
                {activeTab === 'display' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Display settings</CardTitle>
                            <CardDescription>The following settings would be used to configure the display settings of the PoS</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                <Label htmlFor="billing-screen-refresh" className="font-semibold">Billing Screen Refresh After No. Of Bill Print *:</Label>
                                <div className="md:col-span-2">
                                    <Input id="billing-screen-refresh" value={billingScreenRefreshCount} onChange={e => setBillingScreenRefreshCount(e.target.value)} className="w-full md:w-1/2" />
                                    <p className="text-xs text-muted-foreground mt-1">This setting describes after how many bill prints would the screen refreshes.</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveChanges}>Save Changes</Button>
                        </CardFooter>
                    </Card>
                )}
                {activeTab === 'security' && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Security Setting</CardTitle>
                            <CardDescription>The following settings help in determining the settings related to security of the application.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                <Label htmlFor="manager-password">Default Manager<br/>Password for Desktop<br/>Use :</Label>
                                <div className="md:col-span-2">
                                    <Input id="manager-password" type="password" value={managerPassword} onChange={e => setManagerPassword(e.target.value)} className="w-full md:w-1/2" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                <Label htmlFor="idle-time">User Idle time for Logout</Label>
                                <div className="md:col-span-2 flex items-center gap-2">
                                    <Input id="idle-time" type="number" value={idleTime} onChange={e => setIdleTime(e.target.value)} className="w-24" />
                                    <span>Min</span>
                                </div>
                            </div>
                        </CardContent>
                         <CardFooter>
                            <Button onClick={handleSaveChanges}>Save Changes</Button>
                        </CardFooter>
                    </Card>
                )}
                {activeTab !== 'order-sync' && activeTab !== 'payment-sync' && activeTab !== 'display' && activeTab !== 'security' && (
                     <Card>
                        <CardHeader>
                            <CardTitle>
                            {navItems.find(item => item.id === activeTab)?.name}
                            </CardTitle>
                            <CardDescription>
                            Configure settings for {navItems.find(item => item.id === activeTab)?.name.toLowerCase()}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Settings for this section will be available here.</p>
                        </CardContent>
                    </Card>
                )}
                </>
            )}
        </SettingsPageLayout>
    );
}

    