
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrintLayoutDialog } from "@/components/settings/PrintLayoutDialog";
import { useState } from "react";
import { Edit } from "lucide-react";

export default function PrintSettingsPage() {
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Print Settings</CardTitle>
                    <CardDescription>Manage how your bills and kitchen order tickets (KOTs) are printed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Receipt Layout</CardTitle>
                                <CardDescription>Customize the look and feel of your customer receipts.</CardDescription>
                            </div>
                            <Button variant="outline" onClick={() => setIsPrintDialogOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Layout
                            </Button>
                        </CardHeader>
                    </Card>
                </CardContent>
            </Card>
            <PrintLayoutDialog
                isOpen={isPrintDialogOpen}
                onOpenChange={setIsPrintDialogOpen}
            />
        </>
    );
}
