import {
    ColumnDef,
    Row
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
            "id": "item_001",
            "product_name": 501,
            "quantity": 10,
            "price_per_unit": 15.5,
            "total_price": "155.00"
        },
        {
            "id": "item_002",
            "product_name": 502,
            "quantity": 4,
            "price_per_unit": 120.0,
            "total_price": "480.00"
        },
        {
            "id": "item_001",
            "product_name": 501,
            "quantity": 10,
            "price_per_unit": 15.5,
            "total_price": "155.00"
        },
        {
            "id": "item_002",
            "product_name": 502,
            "quantity": 4,
            "price_per_unit": 120.0,
            "total_price": "480.00"
        },
        {
            "id": "item_001",
            "product_name": 501,
            "quantity": 10,
            "price_per_unit": 15.5,
            "total_price": "155.00"
        },
        {
            "id": "item_002",
            "product_name": 502,
            "quantity": 4,
            "price_per_unit": 120.0,
            "total_price": "480.00"
        },
        {
            "id": "item_001",
            "product_name": 501,
            "quantity": 10,
            "price_per_unit": 15.5,
            "total_price": "155.00"
        },
        {
            "id": "item_002",
            "product_name": 502,
            "quantity": 4,
            "price_per_unit": 120.0,
            "total_price": "480.00"
        },
        {
            "id": "item_001",
            "product_name": 501,
            "quantity": 10,
            "price_per_unit": 15.5,
            "total_price": "155.00"
        },
        {
            "id": "item_002",
            "product_name": 502,
            "quantity": 4,
            "price_per_unit": 120.0,
            "total_price": "480.00"
        },
        {
            "id": "item_001",
            "product_name": 501,
            "quantity": 10,
            "price_per_unit": 15.5,
            "total_price": "155.00"
        },
        {
            "id": "item_002",
            "product_name": 502,
            "quantity": 4,
            "price_per_unit": 120.0,
            "total_price": "480.00"
        },
        {
            "id": "item_001",
            "product_name": 501,
            "quantity": 10,
            "price_per_unit": 15.5,
            "total_price": "155.00"
        },
        {
            "id": "item_002",
            "product_name": 502,
            "quantity": 4,
            "price_per_unit": 120.0,
            "total_price": "480.00"
        },
        {
            "id": "item_001",
            "product_name": 501,
            "quantity": 10,
            "price_per_unit": 15.5,
            "total_price": "155.00"
        },
        {
            "id": "item_002",
            "product_name": 502,
            "quantity": 4,
            "price_per_unit": 120.0,
            "total_price": "480.00"
        },
        {
            "id": "item_001",
            "product_name": 501,
            "quantity": 10,
            "price_per_unit": 15.5,
            "total_price": "155.00"
        },
        {
            "id": "item_002",
            "product_name": 502,
            "quantity": 4,
            "price_per_unit": 120.0,
            "total_price": "480.00"
        },
        {
            "id": "item_002",
            "product_name": 502,
            "quantity": 4,
            "price_per_unit": 120.0,
            "total_price": "480.00"
        },
        {
            "id": "item_001",
            "product_name": 501,
            "quantity": 10,
            "price_per_unit": 15.5,
            "total_price": "155.00"
        },
        {
            "id": "item_002",
            "product_name": 502,
            "quantity": 4,
            "price_per_unit": 120.0,
            "total_price": "480.00"
        },
        {
            "id": "item_001",
            "product_name": 501,
            "quantity": 10,
            "price_per_unit": 15.5,
            "total_price": "155.00"
        },
        {
            "id": "item_002",
            "product_name": 502,
            "quantity": 4,
            "price_per_unit": 120.0,
            "total_price": "480.00"
        },
        {
            "id": "item_001",
            "product_name": 501,
            "quantity": 10,
            "price_per_unit": 15.5,
            "total_price": "155.00"
        },
        {
            "id": "item_002",
            "product_name": 502,
            "quantity": 4,
            "price_per_unit": 120.0,
            "total_price": "480.00"
        },
        {
            "id": "item_002",
            "product_name": 502,
            "quantity": 4,
            "price_per_unit": 120.0,
            "total_price": "480.00"
        },
        {
            "id": "item_001",
            "product_name": 501,
            "quantity": 10,
            "price_per_unit": 15.5,
            "total_price": "155.00"
        },
        {
            "id": "item_002",
            "product_name": 502,
            "quantity": 4,
            "price_per_unit": 120.0,
            "total_price": "480.00"
        },
        {
            "id": "item_001",
            "product_name": 501,
            "quantity": 10,
            "price_per_unit": 15.5,
            "total_price": "155.00"
        },
        {
            "id": "item_002",
            "product_name": 502,
            "quantity": 4,
            "price_per_unit": 120.0,
            "total_price": "480.00"
        },
        {
            "id": "item_001",
            "product_name": 501,
            "quantity": 10,
            "price_per_unit": 15.5,
            "total_price": "155.00"
        },
        {
            "id": "item_002",
            "product_name": 502,
            "quantity": 4,
            "price_per_unit": 120.0,
            "total_price": "480.00"
        }
    ]

const QuantityInput: React.FC<{ row: Row<InvoiceItem> }> = ({ row }) => {
    const [quantity, setQuantity] = useState(row.original.quantity);

    const handleQuantityChange = (id: string, newQuantity: number) => {
        setQuantity(newQuantity);
        row.original.quantity = newQuantity;
        row.original.total_price = (newQuantity * row.original.price_per_unit).toFixed(2);
    };

    return (
        <input
            type="number"
            value={quantity}
            onChange={(e) =>
                handleQuantityChange(row.original.id, parseInt(e.target.value, 10))
            }
            className="border rounded p-1 w-16"
        />
    );
};

const PricePerUnitInput: React.FC<{ row: Row<InvoiceItem> }> = ({ row }) => {
    const [price_per_unit, setPricePerUnit] = useState(row.original.price_per_unit);

    const handlePricePerUnitChange = (id: string, newPricePerUnit: number) => {
        setPricePerUnit(newPricePerUnit);
        row.original.price_per_unit = newPricePerUnit;
        row.original.total_price = (newPricePerUnit * row.original.price_per_unit).toFixed(2);
    };

    return (
        <input
            type="number"
            value={price_per_unit}
            onChange={(e) =>
                handlePricePerUnitChange(row.original.id, parseInt(e.target.value, 10))
            }
            className="border rounded p-1 w-16"
        />
    );
};

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
            editCell: QuantityInput,
        },
    },
    {
        accessorKey: "price_per_unit",
        header: () => <div>Price Per Unit</div>,
        cell: ({ row }) => <PricePerUnitInput row={row} />,
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