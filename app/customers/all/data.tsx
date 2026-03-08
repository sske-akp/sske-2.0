import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { FilterTypes, DataTableToolbarFilterItem, DataTableToolbarFilters } from "@/types/datatable";
import { Customer } from "@/types/customers";

export const notesOptions: DataTableToolbarFilterItem[] = [
    {
        value: "Preferred customer",
        label: "Preferred customer",
    },
    {
        value: "",
        label: "None",
    },
];

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
    {
        id: "notes",
        label: "Notes",
        type: FilterTypes.DropDown,
        data: notesOptions,
    },
];

export const primary_items = [
    {
        id: 'customer',
        label: 'Add New Customer',
        isVisible: true
    }
];

export const columns: ColumnDef<Customer>[] = [
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
            <Link
                href={`/customers/${row.original.id}`}
                className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
                {row.getValue("name")}
            </Link>
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
        header: () => <div>GST</div>,
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
        accessorKey: "notes",
        header: () => <div>Notes</div>,
        cell: ({ row }) => (
            <div>{row.getValue("notes") || "-"}</div>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row, table }) => {
            const customer = row.original;
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
                            onClick={() => navigator.clipboard.writeText(customer.id)}
                        >
                            Copy customer ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/customers/${customer.id}`}>
                                View customer
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => meta?.onEdit?.(customer)}>
                            Edit customer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => meta?.onDelete?.(customer.id)}
                        >
                            Delete customer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
