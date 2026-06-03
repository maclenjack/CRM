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
        rounded-lg border border-neutral-200 bg-white p-4 shadow-md
        ${className}
      `}
    >
      {title && (
        <h3 className="mb-2 text-lg font-semibold text-neutral-900">{title}</h3>
      )}
      {subtitle && <p className="mb-4 text-sm text-neutral-500">{subtitle}</p>}
      {children}
    </div>
  );
}
