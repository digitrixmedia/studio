
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface NavItem {
    name: string;
    id: string;
}

interface SettingsPageLayoutProps {
    navItems: NavItem[];
    children: (activeTab: string) => React.ReactNode;
}

export function SettingsPageLayout({ navItems, children }: SettingsPageLayoutProps) {
    const [activeTab, setActiveTab] = useState(navItems[0].id);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            <Card className="md:col-span-1">
                <nav className="flex flex-col p-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                'px-4 py-2 text-left text-sm font-medium rounded-md hover:bg-muted',
                                activeTab === item.id ? 'bg-muted' : ''
                            )}
                        >
                            {item.name}
                        </button>
                    ))}
                </nav>
            </Card>
            <div className="md:col-span-3">
                {children(activeTab)}
            </div>
        </div>
    );
}
