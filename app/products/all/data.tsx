import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  FilterTypes,
  DataTableToolbarFilters,
} from "@/types/datatable";
import { ProductWithBatchesAPI } from "@/types/products";

// Row type enriched with resolved brand/category names and stock qty
export interface ProductRow {
  id: string;
  item: string;
  hsncode: string | null;
  unit: string | null;
  brandName: string;
  categoryName: string;
  gst_rate: number | null;
  stockQty: number;
  disabled: boolean;
  brand_id: string | null;
  category_id: string | null;
  _raw: ProductWithBatchesAPI;
}

export const filters: DataTableToolbarFilters[] = [
  {
    id: "item",
    label: "Product Name",
    type: FilterTypes.Filter,
  },
];

export const primary_items = [
  {
    id: "add-product",
    label: "Add Product",
    isVisible: true,
  },
];

export const columns: ColumnDef<ProductRow>[] = [
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
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "item",
    header: () => <div>Name</div>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("item")}</div>,
  },
  {
    accessorKey: "hsncode",
    header: () => <div>HSN Code</div>,
    cell: ({ row }) => <div>{row.getValue("hsncode") || "-"}</div>,
  },
  {
    accessorKey: "unit",
    header: () => <div>Unit</div>,
    cell: ({ row }) => <div>{row.getValue("unit") || "-"}</div>,
  },
  {
    accessorKey: "brandName",
    header: () => <div>Brand</div>,
    cell: ({ row }) => <div>{row.getValue("brandName") || "-"}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "categoryName",
    header: () => <div>Category</div>,
    cell: ({ row }) => <div>{row.getValue("categoryName") || "-"}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "gst_rate",
    header: () => <div>GST Rate</div>,
    cell: ({ row }) => <div>{row.getValue("gst_rate") ?? 18}%</div>,
  },
  {
    accessorKey: "stockQty",
    header: () => <div>Stock Qty</div>,
    cell: ({ row }) => {
      const qty = row.getValue("stockQty") as number;
      return (
        <div className={qty === 0 ? "text-destructive font-medium" : ""}>
          {qty}
        </div>
      );
    },
  },
  {
    accessorKey: "disabled",
    header: () => <div>Status</div>,
    cell: ({ row }) => {
      const disabled = row.getValue("disabled") as boolean;
      return (
        <Badge variant={disabled ? "secondary" : "default"}>
          {disabled ? "Disabled" : "Active"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const status = row.getValue(id) ? "disabled" : "active";
      return value.includes(status);
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const product = row.original;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const meta = table.options.meta as any;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => meta?.onEdit?.(product)}>
              Edit product
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => meta?.onToggleDisable?.(product)}>
              {product.disabled ? "Enable product" : "Disable product"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
