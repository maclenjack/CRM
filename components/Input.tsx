import { clsx } from 'clsx';

export interface InputProps {
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  className = '',
}: InputProps) {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-secondary">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={clsx(
          `
            rounded-md border border-border p-2
            focus:ring-2 focus:ring-primary focus:outline-none
          `,
          className
        )}
      />
    </div>
  );
}
