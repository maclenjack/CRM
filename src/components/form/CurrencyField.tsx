'use client';

import * as React from 'react';
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
  type PathValue,
  type UseFormSetValue,
} from 'react-hook-form';

import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/features/shared/utils/cn';
import {
  PINNED_CURRENCY_OPTIONS,
  REMAINING_CURRENCY_OPTIONS,
} from '@/features/shared/utils/currency';

interface CurrencyFieldProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
> {
  control: Control<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  name: TName;
  label?: string;
  className?: string;
}

export function CurrencyField<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
>({
  control,
  setValue,
  name,
  label = 'Currency',
  className,
}: CurrencyFieldProps<TFieldValues, TName>) {
  const [open, setOpen] = React.useState(false);
  const allAvailableCurrencies = [
    ...PINNED_CURRENCY_OPTIONS,
    ...REMAINING_CURRENCY_OPTIONS,
  ];

  return (
    <Controller<TFieldValues, TName>
      control={control}
      name={name}
      render={({ field }) => (
        <Field className={cn('flex flex-col gap-2', className)}>
          <FieldLabel required>{label}</FieldLabel>

          <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  'w-full items-center justify-between',
                  !field.value && 'text-muted-foreground'
                )}
              >
                <span className="mr-2 truncate text-left">
                  {field.value
                    ? allAvailableCurrencies.find(
                        (c) => c.value === field.value
                      )?.label
                    : 'Select currency...'}
                </span>
                <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              className="w-(--radix-popover-trigger-width) p-0"
              align="start"
            >
              <Command>
                <CommandInput placeholder="Search currency code or name..." />
                <CommandList>
                  <CommandEmpty>No currency found.</CommandEmpty>

                  <CommandGroup heading="Pinned">
                    {PINNED_CURRENCY_OPTIONS.map((currency) => (
                      <CommandItem
                        value={`${currency.code} ${currency.name}`}
                        key={`pinned-${currency.code}`}
                        onSelect={() => {
                          setValue(
                            name,
                            currency.code as PathValue<TFieldValues, TName>,
                            {
                              shouldValidate: true,
                            }
                          );
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 size-4',
                            currency.code === field.value
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        <span className="w-10 font-semibold">
                          {currency.code}
                        </span>
                        <span className="truncate text-muted-foreground">
                          ({currency.symbol}) {currency.name}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  <CommandSeparator />

                  <CommandGroup heading="All Currencies">
                    {REMAINING_CURRENCY_OPTIONS.map((currency) => (
                      <CommandItem
                        value={`${currency.code} ${currency.name}`}
                        key={currency.code}
                        onSelect={() => {
                          setValue(
                            name,
                            currency.code as PathValue<TFieldValues, TName>,
                            {
                              shouldValidate: true,
                            }
                          );
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 size-4',
                            currency.code === field.value
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        <span className="w-10 font-semibold">
                          {currency.code}
                        </span>
                        <span className="truncate text-muted-foreground">
                          ({currency.symbol}) {currency.name}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <FieldError />
        </Field>
      )}
    />
  );
}
