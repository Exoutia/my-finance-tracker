import { createFileRoute } from "@tanstack/react-router";
import Transactions from "@/src/transactions-components/transactions-components.tsx";

export const Route = createFileRoute("/transactions/")({
  component: Transactions,
});
