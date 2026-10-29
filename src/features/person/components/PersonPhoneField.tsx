'use client';

import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
  useFormContext,
} from 'react-hook-form';

import { XIcon } from 'lucide-react';
import { z } from 'zod';

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
import { localizedCountryCodes } from '@/features/shared/utils/country-codes';

interface PersonPhoneFieldProps<
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

export function PersonPhoneField<
  TFieldValues extends FieldValues = z.input<typeof PersonFormSchema>,
>({
  control,
  name,
  label = 'Phone',
  placeholder = '(555) 123-4567',
  required = false,
  index,
  onRemove,
  disabled = false,
}: PersonPhoneFieldProps<TFieldValues>) {
  const { formState } = useFormContext<TFieldValues>();

  const phoneErrors = getArrayFieldError(formState.errors, 'phones', index);

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
          aria-label={`Remove ${label.toLowerCase()}`}
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
        <InputGroupAddon>
          <Controller<TFieldValues>
            name={`${name}.countryCode` as FieldPath<TFieldValues>}
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value as string}
                disabled={disabled}
              >
                <SelectTrigger
                  aria-label="Select country code"
                  className="
                    h-9 w-19 shrink-0 border-0 bg-transparent p-0 pr-2
                    text-muted-foreground shadow-none
                    focus:ring-0 focus:ring-offset-0
                  "
                >
                  <SelectValue>
                    <span
                      className="
                        flex min-w-0 items-center justify-start gap-1 text-left
                        text-sm text-foreground
                      "
                    >
                      <span
                        className="shrink-0 text-base select-none"
                        aria-hidden="true"
                      >
                        {
                          localizedCountryCodes.find(
                            (c) => c.code === field.value
                          )?.flag
                        }
                      </span>
                      <span className="shrink-0 font-medium">
                        {localizedCountryCodes.find(
                          (c) => c.code === field.value
                        )?.dialCode || '+64'}
                      </span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {localizedCountryCodes.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="mr-2 select-none" aria-hidden="true">
                        {country.flag}
                      </span>
                      <span className="font-medium">{country.dialCode}</span>
                      <span
                        className="
                          ml-2 text-xs font-normal text-muted-foreground/60
                        "
                      >
                        ({country.name})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </InputGroupAddon>

        <span
          className="mx-1 shrink-0 text-muted-foreground/30 select-none"
          aria-hidden="true"
        >
          |
        </span>

        <Controller<TFieldValues>
          name={`${name}.value` as FieldPath<TFieldValues>}
          control={control}
          render={({ field }) => (
            <InputGroupInput
              {...field}
              type="tel"
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={!!phoneErrors?.value}
            />
          )}
        />
        <InputGroupAddon align={'inline-end'}>
          <Controller<TFieldValues>
            name={`${name}.type` as FieldPath<TFieldValues>}
            control={control}
            render={({ field }) => (
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
            )}
          />
        </InputGroupAddon>
      </InputGroup>
      <FieldError
        errors={[
          phoneErrors?.countryCode,
          phoneErrors?.value,
          phoneErrors?.type,
        ].filter((error) => error?.message)}
      />
    </Field>
  );
}
