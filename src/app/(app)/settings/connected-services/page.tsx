
'use client';

import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

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

    // State for Loyalty Settings
    const [sendLoyaltyDefault, setSendLoyaltyDefault] = useState(true);
    const [loyaltyOnDelivery, setLoyaltyOnDelivery] = useState(true);
    const [loyaltyOnPickUp, setLoyaltyOnPickUp] = useState(true);
    const [loyaltyOnDineIn, setLoyaltyOnDineIn] = useState(true);
    const [sendLoyaltyDataOn, setSendLoyaltyDataOn] = useState('Settle & Save');

    // State for KDS Settings
    const [sendKdsUpdateToOrderScreen, setSendKdsUpdateToOrderScreen] = useState(true);
    const [markKotAsDoneOnKds, setMarkKotAsDoneOnKds] = useState(true);

    // State for Captain App Settings
    const [printKotFromCaptainApp, setPrintKotFromCaptainApp] = useState(true);
    const [allowDiscountFromCaptainApp, setAllowDiscountFromCaptainApp] = useState(false);
    const [notifyCaptainUsersOn, setNotifyCaptainUsersOn] = useState('None');
    
    // State for e-Invoice Settings
    const [enableEInvoice, setEnableEInvoice] = useState(false);

    // State for Barcode settings
    const [barcodePrefix, setBarcodePrefix] = useState('');
    const [barcodeWeightChars, setBarcodeWeightChars] = useState('5');
    const [barcodeWeightDenominator, setBarcodeWeightDenominator] = useState('1000');
    
    // State for Expense settings
    const [restrictExpenseToCurrentDate, setRestrictExpenseToCurrentDate] = useState(false);


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
            restrictEditAfterDayEnd,
            sendLoyaltyDefault,
            loyaltyOnDelivery,
            loyaltyOnPickUp,
            loyaltyOnDineIn,
            sendLoyaltyDataOn,
            sendKdsUpdateToOrderScreen,
            markKotAsDoneOnKds,
            printKotFromCaptainApp,
            allowDiscountFromCaptainApp,
            notifyCaptainUsersOn,
            enableEInvoice,
            barcodePrefix,
            barcodeWeightChars,
            barcodeWeightDenominator,
            restrictExpenseToCurrentDate,
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
                {activeTab === 'loyalty' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Loyalty Settings</CardTitle>
                            <CardDescription>The following settings pertains to configuring the loyalty settings in the billing screen</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                             <div className="flex items-start space-x-2">
                                <Checkbox id="send-loyalty-default" checked={sendLoyaltyDefault} onCheckedChange={(checked) => setSendLoyaltyDefault(!!checked)} />
                                <Label htmlFor="send-loyalty-default">Make "Send Loyalty" option set as default on Billing screen.</Label>
                            </div>

                            <div className="space-y-4">
                                <Label className="font-semibold">Apply Loyalty points when order punched as</Label>
                                <div className="flex items-center gap-x-6 gap-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="loyalty-delivery" checked={loyaltyOnDelivery} onCheckedChange={(checked) => setLoyaltyOnDelivery(!!checked)} />
                                        <Label htmlFor="loyalty-delivery">Delivery</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="loyalty-pickup" checked={loyaltyOnPickUp} onCheckedChange={(checked) => setLoyaltyOnPickUp(!!checked)} />
                                        <Label htmlFor="loyalty-pickup">Pick Up</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="loyalty-dinein" checked={loyaltyOnDineIn} onCheckedChange={(checked) => setLoyaltyOnDineIn(!!checked)} />
                                        <Label htmlFor="loyalty-dinein">Dine In</Label>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">Above settings enabled POS system to apply loyalty points on selected order types. This setting is only available in cloud login.</p>
                            </div>

                             <RadioGroup value={sendLoyaltyDataOn} onValueChange={setSendLoyaltyDataOn}>
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
                            <Button onClick={handleSaveChanges}>Save Changes</Button>
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
                                <Checkbox id="send-kds-update" checked={sendKdsUpdateToOrderScreen} onCheckedChange={(checked) => setSendKdsUpdateToOrderScreen(!!checked)} />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="send-kds-update">From KDS/KOT live screen send update to order screen.</Label>
                                    <p className="text-xs text-muted-foreground">
                                        In case of any update (like marking an item/order ready) in KDS or KOT live view, the update would be also be present in Order screen.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-2">
                                <Checkbox id="mark-kot-done" checked={markKotAsDoneOnKds} onCheckedChange={(checked) => setMarkKotAsDoneOnKds(!!checked)} />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="mark-kot-done">On marking done all items on KDS, Mark KOT as done.</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Enabling the setting would mark the full KOT done at all places (including online aggregators) when all the items are marked done.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                           <Button onClick={handleSaveChanges}>Save Changes</Button>
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
                                <Checkbox id="print-kot" checked={printKotFromCaptainApp} onCheckedChange={(checked) => setPrintKotFromCaptainApp(!!checked)} />
                                <Label htmlFor="print-kot">Print KOT from Captain App</Label>
                            </div>
                            <div className="flex items-start space-x-2">
                                <Checkbox id="allow-discount" checked={allowDiscountFromCaptainApp} onCheckedChange={(checked) => setAllowDiscountFromCaptainApp(!!checked)} disabled />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="allow-discount" className="text-gray-400">Allow Discount from Captain APP (Applicable for Dine-In orders only)</Label>
                                    <p className="text-xs text-muted-foreground">This setting is only available in cloud login.</p>
                                </div>
                            </div>
                             <RadioGroup value={notifyCaptainUsersOn} onValueChange={setNotifyCaptainUsersOn}>
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
                            <Button onClick={handleSaveChanges}>Save Changes</Button>
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
                                <Checkbox id="enable-e-invoice" checked={enableEInvoice} onCheckedChange={(checked) => setEnableEInvoice(!!checked)} disabled />
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
                                    <Input id="barcode-prefix" value={barcodePrefix} onChange={e => setBarcodePrefix(e.target.value)} disabled className="w-full md:w-1/2" />
                                     <p className="text-xs text-muted-foreground mt-1">This field is required if want to activate this service settings in POS.</p>
                                    <p className="text-xs text-muted-foreground">This setting is only available in cloud login.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                <Label htmlFor="barcode-weight-chars" className="font-semibold pt-2 md:text-right">No. of Characters to calculate Weight :</Label>
                                <div className="md:col-span-2">
                                    <Input id="barcode-weight-chars" value={barcodeWeightChars} onChange={e => setBarcodeWeightChars(e.target.value)} disabled className="w-full md:w-1/2" />
                                    <p className="text-xs text-muted-foreground mt-1">This setting is only available in cloud login.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                <Label htmlFor="barcode-weight-denominator" className="font-semibold pt-2 md:text-right">Weight Denominator :</Label>
                                <div className="md:col-span-2">
                                    <Input id="barcode-weight-denominator" value={barcodeWeightDenominator} onChange={e => setBarcodeWeightDenominator(e.target.value)} disabled className="w-full md:w-1/2" />
                                    <p className="text-xs text-muted-foreground mt-1">This setting is only available in cloud login.</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveChanges}>Save Changes</Button>
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
                                <Checkbox id="restrict-expense" checked={restrictExpenseToCurrentDate} onCheckedChange={(checked) => setRestrictExpenseToCurrentDate(!!checked)} disabled />
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
                            <Button onClick={handleSaveChanges}>Save Changes</Button>
                        </CardFooter>
                    </Card>
                )}
                {activeTab !== 'inventory' && activeTab !== 'day-end' && activeTab !== 'loyalty' && activeTab !== 'kds' && activeTab !== 'captain-app' && activeTab !== 'e-invoice' && activeTab !== 'barcode' && activeTab !== 'expense' && (
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
