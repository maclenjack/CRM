'use client';

import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, XIcon } from 'lucide-react';
import type z from 'zod';

import { AsyncCombobox } from '@/components/form/AsyncCombobox';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mapOrganizationToOption } from '@/features/organization/organization';
import { searchOrganizations } from '@/features/organization/organization.actions';
import { ContactCategory } from '@/features/person/contact-category';
import {
  PersonFormSchema,
  type PersonFormValues,
} from '@/features/person/person.validation';
import { localizedCountryCodes } from '@/features/shared/utils/country-codes';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (
    data: PersonFormValues
  ) => Promise<{ success: boolean; error?: string }>;
}

export function AddPersonModal({
  isOpen,
  onClose,
  onSubmitSuccess,
}: AddPersonModalProps) {
  const formMethods = useForm<z.input<typeof PersonFormSchema>>({
    resolver: zodResolver(PersonFormSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      organizationId: '',
      phones: [],
      emails: [],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = formMethods;

  const {
    fields: phoneFields,
    append: addPhone,
    remove: removePhone,
  } = useFieldArray({ control, name: 'phones' });

  const {
    fields: emailFields,
    append: addEmail,
    remove: removeEmail,
  } = useFieldArray({ control, name: 'emails' });

  const handleFormSubmit = async (data: z.input<typeof PersonFormSchema>) => {
    try {
      const response = await onSubmitSuccess(data);
      if (response?.success) {
        reset();
        onClose();
      }
    } catch (apiError) {
      console.error('AddPersonModal submission runtime fault:', apiError);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="
          max-w-lg gap-6 rounded-xl border border-border/80 bg-card p-6
          shadow-lg
        "
      >
        <DialogHeader>
          <DialogTitle
            className="
              text-xl font-bold tracking-tight text-foreground select-none
            "
          >
            Add Person
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="person-form-name"
                className="
                  text-[11px] font-bold tracking-wide text-muted-foreground/70
                  uppercase select-none
                "
              >
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="person-form-name"
                {...register('name')}
                placeholder="John Doe"
                autoComplete="name"
                disabled={isSubmitting}
                className={
                  errors.name
                    ? `
                      border-destructive bg-destructive/5
                      focus-visible:ring-destructive
                    `
                    : 'border-input shadow-xs'
                }
              />
              {errors.name && (
                <p
                  className="
                    mt-1 animate-in text-xs font-medium text-destructive
                    duration-150 fade-in-50
                  "
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <AsyncCombobox
                control={control}
                name="organizationId"
                label="Associated Organization"
                placeholder="Select an organization..."
                searchPlaceholder="Type company name..."
                fetchOptions={searchOrganizations}
                mapOption={mapOrganizationToOption}
              />
            </div>
          </div>

          <div className="space-y-5 border-t border-border/40 pt-4">
            <div className="space-y-3">
              <span
                className="
                  block text-[11px] font-bold tracking-wide
                  text-muted-foreground/70 uppercase select-none
                "
              >
                Phones
              </span>

              {phoneFields.length > 0 && (
                <div className="space-y-2.5">
                  {phoneFields.map((item, index) => {
                    const currentCountryCode =
                      formMethods.watch(`phones.${index}.countryCode`) || 'NZ';
                    const currentCountry = localizedCountryCodes.find(
                      (c) => c.code === currentCountryCode
                    );

                    return (
                      <div
                        key={item.id}
                        className="
                          animate-in space-y-1.5 duration-200 fade-in-50
                          slide-in-from-top-1
                        "
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`
                              flex min-w-0 flex-1 items-center rounded-md border
                              bg-background pl-3 ring-offset-background
                              transition-all duration-200
                              focus-within:ring-2 focus-within:ring-offset-2
                              ${
                                errors.phones?.[index]?.value
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
                            <Controller
                              name={`phones.${index}.countryCode` as const}
                              control={control}
                              defaultValue="NZ"
                              render={({ field }) => (
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={isSubmitting}
                                >
                                  <SelectTrigger
                                    aria-label="Select Country Code"
                                    className="
                                      h-9 w-19 shrink-0 border-0 bg-transparent
                                      p-0 pr-2 text-muted-foreground shadow-none
                                      focus:ring-0 focus:ring-offset-0
                                    "
                                  >
                                    <SelectValue>
                                      <span
                                        className="
                                          flex min-w-0 items-center
                                          justify-start gap-1 text-left text-sm
                                          text-foreground
                                        "
                                      >
                                        <span
                                          className="
                                            shrink-0 text-base select-none
                                          "
                                        >
                                          {currentCountry?.flag || '🇳🇿'}
                                        </span>
                                        <span className="shrink-0 font-medium">
                                          {currentCountry?.dialCode || '+64'}
                                        </span>
                                      </span>
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent className="max-h-64">
                                    {localizedCountryCodes.map((country) => (
                                      <SelectItem
                                        key={country.code}
                                        value={country.code}
                                      >
                                        <span className="mr-2 select-none">
                                          {country.flag}
                                        </span>
                                        <span className="font-medium">
                                          {country.dialCode}
                                        </span>
                                        <span
                                          className="
                                            ml-2 text-xs font-normal
                                            text-muted-foreground/60
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
                              className="
                                mx-1 shrink-0 text-muted-foreground/30
                                select-none
                              "
                              aria-hidden="true"
                            >
                              |
                            </span>

                            <Input
                              {...register(`phones.${index}.value` as const)}
                              type="tel"
                              placeholder="(555) 123-4567"
                              disabled={isSubmitting}
                              className="
                                h-9 min-w-0 flex-1 border-0 bg-transparent pr-3
                                pl-0 shadow-none
                                focus-visible:ring-0 focus-visible:ring-offset-0
                              "
                            />
                          </div>

                          <Controller
                            name={`phones.${index}.type` as const}
                            control={control}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={isSubmitting}
                              >
                                <SelectTrigger
                                  className="
                                    h-9 w-22.5 shrink-0 border-border/80
                                    shadow-xs
                                  "
                                >
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ContactCategory.values().map(
                                    (contactCategory) => (
                                      <SelectItem
                                        key={contactCategory.label}
                                        value={contactCategory.value}
                                      >
                                        {contactCategory.label}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            )}
                          />

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={isSubmitting}
                            className="
                              size-9 shrink-0 text-muted-foreground
                              transition-colors
                              hover:bg-destructive/10 hover:text-destructive
                            "
                            onClick={() => removePhone(index)}
                          >
                            <XIcon className="size-4" />
                          </Button>
                        </div>

                        {errors.phones?.[index]?.value && (
                          <p
                            className="
                              animate-in px-1 text-xs font-medium
                              text-destructive duration-150 fade-in-50
                            "
                          >
                            {errors.phones[index]?.value?.message}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                className="
                  h-8 gap-1.5 border-dashed border-border/80 px-3 text-xs
                  font-medium text-muted-foreground shadow-xs transition-all
                  hover:bg-muted/50 hover:text-foreground
                "
                onClick={() =>
                  addPhone({
                    value: '',
                    type: ContactCategory.WORK,
                    countryCode: 'NZ',
                  })
                }
              >
                <PlusIcon className="size-3.5" />
                Add Phone
              </Button>
            </div>

            <div className="space-y-3">
              <span
                className="
                  block text-[11px] font-bold tracking-wide
                  text-muted-foreground/70 uppercase select-none
                "
              >
                Emails
              </span>

              {emailFields.length > 0 && (
                <div className="space-y-2.5">
                  {emailFields.map((item, index) => (
                    <div
                      key={item.id}
                      className="
                        animate-in space-y-1.5 duration-200 fade-in-50
                        slide-in-from-top-1
                      "
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          {...register(`emails.${index}.value` as const)}
                          type="email"
                          placeholder="john@example.com"
                          disabled={isSubmitting}
                          className={
                            errors.emails?.[index]?.value
                              ? `
                                border-destructive bg-destructive/5
                                focus-visible:ring-destructive
                              `
                              : 'border-input shadow-xs'
                          }
                        />

                        <Controller
                          name={`emails.${index}.type` as const}
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isSubmitting}
                            >
                              <SelectTrigger
                                className="
                                  h-9 w-22.5 shrink-0 border-border/80 shadow-xs
                                "
                              >
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                {ContactCategory.values().map(
                                  (contactCategory) => (
                                    <SelectItem
                                      key={contactCategory.label}
                                      value={contactCategory.value}
                                    >
                                      {contactCategory.label}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={isSubmitting}
                          className="
                            size-9 shrink-0 text-muted-foreground
                            transition-colors
                            hover:bg-destructive/10 hover:text-destructive
                          "
                          onClick={() => removeEmail(index)}
                        >
                          <XIcon className="size-4" />
                        </Button>
                      </div>

                      {errors.emails?.[index]?.value && (
                        <p
                          className="
                            animate-in px-1 text-xs font-medium text-destructive
                            duration-150 fade-in-50
                          "
                        >
                          {errors.emails[index]?.value?.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                className="
                  h-8 gap-1.5 border-dashed border-border/80 px-3 text-xs
                  font-medium text-muted-foreground shadow-xs transition-all
                  hover:bg-muted/50 hover:text-foreground
                "
                onClick={() =>
                  addEmail({ value: '', type: ContactCategory.WORK })
                }
              >
                <PlusIcon className="size-3.5" />
                Add Email
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-border/40 pt-4 sm:gap-0">
            <Button
              variant="outline"
              type="button"
              size="sm"
              className="h-9 px-4 font-medium"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-9 px-4 font-medium shadow-xs"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
