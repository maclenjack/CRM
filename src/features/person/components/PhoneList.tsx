'use client';

import { capitalize } from '@/features/shared/utils/string';

interface PhoneListProps {
  phones: {
    id: string;
    phone: string;
    category: string;
  }[];
}

export function PhoneList({ phones }: PhoneListProps) {
  if (!phones || phones.length === 0) {
    return <span className="text-muted-foreground/50 select-none">—</span>;
  }

  return (
    <div className="flex flex-col gap-0.5">
      {phones.map(({ id, phone, category }) => (
        <a
          key={id}
          href={`tel:${phone}`}
          className="
            inline-flex w-fit items-center font-mono text-xs
            text-muted-foreground transition-colors
            hover:text-foreground hover:underline
          "
        >
          {phone}
          <span
            className="
              ml-1 rounded-sm bg-muted px-1 py-px font-sans text-[10px]
              font-normal text-muted-foreground/80
            "
          >
            {capitalize(category)}
          </span>
        </a>
      ))}
    </div>
  );
}
