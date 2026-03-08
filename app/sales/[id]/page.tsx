"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useInvoiceDetail } from "@/hooks/invoicesHooks";
import { Badge } from "@/components/ui/badge";
import { Printer, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: invoice, isLoading, isError } = useInvoiceDetail(id);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Loading invoice...
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="p-10 text-center text-destructive">
        Failed to load invoice.
      </div>
    );
  }

  const formattedDate = invoice.invoiceDate
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(invoice.invoiceDate))
    : "-";

  return (
    <>
      {/* Action bar — hidden when printing */}
      <div className="p-4 flex items-center gap-3 print:hidden">
        <Link href="/sales/all">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Sales
          </Button>
        </Link>
        <Button size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-1" />
          Print Invoice
        </Button>
      </div>

      {/* Cancellation banner */}
      {invoice.status === "cancelled" && (
        <div className="max-w-3xl mx-auto px-8 print:px-0">
          <div className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>This invoice has been cancelled.</span>
          </div>
        </div>
      )}

      {/* Credit note reference */}
      {invoice.invoiceType === "credit_note" && invoice.referenceInvoiceId && (
        <div className="max-w-3xl mx-auto px-8 print:px-0">
          <div className="flex items-center gap-2 rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span>
              This is a credit note for invoice{" "}
              <Link
                href={`/sales/${invoice.referenceInvoiceId}`}
                className="font-medium underline underline-offset-2 hover:text-blue-900"
              >
                {invoice.referenceInvoiceId}
              </Link>
            </span>
          </div>
        </div>
      )}

      {/* Invoice content — print-friendly */}
      <div className="max-w-3xl mx-auto p-8 bg-white text-black print:p-0 print:max-w-none">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold">SSKE Electricals</h1>
            <p className="text-sm text-gray-500">Electrical Supply & Services</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <h2 className="text-xl font-bold">
                {invoice.invoiceType === "credit_note" ? "CREDIT NOTE" : "INVOICE"}
              </h2>
              {invoice.status === "cancelled" && (
                <Badge variant="destructive">Cancelled</Badge>
              )}
            </div>
            <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
        </div>

        <Separator className="mb-6 print:border-black" />

        {/* Customer details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-1">
              Bill To
            </h3>
            <p className="font-medium">{invoice.customerName}</p>
            {invoice.customerPhone && (
              <p className="text-sm text-gray-600">{invoice.customerPhone}</p>
            )}
            {invoice.customerAddress && (
              <p className="text-sm text-gray-600">{invoice.customerAddress}</p>
            )}
            {invoice.customerGst && (
              <p className="text-sm text-gray-600">GSTIN: {invoice.customerGst}</p>
            )}
          </div>
        </div>

        {/* Line items table */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2 font-semibold">#</th>
              <th className="text-left py-2 font-semibold">Product</th>
              <th className="text-right py-2 font-semibold">Qty</th>
              <th className="text-right py-2 font-semibold">Rate</th>
              <th className="text-right py-2 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-2 text-gray-500">{i + 1}</td>
                <td className="py-2">{item.productName}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{formatINR(item.sellingPrice)}</td>
                <td className="py-2 text-right">{formatINR(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatINR(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>GST (18%)</span>
              <span>{formatINR(invoice.gstAmount)}</span>
            </div>
            <Separator className="print:border-black" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatINR(invoice.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>Thank you for your business!</p>
          <p className="mt-1">SSKE Electricals | Electrical Supply & Services</p>
        </div>
      </div>
    </>
  );
}
