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

export type Payment = {
    id: string
    invoice_number: number
    status: "pending" | "processing" | "success" | "failed"
    customer_id: string
    date: string
    invoice_type: string
}

export const data: Payment[] = [
    {
        "id": "pay_001",
        "invoice_number": 1001,
        "status": "success",
        "customer_id": "cust_abc123",
        "date": "2025-05-30T14:20:00Z",
        "invoice_type": "Commercial Electrical Installation"
    },
    {
        "id": "pay_002",
        "invoice_number": 1002,
        "status": "processing",
        "customer_id": "cust_xyz789",
        "date": "2025-06-01T09:45:00Z",
        "invoice_type": "Residential Wiring Service"
    },
    {
        "id": "pay_003",
        "invoice_number": 1003,
        "status": "pending",
        "customer_id": "cust_pqr456",
        "date": "2025-06-02T08:15:00Z",
        "invoice_type": "Emergency Repair Callout"
    },
    {
        "id": "pay_004",
        "invoice_number": 1004,
        "status": "failed",
        "customer_id": "cust_mno321",
        "date": "2025-05-28T12:10:00Z",
        "invoice_type": "Electrical Panel Upgrade"
    },
    {
        "id": "pay_005",
        "invoice_number": 1005,
        "status": "success",
        "customer_id": "cust_efg654",
        "date": "2025-05-25T11:00:00Z",
        "invoice_type": "Lighting Installation"
    },
    {
        "id": "pay_006",
        "invoice_number": 1006,
        "status": "pending",
        "customer_id": "cust_stu987",
        "date": "2025-06-02T15:30:00Z",
        "invoice_type": "Circuit Breaker Replacement"
    },
    {
        "id": "pay_007",
        "invoice_number": 1007,
        "status": "processing",
        "customer_id": "cust_hij332",
        "date": "2025-05-31T10:25:00Z",
        "invoice_type": "Ceiling Fan Installation"
    },
    {
        "id": "pay_008",
        "invoice_number": 1008,
        "status": "success",
        "customer_id": "cust_kly990",
        "date": "2025-05-27T13:50:00Z",
        "invoice_type": "EV Charging Station Setup"
    },
    {
        "id": "pay_009",
        "invoice_number": 1009,
        "status": "failed",
        "customer_id": "cust_vwx221",
        "date": "2025-05-20T08:40:00Z",
        "invoice_type": "Power Surge Repair"
    },
    {
        "id": "pay_010",
        "invoice_number": 1010,
        "status": "success",
        "customer_id": "cust_opq885",
        "date": "2025-06-01T17:05:00Z",
        "invoice_type": "Generator Installation"
    },
    {
        "id": "pay_011",
        "invoice_number": 1011,
        "status": "pending",
        "customer_id": "cust_rty101",
        "date": "2025-06-02T07:00:00Z",
        "invoice_type": "Appliance Circuit Install"
    },
    {
        "id": "pay_012",
        "invoice_number": 1012,
        "status": "success",
        "customer_id": "cust_bnm556",
        "date": "2025-05-24T09:30:00Z",
        "invoice_type": "Security System Wiring"
    },
    {
        "id": "pay_013",
        "invoice_number": 1013,
        "status": "failed",
        "customer_id": "cust_ghq222",
        "date": "2025-05-22T14:45:00Z",
        "invoice_type": "Underground Cabling"
    },
    {
        "id": "pay_014",
        "invoice_number": 1014,
        "status": "processing",
        "customer_id": "cust_dlt876",
        "date": "2025-05-29T11:10:00Z",
        "invoice_type": "Surge Protection Setup"
    },
    {
        "id": "pay_015",
        "invoice_number": 1015,
        "status": "pending",
        "customer_id": "cust_mst555",
        "date": "2025-06-02T13:15:00Z",
        "invoice_type": "Backup Power Supply Install"
    },
    {
        "id": "pay_016",
        "invoice_number": 1016,
        "status": "success",
        "customer_id": "cust_lmn233",
        "date": "2025-05-23T10:00:00Z",
        "invoice_type": "Warehouse Lighting Design"
    },
    {
        "id": "pay_017",
        "invoice_number": 1017,
        "status": "processing",
        "customer_id": "cust_qwe901",
        "date": "2025-06-01T15:55:00Z",
        "invoice_type": "Solar Panel Wiring"
    },
    {
        "id": "pay_018",
        "invoice_number": 1018,
        "status": "failed",
        "customer_id": "cust_nvv442",
        "date": "2025-05-26T16:30:00Z",
        "invoice_type": "Industrial Motor Setup"
    },
    {
        "id": "pay_019",
        "invoice_number": 1019,
        "status": "success",
        "customer_id": "cust_xpo110",
        "date": "2025-05-31T07:45:00Z",
        "invoice_type": "Basement Electrical Renovation"
    },
    {
        "id": "pay_020",
        "invoice_number": 1020,
        "status": "pending",
        "customer_id": "cust_uuy777",
        "date": "2025-06-02T10:10:00Z",
        "invoice_type": "Smoke Detector Install"
    }

]

