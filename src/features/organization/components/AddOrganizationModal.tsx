'use client';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import type z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  OrganizationFormSchema,
  type OrganizationFormValues,
} from '../organization.validation';

interface AddOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (
    data: OrganizationFormValues
  ) => Promise<{ success: boolean; error?: string }>;
}

export function AddOrganizationModal({
  isOpen,
  onClose,
  onSubmitSuccess,
}: AddOrganizationModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(OrganizationFormSchema),
    defaultValues: { name: '' },
  });

  if (!isOpen) return null;

  const handleFormSubmit = async (
    rawData: z.input<typeof OrganizationFormSchema>
  ) => {
    // Placeholder for actual submission logic
    console.log('Creating organization:', rawData.name);
    onSubmitSuccess(rawData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="
          rounded-xl border border-slate-100 bg-white p-6 shadow-xl
          sm:max-w-120
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Create New Organization
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            TODO: description
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 pt-2"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="font-semibold text-slate-700">
              Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Acme Corp"
              {...register('name')}
            />
            {errors.name && (
              <span className="text-xs font-medium text-red-600">
                {errors.name.message}
              </span>
            )}
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Activity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
