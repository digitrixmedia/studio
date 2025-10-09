
'use client';

import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const navItems = [
    { name: 'Customer Settings', id: 'customer' },
    { name: 'Due Payment Settings', id: 'due-payment' },
];

export default function CustomerSettingsPage() {
    const { toast } = useToast();

    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your customer settings have been updated.",
        });
    };

    return (
        <SettingsPageLayout navItems={navItems}>
            {(activeTab) => (
                <>
                    {activeTab === 'customer' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Settings</CardTitle>
                                <CardDescription>Configure customer data fields and loyalty program settings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Customer settings will be available here.</p>
                            </CardContent>
                        </Card>
                    )}
                    {activeTab === 'due-payment' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Due Payment Settings</CardTitle>
                                <CardDescription>Configure settings related to due payments from customers.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Due payment settings will be available here.</p>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </SettingsPageLayout>
    );
}
