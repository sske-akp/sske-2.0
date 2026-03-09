import { useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceFormSchema, InvoiceItem } from "@/app/sales/new/schema";

export interface GstBreakdownEntry {
  rate: number;
  amount: number;
}

interface UseInvoiceFormParams {
  createEmptyRow: () => InvoiceItem;
}

export function useInvoiceForm({
  createEmptyRow,
}: UseInvoiceFormParams) {
  const form = useForm({
    resolver: zodResolver(invoiceFormSchema),
    mode: "onBlur",
    defaultValues: {
      customer_id: null,
      payment_method: "cash" as const,
      due_date: null,
      items: [createEmptyRow()],
    },
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = form.watch("items");

  // Serialize to detect deep changes — form.watch returns the same array
  // reference when individual fields change, so useMemo([items]) won't
  // notice edits to quantity/price within a row.
  const itemsKey = JSON.stringify(items);

  const summary = useMemo(() => {
    if (!items) return { subtotal: 0, gst: 0, gstBreakdown: [], total: 0, numItems: 0, totalQuantity: 0 };

    const subtotal = items.reduce(
      (acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.price_per_unit) || 0),
      0
    );

    // Group items by tax_percent and compute GST per rate
    const rateMap = new Map<number, number>();
    for (const item of items) {
      const lineSubtotal = (Number(item.quantity) || 0) * (Number(item.price_per_unit) || 0);
      const rate = Number(item.tax_percent) || 0;
      rateMap.set(rate, (rateMap.get(rate) ?? 0) + lineSubtotal);
    }

    const gstBreakdown: GstBreakdownEntry[] = [];
    let gst = 0;
    for (const [rate, rateSubtotal] of rateMap.entries()) {
      if (rate > 0) {
        const amount = rateSubtotal * (rate / 100);
        gst += amount;
        gstBreakdown.push({ rate, amount });
      }
    }
    gstBreakdown.sort((a, b) => a.rate - b.rate);

    const total = subtotal + gst;
    const numItems = items.length;
    const totalQuantity = items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    return { subtotal, gst, gstBreakdown, total, numItems, totalQuantity };
  }, [itemsKey]);

  return { form, fieldArray, summary, createEmptyRow };
}
