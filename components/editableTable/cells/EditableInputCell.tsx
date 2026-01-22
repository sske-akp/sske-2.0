"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { EditableCellProps, EditableRowData } from "../types";

interface EditableInputCellProps<TData extends EditableRowData> extends EditableCellProps<TData> {
  field: keyof TData;
  type?: "text" | "number";
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  onValueChange?: (value: string | number, row: TData) => Partial<TData>;
}

export function EditableInputCell<TData extends EditableRowData>({
  row,
  getValue,
  field,
  type = "text",
  placeholder,
  className,
  ariaLabel,
  onUpdateRow,
  onAddRow,
  isLastCell,
  onValueChange,
}: EditableInputCellProps<TData>) {
  const initialValue = getValue() as string | number;
  const [value, setValue] = React.useState(initialValue);

  // Sync with external data changes
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      // For number type: allow empty string (clearing), otherwise parse as number
      const newValue =
        type === "number"
          ? rawValue === ""
            ? ""
            : parseFloat(rawValue) || 0
          : rawValue;
      setValue(newValue);

      // Calculate any derived fields via callback
      const updates = onValueChange
        ? onValueChange(newValue, row.original)
        : { [field]: newValue };

      onUpdateRow(row.original.id, updates as Partial<TData>);
    },
    [type, onValueChange, row.original, field, onUpdateRow]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && isLastCell && onAddRow) {
        e.preventDefault();
        onAddRow();
      }
    },
    [isLastCell, onAddRow]
  );

  return (
    <Input
      type={type}
      value={type === "number" && isNaN(value as number) ? "" : String(value)}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={className}
      aria-label={ariaLabel}
    />
  );
}
