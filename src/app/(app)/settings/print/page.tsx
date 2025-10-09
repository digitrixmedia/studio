
'use client';

import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const navItems = [
    { name: 'Both', id: 'both' },
    { name: 'KOT Print', id: 'kot-print' },
    { name: 'Bill Print', id: 'bill-print' },
];

export default function PrintSettingsPage() {
    const { toast } = useToast();
    const [showOrderBarcode, setShowOrderBarcode] = useState(false);
    
    // KOT Print States
    const [printKotOnPrintBill, setPrintKotOnPrintBill] = useState(true);
    const [printOnlyModifiedKot, setPrintOnlyModifiedKot] = useState(true);
    const [printOnlyModifiedItems, setPrintOnlyModifiedItems] = useState(false);
    const [printCancelledKot, setPrintCancelledKot] = useState(false);
    const [printAddonsBelow, setPrintAddonsBelow] = useState(false);
    const [showDuplicateInKot, setShowDuplicateInKot] = useState(true);
    const [printDeletedItems, setPrintDeletedItems] = useState(false);
    const [printDeletedInSeparateKot, setPrintDeletedInSeparateKot] = useState(false);
    const [showBarcodeOnKot, setShowBarcodeOnKot] = useState(false);
    const [printOnMove, setPrintOnMove] = useState(true);
    const [printKotOnStatus, setPrintKotOnStatus] = useState('None');
    
    // Bill Print States
    const [cwtBifurcation, setCwtBifurcation] = useState('None');
    const [itemPricePrintOption, setItemPricePrintOption] = useState('without');
    const [showBackwardTax, setShowBackwardTax] = useState(true);
    const [showDuplicateOnReprint, setShowDuplicateOnReprint] = useState(true);
    const [showCustomerPaidAndReturn, setShowCustomerPaidAndReturn] = useState(false);
    const [printKotAsToken, setPrintKotAsToken] = useState(false);
    const [showAddonsInBill, setShowAddonsInBill] = useState(true);
    const [showOrderBarcodeOnBill, setShowOrderBarcodeOnBill] = useState(false);
    const [mergeDuplicateItems, setMergeDuplicateItems] = useState(true);
    const [mergeEbillAndPrintBill, setMergeEbillAndPrintBill] = useState(false);


    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your print settings have been updated.",
        });
        console.log({
            showOrderBarcode,
            printKotOnPrintBill,
            printOnlyModifiedKot,
            printOnlyModifiedItems,
            printCancelledKot,
            printAddonsBelow,
            showDuplicateInKot,
            printDeletedItems,
            printDeletedInSeparateKot,
            showBarcodeOnKot,
            printOnMove,
            printKotOnStatus,
            cwtBifurcation,
            itemPricePrintOption,
            showBackwardTax,
            showDuplicateOnReprint,
            showCustomerPaidAndReturn,
            printKotAsToken,
            showAddonsInBill,
            showOrderBarcodeOnBill,
            mergeDuplicateItems,
            mergeEbillAndPrintBill,
        })
    };

    return (
        <SettingsPageLayout navItems={navItems}>
            {(activeTab) => (
                <>
                    {activeTab === 'both' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Both</CardTitle>
                                <CardDescription>The following section helps in configuring Bill/KOT print settings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start space-x-3">
                                    <Checkbox id="show-barcode" checked={showOrderBarcode} onCheckedChange={(checked) => setShowOrderBarcode(Boolean(checked))} />
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
                                <Button onClick={handleSaveChanges}>Save Changes</Button>
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
                                        <Checkbox id="print-kot-on-bill" checked={printKotOnPrintBill} onCheckedChange={(checked) => setPrintKotOnPrintBill(Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="print-kot-on-bill">Print KOT on Print Bill</Label>
                                            <p className="text-sm text-muted-foreground">This setting will only work when the print bill action is initiated for the first time, for the reprint of KOT, the user must do that from KOT listing in the PoS.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Checkbox id="print-modified-kot" checked={printOnlyModifiedKot} onCheckedChange={(checked) => setPrintOnlyModifiedKot(Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="print-modified-kot">Print Only Modified KOT</Label>
                                            <p className="text-sm text-muted-foreground">This setting when enabled print only the KOT, where modification (i.e item change or item deletion) with the label "Modified" on the top of the KOT.</p>
                                        </div>
                                    </div>
                                     <div className="flex items-start space-x-3">
                                        <Checkbox id="print-modified-items" checked={printOnlyModifiedItems} onCheckedChange={(checked) => setPrintOnlyModifiedItems(Boolean(checked))} />
                                        <Label htmlFor="print-modified-items">Print Only Modified Items in KOT</Label>
                                    </div>
                                      <div className="flex items-start space-x-3">
                                        <Checkbox id="print-cancelled-kot" checked={printCancelledKot} onCheckedChange={(checked) => setPrintCancelledKot(Boolean(checked))} />
                                        <Label htmlFor="print-cancelled-kot">Print Cancelled KOT</Label>
                                    </div>
                                     <div className="flex items-start space-x-3">
                                        <Checkbox id="print-addons-below" checked={printAddonsBelow} onCheckedChange={(checked) => setPrintAddonsBelow(Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="print-addons-below">Print add-ons and special notes below item row in KOT</Label>
                                            <p className="text-sm text-muted-foreground">Print add-ons and special notes for the particular item below the item name row in KOT.</p>
                                        </div>
                                    </div>
                                     <div className="flex items-start space-x-3">
                                        <Checkbox id="show-duplicate" checked={showDuplicateInKot} onCheckedChange={(checked) => setShowDuplicateInKot(Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="show-duplicate">Show Duplicate in KOT in case of multiple prints</Label>
                                            <p className="text-sm text-muted-foreground">When a KOT is re-printed, it would show Duplicate at the top of the KOT.</p>
                                        </div>
                                    </div>
                                      <div className="flex items-start space-x-3">
                                        <Checkbox id="print-deleted-items" checked={printDeletedItems} onCheckedChange={(checked) => setPrintDeletedItems(Boolean(checked))} />
                                        <Label htmlFor="print-deleted-items">Print Deleted Items In KOT</Label>
                                    </div>
                                     <div className="flex items-start space-x-3">
                                        <Checkbox id="print-deleted-separate" checked={printDeletedInSeparateKot} onCheckedChange={(checked) => setPrintDeletedInSeparateKot(Boolean(checked))} disabled />
                                        <Label htmlFor="print-deleted-separate" className="text-gray-400">Print Deleted Items in seprate KOT</Label>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Checkbox id="show-barcode-kot" checked={showBarcodeOnKot} onCheckedChange={(checked) => setShowBarcodeOnKot(Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="show-barcode-kot">Show order barcode on KoT print</Label>
                                             <p className="text-sm text-muted-foreground">Scan barcode to mark order food ready. This feature can be managed printer-wise from the printer settings. Riders from Swiggy & Zomato can use the same barcode for order pickup.</p>
                                        </div>
                                    </div>
                                      <div className="flex items-start space-x-3">
                                        <Checkbox id="print-on-move" checked={printOnMove} onCheckedChange={(checked) => setPrintOnMove(Boolean(checked))} />
                                        <Label htmlFor="print-on-move">While moving KOT items from one table to another table print KOT</Label>
                                    </div>
                                </div>
                                <RadioGroup value={printKotOnStatus} onValueChange={setPrintKotOnStatus}>
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
                                <Button onClick={handleSaveChanges}>Save Changes</Button>
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
                                <RadioGroup value={cwtBifurcation} onValueChange={setCwtBifurcation}>
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

                                <RadioGroup value={itemPricePrintOption} onValueChange={setItemPricePrintOption}>
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
                                        <Checkbox id="show-backward-tax" checked={showBackwardTax} onCheckedChange={(checked) => setShowBackwardTax(Boolean(checked))} />
                                        <Label htmlFor="show-backward-tax">Show Backward tax on printed bill</Label>
                                    </div>
                                     <div className="flex items-start space-x-3">
                                        <Checkbox id="show-duplicate-reprint" checked={showDuplicateOnReprint} onCheckedChange={(checked) => setShowDuplicateOnReprint(Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="show-duplicate-reprint">Show Duplicate on a bill in case of multiple prints</Label>
                                            <p className="text-sm text-muted-foreground">When a bill is re-printed, it would show Duplicate at the top of the bill.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Checkbox id="show-customer-paid" checked={showCustomerPaidAndReturn} onCheckedChange={(checked) => setShowCustomerPaidAndReturn(Boolean(checked))} />
                                        <Label htmlFor="show-customer-paid">Show Customer paid and return to customer in bill print</Label>
                                    </div>
                                     <div className="flex items-start space-x-3">
                                        <Checkbox id="print-kot-token" checked={printKotAsToken} onCheckedChange={(checked) => setPrintKotAsToken(Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="print-kot-token">Print KOT no on bill as Token no</Label>
                                            <p className="text-sm text-muted-foreground">[Note: If this options selected then it shows KOT no. on those bills whose KOT's are available in desktop application.]</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Checkbox id="show-addons" checked={showAddonsInBill} onCheckedChange={(checked) => setShowAddonsInBill(Boolean(checked))} />
                                        <Label htmlFor="show-addons">Show addons in bill print.</Label>
                                    </div>
                                     <div className="flex items-start space-x-3">
                                        <Checkbox id="show-order-barcode-bill" checked={showOrderBarcodeOnBill} onCheckedChange={(checked) => setShowOrderBarcodeOnBill(Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="show-order-barcode-bill">Show order barcode on bill print</Label>
                                            <p className="text-sm text-muted-foreground">Scan barcode to mark order food ready. This feature can be managed printer-wise from the printer settings. Riders from Swiggy & Zomato can use the same barcode for order pickup.</p>
                                        </div>
                                    </div>
                                      <div className="flex items-start space-x-3">
                                        <Checkbox id="merge-duplicate" checked={mergeDuplicateItems} onCheckedChange={(checked) => setMergeDuplicateItems(Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="merge-duplicate">Merge Duplicate Item</Label>
                                            <p className="text-sm text-muted-foreground">This setting enables merging same items on bill is printed.</p>
                                        </div>
                                    </div>
                                     <div className="flex items-start space-x-3">
                                        <Checkbox id="merge-ebill" checked={mergeEbillAndPrintBill} onCheckedChange={(checked) => setMergeEbillAndPrintBill(Boolean(checked))} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="merge-ebill">Merge ebill and print bill.</Label>
                                            <p className="text-sm text-muted-foreground">This settings send e-bill when the bill is printed.</p>
                                        </div>
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
