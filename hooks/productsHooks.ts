import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProducts,
  fetchProductsWithBatches,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/productsServices";
import {
  ProductOption,
  ProductWithBatchesAPI,
  Product,
  ProductFormData,
  ProductBrand,
  ProductBrandFormData,
  ProductCategory,
  ProductCategoryFormData,
} from "@/types/products";

// Existing hook for sales form product selection
export function useProducts() {
  return useQuery<ProductOption[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
  });
}

// Products with batches for management table
export function useProductsWithBatches() {
  return useQuery<ProductWithBatchesAPI[], Error>({
    queryKey: ["products", "withBatches"],
    queryFn: fetchProductsWithBatches,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, ProductFormData>({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, { id: string; data: ProductFormData }>({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// --- Brands ---

export function useBrands() {
  return useQuery<ProductBrand[], Error>({
    queryKey: ["productBrands"],
    queryFn: fetchBrands,
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation<ProductBrand, Error, ProductBrandFormData>({
    mutationFn: createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productBrands"] });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation<ProductBrand, Error, { id: string; data: ProductBrandFormData }>({
    mutationFn: ({ id, data }) => updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productBrands"] });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productBrands"] });
    },
  });
}

// --- Categories ---

export function useCategories() {
  return useQuery<ProductCategory[], Error>({
    queryKey: ["productCategories"],
    queryFn: fetchCategories,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation<ProductCategory, Error, ProductCategoryFormData>({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productCategories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation<ProductCategory, Error, { id: string; data: ProductCategoryFormData }>({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productCategories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productCategories"] });
    },
  });
}
