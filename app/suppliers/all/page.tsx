"use client";

import React, { useState } from "react";
import { columns, filters, primary_items } from "@/app/suppliers/all/data";
import { DataTable } from "@/components/utils/dataTable/data-table";
import { useSuppliers, useUpdateSupplier, useDeleteSupplier } from "@/hooks/suppliersHooks";
import { Supplier } from "@/types/suppliers";
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

export default function AllSuppliers() {
  const { data: suppliers, isLoading, isError } = useSuppliers();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  // Edit state
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", gst: "", address: "" });

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleEdit = (supplier: Supplier) => {
    setEditSupplier(supplier);
    setEditForm({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      gst: supplier.gst,
      address: supplier.address,
    });
  };

  const handleSaveEdit = () => {
    if (!editSupplier) return;
    updateSupplier.mutate(
      { id: editSupplier.id, data: editForm },
      {
        onSuccess: () => {
          toast.success("Supplier updated");
          setEditSupplier(null);
        },
        onError: () => toast.error("Failed to update supplier"),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteSupplier.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Supplier deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete supplier"),
    });
  };

  if (isLoading) {
    return <div className="p-10 text-center text-muted-foreground">Loading suppliers...</div>;
  }
  if (isError) {
    return <div className="p-10 text-center text-destructive">Failed to load suppliers.</div>;
  }

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance mt-5 mx-5">
        Suppliers
      </h1>
      <div className="p-5">
        <DataTable
          columns={columns}
          data={suppliers ?? []}
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
      <Dialog open={!!editSupplier} onOpenChange={(open) => !open && setEditSupplier(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
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
              <Label>GSTIN</Label>
              <Input value={editForm.gst} onChange={(e) => setEditForm({ ...editForm, gst: e.target.value })} />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSupplier(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateSupplier.isPending}>
              {updateSupplier.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this supplier?
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
