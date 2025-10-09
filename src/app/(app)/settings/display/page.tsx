
'use client';

import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const navItems = [
    { name: 'Display Settings', id: 'display' },
    { name: 'Default Values', id: 'defaults' },
    { name: 'Discount Settings', id: 'discount' },
    { name: 'Order Cancel Reasons', id: 'cancel' },
    { name: 'Table Settlement', id: 'settlement' },
]

export default function DisplaySettingsPage() {
    return (
        <SettingsPageLayout navItems={navItems}>
             {(activeTab) => (
                <>
                    {activeTab === 'display' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Display Settings</CardTitle>
                                <CardDescription>Manage general display preferences.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>General display settings will go here.</p>
                            </CardContent>
                        </Card>
                    )}
                    {activeTab === 'defaults' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Default Values</CardTitle>
                                <CardDescription>Set default values for various operations.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Default value settings will go here.</p>
                            </CardContent>
                        </Card>
                    )}
                    {activeTab === 'discount' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Discount Settings</CardTitle>
                                <CardDescription>Configure how discounts are applied and displayed.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Discount settings will go here.</p>
                            </CardContent>
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
                                <CardDescription>Configure options related to table billing and settlement.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Table settlement settings will go here.</p>
                            </CardContent>
                        </Card>
                    )}
                </>
             )}
        </SettingsPageLayout>
    );
}
