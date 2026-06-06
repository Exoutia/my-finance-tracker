import React from "react";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";

// Mocking an entity fetch function—replace this with your real service layer API call
import { type Entity, getAllEntitiesAtOnce } from "@/src/service.ts";
import { useCreateTransaction } from "@/src/stores/createEntityHooks.ts";
import type { AutocompleteOption } from "@/components/autocomplete.tsx";
import Autocomplete from "@/components/autocomplete.tsx";

const transactionFormSchema = z.object({
  from_entities_id: z.string().uuid({
    message: "Please select a valid source account",
  }),
  to_entities_id: z.string().uuid({
    message: "Please select a valid destination account",
  }),
  amount: z.coerce.number().gt(0, { message: "Amount must be greater than 0" }),
  description: z.string().nullable().default(null),
  transaction_datetime: z.string().min(1, {
    message: "Date and time tracking is required",
  }),
  tags: z.array(z.string()).default([]),
}).refine((data) => data.from_entities_id !== data.to_entities_id, {
  message: "Source and Destination entities cannot be identical.",
  path: ["to_entities_id"],
});

type FormErrors = Partial<
  Record<keyof z.infer<typeof transactionFormSchema> | "root", string>
>;

export default function CreateTransactionForm(
  { onSuccess }: { onSuccess?: () => void },
) {
  const mutation = useCreateTransaction();

  // 1. Fetch live registries from your database to populate selection parameters
  const entitiesQuery = useQuery({
    queryKey: ["entities-registry"],
    queryFn: getAllEntitiesAtOnce,
  });

  // Explicit form state bindings for Autocomplete tracking parameters
  const [fromEntityId, setFromEntityId] = React.useState<string | null>(null);
  const [toEntityId, setToEntityId] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [clearForm, setClearForm] = React.useState<boolean>(false);

  const autocompleteOptions: AutocompleteOption[] = React.useMemo(() => {
    if (!entitiesQuery.data) return [];

    const rawData = Array.isArray(entitiesQuery.data)
      ? entitiesQuery.data
      : Object.values(entitiesQuery.data);

    return (rawData as Entity[]).map((ent: Entity) => ({
      label: ent.name,
      value: ent.uuid,
    }));
  }, [entitiesQuery.data]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const rawTags = formData.get("tags") as string;

    const rawPayload = {
      from_entities_id: fromEntityId,
      to_entities_id: toEntityId,
      amount: formData.get("amount"),
      description: formData.get("description") || null,
      transaction_datetime: formData.get("transaction_datetime"),
      tags: rawTags
        ? rawTags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    };

    const validationResult = transactionFormSchema.safeParse(rawPayload);

    if (!validationResult.success) {
      const fieldErrors: FormErrors = {};
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof FormErrors] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setClearForm((prev) => !prev);
      return;
    }

    mutation.mutate(validationResult.data, {
      onSuccess: () => {
        (e.target as HTMLFormElement).reset();
        setFromEntityId(null);
        setToEntityId(null);
        if (onSuccess) onSuccess();
      },
      onError: (err) => {
        setErrors({
          root: err.message || "An issue occurred on the backend database.",
        });
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md p-6 bg-secondary-background border border-border rounded-base shadow-shadow flex flex-col gap-4 font-base text-foreground"
    >
      <h3 className="font-heading text-lg border-b border-border/40 pb-2">
        Record New Transaction
      </h3>

      {errors.root && (
        <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-base">
          {errors.root}
        </div>
      )}

      {/* From Autocomplete Picker Field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-heading uppercase tracking-wider opacity-80">
          From Account
        </label>
        <Autocomplete
          options={autocompleteOptions}
          placeholder="Search source registry..."
          onSelect={(value) => setFromEntityId(value)}
          error={errors.from_entities_id}
          resetToggle={clearForm}
        />
      </div>

      {/* To Autocomplete Picker Field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-heading uppercase tracking-wider opacity-80">
          To Account
        </label>
        <Autocomplete
          options={autocompleteOptions}
          placeholder="Search target registry..."
          onSelect={(value) => setToEntityId(value)}
          error={errors.to_entities_id}
          resetToggle={clearForm}
        />
      </div>

      {/* Amount Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-heading uppercase tracking-wider opacity-80">
          Amount
        </label>
        <Input
          name="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          className="shadow-none"
        />
        {errors.amount && (
          <span className="text-xs text-destructive">{errors.amount}</span>
        )}
      </div>

      {/* DateTime Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-heading uppercase tracking-wider opacity-80">
          Date & Time
        </label>
        <Input
          name="transaction_datetime"
          type="datetime-local"
          defaultValue={new Date().toISOString().slice(0, 16)}
          className="shadow-none"
        />
        {errors.transaction_datetime && (
          <span className="text-xs text-destructive">
            {errors.transaction_datetime}
          </span>
        )}
      </div>

      {/* Memo Field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-heading uppercase tracking-wider opacity-80">
          Description
        </label>
        <Input
          name="description"
          placeholder="Optional notes..."
          className="shadow-none"
        />
      </div>

      {/* Tags Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-heading uppercase tracking-wider opacity-80">
          Tags (Comma Separated)
        </label>
        <Input
          name="tags"
          placeholder="closingAccount, dividend, corporate"
          className="shadow-none"
        />
      </div>

      <Button
        type="submit"
        variant="neutral"
        disabled={mutation.isPending}
        className="mt-2 w-full h-10 font-heading cursor-pointer"
      >
        {mutation.isPending
          ? "Executing payload processing..."
          : "Submit Transaction"}
      </Button>
    </form>
  );
}
