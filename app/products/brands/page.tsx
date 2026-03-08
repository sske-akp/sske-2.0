"use client";

import React, { useState } from "react";
import {
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
} from "@/hooks/productsHooks";
import { ProductBrand } from "@/types/products";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Pencil, Trash2, Check, X } from "lucide-react";

export default function BrandsPage() {
  const { data: brands, isLoading, isError } = useBrands();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();

  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandCompany, setNewBrandCompany] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBrand, setEditBrand] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newBrandName.trim()) {
      toast.error("Brand name is required");
      return;
    }
    createBrand.mutate(
      { brand: newBrandName, company: newBrandCompany || null },
      {
        onSuccess: () => {
          toast.success("Brand created");
          setNewBrandName("");
          setNewBrandCompany("");
        },
        onError: () => toast.error("Failed to create brand"),
      }
    );
  };

  const handleStartEdit = (b: ProductBrand) => {
    setEditingId(b.id);
    setEditBrand(b.brand || "");
    setEditCompany(b.company || "");
  };

  const handleSaveEdit = (b: ProductBrand) => {
    if (!editBrand.trim()) {
      toast.error("Brand name is required");
      return;
    }
    updateBrand.mutate(
      {
        id: b.id,
        data: {
          brand: editBrand,
          company: editCompany || null,
          disabled: b.disabled,
        },
      },
      {
        onSuccess: () => {
          toast.success("Brand updated");
          setEditingId(null);
        },
        onError: () => toast.error("Failed to update brand"),
      }
    );
  };

  const handleToggleDisable = (b: ProductBrand) => {
    updateBrand.mutate(
      {
        id: b.id,
        data: { brand: b.brand, company: b.company, disabled: !b.disabled },
      },
      {
        onSuccess: () => {
          toast.success(b.disabled ? "Brand enabled" : "Brand disabled");
        },
        onError: () => toast.error("Failed to update brand"),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteBrand.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Brand deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete brand"),
    });
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Loading brands...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="p-10 text-center text-destructive">
        Failed to load brands.
      </div>
    );
  }

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance mt-5 mx-5">
        Product Brands
      </h1>
      <div className="p-5">
        {/* Add new brand */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Brand name"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            className="max-w-xs"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Input
            placeholder="Company (optional)"
            value={newBrandCompany}
            onChange={(e) => setNewBrandCompany(e.target.value)}
            className="max-w-xs"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={createBrand.isPending}>
            {createBrand.isPending ? "Adding..." : "Add Brand"}
          </Button>
        </div>

        {/* Brand list */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands && brands.length > 0 ? (
                brands.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      {editingId === b.id ? (
                        <Input
                          value={editBrand}
                          onChange={(e) => setEditBrand(e.target.value)}
                          className="max-w-xs"
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSaveEdit(b)
                          }
                        />
                      ) : (
                        b.brand || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === b.id ? (
                        <Input
                          value={editCompany}
                          onChange={(e) => setEditCompany(e.target.value)}
                          className="max-w-xs"
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSaveEdit(b)
                          }
                        />
                      ) : (
                        b.company || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={b.disabled ? "secondary" : "default"}
                        className="cursor-pointer"
                        onClick={() => handleToggleDisable(b)}
                      >
                        {b.disabled ? "Disabled" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === b.id ? (
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSaveEdit(b)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStartEdit(b)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(b.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No brands found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this brand. Products using this brand
              will no longer have a brand assigned. Are you sure?
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
