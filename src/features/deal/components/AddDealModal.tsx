'use client';

import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import type z from 'zod';

import { AsyncCombobox } from '@/components/form/AsyncCombobox';
import { CurrencyField } from '@/components/form/CurrencyField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DealAmountField } from '@/features/deal/components/DealAmountField';
import { DealStageField } from '@/features/deal/components/DealStageField';
import {
  DealFormSchema,
  type DealFormValues,
  PINNED_CURRENCY_OPTIONS,
} from '@/features/deal/deal.validation';
import { mapOrganizationToOption } from '@/features/organization/organization';
import { searchOrganizations } from '@/features/organization/organization.actions';
import { mapPersonToOption } from '@/features/person/person';
import { searchPeople } from '@/features/person/person.actions';
import { formatScreamingSnake } from '@/features/shared/utils/string';
import {
  DealStatus,
  PipelineStage,
  PriorityLevel,
} from '@/generated/prisma/enums';

type FormInput = z.input<typeof DealFormSchema>;

interface AddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (
    data: DealFormValues
  ) => Promise<{ success: boolean; error?: string }>;
}

export function AddDealModal({
  isOpen,
  onClose,
  onSubmitSuccess,
}: AddDealModalProps) {
  const defaultValues = React.useMemo(() => {
    const roundedStart = new Date();
    roundedStart.setMinutes(0, 0, 0);
    if (new Date().getMinutes() >= 30) {
      roundedStart.setHours(roundedStart.getHours() + 1);
    }
    return {
      title: '',
      value: 0,
      currency: PINNED_CURRENCY_OPTIONS[0].value,
      personId: '',
      organizationId: '',
      stage: PipelineStage.CONTACT_MADE,
      status: DealStatus.OPEN,
      priority: PriorityLevel.MEDIUM,
      expectedCloseDate: roundedStart,
    };
  }, []);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(DealFormSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const handleFormSubmit = async (rawData: z.input<typeof DealFormSchema>) => {
    try {
      const validatedData = DealFormSchema.parse(rawData);

      await onSubmitSuccess(validatedData);

      reset();
      onClose();
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
          rounded-xl border border-slate-100 bg-white p-6 shadow-xl
          sm:max-w-120
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Create New Deal
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Fill out the details below to log a new deal pipeline record.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 pt-2"
        >
          <Field className="flex flex-col gap-1.5">
            <FieldLabel
              htmlFor="title"
              required
              className="font-semibold text-slate-700"
            >
              Title
            </FieldLabel>
            <Input
              id="title"
              placeholder="e.g. Acme Corp Software Expansion"
              {...register('title')}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <span className="text-xs font-medium text-destructive">
                {errors.title.message}
              </span>
            )}
          </Field>

          <div
            className="
              grid grid-cols-1 gap-4
              sm:grid-cols-2
            "
          >
            <AsyncCombobox
              control={control}
              name="personId"
              label="Contact Person"
              placeholder="Select a contact person..."
              searchPlaceholder="Type persons name..."
              fetchOptions={searchPeople}
              mapOption={mapPersonToOption}
            />
            <AsyncCombobox
              control={control}
              name="organizationId"
              label="Associated Organization"
              placeholder="Select an organization..."
              searchPlaceholder="Type company name..."
              fetchOptions={searchOrganizations}
              mapOption={mapOrganizationToOption}
            />
          </div>

          <div
            className="
              grid grid-cols-1 items-end gap-4
              sm:grid-cols-3
            "
          >
            <DealAmountField
              control={control}
              name="value"
              currencyFieldName="currency"
              label="Deal Value"
              required
            />
            <CurrencyField
              control={control}
              setValue={setValue}
              name="currency"
              label="Deal Currency"
              className="sm:col-span-2"
            />
          </div>

          <div
            className="
              grid grid-cols-1 gap-4
              sm:grid-cols-3
            "
          >
            <div className="sm:col-span-2">
              <DealStageField
                control={control}
                setValue={setValue}
                name="stage"
              />
            </div>

            <Field className="flex flex-col gap-1.5">
              <FieldLabel required className="font-semibold text-slate-700">
                Priority
              </FieldLabel>

              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger className="h-9 w-full bg-background text-sm shadow-sm">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PriorityLevel).map((level) => (
                        <SelectItem key={level} value={level}>
                          {formatScreamingSnake(level)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />

              {errors.priority && (
                <span className="text-xs font-medium text-destructive">
                  {errors.priority.message}
                </span>
              )}
            </Field>
          </div>

          <div className="mt-6 flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
