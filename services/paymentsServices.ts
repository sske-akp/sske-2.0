import { PaymentAPI, Payment } from "@/types/payments";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

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
  const response = await fetch(`${baseUrl}/payments/by_customer/${customerId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch customer payments");
  }
  const data: PaymentAPI[] = await response.json();
  return data.map(mapPaymentAPIToUI);
}
