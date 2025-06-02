"use client";

import React from 'react'
import InputTable from '@/components/utils/inputTable/data-table'
import { columns, data, filters, primary_items } from '@/app/sales/new/data';

export default function NewSale() {
    return (
        <>
            <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance mt-5 mx-5">
                New Sale Entry
            </h1>

            <div className='p-5'>
                <InputTable columns={columns}
                    data={data}
                    filters={filters}
                    primary_items={primary_items}
                    pagination_pageSize={100} />
            </div>
        </>
    )
}
