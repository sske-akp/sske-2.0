// Backend API response for ProductBatch (snake_case)
export interface ProductBatchResponseAPI {
  id: string;
  product_id: string | null;
  supplier_id: string | null;
  batch_code: string | null;
  purchase_price: number | null;
  quantity: number | null;
  remaining_qty: number | null;
  purchase_date: string | null;
  source_type: string | null;
  status: string | null;
  disabled: boolean;
  discount_value: number | null;
  created_at: string | null;
}

// UI shape for the purchases list (resolved names)
export interface Purchase {
  id: string;
  productName: string;
  supplierName: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  purchaseDate: string;
  status: string;
}

// Form data for creating a purchase (batch of product batches)
export interface PurchaseItemFormData {
  productId: string;
  quantity: number;
  purchasePrice: number;
}

export interface PurchaseFormData {
  supplierId: string | null;
  purchaseDate: string;
  status: string;
  items: PurchaseItemFormData[];
}
