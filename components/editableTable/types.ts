import { ColumnDef, Row } from "@tanstack/react-table";
import { ButtonProps } from "@/components/ui/button";

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
  isLastCell?: boolean;
}

// Table meta for passing handlers to cells
export interface EditableTableMeta<TData extends EditableRowData> {
  updateRow?: (id: string, updates: Partial<TData>) => void;
  deleteRow?: (id: string) => void;
  addRow?: () => void;
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
  variant?: ButtonProps["variant"];
}
