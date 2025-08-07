import { ColumnDef, Row } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import * as React from 'react';
import { useState } from 'react';
import { useProducts } from '@/hooks/productsHooks';
import { AppCombobox } from '@/components/utils/appCombobox';
import { DataTableToolbarButtons } from '@/types/datatable';

export type PurchaseItem = {
    id: string;
    product_name: string;
    quantity: number;
    price_per_unit: number;
    total_price: number;
};

export const data: PurchaseItem[] = [
    {
        id: '',
        product_name: '',
        quantity: 0,
        price_per_unit: 0,
        total_price: 0,
    },
];

const EditableInput: React.FC<{
    row: Row<PurchaseItem>;
    onUpdateRow: (id: string, updatedRow: Partial<PurchaseItem>) => void;
    field: 'quantity' | 'price_per_unit';
    onAddRow?: () => void;
    isLastCell?: boolean;
}> = ({ row, onUpdateRow, field, onAddRow, isLastCell }) => {
    const [value, setValue] = useState(row.original[field]);

    React.useEffect(() => {
        setValue(row.original[field]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [row.original[field]]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value || '', 10);
        setValue(newValue);

        const otherField = field === 'quantity' ? 'price_per_unit' : 'quantity';
        const otherValue = row.original[otherField];

        const total_price = parseFloat((newValue * otherValue).toFixed(2));

        onUpdateRow(row.original.id, { [field]: newValue, total_price });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && isLastCell && onAddRow) {
            onAddRow();
        }
    };

    return (
        <input
            type="number"
            value={isNaN(value) ? '' : value.toString()}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full"
        />
    );
};

const EditableComboBox: React.FC<{
    row: Row<PurchaseItem>;
    onUpdateRow: (id: string, updatedRow: Partial<PurchaseItem>) => void;
    field: 'product_name';
    onAddRow?: () => void;
    isLastCell?: boolean;
}> = ({ row, onUpdateRow, field, onAddRow, isLastCell }) => {
    const [value, setValue] = useState(row.original[field]);
    const { data: products } = useProducts();

    React.useEffect(() => {
        setValue(row.original[field]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [row.original[field]]);

    const productOptions = products
        ? products.map((product) => ({
            label: product.product_name,
            value: product.product_name,
            ...product,
        }))
        : [];

    const handleValueChange = (newValue: string) => {
        setValue(newValue);
        const selectedProduct = productOptions.find((product) => product.value === newValue);
        const price = selectedProduct?.price_per_unit || 0;
        const total_price = parseFloat((price * (row.original.quantity || 0)).toFixed(2));
        onUpdateRow(row.original.id, { [field]: newValue, price_per_unit: price, total_price });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && isLastCell && onAddRow) {
            onAddRow();
            setTimeout(() => {
                requestAnimationFrame(() => {
                    const comboboxInputs = document.querySelectorAll('.custom-combobox input');
                    if (comboboxInputs.length > 0) {
                        const lastInput = comboboxInputs[comboboxInputs.length - 1] as HTMLElement;
                        lastInput.focus();
                        lastInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
            }, 500);
        }
    };

    return (
        <div onKeyDown={handleKeyDown}>
            <AppCombobox
                items={productOptions}
                searchCategory="Items"
                defaultValue={value.toString()}
                onValueChange={handleValueChange}
            />
        </div>
    );
};


export const columns: ColumnDef<PurchaseItem>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
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
        accessorKey: 'product_name',
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
            ),
        },
        size: 250,
    },
    {
        accessorKey: 'quantity',
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
        accessorKey: 'price_per_unit',
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
        accessorKey: 'total_price',
        header: () => <div>Total Price</div>,
        cell: ({ row }) => <div>{row.getValue('total_price')}</div>,
        size: 120,
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row, table }) => {
            const { handleDeleteRow } = table.options.meta as { handleDeleteRow: (id: string) => void };
            return (
                <Button
                    variant="ghost"
                    onClick={() => {
                        handleDeleteRow(row.original.id);
                        toast('Item has been deleted');
                    }}
                >
                    <Trash2Icon />
                </Button>
            );
        },
        size: 50,
    },
];

export const filters = [];

export const primary_items: DataTableToolbarButtons[] = [
    {
        id: 'purchase',
        label: 'Add New Purchase Item',
        isVisible: true,
    },
];

export function calculatePurchaseSummary(items: PurchaseItem[]): { subtotal: number; gst: number; total: number; numItems: number; totalQuantity: number } {
    const subtotal = items.reduce((acc, item) => acc + item.total_price, 0);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    const numItems = items.length;
    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    return { subtotal, gst, total, numItems, totalQuantity };
}
