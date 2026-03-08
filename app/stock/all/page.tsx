"use client";

import React from "react";
import { columns, filters, primary_items } from "./data";
import { DataTable } from "@/components/utils/dataTable/data-table";
import { useStock } from "@/hooks/stockHooks";

export default function AllStock() {
  const { data: stock, isLoading, isError } = useStock();

  if (isLoading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Loading inventory...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-center text-destructive">
        Failed to load inventory. Make sure the backend is running.
      </div>
    );
  }

  const totalValue = stock?.reduce((sum, s) => sum + s.totalValue, 0) ?? 0;
  const totalItems = stock?.reduce((sum, s) => sum + s.totalQty, 0) ?? 0;

  return (
    <>
      <div className="flex items-center justify-between mt-5 mx-5">
        <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance">
          Inventory
        </h1>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <span>
            {stock?.length ?? 0} products | {totalItems} units |{" "}
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(totalValue)}
          </span>
        </div>
      </div>

      <div className="p-5">
        <DataTable
          columns={columns}
          data={stock ?? []}
          filters={filters}
          primary_items={primary_items}
          pagination_pageSize={20}
        />
      </div>
    </>
  );
}
