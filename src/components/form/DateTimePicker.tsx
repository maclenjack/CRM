'use client';

import * as React from 'react';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/features/shared/utils/cn';

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
}

// TODO clean up the smooth scroll

export function DateTimePicker({
  date,
  setDate,
  disabled = false,
  placeholder = 'Pick date and time',
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hourScrollAreaRef = React.useRef<HTMLDivElement>(null);
  const minuteScrollAreaRef = React.useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    const newDate = new Date(selectedDate);
    if (date) {
      newDate.setHours(date.getHours());
      newDate.setMinutes(date.getMinutes());
    } else {
      newDate.setHours(12, 0); // Default to noon if no time exists yet
    }
    setDate(newDate);
  };

  const handleTimeChange = (type: 'hour' | 'minute', value: number) => {
    const newDate = date ? new Date(date) : new Date();
    if (type === 'hour') {
      newDate.setHours(value);
    } else {
      newDate.setMinutes(value);
    }
    setDate(newDate);
  };

  // Auto-scroll to selected time when popover opens
  React.useEffect(() => {
    if (!isOpen || !date) return;

    // Wait for the popover open animation to finish before smooth-scrolling,
    // otherwise the scroll fights the animation and looks abrupt.
    const timer = setTimeout(() => {
      const smoothScrollTo = (
        areaRef: React.RefObject<HTMLDivElement | null>,
        selector: string
      ) => {
        const viewport = areaRef.current?.querySelector<HTMLElement>(
          '[data-slot="scroll-area-viewport"]'
        );
        const item = areaRef.current?.querySelector<HTMLElement>(selector);
        if (!viewport || !item) return;

        const offset =
          item.offsetTop - viewport.clientHeight / 2 + item.clientHeight / 2;
        viewport.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
      };

      smoothScrollTo(hourScrollAreaRef, `[data-hour="${date.getHours()}"]`);
      smoothScrollTo(
        minuteScrollAreaRef,
        `[data-minute="${date.getMinutes()}"]`
      );
    }, 200); // 200ms lets the popover fade-in finish before scrolling

    return () => clearTimeout(timer);
  }, [isOpen]); // ← intentionally omit `date` so it only fires on open

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-10 w-full justify-start px-3 py-2 text-left font-normal',
            `
              border-input bg-background
              hover:bg-accent hover:text-accent-foreground
            `,
            `
              focus-visible:ring-2 focus-visible:ring-ring
              focus-visible:ring-offset-2 focus-visible:outline-none
            `,
            !date && 'text-muted-foreground',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0 text-muted-foreground" />
          {date ? format(date, 'PPP p') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="flex w-auto flex-row p-0 shadow-lg"
        align="start"
      >
        {/* Date Selector */}
        <Calendar mode="single" selected={date} onSelect={handleDateSelect} />

        <Separator orientation="vertical" />

        {/* Time Selector Columns */}
        <div className="flex">
          {/* Hours Column */}
          <div className="flex w-18 flex-col">
            <div className="border-b border-border px-2 py-2.5">
              <p
                className="
                  text-center text-xs font-semibold tracking-wide
                  text-muted-foreground uppercase
                "
              >
                Hour
              </p>
            </div>
            <ScrollArea ref={hourScrollAreaRef} className="h-68">
              <div className="flex flex-col gap-0.5 p-1.5">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    data-hour={hour}
                    size="sm"
                    variant={
                      date && date.getHours() === hour ? 'default' : 'ghost'
                    }
                    className="
                      h-8 w-full justify-center font-mono text-sm tabular-nums
                    "
                    onClick={() => handleTimeChange('hour', hour)}
                  >
                    {hour.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator orientation="vertical" />

          {/* Minutes Column */}
          <div className="flex w-18 flex-col">
            <div className="border-b border-border px-2 py-2.5">
              <p
                className="
                  text-center text-xs font-semibold tracking-wide
                  text-muted-foreground uppercase
                "
              >
                Min
              </p>
            </div>
            <ScrollArea ref={minuteScrollAreaRef} className="h-68">
              <div className="flex flex-col gap-0.5 p-1.5">
                {minutes
                  .filter((m) => m % 5 === 0)
                  .map((minute) => (
                    <Button
                      key={minute}
                      data-minute={minute}
                      size="sm"
                      variant={
                        date && date.getMinutes() === minute
                          ? 'default'
                          : 'ghost'
                      }
                      className="
                        h-8 w-full justify-center font-mono text-sm tabular-nums
                      "
                      onClick={() => handleTimeChange('minute', minute)}
                    >
                      {minute.toString().padStart(2, '0')}
                    </Button>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
