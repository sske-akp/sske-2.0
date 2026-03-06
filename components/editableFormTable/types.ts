import { ReactNode } from "react";
import {
  UseFormReturn,
  UseFieldArrayReturn,
  FieldValues,
  Path,
} from "react-hook-form";

export interface ComboboxOption {
  label: string;
  value: string;
  [key: string]: unknown;
}

interface ColumnBase<TRow extends FieldValues> {
  accessorKey: Path<TRow> extends string ? string : never;
  header: string;
  size?: number;
  className?: string;
}

export interface TextColumn<TRow extends FieldValues> extends ColumnBase<TRow> {
  type: "text";
  placeholder?: string;
}

export interface NumberColumn<TRow extends FieldValues>
  extends ColumnBase<TRow> {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export interface ComboboxColumn<TRow extends FieldValues>
  extends ColumnBase<TRow> {
  type: "combobox";
  options: ComboboxOption[];
  searchCategory?: string;
  onOptionSelect?: (option: ComboboxOption, currentRow: TRow) => Partial<TRow>;
}

export interface ComputedColumn<TRow extends FieldValues>
  extends ColumnBase<TRow> {
  type: "computed";
  compute: (row: TRow) => ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface ActionColumn<TRow extends FieldValues> {
  type: "action";
  header?: string;
  size?: number;
  render?: (params: {
    rowIndex: number;
    remove: (index: number) => void;
    fieldsLength: number;
    minRows: number;
  }) => ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface CustomColumn<TRow extends FieldValues> {
  type: "custom";
  header: string;
  size?: number;
  render: (params: {
    form: AnyFormReturn;
    fieldArray: AnyFieldArrayReturn;
    rowIndex: number;
  }) => ReactNode;
}

export type ColumnConfig<TRow extends FieldValues> =
  | TextColumn<TRow>
  | NumberColumn<TRow>
  | ComboboxColumn<TRow>
  | ComputedColumn<TRow>
  | ActionColumn<TRow>
  | CustomColumn<TRow>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFormReturn = UseFormReturn<any, any, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFieldArrayReturn = UseFieldArrayReturn<any, any, any>;

export interface EditableFormTableProps<TRow extends FieldValues> {
  columns: ColumnConfig<TRow>[];
  form: AnyFormReturn;
  fieldArray: AnyFieldArrayReturn;
  createEmptyRow: () => TRow;
  showAddRow?: boolean;
  addRowLabel?: string;
  minRows?: number;
  toolbarExtra?: ReactNode;
  className?: string;
}
