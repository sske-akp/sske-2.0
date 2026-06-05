import { Customer, CustomerAPI, CustomerFormData } from "@/types/customers";
import { InvoiceAPI } from "@/types/invoices";
import { apiFetch } from "@/lib/apiClient";

export interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceType: string;
  totalAmount: number;
  paymentStatus: string;
  amountPaid: number;
  status: string;
}

function mapAPIToCustomer(api: CustomerAPI): Customer {
  return {
    id: api.id,
    name: api.name ?? "",
    phone: api.phone_number ?? "",
    email: api.email ?? "",
    gst: api.gstin ?? "",
    address: api.address ?? "",
    notes: api.notes ?? "",
  };
}

function mapFormToAPI(form: CustomerFormData) {
  return {
    name: form.name || null,
    phone_number: form.phone || null,
    email: form.email || null,
    gstin: form.gst || null,
    address: form.address || null,
    notes: form.notes || null,
  };
}

export async function fetchCustomers(): Promise<Customer[]> {
  const data = await apiFetch<CustomerAPI[]>("/customers/");
  return data.map(mapAPIToCustomer);
}

export async function createCustomer(form: CustomerFormData): Promise<Customer> {
  const data = await apiFetch<CustomerAPI>("/customers/", {
    method: "POST",
    json: mapFormToAPI(form),
  });
  return mapAPIToCustomer(data);
}

export async function updateCustomer(id: string, form: CustomerFormData): Promise<Customer> {
  const data = await apiFetch<CustomerAPI>(`/customers/${id}`, {
    method: "PUT",
    json: mapFormToAPI(form),
  });
  return mapAPIToCustomer(data);
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiFetch<void>(`/customers/${id}`, { method: "DELETE", parse: "none" });
}

export async function fetchCustomerById(id: string): Promise<Customer> {
  const data = await apiFetch<CustomerAPI>(`/customers/${id}`);
  return mapAPIToCustomer(data);
}

export async function fetchCustomerInvoices(customerId: string): Promise<CustomerInvoice[]> {
  const data = await apiFetch<InvoiceAPI[]>("/invoices/");
  return data
    .filter((inv) => inv.customer_id === customerId)
    .map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      invoiceDate: inv.invoice_date ?? "",
      invoiceType: inv.invoice_type ?? "sale",
      totalAmount: inv.total_amount ?? 0,
      paymentStatus: inv.payment_status ?? "unpaid",
      amountPaid: inv.amount_paid ?? 0,
      status: inv.status ?? "active",
    }));
}
