
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
  } else if (pageTitle === 'add') {
    pageTitle = 'Add Wastage';
  }
  
  const isDashboard = pathname === '/inventory';
  const showBackButton = !isDashboard;

  return (
    <div className="space-y-4">
      {showBackButton && (
        <div className="flex items-center gap-4">
            <Link href={pathname.startsWith('/inventory/wastage') ? '/inventory/wastage' : (pathname.startsWith('/inventory/purchase') ? '/inventory' : '/inventory')}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold capitalize">{pageTitle}</h1>
        </div>
      )}
      {isDashboard && (
         <h1 className="text-3xl font-bold capitalize">{pageTitle}</h1>
      )}
      {children}
    </div>
  );
}
