import { ButtonProps } from "@/components/ui/button";

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

export interface DataTableToolbarButtons extends ButtonProps {
  id: string;
  label: string;
  isVisible: boolean;
}
