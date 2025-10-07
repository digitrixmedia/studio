
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface PrintLayoutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// In a real app, these values would be fetched from and saved to a database.
const initialLayoutSettings = {
    cafeName: 'ZappyyPOS',
    address: '123 Coffee Lane, Bengaluru',
    phone: '9876543210',
    footerMessage: 'Thank you for your visit!',
};

export function PrintLayoutDialog({ isOpen, onOpenChange }: PrintLayoutDialogProps) {
  const [settings, setSettings] = useState(initialLayoutSettings);

  const handleSave = () => {
    // Here you would save the settings to your backend.
    console.log('Saving print layout settings:', settings);
    onOpenChange(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({...prev, [id]: value}));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Print Layout Settings</DialogTitle>
          <DialogDescription>
            Customize the information that appears on your printed customer receipts.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cafeName" className="text-right">
              Cafe Name
            </Label>
            <Input id="cafeName" value={settings.cafeName} onChange={handleInputChange} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Address
            </Label>
            <Input id="address" value={settings.address} onChange={handleInputChange} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input id="phone" value={settings.phone} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="footerMessage" className="text-right pt-2">
              Footer
            </Label>
            <Textarea id="footerMessage" value={settings.footerMessage} onChange={handleInputChange} className="col-span-3" placeholder="e.g. Thank you!" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

