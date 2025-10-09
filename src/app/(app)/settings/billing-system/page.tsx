
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingSystemSettingsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Billing System Settings</CardTitle>
                <CardDescription>Configure auto accept, Duration, Cancel timings etc. of Online Orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Billing system settings will be available here.</p>
            </CardContent>
        </Card>
    );
}
