
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrintLayoutDialog } from "@/components/settings/PrintLayoutDialog";
import { useState } from "react";
import { Edit } from "lucide-react";
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { useSettings } from "@/contexts/SettingsContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const navItems = [
    { name: 'Print Layout', id: 'print-layout' },
    { name: 'Tax Settings', id: 'tax-settings' },
];

export default function BillingSettingsPage() {
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
    const { settings, setSetting, saveSettings } = useSettings();

    const handleSaveChanges = () => {
        saveSettings('Billing');
    };

    return (
        <>
            <SettingsPageLayout navItems={navItems}>
                {(activeTab) => (
                    <>
                        {activeTab === 'print-layout' && (
                            <Card>
                                <CardHeader className="flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Receipt Layout</CardTitle>
                                        <CardDescription>Customize the look and feel of your customer receipts.</CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={() => setIsPrintDialogOpen(true)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Layout
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Click the button above to preview and customize the print layout for your receipts.</p>
                                </CardContent>
                            </Card>
                        )}
                        {activeTab === 'tax-settings' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tax Settings</CardTitle>
                                    <CardDescription>Configure tax rates for your items.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="tax-rate">GST / Tax Rate (%)</Label>
                                        <Input 
                                            id="tax-rate" 
                                            type="number"
                                            value={settings.taxAmount}
                                            onChange={(e) => setSetting('taxAmount', Number(e.target.value))}
                                            className="max-w-xs"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            This tax rate will be applied to all orders.
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleSaveChanges}>Save Tax Settings</Button>
                                </CardFooter>
                            </Card>
                        )}
                    </>
                )}
            </SettingsPageLayout>
            <PrintLayoutDialog
                isOpen={isPrintDialogOpen}
                onOpenChange={setIsPrintDialogOpen}
            />
        </>
    );
}
