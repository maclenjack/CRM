import { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Card({ title, subtitle, children, className = '' }: CardProps) {
  return (
    <div
      className={`
        rounded-lg bg-surface p-4 shadow-md
        ${className}
      `}
    >
      {title && <h3 className="mb-2 text-lg font-semibold">{title}</h3>}
      {subtitle && <p className="mb-4 text-sm text-secondary">{subtitle}</p>}
      {children}
    </div>
  );
}
