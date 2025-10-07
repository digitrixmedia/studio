
'use client';

import { KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { ZappyyIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/AppContext';
import type { Role } from '@/lib/types';

export default function LoginPage() {
  const { login } = useAppContext();
  const [role, setRole] = useState<Role>('Admin');

  const handleDemoLogin = (selectedRole: Role) => {
    setRole(selectedRole);
    login(selectedRole);
  };
  
  const handleMainLogin = () => {
    // This is a simplified login. In a real app, you'd verify credentials.
    // For this demo, we'll just log in with the last selected role or a default.
    login(role || 'Manager');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ZappyyIcon className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold">ZappyyPOS</CardTitle>
          <CardDescription>Comprehensive Cafe Management System</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="user@zappyy.com" className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
             <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" className="pl-10"/>
            </div>
          </div>
          <Button className="w-full" onClick={handleMainLogin}>
            Login
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">Or login with a demo account:</p>
          <div className="grid w-full grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleDemoLogin('Admin')}>Admin</Button>
            <Button variant="secondary" size="sm" onClick={() => handleDemoLogin('Manager')}>Manager</Button>
            <Button variant="secondary" size="sm" onClick={() => handleDemoLogin('Cashier')}>Cashier</Button>
            <Button variant="secondary" size="sm" onClick={() => handleDemoLogin('Waiter')}>Waiter</Button>
          </div>
           <div className="w-full border-t pt-4 mt-2">
             <Button variant="outline" className="w-full" onClick={() => handleDemoLogin('Super Admin')}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Super Admin Login
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
