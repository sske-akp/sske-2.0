"use client";

import React, { useState } from 'react';
import InputTable from '@/components/utils/inputTable/data-table';
import { columns, data, filters, primary_items, calculatePurchaseSummary } from '@/app/purchases/new/data';
import { AppCombobox } from '@/components/utils/appCombobox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from "uuid";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";

export default function NewPurchase() {
    const [tableData, setTableData] = useState(data);
    const { subtotal, gst, total, numItems, totalQuantity } = React.useMemo(() => calculatePurchaseSummary(tableData), [tableData]);

    // Purchase metadata state
    const [date, setDate] = useState<Date>(() => new Date());
    const [open, setOpen] = useState(false);

    const getNewRow = (): import("./data").PurchaseItem => ({
        id: uuidv4(),
        product_name: "",
        quantity: 0,
        price_per_unit: 0,
        total_price: 0,
    });

    return (
        <>
            <div className="px-2 sm:px-6 lg:px-8 py-4 bg-background">
                <section>
                    <h1 className="text-3xl font-bold">New Purchase</h1>
                    <p className="text-muted-foreground">Create a new purchase entry for your supplier</p>
                </section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className='col-span-3'>
                    <div className='p-5 flex gap-4'>
                        <div className="flex flex-col gap-2 w-1/3">
                            <Label>Supplier</Label>
                            <AppCombobox items={[
                                { label: "Supplier A", value: "supplier_a" },
                                { label: "Supplier B", value: "supplier_b" }
                            ]} searchCategory='Suppliers' />
                        </div>
                        <div className="flex flex-col gap-2 w-1/3">
                            <Label>Purchase Date</Label>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        {date ? format(date, "yyyy-MM-dd") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        captionLayout="dropdown"
                                        startMonth={new Date(new Date().getFullYear() - 1, 0)}
                                        endMonth={new Date(new Date().getFullYear() + 1, 0)}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex flex-col gap-2 w-1/3">
                            <Label>Status</Label>
                            <AppCombobox
                                items={[
                                    { label: "Pending", value: "pending" },
                                    { label: "Completed", value: "completed" },
                                    { label: "Canceled", value: "canceled" }
                                ]}
                                searchCategory="Status"
                            />
                        </div>
                    </div>

                    <div className='p-5'>
                        <InputTable
                            columns={columns}
                            data={tableData}
                            filters={filters}
                            primary_items={primary_items}
                            getNewRow={getNewRow}
                            onDataChange={setTableData}
                        />
                    </div>
                </div>
                <div className='col-span-1 gap-5s'>
                    <Card className='mt-5'>
                        <CardHeader>
                            <CardTitle>Purchase Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="">Subtotal:</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="">GST (18%):</span>
                                    <span>₹{gst.toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total:</span>
                                        <span>₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 space-y-3">
                                <Button className="w-full" size="lg">
                                    Save Purchase
                                </Button>
                                <Button variant="outline" className="w-full">
                                    Save & Print
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className='mt-5'>
                        <CardHeader>
                            <CardTitle className="text-sm">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="">Items:</span>
                                <span>{numItems}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="">Total Qty:</span>
                                <span>{totalQuantity}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
