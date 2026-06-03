"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { usePurchaseBills, useRecordSupplierPayment } from "@/hooks/purchasesHooks";
import { PurchaseBillSummary } from "@/types/purchases";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—";

const statusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  if (status === "paid") return "default";
  if (status === "partial") return "secondary";
  return "outline";
};

const PAYMENT_METHODS = [
  { label: "Cash", value: "cash" },
  { label: "UPI", value: "upi" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Cheque", value: "cheque" },
  { label: "Card", value: "card" },
];

export default function PurchaseBillsPage() {
  const { data: bills, isLoading, isError } = usePurchaseBills();
  const recordPayment = useRecordSupplierPayment();

  const [payBill, setPayBill] = useState<PurchaseBillSummary | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [paymentDate, setPaymentDate] = useState(() =>
    format(new Date(), "yyyy-MM-dd")
  );
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const openPayDialog = (bill: PurchaseBillSummary) => {
    setPayBill(bill);
    setAmount(bill.remaining > 0 ? bill.remaining.toFixed(2) : "");
    setMethod("cash");
    setPaymentDate(format(new Date(), "yyyy-MM-dd"));
    setReference("");
    setNotes("");
  };

  const handleSubmitPayment = () => {
    if (!payBill) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amt > payBill.remaining + 0.001) {
      toast.error(`Amount exceeds the remaining balance (${formatINR(payBill.remaining)})`);
      return;
    }

    recordPayment.mutate(
      {
        purchaseBillId: payBill.id,
        supplierId: payBill.supplierId,
        amount: amt,
        paymentMethod: method,
        paymentDate,
        referenceNumber: reference || null,
        notes: notes || null,
      },
      {
        onSuccess: () => {
          toast.success("Payment recorded");
          setPayBill(null);
        },
        onError: (error) => toast.error(error.message || "Failed to record payment"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Loading purchase bills...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="p-10 text-center text-destructive">
        Failed to load purchase bills.
      </div>
    );
  }

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance mt-5 mx-5">
        Purchase Bills
      </h1>
      <div className="p-5">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill No.</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Bill Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(bills ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No purchase bills yet.
                  </TableCell>
                </TableRow>
              )}
              {(bills ?? []).map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.billNumber}</TableCell>
                  <TableCell>{bill.supplierName}</TableCell>
                  <TableCell>{formatDate(bill.billDate)}</TableCell>
                  <TableCell>{formatDate(bill.dueDate)}</TableCell>
                  <TableCell className="text-right">{formatINR(bill.totalAmount)}</TableCell>
                  <TableCell className="text-right">{formatINR(bill.amountPaid)}</TableCell>
                  <TableCell className="text-right">{formatINR(bill.remaining)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(bill.paymentStatus)} className="capitalize">
                      {bill.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={bill.paymentStatus === "paid"}
                      onClick={() => openPayDialog(bill)}
                    >
                      Pay Bill
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!payBill} onOpenChange={(open) => !open && setPayBill(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay Bill</DialogTitle>
            <DialogDescription>
              {payBill && (
                <>
                  {payBill.supplierName} · Bill {payBill.billNumber} · Outstanding{" "}
                  {formatINR(payBill.remaining)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reference Number</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Cheque / UTR / txn ref (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPayBill(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitPayment} disabled={recordPayment.isPending}>
              {recordPayment.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
