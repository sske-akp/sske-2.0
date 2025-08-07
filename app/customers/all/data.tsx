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
import { FilterTypes, DataTableToolbarFilterItem, DataTableToolbarFilters } from "@/types/datatable";

export type Customer = {
    id: string;
    name: string;
    phone: string;
    email: string;
    gst: string;
    address: string;
    notes: string;
};

export const data: Customer[] = [
    {
        id: "cust_001",
        name: "Amit Kumar",
        phone: "9876543210",
        email: "amit@example.com",
        gst: "29ABCDE1234F2Z5",
        address: "123 Main St, Bangalore",
        notes: "Preferred customer",
    },
    {
        id: "cust_002",
        name: "Priya Sharma",
        phone: "9123456780",
        email: "priya@example.com",
        gst: "27ABCDE1234F1Z6",
        address: "456 Park Ave, Mumbai",
        notes: "",
    },
];

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
        cell: ({ row }) => {
            const customer = row.original;

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
                        <DropdownMenuItem>View details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
