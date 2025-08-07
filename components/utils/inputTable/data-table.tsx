
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { DataTablePagination } from "@/components/utils/inputTable/data-table-pagination"
import { DataTableToolbar } from "@/components/utils/inputTable/data-table-toolbar"
import { DataTableToolbarButtons, DataTableToolbarFilters } from "@/types/datatable"
import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState, flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import * as React from "react"

interface DataTableProps<TData extends { id: string }, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[],
  filters: DataTableToolbarFilters[],
  primary_items: DataTableToolbarButtons[],
  getNewRow: () => TData,
  onDataChange?: (newData: TData[]) => void,
}

export default function InputTable<TData extends { id: string }, TValue>({
  columns,
  data,
  filters = [],
  primary_items = [],
  getNewRow,
  onDataChange,
}: DataTableProps<TData, TValue>) {
  const [tableData, setTableData] = React.useState(data)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  // Add Row Handler
  const handleAddRow = () => {
    const newRow = getNewRow();
    const updated = [...tableData, newRow];
    setTableData(updated);
    if (onDataChange) setTimeout(() => onDataChange(updated), 0);
  };

  // Delete Row Handler
  const handleDeleteRow = (id: string) => {
    const updated = tableData.filter((row) => row.id !== id);
    setTableData(updated);
    if (onDataChange) setTimeout(() => onDataChange(updated), 0);
  };

  React.useEffect(() => {
    setTableData(data)
  }, [data]);

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
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta: {
      handleDeleteRow,
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar table={table} filters={filters} primary_items={primary_items.map(item => (item.id === "item" || item.id === "purchase") ? { ...item, onClick: handleAddRow } : item)} />
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
                      style={{ width: `${header.getSize()}px` }}
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
                      const editableCells = row.getVisibleCells().filter(c => c.column.columnDef.meta?.editable);
                      const isLastEditable = editableCells.length > 0 && editableCells[editableCells.length - 1].id === cell.id;
                      if (EditComponent) {
                        return (
                          <TableCell key={cell.id}>
                            <EditComponent
                              row={cell.row}
                              onUpdateRow={(id: string, updatedRow: Partial<TData>) => {
                                setTableData((prev) => {
                                  const updated = prev.map((r) =>
                                    r.id === id ? { ...r, ...updatedRow } : r
                                  );
                                  if (onDataChange) setTimeout(() => onDataChange(updated), 0);
                                  return updated;
                                });
                              }}
                              onAddRow={isLastEditable ? handleAddRow : undefined}
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
      {/* <DataTablePagination table={table} /> */}
    </div>
  )
}
