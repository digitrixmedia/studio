
'use client';

import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const navItems = [
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

export default function ConnectedServicesSettingsPage() {
    const { toast } = useToast();
    
    // State for Inventory Settings
    const [enableAutoConsumption, setEnableAutoConsumption] = useState(false);
    const [resetStockOnDayStart, setResetStockOnDayStart] = useState(false);
    const [outOfStockAction, setOutOfStockAction] = useState('Hide items');
    const [useRealTimeStock, setUseRealTimeStock] = useState(false);

    // State for Day End Settings
    const [enableManualDayEnd, setEnableManualDayEnd] = useState(false);
    const [preventDayEndOnActiveTable, setPreventDayEndOnActiveTable] = useState(false);
    const [preventDayEndOnUnsynced, setPreventDayEndOnUnsynced] = useState(false);
    const [restrictEditAfterDayEnd, setRestrictEditAfterDayEnd] = useState(false);

    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your connected services settings have been updated.",
        });
        console.log({
            enableAutoConsumption,
            resetStockOnDayStart,
            outOfStockAction,
            useRealTimeStock,
            enableManualDayEnd,
            preventDayEndOnActiveTable,
            preventDayEndOnUnsynced,
            restrictEditAfterDayEnd
        });
    };

    return (
        <SettingsPageLayout navItems={navItems}>
            {(activeTab) => (
                <>
                {activeTab === 'inventory' && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Inventory Settings</CardTitle>
                            <CardDescription>The following settings configures the Inventory module in billing screen</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                             <div className="flex items-start space-x-2">
                                <Checkbox id="auto-consumption" checked={enableAutoConsumption} onCheckedChange={(checked) => setEnableAutoConsumption(!!checked)} disabled />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="auto-consumption" className="text-gray-400">Enable auto consumption for Inventory</Label>
                                    <p className="text-xs text-muted-foreground">This setting is only available in cloud login.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-2">
                                <Checkbox id="reset-stock" checked={resetStockOnDayStart} onCheckedChange={(checked) => setResetStockOnDayStart(!!checked)} />
                                <Label htmlFor="reset-stock">Reset your stock on a day start</Label>
                            </div>
                             <RadioGroup value={outOfStockAction} onValueChange={setOutOfStockAction}>
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
                                <Checkbox id="real-time-stock" checked={useRealTimeStock} onCheckedChange={(checked) => setUseRealTimeStock(!!checked)} />
                                <Label htmlFor="real-time-stock">Use Real-Time stock management</Label>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveChanges}>Save Changes</Button>
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
                                <Checkbox id="manual-day-end" checked={enableManualDayEnd} onCheckedChange={(checked) => setEnableManualDayEnd(!!checked)} disabled />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="manual-day-end" className="text-gray-400">Enable Manual Day End</Label>
                                    <p className="text-xs text-muted-foreground">This setting is only available in cloud login.</p>
                                </div>
                            </div>
                             <div className="flex items-start space-x-2">
                                <Checkbox id="prevent-active-table" checked={preventDayEndOnActiveTable} onCheckedChange={(checked) => setPreventDayEndOnActiveTable(!!checked)} disabled />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="prevent-active-table" className="text-gray-400">Don't allow Day End if there is any active table on Table View Screen.</Label>
                                    <p className="text-xs text-muted-foreground">This setting is only available in cloud login.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-2">
                                <Checkbox id="prevent-unsynced" checked={preventDayEndOnUnsynced} onCheckedChange={(checked) => setPreventDayEndOnUnsynced(!!checked)} disabled />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="prevent-unsynced" className="text-gray-400">Don't allow Day End if there is any un-sync orders data</Label>
                                    <p className="text-xs text-muted-foreground">This setting is only available in cloud login.</p>
                                </div>
                            </div>
                             <div className="flex items-start space-x-2">
                                <Checkbox id="restrict-editing" checked={restrictEditAfterDayEnd} onCheckedChange={(checked) => setRestrictEditAfterDayEnd(!!checked)} disabled />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="restrict-editing" className="text-gray-400">Restrict editing the order once the manual day end operation has been completed</Label>
                                    <p className="text-xs text-muted-foreground">This setting is only available in cloud login.</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveChanges}>Save Changes</Button>
                        </CardFooter>
                    </Card>
                )}
                {activeTab !== 'inventory' && activeTab !== 'day-end' && (
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
                            <p>Settings for {activeTab} will be available here.</p>
                        </CardContent>
                    </Card>
                )}
                </>
            )}
        </SettingsPageLayout>
    );
}
