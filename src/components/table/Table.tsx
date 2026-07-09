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

import {
  Table as ShadTable,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
    getSortedRowModel: getSortedRowModel(), // Handles engine-level sorting safely
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

                return (
                  <TableHead
                    key={header.id}
                    className={clsx(
                      isSortable &&
                        `
                          cursor-pointer transition-colors select-none
                          hover:bg-muted/50
                        `
                    )}
                    onClick={
                      isSortable
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                      {isSortable && (
                        <span className="text-muted-foreground/70">
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
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </ShadTable>
    </div>
  );
}
