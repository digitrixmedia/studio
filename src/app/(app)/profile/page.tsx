
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
import { KeyRound, Mail, Save, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
  const { currentUser } = useAppContext();
  const { toast } = useToast();

  if (!currentUser) {
    return <p>Loading...</p>;
  }

  const { name, email, avatar } = currentUser;
  const initials = name.split(' ').map(n => n[0]).join('');

  const handleUpdateProfile = () => {
    // In a real app, this would handle the update logic.
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
    });
  };

  return (
    <div className="flex justify-center items-start pt-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">{name}</CardTitle>
              <CardDescription>
                Manage your personal information and password.
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
      </Card>
    </div>
  );
}
