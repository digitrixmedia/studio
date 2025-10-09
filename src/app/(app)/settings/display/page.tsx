
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DisplaySettingsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>Manage themes, screen layouts, and item display settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Display settings will be available here.</p>
            </CardContent>
        </Card>
    );
}
