'use client';

import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AsyncCombobox } from '@/components/form/AsyncCombobox';
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
import { Textarea } from '@/components/ui/textarea';
import {
  ActivityFormSchema,
  type ActivityFormValues,
} from '@/features/activity/activity.validation';
import { ActivityDateTimeField } from '@/features/activity/components/ActivityDateTimeField';
import { ActivityPrioritySelect } from '@/features/activity/components/ActivityPrioritySelect';
import { ActivityTypeSelect } from '@/features/activity/components/ActivityTypeSelect';
import { mapDealToOption } from '@/features/deal/deal';
import { searchDeals } from '@/features/deal/deal.actions';
import { mapOrganizationToOption } from '@/features/organization/organization';
import { searchOrganizations } from '@/features/organization/organization.actions';
import { mapPersonToOption } from '@/features/person/person';
import { searchPeople } from '@/features/person/person.actions';
import { ActivityType, PriorityLevel } from '@/generated/prisma/enums';

type FormInput = z.input<typeof ActivityFormSchema>;

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ActivityFormValues & {
    id?: string;
    dealTitle?: string | null;
    personName?: string | null;
    organizationName?: string | null;
  };
  onSubmitSuccess: (
    data: ActivityFormValues
  ) => Promise<{ success: boolean; error?: string }>;
}

export function ActivityModal({
  isOpen,
  onClose,
  initialData,
  onSubmitSuccess,
}: ActivityModalProps) {
  const isEditing = !!initialData;

  const defaultValues = useMemo(() => {
    if (initialData) {
      return {
        subject: initialData.subject ?? '',
        type: initialData.type ?? ActivityType.CALL,
        startDateTime: initialData.startDateTime
          ? new Date(initialData.startDateTime)
          : new Date(),
        endDateTime: initialData.endDateTime
          ? new Date(initialData.endDateTime)
          : new Date(),
        priority: initialData.priority ?? PriorityLevel.MEDIUM,
        note: initialData.note ?? '',
        dealId: initialData.dealId ?? undefined,
        personId: initialData.personId ?? undefined,
        organizationId: initialData.organizationId ?? undefined,
      };
    }

    const now: Date = new Date();
    const roundedStart: Date = new Date();
    roundedStart.setMinutes(0, 0, 0);
    if (now.getMinutes() >= 30) {
      roundedStart.setHours(roundedStart.getHours() + 1);
    }
    const start: Date = roundedStart;
    const end: Date = new Date(start.getTime() + 60 * 60 * 1000);
    return {
      subject: '',
      type: ActivityType.CALL,
      startDateTime: start,
      endDateTime: end,
      priority: PriorityLevel.MEDIUM,
      note: '',
      dealId: undefined,
      personId: undefined,
      organizationId: undefined,
    };
  }, [initialData]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(ActivityFormSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const handleFormSubmit = async (
    rawData: z.input<typeof ActivityFormSchema>
  ) => {
    try {
      const validatedData = ActivityFormSchema.parse(rawData);

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

  const getSubmitButtonLabel = () => {
    if (isSubmitting) return 'Saving...';
    if (isEditing) return 'Save Changes';
    return 'Save Activity';
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
            {isEditing ? 'Edit Activity' : 'Create New Activity'}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {isEditing
              ? 'Update existing business engagement details.'
              : 'Log active business engagements and track project deadlines.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 pt-2"
        >
          <div className="flex flex-col gap-1.5">
            <FieldLabel
              htmlFor="subject"
              required
              className="font-semibold text-slate-700"
            >
              Subject Line
            </FieldLabel>
            <Input
              id="subject"
              placeholder="e.g. Follow-up contract discussion"
              {...register('subject')}
            />
            {errors.subject && (
              <span className="text-xs font-medium text-red-600">
                {errors.subject.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <ActivityTypeSelect control={control} name="type" required />
            </div>

            <div className="flex flex-col gap-1.5">
              <ActivityPrioritySelect
                control={control}
                name="priority"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ActivityDateTimeField
              control={control}
              name="startDateTime"
              label="Starts At"
              required
              placeholder="Select start date and time"
            />
            <ActivityDateTimeField
              control={control}
              name="endDateTime"
              label="Ends At"
              required
              placeholder="Select end date and time"
            />
          </div>

          <div
            className="
              grid grid-cols-1 gap-4
              sm:grid-cols-2
            "
          >
            <Controller
              control={control}
              name="dealId"
              render={({ field, fieldState }) => (
                <AsyncCombobox
                  value={field.value ?? null}
                  initialLabel={initialData?.dealTitle ?? ''}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  label="Deal"
                  placeholder="Select a deal..."
                  searchPlaceholder="Type deal name..."
                  fetchOptions={searchDeals}
                  mapOption={mapDealToOption}
                />
              )}
            />

            <Controller
              control={control}
              name="personId"
              render={({ field, fieldState }) => (
                <AsyncCombobox
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

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="note" className="font-semibold text-slate-700">
              Notes (Optional)
            </FieldLabel>
            <Textarea
              id="note"
              placeholder="Type background meeting logs here..."
              className="resize-none"
              rows={3}
              {...register('note')}
            />
            {errors.note && (
              <span className="text-xs font-medium text-red-600">
                {errors.note.message}
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
              {getSubmitButtonLabel()}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
