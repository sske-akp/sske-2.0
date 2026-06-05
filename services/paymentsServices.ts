import { PaymentAPI, Payment } from "@/types/payments";
import { apiFetch } from "@/lib/apiClient";

function mapPaymentAPIToUI(api: PaymentAPI): Payment {
  return {
    id: api.id,
    invoiceId: api.invoice_id,
    customerId: api.customer_id ?? "",
    amount: api.amount,
    paymentMethod: api.payment_method,
    paymentDate: api.payment_date,
    referenceNumber: api.reference_number ?? "",
    notes: api.notes ?? "",
    createdAt: api.created_at ?? "",
  };
}

export async function fetchCustomerPayments(customerId: string): Promise<Payment[]> {
  const data = await apiFetch<PaymentAPI[]>(`/payments/by_customer/${customerId}`);
  return data.map(mapPaymentAPIToUI);
}
