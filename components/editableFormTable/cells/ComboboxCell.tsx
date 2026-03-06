"use client";

import { Controller, FieldValues } from "react-hook-form";
import { AppCombobox } from "@/components/utils/appCombobox";
import { ComboboxColumn, ComboboxOption, AnyFormReturn } from "../types";

interface ComboboxCellProps<TRow extends FieldValues> {
  form: AnyFormReturn;
  name: string;
  column: ComboboxColumn<TRow>;
  rowIndex: number;
  inputRef: (el: HTMLElement | null) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function ComboboxCell<TRow extends FieldValues>({
  form,
  name,
  column,
  rowIndex,
  inputRef,
  onKeyDown,
}: ComboboxCellProps<TRow>) {
  const { formState: { errors } } = form;

  const pathParts = name.split(".");
  let error: Record<string, unknown> | undefined = errors as Record<string, unknown>;
  for (const part of pathParts) {
    error = error?.[part] as Record<string, unknown> | undefined;
  }
  const errorMessage = (error as { message?: string } | undefined)?.message;

  return (
    <div ref={inputRef} onKeyDown={onKeyDown}>
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <AppCombobox
            items={column.options}
            searchCategory={column.searchCategory ?? "Search..."}
            defaultValue={field.value ?? ""}
            onValueChange={(newValue) => {
              field.onChange(newValue);
              if (column.onOptionSelect) {
                const selectedOption = column.options.find(
                  (opt) => opt.value === newValue
                );
                if (selectedOption) {
                  const currentRow = form.getValues(
                    `items.${rowIndex}`
                  ) as TRow;
                  const updates = column.onOptionSelect(
                    selectedOption as ComboboxOption,
                    currentRow
                  );
                  // Apply cascading updates
                  Object.entries(updates).forEach(([key, val]) => {
                    form.setValue(`items.${rowIndex}.${key}`, val, {
                      shouldDirty: true,
                    });
                  });
                }
              }
            }}
          />
        )}
      />
      {errorMessage && (
        <p className="text-xs text-destructive mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
