
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ReceiptText } from 'lucide-react';
import Link from 'next/link';

const settings = [
    {
        title: 'Billing System',
        description: 'Configure auto accept, Duration, Cancel timings etc. of Online Orders.',
        icon: ReceiptText,
        href: '/settings/billing'
    }
]

export default function SettingsPage() {
  return (
    <div className='flex flex-col gap-6'>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
            <p className="text-muted-foreground">Manage your cafe's settings and configurations.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {settings.map(setting => (
                <Link href={setting.href} key={setting.title}>
                    <Card className="hover:border-primary transition-colors h-full flex flex-col">
                        <CardHeader className="flex-1">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 text-primary p-3 rounded-full">
                                    <setting.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle>{setting.title}</CardTitle>
                                    <CardDescription>{setting.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <div className="p-4 pt-0 flex justify-end">
                            <ArrowRight className="h-5 w-5 text-primary" />
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    </div>
  );
}
