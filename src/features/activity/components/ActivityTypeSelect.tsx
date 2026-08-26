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
import { ActivityType } from '@/features/activity/activity-type';
import { cn } from '@/features/shared/utils/cn';

interface ActivityTypeSelectProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export function ActivityTypeSelect<TFieldValues extends FieldValues>({
  control,
  name,
  label = 'Type',
  required = false,
  placeholder = 'Select type',
}: ActivityTypeSelectProps<TFieldValues>) {
  return (
    <Controller<TFieldValues>
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className="flex flex-col gap-2">
          <FieldLabel htmlFor={name} required={required}>
            {label}
          </FieldLabel>
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
              {ActivityType.values().map(({ label, value, icon: Icon }) => (
                <SelectItem key={label} value={value}>
                  <span className="flex items-center gap-2">
                    <Icon />
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
