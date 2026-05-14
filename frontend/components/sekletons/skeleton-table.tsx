import { Skeleton } from "@/components/ui/skeleton.tsx";
import { TableCell, TableRow } from "@/components/ui/table.tsx";

export const TableSkeleton = ({
  columns,
  rows = 5,
}: {
  columns: number;
  rows?: number;
}) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={`skeleton-${i}`}>
          {Array.from({ length: columns }).map((_, j) => (
            <TableCell variant="skeleton" key={`cell-${i}-${j}`}>
              <Skeleton className="h-10 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};
