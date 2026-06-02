'use client';
import { usePathname } from 'next/dist/client/components/navigation';
import Link from 'next/link';
import { ReactNode } from 'react';

import { clsx } from 'clsx';

export interface NavLinkProps {
  href: string;
  children: ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname.includes(href);
  return (
    <Link
      href={href}
      className={clsx(
        `
          flex items-center text-sm font-medium
          hover:text-primary-600 hover:underline
        `,
        {
          'cursor-default text-primary-600 hover:no-underline!': active,
          'text-neutral-400': !active,
        }
      )}
    >
      {children}
    </Link>
  );
}
