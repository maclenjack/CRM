import { ReactNode } from 'react';

import clsx from 'clsx';

import { ButtonSize, ButtonVariant } from '@/types';

function getVariantClass(variant: ButtonVariant): string {
  switch (variant) {
    case ButtonVariant.PRIMARY:
      return 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500';
    case ButtonVariant.SECONDARY:
      return 'bg-neutral-600 text-white hover:bg-neutral-700 active:bg-neutral-800 focus:ring-neutral-500';
    case ButtonVariant.ACCENT:
      return 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 focus:ring-accent-500';
  }
}

function getSizeClass(size: ButtonSize): string {
  switch (size) {
    case ButtonSize.SMALL:
      return 'px-3 py-1.5 text-sm';
    case ButtonSize.MEDIUM:
      return 'px-4 py-2 text-base';
    case ButtonSize.LARGE:
      return 'px-5 py-3 text-lg';
  }
}

export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = ButtonVariant.PRIMARY,
  size = ButtonSize.MEDIUM,
  disabled = false,
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  return (
    <button
      type={type}
      className={clsx(
        base,
        getVariantClass(variant),
        getSizeClass(size),
        disabled ? 'cursor-not-allowed opacity-50' : ''
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
