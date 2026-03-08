import { z } from "zod";

export const invoiceItemSchema = z.object({
  product_name: z.string().min(1, "Product is required"),
  product_id: z.string().min(1, "Select a product from the list"),
  batch_id: z.string().nullable().optional(),
  available_qty: z.number().optional(),
  quantity: z.coerce.number().positive("Qty must be > 0"),
  price_per_unit: z.coerce.number().nonnegative("Price cannot be negative"),
  tax_percent: z.coerce.number().nonnegative("Tax % cannot be negative").default(18),
  total_price: z.number(),
});

export const invoiceFormSchema = z.object({
  customer_id: z.string().nullable().optional(),
  payment_method: z.enum(["cash", "upi", "card", "credit"]).default("cash"),
  due_date: z.string().nullable().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item required"),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
