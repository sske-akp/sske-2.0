"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import type { DataTableToolbarFilters } from "@/components/utils/types";
import { FilterTypes } from "@/components/utils/types";


interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    filters: DataTableToolbarFilters[];
}

export function DataTableToolbar<TData>({
    table, filters
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center gap-2">
                {
                    filters.map((filter) => {
                        return filter.type === FilterTypes.Filter ? (
                            <Input
                                key={filter.id}
                                placeholder={`Filter ${filter.label}...`}
                                value={(table.getColumn(filter.id)?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn(filter.id)?.setFilterValue(event.target.value)
                                }
                                className="h-8 w-[150px] lg:w-[250px]"
                            />
                        ) : (
                            table.getColumn(filter.id) && (
                                <DataTableFacetedFilter
                                    key={filter.id}
                                    column={table.getColumn(filter.id)}
                                    title={filter.label}
                                    options={filter.data || []}
                                />
                            )
                        );
                    })
                }
                {isFiltered && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.resetColumnFilters()}
                    >
                        Reset
                        <X />
                    </Button>
                )}
            </div>
            <div className="flex items-center gap-2">
                <DataTableViewOptions table={table} />
                <Button size="sm">Add Task</Button>
            </div>
        </div>
    );
}
