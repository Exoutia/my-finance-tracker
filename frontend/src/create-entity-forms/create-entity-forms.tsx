import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { useCreateEntityTypeStore } from "@/src/stores/createEntityStore.ts";
import CreateLiquidAccountForm from "@/src/create-entity-forms/create-liquid-account.tsx";
import CreateCreditCardForm from "@/src/create-entity-forms/create-credit-card.tsx";
import CreateBondEntity from "@/src/create-entity-forms/create-bond.tsx";
import CreateExternalContact from "@/src/create-entity-forms/create-external-contract.tsx";

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

  if (createEntityType === "bonds") {
    return <CreateBondEntity />;
  }

  if (createEntityType === "company") {
    return <CreateExternalContact isInstitution />;
  }

  if (createEntityType === "person") {
    return <CreateExternalContact isInstitution={false} />;
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
