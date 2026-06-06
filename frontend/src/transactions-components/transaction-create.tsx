import React from "react";
import { Button } from "@/components/ui/button.tsx";
import * as z from "zod";
import { Input } from "@/components/ui/input.tsx";
import { useCreateTransaction } from "@/src/stores/createEntityHooks.ts";

// 1. Runtime Zod Schema mapping directly against your TransactionCreate structure
const transactionFormSchema = z.object({
  from_entities_id: z.string().uuid({
    message: "Invalid source account ID format",
  }),
  to_entities_id: z.string().uuid({
    message: "Invalid destination account ID format",
  }),
  amount: z.coerce.number().gt(0, {
    message: "Amount must be a positive currency number",
  }),
  description: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().nullable(),
  ),
  transaction_datetime: z.string().min(1, {
    message: "Timestamp tracking is required",
  }),
  tags: z.string().transform((val) =>
    val ? val.split(",").map((t) => t.trim()).filter(Boolean) : []
  ),
}).refine((data) => data.from_entities_id !== data.to_entities_id, {
  message: "Source and Destination entities cannot be the same.",
  path: ["to_entities_id"],
});

type FormErrors = Partial<
  Record<keyof z.infer<typeof transactionFormSchema> | "root", string>
>;

export default function CreateTransactionForm(
  { onSuccess }: { onSuccess?: () => void },
) {
  const mutation = useCreateTransaction();
  const [errors, setErrors] = React.useState<FormErrors>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const rawPayload = {
      from_entities_id: formData.get("from_entities_id"),
      to_entities_id: formData.get("to_entities_id"),
      amount: formData.get("amount"),
      description: formData.get("description"),
      transaction_datetime: formData.get("transaction_datetime"),
      tags: formData.get("tags"),
    };

    // 2. Perform Form Validation via Zod
    const validationResult = transactionFormSchema.safeParse(rawPayload);

    if (!validationResult.success) {
      const fieldErrors: FormErrors = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof FormErrors] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // 3. Trigger Mutation on valid verification
    mutation.mutate(validationResult.data, {
      onSuccess: () => {
        (e.target as HTMLFormElement).reset();
        if (onSuccess) onSuccess();
      },
      onError: (err) => {
        setErrors({
          root: err.message || "An error occurred on the data server.",
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

      {/* From Account Input Field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-heading uppercase tracking-wider opacity-80">
          From Entity (UUID)
        </label>
        <Input
          name="from_entities_id"
          placeholder="a8743d2b-0f97-44a3-89ee-90ab37c9ff08"
          className="shadow-none"
        />
        {errors.from_entities_id && (
          <span className="text-xs text-destructive">
            {errors.from_entities_id}
          </span>
        )}
      </div>

      {/* To Account Input Field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-heading uppercase tracking-wider opacity-80">
          To Entity (UUID)
        </label>
        <Input
          name="to_entities_id"
          placeholder="85318669-7a8d-4c55-a340-78de624116ab"
          className="shadow-none"
        />
        {errors.to_entities_id && (
          <span className="text-xs text-destructive">
            {errors.to_entities_id}
          </span>
        )}
      </div>

      {/* Amount Input Field */}
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

      {/* Datetime Selection Field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-heading uppercase tracking-wider opacity-80">
          Transaction Date & Time
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

      {/* Description Field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-heading uppercase tracking-wider opacity-80">
          Description
        </label>
        <Input
          name="description"
          placeholder="Optional memo..."
          className="shadow-none"
        />
      </div>

      {/* Comma-Separated Tags Input Field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-heading uppercase tracking-wider opacity-80">
          Tags (Comma Separated)
        </label>
        <Input
          name="tags"
          placeholder="closingAccount, infrastructure, primary"
          className="shadow-none"
        />
      </div>

      {/* Submit button dynamically bound to React Mutation State hooks */}
      <Button
        type="submit"
        variant="neutral"
        disabled={mutation.isPending}
        className="mt-2 w-full h-10 font-heading cursor-pointer"
      >
        {mutation.isPending ? "Processing Request..." : "Post Transaction"}
      </Button>
    </form>
  );
}
