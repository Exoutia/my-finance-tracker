import { createFileRoute } from "@tanstack/react-router";
import TransactionBulkCreate from "@/src/transactions-components/transactions-bulk-create.tsx";

export const Route = createFileRoute("/transactions/bulk-create")({
  component: TransactionBulkCreate,
});
