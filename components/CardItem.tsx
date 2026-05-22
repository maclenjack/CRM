export interface CardItemProps {
  title: string;
  content: string;
  className?: string;
}

export function CardItem({ title, content, className = '' }: CardItemProps) {
  return (
    <div
      className={`
        rounded-md bg-surface p-4 shadow-sm
        ${className}
      `}
    >
      <h4 className="mb-2 text-base font-semibold">{title}</h4>
      <p className="text-sm text-secondary">{content}</p>
    </div>
  );
}
