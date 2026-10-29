'use client';

import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
  useFormContext,
} from 'react-hook-form';

import { XIcon } from 'lucide-react';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContactCategory } from '@/features/person/contact-category';
import { getArrayFieldError } from '@/features/person/person.utils';
import type { PersonFormSchema } from '@/features/person/person.validation';

interface PersonEmailFieldProps<
  TFieldValues extends FieldValues = z.input<typeof PersonFormSchema>,
> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  index: number;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export function PersonEmailField<
  TFieldValues extends FieldValues = z.input<typeof PersonFormSchema>,
>({
  control,
  name,
  label = 'Email',
  placeholder = 'john@example.com',
  required = false,
  index,
  onRemove,
  disabled = false,
}: PersonEmailFieldProps<TFieldValues>) {
  const { formState } = useFormContext<TFieldValues>();

  const emailErrors = getArrayFieldError(formState.errors, 'emails', index);

  return (
    <Field className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <FieldLabel htmlFor={`${name}.value` as string} required={required}>
          {label}
        </FieldLabel>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="
            size-9 shrink-0 text-muted-foreground transition-colors
            hover:bg-destructive/10 hover:text-destructive
          "
          onClick={() => onRemove(index)}
        >
          <XIcon className="size-4" />
        </Button>
      </div>
      <InputGroup
        className="
          flex min-w-0 flex-1 items-center rounded-md border bg-background pl-3
          ring-offset-background transition-all duration-200
        "
      >
        <Controller<TFieldValues>
          name={`${name}.value` as FieldPath<TFieldValues>}
          control={control}
          render={({ field }) => (
            <InputGroupInput
              {...field}
              type="email"
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={!!emailErrors?.value}
            />
          )}
        />

        <Controller<TFieldValues>
          name={`${name}.type` as FieldPath<TFieldValues>}
          control={control}
          render={({ field }) => (
            <InputGroupAddon align="inline-end">
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={disabled}
              >
                <SelectTrigger
                  className="h-9 w-22.5 shrink-0 border-border/80 shadow-xs"
                  aria-label={`${label} type`}
                >
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {ContactCategory.values().map((contactCategory) => (
                    <SelectItem
                      key={contactCategory.value}
                      value={contactCategory.value}
                    >
                      {contactCategory.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </InputGroupAddon>
          )}
        />
      </InputGroup>
      <FieldError
        errors={[emailErrors?.value, emailErrors?.type].filter(
          (error) => error?.message
        )}
      />
    </Field>
  );
}
