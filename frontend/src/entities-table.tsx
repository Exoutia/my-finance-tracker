import { useQuery } from "@tanstack/react-query";
import { type Entity, getEntities } from "@/src/service.ts";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
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
        {row.getValue("entity_type").split("_").join(" ")}
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
  const query = useQuery({
    queryKey: ["entities"],
    queryFn: getEntities,
  });

  const data = query.data || [];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] = React.useState<
    VisibilityState
  >({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="m-10 min-w-180">
      <div className="flex items-center gap-2 py-4">
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
          {query.isLoading
            ? <TableSkeleton columns={columns.length} rows={5} />
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
    </div>
  );
}
