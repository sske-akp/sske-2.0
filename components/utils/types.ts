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
