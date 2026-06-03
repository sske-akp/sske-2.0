import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPurchases,
  createPurchase,
  deletePurchase,
  fetchPurchasesByIds,
  createPurchaseBill,
  recordSupplierPayment,
  fetchPurchaseBills,
  CreatePurchaseResult,
} from "@/services/purchasesServices";
import {
  Purchase,
  PurchaseFormData,
  PurchaseBillFormData,
  CreatePurchaseBillResult,
  SupplierPaymentFormData,
  PurchaseBillSummary,
} from "@/types/purchases";

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

export function usePurchaseBills() {
  return useQuery<PurchaseBillSummary[], Error>({
    queryKey: ["purchaseBills"],
    queryFn: fetchPurchaseBills,
  });
}

export function useCreatePurchaseBill() {
  const queryClient = useQueryClient();
  return useMutation<CreatePurchaseBillResult, Error, PurchaseBillFormData>({
    mutationFn: createPurchaseBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchaseBills"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
    },
  });
}

export function useRecordSupplierPayment() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, Error, SupplierPaymentFormData>({
    mutationFn: recordSupplierPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseBills"] });
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });
}
