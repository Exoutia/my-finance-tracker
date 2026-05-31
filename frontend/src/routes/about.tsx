import { createFileRoute } from "@tanstack/react-router";
import About from "@/src/about-components/about-component.tsx";

export const Route = createFileRoute("/about")({
  component: About,
});
