import { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceFormSchema, InvoiceItem } from "@/app/sales/new/schema";

interface UseInvoiceFormParams {
  createEmptyRow: () => InvoiceItem;
  gstRate?: number;
}

export function useInvoiceForm({
  createEmptyRow,
  gstRate = 0.18,
}: UseInvoiceFormParams) {
  const form = useForm({
    resolver: zodResolver(invoiceFormSchema),
    mode: "onBlur",
    defaultValues: {
      items: [createEmptyRow()],
    },
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Auto-calculate total_price when quantity or price_per_unit changes
  const items = form.watch("items");

  useEffect(() => {
    if (!items) return;
    items.forEach((item, index) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price_per_unit) || 0;
      const expectedTotal = parseFloat((qty * price).toFixed(2));
      if (item.total_price !== expectedTotal) {
        form.setValue(`items.${index}.total_price`, expectedTotal, {
          shouldDirty: true,
        });
      }
    });
  }, [items, form]);

  const summary = useMemo(() => {
    if (!items) return { subtotal: 0, gst: 0, total: 0, numItems: 0, totalQuantity: 0 };
    const subtotal = items.reduce((acc, item) => acc + (Number(item.total_price) || 0), 0);
    const gst = subtotal * gstRate;
    const total = subtotal + gst;
    const numItems = items.length;
    const totalQuantity = items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    return { subtotal, gst, total, numItems, totalQuantity };
  }, [items, gstRate]);

  return { form, fieldArray, summary, createEmptyRow };
}
