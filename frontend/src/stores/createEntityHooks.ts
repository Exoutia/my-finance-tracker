import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type BondCreate,
  createBondEntity,
  createCreditCardEntity,
  createLiquidAccount,
  type CreditCardCreate,
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

export function useCreditCardEntity() {
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

export function useBondEntity() {
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
