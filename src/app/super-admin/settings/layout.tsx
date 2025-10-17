
'use client';

import { ArrowLeft, Calculator, Monitor, Printer } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

const settingsNav = [
    {
        name: 'Display',
        href: '/super-admin/settings/display',
        icon: Monitor
    },
    {
        name: 'Calculations',
        href: '/super-admin/settings/calculations',
        icon: Calculator
    },
    {
        name: 'Print',
        href: '/super-admin/settings/print',
        icon: Printer
    }
]

export default function SuperAdminSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/super-admin/profile">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
            <h1 className="text-2xl font-bold capitalize">System Defaults</h1>
            <p className="text-muted-foreground">Configure global settings for new tenant onboarding.</p>
        </div>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {settingsNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={
                  'inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-9 px-4 py-2 bg-transparent justify-start' + 
                  (pathname === item.href
                    ? ' bg-muted hover:bg-muted'
                    : ' hover:bg-transparent hover:underline')
                }
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-4xl">{children}</div>
      </div>
    </div>
  );
}
