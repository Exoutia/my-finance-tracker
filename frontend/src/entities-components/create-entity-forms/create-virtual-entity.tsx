import React, { useRef } from "react";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { useCreateVirtualEntity } from "@/src/stores/createEntityHooks.ts";
import type { VirtualEntityCreate } from "@/src/service.ts";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";

export default function CreateVirtualEntity() {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { mutate, isPending, isError, error } = useCreateVirtualEntity();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const payload: VirtualEntityCreate = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
    };

    mutate(payload, {
      onSuccess: () => {
        closeButtonRef.current?.click();
      },
    });
  };

  return (
    <DialogContent
      aria-describedby="virtual entity create form"
      className="sm:max-w-106.25"
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <DialogHeader>
          <DialogTitle>Create Virtual Entity</DialogTitle>
          <DialogDescription>
            Add a new virtual tracking entity to your dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Entity Name */}
          <div className="grid gap-3">
            <Label htmlFor="entity-name">Entity Name</Label>
            <Input
              id="entity-name"
              name="name"
              placeholder="e.g., Virtual Wallet Base"
              required
              disabled={isPending}
            />
          </div>

          {/* Description */}
          <div className="grid gap-3">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Provide an optional tracking description..."
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
            {isPending ? "Creating..." : "Create Entity"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
