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

interface PersonEmailFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  index: number;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export function PersonEmailField<TFieldValues extends FieldValues>({
  control,
  name,
  label = 'Email',
  placeholder = 'john@example.com',
  required = false,
  index,
  onRemove,
  disabled = false,
}: PersonEmailFieldProps<TFieldValues>) {
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
          <div className="flex items-center gap-2">
            <Input
              {...field}
              type="email"
              placeholder={placeholder}
              disabled={disabled}
              className={
                fieldState.error
                  ? `
                    border-destructive bg-destructive/5
                    focus-visible:ring-destructive
                  `
                  : 'border-input shadow-xs'
              }
            />

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
          </div>
          <FieldError />
        </Field>
      )}
    />
  );
}
