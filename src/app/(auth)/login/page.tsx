'use client';

import { KeyRound, Mail } from 'lucide-react';
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

export default function LoginPage() {
  const { login } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleMainLogin = () => {
    login(email, password);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ZappyyIcon className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold">DineMitra POS</CardTitle>
          <CardDescription>Comprehensive Cafe Management System</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="user@zappyy.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
             <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <Button className="w-full" onClick={handleMainLogin}>
            Login
          </Button>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              Enter your credentials to begin.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
