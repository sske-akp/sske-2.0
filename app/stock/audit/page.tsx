"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppCombobox } from "@/components/utils/appCombobox";
import { useAuditRows, useAdjustStock } from "@/hooks/stockHooks";
import { StockAdjustment } from "@/types/stock";
import { toast } from "sonner";

export default function StockAuditPage() {
  const { data, isLoading, isError } = useAuditRows();
  const adjustStockMutation = useAdjustStock();

  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [productFilter, setProductFilter] = useState<string>("");
  const [countedQtys, setCountedQtys] = useState<Record<string, string>>({});

  const categoryOptions = useMemo(
    () =>
      data?.categories.map((c) => ({ label: c.name, value: c.id })) ?? [],
    [data?.categories]
  );

  const filteredRows = useMemo(() => {
    if (!data?.rows) return [];
    let rows = data.rows;
    if (categoryFilter) {
      rows = rows.filter((r) => r.categoryId === categoryFilter);
    }
    if (productFilter) {
      rows = rows.filter((r) =>
        r.productName.toLowerCase().includes(productFilter.toLowerCase())
      );
    }
    return rows;
  }, [data?.rows, categoryFilter, productFilter]);

  const handleCountedChange = (batchId: string, value: string) => {
    setCountedQtys((prev) => ({ ...prev, [batchId]: value }));
  };

  const pendingAdjustments = useMemo(() => {
    const adjs: StockAdjustment[] = [];
    for (const row of filteredRows) {
      const countedStr = countedQtys[row.batchId];
      if (countedStr !== undefined && countedStr !== "") {
        const counted = parseInt(countedStr, 10);
        if (!isNaN(counted) && counted !== row.remainingQty) {
          adjs.push({ batchId: row.batchId, countedQty: counted });
        }
      }
    }
    return adjs;
  }, [filteredRows, countedQtys]);

  const handleSaveAdjustments = () => {
    if (pendingAdjustments.length === 0) {
      toast.info("No adjustments to save");
      return;
    }

    adjustStockMutation.mutate(pendingAdjustments, {
      onSuccess: () => {
        toast.success(
          `${pendingAdjustments.length} batch(es) adjusted successfully!`
        );
        setCountedQtys({});
      },
      onError: (error) => {
        toast.error(error.message || "Failed to save adjustments");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Loading audit data...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-center text-destructive">
        Failed to load audit data. Make sure the backend is running.
      </div>
    );
  }

  return (
    <>
      <div className="px-2 sm:px-6 lg:px-8 py-4 bg-background">
        <section>
          <h1 className="text-3xl font-bold">Stock Audit</h1>
          <p className="text-muted-foreground">
            Verify physical stock counts against system records. Enter counted
            quantities and save adjustments.
          </p>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-3">
          {/* Filters */}
          <div className="p-5 flex gap-4">
            <div className="flex flex-col gap-2 w-1/3">
              <label className="text-sm font-medium">Category</label>
              <AppCombobox
                items={categoryOptions}
                searchCategory="Categories"
                onValueChange={(value) => setCategoryFilter(value || "")}
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="text-sm font-medium">Search Product</label>
              <Input
                placeholder="Type to filter products..."
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Bulk audit table */}
          <div className="p-5">
            {filteredRows.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">System Qty</TableHead>
                      <TableHead className="text-right">Counted Qty</TableHead>
                      <TableHead className="text-right">Diff</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((row) => {
                      const countedStr = countedQtys[row.batchId];
                      const counted =
                        countedStr !== undefined && countedStr !== ""
                          ? parseInt(countedStr, 10)
                          : null;
                      const diff =
                        counted !== null ? counted - row.remainingQty : null;

                      return (
                        <TableRow key={row.batchId}>
                          <TableCell className="font-medium">
                            {row.productName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {row.categoryName}
                          </TableCell>
                          <TableCell>{row.batchCode || "-"}</TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                            }).format(row.purchasePrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            {row.remainingQty}
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min={0}
                              className="w-24 ml-auto text-right"
                              placeholder={String(row.remainingQty)}
                              value={countedQtys[row.batchId] ?? ""}
                              onChange={(e) =>
                                handleCountedChange(
                                  row.batchId,
                                  e.target.value
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {diff !== null ? (
                              <span
                                className={
                                  diff > 0
                                    ? "text-green-600 font-medium"
                                    : diff < 0
                                    ? "text-destructive font-medium"
                                    : "text-muted-foreground"
                                }
                              >
                                {diff > 0 ? `+${diff}` : diff}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-10 text-center text-muted-foreground">
                {data?.rows.length === 0
                  ? "No stock data available."
                  : "No items match your filters."}
              </div>
            )}

            {filteredRows.length > 0 && (
              <div className="mt-4 flex gap-3">
                <Button
                  onClick={handleSaveAdjustments}
                  disabled={
                    adjustStockMutation.isPending ||
                    pendingAdjustments.length === 0
                  }
                >
                  {adjustStockMutation.isPending
                    ? "Saving..."
                    : `Save Adjustments${pendingAdjustments.length > 0 ? ` (${pendingAdjustments.length})` : ""}`}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCountedQtys({})}
                >
                  Reset All
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="col-span-1">
          <Card className="mt-5">
            <CardHeader>
              <CardTitle>Audit Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total batches:</span>
                <span>{data?.rows.length ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Showing:</span>
                <span>{filteredRows.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pending changes:</span>
                <span
                  className={
                    pendingAdjustments.length > 0
                      ? "text-orange-600 font-medium"
                      : ""
                  }
                >
                  {pendingAdjustments.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
