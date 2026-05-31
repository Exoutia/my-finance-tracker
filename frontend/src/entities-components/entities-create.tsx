import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Dialog, DialogTrigger } from "@/components/ui/dialog.tsx";

import { Link } from "@tanstack/react-router";
import { getEntityTypes } from "@/src/service.ts";
import CreateEntityForms from "@/src/entities-components/create-entity-forms/create-entity-forms.tsx";
import { ListPlus } from "lucide-react";
import { SchemaPayloadCard } from "@/src/entities-components/entities-schemas.tsx";

// Clean string parsing utility
const formatEntityLabel = (value: string): string => {
  if (!value) return "";
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function CreateEntity() {
  const { data: entityTypes = [] } = useQuery({
    queryKey: ["entity-types"],
    queryFn: getEntityTypes,
  });

  const [selectedEntityType, setSelectedEntityType] = useState("");

  // Memoized sorted listing to protect against runtime mutations
  const sortedEntityTypes = useMemo(() => {
    return [...entityTypes].sort();
  }, [entityTypes]);

  return (
    <Dialog>
      <SchemaPayloadCard selectedType={selectedEntityType} />
      <Card
        id="create-entities-card"
        className="mx-auto my-6 h-full w-full max-w-xl border-border bg-secondary-background shadow-shadow font-base"
      >
        {/* Adjusted header configuration for better element alignment */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/40">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl font-heading">
              Create Your Entity
            </CardTitle>
            <CardDescription className="text-xs opacity-80">
              Choose Entity Type
            </CardDescription>
          </div>
          <div>
            {/* Standardized TanStack pathing matching entities.bulk.tsx route specification */}
            <Link to="/entities/bulk-create">
              <Button
                className="cursor-pointer"
                title="Bulk Create Panel"
                variant="neutral"
                size="icon"
              >
                <ListPlus className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-row justify-between gap-6">
            {/* Entity Selector */}
            <div className="grid w-full gap-2">
              <Label htmlFor="entity-type">Entity Type</Label>
              <Select
                value={selectedEntityType}
                onValueChange={setSelectedEntityType}
              >
                <SelectTrigger id="entity-type" className="w-full">
                  <SelectValue placeholder="Select Entity Type">
                    {selectedEntityType
                      ? formatEntityLabel(selectedEntityType)
                      : ""}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  <SelectGroup>
                    <SelectLabel>Entities</SelectLabel>
                    {sortedEntityTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatEntityLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Tags Input Placeholder */}
            <div className="grid w-full gap-2">
              <Label htmlFor="entity-tags">Tags</Label>
              <Input id="entity-tags" placeholder="e.g. production, test" />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end pt-4 border-t border-border/40">
          <DialogTrigger asChild>
            <Button
              disabled={!selectedEntityType}
              type="button"
              className={`w-1/3 font-heading uppercase text-xs tracking-wider transition-all
                ${
                selectedEntityType
                  ? "bg-main text-main-foreground shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                  : "opacity-40 cursor-not-allowed"
              }
              `}
            >
              Enter Form
            </Button>
          </DialogTrigger>
        </CardFooter>
      </Card>

      {/* Renders the selected schema tracking dynamic child elements */}
      <CreateEntityForms createEntityType={selectedEntityType} />
    </Dialog>
  );
}
