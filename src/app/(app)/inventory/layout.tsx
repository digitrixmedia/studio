
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
  const showBackButton = !isDashboard && pathname !== '/inventory/wastage/add';

  return (
    <div className="space-y-4">
      {!isDashboard && (
        <div className="flex items-center gap-4">
            <Link href={pathname.startsWith('/inventory/wastage') ? '/inventory/wastage' : '/inventory'}>
            <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
            </Button>
            </Link>
            <h1 className="text-2xl font-bold capitalize">{pageTitle}</h1>
        </div>
      )}
      {pathname === '/inventory/wastage/add' && (
         <div className="flex items-center gap-4">
            <Link href={'/inventory/wastage'}>
            <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            </Link>
            <h1 className="text-2xl font-bold capitalize">Add Wastage</h1>
        </div>
      )}
      {children}
    </div>
  );
}
