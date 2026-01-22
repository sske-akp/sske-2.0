"use client";

import * as React from "react";
import { AppCombobox } from "@/components/utils/appCombobox";
import { EditableCellProps, EditableRowData } from "../types";

export interface ComboboxOption {
  value: string;
  label: string;
  [key: string]: unknown;
}

interface EditableComboboxCellProps<TData extends EditableRowData>
  extends EditableCellProps<TData> {
  field: keyof TData;
  options: ComboboxOption[];
  searchPlaceholder?: string;
  className?: string;
  onValueChange?: (
    value: string,
    selectedOption: ComboboxOption | undefined,
    row: TData
  ) => Partial<TData>;
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
  isLastCell,
  onValueChange,
}: EditableComboboxCellProps<TData>) {
  const initialValue = getValue() as string;
  const [value, setValue] = React.useState(initialValue);

  // Sync with external data changes
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      setValue(newValue);
      const selectedOption = options.find((opt) => opt.value === newValue);

      // Calculate any derived fields via callback
      const updates = onValueChange
        ? onValueChange(newValue, selectedOption, row.original)
        : { [field]: newValue };

      onUpdateRow(row.original.id, updates as Partial<TData>);
    },
    [options, onValueChange, row.original, field, onUpdateRow]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && isLastCell && onAddRow) {
        e.preventDefault();
        onAddRow();
        // Focus management for new row
        setTimeout(() => {
          requestAnimationFrame(() => {
            const inputs = document.querySelectorAll(
              "[data-editable-table] input"
            );
            if (inputs.length > 0) {
              const lastInput = inputs[inputs.length - 1] as HTMLElement;
              lastInput.focus();
              lastInput.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          });
        }, 100);
      }
    },
    [isLastCell, onAddRow]
  );

  return (
    <div
      className={className}
      onKeyDown={handleKeyDown}
    >
      <AppCombobox
        items={options}
        searchCategory={searchPlaceholder}
        defaultValue={value}
        onValueChange={handleValueChange}
      />
    </div>
  );
}
