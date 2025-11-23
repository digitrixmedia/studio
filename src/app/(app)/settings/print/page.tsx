

'use client';

import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSettings } from "@/contexts/SettingsContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const navItems = [
    { name: 'Print Layout', id: 'print-layout' },
    { name: 'Both', id: 'both' },
    { name: 'KOT Print', id: 'kot-print' },
    { name: 'Bill Print', id: 'bill-print' },
];

export default function PrintSettingsPage() {
    const { settings, setSetting, saveSettings, isSaving } = useSettings();
    
    const handleSaveChanges = () => {
        saveSettings('Print');
    };

    return (
        <SettingsPageLayout navItems={navItems}>
            {(activeTab) => (
                <>
                     {activeTab === 'print-layout' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Print Layout Settings</CardTitle>
                                <CardDescription>
                                Customize the information that appears on your printed customer receipts.
                                </CardDescription>
                            </CardHeader>
                             <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="printCafeName">Cafe Name</Label>
                                    <Input id="printCafeName" value={settings.printCafeName} onChange={e => setSetting('printCafeName', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="printAddress">Address</Label>
                                    <Input id="printAddress" value={settings.printAddress} onChange={e => setSetting('printAddress', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="printCustomDetails">Custom Details</Label>
                                    <Textarea id="printCustomDetails" value={settings.printCustomDetails} onChange={e => setSetting('printCustomDetails', e.target.value)} placeholder="e.g., GSTIN, Wi-Fi Password"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="printPhone">Phone</Label>
                                    <Input id="printPhone" value={settings.printPhone} onChange={e => setSetting('printPhone', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="printFooterMessage">Footer Message</Label>
                                    <Textarea id="printFooterMessage" value={settings.printFooterMessage} onChange={e => setSetting('printFooterMessage', e.target.value)} placeholder="e.g. Thank you for your visit!" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSaveChanges} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Layout'}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                    {activeTab === 'both' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Both</CardTitle>
                                <CardDescription>The following section helps in configuring Bill/KOT print settings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start space-x-3">
                                    <Checkbox id="show-barcode" checked={settings.showOrderBarcode} onCheckedChange={(checked) => setSetting('showOrderBarcode', Boolean(checked))} />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label htmlFor="show-barcode">Show order barcode on both bill and KoT print</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Scan barcode to mark order food ready. This feature can be managed printer-wise from the printer settings.
                                            <br />
                                            Riders from Swiggy & Zomato can use the same barcode for order pickup.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                            </CardFooter>
                        </Card>
                    )}
                    {activeTab === 'kot-print' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>KOT Print</CardTitle>
                                <CardDescription>The following section helps in configuring KOT print settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                     <div className="flex items-start space-x-3">
                                        <Checkbox id="print-kot-on-bill" checked={settings.printKotOnPrintBill} onCheckedChange={(checked) => setSetting('printKotOnPrintBill', Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="print-kot-on-bill">Print KOT on Print Bill</Label>
                                            <p className="text-sm text-muted-foreground">This setting will only work when the print bill action is initiated for the first time, for the reprint of KOT, the user must do that from KOT listing in the PoS.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Checkbox id="print-modified-kot" checked={settings.printOnlyModifiedKot} onCheckedChange={(checked) => setSetting('printOnlyModifiedKot', Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="print-modified-kot">Print Only Modified KOT</Label>
                                            <p className="text-sm text-muted-foreground">This setting when enabled print only the KOT, where modification (i.e item change or item deletion) with the label "Modified" on the top of the KOT.</p>
                                        </div>
                                    </div>
                                     <div className="flex items-start space-x-3">
                                        <Checkbox id="print-modified-items" checked={settings.printOnlyModifiedItems} onCheckedChange={(checked) => setSetting('printOnlyModifiedItems', Boolean(checked))} />
                                        <Label htmlFor="print-modified-items">Print Only Modified Items in KOT</Label>
                                    </div>
                                      <div className="flex items-start space-x-3">
                                        <Checkbox id="print-cancelled-kot" checked={settings.printCancelledKot} onCheckedChange={(checked) => setSetting('printCancelledKot', Boolean(checked))} />
                                        <Label htmlFor="print-cancelled-kot">Print Cancelled KOT</Label>
                                    </div>
                                     <div className="flex items-start space-x-3">
                                        <Checkbox id="print-addons-below" checked={settings.printAddonsBelow} onCheckedChange={(checked) => setSetting('printAddonsBelow', Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="print-addons-below">Print add-ons and special notes below item row in KOT</Label>
                                            <p className="text-sm text-muted-foreground">Print add-ons and special notes for the particular item below the item name row in KOT.</p>
                                        </div>
                                    </div>
                                     <div className="flex items-start space-x-3">
                                        <Checkbox id="show-duplicate" checked={settings.showDuplicateInKot} onCheckedChange={(checked) => setSetting('showDuplicateInKot', Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="show-duplicate">Show Duplicate in KOT in case of multiple prints</Label>
                                            <p className="text-sm text-muted-foreground">When a KOT is re-printed, it would show Duplicate at the top of the KOT.</p>
                                        </div>
                                    </div>
                                      <div className="flex items-start space-x-3">
                                        <Checkbox id="print-deleted-items" checked={settings.printDeletedItems} onCheckedChange={(checked) => setSetting('printDeletedItems', Boolean(checked))} />
                                        <Label htmlFor="print-deleted-items">Print Deleted Items In KOT</Label>
                                    </div>
                                     <div className="flex items-start space-x-3">
                                        <Checkbox id="print-deleted-separate" checked={settings.printDeletedInSeparateKot} onCheckedChange={(checked) => setSetting('printDeletedInSeparateKot', Boolean(checked))} disabled />
                                        <Label htmlFor="print-deleted-separate" className="text-gray-400">Print Deleted Items in seprate KOT</Label>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Checkbox id="show-barcode-kot" checked={settings.showBarcodeOnKot} onCheckedChange={(checked) => setSetting('showBarcodeOnKot', Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="show-barcode-kot">Show order barcode on KoT print</Label>
                                             <p className="text-sm text-muted-foreground">Scan barcode to mark order food ready. This feature can be managed printer-wise from the printer settings. Riders from Swiggy & Zomato can use the same barcode for order pickup.</p>
                                        </div>
                                    </div>
                                      <div className="flex items-start space-x-3">
                                        <Checkbox id="print-on-move" checked={settings.printOnMove} onCheckedChange={(checked) => setSetting('printOnMove', Boolean(checked))} />
                                        <Label htmlFor="print-on-move">While moving KOT items from one table to another table print KOT</Label>
                                    </div>
                                </div>
                                <RadioGroup value={settings.printKotOnStatus} onValueChange={(value) => setSetting('printKotOnStatus', value as any)}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4 pt-4">
                                        <Label className="font-semibold">Print KOT when the status is achieved</Label>
                                        <div className="md:col-span-2 flex items-center gap-x-6 gap-y-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="None" id="status-none" />
                                                <Label htmlFor="status-none">None</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Food Is Ready" id="status-ready" />
                                                <Label htmlFor="status-ready">Food Is Ready</Label>
                                            </div>
                                             <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Dispatched" id="status-dispatched" />
                                                <Label htmlFor="status-dispatched">Dispatched</Label>
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
                     {activeTab === 'bill-print' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Bill Print</CardTitle>
                                <CardDescription>The following section helps in configuring Bill print settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <RadioGroup value={settings.cwtBifurcation} onValueChange={(value) => setSetting('cwtBifurcation', value as any)}>
                                    <div className="flex items-center gap-x-6 gap-y-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="None" id="cwt-none" />
                                            <Label htmlFor="cwt-none">None</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Print CWT" id="cwt-print" />
                                            <Label htmlFor="cwt-print">Print Category wise Tax(CWT) bifurcation on bill</Label>
                                        </div>
                                    </div>
                                </RadioGroup>

                                <RadioGroup value={settings.itemPricePrintOption} onValueChange={(value) => setSetting('itemPricePrintOption', value as any)}>
                                    <div className="space-y-2">
                                        <Label className="font-semibold">Select item price print option in bill print :</Label>
                                        <div className="flex flex-col gap-2 pl-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="without" id="price-without-tax" />
                                                <Label htmlFor="price-without-tax">Individual Item price will be shown (without backward tax) on printed bill</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="including" id="price-including-tax" />
                                                <Label htmlFor="price-including-tax">Individual Item price will be shown (including backward tax) on printed bill</Label>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>

                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <Checkbox id="show-backward-tax" checked={settings.showBackwardTax} onCheckedChange={(checked) => setSetting('showBackwardTax', Boolean(checked))} />
                                        <Label htmlFor="show-backward-tax">Show Backward tax on printed bill</Label>
                                    </div>
                                     <div className="flex items-start space-x-3">
                                        <Checkbox id="show-duplicate-reprint" checked={settings.showDuplicateOnReprint} onCheckedChange={(checked) => setSetting('showDuplicateOnReprint', Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="show-duplicate-reprint">Show Duplicate on a bill in case of multiple prints</Label>
                                            <p className="text-sm text-muted-foreground">When a bill is re-printed, it would show Duplicate at the top of the bill.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Checkbox id="show-customer-paid" checked={settings.showCustomerPaidAndReturn} onCheckedChange={(checked) => setSetting('showCustomerPaidAndReturn', Boolean(checked))} />
                                        <Label htmlFor="show-customer-paid">Show Customer paid and return to customer in bill print</Label>
                                    </div>
                                     <div className="flex items-start space-x-3">
                                        <Checkbox id="print-kot-token" checked={settings.printKotAsToken} onCheckedChange={(checked) => setSetting('printKotAsToken', Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="print-kot-token">Print KOT no on bill as Token no</Label>
                                            <p className="text-sm text-muted-foreground">[Note: If this options selected then it shows KOT no. on those bills whose KOT's are available in desktop application.]</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Checkbox id="show-addons" checked={settings.showAddonsInBill} onCheckedChange={(checked) => setSetting('showAddonsInBill', Boolean(checked))} />
                                        <Label htmlFor="show-addons">Show addons in bill print.</Label>
                                    </div>
                                     <div className="flex items-start space-x-3">
                                        <Checkbox id="show-order-barcode-bill" checked={settings.showOrderBarcodeOnBill} onCheckedChange={(checked) => setSetting('showOrderBarcodeOnBill', Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="show-order-barcode-bill">Show order barcode on bill print</Label>
                                            <p className="text-sm text-muted-foreground">Scan barcode to mark order food ready. This feature can be managed printer-wise from the printer settings. Riders from Swiggy & Zomato can use the same barcode for order pickup.</p>
                                        </div>
                                    </div>
                                      <div className="flex items-start space-x-3">
                                        <Checkbox id="merge-duplicate" checked={settings.mergeDuplicateItems} onCheckedChange={(checked) => setSetting('mergeDuplicateItems', Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="merge-duplicate">Merge Duplicate Item</Label>
                                            <p className="text-sm text-muted-foreground">This setting enables merging same items on bill is printed.</p>
                                        </div>
                                    </div>
                                     <div className="flex items-start space-x-3">
                                        <Checkbox id="merge-ebill" checked={settings.mergeEbillAndPrintBill} onCheckedChange={(checked) => setSetting('mergeEbillAndPrintBill', Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="merge-ebill">Merge ebill and print bill.</Label>
                                            <p className="text-sm text-muted-foreground">This settings send e-bill when the bill is printed.</p>
                                        </div>
                                    </div>
                                </div>

                            </CardContent>
                             <CardFooter>
                                <Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                            </CardFooter>
                        </Card>
                    )}
                </>
            )}
        </SettingsPageLayout>
    );
}

