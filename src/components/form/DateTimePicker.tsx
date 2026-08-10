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
  minDate?: Date;
}

export function DateTimePicker({
  date,
  setDate,
  disabled = false,
  placeholder = 'Pick date and time',
  minDate,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hourScrollAreaRef = React.useRef<HTMLDivElement>(null);
  const minuteScrollAreaRef = React.useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const isSameDay = (d1?: Date, d2?: Date) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    const newDate = new Date(selectedDate);
    if (date) {
      newDate.setHours(date.getHours());
      newDate.setMinutes(date.getMinutes());
    } else {
      newDate.setHours(12, 0);
    }

    if (minDate && newDate < minDate) {
      newDate.setHours(minDate.getHours());
      newDate.setMinutes(minDate.getMinutes());
    }

    setDate(newDate);
  };

  const handleTimeChange = (type: 'hour' | 'minute', value: number) => {
    const newDate = date ? new Date(date) : new Date();
    if (type === 'hour') {
      newDate.setHours(value);
      if (
        minDate &&
        isSameDay(newDate, minDate) &&
        newDate.getHours() === minDate.getHours() &&
        newDate.getMinutes() < minDate.getMinutes()
      ) {
        newDate.setMinutes(minDate.getMinutes());
      }
    } else {
      newDate.setMinutes(value);
    }
    setDate(newDate);
  };

  React.useEffect(() => {
    if (!isOpen || !date) return;

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
    }, 200);

    return () => clearTimeout(timer);
  }, [isOpen, date]);

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
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={
            minDate
              ? (calendarDate) => {
                  const min = new Date(minDate);
                  min.setHours(0, 0, 0, 0);
                  return calendarDate < min;
                }
              : undefined
          }
        />

        <Separator orientation="vertical" />

        <div className="flex">
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
                {hours.map((hour) => {
                  const isHourDisabled =
                    minDate &&
                    isSameDay(date, minDate) &&
                    hour < minDate.getHours();

                  return (
                    <Button
                      key={hour}
                      data-hour={hour}
                      size="sm"
                      disabled={isHourDisabled}
                      variant={
                        date && date.getHours() === hour ? 'default' : 'ghost'
                      }
                      className={cn(
                        `
                          h-8 w-full justify-center font-mono text-sm
                          tabular-nums
                        `,
                        isHourDisabled && 'cursor-not-allowed opacity-50'
                      )}
                      onClick={() => handleTimeChange('hour', hour)}
                    >
                      {hour.toString().padStart(2, '0')}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <Separator orientation="vertical" />

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
                  .map((minute) => {
                    const isMinuteDisabled =
                      minDate &&
                      isSameDay(date, minDate) &&
                      date?.getHours() === minDate.getHours() &&
                      minute < minDate.getMinutes();

                    return (
                      <Button
                        key={minute}
                        data-minute={minute}
                        size="sm"
                        disabled={isMinuteDisabled}
                        variant={
                          date && date.getMinutes() === minute
                            ? 'default'
                            : 'ghost'
                        }
                        className={cn(
                          `
                            h-8 w-full justify-center font-mono text-sm
                            tabular-nums
                          `,
                          isMinuteDisabled && 'cursor-not-allowed opacity-50'
                        )}
                        onClick={() => handleTimeChange('minute', minute)}
                      >
                        {minute.toString().padStart(2, '0')}
                      </Button>
                    );
                  })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
