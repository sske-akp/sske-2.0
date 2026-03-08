"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { columns, filters, primary_items, ProductRow } from "@/app/products/all/data";
import { DataTable } from "@/components/utils/dataTable/data-table";
import {
  useProductsWithBatches,
  useUpdateProduct,
  useBrands,
  useCategories,
} from "@/hooks/productsHooks";
import { ProductWithBatchesAPI } from "@/types/products";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppCombobox } from "@/components/utils/appCombobox";

const UNIT_OPTIONS = ["Nos", "Kg", "Mtr", "Box", "Set", "Pair", "Ltr", "Pcs"];

export default function AllProducts() {
  const router = useRouter();
  const { data: products, isLoading, isError } = useProductsWithBatches();
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();
  const updateProduct = useUpdateProduct();

  // Edit state
  const [editProduct, setEditProduct] = useState<ProductRow | null>(null);
  const [editForm, setEditForm] = useState({
    item: "",
    hsncode: "",
    unit: "Nos",
    brand_id: "" as string,
    category_id: "" as string,
    gst_rate: 18,
  });

  // Build lookup maps
  const brandMap = useMemo(() => {
    const map = new Map<string, string>();
    brands?.forEach((b) => map.set(b.id, b.brand || ""));
    return map;
  }, [brands]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories?.forEach((c) => map.set(c.id, c.name || ""));
    return map;
  }, [categories]);

  // Transform API data to table rows
  const rows: ProductRow[] = useMemo(() => {
    if (!products) return [];
    return products.map((p: ProductWithBatchesAPI) => ({
      id: p.id,
      item: p.item,
      hsncode: p.hsncode,
      unit: p.unit,
      brandName: p.brand_id ? brandMap.get(p.brand_id) || "" : "",
      categoryName: p.category_id ? categoryMap.get(p.category_id) || "" : "",
      gst_rate: p.gst_rate,
      stockQty: p.batches
        .filter((b) => !b.disabled)
        .reduce((sum, b) => sum + (b.remaining_qty ?? 0), 0),
      disabled: p.disabled,
      brand_id: p.brand_id,
      category_id: p.category_id,
      _raw: p,
    }));
  }, [products, brandMap, categoryMap]);

  const brandComboItems = useMemo(
    () =>
      (brands ?? [])
        .filter((b) => !b.disabled)
        .map((b) => ({ value: b.id, label: b.brand || "" })),
    [brands]
  );

  const categoryComboItems = useMemo(
    () =>
      (categories ?? [])
        .filter((c) => !c.disabled)
        .map((c) => ({ value: c.id, label: c.name || "" })),
    [categories]
  );

  const handleEdit = (product: ProductRow) => {
    setEditProduct(product);
    setEditForm({
      item: product.item,
      hsncode: product.hsncode || "",
      unit: product.unit || "Nos",
      brand_id: product.brand_id || "",
      category_id: product.category_id || "",
      gst_rate: product.gst_rate ?? 18,
    });
  };

  const handleSaveEdit = () => {
    if (!editProduct) return;
    if (!editForm.item.trim()) {
      toast.error("Product name is required");
      return;
    }
    updateProduct.mutate(
      {
        id: editProduct.id,
        data: {
          item: editForm.item,
          hsncode: editForm.hsncode || undefined,
          unit: editForm.unit,
          brand_id: editForm.brand_id || null,
          category_id: editForm.category_id || null,
          gst_rate: editForm.gst_rate,
        },
      },
      {
        onSuccess: () => {
          toast.success("Product updated");
          setEditProduct(null);
        },
        onError: () => toast.error("Failed to update product"),
      }
    );
  };

  const handleToggleDisable = (product: ProductRow) => {
    updateProduct.mutate(
      {
        id: product.id,
        data: {
          item: product.item,
          disabled: !product.disabled,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            product.disabled ? "Product enabled" : "Product disabled"
          );
        },
        onError: () => toast.error("Failed to update product status"),
      }
    );
  };

  // Wrap primary_items to handle navigation
  const wrappedPrimaryItems = primary_items.map((item) => ({
    ...item,
    onClick: () => router.push("/products/new"),
  }));

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
        Failed to load products.
      </div>
    );
  }

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance mt-5 mx-5">
        Products
      </h1>
      <div className="p-5">
        <DataTable
          columns={columns}
          data={rows}
          filters={filters}
          primary_items={wrappedPrimaryItems}
          pagination_pageSize={15}
          meta={{
            onEdit: handleEdit,
            onToggleDisable: handleToggleDisable,
          }}
        />
      </div>

      {/* Edit Product Sheet */}
      <Sheet
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
      >
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Product</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-item">Product Name</Label>
              <Input
                id="edit-item"
                value={editForm.item}
                onChange={(e) =>
                  setEditForm({ ...editForm, item: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hsncode">HSN Code</Label>
              <Input
                id="edit-hsncode"
                value={editForm.hsncode}
                onChange={(e) =>
                  setEditForm({ ...editForm, hsncode: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select
                value={editForm.unit}
                onValueChange={(val) =>
                  setEditForm({ ...editForm, unit: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <AppCombobox
                items={brandComboItems}
                searchCategory="Select brand"
                defaultValue={editForm.brand_id}
                onValueChange={(val) =>
                  setEditForm({ ...editForm, brand_id: val })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <AppCombobox
                items={categoryComboItems}
                searchCategory="Select category"
                defaultValue={editForm.category_id}
                onValueChange={(val) =>
                  setEditForm({ ...editForm, category_id: val })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gst">GST Rate (%)</Label>
              <Input
                id="edit-gst"
                type="number"
                value={editForm.gst_rate}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    gst_rate: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <SheetFooter>
            <Button
              variant="outline"
              onClick={() => setEditProduct(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateProduct.isPending}
            >
              {updateProduct.isPending ? "Saving..." : "Save"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
