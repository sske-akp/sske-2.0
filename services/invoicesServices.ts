import {
  InvoiceAPI,
  Invoice,
  InvoiceFormData,
  InvoiceDetail,
  CreditNoteFormData,
  PaymentFormData,
} from "@/types/invoices";
import { fetchCustomers } from "@/services/customersServices";
import { ProductWithBatchesAPI } from "@/types/products";
import { apiFetch } from "@/lib/apiClient";

export function generateInvoiceNumber(): string {
  const now = new Date();
  const pad = (n: number, len = 2) => n.toString().padStart(len, "0");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const suffix =
    chars[Math.floor(Math.random() * chars.length)] +
    chars[Math.floor(Math.random() * chars.length)];
  return `INV-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${pad(now.getMilliseconds(), 3)}-${suffix}`;
}

function mapInvoiceAPIToUI(
  api: InvoiceAPI,
  customerMap: Map<string, string>
): Invoice {
  return {
    id: api.id,
    invoiceNumber: api.invoice_number,
    customerId: api.customer_id ?? "",
    customerName: api.customer_id
      ? customerMap.get(api.customer_id) ?? "Unknown"
      : "Walk-in",
    invoiceDate: api.invoice_date ?? "",
    invoiceType: api.invoice_type ?? "",
    totalAmount: api.total_amount ?? 0,
    createdAt: api.created_at ?? "",
    itemCount: api.items?.length ?? 0,
    status: api.status ?? "active",
    referenceInvoiceId: api.reference_invoice_id ?? null,
    paymentStatus: api.payment_status ?? "unpaid",
    paymentMethod: api.payment_method ?? "",
    dueDate: api.due_date ?? null,
    amountPaid: api.amount_paid ?? 0,
  };
}

export async function fetchInvoices(): Promise<Invoice[]> {
  const [data, customers] = await Promise.all([
    apiFetch<InvoiceAPI[]>("/invoices/"),
    fetchCustomers(),
  ]);

  const customerMap = new Map(customers.map((c) => [c.id, c.name]));
  return data.map((inv) => mapInvoiceAPIToUI(inv, customerMap));
}

export async function createInvoice(form: InvoiceFormData): Promise<Invoice> {
  // Atomic creation: invoice + all items in one request
  const newInvoice = await apiFetch<InvoiceAPI>("/invoices/with_items/", {
    method: "POST",
    json: {
      invoice_number: form.invoiceNumber,
      customer_id: form.customerId || null,
      invoice_date: form.invoiceDate,
      invoice_type: form.invoiceType,
      total_amount: form.totalAmount,
      payment_method: form.paymentMethod || null,
      payment_status: form.paymentMethod && form.paymentMethod !== "credit" ? "paid" : "unpaid",
      amount_paid: form.paymentMethod && form.paymentMethod !== "credit" ? form.totalAmount : 0,
      due_date: form.dueDate || null,
      items: form.items.map((item) => ({
        product_id: item.productId,
        batch_id: item.batchId || null,
        quantity: item.quantity,
        selling_price: item.sellingPrice,
        tax_percent: item.taxPercent,
        total_price: item.totalPrice,
        is_official: true,
      })),
    },
  });

  return {
    id: newInvoice.id,
    invoiceNumber: newInvoice.invoice_number,
    customerId: newInvoice.customer_id ?? "",
    customerName: "",
    invoiceDate: newInvoice.invoice_date ?? "",
    invoiceType: newInvoice.invoice_type ?? "",
    totalAmount: newInvoice.total_amount ?? 0,
    createdAt: newInvoice.created_at ?? "",
    itemCount: newInvoice.items?.length ?? 0,
    status: newInvoice.status ?? "active",
    referenceInvoiceId: newInvoice.reference_invoice_id ?? null,
    paymentStatus: newInvoice.payment_status ?? "unpaid",
    paymentMethod: newInvoice.payment_method ?? "",
    dueDate: newInvoice.due_date ?? null,
    amountPaid: newInvoice.amount_paid ?? 0,
  };
}

export async function fetchInvoiceDetail(id: string): Promise<InvoiceDetail> {
  const [invoice, products, customers] = await Promise.all([
    apiFetch<InvoiceAPI>(`/invoices/${id}`),
    apiFetch<ProductWithBatchesAPI[]>("/products/with_batches/"),
    fetchCustomers(),
  ]);

  const productMap = new Map(products.map((p) => [p.id, p.item]));
  const customer = customers.find((c) => c.id === invoice.customer_id);

  const items = (invoice.items ?? []).map((item) => ({
    id: item.id,
    productId: item.product_id ?? "",
    batchId: item.batch_id ?? "",
    productName: item.product_id ? productMap.get(item.product_id) ?? "Unknown" : "Unknown",
    quantity: item.quantity ?? 0,
    sellingPrice: item.selling_price ?? 0,
    taxPercent: item.tax_percent ?? 18,
    totalPrice: item.total_price ?? 0,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const gstAmount = subtotal * 0.18;

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    invoiceType: invoice.invoice_type ?? "sale",
    status: invoice.status ?? "active",
    referenceInvoiceId: invoice.reference_invoice_id ?? null,
    customerName: customer?.name ?? "Walk-in Customer",
    customerPhone: customer?.phone ?? "",
    customerAddress: customer?.address ?? "",
    customerGst: customer?.gst ?? "",
    invoiceDate: invoice.invoice_date ?? "",
    totalAmount: invoice.total_amount ?? 0,
    items,
    subtotal,
    gstAmount,
  };
}

export async function deleteInvoice(id: string): Promise<void> {
  await apiFetch<void>(`/invoices/${id}`, { method: "DELETE", parse: "none" });
}

export async function recordPayment(form: PaymentFormData): Promise<unknown> {
  return apiFetch<unknown>("/payments/", {
    method: "POST",
    json: {
      invoice_id: form.invoiceId,
      customer_id: form.customerId || null,
      amount: form.amount,
      payment_method: form.paymentMethod,
      payment_date: form.paymentDate,
      reference_number: form.referenceNumber || null,
      notes: form.notes || null,
    },
  });
}

export async function createCreditNote(form: CreditNoteFormData): Promise<InvoiceAPI> {
  return apiFetch<InvoiceAPI>("/invoices/credit_note/", {
    method: "POST",
    json: {
      reference_invoice_id: form.referenceInvoiceId,
      invoice_number: form.invoiceNumber,
      invoice_date: form.invoiceDate,
      invoice_type: "credit_note",
      total_amount: form.totalAmount,
      items: form.items.map((item) => ({
        reference_item_id: item.referenceItemId,
        product_id: item.productId,
        batch_id: item.batchId || null,
        quantity: item.quantity,
        selling_price: item.sellingPrice,
        tax_percent: item.taxPercent,
        total_price: item.totalPrice,
        is_official: true,
      })),
    },
  });
}
