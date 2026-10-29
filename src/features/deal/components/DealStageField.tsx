'use client';

import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
  type PathValue,
  type UseFormSetValue,
} from 'react-hook-form';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { PipelineStage } from '@/features/deal/pipeline-stage';
import { cn } from '@/features/shared/utils/cn';

interface DealStageFieldProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
> {
  control: Control<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  name: TName;
  label?: string;
}

export function DealStageField<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
>({
  control,
  setValue,
  name,
  label = 'Pipeline Stage',
}: DealStageFieldProps<TFieldValues, TName>) {
  return (
    <Controller<TFieldValues, TName>
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const pipelineStage = PipelineStage.fromValue(field.value);
        const pipelineStages = PipelineStage.values().sort(
          PipelineStage.sortfn
        );
        const currentStageIndex = pipelineStages.indexOf(pipelineStage);

        return (
          <Field className="flex w-full flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <FieldLabel required>{label}</FieldLabel>
              <span className="text-sm font-semibold text-primary">
                {pipelineStage.label || 'Select a stage...'}
              </span>
            </div>

            <div className="flex w-full items-center gap-1">
              {pipelineStages.map(({ value, label, sortingValue: index }) => {
                const isCurrent = value === field.value;
                const isPast = index < currentStageIndex;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setValue(name, value as PathValue<TFieldValues, TName>, {
                        shouldValidate: true,
                      });
                    }}
                    className={cn(
                      `
                        relative h-8 flex-1 bg-muted transition-all outline-none
                        hover:bg-muted-foreground/20
                        focus-visible:ring-1 focus-visible:ring-ring
                      `,
                      isPast &&
                        `
                          bg-primary/40 text-primary-foreground
                          hover:bg-primary/50
                        `,
                      isCurrent && 'bg-primary text-primary-foreground',
                      index === 0 && 'clip-chevron-first',
                      index === pipelineStages.length - 1 &&
                        'clip-chevron-last',
                      index > 0 &&
                        index < pipelineStages.length - 1 &&
                        'clip-chevron-mid'
                    )}
                    title={label}
                    aria-label={`Set stage to ${label}`}
                  />
                );
              })}
            </div>

            <FieldError errors={[fieldState.error]} />
          </Field>
        );
      }}
    />
  );
}
