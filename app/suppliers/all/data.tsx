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
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { FilterTypes, DataTableToolbarFilters } from "@/types/datatable";
import { Supplier } from "@/types/suppliers";

export const filters: DataTableToolbarFilters[] = [
    {
        id: "name",
        label: "Name",
        type: FilterTypes.Filter,
    },
    {
        id: "phone",
        label: "Phone",
        type: FilterTypes.Filter,
    },
    {
        id: "gst",
        label: "GST",
        type: FilterTypes.Filter,
    },
];

export const primary_items = [
    {
        id: 'supplier',
        label: 'Add New Supplier',
        isVisible: true
    }
];

export const columns: ColumnDef<Supplier>[] = [
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
        accessorKey: "name",
        header: () => <div>Name</div>,
        cell: ({ row }) => (
            <div>{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "phone",
        header: () => <div>Phone</div>,
        cell: ({ row }) => (
            <div>{row.getValue("phone")}</div>
        ),
    },
    {
        accessorKey: "email",
        header: () => <div>Email</div>,
        cell: ({ row }) => (
            <div>{row.getValue("email")}</div>
        ),
    },
    {
        accessorKey: "gst",
        header: () => <div>GSTIN</div>,
        cell: ({ row }) => (
            <div>{row.getValue("gst")}</div>
        ),
    },
    {
        accessorKey: "address",
        header: () => <div>Address</div>,
        cell: ({ row }) => (
            <div>{row.getValue("address")}</div>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row, table }) => {
            const supplier = row.original;
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
                            onClick={() => navigator.clipboard.writeText(supplier.id)}
                        >
                            Copy supplier ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => meta?.onEdit?.(supplier)}>
                            Edit supplier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => meta?.onDelete?.(supplier.id)}
                        >
                            Delete supplier
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
