import {
    ColumnDef,
    Row,
} from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"

// import {
//     DropdownMenuItem,
//     DropdownMenuLabel,
//     DropdownMenuSeparator,
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuTrigger
// } from "@/components/ui/dropdown-menu"
import * as React from "react"
import { useState } from "react"
import { AppCombobox } from "@/components/utils/appCombobox"
import { DataTableToolbarButtons } from "@/types/datatable";

export type InvoiceItem = {
    id: string
    product_name: string
    quantity: number
    price_per_unit: number
    total_price: number
}

export const data: InvoiceItem[] =
    [
        {
            "id": "",
            "product_name": "",
            "quantity": 0,
            "price_per_unit": 0,
            "total_price": 0
        }
    ]

const EditableInput: React.FC<{
    row: Row<InvoiceItem>,
    onUpdateRow: (id: string, updatedRow: Partial<InvoiceItem>) => void,
    field: 'quantity' | 'price_per_unit',
    onAddRow?: () => void,
    isLastCell?: boolean,
}> = ({ row, onUpdateRow, field, onAddRow, isLastCell }) => {
    const [value, setValue] = useState(row.original[field])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value || '', 10)
        setValue(newValue)

        // Get the other field's value to calculate total price
        const otherField = field === 'quantity' ? 'price_per_unit' : 'quantity'
        const otherValue = row.original[otherField]

        const total_price = (newValue * otherValue) || 0

        // Update both the changed field and the total price
        onUpdateRow(row.original.id, { [field]: newValue, total_price })
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && isLastCell && onAddRow) {
            onAddRow();
        }
    }

    return (
        <input
            type="number"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full"
        />
    )
}

const EditableComboBox: React.FC<{
    row: Row<InvoiceItem>,
    onUpdateRow: (id: string, updatedRow: Partial<InvoiceItem>) => void,
    field: 'product_name',
    onAddRow?: () => void,
    isLastCell?: boolean,
}> = ({ row, onUpdateRow, field, onAddRow, isLastCell }) => {
    const [value, setValue] = useState("")

    const handleValueChange = (newValue: string) => {
        setValue(newValue);
        onUpdateRow(row.original.id, { [field]: newValue });
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && isLastCell && onAddRow) {
            onAddRow();
        }
    }

    return (
        <div onKeyDown={handleKeyDown}>
            <AppCombobox
                items={[
                    { label: 'a', value: 'b' },
                    { label: 'c', value: 'd' },
                    { label: 'e', value: 'f' },
                    { label: 'g', value: 'h' },
                    { label: 'i', value: 'j' }
                ]}
                searchCategory="Items"
                defaultValue={value.toString()}
                onValueChange={handleValueChange}
            />
        </div>
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
        size: 50,
    },
    {
        accessorKey: "product_name",
        header: () => <div>Product Name</div>,
        cell: (info) => info.getValue(),
        meta: {
            editable: true,
            editCell: ({ row, onUpdateRow, onAddRow, isLastCell }) => (
                <div className="custom-combobox">
                    <EditableComboBox
                        row={row}
                        onUpdateRow={onUpdateRow}
                        field="product_name"
                        onAddRow={onAddRow}
                        isLastCell={isLastCell}
                    />
                </div>
            )
        },
        size: 600,
    },
    {
        accessorKey: "quantity",
        header: () => <div>Quantity</div>,
        cell: (info) => info.getValue(),
        meta: {
            editable: true,
            editCell: ({ row, onUpdateRow, onAddRow, isLastCell }) => (
                <EditableInput
                    row={row}
                    onUpdateRow={onUpdateRow}
                    field="quantity"
                    onAddRow={onAddRow}
                    isLastCell={isLastCell}
                />
            ),
        },
        size: 100,
    },
    {
        accessorKey: "price_per_unit",
        header: () => <div>Price Per Unit</div>,
        cell: (info) => info.getValue(),
        meta: {
            editable: true,
            editCell: ({ row, onUpdateRow, onAddRow, isLastCell }) => (
                <EditableInput
                    row={row}
                    onUpdateRow={onUpdateRow}
                    field="price_per_unit"
                    onAddRow={onAddRow}
                    isLastCell={isLastCell}
                />
            ),
        },
        size: 150,
    },
    {
        accessorKey: "total_price",
        header: () => <div>Total Price</div>,
        cell: ({ row }) => <div className="lowercase">{row.getValue("total_price")}</div>,
        size: 100,
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row, table }) => { // Add row and table to cell context
            // const payment = row.original
            const { handleDeleteRow } = table.options.meta as any; // Access handleDeleteRow from table meta

            return (
                <div>
                    {/* This dropdown might not be needed  */}
                    {/* <DropdownMenu>
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
                    </DropdownMenu> */}
                    <Button variant='ghost' onClick={
                        () => {
                            handleDeleteRow(row.original.id); // Call handleDeleteRow
                            toast("Item has been deleted")
                        }
                    }>

                        <Trash2Icon />
                    </Button>
                </div>
            )
        },
        size: 50,
    },
]


export const filters = []

export const primary_items: DataTableToolbarButtons[] = [{
    id: 'item',
    label: 'Add New Item',
    isVisible: true,
    onClick: () => {
        toast('added new row')
    }
}]
