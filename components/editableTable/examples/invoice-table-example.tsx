"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import {
  EditableTable,
  EditableInputCell,
  EditableComboboxCell,
  EditableRowData,
  ComboboxOption,
} from "../index";

// Example row type
interface InvoiceItem extends EditableRowData {
  product_name: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
}

// Example product options (would typically come from API)
const productOptions: ComboboxOption[] = [
  { value: "widget-a", label: "Widget A", price: 10 },
  { value: "widget-b", label: "Widget B", price: 25 },
  { value: "gadget-x", label: "Gadget X", price: 50 },
];

// Example column definitions
const columns: ColumnDef<InvoiceItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 50,
  },
  {
    accessorKey: "product_name",
    header: () => <div>Product Name</div>,
    cell: (info) => info.getValue(),
    meta: {
      editable: true,
      editCell: (props) => (
        <EditableComboboxCell
          {...props}
          field="product_name"
          options={productOptions}
          searchPlaceholder="Search products..."
          onValueChange={(value, selectedOption, row) => {
            const price = (selectedOption?.price as number) || 0;
            const total_price = parseFloat((price * row.quantity).toFixed(2));
            return { product_name: value, price_per_unit: price, total_price };
          }}
        />
      ),
    },
    size: 300,
  },
  {
    accessorKey: "quantity",
    header: () => <div>Quantity</div>,
    cell: (info) => info.getValue(),
    meta: {
      editable: true,
      editCell: (props) => (
        <EditableInputCell
          {...props}
          field="quantity"
          type="number"
          onValueChange={(value, row) => {
            const quantity = value as number;
            const total_price = parseFloat(
              (row.price_per_unit * quantity).toFixed(2)
            );
            return { quantity, total_price };
          }}
        />
      ),
    },
    size: 100,
  },
  {
    accessorKey: "price_per_unit",
    header: () => <div>Price Per Unit</div>,
    cell: (info) => info.getValue(),
    meta: {
      editable: true,
      editCell: (props) => (
        <EditableInputCell
          {...props}
          field="price_per_unit"
          type="number"
          onValueChange={(value, row) => {
            const price_per_unit = value as number;
            const total_price = parseFloat(
              (price_per_unit * row.quantity).toFixed(2)
            );
            return { price_per_unit, total_price };
          }}
        />
      ),
    },
    size: 150,
  },
  {
    accessorKey: "total_price",
    header: () => <div>Total Price</div>,
    cell: ({ row }) => (
      <div>${row.getValue<number>("total_price").toFixed(2)}</div>
    ),
    size: 100,
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as { deleteRow: (id: string) => void };
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            meta.deleteRow(row.original.id);
            toast("Item deleted");
          }}
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      );
    },
    size: 50,
  },
];

// Example usage component
export function InvoiceTableExample() {
  const [data, setData] = React.useState<InvoiceItem[]>([
    {
      id: uuidv4(),
      product_name: "",
      quantity: 0,
      price_per_unit: 0,
      total_price: 0,
    },
  ]);

  const getNewRow = (): InvoiceItem => ({
    id: uuidv4(),
    product_name: "",
    quantity: 0,
    price_per_unit: 0,
    total_price: 0,
  });

  // Calculate totals
  const totals = React.useMemo(() => {
    const subtotal = data.reduce((acc, item) => acc + item.total_price, 0);
    const tax = subtotal * 0.18;
    return { subtotal, tax, total: subtotal + tax };
  }, [data]);

  return (
    <div className="space-y-4">
      <EditableTable
        columns={columns}
        data={data}
        getNewRow={getNewRow}
        onDataChange={setData}
      />
      <div className="text-right space-y-1">
        <p>Subtotal: ${totals.subtotal.toFixed(2)}</p>
        <p>Tax (18%): ${totals.tax.toFixed(2)}</p>
        <p className="font-bold">Total: ${totals.total.toFixed(2)}</p>
      </div>
    </div>
  );
}
