import clsx from 'clsx';

export function InfoBanner({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        `
          mb-4 rounded-md border-l-4 border-success bg-success-light p-3 text-sm
          text-success-dark
        `,
        className
      )}
    >
      {children}
    </div>
  );
}
