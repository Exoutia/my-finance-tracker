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

// 1. Pull your central registry and API method out of service.ts
import {
  ApiError,
  bulkCreateLiquidAccounts,
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

export default function BulkUploadLiquidAccounts() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2. CONFIGURE TANSTACK MUTATION TO TRIGGER YOUR SERVICE PIPELINE
  const uploadMutation = useMutation({
    mutationFn: (payload: FormData) => bulkCreateLiquidAccounts(payload),
    onSuccess: () => {
      // Clear local states on validation success
      setSelectedFile(null);
      setErrorMessage(null);

      // Invalidate existing caches so your Entities Table fetches fresh data automatically
      queryClient.invalidateQueries({ queryKey: ["entities"] });

      alert("Bulk ingestion completed successfully!");
      router.navigate({ to: "/entities" }); // Redirect back to principal tracking ledger
    },
    onError: (error: ApiError) => {
      // Cleanly intercept and display explicit error details parsed by apiRequest
      setErrorMessage(
        error.message ||
          "Bulk creation aborted due to transaction boundary failure.",
      );
    },
  });

  // 3. GENERATE HARDFIXED BLOB CSV TEMPLATE SKELETON
  const handleDownloadTemplate = () => {
    const schemaFields = ENTITY_BLUEPRINT_REGISTRY["liquid_account"];
    const headers = Object.keys(schemaFields);

    // Add an obvious structural baseline reference string row for the user
    const formatMockRow = headers.map((key) => {
      if (schemaFields[key].type === "number") return "2500.00";
      return `sample_${key}`;
    });

    const csvContent = [headers.join(","), formatMockRow.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = globalThis.document.createElement("a");
    link.href = url;
    link.setAttribute("download", "bulk_template_liquid_accounts.csv");
    globalThis.document.body.appendChild(link);
    link.click();
    globalThis.document.body.removeChild(link);
  };

  // Capture file bytes from drop-zone target input field
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage(null); // Reset layout error state tracker
    }
  };

  // 4. PACK UP BINARIES AND INVOKE SERVICE TRANSACTION
  const handleSubmitUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    // Instantiating standard multipart data payload matching your backend's File(...) expected header requirements
    const submissionPayload = new FormData();
    submissionPayload.append("file", selectedFile);

    // Dispatch payload execution straight down the network pipe
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
        <Card className="border-border bg-secondary-background shadow-shadow w-full">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-xl font-heading">
              Bulk Liquid Ingestion
            </CardTitle>
            <CardDescription className="text-xs opacity-80">
              Upload multiple liquid checking/savings structures concurrently
              directly into your ledger network registry.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5 flex flex-col gap-5">
            {/* Download Step Card Action */}
            <div className="grid w-full gap-2">
              <Label>1. Fetch Mapping Architecture Layout</Label>
              <Button
                type="button"
                onClick={handleDownloadTemplate}
                variant="neutral"
                className="w-full flex items-center justify-center gap-2 bg-background hover:bg-muted text-xs font-heading uppercase tracking-wide border-border shadow-none"
              >
                <Download className="h-4 w-4" /> Download Blueprint CSV
              </Button>
            </div>

            {/* Binary File Receiver Area Dropzone */}
            <div className="grid w-full gap-2">
              <Label htmlFor="csv-file-injector">
                2. Upload Populated Dataset Sheet
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
                      <p className="text-xs font-heading uppercase tracking-wide text-main flex items-center gap-1.5">
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

            {/* Error Message Trace Block Layout */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-base bg-chart-3/10 border border-chart-3/30 text-chart-3 text-xs leading-relaxed font-mono">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}
          </CardContent>

          {/* Mutation Submit Confirmation Panel */}
          <CardFooter className="border-t border-border/40 pt-4 bg-background/30 flex justify-end">
            <Button
              type="submit"
              disabled={!selectedFile || uploadMutation.isPending}
              className={`w-full sm:w-1/3 font-heading uppercase text-xs tracking-wider transition-all
                ${
                selectedFile && !uploadMutation.isPending
                  ? "bg-main text-main-foreground shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                  : "opacity-40 cursor-not-allowed"
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
