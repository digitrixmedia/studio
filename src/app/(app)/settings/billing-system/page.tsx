
'use client';

import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/contexts/SettingsContext";

const navItems = [
    { name: 'Order and Order Sync Settings', id: 'order-sync' },
    { name: 'Payment Sync Settings', id: 'payment-sync' },
    { name: 'Display settings', id: 'display' },
    { name: 'Security Setting', id: 'security' },
];

export default function BillingSystemSettingsPage() {
    const { settings, setSetting, saveSettings } = useSettings();

    const handleSaveChanges = () => {
        saveSettings('Billing System');
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
                                        <Select value={settings.closingHour} onValueChange={(val) => setSetting('closingHour', val)}>
                                            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')).map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <span>:</span>
                                         <Select value={settings.closingMinute} onValueChange={(val) => setSetting('closingMinute', val)}>
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
                                        <Checkbox id="display-notification" checked={settings.displayExtendNotification} onCheckedChange={(checked) => setSetting('displayExtendNotification', !!checked)} />
                                        <Label htmlFor="display-notification">Display the notification (toaster) for temporary Extend Closing Hours</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="is-24x7" checked={settings.is24x7} onCheckedChange={(checked) => setSetting('is24x7', !!checked)} />
                                        <Label htmlFor="is-24x7">Is the outlet open round-the-clock (24*7)?</Label>
                                    </div>
                                 </div>
                            </div>

                             <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                <Label htmlFor="sync-packet-size" className="font-semibold">Sync Batch Packet Size</Label>
                                <div className="md:col-span-2">
                                    <Select value={settings.syncPacketSize} onValueChange={(val) => setSetting('syncPacketSize', val)}>
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
                                    <Input id="default-order-limit" value={settings.defaultOrderLimit} onChange={e => setSetting('defaultOrderLimit', e.target.value)} className="w-full md:w-1/2" />
                                    <p className="text-xs text-muted-foreground mt-1">The maximum number of orders that would be displayed in PoS.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                <Label htmlFor="auto-sync-time" className="font-semibold">Default Auto Sync Time</Label>
                                <div className="md:col-span-2">
                                    <div className="flex items-center gap-2">
                                        <Select value={settings.autoSyncTime} onValueChange={(val) => setSetting('autoSyncTime', val)}>
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
                                        <Select value={settings.pendingOrderSyncTime} onValueChange={(val) => setSetting('pendingOrderSyncTime', val)}>
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
                                        <Select value={settings.captainOrderSyncTime} onValueChange={(val) => setSetting('captainOrderSyncTime', val)}>
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
                                    <Input id="minutes-to-edit" value={settings.minutesToEdit} onChange={e => setSetting('minutesToEdit', e.target.value)} className="w-full md:w-1/2" />
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
                                    <Input id="payment-request-sync-time" value={settings.paymentRequestSyncTime} onChange={e => setSetting('paymentRequestSyncTime', e.target.value)} className="w-24" />
                                    <span>Sec</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                <Label htmlFor="check-payment-request-sync-time" className="font-semibold">Check payment request sync time*:</Label>
                                <div className="md:col-span-2 flex items-center gap-2">
                                    <Input id="check-payment-request-sync-time" value={settings.checkPaymentRequestSyncTime} onChange={e => setSetting('checkPaymentRequestSyncTime', e.target.value)} className="w-24" />
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
                                    <Input id="billing-screen-refresh" value={settings.billingScreenRefreshCount} onChange={e => setSetting('billingScreenRefreshCount', e.target.value)} className="w-full md:w-1/2" />
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
                                    <Input id="manager-password" type="password" value={settings.managerPassword} onChange={e => setSetting('managerPassword', e.target.value)} className="w-full md:w-1/2" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                <Label htmlFor="idle-time">User Idle time for Logout</Label>
                                <div className="md:col-span-2 flex items-center gap-2">
                                    <Input id="idle-time" type="number" value={settings.idleTime} onChange={e => setSetting('idleTime', e.target.value)} className="w-24" />
                                    <span>Min</span>
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
