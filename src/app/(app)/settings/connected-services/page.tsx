'use client';

import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const navItems = [
    { name: 'Inventory Settings', id: 'inventory' },
    { name: 'Day End Settings', id: 'day-end' },
    { name: 'Loyalty Settings', id: 'loyalty' },
    { name: 'KDS Settings', id: 'kds' },
    { name: 'Captain App Settings', id: 'captain-app' },
    { name: 'e-Invoice settings', id: 'e-invoice' },
    { name: 'Barcode settings', id: 'barcode' },
    { name: 'Expense settings', id: 'expense' },
    { name: 'Invoice Structure', id: 'invoice-structure' },
];

export default function ConnectedServicesSettingsPage() {
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
