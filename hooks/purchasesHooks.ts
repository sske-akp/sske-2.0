import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPurchases,
  createPurchase,
  deletePurchase,
  fetchPurchasesByIds,
  CreatePurchaseResult,
} from "@/services/purchasesServices";
import { Purchase, PurchaseFormData } from "@/types/purchases";

export function usePurchases() {
  return useQuery<Purchase[], Error>({
    queryKey: ["purchases"],
    queryFn: fetchPurchases,
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  return useMutation<CreatePurchaseResult, Error, PurchaseFormData>({
    mutationFn: createPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeletePurchase() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deletePurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });
}

export function usePurchaseDetail(batchIds: string[]) {
  return useQuery<Purchase[], Error>({
    queryKey: ["purchaseDetail", batchIds],
    queryFn: () => fetchPurchasesByIds(batchIds),
    enabled: batchIds.length > 0,
  });
}
