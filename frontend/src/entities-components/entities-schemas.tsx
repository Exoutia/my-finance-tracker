import React from "react";
import { ENTITY_BLUEPRINT_REGISTRY } from "@/src/service.ts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";

interface SchemaPayloadCardProps {
  selectedType: string; // Toggled by your <CreateEntity /> tracking dropdown logic
}

export function SchemaPayloadCard({ selectedType }: SchemaPayloadCardProps) {
  // Grab properties directly from your service configurations
  const activeBlueprint = ENTITY_BLUEPRINT_REGISTRY[selectedType];

  return (
    <div className="mx-auto my-6 h-full w-full max-w-xl min-h-87.5 sm:my-0 border border-border bg-secondary-background p-5 shadow-shadow font-base text-foreground rounded-base">
      {/* Structural Title Area */}
      <div className="mb-4 border-b border-border/40 pb-3">
        <h3 className="font-heading text-lg tracking-wide capitalize">
          {selectedType
            ? `${selectedType.replace("-", " ").replace("_", " ")} Blueprint`
            : "Payload Map"}
        </h3>
        <p className="text-xs opacity-70 mt-0.5">
          Backend model data shapes and expected structural fields requirements.
        </p>
      </div>

      {/* Fallback Layout if state selection is null */}
      {!activeBlueprint
        ? (
          <div className="flex h-44 items-center justify-center border border-dashed border-border rounded-base bg-background/50 text-center text-xs opacity-60 px-4">
            Select an entity category on the form entry module to read
            properties metadata.
          </div>
        )
        : (
          /* Structural Data Grid parsing keys dynamically */
          <div className="overflow-x-auto border border-border rounded-base bg-background">
            <Table className="w-full border-collapse text-left text-xs">
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-heading h-9 px-3 text-foreground">
                    Payload Key
                  </TableHead>
                  <TableHead className="font-heading h-9 px-3 text-foreground">
                    Data Type
                  </TableHead>
                  <TableHead className="font-heading h-9 px-3 text-center text-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {Object.entries(activeBlueprint).map((
                  [fieldName, metadata],
                ) => (
                  <React.Fragment key={fieldName}>
                    {/* Property Configuration Base Line */}
                    <TableRow className="border-b border-border/20 hover:bg-transparent font-base">
                      <TableCell className="font-mono p-2.5 font-bold text-foreground/90">
                        {fieldName}
                      </TableCell>
                      <TableCell className="p-2.5">
                        <code className="bg-muted border border-border/40 text-main font-mono px-1.5 py-0.5 rounded text-[11px]">
                          {metadata.type}
                        </code>
                      </TableCell>
                      <TableCell className="p-2.5 text-center">
                        {metadata.required
                          ? (
                            <span className="inline-block px-2 py-0.5 text-[10px] font-heading uppercase bg-chart-1/10 border border-chart-1/30 text-chart-1 rounded">
                              Required
                            </span>
                          )
                          : (
                            <span className="inline-block px-2 py-0.5 text-[10px] font-base text-foreground/40 border border-border bg-muted/20 rounded">
                              Optional
                            </span>
                          )}
                      </TableCell>
                    </TableRow>

                    {/* Property Context Information Nested Row */}
                    <TableRow className="border-b border-border/40 bg-muted/10 hover:bg-transparent text-[11px]">
                      <TableCell
                        colSpan={3}
                        className="px-3 py-2 text-foreground/70 leading-normal"
                      >
                        <span className="font-sans font-medium opacity-60">
                          Field Info:
                        </span>{" "}
                        {metadata.desc}
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
    </div>
  );
}
