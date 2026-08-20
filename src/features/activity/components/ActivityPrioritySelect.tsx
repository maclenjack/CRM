'use client';

import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from 'react-hook-form';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PriorityBadge } from '@/features/priority-level/components/PriorityBadge';
import { cn } from '@/features/shared/utils/cn';
import { PriorityLevel } from '@/generated/prisma/enums';

const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

interface ActivityPrioritySelectProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export function ActivityPrioritySelect<TFieldValues extends FieldValues>({
  control,
  name,
  label = 'Priority',
  required = false,
  placeholder = 'Select priority',
}: ActivityPrioritySelectProps<TFieldValues>) {
  const priorities = Object.keys(PRIORITY_LABELS) as PriorityLevel[];

  return (
    <Controller<TFieldValues>
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <FieldLabel htmlFor={name} required={required}>
              {label}
            </FieldLabel>
            {field.value && <PriorityBadge priorityLevel={field.value} />}
          </div>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            value={field.value}
          >
            <SelectTrigger
              className={cn(
                'h-9 w-full bg-background text-sm shadow-sm',
                fieldState.error &&
                  `
                    border-destructive
                    focus-visible:ring-destructive
                  `
              )}
              aria-invalid={!!fieldState.error}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  <span className="flex items-center gap-2">
                    <PriorityBadge priorityLevel={priority} />
                    {PRIORITY_LABELS[priority]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError />
        </Field>
      )}
    />
  );
}
