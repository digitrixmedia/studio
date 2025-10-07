'use client';

import { ZappyyIcon } from '@/components/icons';
import { UserNav } from '@/components/layout/UserNav';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { useAppContext } from '@/contexts/AppContext';
import type { Role } from '@/lib/types';
import {
  LayoutDashboard,
  Box,
  Users,
  UtensilsCrossed,
  Book,
  ClipboardList,
  BarChart2,
  Table,
  CookingPot,
  ShoppingBag,
  Building,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
};

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Manager', 'Admin'] },
  { href: '/orders', label: 'POS', icon: ShoppingBag, roles: ['Manager', 'Cashier', 'Waiter', 'Admin'] },
  { href: '/tables', label: 'Tables', icon: Table, roles: ['Manager', 'Cashier', 'Waiter', 'Admin'] },
  { href: '/kitchen', label: 'Kitchen Display', icon: CookingPot, roles: ['Manager', 'Kitchen', 'Admin'] },
  { href: '/menu', label: 'Menu', icon: Book, roles: ['Manager', 'Admin'] },
  { href: '/inventory', label: 'Inventory', icon: Box, roles: ['Manager', 'Admin'] },
  { href: '/reports', label: 'Reports', icon: BarChart2, roles: ['Manager', 'Admin'] },
  // Franchise Admin specific routes
  { href: '/franchise/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin'] },
  { href: '/franchise/reports', label: 'Reports', icon: BarChart2, roles: ['Admin'] },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { currentUser, selectedOutlet, clearSelectedOutlet } = useAppContext();
  const pathname = usePathname();

  if (!currentUser || currentUser.role === 'Super Admin') {
    return (
       <div className="flex h-screen items-center justify-center">
        <p>Loading or redirecting...</p>
      </div>
    );
  }
  
  const isFranchiseAdmin = currentUser.role === 'Admin';
  const effectiveRole = isFranchiseAdmin && selectedOutlet ? 'Manager' : currentUser.role;

  const availableNavItems = navItems.filter(item => {
    if (isFranchiseAdmin && selectedOutlet) {
      return item.roles.includes('Manager');
    }
    return item.roles.includes(currentUser.role)
  }).filter(item => {
      // hide franchise menu items when outlet is selected
      if (isFranchiseAdmin && selectedOutlet) {
          return !item.href.startsWith('/franchise');
      }
      return true;
  });

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
             {isFranchiseAdmin && !selectedOutlet ? (
                <Building className="w-8 h-8 text-primary" />
             ) : (
                <ZappyyIcon className="w-8 h-8 text-primary" />
             )}
            <h1 className="text-xl font-bold">{isFranchiseAdmin && !selectedOutlet ? 'Franchise' : (selectedOutlet?.name || 'ZappyyPOS')}</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {availableNavItems.map(item => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton isActive={pathname.startsWith(item.href)}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           {isFranchiseAdmin && selectedOutlet && (
            <div className='p-2'>
              <Button variant="outline" className="w-full" onClick={clearSelectedOutlet}>
                <ArrowLeft />
                Back to Franchise
              </Button>
            </div>
           )}
            <UserNav />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
             <SidebarTrigger className="sm:hidden" />
             <div className='flex-1'>
                 <h2 className="text-2xl font-semibold capitalize">{pathname.split('/').pop()?.replace('-', ' ')}</h2>
             </div>
             <div>
                {/* Right side header content can go here */}
             </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:px-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
