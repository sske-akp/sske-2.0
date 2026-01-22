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
        onDataChange(updated);
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
          onDataChange(updated);
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
          onDataChange(updated);
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
  const getIsLastEditableCell = React.useCallback(
    (row: typeof table.getRowModel().rows[0], cellId: string) => {
      const editableCells = row.getVisibleCells().filter(
        (c) => c.column.columnDef.meta?.editable
      );
      return editableCells.length > 0 && editableCells[editableCells.length - 1].id === cellId;
    },
    []
  );

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
                              isLastCell={isLastEditable}
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
