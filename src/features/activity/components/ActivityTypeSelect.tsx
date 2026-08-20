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
import { cn } from '@/features/shared/utils/cn';
import { ActivityType } from '@/generated/prisma/enums';

const TYPE_LABELS: Record<ActivityType, string> = {
  CALL: 'Call',
  EMAIL: 'Email',
  MEETING: 'Meeting',
  TASK: 'Task',
  DEADLINE: 'Deadline',
  LUNCH: 'Lunch',
} as const;

const TYPE_ICONS: Record<ActivityType, string> = {
  CALL: '📞',
  EMAIL: '✉️',
  MEETING: '👥',
  TASK: '📋',
  DEADLINE: '⚠️',
  LUNCH: '🍽️',
} as const;

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
  const types = Object.keys(TYPE_LABELS) as ActivityType[];

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
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  <span className="flex items-center gap-2">
                    <span>{TYPE_ICONS[type]}</span>
                    {TYPE_LABELS[type]}
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
