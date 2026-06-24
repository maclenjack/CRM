'use client';

import { usePathname } from 'next/dist/client/components/navigation';
import Link from 'next/link';
import { ReactNode } from 'react';

import { clsx } from 'clsx';

import { SidebarMenuButton } from '@/components/ui/sidebar';

export interface SidebarLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

export function SidebarLink({
  href,
  className = '',
  children,
}: SidebarLinkProps) {
  const pathname = usePathname();
  const active = pathname.includes(href);
  const isSubLink = href.split('/').filter(Boolean).length > 1;
  const hasActiveSubLink = active && pathname !== href;

  return (
    <SidebarMenuButton asChild>
      <Link
        href={href}
        className={clsx(
          `
            flex items-center text-sm font-medium
            hover:underline
          `,
          {
            'bg-secondary/10 text-secondary':
              active && !hasActiveSubLink && !isSubLink,
            'bg-secondary/10': hasActiveSubLink,
            'text-accent-foreground hover:no-underline!': active && !isSubLink,
            'text-secondary': active && isSubLink,
            'text-muted-foreground': !active && isSubLink,
          },
          { [className]: className }
        )}
      >
        {children}
      </Link>
    </SidebarMenuButton>
  );
}
