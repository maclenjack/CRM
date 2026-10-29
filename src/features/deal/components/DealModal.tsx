'use client';

import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

import { AsyncCombobox } from '@/components/form/AsyncCombobox';
import { CurrencyField } from '@/components/form/CurrencyField';
import { DateTimePicker } from '@/components/form/DateTimePicker';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FieldLabel } from '@/components/ui/field';
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
import type { DealModalInitialValues } from '@/features/deal/deal.utils';
import {
  CreateDealSchema,
  type CreateDealValues,
  UpdateDealSchema,
  type UpdateDealValues,
} from '@/features/deal/deal.validation';
import { mapOrganizationToOption } from '@/features/organization/organization';
import { searchOrganizations } from '@/features/organization/organization.actions';
import { mapPersonToOption } from '@/features/person/person';
import { searchPeople } from '@/features/person/person.actions';
import { PINNED_CURRENCY_OPTIONS } from '@/features/shared/utils/currency';
import { getTypedDateFieldValue } from '@/features/shared/utils/date';
import { formatScreamingSnake } from '@/features/shared/utils/string';
import {
  DealStatus,
  PipelineStage,
  PriorityLevel,
} from '@/generated/prisma/enums';

type FormInput = z.input<typeof CreateDealSchema>;

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: DealModalInitialValues;
  onSubmitSuccess: (
    data: CreateDealValues | UpdateDealValues
  ) => Promise<unknown>;
}

export function DealModal({
  isOpen,
  onClose,
  initialData,
  onSubmitSuccess,
}: DealModalProps) {
  const isEditing = !!initialData;
  const activeSchema = isEditing ? UpdateDealSchema : CreateDealSchema;

  const defaultValues = useMemo(() => {
    if (initialData) {
      return {
        title: initialData.title ?? '',
        value: initialData.value ? String(initialData.value) : '0',
        currency: initialData.currency ?? PINNED_CURRENCY_OPTIONS[0].value,
        personId: initialData.personId ?? undefined,
        organizationId: initialData.organizationId ?? undefined,
        stage: initialData.stage ?? PipelineStage.CONTACT_MADE,
        status: initialData.status ?? DealStatus.OPEN,
        priority: initialData.priority ?? PriorityLevel.MEDIUM,
        expectedCloseDate: initialData.expectedCloseDate
          ? new Date(initialData.expectedCloseDate)
          : null,
      };
    }

    const roundedStart = new Date();
    roundedStart.setMinutes(0, 0, 0);
    if (new Date().getMinutes() >= 30) {
      roundedStart.setHours(roundedStart.getHours() + 1);
    }

    return {
      title: '',
      value: '0',
      currency: PINNED_CURRENCY_OPTIONS[0].value,
      personId: undefined,
      organizationId: undefined,
      stage: PipelineStage.CONTACT_MADE,
      status: DealStatus.OPEN,
      priority: PriorityLevel.MEDIUM,
      expectedCloseDate: roundedStart,
    };
  }, [initialData]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(activeSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const handleFormSubmit = async (rawData: FormInput) => {
    try {
      const validatedData = activeSchema.parse(rawData);

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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      modal={true}
    >
      <DialogContent
        className="
          rounded-xl border border-slate-100 bg-white p-6 shadow-xl
          sm:max-w-125
        "
        onKeyDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            {isEditing ? 'Edit Deal' : 'Create New Deal'}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {isEditing
              ? 'Update existing deal pipeline record details.'
              : 'Fill out the details below to log a new deal pipeline record.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit, (errors) =>
            console.error('Form validation failed:', errors)
          )}
          className="space-y-4 pt-2"
        >
          <div className="flex flex-col gap-1.5">
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
            />
            {errors.title && (
              <span className="text-xs font-medium text-red-600">
                {errors.title.message}
              </span>
            )}
          </div>

          <div
            className="
              grid grid-cols-1 gap-4
              sm:grid-cols-2
            "
          >
            <Controller
              control={control}
              name="personId"
              render={({ field, fieldState }) => (
                <AsyncCombobox
                  required={true}
                  value={field.value ?? null}
                  initialLabel={initialData?.personName ?? ''}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  label="Contact Person"
                  placeholder="Select a contact person..."
                  searchPlaceholder="Type persons name..."
                  fetchOptions={searchPeople}
                  mapOption={mapPersonToOption}
                />
              )}
            />

            <Controller
              control={control}
              name="organizationId"
              render={({ field, fieldState }) => (
                <AsyncCombobox
                  required={true}
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

            <div className="flex flex-col gap-1.5">
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
                <span className="text-xs font-medium text-red-600">
                  {errors.priority.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel required className="font-semibold text-slate-700">
              Expected Close Date
            </FieldLabel>
            <Controller
              control={control}
              name="expectedCloseDate"
              render={({ field }) => (
                <DateTimePicker
                  date={getTypedDateFieldValue(field.value)}
                  setDate={field.onChange}
                  minDate={isEditing ? undefined : new Date()}
                />
              )}
            />
            {errors.expectedCloseDate && (
              <span className="text-xs font-medium text-red-600">
                {errors.expectedCloseDate.message}
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
              {isSubmitting
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Save Deal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
