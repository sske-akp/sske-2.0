"use client";

import React from 'react'
import InputTable from '@/components/utils/inputTable/data-table'
import { columns, data, filters, primary_items } from '@/app/sales/new/data';
import { AppCombobox } from '@/components/utils/appCombobox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function NewSale() {
    return (
        <>
            <div className="px-2 sm:px-6 lg:px-8 py-4 bg-background">
                <section>
                    <h1 className="text-3xl font-bold">New Sale</h1>
                    <p className="text-muted-foreground">Create a new invoice for your customer</p>
                </section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className='col-span-3'>
                    <div className='p-5 flex gap-4'>
                        <AppCombobox items={[{
                            "label": "a",
                            "value": "b"
                        }]} searchCategory='Customers' />
                        <Input placeholder='Phone Number' />
                        <Badge variant="outline">Walk-in customer</Badge>
                    </div>

                    {/* Additional Customer Details Accordion */}
                    <Accordion type="single" collapsible className="w-full px-5">
                        <AccordionItem value="additional-details">
                            <AccordionTrigger>Additional Customer Details</AccordionTrigger>
                            <AccordionContent className="space-y-4">
                                {/* Placeholder for additional fields */}
                                <div>
                                    <Label className="block text font-medium ">GST Number:</Label>
                                    <Input type="text" className="mt-1 block w-full rounded-md  shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Enter GST Number" />
                                </div>
                                <div>
                                    <Label className="block text-sm font-medium ">Email:</Label>
                                    <Input type="email" className="mt-1 block w-full rounded-md  shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Enter Email" />
                                </div>
                                <div>
                                    <Label className="block text-sm font-medium ">Address:</Label>
                                    <Input className="mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" rows={3} placeholder="Enter Address"></Input>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <div className='p-5'>
                        <InputTable columns={columns}
                            data={data}
                            filters={filters}
                            primary_items={primary_items} />
                    </div>
                </div>
                <div className='col-span-1 gap-5s'>
                    <Card className='mt-5'>
                        <CardHeader>
                            <CardTitle>Invoice Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="">Subtotal:</span>
                                    <span>₹{10.22}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="">GST (18%):</span>
                                    <span>₹{20}</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total:</span>
                                        <span>₹{30}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 space-y-3">
                                <Button className="w-full" size="lg">
                                    Save Invoice
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
                                <span>{`20`}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="">Total Qty:</span>
                                <span>{`30`}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </>
    )
}
