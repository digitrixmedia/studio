
'use client';

import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/contexts/SettingsContext";

const navItems = [
    { name: 'Customer Settings', id: 'customer' },
    { name: 'Due Payment Settings', id: 'due-payment' },
];

export default function CustomerSettingsPage() {
    const { settings, setSetting, saveSettings } = useSettings();

    const handleSaveChanges = () => {
        saveSettings('Customer');
    };

    return (
        <SettingsPageLayout navItems={navItems}>
            {(activeTab) => (
                <>
                    {activeTab === 'customer' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Settings</CardTitle>
                                <CardDescription>The following settings help in configure the customer entry on billing screen.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                    <Label className="font-semibold pt-2">Customer phone validation on billing screen</Label>
                                    <div className="md:col-span-2">
                                        <div className="flex items-center gap-x-6 gap-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="validation-delivery" checked={settings.phoneValidationDelivery} onCheckedChange={checked => setSetting('phoneValidationDelivery', !!checked)} disabled/>
                                                <Label htmlFor="validation-delivery" className="text-gray-400">Delivery</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="validation-pickup" checked={settings.phoneValidationPickUp} onCheckedChange={checked => setSetting('phoneValidationPickUp', !!checked)} disabled/>
                                                <Label htmlFor="validation-pickup" className="text-gray-400">Pick Up</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="validation-dinein" checked={settings.phoneValidationDineIn} onCheckedChange={checked => setSetting('phoneValidationDineIn', !!checked)} disabled/>
                                                <Label htmlFor="validation-dinein" className="text-gray-400">Dine In</Label>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">This settings enables validation of phone number of customer. <br/>This setting is only available in cloud login.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                    <Label htmlFor="min-length" className="font-semibold">Minimum length for phone number (in digits) *:</Label>
                                    <div className="md:col-span-2">
                                        <Input id="min-length" value={settings.minLength} onChange={e => setSetting('minLength', e.target.value)} disabled className="w-full md:w-1/2" />
                                        <p className="text-xs text-muted-foreground mt-1">This setting is only available in cloud login.</p>
                                    </div>
                                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                    <Label htmlFor="max-length" className="font-semibold">Maximum length for phone number (in digits) *:</Label>
                                    <div className="md:col-span-2">
                                        <Input id="max-length" value={settings.maxLength} onChange={e => setSetting('maxLength', e.target.value)} disabled className="w-full md:w-1/2" />
                                        <p className="text-xs text-muted-foreground mt-1">This setting is only available in cloud login.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Checkbox id="show-email" checked={settings.showCustomerEmail} onCheckedChange={checked => setSetting('showCustomerEmail', !!checked)} disabled/>
                                    <div className="grid gap-1.5 leading-none">
                                        <Label htmlFor="show-email" className="text-gray-400">Show customer email on billing screen.</Label>
                                        <p className="text-sm text-muted-foreground">This setting is only available in cloud login.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Checkbox id="create-bill-tax-id" checked={settings.createBillsWithTaxId} onCheckedChange={checked => setSetting('createBillsWithTaxId', !!checked)} disabled/>
                                    <div className="grid gap-1.5 leading-none">
                                        <Label htmlFor="create-bill-tax-id" className="text-gray-400">Create bills with the tax authority with the TAX ID number available</Label>
                                        <p className="text-sm text-muted-foreground">This setting is only available in cloud login.</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSaveChanges}>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    )}
                    {activeTab === 'due-payment' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Due Payment settings</CardTitle>
                                <CardDescription>The following settings configures the Due Payment module in billing screen.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start space-x-3">
                                    <Checkbox 
                                        id="due-payment-phone" 
                                        checked={settings.isPhoneMandatoryForDue} 
                                        onCheckedChange={checked => setSetting('isPhoneMandatoryForDue', !!checked)}
                                        disabled
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label htmlFor="due-payment-phone" className="text-gray-400">Customer Phone number mandatory when the due payment is selected</Label>
                                        <p className="text-sm text-muted-foreground">This setting is only available in cloud login.</p>
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
