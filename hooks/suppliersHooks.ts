import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from "@/services/suppliersServices";
import { Supplier, SupplierFormData } from "@/types/suppliers";

export function useSuppliers() {
  return useQuery<Supplier[], Error>({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation<Supplier, Error, SupplierFormData>({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation<Supplier, Error, { id: string; data: SupplierFormData }>({
    mutationFn: ({ id, data }) => updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}
