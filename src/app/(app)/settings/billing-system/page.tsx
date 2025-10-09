
'use client';

import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const navItems = [
    { name: 'Order and Order Sync Settings', id: 'order-sync' },
    { name: 'Payment Sync Settings', id: 'payment-sync' },
    { name: 'Display settings', id: 'display' },
    { name: 'Security Setting', id: 'security' },
];

export default function BillingSystemSettingsPage() {
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
                        <p>Settings for this section will be available here.</p>
                    </CardContent>
                </Card>
            )}
        </SettingsPageLayout>
    );
}
