'use client';

import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from 'react-hook-form';

import { XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContactCategory } from '@/features/person/contact-category';
import { localizedCountryCodes } from '@/features/shared/utils/country-codes';

interface PersonPhoneFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  index: number;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export function PersonPhoneField<TFieldValues extends FieldValues>({
  control,
  name,
  label = 'Phone',
  placeholder = '(555) 123-4567',
  required = false,
  index,
  onRemove,
  disabled = false,
}: PersonPhoneFieldProps<TFieldValues>) {
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
          <div
            className={`
              flex min-w-0 flex-1 items-center rounded-md border bg-background
              pl-3 ring-offset-background transition-all duration-200
              focus-within:ring-2 focus-within:ring-offset-2
              ${
                fieldState.error
                  ? `
                    border-destructive bg-destructive/5
                    focus-within:ring-destructive
                  `
                  : `
                    border-input
                    focus-within:ring-ring
                  `
              }
            `}
          >
            <Controller<TFieldValues>
              name={`${name}.countryCode` as Path<TFieldValues>}
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={disabled}
                >
                  <SelectTrigger
                    aria-label="Select Country Code"
                    className="
                      h-9 w-19 shrink-0 border-0 bg-transparent p-0 pr-2
                      text-muted-foreground shadow-none
                      focus:ring-0 focus:ring-offset-0
                    "
                  >
                    <SelectValue>
                      <span
                        className="
                          flex min-w-0 items-center justify-start gap-1
                          text-left text-sm text-foreground
                        "
                      >
                        <span className="shrink-0 text-base select-none">
                          {localizedCountryCodes.find(
                            (c) => c.code === field.value
                          )?.flag || '🇺🇸'}
                        </span>
                        <span className="shrink-0 font-medium">
                          {localizedCountryCodes.find(
                            (c) => c.code === field.value
                          )?.dialCode || '+1'}
                        </span>
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {localizedCountryCodes.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="mr-2 select-none">{country.flag}</span>
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

            <span
              className="mx-1 shrink-0 text-muted-foreground/30 select-none"
              aria-hidden="true"
            >
              |
            </span>

            <Input
              {...field}
              type="tel"
              placeholder={placeholder}
              disabled={disabled}
              className="
                h-9 min-w-0 flex-1 border-0 bg-transparent pr-3 pl-0 shadow-none
                focus-visible:ring-0 focus-visible:ring-offset-0
              "
            />
          </div>

          <Controller
            name={`${name}.type` as Path<TFieldValues>}
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled}
              >
                <SelectTrigger className="h-9 w-22.5 shrink-0 border-border/80 shadow-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {ContactCategory.values().map((contactCategory) => (
                    <SelectItem
                      key={contactCategory.label}
                      value={contactCategory.value}
                    >
                      {contactCategory.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <FieldError />
        </Field>
      )}
    />
  );
}
