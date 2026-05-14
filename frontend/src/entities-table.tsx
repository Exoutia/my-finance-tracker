import { useQuery } from "@tanstack/react-query";
import { type Entity, getEntities } from "@/src/service.ts";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
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
      <div className="capitalize">{row.getValue("entity_type")}</div>
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="m-10">
      <h2 className="text-xl pb-1">Entities Table:</h2>

      <Table className="max-w-3/5">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
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
          ))}
        </TableHeader>
        <TableBody>
          {query.isLoading
            ? <TableSkeleton columns={columns.length} rows={5} />
            : table.getRowModel().rows?.length
            ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
