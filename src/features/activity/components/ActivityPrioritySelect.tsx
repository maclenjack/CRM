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
import { PriorityLevel } from '@/features/priority-level/priority-level';
import { cn } from '@/features/shared/utils/cn';

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
              {PriorityLevel.values().map(({ label, value }) => (
                <SelectItem key={label} value={value}>
                  <span className="flex items-center gap-2">
                    <PriorityBadge priorityLevel={value} />
                    {label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
