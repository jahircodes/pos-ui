/**
 * Simple data table with alternating rows for admin lists.
 */
import type { ReactNode } from 'react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  getRowKey: (row: T, index: number) => string;
}

/** Generic table with header row and zebra striping. */
export function Table<T extends object>({
  columns,
  data,
  emptyMessage = 'No data',
  getRowKey,
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-12 text-center text-base text-gray-500 shadow-sm sm:rounded-xl sm:py-16 sm:text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md sm:rounded-xl sm:shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  scope="col"
                  className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-700 sm:px-4 sm:py-3 sm:text-sm ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, rowIndex) => (
              <tr key={getRowKey(row, rowIndex)} className="even:bg-gray-50/80">
                {columns.map((col) => {
                  const cell =
                    col.render?.(row) ??
                    (row[col.key as keyof T] != null ? String(row[col.key as keyof T]) : '—');
                  return (
                    <td
                      key={String(col.key)}
                      className={`whitespace-nowrap px-3 py-2.5 text-sm text-gray-800 sm:px-4 sm:py-3 ${col.className ?? ''}`}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
