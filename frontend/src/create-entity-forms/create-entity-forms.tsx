import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { useCreateEntityTypeStore } from "@/src/stores/createEntityStore.ts";
import CreateLiquidAccountForm from "@/src/create-entity-forms/create-liquid-account.tsx";
import CreateCreditCardForm from "@/src/create-entity-forms/create-credit-card.tsx";

export default function CreateEntityForms() {
  const createEntityType = useCreateEntityTypeStore((state) =>
    state.selectedValue
  );

  // Condition check happens first, render form inside DialogContent
  if (createEntityType === "liquid_account") {
    return <CreateLiquidAccountForm />;
  }

  if (createEntityType === "credit_card") {
    return <CreateCreditCardForm />;
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create {createEntityType}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4">Not Found</div>
    </DialogContent>
  );
}
