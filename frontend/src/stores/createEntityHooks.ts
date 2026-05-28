import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type BondCreate,
  createBondEntity,
  createCreditCardEntity,
  createDematAccount,
  createExternalContactEntity,
  createFixedDeposit,
  createLiquidAccount,
  createMutualFund,
  createStock,
  createVirtualEntity,
  type CreditCardCreate,
  type DematAccountCreate,
  type ExternalContactCreate,
  type FixedDepositCreate,
  type LiquidAccountCreate,
  type MutualFundCreate,
  type StockCreate,
  type VirtualEntityCreate,
} from "@/src/service.ts";

/**
 * Reusable mutation side-effects handler to eliminate 50 lines of duplicate garbage.
 */
const useMutationOptions = (entityName: string) => {
  const queryClient = useQueryClient();

  return {
    onSuccess: (data: unknown) => {
      console.log(`Successfully created ${entityName}:`, data);
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
    onError: (error: Error) => {
      console.error(`Mutation failed for ${entityName}:`, error.message);
    },
  };
};

export function useCreateLiquidAccount() {
  const options = useMutationOptions("liquid account");
  return useMutation({
    mutationFn: async (data: LiquidAccountCreate) => {
      const result = await createLiquidAccount(data);
      if (!result) throw new Error("Failed to create liquid account");
      return result;
    },
    ...options,
  });
}

export function useCreateCreditCard() {
  const options = useMutationOptions("credit card");
  return useMutation({
    mutationFn: async (data: CreditCardCreate) => {
      const result = await createCreditCardEntity(data);
      if (!result) throw new Error("Failed to create credit card account");
      return result;
    },
    ...options,
  });
}

export function useCreateBond() {
  const options = useMutationOptions("bond");
  return useMutation({
    mutationFn: async (data: BondCreate) => {
      const result = await createBondEntity(data);
      if (!result) throw new Error("Failed to create bond");
      return result;
    },
    ...options,
  });
}

export function useCreateExternalContact() {
  const options = useMutationOptions("external contact");
  return useMutation({
    mutationFn: async (data: ExternalContactCreate) => {
      const result = await createExternalContactEntity(data);
      if (!result) {
        throw new Error(
          `Failed to create ${
            data.is_institution ? "Company entity" : "Person entity"
          }`,
        );
      }
      return result;
    },
    ...options,
  });
}

export function useCreateDematAccount() {
  const options = useMutationOptions("demat account");
  return useMutation({
    mutationFn: async (data: DematAccountCreate) => {
      const result = await createDematAccount(data);
      if (!result) throw new Error("Failed to create demat account");
      return result;
    },
    ...options,
  });
}

export function useCreateFixedDeposit() {
  const options = useMutationOptions("fixed deposit");
  return useMutation({
    mutationFn: async (data: FixedDepositCreate) => {
      const result = await createFixedDeposit(data);
      if (!result) throw new Error("Failed to create fixed deposit record");
      return result;
    },
    ...options,
  });
}

export function useCreateMutualFund() {
  const options = useMutationOptions("mutual fund");
  return useMutation({
    mutationFn: async (data: MutualFundCreate) => {
      const result = await createMutualFund(data);
      if (!result) throw new Error("Failed to create mutual fund entity");
      return result;
    },
    ...options,
  });
}

export function useCreateVirtualEntity() {
  const options = useMutationOptions("virtual entity");
  return useMutation({
    mutationFn: async (data: VirtualEntityCreate) => {
      const result = await createVirtualEntity(data);
      if (!result) throw new Error("Failed to create virtual entity");
      return result;
    },
    ...options,
  });
}

export function useCreateStock() {
  const options = useMutationOptions("stock");
  return useMutation({
    mutationFn: async (data: StockCreate) => {
      const result = await createStock(data);
      if (!result) throw new Error("Failed to create stock asset");
      return result;
    },
    ...options,
  });
}
