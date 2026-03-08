# Editable TanStack Table Component Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a reusable, well-organized editable table component using TanStack Table v8, placed in a new dedicated folder to avoid confusion with existing implementations.

**Architecture:** The component will use TanStack Table's `meta` system for passing editable cell configuration. Each column can define an `editCell` component via column meta. The table component manages internal data state and exposes callbacks for parent components. Cell editors are built as composable, reusable components.

**Tech Stack:** TanStack React Table v8, React, TypeScript, shadcn/ui components

---

## Task 1: Create Type Definitions for Editable Table

**Files:**
- Create: `components/editableTable/types.ts`

**Step 1: Write the type definitions**

```typescript
import { ColumnDef, Row, RowData, Table } from "@tanstack/react-table";

// Base row type constraint - all rows must have an id
export interface EditableRowData {
  id: string;
}

// Props passed to editable cell components
export interface EditableCellProps<TData extends EditableRowData> {
  row: Row<TData>;
  getValue: () => unknown;
  onUpdateRow: (id: string, updates: Partial<TData>) => void;
  onAddRow?: () => void;
  isLastEditableCell?: boolean;
}

// Table meta for passing handlers to cells
export interface EditableTableMeta<TData extends EditableRowData> {
  updateRow: (id: string, updates: Partial<TData>) => void;
  deleteRow: (id: string) => void;
  addRow: () => void;
}

// Props for the main EditableTable component
export interface EditableTableProps<TData extends EditableRowData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  getNewRow: () => TData;
  onDataChange?: (data: TData[]) => void;
  enableToolbar?: boolean;
  toolbarActions?: ToolbarAction[];
}

// Toolbar action button configuration
export interface ToolbarAction {
  id: string;
  label: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
}
```

**Step 2: Verify the file was created correctly**

Run: Check file exists and has no TypeScript errors

---

## Task 2: Extend TanStack Table Types for Editable Meta

**Files:**
- Create: `components/editableTable/tanstack-extensions.d.ts`

**Step 1: Write the TanStack Table type extensions**

```typescript
import { RowData, Row } from "@tanstack/react-table";
import { EditableCellProps, EditableTableMeta, EditableRowData } from "./types";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    editable?: boolean;
    editCell?: React.ComponentType<EditableCellProps<TData & EditableRowData>>;
  }

  interface TableMeta<TData extends RowData> extends EditableTableMeta<TData & EditableRowData> {}
}
```

**Step 2: Verify TypeScript recognizes the extensions**

Run: Check for TypeScript errors in the project

---

## Task 3: Create Editable Input Cell Component

**Files:**
- Create: `components/editableTable/cells/EditableInputCell.tsx`

**Step 1: Write the EditableInputCell component**

```tsx
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { EditableCellProps, EditableRowData } from "../types";

interface EditableInputCellProps<TData extends EditableRowData> extends EditableCellProps<TData> {
  field: keyof TData;
  type?: "text" | "number";
  placeholder?: string;
  className?: string;
  onValueChange?: (value: string | number, row: TData) => Partial<TData>;
}

export function EditableInputCell<TData extends EditableRowData>({
  row,
  getValue,
  field,
  type = "text",
  placeholder,
  className,
  onUpdateRow,
  onAddRow,
  isLastEditableCell,
  onValueChange,
}: EditableInputCellProps<TData>) {
  const initialValue = getValue() as string | number;
  const [value, setValue] = React.useState(initialValue);

  // Sync with external data changes
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const newValue = type === "number" ? parseFloat(rawValue) || 0 : rawValue;
    setValue(newValue);

    // Calculate any derived fields via callback
    const updates = onValueChange
      ? onValueChange(newValue, row.original)
      : { [field]: newValue };

    onUpdateRow(row.original.id, updates as Partial<TData>);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isLastEditableCell && onAddRow) {
      e.preventDefault();
      onAddRow();
    }
  };

  return (
    <Input
      type={type}
      value={type === "number" && isNaN(value as number) ? "" : String(value)}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={className}
    />
  );
}
```

