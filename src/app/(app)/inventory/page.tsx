

'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Box, ClipboardList, Package, Recycle, Utensils } from 'lucide-react';

const features = [
    {
        title: 'Current Stock',
        description: 'View and manage stock levels of all raw materials.',
        icon: Box,
        href: '/inventory/stock',
        section: 'Stock & Recipes'
    },
    {
        title: 'Recipe Mapping',
        description: 'Link menu items to ingredients for automatic stock deduction.',
        icon: Utensils,
        href: '/inventory/recipes',
        section: 'Stock & Recipes'
    },
    {
        title: 'Purchase Management',
        description: 'Keep track of your raw material purchases and inward entries.',
        icon: ClipboardList,
        href: '/inventory/purchase',
        section: 'Purchase'
    },
    {
        title: 'Wastage',
        description: 'Enter wastage of your items/raw materials to optimize and plug leakages.',
        icon: Recycle,
        href: '#',
        section: 'Wastage & Conversion'
    },
     {
        title: 'Convert Raw Material',
        description: 'Define conversions for semi-cooked or cooked foods.',
        icon: Package,
        href: '#',
        section: 'Wastage & Conversion'
    }
]

export default function InventoryDashboardPage() {
  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">
                A central hub for managing stock, purchases, wastage, and recipes.
            </p>
        </div>

        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-2">Stock & Recipes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.filter(f => f.section === 'Stock & Recipes').map(feature => (
                        <FeatureCard key={feature.title} {...feature} />
                    ))}
                </div>
            </div>

             <div>
                <h2 className="text-xl font-semibold mb-2">Purchase</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.filter(f => f.section === 'Purchase').map(feature => (
                        <FeatureCard key={feature.title} {...feature} />
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">Wastage & Conversion</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.filter(f => f.section === 'Wastage & Conversion').map(feature => (
                        <FeatureCard key={feature.title} {...feature} />
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}

function FeatureCard({ title, description, icon: Icon, href }: { title: string, description: string, icon: React.ElementType, href: string }) {
    return (
        <Link href={href} className="block h-full">
            <Card className="hover:border-primary transition-colors h-full flex flex-col group">
                <CardHeader>
                     <CardTitle className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary p-3 rounded-lg">
                           <Icon className="h-6 w-6" />
                        </div>
                        <span className="text-lg">{title}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <p className="text-muted-foreground text-sm">{description}</p>
                </CardContent>
                <div className="p-4 pt-0 flex justify-end">
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
            </Card>
        </Link>
    )
}
