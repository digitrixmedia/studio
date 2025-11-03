

'use client';

import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { users } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSettings } from "@/contexts/SettingsContext";

const navItems = [
    { name: 'Display Settings', id: 'display' },
    { name: 'Default Values', id: 'defaults' },
    { name: 'Discount Settings', id: 'discount' },
    { name: 'Order Cancel Reasons', id: 'cancel' },
    { name: 'Table Settlement', id: 'settlement' },
]

export default function DisplaySettingsPage() {
    const { settings, setSetting, saveSettings } = useSettings();
    
    const handleSaveChanges = () => {
        saveSettings('Display');
    };

    return (
        <SettingsPageLayout navItems={navItems}>
             {(activeTab) => (
                <>
                    {activeTab === 'display' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Display Settings</CardTitle>
                                <CardDescription>Defines the default value for the components of billing screen.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <SettingRadioGroup
                                    label="Layout for Billing Screen"
                                    description="Configure the type of display between a touch based or keyboard based."
                                    value={settings.billingLayout}
                                    onValueChange={(value) => setSetting('billingLayout', value as 'Touch Screen' | 'Keyboard')}
                                    options={['Keyboard', 'Touch Screen']}
                                />
                                <SettingRadioGroup
                                    label="Display preference for the Menu"
                                    description="Note: Only for Touch Screen"
                                    value={settings.menuPreference}
                                    onValueChange={(value) => setSetting('menuPreference', value as 'On the Left' | 'On the Right')}
                                    options={['On the Left', 'On the Right']}
                                />
                                 <SettingRadioGroup
                                    label="Default Screen to Display"
                                    description="Configure the default screen users see after login."
                                    value={settings.defaultScreen}
                                    onValueChange={(value) => setSetting('defaultScreen', value as 'Dashboard' | 'Billing' | 'Table Management')}
                                    options={['Dashboard', 'Billing', 'Table Management']}
                                />
                                <SettingRadioGroup
                                    label="Order Live View"
                                    description="This settings describe how would the orders be displayed in Order live view."
                                    value={settings.orderLiveView}
                                    onValueChange={(value) => setSetting('orderLiveView', value as 'ASC' | 'DESC')}
                                    options={['ASC', 'DESC']}
                                />
                                <SettingRadioGroup
                                    label="KOT Live View"
                                    description="This settings describe how would the orders be displayed in KOT live view."
                                    value={settings.kotLiveView}
                                    onValueChange={(value) => setSetting('kotLiveView', value as 'ASC' | 'DESC')}
                                    options={['ASC', 'DESC']}
                                />
                                
                                <Separator />
                                
                                <div className="space-y-4">
                                     <h3 className="font-medium text-lg">General Display Options</h3>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="kpt-breached" checked={settings.kptBreachedOnTop} onCheckedChange={(checked) => setSetting('kptBreachedOnTop', !!checked)} />
                                        <Label htmlFor="kpt-breached">KPT breached order should remain on top of the screen in live view</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="prep-time-alerts" checked={settings.displayPrepTimeAlerts} onCheckedChange={(checked) => setSetting('displayPrepTimeAlerts', !!checked)} />
                                        <Label htmlFor="prep-time-alerts">Display alerts for prep time exceeding or order handover on the live view card</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="display-item-images" checked={settings.displayItemImages} onCheckedChange={(checked) => setSetting('displayItemImages', !!checked)} />
                                        <Label htmlFor="display-item-images">Display item images on the billing screen</Label>
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <Checkbox id="display-search" checked={settings.displaySearch} onCheckedChange={(checked) => setSetting('displaySearch', !!checked)} />
                                        <Label htmlFor="display-search">Display Search Item option on billing screen (Only for Touch view)</Label>
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <Checkbox id="display-settle-amount" checked={settings.displaySettleAmount} onCheckedChange={(checked) => setSetting('displaySettleAmount', !!checked)} />
                                        <Label htmlFor="display-settle-amount">Display settle amount Textbox</Label>
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <Checkbox id="show-cwt" checked={settings.showCwt} onCheckedChange={(checked) => setSetting('showCwt', !!checked)} />
                                        <Label htmlFor="show-cwt">Show CWT (Category Wise Taxes) Bifurcation On Billing Screen</Label>
                                    </div>
                                </div>
                                
                                <Separator />

                                <div className="space-y-6">
                                     <h3 className="font-medium text-lg">Tip Settings</h3>
                                     <div className="flex items-center space-x-2">
                                        <Checkbox id="show-tip" checked={settings.showTip} onCheckedChange={(checked) => setSetting('showTip', !!checked)} />
                                        <Label htmlFor="show-tip">Show Tip</Label>
                                    </div>
                                    <RadioGroup value={settings.tipSelection} onValueChange={(value) => setSetting('tipSelection', value as 'None' | 'Percentage' | 'Fixed')}>
                                        <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                            <Label className='md:text-right'>Set Tip selection as :</Label>
                                            <div className='md:col-span-2 flex items-center gap-6 pt-2'>
                                                 <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="None" id="tip-none" disabled={!settings.showTip} />
                                                    <Label htmlFor="tip-none">None</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Percentage" id="tip-percentage" disabled={!settings.showTip} />
                                                    <Label htmlFor="tip-percentage">Percentage</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Fixed" id="tip-fixed" disabled={!settings.showTip} />
                                                    <Label htmlFor="tip-fixed">Fixed</Label>
                                                </div>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                        <Label htmlFor="tip-value" className={`md:text-right ${!settings.showTip ? 'opacity-50' : ''}`}>Set Tip value</Label>
                                        <div className="md:col-span-2">
                                            <Input id="tip-value" value={settings.tipValue} onChange={e => setSetting('tipValue', e.target.value)} placeholder="Comma separated numeric values only" disabled={!settings.showTip || settings.tipSelection === 'None'} />
                                            <p className="text-xs text-muted-foreground mt-1">This configuration would be for customer selection of tip in Kiosk.</p>
                                        </div>
                                    </div>
                                </div>

                            </CardContent>
                             <CardFooter>
                                <Button onClick={handleSaveChanges}>Save Changes</Button>
                            </CardFooter>
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
                                        <Select value={settings.defaultOrderType} onValueChange={(value) => setSetting('defaultOrderType', value as 'Dine-In' | 'Takeaway' | 'Delivery')}>
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
                                        <Select value={settings.defaultCustomer} onValueChange={(value) => setSetting('defaultCustomer', value)}>
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
                                        <Select value={settings.defaultPayment} onValueChange={(value) => setSetting('defaultPayment', value as 'Cash' | 'UPI' | 'Due')}>
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
                                            value={settings.defaultQuantity}
                                            onChange={(e) => setSetting('defaultQuantity', e.target.value)}
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
                                  <Checkbox
                                    checked={settings.finalizeWithoutAmount}
                                    onCheckedChange={(checked) => setSetting('finalizeWithoutAmount', !!checked)}
                                    aria-label="Finalize order without amount"
                                  />
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Button onClick={handleSaveChanges}>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    )}
                    {activeTab === 'discount' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Discount Settings</CardTitle>
                                <CardDescription>Configure how discounts are applied and displayed in the billing screen.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Discount</h3>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                            <Label htmlFor="discount-label" className='md:text-right'>Discount Label</Label>
                                            <div className='md:col-span-2'>
                                                <Input id="discount-label" value={settings.discountLabel} onChange={e => setSetting('discountLabel', e.target.value)} />
                                                <p className="text-xs text-muted-foreground mt-1">This setting would describe what the discount would be displayed as.</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                            <Label htmlFor="discount-button-text" className='md:text-right'>Discount Calculate Button Text *</Label>
                                            <Input id="discount-button-text" className='md:col-span-2' value={settings.discountButtonText} onChange={e => setSetting('discountButtonText', e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                             <div className="md:col-start-2 md:col-span-2 space-y-4">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="display-no-discount" checked={settings.displayNoDiscount} onCheckedChange={checked => setSetting('displayNoDiscount', Boolean(checked))} />
                                                    <Label htmlFor="display-no-discount">Display "Leave as it is. (No Discount)" on Discount Screen?</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="default-open-discount" checked={settings.defaultOpenDiscount} onCheckedChange={checked => setSetting('defaultOpenDiscount', Boolean(checked))} />
                                                    <div>
                                                        <Label htmlFor="default-open-discount">By default make discount area open</Label>
                                                        <p className="text-xs text-muted-foreground">This settings enables default display of discount area in billing screen</p>
                                                    </div>
                                                </div>
                                             </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />
                                
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Order Wise Information</h3>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="enable-order-wise-info" checked={settings.enableOrderWiseInfo} onCheckedChange={checked => setSetting('enableOrderWiseInfo', Boolean(checked))}/>
                                        <div>
                                            <Label htmlFor="enable-order-wise-info">Enable Order wise information</Label>
                                            <p className="text-xs text-muted-foreground">The following settings helps in configures enabling as well as configuring Order wise information</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <Separator />

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Negative Quantity Settings</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Negative Quantity Reason</Label>
                                            <p className="text-sm text-muted-foreground">This setting is only available in cloud login.</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="allow-negative-quantity" checked={settings.allowNegativeQuantity} onCheckedChange={checked => setSetting('allowNegativeQuantity', Boolean(checked))}/>
                                            <Label htmlFor="allow-negative-quantity">Allow negative quantity</ Label>
                                        </div>
                                    </div>
                                </div>

                            </CardContent>
                             <CardFooter>
                                <Button onClick={handleSaveChanges}>Save Changes</Button>
                            </CardFooter>
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
                                <CardDescription>The following settings helps in configuring locking and releasing table in billing screen.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <RadioGroup value={settings.lockActiveTable} onValueChange={(value) => setSetting('lockActiveTable', value as any)}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                        <Label className='md:text-right'>Lock Active Table :</Label>
                                        <div className='md:col-span-2 flex items-center gap-6'>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="save-print" id="lock-save-print" />
                                                <Label htmlFor="lock-save-print">Save & Print</Label>
                                            </div>
                                             <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="settle-save" id="lock-settle-save" />
                                                <Label htmlFor="lock-settle-save">Settle & Save</Label>
                                            </div>
                                             <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="none" id="lock-none" />
                                                <Label htmlFor="lock-none">None</Label>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>
                                 <RadioGroup value={settings.releaseTableOn} onValueChange={(value) => setSetting('releaseTableOn', value as any)}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                        <Label className='md:text-right'>Release Table On :</Label>
                                        <div className='md:col-span-2 flex items-center gap-6'>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="print-bill" id="release-table-print-bill" />
                                                <Label htmlFor="release-table-print-bill">Print Bill</Label>
                                            </div>
                                             <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="settle-save" id="release-table-settle-save" />
                                                <Label htmlFor="release-table-settle-save">Settle & Save</Label>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>
                                <RadioGroup value={settings.releaseRecentSectionOn} onValueChange={(value) => setSetting('releaseRecentSectionOn', value as any)}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                        <Label className='md:text-right'>Release Recent Section On :</Label>
                                        <div className='md:col-span-2 flex items-center gap-6'>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="print-bill" id="release-recent-print-bill" />
                                                <Label htmlFor="release-recent-print-bill">Print Bill</Label>
                                            </div>
                                             <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="settle-save" id="release-recent-settle-save" />
                                                <Label htmlFor="release-recent-settle-save">Settle & Save</Label>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>
                                 <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                    <div className="md:col-start-2 md:col-span-2 flex items-center space-x-2">
                                        <Checkbox id="release-online" checked={settings.releaseForOnlineOrders} onCheckedChange={checked => setSetting('releaseForOnlineOrders', Boolean(checked))} />
                                        <Label htmlFor="release-online">Release Recent Section On Order Delivered (For Online Orders)</Label>
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

interface SettingRadioGroupProps {
    label: string;
    description: string;
    value: string;
    onValueChange: (value: string) => void;
    options: string[];
}

function SettingRadioGroup({ label, description, value, onValueChange, options }: SettingRadioGroupProps) {
    return (
        <RadioGroup value={value} onValueChange={onValueChange}>
            <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                <div className='space-y-1'>
                    <Label>{label}</Label>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <div className='md:col-span-2 flex items-center gap-6 pt-2'>
                    {options.map(option => (
                        <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${label.toLowerCase().replace(/ /g, '-')}-${option.toLowerCase()}`} />
                            <Label htmlFor={`${label.toLowerCase().replace(/ /g, '-')}-${option.toLowerCase()}`}>{option}</Label>
                        </div>
                    ))}
                </div>
            </div>
        </RadioGroup>
    )
}