**Step 2: Verify the component compiles without errors**

Run: `npx tsc --noEmit`

---

## Task 4: Create Editable Combobox Cell Component

**Files:**
- Create: `components/editableTable/cells/EditableComboboxCell.tsx`

**Step 1: Write the EditableComboboxCell component**

```tsx
"use client";

import * as React from "react";
import { AppCombobox } from "@/components/utils/appCombobox";
import { EditableCellProps, EditableRowData } from "../types";

export interface ComboboxOption {
  value: string;
  label: string;
  [key: string]: unknown;
}

interface EditableComboboxCellProps<TData extends EditableRowData> extends EditableCellProps<TData> {
  field: keyof TData;
  options: ComboboxOption[];
  searchPlaceholder?: string;
  className?: string;
  onValueChange?: (value: string, selectedOption: ComboboxOption | undefined, row: TData) => Partial<TData>;
}

export function EditableComboboxCell<TData extends EditableRowData>({
  row,
  getValue,
  field,
  options,
  searchPlaceholder = "Search...",
  className,
  onUpdateRow,
  onAddRow,
  isLastEditableCell,
  onValueChange,
}: EditableComboboxCellProps<TData>) {
  const initialValue = getValue() as string;
  const [value, setValue] = React.useState(initialValue);

  // Sync with external data changes
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    const selectedOption = options.find((opt) => opt.value === newValue);

    // Calculate any derived fields via callback
    const updates = onValueChange
      ? onValueChange(newValue, selectedOption, row.original)
      : { [field]: newValue };

    onUpdateRow(row.original.id, updates as Partial<TData>);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isLastEditableCell && onAddRow) {
      onAddRow();
      // Focus management for new row
      setTimeout(() => {
        requestAnimationFrame(() => {
          const inputs = document.querySelectorAll('[data-editable-table] input');
          if (inputs.length > 0) {
            const lastInput = inputs[inputs.length - 1] as HTMLElement;
            lastInput.focus();
            lastInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      }, 100);
    }
  };

  return (
    <div className={className} onKeyDown={handleKeyDown}>
      <AppCombobox
        items={options}
        searchCategory={searchPlaceholder}
        defaultValue={value}
        onValueChange={handleValueChange}
      />
    </div>
  );
}
```

**Step 2: Verify the component compiles without errors**

Run: `npx tsc --noEmit`

---

## Task 5: Create Cell Components Index Export

**Files:**
- Create: `components/editableTable/cells/index.ts`

**Step 1: Write the index export file**

```typescript
export { EditableInputCell } from "./EditableInputCell";
export { EditableComboboxCell, type ComboboxOption } from "./EditableComboboxCell";
```

**Step 2: Verify exports work correctly**

Run: `npx tsc --noEmit`

---

## Task 6: Create the Main EditableTable Component

**Files:**
- Create: `components/editableTable/EditableTable.tsx`

**Step 1: Write the main EditableTable component**

