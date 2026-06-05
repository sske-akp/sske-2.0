import { ProductWithBatchesAPI } from "@/types/products";
import { StockItem, StockBatchDetail, StockAdjustment, AuditRow } from "@/types/stock";
import { apiFetch } from "@/lib/apiClient";

export async function fetchStock(): Promise<StockItem[]> {
  const data = await apiFetch<ProductWithBatchesAPI[]>("/products/with_batches/");

  return data
    .filter((p) => !p.disabled)
    .map((product) => {
      const activeBatches = product.batches.filter((b) => !b.disabled);
      const totalQty = activeBatches.reduce(
        (sum, b) => sum + (b.remaining_qty ?? 0),
        0
      );
      const totalValue = activeBatches.reduce(
        (sum, b) => sum + (b.remaining_qty ?? 0) * (b.purchase_price ?? 0),
        0
      );
      const avgPrice =
        totalQty > 0 ? totalValue / totalQty : 0;

      return {
        productId: product.id,
        productName: product.item,
        hsnCode: product.hsncode ?? "",
        unit: product.unit ?? "Nos",
        totalQty,
        avgPrice: parseFloat(avgPrice.toFixed(2)),
        totalValue: parseFloat(totalValue.toFixed(2)),
        batchCount: activeBatches.length,
      };
    });
}

export async function fetchStockDetails(
  productId: string
): Promise<StockBatchDetail[]> {
  const data = await apiFetch<ProductWithBatchesAPI[]>("/products/with_batches/");
  const product = data.find((p) => p.id === productId);
  if (!product) return [];

  return product.batches
    .filter((b) => !b.disabled)
    .map((b) => ({
      batchId: b.id,
      batchCode: b.batch_code ?? "",
      remainingQty: b.remaining_qty ?? 0,
      purchasePrice: b.purchase_price ?? 0,
      purchaseDate: b.purchase_date ?? "",
    }));
}

interface CategoryAPI {
  id: string;
  name: string | null;
  disabled: boolean;
}

export async function fetchAuditRows(): Promise<{
  rows: AuditRow[];
  categories: { id: string; name: string }[];
}> {
  const [products, categoriesRaw] = await Promise.all([
    apiFetch<ProductWithBatchesAPI[]>("/products/with_batches/"),
    apiFetch<CategoryAPI[]>("/product_categories/"),
  ]);

  const categoryMap = new Map(
    categoriesRaw.map((c) => [c.id, c.name ?? "Uncategorized"])
  );
  const categories = categoriesRaw
    .filter((c) => !c.disabled)
    .map((c) => ({ id: c.id, name: c.name ?? "Uncategorized" }));

  const rows: AuditRow[] = [];
  for (const product of products) {
    if (product.disabled) continue;
    for (const batch of product.batches) {
      if (batch.disabled) continue;
      rows.push({
        batchId: batch.id,
        productId: product.id,
        productName: product.item,
        categoryId: product.category_id ?? "",
        categoryName: product.category_id
          ? categoryMap.get(product.category_id) ?? "Uncategorized"
          : "Uncategorized",
        batchCode: batch.batch_code ?? "",
        remainingQty: batch.remaining_qty ?? 0,
        purchasePrice: batch.purchase_price ?? 0,
      });
    }
  }

  return { rows, categories };
}

export async function adjustStock(
  adjustments: StockAdjustment[]
): Promise<void> {
  const results = await Promise.allSettled(
    adjustments.map((adj) =>
      apiFetch<unknown>(`/product_batches/${adj.batchId}`, {
        method: "PUT",
        json: { remaining_qty: adj.countedQty },
      })
    )
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    throw new Error(
      `${failed.length} of ${adjustments.length} adjustments failed`
    );
  }
}
