'use client';

import { capitalize } from '@/features/shared/utils/string';

interface EmailListProps {
  emails: {
    id: string;
    email: string;
    category: string;
  }[];
}

export function EmailList({ emails }: EmailListProps) {
  if (!emails || emails.length === 0) {
    return <span className="text-muted-foreground/50 select-none">—</span>;
  }

  return (
    <div className="flex flex-col gap-0.5">
      {emails.map(({ id, email, category }) => (
        <a
          key={id}
          href={`mailto:${email}`}
          className="
            inline-flex w-fit items-center font-mono text-xs
            text-muted-foreground transition-colors
            hover:text-foreground hover:underline
          "
        >
          {email}
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
