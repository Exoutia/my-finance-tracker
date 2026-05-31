import { createFileRoute } from "@tanstack/react-router";
import Entities from "@/src/entities-components/entities-component.tsx";

export const Route = createFileRoute("/entities")({
  component: Entities,
});
