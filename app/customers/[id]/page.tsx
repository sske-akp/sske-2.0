"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useCustomer,
  useCustomerInvoices,
  useCustomerPayments,
  useUpdateCustomer,
} from "@/hooks/customersHooks";
import { Customer } from "@/types/customers";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Phone, Mail, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
};

function paymentStatusVariant(status: string) {
  switch (status) {
    case "paid":
      return "default" as const;
    case "partial":
      return "secondary" as const;
    case "unpaid":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

function paymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    cash: "Cash",
    upi: "UPI",
    card: "Card",
    bank_transfer: "Bank Transfer",
    cheque: "Cheque",
  };
  return labels[method] ?? method;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;

  const { data: customer, isLoading: loadingCustomer, isError: errorCustomer } = useCustomer(customerId);
  const { data: invoices, isLoading: loadingInvoices } = useCustomerInvoices(customerId);
  const { data: payments, isLoading: loadingPayments } = useCustomerPayments(customerId);
  const updateCustomer = useUpdateCustomer();

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", gst: "", address: "", notes: "" });

  const handleOpenEdit = (c: Customer) => {
    setEditForm({
      name: c.name,
      phone: c.phone,
      email: c.email,
      gst: c.gst,
      address: c.address,
      notes: c.notes,
    });
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    updateCustomer.mutate(
      { id: customerId, data: editForm },
      {
        onSuccess: () => {
          toast.success("Customer updated");
          setEditOpen(false);
        },
        onError: () => toast.error("Failed to update customer"),
      }
    );
  };

  // Computed stats
  const stats = useMemo(() => {
    if (!invoices) return { totalSpent: 0, outstanding: 0, invoiceCount: 0, lastPurchase: "-" };

    const saleInvoices = invoices.filter((inv) => inv.invoiceType === "sale" && inv.status !== "cancelled");
    const totalSpent = saleInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const outstanding = saleInvoices.reduce(
      (sum, inv) => sum + (inv.totalAmount - inv.amountPaid),
      0
    );
    const invoiceCount = saleInvoices.length;

    const dates = saleInvoices
      .map((inv) => inv.invoiceDate)
      .filter(Boolean)
      .sort()
      .reverse();
    const lastPurchase = dates.length > 0 ? formatDate(dates[0]) : "-";

    return { totalSpent, outstanding, invoiceCount, lastPurchase };
  }, [invoices]);

  // Payment history with running balance
  const paymentsWithBalance = useMemo(() => {
    if (!payments) return [];
    const sorted = [...payments].sort(
      (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
    );
    let running = 0;
    return sorted.map((p) => {
      running += p.amount;
      return { ...p, runningTotal: running };
    });
  }, [payments]);

  // Map invoice IDs to invoice numbers for the payments tab
  const invoiceNumberMap = useMemo(() => {
    if (!invoices) return new Map<string, string>();
    return new Map(invoices.map((inv) => [inv.id, inv.invoiceNumber]));
  }, [invoices]);

  if (loadingCustomer) {
    return <div className="p-10 text-center text-muted-foreground">Loading customer...</div>;
  }
  if (errorCustomer || !customer) {
    return <div className="p-10 text-center text-destructive">Failed to load customer.</div>;
  }

  return (
    <div className="p-5 space-y-6">
      {/* Back button */}
      <Link href="/customers/all">
        <Button variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Customers
        </Button>
      </Link>

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{customer.name || "Unnamed Customer"}</CardTitle>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                {customer.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {customer.phone}
                  </span>
                )}
                {customer.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {customer.email}
                  </span>
                )}
                {customer.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {customer.address}
                  </span>
                )}
                {customer.gst && (
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    GSTIN: {customer.gst}
                  </span>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleOpenEdit(customer)}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-lg font-semibold">{formatINR(stats.totalSpent)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className="text-lg font-semibold">{formatINR(stats.outstanding)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Invoices</p>
              <p className="text-lg font-semibold">{stats.invoiceCount}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Last Purchase</p>
              <p className="text-lg font-semibold">{stats.lastPurchase}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoice History</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        {/* Invoice History Tab */}
        <TabsContent value="invoices">
          {loadingInvoices ? (
            <div className="p-6 text-center text-muted-foreground">Loading invoices...</div>
          ) : !invoices || invoices.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No invoices found for this customer.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <Link
                          href={`/sales/${inv.id}`}
                          className="text-primary underline underline-offset-2 hover:text-primary/80"
                        >
                          {inv.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{formatDate(inv.invoiceDate)}</TableCell>
                      <TableCell>
                        <Badge variant={inv.invoiceType === "credit_note" ? "secondary" : "outline"}>
                          {inv.invoiceType === "credit_note" ? "Credit Note" : "Sale"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatINR(inv.totalAmount)}</TableCell>
                      <TableCell className="text-right">{formatINR(inv.amountPaid)}</TableCell>
                      <TableCell>
                        <Badge variant={paymentStatusVariant(inv.paymentStatus)}>
                          {inv.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {inv.status === "cancelled" ? (
                          <Badge variant="destructive">Cancelled</Badge>
                        ) : (
                          <Badge variant="outline">{inv.status}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="payments">
          {loadingPayments ? (
            <div className="p-6 text-center text-muted-foreground">Loading payments...</div>
          ) : !paymentsWithBalance || paymentsWithBalance.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No payments found for this customer.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference #</TableHead>
                    <TableHead>Against Invoice</TableHead>
                    <TableHead className="text-right">Running Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentsWithBalance.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{formatDate(p.paymentDate)}</TableCell>
                      <TableCell className="text-right">{formatINR(p.amount)}</TableCell>
                      <TableCell>{paymentMethodLabel(p.paymentMethod)}</TableCell>
                      <TableCell>{p.referenceNumber || "-"}</TableCell>
                      <TableCell>
                        {invoiceNumberMap.get(p.invoiceId) ? (
                          <Link
                            href={`/sales/${p.invoiceId}`}
                            className="text-primary underline underline-offset-2 hover:text-primary/80"
                          >
                            {invoiceNumberMap.get(p.invoiceId)}
                          </Link>
                        ) : (
                          p.invoiceId
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatINR(p.runningTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => !open && setEditOpen(false)}>
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
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateCustomer.isPending}>
              {updateCustomer.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
