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
import { cn } from '@/features/shared/utils/cn';

const STAGE_LABELS: Record<string, string> = {
  QUALIFIED: 'Qualified',
  CONTACT_MADE: 'Contact Made',
  DEMO_SCHEDULED: 'Demo Scheduled',
  PROPOSAL_MADE: 'Proposal Made',
  NEGOTIATIONS_STARTED: 'Negotiations Started',
  WON: 'Won',
};

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
  const stages = Object.keys(STAGE_LABELS);

  return (
    <Controller<TFieldValues, TName>
      control={control}
      name={name}
      render={({ field }) => {
        const currentStageIndex = stages.indexOf(field.value || '');

        return (
          <Field className="flex w-full flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <FieldLabel>{label}</FieldLabel>
              <span className="text-sm font-semibold text-primary">
                {STAGE_LABELS[field.value] || 'Select a stage...'}
              </span>
            </div>

            <div className="flex w-full items-center gap-1">
              {stages.map((stageKey, index) => {
                const isCurrent = stageKey === field.value;
                const isPast = index < currentStageIndex;

                return (
                  <button
                    key={stageKey}
                    type="button"
                    onClick={() => {
                      setValue(
                        name,
                        stageKey as PathValue<TFieldValues, TName>,
                        { shouldValidate: true }
                      );
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
                      index === stages.length - 1 && 'clip-chevron-last',
                      index > 0 &&
                        index < stages.length - 1 &&
                        'clip-chevron-mid'
                    )}
                    title={STAGE_LABELS[stageKey]}
                    aria-label={`Set stage to ${STAGE_LABELS[stageKey]}`}
                  />
                );
              })}
            </div>

            <FieldError />
          </Field>
        );
      }}
    />
  );
}
