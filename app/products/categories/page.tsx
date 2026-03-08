"use client";

import React, { useState } from "react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/productsHooks";
import { ProductCategory } from "@/types/products";
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

export default function CategoriesPage() {
  const { data: categories, isLoading, isError } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) {
      toast.error("Category name is required");
      return;
    }
    createCategory.mutate(
      { name: newName },
      {
        onSuccess: () => {
          toast.success("Category created");
          setNewName("");
        },
        onError: () => toast.error("Failed to create category"),
      }
    );
  };

  const handleStartEdit = (cat: ProductCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name || "");
  };

  const handleSaveEdit = (cat: ProductCategory) => {
    if (!editName.trim()) {
      toast.error("Category name is required");
      return;
    }
    updateCategory.mutate(
      { id: cat.id, data: { name: editName, disabled: cat.disabled } },
      {
        onSuccess: () => {
          toast.success("Category updated");
          setEditingId(null);
        },
        onError: () => toast.error("Failed to update category"),
      }
    );
  };

  const handleToggleDisable = (cat: ProductCategory) => {
    updateCategory.mutate(
      { id: cat.id, data: { name: cat.name, disabled: !cat.disabled } },
      {
        onSuccess: () => {
          toast.success(cat.disabled ? "Category enabled" : "Category disabled");
        },
        onError: () => toast.error("Failed to update category"),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteCategory.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Category deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete category"),
    });
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Loading categories...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="p-10 text-center text-destructive">
        Failed to load categories.
      </div>
    );
  }

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance mt-5 mx-5">
        Product Categories
      </h1>
      <div className="p-5">
        {/* Add new category */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="New category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="max-w-sm"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button
            onClick={handleAdd}
            disabled={createCategory.isPending}
          >
            {createCategory.isPending ? "Adding..." : "Add Category"}
          </Button>
        </div>

        {/* Category list */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      {editingId === cat.id ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="max-w-xs"
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSaveEdit(cat)
                          }
                        />
                      ) : (
                        cat.name || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={cat.disabled ? "secondary" : "default"}
                        className="cursor-pointer"
                        onClick={() => handleToggleDisable(cat)}
                      >
                        {cat.disabled ? "Disabled" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === cat.id ? (
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSaveEdit(cat)}
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
                            onClick={() => handleStartEdit(cat)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(cat.id)}
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
                  <TableCell colSpan={3} className="h-24 text-center">
                    No categories found.
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
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this category. Products using this
              category will no longer have a category assigned. Are you sure?
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
