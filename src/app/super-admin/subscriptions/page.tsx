'use client';

import { useState } from 'react';
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
  DialogClose,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { subscriptions as initialSubscriptions } from '@/lib/data';
import type { Subscription, SubscriptionStatus } from '@/lib/types';
import { PlusCircle, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const initialNewSubState = {
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
  const [sortConfig, setSortConfig] = useState<{ key: keyof Subscription, direction: 'asc' | 'desc' } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSubscription, setNewSubscription] = useState(initialNewSubState);
  const { toast } = useToast();


  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    if (sortConfig) {
        const key = sortConfig.key;
        let aValue = a[key];
        let bValue = b[key];

        // Handle date sorting
        if (key === 'startDate' || key === 'endDate') {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key: keyof Subscription) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getStatusVariant = (status: SubscriptionStatus) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Inactive': return 'secondary';
      case 'Expired': return 'destructive';
      case 'Suspended': return 'destructive';
      default: return 'outline';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewSubscription(prev => ({ ...prev, [id]: value }));
  };

  const handleCreateSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const newSub: Subscription = {
        id: `sub-${Date.now()}`,
        franchiseName: newSubscription.franchiseName,
        outletName: newSubscription.outletName,
        adminName: newSubscription.adminName,
        adminEmail: newSubscription.adminEmail,
        startDate: new Date(newSubscription.startDate),
        endDate: new Date(newSubscription.endDate),
        status: 'Active',
        storageUsedMB: 0,
    };
    setSubscriptions(prev => [newSub, ...prev]);
    toast({
        title: "Subscription Created",
        description: `${newSubscription.outletName} for ${newSubscription.franchiseName} has been created.`,
    });
    setNewSubscription(initialNewSubState);
    setIsDialogOpen(false);
  };


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
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Subscription
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleCreateSubscription}>
                <DialogHeader>
                  <DialogTitle>Add New Subscription</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the new outlet.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="franchiseName" className="text-right">Franchise</Label>
                      <Input id="franchiseName" value={newSubscription.franchiseName} onChange={handleInputChange} className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="outletName" className="text-right">Outlet</Label>
                      <Input id="outletName" value={newSubscription.outletName} onChange={handleInputChange} className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="adminName" className="text-right">Admin Name</Label>
                      <Input id="adminName" value={newSubscription.adminName} onChange={handleInputChange} className="col-span-3" required/>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="adminEmail" className="text-right">Admin Email</Label>
                      <Input id="adminEmail" type="email" value={newSubscription.adminEmail} onChange={handleInputChange} className="col-span-3" required/>
                  </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="adminPassword" className="text-right">Password</Label>
                      <Input id="adminPassword" type="password" value={newSubscription.adminPassword} onChange={handleInputChange} className="col-span-3" required/>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="startDate" className="text-right">Start Date</Label>
                      <Input id="startDate" type="date" value={newSubscription.startDate} onChange={handleInputChange} className="col-span-3" required/>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="endDate" className="text-right">End Date</Label>
                      <Input id="endDate" type="date" value={newSubscription.endDate} onChange={handleInputChange} className="col-span-3" required/>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Subscription</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('franchiseName')}>
                  Franchise <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Outlet</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('endDate')}>
                  End Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Storage</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSubscriptions.map(sub => (
              <TableRow key={sub.id} className={cn(sub.status === 'Expired' && 'bg-red-500/10')}>
                <TableCell className="font-medium">{sub.franchiseName}</TableCell>
                <TableCell>{sub.outletName}</TableCell>
                <TableCell>{sub.endDate.toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(sub.status)}>
                    {sub.status}
                  </Badge>
                </TableCell>
                <TableCell>{(sub.storageUsedMB / 1024).toFixed(2)} GB</TableCell>
                <TableCell>
                  <Switch checked={sub.status === 'Active'} />
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="ghost" size="icon">
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
                                This action cannot be undone. This will permanently delete the subscription and all its data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
