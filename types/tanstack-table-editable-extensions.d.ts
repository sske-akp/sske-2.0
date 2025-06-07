import { RowData, Row } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    editable?: boolean;
    editCell?: React.ComponentType<{
      row: Row<TData>;
      onUpdateRow: (id: string, updatedRow: Partial<TData>) => void;
    }>;
  }
}
