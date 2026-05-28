import React, { useRef } from "react";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { useCreateMutualFund } from "@/src/stores/createEntityHooks.ts";
import type { MutualFundCreate, MutualFundType } from "@/src/service.ts";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";

export default function CreateMutualFund() {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { mutate, isPending, isError, error } = useCreateMutualFund();
  const MUTUAL_FUND_TYPES: MutualFundType[] = [
    "equity",
    "debt",
    "hybrid",
    "elss",
    "index",
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const payload: MutualFundCreate = {
      name: formData.get("name") as string,
      type: formData.get("type") as MutualFundType,
    };

    mutate(payload, {
      onSuccess: () => {
        closeButtonRef.current?.click();
      },
    });
  };

  return (
    <DialogContent
      aria-describedby="mutual fund create form"
      className="sm:max-w-106.25"
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <DialogHeader>
          <DialogTitle>Create Mutual Fund</DialogTitle>
          <DialogDescription>
            Add a new mutual fund tracking entity.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Fund Name */}
          <div className="grid gap-3">
            <Label htmlFor="fund-name">Fund Name</Label>
            <Input
              id="fund-name"
              name="name"
              placeholder="e.g., Parag Parikh Flexi Cap Fund"
              required
              disabled={isPending}
            />
          </div>

          {/* Fund Type Selection */}
          <div className="grid gap-3">
            <Label htmlFor="fund-type">Fund Type</Label>
            <select
              id="fund-type"
              name="type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
              defaultValue=""
              disabled={isPending}
            >
              <option value="" disabled>Select fund structure type</option>
              {MUTUAL_FUND_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
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
            {isPending ? "Creating..." : "Create Fund"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
