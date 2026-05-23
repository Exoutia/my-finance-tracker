import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createLiquidAccount,
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
