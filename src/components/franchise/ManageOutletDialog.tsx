'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import type { FranchiseOutlet, Role, User } from '@/lib/types';
import { users } from '@/lib/data';
import { useState } from 'react';
import { Edit, PlusCircle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ManageOutletDialogProps {
  outlet: FranchiseOutlet;
  isOpen: boolean;
  onClose: () => void;
}

const staffRoles: Exclude<Role, 'Admin' | 'Super Admin'>[] = ['Manager', 'Cashier', 'Waiter', 'Kitchen'];

export function ManageOutletDialog({ outlet, isOpen, onClose }: ManageOutletDialogProps) {
  const { toast } = useToast();
  // In a real app, you'd fetch this from your backend based on outlet.id
  const initialStaff = users.filter(u => u.role !== 'Admin' && u.role !== 'Super Admin').slice(0, 3);
  
  const [staff, setStaff] = useState<User[]>(initialStaff);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<Role | ''>('');


  const handleCreateAccount = () => {
    if (!newStaffName || !newStaffEmail || !newStaffRole) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all fields to create a staff account.",
      });
      return;
    }

    const newStaffMember: User = {
      id: `user-${Date.now()}`,
      name: newStaffName,
      email: newStaffEmail,
      role: newStaffRole as Role,
      avatar: `https://i.pravatar.cc/150?u=${newStaffEmail}`
    };

    setStaff([...staff, newStaffMember]);

    toast({
      title: "Account Created",
      description: `${newStaffName} has been added as a ${newStaffRole}.`,
    });

    // Reset form
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffRole('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage: {outlet.name}</DialogTitle>
          <DialogDescription>
            Update outlet details and manage staff accounts.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="details" className="mt-4">
          <TabsList>
            <TabsTrigger value="details">Outlet Details</TabsTrigger>
            <TabsTrigger value="staff">Staff Management</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="outlet-name" className="text-right">
                  Outlet Name
                </Label>
                <Input id="outlet-name" defaultValue={outlet.name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="manager-name" className="text-right">
                  Manager Name
                </Label>
                <Input id="manager-name" defaultValue={outlet.managerName} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Status
                </Label>
                <div className='col-span-3 flex items-center gap-2'>
                    <Switch id="status-switch" checked={outlet.status === 'Active'} />
                    <Label htmlFor="status-switch">{outlet.status}</Label>
                </div>
              </div>
               <div className="flex justify-end mt-4">
                 <Button>Save Changes</Button>
               </div>
            </div>
          </TabsContent>
          <TabsContent value="staff">
             <div className="py-4">
               <h4 className="font-semibold mb-2">Create New Staff Account</h4>
               <div className="grid grid-cols-3 gap-4 mb-6 p-4 border rounded-lg">
                    <div className="space-y-2">
                        <Label htmlFor="staff-name">Full Name</Label>
                        <Input 
                          id="staff-name" 
                          placeholder="e.g., Jane Doe" 
                          value={newStaffName}
                          onChange={(e) => setNewStaffName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="staff-email">Email</Label>
                        <Input 
                          id="staff-email" 
                          type="email" 
                          placeholder="e.g., jane.d@example.com"
                          value={newStaffEmail}
                          onChange={(e) => setNewStaffEmail(e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="staff-role">Role</Label>
                        <Select value={newStaffRole} onValueChange={(value) => setNewStaffRole(value as Role)}>
                            <SelectTrigger id="staff-role">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {staffRoles.map(role => (
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="col-span-3 flex justify-end">
                        <Button onClick={handleCreateAccount}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Account
                        </Button>
                     </div>
               </div>

                <h4 className="font-semibold mb-2">Existing Staff</h4>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className='text-right'>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {staff.map(s => (
                            <TableRow key={s.id}>
                                <TableCell>{s.name}</TableCell>
                                <TableCell>{s.email}</TableCell>
                                <TableCell><Badge variant="secondary">{s.role}</Badge></TableCell>
                                <TableCell className='text-right'>
                                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

             </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
