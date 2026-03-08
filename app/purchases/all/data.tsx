import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { FilterTypes, DataTableToolbarFilterItem, DataTableToolbarFilters } from "@/types/datatable"
import { Purchase } from "@/types/purchases"

export const columns: ColumnDef<Purchase>[] = [
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
        header: () => <div>Product Name</div>,
        cell: ({ row }) => <div className="font-medium">{row.getValue("productName")}</div>,
    },
    {
        accessorKey: "quantity",
        header: () => <div>Quantity</div>,
        cell: ({ row }) => <div>{row.getValue("quantity")}</div>,
    },
    {
        accessorKey: "pricePerUnit",
        header: () => <div>Price per Unit</div>,
        cell: ({ row }) => {
            const amount = row.getValue("pricePerUnit") as number;
            const formatted = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount);
            return <div>{formatted}</div>;
        },
    },
    {
        accessorKey: "totalPrice",
        header: () => <div>Total Price</div>,
        cell: ({ row }) => {
            const amount = row.getValue("totalPrice") as number;
            const formatted = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount);
            return <div className="font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: "supplierName",
        header: () => <div>Supplier</div>,
        cell: ({ row }) => <div>{row.getValue("supplierName")}</div>,
    },
    {
        accessorKey: "purchaseDate",
        header: () => <div>Purchase Date</div>,
        cell: ({ row }) => {
            const dateStr = row.getValue("purchaseDate") as string;
            if (!dateStr) return <div>-</div>;
            const formatted = new Intl.DateTimeFormat("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }).format(new Date(dateStr));
            return <div>{formatted}</div>;
        },
    },
    {
        accessorKey: "status",
        header: () => <div>Status</div>,
        cell: ({ row }) => <div className="capitalize">{row.getValue("status")}</div>,
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row, table }) => {
            const purchase = row.original;
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
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(purchase.id)}
                        >
                            Copy batch ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => meta?.onDelete?.(purchase.id)}
                        >
                            Delete purchase
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
]

export const statuses: DataTableToolbarFilterItem[] = [
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "canceled", label: "Canceled" },
]

export const filters: DataTableToolbarFilters[] = [
    {
        id: "status",
        label: "Status",
        type: FilterTypes.DropDown,
        data: statuses,
    },
    {
        id: "productName",
        label: "Product",
        type: FilterTypes.Filter,
    },
    {
        id: "supplierName",
        label: "Supplier",
        type: FilterTypes.Filter,
    },
]

export const primary_items = [
    {
        id: 'purchase',
        label: 'Add New Purchase',
        isVisible: true
    }
]
