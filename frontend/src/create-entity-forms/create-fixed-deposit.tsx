import React, { useRef } from "react";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useCreateFixedDeposit } from "@/src/stores/createEntityHooks.ts";
import type { FixedDepositCreate } from "@/src/service.ts";

export default function CreateFixedDeposit() {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { mutate, isPending, isError, error } = useCreateFixedDeposit();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const payload: FixedDepositCreate = {
      bank_name: formData.get("bank_name") as string,
      fd_identifier: formData.get("fd_identifier") as string,
      principal_amount: Number(formData.get("principal_amount")),
      interest_rate: Number(formData.get("interest_rate")),
      maturity_date: new Date(formData.get("maturity_date").toString()),
    };

    mutate(payload, {
      onSuccess: () => {
        closeButtonRef.current?.click();
      },
    });
  };

  return (
    <DialogContent
      aria-describedby="fixed deposit create form"
      className="sm:max-w-106.25"
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <DialogHeader>
          <DialogTitle>Create Fixed Deposit</DialogTitle>
          <DialogDescription>
            Log a new fixed deposit investment receipt.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Bank Name */}
          <div className="grid gap-3">
            <Label htmlFor="bank-name">Bank Name</Label>
            <Input
              id="bank-name"
              name="bank_name"
              placeholder="e.g., HDFC Bank"
              required
              disabled={isPending}
            />
          </div>

          {/* FD Identifier / Certificate Number */}
          <div className="grid gap-3">
            <Label htmlFor="fd-identifier">FD Number / Identifier</Label>
            <Input
              id="fd-identifier"
              name="fd_identifier"
              placeholder="e.g., FD-99210294"
              required
              disabled={isPending}
            />
          </div>

          {/* Principal Amount */}
          <div className="grid gap-3">
            <Label htmlFor="principal-amount">Principal Amount</Label>
            <Input
              type="number"
              step="any"
              id="principal-amount"
              name="principal_amount"
              placeholder="0.00"
              required
              disabled={isPending}
            />
          </div>

          {/* Interest Rate */}
          <div className="grid gap-3">
            <Label htmlFor="interest-rate">Interest Rate (% p.a.)</Label>
            <Input
              type="number"
              step="0.01"
              id="interest-rate"
              name="interest_rate"
              placeholder="e.g., 7.10"
              required
              disabled={isPending}
            />
          </div>

          {/* Maturity Date */}
          <div className="grid gap-3">
            <Label htmlFor="maturity-date">Maturity Date</Label>
            <Input
              type="date"
              id="maturity-date"
              name="maturity_date"
              required
              disabled={isPending}
            />
          </div>

          {isError && (
            <p className="text-sm font-medium text-destructive">
              {error?.message || "Something went wrong"}
            </p>
          )}
        </div>

        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button type="button" variant="neutral" ref={closeButtonRef}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Deposit"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
