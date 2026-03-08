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

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

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
  const response = await fetch(`${baseUrl}/products/with_batches/`);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const data: ProductWithBatchesAPI[] = await response.json();
  return data
    .filter((p) => !p.disabled)
    .map(mapToProductOption)
    .filter((p): p is ProductOption => p !== null);
}

// Fetch all products with batches (includes disabled, for the management table)
export async function fetchProductsWithBatches(): Promise<ProductWithBatchesAPI[]> {
  const response = await fetch(`${baseUrl}/products/with_batches/`);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return response.json();
}

// Create product
export async function createProduct(data: ProductFormData): Promise<Product> {
  const response = await fetch(`${baseUrl}/products/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create product");
  }
  return response.json();
}

// Update product
export async function updateProduct(id: string, data: ProductFormData): Promise<Product> {
  const response = await fetch(`${baseUrl}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update product");
  }
  return response.json();
}

// Soft-delete (disable) product
export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`${baseUrl}/products/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete product");
  }
}

// --- Brands ---

export async function fetchBrands(): Promise<ProductBrand[]> {
  const response = await fetch(`${baseUrl}/product_brands/`);
  if (!response.ok) {
    throw new Error("Failed to fetch brands");
  }
  return response.json();
}

export async function createBrand(data: ProductBrandFormData): Promise<ProductBrand> {
  const response = await fetch(`${baseUrl}/product_brands/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create brand");
  }
  return response.json();
}

export async function updateBrand(id: string, data: ProductBrandFormData): Promise<ProductBrand> {
  const response = await fetch(`${baseUrl}/product_brands/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update brand");
  }
  return response.json();
}

export async function deleteBrand(id: string): Promise<void> {
  const response = await fetch(`${baseUrl}/product_brands/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete brand");
  }
}

// --- Categories ---

export async function fetchCategories(): Promise<ProductCategory[]> {
  const response = await fetch(`${baseUrl}/product_categories/`);
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

export async function createCategory(data: ProductCategoryFormData): Promise<ProductCategory> {
  const response = await fetch(`${baseUrl}/product_categories/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create category");
  }
  return response.json();
}

export async function updateCategory(id: string, data: ProductCategoryFormData): Promise<ProductCategory> {
  const response = await fetch(`${baseUrl}/product_categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update category");
  }
  return response.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`${baseUrl}/product_categories/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete category");
  }
}
