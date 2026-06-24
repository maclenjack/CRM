'use client';

import { InputHTMLAttributes, useState } from 'react';
import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from 'react-hook-form';

import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface PasswordFieldProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  id: string;
  label: string;
  autoComplete?: InputHTMLAttributes<HTMLInputElement>['autoComplete'];
}

export function PasswordField<TFieldValues extends FieldValues>({
  form,
  name,
  id,
  label,
  autoComplete = '',
}: PasswordFieldProps<TFieldValues>) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <div className="relative flex items-center">
            <Input
              {...field}
              id={id}
              aria-invalid={fieldState.invalid}
              autoComplete={autoComplete}
              type={showPassword ? 'text' : 'password'}
              placeholder={showPassword ? 'Password' : '••••••••'}
              disabled={form.formState.isSubmitting}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="
                absolute top-0 right-0 h-full px-3 py-2
                hover:bg-transparent
              "
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <EyeOff
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              ) : (
                <Eye
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              <span className="sr-only">
                {showPassword ? 'Hide password' : 'Show password'}
              </span>
            </Button>
          </div>
          <FieldError>{fieldState.error?.message}</FieldError>
        </Field>
      )}
    />
  );
}
