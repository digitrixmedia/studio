'use client';

import {
  ArrowLeft,
  BarChart2,
  Book,
  Box,
  Building,
  ClipboardList,
  CookingPot,
  LayoutDashboard,
  LayoutGrid,
  ShoppingBag,
  Table,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState, useEffect, useCallback } from 'react';
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
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useAppContext } from '@/contexts/AppContext';
import type { Role } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RecentOrders } from '@/components/layout/RecentOrders';
import React from 'react';
import { InventoryContent, MenuContent } from '@/components/layout/AppLayoutComponents';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
  notificationKey?: 'incomingOrders';
};

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['manager', 'admin'],
  },
  {
    href: '/orders',
    label: 'POS',
    icon: ShoppingBag,
    roles: ['manager', 'cashier', 'waiter', 'admin'],
  },
  {
    href: '/operations',
    label: 'Operations',
    icon: LayoutGrid,
    roles: ['manager', 'admin', 'cashier'],
    notificationKey: 'incomingOrders',
  },
  {
    href: '/tables',
    label: 'Tables',
    icon: Table,
    roles: ['manager', 'cashier', 'waiter', 'admin'],
  },
  {
    href: '/kitchen',
    label: 'Kitchen Display',
    icon: CookingPot,
    roles: ['manager', 'kitchen', 'admin', 'cashier'],
  },
  { href: '/menu', label: 'Menu', icon: Book, roles: ['manager', 'admin', 'cashier'] },
  {
    href: '/inventory',
    label: 'Inventory',
    icon: Box,
    roles: ['manager', 'admin', 'cashier'],
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: BarChart2,
    roles: ['manager', 'admin', 'cashier'],
  },
  {
    href: '/profile',
    label: 'Profile & Settings',
    icon: User,
    roles: ['manager', 'cashier', 'waiter', 'admin', 'kitchen'],
  },
  // Franchise Admin specific routes
  {
    href: '/franchise/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['admin'],
  },
  {
    href: '/franchise/reports',
    label: 'Reports',
    icon: BarChart2,
    roles: ['admin'],
  },
];

type QuickAccessItem = {
  id: 'operations' | 'menu' | 'inventory';
  label: string;
  icon: React.ElementType;
  component: React.ComponentType;
};

const RecentOrdersMemo = React.memo(RecentOrders);

const quickAccessItems: QuickAccessItem[] = [
    { id: 'operations', label: 'Recent Orders', icon: ClipboardList, component: RecentOrdersMemo },
    { id: 'menu', label: 'Menu', icon: Book, component: MenuContent },
    { id: 'inventory', label: 'Inventory', icon: Box, component: InventoryContent },
];


export default function AppLayout({ children }: { children: ReactNode }) {
  const { currentUser, selectedOutlet, clearSelectedOutlet, pastOrders } = useAppContext();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarContentId, setSidebarContentId] = useState<string | null>(null);

  const incomingOrdersCount = pastOrders.filter(o => o.status === 'incoming').length;

  const toggleSidebarContent = useCallback((id: string) => {
    setSidebarContentId(prevId => prevId === id ? null : id);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        let path = '';
        switch (event.key.toLowerCase()) {
          case 's':
            path = '/reports';
            break;
          case 'd':
            path = '/dashboard';
            break;
          case 'p':
            path = '/orders';
            break;
          case 'i':
            path = '/inventory';
            break;
          case 'm':
            path = '/menu';
            break;
          default:
            return;
        }
        event.preventDefault();
        router.push(path);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);

  const sidebarContent = quickAccessItems.find((x) => x.id === sidebarContentId);

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading or redirecting...</p>
      </div>
    );
  }

  const isFranchiseAdmin = currentUser.role === 'admin';
  // When an outlet is selected, the Admin effectively acts as a Manager for that outlet
  const effectiveRole =
    isFranchiseAdmin && selectedOutlet ? 'manager' : currentUser.role;

  const availableNavItems = navItems
    .filter((item) => {
      // If admin has selected an outlet, show Manager roles
      if (isFranchiseAdmin && selectedOutlet) {
        return item.roles.includes('manager');
      }
      // Otherwise, show roles based on the current user's role
      return item.roles.includes(currentUser.role);
    })
    .filter((item) => {
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
            <h1 className="text-xl font-bold">
              {isFranchiseAdmin && !selectedOutlet
                ? 'Franchise'
                : selectedOutlet?.name || 'DineMitra POS'}
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {availableNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton isActive={pathname.startsWith(item.href)}>
                    <item.icon />
                    <span>{item.label}</span>
                     {item.notificationKey === 'incomingOrders' && incomingOrdersCount > 0 && (
                      <SidebarMenuBadge>{incomingOrdersCount}</SidebarMenuBadge>
                    )}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {isFranchiseAdmin && selectedOutlet && (
            <div className="p-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={clearSelectedOutlet}
              >
                <ArrowLeft />
                Back to Franchise
              </Button>
            </div>
          )}
          <UserNav />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 py-2 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="sm:hidden" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold capitalize sm:text-2xl">
              {pageTitle}
            </h2>
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
            {effectiveRole === 'manager' && (
              <div className="hidden items-center gap-2 sm:flex">
                <TooltipProvider>
                  {quickAccessItems.map((item) => (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={
                            sidebarContentId === item.id
                              ? 'secondary'
                              : 'ghost'
                          }
                          size="icon"
                          onClick={() => toggleSidebarContent(item.id)}
                        >
                          <item.icon className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            )}
             <div className='hidden sm:flex'>
                    <UserNav />
                </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:px-6">{children}</main>
        <Sheet
          open={!!sidebarContentId}
          onOpenChange={(open) => !open && setSidebarContentId(null)}
        >
          <SheetContent className="w-full p-0 sm:w-3/4 lg:w-1/2 xl:w-2/5">
            {sidebarContent && (
              <>
                <SheetHeader className="border-b p-6">
                  <SheetTitle className="flex items-center gap-2 text-2xl">
                    <sidebarContent.icon className="h-6 w-6" />
                    {sidebarContent.label}
                  </SheetTitle>
                </SheetHeader>
                <div className="h-[calc(100vh-4.5rem)] overflow-y-auto p-6">
                  <sidebarContent.component />
                </div>
              </>
            )}
            <span className="sr-only">
              <SheetTitle>Quick Access Panel</SheetTitle>
              <SheetDescription>
                A panel with quick access to common actions like dashboard,
                reports, and menu.
              </SheetDescription>
            </span>
          </SheetContent>
        </Sheet>
      </SidebarInset>
    </SidebarProvider>
  );
}
