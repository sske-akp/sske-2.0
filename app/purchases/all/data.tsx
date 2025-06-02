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

export type Purchase = {
    id: string;
    product_name: string;
    quantity: number;
    price_per_unit: number;
    total_price: number;
    supplier_name: string;
    purchase_date: string;
    status: "pending" | "completed" | "canceled";
};

export const data: Purchase[] = [
    {
        id: "purchase_001",
        product_name: "Wireless Mouse",
        quantity: 50,
        price_per_unit: 15.99,
        total_price: 799.5,
        supplier_name: "Tech Supplies Co.",
        purchase_date: "2025-06-01T10:30:00Z",
        status: "completed",
    },
    {
        id: "purchase_002",
        product_name: "Mechanical Keyboard",
        quantity: 30,
        price_per_unit: 45.5,
        total_price: 1365,
        supplier_name: "Keyboard World",
        purchase_date: "2025-06-02T14:00:00Z",
        status: "pending",
    },
    {
        id: "purchase_003",
        product_name: "HDMI Cable",
        quantity: 100,
        price_per_unit: 5.99,
        total_price: 599,
        supplier_name: "Cable Solutions",
        purchase_date: "2025-05-30T09:15:00Z",
        status: "completed",
    },
    {
        id: "purchase_004",
        product_name: "USB-C Adapter",
        quantity: 75,
        price_per_unit: 12.5,
        total_price: 937.5,
        supplier_name: "Adapters Inc.",
        purchase_date: "2025-05-28T11:45:00Z",
        status: "canceled",
    },
    {
        id: "purchase_005",
        product_name: "External Hard Drive",
        quantity: 20,
        price_per_unit: 89.99,
        total_price: 1799.8,
        supplier_name: "Storage Solutions",
        purchase_date: "2025-06-01T16:20:00Z",
        status: "completed",
    },
];

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
        accessorKey: "product_name",
        header: () => <div>Product Name</div>,
        cell: ({ row }) => <div className="capitalize">{row.getValue("product_name")}</div>,
    },
    {
        accessorKey: "quantity",
        header: () => <div>Quantity</div>,
        cell: ({ row }) => <div>{row.getValue("quantity")}</div>,
    },
    {
        accessorKey: "price_per_unit",
        header: () => <div>Price per Unit</div>,
        cell: ({ row }) => (
            <div>
                {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                }).format(row.getValue("price_per_unit"))}
            </div>
        ),
    },
    {
        accessorKey: "total_price",
        header: () => <div>Total Price</div>,
        cell: ({ row }) => (
            <div>
                {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                }).format(row.getValue("total_price"))}
            </div>
        ),
    },
    {
        accessorKey: "supplier_name",
        header: () => <div>Supplier Name</div>,
        cell: ({ row }) => <div className="capitalize">{row.getValue("supplier_name")}</div>,
    },
    {
        accessorKey: "purchase_date",
        header: () => <div>Purchase Date</div>,
        cell: ({ row }) => (
            <div>{new Date(row.getValue("purchase_date")).toLocaleDateString()}</div>
        ),
    },
    {
        accessorKey: "status",
        header: () => <div>Status</div>,
        cell: ({ row }) => <div className="capitalize">{row.getValue("status")}</div>,
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const purchase = row.original;

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
                            Copy Purchase ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Supplier</DropdownMenuItem>
                        <DropdownMenuItem>View Purchase Details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export const statuses: DataTableToolbarFilterItem[] = [
    {
        value: "completed",
        label: "Completed",
    },
    {
        value: "pending",
        label: "Pending",
    },
    {
        value: "canceled",
        label: "Canceled",
    },
];

export const filters: DataTableToolbarFilters[] = [
    {
        id: "status",
        label: "Status",
        type: FilterTypes.DropDown,
        data: statuses,
    },
    {
        id: "supplier_name",
        label: "Supplier Name",
        type: FilterTypes.Filter,
    },
];

export const primary_items = [
    {
        id: 'purchase',
        label: 'Add New Purchase',
        isVisible: true
    }
]