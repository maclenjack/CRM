'use client';

import { Controller, type Path, useFieldArray, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, UserIcon } from 'lucide-react';
import type z from 'zod';

import { AsyncCombobox } from '@/components/form/AsyncCombobox';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { mapOrganizationToOption } from '@/features/organization/organization';
import { searchOrganizations } from '@/features/organization/organization.actions';
import { PersonEmailField } from '@/features/person/components/PersonEmailField';
import { PersonNameField } from '@/features/person/components/PersonNameField';
import { PersonPhoneField } from '@/features/person/components/PersonPhoneField';
import { ContactCategory } from '@/features/person/contact-category';
import {
  PersonFormSchema,
  type PersonFormValues,
} from '@/features/person/person.validation';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PersonFormValues & {
    id?: string;
    organizationName?: string | null;
  };
  onSubmitSuccess: (
    data: PersonFormValues
  ) => Promise<{ success: boolean; error?: string }>;
}

export function PersonModal({
  isOpen,
  onClose,
  initialData,
  onSubmitSuccess,
}: PersonModalProps) {
  const isEditing = !!initialData;

  const formMethods = useForm<z.input<typeof PersonFormSchema>>({
    resolver: zodResolver(PersonFormSchema),
    mode: 'onTouched',
    defaultValues: {
      name: initialData?.name ?? '',
      organizationId: initialData?.organizationId ?? '',
      phones: initialData?.phones ?? [],
      emails: initialData?.emails ?? [],
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = formMethods;

  const {
    fields: phoneFields,
    append: addPhone,
    remove: removePhone,
  } = useFieldArray({ control, name: 'phones' });

  const {
    fields: emailFields,
    append: addEmail,
    remove: removeEmail,
  } = useFieldArray({ control, name: 'emails' });

  const handleFormSubmit = async (
    rawData: z.input<typeof PersonFormSchema>
  ) => {
    try {
      const validatedData = PersonFormSchema.parse(rawData);

      const response = await onSubmitSuccess(validatedData);

      if (response?.success) {
        reset();
        onClose();
      }
    } catch (apiError) {
      console.error('PersonModal submission runtime fault:', apiError);
    }
  };

  const getSubmitButtonLabel = () => {
    if (isSubmitting) return 'Saving...';
    if (isEditing) return 'Save Changes';
    return 'Save';
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      modal={true}
    >
      <DialogContent
        className="
          max-w-lg gap-6 rounded-xl border border-border/80 bg-card p-6
          shadow-lg
        "
        onKeyDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle
            className="
              flex items-center gap-2.5 text-xl font-bold tracking-tight
              text-foreground select-none
            "
          >
            <div
              className="
                shrink-0 rounded-md border border-border/40 bg-muted p-1.5
                text-secondary
              "
            >
              <UserIcon className="size-4.5" />
            </div>
            {isEditing ? 'Edit Person' : 'Add Person'}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4">
            <PersonNameField control={control} name="name" required />

            <div className="space-y-1.5">
              <Controller
                control={control}
                name="organizationId"
                render={({ field, fieldState }) => (
                  <AsyncCombobox
                    value={field.value ?? null}
                    initialLabel={initialData?.organizationName ?? ''}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    label="Associated Organization"
                    placeholder="Select an organization..."
                    searchPlaceholder="Type company name..."
                    fetchOptions={searchOrganizations}
                    mapOption={mapOrganizationToOption}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-5 border-t border-border/40 pt-4">
            <div className="space-y-3">
              <span
                className="
                  block text-[11px] font-bold tracking-wide
                  text-muted-foreground/70 uppercase select-none
                "
              >
                Phones
              </span>

              {phoneFields.length > 0 && (
                <div className="space-y-2.5">
                  {phoneFields.map((item, index) => (
                    <PersonPhoneField
                      key={item.id}
                      control={control}
                      name={
                        `phones.${index}` as Path<
                          z.input<typeof PersonFormSchema>
                        >
                      }
                      index={index}
                      onRemove={removePhone}
                      disabled={isSubmitting}
                    />
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                className="
                  h-8 gap-1.5 border-dashed border-border/80 px-3 text-xs
                  font-medium text-muted-foreground shadow-xs transition-all
                  hover:bg-muted/50 hover:text-foreground
                "
                onClick={() =>
                  addPhone({
                    value: '',
                    type: ContactCategory.WORK,
                    countryCode: 'US',
                  })
                }
              >
                <PlusIcon className="size-3.5" />
                Add Phone
              </Button>
            </div>

            <div className="space-y-3">
              <span
                className="
                  block text-[11px] font-bold tracking-wide
                  text-muted-foreground/70 uppercase select-none
                "
              >
                Emails
              </span>

              {emailFields.length > 0 && (
                <div className="space-y-2.5">
                  {emailFields.map((item, index) => (
                    <PersonEmailField
                      key={item.id}
                      control={control}
                      name={
                        `emails.${index}` as Path<
                          z.input<typeof PersonFormSchema>
                        >
                      }
                      index={index}
                      onRemove={removeEmail}
                      disabled={isSubmitting}
                    />
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                className="
                  h-8 gap-1.5 border-dashed border-border/80 px-3 text-xs
                  font-medium text-muted-foreground shadow-xs transition-all
                  hover:bg-muted/50 hover:text-foreground
                "
                onClick={() =>
                  addEmail({ value: '', type: ContactCategory.WORK })
                }
              >
                <PlusIcon className="size-3.5" />
                Add Email
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-border/40 pt-4 sm:gap-0">
            <Button
              variant="outline"
              type="button"
              size="sm"
              className="h-9 px-4 font-medium"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-9 px-4 font-medium shadow-xs"
              disabled={isSubmitting}
            >
              {getSubmitButtonLabel()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
