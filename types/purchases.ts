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

// --- Purchase Bill (bill-wise A/P tracking) ---

export interface PurchaseBillItemFormData {
  productId: string;
  quantity: number;
  purchasePrice: number; // per-unit, ex-GST
  taxPercent: number; // input GST rate
}

export interface PurchaseBillFormData {
  supplierId: string | null;
  billNumber: string;
  billDate: string;
  dueDate: string | null;
  items: PurchaseBillItemFormData[];
}

export interface CreatePurchaseBillResult {
  id: string;
  total_amount: number | null;
}

export interface SupplierPaymentFormData {
  purchaseBillId: string;
  supplierId?: string | null;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  referenceNumber?: string | null;
  notes?: string | null;
}

// Backend API shape for a purchase bill
export interface PurchaseBillAPI {
  id: string;
  bill_number: string | null;
  supplier_id: string | null;
  bill_date: string | null;
  due_date: string | null;
  total_amount: number | null;
  amount_paid: number | null;
  payment_status: string | null;
  status: string | null;
  notes: string | null;
  created_at: string | null;
}

// UI shape for the purchase-bills list (resolved names + computed balance)
export interface PurchaseBillSummary {
  id: string;
  billNumber: string;
  supplierId: string | null;
  supplierName: string;
  billDate: string;
  dueDate: string | null;
  totalAmount: number;
  amountPaid: number;
  remaining: number;
  paymentStatus: string;
}
