
'use client';

import { BarChart3, CreditCard, LayoutDashboard, ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { UserNav } from '@/components/layout/UserNav';
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

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { href: '/super-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/super-admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/super-admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/super-admin/profile', label: 'Profile', icon: User },
];

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const { currentUser } = useAppContext();
  const pathname = usePathname();

  if (!currentUser || currentUser.role !== 'Super Admin') {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Access Denied. Redirecting...</p>
      </div>
    );
  }

  const pageTitle = pathname.split('/').pop()?.replace('-', ' ');

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold">Admin Center</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map(item => (
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
