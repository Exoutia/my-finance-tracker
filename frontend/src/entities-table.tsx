import { useQuery } from "@tanstack/react-query";
import { type Entity, getAllEntitiesAtOnce } from "@/src/service.ts";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { CopyButton } from "@/components/copybutton.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { TableSkeleton } from "@/components/sekletons/skeleton-table.tsx";
import { Input } from "@/components/ui/input.tsx";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/Button.tsx";

const columns: ColumnDef<Entity>[] = [
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
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "entity_type",
    header: "Entity Type",
    cell: ({ row }) => (
      <div className="capitalize">
        {(row.getValue("entity_type") as string || "").split("_").join(" ")}
      </div>
    ),
  },
  {
    accessorKey: "uuid",
    header: "UUID",
    cell: ({ row }) => {
      const uuid: string = row.getValue("uuid") || "not found";
      return (
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted p-1 rounded">
            {uuid.slice(0, 8)}...
          </code>
          <CopyButton value={uuid} />
        </div>
      );
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const val = row.getValue("tags");
      const tags = Array.isArray(val) && val.length >= 1 ? val : ["N/A"];

      return (
        <div className="flex gap-2">
          {tags.map((tag, index) => (
            <Badge variant="colorful" tagName={tag} key={index}>
              {tag}
            </Badge>
          ))}
        </div>
      );
    },
  },
];

export function EntitiesTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] = React.useState<
    VisibilityState
  >({});
  const [rowSelection, setRowSelection] = React.useState({});

  // 1. Local Pagination State Definition
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  // 2. React Query Tracking Pagination State Updates
  const query = useQuery({
    queryKey: ["entities"],
    queryFn: getAllEntitiesAtOnce,
  });

  // 3. Fallback safely to empty arrays and zero totals on initial load
  const serverData = query.data || [];

  const table = useReactTable({
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
    <>
      <div className="my-5 mx-5 min-w-180">
        <div className="flex items-center gap-2 pb-4">
          {query.isLoading
            ? (
              <div className="bg-secondary-background w-1/2">
                <Skeleton className="h-10 bg-overlay w-full" />
              </div>
            )
            : (
              <Input
                placeholder="Filter Account..."
                value={(table.getColumn("name")?.getFilterValue() as string) ??
                  ""}
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
            )}
          {query.isLoading
            ? (
              <div className="bg-secondary-background w-1/2">
                <Skeleton className="h-10 bg-overlay w-full" />
              </div>
            )
            : (
              <Input
                placeholder="Filter Entity..."
                value={(table.getColumn("entity_type")
                  ?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("entity_type")?.setFilterValue(
                    event.target.value,
                  )}
                className="max-w-sm"
              />
            )}
        </div>

        <Table className="min-w-4/5">
          <TableHeader>
            {query.isLoading
              ? <TableSkeleton columns={columns.length} rows={1} />
              : (
                table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder ? null : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))
              )}
          </TableHeader>
          <TableBody className="scroll-auto">
            {/* 5. Switched to isFetching so page transitions visually trigger layout skeletons */}
            {query.isFetching
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
                    className="bg-secondary-background text-foreground data-[state=selected]:bg-main data-[state=selected]:text-main-foreground"
                    data-state={row.getIsSelected() && "selected"}
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>

        <div className="text-foreground flex flex-col sm:flex-row items-center justify-around gap-4 py-4 px-2 border-border">
          <div className="text-foreground flex-1 text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>

          {/* Right Side: Pagination Controls */}
          <div className="flex flex-wrap items-center justify-center gap-6 order-1 sm:order-2">
            {/* Page Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <Button
                size="icon"
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                {"<<"}
              </Button>
              <Button
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                {"<"}
              </Button>

              {/* Page Input Counter */}
              <div className="flex items-center gap-2 mx-2">
                <Input
                  type="number"
                  max={table.getPageCount()}
                  value={table.getState().pagination.pageIndex + 1}
                  onChange={(e) => {
                    const page = e.target.value
                      ? Number(e.target.value) - 1
                      : 0;
                    table.setPageIndex(page);
                  }}
                  className="h-8 w-14 text-center p-1 border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-sm text-foreground">
                  / {table.getPageCount() || 1}
                </span>
              </div>

              <Button
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                {">"}
              </Button>
              <Button
                size="icon"
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                {">>"}
              </Button>
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block h-4 w-px bg-slate-200" />

            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="h-8 rounded-md border border-border bg-secondary-background px-2 py-1 shadow-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 cursor-pointer"
              >
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
