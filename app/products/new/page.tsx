"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  useCreateProduct,
  useBrands,
  useCategories,
  useCreateBrand,
  useCreateCategory,
} from "@/hooks/productsHooks";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const UNIT_OPTIONS = ["Nos", "Kg", "Mtr", "Box", "Set", "Pair", "Ltr", "Pcs"];

const emptyForm = {
  item: "",
  hsncode: "",
  unit: "Nos",
  brand_id: "",
  category_id: "",
  gst_rate: 18,
};

export default function NewProduct() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const createProduct = useCreateProduct();
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();
  const createBrand = useCreateBrand();
  const createCategory = useCreateCategory();

  // "Add new" dialogs
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandCompany, setNewBrandCompany] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const brandComboItems = useMemo(() => {
    const items = (brands ?? [])
      .filter((b) => !b.disabled)
      .map((b) => ({ value: b.id, label: b.brand || "" }));
    items.push({ value: "__add_new__", label: "+ Add new brand" });
    return items;
  }, [brands]);

  const categoryComboItems = useMemo(() => {
    const items = (categories ?? [])
      .filter((c) => !c.disabled)
      .map((c) => ({ value: c.id, label: c.name || "" }));
    items.push({ value: "__add_new__", label: "+ Add new category" });
    return items;
  }, [categories]);

  const handleBrandChange = (val: string) => {
    if (val === "__add_new__") {
      setShowNewBrand(true);
      return;
    }
    setForm({ ...form, brand_id: val });
  };

  const handleCategoryChange = (val: string) => {
    if (val === "__add_new__") {
      setShowNewCategory(true);
      return;
    }
    setForm({ ...form, category_id: val });
  };

  const handleCreateBrand = () => {
    if (!newBrandName.trim()) {
      toast.error("Brand name is required");
      return;
    }
    createBrand.mutate(
      { brand: newBrandName, company: newBrandCompany || null },
      {
        onSuccess: (data) => {
          toast.success("Brand created");
          setForm({ ...form, brand_id: data.id });
          setShowNewBrand(false);
          setNewBrandName("");
          setNewBrandCompany("");
        },
        onError: () => toast.error("Failed to create brand"),
      }
    );
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    createCategory.mutate(
      { name: newCategoryName },
      {
        onSuccess: (data) => {
          toast.success("Category created");
          setForm({ ...form, category_id: data.id });
          setShowNewCategory(false);
          setNewCategoryName("");
        },
        onError: () => toast.error("Failed to create category"),
      }
    );
  };

  const handleReset = () => {
    setForm(emptyForm);
  };

  const handleSave = () => {
    if (!form.item.trim()) {
      toast.error("Product name is required");
      return;
    }
    createProduct.mutate(
      {
        item: form.item,
        hsncode: form.hsncode || undefined,
        unit: form.unit,
        brand_id: form.brand_id || null,
        category_id: form.category_id || null,
        gst_rate: form.gst_rate,
      },
      {
        onSuccess: () => {
          toast.success("Product created successfully!");
          router.push("/products/all");
        },
        onError: () => {
          toast.error("Failed to create product. Please try again.");
        },
      }
    );
  };

  return (
    <>
      <div className="px-2 sm:px-6 lg:px-8 py-4 bg-background">
        <section>
          <h1 className="text-3xl font-bold">New Product</h1>
          <p className="text-muted-foreground">
            Add a new product to your inventory
          </p>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-3">
          <div className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="item">Product Name *</Label>
              <Input
                id="item"
                placeholder="Enter product name"
                value={form.item}
                onChange={(e) => setForm({ ...form, item: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="hsncode">HSN Code</Label>
              <Input
                id="hsncode"
                placeholder="Enter HSN code"
                value={form.hsncode}
                onChange={(e) => setForm({ ...form, hsncode: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Unit</Label>
              <Select
                value={form.unit}
                onValueChange={(val) => setForm({ ...form, unit: val })}
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
            <div className="flex flex-col gap-2">
              <Label>Brand</Label>
              <AppCombobox
                items={brandComboItems}
                searchCategory="Select brand"
                defaultValue={form.brand_id}
                onValueChange={handleBrandChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <AppCombobox
                items={categoryComboItems}
                searchCategory="Select category"
                defaultValue={form.category_id}
                onValueChange={handleCategoryChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="gst_rate">GST Rate (%)</Label>
              <Input
                id="gst_rate"
                type="number"
                value={form.gst_rate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    gst_rate: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className="p-5 flex gap-3">
            <Button
              className="flex-1 rounded-lg border border-primary/40 bg-primary shadow-sm hover:bg-primary/90 transition-all duration-150 py-3 text-base font-semibold"
              size="default"
              onClick={handleSave}
              disabled={createProduct.isPending}
            >
              {createProduct.isPending ? "Saving..." : "Save Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border border-gray-300 bg-white hover:bg-gray-100 transition-all duration-150 py-3 text-base font-semibold"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="col-span-1">
          <Card className="mt-5">
            <CardHeader>
              <CardTitle>Product Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Name:</span>
                  <span>{form.item || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>HSN Code:</span>
                  <span>{form.hsncode || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Unit:</span>
                  <span>{form.unit || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Brand:</span>
                  <span>
                    {form.brand_id
                      ? brands?.find((b) => b.id === form.brand_id)?.brand ||
                        "-"
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Category:</span>
                  <span>
                    {form.category_id
                      ? categories?.find((c) => c.id === form.category_id)
                          ?.name || "-"
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST Rate:</span>
                  <span>{form.gst_rate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add New Brand Dialog */}
      <Dialog open={showNewBrand} onOpenChange={setShowNewBrand}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Brand Name</Label>
              <Input
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Enter brand name"
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={newBrandCompany}
                onChange={(e) => setNewBrandCompany(e.target.value)}
                placeholder="Enter company name (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewBrand(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateBrand}
              disabled={createBrand.isPending}
            >
              {createBrand.isPending ? "Creating..." : "Create Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Category Dialog */}
      <Dialog open={showNewCategory} onOpenChange={setShowNewCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Category Name</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewCategory(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={createCategory.isPending}
            >
              {createCategory.isPending ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
