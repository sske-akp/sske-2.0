import {
    ColumnDef,
    Row,
} from "@tanstack/react-table"
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
import * as React from "react"
import { useState } from "react"

export type InvoiceItem = {
    id: string
    product_name: number
    quantity: number
    price_per_unit: number
    total_price: string
}

export const data: InvoiceItem[] =
    [
        {
            "id": "item_002",
            "product_name": 502,
            "quantity": 4,
            "price_per_unit": 120.0,
            "total_price": "480.00"
        }
    ]

const EditableInput: React.FC<{
    row: Row<InvoiceItem>,
    onUpdateRow: (id: string, updatedRow: Partial<InvoiceItem>) => void,
    field: 'quantity' | 'price_per_unit'
}> = ({ row, onUpdateRow, field }) => {
    const [value, setValue] = useState(row.original[field])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value || '0', 10)
        setValue(newValue)

        // Get the other field's value to calculate total price
        const otherField = field === 'quantity' ? 'price_per_unit' : 'quantity'
        const otherValue = row.original[otherField]

        const total_price = (newValue * otherValue).toFixed(2)

        // Update both the changed field and the total price
        onUpdateRow(row.original.id, { [field]: newValue, total_price })
    }

    return (
        <input
            type="number"
            value={value}
            onChange={handleChange}
            className="border rounded p-1 w-16"
        />
    )
}

export const columns: ColumnDef<InvoiceItem>[] = [
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
        accessorKey: "id",
        header: () => <div>Invoice Number</div>,
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("id")}</div>
        ),
    },
    {
        accessorKey: "product_name",
        header: () => <div>Product Name</div>,
        cell: ({ row }) => <div className="lowercase">{row.getValue("product_name")}</div>,
    },
    {
        accessorKey: "quantity",
        header: () => <div>Quantity</div>,
        cell: (info) => info.getValue(),
        meta: {
            editable: true,
            editCell: ({ row, onUpdateRow }) => (
                <EditableInput
                    row={row}
                    onUpdateRow={onUpdateRow}
                    field="quantity"
                />
            ),
        },
    },
    {
        accessorKey: "price_per_unit",
        header: () => <div>Price Per Unit</div>,
        cell: (info) => info.getValue(),
        meta: {
            editable: true,
            editCell: ({ row, onUpdateRow }) => <EditableInput row={row}
                onUpdateRow={onUpdateRow} field="price_per_unit" />,
        },
    },
    {
        accessorKey: "total_price",
        header: () => <div>Total Price</div>,
        cell: ({ row }) => <div className="lowercase">{row.getValue("total_price")}</div>,
    },
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


export const filters = []

export const primary_items = []