'use client';

import { useMemo, useState } from 'react';

import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

import { TableColumn } from '@/types';

interface TableProps<T> {
  columns: Array<TableColumn<T>>;
  data: T[];
  className?: string;
  defaultSortBy?: keyof T;
  defaultSortDir?: 'asc' | 'desc';
}

export function Table<T>({
  columns,
  data,
  className = '',
  defaultSortBy,
  defaultSortDir,
}: TableProps<T>) {
  const [sortBy, setSortBy] = useState<keyof T | null>(defaultSortBy ?? null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(
    defaultSortDir ?? 'asc'
  );

  const sortedData = useMemo(() => {
    if (!sortBy) return data;
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sortBy, sortDir]);

  const handleHeaderClick = (col: TableColumn<T>) => {
    if (!col.sortable) return;
    if (sortBy === col.accessor && sortDir === 'desc') {
      setSortBy(null);
    } else if (sortBy === col.accessor) {
      setSortDir('desc');
    } else {
      setSortBy(col.accessor);
      setSortDir('asc');
    }
  };

  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="min-w-full border-collapse border border-neutral-300">
        <thead className="bg-neutral-200">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={clsx(
                  `
                    cursor-pointer border border-neutral-300 bg-neutral-200 px-4
                    py-2 text-left text-sm font-medium text-neutral-700
                    hover:bg-neutral-100
                  `,
                  col.className
                )}
                onClick={() => handleHeaderClick(col)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    <span className="inline-flex size-4 items-center justify-center">
                      {sortBy === col.accessor &&
                        (sortDir === 'asc' ? (
                          <ArrowUpIcon className="size-4" />
                        ) : (
                          <ArrowDownIcon className="size-4" />
                        ))}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {sortedData.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-neutral-100">
              {columns.map((col, cIdx) => (
                <td
                  key={cIdx}
                  className={clsx(
                    'border border-neutral-300 px-4 py-2 text-sm',
                    col.className
                  )}
                >
                  {col.formatter
                    ? col.formatter(row[col.accessor], row)
                    : String(row[col.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
