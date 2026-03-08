// Backend API response shapes (snake_case)

export interface InvoiceItemAPI {
  id: string;
  invoice_id: string | null;
  product_id: string | null;
  batch_id: string | null;
  quantity: number | null;
  selling_price: number | null;
  tax_percent: number | null;
  total_price: number | null;
  is_official: boolean | null;
  reference_item_id: string | null;
}

export interface InvoiceAPI {
  id: string;
  invoice_number: string;
  customer_id: string | null;
  invoice_date: string | null;
  invoice_type: string | null;
  total_amount: number | null;
  created_at: string | null;
  updated_at: string | null;
  status: string | null;
  reference_invoice_id: string | null;
  payment_status: string | null;
  payment_method: string | null;
  due_date: string | null;
  amount_paid: number | null;
  items: InvoiceItemAPI[];
}

// UI shapes (camelCase)

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  invoiceDate: string;
  invoiceType: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
  status: string;
  referenceInvoiceId: string | null;
  paymentStatus: string;
  paymentMethod: string;
  dueDate: string | null;
  amountPaid: number;
}

// Detailed invoice for print/view (includes resolved line items)

export interface InvoiceDetailItem {
  id: string;
  productId: string;
  batchId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  taxPercent: number;
  totalPrice: number;
}

export interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  invoiceType: string;
  status: string;
  referenceInvoiceId: string | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerGst: string;
  invoiceDate: string;
  totalAmount: number;
  items: InvoiceDetailItem[];
  subtotal: number;
  gstAmount: number;
}

// Form data shapes for creating invoices

export interface InvoiceItemFormData {
  productId: string;
  batchId: string | null;
  quantity: number;
  sellingPrice: number;
  taxPercent: number;
  totalPrice: number;
}

export interface InvoiceFormData {
  invoiceNumber: string;
  customerId: string | null;
  invoiceDate: string;
  invoiceType: string;
  totalAmount: number;
  paymentMethod?: string;
  dueDate?: string | null;
  items: InvoiceItemFormData[];
}

export interface PaymentFormData {
  invoiceId: string;
  customerId?: string | null;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface CreditNoteItemFormData {
  referenceItemId: string;
  productId: string;
  batchId: string;
  quantity: number;
  sellingPrice: number;
  taxPercent: number;
  totalPrice: number;
}

export interface CreditNoteFormData {
  referenceInvoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceType: "credit_note";
  totalAmount: number;
  items: CreditNoteItemFormData[];
}
