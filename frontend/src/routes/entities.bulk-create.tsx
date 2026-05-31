import { createFileRoute } from "@tanstack/react-router";
import BulkCreate from "@/src/entities-components/bulk-entities-creation.tsx";

export const Route = createFileRoute("/entities/bulk-create")({
  component: BulkCreate,
});
