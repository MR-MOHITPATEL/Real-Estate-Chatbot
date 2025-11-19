import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import type { TableRow } from "../types/chat";
import { Button } from "./ui/button";

interface DataTableProps {
  rows: TableRow[];
}

export const DataTable = ({ rows }: DataTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const data = useMemo(() => rows, [rows]);

  const columns = useMemo<ColumnDef<TableRow>[]>(
    () => [
      {
        accessorKey: "final_location",
        header: "Location",
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">{row.original.final_location}</span>
        ),
      },
      {
        accessorKey: "year",
        header: "Year",
      },
      {
        accessorKey: "metric_value",
        header: "Metric Value",
        cell: ({ row }) =>
          row.original.metric_value !== null
            ? row.original.metric_value.toLocaleString()
            : "—",
      },
      {
        accessorKey: "total_units",
        header: "Total Units",
        cell: ({ row }) =>
          row.original.total_units !== undefined
            ? row.original.total_units?.toLocaleString() ?? "—"
            : "—",
      },
      {
        accessorKey: "total_sales",
        header: "Total Sales",
        cell: ({ row }) =>
          row.original.total_sales !== undefined
            ? row.original.total_sales?.toLocaleString() ?? "—"
            : "—",
      },
    ],
    []
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
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-muted-foreground">
        No data available for the current selection.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase text-muted-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="cursor-pointer px-4 py-3 font-semibold tracking-wide"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: " ↑",
                      desc: " ↓",
                    }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-white/5 bg-white/5 text-foreground">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-white/10">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <div>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};


