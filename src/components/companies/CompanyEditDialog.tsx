import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CompanyForm } from './CompanyForm';
import { X } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  contact_name?: string;
  contact_email?: string;
  phone?: string;
  status: string;
  booth_number?: string;
  booth_location?: string;
  booth_size?: string;
  created_at: string;
  updated_at: string;
}

interface CompanyEditDialogProps {
  company: Company;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, tagIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

/**
 * CompanyEditDialog - Modal pour éditer les infos d'une entreprise
 * Remplace la page séparée de modification
 */
export function CompanyEditDialog({
  company,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CompanyEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any, tagIds: string[]) => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData, tagIds);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Modifier {company.name}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4">
          <CompanyForm
            company={company}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
