"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import InputTable from "@/components/utils/inputTable/data-table";
import {
  columns,
  data,
  filters,
  primary_items,
  calculatePurchaseSummary,
  PurchaseItem,
} from "@/app/purchases/new/data";
import { AppCombobox } from "@/components/utils/appCombobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from "uuid";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useSuppliers } from "@/hooks/suppliersHooks";
import { useCreatePurchaseBill } from "@/hooks/purchasesHooks";
import { PurchaseBillFormData } from "@/types/purchases";
import { toast } from "sonner";

// Default input GST rate applied to purchase lines. Per-product GST rates are
// wired in Phase 2 (GST compliance); the summary above also uses a flat 18%.
const DEFAULT_INPUT_GST = 18;

export default function NewPurchase() {
  const router = useRouter();
  const [tableData, setTableData] = useState(data);
  const { subtotal, gst, total, numItems, totalQuantity } = React.useMemo(
    () => calculatePurchaseSummary(tableData),
    [tableData]
  );

  // Purchase metadata state
  const [date, setDate] = useState<Date>(() => new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [billNumber, setBillNumber] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  const { data: suppliers } = useSuppliers();
  const createPurchaseBillMutation = useCreatePurchaseBill();

  const supplierOptions = React.useMemo(
    () =>
      suppliers
        ? suppliers.map((s) => ({
            label: s.name,
            value: s.id,
          }))
        : [],
    [suppliers]
  );

  const getNewRow = (): PurchaseItem => ({
    id: uuidv4(),
    product_name: "",
    product_id: "",
    quantity: 0,
    price_per_unit: 0,
    total_price: 0,
  });

  const resetForm = () => {
    setTableData([getNewRow()]);
    setSupplierId(null);
    setBillNumber("");
    setDueDate("");
    setDate(new Date());
  };

  const handleSavePurchase = (goToList: boolean) => {
    const validItems = tableData.filter(
      (item) => item.product_id && item.quantity > 0
    );

    if (validItems.length === 0) {
      toast.error("Add at least one product with a quantity");
      return;
    }

    if (!supplierId) {
      toast.error("Select a supplier");
      return;
    }

    const formData: PurchaseBillFormData = {
      supplierId,
      billNumber,
      billDate: format(date, "yyyy-MM-dd"),
      dueDate: dueDate || null,
      items: validItems.map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
        purchasePrice: item.price_per_unit,
        taxPercent: DEFAULT_INPUT_GST,
      })),
    };

    createPurchaseBillMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Purchase bill saved successfully!");
        resetForm();
        if (goToList) {
          router.push("/purchases/all");
        }
      },
      onError: (error) => {
        toast.error(error.message || "Failed to save purchase bill");
      },
    });
  };

  return (
    <>
      <div className="px-2 sm:px-6 lg:px-8 py-4 bg-background">
        <section>
          <h1 className="text-3xl font-bold">New Purchase</h1>
          <p className="text-muted-foreground">
            Create a new purchase entry for your supplier
          </p>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-3">
          <div className="p-5 flex flex-wrap gap-4">
            <div className="flex flex-col gap-2 w-1/4 min-w-[180px]">
              <Label>Supplier</Label>
              <AppCombobox
                items={supplierOptions}
                searchCategory="Suppliers"
                onValueChange={(value) => setSupplierId(value || null)}
              />
            </div>
            <div className="flex flex-col gap-2 w-1/4 min-w-[160px]">
              <Label>Bill Number</Label>
              <Input
                placeholder="Supplier's bill no."
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 w-1/4 min-w-[160px]">
              <Label>Bill Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {date ? format(date, "yyyy-MM-dd") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0 w-auto">
                  <div className="flex flex-col gap-2 p-3">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(selected) => {
                        setDate(selected as Date);
                        setCalendarOpen(false);
                      }}
                      captionLayout="dropdown"
                      startMonth={
                        new Date(new Date().getFullYear() - 1, 0)
                      }
                      endMonth={
                        new Date(new Date().getFullYear() + 1, 0)
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDate(new Date());
                        setCalendarOpen(false);
                      }}
                    >
                      Today
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-2 w-1/4 min-w-[160px]">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="p-5">
            <InputTable
              columns={columns}
              data={tableData}
              filters={filters}
              primary_items={primary_items}
              getNewRow={getNewRow}
              onDataChange={setTableData}
            />
          </div>
        </div>
        <div className="col-span-1">
          <Card className="mt-5">
            <CardHeader>
              <CardTitle>Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST (18%):</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleSavePurchase(false)}
                  disabled={createPurchaseBillMutation.isPending}
                >
                  {createPurchaseBillMutation.isPending
                    ? "Saving..."
                    : "Save Bill"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSavePurchase(true)}
                  disabled={createPurchaseBillMutation.isPending}
                >
                  Save & View All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-5">
            <CardHeader>
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Items:</span>
                <span>{numItems}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Qty:</span>
                <span>{totalQuantity}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
