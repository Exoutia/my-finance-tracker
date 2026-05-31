import React, { useRef, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

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

  const [mutualFundType, setMutualFundType] = useState("");

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
            <Select
              required
              name="type"
              value={mutualFundType}
              onValueChange={setMutualFundType}
            >
              <SelectTrigger
                id="fund-type"
                className="w-full"
              >
                <SelectValue placeholder="Select Entity Type">
                  {mutualFundType.charAt(0).toUpperCase() +
                    mutualFundType.slice(1).toLowerCase()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent position="item-aligned">
                <SelectGroup>
                  <SelectLabel>Mutual Fund Type</SelectLabel>
                  {MUTUAL_FUND_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() +
                        type.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
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
