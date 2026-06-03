import { ReactNode } from 'react';

import clsx from 'clsx';

import { ButtonSize, ButtonVariant } from '@/models';

interface ButtonProps {
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
        variant.className,
        size.className,
        disabled ? 'cursor-not-allowed opacity-50' : ''
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
