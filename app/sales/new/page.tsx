"use client";

import React from "react";
import { AppCombobox } from "@/components/utils/appCombobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EditableFormTable } from "@/components/editableFormTable";
import type { ColumnConfig, ComboboxOption } from "@/components/editableFormTable";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { useProducts } from "@/hooks/productsHooks";
import { InvoiceItem } from "./schema";

const createEmptyRow = (): InvoiceItem => ({
  product_name: "",
  quantity: 0,
  price_per_unit: 0,
  total_price: 0,
});

export default function NewSale() {
  const { form, fieldArray, summary } = useInvoiceForm({
    createEmptyRow,
  });

  const { data: products } = useProducts();

  const productOptions: ComboboxOption[] = React.useMemo(
    () =>
      products
        ? products.map((p) => ({
            label: p.product_name,
            value: p.product_name,
            price_per_unit: p.price_per_unit,
          }))
        : [],
    [products]
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
        }),
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
        type: "computed",
        accessorKey: "total_price",
        header: "Total Price",
        size: 100,
        compute: (row: InvoiceItem) =>
          `₹${(Number(row.total_price) || 0).toFixed(2)}`,
      },
      {
        type: "action",
        size: 50,
      },
    ],
    [productOptions]
  );

  const { subtotal, gst, total, numItems, totalQuantity } = summary;

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
              items={[{ label: "a", value: "b" }]}
              searchCategory="Customers"
            />
            <Input placeholder="Phone Number" />
            <Badge variant="outline">Walk-in customer</Badge>
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
                    className="mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter GST Number"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium">Email:</Label>
                  <Input
                    type="email"
                    className="mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter Email"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium">
                    Address:
                  </Label>
                  <textarea
                    className="mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    rows={3}
                    placeholder="Enter Address"
                  ></textarea>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

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
                <Button className="w-full" size="lg">
                  Save Invoice
                </Button>
                <Button variant="outline" className="w-full">
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
    </>
  );
}
