// app/customers/new/page.tsx

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function NewCustomer() {
    const [customer, setCustomer] = useState({
        name: "",
        phone: "",
        email: "",
        gst: "",
        address: "",
        notes: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    };

    const handleReset = () => {
        setCustomer({
            name: "",
            phone: "",
            email: "",
            gst: "",
            address: "",
            notes: "",
        });
    };

    return (
        <>
            <div className="px-2 sm:px-6 lg:px-8 py-4 bg-background">
                <section>
                    <h1 className="text-3xl font-bold">New Customer</h1>
                    <p className="text-muted-foreground">Add a new customer to your records</p>
                </section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="col-span-3">
                    <div className="p-5 flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">Customer Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Enter customer name"
                                value={customer.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                placeholder="Enter phone number"
                                value={customer.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Additional Customer Details Accordion */}
                    <Accordion type="single" collapsible className="w-full px-5" value="additional-details">
                        <AccordionItem value="additional-details">
                            <AccordionTrigger>Additional Customer Details</AccordionTrigger>
                            <AccordionContent className="space-y-4">
                                <div>
                                    <Label htmlFor="gst" className="block text font-medium">GST Number:</Label>
                                    <Input
                                        id="gst"
                                        name="gst"
                                        type="text"
                                        className="mt-1 block w-full rounded-md shadow-sm"
                                        placeholder="Enter GST Number"
                                        value={customer.gst}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email" className="block text-sm font-medium">Email:</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        className="mt-1 block w-full rounded-md shadow-sm"
                                        placeholder="Enter Email"
                                        value={customer.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="address" className="block text-sm font-medium">Address:</Label>
                                    <Textarea
                                        id="address"
                                        name="address"
                                        className="mt-1 block w-full rounded-md shadow-sm"
                                        rows={3}
                                        placeholder="Enter Address"
                                        value={customer.address}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="notes" className="block text-sm font-medium">Notes:</Label>
                                    <Textarea
                                        id="notes"
                                        name="notes"
                                        className="mt-1 block w-full rounded-md shadow-sm"
                                        rows={2}
                                        placeholder="Additional notes"
                                        value={customer.notes}
                                        onChange={handleChange}
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <div className="p-5 flex gap-3">
                        <Button
                            className="flex-1 rounded-lg border border-primary/40 bg-primary shadow-sm hover:bg-primary/90 transition-all duration-150 py-3 text-base font-semibold"
                            size="default"
                        >
                            Save Customer
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 border border-gray-300 bg-white hover:bg-gray-100 transition-all duration-150 py-3 text-base font-semibold"
                            onClick={handleReset}
                        >
                            Reset
                        </Button>
                    </div>
                </div>
                <div className="col-span-1">
                    <Card className="mt-5">
                        <CardHeader>
                            <CardTitle>Customer Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Name:</span>
                                    <span>{customer.name || "-"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Phone:</span>
                                    <span>{customer.phone || "-"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Email:</span>
                                    <span>{customer.email || "-"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>GST:</span>
                                    <span>{customer.gst || "-"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Address:</span>
                                    <span>{customer.address || "-"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
