
'use client';

import { orders } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { IndianRupee } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export function RecentOrders() {
    const router = useRouter();
    const recentOrders = [...orders]
        .sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10);
    
    const handleViewAll = () => {
        router.push('/operations');
    }

    return (
        <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">#{order.orderNumber}</div>
                      <div className="text-sm text-muted-foreground">{order.customerName || 'N/A'}</div>
                    </TableCell>
                    <TableCell className='flex items-center'>
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {order.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right"><Badge>{order.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="outline" className="w-full" onClick={handleViewAll}>
                View All Orders
            </Button>
        </div>
    )
}