export const columns: ColumnDef<Payment>[] = [
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
        accessorKey: "invoice_number",
        header: () => <div>Invoice Number</div>,
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("invoice_number")}</div>
        ),
    },
    {
        accessorKey: "status",
        header: () => <div>Status</div>,
        cell: ({ row }) => <div className="lowercase">{row.getValue("status")}</div>,
    },
    {
        accessorKey: "customer_id",
        header: () => <div>Customer ID</div>,
        cell: ({ row }) => <div className="lowercase">{row.getValue("customer_id")}</div>,
    },
    {
        accessorKey: "date",
        header: () => <div>Date</div>,
        cell: ({ row }) => <div className="lowercase">{row.getValue("date")}</div>,
    },
    {
        accessorKey: "invoice_type",
        header: () => <div>Invoice Type</div>,
        cell: ({ row }) => <div className="lowercase">{row.getValue("invoice_type")}</div>,
    },

    // {
    //     accessorKey: "amount",
    //     header: () => <div className="text-right">Amount</div>,
    //     cell: ({ row }) => {
    //         const amount = parseFloat(row.getValue("amount"))

    //         // Format the amount as a dollar amount
    //         const formatted = new Intl.NumberFormat("en-US", {
    //             style: "currency",
    //             currency: "INR",
    //         }).format(amount)

    //         return <div className="text-right font-medium">{formatted}</div>
    //     },
    // },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const payment = row.original

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
                            onClick={() => navigator.clipboard.writeText(payment.id)}
                        >
                            Copy payment ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View customer</DropdownMenuItem>
                        <DropdownMenuItem>View payment details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export const statuses: DataTableToolbarFilterItem[] = [
    {
        value: "success",
        label: "Success",
    },
    {
        value: "failed",
        label: "Failed",
    },
    {
        value: "processing",
        label: "In Progress",
    },
    {
        value: "pending",
        label: "Pending",
    },
    {
        value: "canceled",
        label: "Canceled",
    },
]

// export const priorities: DataTableToolbarFilterItem[] = [
//     {
//         label: "Low",
//         value: "low",
//     },
//     {
//         label: "Medium",
//         value: "medium",
//     },
//     {
//         label: "High",
//         value: "high",
//     },
// ]


export const filters: DataTableToolbarFilters[] = [
    {
        id: "invoice_type",
        label: "Invoice Type",
        type: FilterTypes.Filter
    },
    {
        id: "status",
        label: "Status",
        type: FilterTypes.DropDown,
        data: statuses
    },
    // {
    //     id: "customer_id",
    //     label: "Customer ID",
    //     type: FilterTypes.DropDown,
    //     data: priorities
    // }
]

export const primary_items = [
    {
        id: 'sale',
        label: 'Add New Sale',
        isVisible: true
    }
]