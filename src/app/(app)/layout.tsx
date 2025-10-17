
'use client';

import { ArrowLeft, BarChart2, Book, Box, Building, ClipboardList, CookingPot, LayoutDashboard, LayoutGrid, ShoppingBag, Table, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAppContext } from '@/contexts/AppContext';
import type { Role } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
};

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Manager', 'Admin'] },
  { href: '/orders', label: 'POS', icon: ShoppingBag, roles: ['Manager', 'Cashier', 'Waiter', 'Admin'] },
  { href: '/operations', label: 'Operations', icon: LayoutGrid, roles: ['Manager', 'Admin'] },
  { href: '/tables', label: 'Tables', icon: Table, roles: ['Manager', 'Cashier', 'Waiter', 'Admin'] },
  { href: '/kitchen', label: 'Kitchen Display', icon: CookingPot, roles: ['Manager', 'Kitchen', 'Admin'] },
  { href: '/menu', label: 'Menu', icon: Book, roles: ['Manager', 'Admin'] },
  { href: '/inventory', label: 'Inventory', icon: Box, roles: ['Manager', 'Admin'] },
  { href: '/reports', label: 'Reports', icon: BarChart2, roles: ['Manager', 'Admin'] },
  { href: '/profile', label: 'Profile & Settings', icon: User, roles: ['Manager', 'Cashier', 'Waiter', 'Admin', 'Kitchen'] },
  // Franchise Admin specific routes
  { href: '/franchise/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin'] },
  { href: '/franchise/reports', label: 'Reports', icon: BarChart2, roles: ['Admin'] },
];

type QuickAccessItem = {
    id: 'dashboard' | 'operations' | 'reports' | 'menu' | 'inventory';
    label: string;
    icon: React.ElementType;
    // component: React.ComponentType; // This was causing the issue
};

const quickAccessItems: QuickAccessItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'operations', label: 'Recent Orders', icon: ClipboardList },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
    { id: 'menu', label: 'Menu', icon: Book },
    { id: 'inventory', label: 'Inventory', icon: Box },
]

export default function AppLayout({ children }: { children: ReactNode }) {
  const { currentUser, selectedOutlet, clearSelectedOutlet } = useAppContext();
  const pathname = usePathname();
  const [sidebarContent, setSidebarContent] = useState<QuickAccessItem | null>(null);

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
  
  // The rendering logic for sidebar content will need to be adjusted
  // For now, we will disable the content inside the sheet to fix the crash.
  const CurrentSidebarComponent = null;

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
             
             <div className='flex flex-1 justify-end items-center gap-2'>
                {effectiveRole === 'Manager' && (
                    <div className='hidden sm:flex items-center gap-2'>
                        <TooltipProvider>
                        {quickAccessItems.map(item => (
                            <Tooltip key={item.id}>
                                <TooltipTrigger asChild>
                                    <Button variant={sidebarContent?.id === item.id ? 'secondary' : 'ghost'} size="icon" onClick={() => setSidebarContent(item)}>
                                        <item.icon className='h-5 w-5'/>
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
        <main className="flex-1 overflow-auto p-4 sm:px-6">
          {children}
        </main>
        <Sheet open={!!sidebarContent} onOpenChange={(open) => !open && setSidebarContent(null)}>
            <SheetContent className="w-full sm:w-3/4 lg:w-1/2 xl:w-2/5 p-0">
                {sidebarContent && (
                    <>
                        <SheetHeader className="p-6 border-b">
                            <SheetTitle className="flex items-center gap-2 text-2xl">
                                <sidebarContent.icon className="h-6 w-6"/>
                                {sidebarContent.label}
                            </SheetTitle>
                        </SheetHeader>
                        <div className="overflow-y-auto h-[calc(100vh-6rem)] p-6">
                            {/* {CurrentSidebarComponent && <CurrentSidebarComponent />} */}
                            <p>Content for {sidebarContent.label} would go here.</p>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
      </SidebarInset>
    </SidebarProvider>
  );
}
