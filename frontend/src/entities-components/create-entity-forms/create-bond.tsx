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
import { useCreateBond } from "@/src/stores/createEntityHooks.ts";
import type { BondCreate } from "@/src/service.ts";

export default function CreateBondEntity() {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { mutate, isPending, isError, error } = useCreateBond();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const maturityDateValue = formData.get("maturity_date")?.toString() ?? "";

    const payload: BondCreate = {
      unique_id: formData.get("unique_id") as string,
      maturity_date: new Date(maturityDateValue),
      face_value: formData.get("face_value") as string,
      coupon_interest_rate: formData.get("coupon_interest_rate") as string,
      name: formData.get("name") as string,
    };

    mutate(payload, {
      onSuccess: () => {
        closeButtonRef.current?.click();
      },
    });
  };

  return (
    <DialogContent
      aria-describedby="bond create form"
      className="sm:max-w-106.25"
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <DialogHeader>
          <DialogTitle>Create Bond Entity</DialogTitle>
          <DialogDescription>
            Enter your bond details below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Bond Name */}
          <div className="grid gap-3">
            <Label htmlFor="bond-name">Bond Name</Label>
            <Input
              id="bond-name"
              name="name" // Matches payload name
              placeholder="e.g., Corporate Bond A"
              required
              disabled={isPending}
            />
          </div>

          {/* Unique ID */}
          <div className="grid gap-3">
            <Label htmlFor="unique-id">Unique ID</Label>
            <Input
              id="unique-id"
              name="unique_id" // Matches payload unique_id
              placeholder="Enter Unique ID"
              required
              disabled={isPending}
            />
          </div>

          {/* Face Value */}
          <div className="grid gap-3">
            <Label htmlFor="face-value">Face Value</Label>
            <Input
              type="number"
              id="face-value"
              name="face_value" // Matches payload face_value
              placeholder="Enter Face Value"
              required
              disabled={isPending}
            />
          </div>

          {/* Coupon Interest Rate */}
          <div className="grid gap-3">
            <Label htmlFor="interest-rate">Coupon Interest Rate (%)</Label>
            <Input
              type="number"
              step="0.01"
              id="interest-rate"
              name="coupon_interest_rate" // Matches payload coupon_interest_rate
              placeholder="e.g., 5.5"
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
              name="maturity_date" // Matches payload maturity_date
              required
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
            {isPending ? "Creating..." : "Create Bond"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
