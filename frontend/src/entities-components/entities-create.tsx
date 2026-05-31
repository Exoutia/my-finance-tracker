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

import { getEntityTypes } from "@/src/service.ts";
import CreateEntityForms from "@/src/entities-components/create-entity-forms/create-entity-forms.tsx";

// Helper function to handle string formatting cleanly outside the component layout
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

  // Safely sort cached data using useMemo to avoid mutating state inside your render cycle
  const sortedEntityTypes = useMemo(() => {
    return [...entityTypes].sort();
  }, [entityTypes]);

  return (
    <Dialog>
      <Card className="mx-5 my-5 h-full w-full max-w-xl">
        <CardHeader>
          <CardTitle>Create Your Entity</CardTitle>
          <CardDescription>Choose Entity Type</CardDescription>
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

        <CardFooter className="flex justify-end gap-2">
          <DialogTrigger asChild>
            <Button
              disabled={!selectedEntityType}
              type="button" // Changed from submit since there is no native HTML form wrapper
              className="w-1/3"
            >
              Enter
            </Button>
          </DialogTrigger>
        </CardFooter>
      </Card>

      <CreateEntityForms createEntityType={selectedEntityType} />
    </Dialog>
  );
}
