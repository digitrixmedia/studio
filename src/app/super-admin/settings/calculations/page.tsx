
'use client';

import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/contexts/SettingsContext";

const navItems = [
    { name: 'Round-Off & Tax', id: 'round-off' },
    { name: 'Service Charge', id: 'service-charge' },
    { name: 'Container Charge', id: 'container-charge' },
    { name: 'Delivery Charge', id: 'delivery-charge' },
    { name: 'Discount', id: 'discount' },
    { name: 'KOT/Bill', id: 'kot-bill' },
    { name: 'Special Notes', id: 'special-notes' },
    { name: 'Surcharge', id: 'surcharge' },
];

export default function SuperAdminCalculationsPage() {
    const { settings, setSetting, saveSettings, isSaving } = useSettings();

    return (
        <SettingsPageLayout navItems={navItems}>
            {(activeTab) => (
                <>
                    {activeTab === 'round-off' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Round-Off & Tax Options</CardTitle>
                                <CardDescription>The following settings pertains to configuring the Round-Off & Tax Options.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <RadioGroup value={settings.roundOffOption} onValueChange={(value) => setSetting('roundOffOption', value as any)}>
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
                                        <Select value={settings.roundOffIncrement} onValueChange={(value) => setSetting('roundOffIncrement', value as any)}>
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
                                        <Select value={settings.decimalPoints} onValueChange={(value) => setSetting('decimalPoints', value as any)}>
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
                                <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                    <Label htmlFor="tax" className="font-semibold pt-2 md:text-right">Tax Amount (%):</Label>
                                    <div className="md:col-span-2">
                                        <Input
                                            id="tax"
                                            type="number"
                                            value={settings.taxAmount}
                                            onChange={(e) => setSetting('taxAmount', Number(e.target.value))}
                                            className="w-full md:w-1/2"
                                        />
                                        <p className="text-xs text-muted-foreground mt-2">Set the GST/Tax percentage to be applied to orders.</p>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Button onClick={saveSettings} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
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
                                        <Checkbox id="display-service-charge" checked={settings.displayServiceCharge} onCheckedChange={(checked) => setSetting('displayServiceCharge', !!checked)} />
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
                                <Button onClick={saveSettings} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
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
                                    <Checkbox id="show-container-charge" checked={settings.showContainerCharge} onCheckedChange={checked => setSetting('showContainerCharge', !!checked)} />
                                    <Label htmlFor="show-container-charge">Show Container Charge On Billing Screen</Label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                    <Label htmlFor="container-charge-label" className="md:text-right">Container Charge Label*:</Label>
                                    <Input id="container-charge-label" value={settings.containerChargeLabel} onChange={e => setSetting('containerChargeLabel', e.target.value)} className="md:col-span-2 w-full md:w-1/2" />
                                </div>
                                
                                <RadioGroup value={settings.containerChargeType} onValueChange={(value) => setSetting('containerChargeType', value as any)}>
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
                                                <Checkbox id="auto-delivery" checked={settings.autoCalcDelivery} onCheckedChange={checked => setSetting('autoCalcDelivery', !!checked)} />
                                                <Label htmlFor="auto-delivery">Delivery</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="auto-pickup" checked={settings.autoCalcPickUp} onCheckedChange={checked => setSetting('autoCalcPickUp', !!checked)} />
                                                <Label htmlFor="auto-pickup">Pick Up</Label>
                                            </div>
                                             <div className="flex items-center space-x-2">
                                                <Checkbox id="auto-dinein" checked={settings.autoCalcDineIn} onCheckedChange={checked => setSetting('autoCalcDineIn', !!checked)} />
                                                <Label htmlFor="auto-dinein">Dine In</Label>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">This setting enables container charge without pressing a button beside the label in billing screen.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                    <div className="flex items-center space-x-2 md:col-start-2">
                                        <Checkbox id="tax-on-container" checked={settings.taxOnContainerCharge} onCheckedChange={checked => setSetting('taxOnContainerCharge', !!checked)} />
                                        <Label htmlFor="tax-on-container">Calculate tax on Container Charge.</Label>
                                    </div>
                                </div>
                                <Separator />
                                 <RadioGroup value={settings.specificAmountCondition} onValueChange={(value) => setSetting('specificAmountCondition', value as any)}>
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
                                    <Input id="specific-amount" value={settings.specificAmount} onChange={e => setSetting('specificAmount', e.target.value)} className="md:col-span-2 w-full md:w-1/2" disabled={settings.specificAmountCondition === 'None'} />
                                </div>

                            </CardContent>
                            <CardFooter>
                                <Button onClick={saveSettings} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
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
                                        <Checkbox id="show-delivery-charge" checked={settings.showDeliveryCharge} onCheckedChange={(checked) => setSetting('showDeliveryCharge', !!checked)} />
                                        <Label htmlFor="show-delivery-charge">Show Delivery Charge On Billing Screen</Label>
                                    </div>
                                     <p className="text-xs text-muted-foreground ml-6">This setting would describe what would the delivery charge would be displayed as.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                    <Label htmlFor="default-delivery-charge" className="md:text-right">Default Delivery Charge (Only for Delivery) *:</Label>
                                    <Input id="default-delivery-charge" value={settings.defaultDeliveryCharge} onChange={e => setSetting('defaultDeliveryCharge', e.target.value)} className="md:col-span-2 w-full md:w-1/2" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                    <div className="flex items-center space-x-2 md:col-start-2">
                                        <Checkbox id="tax-on-delivery" checked={settings.taxOnDeliveryCharge} onCheckedChange={checked => setSetting('taxOnDeliveryCharge', !!checked)} />
                                        <Label htmlFor="tax-on-delivery">Calculate tax on Delivery Charge.</Label>
                                    </div>
                                </div>
                                <Separator />
                                <RadioGroup value={settings.deliveryAmountCondition} onValueChange={(value) => setSetting('deliveryAmountCondition', value as any)}>
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
                                    <Input id="delivery-specific-amount" value={settings.deliverySpecificAmount} onChange={e => setSetting('deliverySpecificAmount', e.target.value)} className="md:col-span-2 w-full md:w-1/2" disabled={settings.deliveryAmountCondition === 'None'} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={saveSettings} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                            </CardFooter>
                        </Card>
                    )}
                     {activeTab === 'discount' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Discount</CardTitle>
                                <CardDescription>The following settings help in describing the in the billing screen.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                 <div className="flex items-start space-x-2">
                                    <Checkbox id="tax-before-discount" checked={settings.calculateTaxBeforeDiscount} onCheckedChange={checked => setSetting('calculateTaxBeforeDiscount', !!checked)} />
                                    <Label htmlFor="tax-before-discount">Calculate Tax Before Discount Calculation</Label>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <Checkbox id="backward-tax" checked={settings.calculateBackwardTax} onCheckedChange={checked => setSetting('calculateBackwardTax', !!checked)} />
                                    <div>
                                        <Label htmlFor="backward-tax">Calculate Backward Tax After Discount</Label>
                                        <p className="text-xs text-muted-foreground">Note: Ignore this settings if you are using forward tax configuration for your outlet</p>
                                    </div>
                                </div>
                                 <div className="flex items-start space-x-2">
                                    <Checkbox id="auto-apply-discount" checked={settings.autoApplyItemDiscount} onCheckedChange={checked => setSetting('autoApplyItemDiscount', !!checked)} />
                                    <div>
                                        <Label htmlFor="auto-apply-discount">Item/ Category discount auto-applied</Label>
                                        <p className="text-xs text-muted-foreground">This setting enables discount without pressing a button beside the label in billing screen.</p>
                                    </div>
                                </div>
                                 <div className="flex items-start space-x-2">
                                    <Checkbox id="show-item-discount" checked={settings.showItemDiscountBox} onCheckedChange={checked => setSetting('showItemDiscountBox', !!checked)} />
                                    <Label htmlFor="show-item-discount">Show Item/Category wise discount box while adding an item</Label>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <Checkbox id="ignore-addon-price" checked={settings.ignoreAddonPrice} onCheckedChange={checked => setSetting('ignoreAddonPrice', !!checked)} />
                                    <Label htmlFor="ignore-addon-price">Ignore add-on price while calculating discount (works for all types for discount)</Label>
                                </div>
                                 <div className="flex items-start space-x-2">
                                    <Checkbox id="special-discount-reason" checked={settings.specialDiscountReasonMandatory} onCheckedChange={checked => setSetting('specialDiscountReasonMandatory', !!checked)} />
                                    <Label htmlFor="special-discount-reason">Special discount reason mandatory</Label>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <Checkbox id="display-discount-textbox" checked={settings.displayDiscountTextbox} onCheckedChange={checked => setSetting('displayDiscountTextbox', !!checked)} />
                                    <Label htmlFor="display-discount-textbox">Display Discount/Coupon Textbox</Label>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Button onClick={saveSettings} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                            </CardFooter>
                        </Card>
                    )}
                     {activeTab === 'kot-bill' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>KOT/Bill</CardTitle>
                                <CardDescription>The following settings describes the settings related to the KOT/Bill in the billing screen.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-2">
                                        <Checkbox id="assign-bill-sales" checked={settings.assignBillToKotUser} onCheckedChange={(checked) => setSetting('assignBillToKotUser', !!checked)} />
                                        <div>
                                            <Label htmlFor="assign-bill-sales">Assign Bill sales to KOT punched user</Label>
                                            <p className="text-xs text-muted-foreground">When this setting is enabled, the bill sales would be assigned to the user who punched the KOT in the relevant reports.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <Checkbox id="save-kot" checked={settings.saveKotOnSaveBill} onCheckedChange={(checked) => setSetting('saveKotOnSaveBill', !!checked)} />
                                        <Label htmlFor="save-kot">Save KOT On Save Bill (Only first time not in edit)</Label>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <Checkbox id="consider-non-prepared" checked={settings.considerNonPreparedKot} onCheckedChange={(checked) => setSetting('considerNonPreparedKot', !!checked)} />
                                        <div>
                                            <Label htmlFor="consider-non-prepared">Consider Non Prepared KOT in Bill</Label>
                                            <p className="text-xs text-muted-foreground">When this setting is enabled, even the KOT which is not marked as prepared in the system would be considered while printing bill</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <Checkbox id="merge-duplicates" checked={settings.mergeDuplicateItems} onCheckedChange={(checked) => setSetting('mergeDuplicateItems', !!checked)} />
                                        <div>
                                        <Label htmlFor="merge-duplicates">Merge duplicate items</Label>
                                        <p className="text-xs text-muted-foreground">This setting enables merging same items on billing screen.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <Checkbox id="split-bill" checked={settings.splitBillWithGroups} onCheckedChange={(checked) => setSetting('splitBillWithGroups', !!checked)} />
                                        <Label htmlFor="split-bill">Split a bill when multiple groups are present</Label>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <Checkbox id="auto-finalize" disabled checked={settings.autoFinalize} onCheckedChange={(checked) => setSetting('autoFinalize', !!checked)} />
                                        <div>
                                            <Label htmlFor="auto-finalize">Auto Finalize Order</Label>
                                            <p className="text-xs text-muted-foreground">This setting is only available in cloud login.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                    <Label htmlFor="reset-kot" className="md:text-right">Everyday reset KOT number from*:</Label>
                                    <div className="md:col-span-2">
                                        <Input id="reset-kot" type="number" value={settings.resetKotNumber} onChange={(e) => setSetting('resetKotNumber', e.target.value)} className="w-full md:w-1/2" />
                                        <p className="text-xs text-muted-foreground mt-1">When this setting is enabled, the KOT number would reset to this particular number at the start of every day.</p>
                                    </div>
                                </div>
                                <RadioGroup value={settings.splitBillOption} onValueChange={(value) => setSetting('splitBillOption', value as any)}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                        <Label className="md:text-right">Split Bill Options.</Label>
                                        <div className="md:col-span-2 flex items-center gap-6">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Print Group wise" id="split-group" />
                                                <Label htmlFor="split-group">Print Group wise</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Generate Separate Bills" id="split-separate" />
                                                <Label htmlFor="split-separate">Generate Separate Bills</Label>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>
                                <Separator />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Complimentary Bill</h3>
                                    <p className="text-sm text-muted-foreground mb-4">The following settings configures the complimentary order in billing screen</p>
                                    <div className="flex items-start space-x-2">
                                        <Checkbox id="is-complimentary" checked={settings.isComplimentary} onCheckedChange={(checked) => setSetting('isComplimentary', !!checked)} />
                                        <Label htmlFor="is-complimentary">Mark current bill as complimentary</Label>
                                    </div>
                                    <div className="flex items-start space-x-2 mt-4">
                                        <Checkbox id="disable-tax-complimentary" checked={settings.disableTaxOnComplimentary} onCheckedChange={(checked) => setSetting('disableTaxOnComplimentary', !!checked)} />
                                        <Label htmlFor="disable-tax-complimentary">Disable Taxes and other Charges(Packing Charge, Delivery charge, Service charge) on Complimentary Bill</Label>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Button onClick={saveSettings} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                            </CardFooter>
                        </Card>
                    )}
                    {activeTab === 'special-notes' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Special Notes</CardTitle>
                                <CardDescription>The following settings describes the settings related to the special notes in the billing screen.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-start space-x-2">
                                    <Checkbox id="save-special-note" checked={settings.saveSpecialNote} onCheckedChange={(checked) => setSetting('saveSpecialNote', !!checked)} />
                                    <Label htmlFor="save-special-note">Save special note into special notes master while saving kot / orders.</Label>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={saveSettings} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                            </CardFooter>
                        </Card>
                    )}
                    {activeTab === 'surcharge' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Surcharge</CardTitle>
                                <CardDescription>The following settings describes the settings related to the surcharge in the billing screen.</CardDescription>
                            </CardHeader>
                             <CardContent className="space-y-6">
                                <div className="flex items-start space-x-2">
                                    <Checkbox id="display-surcharge" checked={settings.displaySurcharge} onCheckedChange={(checked) => setSetting('displaySurcharge', !!checked)} />
                                    <Label htmlFor="display-surcharge">Display & Calculate Surcharge</Label>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Button onClick={saveSettings} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                            </CardFooter>
                        </Card>
                    )}
                </>
            )}
        </SettingsPageLayout>
    );
}
