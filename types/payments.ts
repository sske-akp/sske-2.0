// Backend API response shape (snake_case)
export interface PaymentAPI {
  id: string;
  invoice_id: string;
  customer_id: string | null;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference_number: string | null;
  notes: string | null;
  journal_entry_id: string | null;
  created_at: string | null;
}

// Frontend UI shape (camelCase)
export interface Payment {
  id: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  referenceNumber: string;
  notes: string;
  createdAt: string;
}
