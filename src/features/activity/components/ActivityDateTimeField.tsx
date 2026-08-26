'use client';

import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from 'react-hook-form';

import { DateTimePicker } from '@/components/form/DateTimePicker';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { getTypedDateFieldValue } from '@/features/shared/utils/date';

interface ActivityDateTimeFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeholder?: string;
  required?: boolean;
  minDate?: Date;
}

export function ActivityDateTimeField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = false,
  minDate,
}: ActivityDateTimeFieldProps<TFieldValues>) {
  return (
    <Controller<TFieldValues>
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className="flex flex-col gap-2">
          <FieldLabel htmlFor={name} required={required}>
            {label}
          </FieldLabel>
          <DateTimePicker
            date={getTypedDateFieldValue(field.value)}
            setDate={field.onChange}
            minDate={minDate}
            placeholder={placeholder}
            aria-invalid={!!fieldState.error}
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
