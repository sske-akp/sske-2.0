import {
  ProductWithBatchesAPI,
  ProductOption,
  Product,
  ProductFormData,
  ProductBrand,
  ProductBrandFormData,
  ProductCategory,
  ProductCategoryFormData,
} from "@/types/products";
import { apiFetch } from "@/lib/apiClient";

function mapToProductOption(api: ProductWithBatchesAPI): ProductOption | null {
  const activeBatch = api.batches.find(
    (b) => !b.disabled && (b.remaining_qty ?? 0) > 0
  );

  return {
    productId: api.id,
    productName: api.item,
    batchId: activeBatch?.id ?? null,
    pricePerUnit: activeBatch?.purchase_price ?? 0,
    availableQty: activeBatch?.remaining_qty ?? 0,
    gstRate: api.gst_rate ?? 18,
  };
}

export async function fetchProducts(): Promise<ProductOption[]> {
  const data = await apiFetch<ProductWithBatchesAPI[]>("/products/with_batches/");
  return data
    .filter((p) => !p.disabled)
    .map(mapToProductOption)
    .filter((p): p is ProductOption => p !== null);
}

// Fetch all products with batches (includes disabled, for the management table)
export async function fetchProductsWithBatches(): Promise<ProductWithBatchesAPI[]> {
  return apiFetch<ProductWithBatchesAPI[]>("/products/with_batches/");
}

// Create product
export async function createProduct(data: ProductFormData): Promise<Product> {
  return apiFetch<Product>("/products/", { method: "POST", json: data });
}

// Update product
export async function updateProduct(id: string, data: ProductFormData): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, { method: "PUT", json: data });
}

// Soft-delete (disable) product
export async function deleteProduct(id: string): Promise<void> {
  await apiFetch<void>(`/products/${id}`, { method: "DELETE", parse: "none" });
}

// --- Brands ---

export async function fetchBrands(): Promise<ProductBrand[]> {
  return apiFetch<ProductBrand[]>("/product_brands/");
}

export async function createBrand(data: ProductBrandFormData): Promise<ProductBrand> {
  return apiFetch<ProductBrand>("/product_brands/", { method: "POST", json: data });
}

export async function updateBrand(id: string, data: ProductBrandFormData): Promise<ProductBrand> {
  return apiFetch<ProductBrand>(`/product_brands/${id}`, { method: "PUT", json: data });
}

export async function deleteBrand(id: string): Promise<void> {
  await apiFetch<void>(`/product_brands/${id}`, { method: "DELETE", parse: "none" });
}

// --- Categories ---

export async function fetchCategories(): Promise<ProductCategory[]> {
  return apiFetch<ProductCategory[]>("/product_categories/");
}

export async function createCategory(data: ProductCategoryFormData): Promise<ProductCategory> {
  return apiFetch<ProductCategory>("/product_categories/", { method: "POST", json: data });
}

export async function updateCategory(id: string, data: ProductCategoryFormData): Promise<ProductCategory> {
  return apiFetch<ProductCategory>(`/product_categories/${id}`, { method: "PUT", json: data });
}

export async function deleteCategory(id: string): Promise<void> {
  await apiFetch<void>(`/product_categories/${id}`, { method: "DELETE", parse: "none" });
}
