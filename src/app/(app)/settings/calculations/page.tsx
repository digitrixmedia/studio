
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalculationsSettingsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Calculations Settings</CardTitle>
                <CardDescription>Configure taxes, discounts, rounding, and other calculations.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Calculations settings will be available here.</p>
            </CardContent>
        </Card>
    );
}
