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
import CreateDematAccount from "@/src/create-entity-forms/create-demat-account.tsx";
import CreateFixedDeposit from "@/src/create-entity-forms/create-fixed-deposit.tsx";
import CreateMutualFund from "@/src/create-entity-forms/create-mutual-fund.tsx";

export default function CreateEntityForms() {
  const createEntityType = useCreateEntityTypeStore((state) =>
    state.selectedValue
  );

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

  if (createEntityType === "demat_account") {
    return <CreateDematAccount />;
  }

  if (createEntityType === "fixed_deposit_account") {
    return <CreateFixedDeposit />;
  }

  if (createEntityType === "mutual_fund") {
    return <CreateMutualFund />;
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
