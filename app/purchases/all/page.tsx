"use client";

import React, { useState } from "react";
import { columns, filters, primary_items } from "@/app/purchases/all/data";
import { DataTable } from "@/components/utils/dataTable/data-table";
import { usePurchases, useDeletePurchase } from "@/hooks/purchasesHooks";
import { toast } from "sonner";
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

export default function AllPurchases() {
  const { data: purchases, isLoading, isError } = usePurchases();
  const deletePurchase = useDeletePurchase();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (!deleteId) return;
    deletePurchase.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Purchase deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete purchase"),
    });
  };

  if (isLoading) {
    return <div className="p-10 text-center text-muted-foreground">Loading purchases...</div>;
  }
  if (isError) {
    return <div className="p-10 text-center text-destructive">Failed to load purchases.</div>;
  }

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance mt-5 mx-5">
        Purchases
      </h1>
      <div className="p-5">
        <DataTable
          columns={columns}
          data={purchases ?? []}
          filters={filters}
          primary_items={primary_items}
          pagination_pageSize={15}
          meta={{ onDelete: (id: string) => setDeleteId(id) }}
        />
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this purchase batch. This action cannot be undone.
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
