import React from "react";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ArrowRight, Plus } from "lucide-react";

import {
  type Entity,
  getAllEntitiesAtOnce,
  GetTransactionTemplates,
  type TransactionTemplateRead,
} from "@/src/service.ts";
import { useCreateTransaction } from "@/src/stores/createEntityHooks.ts";
import type { AutocompleteOption } from "@/components/autocomplete.tsx";
import Autocomplete from "@/components/autocomplete.tsx";

const transactionFormSchema = z.object({
  from_entities_id: z.uuid({
    message: "Please select a valid source account",
  }),
  to_entities_id: z.uuid({
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

  const entitiesQuery = useQuery({
    queryKey: ["entities-registry"],
    queryFn: getAllEntitiesAtOnce,
  });

  // Controlled Form States (Allows templates to inject values)
  const [fromEntityId, setFromEntityId] = React.useState<string | null>(null);
  const [toEntityId, setToEntityId] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [transactionDate, setTransactionDate] = React.useState<string>(
    Temporal.Now.plainDateISO().toString(),
  );
  const [transactionTime, setTransactionTime] = React.useState<string>(
    Temporal.Now.plainTimeISO().toString().slice(0, 5),
  );
  const [tags, setTags] = React.useState<string>("");

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

  const TemplatesQuery = useQuery({
    queryKey: ["transaction-templates"],
    queryFn: GetTransactionTemplates,
  });

  const templates: TransactionTemplateRead[] = React.useMemo(
    () => TemplatesQuery.data || [],
    [TemplatesQuery.data],
  );

  // Apply template values directly to state
  const handleApplyTemplate = (template: TransactionTemplateRead) => {
    setFromEntityId(template.fromEntityId);
    setToEntityId(template.toEntityId);
    setAmount(template.amount?.toString() || "0");
    setDescription(template.description || "");

    // Safely handles template tags field whether it arrives as an array or pre-joined string
    if (Array.isArray(template.tags)) {
      setTags(template.tags.join(", "));
    } else {
      setTags(template.tags || "");
    }

    setTransactionDate(Temporal.Now.plainDateISO().toString());
    setTransactionTime(Temporal.Now.plainTimeISO().toString().slice(0, 5));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const rawPayload = {
      from_entities_id: fromEntityId,
      to_entities_id: toEntityId,
      amount: amount,
      description: description || null,
      transaction_datetime: `${
        transactionDate || Temporal.Now.plainDateISO().toString()
      }T${
        transactionTime || Temporal.Now.plainTimeISO().toString().split(".")[0]
      }`,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
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
        setFromEntityId(null);
        setToEntityId(null);
        setAmount("");
        setDescription("");
        setTags("");
        setTransactionDate(Temporal.Now.plainDateISO().toString());
        setTransactionTime(Temporal.Now.plainTimeISO().toString().slice(0, 5));
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
    <div className="flex gap-5 items-start">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg h-[480px] p-6 bg-secondary-background border border-border rounded-base shadow-shadow flex flex-col gap-4 font-base text-foreground"
      >
        <h3 className="font-heading text-lg border-b border-border/40 pb-2">
          Record New Transaction
        </h3>

        {errors.root && (
          <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-base">
            {errors.root}
          </div>
        )}

        <div className="flex justify-between items-center gap-2">
          {/* From Autocomplete */}
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-heading uppercase tracking-wider opacity-80">
              From Account
            </label>
            <Autocomplete
              options={autocompleteOptions}
              placeholder="Search source registry..."
              selectedValue={fromEntityId}
              onSelect={(value) => setFromEntityId(value)}
              error={errors.from_entities_id}
              resetToggle={clearForm}
            />
          </div>

          <div className="mt-5 text-muted-foreground flex-shrink-0">
            <ArrowRight size={18} />
          </div>

          {/* To Autocomplete */}
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-heading uppercase tracking-wider opacity-80">
              To Account
            </label>
            <Autocomplete
              options={autocompleteOptions}
              placeholder="Search target registry..."
              selectedValue={toEntityId}
              onSelect={(value) => setToEntityId(value)}
              error={errors.to_entities_id}
              resetToggle={clearForm}
            />
          </div>
        </div>

        <div className="flex justify-between gap-3">
          {/* Amount Field */}
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-heading uppercase tracking-wider opacity-80">
              Amount
            </label>
            <Input
              name="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="shadow-none"
            />
            {errors.amount && (
              <span className="text-xs text-destructive">{errors.amount}</span>
            )}
          </div>

          {/* Date Field */}
          <div className="flex flex-col gap-1.5 min-w-[130px]">
            <label className="text-xs font-heading uppercase tracking-wider opacity-80">
              Date
            </label>
            <Input
              name="transaction_date"
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="shadow-none"
            />
          </div>

          {/* Time Field */}
          <div className="flex flex-col gap-1.5 min-w-[100px]">
            <label className="text-xs font-heading uppercase tracking-wider opacity-80">
              Time
            </label>
            <Input
              name="transaction_time"
              type="time"
              value={transactionTime}
              onChange={(e) => setTransactionTime(e.target.value)}
              className="shadow-none"
            />
          </div>
        </div>

        {errors.transaction_datetime && (
          <span className="text-xs text-destructive">
            {errors.transaction_datetime}
          </span>
        )}

        {/* Description Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-heading uppercase tracking-wider opacity-80">
            Description
          </label>
          <Input
            name="description"
            placeholder="Optional notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="shadow-none"
          />
        </div>

        {/* Tags Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-heading uppercase tracking-wider opacity-80">
            Tags (Comma Separated)
          </label>
          <Input
            name="tags"
            placeholder="closingAccount, dividend, corporate"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="shadow-none"
          />
        </div>

        <Button
          type="submit"
          variant="default"
          disabled={mutation.isPending}
          className="mt-2 w-full h-10 font-heading cursor-pointer"
        >
          {mutation.isPending
            ? "Executing payload processing..."
            : "Submit Transaction"}
        </Button>
      </form>
      <div className="w-full h-[480px] p-6 bg-secondary-background border-2 border-black rounded-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4 font-base text-foreground">
        <h3 className="font-heading text-lg border-b-2 border-black pb-2 uppercase tracking-wide">
          Quick Templates
        </h3>

        {/* Grid Container: Removed the inner border and extra background box. Added flex-1 to fill space evenly. */}
        <div className="grid grid-cols-3 auto-rows-max gap-3 flex-1 overflow-y-auto pr-1 scrollbar-none">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleApplyTemplate(template)}
              className="w-full text-left p-3 bg-background text-xs font-medium border-2 border-black rounded-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-main hover:text-main-foreground transition-all duration-75 flex flex-col gap-1 cursor-pointer select-none"
            >
              <span className="font-heading text-xs truncate">
                {template.name.toUpperCase()}
              </span>
              <span className="opacity-70 truncate text-[11px]">
                {template.description || "No description"}
              </span>
              <span className="font-mono mt-auto pt-1 font-bold">
                Rs {template.amount !== undefined && template.amount !== null
                  ? Number(template.amount).toFixed(2)
                  : "0.00"}/-
              </span>
            </div>
          ))}
        </div>

        {/* Button: Fixed neubrutalism shadows to match your main green Submit button */}
        <Button className="w-full bg-main text-main-foreground border-2 border-black rounded-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all h-11 flex items-center justify-center cursor-pointer font-heading">
          <Plus size={20} className="stroke-[3]" />
        </Button>
      </div>
    </div>
  );
}
