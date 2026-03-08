"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AppCombobox } from "@/components/utils/appCombobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditableFormTable } from "@/components/editableFormTable";
import type { ColumnConfig, ComboboxOption } from "@/components/editableFormTable";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { useProducts } from "@/hooks/productsHooks";
import { useCustomers } from "@/hooks/customersHooks";
import { useCreateInvoice } from "@/hooks/invoicesHooks";
import { generateInvoiceNumber } from "@/services/invoicesServices";
import { InvoiceFormData } from "@/types/invoices";
import { InvoiceItem } from "./schema";
import { toast } from "sonner";

const createEmptyRow = (): InvoiceItem => ({
  product_name: "",
  product_id: "",
  batch_id: null,
  available_qty: 0,
  quantity: 0,
  price_per_unit: 0,
  tax_percent: 18,
  total_price: 0,
});

export default function NewSale() {
  const { form, fieldArray, summary } = useInvoiceForm({
    createEmptyRow,
  });

  const router = useRouter();
  const shouldPrint = React.useRef(false);
  const { data: products } = useProducts();
  const { data: customers } = useCustomers();
  const createInvoiceMutation = useCreateInvoice();

  const productOptions: ComboboxOption[] = React.useMemo(
    () =>
      products
        ? products.map((p) => ({
            label: p.productName,
            value: p.productName,
            product_id: p.productId,
            batch_id: p.batchId,
            price_per_unit: p.pricePerUnit,
            available_qty: p.availableQty,
            gst_rate: p.gstRate,
          }))
        : [],
    [products]
  );

  const customerOptions = React.useMemo(
    () =>
      customers
        ? customers.map((c) => ({
            label: c.name || c.phone || "Unknown",
            value: c.id,
          }))
        : [],
    [customers]
  );

  const selectedCustomerId = form.watch("customer_id");
  const paymentMethod = form.watch("payment_method");
  const selectedCustomer = React.useMemo(
    () => customers?.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  const columns: ColumnConfig<InvoiceItem>[] = React.useMemo(
    () => [
      {
        type: "combobox",
        accessorKey: "product_name",
        header: "Product Name",
        size: 600,
        options: productOptions,
        searchCategory: "Items",
        onOptionSelect: (option: ComboboxOption) => ({
          price_per_unit: Number(option.price_per_unit) || 0,
          product_id: option.product_id as string,
          batch_id: (option.batch_id as string) || null,
          available_qty: Number(option.available_qty) || 0,
          tax_percent: Number(option.gst_rate) || 18,
        }),
      },
      {
        type: "computed",
        accessorKey: "available_qty",
        header: "In Stock",
        size: 90,
        compute: (row: InvoiceItem) => {
          const avail = Number(row.available_qty) || 0;
          const qty = Number(row.quantity) || 0;
          if (!row.product_id) return <span className="text-muted-foreground">-</span>;
          const isLow = avail <= 0;
          const isOverSold = qty > avail && avail > 0;
          return (
            <span className={isLow ? "text-destructive font-medium" : isOverSold ? "text-orange-500 font-medium" : "text-green-600"}>
              {avail}
            </span>
          );
        },
      },
      {
        type: "number",
        accessorKey: "quantity",
        header: "Quantity",
        size: 100,
        min: 0,
        placeholder: "0",
      },
      {
        type: "number",
        accessorKey: "price_per_unit",
        header: "Price Per Unit",
        size: 150,
        min: 0,
        step: 0.01,
        placeholder: "0.00",
      },
      {
        type: "number",
        accessorKey: "tax_percent",
        header: "Tax %",
        size: 80,
        min: 0,
        max: 100,
        step: 0.01,
        placeholder: "18",
      },
      {
        type: "computed",
        accessorKey: "total_price",
        header: "Total Price",
        size: 100,
        compute: (row: InvoiceItem) => {
          const total = (Number(row.quantity) || 0) * (Number(row.price_per_unit) || 0);
          return `₹${total.toFixed(2)}`;
        },
      },
      {
        type: "action",
        size: 50,
      },
    ],
    [productOptions]
  );

  const { subtotal, gst, gstBreakdown, total, numItems, totalQuantity } = summary;

  const [showStockWarning, setShowStockWarning] = React.useState(false);
  const [stockWarnings, setStockWarnings] = React.useState<
    { productName: string; requested: number; available: number }[]
  >([]);
  const pendingFormData = React.useRef<InvoiceFormData | null>(null);

  // Build a map of productName -> availableQty for stock checks
  const availableQtyMap = React.useMemo(() => {
    const map = new Map<string, number>();
    if (products) {
      for (const p of products) {
        map.set(p.productName, p.availableQty);
      }
    }
    return map;
  }, [products]);

  const buildFormData = (formValues: { customer_id?: string | null; payment_method?: string; due_date?: string | null; items: InvoiceItem[] }): InvoiceFormData => ({
    invoiceNumber: generateInvoiceNumber(),
    customerId: formValues.customer_id || null,
    invoiceDate: new Date().toISOString().split("T")[0],
    invoiceType: "sale",
    totalAmount: total,
    paymentMethod: formValues.payment_method || "cash",
    dueDate: formValues.payment_method === "credit" ? (formValues.due_date || null) : null,
    items: formValues.items.map((item: InvoiceItem) => ({
      productId: item.product_id,
      batchId: item.batch_id || null,
      quantity: item.quantity,
      sellingPrice: item.price_per_unit,
      taxPercent: Number(item.tax_percent) || 18,
      totalPrice: item.quantity * item.price_per_unit,
    })),
  });

  const submitInvoice = (formData: InvoiceFormData) => {
    createInvoiceMutation.mutate(formData, {
      onSuccess: (invoice) => {
        toast.success("Invoice created successfully!");
        form.reset({ customer_id: null, payment_method: "cash", due_date: null, items: [createEmptyRow()] });
        if (shouldPrint.current) {
          shouldPrint.current = false;
          router.push(`/sales/${invoice.id}`);
        }
      },
      onError: (error) => {
        shouldPrint.current = false;
        toast.error(error.message || "Failed to create invoice");
      },
    });
  };

  const handleSaveInvoice = () => {
    form.handleSubmit((formValues) => {
      const formData = buildFormData(formValues);

      // Check for stock warnings
      const warnings: { productName: string; requested: number; available: number }[] = [];
      for (const item of formValues.items) {
        if (item.product_name && item.quantity > 0) {
          const available = availableQtyMap.get(item.product_name) ?? 0;
          if (item.quantity > available) {
            warnings.push({
              productName: item.product_name,
              requested: item.quantity,
              available,
            });
          }
        }
      }

      if (warnings.length > 0) {
        setStockWarnings(warnings);
        pendingFormData.current = formData;
        setShowStockWarning(true);
      } else {
        submitInvoice(formData);
      }
    })();
  };

  const handleConfirmOverstock = () => {
    setShowStockWarning(false);
    if (pendingFormData.current) {
      submitInvoice(pendingFormData.current);
      pendingFormData.current = null;
    }
  };

  return (
    <>
      <div className="px-2 sm:px-6 lg:px-8 py-4 bg-background">
        <section>
          <h1 className="text-3xl font-bold">New Sale</h1>
          <p className="text-muted-foreground">
            Create a new invoice for your customer
          </p>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-3">
          <div className="p-5 flex gap-4">
            <AppCombobox
              items={customerOptions}
              searchCategory="Customers"
              onValueChange={(value) =>
                form.setValue("customer_id", value || null)
              }
            />
            <Input
              placeholder="Phone Number"
              value={selectedCustomer?.phone ?? ""}
              readOnly
            />
            <Badge variant="outline">
              {selectedCustomerId ? "Registered customer" : "Walk-in customer"}
            </Badge>
          </div>

          {/* Additional Customer Details Accordion */}
          <Accordion type="single" collapsible className="w-full px-5">
            <AccordionItem value="additional-details">
              <AccordionTrigger>
                Additional Customer Details
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div>
                  <Label className="block text font-medium">
                    GST Number:
                  </Label>
                  <Input
                    type="text"
                    className="mt-1 block w-full rounded-md shadow-sm sm:text-sm"
                    placeholder="Enter GST Number"
                    value={selectedCustomer?.gst ?? ""}
                    readOnly
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium">Email:</Label>
                  <Input
                    type="email"
                    className="mt-1 block w-full rounded-md shadow-sm sm:text-sm"
                    placeholder="Enter Email"
                    value={selectedCustomer?.email ?? ""}
                    readOnly
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium">
                    Address:
                  </Label>
                  <textarea
                    className="mt-1 block w-full rounded-md shadow-sm sm:text-sm"
                    rows={3}
                    placeholder="Enter Address"
                    value={selectedCustomer?.address ?? ""}
                    readOnly
                  ></textarea>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Payment Method */}
          <div className="px-5 pt-4 pb-2">
            <Label className="text-sm font-medium mb-3 block">Payment Method</Label>
            <RadioGroup
              value={paymentMethod || "cash"}
              onValueChange={(value) => {
                form.setValue("payment_method", value as "cash" | "upi" | "card" | "credit");
                if (value !== "credit") {
                  form.setValue("due_date", null);
                } else if (!form.getValues("due_date")) {
                  // Default due date: 30 days from now
                  const dueDate = new Date();
                  dueDate.setDate(dueDate.getDate() + 30);
                  form.setValue("due_date", dueDate.toISOString().split("T")[0]);
                }
              }}
              className="flex gap-4"
            >
              {[
                { value: "cash", label: "Cash" },
                { value: "upi", label: "UPI" },
                { value: "card", label: "Card" },
                { value: "credit", label: "Credit" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`payment-${option.value}`} />
                  <Label htmlFor={`payment-${option.value}`} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {paymentMethod === "credit" && (
              <div className="mt-3 flex items-center gap-3">
                <Label className="text-sm shrink-0">Due Date:</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !form.watch("due_date") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("due_date")
                        ? new Intl.DateTimeFormat("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(form.watch("due_date")!))
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.watch("due_date") ? new Date(form.watch("due_date")!) : undefined}
                      onSelect={(date) => {
                        form.setValue("due_date", date ? date.toISOString().split("T")[0] : null);
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <div className="p-5">
            <EditableFormTable
              form={form}
              fieldArray={fieldArray}
              columns={columns}
              createEmptyRow={createEmptyRow}
              addRowLabel="Add New Item"
            />
          </div>
        </div>
        <div className="col-span-1">
          <Card className="mt-5">
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {gstBreakdown.map((entry) => (
                  <div key={entry.rate} className="flex justify-between text-sm">
                    <span>GST @{entry.rate}%:</span>
                    <span>₹{entry.amount.toFixed(2)}</span>
                  </div>
                ))}
                {gstBreakdown.length === 0 && (
                  <div className="flex justify-between text-sm">
                    <span>GST:</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>
                )}
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
                  onClick={handleSaveInvoice}
                  disabled={createInvoiceMutation.isPending}
                >
                  {createInvoiceMutation.isPending
                    ? "Saving..."
                    : "Save Invoice"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    shouldPrint.current = true;
                    handleSaveInvoice();
                  }}
                  disabled={createInvoiceMutation.isPending}
                >
                  Save & Print
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

      <AlertDialog open={showStockWarning} onOpenChange={setShowStockWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Insufficient Stock</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p className="mb-3">
                  The following items exceed available stock:
                </p>
                <ul className="space-y-1">
                  {stockWarnings.map((w, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium">{w.productName}</span>
                      {" — "}
                      requested <span className="font-semibold">{w.requested}</span>,
                      available <span className="font-semibold text-destructive">{w.available}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm">
                  Do you still want to save this invoice?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmOverstock}>
              Save Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
