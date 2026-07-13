'use client';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2Icon } from 'lucide-react';
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
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(OrganizationFormSchema),
    defaultValues: { name: '' },
    mode: 'onTouched',
  });

  if (!isOpen) return null;

  const handleFormSubmit = async (
    rawData: z.input<typeof OrganizationFormSchema>
  ) => {
    try {
      const validatedData = OrganizationFormSchema.parse(rawData);

      const response = await onSubmitSuccess(validatedData);

      if (response?.success) {
        reset();
        onClose();
      }
    } catch (apiError) {
      console.error(
        'Submission failed parsing active payload context:',
        apiError
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="
          rounded-xl border border-border bg-card p-6 shadow-lg transition-all
          sm:max-w-115
        "
      >
        <DialogHeader className="space-y-1.5 pr-6">
          <DialogTitle
            className="
              flex items-center gap-2.5 text-xl font-bold tracking-tight
              text-foreground
            "
          >
            <div
              className="
                shrink-0 rounded-md border border-border/40 bg-muted p-1.5
                text-secondary
              "
            >
              <Building2Icon className="size-4.5" />
            </div>
            Create New Organization
          </DialogTitle>
          <DialogDescription className="text-xs/relaxed text-muted-foreground">
            Add a profile for a new client company or account partnership
            record.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-6 pt-2"
        >
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="
                text-[10px] font-bold tracking-wider text-muted-foreground
                uppercase
              "
            >
              Organization Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Acme Corporation"
              className="
                h-10 bg-background text-sm
                focus-visible:ring-1 focus-visible:ring-ring
              "
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-xs font-medium text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Added items-center for perfectly balanced button heights */}
          <div
            className="
              flex items-center justify-end gap-2 border-t border-border/60 pt-4
            "
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 px-4 text-xs font-medium"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-9 px-4 text-xs font-medium shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Create Organization'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
