import React, { useRef } from "react";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { useCreateStock } from "@/src/stores/createEntityHooks.ts";
import type { StockCreate } from "@/src/service.ts";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";

export default function CreateStock() {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { mutate, isPending, isError, error } = useCreateStock();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const payload: StockCreate = {
      symbol: (formData.get("symbol") as string).toUpperCase(), // Force upper case symbols like AAPL or TSLA
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
      aria-describedby="stock create form"
      className="sm:max-w-106.25"
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <DialogHeader>
          <DialogTitle>Create Stock Entity</DialogTitle>
          <DialogDescription>
            Add a new equity stock tracker to your portfolio.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Stock Ticker Symbol */}
          <div className="grid gap-3">
            <Label htmlFor="stock-symbol">Ticker Symbol</Label>
            <Input
              id="stock-symbol"
              name="symbol"
              placeholder="e.g., AAPL, GOOGL, TSLA"
              required
              disabled={isPending}
              style={{ textTransform: "uppercase" }}
            />
          </div>

          {/* Stock Company Name */}
          <div className="grid gap-3">
            <Label htmlFor="stock-name">Company Name</Label>
            <Input
              id="stock-name"
              name="name"
              placeholder="e.g., Apple Inc."
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
            {isPending ? "Creating..." : "Create Stock"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
