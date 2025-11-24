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
  AlertDialogTrigger,
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
import { useState } from 'react';
import { Edit, PlusCircle, Trash2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';

import {
  collection,
  doc,
  deleteDoc,
  query,
  where,
  setDoc,
} from 'firebase/firestore';

import {
  useCollection,
  useMemoFirebase,
  setDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';

import { useFirestore } from '@/firebase';

interface ManageOutletDialogProps {
  outlet: FranchiseOutlet;
  isOpen: boolean;
  onClose: () => void;
}

const staffRoles: Exclude<Role, 'admin' | 'super-admin'>[] = [
  'manager',
  'cashier',
  'waiter',
  'kitchen',
];

const initialNewStaffState = {
  name: '',
  email: '',
  role: '' as Role | '',
  password: '',
};

export function ManageOutletDialog({ outlet, isOpen, onClose }: ManageOutletDialogProps) {
  
  const firestore = useFirestore(); // FIXED
  const { auth } = useAppContext(); // FIXED
  const { toast } = useToast();

  const [outletName, setOutletName] = useState(outlet.name || '');
  const [managerName, setManagerName] = useState(outlet.managerName || '');
  const [outletStatus, setOutletStatus] = useState(outlet.status);
  const [newStaff, setNewStaff] = useState(initialNewStaffState);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // -----------------------------
  // Staff Query (only same outlet)
  // -----------------------------
  const staffQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'users'),
      where('outletId', '==', outlet.id)
    );
  }, [firestore, outlet.id]);

  const { data: staffData } = useCollection<User>(staffQuery);
  const outletStaff = staffData || [];

  const handleInputChange = (field: keyof typeof newStaff, value: string) => {
    setNewStaff(prev => ({ ...prev, [field]: value }));
  };

  // -----------------------------
  // CREATE OR UPDATE STAFF
  // -----------------------------
  const handleCreateOrUpdateAccount = async () => {
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Firebase Error',
        description: 'Firebase services are not available.',
      });
      return;
    }

    if (!newStaff.name || !newStaff.email || !newStaff.role) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields.',
      });
      return;
    }

    if (editingStaffId) {
      // UPDATE STAFF
      const ref = doc(firestore, 'users', editingStaffId);
      setDocumentNonBlocking(
        ref,
        {
          name: newStaff.name,
          email: newStaff.email,
          role: newStaff.role,
        },
        { merge: true }
      );

      toast({
        title: 'Account Updated',
        description: `${newStaff.name}'s information has been updated.`,
      });
    } else {
      // CREATE STAFF
      if (!newStaff.password) {
        toast({
          variant: 'destructive',
          title: 'Missing Password',
          description: 'Password is required to create an account.',
        });
        return;
      }

      try {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          newStaff.email,
          newStaff.password
        );

        const newUserId = userCred.user.uid;

        const newUser: User = {
          id: newUserId,
          name: newStaff.name,
          email: newStaff.email,
          role: newStaff.role as Role,
          outletId: outlet.id,
        };

        await setDoc(doc(firestore, 'users', newUserId), newUser);

        toast({
          title: 'Account Created',
          description: `${newStaff.name} has been added.`,
        });
      } catch (err: any) {
        let msg = 'Something went wrong.';
        if (err.code === 'auth/email-already-in-use') msg = 'Email already in use.';
        if (err.code === 'auth/weak-password') msg = 'Password must be at least 6 characters.';

        toast({
          variant: 'destructive',
          title: 'User Creation Failed',
          description: msg,
        });
        return;
      }
    }

    setNewStaff(initialNewStaffState);
    setEditingStaffId(null);
  };

  const handleEditStaff = (staff: User) => {
    setEditingStaffId(staff.id);
    setNewStaff({
      name: staff.name,
      email: staff.email,
      role: staff.role,
      password: '',
    });
  };

  const cancelEdit = () => {
    setEditingStaffId(null);
    setNewStaff(initialNewStaffState);
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!firestore) return;

    deleteDocumentNonBlocking(doc(firestore, 'users', staffId));

    toast({
      title: 'Account Deleted',
      description: 'The staff member has been removed.',
    });
  };

  const handleSaveChanges = () => {
    if (!firestore) return;

    const ref = doc(firestore, 'outlets', outlet.id);

    setDocumentNonBlocking(
      ref,
      {
        name: outletName,
        status: outletStatus,
        managerName: managerName,
      },
      { merge: true }
    );

    toast({
      title: 'Outlet Updated',
      description: 'Outlet details saved.',
    });
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

          {/* OUTLET DETAILS */}
          <TabsContent value="details">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Outlet Name</Label>
                <Input
                  value={outletName}
                  onChange={(e) => setOutletName(e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Manager Name</Label>
                <Input
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Switch
                    checked={outletStatus === 'active'}
                    onCheckedChange={(v) => setOutletStatus(v ? 'active' : 'inactive')}
                  />
                  <span className="capitalize">{outletStatus}</span>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </div>
            </div>
          </TabsContent>

          {/* STAFF MANAGEMENT */}
          <TabsContent value="staff">
            <div className="py-4">

              <h4 className="font-semibold mb-2">
                {editingStaffId ? 'Edit Staff Account' : 'Create New Staff Account'}
              </h4>

              <div className="p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">

                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={newStaff.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      placeholder={editingStaffId ? 'Set new password' : '••••••••'}
                      value={newStaff.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={newStaff.role}
                      onValueChange={(v) => handleInputChange('role', v as Role)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffRoles.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                </div>

                <div className="flex justify-end gap-2">
                  {editingStaffId && (
                    <Button variant="outline" onClick={cancelEdit}>
                      <XCircle className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                  )}
                  <Button onClick={handleCreateOrUpdateAccount}>
                    {editingStaffId ? 'Update Account' : (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* STAFF TABLE */}
              <h4 className="font-semibold mb-2 mt-6">Existing Staff</h4>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {outletStaff.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{s.role}</Badge>
                      </TableCell>

                      <TableCell className="text-right flex items-center justify-end gap-2">

                        <Button variant="ghost" size="icon" onClick={() => handleEditStaff(s)}>
                          <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete {s.name}'s account.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDeleteStaff(s.id)}
                              >
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
