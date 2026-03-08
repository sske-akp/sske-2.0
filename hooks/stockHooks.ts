import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchStock,
  fetchStockDetails,
  fetchAuditRows,
  adjustStock,
} from "@/services/stockServices";
import { StockItem, StockBatchDetail, StockAdjustment, AuditRow } from "@/types/stock";

export function useStock() {
  return useQuery<StockItem[], Error>({
    queryKey: ["stock"],
    queryFn: fetchStock,
  });
}

export function useStockDetails(productId: string) {
  return useQuery<StockBatchDetail[], Error>({
    queryKey: ["stockDetails", productId],
    queryFn: () => fetchStockDetails(productId),
    enabled: !!productId,
  });
}

export function useAuditRows() {
  return useQuery<
    { rows: AuditRow[]; categories: { id: string; name: string }[] },
    Error
  >({
    queryKey: ["auditRows"],
    queryFn: fetchAuditRows,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, StockAdjustment[]>({
    mutationFn: adjustStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["stockDetails"] });
      queryClient.invalidateQueries({ queryKey: ["auditRows"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
