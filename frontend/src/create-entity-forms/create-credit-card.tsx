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
import { useCreateCreditCardEntity } from "@/src/stores/createEntityHooks.ts";
import type { CreditCardCreate } from "@/src/service.ts";

export default function CreateCreditCardForm() {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { mutate, isPending, isError, error } = useCreateCreditCardEntity();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const payload: CreditCardCreate = {
      name: formData.get("name") as string,
      card_number: formData.get("card_number") as string,
      limit: formData.get("limit") as string,
      grace_period: Number(formData.get("grace_period")),
      statement_date: Number(formData.get("statement_date")),
    };

    mutate(payload, {
      onSuccess: () => {
        closeButtonRef.current?.click();
      },
    });
  };

  return (
    <DialogContent
      aria-describedby="create credit card form"
      className="sm:max-w-106.25"
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <DialogHeader>
          <DialogTitle>Create Credit Card Entity</DialogTitle>
          <DialogDescription>
            Enter your credit card details below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Card Name */}
          <div className="grid gap-3">
            <Label htmlFor="card-name">Card Name</Label>
            <Input
              id="card-name"
              name="name"
              placeholder="e.g., Prime Rewards Visa"
              required
              disabled={isPending}
            />
          </div>

          {/* Card Number */}
          <div className="grid gap-3">
            <Label htmlFor="card-number">Card Number</Label>
            <Input
              id="card-number"
              name="card_number"
              placeholder="Please Enter Card Number"
              required
              disabled={isPending}
            />
          </div>

          {/* Credit Limit */}
          <div className="grid gap-3">
            <Label htmlFor="credit-limit">Credit Limit</Label>
            <Input
              type="number"
              id="credit-limit"
              name="limit"
              placeholder="Please Enter Limit"
              required
              disabled={isPending}
            />
          </div>

          {/* Statement & Grace Period Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-3">
              <Label htmlFor="statement-date">Statement Date (Day)</Label>
              <Input
                type="number"
                id="statement-date"
                name="statement_date"
                placeholder="e.g., 15"
                min="1"
                max="31"
                required
                disabled={isPending}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="grace-period">Grace Period (Days)</Label>
              <Input
                type="number"
                id="grace-period"
                name="grace_period"
                placeholder="e.g., 20"
                required
                disabled={isPending}
              />
            </div>
          </div>

          {isError && (
            <p className="text-sm font-medium text-destructive">
              {error.message}
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
            {isPending ? "Creating..." : "Create Credit Card"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
