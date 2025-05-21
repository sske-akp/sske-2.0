"use client";

import React from 'react'
import { AppCombobox } from '@/components/utils/appCombobox'
import { Card, CardHeader, CardTitle, CardFooter, CardContent, CardDescription } from '@/components/ui/card'
import BarcodeButton from '@/components/utils/BarcodeButton';
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/table'


export default function MobileSearch() {

    const items = [
        { value: "apple", label: "Apple" },
        { value: "banana", label: "Banana" },
        { value: "cherry", label: "Cherry" },
    ]

    return (
        <>
            <div className="grid grid-cols-2 p-5">
                <div className='flex items-center justify-center'>
                    <AppCombobox items={items} searchCategory='Brand' size='w-[160px]' />
                </div>
                <div className='flex items-center justify-center'>
                    <AppCombobox items={items} searchCategory='Category' size='w-[160px]' />
                </div>
            </div>

            <div className='w-full flex items-center justify-center'>
                <AppCombobox items={items} searchCategory='Item Name' size='w-[330px]' />
            </div>

            <p className='text-center pt-5'>or</p>

            <div className='w-full flex items-center justify-center pt-7'>
                <Card className='w-[330px]'>
                    <CardHeader>
                        <CardTitle className='pl-16'>Search with Barcode</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarcodeButton />
                    </CardContent>
                </Card>

            </div>

            <div className='w-full flex items-center justify-center pt-20'>
                <Card className='w-[330px]'>
                    <CardHeader>
                        <CardTitle>Texmo 1 HP Motor</CardTitle>
                        <CardDescription>Texmo - Motor</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow key='quantity' className="border-none">
                                    <TableCell className="font-medium text-muted-foreground w-1/2">
                                        Quantity</TableCell>
                                    <TableCell className="w-1/2">
                                        20</TableCell>
                                </TableRow>
                                <TableRow key='price' className="border-none">
                                    <TableCell className="font-medium text-muted-foreground w-1/2">
                                        Price</TableCell>
                                    <TableCell className="w-1/2">
                                        2000</TableCell>
                                </TableRow>
                                <TableRow key='maxdiscount' className="border-none">
                                    <TableCell className="font-medium text-muted-foreground w-1/2">
                                        Max Discount</TableCell>
                                    <TableCell className="w-1/2">
                                        5%</TableCell>
                                </TableRow>
                            </TableBody>

                        </Table>
                    </CardContent>
                </Card>

            </div>

        </>
    )
}
