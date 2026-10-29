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
import { OrganizationNameField } from '@/features/organization/components/OrganizationNameField';

import {
  OrganizationFormSchema,
  type OrganizationFormValues,
} from '../organization.validation';

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: OrganizationFormValues & { id?: string };
  onSubmitSuccess: (
    data: OrganizationFormValues
  ) => Promise<{ success: boolean; error?: string }>;
}

export function OrganizationModal({
  isOpen,
  onClose,
  initialData,
  onSubmitSuccess,
}: OrganizationModalProps) {
  const isEditing = !!initialData;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(OrganizationFormSchema),
    defaultValues: { name: initialData?.name ?? '' },
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

  const getSubmitButtonLabel = () => {
    if (isSubmitting) return 'Saving...';
    if (isEditing) return 'Save Changes';
    return 'Create Organization';
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      modal={true}
    >
      <DialogContent
        className="
          rounded-xl border border-border bg-card p-6 shadow-lg transition-all
          sm:max-w-115
        "
        onKeyDown={(e) => e.stopPropagation()}
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
            {isEditing ? 'Edit Organization' : 'Create New Organization'}
          </DialogTitle>
          <DialogDescription className="text-xs/relaxed text-muted-foreground">
            {isEditing
              ? 'Update details for this client company or account partnership.'
              : 'Add a profile for a new client company or account partnership record.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-6 pt-2"
        >
          <OrganizationNameField control={control} name="name" required />

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
              {getSubmitButtonLabel()}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
