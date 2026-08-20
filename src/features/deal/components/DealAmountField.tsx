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
} from '@/features/shared/utils/currency';

const ALL_CURRENCIES = [
  ...PINNED_CURRENCY_OPTIONS,
  ...REMAINING_CURRENCY_OPTIONS,
];

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

  const activeCurrency = ALL_CURRENCIES.find(
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
              id={name}
              type="text"
              inputMode="decimal"
              placeholder={placeholder}
              className="
                h-9 border pl-9 shadow-none
                focus-visible:ring-1
              "
              value={field.value ?? ''}
              aria-invalid={!!fieldState.error}
              onChange={(e) => {
                const val = e.target.value;

                if (val === '') {
                  field.onChange('');
                  return;
                }

                // Allow digits, 1 decimal point, and up to 2 decimal places while typing
                if (/^\d*\.?\d{0,2}$/.test(val)) {
                  field.onChange(val);
                }
              }}
              onBlur={() => {
                field.onBlur();

                // Format to 2 decimal places when leaving the field
                if (field.value && !isNaN(Number(field.value))) {
                  const formatted = Number(field.value).toFixed(2);
                  field.onChange(formatted);
                } else if (field.value === '') {
                  // Ensure empty string maps to '0' for Prisma Decimal
                  field.onChange('0');
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
