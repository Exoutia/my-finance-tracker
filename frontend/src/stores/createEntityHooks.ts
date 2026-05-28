import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type BondCreate,
  createBondEntity,
  createCreditCardEntity,
  createDematAccount,
  createExternalContractEntity,
  createFixedDeposit,
  createLiquidAccount,
  createMutualFund,
  type CreditCardCreate,
  type DematAccountCreate,
  type ExternalContactCreate,
  type FixedDepositCreate,
  type LiquidAccountCreate,
  type MutualFundCreate,
} from "@/src/service.ts";

export function useCreateLiquidAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LiquidAccountCreate) => {
      const result = await createLiquidAccount(data);
      if (result === null) {
        throw new Error("Failed to create liquid account");
      }
      return result;
    },
    onSuccess: (newAccount) => {
      console.log("Successfully created:", newAccount);

      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
    onError: (error) => {
      console.error("Mutation failed:", error.message);
    },
  });
}

export function useCreateCreditCardEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreditCardCreate) => {
      const result = await createCreditCardEntity(data);
      if (result === null) {
        throw new Error("Failed to create credit card account");
      }
      return result;
    },
    onSuccess: (newAccount) => {
      console.log("Successfully created:", newAccount);

      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
    onError: (error) => {
      console.error("Mutation failed:", error.message);
    },
  });
}

export function useCreateBondEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BondCreate) => {
      const result = await createBondEntity(data);
      if (result === null) {
        throw new Error("Failed to create bond");
      }
      return result;
    },
    onSuccess: (newAccount) => {
      console.log("Successfully created:", newAccount);

      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
    onError: (error) => {
      console.error("Mutation failed:", error.message);
    },
  });
}

export function useCreateExternalContractEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ExternalContactCreate) => {
      const result = await createExternalContractEntity(data);
      if (result === null) {
        throw new Error(
          "Failed to create " +
            (data.is_institution ? "Company enntity" : "Person entity"),
        );
      }
      return result;
    },
    onSuccess: (newAccount) => {
      console.log("Successfully created:", newAccount);

      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
    onError: (error) => {
      console.error("Mutation failed:", error.message);
    },
  });
}

export function useCreateDematAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DematAccountCreate) => {
      // Swapped name to match the cleaner "createDematAccount" convention
      const result = await createDematAccount(data);
      if (result === null) {
        throw new Error("Failed to create demat account");
      }
      return result;
    },
    onSuccess: (newAccount) => {
      console.log("Successfully created demat account:", newAccount);
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
    onError: (error) => {
      console.error("Mutation failed:", error.message);
    },
  });
}

export function useCreateFixedDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FixedDepositCreate) => {
      const result = await createFixedDeposit(data);
      if (result === null) {
        throw new Error("Failed to create fixed deposit record");
      }
      return result;
    },
    onSuccess: (newFD) => {
      console.log("Successfully created fixed deposit:", newFD);
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
    onError: (error) => {
      console.error("Mutation failed:", error.message);
    },
  });
}

export function useCreateMutualFund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MutualFundCreate) => {
      const result = await createMutualFund(data);
      if (result === null) {
        throw new Error("Failed to create mutual fund entity");
      }
      return result;
    },
    onSuccess: (newFund) => {
      console.log("Successfully created mutual fund:", newFund);
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
    onError: (error) => {
      console.error("Mutation failed:", error.message);
    },
  });
}
