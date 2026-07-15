'use client';

import { useState } from 'react';

import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { clsx } from 'clsx';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

import { EmptyState } from '@/components/EmptyState';
import {
  Table as ShadTable,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'center' | 'right';
  }
}

interface TableProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  className?: string;
  caption?: string;
  defaultSortBy?: string;
  defaultSortDir?: 'asc' | 'desc';
}

export function Table<T>({
  columns,
  data,
  className = '',
  caption,
  defaultSortBy,
  defaultSortDir,
}: TableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(
    defaultSortBy
      ? [{ id: defaultSortBy, desc: defaultSortDir === 'desc' }]
      : []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className={clsx('overflow-x-auto', className)}>
      <ShadTable>
        <TableCaption>{caption}</TableCaption>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isSortable = header.column.getCanSort();
                const isSorted = header.column.getIsSorted();

                const align = header.column.columnDef.meta?.align || 'left';

                return (
                  <TableHead
                    key={header.id}
                    className={clsx(
                      isSortable &&
                        `
                          cursor-pointer transition-colors select-none
                          hover:bg-muted/50
                        `,
                      align === 'center' && 'text-center',
                      align === 'right' && 'text-right'
                    )}
                    onClick={
                      isSortable
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div
                      className={clsx(
                        'flex items-center gap-2',
                        align === 'center' && 'justify-center',
                        align === 'right' && 'justify-end'
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                      {isSortable && (
                        <span className="shrink-0 text-muted-foreground/70">
                          {isSorted === 'asc' && (
                            <ArrowUpIcon className="size-3.5 stroke-[2.5]" />
                          )}
                          {isSorted === 'desc' && (
                            <ArrowDownIcon className="size-3.5 stroke-[2.5]" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const align = cell.column.columnDef.meta?.align || 'left';
                  return (
                    <TableCell
                      key={cell.id}
                      className={clsx(
                        align === 'center' && 'text-center',
                        align === 'right' && 'text-right'
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <EmptyState />
          )}
        </TableBody>
      </ShadTable>
    </div>
  );
}
