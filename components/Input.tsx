import { clsx } from 'clsx';

interface InputProps {
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
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={clsx(
          `
            rounded-md border border-neutral-300 p-2
            focus:ring-2 focus:ring-primary-500 focus:outline-none
          `,
          className
        )}
      />
    </div>
  );
}
