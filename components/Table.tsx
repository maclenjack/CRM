import { clsx } from 'clsx';

export interface TableProps<T> {
  columns: Array<{ header: string; accessor: keyof T; className?: string }>;
  data: T[];
  className?: string;
}

export function Table<T>({ columns, data, className = '' }: TableProps<T>) {
  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-background">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={clsx(
                  'px-4 py-2 text-left text-sm font-medium text-secondary',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-background/10">
              {columns.map((col, cIdx) => (
                <td
                  key={cIdx}
                  className={clsx('px-4 py-2 text-sm', col.className)}
                >
                  {String(row[col.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
