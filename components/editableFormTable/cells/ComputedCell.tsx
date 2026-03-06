"use client";

import { FieldValues } from "react-hook-form";
import { ComputedColumn, AnyFormReturn } from "../types";

interface ComputedCellProps<TRow extends FieldValues> {
  form: AnyFormReturn;
  rowIndex: number;
  column: ComputedColumn<TRow>;
}

export function ComputedCell<TRow extends FieldValues>({
  form,
  rowIndex,
  column,
}: ComputedCellProps<TRow>) {
  const row = form.watch(`items.${rowIndex}`) as TRow;
  return <div>{column.compute(row)}</div>;
}
