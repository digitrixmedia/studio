
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConnectedServicesSettingsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Connected Services</CardTitle>
                <CardDescription>Integrate with third-party services like payment gateways.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Connected services settings will be available here.</p>
            </CardContent>
        </Card>
    );
}
