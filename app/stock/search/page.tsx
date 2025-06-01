"use client";

import React from 'react'
import { columns, data, filters } from '@/app/stock/search/data';
import { DataTable } from '@/components/utils/dataTable/data-table';

export default function StockSearch() {

    return (
        <>
            <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance mt-5 mx-5">Inventory Management</h1>

            <div className='p-5'>
                <DataTable columns={columns} data={data} filters={filters} />
            </div>

        </>
    );
}