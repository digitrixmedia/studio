

'use client';

import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/contexts/SettingsContext";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


interface Aggregator {
    id: string;
    name: string;
    restaurantId: string;
    enabled: boolean;
}

const navItems = [
    { name: 'Aggregators', id: 'aggregators' },
    { name: 'Inventory Settings', id: 'inventory' },
    { name: 'Day End Settings', id: 'day-end' },
    { name: 'Loyalty Settings', id: 'loyalty' },
    { name: 'KDS Settings', id: 'kds' },
    { name: 'Captain App Settings', id: 'captain-app' },
    { name: 'e-Invoice settings', id: 'e-invoice' },
    { name: 'Barcode settings', id: 'barcode' },
    { name: 'Expense settings', id: 'expense' },
    { name: 'Invoice Structure', id: 'invoice-structure' },
];

const initialAggregators: Aggregator[] = [
    { id: 'agg-1', name: 'Zomato', restaurantId: 'ZOM12345', enabled: true },
    { id: 'agg-2', name: 'Swiggy', restaurantId: 'SWG67890', enabled: true },
];

export default function ConnectedServicesSettingsPage() {
    const { settings, setSetting, saveSettings, isSaving } = useSettings();
    const { toast } = useToast();
    const [aggregators, setAggregators] = useState<Aggregator[]>(initialAggregators);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAggregator, setEditingAggregator] = useState<Aggregator | null>(null);
    const [aggregatorToDelete, setAggregatorToDelete] = useState<Aggregator | null>(null);

    const [aggregatorName, setAggregatorName] = useState('');
    const [restaurantId, setRestaurantId] = useState('');

    const handleOpenDialog = (aggregator?: Aggregator) => {
        if (aggregator) {
            setEditingAggregator(aggregator);
            setAggregatorName(aggregator.name);
            setRestaurantId(aggregator.restaurantId);
        } else {
            setEditingAggregator(null);
            setAggregatorName('');
            setRestaurantId('');
        }
        setIsDialogOpen(true);
    };

    const handleSaveAggregator = () => {
        if (!aggregatorName || !restaurantId) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please provide both an aggregator name and a restaurant ID.'
            });
            return;
        }

        if (editingAggregator) {
            setAggregators(prev => prev.map(agg => agg.id === editingAggregator.id ? { ...agg, name: aggregatorName, restaurantId } : agg));
            toast({ title: 'Aggregator Updated', description: `${aggregatorName} has been updated.` });
        } else {
            const newAggregator: Aggregator = {
                id: `agg-${Date.now()}`,
                name: aggregatorName,
                restaurantId: restaurantId,
                enabled: true
            };
            setAggregators(prev => [...prev, newAggregator]);
            toast({ title: 'Aggregator Added', description: `${aggregatorName} has been added.` });
        }

        setIsDialogOpen(false);
    };

    const handleDeleteAggregator = () => {
        if (aggregatorToDelete) {
            setAggregators(prev => prev.filter(agg => agg.id !== aggregatorToDelete.id));
            toast({
                variant: 'destructive',
                title: 'Aggregator Removed',
                description: `${aggregatorToDelete.name} has been removed.`
            });
            setAggregatorToDelete(null);
        }
    };
    
    const toggleAggregatorEnabled = (aggregatorId: string) => {
        setAggregators(prev => 
            prev.map(agg => 
                agg.id === aggregatorId ? { ...agg, enabled: !agg.enabled } : agg
            )
        );
    };
    
    const handleSaveChanges = () => {
        // In a real app, you'd save the `aggregators` state to your backend/context here.
        saveSettings('Connected Services');
    };

    return (
        <SettingsPageLayout navItems={navItems}>
            {(activeTab) => (
                <>
                {activeTab === 'aggregators' && (
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Online Aggregators</CardTitle>
                                    <CardDescription>Connect with Zomato, Swiggy, and other online ordering platforms.</CardDescription>
                                </div>
                                <Button onClick={() => handleOpenDialog()}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Aggregator
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {aggregators.length === 0 ? (
                                <p className="text-muted-foreground text-center">No aggregators configured. Add one to get started.</p>
                            ) : (
                                aggregators.map(agg => (
                                    <div key={agg.id} className="space-y-4 p-4 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor={`agg-enabled-${agg.id}`} className="font-semibold text-lg">{agg.name}</Label>
                                            <div className="flex items-center gap-4">
                                                <Switch
                                                    id={`agg-enabled-${agg.id}`}
                                                    checked={agg.enabled}
                                                    onCheckedChange={() => toggleAggregatorEnabled(agg.id)}
                                                />
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(agg)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setAggregatorToDelete(agg)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor={`agg-id-${agg.id}`}>Restaurant ID</Label>
                                            <Input id={`agg-id-${agg.id}`} value={agg.restaurantId} readOnly disabled />
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Aggregator Settings'}</Button>
                        </CardFooter>
                    </Card>
                )}
                {activeTab === 'inventory' && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Inventory Settings</CardTitle>
                            <CardDescription>The following settings configures the Inventory module in billing screen</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                             <div className="flex items-start space-x-2">
                                <Checkbox id="auto-consumption" checked={settings.enableAutoConsumption} onCheckedChange={(checked) => setSetting('enableAutoConsumption', !!checked)} disabled />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="auto-consumption" className="text-gray-400">Enable auto consumption for Inventory</Label>
                                    <p className="text-xs text-muted-foreground">This setting is only available in cloud login.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-2">
                                <Checkbox id="reset-stock" checked={settings.resetStockOnDayStart} onCheckedChange={(checked) => setSetting('resetStockOnDayStart', !!checked)} />
                                <Label htmlFor="reset-stock">Reset your stock on a day start</Label>
                            </div>
                             <RadioGroup value={settings.outOfStockAction} onValueChange={(value) => setSetting('outOfStockAction', value as any)}>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                    <Label className="font-semibold pt-2">Action when items goes out of stock</Label>
                                    <div className="md:col-span-2 flex items-center gap-x-6 gap-y-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Hide items" id="oos-hide" />
                                            <Label htmlFor="oos-hide">Hide items</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Disable items" id="oos-disable" />
                                            <Label htmlFor="oos-disable">Disable items</Label>
                                        </div>
                                    </div>
                                </div>
                            </RadioGroup>
                             <div className="flex items-start space-x-2">
                                <Checkbox id="real-time-stock" checked={settings.useRealTimeStock} onCheckedChange={(checked) => setSetting('useRealTimeStock', !!checked)} />
                                <Label htmlFor="real-time-stock">Use Real-Time stock management</Label>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                        </CardFooter>
                    </Card>
                )}
                {activeTab === 'day-end' && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Day End Settings</CardTitle>
                            <CardDescription>The following settings helps in configures enabling Day End module in billing screen</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                             <div className="flex items-start space-x-2">
                                <Checkbox id="manual-day-end" checked={settings.enableManualDayEnd} onCheckedChange={(checked) => setSetting('enableManualDayEnd', !!checked)} disabled />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="manual-day-end" className="text-gray-400">Enable Manual Day End</Label>
                                    <p className="text-xs text-muted-foreground">This setting is only available in cloud login.</p>
                                </div>
                            </div>
                             <div className="flex items-start space-x-2">
                                <Checkbox id="prevent-active-table" checked={settings.preventDayEndOnActiveTable} onCheckedChange={(checked) => setSetting('preventDayEndOnActiveTable', !!checked)} disabled />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="prevent-active-table" className="text-gray-400">Don't allow Day End if there is any active table on Table View Screen.</Label>
                                    <p className="text-xs text-muted-foreground">This setting is only available in cloud login.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-2">
                                <Checkbox id="prevent-unsynced" checked={settings.preventDayEndOnUnsynced} onCheckedChange={(checked) => setSetting('preventDayEndOnUnsynced', !!checked)} disabled />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="prevent-unsynced" className="text-gray-400">Don't allow Day End if there is any un-sync orders data</Label>
                                    <p className="text-xs text-muted-foreground">This setting is only available in cloud login.</p>
                                </div>
                            </div>
                             <div className="flex items-start space-x-2">
                                <Checkbox id="restrict-editing" checked={settings.restrictEditAfterDayEnd} onCheckedChange={(checked) => setSetting('restrictEditAfterDayEnd', !!checked)} disabled />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="restrict-editing" className="text-gray-400">Restrict editing the order once the manual day end operation has been completed</Label>
                                    <p className="text-xs text-muted-foreground">This setting is only available in cloud login.</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                        </CardFooter>
                    </Card>
                )}
                {activeTab === 'loyalty' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Loyalty Settings</CardTitle>
                            <CardDescription>The following settings pertains to configuring the loyalty settings in the billing screen</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                             <div className="flex items-start space-x-2">
                                <Checkbox id="send-loyalty-default" checked={settings.sendLoyaltyDefault} onCheckedChange={(checked) => setSetting('sendLoyaltyDefault', !!checked)} />
                                <Label htmlFor="send-loyalty-default">Make "Send Loyalty" option set as default on Billing screen.</Label>
                            </div>

                            <div className="space-y-4">
                                <Label className="font-semibold">Apply Loyalty points when order punched as</Label>
                                <div className="flex items-center gap-x-6 gap-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="loyalty-delivery" checked={settings.loyaltyOnDelivery} onCheckedChange={(checked) => setSetting('loyaltyOnDelivery', !!checked)} />
                                        <Label htmlFor="loyalty-delivery">Delivery</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="loyalty-pickup" checked={settings.loyaltyOnPickUp} onCheckedChange={(checked) => setSetting('loyaltyOnPickUp', !!checked)} />
                                        <Label htmlFor="loyalty-pickup">Pick Up</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="loyalty-dinein" checked={settings.loyaltyOnDineIn} onCheckedChange={(checked) => setSetting('loyaltyOnDineIn', !!checked)} />
                                        <Label htmlFor="loyalty-dinein">Dine In</Label>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">Above settings enabled POS system to apply loyalty points on selected order types. This setting is only available in cloud login.</p>
                            </div>

                             <RadioGroup value={settings.sendLoyaltyDataOn} onValueChange={(value) => setSetting('sendLoyaltyDataOn', value as any)}>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                    <Label className="font-semibold pt-2">Send Loyalty Data <br/>(Only for Table Order) :</Label>
                                    <div className="md:col-span-2 flex items-center gap-x-6 gap-y-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Print Bill" id="loyalty-print" />
                                            <Label htmlFor="loyalty-print">Print Bill</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Settle & Save" id="loyalty-settle" />
                                            <Label htmlFor="loyalty-settle">Settle & Save</Label>
                                        </div>
                                    </div>
                                </div>
                            </RadioGroup>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                        </CardFooter>
                    </Card>
                )}
                 {activeTab === 'kds' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>KDS settings</CardTitle>
                            <CardDescription>The following settings would be used to configure the Kitchen Display System or KDS</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="flex items-start space-x-2">
                                <Checkbox id="send-kds-update" checked={settings.sendKdsUpdateToOrderScreen} onCheckedChange={(checked) => setSetting('sendKdsUpdateToOrderScreen', !!checked)} />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="send-kds-update">From KDS/KOT live screen send update to order screen.</Label>
                                    <p className="text-xs text-muted-foreground">
                                        In case of any update (like marking an item/order ready) in KDS or KOT live view, the update would be also be present in Order screen.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-2">
                                <Checkbox id="mark-kot-done" checked={settings.markKotAsDoneOnKds} onCheckedChange={(checked) => setSetting('markKotAsDoneOnKds', !!checked)} />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="mark-kot-done">On marking done all items on KDS, Mark KOT as done.</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Enabling the setting would mark the full KOT done at all places (including online aggregators) when all the items are marked done.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                           <Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                        </CardFooter>
                    </Card>
                )}
                {activeTab === 'captain-app' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Captain App settings</CardTitle>
                            <CardDescription>The following settings pertains to configuring the Captain App print settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="flex items-start space-x-2">
                                <Checkbox id="print-kot" checked={settings.printKotFromCaptainApp} onCheckedChange={(checked) => setSetting('printKotFromCaptainApp', !!checked)} />
                                <Label htmlFor="print-kot">Print KOT from Captain App</Label>
                            </div>
                            <div className="flex items-start space-x-2">
                                <Checkbox id="allow-discount" checked={settings.allowDiscountFromCaptainApp} onCheckedChange={(checked) => setSetting('allowDiscountFromCaptainApp', !!checked)} disabled />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="allow-discount" className="text-gray-400">Allow Discount from Captain APP (Applicable for Dine-In orders only)</Label>
                                    <p className="text-xs text-muted-foreground">This setting is only available in cloud login.</p>
                                </div>
                            </div>
                             <RadioGroup value={settings.notifyCaptainUsersOn} onValueChange={(value) => setSetting('notifyCaptainUsersOn', value as any)}>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                    <Label className="font-semibold pt-2">Notify captain users once the food ready is marked</Label>
                                    <div className="md:col-span-2 flex items-center gap-x-6 gap-y-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Item Ready" id="notify-item" />
                                            <Label htmlFor="notify-item">Item Ready</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="KOT Ready" id="notify-kot" />
                                            <Label htmlFor="notify-kot">KOT Ready</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="None" id="notify-none" />
                                            <Label htmlFor="notify-none">None</Label>
                                        </div>
                                    </div>
                                </div>
                            </RadioGroup>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                        </CardFooter>
                    </Card>
                )}
                {activeTab === 'e-invoice' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>e-Invoice settings</CardTitle>
                            <CardDescription>The following settings pertains to configuring the e-Invoice settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-start space-x-2">
                                <Checkbox id="enable-e-invoice" checked={settings.enableEInvoice} onCheckedChange={(checked) => setSetting('enableEInvoice', !!checked)} disabled />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="enable-e-invoice" className="text-gray-400">Enable e-Invoice</Label>
                                </div>
                            </div>
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800 space-y-2">
                                <p className="font-semibold">Please consider below scenario if you want to generate e-Invoice:</p>
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>Please enter & verify Outlet GST information.</li>
                                    <li>Please enter proper Customer GST no. while printing the bill from POS.</li>
                                    <li>Outlet must have CGST and SGST taxes in their TAX configuration.</li>
                                    <li>Currently IGST tax is not supported.</li>
                                    <li>If you want to cancel e-Invoice (if already generated) then you must cancel the Order.</li>
                                    <li>Please disable configuration (if any) for apply tax on Delivery charge, Service charge and Packing charge.</li>
                                    <li>Please enter proper HSN No. for every item.</li>
                                    <li>You can not create/cancel e-Invoice older than two days.</li>
                                    <li>Please recharge eInvoice credits from marketplace services. Without eInvoice credits service does not work.</li>
                                </ol>
                                <p className="text-xs pt-2">This setting is only available in cloud login.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
                 {activeTab === 'barcode' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Barcode settings</CardTitle>
                            <CardDescription>The following settings pertains to configuring the Barcode settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                <Label htmlFor="barcode-prefix" className="font-semibold pt-2 md:text-right">Prefix for Barcode :</Label>
                                <div className="md:col-span-2">
                                    <Input id="barcode-prefix" value={settings.barcodePrefix} onChange={e => setSetting('barcodePrefix', e.target.value)} disabled className="w-full md:w-1/2" />
                                     <p className="text-xs text-muted-foreground mt-1">This field is required if want to activate this service settings in POS.</p>
                                    <p className="text-xs text-muted-foreground">This setting is only available in cloud login.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                <Label htmlFor="barcode-weight-chars" className="font-semibold pt-2 md:text-right">No. of Characters to calculate Weight :</Label>
                                <div className="md:col-span-2">
                                    <Input id="barcode-weight-chars" value={settings.barcodeWeightChars} onChange={e => setSetting('barcodeWeightChars', e.target.value)} disabled className="w-full md:w-1/2" />
                                    <p className="text-xs text-muted-foreground mt-1">This setting is only available in cloud login.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                <Label htmlFor="barcode-weight-denominator" className="font-semibold pt-2 md:text-right">Weight Denominator :</Label>
                                <div className="md:col-span-2">
                                    <Input id="barcode-weight-denominator" value={settings.barcodeWeightDenominator} onChange={e => setSetting('barcodeWeightDenominator', e.target.value)} disabled className="w-full md:w-1/2" />
                                    <p className="text-xs text-muted-foreground mt-1">This setting is only available in cloud login.</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                        </CardFooter>
                    </Card>
                )}
                {activeTab === 'expense' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Expense settings</CardTitle>
                            <CardDescription>The following settings pertains to configuring the Expense settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-start space-x-2">
                                <Checkbox id="restrict-expense" checked={settings.restrictExpenseToCurrentDate} onCheckedChange={(checked) => setSetting('restrictExpenseToCurrentDate', !!checked)} disabled />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="restrict-expense" className="text-gray-400">Restrict users to add expense and withdrawal for current date only.</Label>
                                    <p className="text-xs text-muted-foreground">
                                        If the configuration is enabled then the users would only be able to add expense and withdrawal for current date.
                                        <br />
                                        This setting is only available in cloud login.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                         <CardFooter>
                            <Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                        </CardFooter>
                    </Card>
                )}
                 {activeTab === 'invoice-structure' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Structure</CardTitle>
                            <CardDescription>The following settings pertains to configuring the Invoice Structure.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 items-end gap-4">
                                <Label className="md:col-span-1 md:text-right font-semibold">Invoice structure*:</Label>
                                <div className="md:col-span-3 grid grid-cols-3 gap-2">
                                    <Input placeholder="Prefix" value={settings.invoicePrefix} onChange={e => setSetting('invoicePrefix', e.target.value)} />
                                    <Input placeholder="Number Length" value={settings.invoiceNumberLength} onChange={e => setSetting('invoiceNumberLength', e.target.value)} />
                                    <Input placeholder="Suffix" value={settings.invoiceSuffix} onChange={e => setSetting('invoiceSuffix', e.target.value)} />
                                </div>
                            </div>
                            <div className="p-4 bg-muted/50 border rounded-md text-sm">
                                <p className="font-semibold text-primary">Note : Enter any values from configured sets :</p>
                                <ul className="mt-2 space-y-1 list-disc list-inside">
                                    <li><code className="bg-muted px-1 rounded">{'{yy}'}</code> : Ex. 24 [current year]</li>
                                    <li><code className="bg-muted px-1 rounded">{'{yyyy}'}</code> : Ex. 2024 [current year]</li>
                                    <li><code className="bg-muted px-1 rounded">{'{mm}'}</code> : Ex. 07 [current month]</li>
                                    <li><code className="bg-muted px-1 rounded">{'{mnn}'}</code> : Ex. Jul [current month]</li>
                                    <li><code className="bg-muted px-1 rounded">{'{dd}'}</code> : Ex. 01 [current day]</li>
                                </ul>
                                <div className="mt-4">
                                    <p className="font-semibold">If Ex:</p>
                                    <div className="flex items-center gap-2">
                                        <Input value="{yy}/ABC" readOnly className="w-24 bg-background"/>
                                        <Input value="2" readOnly className="w-16 bg-background"/>
                                    </div>
                                    <p className="mt-1">means invoice will be <code className="bg-primary text-primary-foreground font-semibold px-2 py-1 rounded">18/ABC02</code></p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                        </CardFooter>
                    </Card>
                )}

                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>{editingAggregator ? 'Edit' : 'Add New'} Aggregator</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="aggregator-name">Aggregator Name</Label>
                            <Input
                            id="aggregator-name"
                            value={aggregatorName}
                            onChange={(e) => setAggregatorName(e.target.value)}
                            placeholder="e.g., City Eats"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="restaurant-id">Restaurant ID</Label>
                            <Input
                            id="restaurant-id"
                            value={restaurantId}
                            onChange={(e) => setRestaurantId(e.target.value)}
                            placeholder="Enter the ID from the aggregator"
                            />
                        </div>
                        </div>
                        <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveAggregator}>{editingAggregator ? 'Save Changes' : 'Add Aggregator'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={!!aggregatorToDelete} onOpenChange={() => setAggregatorToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will permanently remove the "{aggregatorToDelete?.name}" aggregator.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAggregator} className="bg-destructive hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                </>
            )}
        </SettingsPageLayout>
    );
}

