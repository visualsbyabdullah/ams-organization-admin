import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  headClassName?: string;
};

type DataTableProps<T> = {
  rows: readonly T[];
  columns: readonly DataTableColumn<T>[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyState: ReactNode;
  rowClassName?: string;
};

export function DataTable<T>({
  rows,
  columns,
  getRowKey,
  onRowClick,
  emptyState,
  rowClassName,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-canvas">
          {columns.map((column) => (
            <TableHead key={column.id} className={column.headClassName}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={getRowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(
              onRowClick && "cursor-pointer transition hover:bg-canvas",
              rowClassName,
            )}
          >
            {columns.map((column) => (
              <TableCell key={column.id} className={column.className}>
                {column.cell(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
