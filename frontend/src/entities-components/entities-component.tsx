import { EntitiesTable } from "@/src/entities-components/entities-table.tsx";
import CreateEntity from "@/src/entities-components/entities-create.tsx";

export default function Entities() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto p-4 md:p-6 font-base">
      {/* Table Section */}
      <div className="w-full">
        <EntitiesTable />
      </div>

      {/* Separator Rule */}
      <hr className="border-t border-border/20 my-2" />

      {/* Creation Component Section aligned center */}
      <div className="flex justify-center w-full">
        <CreateEntity />
      </div>
    </div>
  );
}
