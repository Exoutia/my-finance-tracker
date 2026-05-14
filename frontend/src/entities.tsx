import { EntitiesTable } from "@/src/entities-table.tsx";
import CreateEntity from "@/src/entities-create.tsx";

export function Entities() {
  return (
    <div className="flex">
      <EntitiesTable />
      <CreateEntity />
    </div>
  );
}
