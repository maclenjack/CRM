'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Check, Loader2, Pencil, X } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/features/shared/utils/cn';

export interface CellEditorProps<T> {
  label: string;
  value: T;
  schema: z.ZodType<T>;
  onSave: (newValue: T) => Promise<unknown>;
  placeholder?: string;
  className?: string;
  displayValue?: React.ReactNode;
  renderInput?: (props: {
    value: T;
    onChange: (val: T | unknown) => void;
    onBlur: () => void;
    disabled: boolean;
  }) => React.ReactElement;
}

interface InternalFormState {
  value: unknown;
}

export function CellEditor<T>({
  label,
  value: initialValue,
  schema,
  onSave,
  placeholder = 'Click to edit...',
  className,
  displayValue,
  renderInput,
}: CellEditorProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<InternalFormState>({
    defaultValues: { value: initialValue },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ value: initialValue });
      clearErrors();
    }
  }, [isOpen, initialValue, reset, clearErrors]);

  const onSubmit = (data: InternalFormState) => {
    const validation = schema.safeParse(data.value);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid input';
      setError('value', { type: 'manual', message: firstError });
      return;
    }

    clearErrors();

    startTransition(async () => {
      try {
        await onSave(validation.data);
        setIsOpen(false);
      } catch (err) {
        setError('value', {
          type: 'manual',
          message: err instanceof Error ? err.message : 'Failed to update',
        });
      }
    });
  };

  const handleCancel = () => {
    reset({ value: initialValue });
    clearErrors();
    setIsOpen(false);
  };

  const getCellDisplay = () => {
    if (displayValue !== undefined) return displayValue;
    if (
      initialValue === null ||
      initialValue === undefined ||
      initialValue === ''
    ) {
      return <span className="text-slate-400 italic">{placeholder}</span>;
    }
    return String(initialValue);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className={cn(
            `
              group flex h-8 w-full cursor-pointer items-center gap-2 rounded-md
              px-2 py-1 text-sm transition-colors
              hover:bg-slate-100/80
              focus-visible:ring-1 focus-visible:ring-slate-400
              focus-visible:outline-none
            `,
            className
          )}
        >
          <span className="min-w-0 flex-1 text-left">{getCellDisplay()}</span>

          <Pencil
            className="
              size-3.5 shrink-0 text-slate-400 opacity-0 transition-opacity
              group-hover:opacity-70
            "
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="
          w-80 rounded-xl border border-slate-100 bg-white p-4 shadow-xl
        "
        side="bottom"
        align="start"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <FieldLabel className="text-xs font-semibold text-slate-700">
              Edit {label}
            </FieldLabel>

            <Controller
              control={control}
              name="value"
              render={({ field }) =>
                renderInput ? (
                  renderInput({
                    value: field.value as T,
                    onChange: field.onChange,
                    onBlur: field.onBlur,
                    disabled: isPending,
                  })
                ) : (
                  <Input
                    value={
                      field.value === null || field.value === undefined
                        ? ''
                        : String(field.value)
                    }
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    autoFocus
                    disabled={isPending}
                    className="h-9 text-sm"
                  />
                )
              }
            />

            {errors.value && (
              <span className="text-xs font-medium text-red-600">
                {errors.value.message as string}
              </span>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isPending}
            >
              <X className="mr-1 size-3.5" />
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-1 size-3.5 animate-spin" />
              ) : (
                <Check className="mr-1 size-3.5" />
              )}
              Save
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
