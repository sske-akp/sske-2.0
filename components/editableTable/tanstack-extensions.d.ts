import { RowData } from "@tanstack/react-table";
import { EditableCellProps, EditableTableMeta, EditableRowData } from "./types";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    editable?: boolean;
    editCell?: React.ComponentType<EditableCellProps<TData & EditableRowData>>;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TableMeta<TData extends RowData> extends EditableTableMeta<TData & EditableRowData> {}
}
