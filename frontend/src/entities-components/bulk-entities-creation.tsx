// bulkcreate.tsx
import React, { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Download,
  RefreshCw,
  UploadCloud,
} from "lucide-react";

import {
  ApiError,
  bulkCreateBonds,
  bulkCreateCreditCard,
  bulkCreateDematAccounts,
  bulkCreateExternalContacts,
  bulkCreateFixedDeposits,
  bulkCreateLiquidAccounts,
  bulkCreateMutualFunds,
  bulkCreateStocks,
  bulkCreateVirtualEntities,
  ENTITY_BLUEPRINT_REGISTRY,
} from "@/src/service.ts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";

export default function EntitiesBulkCreate() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Default to the first available entity configuration inside your registry structure map
  const [selectedEntityType, setSelectedEntityType] = useState<string>(
    Object.keys(ENTITY_BLUEPRINT_REGISTRY)[0],
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // CONFIGURE TANSTACK MUTATION WITH DYNAMIC PIPELINE SWITCHING
  const uploadMutation = useMutation<unknown[], ApiError, FormData>({
    mutationFn: (payload: FormData) => {
      switch (selectedEntityType) {
        case "liquid_account":
          return bulkCreateLiquidAccounts(payload);
        case "credit_card":
          return bulkCreateCreditCard(payload);
        case "bonds":
          return bulkCreateBonds(payload);
        case "demat_account":
          return bulkCreateDematAccounts(payload);
        case "fixed_deposit_account":
          return bulkCreateFixedDeposits(payload);
        case "mutual_fund":
          return bulkCreateMutualFunds(payload);
        case "stocks":
          return bulkCreateStocks(payload);
        case "person":
        case "company":
          return bulkCreateExternalContacts(payload); // Maps both target categories to external contacts
        case "virtual_entity":
          return bulkCreateVirtualEntities(payload);
        default:
          throw new Error(`Unhandled entity type: ${selectedEntityType}`);
      }
    },
    onSuccess: (_data) => {
      setSelectedFile(null);
      setErrorMessage(null);

      queryClient.invalidateQueries({ queryKey: ["entities"] });

      alert(`Bulk ingestion for ${selectedEntityType} completed successfully!`);
      router.navigate({ to: "/entities" });
    },
    onError: (error: ApiError) => {
      setErrorMessage(
        error.message ||
          "Bulk creation aborted due to transaction boundary failure.",
      );
    },
  });
  // GENERATE DYNAMIC BLOB CSV TEMPLATE BASED ON SELECTION
  const handleDownloadTemplate = () => {
    const schemaFields = ENTITY_BLUEPRINT_REGISTRY[selectedEntityType];
    if (!schemaFields) return;

    const headers = Object.keys(schemaFields);

    // Dynamic mock values parsed straight via blueprints metadata properties parameters
    const formatMockRow = headers.map((key) => {
      const fieldType = schemaFields[key].type;
      if (fieldType === "number") return "2500";
      if (fieldType === "boolean") {
        return schemaFields[key].desc.includes("true") ? "true" : "false";
      }
      if (fieldType === "date") return "2026-06-01";
      return `sample_${key}`;
    });

    const csvContent = [headers.join(","), formatMockRow.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = globalThis.document.createElement("a");
    const cleanFileName = selectedEntityType.replace(/_/g, "-");

    link.href = url;
    link.setAttribute("download", `bulk_template_${cleanFileName}.csv`);
    globalThis.document.body.appendChild(link);
    link.click();
    globalThis.document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const handleSubmitUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const submissionPayload = new FormData();
    submissionPayload.append("file", selectedFile);

    uploadMutation.mutate(submissionPayload);
  };

  return (
    <div className="mx-auto my-6 w-full max-w-xl px-4 font-base text-foreground">
      <div className="mb-6">
        <Link
          to=".."
          className="inline-flex items-center gap-2 text-xs font-heading uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmitUpload}>
        <Card className="border-border bg-secondary-background shadow-shadow w-full border-2">
          <CardHeader className="border-b-2 border-border pb-4">
            <CardTitle className="text-xl font-heading">
              Bulk Entity Ingestion
            </CardTitle>
            <CardDescription className="text-xs opacity-80">
              Select an asset framework layout topology type from the
              configuration mapping system layer to load target records data
              entries.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5 flex flex-col gap-5">
            {/* Step 1: Select Type */}
            <div className="grid w-full gap-2">
              <Label htmlFor="entity-type-selector">
                1. Choose Target Registry Type
              </Label>
              <select
                id="entity-type-selector"
                value={selectedEntityType}
                onChange={(e) => {
                  setSelectedEntityType(e.target.value);
                  setSelectedFile(null); // Clear mismatched uploaded structural assets sheets
                }}
                className="w-full rounded-base border-2 border-border bg-background p-2.5 text-xs font-heading uppercase tracking-wide shadow-shadow focus:outline-none transition-transform"
              >
                {Object.keys(ENTITY_BLUEPRINT_REGISTRY).map((key) => (
                  <option
                    key={key}
                    value={key}
                    className="bg-secondary-background text-foreground normal-case"
                  >
                    {key.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Download Structuring Grid Schema */}
            <div className="grid w-full gap-2">
              <Label>2. Fetch Mapping Architecture Layout</Label>
              <Button
                type="button"
                onClick={handleDownloadTemplate}
                variant="neutral"
                className="w-full flex items-center justify-center gap-2 bg-background hover:bg-muted text-xs font-heading uppercase tracking-wide border-2 border-border shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                <Download className="h-4 w-4" /> Download{" "}
                {selectedEntityType.replace(/_/g, " ")} CSV
              </Button>
            </div>

            {/* Step 3: Binary Upload Drag-Dropzone */}
            <div className="grid w-full gap-2">
              <Label htmlFor="csv-file-injector">
                3. Upload Populated Dataset Sheet
              </Label>
              <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-border bg-background/50 hover:bg-background rounded-base p-8 text-center transition-colors">
                <input
                  id="csv-file-injector"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="h-10 w-10 text-foreground/40 mb-2" />

                {selectedFile
                  ? (
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-xs font-heading uppercase tracking-wide text-foreground flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-chart-1" />{" "}
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] opacity-60">
                        {(selectedFile.size / 1024).toFixed(2)}{" "}
                        KB · Click to swap files
                      </p>
                    </div>
                  )
                  : (
                    <>
                      <p className="text-xs font-heading uppercase tracking-wide mb-1">
                        Drop filled template sheet here
                      </p>
                      <p className="text-[10px] opacity-60">
                        Supports standard comma-separated text extensions (.csv)
                      </p>
                    </>
                  )}
              </div>
            </div>

            {/* System Error Trace Alert Block Panel */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-base bg-red-500/10 border-2 border-border text-chart-4 text-xs leading-relaxed font-mono shadow-shadow">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}
          </CardContent>

          {/* Action Submission Execution Bar Footer Panel */}
          <CardFooter className="border-t-2 border-border pt-4 bg-background/30 flex justify-end">
            <Button
              type="submit"
              disabled={!selectedFile || uploadMutation.isPending}
              className={`w-full sm:w-1/3 font-heading uppercase text-xs tracking-wider transition-all border-2 border-border
                ${
                selectedFile && !uploadMutation.isPending
                  ? "bg-main text-main-foreground shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                  : "opacity-40 cursor-not-allowed shadow-none"
              }
              `}
            >
              {uploadMutation.isPending
                ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                : (
                  "Transmit Bulk"
                )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
