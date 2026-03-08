export interface Product {
  item: string;
  hsncode: string;
  unit: string;
  brand_id: string;
  category_id: string;
  disabled: boolean;
  id: string;
  created_at: string;
  updated_at: string;
}

// Backend API response shapes from /products/with_batches/
export interface ProductBatchAPI {
  id: string;
  product_id: string | null;
  batch_code: string | null;
  purchase_price: number | null;
  quantity: number | null;
  remaining_qty: number | null;
  purchase_date: string | null;
  source_type: string | null;
  disabled: boolean;
  discount_value: number | null;
  created_at: string | null;
}

export interface ProductWithBatchesAPI {
  id: string;
  item: string;
  hsncode: string | null;
  unit: string | null;
  brand_id: string | null;
  category_id: string | null;
  gst_rate: number | null;
  disabled: boolean;
  created_at: string | null;
  updated_at: string | null;
  batches: ProductBatchAPI[];
}

// UI-friendly shape for product selection (combobox in sales form)
export interface ProductOption {
  productId: string;
  productName: string;
  batchId: string | null;
  pricePerUnit: number;
  availableQty: number;
  gstRate: number;
}

// Product form data for create/update
export interface ProductFormData {
  item: string;
  hsncode?: string;
  unit?: string;
  brand_id?: string | null;
  category_id?: string | null;
  gst_rate?: number;
  disabled?: boolean;
}

// Product Brand
export interface ProductBrand {
  id: string;
  brand: string | null;
  company: string | null;
  disabled: boolean;
}

export interface ProductBrandFormData {
  brand?: string | null;
  company?: string | null;
  disabled?: boolean;
}

// Product Category
export interface ProductCategory {
  id: string;
  name: string | null;
  disabled: boolean;
}

export interface ProductCategoryFormData {
  name?: string | null;
  disabled?: boolean;
}