```tsx
"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditableTableProps, EditableRowData, EditableTableMeta } from "./types";

export function EditableTable<TData extends EditableRowData, TValue = unknown>({
  columns,
  data,
  getNewRow,
  onDataChange,
  enableToolbar = true,
  toolbarActions = [],
}: EditableTableProps<TData, TValue>) {
  const [tableData, setTableData] = React.useState<TData[]>(data);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Sync with external data changes
  React.useEffect(() => {
    setTableData(data);
  }, [data]);

  // Row manipulation handlers
  const addRow = React.useCallback(() => {
    const newRow = getNewRow();
    setTableData((prev) => {
      const updated = [...prev, newRow];
      if (onDataChange) {
        setTimeout(() => onDataChange(updated), 0);
      }
      return updated;
    });
  }, [getNewRow, onDataChange]);

  const updateRow = React.useCallback(
    (id: string, updates: Partial<TData>) => {
      setTableData((prev) => {
        const updated = prev.map((row) =>
          row.id === id ? { ...row, ...updates } : row
        );
        if (onDataChange) {
          setTimeout(() => onDataChange(updated), 0);
        }
        return updated;
      });
    },
    [onDataChange]
  );

  const deleteRow = React.useCallback(
    (id: string) => {
      setTableData((prev) => {
        const updated = prev.filter((row) => row.id !== id);
        if (onDataChange) {
          setTimeout(() => onDataChange(updated), 0);
        }
        return updated;
      });
    },
    [onDataChange]
  );

  // Table meta for cell access
  const tableMeta: EditableTableMeta<TData> = React.useMemo(
    () => ({
      updateRow,
      deleteRow,
      addRow,
    }),
    [updateRow, deleteRow, addRow]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: tableMeta,
  });

  // Find last editable cell for Enter key handling
  const getIsLastEditableCell = (row: typeof table.getRowModel().rows[0], cellId: string) => {
    const editableCells = row.getVisibleCells().filter(
      (c) => c.column.columnDef.meta?.editable
    );
    return editableCells.length > 0 && editableCells[editableCells.length - 1].id === cellId;
  };

  return (
    <div className="flex flex-col gap-4" data-editable-table>
      {enableToolbar && (
        <div className="flex items-center justify-end gap-2">
          {toolbarActions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant ?? "default"}
              size="sm"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
          <Button size="sm" onClick={addRow}>
            <Plus className="h-4 w-4 mr-1" />
            Add Row
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <ScrollArea>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() ? `${header.getSize()}px` : undefined }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta;
                      const EditComponent = meta?.editable && meta?.editCell;
                      const isLastEditable = getIsLastEditableCell(row, cell.id);

                      if (EditComponent) {
                        return (
                          <TableCell key={cell.id}>
                            <EditComponent
                              row={cell.row}
                              getValue={() => cell.getValue()}
                              onUpdateRow={updateRow}
                              onAddRow={isLastEditable ? addRow : undefined}
                              isLastEditableCell={isLastEditable}
                            />
                          </TableCell>
                        );
                      }

                      return (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
```

**Step 2: Verify the component compiles without errors**

Run: `npx tsc --noEmit`

---

## Task 7: Create the Main Index Export

**Files:**
- Create: `components/editableTable/index.ts`

**Step 1: Write the index export file**

```typescript
// Main component
export { EditableTable } from "./EditableTable";

// Cell components
export { EditableInputCell, EditableComboboxCell, type ComboboxOption } from "./cells";

// Types
export type {
  EditableRowData,
  EditableCellProps,
  EditableTableProps,
  EditableTableMeta,
  ToolbarAction,
} from "./types";
```

**Step 2: Verify exports work correctly**

Run: `npx tsc --noEmit`

---

## Task 8: Create Example Usage with Column Definitions

**Files:**
- Create: `components/editableTable/examples/invoice-table-example.tsx`

**Step 1: Write an example implementation demonstrating usage**

