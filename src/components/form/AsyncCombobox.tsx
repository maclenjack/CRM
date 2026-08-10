'use client';

import { useEffect, useState } from 'react';

import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';

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

interface AsyncComboboxProps<TData = any> {
  value: string | null | undefined;
  initialLabel?: string;
  onChange: (value: string | null) => void;
  error?: string;
  label?: string;
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  required?: boolean;
  disabled?: boolean;
  fetchOptions: (
    query: string
  ) => Promise<{ success: boolean; data?: TData[] }>;
  mapOption: (item: TData) => ComboboxOption;
}

export function AsyncCombobox<TData = any>({
  value,
  initialLabel = '',
  onChange,
  error,
  label,
  placeholder,
  searchPlaceholder = 'Search options...',
  emptyMessage = 'No results found.',
  required = false,
  disabled = false,
  fetchOptions,
  mapOption,
}: AsyncComboboxProps<TData>) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState<ComboboxOption[]>([]);

  const [selectedLabel, setSelectedLabel] = useState(initialLabel);

  useEffect(() => {
    if (!value) {
      setSelectedLabel('');
    }
  }, [value, initialLabel]);

  useEffect(() => {
    const currentQuery = searchQuery.trim();
    const loadOptions = async () => {
      try {
        const response = await fetchOptions(searchQuery);
        if (response.success && response.data) {
          setOptions(response.data.map(mapOption));
        } else {
          setOptions([]);
        }
      } catch (error) {
        console.error('Failed to execute operation:', error);
        setOptions([]);
      }
    };

    const isSearchState = currentQuery.length >= 2;
    const delayDebounceFn = setTimeout(
      () => loadOptions(),
      isSearchState ? 300 : 0
    );
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, fetchOptions, mapOption]);

  useEffect(() => {
    if (!open) setSearchQuery('');
  }, [open]);

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <FieldLabel
          className="font-semibold text-slate-700"
          required={required}
        >
          {label}
        </FieldLabel>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
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

            <div className="flex shrink-0 items-center gap-1">
              {value && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  className="
                    rounded-sm p-0.5 text-slate-400 transition-colors
                    hover:bg-slate-200 hover:text-slate-700
                  "
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(null);
                    setSelectedLabel('');
                  }}
                  title="Clear selection"
                >
                  <X className="size-3.5" />
                </span>
              )}

              <ChevronsUpDown className="size-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {searchQuery.trim().length < 2 && (
                <div
                  className="
                    border-b bg-slate-50 px-4 py-2 text-xs font-medium
                    text-slate-500 italic
                  "
                >
                  Showing recent items. Type {2 - searchQuery.trim().length}{' '}
                  more character to search...
                </div>
              )}

              {options.length === 0 && searchQuery.trim().length >= 2 && (
                <CommandEmpty className="py-6 text-center text-sm text-slate-500">
                  {emptyMessage || 'No results found.'}
                </CommandEmpty>
              )}
              {options.length > 0 && (
                <CommandGroup>
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
        <span className="text-xs font-medium text-red-600">{error}</span>
      )}
    </div>
  );
}
