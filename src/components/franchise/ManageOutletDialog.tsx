
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { useState, useEffect } from 'react';
import { Edit, PlusCircle, Trash2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface ManageOutletDialogProps {
  outlet: FranchiseOutlet;
  isOpen: boolean;
  onClose: () => void;
}

const staffRoles: Exclude<Role, 'admin' | 'super-admin'>[] = ['manager', 'cashier', 'waiter', 'kitchen'];

const initialNewStaffState = {
  name: '',
  email: '',
  role: '' as Role | '',
  password: '',
};

export function ManageOutletDialog({ outlet, isOpen, onClose }: ManageOutletDialogProps) {
  const { toast } = useToast();
  const { users, auth, firestore, setUsers } = useAppContext();
  
  const [outletStatus, setOutletStatus] = useState(outlet.status);
  const [newStaff, setNewStaff] = useState(initialNewStaffState);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  const outletStaff = users.filter(u => u.outletId === outlet.id && u.role !== 'admin');

  const handleInputChange = (field: keyof typeof initialNewStaffState, value: string) => {
    setNewStaff(prev => ({ ...prev, [field]: value }));
  }

  const handleCreateOrUpdateAccount = async () => {
    if (!newStaff.name || !newStaff.email || !newStaff.role) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all fields to create or update a staff account.",
      });
      return;
    }

    if (editingStaffId) {
      // Update existing staff
      const userDocRef = doc(firestore, 'users', editingStaffId);
      await setDoc(userDocRef, { name: newStaff.name, email: newStaff.email, role: newStaff.role }, { merge: true });
      
      setUsers(prev => prev.map(s => s.id === editingStaffId ? { ...s, name: newStaff.name, email: newStaff.email, role: newStaff.role as Role } : s));

      toast({
        title: "Account Updated",
        description: `${newStaff.name}'s information has been updated.`,
      });
    } else {
       if (!newStaff.password) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please set a password for the new account.",
        });
        return;
      }
      try {
        // This flow is tricky without admin SDK. We'll try to create a user.
        // NOTE: This will sign the SUPER ADMIN out and sign the NEW USER in. This is a Firebase client SDK limitation.
        // A real app would use a Cloud Function to create users.
        
        // Temporarily create user
        const tempAuth = auth; // Use a copy? No, it's a singleton
        const userCredential = await createUserWithEmailAndPassword(tempAuth, newStaff.email, newStaff.password);
        const newUserId = userCredential.user.uid;

        const newUser: User = {
            id: newUserId,
            name: newStaff.name,
            email: newStaff.email,
            role: newStaff.role as Role,
            outletId: outlet.id,
        };

        await setDoc(doc(firestore, "users", newUserId), newUser);

        setUsers(prev => [...prev, newUser]);
        
        toast({
            title: "Account Created",
            description: `${newStaff.name} has been added. NOTE: You may have been logged out and need to log back in as super-admin.`,
        });

      } catch (error: any) {
         let description = "An unknown error occurred.";
         if (error.code === 'auth/email-already-in-use') {
            description = "This email is already in use by another account.";
         } else if (error.code === 'auth/weak-password') {
            description = "The password must be at least 6 characters.";
         }
         toast({ variant: "destructive", title: "User Creation Failed", description });
         return; // Don't close dialog
      }
    }

    // Reset form
    setNewStaff(initialNewStaffState);
    setEditingStaffId(null);
  };
  
  const handleEditStaff = (staffMember: User) => {
    setEditingStaffId(staffMember.id);
    setNewStaff({
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
      password: '', // Don't show password on edit
    });
  };

  const cancelEdit = () => {
    setEditingStaffId(null);
    setNewStaff(initialNewStaffState);
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
        await deleteDoc(doc(firestore, "users", staffId));
        setUsers(prev => prev.filter(s => s.id !== staffId));
        toast({
            title: "Account Deleted",
            description: "The staff member has been removed.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: "Could not delete the staff member from the database.",
        });
    }
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
                    <Switch
                      id="status-switch"
                      checked={outletStatus === 'active'}
                      onCheckedChange={(checked) => setOutletStatus(checked ? 'active' : 'inactive')}
                    />
                    <Label htmlFor="status-switch" className="capitalize">{outletStatus}</Label>
                </div>
              </div>
               <div className="flex justify-end mt-4">
                 <Button>Save Changes</Button>
               </div>
            </div>
          </TabsContent>
          <TabsContent value="staff">
             <div className="py-4">
               <h4 className="font-semibold mb-2">{editingStaffId ? 'Edit Staff Account' : 'Create New Staff Account'}</h4>
               <div className="p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="space-y-2">
                            <Label htmlFor="staff-name">Full Name</Label>
                            <Input 
                            id="staff-name" 
                            placeholder="e.g., Jane Doe" 
                            value={newStaff.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="staff-email">Email</Label>
                            <Input 
                            id="staff-email" 
                            type="email" 
                            placeholder="e.g., jane.d@example.com"
                            value={newStaff.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="staff-password">Password</Label>
                            <Input
                            id="staff-password"
                            type="password"
                            placeholder={editingStaffId ? 'Set new password' : '••••••••'}
                            value={newStaff.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="staff-role">Role</Label>
                            <Select value={newStaff.role} onValueChange={(value) => handleInputChange('role', value as Role)}>
                                <SelectTrigger id="staff-role">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {staffRoles.map(role => (
                                        <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="col-span-3 flex justify-end gap-2">
                        {editingStaffId && (
                            <Button variant="outline" onClick={cancelEdit}>
                                <XCircle className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                        )}
                        <Button onClick={handleCreateOrUpdateAccount}>
                            {editingStaffId ? 'Update Account' : <><PlusCircle className="mr-2 h-4 w-4" /> Create Account</>}
                        </Button>
                     </div>
               </div>

                <h4 className="font-semibold mb-2 mt-6">Existing Staff</h4>
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
                        {outletStaff.map(s => (
                            <TableRow key={s.id}>
                                <TableCell>{s.name}</TableCell>
                                <TableCell>{s.email}</TableCell>
                                <TableCell><Badge variant="secondary" className="capitalize">{s.role}</Badge></TableCell>
                                <TableCell className='text-right'>
                                    <Button variant="ghost" size="icon" onClick={() => handleEditStaff(s)}><Edit className="h-4 w-4" /></Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will permanently delete the account for {s.name}. This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteStaff(s.id)} className="bg-destructive hover:bg-destructive/90">
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
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
