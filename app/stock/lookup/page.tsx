"use client";

import React, { useState, useMemo } from "react";
import {
  useProductsWithBatches,
  useBrands,
  useCategories,
} from "@/hooks/productsHooks";
import { ProductWithBatchesAPI, ProductBatchAPI } from "@/types/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Package,
  IndianRupee,
  Boxes,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronsUpDown,
} from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

const INR_SHORT = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DISCOUNT_PERCENTAGES = [5, 10, 15, 20, 25, 30];
const GST_RATE = 18;
const LOW_STOCK_THRESHOLD = 5;

function StockStatusBadge({ qty }: { qty: number }) {
  if (qty <= 0)
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" /> Out of Stock
      </Badge>
    );
  if (qty <= LOW_STOCK_THRESHOLD)
    return (
      <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800 border-amber-300">
        <AlertTriangle className="h-3 w-3" /> Low Stock
      </Badge>
    );
  return (
    <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-800 border-emerald-300">
      <CheckCircle className="h-3 w-3" /> In Stock
    </Badge>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
        <div className="rounded-lg bg-muted p-2 sm:p-2.5 shrink-0">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-muted-foreground">{label}</p>
          <p className="text-base sm:text-lg font-semibold truncate">{value}</p>
          {sub && <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// Mobile card layout for discount pricing
function DiscountCard({
  label,
  unitPrice,
  gstAmount,
  finalPrice,
  effectiveMargin,
  isLoss,
  isMrp,
  gstRate,
}: {
  label: string;
  unitPrice: number;
  gstAmount: number;
  finalPrice: number;
  effectiveMargin: number;
  isLoss: boolean;
  isMrp?: boolean;
  gstRate: number;
}) {
  return (
    <div className={`rounded-lg border p-3 space-y-2 ${isMrp ? "bg-muted/30 border-primary/20" : ""} ${isLoss ? "border-destructive/30" : ""}`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${isMrp ? "text-primary" : ""}`}>{label}</span>
        <span className={`text-xs ${isLoss ? "text-destructive font-medium" : "text-muted-foreground"}`}>
          Margin: {effectiveMargin.toFixed(1)}%{isLoss && " (Loss)"}
        </span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className={`text-xl font-semibold ${isLoss ? "text-destructive" : ""}`}>
          {INR.format(finalPrice)}
        </span>
        <span className="text-xs text-muted-foreground">
          {INR_SHORT.format(unitPrice)} + {gstRate}% GST
        </span>
      </div>
    </div>
  );
}

// Mobile card layout for batch details
function BatchCard({ batch }: { batch: ProductBatchAPI }) {
  const qty = batch.remaining_qty ?? 0;
  const price = batch.purchase_price ?? 0;

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{batch.batch_code || "No code"}</span>
        {qty <= 0 ? (
          <Badge variant="destructive" className="text-xs">Empty</Badge>
        ) : qty <= LOW_STOCK_THRESHOLD ? (
          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">Low</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800">OK</Badge>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-[11px] text-muted-foreground">Qty</p>
          <p className={`font-medium ${qty <= 0 ? "text-destructive" : qty <= LOW_STOCK_THRESHOLD ? "text-amber-600" : ""}`}>
            {qty}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Price</p>
          <p className="font-medium">{INR_SHORT.format(price)}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Value</p>
          <p className="font-medium">{INR_SHORT.format(qty * price)}</p>
        </div>
      </div>
      {batch.purchase_date && (
        <p className="text-xs text-muted-foreground">
          Purchased: {new Date(batch.purchase_date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  );
}

export default function StockLookup() {
  const { data: products, isLoading, isError } = useProductsWithBatches();
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [customMargin, setCustomMargin] = useState<string>("10");

  const brandMap = useMemo(
    () => new Map(brands?.map((b) => [b.id, b.brand ?? "Unknown"]) ?? []),
    [brands]
  );
  const categoryMap = useMemo(
    () => new Map(categories?.map((c) => [c.id, c.name ?? "Uncategorized"]) ?? []),
    [categories]
  );

  const activeProducts = useMemo(
    () => products?.filter((p) => !p.disabled) ?? [],
    [products]
  );

  const selected: ProductWithBatchesAPI | null = useMemo(
    () => activeProducts.find((p) => p.id === selectedProductId) ?? null,
    [activeProducts, selectedProductId]
  );

  const activeBatches = useMemo(
    () => selected?.batches.filter((b) => !b.disabled) ?? [],
    [selected]
  );

  const stockStats = useMemo(() => {
    const totalQty = activeBatches.reduce((s, b) => s + (b.remaining_qty ?? 0), 0);
    const totalValue = activeBatches.reduce(
      (s, b) => s + (b.remaining_qty ?? 0) * (b.purchase_price ?? 0),
      0
    );
    const avgPrice = totalQty > 0 ? totalValue / totalQty : 0;
    const minPrice = activeBatches.length
      ? Math.min(...activeBatches.map((b) => b.purchase_price ?? Infinity))
      : 0;
    const maxPrice = activeBatches.length
      ? Math.max(...activeBatches.map((b) => b.purchase_price ?? 0))
      : 0;
    return { totalQty, totalValue, avgPrice, minPrice, maxPrice };
  }, [activeBatches]);

  const marginPct = parseFloat(customMargin) || 0;
  const gstRate = selected?.gst_rate ?? GST_RATE;

  // Precompute discount rows for both mobile and desktop
  const discountRows = useMemo(() => {
    const base = stockStats.avgPrice * (1 + marginPct / 100);
    const mrpGst = base * (gstRate / 100);
    const mrpFinal = base + mrpGst;

    const mrp = {
      label: "No Discount (MRP)",
      unitPrice: base,
      gstAmount: mrpGst,
      finalPrice: mrpFinal,
      effectiveMargin: marginPct,
      isLoss: false,
      isMrp: true,
    };

    const rows = DISCOUNT_PERCENTAGES.map((disc) => {
      const discounted = base * (1 - disc / 100);
      const gst = discounted * (gstRate / 100);
      const final_ = discounted + gst;
      const effectiveMargin =
        stockStats.avgPrice > 0
          ? ((discounted - stockStats.avgPrice) / stockStats.avgPrice) * 100
          : 0;
      return {
        label: `${disc}%`,
        unitPrice: discounted,
        gstAmount: gst,
        finalPrice: final_,
        effectiveMargin,
        isLoss: effectiveMargin < 0,
        isMrp: false,
      };
    });

    return [mrp, ...rows];
  }, [stockStats.avgPrice, marginPct, gstRate]);

  const sortedBatches = useMemo(
    () =>
      [...activeBatches].sort(
        (a, b) =>
          new Date(b.purchase_date ?? 0).getTime() -
          new Date(a.purchase_date ?? 0).getTime()
      ),
    [activeBatches]
  );

  if (isLoading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Loading products...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-center text-destructive">
        Failed to load products. Make sure the backend is running.
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-5 space-y-4 sm:space-y-6">
      {/* Header + Search */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="scroll-m-20 text-xl sm:text-2xl font-extralight tracking-tight">
          Stock Lookup
        </h1>
        <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
          {activeProducts.length} products
        </div>
      </div>

      <Popover open={searchOpen} onOpenChange={setSearchOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={searchOpen}
            className="w-full justify-between text-left font-normal h-11"
          >
            {selected ? (
              <span className="flex items-center gap-2 truncate">
                <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{selected.item}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Search className="h-4 w-4 shrink-0" />
                Search for a product...
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Type product name..." />
            <CommandList>
              <CommandEmpty>No product found.</CommandEmpty>
              <CommandGroup>
                {activeProducts.map((p) => (
                  <CommandItem
                    key={p.id}
                    value={p.item}
                    onSelect={() => {
                      setSelectedProductId(p.id);
                      setSearchOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="truncate">{p.item}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {p.batches.filter((b) => !b.disabled).reduce((s, b) => s + (b.remaining_qty ?? 0), 0)} qty
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* No Selection State */}
      {!selected && (
        <div className="text-center py-16 sm:py-20 text-muted-foreground">
          <Search className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-30" />
          <p className="text-base sm:text-lg">Search for a product to view stock details</p>
        </div>
      )}

      {/* Product Details */}
      {selected && (
        <div className="space-y-4 sm:space-y-6">
          {/* Product Info Header */}
          <Card>
            <CardContent className="p-3 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1.5 min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold truncate">{selected.item}</h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                    {selected.hsncode && <span>HSN: {selected.hsncode}</span>}
                    <span>Unit: {selected.unit ?? "Nos"}</span>
                    {selected.brand_id && (
                      <span>Brand: {brandMap.get(selected.brand_id) ?? "-"}</span>
                    )}
                    {selected.category_id && (
                      <span>Category: {categoryMap.get(selected.category_id) ?? "-"}</span>
                    )}
                    <span>GST: {gstRate}%</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <StockStatusBadge qty={stockStats.totalQty} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            <StatCard
              label="Total Quantity"
              value={`${stockStats.totalQty} ${selected.unit ?? "Nos"}`}
              icon={Boxes}
              sub={`${activeBatches.length} batch${activeBatches.length !== 1 ? "es" : ""}`}
            />
            <StatCard
              label="Avg Purchase Price"
              value={INR.format(stockStats.avgPrice)}
              icon={IndianRupee}
              sub={
                stockStats.minPrice !== stockStats.maxPrice
                  ? `${INR_SHORT.format(stockStats.minPrice)} – ${INR_SHORT.format(stockStats.maxPrice)}`
                  : undefined
              }
            />
            <StatCard
              label="Total Stock Value"
              value={INR.format(stockStats.totalValue)}
              icon={TrendingDown}
              sub="At purchase price"
            />
            <StatCard
              label="Selling Price (incl. GST)"
              value={INR.format(
                stockStats.avgPrice * (1 + marginPct / 100) * (1 + gstRate / 100)
              )}
              icon={IndianRupee}
              sub={`${marginPct}% margin + ${gstRate}% GST`}
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="pricing">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="pricing" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                Pricing & Discounts
              </TabsTrigger>
              <TabsTrigger value="batches" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                Batch Details
              </TabsTrigger>
            </TabsList>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground whitespace-nowrap">
                  Base Margin %:
                </label>
                <Input
                  type="number"
                  value={customMargin}
                  onChange={(e) => setCustomMargin(e.target.value)}
                  className="w-24"
                  min={0}
                  max={200}
                />
              </div>

              <Card>
                <CardHeader className="pb-3 px-3 sm:px-6">
                  <CardTitle className="text-sm sm:text-base font-medium">
                    Price at Various Discounts
                  </CardTitle>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Based on avg purchase price of {INR.format(stockStats.avgPrice)} with{" "}
                    {marginPct}% margin
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Discount</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">+ GST ({gstRate}%)</TableHead>
                          <TableHead className="text-right">Final Price</TableHead>
                          <TableHead className="text-right">Effective Margin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {discountRows.map((row) => (
                          <TableRow
                            key={row.label}
                            className={`${row.isMrp ? "bg-muted/30 font-medium" : ""} ${row.isLoss ? "text-destructive" : ""}`}
                          >
                            <TableCell>{row.label}</TableCell>
                            <TableCell className="text-right">{INR.format(row.unitPrice)}</TableCell>
                            <TableCell className="text-right">{INR.format(row.gstAmount)}</TableCell>
                            <TableCell className="text-right font-medium">{INR.format(row.finalPrice)}</TableCell>
                            <TableCell className="text-right">
                              {row.effectiveMargin.toFixed(1)}%
                              {row.isLoss && " (Loss)"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-2 p-3">
                    {discountRows.map((row) => (
                      <DiscountCard key={row.label} {...row} gstRate={gstRate} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick GST Breakdown */}
              <Card>
                <CardHeader className="pb-3 px-3 sm:px-6">
                  <CardTitle className="text-sm sm:text-base font-medium">GST Breakdown (at MRP)</CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  {(() => {
                    const base = stockStats.avgPrice * (1 + marginPct / 100);
                    const cgst = base * (gstRate / 2 / 100);
                    const sgst = base * (gstRate / 2 / 100);
                    return (
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 text-sm">
                        <div>
                          <p className="text-[11px] sm:text-xs text-muted-foreground">Taxable Value</p>
                          <p className="font-medium text-base sm:text-lg">{INR.format(base)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] sm:text-xs text-muted-foreground">CGST ({gstRate / 2}%)</p>
                          <p className="font-medium text-base sm:text-lg">{INR.format(cgst)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] sm:text-xs text-muted-foreground">SGST ({gstRate / 2}%)</p>
                          <p className="font-medium text-base sm:text-lg">{INR.format(sgst)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] sm:text-xs text-muted-foreground">Total (incl. GST)</p>
                          <p className="font-medium text-base sm:text-lg">{INR.format(base + cgst + sgst)}</p>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Batches Tab */}
            <TabsContent value="batches" className="mt-4">
              <Card>
                <CardHeader className="pb-3 px-3 sm:px-6">
                  <CardTitle className="text-sm sm:text-base font-medium">
                    Batch Inventory ({activeBatches.length} batches)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {activeBatches.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      No active batches found for this product.
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Batch Code</TableHead>
                              <TableHead className="text-right">Remaining Qty</TableHead>
                              <TableHead className="text-right">Purchase Price</TableHead>
                              <TableHead className="text-right">Batch Value</TableHead>
                              <TableHead className="text-right">Purchase Date</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedBatches.map((batch) => {
                              const qty = batch.remaining_qty ?? 0;
                              const price = batch.purchase_price ?? 0;
                              return (
                                <TableRow key={batch.id}>
                                  <TableCell className="font-medium">
                                    {batch.batch_code || "-"}
                                  </TableCell>
                                  <TableCell
                                    className={`text-right font-medium ${qty <= 0 ? "text-destructive" : qty <= LOW_STOCK_THRESHOLD ? "text-amber-600" : ""}`}
                                  >
                                    {qty}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {INR.format(price)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {INR.format(qty * price)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {batch.purchase_date
                                      ? new Date(batch.purchase_date).toLocaleDateString("en-IN", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        })
                                      : "-"}
                                  </TableCell>
                                  <TableCell>
                                    {qty <= 0 ? (
                                      <Badge variant="destructive" className="text-xs">Empty</Badge>
                                    ) : qty <= LOW_STOCK_THRESHOLD ? (
                                      <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">Low</Badge>
                                    ) : (
                                      <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800">OK</Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="md:hidden space-y-2 p-3">
                        {sortedBatches.map((batch) => (
                          <BatchCard key={batch.id} batch={batch} />
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
