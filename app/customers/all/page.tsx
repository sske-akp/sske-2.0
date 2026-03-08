"use client";

import React, { useState } from "react";
import { columns, filters, primary_items } from "@/app/customers/all/data";
import { DataTable } from "@/components/utils/dataTable/data-table";
import { useCustomers, useUpdateCustomer, useDeleteCustomer } from "@/hooks/customersHooks";
import { Customer } from "@/types/customers";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AllCustomer() {
  const { data: customers, isLoading, isError } = useCustomers();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  // Edit state
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", gst: "", address: "", notes: "" });

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setEditForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      gst: customer.gst,
      address: customer.address,
      notes: "",
    });
  };

  const handleSaveEdit = () => {
    if (!editCustomer) return;
    updateCustomer.mutate(
      { id: editCustomer.id, data: editForm },
      {
        onSuccess: () => {
          toast.success("Customer updated");
          setEditCustomer(null);
        },
        onError: () => toast.error("Failed to update customer"),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteCustomer.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Customer deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete customer"),
    });
  };

  if (isLoading) {
    return <div className="p-10 text-center text-muted-foreground">Loading customers...</div>;
  }
  if (isError) {
    return <div className="p-10 text-center text-destructive">Failed to load customers.</div>;
  }

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance mt-5 mx-5">
        Customers
      </h1>
      <div className="p-5">
        <DataTable
          columns={columns}
          data={customers ?? []}
          filters={filters}
          primary_items={primary_items}
          pagination_pageSize={15}
          meta={{
            onEdit: handleEdit,
            onDelete: (id: string) => setDeleteId(id),
          }}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editCustomer} onOpenChange={(open) => !open && setEditCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div>
              <Label>GST Number</Label>
              <Input value={editForm.gst} onChange={(e) => setEditForm({ ...editForm, gst: e.target.value })} />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCustomer(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateCustomer.isPending}>
              {updateCustomer.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this customer?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
