
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
import { KeyRound, Mail, Save, User, ReceiptText, ArrowRight, Monitor, Calculator, Share2, Printer, Users as UsersIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

const settings = [
    {
        title: 'Display',
        description: 'Manage themes, screen layouts, and item display settings.',
        icon: Monitor,
        href: '/settings/display'
    },
    {
        title: 'Calculations',
        description: 'Configure taxes, discounts, rounding, and other calculations.',
        icon: Calculator,
        href: '/settings/calculations'
    },
     {
        title: 'Connected Services',
        description: 'Integrate with third-party services like payment gateways.',
        icon: Share2,
        href: '/settings/connected-services'
    },
    {
        title: 'Print',
        description: 'Manage KOT and bill printing formats and preferences.',
        icon: Printer,
        href: '/settings/print'
    },
     {
        title: 'Customer',
        description: 'Configure customer data fields and loyalty program settings.',
        icon: UsersIcon,
        href: '/settings/customer'
    },
    {
        title: 'Billing System',
        description: 'Configure auto accept, Duration, Cancel timings etc. of Online Orders.',
        icon: ReceiptText,
        href: '/settings/billing-system'
    }
]

export default function ProfilePage() {
  const { currentUser, auth } = useAppContext();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState(currentUser?.name || '');

  if (!currentUser) {
    return <p>Loading...</p>;
  }

  // This page is not for Super Admins.
  if (currentUser.role === 'super-admin') {
    return (
        <div className="flex h-full w-full items-center justify-center">
             <p>Access Denied. Please use the Super Admin profile page.</p>
        </div>
    );
  }

  const { email } = currentUser;
  const initials = name.split(' ').map(n => n[0]).join('');

  const handleUpdateProfile = async () => {
    // Handle password change
    if (currentPassword && newPassword) {
      if (!auth.currentUser) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Not logged in.",
        });
        return;
      }
      try {
        const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
        toast({
          title: 'Password Updated',
          description: 'Your password has been changed successfully.',
        });
        setCurrentPassword('');
        setNewPassword('');
      } catch (error) {
        console.error("Password change error:", error);
        toast({
          variant: "destructive",
          title: 'Password Change Failed',
          description: 'The current password you entered is incorrect.',
        });
        return; // Stop if password change fails
      }
    }

    // You can add logic to update other profile details like name here
    if (name !== currentUser.name) {
       // In a real app, you'd update this in your user database
        console.log("Updating name to:", name);
    }

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
              <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">{currentUser.name}</CardTitle>
              <CardDescription>
                Manage your personal information and application settings.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
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
                    <Input id="current-password" type="password" placeholder="••••••••" className="pl-10" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                 <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="new-password" type="password" placeholder="••••••••" className="pl-10" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
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
          <CardDescription>Manage your cafe's settings and configurations.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {settings.map(setting => (
                    <Link href={setting.href} key={setting.title} className="block h-full">
                      <Card className="hover:border-primary transition-colors h-full flex flex-col">
                          <CardHeader className="flex-1">
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
                          <div className="p-4 pt-0 flex justify-end">
                              <ArrowRight className="h-5 w-5 text-primary" />
                          </div>
                      </Card>
                    </Link>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
