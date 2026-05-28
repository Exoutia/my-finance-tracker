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
import { Textarea } from "@/components/ui/textarea.tsx";
import type { ExternalContactCreate } from "@/src/service.ts";
import { useCreateExternalContractEntity } from "@/src/stores/createEntityHooks.ts";

interface CreateExternalContactProps {
  isInstitution: boolean;
}

export default function CreateExternalContact(
  { isInstitution }: CreateExternalContactProps,
) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const { mutate, isPending, isError, error } =
    useCreateExternalContractEntity();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const payload: ExternalContactCreate = {
      name: formData.get("name") as string,
      tags: (formData.get("tags") as string) || null,
      is_institution: isInstitution,
      mobile_number: (formData.get("mobile_number") as string) || null,
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
      aria-describedby="external contact create form"
      className="sm:max-w-106.25"
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <DialogHeader>
          <DialogTitle>
            Create {isInstitution ? "Institution" : "Individual"} Contact
          </DialogTitle>
          <DialogDescription>
            Enter the details for the external contact below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Contact Name */}
          <div className="grid gap-3">
            <Label htmlFor="contact-name">Name</Label>
            <Input
              id="contact-name"
              name="name"
              placeholder={isInstitution ? "e.g., Acme Corp" : "e.g., Jane Doe"}
              required
              disabled={isPending}
            />
          </div>

          {/* Mobile Number */}
          <div className="grid gap-3">
            <Label htmlFor="mobile-number">Mobile Number</Label>
            <Input
              type="tel"
              id="mobile-number"
              name="mobile_number"
              placeholder="e.g., +1234567890"
              disabled={isPending}
            />
          </div>

          {/* Tags */}
          <div className="grid gap-3">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="e.g., Vendor, Client"
              disabled={isPending}
            />
          </div>

          {/* Description */}
          <div className="grid gap-3">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Add optional notes about this contact..."
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
            {isPending ? "Creating..." : "Create Contact"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
