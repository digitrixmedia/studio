
'use client';

import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const navItems = [
    { name: 'Round-Off Options', id: 'round-off' },
    { name: 'Service Charge', id: 'service-charge' },
    { name: 'Container Charge', id: 'container-charge' },
    { name: 'Delivery Charge', id: 'delivery-charge' },
    { name: 'Discount', id: 'discount' },
    { name: 'KOT/Bill', id: 'kot-bill' },
    { name: 'Special Notes', id: 'special-notes' },
    { name: 'Surcharge', id: 'surcharge' },
];

export default function CalculationsSettingsPage() {
    const { toast } = useToast();
    // Round-off state
    const [roundOffOption, setRoundOffOption] = useState('Normal');
    const [roundOffIncrement, setRoundOffIncrement] = useState('1');
    const [decimalPoints, setDecimalPoints] = useState('2');
    // Service Charge state
    const [displayServiceCharge, setDisplayServiceCharge] = useState(false);
    // Container Charge state
    const [showContainerCharge, setShowContainerCharge] = useState(true);
    const [containerChargeLabel, setContainerChargeLabel] = useState('Container Charge');
    const [containerChargeType, setContainerChargeType] = useState('Item wise');
    const [autoCalcDelivery, setAutoCalcDelivery] = useState(true);
    const [autoCalcPickUp, setAutoCalcPickUp] = useState(true);
    const [autoCalcDineIn, setAutoCalcDineIn] = useState(false);
    const [taxOnContainerCharge, setTaxOnContainerCharge] = useState(false);
    const [specificAmountCondition, setSpecificAmountCondition] = useState('None');
    const [specificAmount, setSpecificAmount] = useState('0');
    // Delivery Charge state
    const [showDeliveryCharge, setShowDeliveryCharge] = useState(true);
    const [defaultDeliveryCharge, setDefaultDeliveryCharge] = useState('0');
    const [taxOnDeliveryCharge, setTaxOnDeliveryCharge] = useState(false);
    const [deliveryAmountCondition, setDeliveryAmountCondition] = useState('None');
    const [deliverySpecificAmount, setDeliverySpecificAmount] = useState('0');


    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your calculation settings have been updated.",
        });
        console.log({
            roundOffOption,
            roundOffIncrement,
            decimalPoints,
            displayServiceCharge,
            showContainerCharge,
            containerChargeLabel,
            containerChargeType,
            autoCalcDelivery,
            autoCalcPickUp,
            autoCalcDineIn,
            taxOnContainerCharge,
            specificAmountCondition,
            specificAmount,
            showDeliveryCharge,
            defaultDeliveryCharge,
            taxOnDeliveryCharge,
            deliveryAmountCondition,
            deliverySpecificAmount,
        });
    };

    return (
        <SettingsPageLayout navItems={navItems}>
            {(activeTab) => (
                <>
                    {activeTab === 'round-off' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Round-Off Options</CardTitle>
                                <CardDescription>The following settings pertains to configuring the Round-Off Options.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <RadioGroup value={roundOffOption} onValueChange={setRoundOffOption}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                        <Label className="font-semibold pt-2 md:text-right">Round off options for billing.:</Label>
                                        <div className="md:col-span-2 flex flex-wrap items-center gap-x-6 gap-y-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Normal" id="ro-normal" />
                                                <Label htmlFor="ro-normal">Normal</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Round off up" id="ro-up" />
                                                <Label htmlFor="ro-up">Round off up</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Round off down" id="ro-down" />
                                                <Label htmlFor="ro-down">Round off down</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="None" id="ro-none" />
                                                <Label htmlFor="ro-none">None</Label>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                    <Label htmlFor="increment" className="font-semibold pt-2 md:text-right">Round the number to the increments of *:</Label>
                                    <div className="md:col-span-2">
                                        <Select value={roundOffIncrement} onValueChange={setRoundOffIncrement}>
                                            <SelectTrigger id="increment" className="w-full md:w-1/2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1 (Default)</SelectItem>
                                                <SelectItem value="0.5">0.50</SelectItem>
                                                <SelectItem value="0.25">0.25</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground mt-2">In this, the number would be rounded to the increment that is selected. For example, if round-up option is selected and the increment is selected of 0.25, then the number 2.20 would be rounded to 2.25</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                    <Label htmlFor="decimal" className="font-semibold pt-2 md:text-right">Select decimal points for invoice calculation and Menu price input*:</Label>
                                    <div className="md:col-span-2">
                                        <Select value={decimalPoints} onValueChange={setDecimalPoints}>
                                            <SelectTrigger id="decimal" className="w-full md:w-1/2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">0</SelectItem>
                                                <SelectItem value="1">1</SelectItem>
                                                <SelectItem value="2">2 (Default)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground mt-2">The rounding calculation related to invoice would be based on the number selected in the dropdown. For example, if 1 is selected, 0.9277 would be rounded to 1.0</p>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Button onClick={handleSaveChanges}>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    )}
                    {activeTab === 'service-charge' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Charge</CardTitle>
                                <CardDescription>The following settings describes the settings related to the service charge in the billing screen.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-2">
                                        <Checkbox id="display-service-charge" checked={displayServiceCharge} onCheckedChange={(checked) => setDisplayServiceCharge(!!checked)} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="display-service-charge">Display & Calculate Service Charge</Label>
                                             <p className="text-xs text-muted-foreground">
                                                Note: As per guidelines issued by the Central Consumer Protection Authority, service charges cannot be automatically (or by default) added to a bill. In addition, outlets cannot charge taxes on service charges
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSaveChanges}>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    )}
                    {activeTab === 'container-charge' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Container Charge</CardTitle>
                                <CardDescription>The following settings describes the settings related to the container charge in the billing screen.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="show-container-charge" checked={showContainerCharge} onCheckedChange={checked => setShowContainerCharge(!!checked)} />
                                    <Label htmlFor="show-container-charge">Show Container Charge On Billing Screen</Label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                    <Label htmlFor="container-charge-label" className="md:text-right">Container Charge Label*:</Label>
                                    <Input id="container-charge-label" value={containerChargeLabel} onChange={e => setContainerChargeLabel(e.target.value)} className="md:col-span-2 w-full md:w-1/2" />
                                </div>
                                
                                <RadioGroup value={containerChargeType} onValueChange={setContainerChargeType}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                        <Label className="md:text-right pt-2">Container Charge :</Label>
                                        <div className="md:col-span-2">
                                            <div className="flex items-center gap-x-6 gap-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Item wise" id="cc-item" />
                                                    <Label htmlFor="cc-item">Item wise</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Order wise" id="cc-order" />
                                                    <Label htmlFor="cc-order">Order wise</Label>
                                                </div>
                                                 <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Fix per item" id="cc-fix" />
                                                    <Label htmlFor="cc-fix">Fix per item</Label>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">This setting defines whether the container charge is item wise and order wise.</p>
                                        </div>
                                    </div>
                                </RadioGroup>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                    <Label className="md:text-right pt-2">Calculate Container Charge Automatically</Label>
                                    <div className="md:col-span-2">
                                         <div className="flex items-center gap-x-6 gap-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="auto-delivery" checked={autoCalcDelivery} onCheckedChange={checked => setAutoCalcDelivery(!!checked)} />
                                                <Label htmlFor="auto-delivery">Delivery</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="auto-pickup" checked={autoCalcPickUp} onCheckedChange={checked => setAutoCalcPickUp(!!checked)} />
                                                <Label htmlFor="auto-pickup">Pick Up</Label>
                                            </div>
                                             <div className="flex items-center space-x-2">
                                                <Checkbox id="auto-dinein" checked={autoCalcDineIn} onCheckedChange={checked => setAutoCalcDineIn(!!checked)} />
                                                <Label htmlFor="auto-dinein">Dine In</Label>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">This setting enables container charge without pressing a button beside the label in billing screen.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                    <div className="flex items-center space-x-2 md:col-start-2">
                                        <Checkbox id="tax-on-container" checked={taxOnContainerCharge} onCheckedChange={checked => setTaxOnContainerCharge(!!checked)} />
                                        <Label htmlFor="tax-on-container">Calculate tax on Container Charge.</Label>
                                    </div>
                                </div>
                                <Separator />
                                 <RadioGroup value={specificAmountCondition} onValueChange={setSpecificAmountCondition}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                        <Label className="md:text-right pt-2">Set a specific amount to calculate :</Label>
                                        <div className="md:col-span-2 flex items-center gap-x-6 gap-y-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Greater Than" id="ca-greater" />
                                                <Label htmlFor="ca-greater">Greater Than</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Less Than" id="ca-less" />
                                                <Label htmlFor="ca-less">Less Than</Label>
                                            </div>
                                             <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="None" id="ca-none" />
                                                <Label htmlFor="ca-none">None</Label>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>
                                 <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                    <Label htmlFor="specific-amount" className="md:text-right">Amount :</Label>
                                    <Input id="specific-amount" value={specificAmount} onChange={e => setSpecificAmount(e.target.value)} className="md:col-span-2 w-full md:w-1/2" disabled={specificAmountCondition === 'None'} />
                                </div>

                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSaveChanges}>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    )}
                    {activeTab === 'delivery-charge' && (
                         <Card>
                            <CardHeader>
                                <CardTitle>Delivery Charge</CardTitle>
                                <CardDescription>The following settings describes the settings related to the delivery charge in the billing screen.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="show-delivery-charge" checked={showDeliveryCharge} onCheckedChange={(checked) => setShowDeliveryCharge(!!checked)} />
                                        <Label htmlFor="show-delivery-charge">Show Delivery Charge On Billing Screen</Label>
                                    </div>
                                     <p className="text-xs text-muted-foreground ml-6">This setting would describe what would the delivery charge would be displayed as.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                    <Label htmlFor="default-delivery-charge" className="md:text-right">Default Delivery Charge (Only for Delivery) *:</Label>
                                    <Input id="default-delivery-charge" value={defaultDeliveryCharge} onChange={e => setDefaultDeliveryCharge(e.target.value)} className="md:col-span-2 w-full md:w-1/2" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                    <div className="flex items-center space-x-2 md:col-start-2">
                                        <Checkbox id="tax-on-delivery" checked={taxOnDeliveryCharge} onCheckedChange={checked => setTaxOnDeliveryCharge(!!checked)} />
                                        <Label htmlFor="tax-on-delivery">Calculate tax on Delivery Charge.</Label>
                                    </div>
                                </div>
                                <Separator />
                                <RadioGroup value={deliveryAmountCondition} onValueChange={setDeliveryAmountCondition}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                        <Label className="md:text-right pt-2">Set a specific amount to calculate :</Label>
                                        <div className="md:col-span-2 flex items-center gap-x-6 gap-y-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Greater Than" id="dc-greater" />
                                                <Label htmlFor="dc-greater">Greater Than</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Less Than" id="dc-less" />
                                                <Label htmlFor="dc-less">Less Than</Label>
                                            </div>
                                             <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="None" id="dc-none" />
                                                <Label htmlFor="dc-none">None</Label>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>
                                 <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                    <Label htmlFor="delivery-specific-amount" className="md:text-right">Amount :</Label>
                                    <Input id="delivery-specific-amount" value={deliverySpecificAmount} onChange={e => setDeliverySpecificAmount(e.target.value)} className="md:col-span-2 w-full md:w-1/2" disabled={deliveryAmountCondition === 'None'} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSaveChanges}>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    )}
                    {activeTab !== 'round-off' && activeTab !== 'service-charge' && activeTab !== 'container-charge' && activeTab !== 'delivery-charge' && (
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

    
