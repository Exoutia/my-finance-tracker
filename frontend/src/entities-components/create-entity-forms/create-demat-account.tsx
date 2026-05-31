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
import { useCreateDematAccount } from "@/src/stores/createEntityHooks.ts";
import type { DematAccountCreate } from "@/src/service.ts";

export default function CreateDematAccount() {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { mutate, isPending, isError, error } = useCreateDematAccount();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const payload: DematAccountCreate = {
      name: formData.get("name") as string,
      account_number: formData.get("account_number") as string,
      depository_participant: formData.get("depository_participant") as string,
      dp_id: formData.get("dp_id") as string,
    };

    mutate(payload, {
      onSuccess: () => {
        closeButtonRef.current?.click();
      },
    });
  };

  return (
    <DialogContent
      aria-describedby="demat account create form"
      className="sm:max-w-106.25"
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <DialogHeader>
          <DialogTitle>Create Demat Account</DialogTitle>
          <DialogDescription>
            Enter your brokerage or depository details below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Account Name Nickname */}
          <div className="grid gap-3">
            <Label htmlFor="account-name">Account Name</Label>
            <Input
              id="account-name"
              name="name"
              placeholder="e.g., Primary Zerodha Account"
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
              placeholder="Enter unique account number (min 8 characters)"
              required
              minLength={8}
              disabled={isPending}
            />
          </div>

          {/* Depository Participant */}
          <div className="grid gap-3">
            <Label htmlFor="depository-participant">
              Depository Participant (Broker)
            </Label>
            <Input
              id="depository-participant"
              name="depository_participant"
              placeholder="e.g., Zerodha, Groww, AngelOne"
              required
              disabled={isPending}
            />
          </div>

          {/* DP ID */}
          <div className="grid gap-3">
            <Label htmlFor="dp-id">DP ID</Label>
            <Input
              id="dp-id"
              name="dp_id"
              placeholder="Enter Depository Participant ID"
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
            {isPending ? "Creating..." : "Create Account"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
