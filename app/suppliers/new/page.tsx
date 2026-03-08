"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSupplier } from "@/hooks/suppliersHooks";
import { toast } from "sonner";

const emptySupplier = {
  name: "",
  phone: "",
  email: "",
  gst: "",
  address: "",
};

export default function NewSupplier() {
  const [supplier, setSupplier] = useState(emptySupplier);
  const createSupplier = useCreateSupplier();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSupplier({ ...supplier, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setSupplier(emptySupplier);
  };

  const handleSave = () => {
    if (!supplier.name.trim()) {
      toast.error("Supplier name is required");
      return;
    }
    createSupplier.mutate(supplier, {
      onSuccess: () => {
        toast.success("Supplier saved successfully!");
        handleReset();
      },
      onError: () => {
        toast.error("Failed to save supplier. Please try again.");
      },
    });
  };

  return (
    <>
      <div className="px-2 sm:px-6 lg:px-8 py-4 bg-background">
        <section>
          <h1 className="text-3xl font-bold">New Supplier</h1>
          <p className="text-muted-foreground">
            Add a new supplier to your records
          </p>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-3">
          <div className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Supplier Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter supplier name"
                value={supplier.name}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                value={supplier.phone}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email"
                value={supplier.email}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="gst">GST Number</Label>
              <Input
                id="gst"
                name="gst"
                placeholder="Enter GST number"
                value={supplier.gst}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                rows={3}
                placeholder="Enter address"
                value={supplier.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="p-5 flex gap-3">
            <Button
              className="flex-1 rounded-lg border border-primary/40 bg-primary shadow-sm hover:bg-primary/90 transition-all duration-150 py-3 text-base font-semibold"
              size="default"
              onClick={handleSave}
              disabled={createSupplier.isPending}
            >
              {createSupplier.isPending ? "Saving..." : "Save Supplier"}
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
              <CardTitle>Supplier Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Name:</span>
                  <span>{supplier.name || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phone:</span>
                  <span>{supplier.phone || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Email:</span>
                  <span>{supplier.email || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST:</span>
                  <span>{supplier.gst || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Address:</span>
                  <span>{supplier.address || "-"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
