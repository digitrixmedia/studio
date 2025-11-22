
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { Subscription, SubscriptionStatus, User } from '@/lib/types';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAppContext } from '@/contexts/AppContext';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useCollection, useMemoFirebase } from '@/firebase';


const initialFormState = {
  franchiseName: '',
  outletName: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  startDate: '',
  endDate: '',
};

export default function SubscriptionsPage() {
  const { auth, firestore } = useAppContext();
  
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: usersData, setData: setUsers } = useCollection<User>(usersQuery);

  const users = usersData || [];

  const subscriptions: Subscription[] = users
    .filter(u => u.role === 'admin' && u.subscriptionId)
    .map(u => ({
        id: u.subscriptionId!,
        franchiseName: u.name, // Simplified for now
        outletName: `${u.name}'s Outlet`, // Simplified for now
        adminEmail: u.email,
        adminName: u.name,
        startDate: new Date(), // Placeholder
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Placeholder for 1 year
        status: 'active', // Placeholder
        storageUsedMB: 0, // Placeholder
        totalReads: 0, // Placeholder
        totalWrites: 0, // Placeholder
    }));
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const franchiseQuery = searchParams.get('franchise');

  const openNewDialog = () => {
    setEditingSub(null);
    setFormData(initialFormState);
    setIsDialogOpen(true);
  }

  const openEditDialog = (sub: Subscription) => {
    setEditingSub(sub);
    setFormData({
      franchiseName: sub.franchiseName,
      outletName: sub.outletName,
      adminName: sub.adminName || '',
      adminEmail: sub.adminEmail,
      adminPassword: '', // Don't pre-fill password
      startDate: format(new Date(sub.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(sub.endDate), 'yyyy-MM-dd'),
    });
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.adminEmail || (!formData.adminPassword && !editingSub)) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Email and password are required for new subscriptions.",
        });
        return;
    }

    if(editingSub) {
      // In a real app, you'd also update the user's details in Firebase Auth if needed.
      // This is more complex and requires admin privileges, so we'll skip it for now.
      const updatedUser = users.find(u => u.subscriptionId === editingSub.id);
      if (updatedUser) {
        setUsers(users.map(u => u.id === updatedUser.id ? { ...u, name: formData.adminName, email: formData.adminEmail } : u));
      }
      
      toast({
        title: "Subscription Updated",
        description: `Details for ${formData.outletName} have been updated.`,
      });

    } else {
       const superAdminEmail = auth.currentUser?.email;
       const superAdminPassword = 'password123'; // This is insecure and should be managed securely
       
       if (!superAdminEmail) {
            toast({ variant: "destructive", title: "Error", description: "Super admin is not logged in." });
            return;
       }

       try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.adminEmail, formData.adminPassword);
        
        await signInWithEmailAndPassword(auth, superAdminEmail, superAdminPassword);
        
        const newSubId = `sub-${Date.now()}`;

        const newUser: User = {
            id: userCredential.user.uid,
            name: formData.adminName,
            email: formData.adminEmail,
            role: 'admin',
            subscriptionId: newSubId,
        };
        
        // Correctly save the new user document to Firestore using setDoc
        await setDoc(doc(firestore, "users", userCredential.user.uid), newUser);

        toast({
          title: "Subscription & User Created",
          description: `User account for ${formData.adminEmail} has been created successfully.`,
        });

       } catch (error: any) {
           let description = "An unknown error occurred.";
            if (error.code === 'auth/email-already-in-use') {
                description = "This email is already in use by another account.";
            } else if (error.code === 'auth/weak-password') {
                description = "The password is too weak. It must be at least 6 characters.";
            }
            toast({
                variant: "destructive",
                title: "User Creation Failed",
                description: description,
            });
            await signInWithEmailAndPassword(auth, superAdminEmail, superAdminPassword);
            return;
       }
    }

    setIsDialogOpen(false);
  };
  
  const handleDeleteSubscription = (subId: string) => {
    // This needs to delete from Auth and Firestore, which is a complex operation
    // and would ideally be a Cloud Function. For now, we'll just remove from UI state.
    const subToDelete = subscriptions.find(sub => sub.id === subId);
    const userToDelete = users.find(u => u.subscriptionId === subId);

    if (userToDelete && setUsers) {
        setUsers(users.filter(u => u.id !== userToDelete.id));
    }
    
    toast({
        title: "Subscription Deleted",
        description: `The subscription for ${subToDelete?.outletName} has been removed.`,
        variant: "destructive"
    });
  }
  
  const getStatusVariant = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'expired': return 'destructive';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  const toggleSubscriptionStatus = (subId: string, currentStatus: SubscriptionStatus) => {
     // This logic would update the user's status in Firestore
    const sub = subscriptions.find(s => s.id === subId);
    toast({
      title: 'Subscription Updated',
      description: `Subscription for ${sub?.outletName} has been updated.`,
    });
  }

  const groupedSubscriptions = subscriptions.reduce((acc, subscription) => {
    const { franchiseName } = subscription;
    if (!acc[franchiseName]) {
      acc[franchiseName] = [];
    }
    acc[franchiseName].push(subscription);
    return acc;
  }, {} as Record<string, Subscription[]>);

  const filteredFranchiseEntries = Object.entries(groupedSubscriptions).filter(([franchiseName]) => 
    !franchiseQuery || franchiseName === franchiseQuery
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Subscriptions Management</CardTitle>
              <CardDescription>
                Manage all franchise and outlet subscriptions.
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewDialog}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Subscription
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleFormSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingSub ? 'Edit' : 'Add New'} Subscription</DialogTitle>
                    <DialogDescription>
                      Fill in the details for the outlet.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="franchiseName" className="text-right">Franchise</Label>
                      <Input id="franchiseName" value={formData.franchiseName} onChange={(e) => setFormData(prev => ({...prev, franchiseName: e.target.value}))} className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="outletName" className="text-right">Outlet</Label>
                      <Input id="outletName" value={formData.outletName} onChange={(e) => setFormData(prev => ({...prev, outletName: e.target.value}))} className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="adminName" className="text-right">Admin Name</Label>
                      <Input id="adminName" value={formData.adminName} onChange={(e) => setFormData(prev => ({...prev, adminName: e.target.value}))} className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="adminEmail" className="text-right">Admin Email</Label>
                      <Input id="adminEmail" type="email" value={formData.adminEmail} onChange={(e) => setFormData(prev => ({...prev, adminEmail: e.target.value}))} className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="adminPassword" className="text-right">Password</Label>
                      <Input id="adminPassword" type="password" placeholder={editingSub ? 'Unchanged' : '••••••••'} value={formData.adminPassword} onChange={(e) => setFormData(prev => ({...prev, adminPassword: e.target.value}))} required={!editingSub}/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="startDate" className="text-right">Start Date</Label>
                      <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData(prev => ({...prev, startDate: e.target.value}))} className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="endDate" className="text-right">End Date</Label>
                      <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData(prev => ({...prev, endDate: e.target.value}))} className="col-span-3" required/>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingSub ? 'Save Changes' : 'Create Subscription'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
            {filteredFranchiseEntries.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                    <p>No subscriptions found.</p>
                    <p>Click "Add Subscription" to create the first one.</p>
                </div>
            ) : (
                <Accordion type="single" collapsible className="w-full" defaultValue={franchiseQuery ? filteredFranchiseEntries[0]?.[0] : undefined}>
                    {filteredFranchiseEntries.map(([franchiseName, subs]) => (
                        <AccordionItem value={franchiseName} key={franchiseName}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-4">
                                    <span className="text-lg font-semibold">{franchiseName}</span>
                                    <Badge variant="secondary">{subs.length} Outlet(s)</Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead>Outlet</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Storage</TableHead>
                                        <TableHead>Active</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {subs.map(sub => {
                                        const isExpired = new Date(sub.endDate) < new Date();
                                        let status = sub.status;
                                        if (isExpired && status !== 'suspended') {
                                            status = 'expired';
                                        }
                                        
                                        return (
                                        <TableRow key={sub.id} className={cn(status === 'expired' && 'bg-red-500/5')}>
                                        <TableCell className="font-medium">{sub.outletName}</TableCell>
                                        <TableCell>{format(new Date(sub.endDate), 'dd MMM, yyyy')}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(status)} className="capitalize">
                                            {status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{(sub.storageUsedMB / 1024).toFixed(2)} GB</TableCell>
                                        <TableCell>
                                            <Switch
                                            checked={status === 'active'}
                                            onCheckedChange={() => toggleSubscriptionStatus(sub.id, status)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(sub)}>
                                            <Edit className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className='text-destructive hover:text-destructive'>
                                                <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the subscription for {sub.outletName} and all its data.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteSubscription(sub.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                        </TableRow>
                                    )})}
                                    </TableBody>
                                </Table>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
