
'use client';

import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    return (
        <SettingsPageLayout navItems={navItems}>
            {(activeTab) => (
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
        </SettingsPageLayout>
    );
}
