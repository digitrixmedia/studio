

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Mail, Save, User, Building, Settings, ShieldAlert } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const systemSettings = [
    {
        title: 'Tenant Management',
        description: 'Create, manage, and suspend franchise subscriptions.',
        icon: Building,
        href: '/super-admin/subscriptions'
    },
    {
        title: 'System Defaults',
        description: 'Configure global settings for new tenant onboarding.',
        icon: Settings,
        href: '/super-admin/settings/display'
    },
    {
        title: 'Security & Audits',
        description: 'Review system-wide access logs and security policies.',
        icon: ShieldAlert,
        href: '/super-admin/security'
    },
];

export default function SuperAdminProfilePage() {
  const { currentUser } = useAppContext();
  const { toast } = useToast();

  if (!currentUser) {
    return <p>Loading...</p>;
  }

  const { name, email, avatar } = currentUser;
  const initials = name.split(' ').map(n => n[0]).join('');

  const handleUpdateProfile = () => {
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
    });
  };

  return (
    <div className="flex justify-center items-start pt-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">{name}</CardTitle>
              <CardDescription>
                Manage your personal information and system-wide settings.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="name" defaultValue={name} className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" defaultValue={email} className="pl-10" disabled />
            </div>
            <p className="text-xs text-muted-foreground">
              Email address cannot be changed.
            </p>
          </div>
          <div className="space-y-4 rounded-lg border p-4">
             <h3 className="font-semibold">Change Password</h3>
             <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                 <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="current-password" type="password" placeholder="••••••••" className="pl-10" />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                 <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="new-password" type="password" placeholder="••••••••" className="pl-10" />
                </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpdateProfile}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </CardFooter>

        <Separator className="my-6" />

        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Manage global configurations for the ZappyyPOS platform.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemSettings.map(setting => (
                    <Link href={setting.href} key={setting.title} legacyBehavior>
                      <a className="block h-full">
                        <Card className="hover:border-primary transition-colors h-full flex flex-col justify-between">
                            <CardHeader>
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                                        <setting.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{setting.title}</CardTitle>
                                        <CardDescription>{setting.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                      </a>
                    </Link>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
