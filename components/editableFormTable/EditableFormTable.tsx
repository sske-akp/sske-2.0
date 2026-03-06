"use client";

import { FieldValues } from "react-hook-form";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EditableFormTableProps, ColumnConfig } from "./types";
import { useFieldRefs, useKeyboardNavigation } from "./hooks";
import {
  TextCell,
  NumberCell,
  ComboboxCell,
  ComputedCell,
  ActionCell,
} from "./cells";

export function EditableFormTable<TRow extends FieldValues>({
  columns,
  form,
  fieldArray,
  createEmptyRow,
  showAddRow = true,
  addRowLabel = "Add Row",
  minRows = 1,
  toolbarExtra,
  className,
}: EditableFormTableProps<TRow>) {
  const { fields, append, remove } = fieldArray;
  const { setRef, focusCell, removeRow } = useFieldRefs();
  const { handleKeyDown } = useKeyboardNavigation({
    columns,
    fieldArray,
    createEmptyRow,
    focusCell,
  });

  const handleAddRow = () => {
    append(createEmptyRow());
    const editableColIdx = columns.findIndex(
      (col) => col.type !== "computed" && col.type !== "action"
    );
    if (editableColIdx >= 0) {
      setTimeout(() => focusCell(fields.length, editableColIdx), 50);
    }
  };

  const handleRemove = (rowIndex: number) => {
    if (fields.length <= minRows) return;
    remove(rowIndex);
    removeRow(rowIndex);
  };

  function getColumnHeader(col: ColumnConfig<TRow>): string {
    if (col.type === "action") return col.header ?? "";
    return col.header;
  }

  function getColumnSize(col: ColumnConfig<TRow>): number | undefined {
    return col.size;
  }

  function renderCell(col: ColumnConfig<TRow>, rowIndex: number, colIndex: number) {
    switch (col.type) {
      case "text":
        return (
          <TextCell
            form={form}
            name={`items.${rowIndex}.${col.accessorKey}`}
            column={col}
            inputRef={setRef(rowIndex, colIndex)}
            onKeyDown={handleKeyDown(rowIndex, colIndex)}
          />
        );
      case "number":
        return (
          <NumberCell
            form={form}
            name={`items.${rowIndex}.${col.accessorKey}`}
            column={col}
            inputRef={setRef(rowIndex, colIndex)}
            onKeyDown={handleKeyDown(rowIndex, colIndex)}
          />
        );
      case "combobox":
        return (
          <ComboboxCell
            form={form}
            name={`items.${rowIndex}.${col.accessorKey}`}
            column={col}
            rowIndex={rowIndex}
            inputRef={setRef(rowIndex, colIndex)}
            onKeyDown={handleKeyDown(rowIndex, colIndex)}
          />
        );
      case "computed":
        return (
          <ComputedCell
            form={form}
            rowIndex={rowIndex}
            column={col}
          />
        );
      case "action":
        if (col.render) {
          return col.render({
            rowIndex,
            remove: handleRemove,
            fieldsLength: fields.length,
            minRows,
          });
        }
        return (
          <ActionCell
            rowIndex={rowIndex}
            remove={handleRemove}
            fieldsLength={fields.length}
            minRows={minRows}
          />
        );
      case "custom":
        return col.render({ form, fieldArray, rowIndex });
      default:
        return null;
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {(toolbarExtra || showAddRow) && (
        <div className="flex items-center justify-between">
          <div>{toolbarExtra}</div>
          {showAddRow && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRow}
            >
              <Plus className="h-4 w-4 mr-2" />
              {addRowLabel}
            </Button>
          )}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, colIndex) => (
                <TableHead
                  key={colIndex}
                  style={
                    getColumnSize(col)
                      ? { width: getColumnSize(col) }
                      : undefined
                  }
                >
                  {getColumnHeader(col)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No items. Click &quot;{addRowLabel}&quot; to add one.
                </TableCell>
              </TableRow>
            ) : (
              fields.map((field, rowIndex) => (
                <TableRow key={field.id}>
                  {columns.map((col, colIndex) => (
                    <TableCell
                      key={colIndex}
                      style={
                        getColumnSize(col)
                          ? { width: getColumnSize(col) }
                          : undefined
                      }
                    >
                      {renderCell(col, rowIndex, colIndex)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
