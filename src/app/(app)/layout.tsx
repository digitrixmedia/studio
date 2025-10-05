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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
};

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager'] },
  { href: '/orders', label: 'Orders', icon: ClipboardList, roles: ['Admin', 'Manager', 'Cashier', 'Waiter'] },
  { href: '/tables', label: 'Tables', icon: Table, roles: ['Admin', 'Manager', 'Cashier', 'Waiter'] },
  { href: '/kitchen', label: 'Kitchen Display', icon: CookingPot, roles: ['Admin', 'Manager', 'Kitchen'] },
  { href: '/menu', label: 'Menu', icon: Book, roles: ['Admin', 'Manager'] },
  { href: '/inventory', label: 'Inventory', icon: Box, roles: ['Admin', 'Manager'] },
  { href: '/reports', label: 'Reports', icon: BarChart2, roles: ['Admin', 'Manager'] },
  { href: '/staff', label: 'Staff', icon: Users, roles: ['Admin'] },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { currentUser } = useAppContext();
  const pathname = usePathname();

  if (!currentUser) {
    return (
       <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const availableNavItems = navItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <ZappyyIcon className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold">ZappyyPOS</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {availableNavItems.map(item => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <div>
                      <item.icon />
                      <span>{item.label}</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
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
