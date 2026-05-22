import { ReactNode } from 'react';

import { clsx } from 'clsx';

export interface NavLinkProps {
  href: string;
  children: ReactNode;
  active?: boolean;
}

export function NavLink({ href, children, active = false }: NavLinkProps) {
  return (
    <a
      href={href}
      className={clsx('text-sm font-medium', {
        'text-primary': active,
        'text-secondary': !active,
      })}
    >
      {children}
    </a>
  );
}
