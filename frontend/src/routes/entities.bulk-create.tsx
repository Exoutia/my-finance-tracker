import { createFileRoute } from "@tanstack/react-router";
import EntitiesBulkCreate from "@/src/entities-components/bulk-entities-creation.tsx";

export const Route = createFileRoute("/entities/bulk-create")({
  component: EntitiesBulkCreate,
});
