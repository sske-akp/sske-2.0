import { Customer, CustomerAPI, CustomerFormData } from "@/types/customers";
import { InvoiceAPI } from "@/types/invoices";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

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
  const response = await fetch(`${baseUrl}/customers/`);
  if (!response.ok) {
    throw new Error("Failed to fetch customers");
  }
  const data: CustomerAPI[] = await response.json();
  return data.map(mapAPIToCustomer);
}

export async function createCustomer(form: CustomerFormData): Promise<Customer> {
  const response = await fetch(`${baseUrl}/customers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapFormToAPI(form)),
  });
  if (!response.ok) {
    throw new Error("Failed to create customer");
  }
  const data: CustomerAPI = await response.json();
  return mapAPIToCustomer(data);
}

export async function updateCustomer(id: string, form: CustomerFormData): Promise<Customer> {
  const response = await fetch(`${baseUrl}/customers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapFormToAPI(form)),
  });
  if (!response.ok) {
    throw new Error("Failed to update customer");
  }
  const data: CustomerAPI = await response.json();
  return mapAPIToCustomer(data);
}

export async function deleteCustomer(id: string): Promise<void> {
  const response = await fetch(`${baseUrl}/customers/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete customer");
  }
}

export async function fetchCustomerById(id: string): Promise<Customer> {
  const response = await fetch(`${baseUrl}/customers/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch customer");
  }
  const data: CustomerAPI = await response.json();
  return mapAPIToCustomer(data);
}

export async function fetchCustomerInvoices(customerId: string): Promise<CustomerInvoice[]> {
  const response = await fetch(`${baseUrl}/invoices/`);
  if (!response.ok) {
    throw new Error("Failed to fetch invoices");
  }
  const data: InvoiceAPI[] = await response.json();
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
