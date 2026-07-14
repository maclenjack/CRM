'use client';

import { useEffect, useState } from 'react';
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from 'react-hook-form';

import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { FieldLabel } from '@/components/ui/field';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/features/shared/utils/cn';

interface ComboboxOption {
  value: string;
  label: string;
  description?: string | null;
}

interface AsyncComboboxProps<TFieldValues extends FieldValues, TData = any> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  required?: boolean;
  fetchOptions: (
    query: string
  ) => Promise<{ success: boolean; data?: TData[] }>;
  mapOption: (item: TData) => {
    value: string;
    label: string;
    description?: string | null;
  };
}

export function AsyncCombobox<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  searchPlaceholder = 'Search options...',
  emptyMessage = 'No results found.',
  required = false,
  fetchOptions,
  mapOption,
}: AsyncComboboxProps<TFieldValues>) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');

  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control });

  useEffect(() => {
    const currentQuery = searchQuery.trim();

    const loadOptions = async () => {
      if (currentQuery.length >= 2) {
        setIsLoading(true);
      }

      try {
        const response = await fetchOptions(searchQuery);
        if (response.success && response.data) {
          setOptions(response.data.map(mapOption));
        } else {
          setOptions([]);
        }
      } catch (err) {
        console.error(err);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const isSearchState = currentQuery.length >= 2;

    const delayDebounceFn = setTimeout(
      () => {
        loadOptions();
      },
      isSearchState ? 300 : 0
    );

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, fetchOptions]);

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  return (
    <div className="flex w-full flex-col gap-1.5">
      <FieldLabel className="font-semibold text-slate-700" required={required}>
        {label}
      </FieldLabel>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'h-auto w-full justify-between py-2 text-left font-normal',
              !value && 'text-slate-400',
              error &&
                `
                  border-red-500
                  focus-visible:ring-red-500
                `
            )}
          >
            <span className="truncate">
              {value && selectedLabel ? selectedLabel : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="
            w-(--radix-popover-trigger-width) rounded-md border bg-white p-0
            shadow-md
          "
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && (
                <div
                  className="
                    flex items-center justify-center p-4 text-sm text-slate-500
                  "
                >
                  <Loader2 className="mr-2 size-4 animate-spin text-slate-400" />
                  Searching...
                </div>
              )}

              {!isLoading && searchQuery.trim().length === 1 && (
                <div
                  className="
                    border-b bg-slate-50 px-4 py-2 text-xs font-medium
                    text-slate-500 italic
                  "
                >
                  Showing recent items. Type 1 more character to search...
                </div>
              )}

              {!isLoading &&
                options.length === 0 &&
                searchQuery.trim().length >= 2 && (
                  <CommandEmpty className="py-6 text-center text-sm text-slate-500">
                    {emptyMessage || 'No results found.'}
                  </CommandEmpty>
                )}

              {!isLoading && options.length > 0 && (
                <CommandGroup
                  heading={
                    searchQuery.trim().length < 2
                      ? 'Recent Items'
                      : 'Search Results'
                  }
                >
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        const isSelected = option.value === value;
                        onChange(isSelected ? null : option.value);
                        setSelectedLabel(isSelected ? '' : option.label);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 size-4',
                          option.value === value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          {option.label}
                        </span>
                        {option.description && (
                          <span className="text-xs text-slate-400">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && (
        <span className="text-xs font-medium text-red-600">
          {error.message}
        </span>
      )}
    </div>
  );
}
