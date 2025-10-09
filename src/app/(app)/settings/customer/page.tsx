
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerSettingsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Customer Settings</CardTitle>
                <CardDescription>Configure customer data fields and loyalty program settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Customer settings will be available here.</p>
            </CardContent>
        </Card>
    );
}