```tsx
"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { EditableTable, EditableInputCell, EditableComboboxCell, EditableRowData, ComboboxOption } from "../index";

// Example row type
interface InvoiceItem extends EditableRowData {
  product_name: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
}

// Example product options (would typically come from API)
const productOptions: ComboboxOption[] = [
  { value: "widget-a", label: "Widget A", price: 10 },
  { value: "widget-b", label: "Widget B", price: 25 },
  { value: "gadget-x", label: "Gadget X", price: 50 },
];

// Example column definitions
const columns: ColumnDef<InvoiceItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
    size: 50,
  },
  {
    accessorKey: "product_name",
    header: () => <div>Product Name</div>,
    cell: (info) => info.getValue(),
    meta: {
      editable: true,
      editCell: (props) => (
        <EditableComboboxCell
          {...props}
          field="product_name"
          options={productOptions}
          searchPlaceholder="Search products..."
          onValueChange={(value, selectedOption, row) => {
            const price = (selectedOption?.price as number) || 0;
            const total_price = parseFloat((price * row.quantity).toFixed(2));
            return { product_name: value, price_per_unit: price, total_price };
          }}
        />
      ),
    },
    size: 300,
  },
  {
    accessorKey: "quantity",
    header: () => <div>Quantity</div>,
    cell: (info) => info.getValue(),
    meta: {
      editable: true,
      editCell: (props) => (
        <EditableInputCell
          {...props}
          field="quantity"
          type="number"
          onValueChange={(value, row) => {
            const quantity = value as number;
            const total_price = parseFloat((row.price_per_unit * quantity).toFixed(2));
            return { quantity, total_price };
          }}
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
      editCell: (props) => (
        <EditableInputCell
          {...props}
          field="price_per_unit"
          type="number"
          onValueChange={(value, row) => {
            const price_per_unit = value as number;
            const total_price = parseFloat((price_per_unit * row.quantity).toFixed(2));
            return { price_per_unit, total_price };
          }}
        />
      ),
    },
    size: 150,
  },
  {
    accessorKey: "total_price",
    header: () => <div>Total Price</div>,
    cell: ({ row }) => <div>${row.getValue<number>("total_price").toFixed(2)}</div>,
    size: 100,
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as { deleteRow: (id: string) => void };
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            meta.deleteRow(row.original.id);
            toast("Item deleted");
          }}
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      );
    },
    size: 50,
  },
];

// Example usage component
export function InvoiceTableExample() {
  const [data, setData] = React.useState<InvoiceItem[]>([
    { id: uuidv4(), product_name: "", quantity: 0, price_per_unit: 0, total_price: 0 },
  ]);

  const getNewRow = (): InvoiceItem => ({
    id: uuidv4(),
    product_name: "",
    quantity: 0,
    price_per_unit: 0,
    total_price: 0,
  });

  // Calculate totals
  const totals = React.useMemo(() => {
    const subtotal = data.reduce((acc, item) => acc + item.total_price, 0);
    const tax = subtotal * 0.18;
    return { subtotal, tax, total: subtotal + tax };
  }, [data]);

  return (
    <div className="space-y-4">
      <EditableTable
        columns={columns}
        data={data}
        getNewRow={getNewRow}
        onDataChange={setData}
      />
      <div className="text-right space-y-1">
        <p>Subtotal: ${totals.subtotal.toFixed(2)}</p>
        <p>Tax (18%): ${totals.tax.toFixed(2)}</p>
        <p className="font-bold">Total: ${totals.total.toFixed(2)}</p>
      </div>
    </div>
  );
}
```

**Step 2: Verify the example compiles without errors**

Run: `npx tsc --noEmit`

**Step 3: Commit the initial implementation**

```bash
git add components/editableTable/
git commit -m "feat: add reusable EditableTable component with cell editors

- Add EditableTable component using TanStack Table v8
- Add EditableInputCell for text/number input editing
- Add EditableComboboxCell for dropdown/search editing
- Add type definitions and TanStack Table extensions
- Add example invoice table implementation"
```

---

## Task 9: Test the Component in a Real Page

**Files:**
- Modify: Test in an existing page or create a test route

**Step 1: Import and use the component in a page**

Import from `@/components/editableTable` and test:
- Row adding via Enter key in last editable cell
- Row adding via toolbar button
- Row deletion via action column
- Data synchronization via onDataChange callback
- Calculated field updates (e.g., total_price)

**Step 2: Verify all interactions work correctly**

Run: `npm run dev` and manually test the component

**Step 3: Commit any fixes**

```bash
git add .
git commit -m "fix: address any issues found during testing"
```

---

## Final Structure

```
components/
└── editableTable/
    ├── index.ts                    # Main exports
    ├── types.ts                    # Type definitions
    ├── tanstack-extensions.d.ts    # TanStack Table type extensions
    ├── EditableTable.tsx           # Main table component
    ├── cells/
    │   ├── index.ts               # Cell component exports
    │   ├── EditableInputCell.tsx  # Text/number input cell
    │   └── EditableComboboxCell.tsx # Dropdown/search cell
    └── examples/
        └── invoice-table-example.tsx # Usage example
```

---

Plan complete and saved to `docs/plans/2026-01-23-editable-table-component.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
