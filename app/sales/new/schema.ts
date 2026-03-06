import { z } from "zod";

export const invoiceItemSchema = z.object({
  product_name: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().positive("Qty must be > 0"),
  price_per_unit: z.coerce.number().nonnegative("Price cannot be negative"),
  total_price: z.number(),
});

export const invoiceFormSchema = z.object({
  items: z.array(invoiceItemSchema).min(1, "At least one item required"),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
