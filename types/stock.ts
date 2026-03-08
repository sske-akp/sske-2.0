// Aggregated stock view (one row per product)
export interface StockItem {
  productId: string;
  productName: string;
  hsnCode: string;
  unit: string;
  totalQty: number;
  avgPrice: number;
  totalValue: number;
  batchCount: number;
}

// Per-batch detail for audit
export interface StockBatchDetail {
  batchId: string;
  batchCode: string;
  remainingQty: number;
  purchasePrice: number;
  purchaseDate: string;
}

// Flattened audit row (one per batch, includes product info)
export interface AuditRow {
  batchId: string;
  productId: string;
  productName: string;
  categoryId: string;
  categoryName: string;
  batchCode: string;
  remainingQty: number;
  purchasePrice: number;
}

// Stock audit adjustment
export interface StockAdjustment {
  batchId: string;
  countedQty: number;
}
