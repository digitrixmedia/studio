
'use client';

import { ArrowLeft, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppContext } from '@/contexts/AppContext';

export function UserNav() {
  const { currentUser, logout, selectedOutlet, clearSelectedOutlet } = useAppContext();

  if (!currentUser) {
    return null;
  }
  
  const isFranchiseAdmin = currentUser.role === 'Admin';
  const effectiveRole = isFranchiseAdmin && selectedOutlet ? 'Manager' : currentUser.role;

  const { name, email, avatar } = currentUser;
  const initials = name.split(' ').map(n => n[0]).join('');

  const showProfileAndSettings = !isFranchiseAdmin || (isFranchiseAdmin && selectedOutlet);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">{email}</p>
            <p className="text-xs leading-none text-muted-foreground font-bold pt-1">{effectiveRole}</p>
             {isFranchiseAdmin && selectedOutlet && (
               <p className="text-xs leading-none text-blue-500 font-bold pt-1">Viewing: {selectedOutlet.name}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {isFranchiseAdmin && selectedOutlet && (
            <DropdownMenuItem onClick={clearSelectedOutlet}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Back to Franchise</span>
            </DropdownMenuItem>
          )}
          {showProfileAndSettings && (
            <Link href="/profile">
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile & Settings</span>
              </DropdownMenuItem>
            </Link>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
