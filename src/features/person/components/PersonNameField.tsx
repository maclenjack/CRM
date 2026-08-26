'use client';

import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from 'react-hook-form';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface PersonNameFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export function PersonNameField<TFieldValues extends FieldValues>({
  control,
  name,
  label = 'Name',
  placeholder = 'John Doe',
  required = false,
}: PersonNameFieldProps<TFieldValues>) {
  return (
    <Controller<TFieldValues>
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className="flex flex-col gap-2">
          <FieldLabel htmlFor={name} required={required}>
            {label}
          </FieldLabel>
          <Input
            id={name}
            placeholder={placeholder}
            className="
              h-10 bg-background text-sm
              focus-visible:ring-1 focus-visible:ring-ring
            "
            value={field.value ?? ''}
            aria-invalid={!!fieldState.error}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
