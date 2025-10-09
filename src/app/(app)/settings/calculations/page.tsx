
'use client';

import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

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
    const { toast } = useToast();
    // Round-off state
    const [roundOffOption, setRoundOffOption] = useState('Normal');
    const [roundOffIncrement, setRoundOffIncrement] = useState('1');
    const [decimalPoints, setDecimalPoints] = useState('2');
    // Service Charge state
    const [displayServiceCharge, setDisplayServiceCharge] = useState(false);


    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your calculation settings have been updated.",
        });
        console.log({
            roundOffOption,
            roundOffIncrement,
            decimalPoints,
            displayServiceCharge,
        });
    };

    return (
        <SettingsPageLayout navItems={navItems}>
            {(activeTab) => (
                <>
                    {activeTab === 'round-off' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Round-Off Options</CardTitle>
                                <CardDescription>The following settings pertains to configuring the Round-Off Options.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <RadioGroup value={roundOffOption} onValueChange={setRoundOffOption}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                        <Label className="font-semibold pt-2 md:text-right">Round off options for billing.:</Label>
                                        <div className="md:col-span-2 flex flex-wrap items-center gap-x-6 gap-y-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Normal" id="ro-normal" />
                                                <Label htmlFor="ro-normal">Normal</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Round off up" id="ro-up" />
                                                <Label htmlFor="ro-up">Round off up</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Round off down" id="ro-down" />
                                                <Label htmlFor="ro-down">Round off down</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="None" id="ro-none" />
                                                <Label htmlFor="ro-none">None</Label>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                    <Label htmlFor="increment" className="font-semibold pt-2 md:text-right">Round the number to the increments of *:</Label>
                                    <div className="md:col-span-2">
                                        <Select value={roundOffIncrement} onValueChange={setRoundOffIncrement}>
                                            <SelectTrigger id="increment" className="w-full md:w-1/2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1 (Default)</SelectItem>
                                                <SelectItem value="0.5">0.50</SelectItem>
                                                <SelectItem value="0.25">0.25</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground mt-2">In this, the number would be rounded to the increment that is selected. For example, if round-up option is selected and the increment is selected of 0.25, then the number 2.20 would be rounded to 2.25</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                                    <Label htmlFor="decimal" className="font-semibold pt-2 md:text-right">Select decimal points for invoice calculation and Menu price input*:</Label>
                                    <div className="md:col-span-2">
                                        <Select value={decimalPoints} onValueChange={setDecimalPoints}>
                                            <SelectTrigger id="decimal" className="w-full md:w-1/2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">0</SelectItem>
                                                <SelectItem value="1">1</SelectItem>
                                                <SelectItem value="2">2 (Default)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground mt-2">The rounding calculation related to invoice would be based on the number selected in the dropdown. For example, if 1 is selected, 0.9277 would be rounded to 1.0</p>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Button onClick={handleSaveChanges}>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    )}
                    {activeTab === 'service-charge' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Charge</CardTitle>
                                <CardDescription>The following settings describes the settings related to the service charge in the billing screen.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-2">
                                        <Checkbox id="display-service-charge" checked={displayServiceCharge} onCheckedChange={(checked) => setDisplayServiceCharge(!!checked)} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="display-service-charge">Display & Calculate Service Charge</Label>
                                             <p className="text-xs text-muted-foreground">
                                                Note: As per guidelines issued by the Central Consumer Protection Authority, service charges cannot be automatically (or by default) added to a bill. In addition, outlets cannot charge taxes on service charges
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSaveChanges}>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    )}
                    {activeTab !== 'round-off' && activeTab !== 'service-charge' && (
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
                </>
            )}
        </SettingsPageLayout>
    );
}
