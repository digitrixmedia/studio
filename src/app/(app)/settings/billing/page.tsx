
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { useSettings } from "@/contexts/SettingsContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const navItems = [
    { name: 'Tax Settings', id: 'tax-settings' },
];

export default function BillingSettingsPage() {
    const { settings, setSetting, saveSettings, isSaving } = useSettings();

    return (
        <>
            <SettingsPageLayout navItems={navItems}>
                {(activeTab) => (
                    <>
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
                                    <Button onClick={saveSettings} disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save Tax Settings'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}
                    </>
                )}
            </SettingsPageLayout>
        </>
    );
}
