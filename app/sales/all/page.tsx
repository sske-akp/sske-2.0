"use client";

import React, { useState, useEffect, useCallback } from "react";
import { columns, filters, primary_items } from "@/app/sales/all/data";
import { DataTable } from "@/components/utils/dataTable/data-table";
import { useInvoices, useInvoiceDetail, useCreateCreditNote, useRecordPayment } from "@/hooks/invoicesHooks";
import { generateInvoiceNumber } from "@/services/invoicesServices";
import { Invoice, InvoiceDetailItem, CreditNoteFormData } from "@/types/invoices";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Printer, Maximize2, Minimize2 } from "lucide-react";
import Link from "next/link";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

interface ReturnItem {
  item: InvoiceDetailItem;
  selected: boolean;
  returnQty: number;
  maxQty: number;
}

export default function AllSales() {
  const { data: invoices, isLoading, isError } = useInvoices();
  const createCreditNote = useCreateCreditNote();
  const recordPaymentMutation = useRecordPayment();

  // Sheet state for quick view
  const [viewId, setViewId] = useState<string | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  // Return modal state
  const [returnId, setReturnId] = useState<string | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);

  // Record Payment modal state
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");

  const openPaymentDialog = useCallback((invoice: Invoice) => {
    setPaymentInvoice(invoice);
    const remaining = invoice.totalAmount - invoice.amountPaid;
    setPaymentAmount(remaining.toFixed(2));
    setPaymentMethod("cash");
    setPaymentRef("");
    setPaymentNotes("");
  }, []);

  const handleSubmitPayment = () => {
    if (!paymentInvoice) return;
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }
    const remaining = paymentInvoice.totalAmount - paymentInvoice.amountPaid;
    if (amount > remaining) {
      toast.error(`Amount exceeds remaining balance of ${formatINR(remaining)}`);
      return;
    }

    recordPaymentMutation.mutate(
      {
        invoiceId: paymentInvoice.id,
        customerId: paymentInvoice.customerId || null,
        amount,
        paymentMethod,
        paymentDate: new Date().toISOString().split("T")[0],
        referenceNumber: paymentRef || null,
        notes: paymentNotes || null,
      },
      {
        onSuccess: () => {
          toast.success("Payment recorded successfully");
          setPaymentInvoice(null);
        },
        onError: (error) => {
          toast.error(`Failed to record payment: ${error.message}`);
        },
      }
    );
  };

  const { data: invoiceDetail, isLoading: detailLoading } = useInvoiceDetail(viewId ?? "");

  // Fetch invoice detail for return modal
  const { data: returnInvoiceDetail, isLoading: returnDetailLoading } = useInvoiceDetail(returnId ?? "");

  // Populate return items when the return invoice detail loads
  useEffect(() => {
    if (returnInvoiceDetail && returnId) {
      setReturnItems(
        returnInvoiceDetail.items.map((item) => ({
          item,
          selected: true,
          returnQty: item.quantity,
          maxQty: item.quantity, // TODO: subtract already returned qty when backend provides it
        }))
      );
    }
  }, [returnInvoiceDetail, returnId]);

  const handleReturnQtyChange = useCallback((index: number, value: number) => {
    setReturnItems((prev) =>
      prev.map((ri, i) =>
        i === index
          ? { ...ri, returnQty: Math.max(0, Math.min(value, ri.maxQty)) }
          : ri
      )
    );
  }, []);

  const handleReturnToggle = useCallback((index: number, checked: boolean) => {
    setReturnItems((prev) =>
      prev.map((ri, i) =>
        i === index ? { ...ri, selected: checked } : ri
      )
    );
  }, []);

  const handleSubmitReturn = () => {
    if (!returnId || !returnInvoiceDetail) return;

    const selectedItems = returnItems.filter((ri) => ri.selected && ri.returnQty > 0);
    if (selectedItems.length === 0) {
      toast.error("Select at least one item to return");
      return;
    }

    const totalAmount = selectedItems.reduce(
      (sum, ri) => sum + ri.returnQty * ri.item.sellingPrice * (1 + ri.item.taxPercent / 100),
      0
    );

    const form: CreditNoteFormData = {
      referenceInvoiceId: returnId,
      invoiceNumber: generateInvoiceNumber().replace("INV-", "CN-"),
      invoiceDate: new Date().toISOString().split("T")[0],
      invoiceType: "credit_note",
      totalAmount,
      items: selectedItems.map((ri) => ({
        referenceItemId: ri.item.id,
        productId: ri.item.productId,
        batchId: ri.item.batchId,
        quantity: ri.returnQty,
        sellingPrice: ri.item.sellingPrice,
        taxPercent: ri.item.taxPercent,
        totalPrice: ri.returnQty * ri.item.sellingPrice * (1 + ri.item.taxPercent / 100),
      })),
    };

    createCreditNote.mutate(form, {
      onSuccess: () => {
        toast.success("Credit note created successfully");
        setReturnId(null);
        setReturnItems([]);
      },
      onError: (error) => {
        toast.error(`Failed to create credit note: ${error.message}`);
      },
    });
  };

  if (isLoading) {
    return <div className="p-10 text-center text-muted-foreground">Loading invoices...</div>;
  }
  if (isError) {
    return <div className="p-10 text-center text-destructive">Failed to load invoices.</div>;
  }

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance mt-5 mx-5">
        Sales
      </h1>
      <div className="p-5">
        <DataTable
          columns={columns}
          data={invoices ?? []}
          filters={filters}
          primary_items={primary_items}
          pagination_pageSize={15}
          meta={{
            onReturn: (id: string) => setReturnId(id),
            onViewInvoice: (id: string) => setViewId(id),
            onRecordPayment: (invoice: Invoice) => openPaymentDialog(invoice),
          }}
        />
      </div>

      {/* Invoice Detail Sheet */}
      <Sheet open={!!viewId} onOpenChange={(open) => { if (!open) { setViewId(null); setSheetExpanded(false); } }}>
        <SheetContent className={`overflow-y-auto transition-all duration-300 ${sheetExpanded ? "sm:max-w-2xl" : "sm:max-w-md"}`}>
          <SheetHeader className="pb-0">
            <div className="flex items-center justify-between pr-8">
              <SheetTitle>
                {invoiceDetail?.invoiceNumber ?? "Invoice"}
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setSheetExpanded(!sheetExpanded)}
              >
                {sheetExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </SheetHeader>

          {detailLoading ? (
            <div className="py-10 text-center text-muted-foreground">Loading...</div>
          ) : invoiceDetail ? (
            <div className="space-y-4 px-4 pb-4">
              {/* Invoice header info */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Date:</span>{" "}
                  {invoiceDetail.invoiceDate
                    ? new Intl.DateTimeFormat("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(invoiceDetail.invoiceDate))
                    : "-"}
                </div>
                <div>
                  <span className="text-muted-foreground">Customer:</span>{" "}
                  {invoiceDetail.customerName}
                </div>
                {invoiceDetail.customerPhone && (
                  <div>
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    {invoiceDetail.customerPhone}
                  </div>
                )}
                {invoiceDetail.customerGst && (
                  <div>
                    <span className="text-muted-foreground">GSTIN:</span>{" "}
                    {invoiceDetail.customerGst}
                  </div>
                )}
              </div>

              <Separator />

              {/* Line items */}
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  Items ({invoiceDetail.items.length})
                </h3>
                <div className="space-y-2">
                  {invoiceDetail.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x {formatINR(item.sellingPrice)}
                        </p>
                      </div>
                      <span className="text-sm font-medium ml-4 shrink-0">
                        {formatINR(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatINR(invoiceDetail.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span>{formatINR(invoiceDetail.gstAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1">
                  <span>Total</span>
                  <span>{formatINR(invoiceDetail.totalAmount)}</span>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-2">
                <Link href={`/sales/${viewId}`}>
                  <Button size="sm" variant="outline">
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                </Link>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Return / Cancel Dialog */}
      <Dialog
        open={!!returnId}
        onOpenChange={(open) => {
          if (!open) {
            setReturnId(null);
            setReturnItems([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Return / Cancel Invoice</DialogTitle>
            <DialogDescription>
              Select items and quantities to return. A credit note will be created.
            </DialogDescription>
          </DialogHeader>

          {returnDetailLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading invoice details...</div>
          ) : returnInvoiceDetail && returnItems.length > 0 ? (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              <div className="text-sm text-muted-foreground">
                Invoice: <span className="font-medium text-foreground">{returnInvoiceDetail.invoiceNumber}</span>
                {" | "}
                Customer: <span className="font-medium text-foreground">{returnInvoiceDetail.customerName}</span>
              </div>

              <Separator />

              {returnItems.map((ri, index) => (
                <div
                  key={ri.item.id}
                  className="flex items-center gap-3 rounded-md border px-3 py-2"
                >
                  <Checkbox
                    checked={ri.selected}
                    onCheckedChange={(checked) => handleReturnToggle(index, !!checked)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ri.item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      Original qty: {ri.maxQty} | Price: {formatINR(ri.item.sellingPrice)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">Return:</span>
                    <Input
                      type="number"
                      min={0}
                      max={ri.maxQty}
                      value={ri.returnQty}
                      onChange={(e) => handleReturnQtyChange(index, parseInt(e.target.value) || 0)}
                      className="w-16 h-8 text-center"
                      disabled={!ri.selected}
                    />
                    <span className="text-xs text-muted-foreground">/ {ri.maxQty}</span>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between text-sm font-medium">
                <span>Credit note total:</span>
                <span>
                  {formatINR(
                    returnItems
                      .filter((ri) => ri.selected && ri.returnQty > 0)
                      .reduce(
                        (sum, ri) =>
                          sum + ri.returnQty * ri.item.sellingPrice * (1 + ri.item.taxPercent / 100),
                        0
                      )
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No items found.</div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReturnId(null);
                setReturnItems([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReturn}
              disabled={
                createCreditNote.isPending ||
                returnItems.filter((ri) => ri.selected && ri.returnQty > 0).length === 0
              }
            >
              {createCreditNote.isPending ? "Creating..." : "Create Credit Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog
        open={!!paymentInvoice}
        onOpenChange={(open) => {
          if (!open) setPaymentInvoice(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for this invoice.
            </DialogDescription>
          </DialogHeader>

          {paymentInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Invoice:</span>{" "}
                  <span className="font-medium">{paymentInvoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Customer:</span>{" "}
                  <span className="font-medium">{paymentInvoice.customerName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>{" "}
                  <span className="font-medium">{formatINR(paymentInvoice.totalAmount)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Paid:</span>{" "}
                  <span className="font-medium">{formatINR(paymentInvoice.amountPaid)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Remaining:</span>{" "}
                  <span className="font-semibold text-destructive">
                    {formatINR(paymentInvoice.totalAmount - paymentInvoice.amountPaid)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Amount</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    max={paymentInvoice.totalAmount - paymentInvoice.amountPaid}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Reference Number</Label>
                  <Input
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="Transaction ID, cheque no., etc."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Notes</Label>
                  <Textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Optional notes..."
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentInvoice(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitPayment}
              disabled={recordPaymentMutation.isPending}
            >
              {recordPaymentMutation.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
