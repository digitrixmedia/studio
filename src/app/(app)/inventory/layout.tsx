
'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  let pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Inventory';
  
  if (pageTitle === 'purchase') {
    pageTitle = 'New Purchase Entry';
  }
  
  const isDashboard = pathname === '/inventory';

  return (
    <div className="space-y-4">
      {!isDashboard && (
        <div className="flex items-center gap-4">
            <Link href="/inventory">
            <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
            </Button>
            </Link>
            <h1 className="text-2xl font-bold capitalize">{pageTitle}</h1>
        </div>
      )}
      {children}
    </div>
  );
}
