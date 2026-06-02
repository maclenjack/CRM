export interface CardItemProps {
  title: string;
  content: string;
  className?: string;
}

export function CardItem({ title, content, className = '' }: CardItemProps) {
  return (
    <div
      className={`
        rounded-md border border-neutral-200 bg-white p-4 shadow-sm
        ${className}
      `}
    >
      <h4 className="mb-2 text-base font-semibold text-neutral-900">{title}</h4>
      <p className="text-sm text-neutral-600">{content}</p>
    </div>
  );
}
