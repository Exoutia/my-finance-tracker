import { EntitiesTable } from "@/src/entities-components/entities-table.tsx";
import CreateEntity from "@/src/entities-components/entities-create.tsx";

export default function Entities() {
  return (
    <div className="flex justify-around">
      <EntitiesTable />
      <CreateEntity />
    </div>
  );
}
