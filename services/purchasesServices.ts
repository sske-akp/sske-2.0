import {
  ProductBatchResponseAPI,
  Purchase,
  PurchaseFormData,
} from "@/types/purchases";
import { fetchProducts } from "@/services/productsServices";
import { fetchSuppliers } from "@/services/suppliersServices";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function fetchPurchases(): Promise<Purchase[]> {
  const [batchesRes, products, suppliers] = await Promise.all([
    fetch(`${baseUrl}/product_batches/`),
    fetchProducts(),
    fetchSuppliers(),
  ]);

  if (!batchesRes.ok) {
    throw new Error("Failed to fetch purchases");
  }

  const batches: ProductBatchResponseAPI[] = await batchesRes.json();
  const productMap = new Map(products.map((p) => [p.productId, p.productName]));
  const supplierMap = new Map(suppliers.map((s) => [s.id, s.name]));

  return batches
    .filter((b) => !b.disabled)
    .map((b) => ({
      id: b.id,
      productName: b.product_id ? productMap.get(b.product_id) ?? "Unknown" : "Unknown",
      supplierName: b.supplier_id ? supplierMap.get(b.supplier_id) ?? "Unknown" : "N/A",
      quantity: b.quantity ?? 0,
      pricePerUnit: b.purchase_price ?? 0,
      totalPrice: (b.quantity ?? 0) * (b.purchase_price ?? 0),
      purchaseDate: b.purchase_date ?? "",
      status: b.status ?? "completed",
    }));
}

export interface CreatePurchaseResult {
  batchIds: string[];
}

export async function createPurchase(form: PurchaseFormData): Promise<CreatePurchaseResult> {
  const results = await Promise.allSettled(
    form.items.map((item) =>
      fetch(`${baseUrl}/product_batches/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: item.productId,
          supplier_id: form.supplierId || null,
          batch_code: `PUR-${new Date().toISOString().slice(0, 10)}`,
          purchase_price: item.purchasePrice,
          quantity: item.quantity,
          remaining_qty: item.quantity,
          purchase_date: form.purchaseDate,
          source_type: "purchase",
          status: form.status,
        }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to create batch");
        return res.json();
      })
    )
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    throw new Error(
      `${failed.length} of ${form.items.length} items failed to save`
    );
  }

  const batchIds = results
    .filter((r): r is PromiseFulfilledResult<{ id: string }> => r.status === "fulfilled")
    .map((r) => r.value.id);

  return { batchIds };
}

export async function fetchPurchasesByIds(ids: string[]): Promise<Purchase[]> {
  const responses = await Promise.all(
    ids.map((id) =>
      fetch(`${baseUrl}/product_batches/${id}`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch batch");
        return res.json();
      })
    )
  );

  const [products, suppliers] = await Promise.all([
    fetchProducts(),
    fetchSuppliers(),
  ]);
  const productMap = new Map(products.map((p) => [p.productId, p.productName]));
  const supplierMap = new Map(suppliers.map((s) => [s.id, s.name]));

  return (responses as ProductBatchResponseAPI[]).map((b) => ({
    id: b.id,
    productName: b.product_id ? productMap.get(b.product_id) ?? "Unknown" : "Unknown",
    supplierName: b.supplier_id ? supplierMap.get(b.supplier_id) ?? "Unknown" : "N/A",
    quantity: b.quantity ?? 0,
    pricePerUnit: b.purchase_price ?? 0,
    totalPrice: (b.quantity ?? 0) * (b.purchase_price ?? 0),
    purchaseDate: b.purchase_date ?? "",
    status: b.status ?? "completed",
  }));
}

export async function deletePurchase(id: string): Promise<void> {
  const response = await fetch(`${baseUrl}/product_batches/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete purchase");
  }
}
