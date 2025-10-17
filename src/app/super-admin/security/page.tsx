
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { auditLogs } from '@/lib/data';
import type { AuditLog, AuditLogStatus } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const statusColors: Record<AuditLogStatus, string> = {
  Success: 'bg-green-500',
  Failure: 'bg-red-500',
  Warning: 'bg-yellow-500',
};


export default function SecurityPage() {
    const [logs, setLogs] = useState<AuditLog[]>(auditLogs);

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold">Security & Audits</h1>
            <p className="text-muted-foreground">Review system-wide access logs and configure security policies.</p>
        </div>
      <Tabs defaultValue="access-logs">
        <TabsList>
          <TabsTrigger value="access-logs">Access Logs</TabsTrigger>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
        </TabsList>
        <TabsContent value="access-logs">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Trail</CardTitle>
              <CardDescription>A log of all important activities that have occurred across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="font-medium">{log.user.name}</div>
                        <div className="text-sm text-muted-foreground">{log.user.role}</div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{log.action}</Badge></TableCell>
                      <TableCell>{log.target}</TableCell>
                      <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
                      <TableCell>{formatDistanceToNow(log.timestamp, { addSuffix: true })}</TableCell>
                       <TableCell>
                        <div className="flex items-center gap-2">
                           <span className={cn("h-2 w-2 rounded-full", statusColors[log.status])} />
                           <span>{log.status}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Global Security Policies</CardTitle>
              <CardDescription>
                Manage system-wide security settings. These policies apply to all users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h4 className="font-semibold">Enforce Two-Factor Authentication (2FA)</h4>
                  <p className="text-sm text-muted-foreground">
                    Require all users to set up a second authentication factor for added security.
                  </p>
                </div>
                <Switch disabled />
              </div>
              <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-semibold">Password Policy</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Minimum Length</Label>
                        <Input type="number" defaultValue={8} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label>Password Expiration</Label>
                         <Select defaultValue="90" disabled>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="60">60 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                             <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="complexity" defaultChecked disabled />
                    <Label htmlFor="complexity">Require uppercase, lowercase, numbers, and symbols</Label>
                </div>
              </div>
               <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-semibold">Session Management</h4>
                 <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Input type="number" defaultValue={30} disabled />
                     <p className="text-sm text-muted-foreground">
                        Automatically log out users after a period of inactivity.
                    </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
                <Button disabled>Save Policies</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
