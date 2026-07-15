'use client';

import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AsyncCombobox } from '@/components/form/AsyncCombobox';
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
import { Textarea } from '@/components/ui/textarea';
import {
  ActivityFormSchema,
  type ActivityFormValues,
} from '@/features/activity/activity.validation';
import { mapDealToOption } from '@/features/deal/deal';
import { searchDeals } from '@/features/deal/deal.actions';
import { mapOrganizationToOption } from '@/features/organization/organization';
import { searchOrganizations } from '@/features/organization/organization.actions';
import { mapPersonToOption } from '@/features/person/person';
import { searchPeople } from '@/features/person/person.actions';
import { ActivityType, PriorityLevel } from '@/generated/prisma/enums';

type FormInput = z.input<typeof ActivityFormSchema>;

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (
    data: ActivityFormValues
  ) => Promise<{ success: boolean; error?: string }>;
}

export function AddActivityModal({
  isOpen,
  onClose,
  onSubmitSuccess,
}: AddActivityModalProps) {
  const defaultValues = useMemo(() => {
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
  }, []);

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

  const getTypedDateFieldValue = (value: unknown): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    return new Date(value as string);
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="
          rounded-xl border border-slate-100 bg-white p-6 shadow-xl
          sm:max-w-125
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Create New Activity
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Log active business engagements and track project deadlines.
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
              <FieldLabel required className="font-semibold text-slate-700">
                Type
              </FieldLabel>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CALL">Call</SelectItem>
                      <SelectItem value="MEETING">Meeting</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="TASK">Task</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <span className="text-xs font-medium text-red-600">
                  {errors.type.message}
                </span>
              )}
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
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel required className="font-semibold text-slate-700">
                Starts At
              </FieldLabel>
              <Controller
                control={control}
                name="startDateTime"
                render={({ field }) => (
                  <DateTimePicker
                    date={getTypedDateFieldValue(field.value)}
                    setDate={field.onChange}
                  />
                )}
              />
              {errors.startDateTime && (
                <span className="text-xs font-medium text-red-600">
                  {errors.startDateTime.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel required className="font-semibold text-slate-700">
                Ends At
              </FieldLabel>
              <Controller
                control={control}
                name="endDateTime"
                render={({ field }) => (
                  <DateTimePicker
                    date={getTypedDateFieldValue(field.value)}
                    setDate={field.onChange}
                  />
                )}
              />
              {errors.endDateTime && (
                <span className="text-xs font-medium text-destructive">
                  {errors.endDateTime.message}
                </span>
              )}
            </div>
          </div>

          <div
            className="
              grid grid-cols-1 gap-4
              sm:grid-cols-2
            "
          >
            <AsyncCombobox
              control={control}
              name="dealId"
              label="Deal"
              placeholder="Select a deal..."
              searchPlaceholder="Type deal name..."
              fetchOptions={searchDeals}
              mapOption={mapDealToOption}
            />
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
              {isSubmitting ? 'Saving...' : 'Save Activity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
