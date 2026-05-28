import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type BondCreate,
  createBondEntity,
  createCreditCardEntity,
  createExternalContractEntity,
  createLiquidAccount,
  type CreditCardCreate,
  type ExternalContactCreate,
  type LiquidAccountCreate,
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
