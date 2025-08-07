"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/textarea"
import InputTable from "@/components/utils/inputTable/data-table"
import { columns, data } from "@/app/stock/audit/data"

interface InvoiceItem {
    id: string
    description: string
    quantity: number
    rate: number
    amount: number
}

interface Customer {
    name: string
    phone: string
    email?: string
    address?: string
    gstNumber?: string
    notes?: string
}

export default function SalePage() {
    const [customer, setCustomer] = useState<Customer>({
        name: "",
        phone: "",
    })

    const [items] = useState<InvoiceItem[]>([
        {
            id: "1",
            description: "",
            quantity: 1,
            rate: 0,
            amount: 0,
        },
    ])


    // const columns = [
    //     columnHelper.accessor("description", {
    //         header: "Description",
    //         cell: ({ row, getValue }) => (
    //             <Input
    //                 value={getValue()}
    //                 onChange={(e) => updateItem(row.original.id, "description", e.target.value)}
    //                 placeholder="Item description"
    //                 className="min-w-[200px]"
    //             />
    //         ),
    //     }),
    //     columnHelper.accessor("quantity", {
    //         header: "Qty",
    //         cell: ({ row, getValue }) => (
    //             <Input
    //                 type="number"
    //                 value={getValue()}
    //                 onChange={(e) => updateItem(row.original.id, "quantity", Number.parseFloat(e.target.value) || 0)}
    //                 className="w-20"
    //                 min="0"
    //                 step="0.01"
    //             />
    //         ),
    //     }),
    //     columnHelper.accessor("rate", {
    //         header: "Rate",
    //         cell: ({ row, getValue }) => (
    //             <Input
    //                 type="number"
    //                 value={getValue()}
    //                 onChange={(e) => updateItem(row.original.id, "rate", Number.parseFloat(e.target.value) || 0)}
    //                 className="w-24"
    //                 min="0"
    //                 step="0.01"
    //             />
    //         ),
    //     }),
    //     columnHelper.accessor("amount", {
    //         header: "Amount",
    //         cell: ({ getValue }) => <div className="text-right font-medium">₹{getValue().toFixed(2)}</div>,
    //     }),
    //     columnHelper.display({
    //         id: "actions",
    //         header: "",
    //         cell: ({ row }) => (
    //             <Button variant="ghost" size="sm" onClick={() => removeItem(row.original.id)} disabled={items.length === 1}>
    //                 <Trash2 className="h-4 w-4" />
    //             </Button>
    //         ),
    //     }),
    // ]

    // const table = useReactTable({
    //     data: items,
    //     columns,
    //     getCoreRowModel: getCoreRowModel(),
    // })

    // const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    //     setItems((prev) =>
    //         prev.map((item) => {
    //             if (item.id === id) {
    //                 const updated = { ...item, [field]: value }
    //                 if (field === "quantity" || field === "rate") {
    //                     updated.amount = updated.quantity * updated.rate
    //                 }
    //                 return updated
    //             }
    //             return item
    //         }),
    //     )
    // }

    // const addItem = () => {
    //     const newItem: InvoiceItem = {
    //         id: Date.now().toString(),
    //         description: "",
    //         quantity: 1,
    //         rate: 0,
    //         amount: 0,
    //     }
    //     setItems((prev) => [...prev, newItem])
    // }

    // const removeItem = (id: string) => {
    //     if (items.length > 1) {
    //         setItems((prev) => prev.filter((item) => item.id !== id))
    //     }
    // }

    const updateCustomer = (field: keyof Customer, value: string) => {
        setCustomer((prev) => ({ ...prev, [field]: value }))
    }

    // Calculations
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
    const gstRate = 18 // 18% GST
    const gstAmount = (subtotal * gstRate) / 100
    const total = subtotal + gstAmount

    return (
        <div className="min-h-scree p-4">

            <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 bg-background">
                <section className="mb-8">
                    <h1 className="text-3xl font-bold">New Sale</h1>
                    <p className="text-muted-foreground">Create a new invoice for your customer</p>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left Side - Customer & Items */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Customer Section */}
                        <Card>
                            {/* <CardHeader>
                                <CardTitle>Customer Details</CardTitle>
                            </CardHeader> */}
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="customerName" className="pb-2">Customer Name *</Label>
                                        <Input
                                            id="customerName"
                                            value={customer.name}
                                            onChange={(e) => updateCustomer("name", e.target.value)}
                                            placeholder="Enter customer name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="customerPhone" className="pb-2">Phone Number *</Label>
                                        <Input
                                            id="customerPhone"
                                            value={customer.phone}
                                            onChange={(e) => updateCustomer("phone", e.target.value)}
                                            placeholder="Enter phone number"
                                            required
                                        />
                                    </div>
                                </div>

                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="additional-details">
                                        <AccordionTrigger className="text-sm">Additional Customer Details</AccordionTrigger>
                                        <AccordionContent className="space-y-4">
                                            <div>
                                                <Label htmlFor="customerEmail">Email</Label>
                                                <Input
                                                    id="customerEmail"
                                                    type="email"
                                                    value={customer.email || ""}
                                                    onChange={(e) => updateCustomer("email", e.target.value)}
                                                    placeholder="Enter email address"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="customerAddress">Address</Label>
                                                <Textarea
                                                    id="customerAddress"
                                                    value={customer.address || ""}
                                                    onChange={(e) => updateCustomer("address", e.target.value)}
                                                    placeholder="Enter customer address"
                                                    rows={3}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="gstNumber">GST Number</Label>
                                                <Input
                                                    id="gstNumber"
                                                    value={customer.gstNumber || ""}
                                                    onChange={(e) => updateCustomer("gstNumber", e.target.value)}
                                                    placeholder="Enter GST number"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="customerNotes">Notes</Label>
                                                <Textarea
                                                    id="customerNotes"
                                                    value={customer.notes || ""}
                                                    onChange={(e) => updateCustomer("notes", e.target.value)}
                                                    placeholder="Additional notes about the customer"
                                                    rows={2}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>

                        {/* Invoice Items Table */}
                        {/* <Card className="p-4"> */}
                        {/* <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Invoice Items</CardTitle>
                                <Button onClick={addItem} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            {table.getHeaderGroups().map((headerGroup) => (
                                                <TableRow key={headerGroup.id}>
                                                    {headerGroup.headers.map((header) => (
                                                        <TableHead key={header.id}>
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableHeader>
                                        <TableBody>
                                            {table.getRowModel().rows?.length ? (
                                                table.getRowModel().rows.map((row) => (
                                                    <TableRow key={row.id}>
                                                        {row.getVisibleCells().map((cell) => (
                                                            <TableCell key={cell.id}>
                                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                                        No items added yet.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent> */}
                        {/* </Card> */}
                        <InputTable
                            columns={columns}
                            data={data}
                            filters={[]}
                            primary_items={[]}
                            getNewRow={() => ({
                                id: Date.now().toString(),
                                description: "",
                                quantity: 1,
                                rate: 0,
                                amount: 0,
                                product_name: "",
                                price_per_unit: 0,
                                total_price: "0",
                            })}
                        />

                    </div>

                    {/* Right Side - Totals */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="">Subtotal:</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="">GST ({gstRate}%):</span>
                                        <span>₹{gstAmount.toFixed(2)}</span>
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
                                        Save Invoice
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        Save & Print
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="">Items:</span>
                                    <span>{items.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="">Total Qty:</span>
                                    <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
