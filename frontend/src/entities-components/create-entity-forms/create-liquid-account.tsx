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
import { useCreateLiquidAccount } from "@/src/stores/createEntityHooks.ts";

export default function CreateLiquidAccountForm() {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { mutate, isPending, isError, error } = useCreateLiquidAccount();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      account_number: formData.get("account_number") as string,
      minimum_balance: Number(formData.get("minimum_balance")) || 0,
    };

    mutate(payload, {
      onSuccess: () => {
        closeButtonRef.current?.click();
      },
    });
  };

  return (
    <DialogContent
      aria-describedby="create liquid account form"
      className="sm:max-w-106.25"
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <DialogHeader>
          <DialogTitle>Create Liquid Account</DialogTitle>
          <DialogDescription>
            Enter the details for your new liquid account below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Account Name */}
          <div className="grid gap-3">
            <Label htmlFor="account-name">Name</Label>
            <Input
              id="account-name"
              name="name"
              placeholder="e.g., High-Yield Savings"
              required
              disabled={isPending}
            />
          </div>

          {/* Account Number */}
          <div className="grid gap-3">
            <Label htmlFor="account-number">Account Number</Label>
            <Input
              id="account-number"
              name="account_number"
              placeholder="Please Enter A/C Number"
              required
              disabled={isPending}
            />
          </div>

          {/* Minimum Balance */}
          <div className="grid gap-3">
            <Label htmlFor="minimum-balance">Minimum Balance</Label>
            <Input
              type="number"
              id="minimum-balance"
              name="minimum_balance"
              defaultValue="0"
              min="0"
              step="any"
              disabled={isPending}
            />
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
            {isPending ? "Creating..." : "Create Liquid Account"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
