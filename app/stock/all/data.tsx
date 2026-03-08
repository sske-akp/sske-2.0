import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { FilterTypes, DataTableToolbarFilters } from "@/types/datatable"
import { StockItem } from "@/types/stock"

export const columns: ColumnDef<StockItem>[] = [
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
        accessorKey: "productName",
        header: () => <div>Product</div>,
        cell: ({ row }) => <div className="font-medium">{row.getValue("productName")}</div>,
    },
    {
        accessorKey: "hsnCode",
        header: () => <div>HSN Code</div>,
        cell: ({ row }) => <div>{row.getValue("hsnCode") || "-"}</div>,
    },
    {
        accessorKey: "unit",
        header: () => <div>Unit</div>,
        cell: ({ row }) => <div>{row.getValue("unit")}</div>,
    },
    {
        accessorKey: "totalQty",
        header: () => <div className="text-right">Quantity</div>,
        cell: ({ row }) => {
            const qty = row.getValue("totalQty") as number;
            return (
                <div className={`text-right font-medium ${qty <= 0 ? "text-destructive" : ""}`}>
                    {qty}
                </div>
            );
        },
    },
    {
        accessorKey: "avgPrice",
        header: () => <div className="text-right">Avg Price</div>,
        cell: ({ row }) => {
            const price = row.getValue("avgPrice") as number;
            return (
                <div className="text-right">
                    {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                    }).format(price)}
                </div>
            );
        },
    },
    {
        accessorKey: "totalValue",
        header: () => <div className="text-right">Total Value</div>,
        cell: ({ row }) => {
            const value = row.getValue("totalValue") as number;
            return (
                <div className="text-right font-medium">
                    {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                    }).format(value)}
                </div>
            );
        },
    },
    {
        accessorKey: "batchCount",
        header: () => <div className="text-right">Batches</div>,
        cell: ({ row }) => (
            <div className="text-right">{row.getValue("batchCount")}</div>
        ),
    },
]

export const filters: DataTableToolbarFilters[] = [
    {
        id: "productName",
        label: "Product",
        type: FilterTypes.Filter,
    },
]

export const primary_items = [
    {
        id: 'audit',
        label: 'Stock Audit',
        isVisible: true,
    },
]
