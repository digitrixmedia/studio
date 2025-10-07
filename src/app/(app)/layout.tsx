
'use client';

import { ArrowLeft, BarChart2, Book, Box, Building, CookingPot, LayoutDashboard, ShoppingBag, Table, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { ZappyyIcon } from '@/components/icons';
import { UserNav } from '@/components/layout/UserNav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAppContext } from '@/contexts/AppContext';
import type { Role } from '@/lib/types';

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
  { href: '/profile', label: 'Profile', icon: User, roles: ['Manager', 'Cashier', 'Waiter', 'Admin', 'Kitchen'] },
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
  // When an outlet is selected, the Admin effectively acts as a Manager for that outlet
  const effectiveRole = isFranchiseAdmin && selectedOutlet ? 'Manager' : currentUser.role;

  const availableNavItems = navItems.filter(item => {
    // If admin has selected an outlet, show Manager roles
    if (isFranchiseAdmin && selectedOutlet) {
      return item.roles.includes('Manager');
    }
    // Otherwise, show roles based on the current user's role
    return item.roles.includes(currentUser.role)
  }).filter(item => {
      // Hide franchise menu items when an outlet is selected
      if (isFranchiseAdmin && selectedOutlet) {
          return !item.href.startsWith('/franchise');
      }
      // Hide regular app menu items when admin is on franchise view
      if (isFranchiseAdmin && !selectedOutlet) {
          return item.href.startsWith('/franchise');
      }
      return true;
  });
  
  const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ');

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
                 <h2 className="text-lg sm:text-2xl font-semibold capitalize">{pageTitle}</h2>
             </div>
             <div className='hidden sm:block'>
                <UserNav />
             </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:px-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
