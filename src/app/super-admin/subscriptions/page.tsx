
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { subscriptions as initialSubscriptions } from '@/lib/data';
import type { Subscription, SubscriptionStatus } from '@/lib/types';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';


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
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const defaultAccordionValue = searchParams.get('franchise') || undefined;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if(editingSub) {
      // Update existing subscription
      setSubscriptions(subscriptions.map(sub => 
        sub.id === editingSub.id 
          ? {
              ...sub,
              franchiseName: formData.franchiseName,
              outletName: formData.outletName,
              adminName: formData.adminName,
              adminEmail: formData.adminEmail,
              startDate: new Date(formData.startDate),
              endDate: new Date(formData.endDate),
            } 
          : sub
      ));
      toast({
        title: "Subscription Updated",
        description: `Details for ${formData.outletName} have been updated.`,
      });

    } else {
       // Create new subscription
       const newSub: Subscription = {
        id: `sub-${Date.now()}`,
        franchiseName: formData.franchiseName,
        outletName: formData.outletName,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        status: 'active',
        storageUsedMB: 0,
        totalReads: 0,
        totalWrites: 0,
      };
      setSubscriptions(prev => [newSub, ...prev]);
      toast({
        title: "Subscription Created",
        description: `${formData.outletName} for ${formData.franchiseName} has been created.`,
      });
    }

    setIsDialogOpen(false);
  };
  
  const handleDeleteSubscription = (subId: string) => {
    const subToDelete = subscriptions.find(sub => sub.id === subId);
    setSubscriptions(subscriptions.filter(sub => sub.id !== subId));
    toast({
        title: "Subscription Deleted",
        description: `The subscription for ${subToDelete?.outletName} has been permanently removed.`,
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
    setSubscriptions(subscriptions.map(sub => {
      if (sub.id === subId) {
        let newStatus: SubscriptionStatus = 'active';
        if (currentStatus === 'active') {
          newStatus = 'suspended';
        } else if (currentStatus === 'suspended' || currentStatus === 'inactive' || currentStatus === 'expired') {
          newStatus = 'active';
        }
        return { ...sub, status: newStatus };
      }
      return sub;
    }));
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


  return (
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
                    <Input id="franchiseName" value={formData.franchiseName} onChange={handleInputChange} className="col-span-3" required/>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="outletName" className="text-right">Outlet</Label>
                    <Input id="outletName" value={formData.outletName} onChange={handleInputChange} className="col-span-3" required/>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="adminName" className="text-right">Admin Name</Label>
                    <Input id="adminName" value={formData.adminName} onChange={handleInputChange} className="col-span-3" required/>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="adminEmail" className="text-right">Admin Email</Label>
                    <Input id="adminEmail" type="email" value={formData.adminEmail} onChange={handleInputChange} className="col-span-3" required/>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="adminPassword" className="text-right">Password</Label>
                    <Input id="adminPassword" type="password" placeholder={editingSub ? 'Unchanged' : '••••••••'} value={formData.adminPassword} onChange={handleInputChange} required={!editingSub}/>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startDate" className="text-right">Start Date</Label>
                    <Input id="startDate" type="date" value={formData.startDate} onChange={handleInputChange} className="col-span-3" required/>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endDate" className="text-right">End Date</Label>
                    <Input id="endDate" type="date" value={formData.endDate} onChange={handleInputChange} className="col-span-3" required/>
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
        <Accordion type="single" collapsible className="w-full" defaultValue={defaultAccordionValue}>
          {Object.entries(groupedSubscriptions).map(([franchiseName, subs]) => (
            <AccordionItem value={franchiseName} key={franchiseName}>
              <AccordionTrigger className="text-lg font-medium hover:no-underline">
                <div className='flex items-center gap-4'>
                    <span>{franchiseName}</span>
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
                      <TableHead>Actions</TableHead>
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
                      <TableRow key={sub.id} className={cn(status === 'expired' && 'bg-red-500/10')}>
                        <TableCell className="font-medium">{sub.outletName}</TableCell>
                        <TableCell>{format(new Date(sub.endDate), 'dd/MM/yyyy')}</TableCell>
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
                        <TableCell className="flex gap-2">
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
      </CardContent>
    </Card>
  );
}
