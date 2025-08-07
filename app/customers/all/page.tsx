"use client";

import React from "react";
import { columns, data, filters, primary_items } from "@/app/customers/all/data";
import { DataTable } from "@/components/utils/dataTable/data-table";

export default function AllCustomer() {
    return (
        <>
            <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance mt-5 mx-5">
                Customers
            </h1>
            <div className="p-5">
                <DataTable
                    columns={columns}
                    data={data}
                    filters={filters}
                    primary_items={primary_items}
                    pagination_pageSize={15}
                />
            </div>
        </>
    );
}
