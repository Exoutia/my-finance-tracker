import { createFileRoute } from "@tanstack/react-router";
import Index from "@/src/index-components/index-component.tsx";

export const Route = createFileRoute("/")({
  component: Index,
});
