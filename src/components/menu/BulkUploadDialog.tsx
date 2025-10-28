
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { extractMenuItems } from '@/ai/flows/extract-menu-items-flow';
import type { MenuItem } from '@/lib/types';
import { Loader2, Upload } from 'lucide-react';

interface BulkUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (items: Omit<MenuItem, 'id' | 'isAvailable' | 'ingredients'>[]) => void;
}

export function BulkUploadDialog({ isOpen, onClose, onSuccess }: BulkUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please select a menu file to upload.',
      });
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const documentDataUri = reader.result as string;

        try {
          const result = await extractMenuItems({ documentDataUri });

          if (result && result.items.length > 0) {
            onSuccess(result.items);
            onClose();
          } else {
             toast({
              variant: 'destructive',
              title: 'Extraction Failed',
              description: 'Could not extract any menu items. Please check the file format.',
            });
          }
        } catch (aiError) {
          console.error('AI extraction error:', aiError);
           toast({
            variant: 'destructive',
            title: 'AI Error',
            description: 'The AI model failed to process the document.',
          });
        } finally {
            setIsUploading(false);
            setFile(null);
        }
      };
      reader.onerror = (error) => {
        console.error('File reading error:', error);
        toast({
          variant: 'destructive',
          title: 'File Read Error',
          description: 'There was an issue reading your file.',
        });
        setIsUploading(false);
      };
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'An unexpected error occurred during the upload.',
      });
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Upload Menu</DialogTitle>
          <DialogDescription>
            Upload a PDF, Word, or Excel document containing your menu. The AI will automatically extract the items.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="menu-file">Menu File</Label>
            <Input id="menu-file" type="file" onChange={handleFileChange} accept=".pdf,.xlsx,.csv,.doc,.docx" />
             <p className="text-xs text-muted-foreground">
              For best results, use a simple, well-structured menu.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
               <>
                <Upload className="mr-2 h-4 w-4" /> Upload & Extract
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
