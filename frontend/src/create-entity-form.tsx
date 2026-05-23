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
import { useCreateEntityTypeStore } from "@/src/stores/createEntityStore.ts";
import { useCreateLiquidAccount } from "@/src/stores/useCreateLiquidAccount.ts";

export default function CreateEntity() {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { mutate, isPending, isError, error } = useCreateLiquidAccount();

  const createEntityType = useCreateEntityTypeStore((state) =>
    state.selectedValue
  );

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

  // Condition check happens first, render form inside DialogContent
  if (createEntityType !== "liquid_account") {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create {createEntityType}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">Not Found</div>
      </DialogContent>
    );
  }

  return (
    <DialogContent
      aria-describedby="create liquid account form"
      className="sm:max-w-106.25"
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <DialogHeader>
          <DialogTitle>Create Liquid Account</DialogTitle>
          <DialogDescription>
            Enter all the details
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="name-1">Name</Label>
            <Input
              id="name-1"
              name="name"
              placeholder="Please Enter Name"
              required
              disabled={isPending}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="username-1">Account Number</Label>
            <Input
              id="username-1"
              name="account_number"
              placeholder="Please Enter A/C Number"
              required
              disabled={isPending}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="minimum-balance-1">Minimum Balance</Label>
            <Input
              type="number"
              id="minimum-balance-1"
              name="minimum_balance"
              defaultValue="0"
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
