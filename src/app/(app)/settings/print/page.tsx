
'use client';

import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const navItems = [
    { name: 'Both', id: 'both' },
    { name: 'KOT Print', id: 'kot-print' },
    { name: 'Bill Print', id: 'bill-print' },
];

export default function PrintSettingsPage() {
    const { toast } = useToast();
    const [showOrderBarcode, setShowOrderBarcode] = useState(false);

    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your print settings have been updated.",
        });
        console.log({
            showOrderBarcode,
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
                                <CardTitle>KOT Print Settings</CardTitle>
                                <CardDescription>Settings specifically for KOT printing.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>KOT print settings will be available here.</p>
                            </CardContent>
                        </Card>
                    )}
                     {activeTab === 'bill-print' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Bill Print Settings</CardTitle>
                                <CardDescription>Settings specifically for Bill printing.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Bill print settings will be available here.</p>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </SettingsPageLayout>
    );
}
