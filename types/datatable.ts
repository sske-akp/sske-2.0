import { RowData, Row } from "@tanstack/react-table";

export enum FilterTypes {
  Filter = "filter",
  DropDown = "dropdown",
}

export interface DataTableToolbarFilters {
  id: string;
  label: string;
  type: FilterTypes;
  data?: DataTableToolbarFilterItem[];
}

export interface DataTableToolbarFilterItem {
  value: string;
  label: string;
}

export interface DataTableToolbarButtons {
  id: string;
  label: string;
  isVisible: boolean;
}

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
