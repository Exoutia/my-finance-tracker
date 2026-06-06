import { useQuery } from "@tanstack/react-query";

import {
  type EntityRegistryRead,
  getAllTransactionsAtOnce,
  type TagRead,
  type TransactionWithNameRead,
} from "@/src/service.ts";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { TableSkeleton } from "@/components/sekletons/skeleton-table.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import React from "react";
import { Badge } from "@/components/ui/badge.tsx";

// Localized Indian Rupee Formatter Engine (Switch to 'en-US' / 'USD' if needed)
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const columns: ColumnDef<TransactionWithNameRead>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()
          ? true
          : table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : false}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5 cursor-pointer"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5 cursor-pointer"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "from_entity",
    header: () => (
      <span className="font-heading text-xs uppercase tracking-wider">
        From
      </span>
    ),
    cell: ({ row }) => (
      <div className="capitalize font-base text-sm text-foreground/90">
        {(row.getValue("from_entity") as EntityRegistryRead).name}
      </div>
    ),
  },
  {
    accessorKey: "to_entity",
    header: () => (
      <span className="font-heading text-xs uppercase tracking-wider">
        To
      </span>
    ),
    cell: ({ row }) => (
      <div className="capitalize font-base text-sm text-foreground/90">
        {(row.getValue("to_entity") as EntityRegistryRead).name}
      </div>
    ),
  },

  {
    accessorKey: "amount",
    // Right-aligning ledger header block
    header: () => (
      <div className="text-right font-heading text-xs uppercase tracking-wider">
        Amount
      </div>
    ),
    cell: ({ row }) => {
      const rawAmountStr: string = row.getValue("amount");
      // Clean processing of trailing database decimal precision strings
      const parsedAmount = parseFloat(rawAmountStr || "0");

      return (
        <div className="text-right font-mono text-sm font-medium">
          {currencyFormatter.format(parsedAmount)}
        </div>
      );
    },
  },
  {
    accessorKey: "transaction_datetime",
    header: () => (
      <div className="text-right font-heading text-xs uppercase tracking-wider">
        Date
      </div>
    ),
    cell: ({ row }) => {
      const rawDate = row.getValue("transaction_datetime");
      return (
        <div className="text-right font-mono text-sm font-medium">
          {Temporal.PlainDate.from(rawDate).toString()}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: () => (
      <div className="text-right font-heading text-xs uppercase tracking-wider">
        Description
      </div>
    ),
    cell: ({ row }) => {
      const rawData = row.getValue("description") as string || "";

      return (
        <div className="text-right font-mono text-sm font-medium">
          {rawData}
        </div>
      );
    },
  },
  {
    accessorKey: "tags",
    header: () => (
      <div className="text-right font-heading text-xs uppercase tracking-wider">
        Tags
      </div>
    ),
    cell: ({ row }) => {
      const tags = row.getValue("tags") as TagRead[] || ["N/A"];

      return (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <Badge
              variant="colorful"
              tagName={tag.name}
              key={index}
              className="text-[11px] px-2 py-0.5"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      );
    },
  },
];

export default function TransactionTable() {
  const query = useQuery({
    queryKey: ["transactions"],
    queryFn: getAllTransactionsAtOnce,
  });

  // Normalize your data wrapper if it comes down packed inside nested key strings
  const serverData = query.data || [];
  const [columnVisibility, setColumnVisibility] = React.useState<
    VisibilityState
  >({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const table = useReactTable<TransactionWithNameRead>({
    data: serverData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  return (
    <div className="w-full flex flex-col font-base text-foreground">
      {/* 2. Structured Scrollable Data Table Container */}
      <div className="w-full overflow-x-auto border border-border rounded-base bg-secondary-background my-4 shadow-shadow">
        <Table className="w-full border-collapse">
          <TableHeader className="bg-background border-b border-border">
            {query.isLoading
              ? <TableSkeleton columns={columns.length} rows={1} />
              : (
                table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-b border-border/40"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="h-10 text-foreground font-heading align-middle px-4"
                      >
                        {header.isPlaceholder ? null : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))
              )}
          </TableHeader>

          <TableBody>
            {query.isLoading
              ? (
                <TableSkeleton
                  columns={columns.length}
                  rows={pagination.pageSize}
                />
              )
              : table.getRowModel().rows?.length
              ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b border-border/40 hover:bg-main/5 transition-colors data-[state=selected]:bg-main/20 data-[state=selected]:hover:bg-main/20"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="p-4 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )
              : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-sm opacity-60 font-base"
                  >
                    No entities found matching your filter constraints.
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </div>

      {/* 3. Footer Control Navigation Strip */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-3 px-1 border-t border-border/20 text-sm">
        {/* Row Counters */}
        <div className="text-xs opacity-70 order-2 md:order-1">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>

        {/* Dynamic Pagination Action Blocks */}
        <div className="flex flex-wrap items-center justify-center gap-4 order-1 md:order-2 w-full md:w-auto">
          {/* Sizing Layout */}
          <div className="flex items-center gap-2 text-xs">
            <span className="opacity-80">Rows per page</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="h-8 rounded-base border border-border bg-background px-2 py-1 outline-none shadow-none focus-visible:ring-1 focus-visible:ring-main cursor-pointer"
            >
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:block h-4 w-px bg-border/60" />

          {/* Navigational Step System */}
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="neutral"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 text-xs cursor-pointer"
            >
              {"<<"}
            </Button>
            <Button
              size="icon"
              variant="neutral"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 text-xs cursor-pointer"
            >
              {"<"}
            </Button>

            <div className="flex items-center gap-1.5 mx-1 text-xs">
              <Input
                type="number"
                max={table.getPageCount()}
                value={table.getState().pagination.pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  table.setPageIndex(page);
                }}
                className="h-8 w-12 text-center p-1 border-border bg-background shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="opacity-60">/ {table.getPageCount() || 1}</span>
            </div>

            <Button
              size="icon"
              variant="neutral"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 text-xs cursor-pointer"
            >
              {">"}
            </Button>
            <Button
              size="icon"
              variant="neutral"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 text-xs cursor-pointer"
            >
              {">>"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
