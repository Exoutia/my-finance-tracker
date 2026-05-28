import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";

import CreateLiquidAccountForm from "@/src/create-entity-forms/create-liquid-account.tsx";
import CreateCreditCardForm from "@/src/create-entity-forms/create-credit-card.tsx";
import CreateBondEntity from "@/src/create-entity-forms/create-bond.tsx";
import CreateExternalContact from "@/src/create-entity-forms/create-external-contact.tsx";
import CreateDematAccount from "@/src/create-entity-forms/create-demat-account.tsx";
import CreateFixedDeposit from "@/src/create-entity-forms/create-fixed-deposit.tsx";
import CreateMutualFund from "@/src/create-entity-forms/create-mutual-fund.tsx";
import CreateVirtualEntity from "@/src/create-entity-forms/create-virtual-entity.tsx";
import CreateStock from "@/src/create-entity-forms/create-stock.tsx";

// 1. Map keys cleanly to components outside the render cycle
const FORM_MAP: Record<string, React.ReactElement> = {
  liquid_account: <CreateLiquidAccountForm />,
  credit_card: <CreateCreditCardForm />,
  bonds: <CreateBondEntity />,
  company: <CreateExternalContact isInstitution />,
  person: <CreateExternalContact isInstitution={false} />,
  demat_account: <CreateDematAccount />,
  fixed_deposit_account: <CreateFixedDeposit />,
  mutual_fund: <CreateMutualFund />,
  virtual_entity: <CreateVirtualEntity />,
  stocks: <CreateStock />,
};

interface CreateEntityFormProps {
  createEntityType: string;
}
export default function CreateEntityForms(
  { createEntityType }: CreateEntityFormProps,
) {
  // 2. Instant lookup, O(1) time complexity, zero cognitive load to read
  if (createEntityType && createEntityType in FORM_MAP) {
    return FORM_MAP[createEntityType];
  }

  // 3. Keep fallback logic tight
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          Create{" "}
          {createEntityType ? createEntityType.replace("_", " ") : "Entity"}
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4 text-sm font-medium text-destructive">
        Form configuration not found.
      </div>
    </DialogContent>
  );
}
