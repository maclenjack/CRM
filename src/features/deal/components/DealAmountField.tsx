'use client';

import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
  useWatch,
} from 'react-hook-form';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  PINNED_CURRENCY_OPTIONS,
  REMAINING_CURRENCY_OPTIONS,
} from '@/features/deal/deal.validation';

interface DealAmountFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  currencyFieldName: Path<TFieldValues>;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export function DealAmountField<TFieldValues extends FieldValues>({
  control,
  name,
  currencyFieldName,
  label = 'Amount',
  placeholder = '0.00',
  required = false,
}: DealAmountFieldProps<TFieldValues>) {
  const selectedCurrencyCode = useWatch({
    control,
    name: currencyFieldName,
  });

  const allCurrencies = [
    ...PINNED_CURRENCY_OPTIONS,
    ...REMAINING_CURRENCY_OPTIONS,
  ];
  const activeCurrency = allCurrencies.find(
    (c) => c.value === selectedCurrencyCode
  );
  const currencySymbol = activeCurrency?.symbol || '$';

  return (
    <Controller<TFieldValues>
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className="flex flex-col gap-2">
          <FieldLabel htmlFor={name} required={required}>
            {label}
          </FieldLabel>

          <div className="relative flex max-w-[320px] items-center">
            <span
              className="
                pointer-events-none absolute left-3 font-medium
                text-muted-foreground select-none
              "
            >
              {currencySymbol}
            </span>
            <Input
              {...field}
              id={name}
              type="number"
              placeholder={placeholder}
              className="
                h-9 rounded-l-none border pl-12 shadow-none
                focus-visible:ring-0
              "
              value={field.value === 0 ? '' : (field.value ?? '')}
              aria-invalid={!!fieldState.error}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  field.onChange(0);
                } else {
                  field.onChange(Number(val));
                }
              }}
            />
          </div>

          <FieldError />
        </Field>
      )}
    />
  );
}
