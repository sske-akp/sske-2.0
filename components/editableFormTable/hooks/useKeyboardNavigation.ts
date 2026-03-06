import { useCallback } from "react";
import { FieldValues } from "react-hook-form";
import { ColumnConfig, AnyFieldArrayReturn } from "../types";

interface UseKeyboardNavigationParams<TRow extends FieldValues> {
  columns: ColumnConfig<TRow>[];
  fieldArray: AnyFieldArrayReturn;
  createEmptyRow: () => TRow;
  focusCell: (rowIndex: number, colIndex: number) => void;
}

export function useKeyboardNavigation<TRow extends FieldValues>({
  columns,
  fieldArray,
  createEmptyRow,
  focusCell,
}: UseKeyboardNavigationParams<TRow>) {
  const editableColIndices = columns
    .map((col, i) => (col.type !== "computed" && col.type !== "action" ? i : -1))
    .filter((i) => i !== -1);

  const handleKeyDown = useCallback(
    (rowIndex: number, colIndex: number) =>
      (e: React.KeyboardEvent) => {
        const { fields, append } = fieldArray;
        const isLastRow = rowIndex === fields.length - 1;
        const editableIdx = editableColIndices.indexOf(colIndex);
        const isLastEditableCol =
          editableIdx === editableColIndices.length - 1;

        if (e.key === "Enter") {
          e.preventDefault();
          if (isLastRow) {
            append(createEmptyRow());
            // Focus same column in new row after React renders
            setTimeout(() => focusCell(rowIndex + 1, colIndex), 50);
          } else {
            focusCell(rowIndex + 1, colIndex);
          }
        }

        if (e.key === "Tab" && !e.shiftKey && isLastRow && isLastEditableCol) {
          e.preventDefault();
          append(createEmptyRow());
          const firstEditableCol = editableColIndices[0];
          setTimeout(() => focusCell(rowIndex + 1, firstEditableCol), 50);
        }
      },
    [fieldArray, editableColIndices, createEmptyRow, focusCell]
  );

  return { handleKeyDown };
}
