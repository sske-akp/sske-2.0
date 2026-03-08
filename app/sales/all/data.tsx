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
import { Badge } from "@/components/ui/badge"
import { FilterTypes, DataTableToolbarFilters } from "@/types/datatable"
import { Invoice } from "@/types/invoices"

function PaymentStatusBadge({ status }: { status: string }) {
    switch (status) {
        case "paid":
            return (
                <Badge variant="outline" className="border-green-500 text-green-700">
                    Paid
                </Badge>
            );
        case "partial":
            return (
                <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                    Partial
                </Badge>
            );
        case "unpaid":
        default:
            return (
                <Badge variant="outline" className="border-red-500 text-red-700">
                    Unpaid
                </Badge>
            );
    }
}

export const columns: ColumnDef<Invoice>[] = [
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
        accessorKey: "invoiceNumber",
        header: () => <div>Invoice Number</div>,
        cell: ({ row, table }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const meta = table.options.meta as any;
            return (
                <button
                    className="font-medium text-primary underline-offset-4 hover:underline cursor-pointer"
                    onClick={() => meta?.onViewInvoice?.(row.original.id)}
                >
                    {row.getValue("invoiceNumber")}
                </button>
            );
        },
    },
    {
        accessorKey: "customerName",
        header: () => <div>Customer</div>,
        cell: ({ row }) => <div>{row.getValue("customerName")}</div>,
    },
    {
        accessorKey: "invoiceDate",
        header: () => <div>Date</div>,
        cell: ({ row }) => {
            const dateStr = row.getValue("invoiceDate") as string;
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
        accessorKey: "invoiceType",
        header: () => <div>Type</div>,
        cell: ({ row }) => {
            const type = row.getValue("invoiceType") as string;
            return (
                <div>
                    {type === "credit_note" ? (
                        <Badge variant="secondary">Credit Note</Badge>
                    ) : (
                        <span className="capitalize">{type || "Sale"}</span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: () => <div>Status</div>,
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            if (status === "cancelled") {
                return <Badge variant="destructive">Cancelled</Badge>;
            }
            return (
                <Badge variant="outline" className="border-green-500 text-green-700">
                    Active
                </Badge>
            );
        },
    },
    {
        accessorKey: "paymentStatus",
        header: () => <div>Payment</div>,
        cell: ({ row }) => {
            const status = row.getValue("paymentStatus") as string;
            return <PaymentStatusBadge status={status} />;
        },
        filterFn: (row, id, value: string[]) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: "totalAmount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const amount = row.getValue("totalAmount") as number;
            const formatted = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: "itemCount",
        header: () => <div className="text-right">Items</div>,
        cell: ({ row }) => (
            <div className="text-right">{row.getValue("itemCount")}</div>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row, table }) => {
            const invoice = row.original
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const meta = table.options.meta as any

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
                            onClick={() => navigator.clipboard.writeText(invoice.id)}
                        >
                            Copy invoice ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => window.location.href = `/sales/${invoice.id}`}
                        >
                            View / Print invoice
                        </DropdownMenuItem>
                        {invoice.invoiceType === "sale" && invoice.status === "active" && (
                            <DropdownMenuItem
                                onClick={() => meta?.onReturn?.(invoice.id)}
                            >
                                Return / Cancel
                            </DropdownMenuItem>
                        )}
                        {invoice.invoiceType === "sale" && invoice.paymentStatus !== "paid" && (
                            <DropdownMenuItem
                                onClick={() => meta?.onRecordPayment?.(invoice)}
                            >
                                Record Payment
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export const filters: DataTableToolbarFilters[] = [
    {
        id: "invoiceNumber",
        label: "Invoice Number",
        type: FilterTypes.Filter
    },
    {
        id: "customerName",
        label: "Customer",
        type: FilterTypes.Filter
    },
    {
        id: "paymentStatus",
        label: "Payment Status",
        type: FilterTypes.DropDown,
        data: [
            { value: "paid", label: "Paid" },
            { value: "partial", label: "Partial" },
            { value: "unpaid", label: "Unpaid" },
        ],
    },
]

export const primary_items = [
    {
        id: 'sale',
        label: 'Add New Sale',
        isVisible: true
    }
]
